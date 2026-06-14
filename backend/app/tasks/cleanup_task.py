import shutil
from datetime import datetime, timezone
from pathlib import Path

from app.config import get_settings
from app.database import get_sync_db
from app.repositories.jobs_repo import JobsRepository
from app.tasks.celery_app import celery_app


@celery_app.task(name="app.tasks.cleanup_task.cleanup_expired_files")
def cleanup_expired_files() -> int:
    settings = get_settings()
    db = get_sync_db()
    jobs_repo = JobsRepository(db)
    now = datetime.now(timezone.utc)
    expired_jobs = jobs_repo.find_expired_jobs_sync(now)
    cleaned = 0

    for job in expired_jobs:
        job_dir = settings.exports_dir / job["_id"]
        if job_dir.exists():
            shutil.rmtree(job_dir, ignore_errors=True)
        jobs_repo.mark_expired_sync(job["_id"])
        cleaned += 1

    return cleaned
