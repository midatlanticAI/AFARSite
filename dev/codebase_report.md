# SitePro Codebase Architecture and Integration Report

This document inventories the active codebase, the donor dashboards, and the VoicePro app dropped into this repo. It is intended as a living reference to avoid redundancy, guide integrations, and speed development.

## Top-level layout

- sitepro/ — FastAPI backend (API-only hub)
- frontend/ — React + Vite + TS operator UI (provider + customer pages)
- dashboards/ — donor Next.js apps and UI libraries (re-usable components/pages; do not run here)
- VoicePro/ — external VoicePro service repo (standalone app; integrate, do not rebuild)
- scripts/ — PowerShell helpers
- dev/ — docs, seeds, reports

## Backend: SitePro (FastAPI)

Entry: `sitepro/main.py`
- Middleware: permissive CORS (dev), global exception handler, basic security headers
- Routers included:
  - `/api/v1/voice` (tags: voice)
  - `/api/v1/chat` (tags: chat)
  - `/api/v1/repair` (tags: repair)
  - `/api/v1/social` (tags: social)
  - `/api/v1/contacts` (tags: contacts)
  - `/api/v1/billing` (tags: billing)
  - `/api/v1/jobs` (tags: jobs)
  - `/api/v1/opportunities` (tags: opportunities)
  - `/api/v1/reminders` (tags: reminders)
  - `/api/v1/files` (tags: files)
  - `/api/v1/reports` (tags: reports)
  - `/healthz` (meta)
  - `/mcp/manifest` (meta)

### Key endpoints by domain

- Voice (`sitepro/api/v1/voice.py`)
  - POST `/create_job_from_voice`: create/merge customer + job from voice payload
  - POST `/append_note`: add job note (channel=voice)
  - POST `/schedule_tech`: schedule technician and log note
  - POST `/update_job_status`: allowed transitions enumerated in `services/status.py`
  - GET `/get_diagnostic_fee`: from settings
  - GET `/messages`: proxy to external VoicePro if `VOICEPRO_BASE_URL` configured
  - POST `/messages/{id}/transcribe|translate|analyze`: proxies when configured
  - POST `/webhook/ingest`: placeholder for async events

- Chat (`sitepro/api/v1/chat.py`)
  - POST `/create_job_from_chat`: create job from chat user payload; dedupe by phone/chat id
  - POST `/append_chat_note`: add note (channel=chat)
  - POST `/escalate`: simple status update path

- Repair (`sitepro/api/v1/repair.py`)
  - POST `/triage_suggest`: proxy to external RepairPro `/api/v1/triage` else local heuristic
  - POST `/dispatch_suggest`: proxy else choose random active tech
  - GET `/parts_forecast`: proxy else `{parts: []}`

- Social (internal stub today) (`sitepro/api/v1/social.py`)
  - POST `/generate_post`: create draft post
  - POST `/publish_post`: mark posted
  - GET `/queue_status`: queued count

- Contacts (`sitepro/api/v1/contacts.py`)
  - GET `/list`, GET `/{customer_id}`
  - POST `/upsert`, `/merge`, `/deactivate`, `/delete`
  - POST `/message` (logs to `contact_messages` for dev), GET `/messages`
  - GET `/export` (CSV), POST `/import` (CSV with robust mapping & phone/email sanitation)

- Jobs (`sitepro/api/v1/jobs.py`)
  - GET `/list` (simple aggregate)
  - GET `/{job_id}` (job + notes + invoices)
  - POST `/create`, `/upsert`, `/delete`

- Billing (`sitepro/api/v1/billing.py`)
  - GET `/invoices`, `/payments`, `/refunds`
  - POST `/invoice` (upsert), `/payment`, `/refund`

- Opportunities (`sitepro/api/v1/opportunities.py`)
  - GET `/list`, POST `/upsert`, `/delete`

- Reminders (`sitepro/api/v1/reminders.py`)
  - GET `/list`, POST `/upsert`, `/delete`

- Files (`sitepro/api/v1/files.py`)
  - POST `/upload` multipart; stores under `./uploads`

- Reports (`sitepro/api/v1/reports.py`)
  - GET `/summary` with time-range selector; uses DB to synthesize basic metrics

### Services and data layer

- Models: `sitepro/models/database.py` — Pydantic models (Customer, Job, JobNote, ContactNote, Invoice, Payment, Refund, Reminder, Opportunity, SocialPost, Technician, Address, Phone, IdempotencyLog)

