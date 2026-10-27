"""真实 MySQL/Redis/FS 与账号权限；仅 Collector HTTP、OSS SDK 出口使用确定替身。

只临时修改 system_data.gmap_collector，结束恢复原行，不写 config_*。
这不是 Collector/Google 联调。
"""

import asyncio
import csv
import json
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from io import StringIO
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from botocore.client import BaseClient  # type: ignore[import-untyped]
from sqlalchemy import delete, select, text, update
from sqlalchemy.exc import IntegrityError

from app.constants.export import ExportRunStatus
from app.constants.gmap_collector import GMAP_COLLECTOR_DATA_KEY
from app.constants.subscription import ONLINE_LITE_PRODUCT_ID
from app.core.config import settings
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.export_job_model import EXPORT_JOB_MODELS, ExportJobModel
from app.models.export_run_model import EXPORT_RUN_MODELS, ExportRunModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.system_data_model import SystemDataModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.provider.export.export_base import ExportProviderRequest
from app.provider.export.gmap_columns import GMAP_PUBLIC_COLUMNS
from app.provider.export.gmap_export import _record, gmap_export_provider
from app.provider.gmap.collector_client import gmap_collector_client
from app.provider.gmap.enrich import _collector_cache_key
from app.provider.gmap.types import GmapPlaceEntry
from app.runtime.export_job_runtime import export_job_runtime
from app.schemas.export_item_schema import (
    GmapSearchItem,
    GmapSearchOptions,
    ExportItemResult,
)
from app.schemas.export_run_schema import ExportRunResult
from app.schemas.gmap_collector_schema import GmapCollectorConfig
from app.services.export_file_service import (
    CollectorCallLocation,
    CollectorOperation,
    export_file_service,
)
from app.services.export_job_service import export_job_service
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.system_data_service import system_data_service
from app.services.usage_service import online_usage_service
from app.utils.redis_key import build_redis_key
from app.utils.time import get_current_ym, get_tomorrow_start_timestamp, timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
BASE = "/api/client/export/jobs"
FID = "0x123456789abc:0xabcdef123456"


@dataclass
class _CleanupState:
    user_id: int
    token: str
    storage_id: str
    cache_keys: list[str] = field(default_factory=list)


def _data(response: httpx.Response) -> dict:
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


