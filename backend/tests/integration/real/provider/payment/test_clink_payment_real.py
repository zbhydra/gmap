"""ClinkBill Provider 请求映射与验签 real 测试。

真实资源依赖：
- 无数据库依赖；Provider 直接用测试配置构造。
- 外部 Clink HTTP 用明确响应的 httpx.MockTransport 替换（不可控外部出口）。
"""

import hashlib
import hmac
import json
import time

import httpx
import pytest
from starlette.requests import Request

from app.core.config import settings
from app.provider.payment.clink import ClinkPaymentProvider
from app.provider.payment.payment_base import PaymentProviderError, PaymentRequest

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_WEBHOOK_KEY = "pytest-webhook-key"
# 真实 AsyncClient：模块导入时捕获，避免二次安装 transport 拿到被替换的工厂。
_REAL_ASYNC_CLIENT = httpx.AsyncClient
_PROVIDER_CONFIG = {
    "environment": "sandbox",
    "request_timeout_seconds": 3,
    "secret_key": "pytest-secret-key",
    "webhook_signing_key": _WEBHOOK_KEY,
}


def _provider() -> ClinkPaymentProvider:
    """构造不含真实密钥的 Sandbox Provider。"""

    return ClinkPaymentProvider(_PROVIDER_CONFIG)


def _payment_request(
    *, auto_renew: bool, provider_sku: str | None = None
) -> PaymentRequest:
    """构造 Clink Session 测试请求。"""

    return PaymentRequest(
        order_no="ORDER-CLINK-1",
        payment_method="clink",
        order_status=1,
        amount=12_345_678,
        currency="usd",
        product_name="Pro Plan",
        expired_at=4_102_444_800_000,
        user_id=987654,
        auto_renew=auto_renew,
        provider_sku=provider_sku,
    )


def _install_transport(monkeypatch: pytest.MonkeyPatch, handler) -> None:
    """替换 Clink 外部 HTTP 出口。

    真实 AsyncClient 在模块导入时捕获：monkeypatch 会全局替换共享
    httpx.AsyncClient 属性，二次安装时不能再用 httpx.AsyncClient 取真类。
    """

    original_client = _REAL_ASYNC_CLIENT

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.clink.httpx.AsyncClient",
        client_factory,
    )


def _checkout_response() -> httpx.Response:
    """返回当前环境合法的 Hosted Checkout 响应。"""

    return httpx.Response(
        200,
        json={
            "code": 200,
            "data": {
                "sessionId": "sess_test",
                "url": "https://uat-checkout.clinkbill.com/pay/token",
            },
        },
    )


