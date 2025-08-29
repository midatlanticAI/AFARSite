from __future__ import annotations

import hashlib
from datetime import datetime
from uuid import uuid4

from sitepro.models.database import Customer, Job, Phone, Address
from sitepro.services.counters import next_sequence
from sitepro.services.db import get_db


async def create_job_from_voice(payload: dict) -> dict:
    """Upsert customer & job based on VoicePro payload."""
    db = get_db()

    phone = payload["customer"]["phone"].strip()
    customer_doc = await db.customers.find_one({"phones.number": phone})
    if customer_doc is None:
        emails = [e for e in [payload["customer"].get("email")] if e]
        service_addr = payload["customer"].get("address")
        customer = Customer(
            name=payload["customer"].get("name"),
            first_name=payload["customer"].get("first_name"),
            last_name=payload["customer"].get("last_name"),
            phones=[Phone(number=phone, can_text=True)],
            emails=emails,
            primary_phone=phone,
            primary_email=emails[0] if emails else None,
            service_address=Address(**service_addr) if isinstance(service_addr, dict) else None,
            language=payload.get("language", "en"),
            source="voice",
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
        try:
            job.number = await next_sequence("job_number")
        except Exception:
            job.number = None
        await db.jobs.insert_one(job.model_dump(by_alias=True, exclude_none=True))
        job_id = job.id
        job_status = "created"
    else:
        job_id = job_doc["_id"]
        job_status = "merged"

    return {"job_id": job_id, "customer_id": customer_id, "status": job_status} 


async def create_job(payload: dict) -> dict:
    """Create a job directly (manual create from UI)."""
    db = get_db()
    job = Job(
        customer_id=payload["customer_id"],
        source="ui",
        call_id=payload.get("call_id") or f"ui-{uuid4().hex}",
        appliance=payload.get("appliance"),
        status=payload.get("status", "created"),
    )
    # Optional enrichments
    if payload.get("service_address"):
        try:
            job.service_address = Address(**payload["service_address"])  # type: ignore[attr-defined]
        except Exception:
            pass
    if payload.get("email"):
        job.email = payload.get("email")  # type: ignore[attr-defined]
    if payload.get("phone"):
        job.phone = payload.get("phone")  # type: ignore[attr-defined]

    try:
        job.number = await next_sequence("job_number")
    except Exception:
        job.number = None

    await db.jobs.insert_one(job.model_dump(by_alias=True, exclude_none=True))
    return {"id": job.id}


async def upsert_job(payload: dict) -> dict:
    """Upsert a job: create when id is missing, update when present."""
    db = get_db()
    job_id = payload.get("id") or payload.get("_id")
    if not job_id:
        # Delegate to create flow
        return await create_job(payload)

    # Build update document with only allowed fields
    update: dict = {}
    if "status" in payload:
        update["status"] = payload["status"]
    if "email" in payload:
        update["email"] = payload.get("email")
    if "phone" in payload:
        update["phone"] = payload.get("phone")
    if "appliance" in payload and isinstance(payload["appliance"], dict):
        update["appliance"] = payload["appliance"]
    if "service_address" in payload and isinstance(payload["service_address"], dict):
        try:
            update["service_address"] = Address(**payload["service_address"]).model_dump(by_alias=True, exclude_none=True)
        except Exception:
            pass

    if not update:
        return {"id": job_id, "updated": False}

    await db.jobs.update_one({"_id": job_id}, {"$set": update}, upsert=True)
    return {"id": job_id, "updated": True}


async def delete_job(job_id: str) -> dict:
    """Delete a job (soft delete by setting status to 'cancelled')."""
    db = get_db()
    result = await db.jobs.update_one({"_id": job_id}, {"$set": {"status": "cancelled"}})
    return {"deleted": result.modified_count == 1}