# Deploy everything on Railway (single platform)

You do **not** need Vercel + a separate backend host. One Railway project runs the whole platform as 4 services:

```
Railway project "afnan-ai"
├── Postgres   (Railway managed — includes pgvector)
├── Redis      (Railway managed)
├── backend    (backend/Dockerfile)
└── frontend   (frontend/Dockerfile)
```

Nginx is not needed on Railway — each service gets its own HTTPS domain.

## 1. Push the repo to GitHub

```bash
git init && git add . && git commit -m "AI brand platform"
git branch -M main
git remote add origin https://github.com/<you>/afnan-ai.git
git push -u origin main
```

`.env` is gitignored — secrets go into Railway variables instead.

## 2. Create the databases

In a new Railway project: **New → Database → PostgreSQL**, then **New → Database → Redis**.

The backend runs `CREATE EXTENSION IF NOT EXISTS vector` on boot, and Railway's Postgres image ships with pgvector, so no manual step.

## 3. Backend service

**New → GitHub Repo** → pick the repo → set **Root Directory = `backend`** (Railway auto-detects the Dockerfile; the container honors Railway's injected `$PORT`).

Variables (Service → Variables):

```
DATABASE_URL   = ${{Postgres.DATABASE_URL}}        ← reference, auto-normalized to psycopg by the app
REDIS_URL      = ${{Redis.REDIS_URL}}
SECRET_KEY     = <long random string>
ADMIN_EMAIL    = afnanhany18@gmail.com
ADMIN_PASSWORD = <strong password>

OPENAI_API_KEY = <your DeepInfra key>
OPENAI_BASE_URL = https://api.deepinfra.com/v1/openai
CHAT_MODEL     = meta-llama/Llama-3.3-70B-Instruct-Turbo
EMBEDDING_MODEL = BAAI/bge-m3
EMBEDDING_DIM  = 1024
RAG_CONFIDENCE_THRESHOLD = 0.45

RESEND_API_KEY = <resend key>          (optional but recommended)
NOTIFY_EMAIL   = afnanhany18@gmail.com
FROM_EMAIL     = onboarding@resend.dev (or your verified domain sender)

SITE_URL       = https://<frontend-domain>          (set after step 4)
CORS_ORIGINS   = https://<frontend-domain>
```

Then **Settings → Networking → Generate Domain** → note it, e.g. `afnan-api.up.railway.app`.
First boot runs migrations and seeds the CV knowledge base automatically.

## 4. Frontend service

**New → GitHub Repo** (same repo) → **Root Directory = `frontend`**.

Variables (available as Docker build args automatically):

```
NEXT_PUBLIC_API_URL  = https://afnan-api.up.railway.app
NEXT_PUBLIC_SITE_URL = https://<this service's domain>
```

Generate its domain, then go back to the backend and fill in `SITE_URL` / `CORS_ORIGINS` with it (variable changes trigger a redeploy — changing `NEXT_PUBLIC_*` requires a frontend **rebuild** since Next.js inlines them at build time).

## 5. Verify

- `https://<backend-domain>/api/v1/health` → `{"status": "ok"}`
- `https://<frontend-domain>` → site loads, chat answers from the knowledge base
- `/admin` → sign in, check the analytics overview

## Costs & notes

- Everything fits comfortably in Railway's Hobby plan; DeepInfra Llama 3.3 70B costs ~$0.10/$0.32 per Mtoken, so chat costs are effectively pennies.
- `EMBEDDING_DIM` is baked into the pgvector column at first boot. If you ever switch embedding providers, either wipe the `knowledge_documents`/`knowledge_chunks` tables or reset the database, then let the app re-seed.
- Custom domain: add it on the frontend service (and optionally the backend), then update `NEXT_PUBLIC_SITE_URL`, `SITE_URL`, and `CORS_ORIGINS`.
- CI: the included GitHub Actions workflow runs tests/builds on every push; Railway deploys on push to `main` independently.
