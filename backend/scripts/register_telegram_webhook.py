#!/usr/bin/env python3
"""注册并验收 Telegram Stars webhook。

流程：
1. 从启用的 `config_payment_channel.channel_code=telegram_stars` 读取配置。
2. 请求业务实例 `/api/system/health`，确认公网 API 指向 business role。
3. 调用 Telegram Bot API `setWebhook`。
4. 调用 `getWebhookInfo` 验收 webhook URL 与错误信息。
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.core.config import settings  # noqa: E402
from app.core.database import close_engine, get_async_session  # noqa: E402
from app.models.config_payment_channel_model import (  # noqa: E402
    ConfigPaymentChannelModel,
)
from app.provider.payment.payment_base import PaymentProviderError  # noqa: E402
from app.provider.payment.tg_star import (  # noqa: E402
    TELEGRAM_STARS_PAYMENT_METHOD,
    TelegramStarsProviderConfig,
    TgStarPaymentProvider,
)

WEBHOOK_PATH = "/api/callback/telegram/payment"
HEALTH_PATH = "/api/system/health"
GET_WEBHOOK_INFO_RETRIES = 3
GET_WEBHOOK_INFO_RETRY_SECONDS = 2


@dataclass(frozen=True, slots=True)
class TelegramWebhookDeployConfig:
    """注册 Telegram webhook 需要的部署配置。"""

    provider: TelegramStarsProviderConfig
    public_api_base_url: str

    @property
    def webhook_url(self) -> str:
        """Telegram 应回调的业务接口 URL。"""

        return f"{self.public_api_base_url}{WEBHOOK_PATH}"

    @property
    def health_url(self) -> str:
        """业务实例健康检查 URL。"""

        return f"{self.public_api_base_url}{HEALTH_PATH}"


class TelegramWebhookRegistrationError(RuntimeError):
    """Telegram webhook 注册或验收失败。"""


def parse_args() -> argparse.Namespace:
    """解析命令行参数；不接受 token、secret 或公网 API URL。"""

    parser = argparse.ArgumentParser(
        description="Register Telegram Stars webhook from DB channel config"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只读取配置并执行 health check，不调用 Telegram Bot API",
    )
    return parser.parse_args()


def _safe_error(
    text: object,
    config: TelegramStarsProviderConfig,
) -> str:
    """按当前渠道配置脱敏错误文本。"""

    rendered = str(text)
    for secret in (config.token, config.webhook_secret_token):
        rendered = rendered.replace(secret, "***")
    return rendered


def _normalize_required_http_url(value: Any, field: str) -> str:
    """读取并规范化配置中的 HTTP/HTTPS URL。"""

    if not isinstance(value, str) or not value.strip():
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: config field {field} "
            "must be a non-empty string"
        )
    normalized = value.strip().rstrip("/")
    parsed = urlparse(normalized)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: config field {field} "
            "must be an http or https URL"
        )
    return normalized


def _load_config_json(raw: str | None) -> dict[str, Any]:
    """解析 config_payment_channel.config_json。"""

    if raw is None or not raw.strip():
        raise TelegramWebhookRegistrationError(
            "register_telegram_webhook: enabled telegram_stars channel "
            "config_json is empty"
        )
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise TelegramWebhookRegistrationError(
            "register_telegram_webhook: enabled telegram_stars channel "
            f"config_json is invalid JSON: {exc}"
        ) from exc
    if not isinstance(parsed, dict):
        raise TelegramWebhookRegistrationError(
            "register_telegram_webhook: enabled telegram_stars channel "
            "config_json must be object"
        )
    return parsed


def _parse_deploy_config(raw_config: dict[str, Any]) -> TelegramWebhookDeployConfig:
    """把渠道 JSON 转成 webhook 注册配置。"""

    try:
        provider_config = TgStarPaymentProvider(raw_config).config
    except PaymentProviderError as exc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: invalid telegram_stars config: {exc}"
        ) from exc

    public_api_base_url = _normalize_required_http_url(
        settings.app.public_api_base_url,
        "app.public_api_base_url",
    )
    return TelegramWebhookDeployConfig(
        provider=provider_config,
        public_api_base_url=public_api_base_url,
    )


async def load_enabled_telegram_stars_config() -> TelegramWebhookDeployConfig:
    """从数据库读取启用的 Telegram Stars 渠道配置。"""

    async with get_async_session() as db:
        result = await db.execute(
            select(ConfigPaymentChannelModel)
            .where(ConfigPaymentChannelModel.enabled.is_(True))
            .where(
                ConfigPaymentChannelModel.channel_code == TELEGRAM_STARS_PAYMENT_METHOD
            )
            .limit(1)
        )
        channel = result.scalar_one_or_none()

    if channel is None:
        raise TelegramWebhookRegistrationError(
            "register_telegram_webhook: enabled telegram_stars channel not found"
        )

    return _parse_deploy_config(_load_config_json(channel.config_json))


async def health_check(config: TelegramWebhookDeployConfig) -> None:
    """确认公网 API 业务实例健康。"""

    try:
        async with httpx.AsyncClient(
            timeout=config.provider.request_timeout_seconds
        ) as client:
            response = await client.get(config.health_url)
    except httpx.HTTPError as exc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: health check request failed: "
            f"url={config.health_url}, error={_safe_error(exc, config.provider)}"
        ) from exc

    if response.status_code != 200:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: health check HTTP failed: "
            f"url={config.health_url}, status={response.status_code}, "
            f"body={_safe_error(response.text[:500], config.provider)}"
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: health check returned invalid JSON: "
            f"url={config.health_url}, body={_safe_error(response.text[:500], config.provider)}"
        ) from exc

    if not isinstance(data, dict) or data.get("msg") != "healthy":
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: health check msg is not healthy: "
            f"url={config.health_url}, response={_safe_error(data, config.provider)}"
        )


async def _post_telegram_api(
    config: TelegramWebhookDeployConfig,
    method: str,
    payload: dict[str, object] | None = None,
) -> dict[str, Any]:
    """调用 Telegram Bot API，并返回 JSON 对象。"""

    provider = config.provider
    url = provider.bot_api_url(method)
    safe_endpoint = provider.masked_bot_api_url(method)

    try:
        async with httpx.AsyncClient(
            timeout=provider.request_timeout_seconds
        ) as client:
            response = await client.post(url, json=payload or {})
    except httpx.HTTPError as exc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: Telegram {method} request failed: "
            f"endpoint={safe_endpoint}, error={_safe_error(exc, provider)}"
        ) from exc

    if response.status_code >= 400:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: Telegram {method} HTTP failed: "
            f"endpoint={safe_endpoint}, status={response.status_code}, "
            f"body={_safe_error(response.text[:500], provider)}"
        )

    try:
        data = response.json()
    except ValueError as exc:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: Telegram {method} returned invalid JSON: "
            f"endpoint={safe_endpoint}, body={_safe_error(response.text[:500], provider)}"
        ) from exc

    if not isinstance(data, dict):
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: Telegram {method} returned non-object JSON: "
            f"endpoint={safe_endpoint}, response={_safe_error(data, provider)}"
        )
    if data.get("ok") is not True:
        raise TelegramWebhookRegistrationError(
            f"register_telegram_webhook: Telegram {method} returned ok=false: "
            f"endpoint={safe_endpoint}, response={_safe_error(data, provider)}"
        )
    return data


async def set_webhook(config: TelegramWebhookDeployConfig) -> None:
    """调用 setWebhook 注册 Telegram 回调地址。"""

    payload: dict[str, object] = {
        "url": config.webhook_url,
        "secret_token": config.provider.webhook_secret_token,
    }
    await _post_telegram_api(config, "setWebhook", payload)


async def get_webhook_info_with_retry(
    config: TelegramWebhookDeployConfig,
) -> dict[str, Any]:
    """短重试读取 Telegram webhook 信息。"""

    last_info: dict[str, Any] | None = None
    for attempt in range(1, GET_WEBHOOK_INFO_RETRIES + 1):
        data = await _post_telegram_api(config, "getWebhookInfo")
        result = data.get("result")
        if not isinstance(result, dict):
            raise TelegramWebhookRegistrationError(
                "register_telegram_webhook: Telegram getWebhookInfo "
                f"returned invalid result: response={_safe_error(data, config.provider)}"
            )
        last_info = result
        if result.get("url") == config.webhook_url:
            return result
        if attempt < GET_WEBHOOK_INFO_RETRIES:
            await asyncio.sleep(GET_WEBHOOK_INFO_RETRY_SECONDS)

    assert last_info is not None
    raise TelegramWebhookRegistrationError(
        "register_telegram_webhook: Telegram webhook URL mismatch after "
        f"{GET_WEBHOOK_INFO_RETRIES} checks: expected={config.webhook_url}, "
        f"actual={last_info.get('url')}"
    )


def print_webhook_info(
    info: dict[str, Any],
    config: TelegramWebhookDeployConfig,
) -> None:
    """打印注册验收结果。"""

    print("[OK] Telegram webhook registered")
    print(f"pending_update_count: {info.get('pending_update_count', 0)}")
    print(f"last_error_date: {info.get('last_error_date')}")
    print(
        "last_error_message: "
        f"{_safe_error(info.get('last_error_message'), config.provider)}"
    )


async def run_register_telegram_webhook(*, dry_run: bool = False) -> int:
    """执行 webhook 注册流程。"""

    config = await load_enabled_telegram_stars_config()
    print(f"webhook_url: {config.webhook_url}")
    print(f"health_url: {config.health_url}")
    await health_check(config)
    print("[OK] public API health check passed")

    if dry_run:
        print("[OK] dry-run finished before setWebhook")
        return 0

    await set_webhook(config)
    info = await get_webhook_info_with_retry(config)
    print_webhook_info(info, config)
    return 0


async def _async_main() -> int:
    """异步主入口，确保退出前关闭数据库连接池。"""

    args = parse_args()
    try:
        return await run_register_telegram_webhook(dry_run=args.dry_run)
    except TelegramWebhookRegistrationError as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 2
    finally:
        await close_engine()


def main() -> int:
    """同步命令行入口。"""

    return asyncio.run(_async_main())


if __name__ == "__main__":
    raise SystemExit(main())
