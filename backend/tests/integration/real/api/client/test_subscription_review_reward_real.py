"""好评赠送订阅 API real 测试（活动已下线，接口屏蔽态）。

真实资源依赖：
- MySQL: users / counter_user_lifetime / user_subscriptions / 订阅支付配置表
- Redis: 用户 access token 白名单

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
GET /api/client/subscription/checkout-configs | Y | optional-auth | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A
POST /api/client/subscription/review-reward/claim | 屏蔽态 | Y | no-body | no-body | no-body | no-body | no-body | no-body | no-body | Y(无写入)
"""

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

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


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


async def _subscription_exists(user_id: int) -> bool:
    """判断真实订阅记录是否已写入。"""

    async with get_async_session() as db:
        expires_at = await db.scalar(
            select(  # type: ignore[call-overload]
                UserSubscriptionModel.expires_at
            ).where(
                UserSubscriptionModel.user_id == user_id  # type: ignore[arg-type]
            )
        )
        return expires_at is not None


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


async def test_real_review_reward_checkout_configs_report_disabled(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """活动下线后匿名与登录响应均固定 enabled=false、次数 0。"""

    anonymous_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs"
    )

    email = make_review_reward_email("review-disabled")
    _user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )
    account_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs",
        headers=headers,
    )

    for response in (anonymous_response, account_response):
        assert response.status_code == 200
        assert response.json()["code"] == CommonCode.SUCCESS
        assert response.json()["data"]["review_reward_enabled"] is False
        assert response.json()["data"]["review_reward_claimed_count"] == 0


async def test_real_review_reward_claim_rejected_without_side_effect(
    real_async_client,
    make_review_reward_email: Callable[[str], str],
    real_review_reward_cleanup_state: _CleanupState,
) -> None:
    """登录账号调用 claim 直接返回 INVALID_REQUEST，Counter 与订阅不写入。"""

    email = make_review_reward_email("review-blocked")
    user, headers = await _create_user_and_headers(
        email,
        real_review_reward_cleanup_state,
    )

    response = await real_async_client.post(
        "/api/client/subscription/review-reward/claim",
        headers=headers,
    )

    assert response.status_code == 400
    assert response.json()["code"] == CommonCode.INVALID_REQUEST
    assert (
        await counter_service.get(
            user.user_id,
            CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        )
        == 0
    )
    assert not await _subscription_exists(user.user_id)
