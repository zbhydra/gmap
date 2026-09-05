"""订阅下单契约 real 测试：checkout 方案序列化与下单新参数校验。

真实资源依赖：
- MySQL: users / orders / 订阅支付配置表（配置只读）
- Redis: 用户 access token 白名单
"""

import pytest
from sqlalchemy import func, select, text

from app.constants.order import ProductClass
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_model import UserModel
from app.services.payment_config_service import payment_config_service
from app.services.subscription_service import subscription_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DAY_MS = 24 * 3600 * 1000
# PayPal 只接受两位小数（美分），对应 6 位精度整数下的最小倍数。
_PAYPAL_CENT_UNIT = 10_000


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
async def real_subscription_order_schema_ready(
    real_mysql_ready, real_redis_ready
) -> None:
    """检查订阅下单 real 测试需要的真实表。"""

    required_tables = {
        "users",
        "orders",
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


def _unlimited_paypal_price(
    plans: list[dict[str, object]],
) -> tuple[dict[str, object], dict[str, object]]:
    """从 checkout 方案里取 extension 线 unlimited 的 PayPal 渠道价。"""

    plan = next(
        item
        for item in plans
        if item["product_line"] == "extension" and item["product_id"] == "unlimited"
    )
    channel = next(
        item
        for item in plan["payment_channels"]  # type: ignore[union-attr]
        if item["payment_method"] == "paypal"  # type: ignore[index,union-attr]
    )
    return plan, channel  # type: ignore[return-value]


async def test_real_subscription_checkout_configs_serialize_product_level_billing(
    real_async_client,
    real_subscription_order_schema_ready,
) -> None:
    """checkout 方案透出商品级单一计费模式与价格行 ID。"""

    response = await real_async_client.get("/api/client/subscription/checkout-configs")
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.SUCCESS
    plans = body["data"]["checkout_configs"]
    if not plans:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 订阅商品展示配置尚未初始化")
    plan, paypal = _unlimited_paypal_price(plans)

    assert plan["product_class"] == ProductClass.SUBSCRIPTION.value
    assert plan["period"] == "month"
    assert plan["auto_renew"] is False
    assert plan["display_currency"] == "USD"
    assert isinstance(plan["display_amount"], int) and plan["display_amount"] > 0

    assert paypal["product_price_id"] > 0
    assert paypal["currency"] == "USD"
    assert isinstance(paypal["amount"], int) and paypal["amount"] > 0


async def test_real_subscription_order_rejects_mismatched_billing_mode_without_order(
    real_async_client,
    make_test_email,
    real_user_factory,
    real_subscription_order_schema_ready,
) -> None:
    """绕过前端提交与商品单一计费模式不一致的请求，按价格已更新拒绝且不落订单。"""

    email = make_test_email("sub-billing-mismatch")
    _user_id, token = await real_user_factory(email)

    config_response = await real_async_client.get(
        "/api/client/subscription/checkout-configs"
    )
    plans = config_response.json()["data"]["checkout_configs"]
    if not plans:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 订阅商品展示配置尚未初始化")
    _plan, paypal = _unlimited_paypal_price(plans)

    response = await real_async_client.post(
        "/api/client/order/create",
        json={
            "product_class": ProductClass.SUBSCRIPTION.value,
            "product_id": "unlimited",
            "payment_method": paypal["payment_method"],
            "currency": paypal["currency"],
            "amount": paypal["amount"],
            "auto_renew": True,
            "period": "month",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.PAYMENT_PRICE_UPDATED.value
    assert body["data"]["product_id"] == "unlimited"

    async with get_async_session() as db:
        user_id = await db.scalar(
            select(UserModel.user_id).where(UserModel.email == email)
        )
        order_count = await db.scalar(
            select(func.count())
            .select_from(OrderModel)
            .where(OrderModel.user_id == user_id)
        )
    assert order_count == 0


async def test_real_subscription_upgrade_quote_prorates_one_time_diff(
    real_async_client,
    make_test_email,
    real_user_factory,
    real_subscription_order_schema_ready,
) -> None:
    """一次性线升级报价主路径：tier 判高、剩余占比折算与美分向下取整。"""

    email = make_test_email("sub-upgrade-quote")
    user_id, token = await real_user_factory(email)

    now = timestamp_now()
    start_at = now - 20 * _DAY_MS
    expires_at = now + 10 * _DAY_MS
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line="maps_online",
                product_id="online_lite",
                auto_renew=False,
                payment_method="paypal",
                start_at=start_at,
                expires_at=expires_at,
            )
        )
        await db.commit()

    response = await real_async_client.get(
        "/api/client/subscription/upgrade-quote",
        params={"product_line": "maps_online", "target_product_id": "online_growth"},
        headers={"Authorization": f"Bearer {token}"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.SUCCESS
    data = body["data"]
    assert set(data) == {
        "available",
        "reason",
        "current_product_id",
        "target_product_id",
        "payment_method",
        "currency",
        "amount",
        "expires_at",
    }
    assert data["available"] is True
    assert data["reason"] is None
    assert data["current_product_id"] == "online_lite"
    assert data["target_product_id"] == "online_growth"
    assert data["payment_method"] == "paypal"
    assert data["currency"] == "USD"
    assert data["expires_at"] == expires_at

    snapshot = await payment_config_service.get_snapshot()
    current_price = snapshot.prices.get(("online_lite", "paypal"))
    target_price = snapshot.prices.get(("online_growth", "paypal"))
    if current_price is None or target_price is None:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: maps_online 渠道价配置尚未初始化")
    diff = target_price.amount - current_price.amount
    # 剩余 10/30 期；服务端 own now 比测试 now 晚几毫秒，允许一个美分内的取整漂移。
    upper = diff * 10 * _DAY_MS // (30 * _DAY_MS)
    upper = upper // _PAYPAL_CENT_UNIT * _PAYPAL_CENT_UNIT
    assert data["amount"] is not None
    assert upper - _PAYPAL_CENT_UNIT < data["amount"] <= upper
    assert data["amount"] % _PAYPAL_CENT_UNIT == 0

    # 渠道白名单直接调用证明：stars 等非 PayPal/Clink 渠道不看价目配置，
    # 直接 channel_unavailable（maps_extension 两档 tier 满足，可触达渠道判定）。
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line="maps_extension",
                product_id="maps_extension_pro",
                auto_renew=True,
                payment_method="telegram_stars",
                start_at=now,
                expires_at=expires_at,
            )
        )
        await db.commit()
    quote = await subscription_service.get_upgrade_quote(
        user_id=user_id,
        product_line="maps_extension",
        target_product_id="maps_extension_business",
    )
    assert quote["available"] is False
    assert quote["reason"] == "channel_unavailable"
    assert quote["amount"] is None
