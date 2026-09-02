#!/usr/bin/env python3
"""
CLI 工具：表驱动播种 MapsGrab 全部订阅商品与渠道价（006 产品线扩展）。

用法：
    cd backend && uv run python scripts/seed_subscription_products.py

SKU 唯一性合同：付费 SKU 的 product_id 必须全线唯一——下单请求只携带
product_id（HTTP 契约），跨线重名会让下单反查无法确定目标；free 是唯一
允许各线同名的档位（各线一行、不下单、无渠道价，拒单保护在
subscription_service.validate_client_price）。表级约束是复合唯一键
(product_line, product_id)，线内唯一性由它保证，付费全线唯一由本合同保证。

幂等 upsert 15 个 SKU（4 条 free + 11 个付费）的商品行与 PayPal 渠道价行
（free 不播价格行），重复执行只刷新配置值，不产生重复行。product_line
由行数据携带，SQL 不硬编码字面量：
- extension 线 unlimited、maps_extension 线 maps_extension_pro /
  maps_extension_business：镜像现有配置口径（011.Pricing页/tech-实现与配置.md
  与旧 seed 脚本），不借机改配置。
- maps_online / maps_api 线 8 个新档位：一次性支付（auto_renew=false，
  走 PayPal 一次性支付使真实凭据下立即可购买），period=month，
  duration_days=30；monthly_quota 单位由产品线定义（records / requests）。
- 四条产品线各一条 free 行：extension 线原样保留存量 metadata，
  maps 线 free 用 monthly_quota 表达本线免费额度。

provider_sku 为本地/测试占位；unlimited 与 maps_extension 线沿用既有 recurring
占位（如 maps_extension_pro-monthly-paypal），新 8 档用 {product_id}-paypal。
接入真实 PayPal 渠道前需替换为渠道后台注册的真实 ID。
"""

from __future__ import annotations

import asyncio
import json
import sys
from dataclasses import dataclass, field
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
    FREE_SUBSCRIPTION_PRODUCT_ID,
    MAPS_API_PRODUCT_LINE,
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_LINE,
    ONLINE_BASIC_PRODUCT_ID,
    ONLINE_GROWTH_PRODUCT_ID,
    ONLINE_LITE_PRODUCT_ID,
    ONLINE_PRO_PRODUCT_ID,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.database import get_async_session  # noqa: E402

# free 档在各线内的排序值：小于全部付费档（付费最低 20），free 永远排最前。
FREE_SORT_ORDER = 10


@dataclass(frozen=True, slots=True)
class _ProductSeedRow:
    """订阅商品播种行。

    paypal_amount 为 None 表示不播种渠道价（free 档无价格行）；
    extra_metadata 用于镜像既有商品 metadata 里的历史字段
    （如 unlimited 的 daily_limit、extension 线 free 的整组存量字段）。
    """

    product_id: str
    product_line: str
    name: str
    period: str
    duration_days: int
    display_amount: int
    sort_order: int
    auto_renew: bool
    monthly_quota: int | None
    paypal_amount: int | None
    extra_metadata: dict = field(default_factory=dict)


