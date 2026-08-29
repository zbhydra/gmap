"""插件订阅状态配置 real 测试。

真实资源依赖：
- MySQL: config_public / config_subscription_product / user_subscriptions
- Redis: 匿名设备的插件每日额度
"""

from uuid import uuid4

import pytest
from sqlalchemy import text

from app.core.database import get_engine
from app.services.config_public_service import config_public_service

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_FEEDBACK_URL_CONFIG_KEY = "extension_telegram_feedback_url"
_FEEDBACK_GROUP_USERNAME_CONFIG_KEY = "extension_telegram_feedback_group_username"


@pytest.fixture
async def real_subscription_status_schema_ready(real_mysql_ready) -> None:
    """检查订阅状态与公共配置所需的真实表。"""

    required_tables = {
        "config_public",
        "config_subscription_product",
        "user_subscriptions",
    }
    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(text("SHOW TABLES"))
        tables = {str(row[0]) for row in result.fetchall()}

    missing = sorted(required_tables - tables)
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


async def test_real_subscription_status_returns_configured_feedback_entries(
    real_async_client,
    real_subscription_status_schema_ready,
    real_redis_ready,
) -> None:
    """匿名插件状态响应与真实公共配置中的反馈群入口一致。"""

    public_config = await config_public_service.get_lists(force_refresh=True)
    raw_feedback_url = public_config.get(_FEEDBACK_URL_CONFIG_KEY)
    raw_feedback_group_username = public_config.get(_FEEDBACK_GROUP_USERNAME_CONFIG_KEY)
    expected_feedback_url = (
        raw_feedback_url.strip() if isinstance(raw_feedback_url, str) else ""
    )
    expected_feedback_group_username = (
        raw_feedback_group_username.strip()
        if isinstance(raw_feedback_group_username, str)
        else ""
    )

    response = await real_async_client.get(
        "/api/client/subscription/status",
        headers={"X-Device-Id": f"e2e-subscription-status-{uuid4().hex}"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    assert body["data"]["telegram_feedback_url"] == expected_feedback_url
    assert (
        body["data"]["telegram_feedback_group_username"]
        == expected_feedback_group_username
    )
