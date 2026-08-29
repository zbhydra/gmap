"""Telegram webhook 注册脚本的环境路径与请求契约测试。

真实 setWebhook 会修改 Bot 状态，仍由 Test DC 或生产部署验收；本文件只替换
Telegram HTTP 出口，确认脚本不会把 webhook 注册到错误的 DC。
"""

import json

import httpx
import pytest

from app.core.config import settings
from scripts import register_telegram_webhook


def _channel_config(*, environment: str) -> dict[str, object]:
    """构造 webhook 注册脚本需要的完整渠道配置。"""

    return {
        "environment": environment,
        "token": "webhook-test-token",
        "webhook_secret_token": "webhook-test-secret",
        "request_timeout_seconds": 3,
    }


@pytest.mark.parametrize(
    ("environment", "expected_path"),
    (
        ("production", "/botwebhook-test-token/setWebhook"),
        ("test", "/botwebhook-test-token/test/setWebhook"),
    ),
)
@pytest.mark.asyncio
async def test_set_webhook_uses_configured_telegram_environment(
    monkeypatch: pytest.MonkeyPatch,
    environment: str,
    expected_path: str,
) -> None:
    """setWebhook 的 DC 路径和请求体必须来自同一渠道配置。"""

    real_async_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "api.telegram.org"
        assert request.url.path == expected_path
        assert json.loads(request.content) == {
            "url": "https://business-api.example.com/api/callback/telegram/payment",
            "secret_token": "webhook-test-secret",
        }
        return httpx.Response(200, json={"ok": True, "result": True})

    def factory(**kwargs: object) -> httpx.AsyncClient:
        return real_async_client(
            transport=httpx.MockTransport(handler),
            **kwargs,
        )

    monkeypatch.setattr(register_telegram_webhook.httpx, "AsyncClient", factory)
    monkeypatch.setattr(
        settings.app,
        "public_api_base_url",
        "https://business-api.example.com",
    )
    config = register_telegram_webhook._parse_deploy_config(  # noqa: SLF001
        _channel_config(environment=environment)
    )

    await register_telegram_webhook.set_webhook(config)
