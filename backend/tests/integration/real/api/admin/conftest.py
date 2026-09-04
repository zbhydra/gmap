"""Admin API real 集成测试专用 fixture。"""

from __future__ import annotations

from collections.abc import AsyncIterator
from copy import deepcopy
from dataclasses import dataclass, field
import uuid

import pytest
from sqlalchemy import delete, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.constants.object_storage import OBJECT_STORAGE_DATA_KEY
from app.core.database import get_engine
from app.models.admin_model import AdminModel
from app.models.system_data_model import JsonValue, SystemDataModel
from app.services.admin_service import admin_service
from app.services.system_data_service import system_data_service
from app.utils.crypto import hash_password


_TEST_ADMIN_PASSWORD = "AdminSystemSettingsRealTest123!"


@dataclass(slots=True)
class _CleanupState:
    """记录系统设置 real 测试需要恢复的数据。"""

    stored_configs: dict[str, tuple[JsonValue, int, int]]
    admin_usernames: list[str] = field(default_factory=list)


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""
    async with get_engine().begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


@pytest.fixture
async def real_system_settings_schema_ready(real_mysql_ready) -> None:
    """检查系统设置 real 测试需要的表。"""
    missing = [
        table for table in ("admins", "system_data") if not await _table_exists(table)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_admin_system_settings_cleanup(
    real_system_settings_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """保存固定配置行，并清理测试管理员后恢复其原始状态。"""
    config_keys = (GMAP_ENGINE_DATA_KEY, OBJECT_STORAGE_DATA_KEY)
    async with AsyncSession(get_engine()) as session:
        rows = list(
            (
                await session.scalars(
                    select(SystemDataModel).where(
                        SystemDataModel.data_key.in_(config_keys)
                    )
                )
            ).all()
        )
    state = _CleanupState(
        stored_configs={
            row.data_key: (deepcopy(row.data_value), row.created_at, row.updated_at)
            for row in rows
        },
    )
    try:
        yield state
    finally:
        async with AsyncSession(get_engine()) as session:
            if state.admin_usernames:
                await session.execute(
                    delete(AdminModel).where(
                        AdminModel.username.in_(state.admin_usernames)
                    )
                )
            for data_key in config_keys:
                stored = state.stored_configs.get(data_key)
                if stored is not None:
                    data_value, created_at, updated_at = stored
                    await session.execute(
                        update(SystemDataModel)
                        .where(SystemDataModel.data_key == data_key)
                        .values(
                            data_value=data_value,
                            created_at=created_at,
                            updated_at=updated_at,
                        )
                    )
                else:
                    await session.execute(
                        delete(SystemDataModel).where(
                            SystemDataModel.data_key == data_key
                        )
                    )
            await session.commit()
        system_data_service.clear_cache()


@pytest.fixture
async def real_admin_token_for_system_settings(
    real_admin_system_settings_cleanup: _CleanupState,
    test_run_id: str,
) -> str:
    """创建真实管理员并返回 access token。"""
    username = f"pytest-admin-settings-{uuid.uuid4().hex[:8]}-{test_run_id}"
    admin = AdminModel(  # type: ignore[call-arg]
        username=username,
        password_hash=hash_password(_TEST_ADMIN_PASSWORD),
        is_active=True,
    )
    real_admin_system_settings_cleanup.admin_usernames.append(username)
    async with AsyncSession(get_engine()) as session:
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

    access_token, _refresh_token, _access_expire, _refresh_expire = (
        admin_service.create_token_pair(admin)
    )
    return access_token
