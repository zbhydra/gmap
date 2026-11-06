"""Stripe 真实入口验证：MySQL/Redis 真实，Stripe HTTP 出口使用明确替身。

配置表只读；Provider 参数用例无基础设施依赖，不代表真实渠道收款。
"""

import hashlib
import hmac
import json
import time
from collections.abc import AsyncIterator, Awaitable, Callable
from urllib.parse import parse_qs
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import delete, select

from app.constants.order import OrderCreateParam, OrderStatus, ProductClass
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.config_payment_channel_model import ConfigPaymentChannelModel
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.provider.payment.payment_base import PaymentProviderError, PaymentRequest
from app.provider.payment.stripe import STRIPE_API_VERSION, StripePaymentProvider
from app.services.order_service import order_service
from app.services.payment_config_service import payment_config_service
from app.services.usage_service import api_usage_service
from app.utils.time import add_natural_months, timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
_HTTP_CLIENT = httpx.AsyncClient
_WEBHOOK = "/api/callback/stripe/payment"


@pytest.fixture
async def real_stripe_usage_cleanup(real_mysql_ready: None) -> AsyncIterator[list[int]]:
    user_ids: list[int] = []
    try:
        yield user_ids
    finally:
        if user_ids:
            async with get_async_session() as db:
                await db.execute(
                    delete(UserUsageLogModel).where(
                        UserUsageLogModel.user_id.in_(user_ids)
                    )
                )
                await db.commit()


def _invoice(
    order_no: str,
    subscription_id: str,
    price_id: str,
    invoice_id: str,
    start: int,
    end: int,
    cents: int,
) -> dict[str, object]:
    return {
        "id": invoice_id,
        "status": "paid",
        "amount_paid": cents,
        "currency": "usd",
        "customer": "cus_test",
        "status_transitions": {"paid_at": start},
        "parent": {
            "type": "subscription_details",
            "subscription_details": {
                "subscription": subscription_id,
                "metadata": {"order_no": order_no},
            },
        },
        "payments": {
            "data": [
                {
                    "status": "paid",
                    "amount_paid": cents,
                    "currency": "usd",
                    "payment": {
                        "type": "payment_intent",
                        "payment_intent": f"pi_{invoice_id}",
                    },
                }
            ]
        },
        "lines": {
            "data": [
                {
                    "amount": cents,
                    "period": {"start": start, "end": end},
                    "parent": {
                        "subscription_item_details": {"subscription": subscription_id}
                    },
                    "pricing": {"price_details": {"price": price_id}},
                }
            ]
        },
    }


def _subscription(
    order_no: str, subscription_id: str, price_id: str, invoice: dict[str, object]
) -> dict[str, object]:
    return {
        "id": subscription_id,
        "status": "active",
        "metadata": {"order_no": order_no},
        "cancel_at_period_end": False,
        "cancel_at": None,
        "pending_update": None,
        "latest_invoice": invoice,
        "items": {
            "data": [{"id": "si_test", "quantity": 1, "price": {"id": price_id}}]
        },
    }


def _signed(
    event_type: str,
    data: dict[str, object],
    key: str,
    *,
    created: int | None = None,
    signature_time: int | None = None,
    previous: dict[str, object] | None = None,
) -> tuple[bytes, dict[str, str]]:
    body = json.dumps(
        {
            "id": f"evt_{uuid4().hex}",
            "api_version": STRIPE_API_VERSION,
            "created": created or int(time.time()),
            "type": event_type,
            "data": {"object": data, "previous_attributes": previous or {}},
        },
        separators=(",", ":"),
    ).encode()
    timestamp = signature_time or int(time.time())
    signature = hmac.new(
        key.encode(), str(timestamp).encode() + b"." + body, hashlib.sha256
    ).hexdigest()
    return body, {
        "Stripe-Signature": f"t={timestamp},v1={signature}",
        "Content-Type": "application/json",
    }


