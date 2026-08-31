"""Maps 月度配额 API real 测试（013 A11，U7）。

真实资源依赖：
- MySQL: config_public（配额总量读取）
- Redis: 月度用量与幂等键（Lua 扣减脚本）

用随机 device_id / request_id 隔离，残留 key 由 TTL 自然过期，无 DB 写入。
"""

from uuid import uuid4

import pytest

from app.constants.maps_usage import build_dedup_key, build_usage_key
from app.core.redis import redis_client
from app.utils.redis_key import build_redis_key
from app.i18n.common_code import CommonCode

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


def _device_header() -> dict[str, str]:
    """每用例独立 device_id，配额计数互不污染。"""

    return {"X-Device-Id": f"maps-usage-{uuid4().hex}"}


def _usage_payload(body: dict) -> dict:
    """剥响应信封，返回 data 载荷。"""

    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


async def test_real_usage_returns_fresh_quota_for_anonymous(
    real_async_client, real_redis_ready
) -> None:
    """匿名设备首次查询：used=0、total 默认 1000、exhausted=false、period 形如 YYYY-MM。"""
    response = await real_async_client.get(
        "/api/client/maps/usage", headers=_device_header()
    )
    body = _usage_payload(response.json())

    assert response.status_code == 200
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

    assert response.status_code in (401, 422)


async def test_real_usage_report_deducts_and_is_idempotent(
    real_async_client, real_redis_ready
) -> None:
    """上报扣减后 used 增加；同 request_id 重放只扣一次（幂等命中 deducted=false）。"""
    headers = _device_header()
    request_id = uuid4().hex

    first = _usage_payload(
        (
            await real_async_client.post(
                "/api/client/maps/usage/report",
                json={"records": 20, "request_id": request_id},
                headers=headers,
            )
        ).json()
    )
    replay = _usage_payload(
        (
            await real_async_client.post(
                "/api/client/maps/usage/report",
                json={"records": 20, "request_id": request_id},
                headers=headers,
            )
        ).json()
    )
    after = _usage_payload(
        (await real_async_client.get("/api/client/maps/usage", headers=headers)).json()
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
        (
            await real_async_client.post(
                "/api/client/maps/usage/report",
                json={"records": 3, "request_id": request_id},
                headers={"X-Device-Id": device_id},
            )
        ).json()
    )

    usage_subkey, _ = build_usage_key(f"d:{device_id}")
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

    await real_async_client.post(
        "/api/client/maps/usage/report",
        json={"records": 5, "request_id": uuid4().hex},
        headers=headers,
    )
    second = _usage_payload(
        (
            await real_async_client.post(
                "/api/client/maps/usage/report",
                json={"records": 7, "request_id": uuid4().hex},
                headers=headers,
            )
        ).json()
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
    after = _usage_payload(
        (await real_async_client.get("/api/client/maps/usage", headers=headers)).json()
    )
    assert after["used"] == 0


async def test_real_usage_exhausted_when_used_reaches_total(
    real_async_client, real_redis_ready
) -> None:
    """used >= total 时 exhausted=true（用超过默认配额的单笔上报触顶）。"""
    headers = _device_header()
    total = _usage_payload(
        (await real_async_client.get("/api/client/maps/usage", headers=headers)).json()
    )["total"]

    reached = _usage_payload(
        (
            await real_async_client.post(
                "/api/client/maps/usage/report",
                json={"records": total, "request_id": uuid4().hex},
                headers=headers,
            )
        ).json()
    )

    assert reached["used"] == total
    assert reached["exhausted"] is True
