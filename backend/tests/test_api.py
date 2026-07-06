"""Smoke tests: app boots, seeds, and core public endpoints respond.

Requires Postgres (pgvector) + Redis, provided by docker-compose or CI services.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:  # context manager triggers lifespan (schema + seed)
        yield c


def test_health(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_projects_seeded(client):
    resp = client.get("/api/v1/content/projects")
    assert resp.status_code == 200
    slugs = {p["slug"] for p in resp.json()}
    assert {"bizify", "fentech", "exo-scan-ai"} <= slugs


def test_experience_and_certificates(client):
    assert len(client.get("/api/v1/content/experience").json()) >= 5
    assert len(client.get("/api/v1/content/certificates").json()) >= 6


def test_admin_requires_auth(client):
    assert client.get("/api/v1/admin/questions").status_code == 401


def test_admin_login_and_analytics(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": settings.admin_email, "password": settings.admin_password},
    )
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    resp = client.get(
        "/api/v1/admin/analytics/summary", headers={"Authorization": f"Bearer {token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["knowledge_documents"] >= 5


def test_chat_stream_answers_from_knowledge(client):
    resp = client.post(
        "/api/v1/chat/stream",
        json={"message": "Tell me about the Bizify project and its tech stack"},
        headers={"X-Visitor-Id": "test-visitor-1"},
    )
    assert resp.status_code == 200
    body = resp.text
    assert "event: meta" in body
    assert "event: done" in body


def test_question_capture(client):
    resp = client.post(
        "/api/v1/questions",
        json={
            "visitor_name": "Test Recruiter",
            "email": "recruiter@example.com",
            "company": "Acme AI",
            "question": "What is your notice period?",
            "reason": "hiring",
        },
        headers={"X-Visitor-Id": "test-visitor-1"},
    )
    assert resp.status_code == 201
