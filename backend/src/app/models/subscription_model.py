"""用户订阅数据模型"""

from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class UserSubscriptionModel(BaseDBModel):
    """用户订阅表（006 扩展：按产品线隔离，一行 = 一个产品线的当前订阅实例）"""

    __tablename__ = "user_subscriptions"

    # 复合主键 (user_id, product_line)：同一账号可同时持有多个产品线的订阅。
    user_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=False, comment="用户 ID"
    )
    product_line: Mapped[str] = mapped_column(
        String(32),
        primary_key=True,
        default="extension",
        comment="产品线标识：extension=插件下载 Unlimited，maps_extension=MapsGrab 插件采集订阅",
    )
    # 购买商品 SKU 快照：同产品线存在多档位（如 maps_extension_pro /
    # maps_extension_business）时唯一能说明当前权益档位的字段；续期履约时同步刷新。
    product_id: Mapped[str] = mapped_column(
        String(64),
        default="unlimited",
        comment="当前生效的订阅商品 SKU（购买/续期时写入）",
    )
    expires_at: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
        comment="订阅过期时间(毫秒时间戳)",
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        default=timestamp_now,
        nullable=False,
        comment="创建时间（毫秒时间戳）",
    )
    updated_at: Mapped[int] = mapped_column(
        BigInteger,
        default=timestamp_now,
        nullable=False,
        comment="更新时间（毫秒时间戳）",
    )

    def __repr__(self) -> str:
        return (
            f"<UserSubscription(user_id={self.user_id}, "
            f"product_line={self.product_line}, product_id={self.product_id}, "
            f"expires_at={self.expires_at})>"
        )
