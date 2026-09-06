"""Online 父任务及首次报告累计进度。"""

from sqlalchemy import BigInteger, Boolean, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class MapsOnlineTaskModel(BaseDBModel):
    __tablename__ = "maps_online_tasks"
    __table_args__ = (
        UniqueConstraint(
            "task_no", name="uk_maps_online_tasks_task_no"
        ),  # task_info 按任务编号定位详情与下载
        Index(
            "idx_maps_online_tasks_user_id", "user_id"
        ),  # task_lists / count_tasks 按用户查询，列表按 id DESC
        Index(
            "idx_maps_online_tasks_completed_at", "completed_at"
        ),  # task_lists 恢复时先定位 completed_at = 0，再过滤 app_name
    )

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="分表路由源"
    )
    task_no: Mapped[str] = mapped_column(
        String(32), nullable=False, comment="对外任务编号与计量幂等键"
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="任务所属登录用户"
    )
    app_name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="创建任务的 business 标识"
    )
    provider: Mapped[str] = mapped_column(
        String(16), nullable=False, comment="采集 Provider 创建时快照（http / gosom）"
    )
    storage_id: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        comment="创建时启用的对象存储配置 ID，任务存续期间不变",
    )
    include_contacts: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        comment="创建入口按 Online 权益确定的有效联系方式采集选项",
    )
    total_count: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="item 总数"
    )
    processed_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0", comment="已收口 item 数"
    )
    record_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
        comment="已保存结果记录总数",
    )
    error_item_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
        comment="供运维直接查询的错误 item 数，不对客户端返回",
    )
    completed_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
        comment="终态时间（毫秒时间戳）；0 为处理中",
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=timestamp_now,
        comment="创建时间（毫秒时间戳）",
    )
