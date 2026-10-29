"""Admin 任务记录只读 API real 集成测试。

依赖：真实 MySQL，`admins`、`users`、`user_usage_logs`、Online 与调用记录十张分表。
测试数据经真实 service 写入，再把创建时间改到本用例独占的历史窗口，隔离库内既有记录。
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import delete, text, update

from app.constants.export import EXPORT_SHARD_COUNT, ExportRunStatus
from app.constants.export_api import ExportApiOperation, ExportApiSource
from app.core.config import settings
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.admin_model import AdminModel
from app.models.export_api_job_model import ExportApiJobModel
from app.models.export_job_model import ExportJobModel
from app.models.export_run_model import ExportRunModel
from app.models.user_model import UserModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.schemas.export_api_job_schema import (
    ExportApiReviewsSummary,
    ExportApiSearchSummary,
)
from app.schemas.export_item_schema import (
    GmapSearchItem,
    GmapSearchOptions,
    GmapViewport,
)
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.services.admin_service import admin_service
from app.services.export_api_job_service import export_api_job_service
from app.services.export_job_service import export_job_service
from app.services.user_service import user_service
from app.utils.crypto import hash_password
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

BASE = "/api/admin/task-records"
_FID = "0x123456789abc:0xabcdef123456"


@dataclass
class _CleanupState:
    user_ids: list[int] = field(default_factory=list)


@pytest.fixture
async def real_task_records_schema_ready(real_mysql_ready) -> None:
    required = {
        "admins",
        "users",
        "user_usage_logs",
        *(f"export_jobs_{slot:02d}" for slot in range(EXPORT_SHARD_COUNT)),
        *(f"export_runs_{slot:02d}" for slot in range(EXPORT_SHARD_COUNT)),
        *(f"export_api_jobs_{slot:02d}" for slot in range(EXPORT_SHARD_COUNT)),
    }
    async with get_async_session() as db:
        tables = {row[0] for row in (await db.execute(text("SHOW TABLES"))).all()}
    if not required <= tables:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {sorted(required - tables)}")


@pytest.fixture
async def real_admin_token_for_task_records(
    real_task_records_schema_ready, test_run_id: str
) -> AsyncIterator[str]:
    username = f"pytest-admin-task-{uuid4().hex[:8]}-{test_run_id}"
    admin = AdminModel(  # type: ignore[call-arg]
        username=username,
        password_hash=hash_password("AdminTaskRecordsRealTest123!"),
        is_active=True,
    )
    async with get_async_session() as db:
        db.add(admin)
        await db.commit()
    try:
        access_token, _, _, _ = admin_service.create_token_pair(admin)
        yield access_token
    finally:
        async with get_async_session() as db:
            await db.execute(delete(AdminModel).where(AdminModel.username == username))
            await db.commit()


@pytest.fixture
async def real_task_records_cleanup(
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[_CleanupState]:
    # 独立节点名，避免既有服务的 Runtime 接手本用例创建的排队 Run。
    monkeypatch.setattr(settings.app, "name", f"admin-task-records-{uuid4().hex[:8]}")
    state = _CleanupState()
    try:
        yield state
    finally:
        async with get_async_session() as db:
            for user_id in state.user_ids:
                for model in (
                    ExportApiJobModel.model_for_user(user_id),
                    ExportRunModel.model_for_user(user_id),
                    ExportJobModel.model_for_user(user_id),
                ):
                    await db.execute(delete(model).where(model.user_id == user_id))
            await db.execute(
                delete(UserUsageLogModel).where(
                    UserUsageLogModel.user_id.in_(state.user_ids)
                )
            )
            await db.execute(
                delete(UserModel).where(UserModel.user_id.in_(state.user_ids))
            )
            await db.commit()


def _data(response: httpx.Response) -> dict:
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


def _window() -> int:
    """本用例独占的历史毫秒窗口起点，远离库内真实记录。"""
    return 1_000_000_000_000 + uuid4().int % 1_000_000 * 1000


async def _two_users_in_different_shards(
    state: _CleanupState, make_test_email
) -> tuple[int, int]:
    for label in ("task-first", "task-second"):
        user = await user_service.create_user_without_password(
            email=make_test_email(label)
        )
        state.user_ids.append(user.user_id)
    first, second = state.user_ids
    assert first % EXPORT_SHARD_COUNT != second % EXPORT_SHARD_COUNT
    return first, second


async def _online_job(user_id: int, keyword: str, created_at: int) -> str:
    job, _ = await export_job_service.create_job(
        user_id=user_id,
        options=GmapSearchOptions(
            items=[
                GmapSearchItem(keyword=keyword),
                GmapSearchItem(
                    keyword=keyword, viewport=GmapViewport(lat=40, lng=-74, zoom=12)
                ),
            ]
        ),
        include_contacts=False,
        storage_id="admin-task-records-test",
    )
    model = ExportJobModel.model_for_user(user_id)
    async with get_async_session() as db:
        await db.execute(
            update(model)
            .where(model.job_no == job.job_no)
            .values(created_at=created_at)
        )
        await db.commit()
    return job.job_no


async def _shift_call(job: ExportApiJobModel, created_at: int) -> str:
    model = ExportApiJobModel.model_for_user(job.user_id)
    async with get_async_session() as db:
        await db.execute(
            update(model).where(model.id == job.id).values(created_at=created_at)
        )
        await db.commit()
    return job.request_id


async def test_real_admin_task_records_require_admin(
    real_async_client: httpx.AsyncClient,
) -> None:
    no = f"{uuid4().hex}00"
    for path in ("/online", f"/online/{no}", "/calls", f"/calls/{no}"):
        response = await real_async_client.get(BASE + path)
        assert response.status_code == 401
        assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS


async def test_real_admin_online_tasks_page_across_shards_filter_and_detail(
    real_async_client: httpx.AsyncClient,
    real_admin_token_for_task_records: str,
    real_task_records_cleanup: _CleanupState,
    make_test_email,
) -> None:
    client = real_async_client
    headers = {"Authorization": f"Bearer {real_admin_token_for_task_records}"}
    first, second = await _two_users_in_different_shards(
        real_task_records_cleanup, make_test_email
    )
    start = _window()
    window = {"created_from_ms": start, "created_to_ms": start + 10}
    alpha = await _online_job(first, "alpha", start + 1)
    beta = await _online_job(second, "beta", start + 2)
    gamma = await _online_job(first, "gamma", start + 3)
    finished_at = timestamp_now()
    async with get_async_session() as db:
        # Job 与唯一 Run 的终态共同提交，测试数据保持同一合同。
        for model in (
            ExportJobModel.model_for_user(first),
            ExportRunModel.model_for_user(first),
        ):
            await db.execute(
                update(model)
                .where(model.job_no == gamma)
                .values(status=ExportRunStatus.COMPLETED.value, finished_at=finished_at)
            )
        await db.commit()

    async def job_nos(**params: int | str) -> tuple[list[str], int]:
        data = _data(await client.get(BASE + "/online", headers=headers, params=params))
        return [row["job_no"] for row in data["rows"]], data["total"]

    assert await job_nos(**window, page_size=2) == ([gamma, beta], 3)
    assert await job_nos(**window, page=2, page_size=2) == ([alpha], 3)
    assert await job_nos(user_id=first) == ([gamma, alpha], 2)
    assert await job_nos(job_no=beta) == ([beta], 1)
    assert await job_nos(**window, status=ExportRunStatus.COMPLETED.value) == (
        [gamma],
        1,
    )
    invalid = await client.get(
        BASE + "/online",
        headers=headers,
        params={"created_from_ms": start + 1, "created_to_ms": start},
    )
    assert invalid.status_code == 200
    assert invalid.json()["code"] == CommonCode.INVALID_REQUEST

    row = _data(
        await client.get(BASE + "/online", headers=headers, params={"job_no": gamma})
    )["rows"][0]
    assert row == {
        "job_no": gamma,
        "user_id": first,
        "keywords": ["gamma"],
        "status": ExportRunStatus.COMPLETED,
        "sample_count": 2,
        "record_count": 0,
        "created_at": start + 3,
        "finished_at": finished_at,
    }
    detail = _data(await client.get(f"{BASE}/online/{gamma}", headers=headers))
    assert {key: detail[key] for key in row} == row
    assert detail["processed_count"] == 0 and not detail["has_file"]
    assert detail["node_name"] == settings.app.name
    assert detail["items"] == [
        {
            "item_index": 0,
            "result_count": 0,
            "completed": False,
            "error_code": None,
            "keyword": "gamma",
            "viewport": None,
        },
        {
            "item_index": 1,
            "result_count": 0,
            "completed": False,
            "error_code": None,
            "keyword": "gamma",
            "viewport": {"lat": 40.0, "lng": -74.0, "zoom": 12},
        },
    ]
    missing = await client.get(
        f"{BASE}/online/{uuid4().hex}0{first % 10}", headers=headers
    )
    assert missing.status_code == 200
    assert missing.json()["code"] == CommonCode.NOT_FOUND


async def test_real_admin_api_calls_page_across_shards_filter_and_detail(
    real_async_client: httpx.AsyncClient,
    real_admin_token_for_task_records: str,
    real_task_records_cleanup: _CleanupState,
    make_test_email,
) -> None:
    client = real_async_client
    headers = {"Authorization": f"Bearer {real_admin_token_for_task_records}"}
    first, second = await _two_users_in_different_shards(
        real_task_records_cleanup, make_test_email
    )
    start = _window()
    window = {"created_from_ms": start, "created_to_ms": start + 10}
    searched = await export_api_job_service.create_job(
        user_id=first,
        source=ExportApiSource.API,
        operation=ExportApiOperation.SEARCH,
        params=MapsSearchRequest(q="cafe"),
    )
    await export_api_job_service.complete_job(
        searched,
        status=ExportRunStatus.PARTIAL,
        summary=ExportApiSearchSummary(record_count=3, warnings=[]),
    )
    reviewed = await export_api_job_service.create_job(
        user_id=second,
        source=ExportApiSource.MCP,
        operation=ExportApiOperation.REVIEWS,
        params=MapsReviewsRequest(fid=_FID),
    )
    await export_api_job_service.complete_job(
        reviewed,
        status=ExportRunStatus.COMPLETED,
        summary=ExportApiReviewsSummary(record_count=0, has_more=False),
    )
    failed = await export_api_job_service.create_job(
        user_id=first,
        source=ExportApiSource.MCP,
        operation=ExportApiOperation.PHOTOS,
        params=MapsPhotosRequest(fid=_FID),
    )
    await export_api_job_service.fail_job(
        failed, error_code=CommonCode.MAPS_API_MEDIA_UNAVAILABLE.value
    )
    search_no = await _shift_call(searched, start + 1)
    reviews_no = await _shift_call(reviewed, start + 2)
    failed_no = await _shift_call(failed, start + 3)

    async def request_ids(**params: int | str) -> tuple[list[str], int]:
        data = _data(await client.get(BASE + "/calls", headers=headers, params=params))
        return [row["request_id"] for row in data["rows"]], data["total"]

    assert await request_ids(**window, page_size=2) == ([failed_no, reviews_no], 3)
    assert await request_ids(**window, page=2, page_size=2) == ([search_no], 3)
    assert await request_ids(**window, source=ExportApiSource.MCP.value) == (
        [failed_no, reviews_no],
        2,
    )
    assert await request_ids(**window, operation=ExportApiOperation.SEARCH.value) == (
        [search_no],
        1,
    )
    assert await request_ids(**window, status=ExportRunStatus.FAILED.value) == (
        [failed_no],
        1,
    )
    assert await request_ids(user_id=first) == ([failed_no, search_no], 2)
    assert await request_ids(request_id=reviews_no) == ([reviews_no], 1)
    invalid = await client.get(
        BASE + "/calls",
        headers=headers,
        params={"created_from_ms": start + 1, "created_to_ms": start},
    )
    assert invalid.status_code == 200
    assert invalid.json()["code"] == CommonCode.INVALID_REQUEST

    failed_detail = _data(
        await client.get(f"{BASE}/calls/{failed_no}", headers=headers)
    )
    assert failed_detail.pop("finished_at") is not None
    assert failed_detail == {
        "request_id": failed_no,
        "user_id": first,
        "source": ExportApiSource.MCP,
        "operation": ExportApiOperation.PHOTOS,
        "status": ExportRunStatus.FAILED,
        "record_count": None,
        "created_at": start + 3,
        "params": {"fid": _FID, "max_results": 200},
        "summary": None,
        "error_code": CommonCode.MAPS_API_MEDIA_UNAVAILABLE,
    }
    search_detail = _data(
        await client.get(f"{BASE}/calls/{search_no}", headers=headers)
    )
    assert search_detail["record_count"] == 3
    assert search_detail["summary"] == {"record_count": 3, "warnings": []}
    missing = await client.get(
        f"{BASE}/calls/{uuid4().hex}0{first % 10}", headers=headers
    )
    assert missing.status_code == 200
    assert missing.json()["code"] == CommonCode.NOT_FOUND