- DB: `sitepro/services/db.py` — Motor client with dev fallback to an in-memory DB
  - Collections in memory: `jobs`, `customers`, `invoices`, `payments`, `refunds`, `job_notes`, `technicians`, `contact_notes`, `contact_messages`, `reminders`, `opportunities`, `counters`, `social_posts`
  - Query helpers: basic `$or`, `$regex`, `$elemMatch`, `sort`, `skip`, `limit`, light `aggregate` subset

- Counters: `sitepro/services/counters.py` — `next_sequence(name)` for `customer_number`, `job_number`

- Idempotency: `sitepro/services/idempotency.py`
  - Optional key via `payload.idempotency_key` (dict or Pydantic); if present, cache response `TTL_SECONDS` via Redis client
  - Redis client: `sitepro/services/redis_client.py` with in-memory stub when Redis or URI is unavailable

- Business services: `services/customers.py`, `jobs.py`, `notes.py`, `schedule.py`, `status.py`, `billing.py`, `reminders.py`, `opportunities.py`, `social.py`, `repair.py`, `reports.py`, `voicepro.py`
  - `voicepro.py` implements a simple async client to external VoicePro; enabled by `VOICEPRO_BASE_URL`

- Settings: `sitepro/config.py`
  - `MONGO_URI`, `MONGO_DB`, `REDIS_URI`, `DIAGNOSTIC_FEE`, `JWT_SECRET`
  - Integrations: `VOICEPRO_BASE_URL`, `VOICEPRO_SAFE_MODE`, `CHATPRO_BASE_URL`, `REPAIRPRO_BASE_URL`

## Frontend: SitePro UI (Vite/React)

- HTTP client: `frontend/src/services/api.ts`
  - `baseURL` from `VITE_API_URL` (normalized); adds `Authorization` if token present
  - Adds `Idempotency-Key` for mutating requests; dispatches `api-error` CustomEvent on failure

- Router: `frontend/src/App.tsx`
  - Provider routes: `/provider/...` (Dashboard, Contacts, ContactDetail, Jobs, JobDetail, Dispatch, Schedule, Calendar, Resources, VoicePro, ChatPro, SocialPro, RepairPro, Billing, Reports)
  - Customer routes: `/my` (guarded customer layout)
  - Public customer pages added: `/myappliance`, `/profile`, `/profile/appliances` (wired with demo store, ready for backend)

- Global error UI: `frontend/src/main.tsx` provides a Snackbar that listens to `api-error`

## Donor dashboards (do not rebuild; reuse components)

- `dashboards/app/*` (Next.js)
  - Pages: site-pro (insights/analytics), reviews (dashboard, competition, reputation, workshop), customers/jobs pages, myappliance variants
  - `dashboards/lib/api/*` contains mock API clients — good for UI scaffolding
  - Components: forms, breadcrumbs, JobDetails, ContentForm, etc.

- `dashboards/vpdash/MAAI-Client-Frontend/*` (VoicePro dashboard frontend)
  - Router/provider wrappers; Axios client configured via its env

## VoicePro external app (standalone)

- Path: `VoicePro/AIVPV1/app/main.py` — full FastAPI service, Twilio handlers, messaging, call logs, AI chat, sitepro webhook router
- Integrate with SitePro by setting `VOICEPRO_BASE_URL` and using `/api/v1/voice/...` proxies; do not rebuild

## SocialPro (to build here)

- We already have internal stubs under `services/social.py` and `api/v1/social.py`. Phase‑1 plan:
  - Models: Template, Post (content, variables, channels, scheduled_at, status), PublishResult
  - Endpoints: generate (draft), schedule, publish, queue_status, list
  - Provider UI: generate/preview/schedule/publish; queue/posted tabs
  - Channel adapters: start with stub ‘echo’ adapter; later add Facebook/Google connectors

## Unified AI interaction log (cross-channel)

Add a persistent log for conversations/events that ties voice, chat, social, and field interactions to `customer_id` and `job_id` when known.
- Model: InteractionLog { id, channel, thread_id, customer_id?, job_id?, message, direction, ts, meta }
- Endpoints: POST /interactions, GET /interactions (filters by channel/customer/job/thread)
- Provider UI: Conversations view with filters

## Dev workflow (Windows PowerShell)

Recommended local run (choose a free port if 8000 is busy):
- API from repo root:
  - `$env:PYTHONPATH = "C:\\Users\\jviru\\allfixed" ; python -m uvicorn sitepro.main:app --port 8001`
