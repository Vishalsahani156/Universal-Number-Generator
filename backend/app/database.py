from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import MongoClient
from pymongo.database import Database

from app.config import get_settings

_async_client: AsyncIOMotorClient | None = None
_sync_client: MongoClient | None = None


async def connect_mongodb() -> None:
    global _async_client
    settings = get_settings()
    _async_client = AsyncIOMotorClient(settings.mongodb_uri)


async def disconnect_mongodb() -> None:
    global _async_client
    if _async_client:
        _async_client.close()
        _async_client = None


def get_async_db() -> AsyncIOMotorDatabase:
    if _async_client is None:
        raise RuntimeError("MongoDB not connected")
    settings = get_settings()
    return _async_client[settings.mongodb_db]


def get_sync_db() -> Database:
    global _sync_client
    settings = get_settings()
    if _sync_client is None:
        _sync_client = MongoClient(settings.mongodb_uri)
    return _sync_client[settings.mongodb_db]
