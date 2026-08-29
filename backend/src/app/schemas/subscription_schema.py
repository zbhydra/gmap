"""订阅相关请求与响应数据模型。"""

from typing import Literal

from pydantic import BaseModel, Field


class SubscriptionCheckoutPaymentChannelItem(BaseModel):
    """订阅方案下单可用支付渠道。"""

    payment_method: str = Field(..., description="支付方式")
    payment_method_name: str = Field(..., description="支付方式展示名")
    currency: str = Field(..., description="货币类型")
    amount: int = Field(..., description="渠道金额，统一 6 位精度整数")
    provider_sku: str | None = Field(default=None, description="渠道侧商品标识")


class SubscriptionCheckoutPlanItem(BaseModel):
    """客户端订阅方案配置。"""

    product_class: int = Field(..., description="商品类别")
    product_id: str = Field(..., description="订阅商品ID")
    product_name: str = Field(..., description="订阅商品名称")
    period: str = Field(..., description="订阅周期")
    duration_days: int = Field(..., description="订阅天数")
    display_currency: str = Field(..., description="用户可见展示币种")
    display_amount: int = Field(..., description="用户可见展示金额，统一 6 位精度整数")
    daily_limit: int = Field(..., description="插件每日下载额度，-1 表示无限制")
    extension_daily_download_limit: int = Field(..., description="插件每日下载额度")
    auto_renew: bool = Field(..., description="是否自动续费")
    proxy_user_rate_limit_mb_per_second: float = Field(
        ..., description="用户代理下载限速，单位 MB/s"
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


class DailyQuotaStatus(BaseModel):
    """每日额度状态。"""

    use: int = Field(..., description="今日已用次数")
    remaining: int = Field(..., description="剩余额度，-1 表示无限制")
    limit: int = Field(..., description="每日额度上限，-1 表示无限制")


class SubscriptionStatusData(BaseModel):
    """订阅状态响应 data。"""

    status: str = Field(default="active", description="订阅状态，active 或 unavailable")
    period: str = Field(..., description="订阅周期")
    display_name: str = Field(..., description="订阅显示名称")
    expires_at: int | None = Field(None, description="过期时间（毫秒时间戳）")
    daily_limit: int = Field(..., description="每日下载限制（-1 表示无限制）")
    used: int = Field(..., description="今日已用次数")
    remaining: int = Field(..., description="剩余配额（-1 表示无限制）")
    extension_download: DailyQuotaStatus = Field(..., description="插件下载每日额度")
    reset_date: str = Field(..., description="重置日期（YYYY-MM-DD）")
    auto_renew: bool = Field(..., description="是否自动续费")


class ExtensionSubscriptionStatusData(SubscriptionStatusData):
    """插件订阅状态响应 data。"""

    telegram_feedback_url: str = Field(
        default="",
        description="Telegram 反馈群链接；空字符串表示不展示入口",
    )
    telegram_feedback_group_username: str = Field(
        default="",
        description="Telegram 反馈群公开用户名；空字符串表示不展示网页链接",
    )


class SubscriptionStatusResponse(BaseModel):
    """订阅状态响应"""

    code: int = Field(..., description="业务响应码")
    data: ExtensionSubscriptionStatusData = Field(..., description="插件订阅状态")
    msg: str = Field(..., description="响应消息")
