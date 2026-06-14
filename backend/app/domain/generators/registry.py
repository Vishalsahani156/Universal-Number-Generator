import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.config import PROJECT_ROOT
from app.domain.generators.base import GenericCountryGenerator

COUNTRIES_PATH = PROJECT_ROOT / "shared" / "country-metadata" / "countries.json"


@lru_cache
def _load_countries() -> dict[str, dict[str, Any]]:
    with COUNTRIES_PATH.open(encoding="utf-8") as f:
        countries = json.load(f)
    return {c["_id"]: c for c in countries}


def get_generator(country_code: str) -> GenericCountryGenerator:
    countries = _load_countries()
    code = country_code.upper()
    if code not in countries:
        raise ValueError(f"Unsupported country code: {country_code}")
    return GenericCountryGenerator(countries[code])


def validate_country_code(country_code: str) -> bool:
    return country_code.upper() in _load_countries()
