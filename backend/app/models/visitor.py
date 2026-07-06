import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin, utcnow


class Visitor(Base, UUIDMixin, TimestampMixin):
    """One row per anonymous browser (cookie `vid`). PII-light by design."""

    __tablename__ = "visitors"

    anon_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    browser: Mapped[str | None] = mapped_column(String(300), nullable=True)  # user-agent
    referrer: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AnalyticsEvent(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "analytics_events"

    visitor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event: Mapped[str] = mapped_column(String(60), index=True)  # page_view | resume_download | chat_message | mode_switch | ...
    path: Mapped[str | None] = mapped_column(String(300), nullable=True)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
