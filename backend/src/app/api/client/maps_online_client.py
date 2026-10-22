"""预览与本地 Online 权益；持久任务归 Export 路由。"""

import asyncio
from uuid import uuid4

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.api.client.export_client import creation_rights
from app.api.user_dependencies import UserContext, get_current_user
from app.constants.maps_online import MAX_LOGICAL_SAMPLES
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.provider.gmap.collector_client import GmapCollectorError, gmap_collector_client
from app.schemas.maps_online_schema import MapsOnlinePreviewRequest
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.usage_service import (
    online_usage_service,
    usage_identity,
    usage_payload,
)
from app.utils.common import get_client_ip, get_locale
from app.utils.redis_fixed_limiter import RedisFixedLimiter
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps-online", tags=["Online"])
_preview_limiter = RedisFixedLimiter(key_prefix="maps_online_preview")


@router.post("/preview")
async def preview(request: Request, payload: MapsOnlinePreviewRequest) -> JSONResponse:
    ip = get_client_ip(request)
    if not ip:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST, ext_msg="maps_online.preview: 无法获取客户端 IP"
        )
    if not await _preview_limiter.is_allowed(ip, limit=3, window=60):
        raise AppCommonException(
            CommonCode.RATE_LIMIT_EXCEEDED,
            ext_msg=f"maps_online.preview: 预览次数超限 ip={ip}",
        )
    try:
        async with asyncio.timeout(15):
            config = await gmap_collector_config_service.get_config()
            response = await gmap_collector_client.search_item(
                config,
                job_no=f"preview-{uuid4().hex}",
                item_index=0,
                deadline=asyncio.get_running_loop().time() + 15,
                mode="preview",
                keyword=payload.keyword,
                max_results=20,
                google_hl=get_locale(request).language,
                region=None,
                viewport=None,
                proxies=config.proxies[:3],
            )
            if response.status == "failed":
                raise GmapCollectorError("search_failed")
    except (TimeoutError, GmapCollectorError) as exc:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=f"maps_online.preview: 首屏采集失败 error={type(exc).__name__}",
        ) from None
    entries = response.result.entries[:3]
    result = ResponseUtils.ok(
        {
            "count": len(response.result.entries[:20]),
            "rows": [
                {
                    "name": entry.name,
                    "address": entry.full_address,
                    "category": ", ".join(entry.categories) or None,
                    "rating": entry.average_rating,
                    "review_count": entry.review_count,
                    "phone": entry.phone,
                }
                for entry in entries
            ],
        }
    )
    result.headers["Cache-Control"] = "no-store"
    return result


@router.get("/options")
async def options(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    limit, contacts_allowed = await creation_rights(current_user.user_id)
    usage = await online_usage_service.get_usage(
        usage_identity(current_user.user_id, None), user_id=current_user.user_id
    )
    return ResponseUtils.ok(
        {
            "keyword_limit": limit,
            "logical_sample_limit": MAX_LOGICAL_SAMPLES,
            "contacts_allowed": contacts_allowed,
            "usage": usage_payload(usage),
        }
    )
