"""订阅相关请求与响应数据模型。"""

from typing import Literal

from pydantic import BaseModel, Field

from app.provider.payment.payment_base import (
    SubscriptionUpdateAction,
    SubscriptionUpdateStatus,
)


class SubscriptionCheckoutPaymentChannelItem(BaseModel):
    """订阅方案下单可用支付渠道。"""

    payment_method: str = Field(..., description="支付方式")
    payment_method_name: str = Field(..., description="支付方式展示名")
    product_price_id: int = Field(..., description="购买选项 ID")
    currency: str = Field(..., description="货币类型")
    amount: int = Field(..., description="渠道金额，统一 6 位精度整数")


class SubscriptionCheckoutPlanItem(BaseModel):
    """客户端订阅方案配置。"""

    product_class: int = Field(..., description="商品类别")
    product_id: str = Field(..., description="订阅商品ID")
    product_line: str = Field(..., description="订阅产品线")
    product_name: str = Field(..., description="订阅商品名称")
    period: Literal["month", "quarter", "year"] = Field(
        ..., description="商业与权益周期"
    )
    auto_renew: bool = Field(..., description="是否由渠道自动续费")
    display_currency: str = Field(..., description="商品卡默认展示币种")
    display_amount: int = Field(
        ..., description="商品卡默认展示金额，统一 6 位精度整数"
    )
    monthly_quota: int | None = Field(
        default=None,
        description="月度权益额度数；单位由产品线定义（records/requests），无额度概念为空",
    )
    payment_channels: list[SubscriptionCheckoutPaymentChannelItem] = Field(
        ..., description="该订阅方案支持的支付渠道列表"
    )


class SubscriptionCheckoutConfigListData(BaseModel):
    """客户端订阅方案配置列表 data。"""

    checkout_configs: list[SubscriptionCheckoutPlanItem]
    review_reward_enabled: bool = Field(..., description="是否开放好评赠送活动")
    review_reward_claimed_count: int = Field(..., description="好评赠送永久领取次数")


class SubscriptionCheckoutConfigListResponse(BaseModel):
    """客户端订阅方案配置列表响应。"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionCheckoutConfigListData = Field(..., description="订阅方案列表")
    msg: str = Field(..., description="响应消息")


class SubscriptionReviewRewardClaimData(BaseModel):
    """好评赠送领取结果 data。"""

    result: Literal["granted", "already_claimed"] = Field(
        ..., description="本次已赠送或此前已领取"
    )
    review_reward_claimed_count: int = Field(..., description="当前永久领取次数")


class SubscriptionReviewRewardClaimResponse(BaseModel):
    """好评赠送领取响应。"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionReviewRewardClaimData = Field(..., description="领取结果")
    msg: str = Field(..., description="响应消息")


class SubscriptionStatusData(BaseModel):
    """订阅状态响应 data。"""

    status: str = Field(default="active", description="订阅状态，active 或 unavailable")
    period: str = Field(
        ..., description="订阅周期：free / month / quarter / year / unavailable"
    )
    display_name: str = Field(..., description="订阅显示名称")
    expires_at: int | None = Field(None, description="过期时间（毫秒时间戳）")
    auto_renew: bool = Field(..., description="当前订阅是否为渠道自动续费")
    payment_method: str | None = Field(None, description="当前订阅支付渠道")


class SubscriptionStatusResponse(BaseModel):
    """订阅状态响应"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionStatusData = Field(..., description="订阅状态")
    msg: str = Field(..., description="响应消息")


class SubscriptionUpgradeQuoteData(BaseModel):
    """订阅升级报价 data。

    amount：一次性线补差或 Clink preview 净差额（6 位精度整数）；
    PayPal 自动续费线为空。expires_at 仅可升级时返回（到期日不变）。
    """

    available: bool = Field(..., description="是否可升级")
    reason: str | None = Field(
        default=None,
        description=(
            "不可升级原因：no_active_subscription / not_higher_tier / "
            "non_positive_diff / channel_unavailable；可升级时为空"
        ),
    )
    current_product_id: str | None = Field(
        default=None, description="当前档；无有效订阅时为空"
    )
    target_product_id: str = Field(..., description="目标档")
    payment_method: str | None = Field(default=None, description="当前订阅渠道")
    currency: str | None = Field(default=None, description="当前订阅渠道的币种")
    amount: int | None = Field(
        default=None, description="补差金额，统一 6 位精度整数；不可折算时为空"
    )
    expires_at: int | None = Field(
        default=None, description="升级后到期时间（毫秒时间戳）；到期日不变"
    )


class SubscriptionUpgradeQuoteResponse(BaseModel):
    """订阅升级报价响应。"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionUpgradeQuoteData = Field(..., description="升级报价")
    msg: str = Field(..., description="响应消息")


class SubscriptionUpgradeCheckoutRequest(BaseModel):
    """订阅升级请求（一次性线下单与自动续费线确认共用请求体）。

    渠道与金额由服务端按当前订阅行实时判定，客户端不可指定。
    """

    product_line: str = Field(
        ..., min_length=1, max_length=32, description="订阅产品线"
    )
    target_product_id: str = Field(
        ..., min_length=1, max_length=64, description="目标档商品 ID"
    )


class SubscriptionUpgradeConfirmData(BaseModel):
    """等待或跳转时不换档；客户端读 quote.current_product_id 等待 webhook 收敛。"""

    status: SubscriptionUpdateStatus
    action: SubscriptionUpdateAction | None = None


class SubscriptionUpgradeConfirmResponse(BaseModel):
    """订阅升级 confirm 响应。"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionUpgradeConfirmData = Field(..., description="换价确认结果")
    msg: str = Field(..., description="响应消息")


class SubscriptionManagementRequest(BaseModel):
    """订阅渠道管理入口请求。"""

    product_line: str = Field(
        ..., min_length=1, max_length=32, description="订阅产品线"
    )


class SubscriptionManagementData(BaseModel):
    """订阅渠道管理入口 data。"""

    url: str | None = Field(None, description="渠道 Web 管理入口；为空时使用客户端指引")


class SubscriptionManagementResponse(BaseModel):
    """订阅渠道管理入口响应。"""

    code: int = Field(..., description="业务响应码")
    data: SubscriptionManagementData = Field(..., description="渠道管理入口")
    msg: str = Field(..., description="响应消息")
