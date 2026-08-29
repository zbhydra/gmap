"""Telegram Stars 支付 webhook 服务测试。"""

import asyncio
from dataclasses import dataclass, field
from datetime import timedelta
import inspect
import json
import uuid

import httpx
import pytest
from sqlalchemy import delete, func, select, update

from app.constants.order import (
    CallbackStatus,
    OrderCreateParam,
    OrderStatus,
    ProductClass,
)
from app.core.database import get_async_session
from app.models.callback_log_model import CallbackLogModel
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_credit_account_model import UserCreditAccountModel
from app.models.user_credit_log_model import UserCreditLogModel
from app.provider.payment.payment_base import PaymentProviderError, PaymentRequest
from app.provider.payment.tg_star import (
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
    TgStarPaymentProvider,
)
from app.schemas.telegram_callback_schema import TelegramWebhookUpdate
import app.services.order_service as order_service_module
from app.services.order_service import order_service
from app.services.subscription_service import subscription_service


@dataclass
class _CleanupState:
    """记录本测试文件创建的数据，teardown 时统一删除。"""

    order_nos: list[str] = field(default_factory=list)
    user_ids: list[int] = field(default_factory=list)


@pytest.fixture
async def telegram_payment_cleanup():
    """清理 Telegram payment 测试写入的订单和订阅。"""
    state = _CleanupState()
    yield state

    async with get_async_session() as db:
        if state.order_nos:
            await db.execute(
                delete(CallbackLogModel).where(
                    CallbackLogModel.order_no.in_(state.order_nos)
                )
            )
            await db.execute(
                delete(OrderModel).where(OrderModel.order_no.in_(state.order_nos))
            )

        if state.user_ids:
            await db.execute(
                delete(UserCreditLogModel).where(
                    UserCreditLogModel.user_id.in_(state.user_ids)
                )
            )
            await db.execute(
                delete(UserCreditAccountModel).where(
                    UserCreditAccountModel.user_id.in_(state.user_ids)
                )
            )
            await db.execute(
                delete(UserSubscriptionModel).where(
                    UserSubscriptionModel.user_id.in_(state.user_ids)
                )
            )

        await db.commit()


async def _create_stars_subscription_order(
    cleanup: _CleanupState,
    *,
    user_id: int | None = None,
    amount: int = 950_000_000,
):
    """创建测试用 Telegram Stars 订阅订单。"""
    effective_user_id = user_id or 9_000_000_000 + uuid.uuid4().int % 1_000_000
    cleanup.user_ids.append(effective_user_id)

    order = await order_service.create_order(
        OrderCreateParam(
            user_id=effective_user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id="unlimited",
            product_name="Unlimited",
            amount=amount,
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            currency=TELEGRAM_STARS_CURRENCY,
            client_ip="pytest",
            extra_metadata=json.dumps(
                {
                    "product_snapshot": {
                        "period": "month",
                        "duration_days": 30,
                        "metadata": {
                            "daily_limit": -1,
                            "auto_renew": True,
                        },
                        "provider_sku": "unlimited-monthly-telegram-stars",
                    }
                },
                ensure_ascii=False,
                separators=(",", ":"),
            ),
        )
    )
    cleanup.order_nos.append(order.order_no)
    return order


async def _create_stars_credit_order(
    cleanup: _CleanupState,
    *,
    user_id: int | None = None,
):
    """创建测试用 Telegram Stars Credits 充值订单。"""

    effective_user_id = user_id or 9_000_000_000 + uuid.uuid4().int % 1_000_000
    cleanup.user_ids.append(effective_user_id)

    order = await order_service.create_order(
        OrderCreateParam(
            user_id=effective_user_id,
            product_class=ProductClass.RECHARGE.value,
            product_id="credit_200",
            product_name="200 Credits",
            amount=850_000_000,
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            currency=TELEGRAM_STARS_CURRENCY,
            client_ip="pytest",
            extra_metadata=json.dumps(
                {
                    "product_snapshot": {
                        "credits_amount": 200,
                        "provider_sku": "credit-200-telegram-stars",
                    }
                },
                ensure_ascii=False,
                separators=(",", ":"),
            ),
        )
    )
    cleanup.order_nos.append(order.order_no)
    return order


