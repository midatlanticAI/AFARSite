from __future__ import annotations

from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from typing import Optional
from sitepro.services.idempotency import idempotent
from sitepro.services.jobs import create_job as create_job_service, upsert_job as upsert_job_service, delete_job as delete_job_service
from sitepro.services.db import get_db


router = APIRouter()


@router.get("/list", status_code=status.HTTP_200_OK)
async def list_jobs(limit: int = 200):
    try:
        db = get_db()
        cursor = db.jobs.aggregate([
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {"$lookup": {"from": "customers", "localField": "customer_id", "foreignField": "_id", "as": "customer"}},
            {"$unwind": {"path": "$customer", "preserveNullAndEmptyArrays": True}},
            {"$project": {"_id": 1, "number": 1, "status": 1, "customer_name": "$customer.name", "created_at": 1}},
        ])
        items = await cursor.to_list(length=limit)
        return {"items": items}
    except Exception:
        # Return empty list if database unavailable in dev
        return {"items": []}


@router.get("/{job_id}", status_code=status.HTTP_200_OK)
async def get_job(job_id: str):
    try:
        db = get_db()
        job = await db.jobs.find_one({"_id": job_id})
        if not job:
            return {"error": "not_found"}
        notes_cur = db.job_notes.find({"job_id": job_id}).sort("ts", -1)
        notes = await notes_cur.to_list(length=200)
        invoices_cur = db.invoices.find({"job_id": job_id}).sort("created_at", -1)
        invoices = await invoices_cur.to_list(length=50)
        return {"job": job, "notes": notes, "invoices": invoices}
    except Exception:
        return {"job": {"_id": job_id}, "notes": [], "invoices": []}


class AddressIn(BaseModel):
    address1: Optional[str] = Field(default=None, max_length=128)
    address2: Optional[str] = Field(default=None, max_length=128)
    city: Optional[str] = Field(default=None, max_length=64)
    state: Optional[str] = Field(default=None, max_length=64)
    zip_code: Optional[str] = Field(default=None, max_length=16)
    country: Optional[str] = Field(default="US", max_length=2)


class ApplianceIn(BaseModel):
    type: Optional[str] = Field(default=None, max_length=64)
    failure: Optional[str] = Field(default=None, max_length=200)


class JobCreate(BaseModel):
    customer_id: str
    title: Optional[str] = Field(default=None, max_length=160)
    appliance: Optional[ApplianceIn] = None
    service_address: Optional[AddressIn] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str = Field(default="created", max_length=32)


@router.post("/create", status_code=status.HTTP_201_CREATED)
@idempotent("job_create")
async def create_job(payload: JobCreate):
    return await create_job_service(payload.model_dump(exclude_none=True))


class JobUpsert(BaseModel):
    id: Optional[str] = None
    _id: Optional[str] = None
    status: Optional[str] = Field(default=None, max_length=32)
    email: Optional[str] = None
    phone: Optional[str] = None
    appliance: Optional[ApplianceIn] = None
    service_address: Optional[AddressIn] = None


@router.post("/upsert", status_code=status.HTTP_200_OK)
@idempotent("job_upsert")
async def upsert_job(payload: JobUpsert):
    return await upsert_job_service(payload.model_dump(exclude_none=True))


class JobDelete(BaseModel):
    id: str


@router.post("/delete", status_code=status.HTTP_200_OK)
@idempotent("job_delete")
async def delete_job(payload: JobDelete):
    return await delete_job_service(payload.id)


