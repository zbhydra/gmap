"""Run 是执行与文件进度真源，和所属 Job 使用同一 owner 槽。"""

from typing import ClassVar

from sqlalchemy import CHAR, JSON, BigInteger, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.export import EXPORT_SHARD_COUNT, ExportRunStatus
from app.models.base import BaseDBModel
from app.schemas.export_run_schema import ExportRunCheckpoint
from app.utils.time import timestamp_now


class ExportRunModel(BaseDBModel):
    __abstract__ = True
    __tablename__: ClassVar[str]

    run_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="分表内部执行 ID"
    )
    run_no: Mapped[str] = mapped_column(
        CHAR(34), nullable=False, comment="唯一执行编号"
    )
    job_no: Mapped[str] = mapped_column(
        CHAR(34), nullable=False, comment="所属 Job；一 Job 一 Run"
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="所属登录用户"
    )
    node_name: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="执行节点，重启恢复仍属于该节点"
    )
    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=ExportRunStatus.QUEUED.value,
        comment="10排队20采集30发布40成功50局部成功60失败",
    )
    checkpoint_seq: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="共同提交的 CSV 检查点序号"
    )
    checkpoint_json: Mapped[dict[str, object]] = mapped_column(
        JSON, nullable=False, comment="ExportRunCheckpoint：字节边界与逐项交付事实"
    )
    prepared_result_json: Mapped[dict[str, object] | None] = mapped_column(
        JSON(none_as_null=True),
        nullable=True,
        comment="发布前固定的对象 key、hash、行数和列",
    )
    error_code: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment="本地化失败业务码"
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=timestamp_now,
        comment="接受时间（毫秒时间戳）",
    )
    started_at: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, comment="首次开始时间（毫秒时间戳）；重启不刷新"
    )
    finished_at: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, comment="终态时间（毫秒时间戳）"
    )

    @staticmethod
    def model_for_user(user_id: int) -> type["ExportRunModel"]:
        return EXPORT_RUN_MODELS[user_id % EXPORT_SHARD_COUNT]

    @property
    def checkpoint(self) -> ExportRunCheckpoint:
        return ExportRunCheckpoint.model_validate(self.checkpoint_json)


EXPORT_RUN_MODELS: tuple[type[ExportRunModel], ...] = tuple(
    type(
        f"ExportRun{slot:02d}Model",
        (ExportRunModel,),
        {
            "__module__": __name__,
            "__tablename__": f"export_runs_{slot:02d}",
            "__table_args__": (
                UniqueConstraint("run_no", name=f"uk_export_runs_{slot:02d}_run_no"),
                UniqueConstraint("job_no", name=f"uk_export_runs_{slot:02d}_job_no"),
                # 启动只发现本节点活动 Run，并按主键分批入队。
                Index(f"idx_export_runs_{slot:02d}_node_status", "node_name", "status"),
            ),
        },
    )
    for slot in range(EXPORT_SHARD_COUNT)
)
