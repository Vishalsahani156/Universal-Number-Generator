from datetime import datetime, timezone
from typing import Any
import asyncio

from app.config import get_settings
from app.utils.datetime_utils import ensure_utc
from app.domain.generators.registry import get_generator, validate_country_code
from app.repositories.countries_repo import CountriesRepository
from app.repositories.jobs_repo import JobsRepository, build_job_document
from app.schemas.job import (
    CancelJobResponse,
    ExportOptions,
    HistoryItem,
    HistoryResponse,
    JobCreateRequest,
    JobCreateResponse,
    JobProgress,
    JobStatusResponse,
)


class JobService:
    def __init__(
        self,
        jobs_repo: JobsRepository,
        countries_repo: CountriesRepository,
    ) -> None:
        self._jobs_repo = jobs_repo
        self._countries_repo = countries_repo
        self._settings = get_settings()

    async def create_job(
        self,
        request: JobCreateRequest,
        session_id: str,
        ip_hash: str | None,
        client_request_id: str | None,
    ) -> JobCreateResponse:
        if client_request_id:
            existing = await self._jobs_repo.find_by_client_request_id_async(
                session_id, client_request_id
            )
            if existing:
                return self._to_create_response(existing)

        if not validate_country_code(request.country_code):
            raise ValueError(f"Invalid country code: {request.country_code}")

        if request.quantity < self._settings.min_quantity:
            raise ValueError(
                f"Quantity must be at least {self._settings.min_quantity:,}"
            )
        if (
            self._settings.max_quantity is not None
            and request.quantity > self._settings.max_quantity
        ):
            raise ValueError(
                f"Quantity must be at most {self._settings.max_quantity:,}"
            )
        if (
            request.export_format == "xlsx"
            and request.quantity > self._settings.xlsx_max_rows
        ):
            raise ValueError(
                f"XLSX supports at most {self._settings.xlsx_max_rows:,} rows"
            )

        generator = get_generator(request.country_code)
        validation_error = generator.validate(request.quantity, request.generation_mode)
        if validation_error:
            raise ValueError(validation_error)

        country = await self._countries_repo.find_by_code_async(request.country_code)
        if not country:
            raise ValueError(f"Country not enabled: {request.country_code}")

        job = build_job_document(
            session_id=session_id,
            country_code=request.country_code,
            quantity=request.quantity,
            generation_mode=request.generation_mode,
            export_format=request.export_format,
            export_options=request.export_options.model_dump(),
            ip_hash=ip_hash,
            client_request_id=client_request_id,
            retention_hours=self._settings.file_retention_hours,
        )
        await self._jobs_repo.insert_job_async(job)

        from app.tasks.generate_task import enqueue_generate_task, run_generate_job

        if self._settings.app_env == "development":
            asyncio.create_task(asyncio.to_thread(run_generate_job, job["_id"]))
            await self._jobs_repo.update_celery_task_id_async(job["_id"], "inline-dev")
        else:
            task_id = enqueue_generate_task(job["_id"])
            await self._jobs_repo.update_celery_task_id_async(job["_id"], task_id)

        return self._to_create_response(job)

    async def get_job_status(self, job_id: str, session_id: str) -> JobStatusResponse:
        job = await self._jobs_repo.find_by_id_and_session_async(job_id, session_id)
        if not job:
            raise LookupError("Job not found")
        return self._to_status_response(job)

    async def cancel_job(self, job_id: str, session_id: str) -> CancelJobResponse:
        job = await self._jobs_repo.cancel_job_async(job_id, session_id)
        if not job:
            raise LookupError("Job not found or cannot be cancelled")
        return CancelJobResponse(job_id=job_id, status="cancelled")

    async def get_history(
        self, session_id: str, limit: int, offset: int
    ) -> HistoryResponse:
        items, total = await self._jobs_repo.list_by_session_async(
            session_id, limit, offset
        )
        return HistoryResponse(
            items=[self._to_history_item(j) for j in items],
            total=total,
        )

    def estimate_duration(self, quantity: int) -> int:
        # ~2M numbers/minute after bulk-write optimizations
        return max(1, int((quantity / 2_000_000) * 60))

    def _to_create_response(self, job: dict[str, Any]) -> JobCreateResponse:
        settings = get_settings()
        return JobCreateResponse(
            job_id=job["_id"],
            status=job["status"],
            estimated_duration_seconds=self.estimate_duration(job["quantity"]),
            poll_url=f"{settings.api_prefix}/jobs/{job['_id']}/status",
        )

    def _to_status_response(self, job: dict[str, Any]) -> JobStatusResponse:
        progress = None
        if job.get("progress"):
            p = job["progress"]
            progress = JobProgress(
                generated_count=p.get("generated_count", 0),
                percent=p.get("percent", 0.0),
                eta_seconds=p.get("eta_seconds"),
                current_chunk=p.get("current_chunk"),
                total_chunks=p.get("total_chunks"),
            )

        export_opts = job.get("export_options")
        expires_at = job.get("expires_at")
        download_ready = (
            job["status"] == "completed"
            and bool(job.get("files", {}).get(job.get("export_format")))
            and expires_at is not None
            and datetime.now(timezone.utc) < ensure_utc(expires_at)
        )

        return JobStatusResponse(
            job_id=job["_id"],
            status=job["status"],
            progress=progress,
            country_code=job.get("country_code"),
            quantity=job.get("quantity"),
            generation_mode=job.get("generation_mode"),
            export_format=job.get("export_format"),
            export_options=ExportOptions(**export_opts) if export_opts else None,
            download_ready=download_ready,
            error=job.get("error"),
            created_at=ensure_utc(job["created_at"]) if job.get("created_at") else None,
            completed_at=ensure_utc(job["completed_at"]) if job.get("completed_at") else None,
            expires_at=ensure_utc(expires_at) if expires_at else None,
        )

    def _to_history_item(self, job: dict[str, Any]) -> HistoryItem:
        now = datetime.now(timezone.utc)
        expires_at = job.get("expires_at")
        download_available = (
            job["status"] == "completed"
            and bool(job.get("files", {}).get(job.get("export_format")))
            and expires_at is not None
            and now < ensure_utc(expires_at)
        )
        return HistoryItem(
            job_id=job["_id"],
            country_code=job["country_code"],
            quantity=job["quantity"],
            status=job["status"],
            export_format=job["export_format"],
            created_at=ensure_utc(job["created_at"]),
            download_available=download_available,
            expires_at=ensure_utc(expires_at),
        )
