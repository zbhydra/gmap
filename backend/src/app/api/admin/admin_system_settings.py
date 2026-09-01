"""管理后台系统设置 API。"""

from dataclasses import asdict

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.constants.gosom import GOSOM_API_DATA_KEY
from app.schemas.admin_schema import GosomApiConfigRequest
from app.services.admin_api_key_service import admin_api_key_service
from app.services.admin_system_settings_service import admin_system_settings_service
from app.services.system_data_service import system_data_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/system-settings", tags=["admin-system-settings"])


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


@router.get("/gosom-api")
async def get_gosom_api_config(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """查询 gosom 引擎 API 配置；未配置时两个字段返回空字符串。"""
    value = await system_data_service.get(GOSOM_API_DATA_KEY)
    config = value if isinstance(value, dict) else {}
    return ResponseUtils.ok(
        {
            "base_url": str(config.get("base_url") or ""),
            "api_key": str(config.get("api_key") or ""),
        }
    )


@router.post("/gosom-api")
async def save_gosom_api_config(
    req: GosomApiConfigRequest,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """保存 gosom 引擎 API 配置到 system_data；key 按运维决策明文存储，不加密。"""
    # schema 已剥首尾空白，这里只剥末尾斜杠，保证消费方拼路径不出现双斜杠。
    base_url = req.base_url.rstrip("/")
    api_key = req.api_key
    await system_data_service.set(
        GOSOM_API_DATA_KEY,
        {"base_url": base_url, "api_key": api_key},
    )
    return ResponseUtils.ok({"base_url": base_url, "api_key": api_key})
