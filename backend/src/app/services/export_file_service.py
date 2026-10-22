"""CAS Google Export 的单 CSV 检查点与同节点锁；不承担发布重试。"""

import asyncio
import csv
import errno
import fcntl
import hashlib
import os
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from io import IOBase, StringIO
from pathlib import Path
from typing import Literal, ParamSpec, TextIO, TypeVar

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings
from app.provider.export.export_base import ExportCellValue, ExportColumn
from app.provider.export.gmap_columns import gmap_identity
from app.schemas.gmap_collector_schema import GmapCollectorInstance

FileArgs = ParamSpec("FileArgs")
FileResult = TypeVar("FileResult")
CollectorOperation = Literal["search_item", "enrich_sites"]


class ExportFileError(RuntimeError):
    """本地工作文件或定位无效。"""


class ExportCheckpointError(ExportFileError):
    """数据库确认的文件边界无法由工作文件证明。"""


class CollectorCallLocation(BaseModel):
    task_id: str = Field(pattern=r"^[0-9a-f]{32}$")
    collector_url: str

    @field_validator("collector_url")
    @classmethod
    def normalize_url(cls, value: str) -> str:
        return GmapCollectorInstance.normalize_url(value)


@dataclass(slots=True)
class ExportCsvFile:
    path: Path
    handle: TextIO
    column_count: int
    closed: bool = False


