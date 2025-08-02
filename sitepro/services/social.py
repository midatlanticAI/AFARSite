from __future__ import annotations

from datetime import datetime
from sitepro.models.database import SocialPost
from sitepro.services.db import get_db


async def generate_post(template_id: str, variables: dict, channels: list[str]):
    content = f"[TEMPLATE {template_id}] with vars {variables}"
    post = SocialPost(content=content, channels=channels, status="draft")
    db = get_db()
    await db.social_posts.insert_one(post.model_dump(by_alias=True))
    return {"post_id": post.id, "status": post.status}


async def publish_post(post_id: str):
    db = get_db()
    res = await db.social_posts.update_one({"_id": post_id}, {"$set": {"status": "posted", "posted_at": datetime.utcnow()}})
    if res.matched_count == 0:
        return {"posted": False, "error": "not_found"}
    return {"posted": True}


async def queue_status():
    db = get_db()
    count = await db.social_posts.count_documents({"status": "queued"})
    return {"queued": count} 