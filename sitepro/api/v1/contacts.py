from __future__ import annotations

from fastapi import APIRouter, Query, status, Body, File
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import re
from sitepro.services.idempotency import idempotent
from sitepro.services.customers import list_customers, get_customer, upsert_customer, merge_customers, deactivate_customer, delete_customer
from sitepro.services.notes import append_contact_note
from fastapi.responses import StreamingResponse
import csv
import io


router = APIRouter()


def _escape_regex(text: str) -> str:
    # Prevents regex DoS and injection by escaping all metacharacters
    # and limiting length
    text = (text or "")[:64]
    return re.escape(text)


@router.get("/list", status_code=status.HTTP_200_OK)
async def list_contacts(q: str | None = Query(default=None), limit: int = 100, skip: int = 0):
    try:
        query = {}
        limit = max(1, min(limit, 100))
        skip = max(0, skip)
        if q:
            safe = _escape_regex(q)
            query = {
                "$or": [
                    {"name": {"$regex": safe, "$options": "i"}},
                    {"first_name": {"$regex": safe, "$options": "i"}},
                    {"last_name": {"$regex": safe, "$options": "i"}},
                    {"emails": {"$elemMatch": {"$regex": safe, "$options": "i"}}},
                    {"phones.number": {"$regex": safe, "$options": "i"}},
                ]
            }
        return await list_customers(query, limit=limit, skip=skip)
    except Exception:
        return {"items": []}


@router.get("/{customer_id}", status_code=status.HTTP_200_OK)
async def get_contact(customer_id: str):
    return await get_customer(customer_id)


class PhoneIn(BaseModel):
    label: Optional[str] = Field(default="mobile", max_length=32)
    number: str = Field(min_length=3, max_length=32)
    can_text: bool = True


class AddressIn(BaseModel):
    address1: Optional[str] = Field(default=None, max_length=128)
    address2: Optional[str] = Field(default=None, max_length=128)
    city: Optional[str] = Field(default=None, max_length=64)
    state: Optional[str] = Field(default=None, max_length=64)
    zip_code: Optional[str] = Field(default=None, max_length=16)
    country: Optional[str] = Field(default="US", max_length=2)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ContactUpsert(BaseModel):
    id: Optional[str] = None
    customer_number: Optional[int] = None
    first_name: Optional[str] = Field(default=None, max_length=64)
    last_name: Optional[str] = Field(default=None, max_length=64)
    name: Optional[str] = Field(default=None, max_length=160)
    phones: List[PhoneIn] = Field(default_factory=list)
    emails: List[EmailStr] = Field(default_factory=list)
    primary_phone: Optional[str] = Field(default=None, max_length=32)
    primary_email: Optional[EmailStr] = None
    service_address: Optional[AddressIn] = None
    billing_address: Optional[AddressIn] = None
    source: Optional[str] = Field(default=None, max_length=64)
    special_instructions: Optional[str] = Field(default=None, max_length=2000)
    tax_exempt: bool = False
    is_company: bool = False
    service_locations: List[AddressIn] = Field(default_factory=list)
    additional_contacts: List[dict] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    idempotency_key: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "phones": [{"number": "555-1234", "can_text": True}],
                "emails": ["john@example.com"],
                "service_address": {"country": "US"},
                "billing_address": {"country": "US"}
            }
        }


@router.post("/upsert", status_code=status.HTTP_201_CREATED)
async def upsert_contact(payload: ContactUpsert = Body(...)):
    return await upsert_customer(payload.model_dump(exclude_none=True))


class MergePayload(BaseModel):
    primary_id: str
    duplicate_id: str


@router.post("/merge", status_code=status.HTTP_200_OK)
@idempotent("merge_customer")
async def merge_contact(payload: MergePayload = Body(...)):
    return await merge_customers(payload.primary_id, payload.duplicate_id)


class IdPayload(BaseModel):
    customer_id: str


@router.post("/deactivate", status_code=status.HTTP_200_OK)
@idempotent("deactivate_customer")
async def deactivate_contact(payload: IdPayload = Body(...)):
    return await deactivate_customer(payload.customer_id)


@router.post("/delete", status_code=status.HTTP_200_OK)
@idempotent("delete_customer")
async def delete_contact_route(payload: IdPayload = Body(...)):
    return await delete_customer(payload.customer_id)


class MessagePayload(BaseModel):
    customer_id: str
    email: bool = True
    sms: bool = False
    subject: Optional[str] = Field(default=None, max_length=200)
    body: str = Field(min_length=1, max_length=5000)


@router.post("/message", status_code=status.HTTP_200_OK)
@idempotent("send_contact_message")
async def send_contact_message(payload: MessagePayload):
    # In production, look up the contact and send via mailer/SMS provider.
    from sitepro.services.db import get_db

    db = get_db()
    cust = await db.customers.find_one({"_id": payload.customer_id})
    if not cust:
        return {"sent": False, "error": "not_found"}

    recipients = {
        "emails": cust.get("emails", []) if payload.email else [],
        "phones": [p.get("number") for p in cust.get("phones", []) if payload.sms and p.get("can_text")],
    }
    # Log message to contact_messages for history in dev/testing
    try:
        await db.contact_messages.insert_one({
            "customer_id": payload.customer_id,
            "channels": {"email": payload.email, "sms": payload.sms},
            "subject": payload.subject,
            "body": payload.body,
            "recipients": recipients,
            "ts": __import__("datetime").datetime.utcnow(),
        })
    except Exception:
        pass
    # Return stub response; do not echo content in logs in production
    return {"sent": True, "recipients": recipients}


