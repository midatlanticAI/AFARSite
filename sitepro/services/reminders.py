from __future__ import annotations

from typing import Optional
from datetime import datetime

from sitepro.models.database import Reminder
from sitepro.services.db import get_db


async def list_reminders(customer_id: Optional[str] = None, job_id: Optional[str] = None, limit: int = 100) -> dict:
    db = get_db()
    query: dict = {}
    if customer_id:
        query["customer_id"] = customer_id
    if job_id:
        query["job_id"] = job_id
    cursor = db.reminders.find(query).sort("due_at", 1).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items}


async def upsert_reminder(payload: dict) -> dict:
    db = get_db()
    rem = Reminder(**payload)
    data = rem.model_dump(by_alias=True, exclude_none=True)
    if rem.id:
        _id = rem.id
        data.pop("id", None)
        await db.reminders.update_one({"_id": _id}, {"$set": data}, upsert=True)
        return {"id": _id}
    else:
        await db.reminders.insert_one(data)
        return {"id": data["_id"]}


async def delete_reminder(reminder_id: str) -> dict:
    db = get_db()
    res = await db.reminders.delete_one({"_id": reminder_id})
    return {"deleted": res.deleted_count == 1}


