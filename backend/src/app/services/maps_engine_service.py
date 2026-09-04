"""gmap 引擎配置读写服务。

后台系统设置维护 gmap 采集引擎配置(引擎选择 / 代理 URL 列表 / 并发预算),
单对象存 system_data 单行,抓取调用方按此读取。
"""

from __future__ import annotations

from app.constants.gmap import (
    GMAP_ENGINE_DATA_KEY,
    GMAP_ENGINE_DEFAULT_CONCURRENCY,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import GmapEngineConfig, GmapEngineConfigRequest
from app.services.system_data_service import system_data_service
from pydantic import ValidationError


class MapsEngineService:
    """gmap 引擎配置读写。"""

    async def get_config(self) -> GmapEngineConfig:
        """读取 gmap 引擎配置；未配置时返回默认视图，读取不做必填校验。"""
        value = await system_data_service.get(GMAP_ENGINE_DATA_KEY)
        if isinstance(value, dict):
            return self._parse_stored_config(value)
        return GmapEngineConfig(
            provider="http",
            proxies=[],
            concurrency=GMAP_ENGINE_DEFAULT_CONCURRENCY,
        )

    @staticmethod
    def _parse_stored_config(value: object) -> GmapEngineConfig:
        """隔离持久化脏值，避免 Pydantic 错误把代理凭据带入通用日志。"""
        try:
            return GmapEngineConfig.model_validate(value)
        except ValidationError:
            raise AppCommonException(
                CommonCode.INTERNAL_SERVER_ERROR,
                ext_msg="maps_engine_service.get_config: stored gmap_engine is invalid",
            ) from None

    async def save_config(self, config: GmapEngineConfigRequest) -> GmapEngineConfig:
        """整对象覆盖保存 gmap 引擎配置。"""
        value = GmapEngineConfig.model_validate(config.model_dump())
        await system_data_service.set(GMAP_ENGINE_DATA_KEY, value.model_dump())
        return value


maps_engine_service = MapsEngineService()
