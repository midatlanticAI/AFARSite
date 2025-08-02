from fastapi import APIRouter, status
from sitepro.services.idempotency import idempotent
from sitepro.services.jobs import create_job_from_voice
from sitepro.services.notes import append_note as append_note_service
from sitepro.services.schedule import schedule_technician
from sitepro.services.status import update_job_status as update_status_service
from sitepro.config import get_settings

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