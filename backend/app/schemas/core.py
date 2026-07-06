import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Chat ----------
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: uuid.UUID | None = None
    mode: str = "default"


# ---------- Questions (AI fallback) ----------
class QuestionCreate(BaseModel):
    visitor_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=40)
    reason: str = Field(default="", max_length=300)
    question: str = Field(min_length=1, max_length=3000)
    session_id: uuid.UUID | None = None


class QuestionAnswer(BaseModel):
    answer: str = Field(min_length=1)


class QuestionOut(BaseModel):
    id: uuid.UUID
    visitor_name: str
    company: str
    email: str
    phone: str
    reason: str
    question: str
    context: dict
    status: str
    answer: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Contact ----------
class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=200)
    kind: str = "general"
    message: str = Field(min_length=1, max_length=5000)


class NewsletterCreate(BaseModel):
    email: EmailStr


# ---------- Analytics ----------
class EventCreate(BaseModel):
    event: str = Field(max_length=60)
    path: str | None = Field(default=None, max_length=300)
    meta: dict = {}


# ---------- Knowledge (admin) ----------
class KnowledgeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    source_type: str = "upload"
    content: str = Field(min_length=1)
    source_url: str | None = None
