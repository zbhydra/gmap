"""Admin 系统配置 API real 集成测试。

真实资源依赖：MySQL 的 admins / system_data 表。测试结束后精确恢复固定
gmap_engine 与 object_storage 行；这些配置键不可并发写入。
"""

from __future__ import annotations

from copy import deepcopy
from typing import TypedDict
from uuid import uuid4

import pytest
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.constants.object_storage import OBJECT_STORAGE_DATA_KEY
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue, SystemDataModel
from app.services.object_storage_config_service import object_storage_config_service
from app.services.system_data_service import system_data_service


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_GMAP_ENDPOINT = "/api/admin/system-settings/gmap-engine"
_OBJECT_STORAGE_ENDPOINT = "/api/admin/system-settings/object-storage"


class _StoragePayload(TypedDict):
    active_id: str | None
    items: list[dict[str, str]]


async def _read_stored_config(data_key: str) -> JsonValue | None:
    """绕过进程缓存读取配置，证明 API 已真实写入数据库。"""
    async with AsyncSession(get_engine()) as session:
        return await session.scalar(
            select(SystemDataModel.data_value).where(
                SystemDataModel.data_key == data_key
            )
        )


async def test_real_save_gmap_engine_persists_and_reads_config(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
) -> None:
    """认证管理员保存万条代理后，GET 与 system_data 均完整返回新值。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "provider": "http",
        "proxies": [
            f"http://user-{test_run_id}:password@proxy-{index}.example:8080"
            for index in range(10_001)
        ],
        "concurrency": 7,
    }

    save_response = await real_async_client.post(
        _GMAP_ENDPOINT, json=payload, headers=headers
    )
    assert save_response.status_code == 200
    assert save_response.json()["code"] == CommonCode.SUCCESS
    assert save_response.json()["data"] == payload

    get_response = await real_async_client.get(_GMAP_ENDPOINT, headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["code"] == CommonCode.SUCCESS
    assert get_response.json()["data"] == payload
    assert await _read_stored_config(GMAP_ENGINE_DATA_KEY) == payload


async def test_real_object_storage_multiple_locations_switch_and_preserve_ids(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
    caplog,
) -> None:
    """两 R2 与两 AliOSS 可轮换启用和凭据，已有位置不可变且读取不依赖缓存。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    items = [
        {
            "id": str(uuid4()),
            "name": f"{provider}-{index}-{test_run_id}",
            "provider": provider,
            "bucket": f"bucket-{index}-{test_run_id}",
            "access_key_id": f"access-{index}-{test_run_id}",
            **(
                {
                    "account_id": f"account-{index}",
                    "secret_access_key": f"secret-r2-{index}-{test_run_id}",
                }
                if provider == "R2"
                else {
                    "endpoint": "https://oss-cn-hangzhou.aliyuncs.com",
                    "access_key_secret": f"secret-ali-{index}-{test_run_id}",
                }
            ),
        }
        for index, provider in enumerate(("R2", "R2", "AliOSS", "AliOSS"))
    ]
    expected: _StoragePayload = {"active_id": items[0]["id"], "items": items}
    payload = deepcopy(expected)
    payload["items"][0]["name"] = f" {items[0]['name']} "
    payload["items"][2]["endpoint"] += "/"

    for method in ("get", "post"):
        response = await getattr(real_async_client, method)(_OBJECT_STORAGE_ENDPOINT)
        assert response.status_code == 401
        assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS

    response = await real_async_client.post(
        _OBJECT_STORAGE_ENDPOINT, json=payload, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == expected
    assert await _read_stored_config(OBJECT_STORAGE_DATA_KEY) == expected

    await system_data_service.get(OBJECT_STORAGE_DATA_KEY)
    expected["active_id"] = items[2]["id"]
    # 模拟另一进程保存，当前进程仍保留旧缓存。
    async with AsyncSession(get_engine()) as session:
        await session.execute(
            update(SystemDataModel)
            .where(SystemDataModel.data_key == OBJECT_STORAGE_DATA_KEY)
            .values(data_value=expected)
        )
        await session.commit()
    response = await real_async_client.get(_OBJECT_STORAGE_ENDPOINT, headers=headers)
    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == expected
    active = await object_storage_config_service.get_active()
    assert active is not None and active.id == items[2]["id"]
    original = await object_storage_config_service.get_item(items[0]["id"])
    assert original is not None and original.bucket == items[0]["bucket"]

    invalid_requests: list[_StoragePayload] = []
    for index, field in ((0, "account_id"), (1, "bucket"), (2, "endpoint")):
        invalid = deepcopy(expected)
        invalid["items"][index][field] += "-changed"
        invalid_requests.append(invalid)
    invalid = deepcopy(expected)
    invalid["items"][0] = {**items[2], "id": items[0]["id"]}
    invalid_requests.append(invalid)
    invalid_requests.extend(
        [
            {"active_id": str(uuid4()), "items": items},
            {"active_id": items[0]["id"], "items": [items[0], items[0]]},
            {
                "active_id": items[0]["id"],
                "items": [items[0], {**items[1], "secret_access_key": ""}],
            },
            {
                "active_id": items[0]["id"],
                "items": [
                    items[0],
                    {
                        **items[2],
                        "endpoint": "https://hidden-secret@example.com/path?key=hidden-secret",
                    },
                ],
            },
        ]
    )
    for invalid in invalid_requests:
        response = await real_async_client.post(
            _OBJECT_STORAGE_ENDPOINT, json=invalid, headers=headers
        )
        assert response.status_code == 200
        assert response.json()["code"] == CommonCode.VALIDATION_ERROR
        assert "hidden-secret" not in response.text
    assert await _read_stored_config(OBJECT_STORAGE_DATA_KEY) == expected

    items[0]["name"] += "-renamed"
    items[0]["secret_access_key"] += "-rotated"
    expected = {"active_id": items[3]["id"], "items": items[:1] + items[2:]}
    response = await real_async_client.post(
        _OBJECT_STORAGE_ENDPOINT, json=expected, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    response = await real_async_client.get(_OBJECT_STORAGE_ENDPOINT, headers=headers)
    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == expected
    assert await _read_stored_config(OBJECT_STORAGE_DATA_KEY) == expected
    assert await object_storage_config_service.get_item(items[1]["id"]) is None
    for marker in ("access-", "secret-r2-", "secret-ali-", "hidden-secret"):
        assert marker not in caplog.text