@pytest.fixture
async def real_export_state(
    real_mysql_ready,
    real_redis_ready,
    real_user_factory,
    test_run_id: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[_CleanupState]:
    required = {m.__tablename__ for m in EXPORT_JOB_MODELS} | {
        m.__tablename__ for m in EXPORT_RUN_MODELS
    }
    async with get_async_session() as db:
        present = set((await db.execute(text("SHOW TABLES"))).scalars().all())
    if not required <= present:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 新 Export 分表缺失")
    storage = await object_storage_config_service.get_active()
    if storage is None or storage.provider != "R2":
        pytest.skip("REAL_OSS_UNAVAILABLE: 本端 SDK 出口验收需现有 R2 配置")
    user_id, token = await real_user_factory(
        f"export-{test_run_id}-{uuid4().hex[:6]}@example.com"
    )
    state = _CleanupState(user_id, token, storage.id)
    original = await system_data_service.system_data_info(GMAP_COLLECTOR_DATA_KEY)
    original_http = gmap_collector_client._client
    monkeypatch.setattr(settings, "root_path", str(tmp_path))
    monkeypatch.setattr(
        settings,
        "app",
        settings.app.model_copy(update={"name": f"export-real-{test_run_id}"}),
    )
    await gmap_collector_config_service.save_config(
        GmapCollectorConfig.model_validate(
            {
                "collectors": [
                    {"url": "http://collector.test", "api_key": "export-real"}
                ],
                "proxies": ["http://proxy.test:8080"],
            }
        )
    )
    try:
        yield state
    finally:
        await export_job_runtime.stop()
        gmap_collector_client._client = original_http
        redis = await redis_client.get_client()
        if state.cache_keys:
            await redis.delete(*state.cache_keys)
        async with get_async_session() as db:
            await db.execute(
                delete(ExportRunModel.model_for_user(user_id)).where(
                    ExportRunModel.model_for_user(user_id).user_id == user_id
                )
            )
            await db.execute(
                delete(ExportJobModel.model_for_user(user_id)).where(
                    ExportJobModel.model_for_user(user_id).user_id == user_id
                )
            )
            await db.execute(
                delete(UserUsageLogModel).where(UserUsageLogModel.user_id == user_id)
            )
            if original is None:
                await db.execute(
                    delete(SystemDataModel).where(
                        SystemDataModel.data_key == GMAP_COLLECTOR_DATA_KEY
                    )
                )
            else:
                await db.execute(
                    update(SystemDataModel)
                    .where(SystemDataModel.data_key == GMAP_COLLECTOR_DATA_KEY)
                    .values(
                        data_value=original.data_value,
                        created_at=original.created_at,
                        updated_at=original.updated_at,
                    )
                )
            await db.commit()


async def _wait_job(
    state: _CleanupState, job_no: str
) -> tuple[ExportJobModel, ExportRunModel]:
    async with asyncio.timeout(5):
        while True:
            job = await export_job_service.export_job_info(
                user_id=state.user_id, job_no=job_no
            )
            runs = await export_job_service.export_run_lists(
                user_id=state.user_id, job_nos=[job_no]
            )
            assert job is not None and runs
            if runs[0].status in (
                ExportRunStatus.COMPLETED,
                ExportRunStatus.PARTIAL,
                ExportRunStatus.FAILED,
            ):
                return job, runs[0]
            await asyncio.sleep(0.01)


async def _new_job(
    state: _CleanupState, keywords: list[str], *, contacts: bool = False
) -> tuple[ExportJobModel, ExportRunModel]:
    job, run = await export_job_service.create_job(
        user_id=state.user_id,
        options=GmapSearchOptions(
            items=[GmapSearchItem(keyword=keyword) for keyword in keywords],
            export_locale="zh-CN",
        ),
        include_contacts=contacts,
        storage_id=state.storage_id,
    )
    return job, run


async def _commit_first_row(job: ExportJobModel, run: ExportRunModel) -> None:
    await export_job_service.start_run(run)
    options = GmapSearchOptions.model_validate(job.options_json)
    provider = gmap_export_provider
    columns = provider.source_columns + provider.columns
    request = ExportProviderRequest(
        job.job_no, run.run_no, options, False, 0, run.checkpoint.item_results
    )
    record = _record(
        GmapPlaceEntry(
            name="committed",
            fid=FID,
            place_id="committed-place",
            search_keyword=options.items[0].keyword,
        )
    )
    handle, _, _ = await export_file_service.run_io(
        export_file_service.open_run_csv,
        job_no=job.job_no,
        run_no=run.run_no,
        columns=columns,
        stable_record_id_column="record_id",
        gmap_item_counts=[0] * len(options.items),
    )
    try:
        await export_file_service.run_io(
            export_file_service.append_rows,
            handle,
            (
                (
                    f"0:{FID}",
                    *provider.execution_items(request)[0].source,
                    *provider.record_to_row(record),
                ),
            ),
        )
        size = await export_file_service.run_io(export_file_service.sync_csv, handle)
    finally:
        await export_file_service.run_io(export_file_service.close_csv, handle)
    checkpoint = run.checkpoint
    checkpoint.columns = [c.header for c in columns]
    checkpoint.csv_size_bytes = size
    checkpoint.output_count = 1
    checkpoint.item_results[0] = ExportItemResult(
        item_index=0, result_count=1, completed=True
    )
    await export_job_service.checkpoint_run(run, checkpoint)


async def _prove_csv_contacts_permissions_and_single_failed_publish(
    real_export_state: _CleanupState,
    real_async_client: httpx.AsyncClient,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    real_user_factory,
) -> None:
    state = real_export_state
    site = f"https://{test_run_id}.example.test"
    state.cache_keys.extend(_collector_cache_key(site + path) for path in ("/a", "/b"))
    headers = {"Authorization": f"Bearer {state.token}", "Accept-Language": "zh-CN"}
    objects: dict[str, bytes] = {}
    upload_calls = 0
    fail_upload = False
    async with get_async_session() as db:
        db.add(UserSubscriptionModel(user_id=state.user_id, product_kind="maps_online", product_id=ONLINE_LITE_PRODUCT_ID, expires_at=timestamp_now() + 600_000))  # type: ignore[call-arg]
        await db.commit()

    def sdk(
        _self: BaseClient, operation_name: str, api_params: dict[str, object]
    ) -> dict[str, object]:
        nonlocal upload_calls
        if operation_name == "PutObject":
            upload_calls += 1
            if fail_upload:
                raise TimeoutError("controlled OSS timeout")
            body = api_params["Body"]
            assert hasattr(body, "read")
            objects[str(api_params["Key"])] = body.read()  # type: ignore[union-attr]
        return {}

    monkeypatch.setattr(BaseClient, "_make_api_call", sdk)

    async def respond(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content)
        assert request.method == "POST"
        if payload["operation"] == "enrich_sites":
            response: dict[str, object] = {
                site + "/a": {"emails": ["a@example.test"], "medias": {}},
                site + "/b": {"emails": ["b@example.test"], "medias": {}},
            }
        else:
            name = payload["keyword"]
            entries = (
                []
                if name == "zero"
                else [
                    {
                        "name": "A",
                        "fid": FID,
                        "place_id": "same-place",
                        "search_keyword": name,
                        "website": site + "/a",
                        "owner_id": "owner",
                    }
                ]
            )
            if name == "second":
                entries.append(
                    {
                        "name": "B",
                        "fid": FID + "b",
                        "place_id": "second-place",
                        "search_keyword": name,
                        "website": site + "/b",
                    }
                )
            response = {
                "status": "partial" if name == "second" else "ok",
                "entries": entries,
            }
        if request.url.path == "/":
            return httpx.Response(200, json=response)
        assert request.url.path == "/tasks" and "run_no" not in payload
        assert 0 < payload["deadline_ms"] <= 3_600_000
        job = await export_job_service.export_job_info(
            user_id=state.user_id, job_no=payload["job_no"]
        )
        assert job is not None
        locator = export_file_service.read_collector_call(
            job_no=job.job_no,
            run_no=job.run_no,
            item_index=payload["item_index"],
            operation=payload["operation"],
        )
        assert (
            locator is not None
            and locator.task_id == payload["task_id"]
            and locator.collector_url == "http://collector.test"
        )
        return httpx.Response(
            200,
            json={
                "task_id": payload["task_id"],
                "state": 30,
                "response": {"http_status": 200, "body": response},
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as http:
        gmap_collector_client._client = http
        await export_job_runtime.start()
        missing = await real_async_client.post(
            BASE, json={"items": [{"keyword": "first"}]}
        )
        assert (
            missing.status_code == 401
            and missing.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS
        )
        created = _data(
            await real_async_client.post(
                BASE,
                headers=headers,
                json={
                    "items": [
                        {"keyword": "first"},
                        {
                            "keyword": "second",
                            "viewport": {"lat": 35, "lng": 120, "zoom": 12},
                        },
                    ]
                },
            )
        )
        job_no = created["job"]["job_no"]
        job, run = await _wait_job(state, job_no)
        assert (
            job.status == run.status == ExportRunStatus.PARTIAL and job.include_contacts
        )
        assert job.result_json is not None
        rows = list(
            csv.reader(
                StringIO(
                    objects[str(job.result_json["object_key"])].decode("utf-8-sig")
                )
            )
        )
        assert len(rows[0]) == 37 and rows[0] == [c.header for c in GMAP_PUBLIC_COLUMNS]
        assert rows[1][0] == "行序号" and len(rows) == 4
        data_rows = [dict(zip(rows[0], row)) for row in rows[2:]]
        assert [row["#"] for row in data_rows] == ["1", "2"]
        assert {row["Place Id"] for row in data_rows} == {"same-place", "second-place"}
        assert {row["Emails"] for row in data_rows} == {
            "a@example.test",
            "b@example.test",
        }
        assert {row["Search Keyword"] for row in data_rows} <= {"first", "second"}
        detail = _data(
            await real_async_client.get(BASE + "/" + job_no, headers=headers)
        )
        assert (
            detail["job"]["has_file"]
            and detail["job"]["record_count"] == 2
            and all(i["completed"] for i in detail["items"])
        )
        assert (
            len(_data(await real_async_client.get(BASE, headers=headers))["jobs"]) == 1
        )
        assert _data(
            await real_async_client.get(
                BASE + "/" + job_no + "/download", headers=headers
            )
        )["filename"].endswith(".csv")
        assert (
            await export_job_service.export_job_info(
                user_id=state.user_id + 10, job_no=job_no
            )
            is None
        )
        async with get_async_session() as db:
            logs = list(
                (
                    await db.scalars(
                        select(UserUsageLogModel).where(
                            UserUsageLogModel.user_id == state.user_id
                        )
                    )
                ).all()
            )
            assert (
                len(logs) == 1
                and logs[0].request_id == job_no
                and logs[0].delta == 2
                and logs[0].ym == get_current_ym()
            )
        options = _data(
            await real_async_client.get(
                "/api/client/maps-online/options", headers=headers
            )
        )
        assert options["usage"]["used"] == 2 and options["contacts_allowed"]
        other_id, other_token = await real_user_factory(
            f"other-export-{test_run_id}@example.com"
        )
        for suffix in ("", "/download"):
            denied = await real_async_client.get(
                BASE + "/" + job_no + suffix,
                headers={"Authorization": f"Bearer {other_token}"},
            )
            assert (
                denied.status_code == 200
                and denied.json()["code"] == CommonCode.NOT_FOUND
            )
        async with get_async_session() as db:
            await db.execute(
                delete(UserSubscriptionModel).where(
                    UserSubscriptionModel.user_id == state.user_id,
                    UserSubscriptionModel.product_kind == "maps_online",
                )
            )
            await db.commit()
        free_options = _data(
            await real_async_client.get(
                "/api/client/maps-online/options", headers=headers
            )
        )
        assert (
            free_options["keyword_limit"] == 2 and not free_options["contacts_allowed"]
        )
        # 合法零结果没有文件和消费；发布异常只上传一次、失败收口并释放名额。
        for keyword in ("zero", "upload-failure"):
            fail_upload = keyword == "upload-failure"
            created = _data(
                await real_async_client.post(
                    BASE,
                    headers=headers,
                    json={"items": [{"keyword": keyword}], "include_contacts": True},
                )
            )
            current, current_run = await _wait_job(state, created["job"]["job_no"])
            assert current.result_json is None and not current.include_contacts
            assert current_run.status == (
                ExportRunStatus.FAILED if fail_upload else ExportRunStatus.COMPLETED
            )
            absent = await real_async_client.get(
                BASE + "/" + current.job_no + "/download", headers=headers
            )
            assert (
                absent.status_code == 200
                and absent.json()["code"] == CommonCode.NOT_FOUND
            )
        assert upload_calls == 2
        assert (
            _data(
                await real_async_client.get(
                    "/api/client/maps-online/options", headers=headers
                )
            )["usage"]["used"]
            == 2
        )
        key = _data(
            await real_async_client.post(
                "/api/client/maps-api/key/generate", headers=headers
            )
        )["api_key"]
        search = _data(
            await real_async_client.post(
                "/api/external/maps/search",
                headers={"Authorization": f"Bearer {key}"},
                json={"q": "sync", "page": 2, "ll": "@35,120,12", "extra": True},
            )
        )
        assert search["places"][0]["emails"] == ["a@example.test"]
        assert (
            _data(
                await real_async_client.get(
                    "/api/client/maps-api/usage", headers=headers
                )
            )["used"]
            == 1
        )
        # IP 带本轮唯一标识，限流 key 可精确清理。
        ip = f"2001:db8::{int(test_run_id[:6], 16):x}"
        device_id = f"preview-{test_run_id}"
        reset_at = get_tomorrow_start_timestamp()
        state.cache_keys.extend(
            build_redis_key(f"maps_online_preview:{identifier}:{reset_at}")
            for identifier in (f"device:{device_id}", f"ip:{ip}")
        )
        preview = _data(
            await real_async_client.post(
                "/api/client/maps-online/preview",
                headers={"X-Forwarded-For": ip, "X-Device-Id": device_id},
                json={"keyword": "preview"},
            )
        )
        assert preview["count"] == 1 and len(preview["rows"][0]) == 6
        assert (
            len(_data(await real_async_client.get(BASE, headers=headers))["jobs"]) == 3
        )
        await export_job_runtime.stop()
        await export_job_runtime.start()
        await asyncio.sleep(0)
        assert upload_calls == 2


async def _prove_restart_queries_original_calls_and_preserves_committed_rows(
    real_export_state: _CleanupState, monkeypatch: pytest.MonkeyPatch
) -> None:
    state = real_export_state
    job, run = await _new_job(state, ["committed", "recover", "lost"], contacts=True)
    await _commit_first_row(job, run)
    started_at = timestamp_now() - 120_000
    model = ExportRunModel.model_for_user(state.user_id)
    async with get_async_session() as db:
        await db.execute(
            update(model)
            .where(model.run_no == run.run_no)
            .values(started_at=started_at)
        )
        await db.commit()
    path = export_file_service.run_path(
        job_no=job.job_no, run_no=run.run_no, name="increment.csv"
    )
    with path.open("ab") as output:
        output.write(b"uncommitted trailing bytes")
    locations: dict[tuple[int, CollectorOperation], str] = {
        (1, "search_item"): uuid4().hex,
        (1, "enrich_sites"): uuid4().hex,
        (2, "search_item"): uuid4().hex,
    }
    for (index, operation), task_id in locations.items():
        export_file_service.save_collector_call(
            job_no=job.job_no,
            run_no=run.run_no,
            item_index=index,
            operation=operation,
            location=CollectorCallLocation(
                task_id=task_id, collector_url="http://collector.test"
            ),
        )
    await gmap_collector_config_service.save_config(
        GmapCollectorConfig.model_validate(
            {
                "collectors": [
                    {"url": "http://second.test", "api_key": "other"},
                    {"url": "http://collector.test", "api_key": "rotated"},
                ],
                "proxies": [],
            }
        )
    )
    waiting = asyncio.Event()
    release = False
    calls: list[str] = []
    objects: list[bytes] = []

    def sdk(_self: BaseClient, operation_name: str, api_params: dict):
        assert operation_name == "PutObject"
        objects.append(api_params["Body"].read())
        return {}

    monkeypatch.setattr(BaseClient, "_make_api_call", sdk)

    async def respond(request: httpx.Request) -> httpx.Response:
        assert request.method == "GET" and request.url.host == "collector.test"
        assert request.headers["X-API-Key"] == "rotated"
        task_id = request.url.path.rsplit("/", 1)[1]
        calls.append(task_id)
        if task_id != locations[1, "search_item"]:
            return httpx.Response(404, json={"error": "task_not_found"})
        if not release:
            waiting.set()
            return httpx.Response(202, json={"task_id": task_id, "state": 20})
        return httpx.Response(
            200,
            json={
                "task_id": task_id,
                "state": 30,
                "response": {
                    "http_status": 200,
                    "body": {
                        "status": "ok",
                        "entries": [
                            {
                                "name": "recovered",
                                "fid": FID + "b",
                                "place_id": "new-place",
                                "search_keyword": "recover",
                                "website": "https://restore.example.test/contact",
                            }
                        ],
                    },
                },
            },
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as http:
        gmap_collector_client._client = http
        await export_job_runtime.start()
        await asyncio.wait_for(waiting.wait(), timeout=5)
        await export_job_runtime.stop()
        before = (
            await export_job_service.export_run_lists(
                user_id=state.user_id, job_nos=[job.job_no]
            )
        )[0]
        assert (
            before.status == ExportRunStatus.COLLECTING
            and before.started_at == started_at
        )
        release = True
        await export_job_runtime.start()
        finished, final_run = await _wait_job(state, job.job_no)
        assert (
            finished.status == ExportRunStatus.PARTIAL
            and final_run.started_at == started_at
        )
        checkpoint = final_run.checkpoint
        assert checkpoint.output_count == 2 and [
            i.result_count for i in checkpoint.item_results
        ] == [1, 1, 0]
        assert (
            checkpoint.item_results[1].error_code
            and checkpoint.item_results[2].error_code
        )
        assert (
            set(calls) == set(locations.values())
            and calls.count(locations[1, "search_item"]) == 2
        )
        assert len(objects) == 1 and b"uncommitted trailing bytes" not in objects[0]
        assert list(csv.reader(StringIO(objects[0].decode("utf-8-sig"))))[-1][29] == ""
        await export_job_runtime.stop()
        previous_calls = len(calls)
        # 已耗尽的固定首次期限不会因新 Runtime 而重采。
        expired, expired_run = await _new_job(state, ["expired"])
        await export_job_service.start_run(expired_run)
        async with get_async_session() as db:
            await db.execute(
                update(model)
                .where(model.run_no == expired_run.run_no)
                .values(started_at=timestamp_now() - 3_601_000)
            )
            await db.commit()
        await export_job_runtime.start()
        _, failed = await _wait_job(state, expired.job_no)
        assert failed.status == ExportRunStatus.FAILED and len(calls) == previous_calls


async def _prove_success_and_usage_commit_atomically_and_publishing_is_not_retried(
    real_export_state: _CleanupState,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    state = real_export_state
    job, run = await _new_job(state, ["atomic"])
    await _commit_first_row(job, run)
    result = ExportRunResult(
        object_key=f"test/{job.job_no}.csv",
        size_bytes=1,
        output_count=1,
        sha256="0" * 64,
        columns=[c.header for c in GMAP_PUBLIC_COLUMNS],
    )
    await export_job_service.prepare_run(run, result)
    stale = (
        await export_job_service.export_run_lists(
            user_id=state.user_id, job_nos=[job.job_no]
        )
    )[0]
    async with get_async_session() as db:
        await online_usage_service.consume_in_session(
            db, user_id=state.user_id, records=1, request_id=job.job_no
        )
        await db.commit()
    with pytest.raises(IntegrityError):
        await export_job_service.settle_run(
            run, status=ExportRunStatus.COMPLETED, result=result
        )
    unchanged = await export_job_service.export_job_info(
        user_id=state.user_id, job_no=job.job_no
    )
    persisted = (
        await export_job_service.export_run_lists(
            user_id=state.user_id, job_nos=[job.job_no]
        )
    )[0]
    assert (
        unchanged is not None
        and unchanged.status == persisted.status == ExportRunStatus.PUBLISHING
        and unchanged.result_json is None
    )
    async with get_async_session() as db:
        await db.execute(
            delete(UserUsageLogModel).where(
                UserUsageLogModel.user_id == state.user_id,
                UserUsageLogModel.request_id == job.job_no,
            )
        )
        await db.commit()
    assert await export_job_service.settle_run(
        run, status=ExportRunStatus.COMPLETED, result=result
    )
    assert not await export_job_service.settle_run(
        stale, status=ExportRunStatus.COMPLETED, result=result
    )
    assert not await export_job_service.settle_run(stale, status=ExportRunStatus.FAILED)
    async with get_async_session() as db:
        logs = list(
            (
                await db.scalars(
                    select(UserUsageLogModel).where(
                        UserUsageLogModel.user_id == state.user_id
                    )
                )
            ).all()
        )
        assert len(logs) == 1 and logs[0].delta == 1
    published = await export_job_service.export_job_info(
        user_id=state.user_id, job_no=job.job_no
    )
    assert published is not None and published.result_json == result.model_dump(
        mode="json"
    )
    abandoned, abandoned_run = await _new_job(state, ["abandoned"])
    await _commit_first_row(abandoned, abandoned_run)
    await export_job_service.prepare_run(abandoned_run, result)
    calls: list[str] = []

    def sdk(_self: BaseClient, operation_name: str, api_params: dict) -> dict:
        calls.append(operation_name)
        return {}

    monkeypatch.setattr(BaseClient, "_make_api_call", sdk)
    await export_job_runtime.start()
    failed_job, failed_run = await _wait_job(state, abandoned.job_no)
    assert (
        failed_job.result_json is None
        and failed_run.status == ExportRunStatus.FAILED
        and failed_run.error_code == CommonCode.EXPORT_PUBLISH_FAILED
    )
    assert not calls


async def _clear_exports(state: _CleanupState) -> None:
    await export_job_runtime.stop()
    job_model = ExportJobModel.model_for_user(state.user_id)
    run_model = ExportRunModel.model_for_user(state.user_id)
    async with get_async_session() as db:
        await db.execute(delete(run_model).where(run_model.user_id == state.user_id))
        await db.execute(delete(job_model).where(job_model.user_id == state.user_id))
        await db.execute(
            delete(UserUsageLogModel).where(UserUsageLogModel.user_id == state.user_id)
        )
        await db.commit()


async def test_real_export_csv_recovery_and_atomic_usage(
    real_export_state: _CleanupState,
    real_async_client: httpx.AsyncClient,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    real_user_factory,
) -> None:
    # Runtime 的生命周期属于同一应用事件循环，三个阶段共用真实资源与清理边界。
    await _prove_csv_contacts_permissions_and_single_failed_publish(
        real_export_state,
        real_async_client,
        test_run_id,
        monkeypatch,
        real_user_factory,
    )
    await _clear_exports(real_export_state)
    await _prove_restart_queries_original_calls_and_preserves_committed_rows(
        real_export_state, monkeypatch
    )
    await _clear_exports(real_export_state)
    await _prove_success_and_usage_commit_atomically_and_publishing_is_not_retried(
        real_export_state, monkeypatch
    )
