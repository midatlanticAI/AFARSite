from fastapi import APIRouter, status
from sitepro.services.idempotency import idempotent
from sitepro.services.jobs import create_job_from_voice
from sitepro.services.notes import append_note as append_note_service
from sitepro.services.schedule import schedule_technician
from sitepro.services.status import update_job_status as update_status_service
from sitepro.config import get_settings
from sitepro.services.voicepro import get_voicepro_client
import httpx

router = APIRouter()


@router.post("/create_job_from_voice", status_code=status.HTTP_201_CREATED)
@idempotent("create_job_from_voice")
async def create_job_from_voice_endpoint(payload: dict):
    return await create_job_from_voice(payload)


@router.post("/append_note", status_code=status.HTTP_201_CREATED)
@idempotent("append_note")
async def append_note(payload: dict):
    return await append_note_service(payload["job_id"], payload.get("author", "VoicePro"), "voice", payload["note"])


@router.post("/schedule_tech", status_code=status.HTTP_200_OK)
@idempotent("schedule_tech")
async def schedule_tech(payload: dict):
    return await schedule_technician(payload["job_id"], payload.get("tech_id"), payload["time_window"])


@router.post("/update_job_status", status_code=status.HTTP_200_OK)
@idempotent("update_job_status")
async def update_job_status(payload: dict):
    return await update_status_service(payload["job_id"], payload["status"], payload.get("note"))


@router.get("/get_diagnostic_fee", status_code=status.HTTP_200_OK)
async def get_diagnostic_fee():
    settings = get_settings()
    return {"amount_usd": settings.diagnostic_fee} 


@router.post("/webhook/ingest", status_code=status.HTTP_202_ACCEPTED)
async def ingest_voicepro_event(payload: dict):
    """Optional passthrough endpoint if VoicePro wants to send us async events."""
    # For now, just accept and noop; later we can route updates to jobs/notes
    return {"received": True}


@router.get("/messages", status_code=status.HTTP_200_OK)
async def list_voice_messages():
    client = get_voicepro_client()
    if not client:
        return {"items": []}
    try:
        data = await client.list_messages()
        # Normalize shape
        items = data.get("messages") if isinstance(data, dict) else data
        return {"items": items or []}
    except Exception:
        return {"items": []}


@router.post("/messages/{message_id}/transcribe", status_code=status.HTTP_200_OK)
async def transcribe_message(message_id: str):
    client = get_voicepro_client()
    if not client:
        return {"status": "skipped"}
    return await client.transcribe(message_id)


@router.post("/messages/{message_id}/translate", status_code=status.HTTP_200_OK)
async def translate_message(message_id: str, target_language: str = "english"):
    client = get_voicepro_client()
    if not client:
        return {"status": "skipped"}
    return await client.translation(message_id, target_language)


@router.post("/messages/{message_id}/analyze", status_code=status.HTTP_200_OK)
async def analyze_message(message_id: str):
    client = get_voicepro_client()
    if not client:
        return {"status": "skipped"}
    return await client.analysis(message_id)