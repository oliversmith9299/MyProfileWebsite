from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), default="")
    hashed_password: Mapped[str | None] = mapped_column(String(300), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="admin")  # admin | viewer
    oauth_provider: Mapped[str | None] = mapped_column(String(20), nullable=True)  # google | github
    oauth_sub: Mapped[str | None] = mapped_column(String(200), nullable=True)
