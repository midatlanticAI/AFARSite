from fastapi import APIRouter, status
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