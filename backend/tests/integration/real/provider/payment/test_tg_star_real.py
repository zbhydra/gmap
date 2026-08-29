"""Telegram Stars Test DC provider 真实 smoke 测试。

真实资源依赖：
- MySQL: 只读启用的 config_payment_channel Telegram 配置。
- Telegram Test Bot API: 真实调用 createInvoiceLink 创建 60 秒订阅 invoice。

测试不会付款，也不会写 config_* 表。只有渠道 environment=test 时才会请求 Test DC。
"""

import json
import uuid

import pytest
from sqlalchemy import select, text

from app.constants.order import OrderStatus
from app.core.database import get_async_session, get_engine
from app.models.config_payment_channel_model import ConfigPaymentChannelModel
from app.provider.payment.payment_base import PaymentProviderError, PaymentRequest
from app.provider.payment.tg_star import (
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
    TgStarPaymentProvider,
)
from app.utils.time import timestamp_now


pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def _telegram_channel_table_exists() -> bool:
    """确认 real 数据库包含 Telegram 渠道配置表。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": "config_payment_channel"},
        )
        return result.first() is not None


async def _load_test_dc_provider() -> TgStarPaymentProvider:
    """读取启用的 Test DC 渠道配置，其他环境明确跳过。"""

    async with get_async_session() as db:
        channel = await db.scalar(
            select(ConfigPaymentChannelModel)
            .where(ConfigPaymentChannelModel.enabled.is_(True))
            .where(
                ConfigPaymentChannelModel.channel_code == TELEGRAM_STARS_PAYMENT_METHOD
            )
            .limit(1)
        )
    if channel is None or channel.config_json is None:
        pytest.skip(
            "REAL_TELEGRAM_TEST_DC_UNAVAILABLE: 缺少启用的 Telegram Stars 渠道配置"
        )

    try:
        raw_config = json.loads(channel.config_json)
    except json.JSONDecodeError as exc:
        pytest.fail(f"Telegram Stars 渠道 config_json 不是合法 JSON: {exc}")
    if not isinstance(raw_config, dict):
        pytest.fail("Telegram Stars 渠道 config_json 必须是 JSON object")
    if raw_config.get("environment") != "test":
        pytest.skip(
            "REAL_TELEGRAM_TEST_DC_UNAVAILABLE: Telegram Stars 渠道 environment 不是 test"
        )

    try:
        return TgStarPaymentProvider(raw_config)
    except PaymentProviderError as exc:
        pytest.fail(f"Telegram Stars Test DC 渠道配置无效: {exc}")


async def test_real_test_dc_creates_accelerated_subscription_invoice(
    real_mysql_ready: None,
) -> None:
    """Test DC 必须真实接受项目生成的 60 秒 Telegram Stars 订阅 invoice。"""

    if not await _telegram_channel_table_exists():
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 数据库缺少 config_payment_channel 表")
    provider = await _load_test_dc_provider()

    payment_data = await provider.create_payment(
        PaymentRequest(
            order_no=f"REAL_TEST_DC_{uuid.uuid4().hex}",
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            order_status=OrderStatus.PENDING.value,
            amount=1_000_000,
            currency=TELEGRAM_STARS_CURRENCY,
            product_name="Telegram Test DC Subscription",
            expired_at=timestamp_now() + 600_000,
            auto_renew=True,
        )
    )

    assert provider.config.subscription_period_seconds == 60
    assert provider.config.bot_api_url("createInvoiceLink").endswith(
        "/test/createInvoiceLink"
    )
    assert str(payment_data["payment_url"]).startswith("https://t.me/")
