from __future__ import annotations

from datetime import datetime, timedelta

from sitepro.services.db import get_db


async def get_summary(range: str = "month_to_date") -> dict:
    db = get_db()

    # Basic time ranges (very rough for dev/testing)
    now = datetime.utcnow()
    if range == "today":
        start = datetime(now.year, now.month, now.day)
    elif range == "week_to_date":
        start = now - timedelta(days=now.weekday())
        start = datetime(start.year, start.month, start.day)
    elif range == "last_30":
        start = now - timedelta(days=30)
    else:  # month_to_date
        start = datetime(now.year, now.month, 1)

    # In dev fallback we can't aggregate sums; return counts and placeholders
    try:
        jobs = await db.jobs.find({}).to_list(length=10000)
    except Exception:
        jobs = []
    try:
        payments = await db.payments.find({}).to_list(length=10000)
    except Exception:
        payments = []

    jobs_completed = sum(1 for j in jobs if (j.get("status") == "completed"))
    scheduled_count = sum(1 for j in jobs if (j.get("status") == "scheduled"))
    new_customers = 0  # could compute by created_at >= start if present
    total_payments = sum(float(p.get("amount_usd", 0)) for p in payments)

    return {
        "revenuePace": "$0.00",
        "revenuePaceDelta": "+0%",
        "jobsCompleted": str(jobs_completed),
        "jobsCompletedDelta": "+0%",
        "newCustomers": str(new_customers),
        "newCustomersDelta": "+0%",
        "totalPayments": f"${total_payments:.2f}",
        "totalPaymentsDelta": "+0%",
        "totalRevenue": "$0.00",
        "arTotal": "$0.00",
        "scheduledCount": scheduled_count,
        "events": [{"time": "10:00-12:00", "title": j.get("customer_name") or j.get("_id"), "sub": j.get("status") } for j in jobs if j.get("status") == "scheduled"][:5],
    }


