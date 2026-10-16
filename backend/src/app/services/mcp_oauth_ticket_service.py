"""OAuth 票据仅保存摘要键，确认与兑换按参考原子消费。"""

import hashlib
import secrets
from typing import TypeVar

from pydantic import BaseModel
from redis.exceptions import RedisError

from app.constants.mcp_oauth import (
    MCP_OAUTH_REQUEST_TTL_SECONDS,
    MCP_OAUTH_CODE_TTL_SECONDS,
)
from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key

# 原子取走防止授权码或确认票据重复使用；失败后由用户重新授权。
AUTH_TICKET_CONSUME_LUA = """
local value = redis.call('GET', KEYS[1])
if value then redis.call('DEL', KEYS[1]) end
return value
"""


class McpOAuthRequestTicket(BaseModel):
    """已通过授权端校验、等待官网确认的远程 MCP 授权请求；不绑定用户。"""

    client_id: str
    redirect_uri: str  # 本次请求的回调原文，回跳与兑换比对都以它为准
    code_challenge: str  # PKCE S256 challenge
    state: str | None


class McpOAuthCodeTicket(McpOAuthRequestTicket):
    """用户同意后签发的授权码，绑定确认账号与原请求全部参数。"""

    user_id: int
    expires_at: int  # 到期时间（秒级时间戳），供 SDK 兑换时比较


Ticket = TypeVar("Ticket", bound=BaseModel)


class McpOAuthTicketService:
    @staticmethod
    def digest(value: str) -> str:
        """随机码和浏览器绑定共用 SHA256 摘要。"""
        return hashlib.sha256(value.encode()).hexdigest()

    def _key(self, purpose: str, code: str) -> str:
        return build_redis_key(f"mcp_oauth:ticket:{purpose}:{self.digest(code)}")

    async def _create(self, purpose: str, payload: BaseModel, ttl: int) -> str:
        code = secrets.token_urlsafe(32)
        try:
            redis = await redis_client.get_client()
            await redis.set(self._key(purpose, code), payload.model_dump_json(), ex=ttl)
        except RedisError as exc:
            # 认证票据 fail-closed；Redis 不可用时用户重新登录。
            logger.error("auth_ticket_create_failed", exc_info=True)
            raise AppCommonException(CommonCode.INTERNAL_SERVER_ERROR) from exc
        return code

    async def _find(
        self,
        purpose: str,
        code: str,
        model: type[Ticket],
        *,
        consume: bool = True,
    ) -> Ticket | None:
        """读取票据；不存在、已消费或已过期返回 None，Redis 故障抛错。"""
        try:
            redis = await redis_client.get_client()
            value = (
                await redis.eval(AUTH_TICKET_CONSUME_LUA, 1, self._key(purpose, code))  # type: ignore[misc]
                if consume
                else await redis.get(self._key(purpose, code))
            )
        except RedisError as exc:
            # 禁止在票据存储失败时放行认证。
            logger.error("auth_ticket_read_failed", exc_info=True)
            raise AppCommonException(CommonCode.INTERNAL_SERVER_ERROR) from exc
        return None if value is None else model.model_validate_json(value)

    async def create_mcp_oauth_request(self, ticket: McpOAuthRequestTicket) -> str:
        """暂存已校验的远程 MCP 授权请求，经官网 fragment 传递。"""
        return await self._create("request", ticket, MCP_OAUTH_REQUEST_TTL_SECONDS)

    async def find_mcp_oauth_request(
        self, code: str, *, consume: bool
    ) -> McpOAuthRequestTicket | None:
        """确认页展示时只读，同意或拒绝时原子消费。"""
        return await self._find(
            "request",
            code,
            McpOAuthRequestTicket,
            consume=consume,
        )

    async def create_mcp_oauth_code(self, ticket: McpOAuthCodeTicket) -> str:
        """签发远程 MCP 一次性授权码。"""
        return await self._create("code", ticket, MCP_OAUTH_CODE_TTL_SECONDS)

    async def consume_mcp_oauth_code(self, code: str) -> McpOAuthCodeTicket | None:
        """原子取走授权码：重复、并发或错误 verifier 的兑换都只消耗这一次。"""
        return await self._find("code", code, McpOAuthCodeTicket)


mcp_oauth_ticket_service = McpOAuthTicketService()
