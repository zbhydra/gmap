"""CAS owner Job/Run 短事务；本项目原用量账本参与成功发布。"""

from collections.abc import AsyncIterator, Sequence
from string import hexdigits
from typing import TypeVar, cast

from sqlalchemy import Select, false, func, or_, select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.sql.elements import ColumnElement

from app.constants.export import EXPORT_ACTIVE_STATUSES, ExportRunStatus
from app.core.config import settings
from app.core.database import get_async_session
from app.models.export_job_model import ExportJobModel
from app.models.export_run_model import EXPORT_RUN_MODELS, ExportRunModel
from app.schemas.export_item_schema import GmapSearchOptions, ExportItemResult
from app.schemas.export_run_schema import ExportRunCheckpoint, ExportRunResult
from app.services.usage_service import online_usage_service
from app.utils.time import timestamp_now

_Row = TypeVar("_Row", bound=tuple[object, ...])


class ExportJobService:
    async def create_job(
        self,
        *,
        user_id: int,
        options: GmapSearchOptions,
        include_contacts: bool,
        storage_id: str,
    ) -> tuple[ExportJobModel, ExportRunModel]:
        job_no = ExportJobModel.generate_no(user_id)
        run_no = ExportJobModel.generate_no(user_id)
        job_model = ExportJobModel.model_for_user(user_id)
        run_model = ExportRunModel.model_for_user(user_id)
        checkpoint = ExportRunCheckpoint(
            item_results=[
                ExportItemResult(item_index=i) for i in range(len(options.items))
            ]
        )
        job = job_model(  # type: ignore[call-arg]
            job_no=job_no,
            run_no=run_no,
            user_id=user_id,
            options_json=options.model_dump(mode="json"),
            keywords_text="\n".join(options.keywords),
            include_contacts=include_contacts,
            storage_id=storage_id,
            status=ExportRunStatus.QUEUED.value,
        )
        run = run_model(  # type: ignore[call-arg]
            run_no=run_no,
            job_no=job_no,
            user_id=user_id,
            node_name=settings.app.name,
            status=ExportRunStatus.QUEUED.value,
            checkpoint_seq=0,
            checkpoint_json=checkpoint.model_dump(mode="json"),
        )
        async with get_async_session() as db:
            db.add_all([job, run])
            await db.commit()
        return job, run

    async def export_job_lists(
        self,
        *,
        user_id: int,
        job_nos: Sequence[str] | None = None,
        q: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[ExportJobModel]:
        model = ExportJobModel.model_for_user(user_id)
        stmt = self._apply_export_job_filters(
            select(model),
            user_id=user_id,
            job_nos=job_nos,
            q=q,
            statuses=statuses,
            created_from_ms=created_from_ms,
            created_to_ms=created_to_ms,
        )
        async with get_async_session() as db:
            rows = await db.execute(
                stmt.order_by(model.job_id.desc()).offset(offset).limit(limit)
            )
            return list(rows.scalars().all())

    async def count_export_jobs(
        self,
        *,
        user_id: int,
        q: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
    ) -> int:
        model = ExportJobModel.model_for_user(user_id)
        stmt = self._apply_export_job_filters(
            select(func.count()).select_from(model),
            user_id=user_id,
            q=q,
            statuses=statuses,
            created_from_ms=created_from_ms,
            created_to_ms=created_to_ms,
        )
        async with get_async_session() as db:
            return int((await db.execute(stmt)).scalar_one())

    def _apply_export_job_filters(
        self,
        stmt: Select[_Row],
        *,
        user_id: int,
        job_nos: Sequence[str] | None = None,
        q: str | None = None,
        statuses: Sequence[ExportRunStatus] | None = None,
        created_from_ms: int | None = None,
        created_to_ms: int | None = None,
    ) -> Select[_Row]:
        model = ExportJobModel.model_for_user(user_id)
        stmt = stmt.where(model.user_id == user_id)
        if job_nos is not None:
            stmt = stmt.where(model.job_no.in_(job_nos))
        if q:
            # 单关键词已归一空白，换行只属于存储分隔符，不能跨关键词命中。
            matches: ColumnElement[bool] = (
                false()
                if "\n" in q
                else model.keywords_text.contains(q, autoescape=True)
            )
            if all(char in hexdigits for char in q):
                matches = or_(model.job_no.startswith(q, autoescape=True), matches)
            stmt = stmt.where(matches)
        if statuses is not None:
            stmt = stmt.where(model.status.in_(statuses))
        if created_from_ms is not None:
            stmt = stmt.where(model.created_at >= created_from_ms)
        if created_to_ms is not None:
            stmt = stmt.where(model.created_at < created_to_ms)
        return stmt

    async def export_job_info(
        self, *, user_id: int, job_no: str
    ) -> ExportJobModel | None:
        jobs = await self.export_job_lists(user_id=user_id, job_nos=[job_no], limit=1)
        return jobs[0] if jobs else None

    async def export_run_lists(
        self, *, user_id: int, job_nos: list[str]
    ) -> list[ExportRunModel]:
        model = ExportRunModel.model_for_user(user_id)
        async with get_async_session() as db:
            return list(
                (
                    await db.execute(
                        select(model).where(
                            model.user_id == user_id, model.job_no.in_(job_nos)
                        )
                    )
                )
                .scalars()
                .all()
            )

    async def discover_runtime_runs(self) -> AsyncIterator[ExportRunModel]:
        for model in EXPORT_RUN_MODELS:
            after_id = 0
            while True:
                async with get_async_session() as db:
                    rows = list(
                        (
                            await db.execute(
                                select(model)
                                .where(
                                    model.node_name == settings.app.name,
                                    model.status.in_(EXPORT_ACTIVE_STATUSES),
                                    model.run_id > after_id,
                                )
                                .order_by(model.run_id)
                                .limit(100)
                            )
                        )
                        .scalars()
                        .all()
                    )
                if not rows:
                    break
                for run in rows:
                    yield run
                after_id = rows[-1].run_id

    async def start_run(self, run: ExportRunModel) -> bool:
        model = ExportRunModel.model_for_user(run.user_id)
        job_model = ExportJobModel.model_for_user(run.user_id)
        started_at = timestamp_now()
        async with get_async_session() as db:
            result = cast(
                CursorResult,
                await db.execute(
                    update(model)
                    .where(
                        model.run_no == run.run_no,
                        model.status == ExportRunStatus.QUEUED,
                        model.node_name == settings.app.name,
                    )
                    .values(
                        status=ExportRunStatus.COLLECTING.value, started_at=started_at
                    )
                ),
            )
            if result.rowcount != 1:
                return False
            await db.execute(
                update(job_model)
                .where(job_model.job_no == run.job_no)
                .values(status=ExportRunStatus.COLLECTING.value)
            )
            await db.commit()
        run.status = ExportRunStatus.COLLECTING.value
        run.started_at = started_at
        return True

    async def checkpoint_run(
        self, run: ExportRunModel, checkpoint: ExportRunCheckpoint
    ) -> None:
        model = ExportRunModel.model_for_user(run.user_id)
        async with get_async_session() as db:
            changed = cast(
                CursorResult,
                await db.execute(
                    update(model)
                    .where(
                        model.run_no == run.run_no,
                        model.status == ExportRunStatus.COLLECTING,
                        model.checkpoint_seq == run.checkpoint_seq,
                    )
                    .values(
                        checkpoint_json=checkpoint.model_dump(mode="json"),
                        checkpoint_seq=run.checkpoint_seq + 1,
                    )
                ),
            )
            if changed.rowcount != 1:
                raise RuntimeError(
                    f"export_job.checkpoint_run: conditional update missed run_no={run.run_no}"
                )
            await db.commit()
        run.checkpoint_json = checkpoint.model_dump(mode="json")
        run.checkpoint_seq += 1

    async def prepare_run(self, run: ExportRunModel, result: ExportRunResult) -> None:
        model = ExportRunModel.model_for_user(run.user_id)
        job_model = ExportJobModel.model_for_user(run.user_id)
        async with get_async_session() as db:
            changed = cast(
                CursorResult,
                await db.execute(
                    update(model)
                    .where(
                        model.run_no == run.run_no,
                        model.status == ExportRunStatus.COLLECTING,
                        model.checkpoint_seq == run.checkpoint_seq,
                    )
                    .values(
                        status=ExportRunStatus.PUBLISHING.value,
                        prepared_result_json=result.model_dump(mode="json"),
                    )
                ),
            )
            if changed.rowcount != 1:
                raise RuntimeError(
                    f"export_job.prepare_run: conditional update missed run_no={run.run_no}"
                )
            await db.execute(
                update(job_model)
                .where(job_model.job_no == run.job_no)
                .values(status=ExportRunStatus.PUBLISHING.value)
            )
            await db.commit()
        run.status = ExportRunStatus.PUBLISHING.value
        run.prepared_result_json = result.model_dump(mode="json")

    async def settle_run(
        self,
        run: ExportRunModel,
        *,
        status: ExportRunStatus,
        result: ExportRunResult | None = None,
        error_code: int | None = None,
    ) -> bool:
        model = ExportRunModel.model_for_user(run.user_id)
        job_model = ExportJobModel.model_for_user(run.user_id)
        now = timestamp_now()
        async with get_async_session() as db:
            # 先取得本轮唯一终态写入权，重放与提交响应丢失均不产生第二笔流水。
            changed = cast(
                CursorResult,
                await db.execute(
                    update(model)
                    .where(
                        model.run_no == run.run_no,
                        model.status == run.status,
                        model.status.in_(EXPORT_ACTIVE_STATUSES),
                        model.node_name == settings.app.name,
                        model.checkpoint_seq == run.checkpoint_seq,
                    )
                    .values(status=status.value, finished_at=now, error_code=error_code)
                ),
            )
            if changed.rowcount != 1:
                return False
            await db.execute(
                update(job_model)
                .where(job_model.job_no == run.job_no)
                .values(
                    status=status.value,
                    finished_at=now,
                    result_json=result.model_dump(mode="json") if result else None,
                )
            )
            if result is not None and result.output_count:
                await online_usage_service.consume_in_session(
                    db,
                    user_id=run.user_id,
                    records=result.output_count,
                    request_id=run.job_no,
                )
            await db.commit()
        run.status = status.value
        run.finished_at = now
        run.error_code = error_code
        return True


export_job_service = ExportJobService()
