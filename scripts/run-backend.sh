#!/usr/bin/env bash
# Run full backend locally: deps + API + worker + beat (3 terminals in one)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$BACKEND/.venv"

usage() {
  cat <<'EOF'
Usage: bash scripts/run-backend.sh [command]

Commands:
  all       Start API + worker + beat (default, needs 3 processes)
  api       FastAPI only
  worker    Celery worker only
  beat      Celery beat only
  deps      MongoDB + Redis only (Docker)
  seed      Seed countries into MongoDB
  docker    Run everything with Docker Compose
  setup     First-time setup (venv, deps, .env, seed)

Examples:
  bash scripts/run-backend.sh setup    # first time
  bash scripts/run-backend.sh all      # local dev (3 terminals)
  bash scripts/run-backend.sh docker   # all services in Docker

Local dev (recommended — open 3 terminals):
  Terminal 1: bash scripts/run-backend.sh deps
  Terminal 2: bash scripts/run-backend.sh api
  Terminal 3: bash scripts/run-backend.sh worker
  Terminal 4: bash scripts/run-backend.sh beat   # optional

URLs:
  API:    http://localhost:8000
  Docs:   http://localhost:8000/docs
  Health: http://localhost:8000/api/v1/health
EOF
}

cmd="${1:-all}"

case "$cmd" in
  setup)
    exec bash "$ROOT/scripts/setup-backend.sh"
    ;;
  deps)
    exec bash "$ROOT/scripts/start-deps.sh"
    ;;
  seed)
    if [[ ! -d "$VENV" ]]; then
      echo "Run setup first: bash scripts/run-backend.sh setup"
      exit 1
    fi
    # shellcheck source=/dev/null
    source "$VENV/bin/activate"
    export PYTHONPATH="$BACKEND"
    exec python "$BACKEND/scripts/seed_countries.py"
    ;;
  api)
    exec bash "$ROOT/scripts/run-api.sh"
    ;;
  worker)
    exec bash "$ROOT/scripts/run-worker.sh"
    ;;
  beat)
    exec bash "$ROOT/scripts/run-beat.sh"
    ;;
  docker)
    cd "$ROOT"
    if [[ ! -f "$ROOT/.env" ]]; then
      cp "$ROOT/.env.example" "$ROOT/.env"
    fi
    echo "Starting backend with Docker (mongo, redis, api, worker, beat)..."
    docker compose -f docker/docker-compose.yml up mongo redis api worker beat --build
    ;;
  all)
    if [[ ! -d "$VENV" ]]; then
      echo "First-time setup required."
      bash "$ROOT/scripts/setup-backend.sh"
    fi
    bash "$ROOT/scripts/start-deps.sh"
    echo ""
    echo "=============================================="
    echo "  Backend needs 3 terminals running:"
    echo "=============================================="
    echo ""
    echo "  Terminal 1: bash scripts/run-backend.sh api"
    echo "  Terminal 2: bash scripts/run-backend.sh worker"
    echo "  Terminal 3: bash scripts/run-backend.sh beat"
    echo ""
    echo "Starting API in this terminal..."
    echo ""
    exec bash "$ROOT/scripts/run-api.sh"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd"
    usage
    exit 1
    ;;
esac
