"""管理后台系统设置 API。"""

from dataclasses import asdict

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.services.admin_api_key_service import admin_api_key_service
from app.services.admin_system_settings_service import admin_system_settings_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/system-settings", tags=["admin-system-settings"])


class GoogleDataConfigUpdateRequest(BaseModel):
    """后台保存 Google 数据采集配置请求。"""

    client_id: str = ""
    client_secret: str = ""
    gsc_site_url: str = ""
    ga4_property_id: str = ""


class GoogleDataAuthorizationUrlRequest(BaseModel):
    """后台创建 Google 数据采集授权 URL 请求。"""

    admin_return_base_url: str


@router.get("/api-key")
async def get_api_key_meta(
    admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """查询当前管理员 API Key 元信息。"""
    result = await admin_api_key_service.get_api_key_meta(admin_id=admin.admin_id)
    return ResponseUtils.ok(asdict(result))


@router.post("/api-key")
async def generate_api_key(
    admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """生成或重新生成当前管理员外部 API Key。"""
    result = await admin_api_key_service.generate_api_key(admin_id=admin.admin_id)
    return ResponseUtils.ok(asdict(result))


@router.post("/config-cache/refresh")
async def refresh_config_cache(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """刷新当前业务进程内配置读取缓存。"""
    result = await admin_system_settings_service.refresh_config_caches()
    return ResponseUtils.ok(asdict(result))
