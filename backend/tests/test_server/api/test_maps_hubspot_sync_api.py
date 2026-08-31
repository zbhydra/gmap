"""Maps HubSpot 同步代理 API 契约测试（013 A10，U9）。"""

import pytest

from app.services import maps_hubspot_service as maps_hubspot_service_module
from app.services.maps_hubspot_service import maps_hubspot_service


# 观测位依赖（get_current_user_optional）要求至少携带设备标识；格式需匹配
# validate_request_device_id 的 `^[A-Za-z0-9_-]+$`。插件端由 deviceIdInjector 恒注入。
ANONYMOUS_DEVICE_ID = "maps-ext-anonymous"


def _stub_create_batch(monkeypatch, calls: list[dict[str, object]]) -> None:
    """替换 HubSpot batch create 调用，记录每次批次入参。"""

    async def fake_create_batch(_client, token: str, batch: list) -> None:
        calls.append({"token": token, "batch": batch})

    monkeypatch.setattr(maps_hubspot_service, "_create_batch", fake_create_batch)


@pytest.mark.asyncio
async def test_maps_hubspot_sync_rejects_missing_token(async_client):
    """token 缺失走 pydantic 校验（VALIDATION_ERROR 通道）。"""
    response = await async_client.post(
        "/api/client/maps/hubspot/sync",
        json={"businesses": [{"name": "Cafe"}]},
        headers={"X-Device-Id": ANONYMOUS_DEVICE_ID},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_maps_hubspot_sync_rejects_oversized_businesses(async_client):
    """businesses 超过 500 条上限拒绝（与插件批量任务上限一致）。"""
    response = await async_client.post(
        "/api/client/maps/hubspot/sync",
        json={
            "token": "hs-token",
            "businesses": [{"name": f"c{i}"} for i in range(501)],
        },
        headers={"X-Device-Id": ANONYMOUS_DEVICE_ID},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_maps_hubspot_sync_forwards_batches_and_returns_synced(
    async_client, monkeypatch
):
    """端点把 token 与商家转发给服务，响应信封 data.synced 为条数。"""
    calls: list[dict[str, object]] = []
    _stub_create_batch(monkeypatch, calls)
    businesses = [
        {
            "name": "Cafe A",
            "domain": "cafea.com",
            "phone": "",
            "address": "1 St",
            "city": "NY",
        },
        {"name": "Cafe B"},
    ]

    response = await async_client.post(
        "/api/client/maps/hubspot/sync",
        json={"token": "hs-token", "businesses": businesses},
        headers={"X-Device-Id": ANONYMOUS_DEVICE_ID},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    assert body["data"] == {"synced": 2}
    assert calls == [
        {
            "token": "hs-token",
            "batch": [
                {
                    "properties": {
                        "name": "Cafe A",
                        "domain": "cafea.com",
                        "address": "1 St",
                        "city": "NY",
                    }
                },
                {"properties": {"name": "Cafe B"}},
            ],
        }
    ]


@pytest.mark.asyncio
async def test_maps_hubspot_sync_maps_empty_fields_to_hubspot_payload(
    async_client, monkeypatch
):
    """空串属性被剔除，全空商家映射为空 properties（不发脏字段给 HubSpot）。"""
    calls: list[dict[str, object]] = []
    _stub_create_batch(monkeypatch, calls)

    response = await async_client.post(
        "/api/client/maps/hubspot/sync",
        json={"token": "hs-token", "businesses": [{"name": "", "domain": "d.com"}]},
        headers={"X-Device-Id": ANONYMOUS_DEVICE_ID},
    )

    assert response.status_code == 200
    assert calls[0]["batch"] == [{"properties": {"domain": "d.com"}}]


@pytest.mark.asyncio
async def test_maps_hubspot_service_maps_upstream_rejection_to_common_code(monkeypatch):
    """HubSpot 401 拒绝统一映射 MAPS_HUBSPOT_SYNC_FAILED 业务异常。"""
    from app.exceptions.common_exception import AppCommonException
    from app.i18n.common_code import CommonCode
    from app.schemas.maps_hubspot_schema import MapsHubspotBusiness

    class FakeResponse:
        status_code = 401
        is_error = True
        text = '{"error": "unauthorized"}'

    class FakeAsyncClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return False

        async def post(self, *_args, **_kwargs):
            return FakeResponse()

    monkeypatch.setattr(
        maps_hubspot_service_module.httpx,
        "AsyncClient",
        lambda **_kwargs: FakeAsyncClient(),
    )

    with pytest.raises(AppCommonException) as exc_info:
        await maps_hubspot_service.sync_companies(
            "bad-token", [MapsHubspotBusiness(name="Cafe")]
        )

    assert exc_info.value.code == CommonCode.MAPS_HUBSPOT_SYNC_FAILED


@pytest.mark.asyncio
async def test_maps_hubspot_sync_anonymous_request_forwards(async_client, monkeypatch):
    """当前行为记录：匿名（仅 device_id）请求不被观测位阻断，照常转发。

    get_current_user_optional 为观测位（与 mark 通道惯例一致）；真门控
    （登录强制/配额扣减）随 U7 收口，届时本用例需同步改写预期。
    """
    calls: list[dict[str, object]] = []
    _stub_create_batch(monkeypatch, calls)

    response = await async_client.post(
        "/api/client/maps/hubspot/sync",
        json={"token": "hs-token", "businesses": [{"name": "Cafe"}]},
        headers={"X-Device-Id": ANONYMOUS_DEVICE_ID},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == 10000
    assert body["data"] == {"synced": 1}
    assert calls[0]["token"] == "hs-token"
