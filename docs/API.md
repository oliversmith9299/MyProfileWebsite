# API Reference

Base URL: `http://localhost:8000/api/v1` · Interactive docs: `/api/docs` (Swagger) — generated from the FastAPI schema.

All visitor endpoints accept an `X-Visitor-Id` header (random hex the frontend stores in `localStorage`) used for anonymous analytics and rate limiting.

## System

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |

## Chat

| Method | Path | Description |
|---|---|---|
| POST | `/chat/stream` | RAG chat, **SSE** response |

Request: `{ "message": str, "session_id": uuid?, "mode": "default|recruiter|freelancer|founder" }`

SSE events:

| event | data | meaning |
|---|---|---|
| `meta` | `{session_id}` | session resolved/created |
| `token` | `{text}` | answer token (many) |
| `sources` | `[{title, score}]` | grounding sources for the answer |
| `unknown` | `{message}` | not confident — show the ask-Afnan form |
| `done` | `{}` | stream finished |

Rate limit: `CHAT_RATE_LIMIT_PER_MINUTE` per visitor (429).

## Questions (AI fallback)

| Method | Path | Description |
|---|---|---|
| POST | `/questions` | Capture a question the AI couldn't answer. Stores context (time, country, browser, referrer, IP) and emails the owner instantly. |

Body: `{visitor_name*, email*, question*, company, phone, reason, session_id}`

## Content (public)

| Method | Path |
|---|---|
| GET | `/content/projects` · `/content/projects/{slug}` |
| GET | `/content/experience` · `/content/certificates` · `/content/testimonials` |
| GET | `/content/blog` · `/content/blog/{slug}` |

## Engagement

| Method | Path | Description |
|---|---|---|
| POST | `/contact` | Contact request (+ owner email) |
| POST | `/newsletter` | Subscribe (idempotent) |
| POST | `/events` | Analytics event `{event, path, meta}`; `resume_download` also increments the downloads table |

## Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | `{email, password}` → `{access_token}` |
| GET | `/auth/oauth/providers` | Which OAuth providers are configured |
| GET | `/auth/oauth/{google\|github}/login` → `/callback` | Owner-only social sign-in, redirects to `/admin?token=…` |

## Admin (Bearer token required)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/questions?status=new` | Unanswered-questions inbox |
| POST | `/admin/questions/{id}/answer` | `{answer}` — marks answered **and ingests the Q&A into the knowledge base** |
| POST | `/admin/questions/{id}/dismiss` | Dismiss |
| GET | `/admin/knowledge` | Documents + chunk counts |
| POST | `/admin/knowledge` | `{title, content, source_type?, source_url?}` — chunk, embed, ingest |
| DELETE | `/admin/knowledge/{id}` | Remove document (cascades chunks) |
| GET | `/admin/contacts` | Contact requests |
| POST | `/admin/testimonials/{id}/approve` | Publish a testimonial |
| GET | `/admin/analytics/summary` | 30-day visitors/sessions/messages, unanswered count, CV downloads, top pages |
| GET | `/admin/me` | Current admin |
