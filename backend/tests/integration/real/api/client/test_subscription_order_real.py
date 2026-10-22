"""订阅下单契约 real 测试：checkout 方案序列化与下单新参数校验。

真实资源依赖：
- MySQL: users / orders / 订阅支付配置表（配置只读）
- Redis: 用户 access token 白名单
"""

import json
from typing import TypedDict

import httpx
import pytest
from sqlalchemy import func, select, text

from app.constants.order import CallbackStatus, OrderStatus, ProductClass
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


class _CheckoutPrice(TypedDict):
    product_price_id: int
    payment_method: str
    currency: str
    amount: int


class _CheckoutPlan(TypedDict):
    product_class: int
    product_id: str
    product_kind: str
    period: str
    auto_renew: bool
    display_currency: str
    display_amount: int
    payment_channels: list[_CheckoutPrice]


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


def _online_basic_paypal_price(
    plans: list[_CheckoutPlan],
) -> tuple[_CheckoutPlan, _CheckoutPrice]:
    """从 checkout 方案里取 maps_online 类别 online_basic 的 PayPal 渠道价。"""

    plan = next(
        item
        for item in plans
        if item["product_kind"] == "maps_online"
        and item["product_id"] == "online_basic"
    )
    channel = next(
        item for item in plan["payment_channels"] if item["payment_method"] == "paypal"
    )
    return plan, channel


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
    plan, paypal = _online_basic_paypal_price(plans)

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
    _plan, paypal = _online_basic_paypal_price(plans)

    response = await real_async_client.post(
        "/api/client/order/create",
        json={
            "product_class": ProductClass.SUBSCRIPTION.value,
            "product_id": "online_basic",
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
    assert body["data"]["product_id"] == "online_basic"

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


async def test_real_paypal_one_time_return_fulfills_once_without_public_webhook(
    real_async_client,
    make_test_email,
    real_user_factory,
    real_subscription_order_schema_ready,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实下单、内网回跳与重复通知；仅替换 PayPal HTTP，不写配置表。"""
    user_id, token = await real_user_factory(make_test_email("paypal-one-time"))
    _, other_token = await real_user_factory(make_test_email("paypal-other"))
    headers = {"Authorization": f"Bearer {token}"}
    configs = await real_async_client.get("/api/client/subscription/checkout-configs")
    assert configs.status_code == 200
    assert configs.json()["code"] == CommonCode.SUCCESS
    plans = configs.json()["data"]["checkout_configs"]
    assert len(plans) == 10
    for plan in plans:
        assert plan["auto_renew"] is False
        assert [item["payment_method"] for item in plan["payment_channels"]] == [
            "paypal"
        ]
    plan = next(item for item in plans if item["product_id"] == "maps_extension_pro")
    price = plan["payment_channels"][0]
    paypal_order_id = f"PP{user_id}"
    order_no = ""
    captured = False
    settled = False
    capture_calls = 0
    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal order_no, captured, capture_calls
        path = request.url.path
        if path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "test", "expires_in": 30})
        if path == "/v2/checkout/orders":
            payload = json.loads(request.content)
            assert payload["intent"] == "CAPTURE"
            unit = payload["purchase_units"][0]
            order_no = unit["reference_id"]
            assert unit["amount"] == {"currency_code": "USD", "value": "39.00"}
            return httpx.Response(
                201,
                json={
                    "id": paypal_order_id,
                    "links": [
                        {
                            "rel": "approve",
                            "href": f"https://www.sandbox.paypal.com/checkoutnow?token={paypal_order_id}",
                        }
                    ],
                },
            )
        if path == "/v1/notifications/verify-webhook-signature":
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        if path == f"/v2/checkout/orders/{paypal_order_id}/capture":
            capture_calls += 1
            captured = True
        else:
            assert path == f"/v2/checkout/orders/{paypal_order_id}"
            assert request.method == "GET"
        unit = {"reference_id": order_no}
        if captured:
            unit["payments"] = {
                "captures": [
                    {
                        "id": f"CAPTURE{user_id}",
                        "status": "COMPLETED" if settled else "PENDING",
                        "amount": {"currency_code": "USD", "value": "39.00"},
                    }
                ]
            }
        return httpx.Response(
            200,
            json={
                "id": paypal_order_id,
                "status": "COMPLETED" if captured else "APPROVED",
                "purchase_units": [unit],
            },
        )

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(timeout=timeout, transport=httpx.MockTransport(handler))

    monkeypatch.setattr("app.provider.payment.paypal.httpx.AsyncClient", client_factory)
    created = await real_async_client.post(
        "/api/client/order/create",
        headers=headers,
        json={
            "product_class": ProductClass.SUBSCRIPTION.value,
            "product_id": plan["product_id"],
            "payment_method": "paypal",
            "currency": price["currency"],
            "amount": price["amount"],
            "auto_renew": False,
            "period": "month",
        },
    )
    assert created.status_code == 200
    assert created.json()["code"] == CommonCode.SUCCESS
    assert created.json()["data"]["order_no"] == order_no

    denied = await real_async_client.post(
        "/api/client/order/paypal/confirm",
        json={"order_no": order_no},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert denied.status_code == 200
    assert denied.json()["code"] == CommonCode.ORDER_NOT_FOUND
    assert capture_calls == 0

    pending = await real_async_client.post(
        "/api/client/order/paypal/confirm", headers=headers, json={"order_no": order_no}
    )
    assert pending.status_code == 200
    assert pending.json()["code"] == CommonCode.PAYMENT_GATEWAY_ERROR
    async with get_async_session() as db:
        assert (
            await db.scalar(
                select(OrderModel.order_status).where(OrderModel.order_no == order_no)
            )
            == OrderStatus.PENDING.value
        )
        assert (
            await db.scalar(
                select(UserSubscriptionModel).where(
                    UserSubscriptionModel.user_id == user_id
                )
            )
            is None
        )

    settled = True
    for _ in range(2):
        confirmed = await real_async_client.post(
            "/api/client/order/paypal/confirm",
            headers=headers,
            json={"order_no": order_no},
        )
        assert confirmed.status_code == 200
        assert confirmed.json()["code"] == CommonCode.SUCCESS
    assert capture_calls == 1
    async with get_async_session() as db:
        subscription = await db.scalar(
            select(UserSubscriptionModel).where(
                UserSubscriptionModel.user_id == user_id
            )
        )
        assert subscription is not None
        assert subscription.product_kind == "maps_extension"
        assert subscription.product_id == "maps_extension_pro"
        assert subscription.auto_renew is False
        expires_at = subscription.expires_at
        order = await db.scalar(
            select(OrderModel).where(OrderModel.order_no == order_no)
        )
        assert order is not None
        assert order.order_status == OrderStatus.PAID.value
        assert order.callback_status == CallbackStatus.SUCCESS.value
        assert order.paid_amount == 39_000_000
        assert order.payment_transaction_id == f"CAPTURE{user_id}"

    replay = await real_async_client.post(
        "/api/callback/paypal/payment",
        headers={
            "paypal-auth-algo": "SHA256withRSA",
            "paypal-cert-url": "https://api-m.paypal.com/certs.pem",
            "paypal-transmission-id": "one-time-test",
            "paypal-transmission-sig": "test",
            "paypal-transmission-time": "2026-10-20T00:00:00Z",
        },
        json={
            "event_type": "PAYMENT.CAPTURE.COMPLETED",
            "resource": {
                "id": f"CAPTURE{user_id}",
                "invoice_id": order_no,
                "amount": {"currency_code": "USD", "value": "39.00"},
                "supplementary_data": {"related_ids": {"order_id": paypal_order_id}},
            },
        },
    )
    assert replay.status_code == 200
    assert replay.json()["code"] == CommonCode.SUCCESS
    assert replay.json()["data"]["idempotent"] is True
    async with get_async_session() as db:
        assert (
            await db.scalar(
                select(UserSubscriptionModel.expires_at).where(
                    UserSubscriptionModel.user_id == user_id
                )
            )
            == expires_at
        )


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
                product_kind="maps_online",
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
        params={"product_kind": "maps_online", "target_product_id": "online_growth"},
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
                product_kind="maps_extension",
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
        product_kind="maps_extension",
        target_product_id="maps_extension_business",
    )
    assert quote["available"] is False
    assert quote["reason"] == "channel_unavailable"
    assert quote["amount"] is None
