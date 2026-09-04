"""Admin 系统配置 API real 集成测试。

真实资源依赖：MySQL 的 admins / system_data 表。测试结束后精确恢复固定
gmap_engine 与 object_storage 行；这些配置键不可并发写入。
"""

from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.constants.object_storage import OBJECT_STORAGE_DATA_KEY
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue, SystemDataModel
from app.services.system_data_service import system_data_service


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_GMAP_ENDPOINT = "/api/admin/system-settings/gmap-engine"
_OBJECT_STORAGE_ENDPOINT = "/api/admin/system-settings/object-storage"


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
    """认证管理员保存配置后，GET 与 system_data 均返回新值。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "provider": "http",
        "proxies": [f"http://user-{test_run_id}:password@proxy.example:8080"],
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


@pytest.mark.parametrize("active", ["R2", "AliOSS"])
async def test_real_save_object_storage_persists_and_reads_config(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
    active: str,
) -> None:
    """两种对象存储配置保存后，GET 与 system_data 均返回规范化值。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "active": active,
        "R2": {
            "account_id": f" account-{test_run_id} " if active == "R2" else "",
            "bucket": " r2-bucket " if active == "R2" else "",
            "access_key_id": " r2-access-key " if active == "R2" else "",
            "secret_access_key": " r2-secret-key " if active == "R2" else "",
        },
        "AliOSS": {
            "endpoint": (
                " https://oss-cn-example.aliyuncs.com/ " if active == "AliOSS" else ""
            ),
            "bucket": " ali-bucket " if active == "AliOSS" else "",
            "access_key_id": " ali-access-key " if active == "AliOSS" else "",
            "access_key_secret": " ali-secret-key " if active == "AliOSS" else "",
        },
    }
    expected = {
        "active": active,
        "R2": {
            "account_id": f"account-{test_run_id}" if active == "R2" else "",
            "bucket": "r2-bucket" if active == "R2" else "",
            "access_key_id": "r2-access-key" if active == "R2" else "",
            "secret_access_key": "r2-secret-key" if active == "R2" else "",
        },
        "AliOSS": {
            "endpoint": (
                "https://oss-cn-example.aliyuncs.com" if active == "AliOSS" else ""
            ),
            "bucket": "ali-bucket" if active == "AliOSS" else "",
            "access_key_id": "ali-access-key" if active == "AliOSS" else "",
            "access_key_secret": "ali-secret-key" if active == "AliOSS" else "",
        },
    }

    save_response = await real_async_client.post(
        _OBJECT_STORAGE_ENDPOINT,
        json=payload,
        headers=headers,
    )
    assert save_response.status_code == 200
    assert save_response.json()["code"] == CommonCode.SUCCESS
    assert save_response.json()["data"] == expected

    get_response = await real_async_client.get(
        _OBJECT_STORAGE_ENDPOINT,
        headers=headers,
    )
    assert get_response.status_code == 200
    assert get_response.json()["code"] == CommonCode.SUCCESS
    assert get_response.json()["data"] == expected
    assert await _read_stored_config(OBJECT_STORAGE_DATA_KEY) == expected


@pytest.mark.parametrize(
    ("active", "missing_field"),
    [("R2", "account_id"), ("AliOSS", "endpoint")],
)
async def test_real_save_object_storage_rejects_incomplete_active_config(
    real_async_client,
    real_admin_token_for_system_settings: str,
    active: str,
    missing_field: str,
) -> None:
    """当前启用的对象存储块缺字段时返回统一校验错误。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "active": active,
        "R2": {
            "account_id": "account",
            "bucket": "bucket",
            "access_key_id": "access-key",
            "secret_access_key": "secret-key",
        },
        "AliOSS": {
            "endpoint": "https://oss-cn-example.aliyuncs.com",
            "bucket": "bucket",
            "access_key_id": "access-key",
            "access_key_secret": "secret-key",
        },
    }
    payload[active][missing_field] = ""

    response = await real_async_client.post(
        _OBJECT_STORAGE_ENDPOINT,
        json=payload,
        headers=headers,
    )
    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR


async def test_real_get_object_storage_rejects_incomplete_stored_config(
    real_async_client,
    real_admin_token_for_system_settings: str,
) -> None:
    """已有配置行缺少 active 块字段时返回通用内部错误。"""
    await system_data_service.set(OBJECT_STORAGE_DATA_KEY, {"active": "R2"})
    response = await real_async_client.get(
        _OBJECT_STORAGE_ENDPOINT,
        headers={"Authorization": f"Bearer {real_admin_token_for_system_settings}"},
    )
    assert response.status_code == 500
    assert response.json()["code"] == CommonCode.INTERNAL_SERVER_ERROR
