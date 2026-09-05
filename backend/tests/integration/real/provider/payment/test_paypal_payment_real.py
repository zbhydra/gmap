"""PayPal 自动续费回调与 SKU 合同 real 测试。

真实资源依赖：
- Redis: PayPal access token 缓存读取（测试 token 短时效不写入缓存）
- PayPal OAuth、验签与订阅状态查询是不可控外部 HTTP 出口，用明确响应的
  httpx.MockTransport 替换；生产解析与验签方法真实执行。
"""

import json

import httpx
import pytest
from fastapi import Request

from app.constants.order import OrderStatus
from app.provider.payment.paypal import (
    PAYPAL_SUBSCRIPTION_SALE_COMPLETED_EVENT,
    PAYPAL_SUBSCRIPTION_UPDATED_EVENT,
    PayPalPaymentProvider,
)
from app.provider.payment.payment_base import PaymentProviderError, PaymentRequest

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


def _provider() -> PayPalPaymentProvider:
    """创建测试用 PayPal provider。"""

    return PayPalPaymentProvider(
        {
            "client_id": "client-id",
            "client_secret": "client-secret",
            "webhook_id": "webhook-id",
            "request_timeout_seconds": 3,
        }
    )


def _subscription_sale_event(
    *,
    sale_id: str = "SALE-123",
    subscription_id: str = "PAYPAL-SUB-123",
    order_no: str = "ORDPAYPAL123",
) -> dict[str, object]:
    """构造 PayPal subscription sale completed webhook event。"""

    return {
        "event_type": PAYPAL_SUBSCRIPTION_SALE_COMPLETED_EVENT,
        "resource": {
            "id": sale_id,
            "billing_agreement_id": subscription_id,
            "custom_id": order_no,
            "amount": {"currency": "USD", "total": "15.30"},
            "payer": {"payer_info": {"payer_id": "PAYER-123"}},
        },
    }


def _callback_request(body: bytes) -> Request:
    """构造携带官方 webhook 头的 FastAPI Request。"""

    headers = [
        (b"paypal-auth-algo", b"SHA256withRSA"),
        (b"paypal-cert-url", b"https://api-m.paypal.com/certs.pem"),
        (b"paypal-transmission-id", b"pytest-transmission-id"),
        (b"paypal-transmission-sig", b"pytest-transmission-sig"),
        (b"paypal-transmission-time", b"2026-09-02T12:00:00Z"),
    ]
    scope = {
        "type": "http",
        "method": "POST",
        "path": "/api/callback/paypal",
        "headers": headers,
    }

    async def receive() -> dict[str, object]:
        return {"type": "http.request", "body": body, "more_body": False}

    return Request(scope, receive)


def _install_paypal_transport(monkeypatch: pytest.MonkeyPatch) -> None:
    """用 MockTransport 替换 PayPal OAuth、验签与订阅查询外部端点。"""

    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200,
                json={"access_token": "pytest-token", "expires_in": 30},
            )
        if request.url.path == "/v1/notifications/verify-webhook-signature":
            payload = json.loads(request.content)
            assert payload["webhook_id"] == "webhook-id"
            assert payload["transmission_id"] == "pytest-transmission-id"
            assert payload["webhook_event"]["event_type"] == (
                PAYPAL_SUBSCRIPTION_SALE_COMPLETED_EVENT
            )
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        if request.url.path == "/v1/billing/subscriptions/PAYPAL-SUB-123":
            assert request.headers["Authorization"] == "Bearer pytest-token"
            return httpx.Response(
                200,
                json={
                    "id": "PAYPAL-SUB-123",
                    "status": "ACTIVE",
                    "billing_info": {
                        "next_billing_time": "2026-10-02T12:00:00Z",
                        "last_payment": {"time": "2026-09-02T12:00:00Z"},
                    },
                },
            )
        raise AssertionError(f"unexpected PayPal request: {request.url.path}")

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.paypal.httpx.AsyncClient",
        client_factory,
    )


