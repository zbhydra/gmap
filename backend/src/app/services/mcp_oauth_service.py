"""远程 MCP OAuth 客户端与授权记录的查询、条件更新、撤销，以及访问令牌的 Redis 存储。"""

import hashlib
import secrets
from collections.abc import Sequence
from typing import TypeVar, cast

from pydantic import BaseModel
from sqlalchemy import CursorResult, Select, func, select, update

from app.constants.mcp_oauth import (
    MCP_OAUTH_ACCESS_TOKEN_PREFIX,
    MCP_OAUTH_ACCESS_TOKEN_RANDOM_BYTES,
    MCP_OAUTH_ACCESS_TOKEN_TTL_SECONDS,
    MCP_OAUTH_GRANT_IDLE_TTL_MS,
)
from app.services.base_service import BaseService
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.models.mcp_oauth_client_model import McpOAuthClientModel
from app.models.mcp_oauth_grant_model import McpOAuthGrantModel
from app.utils.redis_key import build_redis_key
from app.utils.time import timestamp_now

RowT = TypeVar("RowT", bound=tuple[object, ...])


class McpOAuthAccessTokenRecord(BaseModel):
    """访问令牌在 Redis 中绑定的授权；撤销与账号状态由 MCP 入口逐请求查询。"""

    grant_id: int
    user_id: int
    client_id: str


