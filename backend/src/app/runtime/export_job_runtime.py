"""CAS Google Runtime：同节点文件锁、逐 item 检查点与一次发布收口。"""

import asyncio
from contextlib import aclosing
from dataclasses import dataclass

from app.constants.export import (
    EXPORT_ACTIVE_STATUSES,
    EXPORT_TIMEOUT_SECONDS,
    ExportRunStatus,
)
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.export_job_model import ExportJobModel
from app.models.export_run_model import ExportRunModel
from app.provider.export.export_base import ExportProviderRequest
from app.provider.export.gmap_columns import (
    GMAP_DESCRIPTIONS,
    GMAP_PUBLIC_COLUMNS,
    gmap_identity,
)
from app.provider.export.gmap_export import gmap_export_provider
from app.schemas.export_item_schema import ExportItemResult, GmapSearchOptions
from app.schemas.export_run_schema import ExportRunResult
from app.services.export_file_service import (
    ExportCheckpointError,
    ExportCsvFile,
    export_file_service,
)
from app.services.export_job_service import export_job_service
from app.services.object_storage_config_service import object_storage_config_service
from app.utils import object_storage
from app.utils.logger import logger
from app.utils.time import timestamp_now


@dataclass(frozen=True)
class ExportRunRef:
    user_id: int
    job_no: str
    run_no: str


