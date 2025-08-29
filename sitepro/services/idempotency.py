from __future__ import annotations

import asyncio
import functools
import inspect
import json
import logging
from typing import Callable, Awaitable, Any
from pydantic import BaseModel

from fastapi import HTTPException, status

from sitepro.services.redis_client import get_redis

logger = logging.getLogger("sitepro.idempotency")
TTL_SECONDS = 86_400  # 24h


def idempotent(endpoint_key: str) -> Callable[[Callable[..., Awaitable[Any]]], Callable[..., Awaitable[Any]]]:
    """Decorator for optional idempotency.

    If an idempotency key is supplied (via payload.idempotency_key or payload["idempotency_key"]) the
    result will be cached for a short period and returned on repeated calls. If no key is provided,
    the wrapped function executes normally with no caching. This keeps development flows frictionless
    while allowing clients to opt-in for safety.
    """

    def decorator(func: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
        @functools.wraps(func)
        async def wrapper(payload: Any, *args, **kwargs):
            # Support both dict payloads and Pydantic models
            idem_key: str | None = None
            if isinstance(payload, dict):
                idem_key = payload.get("idempotency_key")
            elif isinstance(payload, BaseModel):
                idem_key = getattr(payload, "idempotency_key", None) or payload.model_dump().get("idempotency_key")
            else:
                # Last resort, try attribute access
                idem_key = getattr(payload, "idempotency_key", None)
            # Idempotency key is optional; if missing, just execute without caching
            if not idem_key:
                return await func(payload, *args, **kwargs)

            redis = get_redis()
            cache_key = f"{endpoint_key}:{idem_key}"
            cached = await redis.get(cache_key)
            if cached:
                logger.debug("Idempotent hit for %s", cache_key)
                return json.loads(cached)

            result = await func(payload, *args, **kwargs)
            try:
                await redis.setex(cache_key, TTL_SECONDS, json.dumps(result, default=str))
            except Exception as exc:  # noqa: BLE001
                logger.error("Failed to store idempotency cache: %s", exc, exc_info=True)
            return result

        # Preserve original function signature and annotations so FastAPI sees correct Pydantic models
        wrapper.__signature__ = inspect.signature(func)  # type: ignore[attr-defined]
        try:
            wrapper.__annotations__ = getattr(func, "__annotations__", {})  # type: ignore[attr-defined]
        except Exception:
            pass
        return wrapper

    return decorator 