"""Telegram Stars 支付 provider。

职责：
1. 用订单快照创建 Telegram invoice link。
2. 处理 Telegram pre_checkout_query 并调用 answerPreCheckoutQuery。
3. 校验 successful_payment，返回订单成功入口需要的支付结果。
"""

import json
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx
from fastapi import Request

from app.constants.order import OrderStatus
from app.constants.payment import (
    TELEGRAM_STARS_AMOUNT_UNIT,
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
    payment_currency_matches_channel,
)
from app.core.config import settings
from app.i18n.dependencies import DEFAULT_LANGUAGE, LANGUAGE_MAPPING
from app.i18n.translator import translator
from app.models.order_model import OrderModel
from app.provider.payment.payment_base import (
    AfterOrderSuccessContext,
    AfterOrderSuccessResult,
    CallbackVerificationResult,
    PaymentBase,
    PaymentProviderError,
    PaymentRequest,
    RecurringPaymentReference,
)
from app.schemas.telegram_callback_schema import (
    TelegramMessage,
    TelegramPreCheckoutQuery,
    TelegramSuccessfulPayment,
    TelegramUser,
    TelegramWebhookUpdate,
)
from app.services.config_public_service import config_public_service
from app.services.order_service import order_service
from app.utils.logger import logger
from app.utils.time import timestamp_now

_SECRET_HEADER = "x-telegram-bot-api-secret-token"
_PURCHASE_SUPPORT_COMMANDS = {"/support", "/paysupport"}
# Bot 支持命令与 Website 下单响应共用同一公共配置键。
_SUPPORT_MAIL_CONFIG_KEY = "support_mail"
# 项目不支持自建 Bot API Server，固定官方根地址避免渠道配置分叉。
_TELEGRAM_BOT_API_BASE_URL = "https://api.telegram.org"
_TELEGRAM_STARS_PRODUCTION_ENVIRONMENT = "production"
_TELEGRAM_STARS_TEST_ENVIRONMENT = "test"
_TELEGRAM_STARS_SUBSCRIPTION_PERIOD_SECONDS_BY_ENVIRONMENT = {
    _TELEGRAM_STARS_PRODUCTION_ENVIRONMENT: 2_592_000,
    # Telegram Test DC only accepts accelerated subscription periods.
    _TELEGRAM_STARS_TEST_ENVIRONMENT: 60,
}
_TELEGRAM_STARS_SUBSCRIPTION_MAX_AMOUNT = 10_000


@dataclass(frozen=True, slots=True)
class TelegramStarsProviderConfig:
    """Telegram Stars provider 运行配置。"""

    environment: str
    token: str
    webhook_secret_token: str
    request_timeout_seconds: float

    @property
    def subscription_period_seconds(self) -> int:
        """返回当前 Telegram 环境要求的订阅周期。"""

        return _TELEGRAM_STARS_SUBSCRIPTION_PERIOD_SECONDS_BY_ENVIRONMENT[
            self.environment
        ]

    def bot_api_url(self, method: str) -> str:
        """返回当前 Telegram 环境的 Bot API 方法 URL。"""

        return self._build_bot_api_url(method=method, token=self.token)

    def masked_bot_api_url(self, method: str) -> str:
        """返回隐藏 Bot token、可安全写入日志的 Bot API 方法 URL。"""

        return self._build_bot_api_url(method=method, token="***")

    def _build_bot_api_url(self, *, method: str, token: str) -> str:
        """按 production / Test DC 的路径规则拼接 Bot API URL。"""

        environment_path = (
            "/test" if self.environment == _TELEGRAM_STARS_TEST_ENVIRONMENT else ""
        )
        return f"{_TELEGRAM_BOT_API_BASE_URL}/bot{token}{environment_path}/{method}"


