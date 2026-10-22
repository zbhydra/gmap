"""REST 与 MCP 共用同步采集及月度计量，不创建 Online 任务。"""

import asyncio
from dataclasses import asdict
from uuid import uuid4

from app.api.user_dependencies import UserContext
from app.constants.maps_enrich import ENRICH_BATCH_BUDGET_SECONDS
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.provider.gmap.collector_client import (
    GmapCollectorError,
    gmap_collector_client,
)
from app.provider.gmap.enrich import enrich_places
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.usage_service import api_usage_service, usage_identity


async def _check_quota(user: UserContext) -> None:
    usage = await api_usage_service.get_usage(
        usage_identity(user.user_id, None),
        user_id=user.user_id,
    )
    if usage.exhausted:
        raise AppCommonException(
            CommonCode.MAPS_API_QUOTA_EXHAUSTED,
            ext_msg=f"maps_api: 月请求额度已耗尽 user_id={user.user_id}",
        )


async def _consume(user: UserContext, request_id: str) -> None:
    # 并行请求允许越过剩余额度；只计成功受理，不预占或补偿。
    await api_usage_service.consume(
        usage_identity(user.user_id, None),
        user_id=user.user_id,
        records=1,
        request_id=request_id,
    )


async def search(request: MapsSearchRequest, user: UserContext) -> dict[str, object]:
    await _check_quota(user)
    request_id = uuid4().hex
    config = await gmap_collector_config_service.get_config()
    deadline = asyncio.get_running_loop().time() + 3600
    viewport = request.ll
    try:
        response = await gmap_collector_client.search_item(
            config,
            job_no=request_id,
            item_index=0,
            deadline=deadline,
            mode="export",
            keyword=request.q,
            max_results=request.page * 20,
            google_hl=request.hl,
            region=None,
            viewport=(
                {"lat": viewport.lat, "lng": viewport.lng, "zoom": viewport.zoom}
                if viewport
                else None
            ),
            proxies=config.proxies[:3],
        )
        if response.status == "failed":
            raise GmapCollectorError("search_failed")
    except GmapCollectorError as exc:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=f"maps_api.search: request={request_id} reason={exc}",
        ) from None
    result = response.result
    if request.extra:
        result = await enrich_places(
            result,
            config=config,
            job_no=request_id,
            item_index=0,
            deadline=min(
                deadline,
                asyncio.get_running_loop().time() + ENRICH_BATCH_BUDGET_SECONDS,
            ),
        )
    places = [asdict(entry) for entry in result.entries]
    await _consume(user, request_id)
    return {"places": places, "partial": result.partial, "warnings": result.warnings}


async def reviews(request: MapsReviewsRequest, user: UserContext) -> dict[str, object]:
    await _check_quota(user)
    request_id = uuid4().hex
    config = await gmap_collector_config_service.get_config()
    try:
        result = await gmap_collector_client.list_reviews(
            config,
            request_id=request_id,
            fid=request.fid,
            sort_by=request.sort_by,
            cursor=request.cursor,
            hl=request.hl,
        )
    except GmapCollectorError as exc:
        raise AppCommonException(
            CommonCode.MAPS_API_MEDIA_UNAVAILABLE,
            ext_msg=f"maps_api.reviews: request={request_id} reason={exc}",
        ) from None
    await _consume(user, request_id)
    return asdict(result)


async def photos(request: MapsPhotosRequest, user: UserContext) -> dict[str, object]:
    await _check_quota(user)
    request_id = uuid4().hex
    config = await gmap_collector_config_service.get_config()
    try:
        result = await gmap_collector_client.list_photos(
            config,
            request_id=request_id,
            fid=request.fid,
            max_results=request.max_results,
        )
    except GmapCollectorError as exc:
        raise AppCommonException(
            CommonCode.MAPS_API_MEDIA_UNAVAILABLE,
            ext_msg=f"maps_api.photos: request={request_id} reason={exc}",
        ) from None
    await _consume(user, request_id)
    return asdict(result)
