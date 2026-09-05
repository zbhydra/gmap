"""订阅管理服务：档位与补差规则归业务层，渠道协议与结果归 PaymentBase。"""

import json
from dataclasses import asdict, dataclass
from datetime import timedelta
from typing import Any, cast

from sqlalchemy import case, select, update
from sqlalchemy.dialects.mysql import insert as mysql_insert
from sqlalchemy.engine import CursorResult
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.elements import ColumnElement

from app.constants.order import (
    OrderCheckProductParam,
    OrderCreateParam,
    ProductClass,
)
from app.constants.payment import (
    channel_amount_unit,
)
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    FREE_SUBSCRIPTION_PRODUCT_ID,
    SUBSCRIPTION_UPGRADE_PURPOSE,
    SubscriptionPeriodEnum,
    SubscriptionProductMetadata,
    SubscriptionUpgradeQuoteReason,
)
from app.core.config import settings
from app.core.database import get_async_session
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.provider.payment.payment_base import (
    PaymentBase,
    PaymentProviderError,
    SubscriptionUpdateResult,
)
from app.services.base_service import BaseService
from app.services.payment_config_service import (
    SubscriptionCheckoutChannelConfig,
    SubscriptionProductConfig,
    SubscriptionProductPriceConfig,
    payment_config_service,
)
from app.services.payment_service import payment_service
from app.utils.money import normalize_currency
from app.utils.logger import logger
from app.utils.time import add_natural_months, timestamp_now

_DAY_MS = int(timedelta(days=1).total_seconds() * 1000)

# 快照 period → 自然月数：一次性支付按自然月续期，不再是配置天数累加。
_PERIOD_MONTHS = {
    SubscriptionPeriodEnum.MONTH: 1,
    SubscriptionPeriodEnum.QUARTER: 3,
    SubscriptionPeriodEnum.YEAR: 12,
}

# 历史订阅行（无档位语义的插件 Unlimited）的行内 product_id 缺省值：
# extend_subscription_days 未显式传档位时（如好评赠送加时）沿用该档位。
UNLIMITED_ROW_PRODUCT_ID = "unlimited"


@dataclass(frozen=True, slots=True)
class _UpgradeUnavailable:
    """升级判定失败结果：携带报价响应组装所需的失败点上下文。"""

    reason: SubscriptionUpgradeQuoteReason
    current_product_id: str | None = None
    payment_method: str | None = None
    currency: str | None = None


@dataclass(frozen=True, slots=True)
class _UpgradeResolution:
    """升级判定成功结果：升级报价与路径A差额下单共用的唯一判定产出。"""

    subscription: UserSubscriptionModel
    current_product: SubscriptionProductConfig
    target_product: SubscriptionProductConfig
    payment_method: str
    currency: str
    current_price: SubscriptionProductPriceConfig
    target_price: SubscriptionProductPriceConfig
    now_ms: int
    provider: PaymentBase


