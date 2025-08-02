from __future__ import annotations

from datetime import datetime
from sitepro.models.database import JobNote
from sitepro.services.db import get_db


async def append_note(job_id: str, author: str, channel: str, text: str) -> dict:
    db = get_db()
    note = JobNote(job_id=job_id, author=author, channel=channel, text=text, ts=datetime.utcnow())
    await db.job_notes.insert_one(note.model_dump(by_alias=True))
    return {"note_id": note.id, "job_id": job_id} 