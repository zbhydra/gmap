#!/usr/bin/env python3
"""
CLI 工具：表驱动播种 MapsGrab 全部订阅商品与渠道价（006 产品线扩展 + 单一计费模式）。

用法：
    cd backend && uv run python scripts/seed_subscription_products.py

SKU 唯一性合同：付费 SKU 的 product_id 必须全线唯一——下单请求只携带
product_id（HTTP 契约），跨线重名会让下单反查无法确定目标；free 是唯一
允许各线同名的档位（各线一行、不下单、无渠道价，拒单保护在
payment_config 的验价链路）。表级约束是复合唯一键
(product_kind, product_id)，线内唯一性由它保证，付费全线唯一由本合同保证。

幂等 upsert Maps 商品行与渠道价行：
- 商品单一计费模式：auto_renew 是商品列（不再读 metadata）；free 档
  period='none'，付费档 period=month（自然月履约，不再使用 duration_days）。
- display_order 只负责展示排序；tier_rank 只表达业务档次（free=0，同线付费档递增）。
- 三条产品线均为 PayPal 单次购买；金额镜像展示价，无需注册 Billing Plan。
- 同批关闭这些商品的其他渠道价，不改历史订单、订阅或渠道凭据。
"""

from __future__ import annotations

import asyncio
import json
import sys
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import bindparam, text

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.constants.subscription import (  # noqa: E402
    API_BASIC_PRODUCT_ID,
    API_BUSINESS_PRODUCT_ID,
    API_PROFESSIONAL_PRODUCT_ID,
    API_SCALE_PRODUCT_ID,
    FREE_SUBSCRIPTION_PRODUCT_ID,
    MAPS_API_PRODUCT_KIND,
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_KIND,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_KIND,
    ONLINE_BASIC_PRODUCT_ID,
    ONLINE_GROWTH_PRODUCT_ID,
    ONLINE_LITE_PRODUCT_ID,
    ONLINE_PRO_PRODUCT_ID,
)
from app.core.database import get_async_session  # noqa: E402

# free 档在各线内的展示排序值：小于全部付费档（付费最低 20），free 永远排最前。
FREE_DISPLAY_ORDER = 10


@dataclass(frozen=True, slots=True)
class _ProductSeedRow:
    """订阅商品播种行；free 档无渠道价。"""

    product_id: str
    product_kind: str
    name: str
    period: str
    display_amount: int
    display_order: int
    tier_rank: int
    auto_renew: bool
    monthly_quota: int | None
    paypal_amount: int | None
    paypal_sku: str | None = None


_SEED_ROWS: list[_ProductSeedRow] = [
    # ---- 各产品类别的 free 档（period=none、display_amount=0、无渠道价） ----
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_KIND,
        "Free",
        "none",
        0,
        FREE_DISPLAY_ORDER,
        0,
        False,
        1000,
        None,
    ),
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_KIND,
        "Free",
        "none",
        0,
        FREE_DISPLAY_ORDER,
        0,
        False,
        1000,
        None,
    ),
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        MAPS_API_PRODUCT_KIND,
        "Free",
        "none",
        0,
        FREE_DISPLAY_ORDER,
        0,
        False,
        20,
        None,
    ),
    # ---- maps_extension 线：一次性支付月度套餐。 ----
    _ProductSeedRow(
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_KIND,
        "Maps Pro",
        "month",
        39_000_000,
        30,
        1,
        False,
        100_000,
        39_000_000,
        paypal_sku=f"{MAPS_EXTENSION_PRO_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_KIND,
        "Maps Business",
        "month",
        99_000_000,
        40,
        2,
        False,
        500_000,
        99_000_000,
        paypal_sku=f"{MAPS_EXTENSION_BUSINESS_PRODUCT_ID}-paypal",
    ),
    # ---- maps_online 线：一次性支付月度套餐。 ----
    _ProductSeedRow(
        ONLINE_LITE_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_KIND,
        "Online Lite",
        "month",
        19_000_000,
        50,
        1,
        False,
        20_000,
        19_000_000,
        paypal_sku=f"{ONLINE_LITE_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        ONLINE_BASIC_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_KIND,
        "Online Basic",
        "month",
        49_000_000,
        60,
        2,
        False,
        80_000,
        49_000_000,
        paypal_sku=f"{ONLINE_BASIC_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        ONLINE_GROWTH_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_KIND,
        "Online Growth",
        "month",
        99_000_000,
        70,
        3,
        False,
        250_000,
        99_000_000,
        paypal_sku=f"{ONLINE_GROWTH_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        ONLINE_PRO_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_KIND,
        "Online Pro",
        "month",
        149_000_000,
        80,
        4,
        False,
        500_000,
        149_000_000,
        paypal_sku=f"{ONLINE_PRO_PRODUCT_ID}-paypal",
    ),
    # ---- maps_api 线：一次性支付月度套餐。 ----
    _ProductSeedRow(
        API_BASIC_PRODUCT_ID,
        MAPS_API_PRODUCT_KIND,
        "API Basic",
        "month",
        15_000_000,
        90,
        1,
        False,
        1_000,
        15_000_000,
        paypal_sku=f"{API_BASIC_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        API_PROFESSIONAL_PRODUCT_ID,
        MAPS_API_PRODUCT_KIND,
        "API Professional",
        "month",
        65_000_000,
        100,
        2,
        False,
        5_000,
        65_000_000,
        paypal_sku=f"{API_PROFESSIONAL_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        API_BUSINESS_PRODUCT_ID,
        MAPS_API_PRODUCT_KIND,
        "API Business",
        "month",
        115_000_000,
        110,
        3,
        False,
        10_000,
        115_000_000,
        paypal_sku=f"{API_BUSINESS_PRODUCT_ID}-paypal",
    ),
    _ProductSeedRow(
        API_SCALE_PRODUCT_ID,
        MAPS_API_PRODUCT_KIND,
        "API Scale",
        "month",
        365_000_000,
        120,
        4,
        False,
        50_000,
        365_000_000,
        paypal_sku=f"{API_SCALE_PRODUCT_ID}-paypal",
    ),
]