async def test_real_paypal_subscription_sale_builds_provider_subscription(
    real_redis_ready: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """订阅扣款回调经真实验签与渠道查询写 provider_subscription 账期。

    第二段补充唯一 GET owner 的错位拒绝：必须在本测试首个 transport 安装
    前捕获真实 AsyncClient（安装会全局替换共享 httpx.AsyncClient 属性）。
    """

    # 错位拒绝段使用：真实 AsyncClient，先于 _install_paypal_transport 捕获。
    original_client = httpx.AsyncClient

    _install_paypal_transport(monkeypatch)

    verified = await _provider().verify_callback(
        _callback_request(json.dumps(_subscription_sale_event()).encode("utf-8"))
    )

    assert verified.valid is True
    assert verified.processed is True
    assert verified.channel_order_no == "SALE-123"
    callback_metadata = json.loads(verified.extra_metadata or "{}")
    assert callback_metadata["provider_subscription"] == {
        "channel_subscription_id": "PAYPAL-SUB-123",
        "original_order_no": "ORDPAYPAL123",
        "start_at": 1_788_350_400_000,
        "expires_at": 1_790_942_400_000,
    }
    assert verified.recurring_reference.original_order_no == "ORDPAYPAL123"

    # 订阅状态查询唯一 GET owner 的错位拒绝：响应订阅 ID 与请求不一致时，
    # 不得用错位状态归一化账期，直接抛错。
    def mismatched_handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return httpx.Response(
                200, json={"access_token": "pytest-token", "expires_in": 30}
            )
        if request.url.path == "/v1/notifications/verify-webhook-signature":
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        if request.url.path == "/v1/billing/subscriptions/PAYPAL-SUB-123":
            return httpx.Response(
                200,
                json={
                    "id": "PAYPAL-OTHER-123",
                    "status": "ACTIVE",
                    "billing_info": {"next_billing_time": "2026-10-02T12:00:00Z"},
                },
            )
        raise AssertionError(f"unexpected PayPal request: {request.url.path}")

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(mismatched_handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.paypal.httpx.AsyncClient",
        client_factory,
    )
    with pytest.raises(PaymentProviderError, match="subscription id mismatch"):
        await _provider().verify_callback(
            _callback_request(json.dumps(_subscription_sale_event()).encode("utf-8"))
        )


async def test_real_paypal_auto_renew_requires_canonical_plan_sku() -> None:
    """PayPal 自动续费 SKU 必须符合官方 Plan ID 格式。"""

    with pytest.raises(PaymentProviderError, match="provider_sku invalid"):
        _provider()._validate_payment_request(  # noqa: SLF001
            PaymentRequest(
                order_no="ORDPAYPAL123",
                payment_method="paypal",
                order_status=OrderStatus.PENDING.value,
                amount=12_990_000,
                currency="USD",
                product_name="Unlimited",
                expired_at=4_102_444_800_000,
                auto_renew=True,
                provider_sku="P-PLAN-123",
            )
        )


def _install_transport(monkeypatch: pytest.MonkeyPatch, handler) -> None:
    """替换 PayPal 外部 HTTP 出口。"""

    original_client = httpx.AsyncClient

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.paypal.httpx.AsyncClient",
        client_factory,
    )


def _oauth_handler(request: httpx.Request) -> httpx.Response:
    """回答 OAuth token 请求。"""

    if request.url.path == "/v1/oauth2/token":
        return httpx.Response(
            200, json={"access_token": "pytest-token", "expires_in": 30}
        )
    raise AssertionError(f"unexpected PayPal request: {request.url.path}")


async def test_real_paypal_subscription_updated_webhook_carries_subscription_id(
    real_redis_ready: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """BILLING.SUBSCRIPTION.UPDATED 经真实验签后解析渠道订阅 ID，不进订单履约。"""

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/v1/oauth2/token":
            return _oauth_handler(request)
        if request.url.path == "/v1/notifications/verify-webhook-signature":
            payload = json.loads(request.content)
            assert payload["webhook_event"]["event_type"] == (
                PAYPAL_SUBSCRIPTION_UPDATED_EVENT
            )
            return httpx.Response(200, json={"verification_status": "SUCCESS"})
        raise AssertionError(f"unexpected PayPal request: {request.url.path}")

    _install_transport(monkeypatch, handler)
    verified = await _provider().verify_callback(
        _callback_request(
            json.dumps(
                {
                    "event_type": PAYPAL_SUBSCRIPTION_UPDATED_EVENT,
                    "resource": {"id": "PAYPAL-SUB-123"},
                }
            ).encode("utf-8")
        )
    )

    assert verified.valid is True
    assert verified.processed is False
    assert verified.event == PAYPAL_SUBSCRIPTION_UPDATED_EVENT
    assert verified.provider_data == {"paypal_subscription_id": "PAYPAL-SUB-123"}
    assert verified.order_no is None
