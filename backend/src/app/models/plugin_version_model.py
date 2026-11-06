"""Admin 维护的插件发布记录。"""

from sqlalchemy import BigInteger, Boolean, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class PluginVersionModel(BaseDBModel):
    __tablename__ = "plugin_versions"
    __table_args__ = (
        Index("uk_plugin_versions_plugin_version", "plugin", "version", unique=True),
    )  # 保证发布身份唯一，并服务检查接口按插件查询发布记录。

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="版本记录 ID"
    )
    plugin: Mapped[str] = mapped_column(
        String(8), nullable=False, comment="插件标识：maps / bing"
    )
    version: Mapped[str] = mapped_column(
        String(32), nullable=False, comment="三段数字版本号"
    )
    is_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="是否启用该版本"
    )
    update_url: Mapped[str] = mapped_column(
        String(1000), nullable=False, comment="HTTP(S) 更新地址"
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
        comment="最后修改时间（毫秒时间戳）",
    )
