#!/usr/bin/env python3
"""
CLI 工具：表驱动播种 MapsGrab 全部订阅商品与渠道价（006 产品线扩展）。

用法：
    cd backend && uv run python scripts/seed_subscription_products.py

幂等 upsert 11 个付费 SKU 的商品行与 PayPal 渠道价行，重复执行只刷新
配置值，不产生重复行。product_line 由行数据携带，SQL 不硬编码字面量：
- extension 线 unlimited、maps 线 maps_pro / maps_business：镜像现有配置
  口径（011.Pricing页/tech-实现与配置.md 与旧 seed 脚本），不借机改配置。
- maps_online / maps_api 线 8 个新档位：一次性支付（auto_renew=false，
  走 PayPal 一次性支付使真实凭据下立即可购买），period=month，
  duration_days=30；monthly_quota 单位由产品线定义（records / requests）。

provider_sku 为本地/测试占位；unlimited 与 maps 线沿用既有 recurring
占位（如 maps_pro-monthly-paypal），新 8 档用 {product_id}-paypal。
接入真实 PayPal 渠道前需替换为渠道后台注册的真实 ID。
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.constants.subscription import (  # noqa: E402
    API_BASIC_PRODUCT_ID,
    API_BUSINESS_PRODUCT_ID,
    API_PROFESSIONAL_PRODUCT_ID,
    API_SCALE_PRODUCT_ID,
    EXTENSION_PRODUCT_LINE,
    MAPS_API_PRODUCT_LINE,
    MAPS_BUSINESS_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_LINE,
    MAPS_PRODUCT_LINE,
    MAPS_PRO_PRODUCT_ID,
    ONLINE_BASIC_PRODUCT_ID,
    ONLINE_GROWTH_PRODUCT_ID,
    ONLINE_LITE_PRODUCT_ID,
    ONLINE_PRO_PRODUCT_ID,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.database import get_async_session  # noqa: E402

# (product_id, product_line, name, display_amount, auto_renew, monthly_quota,
#  paypal_amount, sort_order, extra_metadata)
# 展示金额与渠道金额均为 6 位精度整数；extra_metadata 用于镜像既有商品
# metadata 里的历史字段（如 unlimited 的 daily_limit），新档位留空。
_SEED_ROWS: list[tuple[str, str, str, int, bool, int | None, int, int, dict]] = [
    # 现有配置口径（不借机改动）：unlimited $129.90 / maps_pro $39 /
    # maps_business $99，均为 auto_renew 月度订阅。
    (
        UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        EXTENSION_PRODUCT_LINE,
        "Unlimited",
        12_990_000,
        False,
        None,
        12_990_000,
        20,
        {"daily_limit": -1, "proxy_user_rate_limit_mb_per_second": 0},
    ),
    (
        MAPS_PRO_PRODUCT_ID,
        MAPS_PRODUCT_LINE,
        "Maps Pro",
        39_000_000,
        True,
        100_000,
        39_000_000,
        30,
        {},
    ),
    (
        MAPS_BUSINESS_PRODUCT_ID,
        MAPS_PRODUCT_LINE,
        "Maps Business",
        99_000_000,
        True,
        500_000,
        99_000_000,
        40,
        {},
    ),
    # 新 8 档：一次性支付月度套餐（用户决策，使真实 PayPal 凭据下立即可购买）。
    (
        ONLINE_LITE_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Lite",
        19_000_000,
        False,
        20_000,
        19_000_000,
        50,
        {},
    ),
    (
        ONLINE_BASIC_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Basic",
        49_000_000,
        False,
        80_000,
        49_000_000,
        60,
        {},
    ),
    (
        ONLINE_GROWTH_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Growth",
        99_000_000,
        False,
        250_000,
        99_000_000,
        70,
        {},
    ),
    (
        ONLINE_PRO_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Pro",
        149_000_000,
        False,
        500_000,
        149_000_000,
        80,
        {},
    ),
    (
        API_BASIC_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Basic",
        15_000_000,
        False,
        1_000,
        15_000_000,
        90,
        {},
    ),
    (
        API_PROFESSIONAL_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Professional",
        65_000_000,
        False,
        5_000,
        65_000_000,
        100,
        {},
    ),
    (
        API_BUSINESS_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Business",
        115_000_000,
        False,
        10_000,
        115_000_000,
        110,
        {},
    ),
    (
        API_SCALE_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Scale",
        365_000_000,
        False,
        50_000,
        365_000_000,
        120,
        {},
    ),
]

# 既有商品沿用历史 recurring 占位 SKU，避免借机变更渠道标识。
_LEGACY_PROVIDER_SKUS = {
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID: "unlimited-monthly-paypal",
    MAPS_PRO_PRODUCT_ID: "maps_pro-monthly-paypal",
    MAPS_BUSINESS_PRODUCT_ID: "maps_business-monthly-paypal",
}


def _build_metadata(auto_renew: bool, monthly_quota: int | None, extra: dict) -> str:
    """组装商品 metadata JSON；quota 字段统一为 monthly_quota。"""
    metadata: dict = {"auto_renew": auto_renew}
    if monthly_quota is not None:
        metadata["monthly_quota"] = monthly_quota
    metadata.update(extra)
    return json.dumps(metadata)


async def seed() -> None:
    """幂等播种全部付费订阅商品与 PayPal 渠道价。"""
    async with get_async_session() as db:
        for (
            product_id,
            product_line,
            name,
            display_amount,
            auto_renew,
            monthly_quota,
            paypal_amount,
            sort_order,
            extra_metadata,
        ) in _SEED_ROWS:
            await db.execute(
                text(
                    """
                    INSERT INTO config_subscription_product
                        (product_id, name, product_line, period, duration_days,
                         display_currency, display_amount, enabled, sort_order,
                         metadata, created_at, updated_at)
                    VALUES
                        (:product_id, :name, :product_line, 'month', 30,
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
                    "product_line": product_line,
                    "display_amount": display_amount,
                    "sort_order": sort_order,
                    "metadata": _build_metadata(
                        auto_renew, monthly_quota, extra_metadata
                    ),
                },
            )
            provider_sku = _LEGACY_PROVIDER_SKUS.get(product_id) or (
                f"{product_id}-paypal"
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
                    "provider_sku": provider_sku,
                },
            )
            print(f"播种完成: product_id={product_id}, product_line={product_line}")
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