- Frontend from `frontend/`:
  - `$env:VITE_API_URL = "http://127.0.0.1:8001" ; npm run dev`

Optional: add `scripts/dev.ps1` to start both; ensure it uses `powershell` (not `pwsh`) and checks for port conflicts.

## Configuration summary

- `.env` / Settings:
  - DB: `MONGO_URI`, `MONGO_DB`
  - Redis/idempotency: `REDIS_URI` (or `memory://` for dev)
  - Integrations: `VOICEPRO_BASE_URL`, `CHATPRO_BASE_URL`, `REPAIRPRO_BASE_URL`
  - Frontend: `VITE_API_URL` (points to SitePro API)

## Immediate work items (no rebuilds of existing tools)

1. Stabilize Windows startup (one command dev script; resolve 8000 conflict; document)
2. SocialPro v1: design + endpoints + provider UI + queue stub
3. InteractionLog model/endpoints + provider Conversations view
4. VoicePro: webhook ingest + SMS callback flows; robust proxy timeouts
5. ChatPro: public widget + auth-aware mode; link to customers/jobs
6. MyAppliance backend APIs (profile/appliances) + wire frontend (replace demo store)
7. Reports: replace placeholders with aggregates (revenue pace, AR, completions)
8. Auth/CORS/rate limiting; idempotency audit and metrics
9. Tests and demo fixtures

## Notes

- The in-memory DB fallback is intentionally capable enough for dev flows (CRUD, `$regex`, `$elemMatch`, simple `aggregate`). Use it to develop without Mongo.
- Proxies fail safe: external base URLs are optional. When absent/unreachable, endpoints return empty structures or skip the action.
- Keep each tool independently runnable; SitePro integrates them by proxy + webhooks + shared models.

## ChatPro v2 Rebuild Spec (draft)

Goal: Replace legacy Flask widget with a modern, secure, embeddable chat that talks to SitePro only. No duplication of storage. Keep it standalone-embeddable, but SitePro remains the hub.

Architecture
- Frontend: small embeddable Web Component (or React + wrapper) served from SitePro `/widget/chat.js`; themable via data-attributes; i18n-ready.
- Backend: SitePro `/api/v1/chat` provides session + message endpoints. Stores into Mongo (or in-memory dev) and emits InteractionLog entries.
- Optional channel adapters (future): forward to VoicePro/RepairPro logic as needed.

Endpoints (SitePro)
- POST `/api/v1/chat/sessions` → {session_id, created_at, customer_id?}
- POST `/api/v1/chat/messages` → body: {session_id, text, idempotency_key?}; returns assistant message(s); links to customer/opportunity when possible.
- GET `/api/v1/chat/messages?session_id=...` → history
- POST `/api/v1/chat/identify` → {session_id, phone|email|jwt}; enriches session with customer_id
- Optional: POST `/api/v1/chat/tts` → returns audio/mpeg for assistant text (config gated)

Data models
- ChatSession: { id, created_at, customer_id?, source: 'widget'|'internal'|'social', meta }
- ChatMessage: { id, session_id, role: 'user'|'assistant', text, ts, meta }
- InteractionLog (shared): { id, channel: 'chat', thread_id: session_id, customer_id?, job_id?, message, direction, ts, meta }

Widget behavior
- Bootstrap script: `<script src="/widget/chat.js" data-api="https://api" data-brand="All Fixed" data-color="#581B98"></script>` adds floating button and panel.
- Creates session on load; sends messages with `Idempotency-Key` header; retries safe.
- Anonymous by default; if host site has MyAppliance JWT, call `/identify`.
- Accessibility: keyboard nav, ARIA, focus management; reduced motion option.

Security
- CORS: restrict widget origins via allowlist in config.
- Rate limits: per IP/session for message POSTs.
- Idempotency: enforced via existing decorator; all mutating calls include header.
- Content filters: basic profanity/PII redaction hooks.

Operational flows
- Public (anonymous): user chats, we assist; on intent to book, create Opportunity via `/api/v1/opportunities/upsert`; follow with contact request.
- Signed-in (MyAppliance): enrich session to customer_id; messages attached to InteractionLog and optionally ContactNotes.

Testing
- Unit: session/message services; identification; linking to opportunities/customers.
- Integration: widget ↔ API happy path; rate-limit/idempotency; CORS denied flows.
- E2E: headless browser loads widget, runs conversation, verifies records in DB.

Rollout
- Phase 1: Ship API + minimal widget; store logs; book via opportunities.
- Phase 2: TTS, translations, sentiment; provider-side monitoring UI.
