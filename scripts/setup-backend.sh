#!/usr/bin/env bash
# First-time backend setup: venv, dependencies, .env, seed countries
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$BACKEND/.venv"

cd "$ROOT"

# .env file (localhost for local dev; use docker-compose for container hostnames)
if [[ ! -f "$ROOT/.env" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  sed -i \
    -e 's|mongodb://mongo:27017|mongodb://localhost:27017|g' \
    -e 's|redis://redis:6379|redis://localhost:6379|g' \
    -e 's|EXPORTS_DIR=/data/exports|EXPORTS_DIR=./data/exports|g' \
    "$ROOT/.env"
  echo "Created .env for local development (localhost MongoDB + Redis)"
fi

# Python venv
if [[ ! -d "$VENV" ]]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV"
fi

# shellcheck source=/dev/null
source "$VENV/bin/activate"

echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r "$BACKEND/requirements.txt"

mkdir -p "$ROOT/data/exports"

# Frontend proxy must target Phone Generator API on 8100 (not 8000 — often used by other apps)
cat > "$ROOT/frontend/.env.local" <<'EOF'
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_URL=http://localhost:8100
EOF
echo "Wrote frontend/.env.local (BACKEND_URL=http://localhost:8100)"

# Start deps if docker available
if command -v docker &>/dev/null; then
  bash "$ROOT/scripts/start-deps.sh"
  echo ""
  echo "Seeding countries into MongoDB..."
  PYTHONPATH="$BACKEND" python "$BACKEND/scripts/seed_countries.py"
else
  echo ""
  echo "Docker not found — skip auto seed. Run manually after MongoDB is up:"
  echo "  PYTHONPATH=backend python backend/scripts/seed_countries.py"
fi

echo ""
echo "Setup complete."
echo "Run backend:  bash scripts/run-backend.sh"
echo "Or API only:  bash scripts/run-api.sh"
