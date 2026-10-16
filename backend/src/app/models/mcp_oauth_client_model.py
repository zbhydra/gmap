"""远程 MCP OAuth 动态注册（DCR）客户端；首版不清理。"""

from sqlalchemy import BigInteger, String
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseDBModel
from app.utils.time import timestamp_now


class McpOAuthClientModel(BaseDBModel):
    """DCR 客户端注册记录，SDK 客户端认证与回调校验的真相源。"""

    __tablename__ = "mcp_oauth_clients"

    client_id: Mapped[str] = mapped_column(
        String(36), primary_key=True, comment="SDK 签发的客户端 ID（UUID）"
    )
    client_info: Mapped[dict[str, object]] = mapped_column(
        JSON,
        nullable=False,
        comment=(
            "RFC 7591 注册响应全文（SDK OAuthClientInformationFull）；"
            "保密客户端密钥明文保存，因 SDK 以明文比对"
        ),
    )
    created_at: Mapped[int] = mapped_column(
        BigInteger,
        default=timestamp_now,
        nullable=False,
        comment="注册时间（毫秒时间戳）",
    )