@pytest.fixture
async def real_stripe_config(
    real_mysql_ready: None, real_redis_ready: None
) -> dict[str, object]:
    async with get_async_session() as db:
        row = await db.scalar(
            select(ConfigPaymentChannelModel).where(
                ConfigPaymentChannelModel.channel_code == "stripe"
            )
        )
    if row is None:
        pytest.skip("REAL_STRIPE_CHANNEL_UNAVAILABLE: Stripe 沙箱渠道未配置")
    config: object = json.loads(row.config_json or "{}")
    assert isinstance(config, dict)
    if not isinstance(config.get("secret_key"), str) or not isinstance(
        config.get("webhook_secret"), str
    ):
        pytest.skip("REAL_STRIPE_CHANNEL_UNAVAILABLE: Stripe 沙箱凭据未配齐")
    return config


async def test_real_stripe_checkout_price_and_upgrade_protocol(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """固定版本的 Price、Checkout、重开账期、等待/已付终态映射。"""
    provider = StripePaymentProvider(
        {"secret_key": "pytest-secret", "webhook_secret": "pytest-webhook"}
    )
    now = int(time.time())
    invoice = _invoice(
        "ORDER", "sub_test", "price_old", "in_old", now, now + 2592000, 1000
    )
    subscription = _subscription("ORDER", "sub_test", "price_old", invoice)
    requests: list[httpx.Request] = []
    price_amount = 5000
    paid = False
    cancelled = False

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        assert request.headers["Stripe-Version"] == STRIPE_API_VERSION
        path = request.url.path
        if path == "/v1/prices/price_target":
            return httpx.Response(
                200,
                json={
                    "id": "price_target",
                    "active": True,
                    "type": "recurring",
                    "billing_scheme": "per_unit",
                    "currency": "usd",
                    "unit_amount": price_amount,
                    "recurring": {
                        "interval": "month",
                        "interval_count": 1,
                        "usage_type": "licensed",
                    },
                },
            )
        if path == "/v1/checkout/sessions":
            return httpx.Response(
                200,
                json={"id": "cs_test", "url": "https://checkout.stripe.com/c/pay/test"},
            )
        if request.method == "GET":
            assert path == "/v1/subscriptions/sub_test"
            return httpx.Response(
                200, json=subscription | {"cancel_at_period_end": cancelled}
            )
        fields = parse_qs(request.content.decode())
        if path == "/v1/invoices/create_preview":
            assert fields["subscription_details[billing_cycle_anchor][type]"] == ["now"]
            assert fields["subscription_details[proration_behavior]"] == [
                "always_invoice"
            ]
            return httpx.Response(200, json={"currency": "usd", "amount_due": 4100})
        assert path == "/v1/subscriptions/sub_test"
        assert fields["billing_cycle_anchor[type]"] == ["now"]
        assert fields["payment_behavior"] == ["pending_if_incomplete"]
        assert fields["proration_behavior"] == ["always_invoice"]
        updated_invoice = _invoice(
            "ORDER", "sub_test", "price_target", "in_upgrade", now, now + 2592000, 4100
        )
        result = _subscription("ORDER", "sub_test", "price_target", updated_invoice)
        if not paid:
            updated_invoice["status"] = "open"
            updated_invoice["hosted_invoice_url"] = "https://invoice.stripe.com/i/test"
            result["pending_update"] = {"expires_at": now + 3600}
        return httpx.Response(200, json=result)

    monkeypatch.setattr(
        "app.provider.payment.stripe.httpx.AsyncClient",
        lambda *, timeout: _HTTP_CLIENT(
            timeout=timeout, transport=httpx.MockTransport(handler)
        ),
    )
    request = PaymentRequest(
        order_no="ORDER",
        payment_method="stripe",
        order_status=1,
        amount=50_000_000,
        currency="USD",
        product_name="套餐",
        expired_at=timestamp_now() + 1000,
        user_id=1,
        auto_renew=True,
        provider_sku="price_target",
        period="month",
    )
    created = await provider.create_payment(request)
    assert set(created) == {"sessionId", "checkoutUrl"}
    fields = parse_qs(requests[-1].content.decode())
    assert fields["mode"] == ["subscription"]
    assert fields["allowed_payment_method_types[0]"] == ["card"]
    assert "expires_at" not in fields
    price_amount = 5001
    with pytest.raises(PaymentProviderError, match="金额、币种或周期"):
        await provider.create_payment(request)
    price_amount = 5000
    preview = await provider.preview_subscription_update(
        channel_subscription_id="sub_test",
        target_provider_sku="price_target",
        currency="USD",
        target_amount=50_000_000,
    )
    assert (
        preview.net_amount == 41_000_000 and preview.price_reference == "price_target"
    )
    pending = await provider.confirm_subscription_update(
        channel_subscription_id="sub_test",
        target_provider_sku="price_target",
        price_reference=preview.price_reference,
    )
    assert pending.status == "requires_action" and pending.action is not None
    assert pending.action.type == "redirect"
    paid = True
    assert (
        await provider.confirm_subscription_update(
            channel_subscription_id="sub_test",
            target_provider_sku="price_target",
            price_reference=preview.price_reference,
        )
    ).status == "succeeded"
    cancelled = True
    with pytest.raises(PaymentProviderError, match="恢复续费"):
        await provider.preview_subscription_update(
            channel_subscription_id="sub_test",
            target_provider_sku="price_target",
            currency="USD",
            target_amount=50_000_000,
        )


async def test_real_stripe_onetime_callback_keeps_pending_and_fulfills_once(
    real_async_client: httpx.AsyncClient,
    real_stripe_config: dict[str, object],
    real_user_factory: Callable[[str], Awaitable[tuple[int, str]]],
    make_test_email: Callable[[str], str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user_id, token = await real_user_factory(make_test_email("stripe-onetime"))
    snapshot = await payment_config_service.get_snapshot(force_refresh=True)
    price = snapshot.prices.get(("online_lite", "stripe"))
    if price is None:
        pytest.skip("REAL_STRIPE_CHANNEL_UNAVAILABLE: online_lite 未启用 Stripe 价格")
    key = real_stripe_config["webhook_secret"]
    assert isinstance(key, str)
    session_id = f"cs_{user_id}"
    request_fields: dict[str, list[str]] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST" and request.url.path == "/v1/checkout/sessions"
        request_fields.update(parse_qs(request.content.decode()))
        return httpx.Response(
            200,
            json={"id": session_id, "url": "https://checkout.stripe.com/c/pay/test"},
        )

    monkeypatch.setattr(
        "app.provider.payment.stripe.httpx.AsyncClient",
        lambda *, timeout: _HTTP_CLIENT(
            timeout=timeout, transport=httpx.MockTransport(handler)
        ),
    )
    created = await real_async_client.post(
        "/api/client/order/create",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_class": 1,
            "product_id": "online_lite",
            "payment_method": "stripe",
            "amount": price.amount,
            "currency": price.currency,
            "auto_renew": False,
            "period": "month",
        },
    )
    assert created.status_code == 200 and created.json()["code"] == CommonCode.SUCCESS
    order_no = created.json()["data"]["order_no"]
    assert request_fields["managed_payments[enabled]"] == ["false"]
    assert request_fields["adaptive_pricing[enabled]"] == ["false"]
    assert request_fields["line_items[0][price_data][unit_amount]"] == [
        str(price.amount // 10_000)
    ]
    cancelled = await real_async_client.post(
        "/api/client/order/cancel",
        headers={"Authorization": f"Bearer {token}"},
        json={"order_no": order_no},
    )
    assert (
        cancelled.status_code == 200
        and cancelled.json()["code"] == CommonCode.ORDER_CANNOT_CANCEL
    )
    data = {
        "id": session_id,
        "client_reference_id": order_no,
        "mode": "payment",
        "payment_status": "unpaid",
        "amount_total": price.amount // 10_000,
        "currency": "usd",
        "payment_intent": f"pi_{user_id}",
    }
    body, headers = _signed("checkout.session.completed", data, key)
    waiting = await real_async_client.post(_WEBHOOK, content=body, headers=headers)
    assert waiting.status_code == 200 and waiting.json()["code"] == CommonCode.SUCCESS
    pending_order = await order_service.get_order_by_no(order_no)
    assert (
        pending_order is not None
        and pending_order.order_status == OrderStatus.PENDING.value
    )
    data["payment_status"] = "paid"
    paid_at = int(time.time()) - 60
    body, headers = _signed("checkout.session.completed", data, key, created=paid_at)
    for content, signature in [
        (body + b" ", headers),
        _signed(
            "checkout.session.completed",
            data,
            key,
            signature_time=int(time.time()) - 301,
        ),
    ]:
        rejected = await real_async_client.post(
            _WEBHOOK, content=content, headers=signature
        )
        assert (
            rejected.status_code == 200
            and rejected.json()["code"] != CommonCode.SUCCESS
        )
    wrong = data | {"amount_total": price.amount // 10_000 + 1}
    wrong_body, wrong_headers = _signed("checkout.session.completed", wrong, key)
    rejected = await real_async_client.post(
        _WEBHOOK, content=wrong_body, headers=wrong_headers
    )
    assert rejected.status_code == 200 and rejected.json()["code"] != CommonCode.SUCCESS
    for _ in range(2):
        result = await real_async_client.post(_WEBHOOK, content=body, headers=headers)
        assert result.status_code == 200 and result.json()["code"] == CommonCode.SUCCESS
    order = await order_service.get_order_by_no(order_no)
    assert order is not None and order.paid_at == paid_at * 1000
    assert (
        order.callback_status == 3 and order.payment_transaction_id == f"pi_{user_id}"
    )
    async with get_async_session() as db:
        subscription = await db.get(UserSubscriptionModel, (user_id, "maps_online"))
    assert subscription is not None and subscription.start_at == paid_at * 1000
    assert subscription.expires_at == add_natural_months(paid_at * 1000, 1)


async def test_real_stripe_paid_invoices_and_applied_plan_keep_separate_facts(
    real_async_client: httpx.AsyncClient,
    real_stripe_config: dict[str, object],
    real_user_factory: Callable[[str], Awaitable[tuple[int, str]]],
    make_test_email: Callable[[str], str],
    monkeypatch: pytest.MonkeyPatch,
    real_stripe_usage_cleanup: list[int],
) -> None:
    user_id, token = await real_user_factory(make_test_email("stripe-recurring"))
    real_stripe_usage_cleanup.append(user_id)
    snapshot = await payment_config_service.get_snapshot(force_refresh=True)
    current = snapshot.prices.get(("api_basic", "stripe"))
    target = snapshot.prices.get(("api_professional", "stripe"))
    if (
        current is None
        or target is None
        or not current.provider_sku
        or not target.provider_sku
    ):
        pytest.skip("REAL_STRIPE_CHANNEL_UNAVAILABLE: Stripe 自动续费 Price 映射未配齐")
    current_sku, target_sku = current.provider_sku, target.provider_sku
    key = real_stripe_config["webhook_secret"]
    assert isinstance(key, str)
    order = await order_service.create_order(
        OrderCreateParam(
            user_id=user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id="api_basic",
            product_name="自动续费",
            amount=current.amount,
            payment_method="stripe",
            auto_renew=True,
            period="month",
            extra_metadata=json.dumps(
                {
                    "test_run_id": str(user_id),
                    "product_snapshot": {
                        "product_kind": "maps_api",
                        "period": "month",
                        "auto_renew": True,
                        "amount": current.amount,
                    },
                }
            ),
        )
    )
    sub_id = f"sub_{user_id}"
    now = int(time.time())
    end = now + 2592000
    first = _invoice(
        order.order_no,
        sub_id,
        current_sku,
        f"in_first_{user_id}",
        now,
        end,
        current.amount // 10_000,
    )
    invoices = {str(first["id"]): first}
    invoice_queries: list[str] = []
    payment_queries = 0
    management_phase = True
    cancelled = True

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal payment_queries
        if request.method == "GET" and request.url.path.startswith("/v1/invoices/"):
            invoice_id = request.url.path.rsplit("/", 1)[1]
            invoice_queries.append(invoice_id)
            invoice = invoices[invoice_id]
            if request.url.params.get("expand[0]") != "payments":
                return httpx.Response(
                    200, json={k: v for k, v in invoice.items() if k != "payments"}
                )
            return httpx.Response(200, json=invoice)
        if management_phase:
            if request.url.path == f"/v1/subscriptions/{sub_id}":
                return httpx.Response(
                    200,
                    json=_subscription(
                        order.order_no,
                        sub_id,
                        current_sku,
                        {k: v for k, v in first.items() if k != "payments"},
                    )
                    | {"cancel_at_period_end": cancelled},
                )
            if request.url.path == f"/v1/prices/{target_sku}":
                return httpx.Response(
                    200,
                    json={
                        "id": target_sku,
                        "active": True,
                        "type": "recurring",
                        "billing_scheme": "per_unit",
                        "currency": "usd",
                        "unit_amount": target.amount // 10_000,
                        "recurring": {
                            "interval": "month",
                            "interval_count": 1,
                            "usage_type": "licensed",
                        },
                    },
                )
            if request.url.path == "/v1/invoices/create_preview":
                return httpx.Response(200, json={"currency": "usd", "amount_due": 4100})
            if request.url.path == "/v1/billing_portal/sessions":
                assert parse_qs(request.content.decode())["customer"] == ["cus_test"]
                return httpx.Response(
                    200, json={"url": "https://billing.stripe.com/p/session/test"}
                )
        payment_queries += 1
        raise AssertionError(f"完整 snapshot 不应重查: {request.url.path}")

    monkeypatch.setattr(
        "app.provider.payment.stripe.httpx.AsyncClient",
        lambda *, timeout: _HTTP_CLIENT(
            timeout=timeout, transport=httpx.MockTransport(handler)
        ),
    )

    async def send(
        kind: str, data: dict[str, object], *, previous: dict[str, object] | None = None
    ) -> None:
        body, headers = _signed(kind, data, key, previous=previous)
        response = await real_async_client.post(_WEBHOOK, content=body, headers=headers)
        assert (
            response.status_code == 200
            and response.json()["code"] == CommonCode.SUCCESS
        )

    await send(
        "checkout.session.completed", {"mode": "subscription", "payment_status": "paid"}
    )
    pending_order = await order_service.get_order_by_no(order.order_no)
    assert pending_order is not None and pending_order.order_status == 1
    await send("invoice.paid", first | {"status": "open"})
    await send("invoice.paid", first | {"payments": {"data": []}})
    pending_order = await order_service.get_order_by_no(order.order_no)
    assert pending_order is not None and pending_order.order_status == 1
    # 标准 snapshot 不含 payments，只有显式展开的 GET 才返回付款凭证。
    await send("invoice.paid", {k: v for k, v in first.items() if k != "payments"})
    assert invoice_queries == [first["id"]]
    await send("invoice.paid", first)
    assert invoice_queries == [first["id"]]
    await api_usage_service.consume(
        f"u:{user_id}",
        user_id=user_id,
        records=300,
        request_id=f"stripe-usage-{user_id}",
    )
    auth = {"Authorization": f"Bearer {token}"}
    params = {"product_kind": "maps_api", "target_product_id": "api_professional"}
    quote = await real_async_client.get(
        "/api/client/subscription/upgrade-quote", headers=auth, params=params
    )
    assert quote.status_code == 200 and quote.json()["code"] == CommonCode.SUCCESS
    assert (
        quote.json()["data"]["available"] is False
        and quote.json()["data"]["reason"] == "renewal_resume_required"
    )
    confirm = await real_async_client.post(
        "/api/client/subscription/upgrade/confirm", headers=auth, json=params
    )
    assert (
        confirm.status_code == 200
        and confirm.json()["code"] == CommonCode.INVALID_REQUEST
    )
    assert confirm.json()["data"]["reason"] == "renewal_resume_required"
    portal = await real_async_client.post(
        "/api/client/subscription/management",
        headers=auth,
        json={"product_kind": "maps_api"},
    )
    assert portal.status_code == 200 and portal.json()["code"] == CommonCode.SUCCESS
    assert portal.json()["data"]["url"].startswith("https://billing.stripe.com/")
    cancelled = False
    before_quote = timestamp_now()
    quote = await real_async_client.get(
        "/api/client/subscription/upgrade-quote", headers=auth, params=params
    )
    assert quote.status_code == 200 and quote.json()["code"] == CommonCode.SUCCESS
    assert (
        quote.json()["data"]["available"] is True
        and quote.json()["data"]["amount"] == 41_000_000
    )
    assert quote.json()["data"]["expires_at"] >= add_natural_months(before_quote, 1)
    management_phase = False
    upgraded = _invoice(
        order.order_no,
        sub_id,
        target_sku,
        f"in_upgrade_{user_id}",
        now + 100,
        end + 100,
        4100,
    )
    invoices[str(upgraded["id"])] = upgraded
    state = _subscription(order.order_no, sub_id, target_sku, upgraded)
    state["latest_invoice"] = upgraded["id"]
    pending = state | {"pending_update": {"expires_at": end}}
    await send("customer.subscription.updated", pending, previous={"items": {}})
    async with get_async_session() as db:
        row = await db.get(UserSubscriptionModel, (user_id, "maps_api"))
    assert (
        row is not None
        and row.product_id == "api_basic"
        and row.expires_at == end * 1000
    )
    await send("invoice.paid", {k: v for k, v in upgraded.items() if k != "payments"})
    async with get_async_session() as db:
        row = await db.get(UserSubscriptionModel, (user_id, "maps_api"))
    assert (
        row is not None
        and row.product_id == "api_basic"
        and row.expires_at == (end + 100) * 1000
    )
    await send("customer.subscription.updated", state, previous={"items": {}})
    await send("customer.subscription.pending_update_applied", state)
    renewal = _invoice(
        order.order_no,
        sub_id,
        target_sku,
        f"in_renew_{user_id}",
        end + 100,
        end + 2592100,
        target.amount // 10_000,
    )
    invoices[str(renewal["id"])] = renewal
    await send("invoice.paid", {k: v for k, v in renewal.items() if k != "payments"})
    await send("invoice.paid", renewal)
    await send("invoice.paid", first)
    await send(
        "customer.subscription.updated",
        _subscription(order.order_no, sub_id, current_sku, first),
        previous={"items": {}},
    )
    async with get_async_session() as db:
        row = await db.get(UserSubscriptionModel, (user_id, "maps_api"))
        orders = list(
            await db.scalars(select(OrderModel).where(OrderModel.user_id == user_id))
        )
    assert row is not None and row.product_id == "api_professional"
    usage = await api_usage_service.get_usage(f"u:{user_id}", user_id=user_id)
    assert (
        usage.used == 300 and usage.total == 5000 and usage.total - usage.used == 4700
    )
    assert (
        row.start_at == (end + 100) * 1000 and row.expires_at == (end + 2592100) * 1000
    )
    assert len(orders) == 3 and sorted(o.amount for o in orders) == sorted(
        [current.amount, 41_000_000, target.amount]
    )
    assert payment_queries == 0
    assert set(invoice_queries) == {first["id"], upgraded["id"], renewal["id"]}
