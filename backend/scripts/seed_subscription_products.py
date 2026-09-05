#!/usr/bin/env python3
"""
CLI 工具：表驱动播种 MapsGrab 全部订阅商品与渠道价（006 产品线扩展 + 单一计费模式）。

用法：
    cd backend && uv run python scripts/seed_subscription_products.py

SKU 唯一性合同：付费 SKU 的 product_id 必须全线唯一——下单请求只携带
product_id（HTTP 契约），跨线重名会让下单反查无法确定目标；free 是唯一
允许各线同名的档位（各线一行、不下单、无渠道价，拒单保护在
payment_config 的验价链路）。表级约束是复合唯一键
(product_line, product_id)，线内唯一性由它保证，付费全线唯一由本合同保证。

幂等 upsert 15 个 SKU（4 条 free + 11 个付费）的商品行与渠道价行：
- 商品单一计费模式：auto_renew 是商品列（不再读 metadata）；free 档
  period='none'，付费档 period=month（自然月履约，不再使用 duration_days）。
- display_order 只负责展示排序；tier_rank 只表达业务档次（free=0，同线付费档递增）。
- PayPal 渠道价：一次性商品金额镜像展示价；自动续费商品的 provider_sku
  必须是渠道后台注册的真实 PayPal Plan ID（P-...，占位 SKU 无法创建订阅）。
- Clink 渠道价：一次性商品走 priceDataList 模式（无需 Catalog ID），
  金额镜像 PayPal 价；自动续费商品必须写本仓 Clink `productId:priceId`
  （冒号约定，禁止复用参考项目其他商品的 Catalog ID）。

provider_sku 占位说明：maps_extension 两档的 PayPal Plan ID 与自动续费
Clink Catalog ID 需在各自渠道后台创建后回填，占位值仅保证配置链路可运行。
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

# free 档在各线内的展示排序值：小于全部付费档（付费最低 20），free 永远排最前。
FREE_DISPLAY_ORDER = 10

# 渠道后台尚未创建真实 ID 时的占位 SKU：一眼可识别且按渠道区分；
# TODO 价格行 enabled=0 不可售（不进入配置快照，不会进入支付请求），
# 真实 ID 到手后只替换 _SEED_ROWS 里的字符串并重跑本脚本。
_PAYPAL_TODO_SKU = "TODO_CREATE_PAYPAL_PLAN_ID"
_CLINK_TODO_SKU = "TODO_CREATE_CLINK_PRODUCT_ID:TODO_CREATE_CLINK_PRICE_ID"


def _sku_enabled(provider_sku: str | None) -> bool:
    """TODO 占位 SKU 的价格行不可售，其余可售。"""

    return not (provider_sku and provider_sku.startswith("TODO"))


@dataclass(frozen=True, slots=True)
class _ProductSeedRow:
    """订阅商品播种行。

    paypal_amount / clink_amount 为 None 表示不播种该渠道价（free 档无价格行）；
    paypal_sku / clink_sku 直接存该渠道当前 provider_sku：真实 ID 直接写字符串，
    渠道后台尚未创建时写 TODO 占位（是否 TODO 决定 enabled）；以后只在
    _SEED_ROWS 里替换字符串并重跑本脚本，真实 ID 不会被回退。
    extra_metadata 用于镜像既有商品 metadata 里的历史字段
    （如 unlimited 的 daily_limit、extension 线 free 的整组存量字段）。
    """

    product_id: str
    product_line: str
    name: str
    period: str
    display_amount: int
    display_order: int
    tier_rank: int
    auto_renew: bool
    monthly_quota: int | None
    paypal_amount: int | None
    paypal_sku: str | None = None
    clink_amount: int | None = None
    clink_sku: str | None = None
    extra_metadata: dict = field(default_factory=dict)


_SEED_ROWS: list[_ProductSeedRow] = [
    # ---- 四条产品线各自的 free 档（period=none、display_amount=0、无渠道价） ----
    _ProductSeedRow(
        FREE_SUBSCRIPTION_PRODUCT_ID,
        EXTENSION_PRODUCT_LINE,
        "Free",
        "none",
        0,
        FREE_DISPLAY_ORDER,
        0,
        False,
        None,
        None,
        # 原样保留存量 free 行 metadata（含 one_time 历史残留），不借机改动。
        extra_metadata={
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
        MAPS_ONLINE_PRODUCT_LINE,
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
        MAPS_API_PRODUCT_LINE,
        "Free",
        "none",
        0,
        FREE_DISPLAY_ORDER,
        0,
        False,
        20,
        None,
    ),
    # ---- extension 线 Unlimited：一次性支付月度套餐（$12.99/月，12_990_000 = 6 位精度）。 ----
    _ProductSeedRow(
        UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        EXTENSION_PRODUCT_LINE,
        "Unlimited",
        "month",
        12_990_000,
        20,
        1,
        False,
        None,
        12_990_000,
        paypal_sku="unlimited-paypal",
        clink_amount=12_990_000,
        extra_metadata={"daily_limit": -1, "proxy_user_rate_limit_mb_per_second": 0},
    ),
    # ---- maps_extension 线：自动续费商品（单一计费模式）。
    # PayPal Plan ID 与 Clink productId:priceId 尚未在渠道后台创建：
    # provider_sku 存 TODO 占位（enabled=0 不可售），真实 ID 到手后替换字符串。 ----
    _ProductSeedRow(
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_LINE,
        "Maps Pro",
        "month",
        39_000_000,
        30,
        1,
        True,
        100_000,
        39_000_000,
        paypal_sku=_PAYPAL_TODO_SKU,
        clink_amount=39_000_000,
        clink_sku=_CLINK_TODO_SKU,
    ),
    _ProductSeedRow(
        MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
        MAPS_EXTENSION_PRODUCT_LINE,
        "Maps Business",
        "month",
        99_000_000,
        40,
        2,
        True,
        500_000,
        99_000_000,
        paypal_sku=_PAYPAL_TODO_SKU,
        clink_amount=99_000_000,
        clink_sku=_CLINK_TODO_SKU,
    ),
    # ---- maps_online 线：一次性支付月度套餐。 ----
    _ProductSeedRow(
        ONLINE_LITE_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Lite",
        "month",
        19_000_000,
        50,
        1,
        False,
        20_000,
        19_000_000,
        paypal_sku=f"{ONLINE_LITE_PRODUCT_ID}-paypal",
        clink_amount=19_000_000,
    ),
    _ProductSeedRow(
        ONLINE_BASIC_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Basic",
        "month",
        49_000_000,
        60,
        2,
        False,
        80_000,
        49_000_000,
        paypal_sku=f"{ONLINE_BASIC_PRODUCT_ID}-paypal",
        clink_amount=49_000_000,
    ),
    _ProductSeedRow(
        ONLINE_GROWTH_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Growth",
        "month",
        99_000_000,
        70,
        3,
        False,
        250_000,
        99_000_000,
        paypal_sku=f"{ONLINE_GROWTH_PRODUCT_ID}-paypal",
        clink_amount=99_000_000,
    ),
    _ProductSeedRow(
        ONLINE_PRO_PRODUCT_ID,
        MAPS_ONLINE_PRODUCT_LINE,
        "Online Pro",
        "month",
        149_000_000,
        80,
        4,
        False,
        500_000,
        149_000_000,
        paypal_sku=f"{ONLINE_PRO_PRODUCT_ID}-paypal",
        clink_amount=149_000_000,
    ),
    # ---- maps_api 线：一次性支付月度套餐。 ----
    _ProductSeedRow(
        API_BASIC_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Basic",
        "month",
        15_000_000,
        90,
        1,
        False,
        1_000,
        15_000_000,
        paypal_sku=f"{API_BASIC_PRODUCT_ID}-paypal",
        clink_amount=15_000_000,
    ),
    _ProductSeedRow(
        API_PROFESSIONAL_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Professional",
        "month",
        65_000_000,
        100,
        2,
        False,
        5_000,
        65_000_000,
        paypal_sku=f"{API_PROFESSIONAL_PRODUCT_ID}-paypal",
        clink_amount=65_000_000,
    ),
    _ProductSeedRow(
        API_BUSINESS_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Business",
        "month",
        115_000_000,
        110,
        3,
        False,
        10_000,
        115_000_000,
        paypal_sku=f"{API_BUSINESS_PRODUCT_ID}-paypal",
        clink_amount=115_000_000,
    ),
    _ProductSeedRow(
        API_SCALE_PRODUCT_ID,
        MAPS_API_PRODUCT_LINE,
        "API Scale",
        "month",
        365_000_000,
        120,
        4,
        False,
        50_000,
        365_000_000,
        paypal_sku=f"{API_SCALE_PRODUCT_ID}-paypal",
        clink_amount=365_000_000,
    ),
]


def _build_metadata(monthly_quota: int | None, extra: dict) -> str:
    """组装商品 metadata JSON；计费模式在商品列，quota 字段统一为 monthly_quota。"""
    metadata: dict = {}
    if monthly_quota is not None:
        metadata["monthly_quota"] = monthly_quota
    metadata.update(extra)
    return json.dumps(metadata)


async def _upsert_product(db, row: _ProductSeedRow) -> None:
    """幂等 upsert 单个商品行。"""

    await db.execute(
        text(
            """
            INSERT INTO config_subscription_product
                (product_id, name, product_line, period, auto_renew,
                 display_currency, display_amount, enabled, display_order, tier_rank,
                 metadata, created_at, updated_at)
            VALUES
                (:product_id, :name, :product_line, :period, :auto_renew,
                 'USD', :display_amount, 1, :display_order, :tier_rank,
                 :metadata, UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000,
                 UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3)) * 1000)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                product_line = VALUES(product_line),
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
            "product_line": row.product_line,
            "period": row.period,
            "auto_renew": 1 if row.auto_renew else 0,
            "display_amount": row.display_amount,
            "display_order": row.display_order,
            "tier_rank": row.tier_rank,
            "metadata": _build_metadata(row.monthly_quota, row.extra_metadata),
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
    """幂等播种全部订阅商品（4 条 free + 11 个付费）与渠道价。"""
    async with get_async_session() as db:
        for row in _SEED_ROWS:
            await _upsert_product(db, row)
            if row.paypal_amount is not None:
                # provider_sku 即当前渠道 SKU：TODO 占位不可售，真实 ID 直接替换字符串。
                await _upsert_price(
                    db,
                    product_id=row.product_id,
                    channel_code="paypal",
                    amount=row.paypal_amount,
                    provider_sku=row.paypal_sku,
                    auto_renew_supported=row.auto_renew,
                    enabled=_sku_enabled(row.paypal_sku),
                )
            if row.clink_amount is not None:
                # 一次性商品走 priceDataList（provider_sku=None）；
                # 自动续费价必须写本仓 productId:priceId，TODO 占位不可售。
                await _upsert_price(
                    db,
                    product_id=row.product_id,
                    channel_code="clink",
                    amount=row.clink_amount,
                    provider_sku=row.clink_sku,
                    auto_renew_supported=row.auto_renew,
                    enabled=_sku_enabled(row.clink_sku),
                )
            print(
                f"播种完成: product_id={row.product_id}, "
                f"product_line={row.product_line}, period={row.period}, "
                f"auto_renew={row.auto_renew}"
            )
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
