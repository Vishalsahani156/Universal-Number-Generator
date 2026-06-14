#!/usr/bin/env bash
# Run Celery worker (number generation + cleanup)
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

echo "Celery worker starting (queues: generation, cleanup)..."
echo "Press Ctrl+C to stop."
echo ""

exec celery -A app.tasks.celery_app worker \
  -Q generation,cleanup \
  --concurrency=2 \
  --loglevel=info
