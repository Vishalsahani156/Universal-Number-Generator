#!/usr/bin/env bash
# Run FastAPI server (development with auto-reload)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$BACKEND/.venv"
API_PORT="${API_PORT:-8100}"

cd "$ROOT"

if [[ ! -d "$VENV" ]]; then
  echo "Virtual env not found. Run first: bash scripts/setup-backend.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "$VENV/bin/activate"

export PYTHONPATH="$BACKEND"

mkdir -p "$ROOT/data/exports"

if command -v ss &>/dev/null && ss -tln | grep -q ":${API_PORT} "; then
  health="$(curl -sf "http://127.0.0.1:${API_PORT}/api/v1/health" 2>/dev/null || true)"
  if [[ -n "$health" ]] && echo "$health" | grep -q '"service":"phone_generator"'; then
    echo "Phone Generator API already running on port ${API_PORT}"
    exit 0
  fi
  echo "ERROR: Port ${API_PORT} is already used by another application."
  echo "       (Port 8000 is often used by other Node backends — this project uses ${API_PORT}.)"
  echo "       Stop the other app or run: API_PORT=8101 bash scripts/run-api.sh"
  exit 1
fi

echo "API:     http://localhost:${API_PORT}"
echo "Docs:    http://localhost:${API_PORT}/docs"
echo "Health:  http://localhost:${API_PORT}/api/v1/health"
echo "Dev:     generation runs inline (no Celery worker required)"
echo ""
echo "Frontend proxy: set BACKEND_URL=http://localhost:${API_PORT} in frontend/.env.local"
echo "Press Ctrl+C to stop."
echo ""

exec uvicorn app.main:app --reload --host 0.0.0.0 --port "${API_PORT}"
