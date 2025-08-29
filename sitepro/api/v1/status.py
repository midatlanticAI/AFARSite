from __future__ import annotations

import os
import socket
from typing import Any

from fastapi import APIRouter
from sitepro.services.db import get_db

router = APIRouter()


async def _ping_mongo() -> dict[str, Any]:
    try:
        db = get_db()
        # Try a trivial command on both real and in-memory adapters
        count = await db.jobs.count_documents({})  # type: ignore[attr-defined]
        return {"ok": True, "jobs_count": int(count)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def _port_open(host: str, port: int, timeout: float = 0.25) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


@router.get("/health", tags=["status"])  # liveness
async def health() -> dict[str, Any]:
    return {"status": "ok"}


@router.get("/readiness", tags=["status"])  # readiness summary
async def readiness() -> dict[str, Any]:
    mongo = await _ping_mongo()
    services = {
        "api": True,
        "voicepro_static": _port_open("127.0.0.1", int(os.getenv("PORT", "8001"))),
        "redis": True,  # placeholder; implement ping later if needed
    }
    overall_ok = bool(mongo.get("ok")) and all(services.values())
    return {"ok": overall_ok, "mongo": mongo, "services": services}


