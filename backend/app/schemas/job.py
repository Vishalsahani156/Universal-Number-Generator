import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

COLUMN_NAME_PATTERN = re.compile(r"^[a-zA-Z0-9_ ]{1,50}$")

JobStatus = Literal["queued", "processing", "completed", "failed", "cancelled", "expired"]
GenerationMode = Literal["sequential", "random"]
ExportFormat = Literal["csv", "xlsx"]


class ExportOptions(BaseModel):
    column_name: str = Field(..., min_length=1, max_length=50)
    include_country_code: bool = False
    include_serial: bool = False

    @field_validator("column_name")
    @classmethod
    def validate_column_name(cls, value: str) -> str:
        if not COLUMN_NAME_PATTERN.match(value):
            raise ValueError(
                "column_name must be 1-50 chars (letters, numbers, spaces, underscores)"
            )
        return value


class JobCreateRequest(BaseModel):
    country_code: str = Field(..., min_length=2, max_length=2)
    quantity: int = Field(..., ge=1)
    generation_mode: GenerationMode
    export_format: ExportFormat
    export_options: ExportOptions


class JobProgress(BaseModel):
    generated_count: int = 0
    percent: float = 0.0
    eta_seconds: int | None = None
    current_chunk: int | None = None
    total_chunks: int | None = None


class JobCreateResponse(BaseModel):
    job_id: str
    status: JobStatus
    estimated_duration_seconds: int
    poll_url: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: JobProgress | None = None
    country_code: str | None = None
    quantity: int | None = None
    generation_mode: GenerationMode | None = None
    export_format: ExportFormat | None = None
    export_options: ExportOptions | None = None
    download_ready: bool = False
    error: str | None = None
    created_at: datetime | None = None
    completed_at: datetime | None = None
    expires_at: datetime | None = None


class HistoryItem(BaseModel):
    job_id: str
    country_code: str
    quantity: int
    status: JobStatus
    export_format: ExportFormat
    created_at: datetime
    download_available: bool
    expires_at: datetime


class HistoryResponse(BaseModel):
    items: list[HistoryItem]
    total: int


class DownloadTokenResponse(BaseModel):
    token: str
    expires_at: datetime


class CancelJobResponse(BaseModel):
    job_id: str
    status: JobStatus
