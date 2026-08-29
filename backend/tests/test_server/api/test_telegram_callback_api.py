"""Telegram webhook API 路由级测试。

本文件覆盖 `/api/callback/telegram/payment` 的 wiring：
1. API 入口记录原始请求并把 Request 交给 Telegram Stars provider。
2. `pre_checkout_query` 只完成 Telegram 付款前确认，不触发 handle_payment_callback。
3. `successful_payment` 验签通过后，路由把 verified 结果原样传给
   `order_service.handle_payment_callback`，并把返回的 PaymentCallbackResult
   透传到响应。续费派单、并发收敛、履约、购买成功消息全部由 OrderService + Provider
   统一处理，不再属于路由职责，故 API 测试不再验证发消息。
4. secret 错误或 payload 畸形时返回统一错误响应，且不能触发 handle_payment_callback。
"""

from dataclasses import dataclass, field
import json
from typing import Any

import pytest

from app.api.callback import telegram_callback as telegram_callback_api
from app.constants.order import PaymentCallbackResult
from app.core.config import settings
from app.i18n.common_code import CommonCode
from app.provider.payment.payment_base import (
    AfterOrderSuccessContext,
    CallbackVerificationResult,
    PaymentProviderError,
)
from app.provider.payment.tg_star import (
    TELEGRAM_STARS_CURRENCY,
    TELEGRAM_STARS_PAYMENT_METHOD,
    TgStarPaymentProvider,
)

_WEBHOOK_PATH = "/api/callback/telegram/payment"
_SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token"
_EXPECTED_SECRET = "pytest-telegram-secret"


@dataclass
class _ProviderCall:
    """记录 API 传给 fake provider 的 Request 快照。"""

    header_secret: str | None
    body: dict[str, Any]


@dataclass
class _FakeProvider:
    """验证路由传入的 Request，并返回指定验签结果。"""

    expected_body: dict[str, Any]
    result: CallbackVerificationResult
    expected_secret: str = _EXPECTED_SECRET
    calls: list[_ProviderCall] = field(default_factory=list)

    async def verify_callback(self, request):
        """断言 provider 收到真实 Request header/body。"""
        body = await request.json()
        header_secret = request.headers.get("x-telegram-bot-api-secret-token")
        self.calls.append(_ProviderCall(header_secret=header_secret, body=body))

        if header_secret != self.expected_secret:
            raise PaymentProviderError(
                "test_telegram_callback_api: Telegram webhook secret mismatch"
            )
        if body != self.expected_body:
            raise AssertionError(f"Unexpected provider body: {body}")
        return self.result


@dataclass
class _MalformedPayloadProvider:
    """读取畸形请求后模拟 provider 解析失败。"""

    expected_body: bytes
    calls: list[tuple[str | None, bytes]] = field(default_factory=list)

    async def verify_callback(self, request):
        """断言畸形 payload 仍经由路由传到 provider。"""
        body = await request.body()
        header_secret = request.headers.get("x-telegram-bot-api-secret-token")
        self.calls.append((header_secret, body))
        if body != self.expected_body:
            raise AssertionError(f"Unexpected malformed body: {body!r}")
        raise PaymentProviderError(
            "test_telegram_callback_api: malformed Telegram webhook payload"
        )


@dataclass
class _HandlePaymentCallbackCall:
    """记录路由传给 handle_payment_callback 的参数。"""

    payment_method: str
    callback: CallbackVerificationResult


def _pre_checkout_payload(order_no: str = "ORDER_PRECHECKOUT") -> dict[str, Any]:
    """构造 Telegram pre_checkout_query webhook payload。"""
    return {
        "update_id": 1001,
        "pre_checkout_query": {
            "id": "pre-checkout-id",
            "from": {"id": 12345, "is_bot": False, "first_name": "Tester"},
            "currency": TELEGRAM_STARS_CURRENCY,
            "total_amount": 950,
            "invoice_payload": order_no,
        },
    }


def _successful_payment_payload(order_no: str = "ORDER_SUCCESS") -> dict[str, Any]:
    """构造 Telegram successful_payment webhook payload。"""
    return {
        "update_id": 1002,
        "message": {
            "message_id": 88,
            "from": {"id": 12345, "is_bot": False, "first_name": "Tester"},
            "chat": {"id": 12345, "type": "private"},
            "date": 1760000000,
            "successful_payment": {
                "currency": TELEGRAM_STARS_CURRENCY,
                "total_amount": 950,
                "invoice_payload": order_no,
                "telegram_payment_charge_id": "tg-charge-123",
                "provider_payment_charge_id": "",
            },
        },
    }


