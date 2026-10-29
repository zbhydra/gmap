"""API/MCP 同步调用记录；与 Online 同样按登录 owner 分表，编号末两位即槽号。"""

from typing import ClassVar
from uuid import uuid4

from sqlalchemy import CHAR, JSON, BigInteger, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.export import EXPORT_SHARD_COUNT, ExportRunStatus
from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class ExportApiJobModel(BaseDBModel):
    __abstract__ = True
    __tablename__: ClassVar[str]

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="分表内自增主键"
    )
    request_id: Mapped[str] = mapped_column(
        CHAR(34),
        nullable=False,
        comment="UUID hex 与两位 owner 槽号；同时作为 Collector 与用量请求键",
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="所属登录用户"
    )
    source: Mapped[int] = mapped_column(Integer, nullable=False, comment="2API 3MCP")
    operation: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="1搜索2评论3照片"
    )
    status: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=ExportRunStatus.COLLECTING.value,
        comment="20处理中40成功50局部成功60失败",
    )
    params_json: Mapped[dict[str, object]] = mapped_column(
        JSON, nullable=False, comment="已校验的业务参数"
    )
    summary_json: Mapped[dict[str, object] | None] = mapped_column(
        JSON(none_as_null=True),
        nullable=True,
        comment="有效结果的终态摘要；处理中与失败为 null",
    )
    error_code: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment="失败业务码"
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=timestamp_now,
        comment="业务执行开始时间（毫秒时间戳）",
    )
    finished_at: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, comment="终态时间（毫秒时间戳）"
    )

    @staticmethod
    def generate_no(user_id: int) -> str:
        return f"{uuid4().hex}{user_id % EXPORT_SHARD_COUNT:02d}"

    @staticmethod
    def model_for_user(user_id: int) -> type["ExportApiJobModel"]:
        return EXPORT_API_JOB_MODELS[user_id % EXPORT_SHARD_COUNT]


EXPORT_API_JOB_MODELS: tuple[type[ExportApiJobModel], ...] = tuple(
    type(
        f"ExportApiJob{slot:02d}Model",
        (ExportApiJobModel,),
        {
            "__module__": __name__,
            "__tablename__": f"export_api_jobs_{slot:02d}",
            "__table_args__": (
                # 后台详情按请求编号精确定位；后台筛选低频，不另建索引。
                UniqueConstraint(
                    "request_id", name=f"uk_export_api_jobs_{slot:02d}_request_id"
                ),
            ),
        },
    )
    for slot in range(EXPORT_SHARD_COUNT)
)
