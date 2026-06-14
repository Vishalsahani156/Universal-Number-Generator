#!/usr/bin/env bash
# Run FastAPI server (development with auto-reload)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$BACKEND/.venv"

cd "$ROOT"

if [[ ! -d "$VENV" ]]; then
  echo "Virtual env not found. Run first: bash scripts/setup-backend.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "$VENV/bin/activate"

export PYTHONPATH="$BACKEND"

mkdir -p "$ROOT/data/exports"

echo "API:     http://localhost:8000"
echo "Docs:    http://localhost:8000/docs"
echo "Health:  http://localhost:8000/api/v1/health"
echo "Dev:     generation runs inline (no Celery worker required)"
echo ""
echo "Press Ctrl+C to stop."
echo ""

exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