class McpOAuthClientService(BaseService[McpOAuthClientModel]):
    """DCR 客户端记录的数据库访问入口；首版只注册与读取，不清理。"""

    primary_key_field = "client_id"

    def __init__(self) -> None:
        super().__init__(McpOAuthClientModel)

    async def list_mcp_oauth_clients(
        self,
        *,
        client_ids: Sequence[str] | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> list[McpOAuthClientModel]:
        """按字段过滤，按注册时间倒序分页，返回完整 ORM。"""
        stmt = select(McpOAuthClientModel)
        if client_ids is not None:
            stmt = stmt.where(McpOAuthClientModel.client_id.in_(client_ids))
        stmt = (
            stmt.order_by(McpOAuthClientModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        async with get_async_session() as db:
            return list((await db.execute(stmt)).scalars().all())

    async def get_mcp_oauth_client_detail(
        self, client_id: str
    ) -> McpOAuthClientModel | None:
        """按客户端 ID 读取注册记录。"""
        clients = await self.list_mcp_oauth_clients(client_ids=[client_id], limit=1)
        return clients[0] if clients else None

    async def create(self, instance: McpOAuthClientModel) -> McpOAuthClientModel:
        """保存注册记录；事务只包含写入。"""
        async with get_async_session() as db:
            db.add(instance)
            await db.commit()
        return instance


class McpOAuthGrantService(BaseService[McpOAuthGrantModel]):
    """授权记录与其访问令牌的唯一存取入口。"""

    primary_key_field = "grant_id"

    @staticmethod
    def token_digest(value: str) -> str:
        return hashlib.sha256(value.encode()).hexdigest()

    def __init__(self) -> None:
        super().__init__(McpOAuthGrantModel)

    @staticmethod
    def _apply_filters(
        stmt: Select[RowT],
        *,
        grant_ids: Sequence[int] | None = None,
        user_ids: Sequence[int] | None = None,
        client_ids: Sequence[str] | None = None,
        family_hashes: Sequence[str] | None = None,
        active_only: bool = False,
    ) -> Select[RowT]:
        for column, values in (
            (McpOAuthGrantModel.grant_id, grant_ids),
            (McpOAuthGrantModel.user_id, user_ids),
            (McpOAuthGrantModel.client_id, client_ids),
            (McpOAuthGrantModel.family_hash, family_hashes),
        ):
            if values is not None:
                stmt = stmt.where(column.in_(values))
        if active_only:
            # 有效 = 未撤销且最近刷新（未刷新取创建）仍在空闲有效期内。
            stmt = stmt.where(
                McpOAuthGrantModel.revoked_at.is_(None),
                func.coalesce(
                    McpOAuthGrantModel.last_refreshed_at, McpOAuthGrantModel.created_at
                )
                > timestamp_now() - MCP_OAUTH_GRANT_IDLE_TTL_MS,
            )
        return stmt

    async def list_mcp_oauth_grants(
        self,
        *,
        grant_ids: Sequence[int] | None = None,
        user_ids: Sequence[int] | None = None,
        client_ids: Sequence[str] | None = None,
        family_hashes: Sequence[str] | None = None,
        active_only: bool = False,
        offset: int = 0,
        limit: int = 20,
    ) -> list[McpOAuthGrantModel]:
        """按字段过滤，默认按创建时间倒序分页，返回完整 ORM。"""
        stmt = self._apply_filters(
            select(McpOAuthGrantModel),
            grant_ids=grant_ids,
            user_ids=user_ids,
            client_ids=client_ids,
            family_hashes=family_hashes,
            active_only=active_only,
        )
        stmt = (
            stmt.order_by(
                McpOAuthGrantModel.created_at.desc(),
                McpOAuthGrantModel.grant_id.desc(),
            )
            .offset(offset)
            .limit(limit)
        )
        async with get_async_session() as db:
            return list((await db.execute(stmt)).scalars().all())

    async def count_mcp_oauth_grants(
        self, *, user_ids: Sequence[int] | None = None, active_only: bool = False
    ) -> int:
        """统计已连接应用列表的记录数，过滤与列表共用。"""
        stmt = self._apply_filters(
            select(func.count()).select_from(McpOAuthGrantModel),
            user_ids=user_ids,
            active_only=active_only,
        )
        async with get_async_session() as db:
            return int((await db.execute(stmt)).scalar_one())

    async def get_mcp_oauth_grant_detail(
        self, grant_id: int
    ) -> McpOAuthGrantModel | None:
        """按主键读取授权记录。"""
        grants = await self.list_mcp_oauth_grants(grant_ids=[grant_id], limit=1)
        return grants[0] if grants else None

    async def create(self, instance: McpOAuthGrantModel) -> McpOAuthGrantModel:
        """保存兑换成功的授权；事务只包含写入。"""
        async with get_async_session() as db:
            db.add(instance)
            await db.commit()
        return instance

    async def rotate_refresh_hash(
        self, grant_id: int, *, old_hash: str, new_hash: str
    ) -> bool:
        """按当前摘要条件轮换；并发刷新只有一方命中，返回是否成功。"""
        stmt = (
            update(McpOAuthGrantModel)
            .where(
                McpOAuthGrantModel.grant_id == grant_id,
                McpOAuthGrantModel.refresh_hash == old_hash,
                McpOAuthGrantModel.revoked_at.is_(None),
            )
            .values(refresh_hash=new_hash, last_refreshed_at=timestamp_now())
        )
        async with get_async_session() as db:
            result = await db.execute(stmt)
            await db.commit()
        return cast(CursorResult[tuple[object, ...]], result).rowcount == 1

    async def soft_delete(
        self, grant_ids: Sequence[int], *, user_ids: Sequence[int] | None = None
    ) -> int:
        """撤销授权，返回匹配行数；重复撤销保留原时间，user_ids 限定归属。"""
        stmt = update(McpOAuthGrantModel).where(
            McpOAuthGrantModel.grant_id.in_(grant_ids)
        )
        if user_ids is not None:
            stmt = stmt.where(McpOAuthGrantModel.user_id.in_(user_ids))
        stmt = stmt.values(
            revoked_at=func.coalesce(McpOAuthGrantModel.revoked_at, timestamp_now())
        )
        async with get_async_session() as db:
            result = await db.execute(stmt)
            await db.commit()
        return cast(CursorResult[tuple[object, ...]], result).rowcount

    @staticmethod
    def _access_token_key(token: str) -> str:
        return build_redis_key(
            f"mcp_oauth:access:{McpOAuthGrantService.token_digest(token)}"
        )

    async def issue_access_token(
        self, *, grant_id: int, user_id: int, client_id: str
    ) -> str:
        """签发访问令牌，只存摘要键；Redis 故障上抛（fail-closed），客户端重试。"""
        token = MCP_OAUTH_ACCESS_TOKEN_PREFIX + secrets.token_hex(
            MCP_OAUTH_ACCESS_TOKEN_RANDOM_BYTES
        )
        record = McpOAuthAccessTokenRecord(
            grant_id=grant_id, user_id=user_id, client_id=client_id
        )
        redis = await redis_client.get_client()
        await redis.set(
            self._access_token_key(token),
            record.model_dump_json(),
            ex=MCP_OAUTH_ACCESS_TOKEN_TTL_SECONDS,
        )
        return token

    async def get_access_token(self, token: str) -> McpOAuthAccessTokenRecord | None:
        """读取访问令牌绑定；过期或不存在返回 None，Redis 故障上抛（fail-closed）。"""
        redis = await redis_client.get_client()
        value = await redis.get(self._access_token_key(token))
        return (
            None
            if value is None
            else McpOAuthAccessTokenRecord.model_validate_json(value)
        )


mcp_oauth_client_service = McpOAuthClientService()
mcp_oauth_grant_service = McpOAuthGrantService()
