from __future__ import annotations

from random import choice

from sitepro.models.database import Technician
from sitepro.services.db import get_db
from sitepro.config import get_settings


async def triage_suggest(appliance: dict) -> dict:
    """Return mock triage suggestion; in production call OpenAI."""
    issue = appliance.get("symptom", "unknown issue")
    advice = f"Based on the symptom '{issue}', it may be a clogged filter or sensor fault."
    return {
        "likely_fault": "clogged_filter",
        "confidence": 0.42,
        "advice": advice,
    }


async def dispatch_suggest(job_id: str) -> dict:
    db = get_db()
    tech_cursor = db.technicians.find({"active": True})
    techs = await tech_cursor.to_list(length=100)
    if not techs:
        return {"suggested": None, "reason": "no_active_techs"}
    tech = choice(techs)
    return {"suggested_tech_id": tech["_id"]}


async def parts_forecast(job_id: str):
    return {"job_id": job_id, "parts": []} 