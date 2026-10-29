"""管理后台任务记录只读查询：Online Job/Run 与 API/MCP 调用记录各自分页。

两类记录都按 owner 分表；用户 ID 或编号能定位槽位时只查该表，否则各表
UNION ALL 后由数据库排序、分页与计数，不在进程内归并。本服务不写任何数据。
"""

from collections.abc import Sequence
from typing import TypeVar

from sqlalchemy import RowMapping, Select, func, select, union_all
from sqlalchemy.sql.elements import ColumnElement

from app.constants.export import EXPORT_SHARD_COUNT, ExportRunStatus
from app.constants.export_api import ExportApiOperation, ExportApiSource
from app.core.database import get_async_session
from app.models.export_api_job_model import EXPORT_API_JOB_MODELS
from app.models.export_job_model import EXPORT_JOB_MODELS
from app.models.export_run_model import EXPORT_RUN_MODELS

_Row = TypeVar("_Row", bound=tuple[object, ...])


class AdminTaskRecordService:
    async def online_job_lists(
        self,
        *,
        user_id: int | None = None,
        job_no: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[RowMapping]:
        """Job 列与同槽唯一 Run 的执行列，按创建时间、任务编号倒序。"""
        branches = []
        for slot in self._slots(user_id, job_no):
            job, run = EXPORT_JOB_MODELS[slot], EXPORT_RUN_MODELS[slot]
            branches.append(
                select(
                    job.job_no,
                    job.run_no,
                    job.user_id,
                    job.options_json,
                    job.keywords_text,
                    job.include_contacts,
                    job.status,
                    job.result_json,
                    job.created_at,
                    job.finished_at,
                    run.node_name,
                    run.checkpoint_json,
                    run.error_code,
                    run.started_at,
                )
                .join_from(job, run, run.job_no == job.job_no)
                .where(
                    *self._online_job_filters(
                        slot,
                        user_id=user_id,
                        job_no=job_no,
                        statuses=statuses,
                        created_from_ms=created_from_ms,
                        created_to_ms=created_to_ms,
                    )
                )
                .order_by(job.created_at.desc(), job.job_no.desc())
                .limit(offset + limit)
            )
        return await self._page(
            branches, no_column="job_no", offset=offset, limit=limit
        )

    async def count_online_jobs(
        self,
        *,
        user_id: int | None = None,
        job_no: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
    ) -> int:
        return await self._count(
            [
                select(func.count().label("total"))
                .select_from(EXPORT_JOB_MODELS[slot])
                .where(
                    *self._online_job_filters(
                        slot,
                        user_id=user_id,
                        job_no=job_no,
                        statuses=statuses,
                        created_from_ms=created_from_ms,
                        created_to_ms=created_to_ms,
                    )
                )
                for slot in self._slots(user_id, job_no)
            ]
        )

    async def online_job_info(self, job_no: str) -> RowMapping | None:
        rows = await self.online_job_lists(job_no=job_no, limit=1)
        return rows[0] if rows else None

    async def api_job_lists(
        self,
        *,
        user_id: int | None = None,
        request_id: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        sources: Sequence[ExportApiSource] | None = None,
        operations: Sequence[ExportApiOperation] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[RowMapping]:
        """调用记录按开始时间、请求编号倒序；分表内自增主键跨表无意义，不返回。"""
        branches = []
        for slot in self._slots(user_id, request_id):
            model = EXPORT_API_JOB_MODELS[slot]
            branches.append(
                select(
                    model.request_id,
                    model.user_id,
                    model.source,
                    model.operation,
                    model.status,
                    model.params_json,
                    model.summary_json,
                    model.error_code,
                    model.created_at,
                    model.finished_at,
                )
                .where(
                    *self._api_job_filters(
                        slot,
                        user_id=user_id,
                        request_id=request_id,
                        statuses=statuses,
                        sources=sources,
                        operations=operations,
                        created_from_ms=created_from_ms,
                        created_to_ms=created_to_ms,
                    )
                )
                .order_by(model.created_at.desc(), model.request_id.desc())
                .limit(offset + limit)
            )
        return await self._page(
            branches, no_column="request_id", offset=offset, limit=limit
        )

    async def count_api_jobs(
        self,
        *,
        user_id: int | None = None,
        request_id: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        sources: Sequence[ExportApiSource] | None = None,
        operations: Sequence[ExportApiOperation] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
    ) -> int:
        return await self._count(
            [
                select(func.count().label("total"))
                .select_from(EXPORT_API_JOB_MODELS[slot])
                .where(
                    *self._api_job_filters(
                        slot,
                        user_id=user_id,
                        request_id=request_id,
                        statuses=statuses,
                        sources=sources,
                        operations=operations,
                        created_from_ms=created_from_ms,
                        created_to_ms=created_to_ms,
                    )
                )
                for slot in self._slots(user_id, request_id)
            ]
        )

    async def api_job_info(self, request_id: str) -> RowMapping | None:
        rows = await self.api_job_lists(request_id=request_id, limit=1)
        return rows[0] if rows else None

    def _slots(self, user_id: int | None, no: str | None) -> list[int]:
        """编号末两位与 user_id 取模同为 owner 槽号；都未给出时查全部分表。"""
        if no is not None:
            return [int(no[-2:])]
        if user_id is not None:
            return [user_id % EXPORT_SHARD_COUNT]
        return list(range(EXPORT_SHARD_COUNT))

    def _online_job_filters(
        self,
        slot: int,
        *,
        user_id: int | None,
        job_no: str | None,
        statuses: Sequence[ExportRunStatus] | None,
        created_from_ms: int | None,
        created_to_ms: int | None,
    ) -> list[ColumnElement[bool]]:
        model = EXPORT_JOB_MODELS[slot]
        conditions: list[ColumnElement[bool]] = []
        if user_id is not None:
            conditions.append(model.user_id == user_id)
        if job_no is not None:
            conditions.append(model.job_no == job_no)
        if statuses is not None:
            conditions.append(model.status.in_(statuses))
        if created_from_ms is not None:
            conditions.append(model.created_at >= created_from_ms)
        if created_to_ms is not None:
            conditions.append(model.created_at < created_to_ms)
        return conditions

    def _api_job_filters(
        self,
        slot: int,
        *,
        user_id: int | None,
        request_id: str | None,
        statuses: Sequence[ExportRunStatus] | None,
        sources: Sequence[ExportApiSource] | None,
        operations: Sequence[ExportApiOperation] | None,
        created_from_ms: int | None,
        created_to_ms: int | None,
    ) -> list[ColumnElement[bool]]:
        model = EXPORT_API_JOB_MODELS[slot]
        conditions: list[ColumnElement[bool]] = []
        if user_id is not None:
            conditions.append(model.user_id == user_id)
        if request_id is not None:
            conditions.append(model.request_id == request_id)
        if statuses is not None:
            conditions.append(model.status.in_(statuses))
        if sources is not None:
            conditions.append(model.source.in_(sources))
        if operations is not None:
            conditions.append(model.operation.in_(operations))
        if created_from_ms is not None:
            conditions.append(model.created_at >= created_from_ms)
        if created_to_ms is not None:
            conditions.append(model.created_at < created_to_ms)
        return conditions

    async def _page(
        self,
        branches: Sequence[Select[_Row]],
        *,
        no_column: str,
        offset: int,
        limit: int,
    ) -> list[RowMapping]:
        # 分表跨表分页无法避免子查询：每表先按同一顺序取前 offset+limit 行，
        # 全局页必在其并集内，合并结果只需再排序截取，不物化整张分表。
        records = union_all(*branches).subquery()
        stmt = (
            select(records)
            .order_by(records.c.created_at.desc(), records.c[no_column].desc())
            .offset(offset)
            .limit(limit)
        )
        async with get_async_session() as db:
            return list((await db.execute(stmt)).mappings().all())

    async def _count(self, branches: Sequence[Select[_Row]]) -> int:
        # 分表计数同样经子查询汇总，每表只返回一行计数。
        counts = union_all(*branches).subquery()
        stmt = select(func.coalesce(func.sum(counts.c.total), 0))
        async with get_async_session() as db:
            return int((await db.execute(stmt)).scalar_one())


admin_task_record_service = AdminTaskRecordService()
