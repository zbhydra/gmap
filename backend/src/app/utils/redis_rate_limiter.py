"""Redis 限流实现"""

import time
import uuid

from app.core.redis import redis_client
from app.utils.redis_key import build_redis_key


class RedisRateLimiter:
    """Redis 限流实现"""

    def __init__(self) -> None:
        self._key_prefix = "rate_limit"

    def _build_key(self, key: str) -> str:
        """构建限流键名"""
        full_key = f"{self._key_prefix}:{key}"
        return build_redis_key(full_key)

    async def is_allowed(self, key: str, limit: int, window: int) -> bool:
        """检查是否允许请求"""
        redis_key = self._build_key(key)
        current_time = int(time.time())
        redis = await redis_client.get_client()

        # 使用 Sorted Set 实现滑动窗口
        await redis.zremrangebyscore(redis_key, 0, current_time - window)
        count = await redis.zcard(redis_key)

        if count >= limit:
            return False

        await redis.zadd(
            redis_key, {f"{current_time}-{uuid.uuid4().hex[:8]}": current_time}
        )
        await redis.expire(redis_key, window + 1)

        return True

    async def reset(self, key: str) -> bool:
        """重置限流计数"""
        redis_key = self._build_key(key)
        redis = await redis_client.get_client()
        await redis.delete(redis_key)
        return True
