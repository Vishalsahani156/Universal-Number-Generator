import re
import uuid

from fastapi import Header, HTTPException

UUID_PATTERN = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


async def get_session_id(x_session_id: str = Header(..., alias="X-Session-Id")) -> str:
    if not UUID_PATTERN.match(x_session_id):
        try:
            uuid.UUID(x_session_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid X-Session-Id") from exc
    return x_session_id


async def get_optional_client_request_id(
    x_client_request_id: str | None = Header(None, alias="X-Client-Request-Id"),
) -> str | None:
    if x_client_request_id and not UUID_PATTERN.match(x_client_request_id):
        try:
            uuid.UUID(x_client_request_id)
        except ValueError as exc:
            raise HTTPException(
                status_code=400, detail="Invalid X-Client-Request-Id"
            ) from exc
    return x_client_request_id
