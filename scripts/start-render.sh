#!/usr/bin/env bash
# Entrypoint for the Render single-service deploy.
# Runs the Celery worker (with embedded beat scheduler) and the FastAPI
# server in the same container so they share the /data/exports disk.
set -euo pipefail

term() {
  echo "Shutting down..."
  kill -TERM "${WORKER_PID:-}" "${API_PID:-}" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap term SIGTERM SIGINT

# Celery worker + embedded beat (-B) for the periodic cleanup task.
celery -A app.tasks.celery_app worker \
  -Q generation,cleanup \
  --beat \
  --concurrency=2 \
  --loglevel=info &
WORKER_PID=$!

# FastAPI on Render's injected $PORT.
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" &
API_PID=$!

# If either process exits, tear the container down so Render restarts it.
wait -n
term
exit 1