def _install_fake_provider(monkeypatch, provider: _FakeProvider) -> None:
    """把 payment_service.get_provider 替换为 fake provider。"""

    async def fake_get_provider(payment_method: str):
        assert payment_method == TELEGRAM_STARS_PAYMENT_METHOD
        return provider

    monkeypatch.setattr(
        telegram_callback_api.payment_service,
        "get_provider",
        fake_get_provider,
    )


def _install_handle_payment_callback_recorder(
    monkeypatch,
    *,
    result: PaymentCallbackResult,
) -> list[_HandlePaymentCallbackCall]:
    """记录 handle_payment_callback 调用，避免触发真实订单履约。

    续费派单、履约、购买成功消息等业务逻辑已下沉到 OrderService + Provider，
    路由测试只关心是否按预期调用本入口以及如何透传返回值。
    """
    calls: list[_HandlePaymentCallbackCall] = []

    async def fake_handle_payment_callback(
        *,
        payment_method: str,
        callback: CallbackVerificationResult,
    ) -> PaymentCallbackResult:
        calls.append(
            _HandlePaymentCallbackCall(
                payment_method=payment_method,
                callback=callback,
            )
        )
        return result

    monkeypatch.setattr(
        telegram_callback_api.order_service,
        "handle_payment_callback",
        fake_handle_payment_callback,
    )
    return calls


