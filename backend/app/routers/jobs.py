import hashlib
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import StreamingResponse

from app.database import get_async_db
from app.utils.datetime_utils import ensure_utc
from app.dependencies.rate_limit import check_rate_limit
from app.dependencies.session import get_optional_client_request_id, get_session_id
from app.repositories.countries_repo import CountriesRepository
from app.repositories.jobs_repo import JobsRepository
from app.schemas.job import (
    CancelJobResponse,
    DownloadTokenResponse,
    HistoryResponse,
    JobCreateRequest,
    JobCreateResponse,
    JobStatusResponse,
)
from app.services.download_service import DownloadService
from app.services.job_service import JobService

router = APIRouter(tags=["jobs"])


def _get_job_service() -> JobService:
    db = get_async_db()
    return JobService(JobsRepository(db), CountriesRepository(db))


def _get_download_service() -> DownloadService:
    db = get_async_db()
    return DownloadService(JobsRepository(db))


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()


@router.post("/jobs/generate", status_code=202, response_model=JobCreateResponse)
async def create_job(
    request: Request,
    body: JobCreateRequest,
    session_id: str = Depends(get_session_id),
    client_request_id: str | None = Depends(get_optional_client_request_id),
    service: JobService = Depends(_get_job_service),
):
    await check_rate_limit(request, session_id)
    ip = request.client.host if request.client else "unknown"
    try:
        return await service.create_job(
            body,
            session_id,
            _hash_ip(ip),
            client_request_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    session_id: str = Depends(get_session_id),
    service: JobService = Depends(_get_job_service),
):
    try:
        return await service.get_job_status(job_id, session_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/jobs/{job_id}", response_model=CancelJobResponse)
async def cancel_job(
    job_id: str,
    session_id: str = Depends(get_session_id),
    service: JobService = Depends(_get_job_service),
):
    try:
        return await service.cancel_job(job_id, session_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    session_id: str = Depends(get_session_id),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: JobService = Depends(_get_job_service),
):
    return await service.get_history(session_id, limit, offset)


@router.post("/jobs/{job_id}/download-token", response_model=DownloadTokenResponse)
async def create_download_token(
    job_id: str,
    session_id: str = Depends(get_session_id),
    job_service: JobService = Depends(_get_job_service),
    download_service: DownloadService = Depends(_get_download_service),
):
    try:
        job = await job_service.get_job_status(job_id, session_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if not job.download_ready:
        raise HTTPException(status_code=400, detail="Download not ready")

    token_data = download_service.create_download_token(job_id, session_id)
    return DownloadTokenResponse(**token_data)


@router.get("/jobs/{job_id}/download")
async def download_file(
    job_id: str,
    format: str = Query(..., pattern="^(csv|xlsx|pdf)$"),
    session_id: str = Depends(get_session_id),
    x_download_token: str = Header(..., alias="X-Download-Token"),
    job_service: JobService = Depends(_get_job_service),
    download_service: DownloadService = Depends(_get_download_service),
):
    db = get_async_db()
    jobs_repo = JobsRepository(db)
    job_doc = await jobs_repo.find_by_id_and_session_async(job_id, session_id)
    if not job_doc:
        raise HTTPException(status_code=404, detail="Job not found")

    if job_doc["status"] == "expired" or ensure_utc(job_doc["expires_at"]) < datetime.now(
        timezone.utc
    ):
        raise HTTPException(status_code=410, detail="File has expired")

    if not download_service.verify_download_token(job_id, session_id, x_download_token):
        raise HTTPException(status_code=403, detail="Invalid or expired download token")

    try:
        path = download_service.get_file_path(job_doc, format)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc

    filename = f"numbers_{job_id}.{format}"
    media_type = (
        "text/csv" if format == "csv"
        else "application/pdf" if format == "pdf"
        else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    return StreamingResponse(
        download_service.stream_file(path),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
