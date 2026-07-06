"""Contact requests, newsletter, analytics events, resume downloads."""

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.api.deps import get_or_create_visitor
from app.db.session import get_db
from app.models import AnalyticsEvent, ContactRequest, NewsletterSubscriber, ResumeDownload, Visitor
from app.schemas.core import ContactCreate, EventCreate, NewsletterCreate
from app.services.email import send_email

router = APIRouter(tags=["engagement"])


@router.post("/contact", status_code=201)
async def create_contact(
    body: ContactCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
):
    req = ContactRequest(
        name=body.name, email=body.email, company=body.company, kind=body.kind, message=body.message
    )
    db.add(req)
    db.commit()
    html = (
        f"<h2>New {body.kind} request</h2>"
        f"<p><b>{body.name}</b> ({body.email}) — {body.company or 'no company'}</p>"
        f"<p>{body.message}</p>"
    )
    background.add_task(send_email, f"New contact request from {body.name}", html)
    return {"ok": True}


@router.post("/newsletter", status_code=201)
def subscribe(body: NewsletterCreate, db: Session = Depends(get_db)):
    stmt = (
        pg_insert(NewsletterSubscriber)
        .values(email=body.email)
        .on_conflict_do_nothing(index_elements=["email"])
    )
    db.execute(stmt)
    db.commit()
    return {"ok": True}


@router.post("/events", status_code=201)
def track_event(
    body: EventCreate,
    db: Session = Depends(get_db),
    visitor: Visitor = Depends(get_or_create_visitor),
):
    db.add(AnalyticsEvent(visitor_id=visitor.id, event=body.event, path=body.path, meta=body.meta))
    if body.event == "resume_download":
        db.add(ResumeDownload(visitor_id=visitor.id, source_page=body.path))
    db.commit()
    return {"ok": True}