async def _mark_order_paid_for_test(
    order_no: str,
    *,
    channel_order_no: str,
    callback_status: CallbackStatus,
) -> None:
    """把测试订单置成已支付，避免使用生产支付 webhook 之外的通用状态口子。"""
    async with get_async_session() as db:
        await db.execute(
            update(OrderModel)
            .where(OrderModel.order_no == order_no)
            .values(
                order_status=OrderStatus.PAID.value,
                payment_channel_order_no=channel_order_no,
                payment_channel_uid="12345",
                paid_at=1_760_000_000_000,
                payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
                callback_status=callback_status.value,
                paid_amount=950_000_000,
                paid_currency=TELEGRAM_STARS_CURRENCY,
            )
        )
        await db.commit()


def _tg_provider_config(*, environment: str = "production") -> dict[str, object]:
    """构造完整 Telegram Stars provider 测试配置。"""

    return {
        "environment": environment,
        "token": "local-token",
        "webhook_secret_token": "local-secret",
        "request_timeout_seconds": 3,
    }


def _tg_provider(*, environment: str = "production") -> TgStarPaymentProvider:
    """创建只用于本地测试的 Telegram Stars provider。"""

    return TgStarPaymentProvider(_tg_provider_config(environment=environment))


@pytest.mark.parametrize(
    "field",
    (
        "environment",
        "token",
        "webhook_secret_token",
        "request_timeout_seconds",
    ),
)
def test_provider_requires_channel_config_field(field: str) -> None:
    """provider 构造时必须从渠道配置拿到每个必填字段。"""

    config = _tg_provider_config()
    del config[field]

    with pytest.raises(PaymentProviderError, match=field):
        TgStarPaymentProvider(config)


def test_provider_rejects_unknown_telegram_environment() -> None:
    """未知环境不能隐式回退到 production 或 Test DC。"""

    with pytest.raises(PaymentProviderError, match="must be one of production, test"):
        TgStarPaymentProvider(_tg_provider_config(environment="staging"))


def test_webhook_secret_requires_configured_matching_header():
    """webhook secret header 缺失或不一致时验签失败。"""

    provider = _tg_provider()

    with pytest.raises(PaymentProviderError, match="missing or mismatch"):
        provider._check_webhook_secret(None)  # noqa: SLF001
    with pytest.raises(PaymentProviderError, match="missing or mismatch"):
        provider._check_webhook_secret("wrong-secret")  # noqa: SLF001

    provider._check_webhook_secret("local-secret")  # noqa: SLF001


