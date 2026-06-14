from fastapi import APIRouter, Depends

from app.database import get_async_db
from app.repositories.countries_repo import CountriesRepository, to_country_response
from app.schemas.country import CountryResponse

router = APIRouter(prefix="/countries", tags=["countries"])


@router.get("", response_model=list[CountryResponse])
async def list_countries():
    db = get_async_db()
    repo = CountriesRepository(db)
    docs = await repo.list_enabled_async()
    return [to_country_response(doc) for doc in docs]
