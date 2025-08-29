from __future__ import annotations

from typing import Any
import hashlib
from uuid import uuid4

from sitepro.models.database import Customer, Address, Phone
from sitepro.services.db import get_db
from sitepro.services.counters import next_sequence


async def list_customers(query: dict | None = None, limit: int = 100, skip: int = 0) -> dict:
    db = get_db()
    cursor = db.customers.find(query or {}).skip(skip).limit(limit).sort("updated_at", -1)
    items = await cursor.to_list(length=limit)
    return {"items": items}


async def get_customer(customer_id: str) -> dict | None:
    db = get_db()
    doc = await db.customers.find_one({"_id": customer_id})
    return doc


async def upsert_customer(payload: dict) -> dict:
    db = get_db()

    # Normalize fields
    phones = [Phone(**p) if isinstance(p, dict) else Phone(number=str(p)) for p in payload.get("phones", [])]
    emails = payload.get("emails") or ([payload.get("email")] if payload.get("email") else [])

    # Compute display name if not provided
    first = (payload.get("first_name") or "").strip()
    last = (payload.get("last_name") or "").strip()
    if payload.get("name"):
        display_name = payload["name"].strip() or None
    else:
        if first and last:
            display_name = f"{last}, {first}"
        elif last:
            display_name = last
        elif first:
            display_name = first
        else:
            display_name = None

    customer = Customer(
        id=payload.get("id"),
        customer_number=payload.get("customer_number"),
        first_name=payload.get("first_name"),
        last_name=payload.get("last_name"),
        name=display_name,
        phones=phones,
        emails=emails,
        primary_phone=payload.get("primary_phone"),
        primary_email=payload.get("primary_email"),
        service_address=Address(**payload["service_address"]) if payload.get("service_address") else None,
        billing_address=Address(**payload["billing_address"]) if payload.get("billing_address") else None,
        language=payload.get("language", "en"),
        source=payload.get("source"),
        special_instructions=payload.get("special_instructions"),
        tax_exempt=bool(payload.get("tax_exempt", False)),
        is_company=bool(payload.get("is_company", False)),
        service_locations=[Address(**a) for a in payload.get("service_locations", [])],
        additional_contacts=list(payload.get("additional_contacts", [])),
        tags=list(payload.get("tags", [])),
        merged_into=payload.get("merged_into"),
        active=bool(payload.get("active", True)),
    )

    # Auto assign number on create
    if customer.id is None:
        customer.customer_number = await next_sequence("customer_number")
        customer.id = uuid4().hex

    data = customer.model_dump(by_alias=True, exclude_none=True)
    if customer.id:
        _id = customer.id
        data.pop("id", None)
        await db.customers.update_one({"_id": _id}, {"$set": data}, upsert=True)
        return {"id": _id}
    else:
        await db.customers.insert_one(data)
        return {"id": data["_id"]}


async def merge_customers(primary_id: str, duplicate_id: str) -> dict:
    db = get_db()
    primary = await db.customers.find_one({"_id": primary_id})
    duplicate = await db.customers.find_one({"_id": duplicate_id})
    if not primary or not duplicate:
        return {"merged": False, "error": "not_found"}

    # Reassign jobs and invoices from duplicate to primary
    await db.jobs.update_many({"customer_id": duplicate_id}, {"$set": {"customer_id": primary_id}})
    await db.invoices.update_many({"customer_id": duplicate_id}, {"$set": {"customer_id": primary_id}})

    await db.customers.update_one({"_id": duplicate_id}, {"$set": {"merged_into": primary_id, "active": False}})
    return {"merged": True}


async def deactivate_customer(customer_id: str) -> dict:
    db = get_db()
    result = await db.customers.update_one({"_id": customer_id}, {"$set": {"active": False}})
    return {"updated": result.modified_count == 1}


async def delete_customer(customer_id: str) -> dict:
    # Soft-delete only for safety
    return await deactivate_customer(customer_id)


