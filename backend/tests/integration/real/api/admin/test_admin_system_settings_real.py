"""Admin gmap 引擎配置 API real 集成测试。

真实资源依赖：MySQL 的 admins / system_data 表。测试保存并在 teardown 精确恢复
固定 gmap_engine 行的原值与时间戳；按默认串行执行，并发运行可能互相覆盖。

覆盖矩阵：
Endpoint                                    Happy Permission Missing Type Min/Max Overflow XSS SQLi Unicode Side Effect
POST /api/admin/system-settings/gmap-engine Y     Y          Y       Y    Y       Y        Y   Y    Y       Y

Min/Max 覆盖三个字符串字段的 1/声明上限及 concurrency=1；concurrency 未声明 max，故无合法 max/overflow。
"""

from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue, SystemDataModel


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_ENDPOINT = "/api/admin/system-settings/gmap-engine"


@dataclass(frozen=True, slots=True)
class _StoredGmapEngineRow:
    """记录测试前固定配置行的完整状态。"""

    exists: bool
    data_value: JsonValue | None = None
    created_at: int | None = None
    updated_at: int | None = None


async def _read_stored_row() -> _StoredGmapEngineRow:
    """绕过进程缓存读取固定配置行，供副作用与恢复断言使用。"""
    async with AsyncSession(get_engine()) as session:
        row = await session.scalar(
            select(SystemDataModel).where(
                SystemDataModel.data_key == GMAP_ENGINE_DATA_KEY
            )
        )
    if row is None:
        return _StoredGmapEngineRow(exists=False)
    return _StoredGmapEngineRow(
        exists=True,
        data_value=deepcopy(row.data_value),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


async def _assert_stored_value(expected: dict[str, object]) -> None:
    """断言真实 system_data 行已保存期望 JSON。"""
    row = await _read_stored_row()
    assert row.exists
    assert row.data_value == expected


def _payload(test_run_id: str) -> dict[str, object]:
    """生成带本轮标识的合法配置。"""
    return {
        "provider": "http",
        "webshare": {
            "endpoint": f"https://proxy.example/{test_run_id}",
            "username": f"user-{test_run_id}",
            "password": f"password-{test_run_id}",
        },
        "concurrency": 32,
    }


async def test_real_save_gmap_engine_requires_admin(
    real_async_client,
    real_admin_system_settings_cleanup,
    test_run_id: str,
) -> None:
    """未登录保存配置返回 401，且不改数据库。"""
    before = await _read_stored_row()

    response = await real_async_client.post(_ENDPOINT, json=_payload(test_run_id))

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS
    assert await _read_stored_row() == before


async def test_real_save_gmap_engine_persists_and_reads_literal_payloads(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
) -> None:
    """正常保存后 API 与数据库均返回原样的 XSS、SQLi 和 Unicode 控制字符。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "provider": "gosom",
        "webshare": {
            "endpoint": f"https://proxy.example/<script>{test_run_id}</script>",
            "username": f"' OR 1=1 -- {test_run_id}",
            "password": f"unicode-\u202e-{test_run_id}",
        },
        "concurrency": 7,
    }

    save_response = await real_async_client.post(
        _ENDPOINT, json=payload, headers=headers
    )
    assert save_response.status_code == 200
    assert save_response.json()["code"] == CommonCode.SUCCESS
    assert save_response.json()["data"] == payload

    get_response = await real_async_client.get(_ENDPOINT, headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["code"] == CommonCode.SUCCESS
    assert get_response.json()["data"] == payload
    await _assert_stored_value(payload)


@pytest.mark.parametrize("field", ["endpoint", "username", "password"])
async def test_real_save_gmap_engine_accepts_string_minimums(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
    field: str,
) -> None:
    """三个必填字符串字段均接受一字符最小值。"""
    payload = _payload(test_run_id)
    webshare = payload["webshare"]
    assert isinstance(webshare, dict)
    webshare[field] = "x"
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}

    response = await real_async_client.post(_ENDPOINT, json=payload, headers=headers)

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == payload
    await _assert_stored_value(payload)


async def test_real_save_gmap_engine_accepts_declared_maximums(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
) -> None:
    """字符串上限与 concurrency 最小值可保存。"""
    payload = {
        "provider": "http",
        "webshare": {
            "endpoint": test_run_id.ljust(500, "e"),
            "username": test_run_id.ljust(200, "u"),
            "password": test_run_id.ljust(200, "p"),
        },
        "concurrency": 1,
    }
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}

    response = await real_async_client.post(_ENDPOINT, json=payload, headers=headers)

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    assert response.json()["data"] == payload
    await _assert_stored_value(payload)


@pytest.mark.parametrize("case", ["missing", "type", "overflow"])
async def test_real_save_gmap_engine_rejects_invalid_payload_without_side_effect(
    real_async_client,
    real_admin_token_for_system_settings: str,
    test_run_id: str,
    case: str,
) -> None:
    """缺必填字段、错误类型及超长字段返回校验错误且不写库。"""
    payload = _payload(test_run_id)
    if case == "missing":
        del payload["webshare"]
    elif case == "type":
        payload["concurrency"] = {"test_run_id": test_run_id}
    else:
        webshare = payload["webshare"]
        assert isinstance(webshare, dict)
        webshare["endpoint"] = test_run_id.ljust(501, "x")
    before = await _read_stored_row()
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}

    response = await real_async_client.post(_ENDPOINT, json=payload, headers=headers)

    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR
    assert await _read_stored_row() == before
