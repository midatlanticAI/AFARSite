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
        try:
            self._client = AsyncIOMotorClient(mongo_uri, uuidRepresentation="standard")
            self._db = self._client[db_name]
        except Exception:
            # Fallback to in-memory mock database for dev if Mongo is not available
            self._client = None
            self._db = _InMemoryDB()

    @property
    @lru_cache(maxsize=1)
    def db(self) -> AsyncIOMotorDatabase:  # noqa: D401
        if self._db is None:
            self._init()
        assert self._db is not None  # appease type checker
        return self._db


# Simple in-memory DB mock for dev fallbacks
class _InMemoryCollection:
    def __init__(self):
        self._docs: list[dict] = []

    def _ensure_id(self, doc: dict) -> dict:
        if "_id" not in doc:
            doc["_id"] = doc.get("id") or __import__("uuid").uuid4().hex
        return doc

    def _get_value(self, obj: dict, path: str):
        cur = obj
        for part in path.split("."):
            if isinstance(cur, dict):
                cur = cur.get(part)
            else:
                return None
        return cur

    def _match(self, doc: dict, query: dict) -> bool:
        if not query:
            return True
        for key, cond in query.items():
            if key == "$or" and isinstance(cond, list):
                if any(self._match(doc, q) for q in cond):
                    return True
                return False
            # Support field queries and simple operators
            value = self._get_value(doc, key) if not key.startswith("$") else None
            if isinstance(cond, dict):
                # regex match
                if "$regex" in cond:
                    import re
                    pattern = cond.get("$regex", "")
                    options = cond.get("$options", "")
                    flags = re.I if "i" in options.lower() else 0
                    text = str(value or "")
                    if re.search(pattern, text, flags) is None:
                        return False
                elif "$elemMatch" in cond and isinstance(value, list):
                    sub = cond["$elemMatch"]
                    ok = any(self._match(v if isinstance(v, dict) else {"value": v}, sub) for v in value)
                    if not ok:
                        return False
                else:
                    # Fallback exact dict equality
                    if value != cond:
                        return False
            else:
                if value != cond:
                    return False
        return True

    async def find_one(self, query):
        for d in self._docs:
            if self._match(d, query or {}):
                return d
        return None

    class _Cursor:
        def __init__(self, docs: list[dict]):
            self._docs = list(docs)
        def sort(self, field, direction):
            reverse = bool(direction) and int(direction) < 0
            def getter(doc):
                cur = doc
                for part in str(field).split("."):
                    cur = cur.get(part) if isinstance(cur, dict) else None
                return cur
            self._docs.sort(key=getter, reverse=reverse)
            return self
        def skip(self, n: int):
            self._docs = self._docs[n:]
            return self
        def limit(self, n: int):
            self._docs = self._docs[:n]
            return self
        async def to_list(self, length: int):
            return self._docs[:length]

    def find(self, query):
        matched = [d for d in self._docs if self._match(d, query or {})]
        return _InMemoryCollection._Cursor(matched)

    async def insert_one(self, doc):
        self._ensure_id(doc)
        self._docs.append(doc)
        class _Res:
            inserted_id = doc["_id"]
        return _Res()

    async def update_one(self, query, update, upsert: bool = False):
        matched = None
        for d in self._docs:
            if self._match(d, query or {}):
                matched = d
                break
        if matched is None and upsert:
            base = {}
            if isinstance(query, dict):
                # If query pins _id, use it
                if "_id" in query and isinstance(query["_id"], (str, int)):
                    base["_id"] = query["_id"]
            # Apply $set for upsert
            if "$set" in update and isinstance(update["$set"], dict):
                base.update(update["$set"])
            # Apply $inc starting from zero for missing fields
            if "$inc" in update and isinstance(update["$inc"], dict):
                for k, v in update["$inc"].items():
                    try:
                        inc = float(v)
                    except Exception:
                        inc = 0
                    current = base.get(k, 0)
                    try:
                        base[k] = type(current)(current + inc) if isinstance(current, (int, float)) else inc
                    except Exception:
                        base[k] = (current or 0) + inc
            self._ensure_id(base)
            self._docs.append(base)
            class _Res:
                matched_count = 0
                modified_count = 0
                upserted_id = base["_id"]
            return _Res()
        if matched is not None:
            if "$set" in update and isinstance(update["$set"], dict):
                matched.update(update["$set"])
            if "$inc" in update and isinstance(update["$inc"], dict):
                for k, v in update["$inc"].items():
                    try:
                        inc = float(v)
                    except Exception:
                        inc = 0
                    cur = matched.get(k, 0)
                    try:
                        matched[k] = type(cur)(cur + inc) if isinstance(cur, (int, float)) else inc
                    except Exception:
                        matched[k] = (cur or 0) + inc
            class _Res:
                matched_count = 1
                modified_count = 1
            return _Res()
        class _Res:
            matched_count = 0
            modified_count = 0
        return _Res()

    async def update_many(self, query, update):
        count = 0
        for d in self._docs:
            if self._match(d, query or {}):
                if "$set" in update and isinstance(update["$set"], dict):
                    d.update(update["$set"])
                if "$inc" in update and isinstance(update["$inc"], dict):
                    for k, v in update["$inc"].items():
                        try:
                            inc = float(v)
                        except Exception:
                            inc = 0
                        cur = d.get(k, 0)
                        try:
                            d[k] = type(cur)(cur + inc) if isinstance(cur, (int, float)) else inc
                        except Exception:
                            d[k] = (cur or 0) + inc
                    count += 1
        class _Res:
            matched_count = count
            modified_count = count
        return _Res()

    async def delete_one(self, query):
        idx = -1
        for i, d in enumerate(self._docs):
            if self._match(d, query or {}):
                idx = i
                break
        class _Res:
            deleted_count = 0
        if idx >= 0:
            self._docs.pop(idx)
            _Res.deleted_count = 1
        return _Res()

    async def count_documents(self, query):
        return sum(1 for d in self._docs if self._match(d, query or {}))

    async def find_one_and_update(self, query, update, upsert: bool = False, return_document=None):
        await self.update_one(query, update, upsert=upsert)
        return await self.find_one(query)

    def aggregate(self, pipeline):
        # Extremely small subset: supports $sort, $limit, $project; ignores $lookup/$unwind
        docs = list(self._docs)
        for stage in pipeline or []:
            if "$sort" in stage:
                sort_spec = stage["$sort"]
                for field, direction in sort_spec.items():
                    reverse = int(direction) < 0
                    def getter(doc):
                        cur = doc
                        for part in str(field).split("."):
                            cur = cur.get(part) if isinstance(cur, dict) else None
                        return cur
                    docs.sort(key=getter, reverse=reverse)
            elif "$limit" in stage:
                docs = docs[: int(stage["$limit"]) ]
            elif "$project" in stage:
                proj = stage["$project"]
                new_docs = []
                for d in docs:
                    nd = {}
                    for k, v in proj.items():
                        if isinstance(v, str) and v.startswith("$"):
                            # path projection like "$customer.name"
                            path = v[1:]
                            cur = d
                            for part in path.split("."):
                                cur = cur.get(part) if isinstance(cur, dict) else None
                            nd[k] = cur
                        elif v == 1:
                            nd[k] = d.get(k)
                        else:
                            # constants or excluded fields ignored
                            nd[k] = d.get(k) if k in d else None
                    new_docs.append(nd)
                docs = new_docs
            else:
                # ignore unsupported stages (e.g., $lookup, $unwind)
                continue
        return _InMemoryCollection._Cursor(docs)


class _InMemoryDB:
    def __init__(self):
        self.jobs = _InMemoryCollection()
        self.customers = _InMemoryCollection()
        self.invoices = _InMemoryCollection()
        self.payments = _InMemoryCollection()
        self.refunds = _InMemoryCollection()
        self.job_notes = _InMemoryCollection()
        self.technicians = _InMemoryCollection()
        self.contact_notes = _InMemoryCollection()
        self.contact_messages = _InMemoryCollection()
        self.reminders = _InMemoryCollection()
        self.opportunities = _InMemoryCollection()
        self.counters = _InMemoryCollection()
        self.social_posts = _InMemoryCollection()
        self.chat_sessions = _InMemoryCollection()
        self.chat_messages = _InMemoryCollection()
        self.interaction_logs = _InMemoryCollection()


db_factory = _DBFactory()


def get_db() -> AsyncIOMotorDatabase:  # FastAPI dependency style
    return db_factory.db 