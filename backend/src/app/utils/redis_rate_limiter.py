"""Redis 限流实现"""

import time
import uuid

from app.core.redis import redis_client
from app.utils.redis_key import build_redis_key

_ALLOW_REQUEST_SCRIPT = """
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, ARGV[1] - ARGV[2])
if redis.call("ZCARD", KEYS[1]) >= tonumber(ARGV[3]) then
    return 0
end
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[4])
redis.call("EXPIRE", KEYS[1], ARGV[2] + 1)
return 1
"""


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

        result = await redis.eval(  # type: ignore[misc]
            _ALLOW_REQUEST_SCRIPT,
            1,
            redis_key,
            current_time,
            window,
            limit,
            f"{current_time}-{uuid.uuid4().hex[:8]}",
        )
        return int(result) == 1

    async def reset(self, key: str) -> bool:
        """重置限流计数"""
        redis_key = self._build_key(key)
        redis = await redis_client.get_client()
        await redis.delete(redis_key)
        return True
