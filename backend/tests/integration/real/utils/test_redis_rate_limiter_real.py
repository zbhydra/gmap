"""RedisRateLimiter 的真实 Redis 原子并发测试。"""

import asyncio

import pytest

from app.core.redis import redis_client
from app.utils.redis_rate_limiter import RedisRateLimiter

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_rate_limiter_admits_only_limit_under_concurrency(
    real_redis_ready: None,
    test_run_id: str,
) -> None:
    """同一滑动窗口并发请求只放行上限数量，且 key 带 TTL。"""

    limiter = RedisRateLimiter()
    key = f"concurrent:{test_run_id}"
    redis_key = limiter._build_key(key)
    redis = await redis_client.get_client()
    await redis.delete(redis_key)
    try:
        allowed = await asyncio.gather(
            *(limiter.is_allowed(key, limit=5, window=30) for _ in range(20))
        )

        assert sum(allowed) == 5
        assert await redis.zcard(redis_key) == 5
        assert 0 < await redis.ttl(redis_key) <= 31
    finally:
        await redis.delete(redis_key)
