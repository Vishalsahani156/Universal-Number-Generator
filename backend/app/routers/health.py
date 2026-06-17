import shutil
from datetime import datetime, timezone

import redis.asyncio as aioredis
from fastapi import APIRouter

from app.config import get_settings
from app.database import get_async_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    settings = get_settings()
    checks = {"mongodb": False, "redis": False, "disk": False}
    errors: list[str] = []

    try:
        db = get_async_db()
        await db.command("ping")
        checks["mongodb"] = True
    except Exception as exc:
        errors.append(f"mongodb: {exc}")

    try:
        client = aioredis.from_url(settings.redis_url, decode_responses=True)
        await client.ping()
        await client.close()
        checks["redis"] = True
    except Exception as exc:
        errors.append(f"redis: {exc}")

    try:
        settings.exports_dir.mkdir(parents=True, exist_ok=True)
        usage = shutil.disk_usage(settings.exports_dir)
        checks["disk"] = usage.free > 1024 * 1024 * 1024
        if not checks["disk"]:
            errors.append("disk: less than 1GB free")
    except Exception as exc:
        errors.append(f"disk: {exc}")

    healthy = all(checks.values())
    return {
        "service": "phone_generator",
        "status": "healthy" if healthy else "degraded",
        "checks": checks,
        "errors": errors,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
