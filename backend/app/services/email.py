"""Transactional email via the Resend HTTP API (no SDK dependency)."""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"


async def send_email(subject: str, html: str, to: str | None = None) -> bool:
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — email '%s' not sent (logged only).", subject)
        logger.info("Email body:\n%s", html)
        return False
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            RESEND_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.from_email,
                "to": [to or settings.notify_email],
                "subject": subject,
                "html": html,
            },
        )
    if resp.status_code >= 300:
        logger.error("Resend error %s: %s", resp.status_code, resp.text)
        return False
    return True


def unanswered_question_email(q) -> tuple[str, str]:
    """Build (subject, html) for the 'AI couldn't answer' notification."""
    ctx = q.context or {}
    rows = [
        ("Visitor Name", q.visitor_name),
        ("Company", q.company or "—"),
        ("Email", q.email),
        ("Phone", q.phone or "—"),
        ("Reason", q.reason or "—"),
        ("Question", q.question),
        ("Time", ctx.get("time", "—")),
        ("Country", ctx.get("country", "—")),
        ("Browser", ctx.get("browser", "—")),
        ("Referral page", ctx.get("referrer", "—")),
        ("IP", ctx.get("ip", "—")),
    ]
    table = "".join(
        f"<tr><td style='padding:8px 16px;color:#888;font-size:13px'>{k}</td>"
        f"<td style='padding:8px 16px;font-size:14px'>{v}</td></tr>"
        for k, v in rows
    )
    html = f"""
    <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto">
      <h2 style="font-weight:600">🤖 Your AI needs you</h2>
      <p>A visitor asked something the assistant couldn't answer. Answer it in the
      <a href="{settings.site_url}/admin">admin dashboard</a> and it becomes part of the knowledge base automatically.</p>
      <table style="border-collapse:collapse;width:100%;background:#fafafa;border-radius:12px">{table}</table>
    </div>
    """
    return "Someone asked something your AI couldn't answer", html
