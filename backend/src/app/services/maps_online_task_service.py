"""Online 任务事务、进程内执行与启动恢复。"""

import asyncio
import traceback
from collections.abc import Coroutine, Sequence
from pathlib import Path
from time import perf_counter
from typing import Literal, cast
from uuid import uuid4

from sqlalchemy import Select, func, select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.exc import SQLAlchemyError

from app.constants.maps_online import TASK_TIMEOUT_SECONDS
from app.core.config import settings
from app.core.database import get_async_session
from app.models.maps_online_task_item_model import (
    MapsOnlineTaskItemModel,
    get_item_model,
)
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.i18n.translator import translator
from app.provider.maps_online import MapsOnlineProvider
from app.provider.gmap.types import GmapConfigurationError
from app.schemas.admin_schema import ObjectStorageItem
from app.services.gosom_api_service import gosom_api_service
from app.services.maps_engine_service import maps_engine_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.usage_service import online_usage_service, usage_identity
from app.utils.feishu_utils import send_feishu_alarm
from app.utils.logger import logger
from app.utils.time import timestamp_now


class MapsOnlineTaskService:
    def __init__(self) -> None:
        self._tasks: set[asyncio.Task[None]] = set()

    async def create_task(
        self,
        *,
        user_id: int,
        keywords: Sequence[str],
        provider: Literal["http", "gosom"],
        storage_id: str,
        include_contacts: bool,
    ) -> tuple[MapsOnlineTaskModel, list[MapsOnlineTaskItemModel]]:
        """关键词由入口清洗和限量；事务提交后启动 items 并立即返回。"""
        started = perf_counter()
        async with get_async_session() as db:
            task = MapsOnlineTaskModel(  # type: ignore[call-arg]
                task_no=uuid4().hex,
                user_id=user_id,
                app_name=settings.app.name,
                provider=provider,
                storage_id=storage_id,
                include_contacts=include_contacts,
                total_count=len(keywords),
            )
            db.add(task)
            await db.flush()
            item_model = get_item_model(task.id)
            items = [
                item_model(  # type: ignore[call-arg]
                    task_id=task.id, sequence=sequence, keyword=keyword
                )
                for sequence, keyword in enumerate(keywords, start=1)
            ]
            db.add_all(items)
            await db.commit()
        logger.info(
            "maps_online.create: task=%s stage=persist duration_ms=%.2f items=%s",
            task.task_no,
            (perf_counter() - started) * 1000,
            len(items),
        )
        for item in items:
            self._start(self._run_item(task, item))
        return task, items

    def _start(self, coroutine: Coroutine[object, object, None]) -> None:
        background = asyncio.create_task(coroutine)
        self._tasks.add(background)
        background.add_done_callback(self._tasks.discard)

    async def close(self) -> None:
        tasks = tuple(self._tasks)
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)

    async def recover(self) -> None:
        """business 启动时仅扫描一次本 APP_NAME，沿用父任务原采集期限。"""
        for task in await self.task_lists(
            completed_at=0, app_name=settings.app.name, limit=None
        ):
            if task.processed_count == task.total_count:
                self._start(self.complete_task(task.id))
            else:
                for item in await self.item_lists(task.id, completed_at=0):
                    self._start(self._run_item(task, item))

    async def _run_item(
        self, task: MapsOnlineTaskModel, item: MapsOnlineTaskItemModel
    ) -> None:
        status: Literal["success", "failed"] = "failed"
        record_count = 0
        object_key = None
        deadline = task.created_at + TASK_TIMEOUT_SECONDS * 1000
        started = perf_counter()
        try:
            if timestamp_now() >= deadline:
                raise TimeoutError
            storage = await object_storage_config_service.get_item(task.storage_id)
            if storage is None:
                raise GmapConfigurationError(
                    f"maps_online._run_item: 存储配置不存在 storage_id={task.storage_id}"
                )
            engine = await maps_engine_service.get_config()
            engine = engine.model_copy(update={"provider": task.provider})
            gosom = await gosom_api_service.pick() if task.provider == "gosom" else None
            provider = MapsOnlineProvider(engine, storage, gosom)
            logger.info(
                "maps_online.run: task=%s item=%s stage=prepare duration_ms=%.2f",
                task.task_no,
                item.id,
                (perf_counter() - started) * 1000,
            )
            remaining = (deadline - timestamp_now()) / 1000
            if remaining <= 0:
                raise TimeoutError
            async with asyncio.timeout(remaining):
                record_count, object_key, status_text = await provider.execute(
                    item.keyword,
                    created_at=task.created_at,
                    task_no=task.task_no,
                    item_id=item.id,
                    include_contacts=task.include_contacts,
                )
            status = "success"
        except Exception as exc:
            status_text = f"采集失败 error={type(exc).__name__}"
            self._log_failure("_run_item", task.task_no, item.id, exc)
        await self._report_and_complete(
            task, item.id, status, record_count, object_key, status_text
        )

    async def _report_and_complete(
        self,
        task: MapsOnlineTaskModel,
        item_id: int,
        status: Literal["success", "failed"],
        record_count: int,
        object_key: str | None,
        status_text: str,
    ) -> None:
        started = perf_counter()
        for attempt in range(1, 4):
            try:
                await self.report_item(
                    task.id, item_id, status, record_count, object_key, status_text
                )
                break
            except SQLAlchemyError as exc:
                self._log_failure("report_item", task.task_no, item_id, exc)
                if attempt == 3:
                    await send_feishu_alarm(
                        title=translator.translate("maps_online.report_alarm_title"),
                        content=translator.translate(
                            "maps_online.report_alarm_content",
                            task_no=task.task_no,
                            item_id=item_id,
                            attempts=attempt,
                            error=type(exc).__name__,
                        ),
                        dedup_key=f"maps_online_report:{task.id}:{item_id}",
                    )
                    return
                await asyncio.sleep(5)
        logger.info(
            "maps_online.report: task=%s item=%s stage=report duration_ms=%.2f status=%s",
            task.task_no,
            item_id,
            (perf_counter() - started) * 1000,
            status,
        )
        # CAS 0 也要完成父任务，覆盖数据库已提交但响应丢失后的重放。
        await self.complete_task(task.id)

    async def complete_task(self, task_id: int) -> None:
        """最终计量与父终态独立重试，不受采集期限限制；关闭取消直接传播。"""
        started = perf_counter()
        while True:
            try:
                task = await self.task_info(task_id)
                if (
                    task is None
                    or task.completed_at
                    or task.processed_count != task.total_count
                ):
                    return
                if task.record_count:
                    await online_usage_service.consume(
                        usage_identity(task.user_id, None),
                        user_id=task.user_id,
                        records=task.record_count,
                        request_id=task.task_no,
                    )
                async with get_async_session() as db:
                    await db.execute(
                        update(MapsOnlineTaskModel)
                        .where(
                            MapsOnlineTaskModel.id == task_id,
                            MapsOnlineTaskModel.completed_at == 0,
                            MapsOnlineTaskModel.processed_count
                            == MapsOnlineTaskModel.total_count,
                        )
                        .values(completed_at=timestamp_now())
                    )
                    await db.commit()
                logger.info(
                    "maps_online.complete: task=%s stage=meter_complete duration_ms=%.2f records=%s",
                    task.task_no,
                    (perf_counter() - started) * 1000,
                    task.record_count,
                )
                return
            except Exception as exc:
                self._log_failure("complete_task", str(task_id), None, exc)
                await asyncio.sleep(5)

    @staticmethod
    def _log_failure(
        operation: str, task_no: str, item_id: int | None, exc: Exception
    ) -> None:
        # 原始异常消息及 cause 可能包含 SQL 参数或上游凭据，只保留类型和原栈帧。
        logger.error(
            "maps_online_task_service.%s: task=%s item_id=%s error=%s\n%s",
            operation,
            task_no,
            item_id,
            type(exc).__name__,
            "".join(traceback.format_tb(exc.__traceback__)),
        )

    @staticmethod
    def _apply_task_filters(
        stmt: Select[tuple[MapsOnlineTaskModel]],
        *,
        task_id: int | None = None,
        task_no: str | None = None,
        user_id: int | None = None,
        app_name: str | None = None,
        completed_at: int | None = None,
    ) -> Select[tuple[MapsOnlineTaskModel]]:
        if completed_at is not None:
            stmt = stmt.where(MapsOnlineTaskModel.completed_at == completed_at)
        if app_name is not None:
            stmt = stmt.where(MapsOnlineTaskModel.app_name == app_name)
        if task_id is not None:
            stmt = stmt.where(MapsOnlineTaskModel.id == task_id)
        if task_no is not None:
            stmt = stmt.where(MapsOnlineTaskModel.task_no == task_no)
        if user_id is not None:
            stmt = stmt.where(MapsOnlineTaskModel.user_id == user_id)
        return stmt

    async def task_lists(
        self,
        *,
        task_id: int | None = None,
        task_no: str | None = None,
        user_id: int | None = None,
        app_name: str | None = None,
        completed_at: int | None = None,
        offset: int = 0,
        limit: int | None = 20,
    ) -> list[MapsOnlineTaskModel]:
        """用户列表按 id 倒序；启动恢复传 completed_at=0、app_name、limit=None。"""
        stmt = self._apply_task_filters(
            select(MapsOnlineTaskModel),
            task_id=task_id,
            task_no=task_no,
            user_id=user_id,
            app_name=app_name,
            completed_at=completed_at,
        )
        async with get_async_session() as db:
            result = await db.scalars(
                stmt.order_by(MapsOnlineTaskModel.id.desc()).offset(offset).limit(limit)
            )
            return list(result.all())

    async def count_tasks(self, *, user_id: int) -> int:
        stmt = self._apply_task_filters(select(MapsOnlineTaskModel), user_id=user_id)
        async with get_async_session() as db:
            result = await db.execute(
                stmt.with_only_columns(func.count(), maintain_column_froms=True)
            )
            return int(result.scalar_one())

    async def task_info(
        self,
        task_id: int | None = None,
        *,
        task_no: str | None = None,
        user_id: int | None = None,
    ) -> MapsOnlineTaskModel | None:
        tasks = await self.task_lists(
            task_id=task_id, task_no=task_no, user_id=user_id, limit=1
        )
        return tasks[0] if tasks else None

    async def item_lists(
        self,
        task_id: int,
        *,
        item_id: int | None = None,
        completed_at: int | None = None,
    ) -> list[MapsOnlineTaskItemModel]:
        item_model = get_item_model(task_id)
        stmt = select(item_model).where(item_model.task_id == task_id)
        if item_id is not None:
            stmt = stmt.where(item_model.id == item_id)
        if completed_at is not None:
            stmt = stmt.where(item_model.completed_at == completed_at)
        async with get_async_session() as db:
            result = await db.scalars(stmt.order_by(item_model.sequence))
            return list(result.all())

    async def item_info(
        self, task_id: int, item_id: int
    ) -> MapsOnlineTaskItemModel | None:
        items = await self.item_lists(task_id, item_id=item_id)
        return items[0] if items else None

    @staticmethod
    async def _download_storage(task: MapsOnlineTaskModel) -> ObjectStorageItem:
        storage = await object_storage_config_service.get_item(task.storage_id)
        if storage is None:
            raise FileNotFoundError(
                f"maps_online.download: 存储配置已删除 task_no={task.task_no}"
            )
        return storage

    async def sign_download(
        self, task: MapsOnlineTaskModel, *, item_id: int, keyword: str, object_key: str
    ) -> tuple[str, str]:
        storage = await self._download_storage(task)
        return await MapsOnlineProvider.sign_download(
            storage, item_id=item_id, keyword=keyword, object_key=object_key
        )

    async def download_zip(
        self,
        task: MapsOnlineTaskModel,
        files: Sequence[tuple[int, str, str]],
        directory: Path,
    ) -> Path:
        storage = await self._download_storage(task)
        return await MapsOnlineProvider.download_zip(storage, files, directory)

    @staticmethod
    async def report_item(
        task_id: int,
        item_id: int,
        status: Literal["success", "failed"],
        record_count: int,
        object_key: str | None,
        status_text: str,
    ) -> bool:
        """首次报告返回 True；幂等命中返回 False，数据库异常由执行协程重试。"""
        item_model = get_item_model(task_id)
        async with get_async_session() as db:
            result = await db.execute(
                update(item_model)
                .where(item_model.id == item_id, item_model.completed_at == 0)
                .values(
                    object_key=object_key,
                    record_count=record_count,
                    error=status_text or None,
                    completed_at=timestamp_now(),
                )
            )
            applied = cast(CursorResult[object], result).rowcount == 1
            if applied:
                await db.execute(
                    update(MapsOnlineTaskModel)
                    .where(MapsOnlineTaskModel.id == task_id)
                    .values(
                        processed_count=MapsOnlineTaskModel.processed_count + 1,
                        record_count=MapsOnlineTaskModel.record_count + record_count,
                        error_item_count=MapsOnlineTaskModel.error_item_count
                        + int(status == "failed"),
                    )
                )
            await db.commit()
            return applied


maps_online_task_service = MapsOnlineTaskService()
