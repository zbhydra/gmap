"""插件版本管理与匿名检查流程；依赖独占测试库的真实 MySQL、admins/plugin_versions。"""

import os
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

import pytest
from httpx import AsyncClient, Response
from sqlalchemy import delete, func, select, text

from app.core.config import settings
from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.admin_model import AdminModel
from app.models.plugin_version_model import PluginVersionModel
from app.services.admin_service import admin_service
from app.utils.crypto import hash_password
from app.utils.jwt import JwtData, JwtUnit

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass
class _CleanupState:
    admin_ids: list[int] = field(default_factory=list)
    version_ids: list[int] = field(default_factory=list)


@pytest.fixture
async def real_plugin_version_cleanup(
    real_mysql_ready: None,
) -> AsyncIterator[_CleanupState]:
    database = os.environ.get("PLUGIN_VERSION_TEST_DATABASE", "")
    if (
        not database.startswith("gmap_plugin_versions_test_")
        or settings.database.database != database
    ):
        pytest.skip("REAL_SCHEMA_UNAVAILABLE: 插件版本验收必须显式连接本任务独占测试库")
    async with get_async_session() as db:
        tables = set((await db.execute(text("SHOW TABLES"))).scalars().all())
        if not {"admins", "plugin_versions"}.issubset(tables):
            pytest.skip("REAL_SCHEMA_UNAVAILABLE: 缺少 admins 或 plugin_versions 表")

    state = _CleanupState()
    try:
        yield state
    finally:
        async with get_async_session() as db:
            if state.version_ids:
                await db.execute(
                    delete(PluginVersionModel).where(
                        PluginVersionModel.id.in_(state.version_ids)
                    )
                )
            if state.admin_ids:
                await db.execute(
                    delete(AdminModel).where(AdminModel.admin_id.in_(state.admin_ids))
                )
            await db.commit()


def _data(response: Response, code: CommonCode = CommonCode.SUCCESS) -> dict:
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == code, body
    return body["data"]


async def _stored(id: int) -> PluginVersionModel:
    async with get_async_session() as db:
        row = await db.get(PluginVersionModel, id)
        assert row is not None
        return row


async def _create(
    client: AsyncClient,
    headers: dict[str, str],
    state: _CleanupState,
    plugin: str,
    version: str,
    url: str,
) -> dict:
    row = _data(
        await client.post(
            "/api/admin/plugin-versions",
            headers=headers,
            json={"plugin": plugin, "version": f" {version} ", "update_url": url},
        )
    )
    state.version_ids.append(row["id"])
    stored = await _stored(row["id"])
    assert (stored.plugin, stored.version, stored.update_url, stored.is_enabled) == (
        plugin,
        version,
        url,
        True,
    )
    assert row["version"] == version
    return row


async def _check(
    client: AsyncClient, plugin: str, version: str, status: str, target: dict | None
) -> None:
    response = await client.get(
        "/api/client/plugin-versions/check",
        params={"plugin": plugin, "version": version},
    )
    assert response.headers["cache-control"] == "no-store"
    assert _data(response) == {"status": status, "update": target}


async def _save(
    client: AsyncClient, headers: dict[str, str], id: int, fields: dict
) -> dict:
    row = _data(
        await client.post(
            f"/api/admin/plugin-versions/{id}", headers=headers, json=fields
        )
    )
    stored = await _stored(id)
    assert stored.is_enabled == row["is_enabled"]
    assert stored.update_url == row["update_url"]
    return row


