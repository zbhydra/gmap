"""自动续费回调使用真实 MySQL 与 Redis 的并发收敛回归测试。

测试直接调用生产 OrderService，并由真实订阅履约逻辑写入 MySQL；内部 service、
数据库和 Redis 均不使用 mock 或 monkeypatch。
"""

import asyncio
import json
from typing import Protocol, cast

import pytest
from sqlalchemy import select, update
from sqlalchemy.sql.elements import ColumnElement

from app.constants.order import CallbackStatus, OrderStatus, ProductClass
from app.constants.subscription import (
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.database import get_async_session
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.provider.payment.payment_base import (
    CallbackVerificationResult,
    RecurringPaymentReference,
)
from app.services.order_service import order_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DAY_MS = 86_400_000
_PAYMENT_METHOD = "paypal"
_PAID_AMOUNT = 12_340_000
_PAID_CURRENCY = "USD"


class _CleanupState(Protocol):
    """本文件消费的自动续费清理 fixture 合同。"""

    test_run_id: str
    user_id: int


async def _get_subscription(user_id: int) -> UserSubscriptionModel | None:
    """从真实 MySQL 读取用户订阅。"""

    subscription_user_id = cast(ColumnElement[int], UserSubscriptionModel.user_id)
    async with get_async_session() as db:
        result = await db.execute(
            select(UserSubscriptionModel).where(subscription_user_id == user_id)
        )
        return result.scalar_one_or_none()


async def _get_renewal_orders(channel_order_no: str) -> list[OrderModel]:
    """从真实 MySQL 读取指定 PayPal 渠道流水对应的续费订单。"""

    async with get_async_session() as db:
        result = await db.scalars(
            select(OrderModel).where(
                OrderModel.payment_method == _PAYMENT_METHOD,
                OrderModel.payment_channel_order_no == channel_order_no,
            )
        )
        return list(result.all())


async def test_real_recurring_callback_concurrency_creates_and_fulfills_once(
    real_redis_ready: None,
    real_recurring_payment_cleanup_state: _CleanupState,
) -> None:
    """同一渠道扣款的并发回调只创建一条续费订单并推进一次账期。"""

    cleanup = real_recurring_payment_cleanup_state
    now_ms = timestamp_now()
    original_order_no = f"ORR{cleanup.test_run_id.upper()}"
    # 首期 Provider 账期：真实链路由 Provider 查询订阅状态归一化得出。
    first_period_expires_at = now_ms + 30 * _DAY_MS
    renewal_period_expires_at = first_period_expires_at + 30 * _DAY_MS
    product_snapshot = {
        "product_line": "extension",
        "product_price_id": 0,
        "auto_renew": True,
        "period": "month",
        "currency": _PAID_CURRENCY,
        "amount": _PAID_AMOUNT,
        "provider_sku": None,
    }
    original_order = OrderModel(  # type: ignore[call-arg]
        order_no=original_order_no,
        user_id=cleanup.user_id,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
        product_name=f"pytest-recurring-{cleanup.test_run_id}",
        amount=_PAID_AMOUNT,
        currency=_PAID_CURRENCY,
        order_status=OrderStatus.PAID.value,
        callback_status=CallbackStatus.PENDING.value,
        payment_method=_PAYMENT_METHOD,
        payment_channel_order_no=f"initial-{cleanup.test_run_id}",
        paid_amount=_PAID_AMOUNT,
        paid_currency=_PAID_CURRENCY,
        paid_at=now_ms,
        expired_at=now_ms + _DAY_MS,
        extra_metadata=json.dumps(
            {
                "product_snapshot": product_snapshot,
                "payment_callback": {
                    "provider_subscription": {
                        "channel_subscription_id": f"sub-{cleanup.test_run_id}",
                        "original_order_no": original_order_no,
                        "start_at": now_ms,
                        "expires_at": first_period_expires_at,
                    },
                },
                "test_run_id": cleanup.test_run_id,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        created_at=now_ms,
        updated_at=now_ms,
    )
    stored_original = await order_service.create(original_order)

    assert await order_service.fulfill_paid_order(stored_original) is True
    subscription_before = await _get_subscription(cleanup.user_id)
    assert subscription_before is not None
    assert subscription_before.expires_at == first_period_expires_at
    assert subscription_before.auto_renew is True
    assert subscription_before.payment_method == _PAYMENT_METHOD

    renewal_channel_order_no = f"renewal-{cleanup.test_run_id}"

    def _make_callback() -> CallbackVerificationResult:
        return CallbackVerificationResult(
            valid=True,
            processed=True,
            event="payment_sale_completed",
            order_no=None,
            channel_order_no=renewal_channel_order_no,
            channel_uid=f"payer-{cleanup.test_run_id}",
            amount=_PAID_AMOUNT,
            currency=_PAID_CURRENCY,
            transaction_id=renewal_channel_order_no,
            extra_metadata=json.dumps(
                {
                    "paypal_sale_id": renewal_channel_order_no,
                    "is_recurring": True,
                    "provider_subscription": {
                        "channel_subscription_id": f"sub-{cleanup.test_run_id}",
                        "original_order_no": original_order_no,
                        "start_at": first_period_expires_at,
                        "expires_at": renewal_period_expires_at,
                    },
                    "test_run_id": cleanup.test_run_id,
                },
                ensure_ascii=False,
                separators=(",", ":"),
            ),
            recurring_reference=RecurringPaymentReference(
                original_order_no=original_order_no
            ),
        )

    results = await asyncio.gather(
        order_service.handle_payment_callback(
            payment_method=_PAYMENT_METHOD,
            callback=_make_callback(),
        ),
        order_service.handle_payment_callback(
            payment_method=_PAYMENT_METHOD,
            callback=_make_callback(),
        ),
    )

    renewal_orders = await _get_renewal_orders(renewal_channel_order_no)
    assert len(renewal_orders) == 1
    renewal_order = renewal_orders[0]
    assert {result.order_no for result in results} == {renewal_order.order_no}
    assert renewal_order.user_id == cleanup.user_id
    assert renewal_order.order_status == OrderStatus.PAID.value
    assert renewal_order.callback_status == CallbackStatus.SUCCESS.value
    assert renewal_order.payment_transaction_id == renewal_channel_order_no

    subscription_after = await _get_subscription(cleanup.user_id)
    assert subscription_after is not None
    # 自动续费账期只按 Provider 归一化到期时间推进，同一账期重复回调不重复推进。
    assert subscription_after.expires_at == renewal_period_expires_at


async def test_real_renewal_fulfillment_advances_period_without_tier_revert(
    real_redis_ready: None,
    real_recurring_payment_cleanup_state: _CleanupState,
) -> None:
    """档位保护（005）：首购回调覆盖行内档位，续费回调只推进账期不回档。"""

    cleanup = real_recurring_payment_cleanup_state
    now_ms = timestamp_now()
    original_order_no = f"ORU{cleanup.test_run_id.upper()}"
    first_period_expires_at = now_ms + 30 * _DAY_MS
    renewal_period_expires_at = first_period_expires_at + 30 * _DAY_MS
    original_order = OrderModel(  # type: ignore[call-arg]
        order_no=original_order_no,
        user_id=cleanup.user_id,
        product_class=ProductClass.SUBSCRIPTION.value,
        product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
        product_name=f"pytest-tier-guard-{cleanup.test_run_id}",
        amount=_PAID_AMOUNT,
        currency=_PAID_CURRENCY,
        order_status=OrderStatus.PAID.value,
        callback_status=CallbackStatus.PENDING.value,
        payment_method=_PAYMENT_METHOD,
        payment_channel_order_no=f"initial-tier-{cleanup.test_run_id}",
        paid_amount=_PAID_AMOUNT,
        paid_currency=_PAID_CURRENCY,
        paid_at=now_ms,
        expired_at=now_ms + _DAY_MS,
        extra_metadata=json.dumps(
            {
                "product_snapshot": {
                    "product_line": "maps_extension",
                    "product_price_id": 0,
                    "auto_renew": True,
                    "period": "month",
                    "currency": _PAID_CURRENCY,
                    "amount": _PAID_AMOUNT,
                    "provider_sku": None,
                },
                "payment_callback": {
                    "provider_subscription": {
                        "channel_subscription_id": f"sub-{cleanup.test_run_id}",
                        "original_order_no": original_order_no,
                        "start_at": now_ms,
                        "expires_at": first_period_expires_at,
                    },
                },
                "test_run_id": cleanup.test_run_id,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        created_at=now_ms,
        updated_at=now_ms,
    )
    stored_original = await order_service.create(original_order)

    # 首购回调：履约订单号 == 回调携带的首单号，覆盖行内档位。
    assert await order_service.fulfill_paid_order(stored_original) is True
    row_after_first = await _get_subscription(cleanup.user_id)
    assert row_after_first is not None
    assert row_after_first.product_id == MAPS_EXTENSION_PRO_PRODUCT_ID
    assert row_after_first.expires_at == first_period_expires_at

    # 渠道换价后的本地档位（sync_plan_from_channel 的写入效果）。
    async with get_async_session() as db:
        await db.execute(
            update(UserSubscriptionModel)
            .where(UserSubscriptionModel.user_id == cleanup.user_id)
            .values(
                product_id=MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
                updated_at=timestamp_now(),
            )
        )
        await db.commit()

    renewal_channel_order_no = f"renewal-tier-{cleanup.test_run_id}"
    renewal_callback = CallbackVerificationResult(
        valid=True,
        processed=True,
        event="payment_sale_completed",
        order_no=None,
        channel_order_no=renewal_channel_order_no,
        channel_uid=f"payer-{cleanup.test_run_id}",
        amount=_PAID_AMOUNT,
        currency=_PAID_CURRENCY,
        transaction_id=renewal_channel_order_no,
        extra_metadata=json.dumps(
            {
                "is_recurring": True,
                "provider_subscription": {
                    "channel_subscription_id": f"sub-{cleanup.test_run_id}",
                    "original_order_no": original_order_no,
                    "start_at": first_period_expires_at,
                    "expires_at": renewal_period_expires_at,
                },
                "test_run_id": cleanup.test_run_id,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        recurring_reference=RecurringPaymentReference(
            original_order_no=original_order_no
        ),
    )
    await order_service.handle_payment_callback(
        payment_method=_PAYMENT_METHOD,
        callback=renewal_callback,
    )

    renewal_orders = await _get_renewal_orders(renewal_channel_order_no)
    assert len(renewal_orders) == 1
    assert renewal_orders[0].callback_status == CallbackStatus.SUCCESS.value
    row_after_renewal = await _get_subscription(cleanup.user_id)
    assert row_after_renewal is not None
    # 续费履约订单复制的快照是首购档：账期推进但档位必须保持升级后的 Business。
    assert row_after_renewal.product_id == MAPS_EXTENSION_BUSINESS_PRODUCT_ID
    assert row_after_renewal.expires_at == renewal_period_expires_at
    assert row_after_renewal.auto_renew is True
