"""订阅服务测试。

验证订阅下单前的业务规则由 SubscriptionService 负责。
"""

import pytest

from app.constants.order import OrderCheckProductParam, ProductClass
from app.constants.subscription import (
    SubscriptionPeriodEnum,
    SubscriptionProductMetadata,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.provider.payment.tg_star import (
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
)
from app.services.payment_config_service import (
    SubscriptionProductConfig,
    payment_config_service,
)
from app.services.subscription_service import subscription_service
from tests.test_server.api.payment_config_test_support import (
    clear_payment_config_test_caches,
    get_telegram_stars_subscription_product_id,
)


async def _subscription_checkout_config(product_id: str):
    """读取真实订阅 checkout 配置。"""

    return await payment_config_service.get_subscription_checkout_config(
        product_id=product_id,
        channel_code=TELEGRAM_STARS_PAYMENT_METHOD,
    )


@pytest.mark.asyncio
async def test_get_user_subscription_returns_active_unlimited_row(monkeypatch):
    """有未过期权益行时返回该 Unlimited 订阅记录。"""
    expires_at = 1_981_231_144_935

    async def fake_get_by_id(user_id: int):
        assert user_id == 585
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=expires_at,
        )

    monkeypatch.setattr(subscription_service, "get_by_id", fake_get_by_id)
    monkeypatch.setattr(
        "app.services.subscription_service.timestamp_now",
        lambda: expires_at - 1,
    )

    subscription = await subscription_service.get_user_subscription(585)

    assert subscription.expires_at == expires_at


@pytest.mark.asyncio
async def test_get_user_subscription_returns_free_placeholder_for_expired_row(
    monkeypatch,
):
    """无权益行或已过期时返回内存 Free 占位，不依赖数据库 period。"""
    now_ms = 1_981_231_144_935

    async def fake_get_by_id(user_id: int):
        assert user_id == 586
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=now_ms - 1,
        )

    monkeypatch.setattr(subscription_service, "get_by_id", fake_get_by_id)
    monkeypatch.setattr(
        "app.services.subscription_service.timestamp_now", lambda: now_ms
    )

    subscription = await subscription_service.get_user_subscription(586)

    assert subscription.user_id == 586
    assert subscription.expires_at is None


def test_subscription_product_metadata_parses_root_fields():
    """订阅商品 metadata 用同名结构统一解析。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {
            "extension_daily_download_limit": -1,
            "auto_renew": True,
            "proxy_user_rate_limit_mb_per_second": 5,
            "ignored": "ok",
        },
        product_id="unlimited",
        period="month",
    )

    assert metadata.extension_daily_download_limit == -1
    assert metadata.daily_limit == -1
    assert metadata.auto_renew is True
    assert metadata.proxy_user_rate_limit_mb_per_second == 5


def test_subscription_product_metadata_accepts_fractional_user_rate():
    """用户限速支持 0.5 MB/s 这种小数配置。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {
            "extension_daily_download_limit": 5,
            "proxy_user_rate_limit_mb_per_second": 0.5,
        },
        product_id="free",
    )

    assert metadata.proxy_user_rate_limit_mb_per_second == 0.5


def test_subscription_product_metadata_rejects_invalid_daily_limit():
    """每日额度字段缺失或非法时按配置错误处理。"""
    with pytest.raises(AppCommonException) as exc_info:
        SubscriptionProductMetadata.from_metadata(
            {
                "extension_daily_download_limit": "5",
            },
            product_id="free",
        )

    assert exc_info.value.code == CommonCode.PAYMENT_GATEWAY_ERROR
    assert "product_id=free" in exc_info.value.ext_msg
    assert "extension_daily_download_limit" in exc_info.value.ext_msg


def test_subscription_product_metadata_defaults_invalid_user_rate_to_zero():
    """用户限速字段缺失或非法时按不限速处理。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {
            "extension_daily_download_limit": 5,
            "proxy_user_rate_limit_mb_per_second": "bad",
        },
        product_id="free",
    )

    assert metadata.proxy_user_rate_limit_mb_per_second == 0


def test_subscription_product_metadata_uses_configured_paid_values():
    """付费商品的额度和续费方式由配置决定。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {
            "daily_limit": 100,
            "auto_renew": False,
        },
        product_id="unlimited",
    )

    assert metadata.daily_limit == 100
    assert metadata.extension_daily_download_limit == 100
    assert metadata.auto_renew is False


