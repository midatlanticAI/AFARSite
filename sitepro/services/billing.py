from __future__ import annotations

from datetime import datetime
from typing import List

from sitepro.models.database import Invoice, Payment, Refund
from sitepro.services.db import get_db


async def list_invoices(customer_id: str | None = None, job_id: str | None = None, limit: int = 100) -> dict:
    db = get_db()
    query: dict = {}
    if customer_id:
        query["customer_id"] = customer_id
    if job_id:
        query["job_id"] = job_id
    cursor = db.invoices.find(query).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items}


async def create_or_update_invoice(payload: dict) -> dict:
    db = get_db()
    invoice = Invoice(**payload)
    data = invoice.model_dump(by_alias=True, exclude_none=True)
    if invoice.id:
        _id = invoice.id
        data.pop("id", None)
        await db.invoices.update_one({"_id": _id}, {"$set": data}, upsert=True)
        return {"id": _id}
    else:
        await db.invoices.insert_one(data)
        return {"id": data["_id"]}


async def record_payment(payload: dict) -> dict:
    db = get_db()
    payment = Payment(**payload)
    data = payment.model_dump(by_alias=True, exclude_none=True)
    await db.payments.insert_one(data)
    # Link to invoice
    await db.invoices.update_one({"_id": payment.invoice_id}, {"$addToSet": {"payments": data["_id"]}})
    return {"id": data["_id"]}


async def list_payments(customer_id: str | None = None, invoice_id: str | None = None, limit: int = 100) -> dict:
    db = get_db()
    query: dict = {}
    if customer_id:
        query["customer_id"] = customer_id
    if invoice_id:
        query["invoice_id"] = invoice_id
    cursor = db.payments.find(query).sort("collected_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items}


async def refund_payment(payload: dict) -> dict:
    db = get_db()
    refund = Refund(**payload)
    data = refund.model_dump(by_alias=True, exclude_none=True)
    await db.refunds.insert_one(data)
    return {"id": data["_id"]}


async def list_refunds(payment_id: str | None = None, invoice_id: str | None = None, customer_id: str | None = None, limit: int = 100) -> dict:
    db = get_db()
    query: dict = {}
    if payment_id:
        query["payment_id"] = payment_id
    if invoice_id:
        query["invoice_id"] = invoice_id
    if customer_id:
        query["customer_id"] = customer_id
    cursor = db.refunds.find(query).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items}


