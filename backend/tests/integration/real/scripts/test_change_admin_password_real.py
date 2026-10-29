"""管理员创建与改密流程，依赖真实 MySQL 的 admins 表。"""

import asyncio
import hashlib
import sys
from collections.abc import AsyncIterator
from dataclasses import dataclass
from pathlib import Path

import pytest
from sqlalchemy import delete, text, update

from app.core.database import get_async_session
from app.models.admin_model import AdminModel
from app.services.admin_service import admin_service

_BACKEND_DIR = Path(__file__).resolve().parents[4]


@dataclass
class _CleanupState:
    username: str


@pytest.fixture
async def real_admin_password_cleanup(
    real_mysql_ready: None, test_run_id: str
) -> AsyncIterator[_CleanupState]:
    async with get_async_session() as session:
        result = await session.execute(text("SHOW TABLES LIKE 'admins'"))
        if result.first() is None:
            pytest.skip("REAL_SCHEMA_UNAVAILABLE: 数据库缺少 admins 表")
    state = _CleanupState(username=f"pytest-password-{test_run_id}")
    try:
        yield state
    finally:
        async with get_async_session() as session:
            await session.execute(
                delete(AdminModel).where(AdminModel.username == state.username)
            )
            await session.commit()


@pytest.mark.real
@pytest.mark.asyncio
async def test_real_created_admin_changes_password_through_cli(
    real_admin_password_cleanup: _CleanupState, test_run_id: str
) -> None:
    """真实创建后执行 CLI 改密，只替换密码及更新时间。"""
    username = real_admin_password_cleanup.username
    old_password = " 管理员🔐 "
    new_password = "Password123!"
    admin = await admin_service.create_admin(username, old_password)
    assert admin.password_hash == (
        "6770c665632a6f1911114dcfcdc44aec42f79ba2b4cb09255ba4acc08fc08dcd"
    )
    assert await admin_service.authenticate(username, old_password) is not None
    assert await admin_service.authenticate(username, old_password + "x") is None

    api_key_hash = hashlib.sha256(test_run_id.encode()).hexdigest()
    async with get_async_session() as session:
        await session.execute(
            update(AdminModel)
            .where(AdminModel.admin_id == admin.admin_id)
            .values(
                is_active=False,
                api_key_hash=api_key_hash,
                api_key_prefix=test_run_id,
                api_key_created_at=1,
                updated_at=1,
            )
        )
        await session.commit()

    process = await asyncio.create_subprocess_exec(
        sys.executable,
        str(_BACKEND_DIR / "scripts/change_admin_password.py"),
        "--username",
        username,
        "--password",
        new_password,
        cwd=_BACKEND_DIR,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    assert process.returncode == 0, stderr.decode()
    assert new_password.encode() not in stdout + stderr

    updated = await admin_service.get_by_username(username)
    assert updated is not None
    assert updated.password_hash == (
        "cfcff26e3556223e24d8f0b9e496312fe0dd3d26dab000278ddbd3c1610abc61"
    )
    assert updated.updated_at > 1
    assert updated.created_at == admin.created_at
    assert not updated.is_active
    assert updated.api_key_hash == api_key_hash
    assert updated.api_key_prefix == test_run_id
    assert updated.api_key_created_at == 1
    assert await admin_service.authenticate(username, new_password) is not None
    assert await admin_service.authenticate(username, old_password) is None
