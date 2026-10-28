"""本人 Google Export 创建、历史、详情与整 Job CSV 下载。"""

import pathlib
import re
from tempfile import TemporaryDirectory
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Path, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import StringConstraints
from starlette.background import BackgroundTask

from app.api.user_dependencies import UserContext, get_current_user
from app.constants.export import EXPORT_PUBLIC_STATUSES, ExportRunStatus
from app.constants.maps_online import KEYWORD_LIMITS
from app.constants.subscription import MAPS_ONLINE_PRODUCT_KIND
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.export_job_model import ExportJobModel
from app.models.export_run_model import ExportRunModel
from app.runtime.export_job_runtime import export_job_runtime
from app.schemas.admin_schema import ObjectStorageItem
from app.schemas.export_item_schema import ExportCreateRequest, GmapSearchOptions
from app.schemas.export_run_schema import ExportRunResult
from app.services.export_job_service import export_job_service
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.subscription_service import subscription_service
from app.services.usage_service import online_usage_service, usage_identity
from app.utils import object_storage
from app.utils.common import get_locale
from app.utils.response import ResponseUtils
from app.utils.time import timestamp_to_datetime_str

router = APIRouter(prefix="/export", tags=["Google Export"])
JobNo = Annotated[str, Path(pattern=r"^[0-9a-f]{32}0[0-9]$")]
HistoryQuery = Annotated[str, StringConstraints(strip_whitespace=True, max_length=100)]
# Windows / macOS 文件名非法字符与控制字符
_FILENAME_UNSAFE = re.compile(r'[\x00-\x1f\x7f\\/:*?"<>|]+')
_FILENAME_KEYWORD_MAX = 80
PublicStatus = Literal[
    "queued", "collecting", "publishing", "completed", "partial", "failed"
]


async def creation_rights(user_id: int) -> tuple[int, bool]:
    subscription, config = await subscription_service.get_user_subscription_config(
        user_id, MAPS_ONLINE_PRODUCT_KIND
    )
    return (
        KEYWORD_LIMITS[config.product_id],
        subscription.expires_at is not None,
    )


def _summary(
    job: ExportJobModel, run: ExportRunModel, q: str | None = None
) -> dict[str, object]:
    checkpoint = run.checkpoint
    keywords = GmapSearchOptions.model_validate(job.options_json).keywords
    keyword_preview = next(
        (keyword for keyword in keywords if q and q.casefold() in keyword.casefold()),
        keywords[0],
    )
    return {
        "job_no": job.job_no,
        "run_no": run.run_no,
        "status": EXPORT_PUBLIC_STATUSES[run.status],
        "include_contacts": job.include_contacts,
        "keyword_preview": keyword_preview,
        "keyword_count": len(keywords),
        "total_count": len(checkpoint.item_results),
        "processed_count": sum(item.completed for item in checkpoint.item_results),
        "record_count": checkpoint.output_count,
        "has_file": job.result_json is not None,
        "created_at": job.created_at,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "error_code": run.error_code,
    }


def _detail(job: ExportJobModel, run: ExportRunModel) -> dict[str, object]:
    options = GmapSearchOptions.model_validate(job.options_json)
    return {
        "job": _summary(job, run),
        "items": [
            {
                **item.model_dump(mode="json"),
                **options.items[item.item_index].model_dump(mode="json"),
            }
            for item in run.checkpoint.item_results
        ],
    }


async def _user_job(user_id: int, job_no: str) -> tuple[ExportJobModel, ExportRunModel]:
    job = await export_job_service.export_job_info(user_id=user_id, job_no=job_no)
    if job is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"export.user_job: 本人 Job 不存在 job_no={job_no} user_id={user_id}",
        )
    runs = await export_job_service.export_run_lists(user_id=user_id, job_nos=[job_no])
    return job, runs[0]


@router.post("/jobs")
async def create_job(
    payload: ExportCreateRequest,
    request: Request,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    export_job_runtime.require_ready()
    limit, contacts_allowed = await creation_rights(current_user.user_id)
    if len({item.keyword for item in payload.items}) > limit:
        raise AppCommonException(
            CommonCode.VALIDATION_ERROR,
            ext_msg=f"export.create_job: 不同关键词超限 user_id={current_user.user_id} limit={limit}",
        )
    usage = await online_usage_service.get_usage(
        usage_identity(current_user.user_id, None), user_id=current_user.user_id
    )
    if usage.exhausted:
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=f"export.create_job: Online 月额度已耗尽 user_id={current_user.user_id}",
        )
    config = await gmap_collector_config_service.get_config()
    storage = await object_storage_config_service.get_active()
    if not config.collectors or storage is None:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg="export.create_job: Collector 或对象存储未配置",
        )
    job, run = await export_job_service.create_job(
        user_id=current_user.user_id,
        options=GmapSearchOptions(
            items=payload.items, export_locale=get_locale(request).language
        ),
        include_contacts=payload.include_contacts and contacts_allowed,
        storage_id=storage.id,
    )
    await export_job_runtime.wake_job(run)
    return ResponseUtils.ok(_detail(job, run))


