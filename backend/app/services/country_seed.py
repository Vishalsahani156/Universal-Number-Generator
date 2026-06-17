import json
from pathlib import Path
from typing import Any

from pymongo import ASCENDING, MongoClient

from app.config import PROJECT_ROOT, get_settings


def countries_json_path() -> Path:
    return PROJECT_ROOT / "shared" / "country-metadata" / "countries.json"


def load_countries_from_file() -> list[dict[str, Any]]:
    with countries_json_path().open(encoding="utf-8") as handle:
        return json.load(handle)


def ensure_countries_seeded_sync() -> int:
    """Seed countries and job indexes if the collection is empty."""
    settings = get_settings()
    countries = load_countries_from_file()

    client = MongoClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    collection = db["countries"]

    existing = collection.count_documents({})
    if existing == 0:
        for country in countries:
            collection.replace_one({"_id": country["_id"]}, country, upsert=True)

    collection.create_index([("enabled", ASCENDING), ("display_order", ASCENDING)])

    jobs = db["jobs"]
    jobs.create_index([("session_id", ASCENDING), ("created_at", -1)])
    jobs.create_index([("status", ASCENDING), ("created_at", ASCENDING)])
    jobs.create_index([("expires_at", ASCENDING)])
    jobs.create_index(
        [("client_request_id", ASCENDING)],
        unique=True,
        sparse=True,
        name="client_request_id_1",
    )

    client.close()
    return len(countries)
