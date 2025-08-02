from __future__ import annotations

from sitepro.services.db import get_db
from sitepro.models.database import JobNote

VALID_STATUSES = {"scheduled", "en-route", "completed", "cancelled"}


async def update_job_status(job_id: str, status: str, note: str | None = None) -> dict:
    if status not in VALID_STATUSES:
        return {"updated": False, "error": "invalid_status"}

    db = get_db()
    result = await db.jobs.update_one({"_id": job_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        return {"updated": False, "error": "job_not_found"}

    if note:
        note_doc = JobNote(job_id=job_id, author="system", channel="status", text=note)
        await db.job_notes.insert_one(note_doc.model_dump(by_alias=True))

    return {"updated": True} 