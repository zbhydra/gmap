"""Maps 插件 HubSpot 同步服务（013 A10，U9）。

纯代理转发：插件传用户授权的 HubSpot access token 与商家数组，本服务分批调
HubSpot companies batch create API（竞品云函数 `hubspot_create_companies`
同构）。token 不落库、不缓存；后端不存商家数据。

批次与容量：HubSpot batch create 上限 100 条/请求，按 100 分批循环；
businesses 总量上限 500 由 API 层 pydantic 校验（与插件批量任务上限一致）。
"""

import httpx

from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.maps_hubspot_schema import MapsHubspotBusiness
from app.utils.logger import logger

HUBSPOT_COMPANIES_BATCH_CREATE_URL = (
    "https://api.hubapi.com/crm/v3/objects/companies/batch/create"
)
HUBSPOT_BATCH_SIZE = 100
HUBSPOT_HTTP_TIMEOUT_SECONDS = 30.0


class MapsHubspotService:
    """HubSpot 商家同步代理（无表结构，独立类 + 模块级实例）。"""

    async def sync_companies(
        self, token: str, businesses: list[MapsHubspotBusiness]
    ) -> dict[str, int]:
        """分批创建 companies，返回同步条数。

        Args:
            token: 用户 HubSpot OAuth access token。
            businesses: 商家数组（已由 API 层完成容量校验）。

        Raises:
            AppCommonException: HubSpot 拒绝（401/403/4xx）或网络不可达，
                统一映射 MAPS_HUBSPOT_SYNC_FAILED，ext_msg 携带上游状态。
        """
        inputs = [self._to_hubspot_input(business) for business in businesses]
        synced = 0
        async with httpx.AsyncClient(timeout=HUBSPOT_HTTP_TIMEOUT_SECONDS) as client:
            for start in range(0, len(inputs), HUBSPOT_BATCH_SIZE):
                batch = inputs[start : start + HUBSPOT_BATCH_SIZE]
                await self._create_batch(client, token, batch)
                synced += len(batch)
        return {"synced": synced}

    async def _create_batch(
        self,
        client: httpx.AsyncClient,
        token: str,
        batch: list[dict[str, dict[str, str]]],
    ) -> None:
        """调 HubSpot batch create；失败统一抛业务异常（ext_msg 三要素）。"""
        try:
            response = await client.post(
                HUBSPOT_COMPANIES_BATCH_CREATE_URL,
                headers={"Authorization": f"Bearer {token}"},
                json={"inputs": batch},
            )
        except httpx.HTTPError as exc:
            raise AppCommonException(
                CommonCode.MAPS_HUBSPOT_SYNC_FAILED,
                ext_msg=(
                    "maps_hubspot_service._create_batch: HubSpot request failed "
                    f"(network error): batch_size={len(batch)}, error={exc!r}"
                ),
            ) from exc

        if response.status_code in (401, 403):
            raise AppCommonException(
                CommonCode.MAPS_HUBSPOT_SYNC_FAILED,
                ext_msg=(
                    "maps_hubspot_service._create_batch: HubSpot rejected token "
                    f"status={response.status_code}, batch_size={len(batch)}"
                ),
            )
        if response.is_error:
            raise AppCommonException(
                CommonCode.MAPS_HUBSPOT_SYNC_FAILED,
                ext_msg=(
                    "maps_hubspot_service._create_batch: HubSpot batch create failed "
                    f"status={response.status_code}, "
                    f"body={response.text[:200]}, batch_size={len(batch)}"
                ),
            )
        logger.info(
            "maps_hubspot_service._create_batch: batch synced "
            f"batch_size={len(batch)}, status={response.status_code}"
        )

    def _to_hubspot_input(
        self, business: MapsHubspotBusiness
    ) -> dict[str, dict[str, str]]:
        """映射为 HubSpot company 载荷；空串属性剔除（HubSpot 拒绝空属性写入）。"""
        properties = {
            "name": business.name,
            "domain": business.domain,
            "phone": business.phone,
            "address": business.address,
            "city": business.city,
        }
        return {
            "properties": {key: value for key, value in properties.items() if value}
        }


maps_hubspot_service = MapsHubspotService()
