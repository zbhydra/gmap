"""REST 与 MCP 共用同步采集及月度计量，不创建 Online 任务。"""

from dataclasses import asdict
from uuid import uuid4

from app.api.user_dependencies import UserContext
from app.constants.maps_enrich import ENRICH_BATCH_BUDGET_SECONDS
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.provider.gmap import gmap_http_provider
from app.provider.maps_enrich import maps_enrich_provider
from app.schemas.maps_api_schema import MapsReviewsRequest, MapsSearchRequest
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
from app.services.maps_engine_service import maps_engine_service
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
    engine = await maps_engine_service.get_config()
    await gmap_http_provider.initialize(engine)
    result = await gmap_http_provider.search_places(
        request.q,
        request.page,
        request.hl,
        ll=request.ll,
        request_id=request_id,
    )
    places = [asdict(entry) for entry in result.entries]
    partial = result.partial
    if request.extra:
        enriched = await maps_enrich_provider.enrich(
            [
                MapsEnrichBusiness(
                    domain=entry.domain or "", website=entry.website or ""
                )
                for entry in result.entries
            ],
            proxies=engine.proxies,
            batch_timeout=ENRICH_BATCH_BUDGET_SECONDS,
        )
        for place, contacts in zip(places, enriched["results"], strict=True):
            place.update(emails=contacts["emails"], medias=contacts["medias"])
        partial = partial or enriched["partial"]
    await _consume(user, request_id)
    return {"places": places, "partial": partial, "warnings": result.warnings}


async def reviews(request: MapsReviewsRequest, user: UserContext) -> dict[str, object]:
    await _check_quota(user)
    await gmap_http_provider.initialize(await maps_engine_service.get_config())
    result = await gmap_http_provider.list_reviews(
        request.fid,
        request.sort_by,
        request.cursor,
        request.hl,
    )
    await _consume(user, uuid4().hex)
    return asdict(result)
