from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from uuid import uuid4

from pydantic import BaseModel, Field


class IdempotencyLog(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    key: str
    tool: str
    response: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InteractionLog(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    channel: str  # chat|voice|social|repair
    thread_id: str  # e.g., chat session id or call id
    customer_id: Optional[str] = None
    job_id: Optional[str] = None
    direction: str = "inbound"  # inbound|outbound
    message: str
    meta: Optional[dict] = None
    ts: datetime = Field(default_factory=datetime.utcnow)


class Address(BaseModel):
    address1: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = "US"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Phone(BaseModel):
    label: Optional[str] = "mobile"
    number: str
    can_text: bool = True


class Customer(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    customer_number: Optional[int]
    first_name: Optional[str]
    last_name: Optional[str]
    name: Optional[str]
    phones: List[Phone] = Field(default_factory=list)
    emails: List[str] = Field(default_factory=list)
    primary_phone: Optional[str]
    primary_email: Optional[str]
    service_address: Optional[Address]
    billing_address: Optional[Address]
    language: Optional[str] = "en"
    source: Optional[str]
    special_instructions: Optional[str]
    tax_exempt: bool = False
    is_company: bool = False
    service_locations: List[Address] = Field(default_factory=list)
    additional_contacts: List[dict] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    merged_into: Optional[str]
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Job(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    number: Optional[int]
    customer_id: str
    source: str = "voice"
    call_id: str
    appliance: Optional[dict]
    status: str = "created"  # created|scheduled|in_progress|on_hold|completed|cancelled
    display_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    service_address: Optional[Address]
    billing_address: Optional[Address]
    notes_visible_to_customer: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobNote(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    job_id: str
    author: str
    channel: str
    text: str
    ts: datetime = Field(default_factory=datetime.utcnow) 


class ContactNote(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    customer_id: str
    author: str
    text: str
    attachments: List[dict] = Field(default_factory=list)
    ts: datetime = Field(default_factory=datetime.utcnow)


class Technician(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    name: str
    skills: list[str] = Field(default_factory=list)
    active: bool = True
    location: Optional[dict]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SocialPost(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    content: str
    channels: list[str]
    status: str = "draft"  # draft|queued|posted
    created_at: datetime = Field(default_factory=datetime.utcnow)
    scheduled_at: Optional[datetime] 


class Opportunity(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    customer_id: str
    title: str
    status: str = "open"  # open|lost|won
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Invoice(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    job_id: str
    customer_id: str
    number: Optional[str]
    status: str = "unpaid"  # unpaid|paid|void
    charges: List[dict] = Field(default_factory=list)
    payments: List[str] = Field(default_factory=list)  # payment ids
    notes: Optional[str]
    terms: Optional[str]
    sent_at: Optional[datetime]
    opened_at: Optional[datetime]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Payment(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    invoice_id: str
    customer_id: str
    amount_usd: float
    method: str  # card|cash|check|ach
    collected_at: datetime = Field(default_factory=datetime.utcnow)


class Refund(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    payment_id: str
    invoice_id: Optional[str]
    customer_id: Optional[str]
    amount_usd: float
    reason: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Reminder(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    customer_id: Optional[str]
    job_id: Optional[str]
    due_at: datetime
    frequency: Optional[str]  # once|3d|15d|30d|60d
    channel: str = "email"  # email|sms
    message: Optional[str]
    created_at: datetime = Field(default_factory=datetime.utcnow)