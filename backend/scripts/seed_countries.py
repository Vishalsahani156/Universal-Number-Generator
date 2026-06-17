#!/usr/bin/env python3
"""Seed countries collection from shared/country-metadata/countries.json."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "backend"))

from app.config import get_settings  # noqa: E402
from app.services.country_seed import ensure_countries_seeded_sync  # noqa: E402


def main() -> None:
    settings = get_settings()
    count = ensure_countries_seeded_sync()
    print(f"Seeded {count} countries into {settings.mongodb_db}")


if __name__ == "__main__":
    main()
