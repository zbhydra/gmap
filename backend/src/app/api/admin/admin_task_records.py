"""Admin 任务记录只读 API：Online 任务与 API/MCP 调用记录两个独立列表。

Online 原样读取既有 Job/Run，调用记录的参数与摘要原样投影，均不重新校验业务输入。
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse
from sqlalchemy import RowMapping

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.constants.export import ExportRunStatus
from app.constants.export_api import ExportApiOperation, ExportApiSource
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.export_item_schema import GmapSearchOptions
from app.schemas.export_run_schema import ExportRunCheckpoint
from app.services.admin_task_record_service import admin_task_record_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/task-records", tags=["admin-task-records"])

# Online job_no 与调用 request_id 同规则：UUID hex 加两位 owner 槽号。
_RECORD_NO_PATTERN = r"^[0-9a-f]{32}0[0-9]$"
RecordNoPath = Annotated[str, Path(pattern=_RECORD_NO_PATTERN, description="记录编号")]


@router.get("/online")
async def list_online_tasks(
    page: int = Query(default=1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(default=20, ge=1, le=100, description="每页数量"),
    user_id: int | None = Query(default=None, ge=1, description="用户 ID"),
    job_no: str | None = Query(
        default=None, pattern=_RECORD_NO_PATTERN, description="任务编号（精确）"
    ),
    status: ExportRunStatus | None = Query(default=None, description="任务状态"),
    created_from_ms: int | None = Query(
        default=None, ge=0, description="创建时间起点，毫秒时间戳（含）"
    ),
    created_to_ms: int | None = Query(
        default=None, ge=0, description="创建时间终点，毫秒时间戳（不含）"
    ),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """跨分表分页查询 Online 任务。"""
    _check_created_range("online", created_from_ms, created_to_ms)
    statuses = [status] if status is not None else None
    rows = await admin_task_record_service.online_job_lists(
        user_id=user_id,
        job_no=job_no,
        statuses=statuses,
        created_from_ms=created_from_ms,
        created_to_ms=created_to_ms,
        offset=(page - 1) * page_size,
        limit=page_size,
    )
    total = await admin_task_record_service.count_online_jobs(
        user_id=user_id,
        job_no=job_no,
        statuses=statuses,
        created_from_ms=created_from_ms,
        created_to_ms=created_to_ms,
    )
    return ResponseUtils.ok(
        {
            "rows": [_online_row(row) for row in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.get("/online/{job_no}")
async def get_online_task(
    job_no: RecordNoPath,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """读取 Online 任务与唯一 Run 的执行进度及逐采样事实。"""
    row = await admin_task_record_service.online_job_info(job_no)
    if row is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"admin_task_records.online_detail: Online 任务不存在 job_no={job_no}",
        )
    return ResponseUtils.ok(_online_detail(row))


@router.get("/calls")
async def list_api_calls(
    page: int = Query(default=1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(default=20, ge=1, le=100, description="每页数量"),
    user_id: int | None = Query(default=None, ge=1, description="用户 ID"),
    request_id: str | None = Query(
        default=None, pattern=_RECORD_NO_PATTERN, description="请求编号（精确）"
    ),
    status: ExportRunStatus | None = Query(default=None, description="调用状态"),
    source: ExportApiSource | None = Query(default=None, description="2=API 3=MCP"),
    operation: ExportApiOperation | None = Query(
        default=None, description="1=搜索 2=评论 3=照片"
    ),
    created_from_ms: int | None = Query(
        default=None, ge=0, description="开始时间起点，毫秒时间戳（含）"
    ),
    created_to_ms: int | None = Query(
        default=None, ge=0, description="开始时间终点，毫秒时间戳（不含）"
    ),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """跨分表分页查询 API/MCP 调用记录。"""
    _check_created_range("calls", created_from_ms, created_to_ms)
    statuses = [status] if status is not None else None
    sources = [source] if source is not None else None
    operations = [operation] if operation is not None else None
    rows = await admin_task_record_service.api_job_lists(
        user_id=user_id,
        request_id=request_id,
        statuses=statuses,
        sources=sources,
        operations=operations,
        created_from_ms=created_from_ms,
        created_to_ms=created_to_ms,
        offset=(page - 1) * page_size,
        limit=page_size,
    )
    total = await admin_task_record_service.count_api_jobs(
        user_id=user_id,
        request_id=request_id,
        statuses=statuses,
        sources=sources,
        operations=operations,
        created_from_ms=created_from_ms,
        created_to_ms=created_to_ms,
    )
    return ResponseUtils.ok(
        {
            "rows": [_call_row(row) for row in rows],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.get("/calls/{request_id}")
async def get_api_call(
    request_id: RecordNoPath,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """读取单次同步调用的参数、摘要与错误。"""
    row = await admin_task_record_service.api_job_info(request_id)
    if row is None:
        raise AppCommonException(
            CommonCode.NOT_FOUND,
            ext_msg=f"admin_task_records.call_detail: 调用记录不存在 request_id={request_id}",
        )
    return ResponseUtils.ok(_call_detail(row))


def _check_created_range(
    listing: str, created_from_ms: int | None, created_to_ms: int | None
) -> None:
    if (
        created_from_ms is not None
        and created_to_ms is not None
        and created_from_ms > created_to_ms
    ):
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                f"admin_task_records.{listing}: invalid created range: "
                f"created_from_ms={created_from_ms}, created_to_ms={created_to_ms}"
            ),
            data={"field": "created_range"},
        )


def _online_row(row: RowMapping) -> dict[str, object]:
    checkpoint = ExportRunCheckpoint.model_validate(row["checkpoint_json"])
    return {
        "job_no": row["job_no"],
        "user_id": row["user_id"],
        "keywords": row["keywords_text"].split("\n"),
        "status": row["status"],
        # 采样即逻辑采样项；结果数沿 Online 历史的 CSV 已写行数。
        "sample_count": len(checkpoint.item_results),
        "record_count": checkpoint.output_count,
        "created_at": row["created_at"],
        "finished_at": row["finished_at"],
    }


def _online_detail(row: RowMapping) -> dict[str, object]:
    options = GmapSearchOptions.model_validate(row["options_json"])
    checkpoint = ExportRunCheckpoint.model_validate(row["checkpoint_json"])
    return {
        **_online_row(row),
        "run_no": row["run_no"],
        "include_contacts": row["include_contacts"],
        "export_locale": options.export_locale,
        "processed_count": sum(item.completed for item in checkpoint.item_results),
        "has_file": row["result_json"] is not None,
        "node_name": row["node_name"],
        "error_code": row["error_code"],
        "started_at": row["started_at"],
        "items": [
            {
                **item.model_dump(mode="json"),
                **options.items[item.item_index].model_dump(mode="json"),
            }
            for item in checkpoint.item_results
        ],
    }


def _call_row(row: RowMapping) -> dict[str, object]:
    summary = row["summary_json"]
    return {
        "request_id": row["request_id"],
        "user_id": row["user_id"],
        "source": row["source"],
        "operation": row["operation"],
        "status": row["status"],
        # 只有有效结果才写摘要；处理中与失败没有结果数量。
        "record_count": summary["record_count"] if summary is not None else None,
        "created_at": row["created_at"],
        "finished_at": row["finished_at"],
    }


def _call_detail(row: RowMapping) -> dict[str, object]:
    return {
        **_call_row(row),
        "params": row["params_json"],
        "summary": row["summary_json"],
        "error_code": row["error_code"],
    }


__all__ = ["router"]
