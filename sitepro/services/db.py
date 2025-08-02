import os
from functools import lru_cache

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from sitepro.config import get_settings


class _DBFactory:
    """Singleton factory for Motor client + database handle."""

    def __init__(self):
        self._client: AsyncIOMotorClient | None = None
        self._db: AsyncIOMotorDatabase | None = None

    def _init(self) -> None:
        settings = get_settings()
        mongo_uri = settings.mongo_uri
        db_name = settings.mongo_db
        self._client = AsyncIOMotorClient(mongo_uri, uuidRepresentation="standard")
        self._db = self._client[db_name]

    @property
    @lru_cache(maxsize=1)
    def db(self) -> AsyncIOMotorDatabase:  # noqa: D401
        if self._db is None:
            self._init()
        assert self._db is not None  # appease type checker
        return self._db


db_factory = _DBFactory()


def get_db() -> AsyncIOMotorDatabase:  # FastAPI dependency style
    return db_factory.db 