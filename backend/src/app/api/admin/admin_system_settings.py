"""管理后台系统设置 API。"""

from dataclasses import asdict

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import (
    GmapProxyCheckRequest,
    ObjectStorageConfig,
)
from app.schemas.gmap_collector_schema import GmapCollectorConfig, GmapCollectorInstance
from app.provider.gmap.collector_client import gmap_collector_client
from app.services.admin_api_key_service import admin_api_key_service
from app.services.admin_system_settings_service import admin_system_settings_service
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.object_storage_config_service import object_storage_config_service
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


@router.get("/gmap-collector")
async def get_gmap_collector_config(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    config = await gmap_collector_config_service.get_config()
    response = ResponseUtils.ok(config.model_dump())
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/gmap-collector")
async def save_gmap_collector_config(
    req: GmapCollectorConfig,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    config = await gmap_collector_config_service.save_config(req)
    response = ResponseUtils.ok(config.model_dump())
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/gmap-collector/test")
async def test_gmap_collector_config(
    req: GmapCollectorInstance,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """只检查节点 /stats，不保存输入或测试 Google 取数。"""
    ok, reason = await gmap_collector_client.check_stats(req)
    response = ResponseUtils.ok({"ok": ok, **({"reason": reason} if reason else {})})
    response.headers["Cache-Control"] = "no-store"
    return response


@router.post("/gmap-collector/check-proxies")
async def check_collector_proxies(
    req: GmapProxyCheckRequest,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    results = await gmap_collector_config_service.check_proxies(req.proxies)
    response = ResponseUtils.ok({"items": [item.model_dump() for item in results]})
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/object-storage")
async def get_object_storage_config(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """查询全部对象存储配置；未配置时返回空列表。"""
    config = await object_storage_config_service.get_config()
    return ResponseUtils.ok(config.model_dump())


@router.post("/object-storage")
async def save_object_storage_config(
    req: ObjectStorageConfig,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """整对象保存对象存储配置；访问凭据按运维合同明文存储与回显。"""
    previous = await object_storage_config_service.get_config()
    previous_items = {item.id: item for item in previous.items}
    location_fields = {"provider", "account_id", "endpoint", "bucket"}
    for item in req.items:
        old = previous_items.get(item.id)
        if old is not None and old.model_dump(
            include=location_fields
        ) != item.model_dump(include=location_fields):
            raise AppCommonException(
                CommonCode.VALIDATION_ERROR,
                ext_msg="save_object_storage_config: 已有配置 ID 的存储定位不可变更",
            )
    config = await object_storage_config_service.save_config(req)
    return ResponseUtils.ok(config.model_dump())
