"""Maps HubSpot 与官网补全 API 的真实入口测试。

真实资源依赖：MySQL users/user_subscriptions/user_usage_logs；Redis token 白名单与补全缓存。
测试用户与订阅由 real_user_factory 登记清理，外部官网与 HubSpot HTTP 出口替换。
"""

from collections.abc import AsyncIterator, Awaitable, Callable
import asyncio
import json
import socket

import httpx
import pytest
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient
from sqlalchemy import func, select, text

import app.services.maps_hubspot_service as maps_hubspot_module
from app.constants.maps_enrich import build_enrich_cache_key
from app.constants.subscription import (
    API_BASIC_PRODUCT_ID,
    MAPS_API_PRODUCT_KIND,
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_KIND,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_ONLINE_PRODUCT_KIND,
    ONLINE_LITE_PRODUCT_ID,
)
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.utils.redis_key import build_redis_key
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_DEVICE_HEADERS = {"X-Device-Id": "maps-real-test-device"}


@pytest.fixture
async def real_enrich_subscriber(
    real_schema_ready: None,
    real_redis_ready: None,
    real_user_factory: Callable[[str], Awaitable[tuple[int, str]]],
    test_run_id: str,
) -> tuple[int, dict[str, str]]:
    """真实 Business 订阅身份，复用用户工厂的 token 与订阅清理。"""

    user_id, token = await real_user_factory(f"enrich-{test_run_id}@example.com")
    async with get_async_session() as db:
        if (
            await db.execute(text("SHOW TABLES LIKE 'user_usage_logs'"))
        ).first() is None:
            pytest.skip("REAL_SCHEMA_UNAVAILABLE: 数据库缺少 user_usage_logs 表")
        db.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_kind=MAPS_EXTENSION_PRODUCT_KIND,
                product_id=MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
                expires_at=timestamp_now() + 60_000,
            )
        )
        await db.commit()
    return user_id, {"Authorization": f"Bearer {token}", **_DEVICE_HEADERS}


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
    infos: dict = {}

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


