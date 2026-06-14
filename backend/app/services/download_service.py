import hashlib
import hmac
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, AsyncIterator

from app.config import get_settings
from app.repositories.jobs_repo import JobsRepository


class DownloadService:
    def __init__(self, jobs_repo: JobsRepository) -> None:
        self._jobs_repo = jobs_repo
        self._settings = get_settings()

    def create_download_token(self, job_id: str, session_id: str) -> dict[str, Any]:
        expires_at = datetime.now(timezone.utc) + timedelta(
            seconds=self._settings.download_token_ttl_seconds
        )
        expiry_ts = int(expires_at.timestamp())
        payload = f"{job_id}:{session_id}:{expiry_ts}"
        token = hmac.new(
            self._settings.secret_key.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        return {"token": f"{expiry_ts}.{token}", "expires_at": expires_at}

    def verify_download_token(self, job_id: str, session_id: str, token: str) -> bool:
        try:
            expiry_str, signature = token.split(".", 1)
            expiry_ts = int(expiry_str)
        except ValueError:
            return False
        if expiry_ts < int(time.time()):
            return False
        payload = f"{job_id}:{session_id}:{expiry_ts}"
        expected = hmac.new(
            self._settings.secret_key.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(signature, expected)

    def get_file_path(self, job: dict[str, Any], export_format: str) -> Path:
        files = job.get("files", {})
        file_info = files.get(export_format)
        if not file_info:
            raise FileNotFoundError("File not available")
        path = Path(file_info["path"]).resolve()
        exports_root = self._settings.exports_dir.resolve()
        if not str(path).startswith(str(exports_root)):
            raise PermissionError("Invalid file path")
        if not path.exists():
            raise FileNotFoundError("File not found on disk")
        return path

    async def stream_file(self, path: Path) -> AsyncIterator[bytes]:
        with path.open("rb") as f:
            while chunk := f.read(1024 * 1024):
                yield chunk
