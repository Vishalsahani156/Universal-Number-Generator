import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

COLUMN_NAME_PATTERN = re.compile(r"^[a-zA-Z0-9_ ]{1,50}$")

JobStatus = Literal["queued", "processing", "completed", "failed", "cancelled", "expired"]
GenerationMode = Literal["sequential", "random"]
ExportFormat = Literal["csv", "xlsx", "pdf"]


class ExportColumn(BaseModel):
    header: str = Field(..., min_length=1, max_length=50)
    static_value: str = Field(default="", max_length=200)

    @field_validator("header", mode="before")
    @classmethod
    def default_header(cls, value: str) -> str:
        if isinstance(value, str):
            value = value.strip()
        if not value:
            return "number"
        return value

    @field_validator("header")
    @classmethod
    def validate_header(cls, value: str) -> str:
        if not COLUMN_NAME_PATTERN.match(value):
            raise ValueError(
                "header must be 1-50 chars (letters, numbers, spaces, underscores)"
            )
        return value


class ExtraField(BaseModel):
    key: str = Field(default="", max_length=50)
    label: str = Field(default="", max_length=100)
    value: str = Field(default="", max_length=500)

    @field_validator("label", "value", mode="before")
    @classmethod
    def strip_fields(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


class ExportOptions(BaseModel):
    column_name: str = Field(..., min_length=1, max_length=50)
    columns: list[ExportColumn] = Field(default_factory=list)
    extra_fields: list[ExtraField] = Field(default_factory=list)
    include_country_code: bool = False
    include_serial: bool = False

    @field_validator("column_name", mode="before")
    @classmethod
    def default_column_name(cls, value: str) -> str:
        if isinstance(value, str):
            value = value.strip()
        if not value:
            return "number"
        return value

    @field_validator("column_name")
    @classmethod
    def validate_column_name(cls, value: str) -> str:
        if not COLUMN_NAME_PATTERN.match(value):
            raise ValueError(
                "column_name must be 1-50 chars (letters, numbers, spaces, underscores)"
            )
        return value

    @model_validator(mode="after")
    def normalize_and_ensure(self):
        if not self.columns:
            self.columns = [ExportColumn(header=self.column_name, static_value="")]
        seen_keys: set[str] = set()
        normalized: list[ExtraField] = []
        for ef in self.extra_fields:
            label = ef.label.strip()
            value = ef.value.strip()
            if not label and not value:
                continue
            key = ef.key.strip() or label.lower().replace(
                " ", "_"
            ).replace("-", "_")
            key = re.sub(r"[^a-zA-Z0-9_]", "", key)
            if not key:
                key = f"field_{len(normalized)}"
            if key in seen_keys:
                suffix = 2
                while f"{key}_{suffix}" in seen_keys:
                    suffix += 1
                key = f"{key}_{suffix}"
            seen_keys.add(key)
            normalized.append(
                ExtraField(key=key, label=label or key.capitalize(), value=value)
            )
        self.extra_fields = normalized
        return self


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
