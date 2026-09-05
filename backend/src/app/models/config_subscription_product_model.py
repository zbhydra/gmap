"""订阅商品配置表模型。"""

from sqlalchemy import (
    BigInteger,
    Boolean,
    Integer,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class ConfigSubscriptionProductModel(BaseDBModel):
    """订阅商品配置表。"""

    __tablename__ = "config_subscription_product"
    __table_args__ = (
        # 每条产品线一套商品档位：唯一性按 (product_line, product_id) 收敛，
        # 付费 SKU 的 product_id 仍须全线唯一（seed 脚本合同），free 是唯一
        # 允许各线同名的档位（不下单，仅作配置读取）。
        UniqueConstraint(
            "product_line",
            "product_id",
            name="uk_config_subscription_product_line_product_id",
        ),
        {"info": {"schema_sync_drop_columns": ("duration_days", "sort_order")}},
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
        comment="产品线标识：extension=插件下载 Unlimited，maps_extension=MapsGrab 插件采集订阅",
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False, comment="商品名称")
    period: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        default="none",
        server_default=text("'none'"),
        comment="商业与权益周期",
    )
    # 单一计费模式：当前商品只有一种售卖形态，auto_renew_supported 决定渠道是否可卖。
    auto_renew: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("0"),
        comment="当前销售模式是否由渠道自动续费",
    )
    display_currency: Mapped[str] = mapped_column(
        String(8),
        nullable=False,
        default="USD",
        server_default=text("'USD'"),
        comment="商品卡默认展示币种",
    )
    display_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
        server_default=text("0"),
        comment="商品卡默认展示金额，统一 6 位精度整数",
    )
    enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, comment="是否启用"
    )
    display_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, comment="展示排序值，越小越靠前，仅展示用"
    )
    tier_rank: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="业务档次，0=free，同线付费档递增，仅业务用",
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
