# Universal Phone Number Generator

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

## Quick Start

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d
```

## Project Structure

```
├── frontend/       # Next.js application
├── backend/        # FastAPI + Celery workers
├── shared/         # Country metadata
├── docker/         # Docker Compose + Nginx
├── docs/           # Architecture documentation
└── data/exports/   # Generated files (gitignored)
```
