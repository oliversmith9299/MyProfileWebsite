import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Question(Base, UUIDMixin, TimestampMixin):
    """A visitor question the AI couldn't answer. Answering it feeds the knowledge base."""

    __tablename__ = "questions"

    session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True
    )
    visitor_name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(320))
    phone: Mapped[str] = mapped_column(String(40), default="")
    reason: Mapped[str] = mapped_column(String(300), default="")
    question: Mapped[str] = mapped_column(Text)
    context: Mapped[dict] = mapped_column(JSON, default=dict)  # {country, browser, referrer, ip, time}
    status: Mapped[str] = mapped_column(String(20), default="new", index=True)  # new | answered | dismissed
    answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    answered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ContactRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "contact_requests"

    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(320))
    company: Mapped[str] = mapped_column(String(200), default="")
    kind: Mapped[str] = mapped_column(String(30), default="general")  # hire | freelance | consulting | general
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="new")  # new | replied | archived


class NewsletterSubscriber(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)


class ResumeDownload(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "resume_downloads"

    visitor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitors.id", ondelete="SET NULL"), nullable=True
    )
    source_page: Mapped[str | None] = mapped_column(String(300), nullable=True)
