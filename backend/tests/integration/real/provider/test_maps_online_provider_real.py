"""真实 HTTP/enrichment/CSV/SDK 组合；Redis 与文件系统真实，DNS/HTTP/OSS 网络出口替身。"""

import ast
import asyncio
import csv
import json
import socket
from io import StringIO
from pathlib import Path
from uuid import uuid4

import pytest
from botocore.client import BaseClient  # type: ignore[import-untyped]
from curl_cffi.requests import AsyncSession

from app.constants.maps_enrich import build_enrich_cache_key
from app.core.redis import redis_client
from app.provider.gmap import gmap_http_provider
from app.provider.gmap.rpc.parsers import parse_regular_response
from app.provider.maps_online import MapsOnlineProvider
from app.schemas.admin_schema import GmapEngineConfig, GosomApiItem, R2StorageConfig
from app.utils.redis_key import build_redis_key
from tests.integration.real.api.client.test_maps_integrations_real import (
    _EnrichResponse,
)
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _GoogleSession,
    _REGULAR,
    _Response,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_online_http_enrichment_csv_and_object_write(
    real_redis_ready: None,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    domain = f"online-{test_run_id}.example.com"
    cache_key = build_redis_key(build_enrich_cache_key(domain))
    redis = await redis_client.get_client()
    google = _GoogleSession()
    _GoogleSession.scenario = "l2_failure"
    _GoogleSession.urls = []
    _GoogleSession.browser_calls = 0
    websites = {
        row["website"] for row in parse_regular_response(_REGULAR) if row.get("website")
    }
    getaddrinfo = socket.getaddrinfo

    def resolve(
        host: str,
        port: int,
        family: int = 0,
        type: int = 0,
        proto: int = 0,
        flags: int = 0,
    ) -> object:
        # DNS 仅替换本次测试域名的外部出口；SSRF 公网判定继续真实执行。
        return getaddrinfo(
            "1.1.1.1" if host == domain else host, port, family, type, proto, flags
        )

    monkeypatch.setattr(socket, "getaddrinfo", resolve)

    site_started = asyncio.Event()
    site_cancelled = asyncio.Event()
    block_site = False
    submitted = asyncio.Event()
    submissions = 0
    polls = 0

    async def post(_self: AsyncSession, url: str, **kwargs: object) -> _Response:
        nonlocal submissions
        assert url == "https://gosom.test/api/v1/scrape"
        assert kwargs["json"] == {"keyword": "gosom", "max_depth": 3, "lang": "en"}
        submissions += 1
        submitted.set()
        return _Response(
            202, json.dumps({"job_id": f"job-{submissions}", "status": "pending"})
        )

    monkeypatch.setattr(AsyncSession, "post", post)

    async def get(
        _self: AsyncSession, url: str, **kwargs: object
    ) -> _Response | _EnrichResponse:
        nonlocal polls
        if url.startswith("https://gosom.test/"):
            assert url.endswith("/job-2")
            polls += 1
            if polls == 1:
                return _Response(
                    200, json.dumps({"status": "running", "result_count": 0})
                )
            return _Response(
                200,
                json.dumps(
                    {
                        "status": "completed",
                        "keyword": "gosom",
                        "result_count": 51,
                        "results": [
                            {
                                "title": f"Shop {index}",
                                "data_id": f"0x1:0x{index+1:x}",
                                "web_site": f"https://{domain}/",
                            }
                            for index in range(51)
                        ],
                    }
                ),
            )
        if kwargs.get("stream"):
            assert domain in url
            site_started.set()
            if block_site:
                try:
                    await asyncio.Event().wait()
                finally:
                    site_cancelled.set()
            return _EnrichResponse()
        response = await google.get(url, **kwargs)
        for website in websites:
            assert isinstance(website, str)
            response.text = response.text.replace(website, f"https://{domain}/")
        return response

    monkeypatch.setattr(AsyncSession, "get", get)

    objects: list[str] = []

    def api_call(
        _self: BaseClient, operation_name: str, api_params: dict[str, object]
    ) -> dict[str, object]:
        assert operation_name == "PutObject"
        assert api_params["ContentType"] == "text/csv; charset=utf-8"
        key, body = api_params["Key"], api_params["Body"]
        assert isinstance(key, str) and isinstance(body, bytes)
        destination = tmp_path / key
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(body)
        objects.append(key)
        return {"ETag": "test-etag"}

    monkeypatch.setattr(BaseClient, "_make_api_call", api_call)

    client = gmap_http_provider._client
    original = (client._init_lock, client._semaphore, client._proxies, client._session)
    client._init_lock, client._semaphore, client._proxies, client._session = (
        asyncio.Lock(),
        None,
        (),
        None,
    )
    provider = MapsOnlineProvider(
        GmapEngineConfig(
            provider="http", proxies=["http://proxy.test:8000"], concurrency=2
        ),
        R2StorageConfig(
            id=str(uuid4()),
            name="Online real",
            provider="R2",
            account_id="test",
            bucket="test",
            access_key_id="test",
            secret_access_key="test",
        ),
    )
    task_no = uuid4().hex
    # 2026-09-05 00:00 UTC 在纽约仍是 9 月 4 日。
    created_at = 1788566400000
    try:
        count, key, warning = await provider.execute(
            f'coffee, "{test_run_id}"',
            created_at=created_at,
            task_no=task_no,
            item_id=1,
        )
        assert count == 20 and "L2 supplement failed" in warning
        assert key.startswith(f"online/20260904/{task_no}/1/")
        body = (tmp_path / key).read_bytes()
        assert body.startswith(b"\xef\xbb\xbf") and body.endswith(b"\r\n")
        assert b"\n" not in body.replace(b"\r\n", b"")
        rows = list(csv.DictReader(StringIO(body.decode("utf-8-sig"))))
        script = Path(__file__).parents[3] / "fixtures/gmap/scripts/stress_test.py"
        assignment = next(
            node
            for node in ast.parse(script.read_text()).body
            if isinstance(node, ast.Assign)
            and any(
                isinstance(target, ast.Name) and target.id == "CSV_HEADERS"
                for target in node.targets
            )
        )
        assert isinstance(assignment, ast.Assign)
        headers = ast.literal_eval(assignment.value)
        assert len(headers) == 36 and list(rows[0]) == headers
        assert rows[0]["Emails"] == "owner@maps-real.example"
        assert rows[0]["Linkedin Links"] == "https://www.linkedin.com/company/maps-real"
        assert rows[0]["Search Keyword"] == f'coffee, "{test_run_id}"'
        assert await redis.get(cache_key) is not None

        _GoogleSession.scenario = "empty"
        count, empty_key, warning = await provider.execute(
            "empty", created_at=created_at, task_no=task_no, item_id=2
        )
        assert count == 0 and warning == ""
        assert list(
            csv.reader(StringIO((tmp_path / empty_key).read_text(encoding="utf-8-sig")))
        ) == [headers]

        # Online 外层期限取消 enrichment 时，所有官网子协程在返回前完成回收。
        await redis.delete(cache_key)
        site_started.clear()
        block_site = True
        _GoogleSession.scenario = "adaptive_l2"
        _GoogleSession.browser_calls = 0
        running = asyncio.create_task(
            provider.execute(
                "cancel", created_at=created_at, task_no=task_no, item_id=3
            )
        )
        try:
            await asyncio.wait_for(site_started.wait(), timeout=15)
            running.cancel()
            with pytest.raises(asyncio.CancelledError):
                await running
            assert site_cancelled.is_set()
            assert len(objects) == 2
        finally:
            running.cancel()
            await asyncio.gather(running, return_exceptions=True)

        block_site = False
        provider = MapsOnlineProvider(
            GmapEngineConfig(provider="gosom", proxies=[], concurrency=2),
            provider.storage,
            GosomApiItem(base_url="https://gosom.test", api_key="test", weight=1),
        )
        interrupted = asyncio.create_task(
            provider.execute("gosom", created_at=created_at, task_no=task_no, item_id=4)
        )
        try:
            await asyncio.wait_for(submitted.wait(), timeout=2)
        finally:
            interrupted.cancel()
            await asyncio.gather(interrupted, return_exceptions=True)
        count, gosom_key, warning = await asyncio.wait_for(
            provider.execute(
                "gosom", created_at=created_at, task_no=task_no, item_id=4
            ),
            timeout=15,
        )
        assert submissions == 2 and polls == 2
        gosom_rows = list(
            csv.DictReader(
                StringIO((tmp_path / gosom_key).read_text(encoding="utf-8-sig"))
            )
        )
        assert count == len(gosom_rows) == 51 and warning == ""
        assert all(row["Emails"] == "owner@maps-real.example" for row in gosom_rows)
        assert [row["Name"] for row in gosom_rows] == [
            f"Shop {index}" for index in range(51)
        ]
    finally:
        await redis.delete(cache_key)
        if client._session is not None:
            await client._session.close()
        client._init_lock, client._semaphore, client._proxies, client._session = (
            original
        )