async def test_real_maps_enrich_caches_by_website_host_ignoring_claimed_domain(
    real_async_client: AsyncClient,
    real_enrich_subscriber: tuple[int, dict[str, str]],
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实 API 将结果缓存到实际官网名下，伪造 domain 不能污染其他商家的缓存。"""

    domain = f"enrich-{test_run_id}.example.com"
    user_id, headers = real_enrich_subscriber
    claimed_domain = f"victim-{test_run_id}.example.com"
    cache_key = build_redis_key(build_enrich_cache_key(domain))
    claimed_cache_key = build_redis_key(build_enrich_cache_key(claimed_domain))
    redis = await redis_client.get_client()
    await redis.delete(cache_key, claimed_cache_key)
    requests: list[str] = []
    loop = asyncio.get_running_loop()
    original_getaddrinfo = loop.getaddrinfo

    async def getaddrinfo(
        host: str,
        port: int,
        *,
        family: int = 0,
        type: int = 0,
        proto: int = 0,
        flags: int = 0,
    ) -> list[tuple]:
        if host == domain:
            return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("1.1.1.1", port))]
        return await original_getaddrinfo(
            host, port, family=family, type=type, proto=proto, flags=flags
        )

    async def get(_self: AsyncSession, _url: str, *, stream: bool) -> _EnrichResponse:
        assert stream is True
        assert _url == f"https://{domain}/contact"
        requests.append(_url)
        return _EnrichResponse()

    monkeypatch.setattr(loop, "getaddrinfo", getaddrinfo)
    monkeypatch.setattr(AsyncSession, "get", get)
    try:
        response = await real_async_client.post(
            "/api/client/maps/enrich",
            headers=headers,
            json={
                "businesses": [
                    {
                        "domain": claimed_domain,
                        "website": f"https://{domain}/contact",
                    }
                ]
            },
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
        assert await redis.get(claimed_cache_key) is None
        cached = await real_async_client.post(
            "/api/client/maps/enrich",
            headers=headers,
            json={"businesses": [{"website": f"https://{domain}/contact"}]},
        )
        assert cached.status_code == 200
        assert cached.json()["code"] == CommonCode.SUCCESS
        assert cached.json()["data"] == body["data"]
        assert requests == [f"https://{domain}/contact"]
        async with get_async_session() as db:
            usage_count = await db.scalar(
                select(func.count())
                .select_from(UserUsageLogModel)
                .where(UserUsageLogModel.user_id == user_id)
            )
        assert usage_count == 0
    finally:
        await redis.delete(cache_key, claimed_cache_key)


async def test_real_maps_enrich_blocks_loopback_before_http_exit(
    real_async_client: AsyncClient,
    real_enrich_subscriber: tuple[int, dict[str, str]],
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
        headers=real_enrich_subscriber[1],
        json={"businesses": [{"website": "http://127.0.0.1"}]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS
    assert body["data"]["results"] == [{"key": "127.0.0.1", "emails": [], "medias": {}}]


async def test_real_maps_enrich_rejects_anonymous_and_inactive_extension_subscriptions(
    real_async_client: AsyncClient,
    real_schema_ready: None,
    real_redis_ready: None,
    real_user_factory: Callable[[str], Awaitable[tuple[int, str]]],
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """匿名、无订阅、仅云端订阅及到期插件订阅均不能抓取或读取共享补全结果。"""

    domain = f"gate-{test_run_id}.example.com"
    cache_key = build_redis_key(build_enrich_cache_key(domain))
    redis = await redis_client.get_client()
    payload = {"businesses": [{"website": f"https://{domain}"}]}
    requests: list[str] = []

    async def unexpected_get(
        _self: AsyncSession, url: str, *, stream: bool
    ) -> _EnrichResponse:
        requests.append(url)
        raise AssertionError("订阅拒绝后不应访问外部 HTTP 出口")

    monkeypatch.setattr(AsyncSession, "get", unexpected_get)
    await redis.delete(cache_key)
    try:
        anonymous = await real_async_client.post(
            "/api/client/maps/enrich", headers=_DEVICE_HEADERS, json=payload
        )
        assert anonymous.status_code == 401
        assert anonymous.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS

        user_id, token = await real_user_factory(
            f"enrich-gate-{test_run_id}@example.com"
        )
        headers = {"Authorization": f"Bearer {token}", **_DEVICE_HEADERS}
        free = await real_async_client.post(
            "/api/client/maps/enrich", headers=headers, json=payload
        )
        assert free.status_code == 200
        assert free.json()["code"] == CommonCode.MAPS_ENRICH_SUBSCRIPTION_REQUIRED
        assert await redis.get(cache_key) is None

        cached = json.dumps({"emails": ["cached@example.com"], "medias": {}})
        await redis.set(cache_key, cached, ex=60)
        async with get_async_session() as db:
            db.add_all(
                [
                    UserSubscriptionModel(  # type: ignore[call-arg]
                        user_id=user_id,
                        product_kind=kind,
                        product_id=product_id,
                        expires_at=timestamp_now() + 60_000,
                    )
                    for kind, product_id in (
                        (MAPS_ONLINE_PRODUCT_KIND, ONLINE_LITE_PRODUCT_ID),
                        (MAPS_API_PRODUCT_KIND, API_BASIC_PRODUCT_ID),
                    )
                ]
            )
            await db.commit()
        cloud_only = await real_async_client.post(
            "/api/client/maps/enrich", headers=headers, json=payload
        )
        assert cloud_only.status_code == 200
        assert cloud_only.json()["code"] == CommonCode.MAPS_ENRICH_SUBSCRIPTION_REQUIRED

        async with get_async_session() as db:
            db.add(
                UserSubscriptionModel(  # type: ignore[call-arg]
                    user_id=user_id,
                    product_kind=MAPS_EXTENSION_PRODUCT_KIND,
                    product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
                    expires_at=timestamp_now() - 1,
                )
            )
            await db.commit()
        expired = await real_async_client.post(
            "/api/client/maps/enrich", headers=headers, json=payload
        )
        assert expired.status_code == 200
        assert expired.json()["code"] == CommonCode.MAPS_ENRICH_SUBSCRIPTION_REQUIRED
        assert requests == []
        assert await redis.get(cache_key) == cached
    finally:
        await redis.delete(cache_key)
