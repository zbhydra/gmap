"""订阅渠道管理入口 real 测试。

真实资源依赖：
- MySQL: users / orders / user_subscriptions / config_payment_channel（配置只读）
- Redis: 用户 access token 白名单
- 外部 Clink HTTP（Customer Portal Session）用明确响应的 httpx.MockTransport 替换
"""

import json
from urllib.parse import urlsplit

import httpx
import pytest
from sqlalchemy import text

from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    MAPS_EXTENSION_PRODUCT_LINE,
    UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
)
from app.core.config import settings
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_CLINK_PORTAL_HOSTS = {
    "sandbox": "uat-portal.clinkbill.com",
    "live": "portal.clinkbill.com",
}


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


@pytest.fixture
async def real_management_schema_ready(real_mysql_ready, real_redis_ready) -> None:
    """检查管理入口 real 测试需要的真实表。"""

    required_tables = {
        "users",
        "orders",
        "user_subscriptions",
        "config_payment_channel",
    }
    missing = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


async def _load_clink_environment() -> str:
    """读取真实 Clink 渠道配置的 environment（配置表只读）。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text(
                "SELECT config_json FROM config_payment_channel "
                "WHERE channel_code = 'clink' AND enabled = 1 LIMIT 1"
            )
        )
        raw = result.scalar()
    if not raw:
        pytest.skip("REAL_CLINK_CHANNEL_UNAVAILABLE: 缺少启用的 ClinkBill 渠道配置")
    try:
        config = json.loads(raw)
    except json.JSONDecodeError as exc:
        pytest.fail(f"ClinkBill 渠道 config_json 不是合法 JSON: {exc}")
    environment = str(config.get("environment", ""))
    if environment not in _CLINK_PORTAL_HOSTS:
        pytest.skip(
            "REAL_CLINK_CHANNEL_UNAVAILABLE: ClinkBill 渠道 environment 无法识别"
        )
    return environment


async def test_real_subscription_management_creates_portal_url_per_product_line(
    real_async_client,
    real_user_factory,
    make_test_email,
    real_management_schema_ready,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """有效自动续费实例返回渠道 Portal，其他产品线无实例时拒绝。"""

    email = make_test_email("sub-management")
    user_id, token = await real_user_factory(email)

    environment = await _load_clink_environment()
    now_ms = timestamp_now()
    channel_uid = f"cust-{user_id}"
    async with get_async_session() as db:
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=EXTENSION_PRODUCT_LINE,
                product_id=UNLIMITED_SUBSCRIPTION_PRODUCT_ID,
                auto_renew=True,
                payment_method="clink",
                channel_uid=channel_uid,
                expires_at=now_ms + 86_400_000,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await db.commit()

    original_client = httpx.AsyncClient

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/billing/session"
        payload = json.loads(request.content)
        assert payload["customerId"] == channel_uid
        assert payload["returnUrl"] == "https://gmap.example.com/pricing/"
        return httpx.Response(
            200,
            json={
                "code": 200,
                "data": {"url": f"https://{_CLINK_PORTAL_HOSTS[environment]}/s/1"},
            },
        )

    def client_factory(*, timeout: float) -> httpx.AsyncClient:
        return original_client(
            timeout=timeout,
            transport=httpx.MockTransport(handler),
        )

    monkeypatch.setattr(
        "app.provider.payment.clink.httpx.AsyncClient",
        client_factory,
    )
    monkeypatch.setattr(
        settings.app, "public_website_base_url", "https://gmap.example.com"
    )

    response = await real_async_client.post(
        "/api/client/subscription/management",
        json={"product_line": EXTENSION_PRODUCT_LINE},
        headers={"Authorization": f"Bearer {token}"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.SUCCESS
    portal_url = str(body["data"]["url"])
    parsed = urlsplit(portal_url)
    assert parsed.scheme == "https"
    assert parsed.hostname == _CLINK_PORTAL_HOSTS[environment]

    missing_line = await real_async_client.post(
        "/api/client/subscription/management",
        json={"product_line": MAPS_EXTENSION_PRODUCT_LINE},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert missing_line.status_code == 400
    assert missing_line.json()["code"] == CommonCode.INVALID_REQUEST
