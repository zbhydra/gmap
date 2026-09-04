"""Maps HubSpot 与官网补全 API 的真实入口测试。"""

from collections.abc import AsyncIterator

import httpx
import pytest
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient

import app.services.maps_hubspot_service as maps_hubspot_module
from app.constants.maps_enrich import build_enrich_cache_key
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.utils.redis_key import build_redis_key

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DEVICE_HEADERS = {"X-Device-Id": "maps-real-test-device"}


class _HubspotClient:
    """替代 HubSpot HTTP 出口并记录请求。"""

    response_status = 201
    request: dict[str, object] = {}

    def __init__(self, *, timeout: float) -> None:
        self.timeout = timeout

    async def __aenter__(self) -> "_HubspotClient":
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: object,
    ) -> None:
        return None

    async def post(
        self,
        url: str,
        *,
        headers: dict[str, str],
        json: dict[str, object],
    ) -> httpx.Response:
        type(self).request = {"url": url, "headers": headers, "json": json}
        return httpx.Response(self.response_status, json={})


class _RejectedHubspotClient(_HubspotClient):
    """返回 HubSpot token 拒绝响应。"""

    response_status = 401


class _EnrichResponse:
    """替代商家官网 HTTP 响应。"""

    is_redirect = False
    status_code = 200
    headers: dict[str, str] = {}
    charset_encoding = "utf-8"

    async def aiter_content(self) -> AsyncIterator[bytes]:
        yield (
            b'<a href="mailto:owner@maps-real.example">Email</a>'
            b'<a href="https://www.linkedin.com/company/maps-real">LinkedIn</a>'
        )

    async def aclose(self) -> None:
        return None


async def test_real_maps_hubspot_success_maps_company_and_reports_synced(
    real_async_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实 API 将商家映射到 HubSpot 出口并返回同步数量。"""

    _HubspotClient.request = {}
    monkeypatch.setattr(maps_hubspot_module.httpx, "AsyncClient", _HubspotClient)

    response = await real_async_client.post(
        "/api/client/maps/hubspot/sync",
        headers=_DEVICE_HEADERS,
        json={
            "token": "hubspot-real-token",
            "businesses": [
                {
                    "name": "Maps Real",
                    "domain": "maps-real.example",
                    "phone": "",
                    "address": "1 Test Road",
                    "city": "Test City",
                }
            ],
        },
    )

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == {"synced": 1}
    assert _HubspotClient.request["headers"] == {
        "Authorization": "Bearer hubspot-real-token"
    }
    assert _HubspotClient.request["json"] == {
        "inputs": [
            {
                "properties": {
                    "name": "Maps Real",
                    "domain": "maps-real.example",
                    "address": "1 Test Road",
                    "city": "Test City",
                }
            }
        ]
    }


async def test_real_maps_hubspot_rejection_maps_to_business_error(
    real_async_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """HubSpot 拒绝 token 时真实 API 返回稳定业务错误码。"""

    monkeypatch.setattr(
        maps_hubspot_module.httpx, "AsyncClient", _RejectedHubspotClient
    )

    response = await real_async_client.post(
        "/api/client/maps/hubspot/sync",
        headers=_DEVICE_HEADERS,
        json={"token": "rejected-token", "businesses": [{"name": "Maps Real"}]},
    )

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.MAPS_HUBSPOT_SYNC_FAILED


async def test_real_maps_enrich_success_returns_contacts_and_caches_result(
    real_async_client: AsyncClient,
    real_redis_ready: None,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实 API 解析官网出口响应并把结果写入真实 Redis 缓存。"""

    domain = f"enrich-{test_run_id}.example.com"
    cache_key = build_redis_key(build_enrich_cache_key(domain))
    redis = await redis_client.get_client()
    await redis.delete(cache_key)

    async def get(_self: AsyncSession, _url: str, *, stream: bool) -> _EnrichResponse:
        assert stream is True
        return _EnrichResponse()

    monkeypatch.setattr(AsyncSession, "get", get)
    try:
        response = await real_async_client.post(
            "/api/client/maps/enrich",
            headers=_DEVICE_HEADERS,
            json={"businesses": [{"domain": domain, "website": "https://1.1.1.1"}]},
        )

        assert response.status_code == 200
        body = response.json()
        assert body["code"] == CommonCode.SUCCESS
        assert body["data"]["results"] == [
            {
                "key": domain,
                "emails": ["owner@maps-real.example"],
                "medias": {"linkedin": "https://www.linkedin.com/company/maps-real"},
            }
        ]
        assert await redis.get(cache_key) is not None
        assert await redis.ttl(cache_key) > 0
    finally:
        await redis.delete(cache_key)


async def test_real_maps_enrich_blocks_loopback_before_http_exit(
    real_async_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """用户 URL 指向环回地址时 SSRF 边界在 HTTP 出口前拒绝。"""

    async def unexpected_get(
        _self: AsyncSession, _url: str, *, stream: bool
    ) -> _EnrichResponse:
        raise AssertionError("SSRF 拒绝后不应访问外部 HTTP 出口")

    monkeypatch.setattr(AsyncSession, "get", unexpected_get)
    response = await real_async_client.post(
        "/api/client/maps/enrich",
        headers=_DEVICE_HEADERS,
        json={
            "businesses": [
                {"domain": "invalid/cache-key", "website": "http://127.0.0.1"}
            ]
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS
    assert body["data"]["results"] == [
        {"key": "invalid/cache-key", "emails": [], "medias": {}}
    ]