@router.get("/messages", status_code=status.HTTP_200_OK)
async def list_contact_messages(customer_id: str, limit: int = 100):
    from sitepro.services.db import get_db
    db = get_db()
    try:
        cursor = db.contact_messages.find({"customer_id": customer_id}).sort("ts", -1).limit(min(max(1, limit), 1000))
        items = await cursor.to_list(length=limit)
        return {"items": items}
    except Exception:
        return {"items": []}


class ContactNoteIn(BaseModel):
    customer_id: str
    author: str = Field(default="user", max_length=64)
    text: str = Field(min_length=1, max_length=4000)


@router.post("/notes/add", status_code=status.HTTP_201_CREATED)
@idempotent("contact_note_add")
async def add_contact_note(payload: ContactNoteIn):
    return await append_contact_note(payload.customer_id, payload.author, payload.text)



@router.get("/export", status_code=status.HTTP_200_OK)
async def export_contacts(format: str = Query(default="csv"), limit: int = 1000):
    # Export contacts as CSV; suitable for spreadsheets
    res = await list_customers({}, limit=min(max(1, limit), 10000), skip=0)
    items = res.get("items", [])
    output = io.StringIO()
    writer = csv.writer(output)
    headers = [
        "id",
        "customer_number",
        "name",
        "first_name",
        "last_name",
        "primary_phone",
        "primary_email",
        "address1",
        "address2",
        "city",
        "state",
        "zip_code",
        "country",
        "tags",
    ]
    writer.writerow(headers)
    for it in items:
        addr = (it.get("service_address") or {})
        writer.writerow([
            it.get("_id"),
            it.get("customer_number"),
            it.get("name"),
            it.get("first_name"),
            it.get("last_name"),
            it.get("primary_phone"),
            it.get("primary_email"),
            addr.get("address1"),
            addr.get("address2"),
            addr.get("city"),
            addr.get("state"),
            addr.get("zip_code"),
            addr.get("country"),
            ";".join(it.get("tags", [])),
        ])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=contacts.csv"})


@router.post("/import", status_code=status.HTTP_200_OK)
async def import_contacts(file: bytes = File(description="CSV file", media_type="text/csv")):
    """Import contacts from CSV.

    Supports our native headers and Kickserv-like exports. We attempt to map
    commonly used column names automatically and sanitize phone/email values.
    """
    # file provided as raw bytes to avoid UploadFile typing issues on some setups
    text = file.decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(text))

    def norm(key: str) -> str:
        return re.sub(r"[^a-z0-9]", "", (key or "").lower())

    def sanitize_phone(p: str | None) -> str | None:
        if not p:
            return None
        s = str(p)
        # strip everything except digits and leading +
        s = re.sub(r"\s", "", s)
        s = re.sub(r"(?i)x.*$", "", s)  # drop extensions like 5551234x
        digits = re.sub(r"[^0-9+]", "", s)
        return digits or None

    imported = 0
    errors: list[dict] = []
    for idx, row in enumerate(reader):
        try:
            row_map = {norm(k): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

            def getv(keys: list[str]) -> str | None:
                for k in keys:
                    v = row_map.get(k)
                    if v is not None and str(v).strip() != "":
                        return str(v).strip()
                return None

            customer_number = getv(["customernumber"]) or getv(["customer#"])  # loose mapping

            # Names
            name = getv(["name"]) or None
            first = getv(["first_name", "firstname", "primarycontactfirstname"]) or None
            last = getv(["last_name", "lastname", "primarycontactlastname"]) or None
            # If name is "Last, First" and first/last missing, parse it
            if name and not (first or last) and "," in name:
                parts = [p.strip() for p in name.split(",", 1)]
                if len(parts) == 2:
                    last = parts[0] or last
                    first = parts[1] or first

            # Emails (prefer explicit primary, then any)
            email_primary = getv(["primary_email", "emailaddress", "email"]) or None
            emails = []
            if email_primary:
                emails.append(email_primary)

            # Phones: prefer notification phone, then mobile, phone, alt
            phone_candidates = [
                getv(["notificationphonenumber", "notificationphone", "notifyphone"]),
                getv(["mobile", "cell", "cellphone", "mobilephone"]),
                getv(["phone", "phonenumber"]),
                getv(["altphone", "alternatephone", "homephone"]),
            ]
            phones_list = []
            primary_phone = None
            for raw in phone_candidates:
                sp = sanitize_phone(raw)
                if sp and sp not in [p["number"] for p in phones_list]:
                    phones_list.append({"number": sp, "can_text": True})
                    if not primary_phone:
                        primary_phone = sp

            # Address (Kickserv: Service Address/City/State/Zip Code)
            addr1 = getv(["serviceaddress", "address1"]) or None
            addr2 = getv(["address2"]) or None
            city = getv(["servicecity", "city"]) or None
            state = getv(["servicestate", "state"]) or None
            zip_code = getv(["servicezipcode", "zipcode", "zip"]) or None
            country = getv(["country"]) or "US"
            service_address = {
                "address1": addr1,
                "address2": addr2,
                "city": city,
                "state": state,
                "zip_code": zip_code,
                "country": country,
            }
            if not any(service_address.values()):
                service_address = None

            payload = {
                "customer_number": customer_number,
                "name": name,
                "first_name": first,
                "last_name": last,
                "primary_phone": primary_phone,
                "primary_email": email_primary,
                "phones": phones_list,
                "emails": emails,
                "service_address": service_address,
                "tags": [],
            }
            # Fallback for display name
            if not payload.get("name") and (last or first):
                if last and first:
                    payload["name"] = f"{last}, {first}"
                else:
                    payload["name"] = last or first

            await upsert_customer(payload)
            imported += 1
        except Exception as e:
            errors.append({"row": idx + 2, "error": str(e)})  # +2 accounts for header + 1-index
    return {"imported": imported, "errors": errors}