def _build_metadata(monthly_quota: int | None) -> str:
    """组装商品 metadata JSON；计费模式在商品列，quota 字段统一为 monthly_quota。"""
    metadata: dict = {}
    if monthly_quota is not None:
        metadata["monthly_quota"] = monthly_quota
    return json.dumps(metadata)


async def _upsert_product(db, row: _ProductSeedRow) -> None:
    """幂等 upsert 单个商品行。"""

    await db.execute(
        text(
            """
            INSERT INTO config_subscription_product
                (product_id, name, product_kind, period, auto_renew,
                 display_currency, display_amount, enabled, display_order, tier_rank,
                 metadata, created_at, updated_at)
            VALUES
                (:product_id, :name, :product_kind, :period, :auto_renew,
                 'USD', :display_amount, 1, :display_order, :tier_rank,
                 :metadata, UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000,
                 UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                product_kind = VALUES(product_kind),
                period = VALUES(period),
                auto_renew = VALUES(auto_renew),
                display_currency = VALUES(display_currency),
                display_amount = VALUES(display_amount),
                enabled = VALUES(enabled),
                display_order = VALUES(display_order),
                tier_rank = VALUES(tier_rank),
                metadata = VALUES(metadata),
                updated_at = VALUES(updated_at)
            """
        ),
        {
            "product_id": row.product_id,
            "name": row.name,
            "product_kind": row.product_kind,
            "period": row.period,
            "auto_renew": 1 if row.auto_renew else 0,
            "display_amount": row.display_amount,
            "display_order": row.display_order,
            "tier_rank": row.tier_rank,
            "metadata": _build_metadata(row.monthly_quota),
        },
    )


async def _upsert_price(
    db,
    *,
    product_id: str,
    channel_code: str,
    amount: int,
    provider_sku: str | None,
    auto_renew_supported: bool,
    enabled: bool = True,
) -> None:
    """幂等 upsert 单个渠道价行。"""

    await db.execute(
        text(
            """
            INSERT INTO config_subscription_product_price
                (product_id, channel_code, auto_renew_supported, currency, amount,
                 provider_sku, enabled, created_at, updated_at)
            VALUES
                (:product_id, :channel_code, :auto_renew_supported, 'USD', :amount,
                 :provider_sku, :enabled, UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000,
                 UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)
            ON DUPLICATE KEY UPDATE
                auto_renew_supported = VALUES(auto_renew_supported),
                currency = VALUES(currency),
                amount = VALUES(amount),
                provider_sku = VALUES(provider_sku),
                enabled = VALUES(enabled),
                updated_at = VALUES(updated_at)
            """
        ),
        {
            "product_id": product_id,
            "channel_code": channel_code,
            "auto_renew_supported": 1 if auto_renew_supported else 0,
            "amount": amount,
            "provider_sku": provider_sku,
            "enabled": 1 if enabled else 0,
        },
    )


async def seed() -> None:
    """幂等播种 Maps 订阅商品与渠道价。"""
    async with get_async_session() as db:
        for row in _SEED_ROWS:
            await _upsert_product(db, row)
            if row.paypal_amount is not None:
                await _upsert_price(
                    db,
                    product_id=row.product_id,
                    channel_code="paypal",
                    amount=row.paypal_amount,
                    provider_sku=row.paypal_sku,
                    auto_renew_supported=row.auto_renew,
                )
            print(
                f"播种完成: product_id={row.product_id}, "
                f"product_kind={row.product_kind}, period={row.period}, "
                f"auto_renew={row.auto_renew}"
            )
        await db.execute(
            text(
                "UPDATE config_subscription_product_price "
                "SET enabled = 0, updated_at = UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000 "
                "WHERE product_id IN :product_ids AND channel_code != 'paypal'"
            ).bindparams(bindparam("product_ids", expanding=True)),
            {
                "product_ids": [
                    row.product_id
                    for row in _SEED_ROWS
                    if row.paypal_amount is not None
                ]
            },
        )
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
