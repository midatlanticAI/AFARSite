from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import traceback

from sitepro.api.v1.voice import router as voice_router
from sitepro.api.v1.chat import router as chat_router
from sitepro.api.v1.repair import router as repair_router
from sitepro.api.v1.contacts import router as contacts_router
from sitepro.api.v1.billing import router as billing_router
from sitepro.api.v1.jobs import router as jobs_router
from sitepro.api.v1.social import router as social_router
from sitepro.api.v1.opportunities import router as opportunities_router
from sitepro.api.v1.reminders import router as reminders_router
from sitepro.mcp.manifest import get_manifest
from sitepro.api.v1.files import router as files_router
from sitepro.api.v1.reports import router as reports_router
from sitepro.api.v1.status import router as status_router

app = FastAPI(
    title="SitePro API",
    version="0.1",
    description="Central hub for appliance service provider ecosystem."
)

# Relaxed CORS for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice_router, prefix="/api/v1/voice", tags=["voice"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(repair_router, prefix="/api/v1/repair", tags=["repair"])
app.include_router(social_router, prefix="/api/v1/social", tags=["social"])
app.include_router(contacts_router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(billing_router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(opportunities_router, prefix="/api/v1/opportunities", tags=["opportunities"])
app.include_router(reminders_router, prefix="/api/v1/reminders", tags=["reminders"])
app.include_router(files_router, prefix="/api/v1/files", tags=["files"])
app.include_router(reports_router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(status_router, prefix="/api/v1/status")

# Serve the built VoicePro dashboard (static)
app.mount(
    "/voicepro",
    StaticFiles(directory="VoicePro/MAAI-Client-Frontend/build", html=True),
    name="voicepro",
)
# Serve VoicePro static assets if build expects absolute /static paths
app.mount(
    "/static",
    StaticFiles(directory="VoicePro/MAAI-Client-Frontend/build/static"),
    name="voicepro-static",
)


@app.get("/healthz", tags=["meta"])
async def healthcheck():
    return {"status": "ok"}


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    # Basic hardening headers
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=()")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )


@app.get("/mcp/manifest", tags=["mcp"])
async def manifest():
    return JSONResponse(get_manifest()) 