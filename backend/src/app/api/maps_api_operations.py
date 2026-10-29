"""REST 与 MCP 共用同步采集、调用记录及月度计量，不创建 Online 任务。"""

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import asdict

from app.api.user_dependencies import UserContext
from app.constants.export import ExportRunStatus
from app.constants.export_api import ExportApiOperation, ExportApiSource
from app.constants.maps_enrich import ENRICH_BATCH_BUDGET_SECONDS
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.export_api_job_model import ExportApiJobModel
from app.provider.gmap.collector_client import (
    GmapCollectorError,
    gmap_collector_client,
)
from app.provider.gmap.enrich import enrich_places
from app.schemas.export_api_job_schema import (
    ExportApiPhotosSummary,
    ExportApiReviewsSummary,
    ExportApiSearchSummary,
)
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.services.export_api_job_service import export_api_job_service
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.usage_service import api_usage_service, usage_identity
from app.utils.logger import logger


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


@asynccontextmanager
async def _recorded_call(
    user: UserContext,
    source: ExportApiSource,
    operation: ExportApiOperation,
    request: MapsSearchRequest | MapsReviewsRequest | MapsPhotosRequest,
) -> AsyncIterator[ExportApiJobModel]:
    """准入通过才建处理中记录；体内普通异常记失败后原样抛出，不扣量。

    有效结果由调用方在本范围外结算，结算失败不再改写记录；取消不属于
    Exception，自然传播。
    """
    await _check_quota(user)
    job = await export_api_job_service.create_job(
        user_id=user.user_id, source=source, operation=operation, params=request
    )
    try:
        yield job
    except Exception as exc:
        code = (
            exc.code
            if isinstance(exc, AppCommonException)
            else CommonCode.INTERNAL_SERVER_ERROR
        )
        try:
            await export_api_job_service.fail_job(job, error_code=code.value)
        except Exception:
            # 失败状态写不进只让记录停在处理中；响应仍按原异常返回。
            logger.error(
                "maps_api._recorded_call: 调用记录无法更新为失败，保留原异常 "
                "request_id=%s error_code=%s",
                job.request_id,
                code.value,
                exc_info=True,
            )
        raise


async def search(
    request: MapsSearchRequest, user: UserContext, *, source: ExportApiSource
) -> dict[str, object]:
    async with _recorded_call(user, source, ExportApiOperation.SEARCH, request) as job:
        config = await gmap_collector_config_service.get_config()
        deadline = asyncio.get_running_loop().time() + 3600
        viewport = request.ll
        try:
            response = await gmap_collector_client.search_item(
                config,
                job_no=job.request_id,
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
                ext_msg=f"maps_api.search: request={job.request_id} reason={exc}",
            ) from None
        result = response.result
        if request.extra:
            result = await enrich_places(
                result,
                config=config,
                job_no=job.request_id,
                item_index=0,
                deadline=min(
                    deadline,
                    asyncio.get_running_loop().time() + ENRICH_BATCH_BUDGET_SECONDS,
                ),
            )
        places = [asdict(entry) for entry in result.entries]
    await export_api_job_service.complete_job(
        job,
        status=ExportRunStatus.PARTIAL if result.partial else ExportRunStatus.COMPLETED,
        summary=ExportApiSearchSummary(
            record_count=len(places), warnings=result.warnings
        ),
    )
    return {"places": places, "partial": result.partial, "warnings": result.warnings}


async def reviews(
    request: MapsReviewsRequest, user: UserContext, *, source: ExportApiSource
) -> dict[str, object]:
    async with _recorded_call(user, source, ExportApiOperation.REVIEWS, request) as job:
        config = await gmap_collector_config_service.get_config()
        try:
            result = await gmap_collector_client.list_reviews(
                config,
                request_id=job.request_id,
                fid=request.fid,
                sort_by=request.sort_by,
                cursor=request.cursor,
                hl=request.hl,
            )
        except GmapCollectorError as exc:
            raise AppCommonException(
                CommonCode.MAPS_API_MEDIA_UNAVAILABLE,
                ext_msg=f"maps_api.reviews: request={job.request_id} reason={exc}",
            ) from None
    # 有效页（含空页）即成功；下一页游标只回给调用方，不进摘要。
    await export_api_job_service.complete_job(
        job,
        status=ExportRunStatus.COMPLETED,
        summary=ExportApiReviewsSummary(
            record_count=len(result.reviews), has_more=result.next_cursor is not None
        ),
    )
    return asdict(result)


async def photos(
    request: MapsPhotosRequest, user: UserContext, *, source: ExportApiSource
) -> dict[str, object]:
    async with _recorded_call(user, source, ExportApiOperation.PHOTOS, request) as job:
        config = await gmap_collector_config_service.get_config()
        try:
            result = await gmap_collector_client.list_photos(
                config,
                request_id=job.request_id,
                fid=request.fid,
                max_results=request.max_results,
            )
        except GmapCollectorError as exc:
            raise AppCommonException(
                CommonCode.MAPS_API_MEDIA_UNAVAILABLE,
                ext_msg=f"maps_api.photos: request={job.request_id} reason={exc}",
            ) from None
    # Collector 照片只交付 partial；有效交付一律局部成功，具体原因留在摘要 reason。
    await export_api_job_service.complete_job(
        job,
        status=ExportRunStatus.PARTIAL,
        summary=ExportApiPhotosSummary(
            record_count=len(result.photos),
            reported_total=result.reported_total,
            reason=result.reason,
        ),
    )
    return asdict(result)
