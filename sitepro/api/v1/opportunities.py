from __future__ import annotations

from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from typing import Optional

from sitepro.services.idempotency import idempotent
from sitepro.services.opportunities import list_opportunities, upsert_opportunity, delete_opportunity


router = APIRouter()


@router.get("/list", status_code=status.HTTP_200_OK)
async def list_api(customer_id: Optional[str] = None, limit: int = 100):
    limit = max(1, min(limit, 100))
    return await list_opportunities(customer_id=customer_id, limit=limit)


class OppIn(BaseModel):
    id: Optional[str] = None
    customer_id: str
    title: str = Field(min_length=1, max_length=200)
    status: str = Field(default="open", max_length=32)


@router.post("/upsert", status_code=status.HTTP_201_CREATED)
@idempotent("opportunity_upsert")
async def upsert_api(payload: OppIn):
    return await upsert_opportunity(payload.model_dump())


class OppId(BaseModel):
    id: str


@router.post("/delete", status_code=status.HTTP_200_OK)
@idempotent("opportunity_delete")
async def delete_api(payload: OppId):
    return await delete_opportunity(payload.id)


