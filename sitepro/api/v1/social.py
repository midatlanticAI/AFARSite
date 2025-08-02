from fastapi import APIRouter, status
from sitepro.services.idempotency import idempotent
from sitepro.services.social import generate_post as generate_post_service, publish_post as publish_post_service, queue_status as queue_status_service

router = APIRouter()


@router.post("/generate_post", status_code=status.HTTP_201_CREATED)
@idempotent("generate_post")
async def generate_post(payload: dict):
    return await generate_post_service(payload["template_id"], payload.get("variables", {}), payload.get("channels", ["facebook"]))


@router.post("/publish_post", status_code=status.HTTP_200_OK)
@idempotent("publish_post")
async def publish_post(payload: dict):
    return await publish_post_service(payload["post_id"])


@router.get("/queue_status", status_code=status.HTTP_200_OK)
async def queue_status():
    return await queue_status_service() 