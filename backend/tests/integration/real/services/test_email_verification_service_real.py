"""邮箱验证码服务使用真实 Redis 的一次性消费回归测试。"""

import pytest

from app.constants.auth import EMAIL_VERIFY_CODE_EXPIRE_SECONDS
from app.core.redis import redis_client
from app.services.email_verification_service import email_verification_service
from app.utils.redis_key import build_redis_key
from app.utils.redis_lock import RedisLock

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_verify_lock_timeout_preserves_code_then_consumes_once(
    real_redis_ready: None,
    test_run_id: str,
) -> None:
    """锁竞争失败不消费验证码，释放锁后验证码只能成功消费一次。"""

    email = f"email-lock-{test_run_id}@example.com"
    code = "123456"
    verification_key = build_redis_key(f"email_verify:{email}")
    lock_key = f"email_verify:{email}"
    lock = RedisLock()
    redis = await redis_client.get_client()
    await redis.set(
        verification_key,
        code,
        ex=EMAIL_VERIFY_CODE_EXPIRE_SECONDS,
    )

    lock_value: str | None = None
    try:
        lock_value = await lock.acquire(lock_key, ttl=5, timeout=1)
        assert lock_value is not None

        assert await email_verification_service.verify_code(email, code) is False
        assert await redis.get(verification_key) == code
        await lock.release(lock_key, lock_value)
        lock_value = None

        assert await email_verification_service.verify_code(email, code) is True
        assert await email_verification_service.verify_code(email, code) is False
        assert await redis.get(verification_key) is None
    finally:
        if lock_value is not None:
            await lock.release(lock_key, lock_value)
        await email_verification_service.clear_verify_data(email)
