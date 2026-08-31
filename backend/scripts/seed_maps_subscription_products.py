#!/usr/bin/env python3
"""
CLI 工具：播种 MapsGrab 订阅商品与渠道价（006 产品线扩展，C2 套餐口径）。

用法：
    cd backend && uv run python scripts/seed_maps_subscription_products.py

幂等 upsert 两行商品（maps_pro $39 / maps_business $99，period=month，
duration_days=30，metadata.monthly_records=100000/500000）与对应 PayPal
渠道价行。重复执行只刷新配置值，不产生重复行。

provider_sku 当前为本地/测试占位（如 maps_pro-monthly-paypal）；接入真实
PayPal 渠道前，需替换为渠道后台注册的 recurring plan ID（沿用 011 配置
命令口径用 sql_executor 更新，不在本脚本写死真实 SKU）。
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.core.database import get_async_session  # noqa: E402

# (product_id, name, display_amount, monthly_records, paypal_amount, sort_order)
# 展示金额与渠道金额均为 6 位精度整数；C2 口径：Pro $39 100,000 / Business $99 500,000。
_MAPS_PRODUCTS = [
    ("maps_pro", "Maps Pro", 39_000_000, 100_000, 39_000_000, 30),
    ("maps_business", "Maps Business", 99_000_000, 500_000, 99_000_000, 40),
]


async def seed() -> None:
    """幂等播种 Maps 产品线商品与 PayPal 渠道价。"""
    async with get_async_session() as db:
        for (
            product_id,
            name,
            display_amount,
            monthly_records,
            paypal_amount,
            sort_order,
        ) in _MAPS_PRODUCTS:
            await db.execute(
                text(
                    """
                    INSERT INTO config_subscription_product
                        (product_id, name, product_line, period, duration_days,
                         display_currency, display_amount, enabled, sort_order,
                         metadata, created_at, updated_at)
                    VALUES
                        (:product_id, :name, 'maps', 'month', 30,
                         'USD', :display_amount, 1, :sort_order,
                         :metadata, UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000,
                         UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        product_line = VALUES(product_line),
                        period = VALUES(period),
                        duration_days = VALUES(duration_days),
                        display_currency = VALUES(display_currency),
                        display_amount = VALUES(display_amount),
                        enabled = VALUES(enabled),
                        sort_order = VALUES(sort_order),
                        metadata = VALUES(metadata),
                        updated_at = VALUES(updated_at)
                    """
                ),
                {
                    "product_id": product_id,
                    "name": name,
                    "display_amount": display_amount,
                    "sort_order": sort_order,
                    "metadata": (
                        '{"auto_renew": true, "monthly_records": '
                        f"{monthly_records}}}"
                    ),
                },
            )
            await db.execute(
                text(
                    """
                    INSERT INTO config_subscription_product_price
                        (product_id, channel_code, currency, amount, provider_sku,
                         enabled, created_at, updated_at)
                    VALUES
                        (:product_id, 'paypal', 'USD', :amount, :provider_sku,
                         1, UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000,
                         UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)
                    ON DUPLICATE KEY UPDATE
                        currency = VALUES(currency),
                        amount = VALUES(amount),
                        provider_sku = VALUES(provider_sku),
                        enabled = VALUES(enabled),
                        updated_at = VALUES(updated_at)
                    """
                ),
                {
                    "product_id": product_id,
                    "amount": paypal_amount,
                    "provider_sku": f"{product_id}-monthly-paypal",
                },
            )
            print(f"播种完成: product_id={product_id}")
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
