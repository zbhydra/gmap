"""真实入口、MySQL、Redis 与 CSV；只替换 DNS、Google/官网 HTTP、OSS SDK 出口。

读取既有引擎和存储配置，不写配置表，不替换内部 service。
"""

import asyncio
import csv
import json
import socket
from dataclasses import dataclass, field
from io import StringIO

import pytest
from botocore.client import BaseClient  # type: ignore[import-untyped]
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient
from sqlalchemy import delete, select, text, update

from app.constants.maps_enrich import build_enrich_cache_key
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_item_model import get_item_model
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.provider.maps_online import CSV_HEADERS
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import maps_online_task_service as service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.usage_service import online_usage_service, usage_identity
from app.utils.redis_key import build_redis_key
from app.utils.time import timestamp_now
from tests.integration.real.api.client.test_maps_integrations_real import (
    _EnrichResponse,
)
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _GoogleSession,
    _REGULAR,
    _Response,
)
from app.provider.gmap.rpc.parsers import parse_regular_response

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
_ENDPOINT = "/api/client/maps-online/tasks"


@dataclass
class _CleanupState:
    task_ids: list[int] = field(default_factory=list)


async def test_real_online_contact_options_persist_recover_and_meter(
    real_async_client: AsyncClient,
    real_mysql_ready: None,
    real_redis_ready: None,
    real_user_factory,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    engine = await maps_engine_service.get_config()
    storage = await object_storage_config_service.get_active()
    if (
        engine.provider != "http"
        or not engine.proxies
        or storage is None
        or storage.provider != "R2"
    ):
        pytest.skip("REAL_OSS_UNAVAILABLE: 此入口验收需现有 HTTP 代理池及 R2 配置")
    async with get_async_session() as db:
        columns = (await db.execute(text("SHOW COLUMNS FROM maps_online_tasks"))).all()
    if "include_contacts" not in {row[0] for row in columns}:
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少 include_contacts")
    user_id, token = await real_user_factory(f"contacts-{test_run_id}@example.com")
    state = _CleanupState()
    headers = {"Authorization": f"Bearer {token}"}
    domain = f"contacts-{test_run_id}.example.com"
    cache_key = build_redis_key(build_enrich_cache_key(domain))
    redis = await redis_client.get_client()
    cached = json.dumps({"emails": ["cached@merchant.test"], "medias": {}})
    websites = {
        row["website"] for row in parse_regular_response(_REGULAR) if row.get("website")
    }
    original_dns = socket.getaddrinfo

    def dns(host, port, *args, **kwargs):
        return original_dns(
            "1.1.1.1" if host == domain else host, port, *args, **kwargs
        )

    monkeypatch.setattr(socket, "getaddrinfo", dns)
    google = _GoogleSession()
    _GoogleSession.scenario = "l2_failure"
    _GoogleSession.browser_calls = 0
    _GoogleSession.urls = []
    release = asyncio.Event()
    started = asyncio.Event()
    site_calls = 0
    objects: dict[str, bytes] = {}

    async def get(
        session: AsyncSession, url: str, **kwargs: object
    ) -> _Response | _EnrichResponse:
        nonlocal site_calls
        if kwargs.get("stream"):
            assert session.proxies["all"] in engine.proxies
            site_calls += 1
            return _EnrichResponse()
        started.set()
        await release.wait()
        response = await google.get(url, **kwargs)
        for website in websites:
            assert isinstance(website, str)
            response.text = response.text.replace(website, f"https://{domain}/contact")
        return response

    def upload(
        _self: BaseClient, operation: str, params: dict[str, object]
    ) -> dict[str, str]:
        assert operation == "PutObject"
        key, body = params["Key"], params["Body"]
        assert isinstance(key, str) and isinstance(body, bytes)
        objects[key] = body
        return {"ETag": "contacts-test"}

    monkeypatch.setattr(AsyncSession, "get", get)
    monkeypatch.setattr(BaseClient, "_make_api_call", upload)

    async def create(option: bool | None) -> MapsOnlineTaskModel:
        payload: dict[str, object] = {"keywords": [f"contacts-{test_run_id}"]}
        if option is not None:
            payload["include_contacts"] = option
        response = await real_async_client.post(
            _ENDPOINT, headers=headers, json=payload
        )
        assert response.status_code == 200
        body = response.json()
        assert body["code"] == CommonCode.SUCCESS
        task = await service.task_info(task_no=body["data"]["task_no"])
        assert task is not None
        state.task_ids.append(task.id)
        return task

    async def finish(task: MapsOnlineTaskModel, email: str) -> None:
        async with asyncio.timeout(15):
            while True:
                saved = await service.task_info(task.id)
                assert saved is not None
                if saved.completed_at:
                    break
                await asyncio.sleep(0.02)
        assert saved.record_count == 20 and saved.error_item_count == 0
        item = (await service.item_lists(task.id))[0]
        assert item.object_key is not None
        rows = list(
            csv.DictReader(StringIO(objects[item.object_key].decode("utf-8-sig")))
        )
        assert list(rows[0]) == CSV_HEADERS and len(rows[0]) == 36
        assert len(rows) == 20
        assert all(row["Emails"] == (email if row["Website"] else "") for row in rows)

    try:
        await redis.set(cache_key, cached, ex=60)
        release.set()
        free = await create(True)
        assert free.include_contacts is False
        await finish(free, "")
        assert site_calls == 0 and await redis.get(cache_key) == cached

        async with get_async_session() as db:
            db.add(
                UserSubscriptionModel(  # type: ignore[call-arg]
                    user_id=user_id,
                    product_kind="maps_online",
                    product_id="online_lite",
                    expires_at=timestamp_now() + 86400000,
                )
            )
            await db.commit()
        release.clear()
        started.clear()
        enabled = await create(None)
        disabled = await create(False)
        assert enabled.include_contacts is True and disabled.include_contacts is False
        await asyncio.wait_for(started.wait(), 2)
        await service.close()
        pending = await service.task_info(enabled.id)
        assert pending is not None and not pending.completed_at
        assert len(objects) == 1
        # 重启前权益到期；恢复仍沿用创建时有效值。
        async with get_async_session() as db:
            await db.execute(
                update(UserSubscriptionModel)
                .filter_by(user_id=user_id, product_kind="maps_online")
                .values(expires_at=timestamp_now() - 1)
            )
            await db.commit()
        await redis.delete(cache_key)
        await service.recover()
        release.set()
        await finish(enabled, "owner@maps-real.example")
        await finish(disabled, "")
        assert site_calls == 1
        usage = await online_usage_service.get_usage(
            usage_identity(user_id, None), user_id=user_id
        )
        assert usage.used == 60
        async with get_async_session() as db:
            logs = (
                await db.scalars(
                    select(UserUsageLogModel).where(
                        UserUsageLogModel.user_id == user_id
                    )
                )
            ).all()
        assert len(logs) == 3 and sum(log.delta for log in logs) == 60
    finally:
        await service.close()
        await redis.delete(cache_key)
        async with get_async_session() as db:
            for task_id in state.task_ids:
                model = get_item_model(task_id)
                await db.execute(delete(model).where(model.task_id == task_id))
            await db.execute(
                delete(MapsOnlineTaskModel).where(
                    MapsOnlineTaskModel.user_id == user_id
                )
            )
            await db.execute(
                delete(UserUsageLogModel).where(UserUsageLogModel.user_id == user_id)
            )
            await db.commit()
