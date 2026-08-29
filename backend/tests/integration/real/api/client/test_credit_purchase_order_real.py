"""Credits 购买下单 real 测试。

真实资源依赖：
- MySQL: users / orders / config_payment_channel / config_credit_product / config_credit_product_price
- Redis: 用户 access token 校验
- Telegram Bot API: createInvoiceLink 真实外部请求

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
GET /api/client/credit/checkout-configs | Y | N/A | N/A | N/A | N/A | N/A | config-driven | config-driven | config-driven | N/A
POST /api/client/order/create | Y | centralized | pydantic | pydantic | config price | config price | product config | product config | product config | Y
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
import json

import pytest
from sqlalchemy import delete, func, select, text

from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_credit_account_model import UserCreditAccountModel
from app.models.user_credit_log_model import UserCreditLogModel
from app.models.user_model import UserModel


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_PASSWORD = "Test123456!"


@dataclass(slots=True)
class _CleanupState:
    """记录本文件创建的真实测试数据。"""

    emails: list[str] = field(default_factory=list)
    order_nos: list[str] = field(default_factory=list)


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


async def _delete_purchase_user(email: str, order_nos: list[str]) -> None:
    """删除购买 real 测试创建的订单和用户。"""

    async with get_async_session() as db:
        user_id = await db.scalar(
            select(UserModel.user_id).where(UserModel.email == email)
        )
        if order_nos:
            await db.execute(
                delete(OrderModel).where(OrderModel.order_no.in_(order_nos))
            )
        if user_id is not None:
            await db.execute(
                delete(UserCreditLogModel).where(UserCreditLogModel.user_id == user_id)
            )
            await db.execute(
                delete(UserCreditAccountModel).where(
                    UserCreditAccountModel.user_id == user_id
                )
            )
            await db.execute(
                delete(UserSubscriptionModel).where(
                    UserSubscriptionModel.user_id == user_id
                )
            )
            await db.execute(delete(OrderModel).where(OrderModel.user_id == user_id))
            await db.execute(delete(UserModel).where(UserModel.user_id == user_id))
        await db.commit()


@pytest.fixture
async def real_purchase_schema_ready(real_mysql_ready, real_redis_ready) -> None:
    """检查购买 real 测试需要的真实表。"""

    required_tables = {
        "users",
        "orders",
        "config_payment_channel",
        "config_credit_product",
        "config_credit_product_price",
    }
    missing = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_purchase_cleanup_state(
    real_purchase_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """清理本文件创建的真实测试数据。"""

    state = _CleanupState()
    try:
        yield state
    finally:
        for email in state.emails:
            await _delete_purchase_user(email, state.order_nos)


async def _register_and_login(
    real_async_client,
    *,
    email: str,
) -> str:
    """注册并登录真实测试用户，返回 access token。"""

    register_response = await real_async_client.post(
        "/api/client/auth/register",
        json={
            "email": email,
            "password": _PASSWORD,
            "full_name": "Credit Purchase Real User",
        },
        headers={"X-Client-Product": "web"},
    )
    assert register_response.status_code == 200
    assert register_response.json()["code"] in (
        10000,
        CommonCode.USER_EMAIL_EXISTS.value,
    )

    login_response = await real_async_client.post(
        "/api/client/auth/login",
        json={"email": email, "password": _PASSWORD},
        headers={"X-Client-Product": "web"},
    )
    assert login_response.status_code == 200
    login_body = login_response.json()
    assert login_body["code"] == 10000
    return str(login_body["data"]["access_token"])


async def _first_credit_checkout_config(real_async_client) -> dict[str, object]:
    """读取真实 Credits checkout 配置里的第一个 Telegram Stars 商品。"""

    response = await real_async_client.get("/api/client/credit/checkout-configs")
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == 10000
    configs = body["data"]["checkout_configs"]
    if not configs:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少可购买 Credits 配置")
    config = configs[0]
    channels = config["payment_channels"]
    if not channels:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: Credits 商品缺少可用支付渠道")
    return {
        "product_class": config["product_class"],
        "product_id": config["product_id"],
        "payment_method": channels[0]["payment_method"],
        "currency": channels[0]["currency"],
        "amount": channels[0]["amount"],
    }


async def test_real_credit_checkout_configs_include_default_three_packages(
    real_async_client,
    real_purchase_schema_ready,
) -> None:
    """真实 Credits checkout 配置必须返回默认三档积分包。"""

    response = await real_async_client.get("/api/client/credit/checkout-configs")
    assert response.status_code == 200
    body = response.json()

    assert body["code"] == 10000
    configs = body["data"]["checkout_configs"]
    assert [item["product_id"] for item in configs] == [
        "credit_50",
        "credit_200",
        "credit_1000",
    ]
    assert [item["credits_amount"] for item in configs] == [50, 200, 1000]
    for item in configs:
        channels = item["payment_channels"]
        assert len(channels) == 1
        assert channels[0]["payment_method"] == "telegram_stars"
        assert channels[0]["currency"] == "XTR"


async def test_real_credit_order_create_requests_telegram_invoice(
    real_async_client,
    make_test_email,
    real_purchase_cleanup_state: _CleanupState,
) -> None:
    """使用真实配置创建 Credits 订单，并真实请求 Telegram invoice。"""

    email = make_test_email("credit-purchase")
    real_purchase_cleanup_state.emails.append(email)
    token = await _register_and_login(real_async_client, email=email)
    checkout_config = await _first_credit_checkout_config(real_async_client)

    response = await real_async_client.post(
        "/api/client/order/create",
        json=checkout_config,
        headers={
            "Authorization": f"Bearer {token}",
            "X-Device-Id": "real-credit-purchase",
            "X-Client-Product": "web",
        },
    )
    body = response.json()

    assert response.status_code == 200
    if body["code"] == CommonCode.PAYMENT_GATEWAY_ERROR.value:
        pytest.fail(f"Telegram invoice 创建失败: {body}")
    assert body["code"] == 10000
    data = body["data"]
    real_purchase_cleanup_state.order_nos.append(str(data["order_no"]))
    payment_data = data["payment_data"]
    assert isinstance(payment_data, dict)
    assert str(payment_data["url"]).startswith("https://")
    assert int(data["amount"]) == checkout_config["amount"]
    assert data["currency"] == checkout_config["currency"]

    async with get_async_session() as db:
        order = await db.scalar(
            select(OrderModel).where(OrderModel.order_no == data["order_no"])
        )
    assert order is not None
    assert order.payment_data is not None
    assert json.loads(order.payment_data)["url"] == payment_data["url"]


async def test_real_credit_order_rejects_stale_price_without_order(
    real_async_client,
    make_test_email,
    real_purchase_cleanup_state: _CleanupState,
) -> None:
    """真实 API 对过期客户端价格返回最新价格，不创建订单。"""

    email = make_test_email("credit-price-stale")
    real_purchase_cleanup_state.emails.append(email)
    token = await _register_and_login(real_async_client, email=email)
    checkout_config = await _first_credit_checkout_config(real_async_client)
    stale_request = {
        **checkout_config,
        "amount": int(checkout_config["amount"]) + 1_000_000,
    }

    response = await real_async_client.post(
        "/api/client/order/create",
        json=stale_request,
        headers={
            "Authorization": f"Bearer {token}",
            "X-Device-Id": "real-credit-price-stale",
            "X-Client-Product": "web",
            "Accept-Language": "zh-CN",
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.PAYMENT_PRICE_UPDATED.value
    assert body["data"]["product_id"] == checkout_config["product_id"]
    assert body["data"]["payment_method"] == checkout_config["payment_method"]
    assert body["data"]["currency"] == checkout_config["currency"]
    assert body["data"]["amount"] == checkout_config["amount"]

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
