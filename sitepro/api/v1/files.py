from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Form, status
import os

router = APIRouter()

UPLOAD_DIR = os.getenv("SITEPRO_UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Note: Do not use idempotency on multipart uploads; decorator expects JSON payloads
@router.post("/upload", status_code=status.HTTP_201_CREATED, response_model=dict)
async def upload(customer_id: str = Form(...), file: UploadFile = File(...)):
    # Basic disk storage; replace with S3/GCS in production
    safe_name = f"{customer_id}_{file.filename.replace('/', '_').replace('\\', '_')}"
    path = os.path.join(UPLOAD_DIR, safe_name)
    content = await file.read()
    with open(path, 'wb') as f:
        f.write(content)
    return {"uploaded": True, "path": path}


