"""订阅管理 API - 客户端接口。"""

from fastapi import APIRouter, Depends

from app.api.user_dependencies import (
    UserContext,
    get_current_user,
    get_current_user_if_authenticated,
    get_current_user_optional,
)
from app.constants.order import ProductClass
from app.constants.subscription import SubscriptionProductMetadata
from app.schemas.subscription_schema import (
    SubscriptionCheckoutConfigListResponse,
    SubscriptionReviewRewardClaimResponse,
    SubscriptionStatusResponse,
)
from app.services.payment_config_service import (
    SubscriptionCheckoutPlanConfig,
    payment_config_service,
)
from app.services.payment_service import payment_service
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.subscription_status_service import subscription_status_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/subscription", tags=["订阅管理"])


@router.get(
    "/checkout-configs",
    response_model=SubscriptionCheckoutConfigListResponse,
)
async def list_subscription_checkout_configs(
    current_user: UserContext | None = Depends(get_current_user_if_authenticated),
):
    """获取客户端订阅方案配置列表。"""
    checkout_plans = await payment_config_service.list_subscription_checkout_configs()

    # 好评赠送活动已下线（2026-09-02）：claim 接口直接拒绝，配置字段固定关闭态。
    review_reward_enabled = False
    claimed_count = 0

    return ResponseUtils.ok(
        {
            "checkout_configs": _serialize_checkout_plans(checkout_plans),
            "review_reward_enabled": review_reward_enabled,
            "review_reward_claimed_count": claimed_count,
        }
    )


@router.post(
    "/review-reward/claim",
    response_model=SubscriptionReviewRewardClaimResponse,
)
async def claim_subscription_review_reward(
    current_user: UserContext = Depends(get_current_user),
):
    """为严格登录账号领取一次 7 天好评赠送订阅。"""

    # 好评赠送活动已下线（2026-09-02）：入口与前端已删除，此处直接拒绝；
    # service 领取逻辑保留，活动重启时移除本段恢复。
    raise AppCommonException(CommonCode.INVALID_REQUEST)


def _serialize_checkout_plans(
    checkout_plans: list[SubscriptionCheckoutPlanConfig],
) -> list[dict[str, object]]:
    """序列化前端订阅方案配置。

    Args:
        checkout_plans: 支付配置服务返回的订阅方案快照。

    Returns:
        list[dict]: 包含全部产品线的启用商品（含 product_line 与 Maps 月度
        额度）；无可用渠道的方案保留空 payment_channels 后由调用方过滤。
    """

    response_plans: list[dict[str, object]] = []
    for plan in checkout_plans:
        metadata = SubscriptionProductMetadata.from_metadata(
            plan.product.metadata,
            product_id=plan.product.product_id,
            period=plan.product.period,
        )
        payment_channels = [
            {
                "payment_method": item.channel.channel_code,
                "payment_method_name": item.channel.channel_name,
                "currency": item.price.currency,
                "amount": item.price.amount,
                "provider_sku": item.price.provider_sku,
            }
            for item in plan.payment_channels
            if payment_service.is_supported_method(item.channel.channel_code)
        ]
        if not payment_channels:
            continue
        response_plans.append(
            {
                "product_class": ProductClass.SUBSCRIPTION.value,
                "product_id": plan.product.product_id,
                "product_line": plan.product.product_line,
                "product_name": plan.product.name,
                "period": plan.product.period,
                "duration_days": plan.product.duration_days,
                "display_currency": plan.product.display_currency,
                "display_amount": plan.product.display_amount,
                "auto_renew": metadata.auto_renew,
                "monthly_quota": metadata.monthly_quota,
                "payment_channels": payment_channels,
            }
        )

    return response_plans


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: UserContext = Depends(get_current_user_optional),
):
    """获取当前用户订阅状态

    支持已登录和未登录用户：
    - 已登录：返回当前订阅配置
    - 未登录：返回游客免费订阅（user_id=0）
    """

    data = await subscription_status_service.build_status_data(
        user_id=current_user.user_id,
    )
    return ResponseUtils.ok(data)