async def test_real_clink_one_time_session_maps_amount_and_return_urls(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """一次性 Session 按订单快照映射金额、客户与回跳地址。"""

    monkeypatch.setattr(
        settings.app, "public_website_base_url", "https://gmap.example.com"
    )
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return _checkout_response()

    _install_transport(monkeypatch, handler)
    result = await _provider().create_payment(_payment_request(auto_renew=False))
    payload = json.loads(requests[0].content)

    assert requests[0].url.path == "/api/checkout/session"
    assert requests[0].headers["X-API-Key"] == "pytest-secret-key"
    assert int(requests[0].headers["X-Timestamp"]) > 0
    assert payload["referenceCustomerId"] == "987654"
    assert payload["merchantReferenceId"] == "ORDER-CLINK-1"
    assert payload["originalAmount"] == 12.345678
    assert payload["originalCurrency"] == "USD"
    assert payload["successUrl"] == (
        "https://gmap.example.com/clink/success/?order_no=ORDER-CLINK-1"
    )
    assert payload["cancelUrl"] == (
        "https://gmap.example.com/clink/cancel/?order_no=ORDER-CLINK-1"
    )
    assert payload["priceDataList"] == [
        {
            "name": "Pro Plan",
            "quantity": 1,
            "unitAmount": 12.345678,
            "currency": "USD",
        }
    ]
    assert "productId" not in payload
    assert result["checkoutUrl"] == "https://uat-checkout.clinkbill.com/pay/token"
    assert result["payment_url"] == result["checkoutUrl"]


async def test_real_clink_recurring_session_uses_sku_product_price(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """自动续费 Session 只发送 provider_sku 拆出的 Product/Price。"""

    payloads: list[dict[str, object]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        payloads.append(json.loads(request.content))
        return _checkout_response()

    _install_transport(monkeypatch, handler)
    await _provider().create_payment(
        _payment_request(auto_renew=True, provider_sku="prd_test:price_test")
    )

    assert payloads[0]["productId"] == "prd_test"
    assert payloads[0]["priceId"] == "price_test"
    assert "priceDataList" not in payloads[0]


async def test_real_clink_recurring_session_rejects_invalid_sku(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """自动续费 SKU 不符合 productId:priceId 约定时拒绝创建 Session。"""

    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("invalid sku must not reach Clink API")

    _install_transport(monkeypatch, handler)
    with pytest.raises(PaymentProviderError, match="provider_sku"):
        await _provider().create_payment(
            _payment_request(auto_renew=True, provider_sku="prd_test")
        )


async def test_real_clink_preview_subscription_update_returns_signed_proration(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """preview 返回官方折算净额、生效时机、完整目标价与 confirm 所需快照。"""

    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_test",
                    "immediate": True,
                    "recurringPrice": {
                        "productId": "prd_target",
                        "priceId": "price_target",
                        "currency": "USD",
                        "priceSnapshotId": "snapshot_target",
                    },
                    "lines": {"totalAmount": -3.505, "currency": "USD"},
                },
            },
        )

    _install_transport(monkeypatch, handler)
    preview = await _provider().preview_subscription_update(
        channel_subscription_id="sub_test",
        target_provider_sku="prd_target:price_target",
        currency="USD",
    )

    assert requests[0].url.path == "/api/subscription/sub_test/update/preview"
    assert json.loads(requests[0].content) == {
        "priceId": "price_target",
        "quantity": 1,
    }
    assert preview.price_snapshot_id == "snapshot_target"
    assert preview.net_amount == -3_505_000


async def test_real_clink_confirm_subscription_update_applies_preview_snapshot(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """confirm 回传 preview 的 priceSnapshotId，成功后返回渠道已生效完整价。"""

    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        if request.url.path.endswith("/update/preview"):
            return httpx.Response(
                200,
                json={
                    "code": 200,
                    "data": {
                        "subscriptionId": "sub_test",
                        "immediate": True,
                        "recurringPrice": {
                            "productId": "prd_business",
                            "priceId": "price_business",
                            "currency": "USD",
                            "priceSnapshotId": "snapshot_business",
                        },
                        "lines": {"totalAmount": 60, "currency": "USD"},
                    },
                },
            )
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_test",
                    "status": 1,
                    "code": "success",
                    "message": "success",
                    "subscription": {
                        "subscriptionId": "sub_test",
                        "productId": "prd_business",
                        "priceId": "price_business",
                    },
                },
            },
        )

    _install_transport(monkeypatch, handler)
    provider = _provider()
    preview = await provider.preview_subscription_update(
        channel_subscription_id="sub_test",
        target_provider_sku="prd_business:price_business",
        currency="USD",
    )
    confirmed = await provider.confirm_subscription_update(
        channel_subscription_id="sub_test",
        price_snapshot_id=preview.price_snapshot_id,
        target_provider_sku="prd_business:price_business",
    )

    assert requests[1].url.path == "/api/subscription/sub_test/update/confirm"
    assert json.loads(requests[1].content) == {
        "priceSnapshotId": "snapshot_business",
        "quantity": 1,
    }
    assert confirmed.status == "succeeded"
    assert confirmed.action is None

    # 官方 status=2：处理中，返回 pending 且不携带价格或跳转，
    # 前端轮询、不得视为失败或重复扣款。
    def pending_handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/update/confirm")
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_test",
                    "status": 2,
                    "message": "processing",
                },
            },
        )

    _install_transport(monkeypatch, pending_handler)
    pending = await _provider().confirm_subscription_update(
        channel_subscription_id="sub_test",
        price_snapshot_id="snapshot_business",
        target_provider_sku="prd_business:price_business",
    )
    assert pending.status == "requires_action"
    assert pending.action is not None
    assert pending.action.type == "wait"
    assert pending.action.url is None

    def failed_handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path.endswith("/update/confirm")
        return httpx.Response(
            200, json={"code": 200, "data": {"subscriptionId": "sub_test", "status": 3}}
        )

    _install_transport(monkeypatch, failed_handler)
    failed = await _provider().confirm_subscription_update(
        channel_subscription_id="sub_test",
        target_provider_sku="prd_business:price_business",
        price_snapshot_id="snapshot_business",
    )
    assert failed.status == "failed"
    assert failed.action is None


