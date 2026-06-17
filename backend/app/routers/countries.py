import logging

from fastapi import APIRouter

from app.database import get_async_db
from app.repositories.countries_repo import CountriesRepository, to_country_response
from app.schemas.country import CountryResponse
from app.services.country_seed import load_countries_from_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/countries", tags=["countries"])


def _countries_from_file() -> list[CountryResponse]:
    return [to_country_response(doc) for doc in load_countries_from_file()]


@router.get("", response_model=list[CountryResponse])
async def list_countries():
    try:
        db = get_async_db()
        repo = CountriesRepository(db)
        docs = await repo.list_enabled_async()
        if docs:
            return [to_country_response(doc) for doc in docs]
    except Exception as exc:
        logger.warning("MongoDB countries lookup failed, using file fallback: %s", exc)

    return _countries_from_file()
