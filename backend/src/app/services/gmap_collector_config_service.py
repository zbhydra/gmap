"""system_data.gmap_collector 的唯一配置 owner。"""

import asyncio
import time
from urllib.parse import urlsplit

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException, Timeout
from pydantic import ValidationError

from app.constants.gmap_collector import GMAP_COLLECTOR_DATA_KEY
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import GmapProxyCheckResult
from app.schemas.gmap_collector_schema import GmapCollectorConfig
from app.services.system_data_service import system_data_service


class GmapCollectorConfigService:
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

    async def get_config(self) -> GmapCollectorConfig:
        # 原地址查询必须立即看到其他进程保存的节点移除或 Key 轮换。
        row = await system_data_service.system_data_info(GMAP_COLLECTOR_DATA_KEY)
        if row is None:
            return GmapCollectorConfig()
        try:
            return GmapCollectorConfig.model_validate(row.data_value)
        except ValidationError:
            raise AppCommonException(
                CommonCode.INTERNAL_SERVER_ERROR,
                ext_msg="gmap_collector_config_service.get_config: stored gmap_collector is invalid",
            ) from None

    async def save_config(self, config: GmapCollectorConfig) -> GmapCollectorConfig:
        await system_data_service.set(GMAP_COLLECTOR_DATA_KEY, config.model_dump())
        return config


gmap_collector_config_service = GmapCollectorConfigService()
