#!/bin/bash
# Entrypoint for the combined image: migrate, then run FastAPI + Next + Nginx.
# If any process dies, the container exits so the platform restarts it.
set -e

export PORT="${PORT:-8080}"

# Render the nginx config with the platform-assigned port
envsubst '${PORT}' < /app/deploy/nginx.conf.template > /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

# Database migrations (idempotent; app lifespan also self-heals schema + seed)
cd /app/backend
alembic upgrade head

# Backend on 8000 (internal)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 &

# Frontend on 3000 (internal)
cd /app/frontend
PORT=3000 HOSTNAME=127.0.0.1 node server.js &

# Router on $PORT (public)
nginx -g "daemon off;" &

wait -n
exit 1
