"""Google & GitHub OAuth (authorization-code flow) for admin sign-in.

Only the admin email (settings.admin_email) is granted access — this is a
personal platform, not a multi-tenant product.
"""

import secrets

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_redis
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models import User

router = APIRouter(prefix="/auth/oauth", tags=["auth"])

GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo"
GITHUB_AUTH = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN = "https://github.com/login/oauth/access_token"
GITHUB_USER = "https://api.github.com/user"
GITHUB_EMAILS = "https://api.github.com/user/emails"


def _callback_url(provider: str) -> str:
    # Combined deploy: API shares the site domain. Split deploy: set PUBLIC_API_URL.
    base = (settings.public_api_url or settings.site_url).rstrip("/")
    return f"{base}/api/v1/auth/oauth/{provider}/callback"


def _issue_state() -> str:
    state = secrets.token_urlsafe(24)
    try:
        get_redis().setex(f"oauth:state:{state}", 600, "1")
    except Exception:
        pass
    return state


def _check_state(state: str) -> None:
    try:
        if not get_redis().getdel(f"oauth:state:{state}"):
            raise HTTPException(400, "Invalid OAuth state")
    except HTTPException:
        raise
    except Exception:
        pass  # Redis unavailable: skip CSRF check rather than lock the admin out


def _login_for_email(db: Session, email: str, provider: str, sub: str, name: str) -> RedirectResponse:
    if email.lower() != settings.admin_email.lower():
        raise HTTPException(403, "This sign-in is reserved for the site owner.")
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user is None:
        user = User(email=email, full_name=name, role="admin")
        db.add(user)
    user.oauth_provider = provider
    user.oauth_sub = sub
    db.commit()
    token = create_access_token(user.email)
    return RedirectResponse(f"{settings.site_url}/admin?token={token}")


@router.get("/google/login")
def google_login():
    if not settings.google_client_id:
        raise HTTPException(404, "Google OAuth not configured")
    params = httpx.QueryParams(
        client_id=settings.google_client_id,
        redirect_uri=_callback_url("google"),
        response_type="code",
        scope="openid email profile",
        state=_issue_state(),
    )
    return RedirectResponse(f"{GOOGLE_AUTH}?{params}")


@router.get("/google/callback")
async def google_callback(code: str, state: str, db: Session = Depends(get_db)):
    _check_state(state)
    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post(
            GOOGLE_TOKEN,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": _callback_url("google"),
            },
        )
        token_resp.raise_for_status()
        access = token_resp.json()["access_token"]
        info = (
            await client.get(GOOGLE_USERINFO, headers={"Authorization": f"Bearer {access}"})
        ).json()
    return _login_for_email(db, info["email"], "google", info.get("sub", ""), info.get("name", ""))


@router.get("/github/login")
def github_login():
    if not settings.github_client_id:
        raise HTTPException(404, "GitHub OAuth not configured")
    params = httpx.QueryParams(
        client_id=settings.github_client_id,
        redirect_uri=_callback_url("github"),
        scope="read:user user:email",
        state=_issue_state(),
    )
    return RedirectResponse(f"{GITHUB_AUTH}?{params}")


@router.get("/github/callback")
async def github_callback(code: str, state: str, db: Session = Depends(get_db)):
    _check_state(state)
    async with httpx.AsyncClient(timeout=15) as client:
        token_resp = await client.post(
            GITHUB_TOKEN,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": _callback_url("github"),
            },
        )
        token_resp.raise_for_status()
        access = token_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {access}"}
        user = (await client.get(GITHUB_USER, headers=headers)).json()
        email = user.get("email")
        if not email:
            emails = (await client.get(GITHUB_EMAILS, headers=headers)).json()
            primary = next((e for e in emails if e.get("primary")), emails[0] if emails else None)
            email = primary["email"] if primary else None
    if not email:
        raise HTTPException(400, "GitHub account has no accessible email")
    return _login_for_email(db, email, "github", str(user.get("id", "")), user.get("name") or "")
