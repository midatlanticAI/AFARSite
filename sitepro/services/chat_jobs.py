from __future__ import annotations

from sitepro.models.database import Customer, Job
from sitepro.services.db import get_db


async def create_job_from_chat(payload: dict) -> dict:
    db = get_db()
    user = payload["user"]
    phone = user.get("phone")
    if not phone:
        # fallback create customer by user_id
        phone = f"chat-{user['user_id']}"

    customer_doc = await db.customers.find_one({"phone": phone})
    if customer_doc is None:
        customer = Customer(
            name=user.get("name"),
            phone=phone,
            email=user.get("email"),
            language=payload.get("language", "en"),
        )
        await db.customers.insert_one(customer.model_dump(by_alias=True, exclude_none=True))
        customer_id = customer.id
    else:
        customer_id = customer_doc["_id"]

    chat_id = payload["chat_id"]
    job_doc = await db.jobs.find_one({"chat_id": chat_id})
    if job_doc is None:
        job = Job(
            customer_id=customer_id,
            source="chat",
            call_id=chat_id,  # reuse field
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