class ExportJobRuntime:
    def __init__(self) -> None:
        self._queue: asyncio.Queue[ExportRunRef] = asyncio.Queue(
            maxsize=settings.app.export_queue_limit
        )
        self._tasks: dict[ExportRunRef, asyncio.Task[None] | None] = {}
        self._slots = asyncio.BoundedSemaphore(settings.app.export_run_concurrency)
        self._dispatcher_task: asyncio.Task[None] | None = None
        self._discovery_task: asyncio.Task[None] | None = None
        self._running = False

    def require_ready(self) -> None:
        if not self._running or self._queue.full():
            raise AppCommonException(
                CommonCode.EXPORT_REQUEST_RETRY,
                ext_msg="export_runtime: 本节点队列不可接受新任务",
            )

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._dispatcher_task = asyncio.create_task(
            self._dispatch(), name="export-dispatcher"
        )
        # 启动只创建调度协程；发现和有界入队不会阻塞 FastAPI 就绪。
        self._discovery_task = asyncio.create_task(
            self._discover(), name="export-discovery"
        )

    async def _discover(self) -> None:
        try:
            async for run in export_job_service.discover_runtime_runs():
                await self.enqueue(
                    ExportRunRef(run.user_id, run.job_no, run.run_no),
                    wait_for_space=True,
                )
        except Exception:
            logger.error(
                "export_runtime: 本节点恢复发现失败 node=%s",
                settings.app.name,
                exc_info=True,
            )

    async def stop(self) -> None:
        self._running = False
        supervisors = [
            task
            for task in (self._discovery_task, self._dispatcher_task)
            if task is not None
        ]
        for task in supervisors:
            task.cancel()
        await asyncio.gather(*supervisors, return_exceptions=True)
        tasks = [task for task in self._tasks.values() if task is not None]
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        while not self._queue.empty():
            self._queue.get_nowait()
            self._queue.task_done()
        self._tasks.clear()
        self._discovery_task = self._dispatcher_task = None

    async def enqueue(self, ref: ExportRunRef, *, wait_for_space: bool = False) -> bool:
        if ref in self._tasks:
            return True
        if not self._running or (self._queue.full() and not wait_for_space):
            return False
        self._tasks[ref] = None
        if wait_for_space:
            await self._queue.put(ref)
        else:
            self._queue.put_nowait(ref)
        return True

    async def wake_job(self, run: ExportRunModel) -> None:
        if run.node_name == settings.app.name and run.status in EXPORT_ACTIVE_STATUSES:
            await self.enqueue(ExportRunRef(run.user_id, run.job_no, run.run_no))

    async def _dispatch(self) -> None:
        while True:
            await self._slots.acquire()
            try:
                ref = await self._queue.get()
            except BaseException:
                self._slots.release()
                raise
            self._tasks[ref] = asyncio.create_task(
                self._run(ref), name=f"export-{ref.run_no}"
            )

    async def _run(self, ref: ExportRunRef) -> None:
        try:
            with export_file_service.job_lock(job_no=ref.job_no) as acquired:
                if not acquired:
                    return
                runs = await export_job_service.export_run_lists(
                    user_id=ref.user_id, job_nos=[ref.job_no]
                )
                job = await export_job_service.export_job_info(
                    user_id=ref.user_id, job_no=ref.job_no
                )
                if not runs or job is None:
                    return
                run = runs[0]
                if (
                    run.run_no != ref.run_no
                    or run.node_name != settings.app.name
                    or run.status not in EXPORT_ACTIVE_STATUSES
                ):
                    return
                if run.status == ExportRunStatus.PUBLISHING:
                    # 遗留发布只尝试一次失败收口，不能重传或重结算。
                    try:
                        await export_job_service.settle_run(
                            run,
                            status=ExportRunStatus.FAILED,
                            error_code=CommonCode.EXPORT_PUBLISH_FAILED.value,
                        )
                    except Exception:
                        logger.error(
                            "export_runtime: 遗留发布失败收口未持久化 run_no=%s",
                            ref.run_no,
                            exc_info=True,
                        )
                    return
                try:
                    if (
                        run.status == ExportRunStatus.QUEUED
                        and not await export_job_service.start_run(run)
                    ):
                        return
                    await self._collect(job, run)
                except Exception:
                    logger.error(
                        "export_runtime: 执行失败 job_no=%s run_no=%s",
                        ref.job_no,
                        ref.run_no,
                        exc_info=True,
                    )
                    try:
                        await export_job_service.settle_run(
                            run,
                            status=ExportRunStatus.FAILED,
                            error_code=(
                                CommonCode.EXPORT_PUBLISH_FAILED
                                if run.status == ExportRunStatus.PUBLISHING
                                else CommonCode.EXPORT_TARGET_FAILED
                            ).value,
                        )
                    except Exception:
                        logger.error(
                            "export_runtime: 一次失败收口未持久化 run_no=%s",
                            ref.run_no,
                            exc_info=True,
                        )
        except Exception:
            logger.error(
                "export_runtime: 无法读取执行 job_no=%s run_no=%s",
                ref.job_no,
                ref.run_no,
                exc_info=True,
            )
        finally:
            self._tasks.pop(ref, None)
            self._queue.task_done()
            self._slots.release()

    async def _collect(self, job: ExportJobModel, run: ExportRunModel) -> None:
        options = GmapSearchOptions.model_validate(job.options_json)
        assert run.started_at is not None
        deadline = (
            asyncio.get_running_loop().time()
            + (run.started_at + EXPORT_TIMEOUT_SECONDS * 1000 - timestamp_now()) / 1000
        )
        checkpoint = run.checkpoint
        request = ExportProviderRequest(
            job.job_no,
            run.run_no,
            options,
            job.include_contacts,
            deadline,
            checkpoint.item_results,
        )
        provider = gmap_export_provider
        columns = provider.source_columns + provider.columns
        headers = [column.header for column in columns]
        if checkpoint.columns and checkpoint.columns != headers:
            raise ExportCheckpointError(
                f"export_runtime: CSV 列与检查点不符 run_no={run.run_no}"
            )
        path = export_file_service.run_path(
            job_no=job.job_no, run_no=run.run_no, name="increment.csv"
        )
        await export_file_service.run_io(
            export_file_service.restore_committed_csv,
            path=path,
            size_bytes=checkpoint.csv_size_bytes,
        )
        item_counts = [0] * len(options.items)
        csv_file: ExportCsvFile | None = None
        try:
            csv_file, count, seen = await export_file_service.run_io(
                export_file_service.open_run_csv,
                job_no=job.job_no,
                run_no=run.run_no,
                columns=columns,
                stable_record_id_column="record_id",
                gmap_item_counts=item_counts,
            )
            if count != checkpoint.output_count or item_counts != [
                item.result_count for item in checkpoint.item_results
            ]:
                raise ExportCheckpointError(
                    f"export_runtime: CSV 行数与检查点不符 run_no={run.run_no}"
                )
            assert csv_file is not None
            items = provider.execution_items(request)
            async with aclosing(provider.start(request)) as stream:
                async for page in stream:
                    index = page.item_index
                    next_checkpoint = checkpoint.model_copy(deep=True)
                    new_rows = []
                    for record in page.records:
                        identity = gmap_identity(
                            str(record.get("place_id") or ""),
                            str(record.get("fid") or ""),
                        )
                        if identity not in seen:
                            seen.add(identity)
                            row = provider.record_to_row(record)
                            new_rows.append(
                                (
                                    f"{index}:{record['business_id']}",
                                    *items[index].source,
                                    *row,
                                )
                            )
                    await export_file_service.run_io(
                        export_file_service.append_rows, csv_file, tuple(new_rows)
                    )
                    next_checkpoint.csv_size_bytes = await export_file_service.run_io(
                        export_file_service.sync_csv, csv_file
                    )
                    next_checkpoint.columns = headers
                    next_checkpoint.output_count += len(new_rows)
                    next_checkpoint.item_results[index] = ExportItemResult(
                        item_index=index,
                        result_count=len(new_rows),
                        completed=True,
                        error_code=page.item_error_code,
                    )
                    await export_job_service.checkpoint_run(run, next_checkpoint)
                    checkpoint = next_checkpoint
        finally:
            if csv_file is not None:
                await export_file_service.run_io(
                    export_file_service.close_csv, csv_file
                )
        has_error = any(item.error_code is not None for item in checkpoint.item_results)
        if not checkpoint.output_count:
            await export_job_service.settle_run(
                run,
                status=(
                    ExportRunStatus.FAILED if has_error else ExportRunStatus.COMPLETED
                ),
                error_code=CommonCode.EXPORT_TARGET_FAILED.value if has_error else None,
            )
            return
        prepared = await export_file_service.run_io(
            export_file_service.project_gmap_csv,
            job_no=job.job_no,
            run_no=run.run_no,
            work_columns=columns,
            public_columns=GMAP_PUBLIC_COLUMNS,
            descriptions=GMAP_DESCRIPTIONS[options.export_locale],
        )
        result = ExportRunResult(
            object_key=object_storage.build_object_key(
                "maps-online", job.created_at, f"{job.job_no}/{run.run_no}.csv"
            ),
            size_bytes=await export_file_service.run_io(
                export_file_service.file_size, prepared
            ),
            output_count=checkpoint.output_count,
            sha256=await export_file_service.run_io(
                export_file_service.content_hash, prepared
            ),
            columns=[column.header for column in GMAP_PUBLIC_COLUMNS],
        )
        await export_job_service.prepare_run(run, result)
        storage = await object_storage_config_service.get_item(job.storage_id)
        if storage is None:
            raise RuntimeError(
                f"export_runtime: 对象存储配置已移除 job_no={job.job_no}"
            )
        await object_storage.upload_file(storage, result.object_key, prepared)
        await export_job_service.settle_run(
            run,
            status=ExportRunStatus.PARTIAL if has_error else ExportRunStatus.COMPLETED,
            result=result,
            error_code=CommonCode.EXPORT_PARTIAL_RESULT.value if has_error else None,
        )


export_job_runtime = ExportJobRuntime()
