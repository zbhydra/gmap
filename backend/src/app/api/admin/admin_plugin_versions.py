"""管理员插件版本列表与发布记录写入接口。"""

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.constants.plugin_version import Plugin
from app.models.plugin_version_model import PluginVersionModel
from app.schemas.plugin_version_schema import PluginVersionCreate, PluginVersionUpdate
from app.services.plugin_version_service import plugin_version_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/plugin-versions", tags=["admin-plugin-versions"])


def _serialize_record(
    record: PluginVersionModel, recommended: dict[str, PluginVersionModel]
) -> dict[str, object]:
    target = recommended.get(record.plugin)
    return {
        **record.to_dict(),
        "is_recommended": target is not None and target.id == record.id,
    }


@router.get("")
async def list_plugin_versions(
    plugin: Plugin | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    plugins = [plugin] if plugin is not None else None
    rows = await plugin_version_service.plugin_version_lists(
        plugins=plugins, offset=(page - 1) * page_size, limit=page_size
    )
    total = await plugin_version_service.count_plugin_versions(plugins=plugins)
    recommended = await plugin_version_service.recommended_versions(plugins=plugins)
    return ResponseUtils.ok(
        {
            "rows": [_serialize_record(row, recommended) for row in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.post("")
async def create_plugin_version(
    request: PluginVersionCreate,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    record = await plugin_version_service.plugin_version_create(
        plugin=request.plugin,
        version=request.version,
        is_enabled=request.is_enabled,
        update_url=str(request.update_url),
    )
    recommended = await plugin_version_service.recommended_versions(
        plugins=[request.plugin]
    )
    return ResponseUtils.ok(_serialize_record(record, recommended))


@router.post("/{id}")
async def update_plugin_version(
    id: Annotated[int, Path(ge=1)],
    request: PluginVersionUpdate,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    record = await plugin_version_service.plugin_version_update(
        id, request.model_dump(mode="json", exclude_none=True)
    )
    recommended = await plugin_version_service.recommended_versions(
        plugins=[Plugin(record.plugin)]
    )
    return ResponseUtils.ok(_serialize_record(record, recommended))
