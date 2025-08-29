from __future__ import annotations

from fastapi import APIRouter, status
from sitepro.services.reports import get_summary


router = APIRouter()


@router.get("/summary", status_code=status.HTTP_200_OK)
async def summary(range: str = "month_to_date"):
    return await get_summary(range)


