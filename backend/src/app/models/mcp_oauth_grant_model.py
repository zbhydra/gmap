"""远程 MCP OAuth 授权记录：一行对应一次成功的授权码兑换。"""

from sqlalchemy import BigInteger, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class McpOAuthGrantModel(BaseDBModel):
    """刷新轮换、撤销与“已连接应用”列表的真相源；权限固定 exports、资源固定唯一 MCP，不入库。"""

    __tablename__ = "mcp_oauth_grants"

    __table_args__ = (
        UniqueConstraint(
            "family_hash", name="uk_mcp_oauth_grants_family_hash"
        ),  # load_refresh_token 按 family 摘要 + client_id 查授权。
        Index(
            "idx_mcp_oauth_grants_user_id", "user_id"
        ),  # 已连接应用按本人分页/计数；主键已隐含。
    )

    grant_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True, comment="授权 ID"
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, nullable=False, comment="授权用户 ID"
    )
    client_id: Mapped[str] = mapped_column(
        String(36), nullable=False, comment="DCR 客户端 ID"
    )
    client_name: Mapped[str | None] = mapped_column(
        String(128), nullable=True, comment="授权时的应用自称名称快照；未提供为空"
    )
    redirect_host: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="授权时的回调主机快照"
    )
    family_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        comment="刷新令牌授权随机标识（family）的 SHA-256 摘要",
    )
    refresh_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="当前有效刷新令牌的 SHA-256 摘要"
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        default=timestamp_now,
        nullable=False,
        comment="创建时间，即授权码兑换成功时间（毫秒时间戳）",
    )
    last_refreshed_at: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True, comment="最近刷新时间（毫秒时间戳）；空表示尚未刷新"
    )
    revoked_at: Mapped[int | None] = mapped_column(
        BigInteger,
        nullable=True,
        comment="撤销时间（毫秒时间戳）；官网撤销或重放检测写入，空表示未撤销",
    )
