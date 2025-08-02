from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class IdempotencyLog(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    key: str
    tool: str
    response: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Customer(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    name: Optional[str]
    phone: str
    email: Optional[str]
    address: Optional[str]
    language: Optional[str] = "en"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Job(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    customer_id: str
    source: str = "voice"
    call_id: str
    appliance: Optional[dict]
    status: str = "created"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobNote(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: uuid4().hex)
    job_id: str
    author: str
    channel: str
    text: str
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