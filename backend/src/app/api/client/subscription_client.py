"""订阅管理 API - 客户端接口。"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.api.user_dependencies import (
    UserContext,
    get_current_user,
    get_current_user_if_authenticated,
    get_current_user_optional,
)
from app.constants.order import ProductClass
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    SUBSCRIPTION_PRODUCT_LINES,
    SubscriptionProductMetadata,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.order_schema import CreateOrderApiResponse
from app.schemas.subscription_schema import (
    SubscriptionCheckoutConfigListResponse,
    SubscriptionManagementRequest,
    SubscriptionManagementResponse,
    SubscriptionReviewRewardClaimResponse,
    SubscriptionStatusResponse,
    SubscriptionUpgradeCheckoutRequest,
    SubscriptionUpgradeConfirmResponse,
    SubscriptionUpgradeQuoteResponse,
)
from app.services.order_service import order_service
from app.services.payment_config_service import (
    SubscriptionCheckoutPlanConfig,
    payment_config_service,
)
from app.services.payment_service import payment_service
from app.services.subscription_service import subscription_service
from app.services.subscription_status_service import subscription_status_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/subscription", tags=["订阅管理"])


@router.get(
    "/checkout-configs",
    response_model=SubscriptionCheckoutConfigListResponse,
)
async def list_subscription_checkout_configs(
    current_user: UserContext | None = Depends(get_current_user_if_authenticated),
) -> JSONResponse:
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
) -> JSONResponse:
    """为严格登录账号领取一次 7 天好评赠送订阅。"""

    # 好评赠送活动已下线（2026-09-02）：入口与前端已删除，此处直接拒绝；
    # service 领取逻辑保留，活动重启时移除本段恢复。
    raise AppCommonException(CommonCode.INVALID_REQUEST)


@router.post(
    "/management",
    response_model=SubscriptionManagementResponse,
)
async def create_subscription_management(
    data: SubscriptionManagementRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """创建当前登录账号在指定产品线的自动续费订阅管理入口。

    请求只携带 product_line；渠道订阅 ID 和客户 ID 由后端从有效实例读取。
    返回的 URL 可为空：为空时客户端展示渠道内路径指引（如 Telegram Stars）。
    """

    product_line = data.product_line
    if product_line not in SUBSCRIPTION_PRODUCT_LINES:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "create_subscription_management: unknown product_line: "
                f"product_line={product_line}"
            ),
        )

    url = await subscription_service.create_management_url(
        current_user.user_id,
        product_line,
    )
    return ResponseUtils.ok({"url": url})


@router.get(
    "/upgrade-quote",
    response_model=SubscriptionUpgradeQuoteResponse,
)
async def get_subscription_upgrade_quote(
    product_line: str = Query(..., min_length=1, max_length=32),
    target_product_id: str = Query(..., min_length=1, max_length=64),
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """获取当前登录用户指定产品线升级到目标档的实时报价。

    可升级判定与金额计算全部在 subscription_service 内完成；无可升级时
    返回 available=false + reason（不作为业务错误码）。
    """

    if product_line not in SUBSCRIPTION_PRODUCT_LINES:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "get_subscription_upgrade_quote: unknown product_line: "
                f"product_line={product_line}"
            ),
        )

    data = await subscription_service.get_upgrade_quote(
        user_id=current_user.user_id,
        product_line=product_line,
        target_product_id=target_product_id,
    )
    return ResponseUtils.ok(data)


@router.post(
    "/upgrade/checkout",
    response_model=CreateOrderApiResponse,
)
async def checkout_subscription_upgrade(
    data: SubscriptionUpgradeCheckoutRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """一次性线升级差额下单：服务端定价创建订单并返回既有支付数据。

    可升级判定、定价与快照冻结在 subscription_service 内完成；渠道固定为
    当前订阅行 payment_method，客户端不可指定渠道或金额。响应与通用订单
    创建同形（CreateOrderResponse），前端复用统一 order-checkout 弹窗完成
    支付与轮询；订单创建与支付入口装配由 order_service 共享方法完成。
    """

    product_line = data.product_line
    if product_line not in SUBSCRIPTION_PRODUCT_LINES:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "checkout_subscription_upgrade: unknown product_line: "
                f"product_line={product_line}"
            ),
        )

    create_param = await subscription_service.prepare_upgrade_checkout_param(
        user_id=current_user.user_id,
        product_line=product_line,
        target_product_id=data.target_product_id,
        client_ip=current_user.ip or current_user.device_id,
        language=current_user.language,
    )
    response_data = await order_service.create_order_with_payment(create_param)
    return ResponseUtils.ok(response_data)


@router.post(
    "/upgrade/confirm",
    response_model=SubscriptionUpgradeConfirmResponse,
)
async def confirm_subscription_upgrade(
    data: SubscriptionUpgradeCheckoutRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """自动续费换档返回统一 status/action。

    渠道与金额按当前订阅实例判定；需要动作时客户端等待或跳转，
    轮询 quote.current_product_id 等待 webhook 收敛，不重复 confirm。
    """

    product_line = data.product_line
    if product_line not in SUBSCRIPTION_PRODUCT_LINES:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "confirm_subscription_upgrade: unknown product_line: "
                f"product_line={product_line}"
            ),
        )

    result = await subscription_service.confirm_upgrade(
        user_id=current_user.user_id,
        product_line=product_line,
        target_product_id=data.target_product_id,
    )
    return ResponseUtils.ok(result)


def _serialize_checkout_plans(
    checkout_plans: list[SubscriptionCheckoutPlanConfig],
) -> list[dict[str, object]]:
    """序列化前端订阅方案配置。

    Args:
        checkout_plans: 支付配置服务返回的订阅方案快照。

    Returns:
        list[dict]: 包含全部产品线的可售商品（含 product_line 与 Maps 月度
        额度）；auto_renew 为商品级单一计费模式。
    """

    response_plans: list[dict[str, object]] = []
    for plan in checkout_plans:
        metadata = SubscriptionProductMetadata.from_metadata(
            plan.product.metadata,
            product_id=plan.product.product_id,
        )
        response_plans.append(
            {
                "product_class": ProductClass.SUBSCRIPTION.value,
                "product_id": plan.product.product_id,
                "product_line": plan.product.product_line,
                "product_name": plan.product.name,
                "period": plan.product.period,
                "auto_renew": plan.product.auto_renew,
                "display_currency": plan.product.display_currency,
                "display_amount": plan.product.display_amount,
                "monthly_quota": metadata.monthly_quota,
                "payment_channels": [
                    {
                        "payment_method": item.channel.channel_code,
                        "payment_method_name": item.channel.channel_name,
                        "product_price_id": item.price.id,
                        "currency": item.price.currency,
                        "amount": item.price.amount,
                    }
                    for item in plan.payment_channels
                    if payment_service.is_supported_method(item.channel.channel_code)
                ],
            }
        )

    return response_plans


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: UserContext = Depends(get_current_user_optional),
    product_line: str | None = Query(
        default=None,
        description="订阅产品线；缺省为 extension（历史单产品线，旧调用方行为不变）",
    ),
) -> JSONResponse:
    """获取当前用户订阅状态

    支持已登录和未登录用户：
    - 已登录：返回当前订阅配置
    - 未登录：返回游客免费订阅（user_id=0）

    product_line 用于多产品线客户端按线查询（MapsGrab 插件传
    maps_extension）；值必须在 SUBSCRIPTION_PRODUCT_LINES 白名单内。
    """

    if product_line is not None and product_line not in SUBSCRIPTION_PRODUCT_LINES:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "get_subscription_status: unknown product_line: "
                f"product_line={product_line}"
            ),
        )

    data = await subscription_status_service.build_status_data(
        user_id=current_user.user_id,
        product_line=product_line or EXTENSION_PRODUCT_LINE,
    )
    return ResponseUtils.ok(data)
