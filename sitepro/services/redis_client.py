from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import Any

from sitepro.config import get_settings

try:
    import redis.asyncio as aioredis  # type: ignore
except ImportError:  # fallback for environments without redis package
    aioredis = None  # type: ignore


class _MemoryRedisStub:
    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str):
        async with self._lock:
            if key in self._store:
                value, expires_at = self._store[key]
                if expires_at == 0 or expires_at > asyncio.get_event_loop().time():
                    return value
                self._store.pop(key, None)
            return None

    async def setex(self, key: str, ttl: int, value: Any):
        async with self._lock:
            expires_at = 0 if ttl == 0 else asyncio.get_event_loop().time() + ttl
            self._store[key] = (value, expires_at)


@lru_cache(maxsize=1)
def get_redis():
    settings = get_settings()
    if aioredis is None:
        return _MemoryRedisStub()
    return aioredis.from_url(settings.redis_uri, decode_responses=True) 