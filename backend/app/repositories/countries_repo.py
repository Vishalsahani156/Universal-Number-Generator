from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.database import Database

from app.schemas.country import CountryResponse


class CountriesRepository:
    def __init__(self, db: AsyncIOMotorDatabase | Database) -> None:
        self._collection = db["countries"]

    async def list_enabled_async(self) -> list[dict[str, Any]]:
        cursor = self._collection.find({"enabled": True}).sort(
            [("display_order", 1)]
        )
        return await cursor.to_list(length=50)

    def list_enabled_sync(self) -> list[dict[str, Any]]:
        return list(
            self._collection.find({"enabled": True}).sort([("display_order", 1)])
        )

    async def find_by_code_async(self, code: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"_id": code.upper(), "enabled": True})

    def find_by_code_sync(self, code: str) -> dict[str, Any] | None:
        return self._collection.find_one({"_id": code.upper(), "enabled": True})


def to_country_response(doc: dict[str, Any]) -> CountryResponse:
    rules = doc["mobile_rules"]
    return CountryResponse(
        code=doc["_id"],
        name=doc["name"],
        dial_code=doc["dial_code"],
        iso_alpha2=doc["iso_alpha2"],
        mobile_rules={
            "length": rules["length"],
            "valid_prefixes": rules["valid_prefixes"],
        },
        default_export=doc["default_export"],
        display_order=doc["display_order"],
    )
