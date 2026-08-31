"""订阅商品配置表模型。"""

from sqlalchemy import BigInteger, Boolean, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class ConfigSubscriptionProductModel(BaseDBModel):
    """订阅商品配置表。"""

    __tablename__ = "config_subscription_product"
    __table_args__ = (
        UniqueConstraint(
            "product_id",
            name="uk_config_subscription_product_product_id",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="配置 ID"
    )
    product_id: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="商品标识，业务唯一"
    )
    product_line: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="extension",
        comment="产品线标识：extension=插件下载 Unlimited，maps=MapsGrab 套餐",
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False, comment="商品名称")
    period: Mapped[str] = mapped_column(String(20), nullable=False, comment="订阅周期")
    duration_days: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="订阅天数，0 表示永久或无固定天数"
    )
    display_currency: Mapped[str] = mapped_column(
        String(8), nullable=False, default="USD", comment="用户可见展示币种"
    )
    display_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        comment="用户可见展示金额，统一 6 位精度整数",
    )
    enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否启用"
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="排序值，越小越靠前"
    )
    metadata_json: Mapped[str | None] = mapped_column(
        "metadata", Text, nullable=True, comment="扩展配置 JSON"
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
