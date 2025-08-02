from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

from sitepro.api.v1.voice import router as voice_router
from sitepro.api.v1.chat import router as chat_router
from sitepro.api.v1.repair import router as repair_router
from sitepro.api.v1.social import router as social_router
from sitepro.mcp.manifest import get_manifest

app = FastAPI(
    title="SitePro API",
    version="0.1",
    description="Central hub for appliance service provider ecosystem."
)

app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(repair_router, prefix="/api/v1/repair", tags=["repair"])
app.include_router(social_router, prefix="/api/v1/social", tags=["social"])


@app.get("/healthz", tags=["meta"])
async def healthcheck():
    return {"status": "ok"}


@app.get("/mcp/manifest", tags=["mcp"])
async def manifest():
    return JSONResponse(get_manifest()) 