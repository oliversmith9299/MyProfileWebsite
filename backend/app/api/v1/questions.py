"""Visitor questions the AI couldn't answer: capture -> notify Afnan -> knowledge base."""

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_visitor
from app.db.session import get_db
from app.models import Question, Visitor
from app.models.base import utcnow
from app.schemas.core import QuestionCreate
from app.services.email import send_email, unanswered_question_email

router = APIRouter(prefix="/questions", tags=["questions"])


@router.post("", status_code=201)
async def submit_question(
    body: QuestionCreate,
    request: Request,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    visitor: Visitor = Depends(get_or_create_visitor),
):
    q = Question(
        session_id=body.session_id,
        visitor_name=body.visitor_name,
        company=body.company,
        email=body.email,
        phone=body.phone,
        reason=body.reason,
        question=body.question,
        context={
            "time": utcnow().isoformat(),
            "country": request.headers.get("cf-ipcountry")
            or request.headers.get("x-vercel-ip-country")
            or "unknown",
            "browser": (request.headers.get("user-agent") or "")[:300],
            "referrer": request.headers.get("referer") or visitor.referrer or "",
            "ip": request.headers.get("x-real-ip")
            or (request.client.host if request.client else ""),
        },
    )
    db.add(q)
    db.commit()

    subject, html = unanswered_question_email(q)
    background.add_task(send_email, subject, html)

    return {"ok": True, "id": str(q.id)}
