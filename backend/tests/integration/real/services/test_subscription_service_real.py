"""订阅 service FREE 档统一 real 测试（U4）。

真实资源依赖：
- MySQL: config_subscription_product / user_subscriptions（config 表只读）

覆盖：get_user_subscription_config 三分支（无行 / 过期 / user_id=0）按产品线
返回本线 free 配置且不新增 user_subscriptions 行；下单链路按 product_id 反查
（付费档唯一命中放行、未命中与 free 拒单）。
付费 SKU 跨线重名的歧义分支需要破坏 config 表唯一性合同才能构造，
由进程内验证覆盖（_resolve_checkout_product 纯函数 + 构造快照），不在本文件。
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass
from uuid import uuid4

import pytest
from sqlalchemy import delete, func, select, text

from app.constants.order import OrderCheckProductParam
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    MAPS_API_PRODUCT_LINE,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_LINE,
)
from app.core.database import get_async_session, get_engine
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.services.subscription_service import subscription_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass(frozen=True, slots=True)
class _FreeTierCleanupState:
    """记录本轮测试独占的 user_id，结束后删除其全部订阅行。"""

    user_id: int


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


@pytest.fixture
async def real_free_tier_schema_ready(real_mysql_ready: None) -> None:
    """检查 FREE 档测试需要的真实 MySQL 表。"""

    required_tables = {"config_subscription_product", "user_subscriptions"}
    missing_tables = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing_tables:
        pytest.skip(
            f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing_tables)} 表"
        )


@pytest.fixture
async def real_free_tier_cleanup_state(
    real_free_tier_schema_ready: None,
) -> AsyncIterator[_FreeTierCleanupState]:
    """为测试分配独占 user_id，结束后清理其订阅行。"""

    state = _FreeTierCleanupState(
        user_id=9_100_000_000_000 + uuid4().int % 1_000_000_000_000,
    )
    try:
        yield state
    finally:
        async with get_async_session() as db:
            await db.execute(
                delete(UserSubscriptionModel).where(
                    UserSubscriptionModel.user_id == state.user_id
                )
            )
            await db.commit()


async def _count_subscription_rows(user_id: int) -> int:
    """统计指定用户在 user_subscriptions 的行数。"""

    async with get_async_session() as db:
        result = await db.execute(
            select(func.count())
            .select_from(UserSubscriptionModel)
            .where(UserSubscriptionModel.user_id == user_id)
        )
        return int(result.scalar_one())


async def _insert_subscription_row(
    user_id: int,
    product_line: str,
    product_id: str,
    expires_at: int | None,
) -> None:
    """预置一条订阅行（过期或有效），由 fixture 负责清理。"""

    now_ms = timestamp_now()
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=product_line,
                product_id=product_id,
                expires_at=expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()


async def test_real_free_tier_config_returns_line_local_free_for_anonymous(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """user_id=0 分支：四条产品线各自返回本线 free 配置，不落订阅表。"""

    expectations = {
        EXTENSION_PRODUCT_LINE: {"monthly_quota": None, "daily_limit": 5},
        MAPS_EXTENSION_PRODUCT_LINE: {"monthly_quota": 1000, "daily_limit": None},
        MAPS_ONLINE_PRODUCT_LINE: {"monthly_quota": 1000, "daily_limit": None},
        MAPS_API_PRODUCT_LINE: {"monthly_quota": 20, "daily_limit": None},
    }
    for product_line, expected in expectations.items():
        subscription, config = await subscription_service.get_user_subscription_config(
            0, product_line
        )
        assert subscription.user_id == 0
        assert subscription.expires_at is None
        assert config.product_line == product_line
        assert config.product_id == "free"
        assert config.period == "free"
        # 按线隔离的裂缝修复验证：maps 线 free 不再误读 extension 线的
        # daily_limit，extension 线 free 不携带 monthly_quota。
        assert config.metadata.get("monthly_quota") == expected["monthly_quota"]
        assert config.metadata.get("daily_limit") == expected["daily_limit"]


async def test_real_free_tier_config_missing_row_returns_free(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """无权益行分支：按线构造内存 FREE 订阅并返回本线 free 配置，不新增行。"""

    user_id = real_free_tier_cleanup_state.user_id
    assert await _count_subscription_rows(user_id) == 0

    subscription, config = await subscription_service.get_user_subscription_config(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )

    assert subscription.user_id == user_id
    assert subscription.product_line == MAPS_EXTENSION_PRODUCT_LINE
    assert subscription.expires_at is None
    assert config.product_line == MAPS_EXTENSION_PRODUCT_LINE
    assert config.product_id == "free"
    assert config.metadata["monthly_quota"] == 1000

    assert await _count_subscription_rows(user_id) == 0


async def test_real_free_tier_config_expired_row_returns_free(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """已过期分支：过期行不复活档位，按线返回 free 配置。"""

    user_id = real_free_tier_cleanup_state.user_id
    await _insert_subscription_row(
        user_id,
        MAPS_EXTENSION_PRODUCT_LINE,
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        expires_at=timestamp_now() - 3_600_000,
    )
    assert await _count_subscription_rows(user_id) == 1

    subscription, config = await subscription_service.get_user_subscription_config(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )

    assert subscription.expires_at is None
    assert config.product_id == "free"
    assert config.metadata["monthly_quota"] == 1000
    # 过期行保留在表中，但未新增行（一行 = 一个产品线）。
    assert await _count_subscription_rows(user_id) == 1


async def test_real_free_tier_config_active_row_uses_row_product_id(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """有效权益行分支：档位取行内 product_id（本线付费档配置）。"""

    user_id = real_free_tier_cleanup_state.user_id
    await _insert_subscription_row(
        user_id,
        MAPS_EXTENSION_PRODUCT_LINE,
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        expires_at=timestamp_now() + 86_400_000,
    )

    subscription, config = await subscription_service.get_user_subscription_config(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )

    assert subscription.expires_at is not None
    assert config.product_id == MAPS_EXTENSION_PRO_PRODUCT_ID
    assert config.metadata["monthly_quota"] == 100_000


async def test_real_check_product_paid_sku_resolves_unique_product(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """下单链路：付费 SKU 按 product_id 反查唯一命中并通过验价。"""

    param = OrderCheckProductParam(
        user_id=real_free_tier_cleanup_state.user_id,
        product_class=2,
        product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
        payment_method="paypal",
        amount=39_000_000,
        currency="USD",
    )
    create_param = await subscription_service.check_product(param)

    assert create_param.product_id == MAPS_EXTENSION_PRO_PRODUCT_ID
    assert create_param.amount == 39_000_000
    assert create_param.auto_renew is True
    assert create_param.provider_sku == "maps_extension_pro-monthly-paypal"


async def test_real_check_product_unknown_product_id_rejected(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """下单链路：product_id 反查未命中按 PAYMENT_PRICE_UPDATED 拒绝。"""

    param = OrderCheckProductParam(
        user_id=real_free_tier_cleanup_state.user_id,
        product_class=2,
        product_id=f"no_such_sku_{uuid4().hex[:8]}",
        payment_method="paypal",
        amount=1_000_000,
        currency="USD",
    )
    with pytest.raises(AppCommonException) as exc_info:
        await subscription_service.check_product(param)

    assert exc_info.value.code == CommonCode.PAYMENT_PRICE_UPDATED


async def test_real_check_product_free_not_purchasable(
    real_free_tier_cleanup_state: _FreeTierCleanupState,
) -> None:
    """下单链路：free 各线同名反查不产生可购买目标，按拒单保护拒绝。"""

    param = OrderCheckProductParam(
        user_id=real_free_tier_cleanup_state.user_id,
        product_class=2,
        product_id="free",
        payment_method="paypal",
        amount=0,
        currency="USD",
    )
    with pytest.raises(AppCommonException) as exc_info:
        await subscription_service.check_product(param)

    assert exc_info.value.code == CommonCode.PAYMENT_PRICE_UPDATED
