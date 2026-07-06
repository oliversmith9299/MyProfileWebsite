import uuid

from sqlalchemy import JSON, Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin


class ChatSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "chat_sessions"

    visitor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    mode: Mapped[str] = mapped_column(String(20), default="default")  # recruiter | freelancer | founder | default

    messages: Mapped[list["Message"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Message.created_at"
    )


class Message(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_sessions.id", ondelete="CASCADE"), index=True
    )
    role: Mapped[str] = mapped_column(String(12))  # user | assistant
    content: Mapped[str] = mapped_column(Text)
    grounded: Mapped[bool] = mapped_column(Boolean, default=True)  # False => "I don't know" path
    sources: Mapped[list] = mapped_column(JSON, default=list)  # [{chunk_id, title, score}]

    session: Mapped[ChatSession] = relationship(back_populates="messages")
