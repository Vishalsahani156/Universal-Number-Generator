from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pymongo.database import Database

ACTIVE_STATUSES = {"queued", "processing"}
TERMINAL_STATUSES = {"completed", "failed", "cancelled", "expired"}


class JobsRepository:
    def __init__(self, db: AsyncIOMotorDatabase | Database) -> None:
        self._collection = db["jobs"]
        self._async = hasattr(db, "command")

    async def insert_job_async(self, job: dict[str, Any]) -> dict[str, Any]:
        await self._collection.insert_one(job)
        return job

    def insert_job_sync(self, job: dict[str, Any]) -> dict[str, Any]:
        self._collection.insert_one(job)
        return job

    async def find_by_id_async(self, job_id: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"_id": job_id})

    def find_by_id_sync(self, job_id: str) -> dict[str, Any] | None:
        return self._collection.find_one({"_id": job_id})

    async def find_by_id_and_session_async(
        self, job_id: str, session_id: str
    ) -> dict[str, Any] | None:
        return await self._collection.find_one(
            {"_id": job_id, "session_id": session_id}
        )

    async def find_by_client_request_id_async(
        self, session_id: str, client_request_id: str
    ) -> dict[str, Any] | None:
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=60)
        return await self._collection.find_one(
            {
                "session_id": session_id,
                "client_request_id": client_request_id,
                "created_at": {"$gte": cutoff},
            }
        )

    async def cancel_job_async(self, job_id: str, session_id: str) -> dict[str, Any] | None:
        return await self._collection.find_one_and_update(
            {
                "_id": job_id,
                "session_id": session_id,
                "status": {"$in": list(ACTIVE_STATUSES)},
            },
            {
                "$set": {
                    "status": "cancelled",
                    "completed_at": datetime.now(timezone.utc),
                }
            },
            return_document=ReturnDocument.AFTER,
        )

    def is_cancelled_sync(self, job_id: str) -> bool:
        doc = self._collection.find_one({"_id": job_id}, {"status": 1})
        return doc is not None and doc.get("status") == "cancelled"

    def update_status_sync(self, job_id: str, status: str, **extra: Any) -> None:
        update: dict[str, Any] = {"status": status, **extra}
        self._collection.update_one({"_id": job_id}, {"$set": update})

    def update_progress_sync(
        self,
        job_id: str,
        generated_count: int,
        percent: float,
        current_chunk: int,
        total_chunks: int,
        eta_seconds: int | None = None,
    ) -> None:
        progress: dict[str, Any] = {
            "generated_count": generated_count,
            "percent": round(percent, 2),
            "current_chunk": current_chunk,
            "total_chunks": total_chunks,
        }
        if eta_seconds is not None:
            progress["eta_seconds"] = eta_seconds
        self._collection.update_one(
            {"_id": job_id},
            {"$set": {"progress": progress}},
        )

    def mark_completed_sync(
        self,
        job_id: str,
        export_format: str,
        file_meta: dict[str, Any],
    ) -> None:
        self._collection.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc),
                    f"files.{export_format}": file_meta,
                    "progress.percent": 100.0,
                }
            },
        )

    def mark_failed_sync(self, job_id: str, error: str) -> None:
        self._collection.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "error": error,
                    "completed_at": datetime.now(timezone.utc),
                }
            },
        )

    async def list_by_session_async(
        self,
        session_id: str,
        limit: int,
        offset: int,
    ) -> tuple[list[dict[str, Any]], int]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=30)
        query = {"session_id": session_id, "created_at": {"$gte": cutoff}}
        total = await self._collection.count_documents(query)
        cursor = (
            self._collection.find(query)
            .sort("created_at", -1)
            .skip(offset)
            .limit(limit)
        )
        items = await cursor.to_list(length=limit)
        return items, total

    def find_expired_jobs_sync(self, now: datetime) -> list[dict[str, Any]]:
        return list(
            self._collection.find(
                {
                    "expires_at": {"$lte": now},
                    "status": {"$in": ["completed", "expired"]},
                }
            )
        )

    async def update_celery_task_id_async(self, job_id: str, task_id: str) -> None:
        await self._collection.update_one(
            {"_id": job_id},
            {"$set": {"celery_task_id": task_id}},
        )

    def mark_expired_sync(self, job_id: str) -> None:
        self._collection.update_one(
            {"_id": job_id},
            {"$set": {"status": "expired"}},
        )


def build_job_document(
    *,
    session_id: str,
    country_code: str,
    quantity: int,
    generation_mode: str,
    export_format: str,
    export_options: dict[str, Any],
    ip_hash: str | None,
    client_request_id: str | None,
    retention_hours: int,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    job_id = str(uuid4())
    doc: dict[str, Any] = {
        "_id": job_id,
        "session_id": session_id,
        "country_code": country_code.upper(),
        "quantity": quantity,
        "generation_mode": generation_mode,
        "export_format": export_format,
        "export_options": export_options,
        "status": "queued",
        "progress": {
            "generated_count": 0,
            "percent": 0.0,
            "current_chunk": 0,
            "total_chunks": 0,
        },
        "files": {},
        "error": None,
        "created_at": now,
        "started_at": None,
        "completed_at": None,
        "expires_at": now + timedelta(hours=retention_hours),
        "celery_task_id": None,
    }
    if client_request_id:
        doc["client_request_id"] = client_request_id
    if ip_hash:
        doc["ip_hash"] = ip_hash
    return doc
