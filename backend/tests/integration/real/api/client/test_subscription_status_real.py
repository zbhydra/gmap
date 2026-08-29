"""客户端订阅状态 real 测试。

真实资源依赖：
- MySQL: config_subscription_product / user_subscriptions
"""

from uuid import uuid4

import pytest
from sqlalchemy import text

from app.core.database import get_engine

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@pytest.fixture
async def real_subscription_status_schema_ready(real_mysql_ready) -> None:
    """检查订阅状态所需的真实表。"""

    required_tables = {
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


async def test_real_subscription_status_returns_free_plan_for_anonymous(
    real_async_client,
    real_subscription_status_schema_ready,
) -> None:
    """匿名请求返回游客免费订阅状态，且不再携带下载额度字段。"""

    response = await real_async_client.get(
        "/api/client/subscription/status",
        headers={"X-Device-Id": f"e2e-subscription-status-{uuid4().hex}"},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    assert body["data"]["period"] == "free"
    assert body["data"]["status"] == "active"
    assert "daily_limit" not in body["data"]
    assert "extension_download" not in body["data"]