class TgStarPaymentProvider(PaymentBase):
    """Telegram Stars 支付 provider。"""

    provider_name = TELEGRAM_STARS_PAYMENT_METHOD

    def __init__(self, config: dict[str, object] | None = None) -> None:
        self.config = self._parse_provider_config(config)

    @staticmethod
    def _parse_provider_config(
        config: dict[str, object] | None,
        *,
        context: str = "tg_star.parse_provider_config",
    ) -> TelegramStarsProviderConfig:
        """从渠道配置 JSON 解析 Telegram Stars provider 所需字段。"""

        if config is None:
            raise PaymentProviderError(
                f"{context}: telegram_stars config must be object, got null"
            )
        if not isinstance(config, dict):
            raise PaymentProviderError(
                f"{context}: telegram_stars config must be object, "
                f"got {type(config).__name__}"
            )

        environment = TgStarPaymentProvider._required_environment(
            config,
            context=context,
        )
        token = TgStarPaymentProvider._required_string_field(
            config,
            "token",
            context=context,
        )
        webhook_secret_token = TgStarPaymentProvider._required_string_field(
            config,
            "webhook_secret_token",
            context=context,
        )
        request_timeout_seconds = TgStarPaymentProvider._required_positive_timeout(
            config,
            "request_timeout_seconds",
            context=context,
        )
        return TelegramStarsProviderConfig(
            environment=environment,
            token=token,
            webhook_secret_token=webhook_secret_token,
            request_timeout_seconds=request_timeout_seconds,
        )

    @staticmethod
    def _required_environment(
        config: dict[str, object],
        *,
        context: str,
    ) -> str:
        """读取 Telegram API 环境并拒绝隐式选择生产或 Test DC。"""

        environment = TgStarPaymentProvider._required_string_field(
            config,
            "environment",
            context=context,
        ).lower()
        if (
            environment
            not in _TELEGRAM_STARS_SUBSCRIPTION_PERIOD_SECONDS_BY_ENVIRONMENT
        ):
            allowed = ", ".join(
                _TELEGRAM_STARS_SUBSCRIPTION_PERIOD_SECONDS_BY_ENVIRONMENT
            )
            raise PaymentProviderError(
                f"{context}: telegram_stars config field environment "
                f"must be one of {allowed}, got {environment}"
            )
        return environment

    @staticmethod
    def _required_string_field(
        config: dict[str, object],
        field: str,
        *,
        context: str,
    ) -> str:
        """读取必填字符串字段。"""

        value = config.get(field)
        if not isinstance(value, str) or not value.strip():
            raise PaymentProviderError(
                f"{context}: telegram_stars config field {field} "
                "must be a non-empty string"
            )
        return value.strip()

    @staticmethod
    def _normalize_required_http_url(
        value: str,
        field: str,
        *,
        context: str,
    ) -> str:
        """规范化必填 HTTP/HTTPS URL。"""

        normalized = value.rstrip("/")
        parsed = urlparse(normalized)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise PaymentProviderError(
                f"{context}: telegram_stars config field {field} "
                "must be an http or https URL"
            )
        return normalized

    @staticmethod
    def _required_positive_timeout(
        config: dict[str, object],
        field: str,
        *,
        context: str,
    ) -> float:
        """读取必填正数超时时间。"""

        value = config.get(field)
        if isinstance(value, bool) or not isinstance(value, int | float) or value <= 0:
            raise PaymentProviderError(
                f"{context}: telegram_stars config field {field} "
                "must be a positive number"
            )
        return float(value)

    def _redact_secret_text(self, text: object) -> str:
        """脱敏 Telegram Bot token 和 webhook secret，避免日志暴露完整密钥。"""

        rendered = str(text)
        for secret in (self.config.token, self.config.webhook_secret_token):
            rendered = rendered.replace(secret, "***")
        return rendered

    async def create_subscription_management_url(
        self,
        *,
        channel_uid: str | None,
        return_url: str,
    ) -> str | None:
        """Telegram Stars 没有 Hosted Web Portal，由客户端展示渠道内路径。"""

        return None

    async def create_payment(self, request: PaymentRequest) -> dict[str, object]:
        """创建 Telegram invoice link。"""
        self._validate_payment_request(request)
        payload: dict[str, object] = {
            "title": request.product_name,
            "description": request.product_name,
            "payload": request.order_no,
            "currency": TELEGRAM_STARS_CURRENCY,
            "prices": [
                {
                    "label": request.product_name,
                    "amount": self._stars_amount_from_internal_amount(
                        request.amount,
                        context=f"tg_star.create_payment: order_no={request.order_no}",
                    ),
                }
            ],
        }
        if request.auto_renew:
            self._validate_stars_subscription_invoice(request)
            payload["subscription_period"] = self.config.subscription_period_seconds

        data = await self._post_bot_api("createInvoiceLink", payload)
        result = data.get("result")
        if not isinstance(result, str) or not result:
            raise PaymentProviderError(
                f"Telegram Bot API createInvoiceLink returned invalid result: {data}"
            )
        return {"payment_url": result, "url": result}

    async def cancel_subscription(
        self,
        *,
        channel_uid: str,
        subscription_charge_id: str,
    ) -> None:
        """取消 Telegram Stars 订阅的后续自动扣款。

        Args:
            channel_uid: successful_payment 对应的 Telegram 用户 ID。
            subscription_charge_id: 该订阅的 telegram_payment_charge_id。
        """

        try:
            user_id = int(channel_uid)
        except ValueError as exc:
            raise PaymentProviderError(
                "tg_star.cancel_subscription: invalid Telegram user id: "
                f"channel_uid={channel_uid!r}, "
                f"subscription_charge_id={subscription_charge_id!r}"
            ) from exc
        charge_id = subscription_charge_id.strip()
        if not charge_id:
            raise PaymentProviderError(
                "tg_star.cancel_subscription: Telegram subscription charge id is empty: "
                f"channel_uid={channel_uid!r}"
            )

        data = await self._post_bot_api(
            "editUserStarSubscription",
            {
                "user_id": user_id,
                "telegram_payment_charge_id": charge_id,
                "is_canceled": True,
            },
        )
        if data.get("result") is not True:
            raise PaymentProviderError(
                "tg_star.cancel_subscription: Telegram Bot API returned an "
                "invalid cancellation result: "
                f"channel_uid={channel_uid!r}, "
                f"subscription_charge_id={charge_id!r}, "
                f"response={self._redact_secret_text(data)}"
            )

    async def verify_callback(self, request: Request) -> CallbackVerificationResult:
        """校验 Telegram webhook。"""
        self._check_webhook_secret(request.headers.get(_SECRET_HEADER))
        body = await request.body()
        update = TelegramWebhookUpdate.model_validate_json(body)

        if update.pre_checkout_query is not None:
            return await self._handle_pre_checkout_query(update.pre_checkout_query)

        if update.message and update.message.successful_payment:
            return await self._handle_successful_payment(
                update.message.successful_payment,
                update.message.from_user,
            )

        if update.message and update.message.text:
            command_result = await self._handle_bot_command(update.message)
            if command_result is not None:
                return command_result

        logger.info(f"Telegram webhook ignored update_id={update.update_id}")
        return CallbackVerificationResult(
            valid=False,
            processed=False,
            event="ignored",
            provider_data={"update_id": update.update_id},
        )

    def _validate_payment_request(self, request: PaymentRequest) -> None:
        """确认订单快照可用于创建 Telegram Stars invoice。"""
        if request.payment_method != TELEGRAM_STARS_PAYMENT_METHOD:
            raise PaymentProviderError(
                f"Telegram create invoice payment method mismatch: "
                f"order_no={request.order_no}, payment_method={request.payment_method}"
            )
        if not payment_currency_matches_channel(
            request.payment_method, request.currency
        ):
            raise PaymentProviderError(
                f"Telegram create invoice currency mismatch: "
                f"order_no={request.order_no}, currency={request.currency}"
            )
        if request.order_status != OrderStatus.PENDING.value:
            raise PaymentProviderError(
                f"Telegram create invoice order is not pending: "
                f"order_no={request.order_no}, status={request.order_status}"
            )
        if request.expired_at <= timestamp_now():
            raise PaymentProviderError(
                f"Telegram create invoice order expired: order_no={request.order_no}"
            )
        self._stars_amount_from_internal_amount(
            request.amount,
            context=f"tg_star._validate_payment_request: order_no={request.order_no}",
        )

    def _validate_stars_subscription_invoice(self, request: PaymentRequest) -> None:
        """确认 Telegram Stars 自动续费 invoice 符合 Bot API 当前限制。"""
        stars_amount = self._stars_amount_from_internal_amount(
            request.amount,
            context=(
                "tg_star._validate_stars_subscription_invoice: "
                f"order_no={request.order_no}"
            ),
        )
        if stars_amount > _TELEGRAM_STARS_SUBSCRIPTION_MAX_AMOUNT:
            raise PaymentProviderError(
                "tg_star._validate_stars_subscription_invoice: "
                "Telegram Stars subscription amount exceeds Bot API limit: "
                f"order_no={request.order_no}, stars_amount={stars_amount}, "
                f"max_amount={_TELEGRAM_STARS_SUBSCRIPTION_MAX_AMOUNT}"
            )

    def _stars_amount_from_internal_amount(self, amount: int, *, context: str) -> int:
        """把 6 位精度内部金额转换为 Telegram Stars 整数。"""

        if amount < 0:
            raise PaymentProviderError(
                f"{context}: Telegram Stars amount must be non-negative: "
                f"amount={amount}"
            )
        if amount % TELEGRAM_STARS_AMOUNT_UNIT != 0:
            raise PaymentProviderError(
                f"{context}: Telegram Stars amount must be a whole Star: "
                f"amount={amount}"
            )
        return amount // TELEGRAM_STARS_AMOUNT_UNIT

    def _internal_amount_from_stars_amount(self, stars_amount: int) -> int:
        """把 Telegram Stars 整数金额转换为 6 位精度内部金额。"""

        return stars_amount * TELEGRAM_STARS_AMOUNT_UNIT

    def _check_webhook_secret(self, secret_token: str | None) -> None:
        """校验 Telegram webhook secret header。"""
        if secret_token is None or secret_token != self.config.webhook_secret_token:
            raise PaymentProviderError(
                "tg_star._check_webhook_secret: Telegram webhook secret token "
                "missing or mismatch"
            )

    async def _handle_pre_checkout_query(
        self,
        query: TelegramPreCheckoutQuery,
    ) -> CallbackVerificationResult:
        """处理付款前确认查询。"""
        ok, error_message, order = await self._validate_pre_checkout_query(query)
        await self._answer_pre_checkout_query(
            pre_checkout_query_id=query.id,
            ok=ok,
            error_message=error_message,
        )

        return CallbackVerificationResult(
            valid=False,
            processed=True,
            event="pre_checkout_query",
            order_no=order.order_no if order else query.invoice_payload,
            provider_data={"ok": ok},
            error_message=error_message,
        )

    async def _handle_bot_command(
        self,
        message: TelegramMessage,
    ) -> CallbackVerificationResult | None:
        """处理 Telegram Bot 购买相关说明命令。"""
        command = self._extract_bot_command(message.text)
        if command is None:
            return None
        chat_id = self._message_reply_chat_id(message)
        if chat_id is None:
            raise PaymentProviderError(
                f"Telegram bot command reply target missing: command={command}, "
                f"message_id={message.message_id}"
            )

        if command == "/terms":
            text = self._terms_message()
        elif command in _PURCHASE_SUPPORT_COMMANDS:
            text = await self._support_message()
        else:
            return None

        await self._send_message(chat_id=chat_id, text=text)
        return CallbackVerificationResult(
            valid=False,
            processed=True,
            event="bot_command",
            provider_data={"command": command},
        )

    def _extract_bot_command(self, text: str | None) -> str | None:
        """提取 Telegram `/command`，兼容群聊里的 `/command@botname`。"""
        if not text:
            return None
        command_token = text.strip().split(maxsplit=1)[0]
        if not command_token.startswith("/"):
            return None
        return command_token.split("@", maxsplit=1)[0].lower()

    def _message_reply_chat_id(self, message: TelegramMessage) -> int | None:
        """返回命令回复目标；优先回复原 chat，没有 chat 时回退发送者。"""
        if message.chat is not None:
            return message.chat.id
        if message.from_user is not None:
            return message.from_user.id
        return None

    def _terms_message(self) -> str:
        """生成 Terms 命令回复文案。"""
        return (
            f"Terms and Conditions: {self._terms_url()}\n\n"
            "Before purchasing, please read these terms. By completing a purchase, "
            "you confirm that you have read and agree to them."
        )

    async def _support_message(self) -> str:
        """生成购买支持命令回复文案。"""
        raw_support_mail = await config_public_service.get(_SUPPORT_MAIL_CONFIG_KEY)
        support_mail = (
            raw_support_mail.strip() if isinstance(raw_support_mail, str) else ""
        )
        if not support_mail:
            raise PaymentProviderError(
                "tg_star._support_message: config_public.support_mail "
                "must be a non-empty string"
            )
        return (
            f"Purchase support: {support_mail}\n\n"
            "Please include your order number when contacting support. "
            "Telegram support and @botsupport cannot help with purchases made "
            "through this bot."
        )

    def _terms_url(self) -> str:
        """返回公开服务条款 URL。"""
        return f"{settings.app.public_website_base_url.rstrip('/')}/terms/"

    async def _send_message(self, *, chat_id: int, text: str) -> None:
        """调用 Telegram Bot API 发送命令回复。"""
        await self._post_bot_api(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": text,
                "disable_web_page_preview": True,
            },
        )

    async def send_purchase_success_message(
        self,
        *,
        chat_id: int,
        order_no: str,
        language: str | None = None,
    ) -> None:
        """支付履约完成后给付款用户发送返回网站继续下载的按钮消息。"""
        normalized_language = self._normalize_message_language(language)
        await self._post_bot_api(
            "sendMessage",
            {
                "chat_id": chat_id,
                "text": translator.translate(
                    "telegram.purchase_success_text",
                    normalized_language,
                    order_no=order_no,
                ),
                "reply_markup": {
                    "inline_keyboard": [
                        [
                            {
                                "text": translator.translate(
                                    "telegram.purchase_success_button",
                                    normalized_language,
                                ),
                                "url": self._website_home_url(),
                            }
                        ]
                    ]
                },
                "disable_web_page_preview": True,
            },
        )

    def _normalize_message_language(self, language: str | None) -> str:
        """把 Telegram 或浏览器语言代码归一到项目支持的 locale。"""
        if not isinstance(language, str) or not language.strip():
            return DEFAULT_LANGUAGE

        normalized = language.strip().replace("_", "-")
        mapped_language = LANGUAGE_MAPPING.get(normalized)
        if mapped_language:
            return mapped_language

        normalized_lower = normalized.lower()
        for source_language, supported_language in LANGUAGE_MAPPING.items():
            if source_language.lower() == normalized_lower:
                return supported_language

        primary_language = normalized_lower.split("-", 1)[0]
        for source_language, supported_language in LANGUAGE_MAPPING.items():
            if source_language.lower() == primary_language:
                return supported_language

        return DEFAULT_LANGUAGE

    def _website_home_url(self) -> str:
        """返回 website 首页 URL。"""
        base_url = self._normalize_required_http_url(
            settings.app.public_website_base_url,
            "app.public_website_base_url",
            context="tg_star._website_home_url",
        )
        return f"{base_url}/"

    async def _validate_pre_checkout_query(
        self,
        query: TelegramPreCheckoutQuery,
    ) -> tuple[bool, str | None, OrderModel | None]:
        """校验 Telegram pre-checkout 与本地订单是否一致。"""
        order_no = query.invoice_payload.strip()
        if not order_no:
            return False, "Invalid order payload", None

        order = await order_service.get_order_by_no(order_no)
        if order is None:
            return False, "Order not found", None

        if order.order_status == OrderStatus.PAID.value:
            return False, "Order already paid", order

        if order.order_status != OrderStatus.PENDING.value:
            return False, "Order status is not payable", order

        if query.currency != TELEGRAM_STARS_CURRENCY:
            return False, "Unsupported payment currency", order

        if order.currency != TELEGRAM_STARS_CURRENCY:
            return False, "Order currency mismatch", order

        if order.amount != self._internal_amount_from_stars_amount(query.total_amount):
            return False, "Payment amount mismatch", order

        return True, None, order

    async def _answer_pre_checkout_query(
        self,
        *,
        pre_checkout_query_id: str,
        ok: bool,
        error_message: str | None,
    ) -> None:
        """调用 Telegram Bot API 确认或拒绝付款。"""
        payload: dict[str, object] = {
            "pre_checkout_query_id": pre_checkout_query_id,
            "ok": ok,
        }
        if not ok:
            payload["error_message"] = error_message or "Payment rejected"

        await self._post_bot_api("answerPreCheckoutQuery", payload)

    def recurring_payment_reference(
        self,
        *,
        order_no: str | None,
        is_recurring: bool,
    ) -> RecurringPaymentReference:
        """把 Telegram subscription invoice payload 转换为统一续费引用。"""

        if not is_recurring:
            return super().recurring_payment_reference(
                order_no=order_no,
                is_recurring=is_recurring,
            )
        return RecurringPaymentReference(original_order_no=order_no)

    async def _handle_successful_payment(
        self,
        payment: TelegramSuccessfulPayment,
        payer: TelegramUser | None,
    ) -> CallbackVerificationResult:
        """校验 Telegram 已扣款字段并转换为统一支付回调结果。"""
        order_no = payment.invoice_payload.strip()
        is_recurring = payment.is_recurring is True
        if payment.currency != TELEGRAM_STARS_CURRENCY:
            raise PaymentProviderError(
                "Telegram successful_payment unsupported currency: "
                f"order_no={order_no}, currency={payment.currency}"
            )
        if payer is None:
            raise PaymentProviderError(
                f"Telegram successful_payment payer missing: order_no={order_no}, "
                f"telegram_charge_id={payment.telegram_payment_charge_id}"
            )
        payment_data = payment.model_dump(mode="json", exclude_none=True)
        if is_recurring:
            # Stars 自动续费账期以渠道归一化的订阅到期时间为准；
            # Test DC 加速周期（60 秒）与生产 30 天由配置区分。
            expiration_seconds = payment.subscription_expiration_date
            period_seconds = self.config.subscription_period_seconds
            if expiration_seconds is None or expiration_seconds <= 0:
                raise PaymentProviderError(
                    "Telegram recurring successful_payment expiration invalid: "
                    f"order_no={order_no}, expiration={expiration_seconds}"
                )
            period_end_at = expiration_seconds * 1000
            payment_data["provider_subscription"] = {
                "channel_subscription_id": payment.telegram_payment_charge_id,
                "original_order_no": order_no,
                "start_at": period_end_at - period_seconds * 1000,
                "expires_at": period_end_at,
            }
        return CallbackVerificationResult(
            valid=True,
            processed=True,
            event="successful_payment",
            order_no=None if is_recurring else order_no,
            channel_order_no=payment.telegram_payment_charge_id,
            channel_uid=str(payer.id),
            amount=self._internal_amount_from_stars_amount(payment.total_amount),
            currency=payment.currency,
            transaction_id=payment.telegram_payment_charge_id,
            extra_metadata=json.dumps(
                payment_data,
                ensure_ascii=False,
            ),
            provider_data=payment_data,
            recurring_reference=self.recurring_payment_reference(
                order_no=order_no,
                is_recurring=is_recurring,
            ),
        )

    async def after_order_success(
        self,
        context: AfterOrderSuccessContext,
    ) -> AfterOrderSuccessResult:
        """首次同步履约成功后给 Telegram 付款人发送购买成功消息。"""

        if context.channel_uid is None:
            raise PaymentProviderError(
                "tg_star.after_order_success: Telegram payer id missing: "
                f"order_no={context.order_no}"
            )
        try:
            chat_id = int(context.channel_uid)
        except ValueError as exc:
            raise PaymentProviderError(
                "tg_star.after_order_success: Telegram payer id invalid: "
                f"order_no={context.order_no}, channel_uid={context.channel_uid}"
            ) from exc

        await self.send_purchase_success_message(
            chat_id=chat_id,
            order_no=context.order_no,
            language=context.language,
        )
        return AfterOrderSuccessResult(processed=True)

    async def _post_bot_api(
        self,
        method: str,
        payload: dict[str, object],
    ) -> dict[str, object]:
        """调用 Telegram Bot API。"""
        url = self.config.bot_api_url(method)
        safe_endpoint = self.config.masked_bot_api_url(method)

        try:
            async with httpx.AsyncClient(
                timeout=self.config.request_timeout_seconds
            ) as client:
                response = await client.post(url, json=payload)
        except httpx.HTTPError as exc:
            safe_error = self._redact_secret_text(exc)
            raise PaymentProviderError(
                f"Telegram Bot API {method} request failed: "
                f"endpoint={safe_endpoint}, error={safe_error}"
            ) from exc

        if response.status_code >= 400:
            safe_body = self._redact_secret_text(response.text[:500])
            raise PaymentProviderError(
                f"Telegram Bot API {method} HTTP failed: "
                f"endpoint={safe_endpoint}, status={response.status_code}, "
                f"body={safe_body}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            safe_body = self._redact_secret_text(response.text[:500])
            raise PaymentProviderError(
                f"Telegram Bot API {method} returned invalid JSON: "
                f"endpoint={safe_endpoint}, body={safe_body}"
            ) from exc
        if not isinstance(data, dict) or data.get("ok") is not True:
            safe_data = self._redact_secret_text(data)
            raise PaymentProviderError(
                f"Telegram Bot API {method} returned non-ok response: "
                f"endpoint={safe_endpoint}, response={safe_data}"
            )
        return data
