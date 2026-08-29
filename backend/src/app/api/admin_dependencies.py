"""
Admin 管理后台鉴权依赖。

提供 `get_admin_user()`：解码 access JWT 后回查管理员表。
"""

from dataclasses import dataclass
from typing import Optional

from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.constants.auth import TokenType
from app.exceptions.common_exception import UserAuthFailedException
from app.utils.jwt import JwtUnit

security = HTTPBearer(auto_error=False)


@dataclass
class AdminContext:
    """管理员上下文"""

    #: admin 表主键。
    admin_id: int
    #: 管理员展示名。
    username: str
    #: 原始 admin access JWT，用于透传或审计。
    token: str


async def get_admin_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
) -> AdminContext:
    """
    验证管理员 Token 并返回 AdminContext

    校验流程：
    1. 解码 JWT 签名和过期时间
    2. 校验 token type == ADMIN_ACCESS
    """
    if credentials is None:
        raise UserAuthFailedException("Missing admin access token")

    token = credentials.credentials
    jwt_data = JwtUnit.decode_token(token)

    if not jwt_data:
        raise UserAuthFailedException("Invalid admin access token")

    if jwt_data.type != TokenType.ADMIN_ACCESS:
        raise UserAuthFailedException("Invalid admin token type")

    from app.services.admin_service import admin_service

    admin = await admin_service.get_by_id(jwt_data.user_id)
    if not admin or not admin.is_active:
        raise UserAuthFailedException("Admin not found or inactive")

    return AdminContext(
        admin_id=admin.admin_id,
        username=admin.username,
        token=token,
    )
