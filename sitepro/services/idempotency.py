from __future__ import annotations

import asyncio
import functools
import json
import logging
from typing import Callable, Awaitable, Any

from fastapi import HTTPException, status

from sitepro.services.redis_client import get_redis

logger = logging.getLogger("sitepro.idempotency")
TTL_SECONDS = 86_400  # 24h


def idempotent(endpoint_key: str) -> Callable[[Callable[..., Awaitable[Any]]], Callable[..., Awaitable[Any]]]:
    """Decorator to enforce idempotency for mutating endpoints based on payload idempotency_key."""

    def decorator(func: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
        @functools.wraps(func)
        async def wrapper(payload: dict, *args, **kwargs):
            idem_key = payload.get("idempotency_key")
            if not idem_key:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="idempotency_key missing")

            redis = get_redis()
            cache_key = f"{endpoint_key}:{idem_key}"
            cached = await redis.get(cache_key)
            if cached:
                logger.debug("Idempotent hit for %s", cache_key)
                return json.loads(cached)

            result = await func(payload, *args, **kwargs)
            try:
                await redis.setex(cache_key, TTL_SECONDS, json.dumps(result))
            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to store idempotency cache: %s", exc, exc_info=True)
            return result

        return wrapper

    return decorator 