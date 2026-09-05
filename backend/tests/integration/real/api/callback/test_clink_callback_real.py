"""ClinkBill Webhook 经真实 MySQL、Redis 和 OrderService 的回调测试。

真实资源依赖：
- MySQL: users / orders / user_subscriptions / 订阅支付配置表（配置只读）
- Redis: 用户 access token 白名单与订单回调幂等锁
- 外部 Clink HTTP（Hosted Checkout 与订阅查询）用明确响应的 httpx.MockTransport 替换
"""

import hashlib
import hmac
import json
import time
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import cast
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import delete, select, text
from sqlalchemy.sql.elements import ColumnElement

from app.constants.order import CallbackStatus, OrderStatus, ProductClass
from app.constants.payment import CLINK_PAYMENT_METHOD
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.config import settings
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.services.order_service import order_service
from app.utils.money import format_normalized_amount
from app.utils.time import add_natural_months, timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_WEBHOOK_PATH = "/api/callback/clink/payment"
_DAY_MS = 86_400_000
_CLINK_CHECKOUT_HOSTS = {
    "sandbox": "uat-checkout.clinkbill.com",
    "live": "checkout.clinkbill.com",
}


@dataclass(slots=True)
class _CleanupState:
    """记录本测试手造订单的幻影身份，真实用户由 real_user_factory 统一清理。"""

    test_run_id: str
    phantom_user_id: int


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
async def real_clink_schema_ready(real_mysql_ready: None) -> None:
    """检查 Clink 回调真实履约需要的 MySQL 表。"""

    required_tables = {
        "users",
        "orders",
        "user_subscriptions",
        "config_payment_channel",
        "config_subscription_product",
        "config_subscription_product_price",
    }
    missing = [
        name for name in sorted(required_tables) if not await _table_exists(name)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_clink_cleanup_state(
    real_clink_schema_ready: None,
    test_run_id: str,
) -> AsyncIterator[_CleanupState]:
    """清理本测试手造订单的幻影身份数据。"""

    state = _CleanupState(
        test_run_id=f"{test_run_id}{uuid4().hex[:10]}",
        phantom_user_id=9_700_000_000_000 + uuid4().int % 1_000_000_000_000,
    )
    try:
        yield state
    finally:
        async with get_async_session() as db:
            subscription_user_id = cast(
                ColumnElement[int], UserSubscriptionModel.user_id
            )
            await db.execute(
                delete(UserSubscriptionModel).where(
                    subscription_user_id == state.phantom_user_id
                )
            )
            await db.execute(
                delete(OrderModel).where(OrderModel.user_id == state.phantom_user_id)
            )
            await db.commit()


@pytest.fixture(autouse=True)
def _use_tmp_log_root(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    """把原始回调日志写入临时目录，避免污染项目日志。"""

    monkeypatch.setattr(settings, "root_path", str(tmp_path))


async def _load_clink_config() -> tuple[dict[str, object], str]:
    """读取启用的 Clink 渠道配置（真实开发配置只读），返回配置与环境。"""

    from app.models.config_payment_channel_model import ConfigPaymentChannelModel

    async with get_async_session() as db:
        channel = await db.scalar(
            select(ConfigPaymentChannelModel)
            .where(ConfigPaymentChannelModel.enabled.is_(True))
            .where(ConfigPaymentChannelModel.channel_code == CLINK_PAYMENT_METHOD)
            .limit(1)
        )
    if channel is None or not channel.config_json:
        pytest.skip("REAL_CLINK_CHANNEL_UNAVAILABLE: 缺少启用的 ClinkBill 渠道配置")
    try:
        config = json.loads(channel.config_json)
    except json.JSONDecodeError as exc:
        pytest.fail(f"ClinkBill 渠道 config_json 不是合法 JSON: {exc}")
    if not isinstance(config, dict) or not config.get("webhook_signing_key"):
        pytest.skip(
            "REAL_CLINK_CHANNEL_UNAVAILABLE: ClinkBill 渠道配置缺少 webhook_signing_key"
        )
    environment = str(config.get("environment", ""))
    if environment not in _CLINK_CHECKOUT_HOSTS:
        pytest.skip(
            "REAL_CLINK_CHANNEL_UNAVAILABLE: ClinkBill 渠道 environment 无法识别"
        )
    return cast(dict[str, object], config), environment


def _signed_headers(body: bytes, webhook_key: str, timestamp: int) -> dict[str, str]:
    """为原始 JSON body 生成 Clink HMAC header。"""

    signature = hmac.new(
        webhook_key.encode("utf-8"),
        str(timestamp).encode("ascii") + b"." + body,
        hashlib.sha256,
    ).hexdigest()
    return {
        "Content-Type": "application/json",
        "X-Clink-Timestamp": str(timestamp),
        "X-Clink-Signature": signature,
        "X-Clink-SignType": "SHA256",
    }


def _event(
    webhook_key: str,
    event_id: str,
    event_type: str,
    event_object: dict[str, object],
) -> tuple[bytes, dict[str, str]]:
    """序列化 canonical Clink event，签名和发送共用同一 body。"""

    body = json.dumps(
        {
            "id": event_id,
            "object": "event",
            "created": int(time.time() * 1000),
            "type": event_type,
            "data": {"object": event_object},
        },
        separators=(",", ":"),
    ).encode("utf-8")
    return body, _signed_headers(body, webhook_key, int(time.time()))


def _install_clink_http(
    monkeypatch: pytest.MonkeyPatch,
    *,
    checkout_host: str,
    subscription_payload: dict[str, object] | None = None,
) -> None:
    """替换 Clink 外部 HTTP 出口：Hosted Checkout 与可选订阅查询。"""

    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "POST" and request.url.path == "/api/checkout/session":
            return httpx.Response(
                200,
                json={
                    "code": 200,
                    "data": {
                        "sessionId": "sess_clink_real",
                        "url": f"https://{checkout_host}/pay/token",
                    },
                },
            )
        assert request.method == "GET"
        assert request.url.path.startswith("/api/subscription/")
        assert subscription_payload is not None
        return httpx.Response(200, json={"code": 200, "data": subscription_payload})

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.clink.httpx.AsyncClient",
        client_factory,
    )


async def _clink_unlimited_price(
    real_async_client: httpx.AsyncClient,
) -> dict[str, object]:
    """从真实 checkout 配置读取 unlimited 的 Clink 渠道价。"""

    response = await real_async_client.get("/api/client/subscription/checkout-configs")
    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    plans = response.json()["data"]["checkout_configs"]
    if not plans:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 订阅商品展示配置尚未初始化")
    plan = next(
        (
            item
            for item in plans
            if item["product_line"] == EXTENSION_PRODUCT_LINE
            and item["product_id"] == UNLIMITED_SUBSCRIPTION_PRODUCT_ID
        ),
        None,
    )
    if plan is None:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少 extension 线 unlimited 配置")
    price = next(
        (
            item
            for item in plan["payment_channels"]
            if item["payment_method"] == CLINK_PAYMENT_METHOD
        ),
        None,
    )
    if price is None:
        pytest.skip("REAL_CLINK_CHANNEL_UNAVAILABLE: unlimited 缺少 Clink 渠道价")
    return price


async def _subscription(
    user_id: int, product_line: str
) -> UserSubscriptionModel | None:
    """读取指定产品线的真实订阅履约结果。"""

    async with get_async_session() as db:
        stmt = select(UserSubscriptionModel).filter_by(
            user_id=user_id,
            product_line=product_line,
        )
        return await db.scalar(stmt)


async def _orders_for_channel(channel_order_no: str) -> list[OrderModel]:
    """读取指定 Clink 渠道流水对应的本地订单。"""

    async with get_async_session() as db:
        result = await db.scalars(
            select(OrderModel).where(
                OrderModel.payment_method == CLINK_PAYMENT_METHOD,
                OrderModel.payment_channel_order_no == channel_order_no,
            )
        )
        return list(result.all())


async def test_real_clink_purchase_then_onetime_order_fulfills_natural_month(
    real_async_client: httpx.AsyncClient,
    real_redis_ready: None,
    real_clink_cleanup_state: _CleanupState,
    real_user_factory,
    make_test_email,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实 Clink 下单接 order.succeeded 回调完成自然月履约并应答 account 事件。"""

    config, environment = await _load_clink_config()
    webhook_key = str(config["webhook_signing_key"])
    cleanup = real_clink_cleanup_state
    email = make_test_email("clink-callback")
    monkeypatch.setattr(
        settings.app, "public_website_base_url", "https://gmap.example.com"
    )
    _install_clink_http(monkeypatch, checkout_host=_CLINK_CHECKOUT_HOSTS[environment])
    price = await _clink_unlimited_price(real_async_client)
    user_id, token = await real_user_factory(email)

    create_response = await real_async_client.post(
        "/api/client/order/create",
        json={
            "product_class": ProductClass.SUBSCRIPTION.value,
            "product_id": UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
            "payment_method": CLINK_PAYMENT_METHOD,
            "currency": price["currency"],
            "amount": price["amount"],
            "auto_renew": False,
            "period": "month",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    create_body = create_response.json()
    assert create_response.status_code == 200
    assert create_body["code"] == CommonCode.SUCCESS
    order_no = str(create_body["data"]["order_no"])
    assert int(create_body["data"]["amount"]) == price["amount"]
    checkout_url = str(create_body["data"]["payment_data"]["url"])
    assert checkout_url == f"https://{_CLINK_CHECKOUT_HOSTS[environment]}/pay/token"
    session_id = str(create_body["data"]["payment_data"]["sessionId"])

    body, headers = _event(
        webhook_key,
        f"event_order_{cleanup.test_run_id}",
        "order.succeeded",
        {
            "type": "onetime",
            "orderId": f"ord_{cleanup.test_run_id}",
            "merchantReferenceId": order_no,
            "customerEmail": email,
            "sessionId": session_id,
            "amountTotal": float(format_normalized_amount(int(price["amount"]))),
            "paymentCurrency": str(price["currency"]),
        },
    )
    response = await real_async_client.post(
        _WEBHOOK_PATH, content=body, headers=headers
    )
    payload = response.json()

    assert response.status_code == 200
    assert payload["object"] == "event"
    assert payload["type"] == "account.reloaded"
    assert payload["data"]["customerEmail"] == email
    assert payload["data"]["userId"] == str(user_id)
    assert payload["data"]["amount"] == float(
        format_normalized_amount(int(price["amount"]))
    )
    assert payload["data"]["currency"] == "USD"

    stored_orders = await _orders_for_channel(f"ord_{cleanup.test_run_id}")
    assert len(stored_orders) == 1
    assert stored_orders[0].order_no == order_no
    assert stored_orders[0].order_status == OrderStatus.PAID.value
    assert stored_orders[0].callback_status == CallbackStatus.SUCCESS.value

    subscription = await _subscription(user_id, EXTENSION_PRODUCT_LINE)
    assert subscription is not None
    assert subscription.product_id == UNLIMITED_SUBSCRIPTION_PRODUCT_ID
    assert subscription.auto_renew is False
    assert subscription.payment_method == CLINK_PAYMENT_METHOD
    assert subscription.start_at is not None
    assert subscription.expires_at == add_natural_months(subscription.start_at, 1)
    assert subscription.expires_at >= add_natural_months(timestamp_now() - _DAY_MS, 1)


async def test_real_clink_invoice_paid_fulfills_renewal_once(
    real_async_client: httpx.AsyncClient,
    real_redis_ready: None,
    real_clink_cleanup_state: _CleanupState,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Invoice 回调经订阅双引用对账后创建续费订单并按渠道账期推进。"""

    config, environment = await _load_clink_config()
    webhook_key = str(config["webhook_signing_key"])
    cleanup = real_clink_cleanup_state
    now_ms = timestamp_now()
    order_no = f"ORC{cleanup.test_run_id.upper()}"[:32]
    session_id = f"sess_{cleanup.test_run_id}"
    subscription_id = f"sub_{cleanup.test_run_id}"
    customer_id = f"cust_{cleanup.test_run_id}"
    first_period_end = now_ms + 30 * _DAY_MS
    renewal_period_end = now_ms + 60 * _DAY_MS
    order = OrderModel(  # type: ignore[call-arg]
        order_no=order_no,
        user_id=cleanup.phantom_user_id,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        product_name=f"pytest-clink-{cleanup.test_run_id}",
        amount=12_340_000,
        currency="USD",
        order_status=OrderStatus.PAID.value,
        callback_status=CallbackStatus.PENDING.value,
        payment_method=CLINK_PAYMENT_METHOD,
        payment_channel_order_no=f"ord_{cleanup.test_run_id}",
        payment_channel_uid=customer_id,
        paid_amount=12_340_000,
        paid_currency="USD",
        paid_at=now_ms,
        payment_data=json.dumps({"sessionId": session_id}, separators=(",", ":")),
        expired_at=now_ms + _DAY_MS,
        extra_metadata=json.dumps(
            {
                "product_snapshot": {
                    "product_line": EXTENSION_PRODUCT_LINE,
                    "product_price_id": 999_002,
                    "auto_renew": True,
                    "period": "month",
                    "currency": "USD",
                    "amount": 12_340_000,
                    "provider_sku": None,
                },
                "payment_callback": {
                    "provider_subscription": {
                        "channel_subscription_id": subscription_id,
                        "original_order_no": order_no,
                        "start_at": now_ms,
                        "expires_at": first_period_end,
                    }
                },
                "test_run_id": cleanup.test_run_id,
            },
            separators=(",", ":"),
        ),
        created_at=now_ms,
        updated_at=now_ms,
    )
    stored_order = await order_service.create(order)
    assert await order_service.fulfill_paid_order(stored_order) is True

    subscription_before = await _subscription(
        cleanup.phantom_user_id, EXTENSION_PRODUCT_LINE
    )
    assert subscription_before is not None
    assert subscription_before.expires_at == first_period_end

    _install_clink_http(
        monkeypatch,
        checkout_host=_CLINK_CHECKOUT_HOSTS[environment],
        subscription_payload={
            "subscriptionId": subscription_id,
            "merchantReference": order_no,
            "customerId": customer_id,
            "sessionId": session_id,
            "recurringInvoiceItem": {
                "periodStart": first_period_end,
                "periodEnd": renewal_period_end,
            },
        },
    )

    invoice_body, invoice_headers = _event(
        webhook_key,
        f"event_invoice_{cleanup.test_run_id}",
        "invoice.paid",
        {
            "invoiceId": f"inv_{cleanup.test_run_id}",
            "subscriptionId": subscription_id,
            "orderId": f"ordr_{cleanup.test_run_id}",
            "originalAmount": "12.34",
            "originalCurrency": "USD",
        },
    )
    response = await real_async_client.post(
        _WEBHOOK_PATH,
        content=invoice_body,
        headers=invoice_headers,
    )

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS.value
    assert response.json()["data"]["event"] == "invoice.paid"

    renewal_orders = await _orders_for_channel(f"inv_{cleanup.test_run_id}")
    assert len(renewal_orders) == 1
    assert renewal_orders[0].order_status == OrderStatus.PAID.value
    assert renewal_orders[0].callback_status == CallbackStatus.SUCCESS.value
    assert renewal_orders[0].payment_transaction_id == f"ordr_{cleanup.test_run_id}"

    subscription_after = await _subscription(
        cleanup.phantom_user_id, EXTENSION_PRODUCT_LINE
    )
    assert subscription_after is not None
    assert subscription_after.expires_at == renewal_period_end
    assert subscription_after.channel_uid == customer_id


async def test_real_clink_recurring_order_succeeded_is_not_fulfilled(
    real_async_client: httpx.AsyncClient,
    real_redis_ready: None,
    real_clink_cleanup_state: _CleanupState,
) -> None:
    """recurring order.succeeded 只确认接收，履约只认 Invoice。"""

    config, _environment = await _load_clink_config()
    webhook_key = str(config["webhook_signing_key"])
    cleanup = real_clink_cleanup_state
    now_ms = timestamp_now()
    order_no = f"ORC{cleanup.test_run_id.upper()}"[:32]
    session_id = f"sess_{cleanup.test_run_id}"
    order = OrderModel(  # type: ignore[call-arg]
        order_no=order_no,
        user_id=cleanup.phantom_user_id,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        product_name=f"pytest-clink-{cleanup.test_run_id}",
        amount=12_340_000,
        currency="USD",
        order_status=OrderStatus.PENDING.value,
        callback_status=CallbackStatus.PENDING.value,
        payment_method=CLINK_PAYMENT_METHOD,
        payment_channel_order_no=f"ord_{cleanup.test_run_id}",
        payment_data=json.dumps({"sessionId": session_id}, separators=(",", ":")),
        expired_at=now_ms + _DAY_MS,
        created_at=now_ms,
        updated_at=now_ms,
    )
    await order_service.create(order)

    body, headers = _event(
        webhook_key,
        f"event_order_{cleanup.test_run_id}",
        "order.succeeded",
        {
            "type": "recurring",
            "orderId": f"ordr_{cleanup.test_run_id}",
            "merchantReferenceId": order_no,
            "customerEmail": f"{cleanup.test_run_id}@pytest-clink.example.com",
            "sessionId": session_id,
            "amountTotal": 12.34,
            "paymentCurrency": "USD",
        },
    )
    response = await real_async_client.post(
        _WEBHOOK_PATH, content=body, headers=headers
    )
    payload = response.json()

    assert response.status_code == 200
    assert payload["type"] == "account.reloaded"
    assert await _subscription(cleanup.phantom_user_id, EXTENSION_PRODUCT_LINE) is None
    stored_orders = await _orders_for_channel(f"ord_{cleanup.test_run_id}")
    assert stored_orders[0].order_status == OrderStatus.PENDING.value


async def test_real_clink_plan_changed_webhook_mismatch_returns_http_500(
    real_async_client: httpx.AsyncClient,
    real_redis_ready: None,
    real_clink_cleanup_state: _CleanupState,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """计划变更 webhook 核对失败：真实 callback 入口 HTTP 500 让渠道重试。

    渠道订阅查询是不可控外部出口，用明确响应的 MockTransport 替换；经真实
    /api/callback/clink/payment 入口（验签 → 路由分发 → 订阅服务收敛）
    验证订阅行与事件订阅 ID 不一致时返回 500 且不写库。
    """

    config, environment = await _load_clink_config()
    webhook_key = str(config["webhook_signing_key"])
    cleanup = real_clink_cleanup_state
    now_ms = timestamp_now()
    order_no = f"ORCP{cleanup.test_run_id.upper()}"[:32]
    row_subscription_id = f"sub_row_{cleanup.test_run_id}"
    event_subscription_id = f"sub_event_{cleanup.test_run_id}"

    async with get_async_session() as db:
        db.add(
            OrderModel(  # type: ignore[call-arg]
                order_no=order_no,
                user_id=cleanup.phantom_user_id,
                product_class=ProductClass.SUBSCRIPTION.value,
                product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
                product_name=f"pytest-clink-plan-{cleanup.test_run_id}",
                amount=12_340_000,
                currency="USD",
                order_status=OrderStatus.PAID.value,
                callback_status=CallbackStatus.SUCCESS.value,
                payment_method=CLINK_PAYMENT_METHOD,
                paid_amount=12_340_000,
                paid_currency="USD",
                paid_at=now_ms,
                expired_at=now_ms + _DAY_MS,
                extra_metadata=json.dumps(
                    {
                        "product_snapshot": {
                            "product_line": EXTENSION_PRODUCT_LINE,
                            "product_price_id": 999_003,
                            "auto_renew": True,
                            "period": "month",
                            "currency": "USD",
                            "amount": 12_340_000,
                            "provider_sku": None,
                        },
                        "test_run_id": cleanup.test_run_id,
                    },
                    separators=(",", ":"),
                ),
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=cleanup.phantom_user_id,
                product_line=EXTENSION_PRODUCT_LINE,
                product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
                auto_renew=True,
                payment_method=CLINK_PAYMENT_METHOD,
                channel_subscription_id=row_subscription_id,
                start_at=now_ms,
                expires_at=now_ms + 20 * _DAY_MS,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()

    _install_clink_http(
        monkeypatch,
        checkout_host=_CLINK_CHECKOUT_HOSTS[environment],
        subscription_payload={
            "subscriptionId": event_subscription_id,
            "merchantReference": order_no,
            "productId": "prd_business",
            "priceId": "price_business",
            "currency": "USD",
            "status": "active",
        },
    )

    body, headers = _event(
        webhook_key,
        f"event_plan_{cleanup.test_run_id}",
        "subscription.updated.plan_changed",
        {"subscriptionId": event_subscription_id},
    )
    response = await real_async_client.post(
        _WEBHOOK_PATH, content=body, headers=headers
    )

    assert response.status_code == 500
    assert response.json()["code"] == CommonCode.INTERNAL_SERVER_ERROR
    row = await _subscription(cleanup.phantom_user_id, EXTENSION_PRODUCT_LINE)
    assert row is not None
    assert row.channel_subscription_id == row_subscription_id
    assert row.product_id == UNLIMITED_SUBSCRIPTION_PRODUCT_ID


async def test_real_clink_unsupported_event_is_logged_and_acknowledged(
    real_async_client: httpx.AsyncClient,
    real_redis_ready: None,
    real_clink_cleanup_state: _CleanupState,
    tmp_path,
) -> None:
    """未支持事件记录原始请求并确认接收，交给 Clink 停止重试。"""

    config, _environment = await _load_clink_config()
    webhook_key = str(config["webhook_signing_key"])
    payload_dict = {
        "id": "event_test_1",
        "object": "event",
        "created": int(time.time() * 1000),
        "type": "subscription.created",
        "data": {"object": {}},
    }
    body = json.dumps(payload_dict).encode("utf-8")
    headers = _signed_headers(body, webhook_key, int(time.time()))
    headers["X-Trace-Id"] = "pytest-trace"

    response = await real_async_client.post(
        _WEBHOOK_PATH, content=body, headers=headers
    )

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS.value
    assert response.json()["data"] == {
        "processed": False,
        "event": "subscription.created",
        "reason": "unsupported_event",
    }

    log_files = list((tmp_path / "log" / "payment" / "clink").glob("*.log"))
    assert len(log_files) == 1
    entry = json.loads(log_files[0].read_text(encoding="utf-8"))
    assert json.loads(entry["body"]) == payload_dict
    assert entry["headers"]["x-clink-timestamp"] == headers["X-Clink-Timestamp"]
    assert entry["headers"]["x-trace-id"] == "pytest-trace"
    assert "x-clink-signature" not in entry["headers"]
