"""Admin gmap 引擎配置 API real 集成测试。

真实资源依赖：MySQL 的 admins / system_data 表。测试结束后精确恢复固定
gmap_engine 行；该配置键不可并发写入。
"""

from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue, SystemDataModel


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_ENDPOINT = "/api/admin/system-settings/gmap-engine"


async def _read_stored_config() -> JsonValue | None:
    """绕过进程缓存读取配置，证明 API 已真实写入数据库。"""
    async with AsyncSession(get_engine()) as session:
        return await session.scalar(
            select(SystemDataModel.data_value).where(
                SystemDataModel.data_key == GMAP_ENGINE_DATA_KEY
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
        _ENDPOINT, json=payload, headers=headers
    )
    assert save_response.status_code == 200
    assert save_response.json()["code"] == CommonCode.SUCCESS
    assert save_response.json()["data"] == payload

    get_response = await real_async_client.get(_ENDPOINT, headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["code"] == CommonCode.SUCCESS
    assert get_response.json()["data"] == payload
    assert await _read_stored_config() == payload