@pytest.mark.asyncio
async def test_support_message_reads_public_support_mail(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Bot 购买支持命令与 Website 共用公共支持邮箱。"""

    async def fake_get(c_key: str, *, force_refresh: bool = False) -> str:
        assert c_key == "support_mail"
        assert force_refresh is False
        return " public-support@example.com "

    monkeypatch.setattr(
        "app.provider.payment.tg_star.config_public_service.get",
        fake_get,
    )

    message = await _tg_provider()._support_message()  # noqa: SLF001

    assert message.startswith("Purchase support: public-support@example.com\n")


def test_stars_amount_requires_whole_star():
    """Telegram Stars 只接受可无损表示为整 Star 的 6 位内部金额。"""

    provider = _tg_provider()

    assert (
        provider._stars_amount_from_internal_amount(  # noqa: SLF001
            950_000_000,
            context="pytest",
        )
        == 950
    )
    assert (
        provider._internal_amount_from_stars_amount(950) == 950_000_000
    )  # noqa: SLF001
    with pytest.raises(PaymentProviderError, match="whole Star"):
        provider._stars_amount_from_internal_amount(
            950_500_000, context="pytest"
        )  # noqa: SLF001
    with pytest.raises(PaymentProviderError, match="non-negative"):
        provider._stars_amount_from_internal_amount(
            -1_000_000, context="pytest"
        )  # noqa: SLF001


@pytest.mark.parametrize(
    ("environment", "expected_path", "expected_period"),
    (
        ("production", "/botlocal-token/createInvoiceLink", 2_592_000),
        ("test", "/botlocal-token/test/createInvoiceLink", 60),
    ),
)
@pytest.mark.asyncio
async def test_create_payment_uses_telegram_environment_subscription_contract(
    monkeypatch: pytest.MonkeyPatch,
    environment: str,
    expected_path: str,
    expected_period: int,
) -> None:
    """订阅 invoice 的 Bot API 路径和周期必须由 Telegram 环境共同决定。"""

    real_async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        assert request.url.path == expected_path
        assert body["currency"] == TELEGRAM_STARS_CURRENCY
        assert body["prices"] == [{"label": "Unlimited", "amount": 950}]
        assert body["subscription_period"] == expected_period
        return httpx.Response(
            200,
            json={"ok": True, "result": "https://t.me/invoice/pytest"},
        )

    def factory(**kwargs):
        return real_async_client(
            transport=httpx.MockTransport(handler),
            **kwargs,
        )

    monkeypatch.setattr("app.provider.payment.tg_star.httpx.AsyncClient", factory)

    payment_data = await _tg_provider(environment=environment).create_payment(
        PaymentRequest(
            order_no="ORDTGSTAR123",
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            order_status=OrderStatus.PENDING.value,
            amount=950_000_000,
            currency=TELEGRAM_STARS_CURRENCY,
            product_name="Unlimited",
            expired_at=4_102_444_800_000,
            auto_renew=True,
        )
    )

    assert payment_data["payment_url"] == "https://t.me/invoice/pytest"


@pytest.mark.asyncio
async def test_create_payment_keeps_credit_invoice_one_time(monkeypatch):
    """积分充值订单创建 Telegram Stars 一次性 invoice。"""

    real_async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        assert request.url.path == "/botlocal-token/createInvoiceLink"
        assert body["currency"] == TELEGRAM_STARS_CURRENCY
        assert body["prices"] == [{"label": "200 Credits", "amount": 850}]
        assert "subscription_period" not in body
        return httpx.Response(
            200,
            json={"ok": True, "result": "https://t.me/invoice/credit-pytest"},
        )

    def factory(**kwargs):
        return real_async_client(
            transport=httpx.MockTransport(handler),
            **kwargs,
        )

    monkeypatch.setattr("app.provider.payment.tg_star.httpx.AsyncClient", factory)

    payment_data = await _tg_provider().create_payment(
        PaymentRequest(
            order_no="ORDTGCREDIT123",
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            order_status=OrderStatus.PENDING.value,
            amount=850_000_000,
            currency=TELEGRAM_STARS_CURRENCY,
            product_name="200 Credits",
            expired_at=4_102_444_800_000,
            auto_renew=False,
        )
    )

    assert payment_data["payment_url"] == "https://t.me/invoice/credit-pytest"


def test_auto_renew_stars_invoice_rejects_amount_over_telegram_limit():
    """Telegram Stars 自动续费 invoice 不能超过官方订阅金额上限。"""

    with pytest.raises(PaymentProviderError, match="exceeds Bot API limit"):
        _tg_provider()._validate_stars_subscription_invoice(  # noqa: SLF001
            PaymentRequest(
                order_no="ORDTGSTAROVERLIMIT",
                payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
                order_status=OrderStatus.PENDING.value,
                amount=10_001_000_000,
                currency=TELEGRAM_STARS_CURRENCY,
                product_name="Unlimited",
                expired_at=4_102_444_800_000,
                auto_renew=True,
            )
        )


def _pre_checkout_update(order_no: str, *, amount: int = 950) -> dict:
    """构造 pre_checkout_query Update。"""
    return {
        "update_id": 1001,
        "pre_checkout_query": {
            "id": "pre-checkout-id",
            "from": {"id": 12345, "is_bot": False, "first_name": "Tester"},
            "currency": TELEGRAM_STARS_CURRENCY,
            "total_amount": amount,
            "invoice_payload": order_no,
        },
    }


def _successful_payment_update(
    order_no: str,
    *,
    amount: int = 950,
    charge_id: str = "tg-charge-123",
    is_recurring: bool | None = None,
    is_first_recurring: bool | None = None,
) -> dict:
    """构造 successful_payment Update。"""
    payment: dict[str, object] = {
        "currency": TELEGRAM_STARS_CURRENCY,
        "total_amount": amount,
        "invoice_payload": order_no,
        "telegram_payment_charge_id": charge_id,
        "provider_payment_charge_id": "",
    }
    if is_recurring is not None:
        payment["is_recurring"] = is_recurring
    if is_first_recurring is not None:
        payment["is_first_recurring"] = is_first_recurring
    return {
        "update_id": 1002,
        "message": {
            "message_id": 88,
            "from": {"id": 12345, "is_bot": False, "first_name": "Tester"},
            "chat": {"id": 12345, "type": "private"},
            "date": 1760000000,
            "successful_payment": payment,
        },
    }


def _update(data: dict) -> TelegramWebhookUpdate:
    """把 Telegram 原始 JSON 转成 webhook schema。"""
    return TelegramWebhookUpdate.model_validate(data)


def test_order_update_by_no_uses_cas_without_row_lock():
    """订单支付状态更新使用 CAS，不使用数据库行锁。"""
    source = inspect.getsource(order_service._cas_update_order)

    assert "with_for_update" not in source
    assert "OrderModel.order_status == expected_status.value" in source


def test_telegram_payment_delegates_success_to_order_service():
    """Telegram 渠道层只校验支付成功，不直接触发业务回调。"""
    source = inspect.getsource(TgStarPaymentProvider._handle_successful_payment)

    assert "order_success" not in source
    assert "trigger_business_callback" not in source


@pytest.mark.asyncio
async def test_successful_payment_verification_then_order_success_activates_subscription(
    telegram_payment_cleanup: _CleanupState,
):
    """successful_payment 由 provider 校验，订单成功入口统一落库和履约。"""
    user_id = 9_000_000_000 + uuid.uuid4().int % 1_000_000
    order = await _create_stars_subscription_order(
        telegram_payment_cleanup,
        user_id=user_id,
    )

    update = _update(_successful_payment_update(order.order_no))
    assert update.message is not None
    assert update.message.successful_payment is not None
    verified = await _tg_provider()._handle_successful_payment(
        update.message.successful_payment,
        update.message.from_user,
    )
    result = await order_service.order_success(
        order_no=verified.order_no or "",
        channel_order_no=verified.channel_order_no or "",
        channel_uid=verified.channel_uid,
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata=verified.extra_metadata,
        paid_amount=verified.amount or 0,
        paid_currency=verified.currency or "",
    )

    paid_order = await order_service.get_order_by_no(order.order_no)
    subscription = await subscription_service.get_user_subscription(user_id)

    assert result == {
        "order_no": order.order_no,
        "idempotent": False,
        "callback_triggered": True,
    }
    assert paid_order is not None
    assert paid_order.order_status == OrderStatus.PAID.value
    assert paid_order.callback_status == CallbackStatus.SUCCESS.value
    assert paid_order.payment_method == TELEGRAM_STARS_PAYMENT_METHOD
    assert paid_order.payment_channel_order_no == "tg-charge-123"
    assert paid_order.payment_channel_uid == "12345"
    assert paid_order.amount == 950_000_000
    assert paid_order.paid_amount == 950_000_000
    assert paid_order.paid_currency == TELEGRAM_STARS_CURRENCY
    assert paid_order.paid_at is not None
    assert "tg-charge-123" in (paid_order.extra_metadata or "")
    assert subscription.expires_at is not None


@pytest.mark.asyncio
async def test_successful_payment_exposes_renewal_data_without_first_flag(
    telegram_payment_cleanup: _CleanupState,
):
    """Telegram 后续续费只返回 is_recurring，不返回首期标记。"""
    order = await _create_stars_subscription_order(telegram_payment_cleanup)
    update = _update(
        _successful_payment_update(
            order.order_no,
            is_recurring=True,
        )
    )
    assert update.message is not None
    assert update.message.successful_payment is not None

    verified = await _tg_provider()._handle_successful_payment(
        update.message.successful_payment,
        update.message.from_user,
    )

    assert verified.provider_data is not None
    assert verified.provider_data["is_recurring"] is True
    assert "is_first_recurring" not in verified.provider_data


@pytest.mark.asyncio
async def test_successful_payment_fulfills_credit_recharge_once(
    telegram_payment_cleanup: _CleanupState,
):
    """Credits 充值订单支付成功后到账，重复通知不重复加积分。"""

    user_id = 9_000_000_000 + uuid.uuid4().int % 1_000_000
    order = await _create_stars_credit_order(
        telegram_payment_cleanup,
        user_id=user_id,
    )
    update = _update(_successful_payment_update(order.order_no, amount=850))
    assert update.message is not None
    assert update.message.successful_payment is not None
    verified = await _tg_provider()._handle_successful_payment(
        update.message.successful_payment,
        update.message.from_user,
    )

    first = await order_service.order_success(
        order_no=verified.order_no or "",
        channel_order_no=verified.channel_order_no or "",
        channel_uid=verified.channel_uid,
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata=verified.extra_metadata,
        paid_amount=verified.amount or 0,
        paid_currency=verified.currency or "",
    )
    second = await order_service.order_success(
        order_no=verified.order_no or "",
        channel_order_no=verified.channel_order_no or "",
        channel_uid=verified.channel_uid,
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata=verified.extra_metadata,
        paid_amount=verified.amount or 0,
        paid_currency=verified.currency or "",
    )

    paid_order = await order_service.get_order_by_no(order.order_no)
    async with get_async_session() as db:
        balance = await db.scalar(
            select(UserCreditAccountModel.balance).where(
                UserCreditAccountModel.user_id == user_id
            )
        )
        recharge_log_count = await db.scalar(
            select(func.count())
            .select_from(UserCreditLogModel)
            .where(
                UserCreditLogModel.user_id == user_id,
                UserCreditLogModel.reason == "recharge_purchase",
            )
        )

    assert first == {
        "order_no": order.order_no,
        "idempotent": False,
        "callback_triggered": True,
    }
    assert second == {
        "order_no": order.order_no,
        "idempotent": True,
        "callback_triggered": False,
    }
    assert paid_order is not None
    assert paid_order.product_class == ProductClass.RECHARGE.value
    assert paid_order.callback_status == CallbackStatus.SUCCESS.value
    assert "product_snapshot" in (paid_order.extra_metadata or "")
    assert "payment_callback" in (paid_order.extra_metadata or "")
    assert balance == 200
    assert recharge_log_count == 1


@pytest.mark.asyncio
async def test_successful_payment_accepts_real_telegram_long_charge_id(
    telegram_payment_cleanup: _CleanupState,
):
    """真实 Telegram Stars 流水号可能超过 128 字符，订单侧按 256 字符保存。"""
    order = await _create_stars_subscription_order(
        telegram_payment_cleanup,
        amount=1_000_000,
    )
    charge_id = (
        "stxCEJGJ8Ku9zhaQejN3kdLWcCG8fh6cOiLtXG-sEQ9FFLpHBzGpbUm7JOkMNs-z_"
        "51Wj9JGIUH0-541UQqCXHNusguVE4XX8qpI8xCjpXyJZCk9ks7osxA-Sw8IUJVCBc1"
    )
    assert len(charge_id) == 131

    update = _update(
        _successful_payment_update(order.order_no, amount=1, charge_id=charge_id)
    )
    assert update.message is not None
    assert update.message.successful_payment is not None
    verified = await _tg_provider()._handle_successful_payment(
        update.message.successful_payment,
        update.message.from_user,
    )
    result = await order_service.order_success(
        order_no=verified.order_no or "",
        channel_order_no=verified.channel_order_no or "",
        channel_uid=verified.channel_uid,
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata=verified.extra_metadata,
        paid_amount=verified.amount or 0,
        paid_currency=verified.currency or "",
    )

    paid_order = await order_service.get_order_by_no(order.order_no)

    assert result["idempotent"] is False
    assert paid_order is not None
    assert paid_order.payment_channel_order_no == charge_id


@pytest.mark.asyncio
async def test_order_success_returns_idempotent_for_same_charge(
    telegram_payment_cleanup: _CleanupState,
):
    """统一订单成功入口对同一渠道流水重复通知按幂等处理。"""
    order = await _create_stars_subscription_order(telegram_payment_cleanup)
    payment_update = _update(_successful_payment_update(order.order_no))
    assert payment_update.message is not None
    payment = payment_update.message.successful_payment
    assert payment is not None

    first = await order_service.order_success(
        order_no=order.order_no,
        channel_order_no=payment.telegram_payment_charge_id,
        channel_uid="12345",
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata="{}",
        paid_amount=payment.total_amount * 1_000_000,
        paid_currency=payment.currency,
    )
    second = await order_service.order_success(
        order_no=order.order_no,
        channel_order_no=payment.telegram_payment_charge_id,
        channel_uid="12345",
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata="{}",
        paid_amount=payment.total_amount * 1_000_000,
        paid_currency=payment.currency,
    )

    assert first == {
        "order_no": order.order_no,
        "idempotent": False,
        "callback_triggered": True,
    }
    assert second == {
        "order_no": order.order_no,
        "idempotent": True,
        "callback_triggered": False,
    }


@pytest.mark.asyncio
async def test_subscription_fulfillment_does_not_extend_twice_for_same_order(
    telegram_payment_cleanup: _CleanupState,
):
    """同一个订单重复进入订阅履约时，只能加一次时长。"""
    user_id = 9_000_000_000 + uuid.uuid4().int % 1_000_000
    order = await _create_stars_subscription_order(
        telegram_payment_cleanup,
        user_id=user_id,
    )
    existing_expires_at = 4_102_444_800_000
    duration_ms = int(timedelta(days=30).total_seconds() * 1000)

    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                expires_at=existing_expires_at,
            )
        )
        await db.commit()

    await _mark_order_paid_for_test(
        order.order_no,
        channel_order_no="tg-charge-idempotent",
        callback_status=CallbackStatus.PENDING,
    )

    paid_order = await order_service.get_order_by_no(order.order_no)
    assert paid_order is not None
    first = await order_service.fulfill_paid_order(paid_order)
    second = await order_service.fulfill_paid_order(paid_order)

    subscription = await subscription_service.get_user_subscription(user_id)
    fulfilled_order = await order_service.get_order_by_no(order.order_no)

    assert first is True
    assert second is True
    assert subscription.expires_at == existing_expires_at + duration_ms
    assert fulfilled_order is not None
    assert fulfilled_order.callback_status == CallbackStatus.SUCCESS.value


@pytest.mark.asyncio
async def test_order_fulfillment_timeout_keeps_order_pending(
    monkeypatch,
    telegram_payment_cleanup: _CleanupState,
):
    """订单侧履约超时不标 SUCCESS/FAILED，保留 PENDING 等补偿。"""
    order = await _create_stars_subscription_order(telegram_payment_cleanup)
    await _mark_order_paid_for_test(
        order.order_no,
        channel_order_no="tg-charge-timeout",
        callback_status=CallbackStatus.PENDING,
    )
    paid_order = await order_service.get_order_by_no(order.order_no)
    assert paid_order is not None

    async def slow_fulfill_once(order: OrderModel) -> bool:
        await asyncio.sleep(1)
        return True

    monkeypatch.setattr(order_service_module, "ORDER_FULFILLMENT_TIMEOUT_SECONDS", 0.01)
    monkeypatch.setattr(order_service, "_fulfill_paid_order_once", slow_fulfill_once)

    fulfilled = await order_service.fulfill_paid_order(paid_order)
    current_order = await order_service.get_order_by_no(order.order_no)

    assert fulfilled is False
    assert current_order is not None
    assert current_order.callback_status == CallbackStatus.PENDING.value


@pytest.mark.asyncio
async def test_paid_failed_callback_is_not_retried_by_duplicate_payment_webhook(
    telegram_payment_cleanup: _CleanupState,
):
    """FAILED 是人工排查态，重复支付通知不能自动重新发货。"""
    user_id = 9_000_000_000 + uuid.uuid4().int % 1_000_000
    order = await _create_stars_subscription_order(
        telegram_payment_cleanup,
        user_id=user_id,
    )
    await _mark_order_paid_for_test(
        order.order_no,
        channel_order_no="tg-charge-failed",
        callback_status=CallbackStatus.FAILED,
    )

    result = await order_service.order_success(
        order_no=order.order_no,
        channel_order_no="tg-charge-failed",
        channel_uid="12345",
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata="{}",
        paid_amount=950_000_000,
        paid_currency=TELEGRAM_STARS_CURRENCY,
    )
    current_order = await order_service.get_order_by_no(order.order_no)
    subscription = await subscription_service.get_user_subscription(user_id)

    assert result == {
        "order_no": order.order_no,
        "idempotent": True,
        "callback_triggered": False,
    }
    assert current_order is not None
    assert current_order.callback_status == CallbackStatus.FAILED.value
    assert subscription.expires_at is None


@pytest.mark.asyncio
async def test_paid_not_called_callback_is_not_retried_by_duplicate_payment_webhook(
    telegram_payment_cleanup: _CleanupState,
):
    """外部重复支付通知只确认同一笔支付，不负责补偿内部履约。"""
    user_id = 9_000_000_000 + uuid.uuid4().int % 1_000_000
    order = await _create_stars_subscription_order(
        telegram_payment_cleanup,
        user_id=user_id,
    )
    await _mark_order_paid_for_test(
        order.order_no,
        channel_order_no="tg-charge-not-called",
        callback_status=CallbackStatus.NOT_CALLED,
    )

    result = await order_service.order_success(
        order_no=order.order_no,
        channel_order_no="tg-charge-not-called",
        channel_uid="12345",
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        extra_metadata="{}",
        paid_amount=950_000_000,
        paid_currency=TELEGRAM_STARS_CURRENCY,
    )
    current_order = await order_service.get_order_by_no(order.order_no)
    subscription = await subscription_service.get_user_subscription(user_id)

    assert result == {
        "order_no": order.order_no,
        "idempotent": True,
        "callback_triggered": False,
    }
    assert current_order is not None
    assert current_order.callback_status == CallbackStatus.NOT_CALLED.value
    assert subscription.expires_at is None
