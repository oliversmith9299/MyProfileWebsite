"""Retrieval-augmented generation over the pgvector knowledge base."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import KnowledgeChunk, KnowledgeDocument
from app.services.embeddings import embed_text, embed_texts


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_title: str
    content: str
    score: float  # cosine similarity in [0, 1]


async def retrieve(db: Session, query: str, top_k: int | None = None) -> list[RetrievedChunk]:
    query_vec = await embed_text(query)
    distance = KnowledgeChunk.embedding.cosine_distance(query_vec)
    rows = db.execute(
        select(KnowledgeChunk, KnowledgeDocument.title, distance.label("distance"))
        .join(KnowledgeDocument, KnowledgeChunk.document_id == KnowledgeDocument.id)
        .order_by(distance)
        .limit(top_k or settings.rag_top_k)
    ).all()
    return [
        RetrievedChunk(
            chunk_id=str(chunk.id),
            document_title=title,
            content=chunk.content,
            score=max(0.0, 1.0 - dist),
        )
        for chunk, title, dist in rows
    ]


def is_confident(chunks: list[RetrievedChunk]) -> bool:
    """The assistant only answers when retrieval is confident enough — never hallucinate.

    The configured threshold is calibrated for OpenAI embeddings; the local hashing
    fallback produces systematically lower cosine scores, so it gets a lower bar.
    """
    threshold = settings.rag_confidence_threshold if settings.openai_api_key else 0.12
    return bool(chunks) and chunks[0].score >= threshold


async def ingest_document(
    db: Session,
    *,
    title: str,
    source_type: str,
    texts: list[str],
    source_url: str | None = None,
    meta: dict | None = None,
) -> KnowledgeDocument:
    """Create a knowledge document and embed its chunks."""
    doc = KnowledgeDocument(title=title, source_type=source_type, source_url=source_url)
    db.add(doc)
    db.flush()
    vectors = await embed_texts(texts)
    for text, vec in zip(texts, vectors):
        db.add(KnowledgeChunk(document_id=doc.id, content=text, embedding=vec, meta=meta or {}))
    db.commit()
    return doc


def chunk_text(text: str, max_chars: int = 900) -> list[str]:
    """Split long text on paragraph boundaries into embedding-sized chunks."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: list[str] = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 2 <= max_chars:
            current = f"{current}\n\n{p}".strip()
        else:
            if current:
                chunks.append(current)
            current = p[:max_chars]
    if current:
        chunks.append(current)
    return chunks
