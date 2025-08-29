from __future__ import annotations

from datetime import datetime
from typing import Optional

from sitepro.models.database import Opportunity
from sitepro.services.db import get_db


async def list_opportunities(customer_id: Optional[str] = None, limit: int = 100) -> dict:
    db = get_db()
    query: dict = {}
    if customer_id:
        query["customer_id"] = customer_id
    cursor = db.opportunities.find(query).sort("updated_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    return {"items": items}


async def upsert_opportunity(payload: dict) -> dict:
    db = get_db()
    opp = Opportunity(**payload)
    data = opp.model_dump(by_alias=True, exclude_none=True)
    if opp.id:
        _id = opp.id
        data.pop("id", None)
        data["updated_at"] = datetime.utcnow()
        await db.opportunities.update_one({"_id": _id}, {"$set": data}, upsert=True)
        return {"id": _id}
    else:
        await db.opportunities.insert_one(data)
        return {"id": data["_id"]}


async def delete_opportunity(opp_id: str) -> dict:
    db = get_db()
    res = await db.opportunities.delete_one({"_id": opp_id})
    return {"deleted": res.deleted_count == 1}


