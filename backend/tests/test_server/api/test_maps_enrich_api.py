"""Maps Email/社媒补全 API 契约测试（013 A4，U8）。

外网 fetch 与 Redis 全部替身化：_fetch_html 返回固定 HTML，redis 换本文件级
FakeRedis；覆盖端点鉴权（device_id 契约）、入参上限、结果与入参位置对齐、
无 domain 空结果、partial 形状。
"""

import pytest

from app.constants.maps_enrich import build_enrich_cache_key
from app.services import maps_enrich_service as maps_enrich_service_module
from app.utils.redis_key import build_redis_key

# 观测位依赖（get_current_user_optional）要求携带合法 device_id。
DEVICE_ID = "maps-ext-enrich"


class _FakeRedis:
    """缓存面替身：只覆盖 get/set。"""

    def __init__(self) -> None:
        self.values: dict[str, str] = {}

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        self.values[key] = value


@pytest.mark.asyncio
async def test_maps_enrich_rejects_missing_device_id(async_client):
    """无 device_id 且无 token 的请求被拒（get_current_user_optional 契约）。"""
    response = await async_client.post(
        "/api/client/maps/enrich", json={"businesses": []}
    )

    assert response.status_code in (401, 422)


@pytest.mark.asyncio
async def test_maps_enrich_rejects_oversized_businesses(async_client):
    """businesses 超过 50 条上限拒绝（与插件分批大小一致）。"""
    businesses = [{"domain": f"site{i}.com"} for i in range(51)]
    response = await async_client.post(
        "/api/client/maps/enrich",
        json={"businesses": businesses},
        headers={"X-Device-Id": DEVICE_ID},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_maps_enrich_returns_results_aligned_with_input(
    async_client, monkeypatch
):
    """results 与入参位置对齐；无 domain 行空结果；补全命中含 emails/medias。"""
    fake_redis = _FakeRedis()

    async def fake_get_client():
        return fake_redis

    async def fake_fetch_html(url: str) -> str | None:
        if "cafe.com" in url:
            return (
                '<a href="mailto:hello@cafe.com">Mail</a>'
                '<a href="https://www.instagram.com/cafehouse/">Ig</a>'
            )
        return None

    monkeypatch.setattr(
        maps_enrich_service_module.redis_client, "get_client", fake_get_client
    )
    monkeypatch.setattr(
        maps_enrich_service_module.maps_enrich_service, "_fetch_html", fake_fetch_html
    )

    response = await async_client.post(
        "/api/client/maps/enrich",
        json={
            "businesses": [
                {"domain": "cafe.com", "website": "https://cafe.com", "name": "Cafe"},
                {"name": "No Site"},
                {"domain": "timeout.com"},
            ]
        },
        headers={"X-Device-Id": DEVICE_ID},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    assert body["data"]["partial"] is False
    assert body["data"]["results"] == [
        {
            "key": "cafe.com",
            "emails": ["hello@cafe.com"],
            "medias": {"instagram": "https://www.instagram.com/cafehouse"},
        },
        {"key": "", "emails": [], "medias": {}},
        {"key": "timeout.com", "emails": [], "medias": {}},
    ]
    # 解析成功写缓存（带全局前缀）
    assert build_redis_key(build_enrich_cache_key("cafe.com")) in fake_redis.values


@pytest.mark.asyncio
async def test_maps_enrich_empty_businesses_returns_empty_payload(async_client):
    """空数组合法：results 为空、partial=false（幂等契约）。"""
    response = await async_client.post(
        "/api/client/maps/enrich",
        json={"businesses": []},
        headers={"X-Device-Id": DEVICE_ID},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"] == {"results": [], "partial": False}
