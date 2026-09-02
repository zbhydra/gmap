"""用户用量流水的 MySQL 数据模型（额度基建）。"""

from sqlalchemy import BigInteger, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class UserUsageLogModel(BaseDBModel):
    """按「产品线 × 用户 × 请求键」唯一、只插入不可变的月度用量流水。

    纯插入合同：used = SUM(delta)（按 line + user + ym 聚合），无 update /
    delete 语义，不设 updated_at；幂等由唯一键承担，重放命中即跳过。
    """

    __tablename__ = "user_usage_logs"
    __table_args__ = (
        UniqueConstraint(
            "product_line",
            "user_id",
            "request_id",
            name="uk_user_usage_logs_line_user_request",
        ),  # usage_service 插入幂等（consume/refund 重放检测）
        Index(
            "idx_user_usage_logs_line_user_ym_delta",
            "product_line",
            "user_id",
            "ym",
            "delta",
        ),  # usage_service 月度 SUM(delta) 聚合覆盖索引
    )

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="记录 ID"
    )
    product_line: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        comment="产品线标识（maps_extension / maps_online / maps_api）",
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        comment="用户 ID（匿名设备走 Redis 不进表，恒大于 0）",
    )
    ym: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="业务时区自然月（YYYYMM；退回行 = 被修正量所属月）",
    )
    delta: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="用量变化（正数=消费，负数=退回）"
    )
    request_id: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="业务幂等键（如插件采集会话 UUID、云端任务批次键）",
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=timestamp_now,
        comment="创建时间（毫秒时间戳）",
    )
