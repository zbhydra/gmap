"""Online service 主流程；真实 MySQL 任务/计量/订阅与 Redis 告警去重，配置表只读。"""

import asyncio
from urllib.parse import unquote
from uuid import uuid4

import httpx
import pytest
from botocore.client import BaseClient  # type: ignore[import-untyped]
from curl_cffi.requests import AsyncSession
from sqlalchemy import delete, select, update

from app.constants.maps_online import TASK_TIMEOUT_SECONDS
import app.services.maps_online_task_service as online_module
from app.constants.subscription import MAPS_ONLINE_PRODUCT_LINE
from app.core.config import settings
from app.core.database import get_async_session
from app.models.maps_online_task_item_model import get_item_model
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.provider.gmap import gmap_http_provider
from app.schemas.admin_schema import (
    GmapEngineConfigRequest,
    ObjectStorageConfig,
    R2StorageConfig,
)
from app.services.maps_engine_service import maps_engine_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.maps_online_task_service import maps_online_task_service
from app.utils.redis_key import build_redis_key
from app.utils.time import timestamp_now
from tests.integration.real.services.conftest import _MapsOnlineCleanupState
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _EMPTY_REGULAR,
    _Response,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def _wait_log(caplog: pytest.LogCaptureFixture, message: str) -> None:
    async with asyncio.timeout(3):
        while message not in caplog.text:
            await asyncio.sleep(0.01)


