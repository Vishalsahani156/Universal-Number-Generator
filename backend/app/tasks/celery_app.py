from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "phone_generator",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.generate_task", "app.tasks.cleanup_task"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=7200,
    task_time_limit=9000,
    task_routes={
        "app.tasks.generate_task.generate_numbers": {"queue": "generation"},
        "app.tasks.cleanup_task.cleanup_expired_files": {"queue": "cleanup"},
    },
    beat_schedule={
        "cleanup-expired-files": {
            "task": "app.tasks.cleanup_task.cleanup_expired_files",
            "schedule": crontab(minute=0),
        },
    },
)
