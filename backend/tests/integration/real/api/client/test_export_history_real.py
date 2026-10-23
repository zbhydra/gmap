"""History 使用真实 MySQL/Redis；创建仅替换 Collector HTTP 外部出口。"""

import asyncio
import json
from collections.abc import AsyncIterator, Awaitable, Callable
from dataclasses import dataclass, field
from pathlib import Path

import httpx
import pytest
from sqlalchemy import delete, text, update

from app.constants.export import EXPORT_PUBLIC_STATUSES, ExportRunStatus
from app.core.config import settings
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.export_job_model import ExportJobModel
from app.models.export_run_model import ExportRunModel
from app.provider.gmap.collector_client import gmap_collector_client
from app.runtime.export_job_runtime import export_job_runtime
from app.schemas.export_item_schema import GmapSearchOptions
from app.services.export_job_service import export_job_service
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.object_storage_config_service import object_storage_config_service
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
BASE = "/api/client/export/jobs"


@dataclass
class _CleanupState:
    user_id: int
    token: str = field(repr=False)
    other_user_id: int
    storage_id: str


def _data(response: httpx.Response) -> dict:
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


@pytest.fixture
async def real_history_state(
    real_mysql_ready: None,
    real_redis_ready: None,
    real_user_factory: Callable[[str], Awaitable[tuple[int, str]]],
    test_run_id: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[_CleanupState]:
    async with get_async_session() as db:
        columns = (
            await db.execute(
                text(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS "
                    "WHERE TABLE_SCHEMA=DATABASE() "
                    "AND TABLE_NAME REGEXP '^export_jobs_0[0-9]$' "
                    "AND COLUMN_NAME='keywords_text'"
                )
            )
        ).scalar_one()
    if columns != 10:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: Export 关键词列未同步到十张分表")
    storage = await object_storage_config_service.get_active()
    if storage is None:
        pytest.skip("REAL_OSS_UNAVAILABLE: 创建任务需要已有对象存储配置")
    config = await gmap_collector_config_service.get_config()
    if not config.collectors:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 创建任务需要已有 Collector 配置")
    user_id, token = await real_user_factory(f"history-{test_run_id}@example.com")
    other_user_id, _ = await real_user_factory(
        f"history-other-{test_run_id}@example.com"
    )
    original_node = settings.app.name
    original_http = gmap_collector_client._client
    # 独立节点只发现本用例的 Run，避免触碰既有服务正在处理的任务。
    settings.app.name = f"history-{test_run_id}"
    monkeypatch.setattr(settings, "root_path", str(tmp_path))

    def collector(request: httpx.Request) -> httpx.Response:
        assert request.method == "POST" and request.url.path == "/tasks"
        payload = json.loads(request.content)
        return httpx.Response(
            200,
            json={
                "task_id": payload["task_id"],
                "state": 30,
                "response": {
                    "http_status": 200,
                    "body": {"status": "ok", "entries": []},
                },
            },
        )

    try:
        async with httpx.AsyncClient(transport=httpx.MockTransport(collector)) as http:
            gmap_collector_client._client = http
            await export_job_runtime.start()
            yield _CleanupState(user_id, token, other_user_id, storage.id)
    finally:
        await export_job_runtime.stop()
        gmap_collector_client._client = original_http
        settings.app.name = original_node
        async with get_async_session() as db:
            for owner in (user_id, other_user_id):
                run_model = ExportRunModel.model_for_user(owner)
                job_model = ExportJobModel.model_for_user(owner)
                await db.execute(delete(run_model).where(run_model.user_id == owner))
                await db.execute(delete(job_model).where(job_model.user_id == owner))
            await db.commit()


async def test_real_export_history_filters_pagination_and_keyword_snapshots(
    real_history_state: _CleanupState,
    real_async_client: httpx.AsyncClient,
    test_run_id: str,
) -> None:
    state = real_history_state
    headers = {"Authorization": f"Bearer {state.token}"}
    keyword = f"History {test_run_id}"
    created = _data(
        await real_async_client.post(
            BASE,
            headers=headers,
            json={
                "items": [
                    {"keyword": f"  {keyword}  "},
                    {
                        "keyword": keyword,
                        "viewport": {"lat": 40, "lng": -74, "zoom": 12},
                    },
                ],
                "include_contacts": False,
            },
        )
    )["job"]
    assert created["keyword_preview"] == keyword and created["keyword_count"] == 1
    persisted = await export_job_service.export_job_info(
        user_id=state.user_id, job_no=created["job_no"]
    )
    assert persisted is not None and persisted.keywords_text == keyword
    assert len(GmapSearchOptions.model_validate(persisted.options_json).items) == 2
    async with asyncio.timeout(5):
        while True:
            persisted = await export_job_service.export_job_info(
                user_id=state.user_id, job_no=created["job_no"]
            )
            assert persisted is not None
            if persisted.status == ExportRunStatus.COMPLETED:
                break
            await asyncio.sleep(0.01)
    await export_job_runtime.stop()

    first = f"First {test_run_id}"
    matched = f"Café_%/Path {test_run_id}"
    options = GmapSearchOptions.model_validate(
        {
            "items": [
                {"keyword": first},
                {"keyword": matched},
                {
                    "keyword": matched,
                    "viewport": {"lat": 40, "lng": -74, "zoom": 12},
                },
            ]
        }
    )
    jobs: list[ExportJobModel] = []
    start = timestamp_now()
    for index, status in enumerate(ExportRunStatus):
        job, run = await export_job_service.create_job(
            user_id=state.user_id,
            options=options,
            include_contacts=False,
            storage_id=state.storage_id,
        )
        async with get_async_session() as db:
            await db.execute(
                update(type(job))
                .where(type(job).job_id == job.job_id)
                .values(status=status.value, created_at=start + index)
            )
            await db.execute(
                update(type(run))
                .where(type(run).run_id == run.run_id)
                .values(status=status.value)
            )
            await db.commit()
        jobs.append(job)
    for owner, search in (
        (state.user_id, f"CaféXY/Path {test_run_id}"),
        (state.other_user_id, matched),
        (state.user_id, f"Hex {jobs[0].job_no[:12]} {test_run_id}"),
    ):
        await export_job_service.create_job(
            user_id=owner,
            options=GmapSearchOptions.model_validate({"items": [{"keyword": search}]}),
            include_contacts=False,
            storage_id=state.storage_id,
        )

    async def history(params: list[tuple[str, str]]) -> dict:
        return _data(
            await real_async_client.get(BASE, headers=headers, params=tuple(params))
        )

    all_jobs = await history([])
    assert all_jobs["total"] == 9
    assert all_jobs["offset"] == 0 and all_jobs["limit"] == 20
    filtered = await history([("q", "  CAFÉ_%/pATH  "), ("limit", "1")])
    assert filtered["total"] == 6 and len(filtered["jobs"]) == 1
    assert filtered["jobs"][0]["job_no"] == jobs[-1].job_no
    assert filtered["jobs"][0]["keyword_preview"] == matched
    assert filtered["jobs"][0]["keyword_count"] == 2
    assert (await history([("q", first + "\n" + matched)]))["total"] == 0
    assert (await history([("q", first + "\r" + matched)]))["total"] == 0

    running_range = [
        ("q", "CAFÉ_%/PATH"),
        ("status", "queued"),
        ("status", "collecting"),
        ("status", "publishing"),
        ("created_from_ms", str(start + 1)),
        ("created_to_ms", str(start + 3)),
        ("limit", "1"),
    ]
    page = await history(running_range)
    assert page["total"] == 2 and page["jobs"][0]["job_no"] == jobs[2].job_no
    page = await history([*running_range, ("offset", "1")])
    assert page["total"] == 2 and page["jobs"][0]["job_no"] == jobs[1].job_no
    assert page["offset"] == 1 and page["limit"] == 1
    assert (await history([*running_range, ("offset", "2")]))["jobs"] == []
    for public_status in EXPORT_PUBLIC_STATUSES.values():
        result = await history([("status", public_status), ("q", "CAFÉ_%/PATH")])
        assert result["total"] == 1 and result["jobs"][0]["status"] == public_status

    hex_matches = await history([("q", jobs[0].job_no[:12].upper())])
    assert hex_matches["total"] == 2
    by_number = next(
        job for job in hex_matches["jobs"] if job["job_no"] == jobs[0].job_no
    )
    assert by_number["keyword_preview"] == first
    detail = _data(
        await real_async_client.get(f"{BASE}/{jobs[0].job_no}", headers=headers)
    )
    assert detail["job"]["keyword_preview"] == first
    assert detail["job"]["keyword_count"] == 2
    assert (await history([("q", "   ")]))["total"] == 9
    assert (await history([("q", f" {'x' * 100} ")]))["total"] == 0
    assert (
        await history([("created_from_ms", str(start)), ("created_to_ms", str(start))])
    )["total"] == 0
    invalid = await real_async_client.get(
        BASE,
        headers=headers,
        params={"created_from_ms": start + 1, "created_to_ms": start},
    )
    assert invalid.status_code == 200
    assert invalid.json()["code"] == CommonCode.INVALID_REQUEST
