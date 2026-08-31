"""订阅可购买配置 API 测试。"""

import pytest
from sqlalchemy import select

from app.constants.order import ProductClass
from app.core.database import get_async_session
from app.models.config_subscription_product_model import ConfigSubscriptionProductModel
from tests.test_server.api.payment_config_test_support import (
    clear_payment_config_test_caches,
)


@pytest.fixture
async def subscription_checkout_config_ready():
    """隔离订阅配置 API 只读测试的缓存。"""
    clear_payment_config_test_caches()
    yield
    clear_payment_config_test_caches()


async def _enabled_product_ids() -> list[str]:
    """读取启用订阅商品（按 sort_order 排序），接口响应必须与配置一致。"""
    async with get_async_session() as db:
        rows = (
            (
                await db.execute(
                    select(ConfigSubscriptionProductModel.product_id)
                    .where(ConfigSubscriptionProductModel.enabled.is_(True))
                    .order_by(ConfigSubscriptionProductModel.sort_order.asc())
                )
            )
            .scalars()
            .all()
        )
    return list(rows)


@pytest.mark.asyncio
async def test_subscription_checkout_configs_returns_supported_prices(
    async_client,
    subscription_checkout_config_ready,
):
    """可购买订阅配置接口暴露全部有渠道价的启用商品，带产品线与月度额度。"""
    response = await async_client.get("/api/client/subscription/checkout-configs")
    body = response.json()
    plans = body["data"]["checkout_configs"]

    assert response.status_code == 200
    assert body["code"] == 10000

    plans_by_id = {plan["product_id"]: plan for plan in plans}
    # Free 档不是商品：可购买列表永不包含它。
    assert "free" not in plans_by_id

    unlimited = plans_by_id.get("unlimited")
    if unlimited is not None:
        assert unlimited["product_class"] == ProductClass.SUBSCRIPTION.value
        assert unlimited["product_line"] == "extension"
        assert unlimited["product_name"] == "Unlimited"
        assert unlimited["period"] == "month"
        assert unlimited["duration_days"] == 30
        assert unlimited["auto_renew"] is True
        assert unlimited["monthly_records"] is None
        assert len(unlimited["payment_channels"]) >= 1
        assert all(
            channel["payment_method"] for channel in unlimited["payment_channels"]
        )
        assert "payment_method" not in unlimited

    # 响应集合 = 有可用渠道价的启用商品集合（产品线维度不改变这一口径）。
    enabled_ids = await _enabled_product_ids()
    purchasable_ids = [pid for pid in enabled_ids if pid != "free"]
    assert sorted(plans_by_id) == sorted(purchasable_ids)

    # Maps 产品线档位（播种脚本 scripts/seed_maps_subscription_products.py 落库
    # 后必须存在）：携带产品线与月度 records 额度。
    assert "maps_pro" in plans_by_id, (
        "maps_pro missing from checkout configs; run "
        "`uv run python scripts/seed_maps_subscription_products.py` first"
    )
    maps_pro = plans_by_id["maps_pro"]
    assert maps_pro["product_line"] == "maps"
    assert maps_pro["period"] == "month"
    assert maps_pro["monthly_records"] == 100_000
    assert "maps_business" in plans_by_id, (
        "maps_business missing from checkout configs; run "
        "`uv run python scripts/seed_maps_subscription_products.py` first"
    )
    maps_business = plans_by_id["maps_business"]
    assert maps_business["product_line"] == "maps"
    assert maps_business["monthly_records"] == 500_000
