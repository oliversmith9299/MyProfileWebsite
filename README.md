# Afnan.ai — AI Personal Brand Platform

A production-grade personal brand platform for **Afnan Hany Youssef, AI Engineer** — built like a premium SaaS product, not a portfolio.

The centerpiece is an **AI twin**: a RAG-grounded chatbot that answers exactly as Afnan would, strictly from her verified knowledge base. When it doesn't know something it *never invents an answer* — it captures the visitor's details, emails Afnan instantly, and once she answers, the answer automatically becomes part of the AI's knowledge.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Framer Motion, Zustand |
| Backend | FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 |
| Data | PostgreSQL 16 + **pgvector** (embeddings), Redis (rate limiting, OAuth state) |
| AI | OpenAI (chat + `text-embedding-3-small`), strict-grounding RAG with confidence threshold |
| Email | Resend HTTP API |
| Auth | JWT (admin), optional Google & GitHub OAuth |
| Infra | Docker Compose, Nginx, GitHub Actions CI |

## Quick start

```bash
cp .env.example .env      # fill in SECRET_KEY, ADMIN_PASSWORD, OPENAI_API_KEY, RESEND_API_KEY
docker compose up --build
```

- Site: http://localhost:3000 (or http://localhost via Nginx)
- API docs (Swagger): http://localhost:8000/api/docs
- Admin dashboard: http://localhost:3000/admin (email/password from `.env`)

On first boot the backend **seeds itself** from Afnan's real CV: admin user, projects, experience, certificates, one blog post, and the RAG knowledge base (embedded into pgvector).

> **No OpenAI key?** Everything still runs: embeddings fall back to a deterministic local embedder and the chat falls back to extractive answers, so the full flow is demoable offline.

### Local development (no Docker)

```bash
# Backend — needs Postgres w/ pgvector + Redis running
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

### Assets to add

Put in `frontend/public/`: `profile.jpg` (hero photo) and `Afnan-Hany-CV.pdf` (CV download). The UI degrades gracefully until then.

## The AI assistant flow

```
visitor question
   └─► embed query ─► pgvector cosine search (top-k)
         ├─ confident (score ≥ threshold) ─► persona LLM answers, streamed via SSE, sources attached
         └─ not confident ─► "I don't know that yet, but I can ask Afnan directly."
                              └─► visitor form (name, company, email, phone, reason)
                                    ├─► instant email to Afnan (Resend) with full context
                                    ├─► stored in DB (questions table)
                                    └─► answered in admin ─► auto-ingested into knowledge base
```

Grounding is enforced twice: retrieval confidence gates the answer server-side, and the system prompt forbids the model from answering outside the provided knowledge.

## Features

- **Design**: dark-mode-first, glassmorphism, animated gradients, neural-network particle field with mouse-reactive lighting, custom cursor, loading screen, scroll-reveal storytelling, 3D-tilt project cards, reduced-motion support.
- **Visitor modes**: Recruiter / Freelance Client / Startup Founder — re-weights the hero pitch and dims non-relevant sections.
- **Command palette** (⌘K / Ctrl+K), terminal simulator, typed rotating titles, animated skill meters, journey timeline.
- **Sections**: Hero, About, Journey, Projects (with problem/solution/architecture/metrics/lessons pages), AI & Software Skills, Experience, Certificates, Services, Blog, Contact, AI Chat.
- **Admin dashboard**: analytics overview (visitors, sessions, CV downloads, top pages), unanswered questions inbox ("answer once → AI learns"), knowledge base management, contact requests.
- **Analytics**: anonymous visitor tracking (hashed IPs), page views, CTA clicks, mode switches, resume downloads.
- **SEO**: metadata templates, OpenGraph/Twitter cards, Schema.org Person JSON-LD, sitemap.xml, robots.txt.

## Repository layout

```
├── frontend/            Next.js app (src/app routes, src/components, src/lib/content.ts = all CV content)
├── backend/             FastAPI app (models, services/rag, api/v1, seed.py, alembic)
├── nginx/               Reverse proxy w/ SSE-safe config
├── docs/                ARCHITECTURE.md, API.md
├── docker-compose.yml   db (pgvector) + redis + backend + frontend + nginx
└── .github/workflows/   CI: frontend build, backend tests, docker builds
```

## Testing

```bash
cd backend && pytest          # boots the app against Postgres+Redis, tests seed, auth, RAG chat, question capture
cd frontend && npm run build  # type-checks and builds all routes
```

## Deployment

- **Everything on Railway (recommended, single platform)**: one project with managed Postgres (pgvector) + Redis + the two Dockerfiles — see [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md).
- Or split: frontend → Vercel, backend → Railway/VPS.
- Or a single VPS with `docker compose up -d` behind the included Nginx.

The AI works with **any OpenAI-compatible provider** — set `OPENAI_BASE_URL` (e.g. DeepInfra: `https://api.deepinfra.com/v1/openai` with `meta-llama/Llama-3.3-70B-Instruct-Turbo` + `BAAI/bge-m3` embeddings) or leave it empty for OpenAI.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/API.md](docs/API.md) for details.
