from __future__ import annotations

import httpx
from typing import Any

from sitepro.config import get_settings


class VoiceProClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    async def _post(self, path: str, json: dict | None = None, params: dict | None = None) -> Any:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(f"{self.base_url}{path}", json=json or {}, params=params or {})
            resp.raise_for_status()
            return resp.json()

    async def _get(self, path: str, params: dict | None = None) -> Any:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(f"{self.base_url}{path}", params=params or {})
            resp.raise_for_status()
            return resp.json()

    # Mappings to VoicePro endpoints you shared
    async def list_messages(self):
        return await self._get("/debug-voice-messages")

    async def transcribe(self, message_id: str):
        # Fire-and-forget compatible; we just trigger the job on VoicePro
        return await self._post(f"/transcribe/{message_id}")

    async def translation(self, message_id: str, target_language: str):
        return await self._post(f"/translate/{message_id}", params={"target_language": target_language})

    async def analysis(self, message_id: str):
        return await self._post(f"/analyze/{message_id}")


def get_voicepro_client() -> VoiceProClient | None:
    base = (get_settings().voicepro_base_url or '').strip()
    if not base:
        return None
    return VoiceProClient(base)


