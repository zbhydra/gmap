"""Online 任务入口：登录、创建约束、归属校验与结果下载。"""

import asyncio
from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from app.api.user_dependencies import UserContext, get_current_user
from app.constants.maps_online import KEYWORD_LIMITS
from app.constants.subscription import MAPS_ONLINE_PRODUCT_KIND
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.provider.gmap.http import gmap_http_provider
from app.provider.gmap.types import GmapProviderError
from app.schemas.maps_online_schema import (
    MapsOnlineCreateRequest,
    MapsOnlineItemSummary,
    MapsOnlinePreviewRequest,
    MapsOnlineTaskSummary,
)
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import maps_online_task_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.subscription_service import subscription_service
from app.services.usage_service import (
    online_usage_service,
    usage_identity,
    usage_payload,
)
from app.utils.common import get_client_ip
from app.utils.redis_fixed_limiter import RedisFixedLimiter
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps-online", tags=["Online 任务"])
# 限流沿用 Redis 故障放行语义，独立计数不参与账号用量。
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
            ext_msg=f"maps_online.preview: 每分钟预览次数超限 ip={ip}",
        )
    try:
        async with asyncio.timeout(15):
            await gmap_http_provider.initialize(await maps_engine_service.get_config())
            result = await gmap_http_provider.preview_places(payload.keyword)
    except (TimeoutError, GmapProviderError) as exc:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=f"maps_online.preview: 首屏采集失败 error={type(exc).__name__}",
        ) from exc
    response = ResponseUtils.ok(
        {
            "count": len(result.entries),
            "rows": [
                {
                    "name": entry.name,
                    "address": entry.full_address,
                    "category": ", ".join(entry.categories) or None,
                    "rating": entry.average_rating,
                    "review_count": entry.review_count,
                    "phone": entry.phone,
                }
                for entry in result.entries[:3]
            ],
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response


async def _creation_rights(user_id: int) -> tuple[int, bool]:
    subscription, product = await subscription_service.get_user_subscription_config(
        user_id, MAPS_ONLINE_PRODUCT_KIND
    )
    return KEYWORD_LIMITS[product.product_id], subscription.expires_at is not None


@router.get("/options")
async def options(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    limit, contacts_allowed = await _creation_rights(current_user.user_id)
    usage = await online_usage_service.get_usage(
        usage_identity(current_user.user_id, None), user_id=current_user.user_id
    )
    return ResponseUtils.ok(
        {
            "keyword_limit": limit,
            "contacts_allowed": contacts_allowed,
            "usage": usage_payload(usage),
        }
    )


async def _user_task(task_no: str, user_id: int) -> MapsOnlineTaskModel:
    task = await maps_online_task_service.task_info(task_no=task_no, user_id=user_id)
    if task is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online._user_task: 任务不可用 task_no={task_no} user_id={user_id}",
        )
    return task


@router.post("/tasks")
async def create_task(
    request: MapsOnlineCreateRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    limit, contacts_allowed = await _creation_rights(current_user.user_id)
    if len(request.keywords) > limit:
        raise AppCommonException(
            CommonCode.VALIDATION_ERROR,
            ext_msg=f"maps_online.create_task: 关键词数量超限 user_id={current_user.user_id} limit={limit}",
        )
    usage = await online_usage_service.get_usage(
        usage_identity(current_user.user_id, None), user_id=current_user.user_id
    )
    if usage.exhausted:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=f"maps_online.create_task: 当前额度已耗尽 user_id={current_user.user_id}",
        )
    engine = await maps_engine_service.get_config()
    include_contacts = request.include_contacts and contacts_allowed
    if include_contacts and not engine.proxies:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=f"maps_online.create_task: 官网补全代理池为空 user_id={current_user.user_id}",
        )
    storage = await object_storage_config_service.get_active()
    if storage is None:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=f"maps_online.create_task: 未启用对象存储 user_id={current_user.user_id}",
        )
    task, _ = await maps_online_task_service.create_task(
        user_id=current_user.user_id,
        keywords=request.keywords,
        provider=engine.provider,
        storage_id=storage.id,
        include_contacts=include_contacts,
    )
    return ResponseUtils.ok(MapsOnlineTaskSummary.from_task(task).model_dump())


@router.get("/tasks")
async def list_tasks(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1),
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    tasks = await maps_online_task_service.task_lists(
        user_id=current_user.user_id, offset=offset, limit=limit
    )
    total = await maps_online_task_service.count_tasks(user_id=current_user.user_id)
    return ResponseUtils.ok(
        {
            "tasks": [
                MapsOnlineTaskSummary.from_task(task).model_dump() for task in tasks
            ],
            "total": total,
            "offset": offset,
            "limit": limit,
        }
    )


@router.get("/tasks/{task_no}")
async def task_detail(
    task_no: str, current_user: UserContext = Depends(get_current_user)
) -> JSONResponse:
    task = await _user_task(task_no, current_user.user_id)
    items = await maps_online_task_service.item_lists(task.id)
    return ResponseUtils.ok(
        {
            "task": MapsOnlineTaskSummary.from_task(task).model_dump(),
            "items": [
                MapsOnlineItemSummary.model_validate(
                    item, from_attributes=True
                ).model_dump()
                for item in items
            ],
        }
    )


@router.get("/tasks/{task_no}/items/{item_id}/download")
async def download_item(
    task_no: str,
    item_id: int,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    task = await _user_task(task_no, current_user.user_id)
    item = await maps_online_task_service.item_info(task.id, item_id)
    if item is None or not item.object_key:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online.download_item: 文件不可用 task_no={task_no} item_id={item_id}",
        )
    try:
        url, filename = await maps_online_task_service.sign_download(
            task, item_id=item.id, keyword=item.keyword, object_key=item.object_key
        )
    except FileNotFoundError:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online.download_item: 对象不可用 task_no={task_no} item_id={item_id}",
        ) from None
    return ResponseUtils.ok({"url": url, "filename": filename})


@router.get("/tasks/{task_no}/download")
async def download_task(
    task_no: str, current_user: UserContext = Depends(get_current_user)
) -> FileResponse:
    task = await _user_task(task_no, current_user.user_id)
    if not task.completed_at:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=f"maps_online.download_task: 任务尚未完成 task_no={task_no}",
        )
    files = [
        (item.id, item.keyword, item.object_key)
        for item in await maps_online_task_service.item_lists(task.id)
        if item.object_key
    ]
    if not files:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online.download_task: 没有可下载文件 task_no={task_no}",
        )
    directory = TemporaryDirectory(prefix="maps-online-")
    try:
        path = await maps_online_task_service.download_zip(
            task, files, Path(directory.name)
        )
        return FileResponse(
            path,
            media_type="application/zip",
            filename=f"{task.task_no}.zip",
            background=BackgroundTask(directory.cleanup),
        )
    except FileNotFoundError:
        directory.cleanup()
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online.download_task: 对象不可用 task_no={task_no}",
        ) from None
    except BaseException:
        directory.cleanup()
        raise
