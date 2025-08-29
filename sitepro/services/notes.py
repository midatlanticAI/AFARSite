from __future__ import annotations

from datetime import datetime
from sitepro.models.database import JobNote, ContactNote
from sitepro.services.db import get_db


async def append_note(job_id: str, author: str, channel: str, text: str) -> dict:
    db = get_db()
    note = JobNote(job_id=job_id, author=author, channel=channel, text=text, ts=datetime.utcnow())
    await db.job_notes.insert_one(note.model_dump(by_alias=True))
    return {"note_id": note.id, "job_id": job_id} 


async def append_contact_note(customer_id: str, author: str, text: str, attachments: list[dict] | None = None) -> dict:
    db = get_db()
    cn = ContactNote(customer_id=customer_id, author=author, text=text, attachments=attachments or [])
    await db.contact_notes.insert_one(cn.model_dump(by_alias=True))
    return {"note_id": cn.id, "customer_id": customer_id}