"""订阅 service FREE 档统一 real 测试（U4）。

真实资源依赖：
- MySQL: config_subscription_product / user_subscriptions（config 表只读）；双产品线用例另需 users / orders

覆盖：get_user_subscription_config 三分支（无行 / 过期 / user_id=0）按产品线
返回本线 free 配置且不新增 user_subscriptions 行；下单链路按 product_id 反查
（付费档唯一命中放行、未命中与 free 拒单）；双产品线并存与按天加时的线级隔离。
付费 SKU 跨线重名的歧义分支需要破坏 config 表唯一性合同才能构造，
由进程内验证覆盖（_resolve_checkout_product 纯函数 + 构造快照），不在本文件。
"""

import json
import httpx
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import cast
from uuid import uuid4

import pytest
from sqlalchemy import delete, func, select, text, update

from app.constants.order import (
    CallbackStatus,
    OrderCheckProductParam,
    OrderCreateParam,
    OrderStatus,
    ProductClass,
)
from app.constants.payment import recurring_provider_sku_parts
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    MAPS_API_PRODUCT_LINE,
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_LINE,
    ONLINE_GROWTH_PRODUCT_ID,
    ONLINE_LITE_PRODUCT_ID,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.database import get_async_session, get_engine
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.services.order_service import order_service
from app.services.payment_config_service import payment_config_service
from app.services.subscription_service import subscription_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DAY_MS = 86_400_000


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
async def real_dual_line_schema_ready(
    real_mysql_ready: None, real_redis_ready: None
) -> None:
    """检查双产品线用例需要的真实 MySQL 表与 Redis。"""

    required_tables = {
        "users",
        "orders",
        "config_subscription_product",
        "user_subscriptions",
    }
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


async def _get_subscription_row(
    user_id: int, product_line: str
) -> UserSubscriptionModel | None:
    """按复合主键读取真实订阅行。"""

    async with get_async_session() as db:
        return await db.get(UserSubscriptionModel, (user_id, product_line))


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
        assert config.period == "none"
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
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        payment_method="paypal",
        amount=12_990_000,
        currency="USD",
        auto_renew=False,
        period="month",
    )
    create_param = await order_service.check_product(param)

    assert create_param.product_id == UNLIMITED_SUBSCRIPTION_PRODUCT_ID
    assert create_param.amount == 12_990_000
    assert create_param.auto_renew is False
    assert create_param.provider_sku == "unlimited-paypal"


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
        auto_renew=False,
        period="month",
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
        auto_renew=False,
        period="none",
    )
    with pytest.raises(AppCommonException) as exc_info:
        await subscription_service.check_product(param)

    assert exc_info.value.code == CommonCode.PAYMENT_PRICE_UPDATED


