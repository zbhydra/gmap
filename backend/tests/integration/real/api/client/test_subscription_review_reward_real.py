"""好评赠送订阅 API real 测试。

真实资源依赖：
- MySQL: users / counter_user_lifetime / user_subscriptions / 订阅支付配置表
- Redis: 用户 access token 白名单与账号级领取锁

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
GET /api/client/subscription/checkout-configs | Y | optional-auth | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A
POST /api/client/subscription/review-reward/claim | Y | Y | no-body | no-body | no-body | no-body | no-body | no-body | no-body | Y
"""

import asyncio
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass, field

import pytest
from sqlalchemy import delete, select, text

from app.constants.auth import TokenType
from app.constants.counter import CounterId
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.counter_user_lifetime_model import CounterUserLifetimeModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_model import UserModel
from app.services.counter_service import counter_service
from app.services.user_service import UserService
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit
from app.utils.redis_lock import RedisLock
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DAY_MS = 24 * 60 * 60 * 1000
_REVIEW_REWARD_DAYS = 7


@dataclass(slots=True)
class _CleanupState:
    """记录本文件创建的真实测试用户。"""

    users: list[tuple[int, str]] = field(default_factory=list)


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


async def _delete_review_reward_user(user_id: int) -> None:
    """按 Counter、订阅、用户顺序清理测试数据与 Redis token。"""

    await user_token_service.revoke_all_user_tokens(user_id)
    async with get_async_session() as db:
        await db.execute(
            delete(CounterUserLifetimeModel).where(
                CounterUserLifetimeModel.user_id == user_id
            )
        )
        await db.execute(
            delete(UserSubscriptionModel).where(
                UserSubscriptionModel.user_id == user_id  # type: ignore[arg-type]
            )
        )
        await db.execute(delete(UserModel).where(UserModel.user_id == user_id))
        await db.commit()


async def _create_real_access_token(user_id: int, email: str) -> str:
    """创建真实 JWT，并写入 Redis token 白名单。"""

    token, expires_at = JwtUnit.create_access_token(
        JwtData(user_id=user_id, email=email)
    )
    await user_token_service.store_token(
        token,
        user_id,
        TokenType.USER_ACCESS,
        expires_at,
    )
    return token


async def _create_user_and_headers(
    email: str,
    state: _CleanupState,
) -> tuple[UserModel, dict[str, str]]:
    """创建真实用户和严格鉴权请求头。"""

    user = await UserService().create_user_without_password(email=email)
    state.users.append((user.user_id, email))
    token = await _create_real_access_token(user.user_id, email)
    return user, {"Authorization": f"Bearer {token}"}


async def _subscription_expires_at(user_id: int) -> int | None:
    """读取真实订阅到期时间。"""

    async with get_async_session() as db:
        return await db.scalar(
            select(  # type: ignore[call-overload]
                UserSubscriptionModel.expires_at
            ).where(
                UserSubscriptionModel.user_id == user_id  # type: ignore[arg-type]
            )
        )


@pytest.fixture
async def real_review_reward_schema_ready(real_mysql_ready, real_redis_ready) -> None:
    """检查好评赠送 real 测试需要的真实表。"""

    required_tables = {
        "users",
        "counter_user_lifetime",
        "user_subscriptions",
        "config_payment_channel",
        "config_subscription_product",
        "config_subscription_product_price",
    }
    missing = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_review_reward_cleanup_state(
    real_review_reward_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """清理本文件创建的真实测试数据。"""

    state = _CleanupState()
    try:
        yield state
    finally:
        for user_id, _email in state.users:
            await _delete_review_reward_user(user_id)


@pytest.fixture
def make_review_reward_email(
    real_review_reward_cleanup_state: _CleanupState,
    make_test_email: Callable[[str], str],
) -> Callable[[str], str]:
    """生成本文件使用的唯一测试邮箱。"""

    return make_test_email


async def test_real_review_reward_checkout_configs_return_anonymous_and_account_counts(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """公开配置匿名返回零，登录账号返回永久 Counter。"""

    anonymous_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs"
    )
    invalid_token_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs",
        headers={"Authorization": "Bearer invalid-review-reward-token"},
    )
    email = make_review_reward_email("review-config")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    await counter_service.add(
        user.user_id,
        CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        2,
    )
    account_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs",
        headers=headers,
    )

    assert anonymous_response.status_code == 200
    assert anonymous_response.json()["code"] == 10000
    assert anonymous_response.json()["data"]["review_reward_enabled"] is True
    assert anonymous_response.json()["data"]["review_reward_claimed_count"] == 0
    assert invalid_token_response.status_code == 200
    assert invalid_token_response.json()["code"] == 10000
    assert invalid_token_response.json()["data"]["review_reward_enabled"] is True
    assert invalid_token_response.json()["data"]["review_reward_claimed_count"] == 0
    assert account_response.status_code == 200
    assert account_response.json()["code"] == 10000
    assert account_response.json()["data"]["review_reward_enabled"] is True
    assert account_response.json()["data"]["review_reward_claimed_count"] == 2


