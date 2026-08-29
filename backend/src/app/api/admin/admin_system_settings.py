"""管理后台系统设置 API。"""

from dataclasses import asdict
from typing import cast
from urllib.parse import urlencode

from fastapi import APIRouter, Body, Depends, Request
from fastapi.responses import (
    JSONResponse,
    PlainTextResponse,
    RedirectResponse,
    Response,
)
from pydantic import BaseModel, Field
from starlette import status

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.admin_api_key_service import admin_api_key_service
from app.services.admin_system_settings_service import admin_system_settings_service
from app.services.system_data_service import JsonObject, system_data_service
from app.utils.logger import logger
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/system-settings", tags=["admin-system-settings"])

#: Telegram DOM 在 system_data 中的固定键。
TELEGRAM_DOM_DATA_KEY = "telegram_dom"

#: Telegram 统一配置在 system_data 中的固定键。
TELEGRAM_CONFIG_DATA_KEY = "telegram_config"


class GoogleDataConfigUpdateRequest(BaseModel):
    """后台保存 Google 数据采集配置请求。"""

    client_id: str = ""
    client_secret: str = ""
    gsc_site_url: str = ""
    ga4_property_id: str = ""


class GoogleDataAuthorizationUrlRequest(BaseModel):
    """后台创建 Google 数据采集授权 URL 请求。"""

    admin_return_base_url: str = Field(min_length=1)


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


@router.get("/telegram-dom")
async def get_telegram_dom_config(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """读取 Telegram DOM 稀疏覆盖；未配置时返回空对象。"""
    row = await system_data_service.system_data_info(TELEGRAM_DOM_DATA_KEY)
    config = {} if row is None else cast(JsonObject, row.data_value)
    return ResponseUtils.ok(config)


@router.post("/telegram-dom")
async def save_telegram_dom_config(
    payload: dict[str, object],
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """原样覆盖保存 Telegram DOM 稀疏对象。"""
    await system_data_service.set(TELEGRAM_DOM_DATA_KEY, cast(JsonObject, payload))
    return ResponseUtils.ok(payload)


@router.get("/telegram-config")
async def get_telegram_config(
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """读取 Telegram 稀疏配置；未配置时返回空对象。"""
    row = await system_data_service.system_data_info(TELEGRAM_CONFIG_DATA_KEY)
    config = {} if row is None else cast(JsonObject, row.data_value)
    return ResponseUtils.ok(config)


@router.post("/telegram-config")
async def save_telegram_config(
    payload: object | None = Body(default=None),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """校验顶层 JSON 对象并原样覆盖保存 Telegram 稀疏配置。"""
    if not isinstance(payload, dict):
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "save_telegram_config: request body must be a JSON object: "
                f"actual_type={type(payload).__name__}"
            ),
        )

    config = cast(JsonObject, payload)
    await system_data_service.set(TELEGRAM_CONFIG_DATA_KEY, config)
    return ResponseUtils.ok(config)

