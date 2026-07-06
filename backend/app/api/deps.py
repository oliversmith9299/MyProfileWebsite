import hashlib
import uuid

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

import redis as redis_lib

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User, Visitor
from app.models.base import utcnow

bearer = HTTPBearer(auto_error=False)

_redis: redis_lib.Redis | None = None


def get_redis() -> redis_lib.Redis:
    global _redis
    if _redis is None:
        # Raises on empty/malformed URLs — callers treat Redis as best-effort
        _redis = redis_lib.Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def get_current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    email = decode_access_token(creds.credentials)
    if not email:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or user.role != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


def get_or_create_visitor(
    request: Request,
    db: Session = Depends(get_db),
    x_visitor_id: str | None = Header(default=None),
) -> Visitor:
    """Identify the anonymous visitor by the `X-Visitor-Id` header the frontend generates."""
    anon_id = (x_visitor_id or "").strip()[:64] or uuid.uuid4().hex
    visitor = db.execute(select(Visitor).where(Visitor.anon_id == anon_id)).scalar_one_or_none()
    ip = request.headers.get("x-real-ip") or (request.client.host if request.client else "")
    if visitor is None:
        visitor = Visitor(
            anon_id=anon_id,
            browser=(request.headers.get("user-agent") or "")[:300],
            referrer=(request.headers.get("referer") or "")[:500],
            ip_hash=hashlib.sha256(ip.encode()).hexdigest() if ip else None,
        )
        db.add(visitor)
    visitor.last_seen = utcnow()
    db.commit()
    return visitor


def rate_limit_chat(visitor: Visitor = Depends(get_or_create_visitor)) -> Visitor:
    count = 0
    try:
        r = get_redis()
        key = f"rl:chat:{visitor.anon_id}"
        count = r.incr(key)
        if count == 1:
            r.expire(key, 60)
    except Exception:
        return visitor  # Redis missing/down/misconfigured must never take chat down
    if count > settings.chat_rate_limit_per_minute:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Slow down a little — try again in a minute.")
    return visitor