async def test_real_review_reward_checkout_configs_treat_revoked_token_as_anonymous(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """Redis 已撤销的有效 JWT 不得再暴露账号永久 Counter。"""

    email = make_review_reward_email("review-config-revoked")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    await counter_service.add(
        user.user_id,
        CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        2,
    )
    token = headers["Authorization"].removeprefix("Bearer ")
    revoked = await user_token_service.revoke_token(
        token,
        user.user_id,
        TokenType.USER_ACCESS,
    )

    response = await real_async_client.get(
        "/api/client/subscription/checkout-configs",
        headers=headers,
    )

    assert revoked is True
    assert response.status_code == 200
    assert response.json()["code"] == 10000
    assert response.json()["data"]["review_reward_claimed_count"] == 0


async def test_real_review_reward_first_claim_creates_seven_day_subscription(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """无订阅账号首次领取只写一次 Counter，并从当前时间增加七天。"""

    email = make_review_reward_email("review-first")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    before_ms = timestamp_now()
    response = await real_async_client.post(
        "/api/client/subscription/review-reward/claim",
        headers=headers,
    )
    after_ms = timestamp_now()

    assert response.status_code == 200
    assert response.json()["code"] == 10000
    assert response.json()["data"] == {
        "result": "granted",
        "review_reward_claimed_count": 1,
    }
    assert (
        await counter_service.get(
            user.user_id,
            CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        )
        == 1
    )
    expires_at = await _subscription_expires_at(user.user_id)
    assert expires_at is not None
    assert before_ms + _REVIEW_REWARD_DAYS * _DAY_MS <= expires_at
    assert expires_at <= after_ms + _REVIEW_REWARD_DAYS * _DAY_MS


async def test_real_review_reward_claim_extends_active_subscription_once(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """有效订阅从原到期时间精确加七天，重复领取不再修改。"""

    email = make_review_reward_email("review-active")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    original_expires_at = timestamp_now() + 3 * _DAY_MS
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user.user_id,
                expires_at=original_expires_at,
            )
        )
        await db.commit()

    first_response = await real_async_client.post(
        "/api/client/subscription/review-reward/claim",
        headers=headers,
    )
    second_response = await real_async_client.post(
        "/api/client/subscription/review-reward/claim",
        headers=headers,
    )

    expected_expires_at = original_expires_at + _REVIEW_REWARD_DAYS * _DAY_MS
    assert first_response.status_code == 200
    assert first_response.json()["code"] == 10000
    assert first_response.json()["data"]["result"] == "granted"
    assert second_response.status_code == 200
    assert second_response.json()["code"] == 10000
    assert second_response.json()["data"] == {
        "result": "already_claimed",
        "review_reward_claimed_count": 1,
    }
    assert await _subscription_expires_at(user.user_id) == expected_expires_at
    assert (
        await counter_service.get(
            user.user_id,
            CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        )
        == 1
    )


async def test_real_review_reward_concurrent_claims_only_extend_once(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """同账号并发领取最多一个 granted，最终只增加七天。"""

    email = make_review_reward_email("review-concurrent")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    before_ms = timestamp_now()
    responses = await asyncio.gather(
        *(
            real_async_client.post(
                "/api/client/subscription/review-reward/claim",
                headers=headers,
            )
            for _ in range(2)
        )
    )
    after_ms = timestamp_now()

    bodies = [response.json() for response in responses]
    assert all(response.status_code == 200 for response in responses)
    assert all(
        body["code"] in {10000, CommonCode.SUBSCRIPTION_REVIEW_REWARD_BUSY.value}
        for body in bodies
    )
    assert (
        sum(
            body["code"] == 10000 and body["data"].get("result") == "granted"
            for body in bodies
        )
        == 1
    )
    assert (
        await counter_service.get(
            user.user_id,
            CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        )
        == 1
    )
    expires_at = await _subscription_expires_at(user.user_id)
    assert expires_at is not None
    assert before_ms + _REVIEW_REWARD_DAYS * _DAY_MS <= expires_at
    assert expires_at <= after_ms + _REVIEW_REWARD_DAYS * _DAY_MS


async def test_real_review_reward_preoccupied_lock_has_no_database_side_effect(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """预占账号锁时返回繁忙，Counter 与订阅均不写入。"""

    email = make_review_reward_email("review-busy")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    lock = RedisLock()
    lock_key = f"subscription_review_reward:{user.user_id}"
    lock_value = await lock.acquire(lock_key, ttl=5)
    assert lock_value is not None
    try:
        response = await real_async_client.post(
            "/api/client/subscription/review-reward/claim",
            headers=headers,
        )
    finally:
        await lock.release(lock_key, lock_value)

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUBSCRIPTION_REVIEW_REWARD_BUSY
    assert (
        await counter_service.get(
            user.user_id,
            CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        )
        == 0
    )
    assert await _subscription_expires_at(user.user_id) is None


async def test_real_review_reward_claim_requires_login(
    real_async_client,
    real_review_reward_schema_ready,
) -> None:
    """无登录态不能调用领取接口。"""

    response = await real_async_client.post(
        "/api/client/subscription/review-reward/claim"
    )

    # HTTPBearer 在进入业务 handler 前直接拒绝，响应不经过业务错误信封。
    assert response.status_code == 401
