from datetime import datetime, timezone


def ensure_utc(dt: datetime) -> datetime:
    """Normalize MongoDB/Pydantic datetimes for safe UTC comparisons."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)
