"""预览真实入口与权益边界：真实 MySQL/Redis，只替换 Google HTTP 出口。"""

from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import pytest
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient
from sqlalchemy import func, select

from app.api.client.maps_online_client import _preview_limiter
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.maps_engine_service import maps_engine_service
from tests.integration.real.provider.gmap.test_http_orchestration_real import _Response

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_preview_boundary_and_options(
    real_async_client: AsyncClient,
    real_mysql_ready: None,
    real_redis_ready: None,
    real_user_factory,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    if not (await maps_engine_service.get_config()).proxies:
        pytest.skip("REAL_GMAP_PROXY_UNAVAILABLE: 当前引擎无代理配置")
    raw = (
        Path(__file__).parents[4] / "fixtures/gmap/raw/regular_pb_response.txt"
    ).read_text()
    urls: list[str] = []

    async def google_get(_self: AsyncSession, url: str, **kwargs: object) -> _Response:
        urls.append(url)
        if url.startswith("https://www.google.com/maps?hl="):
            return _Response(200, "maps", nid="test-nid")
        parsed = urlsplit(url)
        assert parsed.path == "/search" and "authuser" in parse_qs(parsed.query)
        return _Response(200, raw)

    monkeypatch.setattr(AsyncSession, "get", google_get)
    client = real_async_client
    ip = f"preview-{test_run_id}"
    headers = {"CF-Connecting-IP": ip}
    async with get_async_session() as db:
        before = [
            await db.scalar(select(func.count()).select_from(model))
            for model in (MapsOnlineTaskModel, UserUsageLogModel)
        ]
    try:
        response = await client.post(
            "/api/client/maps-online/preview",
            headers=headers,
            json={
                "keyword": "  coffee in Portland  ",
                "include_contacts": True,
                "max_depth": 10,
            },
        )
        assert response.status_code == 200
        assert response.json()["code"] == CommonCode.SUCCESS, response.text
        assert response.headers["cache-control"] == "no-store"
        data = response.json()["data"]
        assert 3 <= data["count"] <= 20 and len(data["rows"]) == 3
        assert all(
            set(row)
            == {"name", "address", "category", "rating", "review_count", "phone"}
            for row in data["rows"]
        )
        assert len(urls) == 2
        for _ in range(2):
            assert (
                await client.post(
                    "/api/client/maps-online/preview",
                    headers=headers,
                    json={"keyword": "coffee"},
                )
            ).json()["code"] == CommonCode.SUCCESS
        count = len(urls)
        assert (
            await client.post(
                "/api/client/maps-online/preview",
                headers=headers,
                json={"keyword": "coffee"},
            )
        ).json()["code"] == CommonCode.RATE_LIMIT_EXCEEDED
        assert len(urls) == count
        for keyword in ("", "a\nb", "a" * 501):
            assert (
                await client.post(
                    "/api/client/maps-online/preview", json={"keyword": keyword}
                )
            ).json()["code"] == CommonCode.VALIDATION_ERROR
        assert len(urls) == count
        async with get_async_session() as db:
            after = [
                await db.scalar(select(func.count()).select_from(model))
                for model in (MapsOnlineTaskModel, UserUsageLogModel)
            ]
        assert before == after
        assert (
            await client.post(
                "/api/client/maps-online/tasks", json={"keywords": ["coffee"]}
            )
        ).status_code == 401
        user_id, token = await real_user_factory(f"preview-{test_run_id}@example.com")
        auth = {"Authorization": f"Bearer {token}"}
        options = await client.get("/api/client/maps-online/options", headers=auth)
        assert (
            options.status_code == 200 and options.json()["code"] == CommonCode.SUCCESS
        )
        constraints = options.json()["data"]
        assert constraints["contacts_allowed"] is False
        assert constraints["usage"]["used"] == 0
        response = await client.post(
            "/api/client/maps-online/tasks",
            headers=auth,
            json={
                "keywords": [str(i) for i in range(constraints["keyword_limit"] + 1)]
            },
        )
        assert (
            response.status_code == 200
            and response.json()["code"] == CommonCode.VALIDATION_ERROR
        )
    finally:
        await _preview_limiter.reset(ip, 60)