@router.get("/jobs")
async def list_jobs(
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    q: HistoryQuery | None = Query(None),
    status: list[PublicStatus] | None = Query(None),
    created_from_ms: int | None = Query(None, ge=0),
    created_to_ms: int | None = Query(None, ge=0),
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    if (
        created_from_ms is not None
        and created_to_ms is not None
        and created_from_ms > created_to_ms
    ):
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "export.list_jobs: 创建时间范围无效 "
                f"created_from_ms={created_from_ms} created_to_ms={created_to_ms}"
            ),
            data={"field": "created_range"},
        )
    q = q or None
    statuses = [ExportRunStatus[value.upper()] for value in status] if status else None
    jobs = await export_job_service.export_job_lists(
        user_id=current_user.user_id,
        q=q,
        statuses=statuses,
        created_from_ms=created_from_ms,
        created_to_ms=created_to_ms,
        offset=offset,
        limit=limit,
    )
    runs = {
        run.job_no: run
        for run in await export_job_service.export_run_lists(
            user_id=current_user.user_id, job_nos=[job.job_no for job in jobs]
        )
    }
    return ResponseUtils.ok(
        {
            "jobs": [_summary(job, runs[job.job_no], q) for job in jobs],
            "total": await export_job_service.count_export_jobs(
                user_id=current_user.user_id,
                q=q,
                statuses=statuses,
                created_from_ms=created_from_ms,
                created_to_ms=created_to_ms,
            ),
            "offset": offset,
            "limit": limit,
        }
    )


@router.get("/jobs/{job_no}")
async def job_detail(
    job_no: JobNo, current_user: UserContext = Depends(get_current_user)
) -> JSONResponse:
    job, run = await _user_job(current_user.user_id, job_no)
    await export_job_runtime.wake_job(run)
    return ResponseUtils.ok(_detail(job, run))


async def _published_file(
    user_id: int, job_no: str
) -> tuple[ExportJobModel, ObjectStorageItem, ExportRunResult]:
    job, _ = await _user_job(user_id, job_no)
    if (
        job.status not in (ExportRunStatus.COMPLETED, ExportRunStatus.PARTIAL)
        or job.result_json is None
    ):
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"export.download: 没有已发布 CSV job_no={job_no}",
        )
    storage = await object_storage_config_service.get_item(job.storage_id)
    if storage is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"export.download: 对象存储已移除 job_no={job_no}",
        )
    return job, storage, ExportRunResult.model_validate(job.result_json)


def _download_filename(job: ExportJobModel) -> str:
    """整 Job CSV 下载名：首个关键词-创建日（业务时区）.csv；XLSX 由前端换扩展名。"""
    keyword = GmapSearchOptions.model_validate(job.options_json).keywords[0]
    stem = _FILENAME_UNSAFE.sub("_", keyword)[:_FILENAME_KEYWORD_MAX].strip(" ._")
    return f"{stem or 'export'}-{timestamp_to_datetime_str(job.created_at, '%Y-%m-%d')}.csv"


@router.get("/jobs/{job_no}/download")
async def download_job(
    job_no: JobNo, current_user: UserContext = Depends(get_current_user)
) -> JSONResponse:
    job, storage, result = await _published_file(current_user.user_id, job_no)
    filename = _download_filename(job)
    try:
        url = await object_storage.presign_get(
            storage, result.object_key, filename=filename
        )
    except FileNotFoundError:
        raise AppCommonException(
            CommonCode.NOT_FOUND, ext_msg=f"export.download: 对象不存在 job_no={job_no}"
        ) from None
    response = ResponseUtils.ok({"url": url, "filename": filename})
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/jobs/{job_no}/file")
async def download_job_file(
    job_no: JobNo, current_user: UserContext = Depends(get_current_user)
) -> FileResponse:
    """同源返回整 Job CSV 字节，供网站在浏览器内转换 XLSX；对象存储未开放 CORS。"""
    _, storage, result = await _published_file(current_user.user_id, job_no)
    directory = TemporaryDirectory(prefix="gmap-export-")
    path = pathlib.Path(directory.name) / "export.csv"
    try:
        await object_storage.download_file(storage, result.object_key, path)
    except FileNotFoundError:
        directory.cleanup()
        raise AppCommonException(
            CommonCode.NOT_FOUND, ext_msg=f"export.file: 对象不存在 job_no={job_no}"
        ) from None
    except BaseException:
        directory.cleanup()
        raise
    return FileResponse(
        path,
        media_type="text/csv; charset=utf-8",
        headers={"Cache-Control": "no-store"},
        background=BackgroundTask(directory.cleanup),
    )
