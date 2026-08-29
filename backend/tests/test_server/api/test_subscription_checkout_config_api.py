"""订阅可购买配置 API 测试。"""

import pytest

from app.constants.order import ProductClass
from tests.test_server.api.payment_config_test_support import (
    clear_payment_config_test_caches,
)


@pytest.fixture
async def subscription_checkout_config_ready():
    """隔离订阅配置 API 只读测试的缓存。"""
    clear_payment_config_test_caches()
    yield
    clear_payment_config_test_caches()


@pytest.mark.asyncio
async def test_subscription_checkout_configs_returns_supported_prices(
    async_client,
    subscription_checkout_config_ready,
):
    """可购买订阅配置接口只暴露 Unlimited 月度订阅购买项。"""
    response = await async_client.get("/api/client/subscription/checkout-configs")
    body = response.json()
    plans = body["data"]["checkout_configs"]

    assert response.status_code == 200
    assert body["code"] == 10000
    assert [plan["product_id"] for plan in plans] == ["unlimited"]
    plan = plans[0]
    assert plan["product_class"] == ProductClass.SUBSCRIPTION.value
    assert plan["product_id"] == "unlimited"
    assert plan["product_name"] == "Unlimited"
    assert plan["period"] == "month"
    assert plan["duration_days"] == 30
    assert plan["daily_limit"] == -1
    assert plan["extension_daily_download_limit"] == -1
    assert "web_daily_download_limit" not in plan
    assert "web_daily_play_limit" not in plan
    assert plan["auto_renew"] is True
    assert len(plan["payment_channels"]) >= 1
    assert all(channel["payment_method"] for channel in plan["payment_channels"])
    assert "payment_method" not in plans[0]
