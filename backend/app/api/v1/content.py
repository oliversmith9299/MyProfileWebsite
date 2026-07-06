"""Public content: projects, experience, certificates, testimonials, blog."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import BlogPost, Certificate, Experience, Project, Testimonial

router = APIRouter(prefix="/content", tags=["content"])


def _project_out(p: Project) -> dict:
    return {
        "id": str(p.id),
        "slug": p.slug,
        "title": p.title,
        "tagline": p.tagline,
        "description": p.description,
        "problem": p.problem,
        "solution": p.solution,
        "period": p.period,
        "tech": p.tech,
        "metrics": p.metrics,
        "links": p.links,
        "lessons": p.lessons,
        "featured": p.featured,
    }


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.execute(select(Project).order_by(Project.sort_order)).scalars().all()
    return [_project_out(p) for p in projects]


@router.get("/projects/{slug}")
def get_project(slug: str, db: Session = Depends(get_db)):
    p = db.execute(select(Project).where(Project.slug == slug)).scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")
    return _project_out(p)


@router.get("/experience")
def list_experience(db: Session = Depends(get_db)):
    items = db.execute(select(Experience).order_by(Experience.sort_order)).scalars().all()
    return [
        {
            "id": str(e.id),
            "org": e.org,
            "role": e.role,
            "kind": e.kind,
            "start": e.start,
            "end": e.end,
            "bullets": e.bullets,
        }
        for e in items
    ]


@router.get("/certificates")
def list_certificates(db: Session = Depends(get_db)):
    items = db.execute(select(Certificate).order_by(Certificate.created_at)).scalars().all()
    return [
        {"id": str(c.id), "title": c.title, "issuer": c.issuer, "url": c.url}
        for c in items
    ]


@router.get("/testimonials")
def list_testimonials(db: Session = Depends(get_db)):
    items = (
        db.execute(select(Testimonial).where(Testimonial.approved.is_(True))).scalars().all()
    )
    return [
        {"id": str(t.id), "author": t.author, "role": t.role, "company": t.company, "quote": t.quote}
        for t in items
    ]


@router.get("/blog")
def list_posts(db: Session = Depends(get_db)):
    posts = (
        db.execute(
            select(BlogPost)
            .where(BlogPost.published_at.isnot(None))
            .order_by(BlogPost.published_at.desc())
        )
        .scalars()
        .all()
    )
    return [
        {
            "slug": p.slug,
            "title": p.title,
            "excerpt": p.excerpt,
            "reading_minutes": p.reading_minutes,
            "published_at": p.published_at.isoformat() if p.published_at else None,
        }
        for p in posts
    ]


@router.get("/blog/{slug}")
def get_post(slug: str, db: Session = Depends(get_db)):
    p = db.execute(select(BlogPost).where(BlogPost.slug == slug)).scalar_one_or_none()
    if not p or not p.published_at:
        raise HTTPException(404, "Post not found")
    return {
        "slug": p.slug,
        "title": p.title,
        "excerpt": p.excerpt,
        "body_mdx": p.body_mdx,
        "reading_minutes": p.reading_minutes,
        "published_at": p.published_at.isoformat(),
    }
