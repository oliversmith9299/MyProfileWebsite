# Architecture

## System overview

```
                         ┌─────────────────────────────────────────────┐
                         │                   Nginx :80                 │
                         │   /api/* → backend      /* → frontend      │
                         │   (SSE-safe: buffering off for /api)        │
                         └───────────┬─────────────────┬───────────────┘
                                     │                 │
                     ┌───────────────▼──────┐   ┌──────▼───────────────┐
                     │   FastAPI :8000      │   │   Next.js :3000      │
                     │  ────────────────    │   │  ──────────────      │
                     │  api/v1/chat  (SSE)  │   │  App Router, SSR     │
                     │  api/v1/questions    │   │  content from        │
                     │  api/v1/auth+oauth   │   │  src/lib/content.ts  │
                     │  api/v1/content      │   │  chat + admin call   │
                     │  api/v1/admin        │   │  the API directly    │
                     │  api/v1/events       │   └──────────────────────┘
                     └──┬───────┬───────┬───┘
                        │       │       │
              ┌─────────▼──┐ ┌──▼────┐ ┌▼─────────────┐
              │ PostgreSQL │ │ Redis │ │ External     │
              │ + pgvector │ │       │ │ OpenAI       │
              │ 16 tables  │ │ rate  │ │ Resend email │
              │ embeddings │ │ limit │ │ OAuth (G/GH) │
              └────────────┘ └───────┘ └──────────────┘
```

## RAG pipeline (the core)

1. **Ingestion** (`services/rag.ingest_document`): text → paragraph-boundary chunks (≤900 chars) → embeddings (`text-embedding-3-small`, 1536-dim) → `knowledge_chunks.embedding` (pgvector).
2. **Retrieval** (`services/rag.retrieve`): query embedding → cosine-distance `ORDER BY` in Postgres → top-k chunks with similarity scores.
3. **Confidence gate** (`rag.is_confident`): if the best score < `RAG_CONFIDENCE_THRESHOLD` (default 0.32) the assistant does **not** call the LLM to improvise — it returns the exact fallback string and the frontend opens the ask-Afnan form.
4. **Generation** (`services/llm.stream_answer`): persona system prompt embeds the retrieved chunks and hard rules ("answer ONLY from KNOWLEDGE"); tokens stream back over SSE. The saved assistant message stores its source chunks for the UI's source pills.
5. **Learning loop**: admin answers a captured question → `ingest_document(source_type="answered_question")` → immediately retrievable.

**No-key fallback**: without `OPENAI_API_KEY`, embeddings use a deterministic hashed bag-of-words vector and generation is extractive (returns the best chunk). Retrieval quality drops but every flow — including the unknown-question capture — works, which keeps CI and local demos independent of external services.

## Database schema (16 tables, normalized)

| Domain | Tables |
|---|---|
| Identity | `users` (admin, OAuth-linkable) |
| Visitors & analytics | `visitors` (anon id, hashed IP), `analytics_events`, `resume_downloads` |
| Chat | `chat_sessions`, `messages` (grounded flag + sources JSON) |
| Knowledge | `knowledge_documents` (source_type: cv/project/faq/answered_question/upload/link), `knowledge_chunks` (Vector column) |
| Content | `projects`, `experiences`, `certificates`, `testimonials`, `blog_posts` |
| Engagement | `questions` (AI-unknown capture w/ context JSON), `contact_requests`, `newsletter_subscribers` |

UUID primary keys everywhere; `created_at` timestamps; FKs with `CASCADE`/`SET NULL` as appropriate.

## Security

- JWT (HS256) for admin; password hashing with PBKDF2-SHA256.
- OAuth (Google/GitHub) restricted to the owner's email — this is a single-tenant platform.
- Redis-backed per-visitor chat rate limiting (fails open if Redis is down).
- IPs stored only as SHA-256 hashes in `visitors`; raw IP appears only in the owner-notification email context.
- CORS locked to configured origins; admin routes behind a router-level dependency.

## Frontend architecture

- **Content**: `src/lib/content.ts` is the single typed source of truth (mirrored by the backend seed for the RAG knowledge base). Static content renders even if the API is down; the API powers chat, forms, analytics, admin.
- **Modes**: a Zustand store; `Section` dims sections not highlighted by the active mode, `Hero` swaps its pitch.
- **Effects**: canvas-2D particle field (chosen over Three.js: same visual language, ~0 dependency weight, better low-end performance), springs/parallax via Framer Motion, custom cursor gated on `(pointer: fine)` and `prefers-reduced-motion`.
- **Performance**: standalone Next output, static generation for all content routes, animations on transform/opacity only, `once: true` viewport reveals, capped particle count and devicePixelRatio.

## Operational notes

- Migrations: Alembic; revision `0001` bootstraps the full schema from ORM metadata (plus `CREATE EXTENSION vector`); later changes via `alembic revision --autogenerate`.
- The app's lifespan hook also runs `create_all` + seed idempotently, so dev and CI need no manual steps.
- Email is sent via FastAPI `BackgroundTasks` (fire-and-forget with logging fallback when `RESEND_API_KEY` is absent).
