from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import connect_mongodb, disconnect_mongodb
from app.dependencies.rate_limit import close_redis
from app.routers import countries, health, jobs
from app.services.country_seed import ensure_countries_seeded_sync


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    settings.exports_dir.mkdir(parents=True, exist_ok=True)
    await connect_mongodb()
    try:
        ensure_countries_seeded_sync()
    except Exception:
        # Countries endpoint still works via countries.json fallback.
        pass
    yield
    await disconnect_mongodb()
    await close_redis()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Phone Number Generator API",
        version="1.0.0",
        lifespan=lifespan,
    )

    cors_kwargs: dict = {
        "allow_origins": settings.cors_origin_list,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
        "expose_headers": ["Retry-After", "Content-Disposition"],
    }
    # ngrok URLs change each session; allow them in local dev without editing .env
    if settings.app_env == "development":
        cors_kwargs["allow_origin_regex"] = (
            r"https://.*\.ngrok-free\.(app|dev)|https://.*\.ngrok\.io"
        )

    app.add_middleware(CORSMiddleware, **cors_kwargs)

    prefix = settings.api_prefix
    app.include_router(health.router, prefix=prefix)
    app.include_router(countries.router, prefix=prefix)
    app.include_router(jobs.router, prefix=prefix)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_request: Request, exc: HTTPException):
        headers = getattr(exc, "headers", None) or {}
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers,
        )

    return app


app = create_app()
