# ============================================================
# Combined image: Next.js frontend + FastAPI backend + Nginx
# For single-service platforms (Railway "deploy the whole repo").
# Nginx listens on $PORT and routes /api/* -> FastAPI, /* -> Next.
# Postgres & Redis remain separate managed services.
# ============================================================

# ---------- Stage 1: frontend build ----------
FROM node:20-alpine AS frontend-build
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ .
# Empty NEXT_PUBLIC_API_URL => the app calls the API same-origin (/api/v1/...)
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 NODE_ENV=production

# nginx for routing, nodejs to run the Next standalone server
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx nodejs gettext-base \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ backend/

# Frontend (standalone output)
COPY --from=frontend-build /fe/.next/standalone frontend/
COPY --from=frontend-build /fe/.next/static frontend/.next/static
COPY --from=frontend-build /fe/public frontend/public

# Router + entrypoint
COPY deploy/nginx.conf.template deploy/nginx.conf.template
COPY deploy/start.sh deploy/start.sh
RUN chmod +x deploy/start.sh

EXPOSE 8080
CMD ["bash", "deploy/start.sh"]