class ExportFileService:
    @staticmethod
    async def run_io(
        operation: Callable[FileArgs, FileResult],
        /,
        *args: FileArgs.args,
        **kwargs: FileArgs.kwargs,
    ) -> FileResult:
        """取消不能把仍在写文件的线程留在锁外；先等 IO 完成再释放执行权。"""
        task = asyncio.create_task(asyncio.to_thread(operation, *args, **kwargs))
        try:
            return await asyncio.shield(task)
        except asyncio.CancelledError:
            # 重复取消也不能中止对实际线程的等待。
            while not task.done():
                try:
                    await asyncio.shield(task)
                except asyncio.CancelledError:
                    continue
            result = task.result()
            if (
                isinstance(result, tuple)
                and result
                and isinstance(result[0], ExportCsvFile)
            ):
                export_file_service.close_csv(result[0])
            elif isinstance(result, IOBase):
                result.close()
            raise

    @property
    def work_root(self) -> Path:
        """返回发版保留的固定导出工作目录（backend 项目根下 data/export-work）。"""

        return Path(settings.root_path) / "data" / "export-work"

    @contextmanager
    def job_lock(self, *, job_no: str) -> Iterator[bool]:
        """同节点进程共享非阻塞 flock；固定锁文件不删除，以免产生两个 inode。"""
        directory = self.work_root / ".locks"
        directory.mkdir(parents=True, exist_ok=True)
        with (directory / f"{job_no}.lock").open("a+b") as handle:
            try:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError as exc:
                if exc.errno not in {errno.EACCES, errno.EAGAIN}:
                    raise
                yield False
                return
            try:
                yield True
            finally:
                fcntl.flock(handle.fileno(), fcntl.LOCK_UN)

    def run_path(
        self,
        *,
        job_no: str,
        run_no: str,
        name: Literal["increment.csv", "prepared.csv"],
    ) -> Path:
        """未发布数据只属于当前 Run，不能作为其他轮次的基线。"""
        return self.work_root / job_no / run_no / name

    @staticmethod
    def restore_committed_csv(*, path: Path, size_bytes: int) -> None:
        """只承认数据库提交边界；缺失内容不能新建空文件冒充。"""
        if not path.exists():
            if size_bytes:
                raise ExportCheckpointError("export_file: committed CSV missing")
            return
        if path.stat().st_size < size_bytes:
            raise ExportCheckpointError("export_file: committed CSV truncated")
        with path.open("r+b") as handle:
            handle.truncate(size_bytes)
            handle.flush()
            os.fsync(handle.fileno())
        if size_bytes == 0:
            path.unlink()

    @staticmethod
    def sync_csv(csv_file: ExportCsvFile) -> int:
        """先同步文件和目录，再允许提交数据库检查点。"""
        csv_file.handle.flush()
        os.fsync(csv_file.handle.fileno())
        ExportFileService.sync_directory(csv_file.path.parent)
        return os.fstat(csv_file.handle.fileno()).st_size

    @staticmethod
    def sync_directory(path: Path) -> None:
        descriptor = os.open(path, os.O_RDONLY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)

    def _create_work_directory(self, path: Path) -> None:
        """新建目录的父链接同步到节点工作根，文件 fsync 不代替目录持久化。"""
        path.mkdir(parents=True, exist_ok=True)
        for parent in (path, *path.parents):
            self.sync_directory(parent)
            if parent == Path(settings.root_path):
                break

    def open_run_csv(
        self,
        *,
        job_no: str,
        run_no: str,
        columns: tuple[ExportColumn, ...],
        stable_record_id_column: str,
        gmap_item_counts: list[int],
    ) -> tuple[ExportCsvFile, int, set[str]]:
        return self._open_or_create_csv(
            path=self.run_path(job_no=job_no, run_no=run_no, name="increment.csv"),
            job_no=job_no,
            columns=columns,
            stable_record_id_column=stable_record_id_column,
            gmap_item_counts=gmap_item_counts,
        )

    def project_gmap_csv(
        self,
        *,
        job_no: str,
        run_no: str,
        work_columns: tuple[ExportColumn, ...],
        public_columns: tuple[ExportColumn, ...],
        descriptions: tuple[str, ...],
    ) -> Path:
        """从已提交工作文件生成固定公开产物，工作文件仍用于恢复。"""
        increment = self.run_path(job_no=job_no, run_no=run_no, name="increment.csv")
        prepared = self.run_path(job_no=job_no, run_no=run_no, name="prepared.csv")
        if len(descriptions) != len(public_columns):
            raise ExportFileError("export_file: gmap description width mismatch")
        with (
            increment.open("r", encoding="utf-8-sig", newline="") as source,
            prepared.open("w", encoding="utf-8-sig", newline="") as output,
        ):
            reader = csv.DictReader(source)
            if reader.fieldnames != [column.header for column in work_columns]:
                raise ExportFileError("export_file: gmap work header mismatch")
            writer = csv.writer(output, lineterminator="\n")
            writer.writerow([column.header for column in public_columns])
            writer.writerow(descriptions)
            for index, row in enumerate(reader, 1):
                if None in row or any(value is None for value in row.values()):
                    raise ExportFileError("export_file: malformed gmap work row")
                writer.writerow(
                    [index, *(row[column.key] for column in public_columns[1:])]
                )
            output.flush()
            os.fsync(output.fileno())
        self.sync_directory(prepared.parent)
        return prepared

    @staticmethod
    def content_hash(path: Path) -> str:
        with path.open("rb") as source:
            return hashlib.file_digest(source, "sha256").hexdigest()

    def read_csv_facts(
        self,
        *,
        path: Path,
        job_no: str,
        columns: tuple[ExportColumn, ...],
        stable_record_id_column: str,
        gmap_item_counts: list[int],
    ) -> tuple[int, set[str]]:
        """校验 CSV，返回数据行数与身份；GMap 同一扫描恢复分项行数。"""

        headers = tuple(column.header for column in columns)
        stable_header = next(
            column.header for column in columns if column.key == stable_record_id_column
        )
        with path.open("r", encoding="utf-8-sig", newline="") as source:
            reader = csv.reader(source)
            actual_headers = tuple(next(reader))
            if actual_headers != headers:
                raise ExportFileError(
                    f"export_file.read_csv_facts: CSV header mismatch job_no={job_no}"
                )
            stable_index = actual_headers.index(stable_header)
            item_index = actual_headers.index("item_index")
            place_index = actual_headers.index("place_id")
            fid_index = actual_headers.index("fid")
            count = 0
            stable_ids: set[str] = set()
            # 整 Job 最多 50 × 200 行，内存身份集合受既有采样预算约束。
            for row in reader:
                if len(row) != len(actual_headers) or not row[stable_index]:
                    raise ExportFileError(
                        "export_file: malformed row or missing stable ID"
                    )
                count += 1
                identity = gmap_identity(row[place_index], row[fid_index])
                if not identity or identity in stable_ids:
                    raise ExportFileError(
                        "export_file: invalid or duplicate gmap identity"
                    )
                try:
                    index = int(row[item_index])
                except ValueError as exc:
                    raise ExportFileError(
                        "export_file: invalid gmap item index"
                    ) from exc
                if not 0 <= index < len(gmap_item_counts):
                    raise ExportFileError("export_file: invalid gmap item index")
                gmap_item_counts[index] += 1
                stable_ids.add(identity)
        return count, stable_ids

    def _open_or_create_csv(
        self,
        *,
        path: Path,
        job_no: str,
        columns: tuple[ExportColumn, ...],
        stable_record_id_column: str,
        gmap_item_counts: list[int],
    ) -> tuple[ExportCsvFile, int, set[str]]:
        """复用现有 CSV 或创建新文件，并恢复已提交身份集合。"""

        if not path.is_file():
            return (
                self._create_csv_at(
                    path=path,
                    job_no=job_no,
                    columns=columns,
                ),
                0,
                set(),
            )
        row_count, stable_ids = self.read_csv_facts(
            path=path,
            job_no=job_no,
            columns=columns,
            stable_record_id_column=stable_record_id_column,
            gmap_item_counts=gmap_item_counts,
        )
        handle = path.open("a", encoding="utf-8", newline="")
        return (
            ExportCsvFile(
                path=path,
                handle=handle,
                column_count=len(columns),
            ),
            row_count,
            stable_ids,
        )

    def _create_csv_at(
        self,
        *,
        path: Path,
        job_no: str,
        columns: tuple[ExportColumn, ...],
    ) -> ExportCsvFile:
        """新建指定用途的 CSV，并写一次 BOM 与表头。"""

        self._create_work_directory(path.parent)
        path.unlink(missing_ok=True)
        handle = path.open("w", encoding="utf-8-sig", newline="")
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(tuple(column.header for column in columns))
        handle.flush()
        return ExportCsvFile(path=path, handle=handle, column_count=len(columns))

    def append_rows(
        self,
        csv_file: ExportCsvFile,
        rows: tuple[tuple[ExportCellValue, ...], ...],
    ) -> None:
        """在内存格式化整页，再对文件执行一次 write 和 flush。"""

        buffer = StringIO(newline="")
        writer = csv.writer(buffer, lineterminator="\n")
        for row in rows:
            if len(row) != csv_file.column_count:
                raise ExportFileError(
                    "export_file_service.append_rows: Provider row width mismatch: "
                    f"path={csv_file.path.name}, expected={csv_file.column_count}, "
                    f"actual={len(row)}"
                )
            writer.writerow(row)
        csv_file.handle.write(buffer.getvalue())
        csv_file.handle.flush()

    def close_csv(self, csv_file: ExportCsvFile) -> None:
        """关闭当前 CSV；重复关闭不产生第二套状态。"""

        if csv_file.closed:
            return
        csv_file.handle.close()
        csv_file.closed = True

    @staticmethod
    def file_size(path: Path) -> int:
        """返回完整 CSV 字节数。"""

        return path.stat().st_size

    def collector_path(
        self,
        *,
        job_no: str,
        run_no: str,
        item_index: int,
        operation: CollectorOperation,
    ) -> Path:
        return (
            self.work_root
            / job_no
            / run_no
            / "collector"
            / str(item_index)
            / f"{operation}.json"
        )

    def read_collector_call(
        self,
        *,
        job_no: str,
        run_no: str,
        item_index: int,
        operation: CollectorOperation,
    ) -> CollectorCallLocation | None:
        path = self.collector_path(
            job_no=job_no, run_no=run_no, item_index=item_index, operation=operation
        )
        try:
            data = path.read_bytes()
        except FileNotFoundError:
            return None
        # 损坏不是尚未提交，不能清除定位后重采。
        return CollectorCallLocation.model_validate_json(data)

    def save_collector_call(
        self,
        *,
        job_no: str,
        run_no: str,
        item_index: int,
        operation: CollectorOperation,
        location: CollectorCallLocation,
    ) -> None:
        path = self.collector_path(
            job_no=job_no, run_no=run_no, item_index=item_index, operation=operation
        )
        self._create_work_directory(path.parent)
        temporary = path.with_suffix(".tmp")
        with temporary.open("w", encoding="utf-8") as handle:
            handle.write(location.model_dump_json())
            handle.flush()
            os.fsync(handle.fileno())
        temporary.replace(path)
        self.sync_directory(path.parent)


export_file_service = ExportFileService()