async def test_real_online_task_reports_once_and_recovers_pending_items(
    real_maps_online_cleanup_state: _MapsOnlineCleanupState,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    state = real_maps_online_cleanup_state
    service = maps_online_task_service
    keywords = [f"{state.test_run_id}-{index}" for index in range(4)]
    task, items = await service.create_task(
        user_id=state.user_id,
        keywords=keywords,
        provider="http",
        storage_id=state.test_run_id,
    )
    state.task_ids.append(task.id)
    assert len(service._tasks) == 4
    # 创建返回后可在任何外部采集开始前关闭，模拟进程重启。
    await service.close()
    assert get_item_model(task.id).__tablename__ == (
        f"maps_online_task_items_{task.id % 20:02d}"
    )
    assert all(type(item) is get_item_model(task.id) for item in items)
    assert [item.keyword for item in items] == keywords
    assert [item.sequence for item in items] == [1, 2, 3, 4]
    assert [item.id for item in await service.item_lists(task.id)] == [
        item.id for item in items
    ]
    detail = await service.task_info(task_no=task.task_no, user_id=state.user_id)
    assert detail is not None
    assert (detail.total_count, detail.processed_count, detail.record_count) == (
        4,
        0,
        0,
    )
    assert detail.storage_id == state.test_run_id

    other_task, _ = await service.create_task(
        user_id=state.user_id,
        keywords=[f"{state.test_run_id}-other"],
        provider="gosom",
        storage_id=state.test_run_id,
    )
    state.task_ids.append(other_task.id)
    await service.close()
    # 模拟迁移到另一 business 节点的任务，恢复必须按 app_name 隔离。
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == other_task.id)
            .values(app_name=f"other-real-{state.test_run_id}")
        )
        await db.commit()
    assert await service.count_tasks(user_id=state.user_id) == 2
    assert [
        row.id for row in await service.task_lists(user_id=state.user_id, limit=1)
    ] == [other_task.id]
    assert [
        row.id
        for row in await service.task_lists(user_id=state.user_id, offset=1, limit=1)
    ] == [task.id]

    object_key = f"online/{state.test_run_id}/{items[0].id}.csv"
    reports = await asyncio.gather(
        *(
            service.report_item(task.id, items[0].id, "success", 7, object_key, "")
            for _ in range(2)
        )
    )
    assert sorted(reports) == [False, True]
    assert not await service.report_item(
        task.id, items[0].id, "failed", 0, None, "重复执行失败"
    )
    detail = await service.task_info(task.id)
    assert detail is not None
    assert (detail.processed_count, detail.record_count, detail.error_item_count) == (
        1,
        7,
        0,
    )
    saved_items = await service.item_lists(task.id)
    assert saved_items[0].object_key == object_key
    assert saved_items[0].completed_at > 0
    assert saved_items[0].error is None
    assert [row.id for row in await service.item_lists(task.id, completed_at=0)] == [
        item.id for item in items[1:]
    ]
    assert [
        row.id
        for row in await service.task_lists(
            user_id=state.user_id,
            completed_at=0,
            app_name=settings.app.name,
            limit=None,
        )
    ] == [task.id]

    # 只改本次创建的父行：item 更新后父累计溢出，必须整事务回滚。
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == task.id)
            .values(record_count=2**31 - 1)
        )
        await db.commit()
    caplog.clear()
    service._start(
        service._report_and_complete(
            task, items[1].id, "success", 2, f"{object_key}.partial", "部分结果"
        )
    )
    await _wait_log(caplog, "maps_online_task_service.report_item:")
    assert (await service.item_lists(task.id))[1].completed_at == 0
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == task.id)
            .values(record_count=7)
        )
        await db.commit()
    await asyncio.wait_for(asyncio.gather(*service._tasks), timeout=8)
    assert caplog.text.count("maps_online_task_service.report_item:") == 1
    assert (await service.item_lists(task.id))[1].object_key == f"{object_key}.partial"

    alarms: list[dict[str, object]] = []

    async def post(
        _self: httpx.AsyncClient, url: str, *, json: dict[str, object]
    ) -> httpx.Response:
        assert url == "https://feishu.example.test/u3"
        alarms.append(json)
        return httpx.Response(200, json={"code": 0}, request=httpx.Request("POST", url))

    # 只给本测试进程提供 Feishu 出口配置，实际 HTTP 发送替换为固定成功响应。
    monkeypatch.setattr(
        settings,
        "feishu_alarm",
        settings.feishu_alarm.model_copy(
            update={"enabled": True, "webhook_url": "https://feishu.example.test/u3"}
        ),
    )
    monkeypatch.setattr(httpx.AsyncClient, "post", post)
    state.redis_keys.append(
        build_redis_key(f"feishu_alarm:maps_online_report:{task.id}:{items[2].id}")
    )
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == task.id)
            .values(error_item_count=2**31 - 1)
        )
        await db.commit()
    caplog.clear()
    await asyncio.wait_for(
        service._report_and_complete(
            task, items[2].id, "failed", 0, None, f"private-{state.test_run_id}"
        ),
        timeout=13,
    )
    failed_reports = [
        r
        for r in caplog.records
        if "maps_online_task_service.report_item:" in r.getMessage()
    ]
    assert len(failed_reports) == 3
    assert all(
        right.created - left.created >= 4.9
        for left, right in zip(failed_reports, failed_reports[1:])
    )
    assert len(alarms) == 1
    assert task.task_no in str(alarms[0]) and str(items[2].id) in str(alarms[0])
    assert f"private-{state.test_run_id}" not in caplog.text + str(alarms)
    assert (await service.item_lists(task.id))[2].completed_at == 0
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == task.id)
            .values(
                error_item_count=0,
                created_at=timestamp_now() - TASK_TIMEOUT_SECONDS * 1000 - 1,
            )
        )
        # 独占订阅指向不存在的档位，使真实 consume 失败；不写 config_*。
        db.add(UserSubscriptionModel(user_id=state.user_id, product_line=MAPS_ONLINE_PRODUCT_LINE, product_id=f"missing-{state.test_run_id}", expires_at=timestamp_now() + 60_000))  # type: ignore[call-arg]
        await db.commit()
    assert await service.report_item(
        task.id, items[3].id, "success", 0, f"{object_key}.empty", ""
    )
    detail = await service.task_info(task.id)
    assert detail is not None
    assert (detail.processed_count, detail.record_count, detail.error_item_count) == (
        3,
        9,
        0,
    )
    # item 全部收口后仍由任务完成方法计量，再提交父任务终态。
    assert detail.completed_at == 0
    assert [row.id for row in await service.item_lists(task.id, completed_at=0)] == [
        items[2].id
    ]
    caplog.clear()
    await service.recover()
    await _wait_log(caplog, "maps_online_task_service.complete_task:")
    detail = await service.task_info(task.id)
    assert (
        detail is not None and detail.processed_count == 4 and detail.completed_at == 0
    )
    async with get_async_session() as db:
        assert (
            list(
                (
                    await db.scalars(
                        select(UserUsageLogModel).where(
                            UserUsageLogModel.user_id == state.user_id
                        )
                    )
                ).all()
            )
            == []
        )
        await db.execute(
            delete(UserSubscriptionModel).filter_by(
                user_id=state.user_id, product_line=MAPS_ONLINE_PRODUCT_LINE
            )
        )
        await db.commit()
    await asyncio.wait_for(asyncio.gather(*service._tasks), timeout=8)
    assert caplog.text.count("maps_online_task_service.complete_task:") == 1
    detail = await service.task_info(task.id)
    assert detail is not None and detail.completed_at > 0

    # 真实配置读写链复用 Admin fixture 恢复；HTTP 与 SDK 只替换网络出口。
    storage_id = str(uuid4())
    await object_storage_config_service.save_config(
        ObjectStorageConfig(
            active_id=storage_id,
            items=[
                R2StorageConfig(
                    id=storage_id,
                    name=f"u3-{state.test_run_id}",
                    provider="R2",
                    account_id="test",
                    bucket="test",
                    access_key_id="test",
                    secret_access_key="test",
                )
            ],
        )
    )
    await maps_engine_service.save_config(
        GmapEngineConfigRequest(
            provider="http", proxies=["http://proxy.test:8000"], concurrency=2
        )
    )
    reached = asyncio.Event()
    cancelled = asyncio.Event()

    async def get(_self: AsyncSession, url: str, **kwargs: object) -> _Response:
        if "maps?hl=" in url:
            return _Response(200, "maps", nid="test-nid")
        if "timeout" in unquote(url):
            reached.set()
            try:
                await asyncio.Event().wait()
            finally:
                cancelled.set()
        return _Response(200, _EMPTY_REGULAR)

    uploaded: list[str] = []

    def api_call(
        _self: BaseClient, operation_name: str, api_params: dict[str, object]
    ) -> dict[str, object]:
        assert operation_name == "PutObject"
        key, body = api_params["Key"], api_params["Body"]
        assert (
            isinstance(key, str)
            and isinstance(body, bytes)
            and body.startswith(b"\xef\xbb\xbf")
        )
        uploaded.append(key)
        return {"ETag": "test-etag"}

    monkeypatch.setattr(AsyncSession, "get", get)
    monkeypatch.setattr(BaseClient, "_make_api_call", api_call)
    monkeypatch.setattr(online_module, "TASK_TIMEOUT_SECONDS", 1)
    client = gmap_http_provider._client
    original = (client._init_lock, client._semaphore, client._proxies, client._session)
    client._init_lock, client._semaphore, client._proxies, client._session = (
        asyncio.Lock(),
        None,
        (),
        None,
    )
    try:
        live, live_items = await service.create_task(
            user_id=state.user_id,
            keywords=[f"{state.test_run_id}-empty", f"{state.test_run_id}-timeout"],
            provider="http",
            storage_id=storage_id,
        )
        state.task_ids.append(live.id)
        assert live.processed_count == 0 and len(service._tasks) == 2
        await asyncio.wait_for(reached.wait(), timeout=2)
        await asyncio.wait_for(asyncio.gather(*service._tasks), timeout=4)
        assert cancelled.is_set()
        live_detail = await service.task_info(live.id)
        assert live_detail is not None and live_detail.completed_at > 0
        assert (
            live_detail.processed_count,
            live_detail.record_count,
            live_detail.error_item_count,
        ) == (2, 0, 1)
        live_saved = await service.item_lists(live.id)
        assert live_saved[0].object_key == uploaded[0] and len(uploaded) == 1
        assert f"/{live.task_no}/{live_items[0].id}/" in uploaded[0]
        assert (
            live_saved[1].object_key is None
            and live_saved[1].error == "采集失败 error=TimeoutError"
        )
    finally:
        await service.close()
        if client._session is not None:
            await client._session.close()
        client._init_lock, client._semaphore, client._proxies, client._session = (
            original
        )
    assert (detail.processed_count, detail.record_count, detail.error_item_count) == (
        4,
        9,
        1,
    )
    untouched = await service.task_info(other_task.id)
    assert untouched is not None and untouched.processed_count == 0
    saved_items = await service.item_lists(task.id)
    assert saved_items[1].error == "部分结果"
    assert saved_items[2].error == "采集失败 error=TimeoutError"
    assert saved_items[2].object_key is None
    assert saved_items[3].object_key == f"{object_key}.empty"
    # 模拟计量已提交、父终态未提交：完成恢复和 CAS 0 重放并发仍只计一次。
    async with get_async_session() as db:
        await db.execute(
            update(MapsOnlineTaskModel)
            .where(MapsOnlineTaskModel.id == task.id)
            .values(completed_at=0)
        )
        await db.commit()
    await service.recover()
    await service._report_and_complete(
        task, items[0].id, "failed", 0, None, "重复执行失败"
    )
    await asyncio.wait_for(asyncio.gather(*service._tasks), timeout=5)
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
    assert [(row.request_id, row.delta) for row in logs] == [(task.task_no, 9)]
    detail = await service.task_info(task.id)
    assert detail is not None and detail.completed_at > 0