class SubscriptionService(BaseService[UserSubscriptionModel]):
    """订阅管理服务"""

    primary_key_field = "user_id"

    def __init__(self) -> None:
        super().__init__(UserSubscriptionModel)

    async def check_product(self, param: OrderCheckProductParam) -> OrderCreateParam:
        """校验订阅商品下单参数，并生成订单快照参数。"""
        checkout_config = await self.validate_client_price(
            product_id=param.product_id,
            channel_code=param.payment_method,
            currency=param.currency,
            amount=param.amount,
            auto_renew=param.auto_renew,
            period=param.period,
        )
        product_line = checkout_config.product.product_line

        # 重复购买校验按产品线隔离：同产品线存在未过期订阅时拒绝新下单，
        # 不同产品线互不影响（如插件 Unlimited 与 maps_extension 套餐可并存）。
        if param.user_id > 0:
            subscription = await self.get_user_subscription(param.user_id, product_line)
            if subscription.expires_at is not None:
                raise AppCommonException(
                    CommonCode.INVALID_REQUEST,
                    ext_msg=(
                        "subscription_check_product: user already has active "
                        "subscription on the same product line, reject duplicate "
                        f"subscription checkout: user_id={param.user_id}, "
                        f"product_line={product_line}, "
                        f"product_id={param.product_id}, "
                        f"expires_at={subscription.expires_at}"
                    ),
                    data={
                        "reason": "active_subscription_exists",
                        "expires_at": subscription.expires_at,
                    },
                )

        SubscriptionProductMetadata.from_metadata(
            checkout_config.product.metadata,
            product_id=checkout_config.product.product_id,
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
            auto_renew=checkout_config.product.auto_renew,
            provider_sku=checkout_config.price.provider_sku,
        )

    async def validate_client_price(
        self,
        *,
        product_id: str,
        channel_code: str,
        currency: str,
        amount: int,
        auto_renew: bool,
        period: str,
    ) -> SubscriptionCheckoutChannelConfig:
        """校验客户端提交的订阅价格与当前订阅配置一致。

        可购买范围由「启用商品 + 渠道价」配置决定：free 档（period=none）没有
        渠道价，天然不可下单；其余启用商品（含 maps_extension 产品线多档位）
        按配置放行，不在代码里锁死商品白名单。auto_renew + period 与商品
        单一计费模式不一致同样按价格已更新拒绝。
        """

        checkout_config = await payment_config_service.get_subscription_checkout_config(
            product_id=product_id,
            channel_code=channel_code,
            auto_renew=auto_renew,
            period=period,
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

    def is_auto_renew(self, subscription: UserSubscriptionModel) -> bool:
        """按有效权益与实例续费快照计算自动续费状态。"""

        return bool(
            subscription.expires_at
            and subscription.expires_at > timestamp_now()
            and subscription.auto_renew
        )

    async def create_management_url(
        self,
        user_id: int,
        product_line: str,
    ) -> str | None:
        """为当前有效自动续费订阅创建渠道管理入口。

        管理入口只把用户带到支付渠道（PayPal Automatic Payments /
        ClinkBill Customer Portal），不做站内取消，也不推测渠道取消状态。
        """

        subscription = await self.get_user_subscription(user_id, product_line)
        if not self.is_auto_renew(subscription) or not subscription.payment_method:
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_create_management_url: active auto-renew "
                    f"subscription missing: user_id={user_id}, "
                    f"product_line={product_line}"
                ),
            )
        provider = await payment_service.get_provider_for_existing_payment(
            subscription.payment_method
        )
        try:
            return await provider.create_subscription_management_url(
                channel_uid=subscription.channel_uid,
                return_url=(
                    f"{settings.app.public_website_base_url.rstrip('/')}/pricing/"
                ),
            )
        except PaymentProviderError as exc:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=str(exc),
            ) from exc

    async def get_upgrade_quote(
        self,
        *,
        user_id: int,
        product_line: str,
        target_product_id: str,
    ) -> dict[str, object]:
        """实时判定与折算；自动续费金额由渠道已核对的 preview 提供。"""

        target_id = target_product_id.strip()
        resolved = await self._resolve_upgrade(
            user_id=user_id,
            product_line=product_line,
            target_product_id=target_id,
        )
        if isinstance(resolved, _UpgradeUnavailable):
            return self._upgrade_quote_unavailable(
                resolved.reason,
                target_product_id=target_id,
                current_product_id=resolved.current_product_id,
                payment_method=resolved.payment_method,
                currency=resolved.currency,
            )

        # 判定链保证订阅行有效，expires_at 必为毫秒时间戳，auto_renew 为明确 bool。
        base_expires_at = cast(int, resolved.subscription.expires_at)
        if resolved.subscription.auto_renew is False:
            amount = self._prorated_upgrade_amount(
                diff=resolved.target_price.amount - resolved.current_price.amount,
                expires_at=base_expires_at,
                start_at=resolved.subscription.start_at,
                now_ms=resolved.now_ms,
                unit=channel_amount_unit(resolved.payment_method),
            )
            if amount is None:
                return self._upgrade_quote_unavailable(
                    SubscriptionUpgradeQuoteReason.NON_POSITIVE_DIFF,
                    target_product_id=target_id,
                    current_product_id=resolved.current_product.product_id,
                    payment_method=resolved.payment_method,
                    currency=resolved.currency,
                )
            return self._upgrade_quote_available(
                current_product_id=resolved.current_product.product_id,
                target_product_id=resolved.target_product.product_id,
                payment_method=resolved.payment_method,
                currency=resolved.currency,
                amount=amount,
                expires_at=base_expires_at,
            )

        channel_subscription_id = resolved.subscription.channel_subscription_id
        if channel_subscription_id is None:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription_get_upgrade_quote: 自动续费实例缺少渠道订阅 ID: "
                    f"user_id={user_id}, product_line={product_line}"
                ),
            )
        try:
            preview = await resolved.provider.preview_subscription_update(
                channel_subscription_id=channel_subscription_id,
                target_provider_sku=resolved.target_price.provider_sku,
                currency=resolved.currency,
            )
        except PaymentProviderError as exc:
            logger.error(
                "subscription_get_upgrade_quote: 渠道预览不可用: "
                f"user_id={user_id}, product_line={product_line}, error={exc}",
                exc_info=True,
            )
            return self._upgrade_quote_unavailable(
                SubscriptionUpgradeQuoteReason.CHANNEL_UNAVAILABLE,
                target_product_id=target_id,
                current_product_id=resolved.current_product.product_id,
                payment_method=resolved.payment_method,
                currency=resolved.currency,
            )
        amount = preview.net_amount
        if amount <= 0:
            return self._upgrade_quote_unavailable(
                SubscriptionUpgradeQuoteReason.NON_POSITIVE_DIFF,
                target_product_id=target_id,
                current_product_id=resolved.current_product.product_id,
                payment_method=resolved.payment_method,
                currency=resolved.currency,
            )
        return self._upgrade_quote_available(
            current_product_id=resolved.current_product.product_id,
            target_product_id=resolved.target_product.product_id,
            payment_method=resolved.payment_method,
            currency=resolved.currency,
            amount=amount,
            expires_at=base_expires_at,
        )

    async def _resolve_upgrade(
        self,
        *,
        user_id: int,
        product_line: str,
        target_product_id: str,
        allow_same_tier: bool = False,
    ) -> _UpgradeResolution | _UpgradeUnavailable:
        """升级判定共享链：U1 报价、路径A差额下单与路径B confirm 都经此判定。

        链路：有效订阅（只看 expires_at > now）→ 同产品线目标档 period=month
        且 tier_rank 更高 → 渠道支持当前计费模式换档 → 两档在订阅行
        payment_method 上都有启用、币种一致的渠道价。allow_same_tier 仅
        confirm 使用：tier 相等且 target_product_id 等于当前 product_id
        （即本地已是目标档）时放行以命中幂等 succeeded；不同商品同 rank
        与降档（tier_rank 更低）一律 not_higher_tier 拒绝；报价与 checkout
        保持严格升档。每次调用实时计算，
        以下单时刻的判定与定价为准。
        """

        now_ms = timestamp_now()
        subscription = await self.get_user_subscription(user_id, product_line)
        if subscription.expires_at is None or subscription.expires_at <= now_ms:
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.NO_ACTIVE_SUBSCRIPTION
            )

        # 计费模式未知（None）不对升级报价：一次性/协议换价两条路径都只认
        # 明确实例值，报价与差额下单共用同一判定，避免两链口径分叉。
        if not isinstance(subscription.auto_renew, bool):
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.CHANNEL_UNAVAILABLE
            )

        snapshot = await payment_config_service.get_snapshot()
        current_product = snapshot.products.get(
            (product_line, subscription.product_id or "")
        )
        target_product = snapshot.products.get((product_line, target_product_id))
        same_tier_idempotent = (
            allow_same_tier
            and current_product is not None
            and target_product is not None
            and target_product.tier_rank == current_product.tier_rank
            and target_product.product_id == current_product.product_id
        )
        if (
            current_product is None
            or target_product is None
            or current_product.period != SubscriptionPeriodEnum.MONTH.value
            or target_product.period != SubscriptionPeriodEnum.MONTH.value
            or (
                current_product is not None
                and target_product is not None
                and target_product.tier_rank <= current_product.tier_rank
                and not same_tier_idempotent
            )
        ):
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.NOT_HIGHER_TIER,
                current_product_id=subscription.product_id or None,
                payment_method=subscription.payment_method,
            )

        payment_method = (subscription.payment_method or "").strip()
        if not payment_service.is_supported_method(payment_method):
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.CHANNEL_UNAVAILABLE,
                current_product_id=current_product.product_id,
                payment_method=payment_method or None,
            )
        provider = await payment_service.get_provider_for_existing_payment(
            payment_method
        )
        supported = (
            provider.supports_subscription_update
            if subscription.auto_renew
            else provider.supports_upgrade_checkout
        )
        if not supported:
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.CHANNEL_UNAVAILABLE,
                current_product_id=current_product.product_id,
                payment_method=payment_method,
            )

        current_price = snapshot.prices.get(
            (current_product.product_id, payment_method)
        )
        target_price = snapshot.prices.get((target_product.product_id, payment_method))
        if (
            current_price is None
            or target_price is None
            or current_price.currency != target_price.currency
        ):
            return _UpgradeUnavailable(
                SubscriptionUpgradeQuoteReason.CHANNEL_UNAVAILABLE,
                current_product_id=current_product.product_id,
                payment_method=payment_method,
                currency=(
                    current_price.currency if current_price is not None else None
                ),
            )
        return _UpgradeResolution(
            subscription=subscription,
            current_product=current_product,
            target_product=target_product,
            payment_method=payment_method,
            currency=current_price.currency,
            current_price=current_price,
            target_price=target_price,
            now_ms=now_ms,
            provider=provider,
        )

    async def prepare_upgrade_checkout_param(
        self,
        *,
        user_id: int,
        product_line: str,
        target_product_id: str,
        client_ip: str | None,
        language: str | None,
    ) -> OrderCreateParam:
        """路径A（一次性线）：服务端定价准备升级差额订单创建参数。

        判定与定价复用 `_resolve_upgrade` 共享链，不经过 check_product 的
        同线有效订阅拦截与客户端价比对（差额是动态价，不存在配置价目）。
        仅当订阅行实例 auto_renew 明确为 False 时放行——自动续费实例走
        U3 渠道协议换价 confirm，不产生差额订单。订单快照冻结
        purpose=upgrade、折算输入与 base_expires_at，支付回调按快照条件
        更新换档；订单创建由调用方经 order_service 完成。
        """

        target_id = target_product_id.strip()
        resolved = await self._resolve_upgrade(
            user_id=user_id,
            product_line=product_line,
            target_product_id=target_id,
        )
        if isinstance(resolved, _UpgradeUnavailable):
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_prepare_upgrade_checkout_param: upgrade "
                    f"unavailable: user_id={user_id}, product_line={product_line}, "
                    f"target_product_id={target_id}, "
                    f"reason={resolved.reason.value}"
                ),
                data={"reason": resolved.reason.value},
            )
        if resolved.subscription.auto_renew is not False:
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_prepare_upgrade_checkout_param: instance is "
                    "not one-time, differential order not supported: "
                    f"user_id={user_id}, product_line={product_line}, "
                    f"target_product_id={resolved.target_product.product_id}, "
                    f"auto_renew={resolved.subscription.auto_renew!r}"
                ),
            )

        base_expires_at = cast(int, resolved.subscription.expires_at)
        period_start = cast(int, resolved.subscription.start_at)
        amount = self._prorated_upgrade_amount(
            diff=resolved.target_price.amount - resolved.current_price.amount,
            expires_at=base_expires_at,
            start_at=period_start,
            now_ms=resolved.now_ms,
            unit=channel_amount_unit(resolved.payment_method),
        )
        if amount is None:
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_prepare_upgrade_checkout_param: non-positive "
                    f"diff: user_id={user_id}, product_line={product_line}, "
                    f"target_product_id={resolved.target_product.product_id}"
                ),
                data={"reason": SubscriptionUpgradeQuoteReason.NON_POSITIVE_DIFF.value},
            )
        remaining_ratio = (base_expires_at - resolved.now_ms) / (
            base_expires_at - period_start
        )

        return OrderCreateParam(
            user_id=user_id,
            product_class=ProductClass.SUBSCRIPTION.value,
            product_id=resolved.target_product.product_id,
            product_name=resolved.target_product.name,
            amount=amount,
            payment_method=resolved.payment_method,
            currency=resolved.currency,
            client_ip=client_ip,
            extra_metadata=self._upgrade_order_metadata_json(
                product_line=product_line,
                target_product=resolved.target_product,
                target_price=resolved.target_price,
                source_product_id=resolved.subscription.product_id,
                base_expires_at=base_expires_at,
                period_start=period_start,
                remaining_ratio=remaining_ratio,
                amount=amount,
                currency=resolved.currency,
            ),
            language=language,
            auto_renew=False,
            provider_sku=resolved.target_price.provider_sku,
        )

    async def confirm_upgrade(
        self,
        *,
        user_id: int,
        product_line: str,
        target_product_id: str,
    ) -> dict[str, object]:
        """固定实例换价；仅 succeeded 同步档位，动作交客户端等待终态。"""

        target_id = target_product_id.strip()
        resolved = await self._resolve_upgrade(
            user_id=user_id,
            product_line=product_line,
            target_product_id=target_id,
            # confirm 允许同档幂等命中（仅目标 product_id 等于当前档）；
            # 报价与 checkout 仍严格升档，同 rank 不同商品与降档一律拒绝。
            allow_same_tier=True,
        )
        if isinstance(resolved, _UpgradeUnavailable):
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_confirm_upgrade: upgrade unavailable: "
                    f"user_id={user_id}, product_line={product_line}, "
                    f"target_product_id={target_id}, "
                    f"reason={resolved.reason.value}"
                ),
                data={"reason": resolved.reason.value},
            )
        if resolved.subscription.auto_renew is not True:
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_confirm_upgrade: instance is not "
                    "auto-renewing, channel plan change not supported: "
                    f"user_id={user_id}, product_line={product_line}, "
                    f"auto_renew={resolved.subscription.auto_renew!r}"
                ),
            )
        channel_subscription_id = resolved.subscription.channel_subscription_id
        if channel_subscription_id is None:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription_confirm_upgrade: auto-renew subscription "
                    "missing channel_subscription_id: "
                    f"user_id={user_id}, product_line={product_line}, "
                    f"payment_method={resolved.payment_method}"
                ),
            )
        if resolved.subscription.product_id == resolved.target_product.product_id:
            return asdict(SubscriptionUpdateResult("succeeded"))
        try:
            state = await resolved.provider.get_subscription_state(
                channel_subscription_id
            )
            if state.provider_sku == resolved.target_price.provider_sku:
                result = SubscriptionUpdateResult("succeeded")
            else:
                preview = await resolved.provider.preview_subscription_update(
                    channel_subscription_id=channel_subscription_id,
                    target_provider_sku=resolved.target_price.provider_sku,
                    currency=resolved.currency,
                )
                if preview.net_amount <= 0:
                    raise AppCommonException(
                        CommonCode.INVALID_REQUEST,
                        ext_msg=(
                            "subscription_confirm_upgrade: 补差金额非正: "
                            f"user_id={user_id}, target_product_id={target_id}"
                        ),
                        data={
                            "reason": SubscriptionUpgradeQuoteReason.NON_POSITIVE_DIFF.value
                        },
                    )
                result = await resolved.provider.confirm_subscription_update(
                    channel_subscription_id=channel_subscription_id,
                    target_provider_sku=resolved.target_price.provider_sku,
                    price_snapshot_id=preview.price_snapshot_id,
                )
        except PaymentProviderError as exc:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription_confirm_upgrade: 渠道换价失败: "
                    f"user_id={user_id}, product_line={product_line}, error={exc}"
                ),
            ) from exc
        if result.status == "succeeded":
            await self._sync_local_tier(
                user_id=user_id,
                product_line=product_line,
                product_id=resolved.target_product.product_id,
            )
        return asdict(result)

    async def _sync_local_tier(
        self,
        *,
        user_id: int,
        product_line: str,
        product_id: str,
    ) -> None:
        """渠道已生效目标价后本地换档：只写 product_id 与 updated_at。

        到期时间、账期起点、渠道引用与续费快照保持；渠道事件重复到达时
        写入同一档位，天然幂等。
        """

        async with get_async_session() as db:
            await db.execute(
                update(UserSubscriptionModel)
                .where(
                    UserSubscriptionModel.user_id == user_id,
                    UserSubscriptionModel.product_line == product_line,
                )
                .values(product_id=product_id, updated_at=timestamp_now())
            )
            await db.commit()

    async def sync_plan_from_channel(
        self,
        *,
        payment_method: str,
        channel_subscription_id: str,
    ) -> bool:
        """计划变更事件终态收敛 owner（005 路径B，仅由两渠道 webhook 调用）。

        流程：① 查渠道订阅取得当前完整价与本地首单引用（Clink
        merchantReference / PayPal custom_id，均为创建时的首购订单号）；
        ② 按首单订单号定位用户与产品线，再按 (user_id, product_line) 主键
        读取订阅行并核对行内 channel_subscription_id；③ 渠道当前价在同渠道
        唯一映射一个启用渠道价（Clink 完整比较 productId:priceId，PayPal
        比较 plan_id），命中且与行内档位不同才更新 product_id，expires_at、
        渠道引用与续费快照保持。返回是否发生换档：唯一映射且本地已同档
        返回 False（重复事件幂等）；零映射（渠道价与任何启用价不符）与
        其他核对失败抛 PaymentProviderError，由错误中间件转 HTTP 500 让
        渠道 webhook 重试。
        """

        provider = await payment_service.get_provider_for_existing_payment(
            payment_method
        )
        state = await provider.get_subscription_state(channel_subscription_id)
        original_order_no = state.original_order_no

        # 延迟导入：order_service 反向依赖 subscription_service 履约，
        # 顶层互相导入会成环（与 order_service 内的延迟导入同一成因）。
        from app.services.order_service import order_service

        order = await order_service.get_order_by_no(original_order_no)
        if order is None:
            raise PaymentProviderError(
                "subscription_sync_plan_from_channel: first order missing: "
                f"payment_method={payment_method}, "
                f"channel_subscription_id={channel_subscription_id}, "
                f"original_order_no={original_order_no}"
            )
        if order.payment_method != payment_method:
            raise PaymentProviderError(
                "subscription_sync_plan_from_channel: first order payment "
                "method mismatch: "
                f"order_no={order.order_no}, "
                f"order_payment_method={order.payment_method}, "
                f"payment_method={payment_method}"
            )
        product_line = self._snapshot_product_line(
            order, self._order_product_snapshot(order)
        )
        row = await self.get_subscription_row(order.user_id, product_line)
        if row is None or row.channel_subscription_id != channel_subscription_id:
            raise PaymentProviderError(
                "subscription_sync_plan_from_channel: subscription row "
                "missing or channel subscription mismatch: "
                f"user_id={order.user_id}, product_line={product_line}, "
                f"channel_subscription_id={channel_subscription_id}, "
                f"row_channel_subscription_id="
                f"{row.channel_subscription_id if row else None}"
            )

        snapshot = await payment_config_service.get_snapshot()
        matched_products: set[str] = set()
        for price in snapshot.prices.values():
            if price.channel_code != payment_method or not price.provider_sku:
                continue
            if price.provider_sku != state.provider_sku:
                continue
            products = snapshot.products_by_id.get(price.product_id, [])
            if len(products) == 1 and products[0].product_line == product_line:
                matched_products.add(products[0].product_id)
        if len(matched_products) > 1:
            raise PaymentProviderError(
                "subscription_sync_plan_from_channel: channel plan maps to "
                f"multiple enabled prices: payment_method={payment_method}, "
                f"product_line={product_line}, "
                f"plan={state.provider_sku}, "
                f"matched={sorted(matched_products)}"
            )
        if not matched_products:
            raise PaymentProviderError(
                "subscription_sync_plan_from_channel: channel plan maps to no "
                f"enabled price: payment_method={payment_method}, "
                f"product_line={product_line}, "
                f"plan={state.provider_sku}"
            )
        target_product_id = next(iter(matched_products))
        if target_product_id == row.product_id:
            return False
        await self._sync_local_tier(
            user_id=order.user_id,
            product_line=product_line,
            product_id=target_product_id,
        )
        return True

    def _prorated_upgrade_amount(
        self,
        *,
        diff: int,
        expires_at: int,
        start_at: int | None,
        now_ms: int,
        unit: int,
    ) -> int | None:
        """一次性线补差折算：(档差) × (expires_at − now) / (expires_at − start_at)。

        Returns:
            6 位精度整数金额，向下取整到渠道最小单位倍数；账期起点缺失或
            非法、档差与折算结果非正时返回 None（不可升级）。
        """
        if diff <= 0 or start_at is None or start_at >= expires_at:
            return None
        amount = diff * (expires_at - now_ms) // (expires_at - start_at)
        amount = amount // unit * unit
        return amount if amount > 0 else None

    def _upgrade_quote_available(
        self,
        *,
        current_product_id: str,
        target_product_id: str,
        payment_method: str,
        currency: str | None,
        amount: int | None,
        expires_at: int,
    ) -> dict[str, object]:
        """组装可升级报价响应。"""

        return {
            "available": True,
            "reason": None,
            "current_product_id": current_product_id,
            "target_product_id": target_product_id,
            "payment_method": payment_method,
            "currency": currency,
            "amount": amount,
            "expires_at": expires_at,
        }

    def _upgrade_quote_unavailable(
        self,
        reason: SubscriptionUpgradeQuoteReason,
        *,
        target_product_id: str,
        current_product_id: str | None = None,
        payment_method: str | None = None,
        currency: str | None = None,
    ) -> dict[str, object]:
        """组装不可升级报价响应：无金额、无到期时间。"""

        return {
            "available": False,
            "reason": reason.value,
            "current_product_id": current_product_id,
            "target_product_id": target_product_id,
            "payment_method": payment_method,
            "currency": currency,
            "amount": None,
            "expires_at": None,
        }

    async def get_user_subscription(
        self,
        user_id: int,
        product_line: str = EXTENSION_PRODUCT_LINE,
    ) -> UserSubscriptionModel:
        """
        获取用户在指定产品线的当前付费订阅权益。

        user_subscriptions 按产品线一行，只保存有效或曾有效的付费权益；Free 不落库。
        """
        subscription = await self.get_subscription_row(user_id, product_line)
        if (
            subscription
            and subscription.expires_at is not None
            and subscription.expires_at > timestamp_now()
        ):
            return subscription

        return UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=None,
        )

    async def get_subscription_row(
        self,
        user_id: int,
        product_line: str,
    ) -> UserSubscriptionModel | None:
        """按复合主键 (user_id, product_line) 读取原始订阅行，不过滤有效性。

        过期折算、Free 兜底等口径由调用方自行决定（admin profile 透出原始
        过期时间，get_user_subscription 折算为无权益占位）。
        """

        async with get_async_session() as db:
            # filter_by 传参形式：本模型的 .pyi 存根把列声明成普通类型，
            # `Model.col == x` 会被 mypy 视为 bool 而无法过链式 where。
            stmt = select(UserSubscriptionModel).filter_by(
                user_id=user_id,
                product_line=product_line,
            )
            result = await db.execute(stmt)
            return result.scalar_one_or_none()

    async def get_user_subscription_config(
        self,
        user_id: int,
        product_line: str = EXTENSION_PRODUCT_LINE,
    ) -> tuple[UserSubscriptionModel, SubscriptionProductConfig]:
        """
        获取用户订阅配置：有权益行时档位取行内 product_id（购买/续期时写入），
        无权益行或已过期统一按产品线 Free 档读取。

        Returns:
            (订阅记录, 订阅商品配置)
        """
        if user_id is None or user_id == 0:
            subscription = UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=0,
                product_line=product_line,
                expires_at=None,
            )
            return subscription, await self._get_subscription_product_config(
                product_line,
                FREE_SUBSCRIPTION_PRODUCT_ID,
            )

        subscription = await self.get_user_subscription(user_id, product_line)
        if subscription.expires_at is None:
            product_id = FREE_SUBSCRIPTION_PRODUCT_ID
        elif subscription.product_id:
            product_id = subscription.product_id
        elif product_line == EXTENSION_PRODUCT_LINE:
            # extension 线历史行/内存占位可能缺档位（product_id 列默认值仅在
            # 落库时生效），唯一付费档是 unlimited，回退它保持旧行为。
            product_id = UNLIMITED_ROW_PRODUCT_ID
        else:
            # 其余产品线档位必填；缺失让配置查找失败，按 unavailable 暴露。
            product_id = subscription.product_id or ""
        return subscription, await self._get_subscription_product_config(
            product_line,
            product_id,
        )

    async def _get_subscription_product_config(
        self,
        product_line: str,
        product_id: str,
    ) -> SubscriptionProductConfig:
        """按 (product_line, product_id) 精确读取启用配置，不加载支付渠道价格。

        每条产品线各有自己的 free 行：free 查找按线命中本线配置，不会误读
        其他线（如 maps 线不会误读 extension 线 free 的 monthly_quota）。
        """

        products = await payment_config_service.list_subscription_products()
        product = next(
            (
                item
                for item in products
                if item.product_line == product_line and item.product_id == product_id
            ),
            None,
        )
        if product is None:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription: enabled subscription product missing, "
                    f"product_line={product_line}, product_id={product_id}"
                ),
            )
        return product

    async def fulfill_paid_order(self, db: AsyncSession, order: OrderModel) -> None:
        """在订单 service 事务内完成订阅发货。

        Args:
            db: 订单 service 管理的事务 session。
            order: 已支付且 callback_status=PENDING 的订阅订单。
        """
        snapshot = self._order_product_snapshot(order)
        if snapshot.get("purpose") == SUBSCRIPTION_UPGRADE_PURPOSE:
            await self._fulfill_upgrade_in_session(db, order, snapshot)
            return
        auto_renew = snapshot.get("auto_renew")
        if not isinstance(auto_renew, bool):
            raise ValueError(
                "subscription_fulfillment: invalid auto_renew snapshot: "
                f"order_no={order.order_no}, auto_renew={auto_renew!r}"
            )
        if auto_renew:
            await self._fulfill_auto_renew_in_session(db, order, snapshot)
            return
        await self._fulfill_one_time_in_session(db, order, snapshot)

    async def _fulfill_upgrade_in_session(
        self,
        db: AsyncSession,
        order: OrderModel,
        snapshot: dict[str, object],
    ) -> None:
        """升级差额单履约：快照条件命中才换档，未命中报错转人工。

        单条原子 UPDATE 按 (user_id, product_line, product_id=源档,
        expires_at=base_expires_at, expires_at > now) 条件换档：订阅在支付
        等待期内被续费、加时或换档时旧快照不覆盖当前权益。命中时只写
        product_id 与 updated_at，到期时间、账期起点、渠道与续费快照保持；
        rowcount 未命中抛错，由订单 service 统一走履约失败/人工路径。
        """

        product_line = self._snapshot_product_line(order, snapshot)
        source_product_id = snapshot.get("source_product_id")
        target_product_id = snapshot.get("target_product_id")
        base_expires_at = snapshot.get("base_expires_at")
        if (
            not isinstance(source_product_id, str)
            or not source_product_id.strip()
            or not isinstance(target_product_id, str)
            or not target_product_id.strip()
            or type(base_expires_at) is not int
        ):
            raise ValueError(
                "subscription_fulfillment: invalid upgrade snapshot: "
                f"order_no={order.order_no}, user_id={order.user_id}, "
                f"snapshot={snapshot!r}"
            )
        now_ms = timestamp_now()
        stmt = (
            update(UserSubscriptionModel)
            .where(
                UserSubscriptionModel.user_id == order.user_id,
                UserSubscriptionModel.product_line == product_line,
                UserSubscriptionModel.product_id == source_product_id,
                UserSubscriptionModel.expires_at == base_expires_at,
                UserSubscriptionModel.expires_at > now_ms,
            )
            .values(product_id=target_product_id, updated_at=now_ms)
        )
        result = cast(CursorResult[Any], await db.execute(stmt))
        if result.rowcount != 1:
            raise ValueError(
                "subscription_fulfillment: upgrade condition missed, escalate "
                "for manual review: "
                f"order_no={order.order_no}, user_id={order.user_id}, "
                f"product_line={product_line}, "
                f"source_product_id={source_product_id}, "
                f"target_product_id={target_product_id}, "
                f"base_expires_at={base_expires_at}"
            )

    async def extend_subscription_days(
        self,
        *,
        user_id: int,
        duration_days: int,
        product_line: str = EXTENSION_PRODUCT_LINE,
        product_id: str = UNLIMITED_ROW_PRODUCT_ID,
    ) -> None:
        """在独立事务内按天延长指定产品线的订阅权益。"""

        async with get_async_session() as db:
            await self.extend_subscription_days_in_session(
                db,
                user_id=user_id,
                duration_days=duration_days,
                product_line=product_line,
                product_id=product_id,
            )
            await db.commit()

    async def extend_subscription_days_in_session(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        duration_days: int,
        product_line: str = EXTENSION_PRODUCT_LINE,
        product_id: str = UNLIMITED_ROW_PRODUCT_ID,
    ) -> None:
        """在调用方事务内用 MySQL 原子 upsert 按天延长权益。

        活动订阅从数据库当前到期时间继续累加；无记录、空到期时间或已过期
        均从本次执行时间开始计算，避免并发支付与赠送发生读改写覆盖。
        活动行的计费事实（续费快照、渠道引用、账期起点）原样保留；
        非活动行重置为新一次按天权益。
        """

        now_ms = timestamp_now()
        insert_expires_at = now_ms + self._duration_ms(duration_days)
        update_expires_at = self._renew_subscription_expires_at(
            now_ms,
            duration_days,
        )
        expires_at_col = cast(ColumnElement[int], UserSubscriptionModel.expires_at)
        was_active = expires_at_col > now_ms
        stmt = mysql_insert(UserSubscriptionModel).values(
            user_id=user_id,
            product_line=product_line,
            product_id=product_id,
            auto_renew=None,
            payment_method=None,
            channel_subscription_id=None,
            channel_uid=None,
            start_at=None,
            expires_at=insert_expires_at,
            created_at=now_ms,
            updated_at=now_ms,
        )
        stmt = stmt.on_duplicate_key_update(
            product_id=product_id,
            auto_renew=case((was_active, UserSubscriptionModel.auto_renew), else_=None),
            payment_method=case(
                (was_active, UserSubscriptionModel.payment_method), else_=None
            ),
            channel_subscription_id=case(
                (was_active, UserSubscriptionModel.channel_subscription_id), else_=None
            ),
            channel_uid=case(
                (was_active, UserSubscriptionModel.channel_uid), else_=None
            ),
            start_at=case((was_active, UserSubscriptionModel.start_at), else_=None),
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

        if period == SubscriptionPeriodEnum.NONE:
            raise ValueError(
                f"Unconfigured subscription period cannot be fulfilled: "
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
        """生成订阅订单购买选项快照，后续履约按快照续订。"""

        return json.dumps(
            {
                "product_snapshot": {
                    # gmap 特有：履约按 product_line 定位 (user_id, product_line) 行。
                    "product_line": checkout_config.product.product_line,
                    "product_price_id": checkout_config.price.id,
                    "auto_renew": checkout_config.product.auto_renew,
                    "period": checkout_config.product.period,
                    "currency": checkout_config.price.currency,
                    "amount": checkout_config.price.amount,
                    "provider_sku": checkout_config.price.provider_sku,
                }
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )

    def _upgrade_order_metadata_json(
        self,
        *,
        product_line: str,
        target_product: SubscriptionProductConfig,
        target_price: SubscriptionProductPriceConfig,
        source_product_id: str,
        base_expires_at: int,
        period_start: int,
        remaining_ratio: float,
        amount: int,
        currency: str,
    ) -> str:
        """生成升级差额订单快照：冻结折算输入供履约条件更新与人工审计。

        base_expires_at 是定价时刻的账期锚点，履约条件用它保证订阅在支付
        等待期内未被续费/加时/换档；upgrade_inputs 仅作审计，不参与履约。
        """

        return json.dumps(
            {
                "product_snapshot": {
                    # gmap 特有：履约按 product_line 定位 (user_id, product_line) 行。
                    "purpose": SUBSCRIPTION_UPGRADE_PURPOSE,
                    "product_line": product_line,
                    "product_price_id": target_price.id,
                    "auto_renew": False,
                    "period": target_product.period,
                    "currency": currency,
                    "amount": amount,
                    "provider_sku": target_price.provider_sku,
                    "source_product_id": source_product_id,
                    "target_product_id": target_product.product_id,
                    "base_expires_at": base_expires_at,
                    "upgrade_inputs": {
                        "period_start": period_start,
                        "remaining_ratio": remaining_ratio,
                    },
                }
            },
            ensure_ascii=False,
            separators=(",", ":"),
        )

    def _order_product_snapshot(self, order: OrderModel) -> dict[str, object]:
        """读取订阅订单购买选项快照，履约续期只依赖订单快照。"""

        metadata = self._load_order_metadata(order)
        snapshot = metadata.get("product_snapshot")
        if not isinstance(snapshot, dict):
            raise ValueError(
                "subscription_fulfillment: product_snapshot missing: "
                f"order_no={order.order_no}, user_id={order.user_id}"
            )
        self._parse_paid_period(snapshot.get("period"))
        return cast(dict[str, object], snapshot)

    def _snapshot_product_line(
        self, order: OrderModel, snapshot: dict[str, object]
    ) -> str:
        """读取快照产品线；历史订单快照缺字段时归入 extension 线（原行为）。"""

        product_line = snapshot.get("product_line")
        if isinstance(product_line, str) and product_line.strip():
            return product_line
        return EXTENSION_PRODUCT_LINE

    def _assert_order_product_id(self, order: OrderModel) -> str:
        """读取订单档位 SKU 快照。"""

        product_id = order.product_id
        if not isinstance(product_id, str) or not product_id.strip():
            raise ValueError(
                "subscription_fulfillment: invalid product_id: "
                f"order_no={order.order_no}, user_id={order.user_id}, "
                f"product_id={product_id!r}"
            )
        return product_id

    async def _fulfill_one_time_in_session(
        self,
        db: AsyncSession,
        order: OrderModel,
        snapshot: dict[str, object],
    ) -> None:
        """按购买选项自然月周期续期，并显式覆盖实例事实。

        start_at 写入本次账期起点（活动行从旧到期时间起算新账期，
        非活动行从当前时间起算），只供后续升级折算。
        """

        period = self._parse_paid_period(snapshot.get("period"))
        months = _PERIOD_MONTHS[period]
        product_line = self._snapshot_product_line(order, snapshot)
        product_id = self._assert_order_product_id(order)
        now_ms = timestamp_now()
        current = await db.get(UserSubscriptionModel, (order.user_id, product_line))
        base_expires_at = (
            current.expires_at
            if current is not None
            and current.expires_at is not None
            and current.expires_at > now_ms
            else now_ms
        )
        renewed_expires_at = add_natural_months(base_expires_at, months)
        stmt = mysql_insert(UserSubscriptionModel).values(
            user_id=order.user_id,
            product_line=product_line,
            product_id=product_id,
            auto_renew=False,
            payment_method=order.payment_method,
            channel_subscription_id=None,
            channel_uid=None,
            start_at=base_expires_at,
            expires_at=renewed_expires_at,
            created_at=now_ms,
            updated_at=now_ms,
        )
        stmt = stmt.on_duplicate_key_update(
            product_id=product_id,
            auto_renew=False,
            payment_method=order.payment_method,
            channel_subscription_id=None,
            channel_uid=None,
            start_at=base_expires_at,
            expires_at=renewed_expires_at,
            updated_at=now_ms,
        )
        await db.execute(stmt)

    async def _fulfill_auto_renew_in_session(
        self,
        db: AsyncSession,
        order: OrderModel,
        snapshot: dict[str, object],
    ) -> None:
        """只按 Provider 已归一化到期时间推进自动续费实例。

        advances 守卫：本地 expires_at 为空或早于渠道到期时间才推进，
        乱序回调不会回退权益；实例字段全部 case 保护，被旧事件覆盖时保持原值。

        档位保护（005）：行内 product_id 只在首购回调（provider_subscription
        的 original_order_no 等于当前履约订单号）时覆盖；续费/折算发票履约
        用的续费订单复制的是首购档快照，覆盖会把升级后的档位打回，因此
        续费履约只推进 expires_at 等账期事实。
        """

        # 快照 period 仅用于校验合法账期；实例不保存 period，账期由 expires_at 表达。
        self._parse_paid_period(snapshot.get("period"))
        product_line = self._snapshot_product_line(order, snapshot)
        product_id = self._assert_order_product_id(order)
        callback_metadata = self._load_order_metadata(order).get("payment_callback")
        provider_subscription = (
            callback_metadata.get("provider_subscription")
            if isinstance(callback_metadata, dict)
            else None
        )
        if not isinstance(provider_subscription, dict):
            raise ValueError(
                "subscription_fulfillment: provider subscription missing: "
                f"order_no={order.order_no}, payment_method={order.payment_method}"
            )
        start_at = provider_subscription.get("start_at")
        subscription_expires_at = provider_subscription.get("expires_at")
        subscription_id = provider_subscription.get("channel_subscription_id")
        if (
            type(subscription_expires_at) is not int
            or not isinstance(subscription_id, str)
            or not subscription_id
        ):
            raise ValueError(
                "subscription_fulfillment: invalid provider subscription: "
                f"order_no={order.order_no}, "
                f"provider_subscription={provider_subscription!r}"
            )
        covers_tier = provider_subscription.get("original_order_no") == order.order_no
        display_start_at = start_at if type(start_at) is int else None
        now_ms = timestamp_now()
        expires_at = cast(ColumnElement[int], UserSubscriptionModel.expires_at)
        advances = expires_at.is_(None) | (expires_at < subscription_expires_at)
        stmt = mysql_insert(UserSubscriptionModel).values(
            user_id=order.user_id,
            product_line=product_line,
            product_id=product_id,
            auto_renew=True,
            payment_method=order.payment_method,
            channel_subscription_id=subscription_id,
            channel_uid=order.payment_channel_uid,
            start_at=display_start_at,
            expires_at=subscription_expires_at,
            created_at=now_ms,
            updated_at=now_ms,
        )
        stmt = stmt.on_duplicate_key_update(
            product_id=(
                case((advances, product_id), else_=UserSubscriptionModel.product_id)
                if covers_tier
                # 续费/折算回调不覆盖档位，保持行内当前档（可能已被升级换档）。
                else UserSubscriptionModel.product_id
            ),
            auto_renew=case((advances, True), else_=UserSubscriptionModel.auto_renew),
            payment_method=case(
                (advances, order.payment_method),
                else_=UserSubscriptionModel.payment_method,
            ),
            channel_subscription_id=case(
                (advances, subscription_id),
                else_=UserSubscriptionModel.channel_subscription_id,
            ),
            channel_uid=case(
                (advances, order.payment_channel_uid),
                else_=UserSubscriptionModel.channel_uid,
            ),
            start_at=case(
                (advances, display_start_at),
                else_=UserSubscriptionModel.start_at,
            ),
            expires_at=case(
                (advances, subscription_expires_at),
                else_=expires_at,
            ),
            updated_at=case((advances, now_ms), else_=UserSubscriptionModel.updated_at),
        )
        await db.execute(stmt)

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
