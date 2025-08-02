from fastapi import APIRouter, status
from sitepro.services.idempotency import idempotent
from sitepro.services.repair import triage_suggest as triage_service, dispatch_suggest as dispatch_service, parts_forecast as parts_service

router = APIRouter()


@router.post("/triage_suggest", status_code=status.HTTP_200_OK)
@idempotent("triage_suggest")
async def triage_suggest(payload: dict):
    return await triage_service(payload.get("appliance", {}))


@router.post("/dispatch_suggest", status_code=status.HTTP_200_OK)
@idempotent("dispatch_suggest")
async def dispatch_suggest(payload: dict):
    return await dispatch_service(payload["job_id"])


@router.get("/parts_forecast", status_code=status.HTTP_200_OK)
async def parts_forecast(job_id: str):
    return await parts_service(job_id) 