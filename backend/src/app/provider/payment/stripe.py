"""Stripe Hosted Checkout、已付发票与协议内升档的渠道边界。"""

import hashlib
import hmac
import json
import time
from urllib.parse import quote, urlencode, urlsplit

import httpx
from fastapi import Request

from app.constants.payment import STRIPE_PAYMENT_METHOD, channel_amount_unit
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.exceptions.payment_exception import payment_http_failure_category
from app.i18n.common_code import CommonCode
from app.provider.payment.payment_base import (
    CallbackVerificationResult,
    PaymentBase,
    PaymentProviderError,
    PaymentRequest,
    RecurringPaymentReference,
    SubscriptionRenewalResumeRequired,
    SubscriptionState,
    SubscriptionUpdateAction,
    SubscriptionUpdatePreview,
    SubscriptionUpdateResult,
)

STRIPE_API_VERSION = "2026-09-30.endive"
STRIPE_PLAN_EVENTS = frozenset(
    {"customer.subscription.updated", "customer.subscription.pending_update_applied"}
)
_PERIODS = {"month": ("month", 1), "quarter": ("month", 3), "year": ("year", 1)}


class StripePaymentProvider(PaymentBase):
    provider_name = STRIPE_PAYMENT_METHOD
    supports_upgrade_checkout = True
    supports_subscription_update = True

    @classmethod
    def validate_order_cancellation(cls, *, order_no: str) -> None:
        raise AppCommonException(
            CommonCode.ORDER_CANNOT_CANCEL,
            ext_msg=f"order_cancel: Stripe 收银台仍可到账: order_no={order_no}",
        )

    def __init__(self, config: dict[str, object] | None = None) -> None:
        config = config or {}
        self.secret_key = self._string(config, "secret_key")
        self.webhook_secret = self._string(config, "webhook_secret")
        timeout = config.get("request_timeout_seconds", 30)
        if (
            isinstance(timeout, bool)
            or not isinstance(timeout, int | float)
            or timeout <= 0
        ):
            raise PaymentProviderError("stripe.config: 请求超时必须为正数")
        self.timeout = float(timeout)

    async def create_payment(self, request: PaymentRequest) -> dict[str, object]:
        unit = channel_amount_unit(self.provider_name)
        if request.currency != "USD" or request.amount <= 0 or request.amount % unit:
            raise PaymentProviderError(
                f"stripe.checkout: 美元金额不能表示为美分: order_no={request.order_no}"
            )
        base = settings.app.public_website_base_url.rstrip("/")
        query = urlencode({"order_no": request.order_no})
        payload = {
            "mode": "subscription" if request.auto_renew else "payment",
            "client_reference_id": request.order_no,
            "metadata[order_no]": request.order_no,
            "metadata[user_id]": str(request.user_id),
            "success_url": f"{base}/stripe/success/?{query}",
            "cancel_url": f"{base}/stripe/cancel/?{query}",
            "line_items[0][quantity]": "1",
            "adaptive_pricing[enabled]": "false",
            "managed_payments[enabled]": "false",
        }
        if request.auto_renew:
            price_id = request.provider_sku
            if not price_id:
                raise PaymentProviderError(
                    f"stripe.checkout: recurring Price 缺失: order_no={request.order_no}"
                )
            await self._validate_price(
                price_id, request.amount, request.currency, request.period
            )
            payload.update(
                {
                    "line_items[0][price]": price_id,
                    "subscription_data[metadata][order_no]": request.order_no,
                    "subscription_data[metadata][user_id]": str(request.user_id),
                    "allowed_payment_method_types[0]": "card",
                }
            )
        else:
            payload.update(
                {
                    "line_items[0][price_data][currency]": "usd",
                    "line_items[0][price_data][unit_amount]": str(
                        request.amount // unit
                    ),
                    "line_items[0][price_data][product_data][name]": request.product_name,
                }
            )
        session = await self._request("POST", "/checkout/sessions", payload)
        return {
            "sessionId": self._string(session, "id"),
            "checkoutUrl": self._hosted_url(
                self._string(session, "url"), "checkout.stripe.com"
            ),
        }

    async def create_subscription_management_url(
        self, *, channel_uid: str | None, return_url: str
    ) -> str:
        if not channel_uid:
            raise PaymentProviderError("stripe.portal: 当前订阅缺少 Customer")
        session = await self._request(
            "POST",
            "/billing_portal/sessions",
            {
                "customer": channel_uid,
                "return_url": return_url,
            },
        )
        return self._hosted_url(self._string(session, "url"), "billing.stripe.com")

    async def preview_subscription_update(
        self,
        *,
        channel_subscription_id: str,
        target_provider_sku: str | None,
        currency: str,
        target_amount: int,
    ) -> SubscriptionUpdatePreview:
        subscription = await self._request(
            "GET", f"/subscriptions/{quote(channel_subscription_id, safe='')}"
        )
        self._assert_renewal_enabled(subscription)
        item = self._subscription_item(subscription)
        if not target_provider_sku:
            raise PaymentProviderError("stripe.preview: 目标 Price 缺失")
        await self._validate_price(
            target_provider_sku, target_amount, currency, "month"
        )
        invoice = await self._request(
            "POST",
            "/invoices/create_preview",
            {
                "subscription": channel_subscription_id,
                "subscription_details[items][0][id]": self._string(item, "id"),
                "subscription_details[items][0][price]": target_provider_sku,
                "subscription_details[items][0][quantity]": "1",
                "subscription_details[billing_cycle_anchor][type]": "now",
                "subscription_details[proration_behavior]": "always_invoice",
            },
        )
        if self._string(invoice, "currency").upper() != currency:
            raise PaymentProviderError("stripe.preview: 报价币种与目标渠道价不符")
        return SubscriptionUpdatePreview(
            price_reference=target_provider_sku,
            net_amount=self._integer(invoice, "amount_due")
            * channel_amount_unit(self.provider_name),
        )

    async def confirm_subscription_update(
        self,
        *,
        channel_subscription_id: str,
        target_provider_sku: str | None,
        price_reference: str,
    ) -> SubscriptionUpdateResult:
        subscription = await self._request(
            "GET", f"/subscriptions/{quote(channel_subscription_id, safe='')}"
        )
        self._assert_renewal_enabled(subscription)
        item = self._subscription_item(subscription)
        if price_reference != target_provider_sku:
            raise PaymentProviderError("stripe.confirm: 报价 Price 与目标不符")
        updated = await self._request(
            "POST",
            f"/subscriptions/{quote(channel_subscription_id, safe='')}",
            {
                "items[0][id]": self._string(item, "id"),
                "items[0][price]": price_reference,
                "items[0][quantity]": "1",
                "billing_cycle_anchor[type]": "now",
                "proration_behavior": "always_invoice",
                "payment_behavior": "pending_if_incomplete",
                "expand[0]": "latest_invoice",
            },
        )
        invoice = await self._invoice(updated.get("latest_invoice"))
        updated["latest_invoice"] = invoice
        if invoice.get("status") in {"void", "uncollectible"}:
            return SubscriptionUpdateResult("failed")
        if updated.get("pending_update") is not None or invoice.get("status") != "paid":
            url = invoice.get("hosted_invoice_url")
            if isinstance(url, str) and url:
                if urlsplit(url).scheme != "https":
                    raise PaymentProviderError(
                        "stripe.confirm: 发票支付地址必须使用 HTTPS"
                    )
                return SubscriptionUpdateResult(
                    "requires_action", SubscriptionUpdateAction("redirect", url)
                )
            return SubscriptionUpdateResult(
                "requires_action", SubscriptionUpdateAction("wait")
            )
        state = await self._paid_subscription_state(updated)
        if state.provider_sku != target_provider_sku:
            return SubscriptionUpdateResult(
                "requires_action", SubscriptionUpdateAction("wait")
            )
        return SubscriptionUpdateResult("succeeded")

    async def get_subscription_state(
        self, channel_subscription_id: str
    ) -> SubscriptionState:
        data = await self._request(
            "GET",
            f"/subscriptions/{quote(channel_subscription_id, safe='')}",
            {"expand[0]": "latest_invoice"},
        )
        return await self._paid_subscription_state(data)

    async def verify_callback(self, request: Request) -> CallbackVerificationResult:
        body = await request.body()
        self._verify_signature(request.headers.get("Stripe-Signature", ""), body)
        try:
            event = self._object(json.loads(body), "event")
        except (ValueError, UnicodeDecodeError) as exc:
            raise PaymentProviderError(
                "stripe.webhook: 已验签请求不是有效 JSON"
            ) from exc
        if event.get("api_version") != STRIPE_API_VERSION:
            raise PaymentProviderError(
                "stripe.webhook: snapshot API 版本与 Provider 不符"
            )
        event_type = self._string(event, "type")
        data = self._object(
            self._object(event.get("data"), "event.data").get("object"),
            "event.data.object",
        )
        ignored = CallbackVerificationResult(valid=True, event=event_type)
        if event_type in {
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
        }:
            if (
                data.get("mode") == "subscription"
                or data.get("payment_status") == "unpaid"
            ):
                return ignored
            session_id = self._string(data, "id")
            if any(
                data.get(key) is None
                for key in (
                    "mode",
                    "payment_status",
                    "payment_intent",
                    "client_reference_id",
                    "amount_total",
                    "currency",
                )
            ):
                data = await self._request(
                    "GET", f"/checkout/sessions/{quote(session_id, safe='')}"
                )
            if data.get("mode") != "payment" or data.get("payment_status") != "paid":
                return ignored
            return CallbackVerificationResult(
                valid=True,
                processed=True,
                event=event_type,
                order_no=self._string(data, "client_reference_id"),
                channel_order_no=session_id,
                transaction_id=self._id(data.get("payment_intent")),
                amount=self._integer(data, "amount_total")
                * channel_amount_unit(self.provider_name),
                currency=self._string(data, "currency").upper(),
                paid_at=self._integer(event, "created") * 1000,
            )
        if event_type == "invoice.paid":
            if data.get("status") not in {None, "paid"}:
                return ignored
            invoice = await self._invoice(data)
            if (
                invoice.get("status") != "paid"
                or self._integer(invoice, "amount_paid") <= 0
            ):
                return ignored
            parent_data = invoice.get("parent")
            if (
                not isinstance(parent_data, dict)
                or parent_data.get("type") != "subscription_details"
            ):
                return ignored
            transaction_id = self._invoice_payment(invoice)
            if transaction_id is None:
                return ignored
            parent = self._object(
                parent_data.get("subscription_details"),
                "invoice.parent.subscription_details",
            )
            subscription_id = self._id(parent.get("subscription"))
            original_order_no = self._string(
                self._object(parent.get("metadata"), "invoice.subscription.metadata"),
                "order_no",
            )
            line = self._invoice_line(invoice, subscription_id)
            period = self._object(line.get("period"), "invoice.line.period")
            pricing = self._object(line.get("pricing"), "invoice.line.pricing")
            price = self._object(
                pricing.get("price_details"), "invoice.line.price_details"
            )
            provider_data: dict[str, object] = {
                "stripe_invoice_id": self._string(invoice, "id"),
                "stripe_subscription_id": subscription_id,
                "provider_subscription": {
                    "channel_subscription_id": subscription_id,
                    "original_order_no": original_order_no,
                    "start_at": self._integer(period, "start") * 1000,
                    "expires_at": self._integer(period, "end") * 1000,
                },
            }
            return CallbackVerificationResult(
                valid=True,
                processed=True,
                event=event_type,
                channel_order_no=self._string(invoice, "id"),
                channel_uid=self._id(invoice.get("customer")),
                transaction_id=transaction_id,
                amount=self._integer(invoice, "amount_paid")
                * channel_amount_unit(self.provider_name),
                currency=self._string(invoice, "currency").upper(),
                paid_at=self._integer(
                    self._object(
                        invoice.get("status_transitions"), "invoice.status_transitions"
                    ),
                    "paid_at",
                )
                * 1000,
                extra_metadata=json.dumps(provider_data, ensure_ascii=False),
                provider_data=provider_data,
                recurring_reference=RecurringPaymentReference(
                    original_order_no=original_order_no,
                    provider_sku=self._id(price.get("price")),
                    period_amount=self._integer(line, "amount")
                    * channel_amount_unit(self.provider_name),
                ),
            )
        if event_type in STRIPE_PLAN_EVENTS:
            previous = self._object(event.get("data"), "event.data").get(
                "previous_attributes"
            )
            if event_type == "customer.subscription.updated" and (
                not isinstance(previous, dict) or "items" not in previous
            ):
                return ignored
            if data.get("pending_update") is not None or data.get("status") != "active":
                return ignored
            return CallbackVerificationResult(
                valid=True,
                event=event_type,
                subscription_state=await self._paid_subscription_state(data),
                provider_data={"stripe_subscription_id": self._string(data, "id")},
            )
        return ignored

    async def _validate_price(
        self, price_id: str, amount: int, currency: str, period: str
    ) -> None:
        price = await self._request("GET", f"/prices/{quote(price_id, safe='')}")
        recurring = self._object(price.get("recurring"), "price.recurring")
        if (
            price.get("id") != price_id
            or price.get("active") is not True
            or price.get("type") != "recurring"
            or price.get("billing_scheme") != "per_unit"
            or self._string(price, "currency").upper() != currency
            or self._integer(price, "unit_amount")
            * channel_amount_unit(self.provider_name)
            != amount
            or (recurring.get("interval"), recurring.get("interval_count"))
            != _PERIODS.get(period)
            or recurring.get("usage_type") != "licensed"
        ):
            raise PaymentProviderError(
                f"stripe.price: 渠道价与商品金额、币种或周期不符: price_id={price_id}"
            )

    async def _invoice(self, value: object) -> dict[str, object]:
        if isinstance(value, dict) and all(
            k in value
            for k in (
                "id",
                "customer",
                "currency",
                "amount_paid",
                "payments",
                "parent",
                "lines",
                "status_transitions",
            )
        ):
            return value
        return await self._request(
            "GET",
            f"/invoices/{quote(self._id(value), safe='')}",
            {"expand[0]": "payments"},
        )

    async def _paid_subscription_state(
        self, data: dict[str, object]
    ) -> SubscriptionState:
        if data.get("status") != "active" or data.get("pending_update") is not None:
            raise PaymentProviderError("stripe.subscription: 协议尚未处于已付生效状态")
        subscription_id = self._string(data, "id")
        invoice = await self._invoice(data.get("latest_invoice"))
        if self._invoice_payment(invoice) is None:
            raise PaymentProviderError("stripe.subscription: 最新发票缺少实际收款")
        parent = self._object(invoice.get("parent"), "invoice.parent")
        subscription_parent = self._object(
            parent.get("subscription_details"), "invoice.parent.subscription_details"
        )
        if self._id(subscription_parent.get("subscription")) != subscription_id:
            raise PaymentProviderError("stripe.subscription: 已付发票不属于当前协议")
        item = self._subscription_item(data)
        price_id = self._id(item.get("price"))
        line = self._invoice_line(invoice, subscription_id)
        pricing = self._object(line.get("pricing"), "invoice.line.pricing")
        details = self._object(
            pricing.get("price_details"), "invoice.line.price_details"
        )
        if self._id(details.get("price")) != price_id:
            raise PaymentProviderError("stripe.subscription: 当前价格与已付发票不符")
        return SubscriptionState(
            provider_sku=price_id,
            original_order_no=self._string(
                self._object(data.get("metadata"), "subscription.metadata"), "order_no"
            ),
        )

    def _invoice_payment(self, invoice: dict[str, object]) -> str | None:
        if (
            invoice.get("status") != "paid"
            or self._integer(invoice, "amount_paid") <= 0
        ):
            raise PaymentProviderError("stripe.invoice: 发票尚无已完成实付")
        payments = [
            p
            for p in self._data_list(invoice.get("payments"), "invoice.payments")
            if p.get("status") == "paid"
        ]
        if not payments:
            return None
        if len(payments) != 1:
            raise PaymentProviderError("stripe.invoice: 缺少唯一成功付款凭证")
        payment = payments[0]
        if payment.get("amount_paid") != invoice.get("amount_paid") or payment.get(
            "currency"
        ) != invoice.get("currency"):
            raise PaymentProviderError("stripe.invoice: 实付凭证金额或币种与发票不符")
        associated = self._object(payment.get("payment"), "invoice.payment")
        kind = self._string(associated, "type")
        if kind == "payment_record":
            return None
        if kind not in {"payment_intent", "charge"}:
            raise PaymentProviderError("stripe.invoice: 付款不是 Stripe 实际收款凭证")
        return self._id(associated.get(kind))

    def _invoice_line(
        self, invoice: dict[str, object], subscription_id: str
    ) -> dict[str, object]:
        lines = []
        for line in self._data_list(invoice.get("lines"), "invoice.lines"):
            parent = self._object(line.get("parent"), "invoice.line.parent")
            details = parent.get("subscription_item_details")
            if (
                isinstance(details, dict)
                and details.get("subscription") == subscription_id
                and self._integer(line, "amount") > 0
            ):
                lines.append(line)
        if len(lines) != 1:
            raise PaymentProviderError("stripe.invoice: 缺少唯一的新档计费区间")
        return lines[0]

    def _subscription_item(self, data: dict[str, object]) -> dict[str, object]:
        items = self._data_list(data.get("items"), "subscription.items")
        if len(items) != 1 or items[0].get("quantity") != 1:
            raise PaymentProviderError(
                "stripe.subscription: 协议必须为单一商品且数量为一"
            )
        return items[0]

    @staticmethod
    def _assert_renewal_enabled(data: dict[str, object]) -> None:
        if data.get("cancel_at_period_end") is True or data.get("cancel_at"):
            raise SubscriptionRenewalResumeRequired(
                "stripe.upgrade: 请先在渠道恢复续费"
            )

    def _verify_signature(self, signature: str, body: bytes) -> None:
        parts = [part.split("=", 1) for part in signature.split(",") if "=" in part]
        try:
            timestamp = int(next(value for key, value in parts if key == "t"))
        except (ValueError, StopIteration) as exc:
            raise PaymentProviderError("stripe.webhook: 签名时间缺失或无效") from exc
        if abs(time.time() - timestamp) > 300:
            raise PaymentProviderError("stripe.webhook: 签名超出五分钟容差")
        expected = hmac.new(
            self.webhook_secret.encode(),
            str(timestamp).encode() + b"." + body,
            hashlib.sha256,
        ).hexdigest()
        if not any(
            hmac.compare_digest(expected, value) for key, value in parts if key == "v1"
        ):
            raise PaymentProviderError("stripe.webhook: 签名核对失败")

    async def _request(
        self, method: str, path: str, fields: dict[str, str] | None = None
    ) -> dict[str, object]:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method,
                    f"https://api.stripe.com/v1{path}",
                    params=fields if method == "GET" else None,
                    data=fields if method == "POST" else None,
                    headers={
                        "Authorization": f"Bearer {self.secret_key}",
                        "Stripe-Version": STRIPE_API_VERSION,
                    },
                )
        except httpx.HTTPError as exc:
            raise PaymentProviderError(
                f"stripe.request: 渠道请求失败: path={path}, error={type(exc).__name__}",
                category=payment_http_failure_category(
                    error=exc, is_write=method != "GET"
                ),
            ) from exc
        if not response.is_success:
            raise PaymentProviderError(
                f"stripe.request: 渠道拒绝请求: path={path}, status={response.status_code}",
                category=payment_http_failure_category(
                    status=response.status_code, is_write=method != "GET"
                ),
            )
        try:
            value: object = response.json()
        except ValueError as exc:
            raise PaymentProviderError(
                f"stripe.request: 返回值不是 JSON: path={path}"
            ) from exc
        return self._object(value, path)

    @staticmethod
    def _object(value: object, context: str) -> dict[str, object]:
        if not isinstance(value, dict):
            raise PaymentProviderError(f"stripe.parse: 对象缺失: field={context}")
        return value

    @staticmethod
    def _string(data: dict[str, object], key: str) -> str:
        value = data.get(key)
        if not isinstance(value, str) or not value:
            raise PaymentProviderError(f"stripe.parse: 字符串缺失: field={key}")
        return value

    @staticmethod
    def _integer(data: dict[str, object], key: str) -> int:
        value = data.get(key)
        if type(value) is not int:
            raise PaymentProviderError(f"stripe.parse: 整数缺失: field={key}")
        return value

    def _id(self, value: object) -> str:
        if isinstance(value, str) and value:
            return value
        return self._string(self._object(value, "id"), "id")

    def _data_list(self, value: object, context: str) -> list[dict[str, object]]:
        values = self._object(value, context).get("data")
        if not isinstance(values, list):
            raise PaymentProviderError(f"stripe.parse: 列表缺失: field={context}")
        return [self._object(item, context) for item in values]

    @staticmethod
    def _hosted_url(value: str, hostname: str) -> str:
        parsed = urlsplit(value)
        if parsed.scheme != "https" or parsed.hostname != hostname:
            raise PaymentProviderError(
                f"stripe.url: 托管地址不符合渠道域名: host={hostname}"
            )
        return value
