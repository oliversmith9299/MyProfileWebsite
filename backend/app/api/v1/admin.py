"""Admin dashboard API: unanswered questions -> knowledge base, content, analytics."""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models import (
    AnalyticsEvent,
    ChatSession,
    ContactRequest,
    KnowledgeChunk,
    KnowledgeDocument,
    Message,
    Question,
    ResumeDownload,
    Testimonial,
    User,
    Visitor,
)
from app.models.base import utcnow
from app.schemas.core import KnowledgeCreate, QuestionAnswer, QuestionOut
from app.services import rag

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


# ---------- Questions ----------
@router.get("/questions", response_model=list[QuestionOut])
def list_questions(status: str | None = None, db: Session = Depends(get_db)):
    stmt = select(Question).order_by(Question.created_at.desc())
    if status:
        stmt = stmt.where(Question.status == status)
    return db.execute(stmt).scalars().all()


@router.post("/questions/{question_id}/answer")
async def answer_question(question_id: str, body: QuestionAnswer, db: Session = Depends(get_db)):
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(404, "Question not found")
    q.answer = body.answer
    q.status = "answered"
    q.answered_at = utcnow()

    # The answered Q&A becomes retrievable knowledge automatically
    await rag.ingest_document(
        db,
        title=f"Q&A: {q.question[:80]}",
        source_type="answered_question",
        texts=[f"Question: {q.question}\nAnswer: {body.answer}"],
    )
    db.commit()
    return {"ok": True}


@router.post("/questions/{question_id}/dismiss")
def dismiss_question(question_id: str, db: Session = Depends(get_db)):
    q = db.get(Question, question_id)
    if not q:
        raise HTTPException(404, "Question not found")
    q.status = "dismissed"
    db.commit()
    return {"ok": True}


# ---------- Knowledge ----------
@router.get("/knowledge")
def list_knowledge(db: Session = Depends(get_db)):
    docs = db.execute(select(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc())).scalars().all()
    counts = dict(
        db.execute(
            select(KnowledgeChunk.document_id, func.count()).group_by(KnowledgeChunk.document_id)
        ).all()
    )
    return [
        {
            "id": str(d.id),
            "title": d.title,
            "source_type": d.source_type,
            "chunks": counts.get(d.id, 0),
            "created_at": d.created_at.isoformat(),
        }
        for d in docs
    ]


@router.post("/knowledge", status_code=201)
async def add_knowledge(body: KnowledgeCreate, db: Session = Depends(get_db)):
    doc = await rag.ingest_document(
        db,
        title=body.title,
        source_type=body.source_type,
        texts=rag.chunk_text(body.content),
        source_url=body.source_url,
    )
    return {"ok": True, "id": str(doc.id)}


@router.delete("/knowledge/{doc_id}")
def delete_knowledge(doc_id: str, db: Session = Depends(get_db)):
    doc = db.get(KnowledgeDocument, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    db.delete(doc)
    db.commit()
    return {"ok": True}


# ---------- Contacts & testimonials ----------
@router.get("/contacts")
def list_contacts(db: Session = Depends(get_db)):
    items = db.execute(select(ContactRequest).order_by(ContactRequest.created_at.desc())).scalars().all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
            "company": c.company,
            "kind": c.kind,
            "message": c.message,
            "status": c.status,
            "created_at": c.created_at.isoformat(),
        }
        for c in items
    ]


@router.post("/testimonials/{testimonial_id}/approve")
def approve_testimonial(testimonial_id: str, db: Session = Depends(get_db)):
    t = db.get(Testimonial, testimonial_id)
    if not t:
        raise HTTPException(404, "Testimonial not found")
    t.approved = True
    db.commit()
    return {"ok": True}


# ---------- Analytics ----------
@router.get("/analytics/summary")
def analytics_summary(db: Session = Depends(get_db)):
    since = utcnow() - timedelta(days=30)

    def count(model, *where):
        return db.execute(select(func.count()).select_from(model).where(*where)).scalar() or 0

    top_pages = db.execute(
        select(AnalyticsEvent.path, func.count().label("n"))
        .where(AnalyticsEvent.event == "page_view", AnalyticsEvent.created_at >= since)
        .group_by(AnalyticsEvent.path)
        .order_by(func.count().desc())
        .limit(10)
    ).all()

    return {
        "visitors_30d": count(Visitor, Visitor.created_at >= since),
        "chat_sessions_30d": count(ChatSession, ChatSession.created_at >= since),
        "messages_30d": count(Message, Message.created_at >= since),
        "unanswered_questions": count(Question, Question.status == "new"),
        "contacts_new": count(ContactRequest, ContactRequest.status == "new"),
        "resume_downloads_30d": count(ResumeDownload, ResumeDownload.created_at >= since),
        "knowledge_documents": count(KnowledgeDocument),
        "top_pages": [{"path": p or "/", "views": n} for p, n in top_pages],
    }


@router.get("/me")
def me(admin: User = Depends(get_current_admin)):
    return {"email": admin.email, "name": admin.full_name, "role": admin.role}
