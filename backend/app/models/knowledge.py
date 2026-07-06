import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.models.base import Base, TimestampMixin, UUIDMixin


class KnowledgeDocument(Base, UUIDMixin, TimestampMixin):
    """A logical source: the CV, a project write-up, an answered visitor question, an upload."""

    __tablename__ = "knowledge_documents"

    title: Mapped[str] = mapped_column(String(300))
    source_type: Mapped[str] = mapped_column(String(30), index=True)  # cv | project | faq | answered_question | upload | link
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    chunks: Mapped[list["KnowledgeChunk"]] = relationship(
        back_populates="document", cascade="all, delete-orphan"
    )


class KnowledgeChunk(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "knowledge_chunks"

    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("knowledge_documents.id", ondelete="CASCADE"), index=True
    )
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(settings.embedding_dim))
    meta: Mapped[dict] = mapped_column(JSON, default=dict)

    document: Mapped[KnowledgeDocument] = relationship(back_populates="chunks")
