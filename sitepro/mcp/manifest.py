def get_manifest() -> dict:
    """Return MCP tool manifest v0.1. Future versions can load JSON from file."""
    return {
        "service": "SitePro",
        "version": "0.1",
        "description": "Central hub for customer, job, inventory & analytics data.",
        "tools": [
            {"name": "create_job_from_voice", "path": "/api/v1/voice/create_job_from_voice"},
            {"name": "append_note", "path": "/api/v1/voice/append_note"},
            {"name": "schedule_tech", "path": "/api/v1/voice/schedule_tech"},
            {"name": "update_job_status", "path": "/api/v1/voice/update_job_status"},
            {"name": "get_diagnostic_fee", "path": "/api/v1/voice/get_diagnostic_fee"},
            {"name": "create_job_from_chat", "path": "/api/v1/chat/create_job_from_chat"},
            {"name": "append_chat_note", "path": "/api/v1/chat/append_chat_note"},
            {"name": "escalate", "path": "/api/v1/chat/escalate"},
            {"name": "triage_suggest", "path": "/api/v1/repair/triage_suggest"},
            {"name": "dispatch_suggest", "path": "/api/v1/repair/dispatch_suggest"},
            {"name": "parts_forecast", "path": "/api/v1/repair/parts_forecast"},
            {"name": "generate_post", "path": "/api/v1/social/generate_post"},
            {"name": "publish_post", "path": "/api/v1/social/publish_post"},
            {"name": "queue_status", "path": "/api/v1/social/queue_status"}
        ]
    } 