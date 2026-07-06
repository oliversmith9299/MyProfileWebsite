from datetime import date, datetime

from sqlalchemy import JSON, Boolean, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"

    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    tagline: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    problem: Mapped[str] = mapped_column(Text, default="")
    solution: Mapped[str] = mapped_column(Text, default="")
    period: Mapped[str] = mapped_column(String(60), default="")
    tech: Mapped[list] = mapped_column(JSON, default=list)
    metrics: Mapped[list] = mapped_column(JSON, default=list)  # [{label, value}]
    links: Mapped[dict] = mapped_column(JSON, default=dict)  # {github, demo, video}
    lessons: Mapped[list] = mapped_column(JSON, default=list)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Experience(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "experiences"

    org: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(200))
    kind: Mapped[str] = mapped_column(String(20), index=True)  # internship | work | education
    start: Mapped[str] = mapped_column(String(20), default="")
    end: Mapped[str] = mapped_column(String(20), default="")
    bullets: Mapped[list] = mapped_column(JSON, default=list)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Certificate(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "certificates"

    title: Mapped[str] = mapped_column(String(200))
    issuer: Mapped[str] = mapped_column(String(200), default="")
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    issued_on: Mapped[date | None] = mapped_column(Date, nullable=True)


class Testimonial(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "testimonials"

    author: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(200), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    quote: Mapped[str] = mapped_column(Text)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)


class BlogPost(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "blog_posts"

    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    excerpt: Mapped[str] = mapped_column(Text, default="")
    body_mdx: Mapped[str] = mapped_column(Text, default="")
    reading_minutes: Mapped[int] = mapped_column(Integer, default=5)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
