"""同一任务的全部 item 由父任务 ID 路由到同一张物理表。"""

from typing import ClassVar

from sqlalchemy import BigInteger, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.constants.maps_online import ITEM_SHARD_COUNT
from app.models.base import BaseDBModel


class MapsOnlineTaskItemModel(BaseDBModel):
    __abstract__ = True
    __tablename__: ClassVar[str]

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="分表内 item ID"
    )
    task_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="父任务 ID"
    )
    sequence: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="关键词原始顺序，从 1 开始"
    )
    keyword: Mapped[str] = mapped_column(
        String(500), nullable=False, comment="规范化后的关键词"
    )
    object_key: Mapped[str | None] = mapped_column(
        String(1000), nullable=True, comment="首次完成者的 CSV key"
    )
    record_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
        comment="本 item 实际保存记录数",
    )
    error: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="内部错误或 partial warning，禁止对客户端返回"
    )
    completed_at: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default="0",
        comment="收口时间（毫秒时间戳）；0 可再次执行，正数已经收口",
    )


ITEM_MODELS: tuple[type[MapsOnlineTaskItemModel], ...] = tuple(
    type(
        f"MapsOnlineTaskItem{shard:02d}Model",
        (MapsOnlineTaskItemModel,),
        {
            "__module__": __name__,
            "__tablename__": f"maps_online_task_items_{shard:02d}",
            "__table_args__": (
                UniqueConstraint(
                    "task_id",
                    "sequence",
                    name=f"uk_maps_online_task_items_{shard:02d}_task_id_sequence",
                ),  # item_lists 按 task_id 读取并按 sequence 排序
            ),
        },
    )
    for shard in range(ITEM_SHARD_COUNT)
)


def get_item_model(task_id: int) -> type[MapsOnlineTaskItemModel]:
    return ITEM_MODELS[task_id % ITEM_SHARD_COUNT]
