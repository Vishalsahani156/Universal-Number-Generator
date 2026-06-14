#!/usr/bin/env bash
# Run Celery Beat (scheduled cleanup of expired files)
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

echo "Celery Beat starting..."
echo "Press Ctrl+C to stop."
echo ""

exec celery -A app.tasks.celery_app beat --loglevel=info
