"""Telegram Bot webhook 回调数据结构。

本模块只建模支付链路需要的 Telegram Update 字段：
pre_checkout_query 用于付款前确认，message.successful_payment 用于付款成功兑现。
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TelegramUser(BaseModel):
    """Telegram 用户快照。"""

    id: int = Field(..., description="Telegram 用户 ID")
    is_bot: bool = Field(default=False, description="是否为 Bot")
    first_name: str | None = Field(default=None, description="名")
    last_name: str | None = Field(default=None, description="姓")
    username: str | None = Field(default=None, description="用户名")
    language_code: str | None = Field(default=None, description="客户端语言")


class TelegramChat(BaseModel):
    """Telegram 会话快照。"""

    id: int = Field(..., description="Telegram 会话 ID")
    type: str = Field(..., description="会话类型")
    title: str | None = Field(default=None, description="群组或频道标题")
    username: str | None = Field(default=None, description="会话用户名")
    first_name: str | None = Field(default=None, description="私聊用户名")
    last_name: str | None = Field(default=None, description="私聊用户姓")


class TelegramPreCheckoutQuery(BaseModel):
    """Telegram 支付确认前查询。"""

    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="pre_checkout_query ID")
    from_user: TelegramUser = Field(..., alias="from", description="付款用户")
    currency: str = Field(..., description="币种，Stars 为 XTR")
    total_amount: int = Field(..., description="总金额，XTR 下为 Stars 数量")
    invoice_payload: str = Field(
        ..., description="createInvoiceLink 写入的订单 payload"
    )


class TelegramSuccessfulPayment(BaseModel):
    """Telegram 支付成功消息。"""

    currency: str = Field(..., description="币种，Stars 为 XTR")
    total_amount: int = Field(..., description="总金额，XTR 下为 Stars 数量")
    invoice_payload: str = Field(
        ..., description="createInvoiceLink 写入的订单 payload"
    )
    telegram_payment_charge_id: str = Field(..., description="Telegram 支付流水号")
    provider_payment_charge_id: str | None = Field(
        default=None,
        description="支付服务商流水号；Stars 支付通常不依赖该字段",
    )
    subscription_expiration_date: int | None = Field(
        default=None,
        description="Telegram 原生订阅过期秒级时间戳",
    )
    is_recurring: Literal[True] | None = Field(
        default=None,
        description="循环支付时为 true，否则 Telegram 不返回该字段",
    )
    is_first_recurring: Literal[True] | None = Field(
        default=None,
        description="首笔循环支付时为 true，后续续费时 Telegram 不返回该字段",
    )


class TelegramMessage(BaseModel):
    """Telegram 消息。"""

    model_config = ConfigDict(populate_by_name=True)

    message_id: int = Field(..., description="消息 ID")
    from_user: TelegramUser | None = Field(
        default=None,
        alias="from",
        description="发送者",
    )
    chat: TelegramChat | None = Field(default=None, description="会话")
    date: int = Field(..., description="消息秒级时间戳")
    text: str | None = Field(default=None, description="消息文本")
    successful_payment: TelegramSuccessfulPayment | None = Field(
        default=None,
        description="支付成功信息",
    )


class TelegramWebhookUpdate(BaseModel):
    """Telegram Bot webhook Update。"""

    update_id: int = Field(..., description="Telegram Update ID")
    message: TelegramMessage | None = Field(default=None, description="普通消息")
    pre_checkout_query: TelegramPreCheckoutQuery | None = Field(
        default=None,
        description="支付确认前查询",
    )
