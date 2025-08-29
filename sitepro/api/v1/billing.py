from __future__ import annotations

from fastapi import APIRouter, status
from sitepro.services.idempotency import idempotent
from sitepro.services.billing import list_invoices, create_or_update_invoice, record_payment, list_payments, refund_payment, list_refunds


router = APIRouter()


@router.get("/invoices", status_code=status.HTTP_200_OK)
async def invoices(customer_id: str | None = None, job_id: str | None = None, limit: int = 100):
    return await list_invoices(customer_id=customer_id, job_id=job_id, limit=limit)


@router.post("/invoice", status_code=status.HTTP_201_CREATED)
@idempotent("invoice_upsert")
async def upsert_invoice(payload: dict):
    return await create_or_update_invoice(payload)


@router.post("/payment", status_code=status.HTTP_201_CREATED)
@idempotent("payment_record")
async def payment(payload: dict):
    return await record_payment(payload)


@router.get("/payments", status_code=status.HTTP_200_OK)
async def payments(customer_id: str | None = None, invoice_id: str | None = None, limit: int = 100):
    return await list_payments(customer_id=customer_id, invoice_id=invoice_id, limit=limit)


@router.post("/refund", status_code=status.HTTP_201_CREATED)
@idempotent("refund_create")
async def refund(payload: dict):
    return await refund_payment(payload)


@router.get("/refunds", status_code=status.HTTP_200_OK)
async def refunds(payment_id: str | None = None, invoice_id: str | None = None, customer_id: str | None = None, limit: int = 100):
    return await list_refunds(payment_id=payment_id, invoice_id=invoice_id, customer_id=customer_id, limit=limit)


