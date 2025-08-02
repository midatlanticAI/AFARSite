from __future__ import annotations

from datetime import datetime

from sitepro.services.db import get_db
from sitepro.models.database import JobNote


async def schedule_technician(job_id: str, tech_id: str | None, time_window: str) -> dict:
    db = get_db()
    update = {"$set": {"status": "scheduled", "scheduled_time": time_window, "tech_id": tech_id}}
    result = await db.jobs.update_one({"_id": job_id}, update)

    if result.matched_count == 0:
        return {"confirmed": False, "error": "job_not_found"}

    # Add system note
    note = JobNote(job_id=job_id, author="system", channel="schedule", text=f"Scheduled for {time_window} with tech {tech_id or 'auto'}")
    await db.job_notes.insert_one(note.model_dump(by_alias=True))

    return {"confirmed": True} 