async def test_real_dual_product_line_renewal_keeps_lines_isolated(
    real_async_client,
    real_user_factory,
    real_dual_line_schema_ready,
    make_test_email,
) -> None:
    """maps_extension 自动续费哨兵行与履约生成的 extension 一次性行并存，加时只作用目标线。"""

    email = make_test_email("dual-line-isolated")
    user_id, token = await real_user_factory(email)
    now_ms = timestamp_now()
    maps_expires_at = now_ms + 30 * _DAY_MS
    async with get_async_session() as db:
        # 哨兵行：maps_extension 线自动续费实例（真实商品当前计费模式）。
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=MAPS_EXTENSION_PRODUCT_LINE,
                product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                auto_renew=True,
                payment_method="clink",
                channel_subscription_id="sub_ext",
                channel_uid=f"cust-{user_id}",
                start_at=now_ms - 10 * _DAY_MS,
                expires_at=maps_expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()

    # 另一线经现有 OrderService 履约入口生成：当前可售 extension/unlimited 一次性月套餐。
    order = OrderModel(  # type: ignore[call-arg]
        order_no=f"ORDL{uuid4().hex[:20].upper()}",
        user_id=user_id,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        product_name="dual-line-isolated",
        amount=12_990_000,
        currency="USD",
        order_status=OrderStatus.PAID.value,
        callback_status=CallbackStatus.PENDING.value,
        payment_method="paypal",
        paid_amount=12_990_000,
        paid_currency="USD",
        paid_at=now_ms,
        expired_at=now_ms + _DAY_MS,
        extra_metadata=json.dumps(
            {
                "product_snapshot": {
                    "product_line": EXTENSION_PRODUCT_LINE,
                    "product_price_id": 999_004,
                    "auto_renew": False,
                    "period": "month",
                    "currency": "USD",
                    "amount": 12_990_000,
                    "provider_sku": None,
                }
            },
            separators=(",", ":"),
        ),
        created_at=now_ms,
        updated_at=now_ms,
    )
    stored_order = await order_service.create(order)
    assert await order_service.fulfill_paid_order(stored_order) is True

    async def _status(product_line: str) -> dict[str, object]:
        response = await real_async_client.get(
            "/api/client/subscription/status",
            params={"product_line": product_line},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == CommonCode.SUCCESS
        return body["data"]

    extension_row_before = await _get_subscription_row(user_id, EXTENSION_PRODUCT_LINE)
    assert extension_row_before is not None
    status_ext_before = await _status(EXTENSION_PRODUCT_LINE)
    status_maps_before = await _status(MAPS_EXTENSION_PRODUCT_LINE)
    assert status_ext_before["auto_renew"] is False
    assert status_ext_before["payment_method"] == "paypal"
    assert status_ext_before["expires_at"] == extension_row_before.expires_at
    assert status_maps_before["auto_renew"] is True
    assert status_maps_before["payment_method"] == "clink"
    assert status_maps_before["expires_at"] == maps_expires_at

    await subscription_service.extend_subscription_days(
        user_id=user_id,
        duration_days=7,
        product_line=MAPS_EXTENSION_PRODUCT_LINE,
        product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
    )

    maps_row_after = await _get_subscription_row(user_id, MAPS_EXTENSION_PRODUCT_LINE)
    extension_row_after = await _get_subscription_row(user_id, EXTENSION_PRODUCT_LINE)
    assert maps_row_after is not None
    assert maps_row_after.expires_at == maps_expires_at + 7 * _DAY_MS
    assert maps_row_after.auto_renew is True
    assert maps_row_after.payment_method == "clink"
    assert maps_row_after.channel_subscription_id == "sub_ext"
    assert maps_row_after.channel_uid == f"cust-{user_id}"
    assert extension_row_after is not None
    assert extension_row_after.to_dict() == extension_row_before.to_dict()

    status_ext_after = await _status(EXTENSION_PRODUCT_LINE)
    status_maps_after = await _status(MAPS_EXTENSION_PRODUCT_LINE)
    assert status_maps_after["expires_at"] == maps_expires_at + 7 * _DAY_MS
    assert status_maps_after["auto_renew"] is True
    assert status_ext_after == status_ext_before


@dataclass(frozen=True, slots=True)
class _UpgradeCleanupState:
    """记录本轮升级测试独占的 user_id，结束后删除其订阅行与订单。"""

    user_id: int


# PayPal 只接受两位小数（美分），对应 6 位精度整数下的最小倍数。
_PAYPAL_CENT_UNIT = 10_000


@pytest.fixture
async def real_upgrade_schema_ready(real_mysql_ready: None) -> None:
    """检查升级差额单测试需要的真实 MySQL 表（配置表只读）。"""

    required_tables = {
        "orders",
        "user_subscriptions",
        "config_payment_channel",
        "config_subscription_product",
        "config_subscription_product_price",
    }
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
async def real_upgrade_cleanup_state(
    real_upgrade_schema_ready: None,
) -> AsyncIterator[_UpgradeCleanupState]:
    """为升级测试分配独占 user_id，结束后清理其订阅行与订单。"""

    state = _UpgradeCleanupState(
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
            await db.execute(
                delete(OrderModel).where(OrderModel.user_id == state.user_id)
            )
            await db.commit()


async def _insert_paypal_lite_subscription(user_id: int) -> tuple[int, int]:
    """预置 maps_online Lite 有效订阅行，返回 (start_at, expires_at)。"""

    now_ms = timestamp_now()
    start_at = now_ms - 20 * _DAY_MS
    expires_at = now_ms + 10 * _DAY_MS
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=MAPS_ONLINE_PRODUCT_LINE,
                product_id=ONLINE_LITE_PRODUCT_ID,
                auto_renew=False,
                payment_method="paypal",
                start_at=start_at,
                expires_at=expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()
    return start_at, expires_at


async def _mark_order_paid(order_no: str, *, amount: int, currency: str) -> None:
    """把差额订单置为已支付待履约，模拟支付回调到达后的订单状态。"""

    now_ms = timestamp_now()
    async with get_async_session() as db:
        await db.execute(
            update(OrderModel)
            .where(OrderModel.order_no == order_no)
            .values(
                order_status=OrderStatus.PAID.value,
                callback_status=CallbackStatus.PENDING.value,
                paid_amount=amount,
                paid_currency=currency,
                paid_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()


async def test_real_upgrade_checkout_fulfills_tier_change_and_rejects_stale_snapshot(
    real_upgrade_cleanup_state: _UpgradeCleanupState,
) -> None:
    """一次性线升级差额单主路径：服务端定价冻结升级快照，履约条件换档且
    到期时间/账期起点保持；订阅行变化后旧快照条件更新不命中、不覆盖当前
    订阅并转履约失败人工路径。"""

    user_id = real_upgrade_cleanup_state.user_id
    start_at, expires_at = await _insert_paypal_lite_subscription(user_id)

    snapshot_config = await payment_config_service.get_snapshot()
    current_price = snapshot_config.prices.get((ONLINE_LITE_PRODUCT_ID, "paypal"))
    target_price = snapshot_config.prices.get((ONLINE_GROWTH_PRODUCT_ID, "paypal"))
    if current_price is None or target_price is None:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: maps_online PayPal 渠道价配置尚未初始化")

    async def _checkout_param() -> OrderCreateParam:
        return await subscription_service.prepare_upgrade_checkout_param(
            user_id=user_id,
            product_line=MAPS_ONLINE_PRODUCT_LINE,
            target_product_id=ONLINE_GROWTH_PRODUCT_ID,
            client_ip=None,
            language=None,
        )

    async def _create_order() -> OrderModel:
        return await order_service.create_order(await _checkout_param())

    order = await _create_order()
    assert order.product_class == ProductClass.SUBSCRIPTION.value
    assert order.product_id == ONLINE_GROWTH_PRODUCT_ID
    assert order.payment_method == "paypal"
    assert order.currency == "USD"

    metadata = json.loads(cast(str, order.extra_metadata))
    snapshot = metadata["product_snapshot"]
    assert snapshot["purpose"] == "upgrade"
    assert snapshot["product_line"] == MAPS_ONLINE_PRODUCT_LINE
    assert snapshot["source_product_id"] == ONLINE_LITE_PRODUCT_ID
    assert snapshot["target_product_id"] == ONLINE_GROWTH_PRODUCT_ID
    assert snapshot["base_expires_at"] == expires_at
    assert snapshot["upgrade_inputs"]["period_start"] == start_at
    assert 0 < snapshot["upgrade_inputs"]["remaining_ratio"] < 1
    assert snapshot["auto_renew"] is False
    assert snapshot["period"] == "month"

    # 金额与报价 owner 同链折算：剩余 10/30 期，向下取整到美分；
    # 服务端 now 比断言时刻略早，允许一个美分内的取整漂移。
    diff = target_price.amount - current_price.amount
    upper = diff * (expires_at - timestamp_now()) // (expires_at - start_at)
    upper = upper // _PAYPAL_CENT_UNIT * _PAYPAL_CENT_UNIT
    assert upper - _PAYPAL_CENT_UNIT < order.amount <= upper

    # 同一订阅行连续两笔差额单（并发场景）：快照冻结同一账期锚点。
    order_stale = await _create_order()
    stale_snapshot = json.loads(cast(str, order_stale.extra_metadata))[
        "product_snapshot"
    ]
    assert stale_snapshot["base_expires_at"] == expires_at

    await _mark_order_paid(order.order_no, amount=order.amount, currency=order.currency)
    paid_order = await order_service.get_order_by_no(order.order_no)
    assert paid_order is not None
    assert await order_service.fulfill_paid_order(paid_order) is True

    row = await subscription_service.get_subscription_row(
        user_id, MAPS_ONLINE_PRODUCT_LINE
    )
    assert row is not None
    assert row.product_id == ONLINE_GROWTH_PRODUCT_ID
    assert row.expires_at == expires_at
    assert row.start_at == start_at
    assert row.auto_renew is False
    assert row.payment_method == "paypal"

    # 订阅行在第二笔支付等待期内被加时：旧快照条件更新必须不命中，
    # 不覆盖当前订阅并转履约失败人工路径。
    mutated_expires_at = expires_at + _DAY_MS
    async with get_async_session() as db:
        await db.execute(
            update(UserSubscriptionModel)
            .where(
                UserSubscriptionModel.user_id == user_id,
                UserSubscriptionModel.product_line == MAPS_ONLINE_PRODUCT_LINE,
            )
            .values(expires_at=mutated_expires_at, updated_at=timestamp_now())
        )
        await db.commit()

    await _mark_order_paid(
        order_stale.order_no,
        amount=order_stale.amount,
        currency=order_stale.currency,
    )
    stale_paid_order = await order_service.get_order_by_no(order_stale.order_no)
    assert stale_paid_order is not None
    assert await order_service.fulfill_paid_order(stale_paid_order) is False

    row_after = await subscription_service.get_subscription_row(
        user_id, MAPS_ONLINE_PRODUCT_LINE
    )
    assert row_after is not None
    assert row_after.product_id == ONLINE_GROWTH_PRODUCT_ID
    assert row_after.expires_at == mutated_expires_at

    stale_after = await order_service.get_order_by_no(order_stale.order_no)
    assert stale_after is not None
    assert stale_after.callback_status == CallbackStatus.FAILED.value

    # PayPal 自动续费实例不参与换档，能力边界拒绝后不增加订单。
    async with get_async_session() as db:
        await db.execute(
            update(UserSubscriptionModel)
            .where(
                UserSubscriptionModel.user_id == user_id,
                UserSubscriptionModel.product_line == MAPS_ONLINE_PRODUCT_LINE,
            )
            .values(
                product_id=ONLINE_LITE_PRODUCT_ID,
                auto_renew=True,
                updated_at=timestamp_now(),
            )
        )
        await db.commit()
    with pytest.raises(AppCommonException) as exc_info:
        await _checkout_param()
    assert exc_info.value.code == CommonCode.INVALID_REQUEST
    assert exc_info.value.data == {"reason": "channel_unavailable"}
    async with get_async_session() as db:
        order_count = await db.scalar(
            select(func.count())
            .select_from(OrderModel)
            .where(OrderModel.user_id == user_id)
        )
    assert order_count == 2


async def test_real_paypal_plan_change_event_syncs_local_tier_once(
    real_upgrade_cleanup_state: _UpgradeCleanupState,
    real_redis_ready: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """PayPal 换价事件收敛：custom_id 定位首单 → 主键核对订阅行 → 换档。

    渠道 GET subscription 是不可控外部出口，用明确响应的 MockTransport
    替换；首单定位、订阅行核对、plan 唯一映射与幂等收敛走真实 MySQL 与
    配置快照。
    """

    user_id = real_upgrade_cleanup_state.user_id
    now_ms = timestamp_now()
    order_no = f"ORPC{uuid4().hex[:18].upper()}"
    subscription_id = f"sub-{uuid4().hex[:12]}"
    expires_at = now_ms + 15 * _DAY_MS

    snapshot = await payment_config_service.get_snapshot()
    target_price = snapshot.prices.get((MAPS_EXTENSION_BUSINESS_PRODUCT_ID, "paypal"))
    if target_price is None:
        pytest.skip(
            "REAL_SCHEMA_UNAVAILABLE: maps_extension_business PayPal 渠道价未初始化"
        )

    async with get_async_session() as db:
        db.add(
            OrderModel(  # type: ignore[call-arg]
                order_no=order_no,
                user_id=user_id,
                product_class=ProductClass.SUBSCRIPTION.value,
                product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                product_name="paypal-plan-change-sync",
                amount=target_price.amount,
                currency="USD",
                order_status=OrderStatus.PAID.value,
                callback_status=CallbackStatus.SUCCESS.value,
                payment_method="paypal",
                paid_amount=target_price.amount,
                paid_currency="USD",
                paid_at=now_ms,
                expired_at=now_ms + _DAY_MS,
                extra_metadata=json.dumps(
                    {
                        "product_snapshot": {
                            "product_line": MAPS_EXTENSION_PRODUCT_LINE,
                            "product_price_id": 0,
                            "auto_renew": True,
                            "period": "month",
                            "currency": "USD",
                            "amount": target_price.amount,
                            "provider_sku": None,
                        },
                        "test_run_id": order_no,
                    },
                    separators=(",", ":"),
                ),
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=MAPS_EXTENSION_PRODUCT_LINE,
                product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                auto_renew=True,
                payment_method="paypal",
                channel_subscription_id=subscription_id,
                start_at=now_ms,
                expires_at=expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()

    plan_sku_parts = recurring_provider_sku_parts("paypal", target_price.provider_sku)
    assert plan_sku_parts is not None
    plan_id = plan_sku_parts[0]

    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200, json={"access_token": "pytest-token", "expires_in": 30}
            )
        if request.url.path == f"/v1/billing/subscriptions/{subscription_id}":
            assert request.headers["Authorization"] == "Bearer pytest-token"
            return httpx.Response(
                200,
                json={
                    "id": subscription_id,
                    "status": "ACTIVE",
                    "plan_id": plan_id,
                    "custom_id": order_no,
                    "billing_info": {
                        "next_billing_time": "2026-10-02T12:00:00Z",
                        "last_payment": {"time": "2026-09-02T12:00:00Z"},
                    },
                },
            )
        raise AssertionError(f"unexpected PayPal request: {request.url.path}")

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(timeout=timeout, transport=httpx.MockTransport(handler))

    monkeypatch.setattr(
        "app.provider.payment.paypal.httpx.AsyncClient",
        client_factory,
    )

    synced = await subscription_service.sync_plan_from_channel(
        payment_method="paypal",
        channel_subscription_id=subscription_id,
    )
    assert synced is True

    row = await subscription_service.get_subscription_row(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )
    assert row is not None
    assert row.product_id == MAPS_EXTENSION_BUSINESS_PRODUCT_ID
    assert row.expires_at == expires_at
    assert row.auto_renew is True
    assert row.payment_method == "paypal"
    assert row.channel_subscription_id == subscription_id

    # 重复事件幂等：plan 已映射到行内档位，收敛不再写库。
    synced_again = await subscription_service.sync_plan_from_channel(
        payment_method="paypal",
        channel_subscription_id=subscription_id,
    )
    assert synced_again is False


async def test_real_clink_confirm_idempotent_when_channel_already_at_target(
    real_upgrade_cleanup_state: _UpgradeCleanupState,
    real_redis_ready: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Clink confirm 完整幂等：渠道/本地已目标时不再扣款，直接同步完成。

    渠道 GET Subscription 是不可控外部出口，用明确响应的 MockTransport
    替换；preview/confirm 端点被触碰即失败，证明幂等路径不发起扣款。
    """

    user_id = real_upgrade_cleanup_state.user_id
    now_ms = timestamp_now()
    order_no = f"ORCI{uuid4().hex[:18].upper()}"
    subscription_id = f"sub-{uuid4().hex[:12]}"
    expires_at = now_ms + 20 * _DAY_MS

    snapshot = await payment_config_service.get_snapshot()
    target_price = snapshot.prices.get((MAPS_EXTENSION_BUSINESS_PRODUCT_ID, "clink"))
    if target_price is None:
        pytest.skip(
            "REAL_SCHEMA_UNAVAILABLE: maps_extension_business Clink 渠道价未初始化"
        )
    target_sku = recurring_provider_sku_parts("clink", target_price.provider_sku)
    assert target_sku is not None

    async with get_async_session() as db:
        db.add(
            OrderModel(  # type: ignore[call-arg]
                order_no=order_no,
                user_id=user_id,
                product_class=ProductClass.SUBSCRIPTION.value,
                product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                product_name="clink-confirm-idempotent",
                amount=target_price.amount,
                currency="USD",
                order_status=OrderStatus.PAID.value,
                callback_status=CallbackStatus.SUCCESS.value,
                payment_method="clink",
                paid_amount=target_price.amount,
                paid_currency="USD",
                paid_at=now_ms,
                expired_at=now_ms + _DAY_MS,
                extra_metadata=json.dumps(
                    {
                        "product_snapshot": {
                            "product_line": MAPS_EXTENSION_PRODUCT_LINE,
                            "product_price_id": 0,
                            "auto_renew": True,
                            "period": "month",
                            "currency": "USD",
                            "amount": target_price.amount,
                            "provider_sku": None,
                        },
                        "test_run_id": order_no,
                    },
                    separators=(",", ":"),
                ),
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=MAPS_EXTENSION_PRODUCT_LINE,
                product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                auto_renew=True,
                payment_method="clink",
                channel_subscription_id=subscription_id,
                start_at=now_ms,
                expires_at=expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()

    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == f"/api/subscription/{subscription_id}":
            assert request.headers["X-API-Key"]
            return httpx.Response(
                200,
                json={
                    "code": 200,
                    "data": {
                        "subscriptionId": subscription_id,
                        "merchantReference": order_no,
                        "productId": target_sku[0],
                        "priceId": target_sku[1],
                        "currency": "USD",
                        "status": "active",
                    },
                },
            )
        # 渠道已目标时 preview/confirm 不得被触碰（重复扣款）。
        raise AssertionError(f"unexpected Clink request: {request.url.path}")

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(timeout=timeout, transport=httpx.MockTransport(handler))

    monkeypatch.setattr(
        "app.provider.payment.clink.httpx.AsyncClient",
        client_factory,
    )

    # 渠道完整 productId:priceId 已目标：GET 后直接同步本地，succeeded。
    result = await subscription_service.confirm_upgrade(
        user_id=user_id,
        product_line=MAPS_EXTENSION_PRODUCT_LINE,
        target_product_id=MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    )
    assert result["status"] == "succeeded"
    assert result["action"] is None

    row = await subscription_service.get_subscription_row(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )
    assert row is not None
    assert row.product_id == MAPS_EXTENSION_BUSINESS_PRODUCT_ID
    assert row.expires_at == expires_at
    assert row.auto_renew is True
    assert row.channel_subscription_id == subscription_id

    # 本地已目标档：重复 confirm 幂等命中，不发起任何渠道调用。
    result_again = await subscription_service.confirm_upgrade(
        user_id=user_id,
        product_line=MAPS_EXTENSION_PRODUCT_LINE,
        target_product_id=MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    )
    assert result_again["status"] == "succeeded"
    assert result_again["action"] is None