def _read_raw_log_entries(tmp_path) -> list[dict[str, Any]]:
    """读取 Telegram raw callback 日志。"""
    log_files = list((tmp_path / "log" / "payment" / "telegram").glob("*.log"))
    assert len(log_files) == 1
    return [
        json.loads(line)
        for line in log_files[0].read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def _telegram_provider_config() -> dict[str, object]:
    """构造 Telegram Stars provider 测试配置。"""
    return {
        "environment": "production",
        "token": "pytest-token",
        "webhook_secret_token": _EXPECTED_SECRET,
        "request_timeout_seconds": 3,
    }


@pytest.mark.asyncio
async def test_send_purchase_success_message_uses_user_language(monkeypatch):
    """购买成功消息按用户语言渲染正文和按钮。

    该用例覆盖 Provider 层的发消息能力（消息正文/按钮已迁入 tg_star.after_order_success），
    与路由 wiring 无关，故直接对 provider 单元测试，不经 HTTP 路由。
    """
    provider = TgStarPaymentProvider(_telegram_provider_config())
    calls: list[tuple[str, dict[str, object]]] = []
    monkeypatch.setattr(
        settings.app,
        "public_website_base_url",
        "https://telegramdownloadmedia.com",
    )

    async def fake_post_bot_api(
        method: str,
        payload: dict[str, object],
    ) -> dict[str, object]:
        calls.append((method, payload))
        return {"ok": True}

    monkeypatch.setattr(provider, "_post_bot_api", fake_post_bot_api)

    await provider.send_purchase_success_message(
        chat_id=12345,
        order_no="ORDER_LANG",
        language="en",
    )

    assert calls == [
        (
            "sendMessage",
            {
                "chat_id": 12345,
                "text": "Purchase successful. Credits have been added.\n\n"
                "Order No: ORDER_LANG",
                "reply_markup": {
                    "inline_keyboard": [
                        [
                            {
                                "text": ("Return to website to continue downloading"),
                                "url": "https://telegramdownloadmedia.com/",
                            }
                        ]
                    ]
                },
                "disable_web_page_preview": True,
            },
        )
    ]


@pytest.mark.asyncio
async def test_after_order_success_sends_message_with_payer_chat_id(monkeypatch):
    """after_order_success 把 channel_uid 转成 chat_id 并发购买成功消息。"""

    provider = TgStarPaymentProvider(_telegram_provider_config())
    calls: list[tuple[str, dict[str, object]]] = []

    async def fake_post_bot_api(
        method: str,
        payload: dict[str, object],
    ) -> dict[str, object]:
        calls.append((method, payload))
        return {"ok": True}

    monkeypatch.setattr(provider, "_post_bot_api", fake_post_bot_api)

    result = await provider.after_order_success(
        AfterOrderSuccessContext(
            order_no="ORDER-AFTER",
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            channel_order_no="CHARGE-AFTER",
            channel_uid="12345",
            language="en",
        )
    )

    assert result.processed is True
    assert calls[0][0] == "sendMessage"
    assert calls[0][1]["chat_id"] == 12345


@pytest.mark.asyncio
async def test_after_order_success_raises_when_payer_missing():
    """channel_uid 缺失时 after_order_success 抛错，不静默吞掉。"""

    provider = TgStarPaymentProvider(_telegram_provider_config())
    with pytest.raises(PaymentProviderError):
        await provider.after_order_success(
            AfterOrderSuccessContext(
                order_no="ORDER-AFTER",
                payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
                channel_order_no="CHARGE-AFTER",
                channel_uid=None,
                language=None,
            )
        )


@pytest.mark.asyncio
async def test_valid_pre_checkout_query_goes_through_callback_route(
    async_client,
    monkeypatch,
    tmp_path,
):
    """有效 pre_checkout_query 经 API 路由进入 provider，不触发 handle_payment_callback。"""
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    payload = _pre_checkout_payload()
    provider = _FakeProvider(
        expected_body=payload,
        result=CallbackVerificationResult(
            valid=False,
            processed=True,
            event="pre_checkout_query",
            order_no="ORDER_PRECHECKOUT",
            provider_data={"ok": True},
        ),
    )
    _install_fake_provider(monkeypatch, provider)
    handle_payment_callback_calls = _install_handle_payment_callback_recorder(
        monkeypatch,
        result=PaymentCallbackResult(
            order_no="ORDER_PRECHECKOUT",
            idempotent=False,
            callback_triggered=False,
        ),
    )

    response = await async_client.post(
        _WEBHOOK_PATH,
        json=payload,
        headers={_SECRET_HEADER: _EXPECTED_SECRET},
    )

    assert response.status_code == 200
    assert response.json() == {
        "code": 10000,
        "data": {
            "processed": True,
            "event": "pre_checkout_query",
            "order_no": "ORDER_PRECHECKOUT",
            "payment_valid": False,
            "provider_data": {"ok": True},
            "error_message": None,
        },
        "msg": "success",
    }
    assert provider.calls == [
        _ProviderCall(header_secret=_EXPECTED_SECRET, body=payload)
    ]
    assert handle_payment_callback_calls == []

    raw_entries = _read_raw_log_entries(tmp_path)
    assert raw_entries[0]["path"] == _WEBHOOK_PATH
    assert json.loads(raw_entries[0]["body"]) == payload
    assert "x-telegram-bot-api-secret-token" not in raw_entries[0]["headers"]
    assert _EXPECTED_SECRET not in json.dumps(raw_entries, ensure_ascii=False)


@pytest.mark.asyncio
async def test_successful_payment_routes_to_handle_payment_callback(
    async_client,
    monkeypatch,
    tmp_path,
):
    """successful_payment 验签通过后路由调用 handle_payment_callback 并透传结果。

    续费首期 / 续费扣款 / 一次性付款等业务分支由 OrderService 在
    handle_payment_callback 内部区分，路由只负责把 provider 验签得到的
    CallbackVerificationResult 原样传入，并把 PaymentCallbackResult 透传到响应。
    """
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    payload = _successful_payment_payload()
    verified = CallbackVerificationResult(
        valid=True,
        processed=True,
        event="successful_payment",
        order_no="ORDER_SUCCESS",
        channel_order_no="tg-charge-123",
        channel_uid="12345",
        amount=950_000_000,
        currency=TELEGRAM_STARS_CURRENCY,
    )
    provider = _FakeProvider(
        expected_body=payload,
        result=verified,
    )
    _install_fake_provider(monkeypatch, provider)
    handle_payment_callback_calls = _install_handle_payment_callback_recorder(
        monkeypatch,
        result=PaymentCallbackResult(
            order_no="ORDER_SUCCESS",
            idempotent=False,
            callback_triggered=True,
        ),
    )

    response = await async_client.post(
        _WEBHOOK_PATH,
        json=payload,
        headers={_SECRET_HEADER: _EXPECTED_SECRET},
    )

    assert response.status_code == 200
    assert response.json() == {
        "code": 10000,
        "data": {
            "processed": True,
            "event": "successful_payment",
            "order_no": "ORDER_SUCCESS",
            "idempotent": False,
        },
        "msg": "success",
    }
    assert provider.calls == [
        _ProviderCall(header_secret=_EXPECTED_SECRET, body=payload)
    ]
    assert handle_payment_callback_calls == [
        _HandlePaymentCallbackCall(
            payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
            callback=verified,
        )
    ]


@pytest.mark.asyncio
async def test_idempotent_successful_payment_propagates_result(
    async_client,
    monkeypatch,
    tmp_path,
):
    """handle_payment_callback 返回幂等结果时，路由原样透传 idempotent 标记。

    重复回调的判定与购买成功消息抑制都在 handle_payment_callback 内部完成，
    路由只负责把 idempotent 字段透传到响应 body。
    """
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    payload = _successful_payment_payload()
    provider = _FakeProvider(
        expected_body=payload,
        result=CallbackVerificationResult(
            valid=True,
            processed=True,
            event="successful_payment",
            order_no="ORDER_SUCCESS",
            channel_order_no="tg-charge-123",
            channel_uid="12345",
            amount=950_000_000,
            currency=TELEGRAM_STARS_CURRENCY,
        ),
    )
    _install_fake_provider(monkeypatch, provider)
    _install_handle_payment_callback_recorder(
        monkeypatch,
        result=PaymentCallbackResult(
            order_no="ORDER_SUCCESS",
            idempotent=True,
            callback_triggered=False,
        ),
    )

    response = await async_client.post(
        _WEBHOOK_PATH,
        json=payload,
        headers={_SECRET_HEADER: _EXPECTED_SECRET},
    )

    assert response.status_code == 200
    assert response.json()["data"] == {
        "processed": True,
        "event": "successful_payment",
        "order_no": "ORDER_SUCCESS",
        "idempotent": True,
    }


@pytest.mark.asyncio
async def test_invalid_secret_returns_error_without_handle_payment_callback(
    async_client,
    monkeypatch,
    tmp_path,
):
    """secret 错误时路由返回统一错误响应，不触发 handle_payment_callback。"""
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    payload = _successful_payment_payload()
    provider = _FakeProvider(
        expected_body=payload,
        result=CallbackVerificationResult(valid=True),
    )
    _install_fake_provider(monkeypatch, provider)
    handle_payment_callback_calls = _install_handle_payment_callback_recorder(
        monkeypatch,
        result=PaymentCallbackResult(
            order_no="ORDER_SUCCESS",
            idempotent=False,
            callback_triggered=False,
        ),
    )

    response = await async_client.post(
        _WEBHOOK_PATH,
        json=payload,
        headers={_SECRET_HEADER: "wrong-secret"},
    )
    body = response.json()

    assert response.status_code == 500
    assert body["code"] == CommonCode.INTERNAL_SERVER_ERROR.value
    assert body["data"] == {}
    assert provider.calls == [_ProviderCall(header_secret="wrong-secret", body=payload)]
    assert handle_payment_callback_calls == []

    raw_entries = _read_raw_log_entries(tmp_path)
    assert json.loads(raw_entries[0]["body"]) == payload
    assert "wrong-secret" not in json.dumps(raw_entries, ensure_ascii=False)


@pytest.mark.asyncio
async def test_malformed_payload_returns_error_without_handle_payment_callback(
    async_client,
    monkeypatch,
    tmp_path,
):
    """payload 畸形时 provider 解析失败会返回统一错误响应，不触发 handle_payment_callback。"""
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    handle_payment_callback_calls = _install_handle_payment_callback_recorder(
        monkeypatch,
        result=PaymentCallbackResult(
            order_no="ORDER_SUCCESS",
            idempotent=False,
            callback_triggered=False,
        ),
    )
    payload = b"{malformed-json"
    provider = _MalformedPayloadProvider(expected_body=payload)

    async def fake_get_provider(payment_method: str):
        assert payment_method == TELEGRAM_STARS_PAYMENT_METHOD
        return provider

    monkeypatch.setattr(
        telegram_callback_api.payment_service,
        "get_provider",
        fake_get_provider,
    )

    response = await async_client.post(
        _WEBHOOK_PATH,
        content=payload,
        headers={
            _SECRET_HEADER: _EXPECTED_SECRET,
            "Content-Type": "application/json",
        },
    )
    body = response.json()

    assert response.status_code == 500
    assert body["code"] == CommonCode.INTERNAL_SERVER_ERROR.value
    assert body["data"] == {}
    assert provider.calls == [(_EXPECTED_SECRET, payload)]
    assert handle_payment_callback_calls == []

    raw_entries = _read_raw_log_entries(tmp_path)
    assert raw_entries[0]["body"] == "{malformed-json"
    assert _EXPECTED_SECRET not in json.dumps(raw_entries, ensure_ascii=False)
