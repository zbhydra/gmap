"""Admin API real 集成测试专用 fixture。"""

from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
import uuid

import pytest
from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_engine
from app.models.admin_model import AdminModel
from app.services.admin_service import admin_service
from app.utils.crypto import hash_password


_TEST_ADMIN_PASSWORD = "AdminSystemSettingsRealTest123!"


@dataclass(slots=True)
class _CleanupState:
    """记录 real 测试创建的管理员。"""

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
async def real_gmap_engine_schema_ready(real_mysql_ready) -> None:
    """检查 gmap 引擎设置 real 测试需要的表。"""
    missing = [
        table for table in ("admins", "system_data") if not await _table_exists(table)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_admin_system_settings_cleanup(
    real_gmap_engine_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """测试结束后只清理本轮创建的管理员，不写配置表。"""
    state = _CleanupState()
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
            await session.commit()


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
