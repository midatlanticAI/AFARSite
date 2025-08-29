from fastapi import APIRouter, status
from sitepro.services.db import get_db
from sitepro.models.database import Job, JobNote
from datetime import datetime
from sitepro.services.idempotency import idempotent
from sitepro.services.chat_jobs import create_job_from_chat as create_job_chat
from sitepro.services.notes import append_note as append_note_service
from sitepro.services.status import update_job_status as update_status_service

router = APIRouter()


@router.post("/create_job_from_chat", status_code=status.HTTP_201_CREATED)
@idempotent("create_job_from_chat")
async def create_job_from_chat_endpoint(payload: dict):
    return await create_job_chat(payload)


@router.post("/append_chat_note", status_code=status.HTTP_201_CREATED)
@idempotent("append_chat_note")
async def append_chat_note(payload: dict):
    return await append_note_service(payload["job_id"], payload.get("author", "ChatPro"), "chat", payload["note"])


@router.post("/escalate", status_code=status.HTTP_200_OK)
@idempotent("escalate_chat")
async def escalate(payload: dict):
    # Simply update job status to 'escalated'
    return await update_status_service(payload["job_id"], "scheduled", "Chat escalation") 


# Chat v2 minimal endpoints
@router.post("/sessions", status_code=status.HTTP_201_CREATED)
@idempotent("chat_create_session")
async def create_session(payload: dict):
    db = get_db()
    session = {
        "_id": payload.get("session_id") or __import__("uuid").uuid4().hex,
        "created_at": datetime.utcnow().isoformat(),
        "customer_id": payload.get("customer_id"),
        "source": payload.get("source", "widget"),
        "meta": payload.get("meta") or {},
    }
    await db.chat_sessions.insert_one(session)
    return {"session_id": session["_id"], "created_at": session["created_at"]}


@router.post("/messages", status_code=status.HTTP_201_CREATED)
@idempotent("chat_post_message")
async def post_message(payload: dict):
    db = get_db()
    session_id = payload["session_id"]
    user_text = payload.get("text", "")
    user_msg = {
        "_id": __import__("uuid").uuid4().hex,
        "session_id": session_id,
        "role": "user",
        "text": user_text,
        "ts": datetime.utcnow().isoformat(),
    }
    await db.chat_messages.insert_one(user_msg)
    # naive echo assistant for now; to be replaced by service call
    assistant_text = "Thanks. A specialist will follow up shortly."
    assistant_msg = {
        "_id": __import__("uuid").uuid4().hex,
        "session_id": session_id,
        "role": "assistant",
        "text": assistant_text,
        "ts": datetime.utcnow().isoformat(),
    }
    await db.chat_messages.insert_one(assistant_msg)
    # interaction log
    await db.interaction_logs.insert_one({
        "_id": __import__("uuid").uuid4().hex,
        "channel": "chat",
        "thread_id": session_id,
        "direction": "inbound",
        "message": user_text,
        "ts": datetime.utcnow().isoformat(),
    })
    await db.interaction_logs.insert_one({
        "_id": __import__("uuid").uuid4().hex,
        "channel": "chat",
        "thread_id": session_id,
        "direction": "outbound",
        "message": assistant_text,
        "ts": datetime.utcnow().isoformat(),
    })
    return {"messages": [assistant_msg]}


@router.get("/messages", status_code=status.HTTP_200_OK)
async def get_messages(session_id: str):
    db = get_db()
    cur = db.chat_messages.find({"session_id": session_id}).sort("ts", 1)
    msgs = await cur.to_list(1000)
    return {"messages": msgs}