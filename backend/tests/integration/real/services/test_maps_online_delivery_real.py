"""真实 MySQL/Redis/文件交付与计量；配置只读，仅替换 DNS、HTTP、存储 SDK 出口。"""

import asyncio
import csv
import socket
import threading
from io import StringIO
from pathlib import Path

import alibabacloud_oss_v2 as oss
import pytest
from botocore.client import BaseClient
from curl_cffi.requests import AsyncSession
from sqlalchemy import delete, select, text
from traffic_scope import current_scope

import app.provider.maps_online as provider_module
import app.services.maps_online_task_service as service_module
from app.constants.maps_enrich import build_enrich_cache_key
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.models.maps_online_task_item_model import ITEM_MODELS, get_item_model
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.provider.gmap import gmap_http_provider
from app.provider.gmap.rpc.parsers import parse_regular_response
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import MapsOnlineTaskService
from app.services.object_storage_config_service import object_storage_config_service
from app.utils.redis_key import build_redis_key
from tests.integration.real.api.client.test_maps_integrations_real import (
    _EnrichResponse,
)
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _GoogleSession,
    _REGULAR,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_online_delivery_preserves_partial_contacts_and_only_meters_uploads(
    real_mysql_ready: None,
    real_redis_ready: None,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    caplog: pytest.LogCaptureFixture,
) -> None:
    required = {model.__tablename__ for model in ITEM_MODELS} | {
        "maps_online_tasks",
        "user_usage_logs",
        "config_subscription_product",
    }
    async with get_async_session() as db:
        tables = set((await db.execute(text("SHOW TABLES"))).scalars())
    if required - tables:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少 Online 交付测试所需表")
    storage = await object_storage_config_service.get_active()
    engine = await maps_engine_service.get_config()
    if storage is None or not engine.proxies:
        pytest.skip("REAL_OSS_UNAVAILABLE: 需要已配置存储和引擎代理，仅只读使用")

    service = MapsOnlineTaskService()
    user_id = int(test_run_id, 16)
    task_ids: list[int] = []
    cache_keys: list[str] = []
    redis = await redis_client.get_client()
    google = _GoogleSession()
    websites = sorted(
        {
            row["website"]
            for row in parse_regular_response(_REGULAR)
            if row.get("website")
        }
    )
    mode = "partial"
    site_started = asyncio.Event()
    site_cancelled = asyncio.Event()
    upload_started = threading.Event()
    release_upload = threading.Event()
    upload_finished = threading.Event()
    uploaded: list[bytes] = []
    contact_calls = 0
    original_dns = socket.getaddrinfo

    def resolve(host, port, *args, **kwargs):
        return original_dns(
            "1.1.1.1" if test_run_id in str(host) else host, port, *args, **kwargs
        )

    async def get(_session: AsyncSession, url: str, **kwargs: object):
        nonlocal contact_calls
        assert current_scope.get() is not None
        if mode == "base_timeout":
            await asyncio.Event().wait()
        if kwargs.get("stream"):
            contact_calls += 1
            if "slow-" in url:
                site_started.set()
                try:
                    await asyncio.Event().wait()
                finally:
                    site_cancelled.set()
            if "fail-" in url:
                raise OSError("官网访问失败")
            return _EnrichResponse()
        response = await google.get(url, **kwargs)
        for index, website in enumerate(websites):
            kind = ("fast", "slow", "social", "fail")[index % 4]
            target = (
                "https://facebook.com/Merchant"
                if kind == "social"
                else f"https://{kind}-{mode}-{test_run_id}.example.com/"
            )
            response.text = response.text.replace(website, target)
        return response

    def upload(body: bytes) -> None:
        if mode == "upload_fail":
            raise OSError("对象上传失败")
        if mode in ("upload_timeout", "cancel_upload"):
            upload_started.set()
            assert release_upload.wait(5)
        uploaded.append(body)
        upload_finished.set()

    def r2_call(_self, operation_name: str, api_params: dict[str, object]):
        assert operation_name == "PutObject"
        body = api_params["Body"]
        assert isinstance(body, bytes)
        upload(body)
        return {"ETag": "test"}

    def ali_put(_self, request, **kwargs):
        assert isinstance(request.body, bytes)
        upload(request.body)
        return oss.PutObjectResult(status_code=200)

    monkeypatch.setattr(socket, "getaddrinfo", resolve)
    monkeypatch.setattr(AsyncSession, "get", get)
    monkeypatch.setattr(BaseClient, "_make_api_call", r2_call)
    monkeypatch.setattr(oss.Client, "put_object", ali_put)
    monkeypatch.setattr(service_module, "TASK_TIMEOUT_SECONDS", 2)
    monkeypatch.setattr(provider_module, "DELIVERY_TIMEOUT_SECONDS", 1)
    client = gmap_http_provider._client
    original = (client._init_lock, client._semaphore, client._proxies, client._session)
    client._init_lock, client._semaphore, client._proxies, client._session = (
        asyncio.Lock(),
        None,
        (),
        None,
    )
    try:
        for mode in (
            "partial",
            "disabled",
            "base_timeout",
            "upload_fail",
            "upload_timeout",
            "cancel_contacts",
            "cancel_upload",
        ):
            caplog.clear()
            _GoogleSession.scenario = ""
            _GoogleSession.browser_calls = 0
            site_started.clear()
            site_cancelled.clear()
            upload_started.clear()
            upload_finished.clear()
            release_upload.clear()
            uploaded.clear()
            contact_calls = 0
            cache_keys.extend(
                build_redis_key(
                    build_enrich_cache_key(f"{kind}-{mode}-{test_run_id}.example.com")
                )
                for kind in ("fast", "slow", "fail")
            )
            task, items = await service.create_task(
                user_id=user_id,
                keywords=[f"{test_run_id}-{mode}"],
                provider="http",
                storage_id=storage.id,
                include_contacts=mode in ("partial", "cancel_contacts"),
            )
            task_ids.append(task.id)
            running = tuple(service._tasks)
            if mode == "cancel_contacts":
                await asyncio.wait_for(site_started.wait(), 2)
                await service.close()
                assert site_cancelled.is_set() and all(t.cancelled() for t in running)
            elif mode == "cancel_upload":
                assert await asyncio.to_thread(upload_started.wait, 2)
                await service.close()
                assert all(t.cancelled() for t in running)
            else:
                await asyncio.wait_for(asyncio.gather(*running), 5)
            if mode in ("upload_timeout", "cancel_upload"):
                assert upload_started.is_set()
                release_upload.set()
                assert await asyncio.to_thread(upload_finished.wait, 2)
            traffic_logs = [
                record.message
                for record in caplog.records
                if record.message.startswith(
                    f"maps_online.traffic: task={task.task_no} item={items[0].id} "
                    f"scope={task.task_no}:{items[0].id} "
                )
            ]
            assert len(traffic_logs) == 1
            assert "google_source=local_curl" in traffic_logs[0]
            assert (
                "status=cancelled" if mode.startswith("cancel_") else "status="
            ) in traffic_logs[0]
            if not mode.startswith("cancel_"):
                report_logs = [
                    record.message
                    for record in caplog.records
                    if record.message.startswith(
                        f"maps_online.report: task={task.task_no} item={items[0].id} "
                    )
                ]
                if report_logs:
                    assert caplog.text.index(traffic_logs[0]) < caplog.text.index(
                        report_logs[0]
                    )
            saved = await service.item_info(task.id, items[0].id)
            parent = await service.task_info(task.id)
            assert saved is not None and parent is not None
            async with get_async_session() as db:
                logs = list(
                    (
                        await db.scalars(
                            select(UserUsageLogModel).where(
                                UserUsageLogModel.user_id == user_id,
                                UserUsageLogModel.request_id == task.task_no,
                            )
                        )
                    ).all()
                )
            if mode in ("partial", "disabled"):
                assert (
                    saved.object_key and saved.record_count == parent.record_count == 20
                )
                assert parent.completed_at and parent.error_item_count == 0
                assert [log.delta for log in logs] == [20]
                path = tmp_path / f"{mode}.csv"
                path.write_bytes(uploaded[0])
                rows = list(
                    csv.DictReader(StringIO(path.read_text(encoding="utf-8-sig")))
                )
                assert rows.pop(0)["Fulladdress"] == "Full address"
                assert len(rows) == 20
                if mode == "partial":
                    assert site_cancelled.is_set() and "contact_supplement_partial" in (
                        saved.error or ""
                    )
                    assert any(
                        row["Emails"] == "owner@maps-real.example" for row in rows
                    )
                    assert any(
                        row["Facebook Links"] == "https://facebook.com/Merchant"
                        for row in rows
                    )
                    assert any(
                        "slow-" in row["Website"] and not row["Emails"] for row in rows
                    )
                else:
                    assert contact_calls == 0 and all(
                        not row["Emails"] and not row["Facebook Links"] for row in rows
                    )
            else:
                assert (
                    saved.object_key is None
                    and saved.record_count == parent.record_count == 0
                    and not logs
                )
                if mode.startswith("cancel_"):
                    assert not saved.completed_at and parent.processed_count == 0
                else:
                    assert (
                        saved.completed_at
                        and parent.completed_at
                        and parent.error_item_count == 1
                    )
    finally:
        release_upload.set()
        await service.close()
        await redis.delete(*cache_keys)
        if client._session is not None:
            await client._session.close()
        client._init_lock, client._semaphore, client._proxies, client._session = (
            original
        )
        async with get_async_session() as db:
            await db.execute(
                delete(UserUsageLogModel).where(UserUsageLogModel.user_id == user_id)
            )
            for task_id in task_ids:
                await db.execute(
                    delete(get_item_model(task_id)).where(
                        get_item_model(task_id).task_id == task_id
                    )
                )
            await db.execute(
                delete(MapsOnlineTaskModel).where(MapsOnlineTaskModel.id.in_(task_ids))
            )
            await db.commit()
