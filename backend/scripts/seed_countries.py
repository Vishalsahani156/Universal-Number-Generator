#!/usr/bin/env python3
"""Seed countries collection from shared/country-metadata/countries.json."""

import json
import sys
from pathlib import Path

from pymongo import ASCENDING, MongoClient

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.config import get_settings  # noqa: E402


def main() -> None:
    settings = get_settings()
    countries_path = ROOT / "shared" / "country-metadata" / "countries.json"
    with countries_path.open(encoding="utf-8") as f:
        countries = json.load(f)

    client = MongoClient(settings.mongodb_uri)
    db = client[settings.mongodb_db]
    collection = db["countries"]

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
    )

    print(f"Seeded {len(countries)} countries into {settings.mongodb_db}")
    client.close()


if __name__ == "__main__":
    main()
