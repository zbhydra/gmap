"""订阅管理服务"""

import json
from datetime import timedelta
from typing import cast

from sqlalchemy import case
from sqlalchemy.dialects.mysql import insert as mysql_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.elements import ColumnElement

from app.constants.order import (
    OrderCheckProductParam,
    OrderCreateParam,
    ProductClass,
)
from app.constants.subscription import (
    FREE_SUBSCRIPTION_PRODUCT_ID,
    SubscriptionPeriodEnum,
    SubscriptionProductMetadata,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.database import get_async_session
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.services.base_service import BaseService
from app.services.payment_config_service import (
    SubscriptionCheckoutChannelConfig,
    SubscriptionProductConfig,
    payment_config_service,
)
from app.utils.money import normalize_currency
from app.utils.time import timestamp_now

_DAY_MS = int(timedelta(days=1).total_seconds() * 1000)


class SubscriptionService(BaseService[UserSubscriptionModel]):
    """订阅管理服务"""

    primary_key_field = "user_id"

    def __init__(self):
        super().__init__(UserSubscriptionModel)

    async def check_product(self, param: OrderCheckProductParam) -> OrderCreateParam:
        """校验订阅商品下单参数，并生成订单快照参数。"""
        if param.user_id > 0:
            subscription = await self.get_user_subscription(param.user_id)
            if subscription.expires_at is not None:
                raise AppCommonException(
                    CommonCode.INVALID_REQUEST,
                    ext_msg=(
                        "subscription_check_product: user already has active "
                        "subscription, reject duplicate subscription checkout: "
                        f"user_id={param.user_id}, product_id={param.product_id}, "
                        f"expires_at={subscription.expires_at}"
                    ),
                    data={
                        "reason": "active_subscription_exists",
                        "expires_at": subscription.expires_at,
                    },
                )

        checkout_config = await self.validate_client_price(
            product_id=param.product_id,
            channel_code=param.payment_method,
            currency=param.currency,
            amount=param.amount,
        )
        product_metadata = SubscriptionProductMetadata.from_metadata(
            checkout_config.product.metadata,
            product_id=checkout_config.product.product_id,
            period=checkout_config.product.period,
        )
        return OrderCreateParam(
            user_id=param.user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id=checkout_config.product.product_id,
            product_name=checkout_config.product.name,
            amount=checkout_config.price.amount,
            payment_method=checkout_config.channel.channel_code,
            currency=checkout_config.price.currency,
            client_ip=param.client_ip,
            extra_metadata=self._order_metadata_json(checkout_config),
            language=param.language,
            auto_renew=product_metadata.auto_renew,
            provider_sku=checkout_config.price.provider_sku,
        )

    async def validate_client_price(
        self,
        *,
        product_id: str,
        channel_code: str,
        currency: str,
        amount: int,
    ) -> SubscriptionCheckoutChannelConfig:
        """校验客户端提交的订阅价格与当前订阅配置一致。"""

        if product_id != UNLIMITED_SUBSCRIPTION_PRODUCT_ID:
            raise AppCommonException(
                CommonCode.PAYMENT_PRICE_UPDATED,
                ext_msg=(
                    "subscription: unsupported subscription product for checkout: "
                    f"product_id={product_id}, channel_code={channel_code}"
                ),
                data={
                    "product_id": UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
                    "payment_method": channel_code,
                },
            )

        checkout_config = await payment_config_service.get_subscription_checkout_config(
            product_id=product_id,
            channel_code=channel_code,
        )
        price = checkout_config.price
        normalized_currency = normalize_currency(currency)

        if price.currency != normalized_currency or price.amount != amount:
            raise AppCommonException(
                CommonCode.PAYMENT_PRICE_UPDATED,
                ext_msg=(
                    "subscription: client price stale: "
                    f"product_id={price.product_id}, channel_code={price.channel_code}, "
                    f"config_currency={price.currency}, client_currency={normalized_currency}, "
                    f"config_amount={price.amount}, client_amount={amount}"
                ),
                data={
                    "product_id": price.product_id,
                    "payment_method": price.channel_code,
                    "currency": price.currency,
                    "amount": price.amount,
                },
            )

        return checkout_config

    async def get_user_subscription(self, user_id: int) -> UserSubscriptionModel:
        """
        获取用户当前付费订阅权益。

        user_subscriptions 只保存有效或曾有效的 Unlimited 权益；Free 不落库。
        """
        subscription = await self.get_by_id(user_id)
        if (
            subscription
            and subscription.expires_at is not None
            and subscription.expires_at > timestamp_now()
        ):
            return subscription

        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=None,
        )

    async def update_user_subscription(
        self,
        user_id: int,
        expires_at: int,
    ) -> bool:
        """
        更新用户 Unlimited 订阅到期时间。

        Args:
            user_id: 用户 ID
            expires_at: 过期时间（毫秒时间戳）
        """
        existing = await self.get_by_id(user_id)

        if existing:
            return await self.update(
                user_id,
                expires_at=expires_at,
                updated_at=timestamp_now(),
            )

        subscription = UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            expires_at=expires_at,
        )
        await self.create(subscription)
        return True

    async def get_user_subscription_config(
        self, user_id: int
    ) -> tuple[UserSubscriptionModel, SubscriptionProductConfig]:
        """
        获取用户订阅配置

        Returns:
            (订阅记录, 订阅商品配置)
        """
        if user_id is None or user_id == 0:
            subscription = UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=0,
                expires_at=None,
            )
            return subscription, await self._get_subscription_product_config(
                FREE_SUBSCRIPTION_PRODUCT_ID
            )

        subscription = await self.get_user_subscription(user_id)
        product_id = (
            UNLIMITED_SUBSCRIPTION_PRODUCT_ID
            if subscription.expires_at is not None
            else FREE_SUBSCRIPTION_PRODUCT_ID
        )
        return subscription, await self._get_subscription_product_config(product_id)

    async def _get_subscription_product_config(
        self,
        product_id: str,
    ) -> SubscriptionProductConfig:
        """按订阅商品 ID 读取启用配置，不加载支付渠道价格。"""
        products = await payment_config_service.list_subscription_products()
        product = next(
            (item for item in products if item.product_id == product_id),
            None,
        )
        if product is None:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription: enabled subscription product missing, "
                    f"product_id={product_id}"
                ),
            )
        return product

    async def fulfill_paid_order(self, db: AsyncSession, order: OrderModel) -> None:
        """在订单 service 事务内完成订阅发货。

        Args:
            db: 订单 service 管理的事务 session。
            order: 已支付且 callback_status=PENDING 的订阅订单。
        """
        duration_days = self._order_snapshot_duration_days(order)
        await self.extend_subscription_days_in_session(
            db,
            user_id=order.user_id,
            duration_days=duration_days,
        )

    async def extend_subscription_days(
        self,
        *,
        user_id: int,
        duration_days: int,
    ) -> None:
        """在独立事务内按天延长用户 Unlimited 权益。"""

        async with get_async_session() as db:
            await self.extend_subscription_days_in_session(
                db,
                user_id=user_id,
                duration_days=duration_days,
            )
            await db.commit()

    async def extend_subscription_days_in_session(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        duration_days: int,
    ) -> None:
        """在调用方事务内用 MySQL 原子 upsert 按天延长权益。

        活动订阅从数据库当前到期时间继续累加；无记录、空到期时间或已过期
        均从本次执行时间开始计算，避免并发支付与赠送发生读改写覆盖。
        """

        now_ms = timestamp_now()
        insert_expires_at = now_ms + self._duration_ms(duration_days)
        update_expires_at = self._renew_subscription_expires_at(
            now_ms,
            duration_days,
        )
        stmt = mysql_insert(UserSubscriptionModel).values(
            user_id=user_id,
            expires_at=insert_expires_at,
            created_at=now_ms,
            updated_at=now_ms,
        )
        stmt = stmt.on_duplicate_key_update(
            expires_at=update_expires_at,
            updated_at=now_ms,
        )
        await db.execute(stmt)

    def _parse_paid_period(self, period_value: object) -> SubscriptionPeriodEnum:
        """把订单快照 period 解析成订阅周期。"""
        try:
            period = SubscriptionPeriodEnum(period_value)
        except (TypeError, ValueError) as exc:
            raise ValueError(
                f"Unsupported subscription period for paid order: "
                f"period={period_value}"
            ) from exc

        if period == SubscriptionPeriodEnum.FREE:
            raise ValueError(
                f"Free subscription period cannot be fulfilled as paid order: "
                f"period={period_value}"
            )
        return period

    def _renew_subscription_expires_at(
        self,
        now_ms: int,
        duration_days: int,
    ) -> object:
        """计算已有订阅记录续费后的到期时间表达式。"""
        duration_ms = self._duration_ms(duration_days)
        expires_at_col = cast(ColumnElement[int], UserSubscriptionModel.expires_at)
        return case(
            (
                expires_at_col > now_ms,
                expires_at_col + duration_ms,
            ),
            else_=now_ms + duration_ms,
        )

    def _duration_ms(self, duration_days: int) -> int:
        """把订阅商品配置天数转换为毫秒。"""
        if duration_days <= 0:
            raise ValueError(
                "subscription_fulfillment: duration_days must be positive: "
                f"duration_days={duration_days}"
            )
        return duration_days * _DAY_MS

    def _order_metadata_json(
        self,
        checkout_config: SubscriptionCheckoutChannelConfig,
    ) -> str:
        """生成订阅订单商品快照，后续履约按快照 duration_days 续订。"""

        return json.dumps(
            {
                "product_snapshot": {
                    "period": checkout_config.product.period,
                    "duration_days": checkout_config.product.duration_days,
                    "metadata": checkout_config.product.metadata,
                    "provider_sku": checkout_config.price.provider_sku,
                }
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )

    def _order_snapshot_duration_days(self, order: OrderModel) -> int:
        """读取订阅订单快照 duration_days，履约续期只依赖订单快照。"""

        metadata = self._load_order_metadata(order)
        snapshot = metadata.get("product_snapshot")
        if not isinstance(snapshot, dict):
            raise ValueError(
                "subscription_fulfillment: product_snapshot missing: "
                f"order_no={order.order_no}, user_id={order.user_id}"
            )
        self._parse_paid_period(snapshot.get("period"))
        duration_days = snapshot.get("duration_days")
        if not isinstance(duration_days, int) or duration_days <= 0:
            raise ValueError(
                "subscription_fulfillment: invalid duration_days: "
                f"order_no={order.order_no}, user_id={order.user_id}, "
                f"duration_days={duration_days!r}"
            )
        return duration_days

    def _load_order_metadata(self, order: OrderModel) -> dict[str, object]:
        """解析订单履约快照 JSON。"""

        if not order.extra_metadata:
            raise ValueError(
                "subscription_fulfillment: order extra_metadata missing: "
                f"order_no={order.order_no}, user_id={order.user_id}"
            )
        try:
            metadata = json.loads(order.extra_metadata)
        except json.JSONDecodeError as exc:
            raise ValueError(
                "subscription_fulfillment: invalid order extra_metadata json: "
                f"order_no={order.order_no}, user_id={order.user_id}"
            ) from exc
        if not isinstance(metadata, dict):
            raise ValueError(
                "subscription_fulfillment: extra_metadata must be object: "
                f"order_no={order.order_no}, user_id={order.user_id}"
            )
        return metadata


# 全局实例
subscription_service = SubscriptionService()
