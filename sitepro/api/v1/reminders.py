from __future__ import annotations

from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from typing import Optional

from sitepro.services.idempotency import idempotent
from sitepro.services.reminders import list_reminders, upsert_reminder, delete_reminder


router = APIRouter()


@router.get("/list", status_code=status.HTTP_200_OK)
async def list_api(customer_id: Optional[str] = None, job_id: Optional[str] = None, limit: int = 100):
    limit = max(1, min(limit, 100))
    return await list_reminders(customer_id=customer_id, job_id=job_id, limit=limit)


class ReminderIn(BaseModel):
    id: Optional[str] = None
    customer_id: Optional[str] = None
    job_id: Optional[str] = None
    due_at: str = Field(min_length=10, max_length=32)
    frequency: Optional[str] = Field(default=None, max_length=8)
    channel: str = Field(default="email", max_length=8)
    message: Optional[str] = Field(default=None, max_length=2000)


@router.post("/upsert", status_code=status.HTTP_201_CREATED)
@idempotent("reminder_upsert")
async def upsert_api(payload: ReminderIn):
    return await upsert_reminder(payload.model_dump())


class ReminderId(BaseModel):
    id: str


@router.post("/delete", status_code=status.HTTP_200_OK)
@idempotent("reminder_delete")
async def delete_api(payload: ReminderId):
    return await delete_reminder(payload.id)


