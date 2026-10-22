"""只替换外部 Collector HTTP 出口；本文件不依赖 DB/Redis，不证明真实 Google 采集。"""

import asyncio
import json
import re
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Literal, TypedDict
from uuid import uuid4

import httpx
import pytest

from app.core.config import settings
from app.provider.gmap import collector_client
from app.provider.gmap.collector_client import (
    GmapCollectorClient,
    GmapCollectorDeadlineError,
    GmapCollectorError,
    parse_contacts_response,
    parse_search_response,
)
from app.schemas.gmap_collector_schema import GmapCollectorConfig, GmapCollectorInstance
from app.services.export_file_service import export_file_service

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
FID = "0x123456789abc:0xabcdef123456"
CONFIG = GmapCollectorConfig.model_validate(
    {
        "collectors": [{"url": "http://collector.test/", "api_key": "test-key"}],
        "proxies": [f"http://proxy-{index}.test:8080" for index in range(4)],
    }
)


class _SearchArguments(TypedDict):
    job_no: str
    item_index: int
    deadline: float
    mode: Literal["export", "preview"]
    keyword: str
    max_results: int
    google_hl: str
    region: str | None
    viewport: dict[str, float | int] | None
    proxies: list[str]


class _TrickleStream(httpx.AsyncByteStream):
    async def __aiter__(self) -> AsyncIterator[bytes]:
        while True:
            await asyncio.sleep(0.005)
            yield b" "


async def test_real_four_operations_validate_results_budget_and_cancellation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    response_body: object = {"status": "ok", "reviews": [], "next_cursor": "next"}
    response_status = 200
    calls: list[dict[str, object]] = []
    started = asyncio.Event()
    slow = False
    hold = False

    async def respond(request: httpx.Request) -> httpx.Response:
        if request.method == "GET":
            assert request.url == f"http://collector.test/tasks/{calls[-1]['task_id']}"
            return httpx.Response(response_status, json=response_body)
        assert request.url == "http://collector.test/"
        assert request.headers["X-API-Key"] == "test-key"
        payload = json.loads(request.content)
        calls.append(payload)
        assert re.fullmatch(r"[0-9a-f]{32}", payload["task_id"])
        assert "run_no" not in payload
        assert payload["item_index"] == 0
        assert 0 < payload["deadline_ms"] <= 180_000
        if hold:
            started.set()
            await asyncio.Event().wait()
        if slow:
            return httpx.Response(200, stream=_TrickleStream())
        return httpx.Response(response_status, json=response_body)

    client = GmapCollectorClient()
    client._client = httpx.AsyncClient(transport=httpx.MockTransport(respond))
    arguments = {"request_id": "media-test", "fid": FID}
    try:
        page = await client.list_reviews(
            CONFIG, **arguments, sort_by=2, cursor="opaque+/=", hl="fr"
        )
        assert not page.reviews and page.next_cursor == "next"
        assert calls[-1]["cursor"] == "opaque+/="
        assert calls[-1]["sort_by"] == 2 and calls[-1]["google_hl"] == "fr"
        assert calls[-1]["proxies"] == [{"url": proxy} for proxy in CONFIG.proxies[:3]]
        response_body = {
            "status": "partial",
            "photos": [{"url": "https://lh3.googleusercontent.com/photo"}],
            "returned_count": 1,
            "reported_total": 10,
            "reason": "pagination_unverified",
        }
        photos = await client.list_photos(CONFIG, **arguments, max_results=2)
        assert photos.returned_count == len(photos.photos) == 1
        assert photos.status == "partial" and photos.reported_total == 10
        assert calls[-1]["google_hl"] == "en" and calls[-1]["max_results"] == 2
        assert calls[-1]["task_id"] != calls[-2]["task_id"]
        for response_body in (
            {"status": "failed", "photos": [], "reason": "empty_unverified"},
            {"status": "partial", "photos": [], "returned_count": 1},
            {"status": "partial", "photos": [{"url": "x"}]},
        ):
            with pytest.raises(GmapCollectorError, match="invalid_response"):
                await client.list_photos(CONFIG, **arguments, max_results=2)
        response_status = 503
        with pytest.raises(GmapCollectorError, match="http_503"):
            await client.list_photos(CONFIG, **arguments, max_results=2)
        response_status = 200
        response_body = {"status": "ok", "entries": []}
        search_args: _SearchArguments = {
            "job_no": "search-test",
            "item_index": 0,
            "deadline": asyncio.get_running_loop().time() + 10,
            "mode": "preview",
            "keyword": "coffee",
            "max_results": 3,
            "google_hl": "ja",
            "region": None,
            "viewport": {"lat": 40, "lng": -73, "zoom": 15},
            "proxies": CONFIG.proxies,
        }
        result = await client.search_item(CONFIG, **search_args)
        assert result.status == "ok" and not result.result.entries
        response_body = {
            "status": "partial",
            "entries": [{"fid": FID, "name": "Cafe", "search_keyword": "coffee"}],
        }
        result = await client.search_item(CONFIG, **search_args)
        assert result.result.partial and result.result.entries[0].claimed is None
        response_body = {"status": "failed", "entries": []}
        assert (await client.search_item(CONFIG, **search_args)).status == "failed"
        response_body = {"https://cafe.test/contact": {"emails": [], "medias": {}}}
        contacts = await client.enrich_sites(
            CONFIG,
            job_no="search-test",
            item_index=0,
            deadline=asyncio.get_running_loop().time() + 10,
            sites=["https://cafe.test/contact"],
            proxy=CONFIG.proxies[0],
        )
        assert list(contacts) == ["https://cafe.test/contact"]
        assert calls[-1]["sites"] == [{"cache_key": "https://cafe.test/contact"}]
        for parse in (parse_search_response, parse_contacts_response):
            with pytest.raises(GmapCollectorError, match="invalid_response"):
                parse(b'{"queues":{}}')
        count = len(calls)
        with pytest.raises(GmapCollectorError, match="not_configured"):
            await client.list_photos(
                GmapCollectorConfig(proxies=CONFIG.proxies), **arguments, max_results=2
            )
        with pytest.raises(GmapCollectorError, match="no_proxy"):
            await client.list_photos(
                GmapCollectorConfig(collectors=CONFIG.collectors),
                **arguments,
                max_results=2,
            )
        assert len(calls) == count
        hold = True
        task = asyncio.create_task(
            client.list_photos(CONFIG, **arguments, max_results=2)
        )
        await asyncio.wait_for(started.wait(), 1)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        hold, slow = False, True
        # 时间边界缩短，不替换任何业务方法。
        monkeypatch.setattr(collector_client, "GMAP_MEDIA_BUDGET_SECONDS", 0.03)
        with pytest.raises(GmapCollectorDeadlineError):
            await asyncio.wait_for(
                client.list_photos(CONFIG, **arguments, max_results=2), timeout=0.2
            )
    finally:
        await client.aclose()
    assert client._client is None


