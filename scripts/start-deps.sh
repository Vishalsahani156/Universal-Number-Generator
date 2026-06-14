#!/usr/bin/env bash
# Start MongoDB + Redis (required for backend)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v docker &>/dev/null; then
  echo "Error: Docker is required. Install Docker or start MongoDB + Redis manually."
  exit 1
fi

echo "Starting MongoDB and Redis..."
docker compose -f docker/docker-compose.yml up mongo redis -d

echo ""
echo "Waiting for services..."
sleep 3
echo "MongoDB: localhost:27017"
echo "Redis:   localhost:6379"
