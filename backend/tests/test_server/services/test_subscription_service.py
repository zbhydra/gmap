"""订阅服务测试。

验证订阅下单前的业务规则由 SubscriptionService 负责，含产品线维度
（006 扩展）：重复购买校验按产品线隔离、快照携带产品线与档位。
"""

import pytest

from app.constants.order import OrderCheckProductParam, ProductClass
from app.constants.subscription import (
    MAPS_PRODUCT_LINE,
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


def _subscription_product(
    product_id: str,
    *,
    product_line: str,
    period: str = "month",
    metadata: dict | None = None,
) -> SubscriptionProductConfig:
    """构造带产品线的订阅商品配置。"""

    return SubscriptionProductConfig(
        product_id=product_id,
        name=product_id,
        product_line=product_line,
        period=period,
        duration_days=30,
        display_currency="USD",
        display_amount=12_990_000,
        sort_order=2,
        metadata=metadata or {},
    )


@pytest.mark.asyncio
async def test_get_user_subscription_returns_active_unlimited_row(monkeypatch):
    """有未过期权益行时返回该 Unlimited 订阅记录。"""
    expires_at = 1_981_231_144_935

    async def fake_get_subscription_row(user_id: int, product_line: str):
        assert user_id == 585
        assert product_line == "extension"
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=expires_at,
        )

    monkeypatch.setattr(
        subscription_service, "_get_subscription_row", fake_get_subscription_row
    )
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

    async def fake_get_subscription_row(user_id: int, product_line: str):
        assert user_id == 586
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=now_ms - 1,
        )

    monkeypatch.setattr(
        subscription_service, "_get_subscription_row", fake_get_subscription_row
    )
    monkeypatch.setattr(
        "app.services.subscription_service.timestamp_now", lambda: now_ms
    )

    subscription = await subscription_service.get_user_subscription(586)

    assert subscription.user_id == 586
    assert subscription.expires_at is None