_SEED_ROWS: list[_ProductSeedRow] = [
    # ---- 四条产品线各自的 free 档（period=free、display_amount=0、无渠道价） ----
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        EXTENSION_PRODUCT_LINE,
        "Free",
        "free",
        0,
        0,
        FREE_SORT_ORDER,
        False,
        None,
        None,
        # 原样保留存量 free 行 metadata（含 one_time 历史残留），不借机改动。
        {
            "daily_limit": 5,
            "extension_daily_download_limit": 9999,
            "one_time": False,
            "web_daily_download_limit": 0,
            "web_daily_play_limit": 0,
            "proxy_user_rate_limit_mb_per_second": 0,
        },
    ),
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_LINE,
        "Free",
        "free",
        0,
        0,
        FREE_SORT_ORDER,
        False,
        1000,
        None,
    ),
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Free",
        "free",
        0,
        0,
        FREE_SORT_ORDER,
        False,
        1000,
        None,
    ),
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "Free",
        "free",
        0,
        0,
        FREE_SORT_ORDER,
        False,
        20,
        None,
    ),
    # ---- 付费档：现有配置口径（不借机改动），unlimited $129.90 /
    # maps_extension_pro $39 / maps_extension_business $99，均为月度订阅。 ----
    _ProductSeedRow(
        UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        EXTENSION_PRODUCT_LINE,
        "Unlimited",
        "month",
        30,
        12_990_000,
        20,
        False,
        None,
        12_990_000,
        {"daily_limit": -1, "proxy_user_rate_limit_mb_per_second": 0},
    ),
    _ProductSeedRow(
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_LINE,
        "Maps Pro",
        "month",
        30,
        39_000_000,
        30,
        True,
        100_000,
        39_000_000,
    ),
    _ProductSeedRow(
        MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_LINE,
        "Maps Business",
        "month",
        30,
        99_000_000,
        40,
        True,
        500_000,
        99_000_000,
    ),
    # 新 8 档：一次性支付月度套餐（用户决策，使真实 PayPal 凭据下立即可购买）。
    _ProductSeedRow(
        ONLINE_LITE_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Lite",
        "month",
        30,
        19_000_000,
        50,
        False,
        20_000,
        19_000_000,
    ),
    _ProductSeedRow(
        ONLINE_BASIC_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Basic",
        "month",
        30,
        49_000_000,
        60,
        False,
        80_000,
        49_000_000,
    ),
    _ProductSeedRow(
        ONLINE_GROWTH_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Growth",
        "month",
        30,
        99_000_000,
        70,
        False,
        250_000,
        99_000_000,
    ),
    _ProductSeedRow(
        ONLINE_PRO_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Pro",
        "month",
        30,
        149_000_000,
        80,
        False,
        500_000,
        149_000_000,
    ),
    _ProductSeedRow(
        API_BASIC_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Basic",
        "month",
        30,
        15_000_000,
        90,
        False,
        1_000,
        15_000_000,
    ),
    _ProductSeedRow(
        API_PROFESSIONAL_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Professional",
        "month",
        30,
        65_000_000,
        100,
        False,
        5_000,
        65_000_000,
    ),
    _ProductSeedRow(
        API_BUSINESS_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Business",
        "month",
        30,
        115_000_000,
        110,
        False,
        10_000,
        115_000_000,
    ),
    _ProductSeedRow(
        API_SCALE_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Scale",
        "month",
        30,
        365_000_000,
        120,
        False,
        50_000,
        365_000_000,
    ),
]

# 既有商品沿用历史 recurring 占位 SKU，避免借机变更渠道标识。
_LEGACY_PROVIDER_SKUS = {
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID: "unlimited-monthly-paypal",
    MAPS_EXTENSION_PRO_PRODUCT_ID: "maps_extension_pro-monthly-paypal",
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID: "maps_extension_business-monthly-paypal",
}


def _build_metadata(auto_renew: bool, monthly_quota: int | None, extra: dict) -> str:
    """组装商品 metadata JSON；quota 字段统一为 monthly_quota。"""
    metadata: dict = {"auto_renew": auto_renew}
    if monthly_quota is not None:
        metadata["monthly_quota"] = monthly_quota
    metadata.update(extra)
    return json.dumps(metadata)


async def seed() -> None:
    """幂等播种全部订阅商品（4 条 free + 11 个付费）与 PayPal 渠道价。"""
    async with get_async_session() as db:
        for row in _SEED_ROWS:
            await db.execute(
                text(
                    """
                    INSERT INTO config_subscription_product
                        (product_id, name, product_line, period, duration_days,
                         display_currency, display_amount, enabled, sort_order,
                         metadata, created_at, updated_at)
                    VALUES
                        (:product_id, :name, :product_line, :period,
                         :duration_days, 'USD', :display_amount, 1, :sort_order,
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
                    "product_id": row.product_id,
                    "name": row.name,
                    "product_line": row.product_line,
                    "period": row.period,
                    "duration_days": row.duration_days,
                    "display_amount": row.display_amount,
                    "sort_order": row.sort_order,
                    "metadata": _build_metadata(
                        row.auto_renew, row.monthly_quota, row.extra_metadata
                    ),
                },
            )
            # free 档不播渠道价：不是可购买商品，拒单由业务层保护。
            if row.paypal_amount is not None:
                provider_sku = _LEGACY_PROVIDER_SKUS.get(row.product_id) or (
                    f"{row.product_id}-paypal"
                )
                await db.execute(
                    text(
                        """
                        INSERT INTO config_subscription_product_price
                            (product_id, channel_code, currency, amount,
                             provider_sku, enabled, created_at, updated_at)
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
                        "product_id": row.product_id,
                        "amount": row.paypal_amount,
                        "provider_sku": provider_sku,
                    },
                )
            print(
                f"播种完成: product_id={row.product_id}, "
                f"product_line={row.product_line}, period={row.period}"
            )
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
