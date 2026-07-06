"""AI chat with strict RAG grounding, streamed over Server-Sent Events.

Event protocol:
  event: meta     -> {"session_id": ...}
  event: token    -> {"text": "..."}         (many)
  event: sources  -> [{"title": ..., "score": ...}]
  event: unknown  -> {"message": "..."}      (assistant is not confident; frontend shows the ask-Afnan form)
  event: done     -> {}
"""

import json
import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import rate_limit_chat
from app.db.session import get_db
from app.models import ChatSession, Message, Visitor
from app.schemas.core import ChatRequest
from app.services import llm, rag

router = APIRouter(prefix="/chat", tags=["chat"])

UNKNOWN_MESSAGE = "I don't know that yet, but I can ask Afnan directly."


def _sse(event: str, data) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    db: Session = Depends(get_db),
    visitor: Visitor = Depends(rate_limit_chat),
):
    # Resolve or create the session
    session = None
    if body.session_id:
        session = db.get(ChatSession, body.session_id)
    if session is None:
        session = ChatSession(visitor_id=visitor.id, mode=body.mode)
        db.add(session)
        db.commit()

    history = [
        {"role": m.role, "content": m.content}
        for m in db.execute(
            select(Message).where(Message.session_id == session.id).order_by(Message.created_at)
        ).scalars()
    ]

    db.add(Message(session_id=session.id, role="user", content=body.message))
    db.commit()

    chunks = await rag.retrieve(db, body.message)
    confident = rag.is_confident(chunks)
    session_id = str(session.id)

    async def generate():
        yield _sse("meta", {"session_id": session_id})

        if not confident:
            db.add(
                Message(
                    session_id=uuid.UUID(session_id),
                    role="assistant",
                    content=UNKNOWN_MESSAGE,
                    grounded=False,
                )
            )
            db.commit()
            yield _sse("unknown", {"message": UNKNOWN_MESSAGE})
            yield _sse("done", {})
            return

        parts: list[str] = []
        async for token in llm.stream_answer(body.message, chunks, history):
            parts.append(token)
            yield _sse("token", {"text": token})

        answer = "".join(parts)
        # The model may itself decide it can't answer from the knowledge — honor that path too
        grounded = UNKNOWN_MESSAGE.lower() not in answer.lower()
        sources = [
            {"title": c.document_title, "score": round(c.score, 3)} for c in chunks[:3]
        ]
        db.add(
            Message(
                session_id=uuid.UUID(session_id),
                role="assistant",
                content=answer,
                grounded=grounded,
                sources=sources if grounded else [],
            )
        )
        db.commit()

        if grounded:
            yield _sse("sources", sources)
        else:
            yield _sse("unknown", {"message": UNKNOWN_MESSAGE})
        yield _sse("done", {})

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
