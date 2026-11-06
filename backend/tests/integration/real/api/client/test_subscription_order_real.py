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

from app.constants.order import (
    CallbackStatus,
    OrderCreateParam,
    OrderStatus,
    ProductClass,
)
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_model import UserModel
from app.services.order_service import order_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DAY_MS = 24 * 3600 * 1000


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


def _online_basic_price(
    plans: list[_CheckoutPlan],
) -> tuple[_CheckoutPlan, _CheckoutPrice]:
    """从 checkout 方案里取 maps_online 类别 online_basic 的当前可售渠道价。"""

    plan = next(
        item
        for item in plans
        if item["product_kind"] == "maps_online"
        and item["product_id"] == "online_basic"
    )
    channel = next(
        (
            item
            for item in plan["payment_channels"]
            if item["payment_method"] in {"stripe", "clink"}
        ),
        None,
    )
    if channel is None:
        pytest.skip(
            "REAL_PAYMENT_CHANNEL_UNAVAILABLE: online_basic 缺少 Stripe/Clink 可售价"
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
    plan, paypal = _online_basic_price(plans)

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
    _plan, paypal = _online_basic_price(plans)

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
    """历史待支付订单的回跳与重投仍可幂等履约；仅替换 PayPal HTTP。"""
    user_id, token = await real_user_factory(make_test_email("paypal-one-time"))
    _, other_token = await real_user_factory(make_test_email("paypal-other"))
    headers = {"Authorization": f"Bearer {token}"}
    paypal_order_id = f"PP{user_id}"
    order_no = ""
    captured = False
    settled = False
    capture_calls = 0
    query_http_status = 200
    verification_http_status = 200
    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal captured, capture_calls
        path = request.url.path
        if path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "test", "expires_in": 30})
        if path == "/v1/notifications/verify-webhook-signature":
            return httpx.Response(
                verification_http_status, json={"verification_status": "SUCCESS"}
            )
        if path == f"/v2/checkout/orders/{paypal_order_id}/capture":
            capture_calls += 1
            captured = True
        else:
            assert path == f"/v2/checkout/orders/{paypal_order_id}"
            assert request.method == "GET"
            if query_http_status != 200:
                return httpx.Response(query_http_status, json={})
        unit: dict[str, object] = {"reference_id": order_no}
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
    historical = await order_service.create_order(
        OrderCreateParam(
            user_id=user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id="maps_extension_pro",
            product_name="历史 PayPal 订单",
            amount=39_000_000,
            currency="USD",
            payment_method="paypal",
            extra_metadata=json.dumps(
                {
                    "product_snapshot": {
                        "product_kind": "maps_extension",
                        "auto_renew": False,
                        "period": "month",
                        "amount": 39_000_000,
                    }
                }
            ),
        )
    )
    order_no = historical.order_no
    assert await order_service.save_order_payment_data(
        order_no=order_no,
        payment_data={
            "channel_order_id": paypal_order_id,
            "paypal_order_id": paypal_order_id,
        },
    )

    denied = await real_async_client.post(
        "/api/client/order/paypal/confirm",
        json={"order_no": order_no},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert denied.status_code == 200
    assert denied.json()["code"] == CommonCode.ORDER_NOT_FOUND
    assert capture_calls == 0

    query_http_status = 503
    unavailable = await real_async_client.post(
        "/api/client/order/paypal/confirm", headers=headers, json={"order_no": order_no}
    )
    assert unavailable.status_code == 200
    assert unavailable.json()["code"] == CommonCode.PAYMENT_GATEWAY_ERROR
    assert capture_calls == 0
    query_http_status = 200

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

    webhook_headers = {
        "paypal-auth-algo": "SHA256withRSA",
        "paypal-cert-url": "https://api-m.paypal.com/certs.pem",
        "paypal-transmission-id": "one-time-test",
        "paypal-transmission-sig": "test",
        "paypal-transmission-time": "2026-10-20T00:00:00Z",
    }
    event = {
        "event_type": "PAYMENT.CAPTURE.COMPLETED",
        "resource": {
            "id": f"CAPTURE{user_id}",
            "status": "COMPLETED",
            "invoice_id": order_no,
            "amount": {"currency_code": "USD", "value": "39.00"},
            "supplementary_data": {"related_ids": {"order_id": paypal_order_id}},
        },
    }
    # 只读临时故障请求渠道重投；明确拒绝和未分类故障保持 200。
    for verification_http_status, expected_http_status in (
        (503, 500),
        (400, 200),
        (500, 200),
    ):
        failed = await real_async_client.post(
            "/api/callback/paypal/payment", headers=webhook_headers, json=event
        )
        assert failed.status_code == expected_http_status
        assert failed.json()["code"] == CommonCode.INTERNAL_SERVER_ERROR
    verification_http_status = 200
    replay = await real_async_client.post(
        "/api/callback/paypal/payment", headers=webhook_headers, json=event
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


async def test_real_paypal_existing_subscription_cannot_upgrade(
    real_async_client,
    make_test_email,
    real_user_factory,
    real_subscription_order_schema_ready,
) -> None:
    """旧 PayPal 实例本期拒绝两条升档入口。"""

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
    assert data["available"] is False
    assert data["reason"] == "channel_unavailable"
    assert data["payment_method"] == "paypal"
    assert data["amount"] is None
    for endpoint in ("checkout", "confirm"):
        rejected = await real_async_client.post(
            f"/api/client/subscription/upgrade/{endpoint}",
            json={"product_kind": "maps_online", "target_product_id": "online_growth"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert rejected.status_code == 200
        assert rejected.json()["code"] == CommonCode.INVALID_REQUEST
        assert rejected.json()["data"]["reason"] == "channel_unavailable"
    async with get_async_session() as db:
        assert (
            await db.scalar(
                select(func.count())
                .select_from(OrderModel)
                .where(OrderModel.user_id == user_id)
            )
            == 0
        )


@pytest.mark.parametrize("confirmation_succeeds", [True, False])
async def test_real_paypal_approved_checks_snapshot_and_reconciles_capture_timeout(
    real_async_client,
    make_test_email,
    real_user_factory,
    real_subscription_order_schema_ready,
    monkeypatch: pytest.MonkeyPatch,
    confirmation_succeeds: bool,
) -> None:
    """APPROVED 先核对快照；扣款超时只查一次事实，重复已付事件不再扣款。"""
    user_id, token = await real_user_factory(make_test_email("approved-recovery"))
    order = await order_service.create_order(
        OrderCreateParam(
            user_id=user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id="maps_extension_pro",
            product_name=f"approved-{user_id}",
            amount=39_000_000,
            currency="USD",
            payment_method="paypal",
            extra_metadata=json.dumps(
                {
                    "product_snapshot": {
                        "product_kind": "maps_extension",
                        "auto_renew": False,
                        "period": "month",
                    }
                }
            ),
        )
    )
    paypal_order_id = f"APPROVED-{user_id}"
    assert await order_service.save_order_payment_data(
        order_no=order.order_no,
        payment_data={
            "channel_order_id": paypal_order_id,
            "paypal_order_id": paypal_order_id,
        },
    )
    original_client = httpx.AsyncClient
    capture_calls = 0
    confirmation_calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal capture_calls, confirmation_calls
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(200, json={"access_token": "test", "expires_in": 30})
        if request.url.path == "/v1/notifications/verify-webhook-signature":
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        if request.url.path == f"/v2/checkout/orders/{paypal_order_id}/capture":
            assert request.headers["Prefer"] == "return=representation"
            capture_calls += 1
            raise httpx.ReadTimeout("capture response lost", request=request)
        assert request.method == "GET"
        assert request.url.path == f"/v2/checkout/orders/{paypal_order_id}"
        confirmation_calls += 1
        if not confirmation_succeeds:
            return httpx.Response(503, json={"name": "SERVICE_UNAVAILABLE"})
        return httpx.Response(
            200,
            json={
                "id": paypal_order_id,
                "status": "COMPLETED",
                "purchase_units": [
                    {
                        "reference_id": order.order_no,
                        "payments": {
                            "captures": [
                                {
                                    "id": f"CAPTURE-{user_id}",
                                    "status": "COMPLETED",
                                    "amount": {
                                        "currency_code": "USD",
                                        "value": "39.00",
                                    },
                                }
                            ]
                        },
                    }
                ],
            },
        )

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(timeout=timeout, transport=httpx.MockTransport(handler))

    monkeypatch.setattr("app.provider.payment.paypal.httpx.AsyncClient", client_factory)
    headers = {
        "paypal-auth-algo": "SHA256withRSA",
        "paypal-cert-url": "https://api-m.paypal.com/certs.pem",
        "paypal-transmission-id": f"approved-{user_id}",
        "paypal-transmission-sig": "test",
        "paypal-transmission-time": "2026-10-29T00:00:00Z",
    }
    # 其中一个引用正确也不能掩盖其他实际携带字段的冲突。
    for invalid_unit in (
        {"reference_id": order.order_no, "custom_id": "OTHER"},
        {
            "reference_id": order.order_no,
            "amount": {"currency_code": "USD", "value": "38.00"},
        },
        {
            "reference_id": order.order_no,
            "amount": {"currency_code": "EUR", "value": "39.00"},
        },
    ):
        rejected = await real_async_client.post(
            "/api/callback/paypal/payment",
            headers=headers,
            json={
                "event_type": "CHECKOUT.ORDER.APPROVED",
                "resource": {"id": paypal_order_id, "purchase_units": [invalid_unit]},
            },
        )
        assert rejected.status_code == 200
        assert rejected.json()["code"] == CommonCode.INTERNAL_SERVER_ERROR
    assert capture_calls == confirmation_calls == 0
    saved = await order_service.get_order_by_no(order.order_no)
    assert saved is not None and saved.order_status == OrderStatus.PENDING.value

    event = {
        "event_type": "CHECKOUT.ORDER.APPROVED",
        "resource": {"id": paypal_order_id},
    }
    result = await real_async_client.post(
        "/api/callback/paypal/payment", headers=headers, json=event
    )
    assert result.status_code == 200
    assert result.json()["code"] == (
        CommonCode.SUCCESS
        if confirmation_succeeds
        else CommonCode.INTERNAL_SERVER_ERROR
    )
    assert capture_calls == confirmation_calls == 1
    saved = await order_service.get_order_by_no(order.order_no)
    assert saved is not None
    if not confirmation_succeeds:
        assert saved.order_status == OrderStatus.PENDING.value
        assert saved.paid_amount is None
        async with get_async_session() as db:
            assert (
                await db.get(UserSubscriptionModel, (user_id, "maps_extension")) is None
            )
        # 后续用户回跳只读取已收款事实，不再次 capture。
        confirmation_succeeds = True
        confirmed = await real_async_client.post(
            "/api/client/order/paypal/confirm",
            headers={"Authorization": f"Bearer {token}"},
            json={"order_no": order.order_no},
        )
        assert confirmed.status_code == 200
        assert confirmed.json()["code"] == CommonCode.SUCCESS
    saved = await order_service.get_order_by_no(order.order_no)
    assert saved is not None and saved.order_status == OrderStatus.PAID.value
    assert saved.callback_status == CallbackStatus.SUCCESS.value
    assert saved.payment_transaction_id == f"CAPTURE-{user_id}"
    async with get_async_session() as db:
        subscription = await db.get(UserSubscriptionModel, (user_id, "maps_extension"))
        assert subscription is not None
        expires_at = subscription.expires_at
    repeated = await real_async_client.post(
        "/api/callback/paypal/payment", headers=headers, json=event
    )
    assert repeated.status_code == 200
    assert repeated.json()["code"] == CommonCode.SUCCESS
    assert repeated.json()["data"]["idempotent"] is True
    assert capture_calls == 1
    async with get_async_session() as db:
        subscription = await db.get(UserSubscriptionModel, (user_id, "maps_extension"))
        assert subscription is not None and subscription.expires_at == expires_at
