from __future__ import annotations

from random import choice

from sitepro.models.database import Technician
from sitepro.services.db import get_db
from sitepro.config import get_settings
import httpx


async def triage_suggest(appliance: dict) -> dict:
    """Proxy to external RepairPro if configured; fallback to mock."""
    settings = get_settings()
    base = (settings.repairpro_base_url or '').strip()
    if base:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(f"{base.rstrip('/')}/api/v1/triage", json={"appliance": appliance})
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
    issue = appliance.get("symptom", "unknown issue")
    return {"likely_fault": "clogged_filter", "confidence": 0.42, "advice": f"Based on the symptom '{issue}', it may be a clogged filter or sensor fault."}


async def dispatch_suggest(job_id: str) -> dict:
    settings = get_settings()
    base = (settings.repairpro_base_url or '').strip()
    if base:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(f"{base.rstrip('/')}/api/v1/dispatch_suggest", params={"job_id": job_id})
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
    db = get_db()
    tech_cursor = db.technicians.find({"active": True})
    techs = await tech_cursor.to_list(length=100)
    if not techs:
        return {"suggested": None, "reason": "no_active_techs"}
    tech = choice(techs)
    return {"suggested_tech_id": tech["_id"]}


async def parts_forecast(job_id: str):
    settings = get_settings()
    base = (settings.repairpro_base_url or '').strip()
    if base:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(f"{base.rstrip('/')}/api/v1/parts_forecast", params={"job_id": job_id})
                if resp.status_code == 200:
                    return resp.json()
        except Exception:
            pass
    return {"job_id": job_id, "parts": []}