def test_subscription_product_metadata_parses_root_fields():
    """订阅商品 metadata 用同名结构统一解析，未知字段忽略。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {
            "auto_renew": True,
            "ignored": "ok",
        },
        product_id="unlimited",
        period="month",
    )

    assert metadata.auto_renew is True


def test_subscription_product_metadata_defaults_free_auto_renew_to_false():
    """Free 档没有旧 metadata 时默认不自动续费。"""
    metadata = SubscriptionProductMetadata.from_metadata(
        {},
        product_id="free_v2",
        period=SubscriptionPeriodEnum.FREE,
    )

    assert metadata.auto_renew is False


def test_subscription_product_metadata_rejects_invalid_auto_renew():
    """自动续费开关非法时按配置错误处理。"""
    with pytest.raises(AppCommonException) as exc_info:
        SubscriptionProductMetadata.from_metadata(
            {"auto_renew": "yes"},
            product_id="free",
        )

    assert exc_info.value.code == CommonCode.PAYMENT_GATEWAY_ERROR
    assert "product_id=free" in exc_info.value.ext_msg


def test_subscription_product_metadata_parses_monthly_records():
    """Maps 产品线月度额度按正整数解析；非正数与类型错误一律拒绝。"""

    valid = SubscriptionProductMetadata.from_metadata(
        {"auto_renew": True, "monthly_records": 100_000},
        product_id="maps_pro",
        period="month",
    )
    assert valid.monthly_records == 100_000

    absent = SubscriptionProductMetadata.from_metadata(
        {"auto_renew": False},
        product_id="free",
        period="free",
    )
    assert absent.monthly_records is None

    for bad_value in (0, -5, "100000", True, 1.5):
        with pytest.raises(AppCommonException) as exc_info:
            SubscriptionProductMetadata.from_metadata(
                {"monthly_records": bad_value},
                product_id="maps_pro",
                period="month",
            )
        assert exc_info.value.code == CommonCode.PAYMENT_GATEWAY_ERROR


@pytest.mark.asyncio
async def test_get_user_subscription_config_uses_unlimited_for_active_row(monkeypatch):
    """未过期权益行统一代表 Unlimited，配置按 product_id=unlimited 读取。"""

    async def fake_get_user_subscription(user_id: int, product_line: str):
        assert user_id == 584
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=1_981_231_144_935,
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        unlimited = _subscription_product(
            "unlimited",
            product_line="extension",
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
async def test_get_user_subscription_config_reads_tier_from_active_row(monkeypatch):
    """Maps 产品线有权益行时，档位取行内 product_id（而非固定商品）。"""

    async def fake_get_user_subscription(user_id: int, product_line: str):
        assert product_line == MAPS_PRODUCT_LINE
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            product_id="maps_pro",
            expires_at=1_981_231_144_935,
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        return [
            _subscription_product(
                "free", product_line=MAPS_PRODUCT_LINE, period="free"
            ),
            _subscription_product(
                "maps_pro",
                product_line=MAPS_PRODUCT_LINE,
                metadata={"auto_renew": True, "monthly_records": 100_000},
            ),
            _subscription_product(
                "maps_business",
                product_line=MAPS_PRODUCT_LINE,
                metadata={"auto_renew": True, "monthly_records": 500_000},
            ),
        ]

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

    subscription, config = await subscription_service.get_user_subscription_config(
        584, MAPS_PRODUCT_LINE
    )

    assert config.product_id == "maps_pro"
    assert config.product_line == MAPS_PRODUCT_LINE


@pytest.mark.asyncio
async def test_get_user_subscription_config_uses_product_only_config(monkeypatch):
    """状态链路只读订阅商品配置，不扫描支付渠道和渠道价格。"""

    async def fail_get_snapshot(*, force_refresh: bool = False):
        raise AssertionError(
            f"subscription status should not load payment snapshot: {force_refresh}"
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        return [_subscription_product("free", product_line="extension", period="free")]

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

    async def fake_get_user_subscription(user_id: int, product_line: str):
        assert user_id == 586
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=None,
        )

    async def fake_list_subscription_products(*, force_refresh: bool = False):
        assert force_refresh is False
        free = _subscription_product("free", product_line="extension", period="free")
        unlimited = _subscription_product(
            "unlimited",
            product_line="extension",
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
    assert metadata.auto_renew is False


def test_subscription_order_snapshot_reads_product_line_and_duration():
    """订阅订单履约按快照 product_line/product_id/duration_days 续期。"""
    order = OrderModel(  # type: ignore[call-arg]
        order_no="ORD-SUBSCRIPTION-SNAPSHOT",
        user_id=42,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id="maps_pro",
        product_name="Maps Pro",
        amount=39_000_000,
        currency="USD",
        expired_at=1_800_000_000_000,
        extra_metadata=(
            '{"product_snapshot":{"product_line":"maps","period":"month",'
            '"duration_days":30,'
            '"metadata":{"auto_renew":true,"monthly_records":100000},'
            '"provider_sku":"maps_pro-monthly-paypal"}}'
        ),
    )

    snapshot = subscription_service._order_snapshot(order)  # noqa: SLF001

    assert snapshot.product_line == "maps"
    assert snapshot.product_id == "maps_pro"
    assert snapshot.duration_days == 30


def test_subscription_order_snapshot_defaults_legacy_rows_to_extension_line():
    """历史订单快照缺 product_line 时归入 extension 线，续期行为不变。"""
    order = OrderModel(  # type: ignore[call-arg]
        order_no="ORD-SUBSCRIPTION-LEGACY",
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

    snapshot = subscription_service._order_snapshot(order)  # noqa: SLF001

    assert snapshot.product_line == "extension"
    assert snapshot.product_id == "unlimited"
    assert snapshot.duration_days == 30


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
    assert checkout_config.product.product_line == "extension"
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

    async def fake_get_subscription_row(user_id: int, product_line: str):
        return None

    monkeypatch.setattr(
        subscription_service, "_get_subscription_row", fake_get_subscription_row
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
    assert '"product_line":"extension"' in order_param.extra_metadata


@pytest.mark.asyncio
async def test_check_product_rejects_active_subscription(
    subscription_payment_config_ready,
    monkeypatch,
):
    """同产品线已有未过期订阅时拒绝再次创建订阅订单，避免渠道侧产生多条自动续费。"""

    product_id = await get_telegram_stars_subscription_product_id()
    expected = await _subscription_checkout_config(product_id)
    expires_at = 1_981_231_144_935

    async def fake_get_subscription_row(user_id: int, product_line: str):
        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=expires_at,
        )

    monkeypatch.setattr(
        subscription_service, "_get_subscription_row", fake_get_subscription_row
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