async def test_real_admin_versions_and_anonymous_check_follow_release_decisions(
    real_async_client: AsyncClient,
    real_plugin_version_cleanup: _CleanupState,
    test_run_id: str,
) -> None:
    client = real_async_client
    state = real_plugin_version_cleanup
    async with get_async_session() as db:
        admin = AdminModel(  # type: ignore[call-arg]
            username=f"pytest-plugin-versions-{test_run_id}",
            password_hash=hash_password("PluginVersionsReal123!"),
            is_active=True,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        state.admin_ids.append(admin.admin_id)
        existing_versions = (await db.scalars(select(PluginVersionModel.version))).all()
    major = (
        max([int(test_run_id, 16), *(int(v.split(".")[0]) for v in existing_versions)])
        + 1
    )
    high, low = f"{major}.10.0", f"{major}.9.0"
    older, newer = f"{major}.8.0", f"{major}.11.0"
    url = f"https://example.com/{test_run_id}/maps/"
    payload = {"plugin": "maps", "version": high, "update_url": url}
    admin_token, *_ = admin_service.create_token_pair(admin)
    headers = {"Authorization": f"Bearer {admin_token}"}
    user_token, _ = JwtUnit.create_access_token(
        JwtData(user_id=admin.admin_id, email=f"pytest-{test_run_id}@example.com")
    )

    for authorization, expected in (
        ({}, CommonCode.AUTH_MISSING_CREDENTIALS),
        ({"Authorization": f"Bearer {user_token}"}, CommonCode.AUTH_TOKEN_TYPE_ERROR),
    ):
        for method, path, body in (
            ("GET", "/api/admin/plugin-versions", None),
            ("POST", "/api/admin/plugin-versions", payload),
            ("POST", "/api/admin/plugin-versions/1", {"is_enabled": False}),
        ):
            response = await real_async_client.request(
                method, path, headers=authorization, json=body
            )
            assert response.status_code == 401
            assert response.json()["code"] == expected

    for invalid in (f"{major}.09.0", f"{major}.1.0.0"):
        _data(
            await real_async_client.post(
                "/api/admin/plugin-versions",
                headers=headers,
                json={**payload, "version": invalid},
            ),
            CommonCode.VALIDATION_ERROR,
        )

    maps_high = await _create(client, headers, state, "maps", high, url)
    maps_low = await _create(client, headers, state, "maps", low, url)
    bing_low = await _create(client, headers, state, "bing", low, url)
    assert maps_high["is_recommended"] and bing_low["is_recommended"]
    assert not maps_low["is_recommended"]
    _data(
        await real_async_client.post(
            "/api/admin/plugin-versions", headers=headers, json=payload
        ),
        CommonCode.INVALID_REQUEST,
    )
    async with get_async_session() as db:
        assert (
            await db.scalar(
                select(func.count())
                .select_from(PluginVersionModel)
                .where(
                    PluginVersionModel.plugin == "maps",
                    PluginVersionModel.version == high,
                )
            )
            == 1
        )

    page = _data(
        await real_async_client.get(
            "/api/admin/plugin-versions",
            headers=headers,
            params={"plugin": "maps", "page": 1, "page_size": 1},
        )
    )
    assert page["page"] == 1 and page["page_size"] == 1
    assert page["rows"][0]["id"] == maps_low["id"]
    assert page["rows"][0]["plugin"] == "maps" and not page["rows"][0]["is_recommended"]
    page_two = _data(
        await real_async_client.get(
            "/api/admin/plugin-versions",
            headers=headers,
            params={"plugin": "maps", "page": 2, "page_size": 1},
        )
    )
    assert page_two["total"] == page["total"]
    assert page_two["rows"][0]["id"] == maps_high["id"]
    assert page_two["rows"][0]["is_recommended"]

    target = {"version": high, "url": url}
    await _check(client, "maps", low, "update_available", target)
    await _check(client, "maps", older, "update_available", target)
    await _check(client, "maps", newer, "current", None)
    await _check(client, "maps", high, "current", None)
    await _check(client, "bing", low, "current", None)

    new_url = f"https://example.com/{test_run_id}/maps-updated/"
    changed = await _save(
        client,
        headers,
        maps_high["id"],
        {
            "update_url": new_url,
            "plugin": "bing",
            "version": low,
        },
    )
    assert (changed["plugin"], changed["version"]) == ("maps", high)
    assert changed["is_recommended"]
    target = {"version": high, "url": new_url}
    await _check(client, "maps", low, "update_available", target)
    await _save(client, headers, maps_low["id"], {"is_enabled": False})
    await _check(client, "maps", low, "disabled", target)
    await _check(client, "bing", low, "current", None)
    await _save(client, headers, maps_high["id"], {"is_enabled": False})
    await _check(client, "maps", high, "disabled", None)
    await _check(client, "maps", older, "current", None)
    assert (await _save(client, headers, maps_low["id"], {"is_enabled": True}))[
        "is_recommended"
    ]
    await _check(client, "maps", high, "disabled", None)
    await _check(client, "maps", low, "current", None)
    assert (await _save(client, headers, maps_high["id"], {"is_enabled": True}))[
        "is_recommended"
    ]
    await _check(client, "maps", low, "update_available", target)
