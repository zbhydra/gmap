"""gmap 引擎配置读写服务。

后台系统设置维护 gmap 采集引擎配置(引擎选择 / 代理 URL 列表 / 并发预算),
单对象存 system_data 单行,抓取调用方按此读取。
"""

from __future__ import annotations

import asyncio
import time
from urllib.parse import urlsplit

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException, Timeout

from app.constants.gmap import (
    GMAP_ENGINE_DATA_KEY,
    GMAP_ENGINE_DEFAULT_CONCURRENCY,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import (
    GmapEngineConfig,
    GmapEngineConfigRequest,
    GmapProxyCheckResult,
)
from app.services.system_data_service import system_data_service
from pydantic import ValidationError


class MapsEngineService:
    """gmap 引擎配置读写。"""

    async def check_proxies(self, proxies: list[str]) -> list[GmapProxyCheckResult]:
        """直测 Google 连通性，不修改配置、不重试或切换代理。"""
        return list(
            await asyncio.gather(*(self._check_proxy(proxy) for proxy in proxies))
        )

    async def _check_proxy(self, proxy: str) -> GmapProxyCheckResult:
        started = time.perf_counter()
        parsed = urlsplit(proxy)
        result = GmapProxyCheckResult(
            proxy=f"{parsed.scheme}://{parsed.hostname}:{parsed.port}",
            status="connection_error",
            duration_ms=0,
        )
        try:
            async with AsyncSession(impersonate="chrome", trust_env=False) as session:
                response = await session.get(
                    "https://www.google.com/generate_204",
                    proxy=proxy,
                    timeout=10,
                    allow_redirects=False,
                )
            result.status_code = response.status_code
            result.status = "ok" if response.status_code == 204 else "http_error"
        except (Timeout, asyncio.TimeoutError):
            result.status = "timeout"
        except RequestException:
            # 底层异常可能包含代理凭据，只返回稳定的失败分类。
            result.status = "connection_error"
        result.duration_ms = round((time.perf_counter() - started) * 1000)
        return result

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
