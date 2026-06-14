from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_EXPORTS_DIR = PROJECT_ROOT / "data" / "exports"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(PROJECT_ROOT / ".env", PROJECT_ROOT / ".env.local"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    secret_key: str = "change-me-to-a-long-random-string"
    api_prefix: str = "/api/v1"

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "phone_generator"

    redis_url: str = "redis://localhost:6379/0"
    redis_rate_limit_db: int = 1
    redis_progress_db: int = 2

    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    exports_dir: Path = DEFAULT_EXPORTS_DIR
    file_retention_hours: int = 72

    @field_validator("exports_dir", mode="before")
    @classmethod
    def resolve_exports_dir(cls, value: str | Path | None) -> Path:
        if value is None or value == "":
            return DEFAULT_EXPORTS_DIR

        path = Path(value)
        if not path.is_absolute():
            return (PROJECT_ROOT / path).resolve()

        # Docker path in local dev — fall back to project data dir if not writable
        if path == Path("/data/exports"):
            try:
                path.mkdir(parents=True, exist_ok=True)
                return path
            except OSError:
                return DEFAULT_EXPORTS_DIR

        return path
    chunk_size: int = 50_000

    min_quantity: int = 1
    max_quantity: int = 10_000_000
    xlsx_max_rows: int = 1_048_576

    rate_limit_jobs_per_hour_ip: int = 3
    rate_limit_jobs_per_day_session: int = 10

    download_token_ttl_seconds: int = 900
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