async def test_real_clink_confirm_next_action_returns_official_redirect(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """confirm status=5 时返回官方托管页跳转地址，非官方 host 拒绝。"""

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_test",
                    "status": 5,
                    "action": {
                        "type": "CARD",
                        "method": "GET",
                        "redirectUrl": redirect_url,
                    },
                },
            },
        )

    # 官方 Checkout 托管页跳转可信，作为 redirect action 返回。
    redirect_url = "https://uat-checkout.clinkbill.com/3ds/challenge?token=t"
    _install_transport(monkeypatch, handler)
    confirmed = await _provider().confirm_subscription_update(
        channel_subscription_id="sub_test",
        price_snapshot_id="snapshot_test",
        target_provider_sku="prd_business:price_business",
    )
    assert confirmed.status == "requires_action"
    assert confirmed.action is not None
    assert confirmed.action.type == "redirect"
    assert confirmed.action.url == redirect_url

    # 非官方 host 一律拒绝，错误上抛重试。
    redirect_url = "https://evil.example.com/3ds/challenge"
    with pytest.raises(PaymentProviderError, match="host mismatch"):
        await _provider().confirm_subscription_update(
            channel_subscription_id="sub_test",
            price_snapshot_id="snapshot_test",
            target_provider_sku="prd_business:price_business",
        )


async def test_real_clink_subscription_state_carries_full_sku(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """GET Subscription 返回完整 productId:priceId 与首单引用，供幂等与映射。"""

    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_test",
                    "merchantReference": "ORDER-CLINK-1",
                    "productId": "prd_business",
                    "priceId": "price_business",
                    "currency": "USD",
                    "status": "active",
                },
            },
        )

    _install_transport(monkeypatch, handler)
    state = await _provider().get_subscription_state("sub_test")

    assert requests[0].url.path == "/api/subscription/sub_test"
    assert state.original_order_no == "ORDER-CLINK-1"
    assert state.provider_sku == "prd_business:price_business"


async def test_real_clink_subscription_state_rejects_mismatched_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """GET Subscription 响应订阅 ID 与请求错位时拒绝，不返回错位状态。"""

    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {
                    "subscriptionId": "sub_other",
                    "merchantReference": "ORDER-CLINK-1",
                    "productId": "prd_business",
                    "priceId": "price_business",
                    "currency": "USD",
                    "status": "active",
                },
            },
        )

    _install_transport(monkeypatch, handler)
    with pytest.raises(PaymentProviderError, match="subscription id mismatch"):
        await _provider().get_subscription_state("sub_test")


async def test_real_clink_plan_changed_webhook_carries_subscription_id() -> None:
    """subscription.updated.plan_changed 验签后解析渠道订阅 ID，不进订单履约。"""

    verified = await _provider().verify_callback(
        _callback_request(
            _event(
                "subscription.updated.plan_changed",
                {
                    "subscriptionId": "sub_test",
                    "merchantReference": "ORDER-CLINK-1",
                },
            )
        )
    )

    assert verified.valid is True
    assert verified.processed is False
    assert verified.event == "subscription.updated.plan_changed"
    assert verified.provider_data == {
        "clink_event_id": "event_test_1",
        "clink_subscription_id": "sub_test",
    }
    assert verified.order_no is None


def _callback_request(
    payload: dict[str, object],
    *,
    signing_body: bytes | None = None,
) -> Request:
    """构造带真实原始 body HMAC 的 ASGI Request。"""

    body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    signed_body = body if signing_body is None else signing_body
    timestamp_value = int(time.time())
    signature = hmac.new(
        _WEBHOOK_KEY.encode("utf-8"),
        str(timestamp_value).encode("ascii") + b"." + signed_body,
        hashlib.sha256,
    ).hexdigest()
    sent = False

    async def receive() -> dict[str, object]:
        nonlocal sent
        if sent:
            return {"type": "http.request", "body": b"", "more_body": False}
        sent = True
        return {"type": "http.request", "body": body, "more_body": False}

    return Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/callback/clink/payment",
            "headers": [
                (b"x-clink-timestamp", str(timestamp_value).encode("ascii")),
                (b"x-clink-signature", signature.encode("ascii")),
                (b"x-clink-signtype", b"SHA256"),
            ],
        },
        receive,
    )


def _event(event_type: str, event_object: dict[str, object]) -> dict[str, object]:
    """构造 canonical Clink event envelope。"""

    return {
        "id": "event_test_1",
        "object": "event",
        "created": int(time.time() * 1000),
        "type": event_type,
        "data": {"object": event_object},
    }


async def test_real_clink_webhook_rejects_tampered_body() -> None:
    """原始 body 被篡改时验签必须拒绝。"""

    with pytest.raises(PaymentProviderError, match="signature mismatch"):
        await _provider().verify_callback(
            _callback_request(
                _event("order.succeeded", {"type": "onetime"}),
                signing_body=b"tampered",
            )
        )
