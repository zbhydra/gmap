"""插件发布记录管理与即时版本检查。"""

from collections.abc import Sequence
from typing import TypeVar

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql import Select

from app.constants.plugin_version import Plugin, PluginVersionStatus
from app.core.database import get_async_session
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.plugin_version_model import PluginVersionModel
from app.schemas.plugin_version_schema import (
    PluginVersionCheckResult,
    PluginVersionUpdateTarget,
)
from app.utils.time import timestamp_now

_Row = TypeVar("_Row")


class PluginVersionService:
    def _apply_filters(
        self,
        stmt: Select[tuple[_Row]],
        *,
        ids: Sequence[int] | None = None,
        plugins: Sequence[Plugin] | None = None,
        is_enabled: bool | None = None,
    ) -> Select[tuple[_Row]]:
        if ids is not None:
            stmt = stmt.where(PluginVersionModel.id.in_(ids))
        if plugins is not None:
            stmt = stmt.where(PluginVersionModel.plugin.in_(plugins))
        if is_enabled is not None:
            stmt = stmt.where(PluginVersionModel.is_enabled == is_enabled)
        return stmt

    async def plugin_version_lists(
        self,
        *,
        ids: Sequence[int] | None = None,
        plugins: Sequence[Plugin] | None = None,
        is_enabled: bool | None = None,
        offset: int = 0,
        limit: int | None = 50,
    ) -> list[PluginVersionModel]:
        stmt = self._apply_filters(
            select(PluginVersionModel),
            ids=ids,
            plugins=plugins,
            is_enabled=is_enabled,
        )
        async with get_async_session() as db:
            result = await db.scalars(
                stmt.order_by(PluginVersionModel.id.desc()).offset(offset).limit(limit)
            )
            return list(result.all())

    async def count_plugin_versions(
        self, *, plugins: Sequence[Plugin] | None = None
    ) -> int:
        stmt = self._apply_filters(
            select(func.count()).select_from(PluginVersionModel), plugins=plugins
        )
        async with get_async_session() as db:
            return int(await db.scalar(stmt) or 0)

    async def plugin_version_info(self, id: int) -> PluginVersionModel | None:
        rows = await self.plugin_version_lists(ids=[id], limit=1)
        return rows[0] if rows else None

    async def plugin_version_create(
        self,
        *,
        plugin: Plugin,
        version: str,
        is_enabled: bool,
        update_url: str,
    ) -> PluginVersionModel:
        record = PluginVersionModel(  # type: ignore[call-arg]
            plugin=plugin.value,
            version=version,
            is_enabled=is_enabled,
            update_url=update_url,
        )
        try:
            async with get_async_session() as db:
                db.add(record)
                await db.commit()
                await db.refresh(record)
        except IntegrityError as exc:
            if exc.orig is None or exc.orig.args[0] != 1062:
                raise
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "plugin_version_create: 插件版本已存在: "
                    f"plugin={plugin.value}, version={version}"
                ),
            ) from exc
        return record

    async def plugin_version_update(
        self, id: int, fields: dict[str, object]
    ) -> PluginVersionModel:
        values = {key: value for key, value in fields.items() if value is not None}
        async with get_async_session() as db:
            result = await db.execute(
                update(PluginVersionModel)
                .where(PluginVersionModel.id == id)
                .values(**values, updated_at=timestamp_now())
            )
            if getattr(result, "rowcount") == 0:
                raise AppCommonException(
                    CommonCode.NOT_FOUND,
                    ext_msg=f"plugin_version_update: 版本记录不存在: id={id}",
                )
            await db.commit()
        record = await self.plugin_version_info(id)
        assert record is not None
        return record

    @staticmethod
    def _version_parts(version: str) -> tuple[int, ...]:
        return tuple(int(part) for part in version.split("."))

    def _recommended_versions(
        self, rows: Sequence[PluginVersionModel]
    ) -> dict[str, PluginVersionModel]:
        recommended: dict[str, PluginVersionModel] = {}
        for row in rows:
            current = recommended.get(row.plugin)
            if row.is_enabled and (
                current is None
                or self._version_parts(row.version)
                > self._version_parts(current.version)
            ):
                recommended[row.plugin] = row
        return recommended

    async def recommended_versions(
        self, *, plugins: Sequence[Plugin] | None = None
    ) -> dict[str, PluginVersionModel]:
        rows = await self.plugin_version_lists(
            plugins=plugins, is_enabled=True, limit=None
        )
        return self._recommended_versions(rows)

    async def check(self, plugin: Plugin, version: str) -> PluginVersionCheckResult:
        rows = await self.plugin_version_lists(plugins=[plugin], limit=None)
        local = next((row for row in rows if row.version == version), None)
        recommended = self._recommended_versions(rows).get(plugin.value)
        target = None
        if recommended is not None and self._version_parts(
            recommended.version
        ) > self._version_parts(version):
            target = PluginVersionUpdateTarget(
                version=recommended.version, url=recommended.update_url
            )
        return PluginVersionCheckResult(
            status=(
                PluginVersionStatus.DISABLED
                if local is not None and not local.is_enabled
                else (
                    PluginVersionStatus.UPDATE_AVAILABLE
                    if target is not None
                    else PluginVersionStatus.CURRENT
                )
            ),
            update=target,
        )


plugin_version_service = PluginVersionService()
