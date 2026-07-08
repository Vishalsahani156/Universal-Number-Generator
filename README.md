# Universal Phone Number Generator

🌐 **Live Demo:** [universal-number-generator-x965.vercel.app](https://universal-number-generator-x965.vercel.app/)

Large-scale web application for generating format-valid mobile phone numbers for 30 countries (5M–20M per job) with CSV/XLSX export.

## Documentation

| Document | Description |
|---|---|
| [Software Requirements (SRS)](docs/SRS.md) | Functional requirements, edge cases, security |
| [Technical Design (TDD)](docs/TDD.md) | Backend, frontend, API, database design |
| [System Architecture](docs/ARCHITECTURE.md) | Full architecture, infrastructure, deployment, roadmap |

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, React Query, Zustand
- **Backend:** Python, FastAPI, Celery, Redis
- **Database:** MongoDB Atlas
- **Deployment:** Docker, Nginx, Ubuntu VPS

## Quick Start — Backend

### First time setup

```bash
bash scripts/run-backend.sh setup
```

### Run locally (3 terminals)

```bash
# Terminal 1 — MongoDB + Redis
bash scripts/run-backend.sh deps

# Terminal 2 — FastAPI API
bash scripts/run-backend.sh api

# Terminal 3 — Celery worker
bash scripts/run-backend.sh worker

# Terminal 4 (optional) — Celery beat (file cleanup)
bash scripts/run-backend.sh beat
```

### Run with Docker (all backend services)

```bash
bash scripts/run-backend.sh docker
```

### URLs

| Service | URL |
|---|---|
| API | http://localhost:8100 |
| Swagger Docs | http://localhost:8100/docs |
| Health Check | http://localhost:8100/api/v1/health |

### All scripts

| Script | Purpose |
|---|---|
| `scripts/run-backend.sh` | Main entry — `setup`, `api`, `worker`, `beat`, `docker` |
| `scripts/setup-backend.sh` | venv + pip install + .env + seed |
| `scripts/run-api.sh` | Uvicorn dev server |
| `scripts/run-worker.sh` | Celery worker |
| `scripts/run-beat.sh` | Celery beat |
| `scripts/start-deps.sh` | MongoDB + Redis via Docker |

## Quick Start — Full Stack (Docker)

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up --build
```

```
├── frontend/       # Next.js application
├── backend/        # FastAPI + Celery workers
├── shared/         # Country metadata
├── docker/         # Docker Compose + Nginx
├── docs/           # Architecture documentation
└── data/exports/   # Generated files (gitignored)

## Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://universal-number-generator-x965.vercel.app/
```
