"""地图任务真实入口、父快照与交付计量；只替换 Google 和 OSS 出口。"""

import asyncio
import csv
from io import StringIO
from urllib.parse import unquote

import pytest
from botocore.client import BaseClient  # type: ignore[import-untyped]
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient
from sqlalchemy import text

import app.services.maps_online_task_service as service_module
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import maps_online_task_service as service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.usage_service import online_usage_service, usage_identity
from tests.integration.real.api.client.conftest import _CleanupState
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _GoogleSession,
    _Response,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
_ENDPOINT = "/api/client/maps-online/tasks"


async def test_real_online_map_snapshot_partial_delivery_and_budget(
    real_async_client: AsyncClient,
    real_online_api_cleanup: _CleanupState,
    real_user_factory,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    storage = await object_storage_config_service.get_active()
    engine = await maps_engine_service.get_config()
    if storage is None or storage.provider != "R2" or engine.provider != "http":
        pytest.skip("REAL_OSS_UNAVAILABLE: 地图真实入口测试需当前 HTTP 引擎和 R2")
    async with get_async_session() as db:
        columns = (await db.execute(text("SHOW COLUMNS FROM maps_online_tasks"))).all()
    if "search_viewports" not in {row[0] for row in columns}:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少 search_viewports")

    user_id, token = await real_user_factory(f"map-{test_run_id}@example.com")
    real_online_api_cleanup.user_ids.append(user_id)
    headers = {"Authorization": f"Bearer {token}", "Accept-Language": "zh-CN"}
    options = await real_async_client.get(
        "/api/client/maps-online/options", headers=headers
    )
    assert options.status_code == 200
    assert options.json()["code"] == CommonCode.SUCCESS
    assert options.json()["data"]["keyword_limit"] == 2
    assert options.json()["data"]["logical_sample_limit"] == 50
    first = {"lat": 12.34567, "lng": 45.67891, "zoom": 15}
    second = {"lat": 23.45678, "lng": 45.67891, "zoom": 15}
    google = _GoogleSession()
    _GoogleSession.scenario = ""
    _GoogleSession.urls = []
    _GoogleSession.browser_calls = 0
    started = asyncio.Event()
    release = asyncio.Event()
    mode = "partial"
    objects: dict[str, bytes] = {}

    async def get(_session: AsyncSession, url: str, **kwargs: object) -> _Response:
        if url.startswith("https://www.google.com/maps?hl="):
            started.set()
            await release.wait()
        if mode == "all_fail" or "23.45678" in unquote(url):
            await asyncio.Event().wait()
        return await google.get(url, **kwargs)

    def upload(
        _self: BaseClient, operation: str, params: dict[str, object]
    ) -> dict[str, str]:
        assert operation == "PutObject"
        key, body = params["Key"], params["Body"]
        assert isinstance(key, str) and isinstance(body, bytes)
        objects[key] = body
        return {"ETag": "map-test"}

    monkeypatch.setattr(AsyncSession, "get", get)
    monkeypatch.setattr(BaseClient, "_make_api_call", upload)
    monkeypatch.setattr(service_module, "TASK_TIMEOUT_SECONDS", 5)

    over_budget = await real_async_client.post(
        _ENDPOINT,
        headers=headers,
        json={
            "keywords": ["coffee", "tea"],
            "search_viewports": [
                {"lat": index, "lng": 0, "zoom": 15} for index in range(26)
            ],
        },
    )
    assert over_budget.status_code == 200
    assert over_budget.json()["code"] == CommonCode.VALIDATION_ERROR
    empty = await real_async_client.post(
        _ENDPOINT,
        headers=headers,
        json={"keywords": ["coffee"], "search_viewports": []},
    )
    assert empty.status_code == 200
    assert empty.json()["code"] == CommonCode.VALIDATION_ERROR
    assert await service.count_tasks(user_id=user_id) == 0

    created = await real_async_client.post(
        _ENDPOINT,
        headers=headers,
        json={
            "keywords": [f"coffee-{test_run_id}", f"tea-{test_run_id}"],
            "search_viewports": [first, first, second],
        },
    )
    assert created.status_code == 200
    assert created.json()["code"] == CommonCode.SUCCESS
    task = await service.task_info(task_no=created.json()["data"]["task_no"])
    assert isinstance(task, MapsOnlineTaskModel)
    assert task.search_viewports == [first, second]
    assert task.csv_language == "zh-CN"
    assert task.total_count == 2
    await asyncio.wait_for(started.wait(), 2)
    await service.close()
    assert (await service.task_info(task.id)).completed_at == 0

    await service.recover()
    release.set()
    async with asyncio.timeout(12):
        while True:
            saved = await service.task_info(task.id)
            assert saved is not None
            if saved.completed_at:
                break
            await asyncio.sleep(0.02)
    assert saved.record_count == 40 and saved.processed_count == 2
    items = await service.item_lists(task.id)
    assert [item.record_count for item in items] == [20, 20]
    assert all(item.error and "map_sampling_deadline" in item.error for item in items)
    assert len(objects) == 2
    for item in items:
        assert item.object_key is not None
        rows = list(
            csv.DictReader(StringIO(objects[item.object_key].decode("utf-8-sig")))
        )
        assert rows.pop(0)["Fulladdress"] == "完整地址"
        assert len(rows) == 20
        assert {row["Search Keyword"] for row in rows} == {item.keyword}
    usage = await online_usage_service.get_usage(
        usage_identity(user_id, None), user_id=user_id
    )
    assert usage.used == 40

    mode = "all_fail"
    monkeypatch.setattr(service_module, "TASK_TIMEOUT_SECONDS", 1)
    failed = await real_async_client.post(
        _ENDPOINT,
        headers=headers,
        json={
            "keywords": [f"failed-{test_run_id}"],
            "search_viewports": [first],
        },
    )
    assert failed.status_code == 200
    assert failed.json()["code"] == CommonCode.SUCCESS
    failed_task = await service.task_info(task_no=failed.json()["data"]["task_no"])
    assert failed_task is not None
    async with asyncio.timeout(5):
        while True:
            saved_failed = await service.task_info(failed_task.id)
            assert saved_failed is not None
            if saved_failed.completed_at:
                break
            await asyncio.sleep(0.02)
    failed_item = (await service.item_lists(failed_task.id))[0]
    assert saved_failed.record_count == 0
    assert failed_item.object_key is None and failed_item.record_count == 0
    assert len(objects) == 2
