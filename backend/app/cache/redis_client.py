import time
import json
from typing import Any, Optional
from app.config import settings
from app.utils.logging import logger

try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None


class InMemoryCache:
    """In-memory fallback cache with TTL expiration."""
    def __init__(self):
        self._store: dict[str, tuple[Any, float]] = {}

    async def get(self, key: str) -> Optional[str]:
        if key in self._store:
            val, exp = self._store[key]
            if exp == 0 or exp > time.time():
                return val
            else:
                del self._store[key]
        return None

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> None:
        exp = time.time() + ex if ex else 0
        self._store[key] = (value, exp)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def exists(self, key: str) -> bool:
        return (await self.get(key)) is not None


class CacheService:
    """Unified cache service that utilizes Redis when available and falls back to memory."""
    def __init__(self):
        self._redis = None
        self._fallback = InMemoryCache()
        self._is_redis_available = False

    async def initialize(self):
        if aioredis and settings.REDIS_URL:
            try:
                client = aioredis.from_url(
                    settings.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=1.0,
                    socket_timeout=1.0
                )
                # Quick ping test
                await client.ping()
                self._redis = client
                self._is_redis_available = True
                logger.info("Connected to Redis cache successfully.")
            except Exception as e:
                self._is_redis_available = False
                logger.info("Redis not available; operating with high-speed in-memory cache.")
        else:
            self._is_redis_available = False

    async def get_json(self, key: str) -> Optional[Any]:
        try:
            raw = None
            if self._is_redis_available and self._redis:
                raw = await self._redis.get(key)
            if raw is None:
                raw = await self._fallback.get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    async def set_json(self, key: str, data: Any, ttl_seconds: int = 60) -> None:
        try:
            serialized = json.dumps(data)
            if self._is_redis_available and self._redis:
                await self._redis.set(key, serialized, ex=ttl_seconds)
            await self._fallback.set(key, serialized, ex=ttl_seconds)
        except Exception as e:
            logger.warning(f"Cache set error for key {key}: {str(e)}")

    async def get_raw(self, key: str) -> Optional[str]:
        if self._is_redis_available and self._redis:
            val = await self._redis.get(key)
            if val:
                return val
        return await self._fallback.get(key)

    async def set_raw(self, key: str, value: str, ttl_seconds: int = 60) -> None:
        if self._is_redis_available and self._redis:
            await self._redis.set(key, value, ex=ttl_seconds)
        await self._fallback.set(key, value, ex=ttl_seconds)

    async def delete(self, key: str) -> None:
        if self._is_redis_available and self._redis:
            await self._redis.delete(key)
        await self._fallback.delete(key)

    async def close(self):
        if self._redis:
            await self._redis.close()


cache = CacheService()
