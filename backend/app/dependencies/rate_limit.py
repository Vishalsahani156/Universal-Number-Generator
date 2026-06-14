import hashlib
import time

import redis.asyncio as aioredis
from fastapi import HTTPException, Request

from app.config import get_settings

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    settings = get_settings()
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            db=settings.redis_rate_limit_db,
            decode_responses=True,
        )
    return _redis_client


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()


async def _sliding_window(
    redis: aioredis.Redis,
    key: str,
    limit: int,
    window_seconds: int,
) -> tuple[bool, int]:
    now = time.time()
    pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, now - window_seconds)
    pipeline.zadd(key, {str(now): now})
    pipeline.zcard(key)
    pipeline.expire(key, window_seconds)
    results = await pipeline.execute()
    count = results[2]
    if count > limit:
        retry_after = window_seconds
        return False, retry_after
    return True, 0


async def check_rate_limit(request: Request, session_id: str) -> None:
    settings = get_settings()
    if settings.app_env == "development":
        return

    redis = await get_redis()
    client_ip = request.client.host if request.client else "unknown"
    ip_key = f"rl:ip:{_hash_ip(client_ip)}"
    session_key = f"rl:session:{session_id}"

    ip_ok, ip_retry = await _sliding_window(
        redis,
        ip_key,
        settings.rate_limit_jobs_per_hour_ip,
        3600,
    )
    if not ip_ok:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded: too many jobs per hour from this IP",
            headers={"Retry-After": str(ip_retry)},
        )

    session_ok, session_retry = await _sliding_window(
        redis,
        session_key,
        settings.rate_limit_jobs_per_day_session,
        86400,
    )
    if not session_ok:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded: too many jobs per day for this session",
            headers={"Retry-After": str(session_retry)},
        )
