"""匿名插件版本检查，每次请求直接读取最新发布状态。"""

from typing import Annotated

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from app.schemas.plugin_version_schema import PluginVersionCheckQuery
from app.services.plugin_version_service import plugin_version_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/plugin-versions", tags=["plugin-versions"])


@router.get("/check")
async def check_plugin_version(
    query: Annotated[PluginVersionCheckQuery, Query()],
) -> JSONResponse:
    result = await plugin_version_service.check(query.plugin, query.version)
    response = ResponseUtils.ok(result.model_dump(mode="json"))
    response.headers["Cache-Control"] = "no-store"
    return response
