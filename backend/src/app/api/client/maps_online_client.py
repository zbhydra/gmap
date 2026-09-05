"""Online 任务入口：登录、创建约束、归属校验与结果下载。"""

from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi import APIRouter, Depends, Query
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask

from app.api.user_dependencies import UserContext, get_current_user
from app.constants.maps_online import KEYWORD_LIMITS
from app.constants.subscription import MAPS_ONLINE_PRODUCT_KIND
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.schemas.maps_online_schema import (
    MapsOnlineCreateRequest,
    MapsOnlineItemSummary,
    MapsOnlineTaskSummary,
)
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import maps_online_task_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.subscription_service import subscription_service
from app.services.usage_service import online_usage_service, usage_identity
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps-online/tasks", tags=["Online 任务"])


async def _user_task(task_no: str, user_id: int) -> MapsOnlineTaskModel:
    task = await maps_online_task_service.task_info(task_no=task_no, user_id=user_id)
    if task is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"maps_online._user_task: 任务不可用 task_no={task_no} user_id={user_id}",
        )
    return task


@router.post("")
async def create_task(
    request: MapsOnlineCreateRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    _, product = await subscription_service.get_user_subscription_config(
        current_user.user_id, MAPS_ONLINE_PRODUCT_KIND
    )
    limit = KEYWORD_LIMITS[product.product_id]
    if len(request.keywords) > limit:
        raise AppCommonException(
            CommonCode.VALIDATION_ERROR,
            ext_msg=f"maps_online.create_task: 关键词数量超限 user_id={current_user.user_id} limit={limit}",
            status_code=422,
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
    )
    return ResponseUtils.ok(MapsOnlineTaskSummary.from_task(task).model_dump())


@router.get("")
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


@router.get("/{task_no}")
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


@router.get("/{task_no}/items/{item_id}/download")
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


@router.get("/{task_no}/download")
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
