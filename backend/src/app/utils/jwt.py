"""JWT 签发与校验工具：access/refresh token 的生成、解码与载荷构造。"""

from dataclasses import asdict, dataclass
from datetime import timedelta
import time
from typing import Optional, Tuple
import uuid

import jwt

from app.constants.auth import TokenType
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.utils.logger import logger


@dataclass
class JwtData:
    """JWT 数据"""

    user_id: int
    email: str | None
    exp: int = 0  # Unix 秒级时间戳
    type: TokenType = TokenType.USER_ACCESS
    jti: str = ""

    def to_dict(self) -> dict[str, object]:
        """转换为字典"""
        return asdict(self)


class JwtUnit:
    """JWT 工具类"""

    @staticmethod
    def create_access_token(
        data: JwtData,
        expires_delta: Optional[timedelta] = None,
    ) -> Tuple[str, int]:
        """创建访问令牌"""

        now = int(time.time())
        if expires_delta:
            expire = now + int(expires_delta.total_seconds())
        else:
            expire = now + settings.auth.access_token_expire

        data.exp = expire
        data.type = TokenType.USER_ACCESS
        data.jti = str(uuid.uuid4())
        encoded_jwt = jwt.encode(  # type: ignore[attr-defined]
            data.to_dict(),
            settings.auth.jwt_secret_key,
            algorithm=settings.auth.jwt_algorithm,
        )
        return encoded_jwt, expire

    @staticmethod
    def create_refresh_token(
        data: JwtData,
        expires_delta: Optional[timedelta] = None,
    ) -> Tuple[str, int]:
        """创建刷新令牌"""

        now = int(time.time())
        if expires_delta:
            expire = now + int(expires_delta.total_seconds())
        else:
            expire = now + settings.auth.refresh_token_expire

        data.exp = expire
        data.type = TokenType.USER_REFRESH
        data.jti = str(uuid.uuid4())

        encoded_jwt = jwt.encode(  # type: ignore[attr-defined]
            data.to_dict(),
            settings.auth.jwt_secret_key,
            algorithm=settings.auth.jwt_algorithm,
        )
        return encoded_jwt, expire

    @staticmethod
    def create_admin_token(
        data: JwtData,
        expires_delta: Optional[timedelta] = None,
    ) -> Tuple[str, int]:
        """创建管理员访问令牌"""
        now = int(time.time())
        expire = (
            now + int(expires_delta.total_seconds())
            if expires_delta
            else now + settings.admin.access_token_expire
        )

        data.exp = expire
        data.type = TokenType.ADMIN_ACCESS
        data.jti = str(uuid.uuid4())
        encoded_jwt = jwt.encode(  # type: ignore[attr-defined]
            data.to_dict(),
            settings.auth.jwt_secret_key,
            algorithm=settings.auth.jwt_algorithm,
        )
        return encoded_jwt, expire

    @staticmethod
    def create_admin_refresh_token(
        data: JwtData,
        expires_delta: Optional[timedelta] = None,
    ) -> Tuple[str, int]:
        """创建管理员刷新令牌"""
        now = int(time.time())
        expire = (
            now + int(expires_delta.total_seconds())
            if expires_delta
            else now + settings.admin.refresh_token_expire
        )

        data.exp = expire
        data.type = TokenType.ADMIN_REFRESH
        data.jti = str(uuid.uuid4())
        encoded_jwt = jwt.encode(  # type: ignore[attr-defined]
            data.to_dict(),
            settings.auth.jwt_secret_key,
            algorithm=settings.auth.jwt_algorithm,
        )
        return encoded_jwt, expire

    @staticmethod
    def decode_token(
        token: str,
        *,
        report_failure: bool = True,
    ) -> Optional[JwtData]:
        """解码令牌

        对于 ADMIN_ACCESS 类型的 token，跳过 user_id < 1 检查
        （admin token 中 user_id 存的是 admin_id，由调用方按 type 校验）

        Args:
            token: 待解码的 JWT。
            report_failure: 是否记录解码失败。可选身份允许无效 token 降级为游客，
                该正常分支不应打印 ERROR。
        """
        try:
            return JwtUnit._decode_token(token)
        except Exception as e:
            if report_failure:
                logger.error(f"Failed to decode token: {e}", exc_info=True)
            return None

    @staticmethod
    def require_token(
        token: str,
        expected_type: TokenType,
        operation: str,
    ) -> JwtData:
        """解码认证 token，并按失败原因抛出统一业务异常。"""
        try:
            jwt_data = JwtUnit._decode_token(token)
        except jwt.ExpiredSignatureError as exc:
            expired_code = (
                CommonCode.AUTH_REFRESH_TOKEN_EXPIRED
                if expected_type
                in {
                    TokenType.USER_REFRESH,
                    TokenType.USER_REFRESH_OLD,
                    TokenType.ADMIN_REFRESH,
                    TokenType.ADMIN_REFRESH_OLD,
                }
                else CommonCode.AUTH_TOKEN_EXPIRED
            )
            raise AppCommonException(
                expired_code,
                ext_msg=(
                    f"{operation}: token expired: expected_type={expected_type.value}"
                ),
                status_code=401,
            ) from exc
        except (jwt.InvalidTokenError, TypeError, ValueError) as exc:
            raise AppCommonException(
                CommonCode.AUTH_INVALID_TOKEN,
                ext_msg=(
                    f"{operation}: token signature or payload invalid: "
                    f"expected_type={expected_type.value}"
                ),
                status_code=401,
            ) from exc

        if jwt_data.type != expected_type:
            raise AppCommonException(
                CommonCode.AUTH_TOKEN_TYPE_ERROR,
                ext_msg=(
                    f"{operation}: token type mismatch: expected={expected_type.value}, "
                    f"actual={jwt_data.type}"
                ),
                status_code=401,
            )
        return jwt_data

    @staticmethod
    def _decode_token(token: str) -> JwtData:
        """执行 JWT 解码与载荷结构校验，让调用方决定错误处理语义。"""
        payload = jwt.decode(  # type: ignore[attr-defined]
            token,
            settings.auth.jwt_secret_key,
            algorithms=[settings.auth.jwt_algorithm],
        )
        if not payload:
            raise jwt.InvalidTokenError("JWT payload is empty")
        jwt_data = JwtData(**payload)
        # admin token 中 user_id 存的是 admin_id，不检查 user_id < 1
        if jwt_data.type != TokenType.ADMIN_ACCESS and jwt_data.user_id < 1:
            raise jwt.InvalidTokenError("JWT user_id is invalid")
        return jwt_data