def test_subscription_product_metadata_defaults_free_limit_to_five():
    """Free 档没有旧 metadata 时按 5 次/天契约解析。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {},
        product_id="free_v2",
        period=SubscriptionPeriodEnum.FREE,
    )

    assert metadata.daily_limit == 5
    assert metadata.extension_daily_download_limit == 5
    assert metadata.auto_renew is False


def test_subscription_product_metadata_rejects_missing_paid_metadata():
    """付费商品缺少必填额度时返回可定位的配置错误。"""
    with pytest.raises(AppCommonException) as exc_info:
        SubscriptionProductMetadata.from_metadata(
            {},
            product_id="unlimited",
            period=SubscriptionPeriodEnum.MONTH,
        )

    assert exc_info.value.code == CommonCode.PAYMENT_GATEWAY_ERROR
    assert "product_id=unlimited" in exc_info.value.ext_msg
    assert "daily_limit" in exc_info.value.ext_msg


@pytest.mark.asyncio
async def test_get_user_subscription_config_uses_unlimited_for_active_row(monkeypatch):
    """未过期权益行统一代表 Unlimited，配置按 product_id=unlimited 读取。"""

    async def fake_get_user_subscription(user_id: int):
        assert user_id == 584
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=1_981_231_144_935,
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        unlimited = SubscriptionProductConfig(
            product_id="unlimited",
            name="Unlimited",
            period="month",
            duration_days=30,
            display_currency="USD",
            display_amount=12_990_000,
            sort_order=2,
            metadata={
                "daily_limit": -1,
                "auto_renew": True,
            },
        )
        return [unlimited]

    monkeypatch.setattr(
        subscription_service,
        "get_user_subscription",
        fake_get_user_subscription,
    )
    monkeypatch.setattr(
        payment_config_service,
        "list_subscription_products",
        fake_list_subscription_products,
    )

    subscription, config = await subscription_service.get_user_subscription_config(584)

    assert subscription.expires_at == 1_981_231_144_935
    assert config.product_id == "unlimited"


@pytest.mark.asyncio
async def test_get_user_subscription_config_uses_product_only_config(monkeypatch):
    """状态链路只读订阅商品配置，不扫描支付渠道和渠道价格。"""

    async def fail_get_snapshot(*, force_refresh: bool = False):
        raise AssertionError(
            f"subscription status should not load payment snapshot: {force_refresh}"
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        return [
            SubscriptionProductConfig(
                product_id="free",
                name="Free",
                period="free",
                duration_days=0,
                display_currency="USD",
                display_amount=0,
                sort_order=0,
                metadata={},
            )
        ]

    monkeypatch.setattr(payment_config_service, "get_snapshot", fail_get_snapshot)
    monkeypatch.setattr(
        payment_config_service,
        "list_subscription_products",
        fake_list_subscription_products,
    )

    subscription, config = await subscription_service.get_user_subscription_config(0)

    assert subscription.expires_at is None
    assert config.product_id == "free"


@pytest.mark.asyncio
async def test_get_user_subscription_config_uses_free_for_placeholder(monkeypatch):
    """Free 不落库；占位订阅记录按 product_id=free 读取配置。"""

    async def fake_get_user_subscription(user_id: int):
        assert user_id == 586
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=None,
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        free = SubscriptionProductConfig(
            product_id="free",
            name="Free",
            period="free",
            duration_days=0,
            display_currency="USD",
            display_amount=0,
            sort_order=0,
            metadata={},
        )
        unlimited = SubscriptionProductConfig(
            product_id="unlimited",
            name="Unlimited",
            period="month",
            duration_days=30,
            display_currency="USD",
            display_amount=12_990_000,
            sort_order=1,
            metadata={
                "daily_limit": -1,
                "auto_renew": True,
            },
        )
        return [free, unlimited]

    monkeypatch.setattr(
        subscription_service,
        "get_user_subscription",
        fake_get_user_subscription,
    )
    monkeypatch.setattr(
        payment_config_service,
        "list_subscription_products",
        fake_list_subscription_products,
    )

    subscription, config = await subscription_service.get_user_subscription_config(586)
    metadata = SubscriptionProductMetadata.from_metadata(
        config.metadata,
        product_id=config.product_id,
        period=config.period,
    )

    assert subscription.expires_at is None
    assert config.product_id == "free"
    assert metadata.daily_limit == 5
    assert metadata.auto_renew is False


def test_subscription_order_snapshot_duration_reads_sku_metadata():
    """订阅订单履约按快照 duration_days 续期，period 仅保留配置校验。"""
    order = OrderModel(  # type: ignore[call-arg]
        order_no="ORD-SUBSCRIPTION-SNAPSHOT",
        user_id=42,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id="unlimited",
        product_name="Unlimited",
        amount=12_990_000,
        currency="USD",
        expired_at=1_800_000_000_000,
        extra_metadata=(
            '{"product_snapshot":{"period":"month","duration_days":30,'
            '"metadata":{"daily_limit":-1,"auto_renew":true},'
            '"provider_sku":"unlimited-monthly-paypal"}}'
        ),
    )

    assert (
        subscription_service._order_snapshot_duration_days(order) == 30  # noqa: SLF001
    )


def test_parse_paid_period_rejects_free_order_fulfillment():
    """Free 配置不能作为支付成功订阅订单发货。"""
    with pytest.raises(ValueError, match="Free subscription period"):
        subscription_service._parse_paid_period(  # noqa: SLF001
            SubscriptionPeriodEnum.FREE.value
        )


@pytest.fixture
async def subscription_payment_config_ready():
    """隔离订阅服务只读配置测试的缓存。"""
    clear_payment_config_test_caches()
    yield
    clear_payment_config_test_caches()


@pytest.mark.asyncio
async def test_validate_client_price_returns_subscription_checkout_config(
    subscription_payment_config_ready,
):
    """客户端提交价格与订阅配置一致时返回当前订阅下单快照。"""

    product_id = await get_telegram_stars_subscription_product_id()
    expected = await _subscription_checkout_config(product_id)

    checkout_config = await subscription_service.validate_client_price(
        product_id=product_id,
        channel_code=TELEGRAM_STARS_PAYMENT_METHOD,
        currency="xtr",
        amount=expected.price.amount,
    )

    assert checkout_config.product.product_id == product_id
    assert checkout_config.product.name == expected.product.name
    assert checkout_config.channel.channel_code == TELEGRAM_STARS_PAYMENT_METHOD
    assert checkout_config.price.currency == TELEGRAM_STARS_CURRENCY
    assert checkout_config.price.amount == expected.price.amount


@pytest.mark.asyncio
async def test_validate_client_price_rejects_stale_subscription_price(
    subscription_payment_config_ready,
):
    """客户端提交旧订阅价格时返回 PAYMENT_PRICE_UPDATED。"""

    product_id = await get_telegram_stars_subscription_product_id()
    expected = await _subscription_checkout_config(product_id)

    with pytest.raises(AppCommonException) as exc_info:
        await subscription_service.validate_client_price(
            product_id=product_id,
            channel_code=TELEGRAM_STARS_PAYMENT_METHOD,
            currency=TELEGRAM_STARS_CURRENCY,
            amount=expected.price.amount + 1_000_000,
        )

    assert exc_info.value.code == CommonCode.PAYMENT_PRICE_UPDATED
    assert exc_info.value.data == {
        "product_id": product_id,
        "payment_method": TELEGRAM_STARS_PAYMENT_METHOD,
        "currency": TELEGRAM_STARS_CURRENCY,
        "amount": expected.price.amount,
    }


@pytest.mark.asyncio
async def test_check_product_returns_order_snapshot_from_subscription_config(
    subscription_payment_config_ready,
    monkeypatch,
):
    """订阅商品校验返回订单创建所需的订阅快照。"""

    product_id = await get_telegram_stars_subscription_product_id()
    expected = await _subscription_checkout_config(product_id)

    async def fake_get_user_subscription(user_id: int):
        assert user_id == 123
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=None,
        )

    monkeypatch.setattr(
        subscription_service,
        "get_user_subscription",
        fake_get_user_subscription,
    )

    order_param = await subscription_service.check_product(
        OrderCheckProductParam(
            user_id=123,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id=product_id,
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            currency=TELEGRAM_STARS_CURRENCY,
            amount=expected.price.amount,
            client_ip="127.0.0.1",
        )
    )

    assert order_param.user_id == 123
    assert order_param.product_class == ProductClass.SUBSCRIPTION.value
    assert order_param.product_id == product_id
    assert order_param.product_name == expected.product.name
    assert order_param.payment_method == TELEGRAM_STARS_PAYMENT_METHOD
    assert order_param.currency == TELEGRAM_STARS_CURRENCY
    assert order_param.auto_renew is True
    assert order_param.provider_sku == expected.price.provider_sku
    assert order_param.client_ip == "127.0.0.1"


@pytest.mark.asyncio
async def test_check_product_rejects_active_subscription(
    subscription_payment_config_ready,
    monkeypatch,
):
    """已有未过期订阅时拒绝再次创建订阅订单，避免渠道侧产生多条自动续费。"""

    product_id = await get_telegram_stars_subscription_product_id()
    expected = await _subscription_checkout_config(product_id)
    expires_at = 1_981_231_144_935

    async def fake_get_user_subscription(user_id: int):
        assert user_id == 123
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=expires_at,
        )

    monkeypatch.setattr(
        subscription_service,
        "get_user_subscription",
        fake_get_user_subscription,
    )

    with pytest.raises(AppCommonException) as exc_info:
        await subscription_service.check_product(
            OrderCheckProductParam(
                user_id=123,
                product_class=ProductClass.SUBSCRIPTION.value,
                product_id=product_id,
                payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
                currency=TELEGRAM_STARS_CURRENCY,
                amount=expected.price.amount,
                client_ip="127.0.0.1",
            )
        )

    assert exc_info.value.code == CommonCode.INVALID_REQUEST
    assert exc_info.value.data == {
        "reason": "active_subscription_exists",
        "expires_at": expires_at,
    }
