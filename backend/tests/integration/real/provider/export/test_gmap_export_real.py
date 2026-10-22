"""真实 Run 定位文件与 Redis；只替换 Collector HTTP 出口，不证明真实采集。"""

import asyncio
import json
from dataclasses import dataclass, field
from pathlib import Path
from uuid import uuid4

import httpx
import pytest

from app.constants.gmap_collector import GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
from app.core.config import settings
from app.core.redis import redis_client
from app.provider.export.export_base import ExportProviderRequest
from app.provider.export.gmap_export import gmap_export_provider
from app.provider.gmap.collector_client import gmap_collector_client
from app.provider.gmap.enrich import _collector_cache_key, enrich_places
from app.provider.gmap.types import GmapPlaceEntry, GmapSearchResult
from app.schemas.export_item_schema import (
    ExportItemResult,
    GmapSearchItem,
    GmapSearchOptions,
)
from app.schemas.gmap_collector_schema import GmapCollectorConfig
from app.services.export_file_service import CollectorCallLocation, export_file_service

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass
class _CleanupState:
    cache_keys: list[str] = field(default_factory=list)


async def test_real_enrich_receives_new_and_restored_results_inside_existing_grace(
    real_redis_ready: None,
    tmp_path: Path,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state = _CleanupState()
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    config = GmapCollectorConfig.model_validate(
        {
            "collectors": [{"url": "http://collector.test", "api_key": "grace-test"}],
            "proxies": ["http://proxy.test:8080"],
        }
    )
    original_http = gmap_collector_client._client
    loop = asyncio.get_running_loop()
    grace = GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
    tasks: dict[str, str] = {}
    posts: list[str] = []
    received: list[float] = []
    deadline = 0.0
    site = ""
    entry: dict[str, object] = {}

    async def respond(request: httpx.Request) -> httpx.Response:
        assert request.url.host == "collector.test"
        if request.method == "POST":
            payload = json.loads(request.content)
            operation, task_id = payload["operation"], payload["task_id"]
            posts.append(operation)
            # 接收余量不能扩大新提交的执行期限。
            assert loop.time() < deadline and 0 < payload["deadline_ms"] <= 400
            tasks[task_id] = operation
            if operation == "enrich_sites":
                return httpx.Response(202, json={"task_id": task_id, "state": 20})
        else:
            task_id = request.url.path.rsplit("/", 1)[1]
            operation = tasks[task_id]
        if operation == "enrich_sites":
            await asyncio.sleep(max(0, deadline + grace / 4 - loop.time()))
            received.append(loop.time())
            body: dict[str, object] = {
                site: {"emails": ["late@example.test"], "medias": {}}
            }
        else:
            body = {"status": "ok", "entries": [entry]}
        return httpx.Response(
            200,
            json={
                "task_id": task_id,
                "state": 30,
                "response": {"http_status": 200, "body": body},
            },
        )

    try:
        async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as http:
            gmap_collector_client._client = http
            for restored in (False, True):
                job_no, run_no = uuid4().hex + "00", uuid4().hex + "00"
                site = f"https://{test_run_id}.example.test/{restored}"
                state.cache_keys.append(_collector_cache_key(site))
                entry = {
                    "name": "Grace result",
                    "fid": "0x123456789abc:0xabcdef123456",
                    "search_keyword": "grace",
                    "website": site,
                }
                if restored:
                    for operation in ("search_item", "enrich_sites"):
                        task_id = uuid4().hex
                        tasks[task_id] = operation
                        export_file_service.save_collector_call(
                            job_no=job_no,
                            run_no=run_no,
                            item_index=0,
                            operation=operation,
                            location=CollectorCallLocation(
                                task_id=task_id, collector_url="http://collector.test"
                            ),
                        )
                deadline = loop.time() + 0.4
                request = ExportProviderRequest(
                    job_no=job_no,
                    run_no=run_no,
                    options=GmapSearchOptions(items=[GmapSearchItem(keyword="grace")]),
                    include_contacts=True,
                    deadline=deadline,
                    item_results=[ExportItemResult(item_index=0)],
                )
                before = len(posts)
                page = await gmap_export_provider._collect_item(
                    request, 0, request.options.items[0], config
                )
                assert deadline < received[-1] < deadline + grace
                assert page.item_error_code is None
                assert len(page.records) == 1 and page.records[0]["emails"] == [
                    "late@example.test"
                ]
                assert posts[before:] == (
                    [] if restored else ["search_item", "enrich_sites"]
                )
            # 没有旧定位时，即使仍在接收窗口也不能新提交。
            before = len(posts)
            site = f"https://{test_run_id}.example.test/expired"
            state.cache_keys.append(_collector_cache_key(site))
            base = GmapSearchResult(
                [
                    GmapPlaceEntry(
                        name="Base",
                        fid="base-fid",
                        search_keyword="expired",
                        website=site,
                    )
                ]
            )
            result = await enrich_places(
                base,
                config=config,
                job_no=uuid4().hex + "00",
                run_no=uuid4().hex + "00",
                item_index=0,
                deadline=loop.time() - grace / 2,
            )
            assert len(posts) == before and result.entries == base.entries
    finally:
        gmap_collector_client._client = original_http
        redis = await redis_client.get_client()
        if state.cache_keys:
            await redis.delete(*state.cache_keys)
