"""Credits 积分包可购买配置 API 测试。"""

import pytest

from app.constants.order import ProductClass
from app.provider.payment.tg_star import (
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
)
from tests.test_server.api.payment_config_test_support import (
    clear_payment_config_test_caches,
    get_telegram_stars_credit_product_id,
)


@pytest.fixture
async def credit_checkout_config_ready():
    """隔离 Credits 配置 API 只读测试的缓存。"""
    clear_payment_config_test_caches()
    yield
    clear_payment_config_test_caches()


@pytest.mark.asyncio
async def test_credit_checkout_configs_returns_supported_prices(
    async_client,
    credit_checkout_config_ready,
):
    """可购买 Credits 配置接口按积分包聚合支付渠道价格。"""
    product_id = await get_telegram_stars_credit_product_id()

    response = await async_client.get("/api/client/credit/checkout-configs")
    body = response.json()
    plans = [
        item
        for item in body["data"]["checkout_configs"]
        if item["product_id"] == product_id
    ]

    assert response.status_code == 200
    assert body["code"] == 10000
    assert len(plans) == 1
    plan = plans[0]
    assert plan["product_class"] == ProductClass.RECHARGE.value
    assert plan["product_id"] == product_id
    assert plan["credits_amount"] > 0
    assert "payment_method" not in plan
    telegram_stars_channels = [
        channel
        for channel in plan["payment_channels"]
        if channel["payment_method"] == TELEGRAM_STARS_PAYMENT_METHOD
    ]
    assert len(telegram_stars_channels) == 1
    assert telegram_stars_channels[0]["currency"] == TELEGRAM_STARS_CURRENCY
    assert telegram_stars_channels[0]["amount"] > 0
    assert telegram_stars_channels[0]["provider_sku"]
