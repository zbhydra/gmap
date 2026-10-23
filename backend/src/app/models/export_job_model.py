"""按登录 owner 分表；公开编号沿 CAS 编码 UUID 与两位槽号。"""

from typing import ClassVar
from uuid import uuid4

from sqlalchemy import (
    CHAR,
    JSON,
    BigInteger,
    Boolean,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.mysql import MEDIUMTEXT
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.export import EXPORT_SHARD_COUNT, ExportRunStatus
from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class ExportJobModel(BaseDBModel):
    __abstract__ = True
    __tablename__: ClassVar[str]

    job_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="分表内部任务 ID"
    )
    job_no: Mapped[str] = mapped_column(
        CHAR(34), nullable=False, comment="UUID hex 与两位 owner 槽号"
    )
    run_no: Mapped[str] = mapped_column(
        CHAR(34), nullable=False, comment="本 Job 唯一 Run 编号"
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="所属登录用户"
    )
    options_json: Mapped[dict[str, object]] = mapped_column(
        JSON, nullable=False, comment="搜索项与 CSV 语言快照"
    )
    keywords_text: Mapped[str] = mapped_column(
        MEDIUMTEXT,
        nullable=False,
        comment="去重关键词按输入顺序换行连接，供本人历史搜索",
    )
    include_contacts: Mapped[bool] = mapped_column(
        Boolean, nullable=False, comment="创建时按套餐固定的补全权益"
    )
    storage_id: Mapped[str] = mapped_column(
        String(36), nullable=False, comment="创建时固定对象存储配置 ID"
    )
    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=ExportRunStatus.QUEUED.value,
        comment="与唯一 Run 共同提交的状态",
    )
    result_json: Mapped[dict[str, object] | None] = mapped_column(
        JSON(none_as_null=True), nullable=True, comment="仅发布事务成功后可下载的产物"
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=timestamp_now,
        comment="创建时间（毫秒时间戳）",
    )
    finished_at: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, comment="终态时间（毫秒时间戳）"
    )

    @staticmethod
    def generate_no(user_id: int) -> str:
        return f"{uuid4().hex}{user_id % EXPORT_SHARD_COUNT:02d}"

    @staticmethod
    def model_for_user(user_id: int) -> type["ExportJobModel"]:
        return EXPORT_JOB_MODELS[user_id % EXPORT_SHARD_COUNT]


EXPORT_JOB_MODELS: tuple[type[ExportJobModel], ...] = tuple(
    type(
        f"ExportJob{slot:02d}Model",
        (ExportJobModel,),
        {
            "__module__": __name__,
            "__tablename__": f"export_jobs_{slot:02d}",
            "__table_args__": (
                UniqueConstraint("job_no", name=f"uk_export_jobs_{slot:02d}_job_no"),
                # 本人历史按 job_id 倒序，InnoDB 二级索引自带主键。
                Index(f"idx_export_jobs_{slot:02d}_user_id", "user_id"),
            ),
        },
    )
    for slot in range(EXPORT_SHARD_COUNT)
)
