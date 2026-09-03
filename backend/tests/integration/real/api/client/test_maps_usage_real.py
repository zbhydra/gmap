"""Maps 月度配额 API real 测试（013 A11，U7；额度基建 U5 双轨回归）。

真实资源依赖：
- MySQL: user_usage_logs（登录用户用量流水）/ user_subscriptions /
  config_subscription_product（free 档 monthly_quota）/ users
- Redis: 匿名月度用量与幂等键（Lua 扣减脚本）、用户 access token 白名单

匿名用例用随机 device_id / request_id 隔离，残留 key 由 TTL 自然过期；
登录用例创建真实用户并复用其 user_id，结束后删除流水行与用户。

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
GET /maps/usage | Y(匿名+登录) | Y(无身份 401/422) | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A(只读)
POST /maps/usage/report | Y(匿名+登录+幂等重放) | centralized(同 GET 可选鉴权依赖) | N/A | Y(records=0 → 422) | Y(records=total 触顶) | N/A(request_id 模式限长) | N/A(纯数值/受控字符字段) | N/A(同左) | N/A(同左) | Y(Redis key + MySQL 流水行断言)
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from uuid import uuid4

import pytest
from httpx import Response
from sqlalchemy import delete, select

from app.constants.auth import TokenType
from app.constants.subscription import MAPS_EXTENSION_PRODUCT_LINE
from app.constants.usage import build_dedup_key, build_usage_key
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.user_model import UserModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.user_service import UserService
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit
from app.utils.redis_key import build_redis_key

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass(slots=True)
class _CleanupState:
    """记录本文件创建的真实测试用户。"""

    users: list[tuple[int, str]] = field(default_factory=list)


def _device_header() -> dict[str, str]:
    """每用例独立 device_id，配额计数互不污染。"""

    return {"X-Device-Id": f"maps-usage-{uuid4().hex}"}


def _usage_payload(response: Response) -> dict:
    """校验成功响应并返回 data 载荷。"""

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


async def _delete_usage_user(user_id: int) -> None:
    """按用量流水、用户顺序清理测试数据与 Redis token。"""

    await user_token_service.revoke_all_user_tokens(user_id)
    async with get_async_session() as db:
        await db.execute(
            delete(UserUsageLogModel).where(UserUsageLogModel.user_id == user_id)
        )
        await db.execute(delete(UserModel).where(UserModel.user_id == user_id))
        await db.commit()


async def _create_user_and_headers(
    email: str, state: _CleanupState
) -> tuple[UserModel, dict[str, str]]:
    """创建真实用户和严格鉴权请求头（MySQL 用量路径）。"""

    user = await UserService().create_user_without_password(email=email)
    state.users.append((user.user_id, email))
    token, expires_at = JwtUnit.create_access_token(
        JwtData(user_id=user.user_id, email=email)
    )
    await user_token_service.store_token(
        token, user.user_id, TokenType.USER_ACCESS, expires_at
    )
    return user, {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def real_usage_api_cleanup(
    real_mysql_ready: None, real_redis_ready: None
) -> AsyncIterator[_CleanupState]:
    """登记本文件创建的登录用户，结束后清理其流水与账号。"""

    state = _CleanupState()
    try:
        yield state
    finally:
        for user_id, _email in state.users:
            await _delete_usage_user(user_id)


async def test_real_usage_returns_fresh_quota_for_anonymous(
    real_async_client, real_redis_ready
) -> None:
    """匿名设备首次查询：used=0、total 为本线 free 档、period 形如 YYYY-MM。"""
    response = await real_async_client.get(
        "/api/client/maps/usage", headers=_device_header()
    )
    body = _usage_payload(response)

    assert body["used"] == 0
    assert body["total"] >= 1
    assert body["exhausted"] is False
    assert len(body["period"]) == 7
    assert body["period"][4] == "-"


async def test_real_usage_requires_device_id(
    real_async_client, real_redis_ready
) -> None:
    """无 device_id 且无 token 的请求被拒（get_current_user_optional 契约）。"""
    response = await real_async_client.get("/api/client/maps/usage")

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS


async def test_real_usage_report_deducts_and_is_idempotent(
    real_async_client, real_redis_ready
) -> None:
    """匿名上报扣减后 used 增加；同 request_id 重放只扣一次（幂等命中 deducted=false）。"""
    headers = _device_header()
    request_id = uuid4().hex

    first = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 20, "request_id": request_id},
            headers=headers,
        )
    )
    replay = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 20, "request_id": request_id},
            headers=headers,
        )
    )
    after = _usage_payload(
        await real_async_client.get("/api/client/maps/usage", headers=headers)
    )

    assert first["deducted"] is True
    assert first["used"] == 20
    # 重放：不重复扣减，used 与最新查询一致
    assert replay["deducted"] is False
    assert replay["used"] == 20
    assert after["used"] == 20
    assert after["exhausted"] is False


async def test_real_usage_report_writes_prefixed_redis_keys(
    real_async_client, real_redis_ready
) -> None:
    """写入的用量/幂等 key 必须带全局前缀，裸业务子键不存在（spec-redis §2）。

    F1 回归锚：service 层负责用 build_redis_key() 包裹 constants 返回的
    业务子键；若有人改回裸 key，本用例通过「带前缀 key 存在 + 裸子键不存在」
    双向断言拦截。
    """
    device_id = _device_header()["X-Device-Id"]
    request_id = uuid4().hex

    _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 3, "request_id": request_id},
            headers={"X-Device-Id": device_id},
        )
    )

    usage_subkey, _ = build_usage_key(MAPS_EXTENSION_PRODUCT_LINE, f"d:{device_id}")
    prefixed_usage_key = build_redis_key(usage_subkey)
    prefixed_dedup_key = build_redis_key(build_dedup_key(request_id))

    redis = await redis_client.get_client()
    assert await redis.exists(prefixed_usage_key) == 1
    assert await redis.exists(prefixed_dedup_key) == 1
    # 裸子键（缺全局前缀）必须不存在
    assert await redis.exists(usage_subkey) == 0
    assert await redis.exists(build_dedup_key(request_id)) == 0


async def test_real_usage_report_accumulates_across_requests(
    real_async_client, real_redis_ready
) -> None:
    """不同 request_id 的上报独立累计。"""
    headers = _device_header()

    first_response = await real_async_client.post(
        "/api/client/maps/usage/report",
        json={"records": 5, "request_id": uuid4().hex},
        headers=headers,
    )
    _usage_payload(first_response)
    second = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 7, "request_id": uuid4().hex},
            headers=headers,
        )
    )

    assert second["used"] == 12


async def test_real_usage_report_rejects_invalid_records(
    real_async_client, real_redis_ready
) -> None:
    """records<=0 走 pydantic 校验（422），不产生扣减。"""
    headers = _device_header()
    response = await real_async_client.post(
        "/api/client/maps/usage/report",
        json={"records": 0, "request_id": uuid4().hex},
        headers=headers,
    )

    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR
    after = _usage_payload(
        await real_async_client.get("/api/client/maps/usage", headers=headers)
    )
    assert after["used"] == 0


async def test_real_usage_exhausted_when_used_reaches_total(
    real_async_client, real_redis_ready
) -> None:
    """used >= total 时 exhausted=true（用超过默认配额的单笔上报触顶）。"""
    headers = _device_header()
    total = _usage_payload(
        await real_async_client.get("/api/client/maps/usage", headers=headers)
    )["total"]

    reached = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": total, "request_id": uuid4().hex},
            headers=headers,
        )
    )

    assert reached["used"] == total
    assert reached["exhausted"] is True


async def test_real_logged_in_usage_reads_free_quota_and_deducts_via_mysql(
    real_async_client, real_usage_api_cleanup
) -> None:
    """登录用户两路由走 MySQL 流水：free 档 total、扣减、同请求幂等。

    额度基建 U5 回归锚：登录路径的 used 来自 user_usage_logs SUM(delta)，
    不再触碰匿名 Redis key（headers 无 device_id，identity = u:{user_id}）。
    """
    email = f"maps-usage-{uuid4().hex}@test.mapsgrab.com"
    user, headers = await _create_user_and_headers(email, real_usage_api_cleanup)
    request_id = uuid4().hex

    initial = _usage_payload(
        await real_async_client.get("/api/client/maps/usage", headers=headers)
    )
    first = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 15, "request_id": request_id},
            headers=headers,
        )
    )
    replay = _usage_payload(
        await real_async_client.post(
            "/api/client/maps/usage/report",
            json={"records": 15, "request_id": request_id},
            headers=headers,
        )
    )
    after = _usage_payload(
        await real_async_client.get("/api/client/maps/usage", headers=headers)
    )

    assert initial["used"] == 0
    assert initial["total"] == 1000
    assert first["deducted"] is True
    assert first["used"] == 15
    assert replay["deducted"] is False
    assert replay["used"] == 15
    assert after["used"] == 15

    # 副作用断言：流水行落在该用户名下，delta=15 只有一行
    async with get_async_session() as db:
        rows = await db.execute(
            select(UserUsageLogModel.delta).where(
                UserUsageLogModel.user_id == user.user_id
            )
        )
        deltas = [int(row[0]) for row in rows]
    assert deltas == [15]