async def test_real_unknown_query_failure_does_not_resubmit_on_another_collector(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    config = GmapCollectorConfig(
        collectors=[
            *CONFIG.collectors,
            GmapCollectorInstance(
                url="http://second-collector.test", api_key="test-key"
            ),
        ],
        proxies=CONFIG.proxies,
    )
    calls: list[tuple[str, str]] = []
    first_url = ""
    task_id = ""
    first_payload: dict[str, object] = {}
    terminal = False
    unknown_submission = False

    async def respond(request: httpx.Request) -> httpx.Response:
        nonlocal first_url, task_id, first_payload
        calls.append((request.method, str(request.url)))
        if request.method == "POST":
            if request.url.path == "/tasks" and not unknown_submission:
                return httpx.Response(503, json={"error": "overloaded"})
            if not first_url:
                first_url = str(request.url.copy_with(path="/")).rstrip("/")
                first_payload = json.loads(request.content)
                task_id = str(first_payload["task_id"])
                if unknown_submission:
                    return httpx.Response(502, text="<html>Bad Gateway</html>")
                raise httpx.ReadError("submission response lost", request=request)
            return httpx.Response(
                200, json={"status": "ok", "reviews": [], "next_cursor": None}
            )
        assert str(request.url) == f"{first_url}/tasks/{task_id}"
        if terminal:
            return httpx.Response(
                200,
                json={
                    "task_id": task_id,
                    "state": 30,
                    "response": {
                        "http_status": 200 if unknown_submission else 500,
                        "body": (
                            {"status": "ok", "entries": []}
                            if unknown_submission
                            else {"error": "result_write_failed"}
                        ),
                    },
                },
            )
        return httpx.Response(502, json={"error": "bad_gateway"})

    client = GmapCollectorClient()
    client._client = httpx.AsyncClient(transport=httpx.MockTransport(respond))
    try:
        with pytest.raises(GmapCollectorError, match="http_502") as unknown:
            await client.list_reviews(
                config,
                request_id="query-failure",
                fid=FID,
                sort_by=1,
                cursor=None,
                hl="en",
            )
        assert not unknown.value.switchable
        assert calls == [
            ("POST", f"{first_url}/"),
            ("GET", f"{first_url}/tasks/{task_id}"),
        ]
        original = next(item for item in config.collectors if item.url == first_url)
        deadline = asyncio.get_running_loop().time() + 10
        terminal = True
        with pytest.raises(GmapCollectorError, match="result_write_failed") as finished:
            await client.query_task(original, task_id=task_id, deadline=deadline)
        assert finished.value.switchable
        with pytest.raises(GmapCollectorError, match="overloaded") as rejected:
            await client.submit_task(
                original,
                task_id=uuid4().hex,
                payload=first_payload,
                deadline=deadline,
            )
        assert rejected.value.switchable
        unknown_submission = True
        for run_no in (None, uuid4().hex + "00"):
            calls.clear()
            first_url = task_id = ""
            job_no = uuid4().hex + "00"
            recovered = await client.search_item(
                config,
                job_no=job_no,
                run_no=run_no,
                item_index=0,
                deadline=asyncio.get_running_loop().time() + 10,
                mode="export",
                keyword="unknown submission",
                max_results=2,
                google_hl="en-US",
                region=None,
                viewport=None,
                proxies=config.proxies,
            )
            assert recovered.status == "ok" and not recovered.result.entries
            assert calls == [
                ("POST", f"{first_url}{'/tasks' if run_no else '/'}"),
                ("GET", f"{first_url}/tasks/{task_id}"),
            ]
            if run_no is not None:
                location = export_file_service.read_collector_call(
                    job_no=job_no,
                    run_no=run_no,
                    item_index=0,
                    operation="search_item",
                )
                assert location is not None
                assert location.task_id == task_id
                assert location.collector_url == first_url
    finally:
        await client.aclose()


async def test_real_async_protocol_keeps_id_instance_and_inner_status(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    task_id = uuid4().hex
    collector = CONFIG.collectors[0]
    calls: list[tuple[str, str]] = []
    state = 10
    inner_status = 200
    status = 200
    returned_id = task_id
    lost_submission = False
    trickle = False

    async def respond(request: httpx.Request) -> httpx.Response:
        nonlocal state
        assert request.headers["X-API-Key"] == "test-key"
        calls.append((request.method, str(request.url)))
        if request.method == "POST":
            payload = json.loads(request.content)
            assert payload["task_id"] == task_id
            assert 0 < payload["deadline_ms"] <= 10_000
            if lost_submission:
                raise httpx.ReadError("SECRET", request=request)
        else:
            assert request.url == f"http://collector.test/tasks/{task_id}"
            if trickle:
                return httpx.Response(200, stream=_TrickleStream())
        if status != 200:
            return httpx.Response(status, json={"error": "task_not_found"})
        operation_body: dict[str, object] = (
            {"error": "deadline_exceeded"}
            if inner_status == 503
            else {"status": "ok", "entries": []}
        )
        envelope: dict[str, object] = {
            "task_id": returned_id,
            "state": state,
            "response": {
                "http_status": inner_status,
                "body": operation_body,
            },
        }
        if state != 30:
            state = 30
            return httpx.Response(202, json={"task_id": task_id, "state": 10})
        return httpx.Response(200, json=envelope)

    client = GmapCollectorClient()
    client._client = httpx.AsyncClient(transport=httpx.MockTransport(respond))
    payload = {"operation": "search_item", "job_no": "job", "item_index": 0}
    try:
        deadline = asyncio.get_running_loop().time() + 10
        assert (
            await client.submit_task(
                collector, task_id=task_id, payload=payload, deadline=deadline
            )
            is None
        )
        state = 20
        result = await client.wait_for_task(
            collector, task_id=task_id, deadline=deadline
        )
        assert parse_search_response(result).status == "ok"
        assert len(calls) == 3
        assert (
            await client.submit_task(
                collector, task_id=task_id, payload=payload, deadline=deadline
            )
            == result
        )
        inner_status = 503
        with pytest.raises(GmapCollectorDeadlineError):
            await client.query_task(collector, task_id=task_id, deadline=deadline)
        inner_status, returned_id = 200, uuid4().hex
        with pytest.raises(GmapCollectorError, match="task_id_mismatch"):
            await client.query_task(collector, task_id=task_id, deadline=deadline)
        status, returned_id = 404, task_id
        with pytest.raises(GmapCollectorError, match="task_not_found"):
            await client.query_task(collector, task_id=task_id, deadline=deadline)
        status, lost_submission = 200, True
        with pytest.raises(GmapCollectorError, match="transport"):
            await client.submit_task(
                collector, task_id=task_id, payload=payload, deadline=deadline
            )
        # 未确认受理的调用接回原实例；不提交第二个地址，也不领取代理。
        assert (
            parse_search_response(
                await client.wait_for_task(
                    collector, task_id=task_id, deadline=deadline
                )
            ).status
            == "ok"
        )
        assert all("collector.test" in url for _, url in calls)
        trickle = True
        monkeypatch.setattr(
            collector_client, "GMAP_COLLECTOR_QUERY_TIMEOUT_SECONDS", 0.02
        )
        with pytest.raises(GmapCollectorError, match="timeout"):
            await client.query_task(collector, task_id=task_id, deadline=deadline)
        with pytest.raises(GmapCollectorDeadlineError):
            await client.wait_for_task(
                collector, task_id=task_id, deadline=asyncio.get_running_loop().time()
            )
    finally:
        await client.aclose()
