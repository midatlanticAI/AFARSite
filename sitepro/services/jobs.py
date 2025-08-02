from __future__ import annotations

import hashlib
from datetime import datetime
from uuid import uuid4

from sitepro.models.database import Customer, Job
from sitepro.services.db import get_db


async def create_job_from_voice(payload: dict) -> dict:
    """Upsert customer & job based on VoicePro payload."""
    db = get_db()

    phone = payload["customer"]["phone"].strip()
    customer_doc = await db.customers.find_one({"phone": phone})
    if customer_doc is None:
        customer = Customer(
            name=payload["customer"].get("name"),
            phone=phone,
            email=payload["customer"].get("email"),
            address=payload["customer"].get("address"),
            language=payload.get("language", "en"),
        )
        await db.customers.insert_one(customer.model_dump(by_alias=True, exclude_none=True))
        customer_id = customer.id
    else:
        customer_id = customer_doc["_id"]

    call_id = payload["call_id"]
    job_doc = await db.jobs.find_one({"call_id": call_id})
    if job_doc is None:
        job = Job(
            customer_id=customer_id,
            source="voice",
            call_id=call_id,
            appliance=payload.get("appliance"),
            status="created",
        )
        await db.jobs.insert_one(job.model_dump(by_alias=True, exclude_none=True))
        job_id = job.id
        job_status = "created"
    else:
        job_id = job_doc["_id"]
        job_status = "merged"

    return {"job_id": job_id, "customer_id": customer_id, "status": job_status} 