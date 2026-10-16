"""远程 MCP OAuth 确认接口与已连接应用接口的请求、响应字段白名单。"""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, StrictBool, StringConstraints

# 待确认票据：secrets.token_urlsafe(32) 生成的 43 位 URL 安全字符。
McpOAuthRequestTicketValue = Annotated[
    str, StringConstraints(pattern=r"^[A-Za-z0-9_-]{43}$")
]


class McpOAuthRequestDetailRequest(BaseModel):
    """读取确认信息，不消费票据。"""

    request: McpOAuthRequestTicketValue


class McpOAuthRequestDecideRequest(BaseModel):
    """同意或拒绝，原子消费票据。"""

    request: McpOAuthRequestTicketValue
    approved: StrictBool


class McpOAuthRequestDetailData(BaseModel):
    """确认页展示信息；名称是 DCR 自报值，以回调主机为主标识。"""

    client_name: str | None
    redirect_host: str
    is_loopback: bool
    user_email: str


class McpOAuthRequestDecideData(BaseModel):
    """服务端按票据回调拼出的回跳地址。"""

    redirect_url: str


class McpOAuthGrantData(BaseModel):
    """已连接应用列表项，不含任何令牌、摘要或客户端密钥。"""

    model_config = ConfigDict(from_attributes=True)
    grant_id: int
    client_name: str | None
    redirect_host: str
    created_at: int
    last_refreshed_at: int | None


class McpOAuthGrantListData(BaseModel):
    """本人有效授权分页。"""

    items: list[McpOAuthGrantData]
    total: int
