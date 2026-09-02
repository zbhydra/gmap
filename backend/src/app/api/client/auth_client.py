"""客户端用户认证 API。

本文件只负责把客户端认证接口串成业务流程；具体能力复用已有 service：
- user_auth_service：校验密码、签发项目 access/refresh token 并登记白名单。
- user_token_service：token 白名单校验、撤销、refresh token 轮换。
- user_service：创建/查询用户，构建客户端用户信息。
- google_auth_service：Google ID token 和 OAuth code 协议交互。
- google_redirect_login_service：Google redirect 登录的一次性 state/code。
- extension_login_code_service：插件登录 v3 的一次性 code（PKCE S256 绑定）。

整体流程：
1. Website 常规登录
   password / email-code / Google One Tap / Google redirect exchange
   -> 确认或创建用户
   -> _complete_login_flow
   -> 返回 Website 使用的 access_token、refresh_token 和 user。
2. 插件端发起登录（v3 browser identity）
   插件生成 PKCE verifier/challenge(S256)，打开官网登录页
   -> 用户以 Website 身份确认后，官网页带 Bearer 调 POST /auth/extension-login/code
      签发绑定 challenge 的一次性 code
   -> code 经回调 URL fragment 回到插件，插件携 verifier 调
      POST /auth/extension-login/exchange（无 Bearer）
   -> 原子消费 code 并校验 S256 challenge，按 code 内权威 user_id 走通用签发链；
      同账号旧插件 token 只做 best-effort 撤销
   -> 返回插件本地保存的 extension_access_token、extension_refresh_token。
   extension_* 也是项目用户 token，字段名只表示“给插件保存和使用”，
   与 Website token 完全独立（同 user_id 下不同 session）。
   code 明文不落服务端存储：Redis 只存 sha256 摘要，TTL 60 秒，一次性消费。
3. Google 手动按钮登录
   /google/oauth/authorize 只创建短效 state 并跳 Google
   -> /google/oauth/callback 校验 Google code 后只回传一次性 login code
   -> /google/exchange 消费一次性 code，再走 _complete_login_flow。
   这样项目 token 不出现在 URL 里。
4. token 生命周期
   /refresh 使用 refresh token 轮换出新 token 对。
   /logout 只撤销当前 access token，不影响其他设备、Website/插件另一端。
"""

from fastapi import APIRouter, Depends, Header, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.exc import IntegrityError

# Services
from app.api.device_dependencies import require_trusted_client_device
from app.services.email_verification_service import (
    SendResult,
    email_verification_service,
)
from app.services.extension_login_code_service import (
    EXTENSION_LOGIN_CODE_TTL_SECONDS,
    extension_login_code_service,
)
from app.services.google_auth_service import GoogleTokenProfile, google_auth_service
from app.services.google_redirect_login_service import (
    GOOGLE_REDIRECT_CODE_PARAM,
    GOOGLE_REDIRECT_EMAIL_VERIFY_PARAM,
    GoogleRedirectLoginError,
    google_redirect_login_service,
)
from app.services.user_auth_service import user_auth_service
from app.services.subscription_status_service import subscription_status_service
from app.services.user_service import user_service
from app.services.user_token_service import user_token_service

# Utils
from app.utils.common import get_client_ip, get_locale
from app.utils.geoip import geoip_service
from app.utils.ip_block_manager import IPBlockManager
from app.utils.jwt import JwtUnit
from app.utils.logger import logger
from app.utils.redis_fixed_limiter import RedisFixedLimiter
from app.utils.response import ResponseUtils

# API & Models
from app.api.user_dependencies import (
    UserContext,
    get_current_user,
)
from app.constants.client_product import ClientProductEnum, normalize_client_product
from app.constants.auth import (
    HTTP_AUTH_BEARER_PREFIX,
    HTTP_AUTH_BEARER_PREFIX_LENGTH,
    IP_BLOCK_DURATION,
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
    LOGIN_RATE_LIMIT_WINDOW,
    MESSAGE_VERIFY_CODE_SENT,
    TokenType,
    UserLoginStatus,
)
from app.constants.subscription import (
    MAPS_API_PRODUCT_LINE,
    MAPS_ONLINE_PRODUCT_LINE,
    MAPS_PRODUCT_LINE,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.i18n.dependencies import SupportedLanguage
from app.models import UserModel
from app.schemas.client_user_schema import (
    CurrentUserInfoResponse,
    EmailVerifyLoginRequest,
    ExtensionLoginCodeExchangeRequest,
    ExtensionLoginCodeIssueRequest,
    ExtensionLoginCodeIssueResponse,
    ExtensionTokenRequest,
    ExtensionTokenResponse,
    GoogleLoginCodeExchangeRequest,
    GoogleLoginRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
    SendEmailVerifyRequest,
)

router = APIRouter(prefix="/auth", tags=["用户认证"])

# 限流器和 IP 封禁管理器实例
_rate_limiter = RedisFixedLimiter(key_prefix="login_rate_limit")
_google_oauth_authorize_limiter = RedisFixedLimiter(key_prefix="google_oauth_authorize")
_extension_token_limiter = RedisFixedLimiter(key_prefix="extension_token_issue")
_ip_block_manager = IPBlockManager(key_prefix="ip_block")
_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_MAX = 10
_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW = 60
_EXTENSION_TOKEN_RATE_LIMIT_MAX = 10
_EXTENSION_TOKEN_RATE_LIMIT_WINDOW = 300
_GOOGLE_REGISTER_SOURCE = ClientProductEnum.WEB


def _extract_registration_context(
    request: Request,
) -> tuple[ClientProductEnum, str | None]:
    """提取注册时需要落库的客户端上下文。"""

    client_product = normalize_client_product(request.headers.get("X-Client-Product"))
    user_agent = request.headers.get("user-agent")
    return client_product, user_agent


def _require_client_ip(request: Request, operation: str) -> str:
    """读取必须参与风控限流的客户端 IP。"""

    ip_address = get_client_ip(request)
    if ip_address:
        return ip_address

    raise AppCommonException(
        code=CommonCode.INTERNAL_SERVER_ERROR,
        ext_msg=(
            "auth_client.client_ip: missing client ip for rate limit: "
            f"operation={operation}, path={request.url.path}"
        ),
    )


async def _complete_login_flow(user: UserModel, request: Request) -> LoginResponse:
    """完成登录后的通用流程（生成Token、创建会话、更新登录信息）.

    Args:
        user: 用户对象
        request: FastAPI 请求对象

    Returns:
        LoginResponse: 登录响应
    """
    ip_address = get_client_ip(request)
    token_bundle = await user_auth_service.issue_registered_tokens_for_user(
        user,
        ip_address=ip_address,
        user_agent=request.headers.get("user-agent"),
        operation="client_login",
    )

    # 更新登录信息（包含 IP 和国家）
    login_country = geoip_service.get_country(ip_address) if ip_address else None
    await user_auth_service.update_user_login_info(user, ip_address, login_country)

    return LoginResponse(
        access_token=token_bundle.access_token,
        refresh_token=token_bundle.refresh_token,
        token_type=TokenType.BEARER.value,
        expires_in=token_bundle.expires_in,
        user=await user_service.build_client_user_info(user),
    )


async def _create_extension_token_response(
    user: UserModel,
    request: Request,
    *,
    ip: str | None,
) -> ExtensionTokenResponse:
    """为已通过一次性 code 消费校验的用户签发一组插件可用 token。"""

    token_bundle = await user_auth_service.issue_registered_tokens_for_user(
        user,
        ip_address=ip,
        user_agent=request.headers.get("user-agent"),
        operation="extension_token",
    )

    return ExtensionTokenResponse(
        extension_access_token=token_bundle.access_token,
        extension_refresh_token=token_bundle.refresh_token,
        token_type=TokenType.BEARER.value,
        expires_in=token_bundle.expires_in,
        user=await user_service.build_client_user_info(user),
    )


async def _send_email_verify_code_or_raise(
    email: str,
    language: SupportedLanguage,
) -> None:
    """发送邮箱验证码，并统一映射限流和发送失败错误。"""

    result = await email_verification_service.send_verify_code(email, language)

    if result == SendResult.RATE_LIMITED:
        raise AppCommonException(
            code=CommonCode.EMAIL_VERIFY_SEND_TOO_FREQUENT,
            ext_msg=(
                "auth_client._send_email_verify_code_or_raise: 邮箱验证码发送触发频率限制: "
                f"email={email}"
            ),
        )
    if result == SendResult.SEND_FAILED:
        raise AppCommonException(
            code=CommonCode.EMAIL_VERIFY_SEND_FAILED,
            ext_msg=(
                "auth_client._send_email_verify_code_or_raise: 邮箱验证码发送失败: "
                f"email={email}"
            ),
        )


def _serialize_login_response(login_response: LoginResponse) -> dict:
    """把内部登录响应模型转换为 API 信封 data。"""
    return {
        "access_token": login_response.access_token,
        "refresh_token": login_response.refresh_token,
        "token_type": login_response.token_type,
        "expires_in": login_response.expires_in,
        "user": login_response.user.model_dump(),
    }


def _serialize_extension_token_response(
    token_response: ExtensionTokenResponse,
) -> dict:
    """把插件 token 响应模型转换为 API 信封 data。"""
    return {
        "extension_access_token": token_response.extension_access_token,
        "extension_refresh_token": token_response.extension_refresh_token,
        "token_type": token_response.token_type,
        "expires_in": token_response.expires_in,
        "user": token_response.user.model_dump(),
    }


def _ensure_user_can_login(user: UserModel) -> None:
    """检查用户当前状态是否允许登录。"""
    status_value = user.user_status()
    if status_value == UserLoginStatus.LOCKED:
        raise AppCommonException(
            code=CommonCode.AUTH_ACCOUNT_LOCKED,
            ext_msg=(
                "auth_client._ensure_user_can_login: 用户账号已锁定: "
                f"user_id={user.user_id}, email={user.email}"
            ),
        )
    if status_value == UserLoginStatus.DELETED:
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client._ensure_user_can_login: 用户已删除不允许登录: "
                f"user_id={user.user_id}, email={user.email}"
            ),
        )


async def _enforce_extension_token_rate_limit(
    *,
    user_id: int,
    ip: str | None,
    client_product: ClientProductEnum,
) -> None:
    """按用户限制插件 token 签发频率；Redis 故障由 limiter fail-open。"""

    user_allowed = await _extension_token_limiter.is_allowed(
        identifier=f"user:{user_id}",
        limit=_EXTENSION_TOKEN_RATE_LIMIT_MAX,
        window=_EXTENSION_TOKEN_RATE_LIMIT_WINDOW,
    )
    if user_allowed:
        return

    logger.warning(
        "Extension token issue rate limited: "
        f"user_id={user_id}, ip={ip}, client_product={client_product.value}"
    )
    raise AppCommonException(
        code=CommonCode.RATE_LIMIT_EXCEEDED,
        ext_msg=(
            "extension_token.rate_limit: too many issue attempts: "
            f"user_id={user_id}, ip={ip}, "
            f"client_product={client_product.value}, "
            f"limit={_EXTENSION_TOKEN_RATE_LIMIT_MAX}, "
            f"window={_EXTENSION_TOKEN_RATE_LIMIT_WINDOW}"
        ),
    )


async def _best_effort_revoke_old_extension_token(
    *,
    token: str | None,
    user_id: int,
    expected_token_type: TokenType,
) -> None:
    """按 code 内权威 user_id 撤销旧插件 token；任何失败都不影响新 token 签发。"""

    if not token:
        return

    jwt_data = JwtUnit.decode_token(token)
    if not jwt_data:
        logger.info(
            "Skipped old extension token revoke: "
            f"user_id={user_id}, reason=decode_failed"
        )
        return

    if jwt_data.type != expected_token_type.value:
        logger.info(
            "Skipped old extension token revoke: "
            f"user_id={user_id}, reason=token_type_mismatch"
        )
        return

    if jwt_data.user_id != user_id:
        logger.info(
            "Skipped old extension token revoke: "
            f"user_id={user_id}, reason=cross_user"
        )
        return

    try:
        await user_token_service.revoke_token(
            token,
            user_id,
            expected_token_type,
        )
    except Exception:
        logger.error(
            "Old extension token revoke failed: "
            f"user_id={user_id}, token_type={expected_token_type.value}",
            exc_info=True,
        )
        return


async def _best_effort_revoke_old_extension_tokens(
    data: ExtensionTokenRequest,
    *,
    user_id: int,
) -> None:
    """撤销请求体中同账号旧插件 access/refresh token。"""

    await _best_effort_revoke_old_extension_token(
        token=data.old_extension_access_token,
        user_id=user_id,
        expected_token_type=TokenType.USER_ACCESS,
    )
    await _best_effort_revoke_old_extension_token(
        token=data.old_extension_refresh_token,
        user_id=user_id,
        expected_token_type=TokenType.USER_REFRESH,
    )


async def _get_or_create_external_login_user(
    profile: GoogleTokenProfile,
    request: Request,
    register_method: str,
) -> UserModel:
    """按第三方可信邮箱查找或创建用户。"""
    register_ip = get_client_ip(request)
    return await user_service.get_or_create_external_login_user(
        email=profile.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        register_source=_GOOGLE_REGISTER_SOURCE,
        register_method=register_method,
        register_user_agent=request.headers.get("user-agent"),
        register_ip=register_ip,
        register_country=(
            geoip_service.get_country(register_ip) if register_ip else None
        ),
    )


def _google_redirect_response(
    params: dict[str, str],
    redirect_state: str | None = None,
) -> RedirectResponse:
    """返回跳回 Website 的 303 响应。"""
    return RedirectResponse(
        google_redirect_login_service.build_redirect_url(params, redirect_state),
        status_code=status.HTTP_303_SEE_OTHER,
    )


def _google_redirect_error_response(
    reason: str,
    redirect_state: str | None = None,
) -> RedirectResponse:
    """返回 Google redirect 登录失败的 Website 回跳响应。"""
    return RedirectResponse(
        google_redirect_login_service.build_error_redirect_url(reason, redirect_state),
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, request: Request):
    """用户注册.

    1. 检查邮箱是否已存在
    2. 创建用户（自动赠送注册 Credits）
    3. 返回用户信息
    """
    register_source, register_user_agent = _extract_registration_context(request)
    register_ip = get_client_ip(request)
    register_country = geoip_service.get_country(register_ip) if register_ip else None

    # 检查邮箱是否已存在
    existing = await user_service.get_user_by_email(data.email)
    if existing:
        raise AppCommonException(
            code=CommonCode.USER_EMAIL_EXISTS,
            ext_msg=f"auth_client.register: 注册邮箱已存在: email={data.email}",
        )

    # 创建用户并赠送注册 Credits
    user = await user_service.create_user_with_registration_bonus(
        email=data.email,
        password=data.password,
        full_name=data.full_name,
        register_source=register_source,
        register_user_agent=register_user_agent,
        register_ip=register_ip,
        register_country=register_country,
    )

    user_info = await user_service.build_client_user_info(user)
    return ResponseUtils.ok(user_info.model_dump())


@router.post("/login")
async def login(data: LoginRequest, request: Request):
    """用户登录.

    1. 检查 IP 是否被封禁
    2. 检查登录失败频率限制
    3. 验证邮箱和密码
    4. 生成 Token 并创建会话
    """
    # 获取客户端 IP，用于登录风控限流和封禁。
    ip_address = _require_client_ip(request, "password_login.rate_limit")

    # 检查 IP 是否被封禁
    if await _ip_block_manager.is_blocked(ip_address):
        remaining_time = await _ip_block_manager.get_remaining_time(ip_address)
        logger.warning(
            f"Blocked IP {ip_address} attempted login, remaining: {remaining_time}s",
        )
        raise AppCommonException(
            code=CommonCode.AUTH_IP_BLOCKED,
            ext_msg=(
                "auth_client.login: 登录 IP 处于封禁期: "
                f"ip={ip_address}, remaining_seconds={remaining_time}"
            ),
        )

    # 验证用户凭据
    user = await user_auth_service.authenticate_user(data.email, data.password)
    if not user:
        # 检查并更新失败次数限制
        allowed = await _rate_limiter.is_allowed(
            identifier=ip_address,
            limit=LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
            window=LOGIN_RATE_LIMIT_WINDOW,
        )

        if not allowed:
            # 超过限制，封禁 IP
            await _ip_block_manager.block(ip_address, IP_BLOCK_DURATION)
            logger.warning(
                f"IP {ip_address} exceeded login rate limit, "
                f"blocked for {IP_BLOCK_DURATION}s",
            )
            raise AppCommonException(
                code=CommonCode.AUTH_IP_BLOCKED,
                ext_msg=(
                    "auth_client.login: 密码登录失败次数超限触发 IP 封禁: "
                    f"ip={ip_address}, max_attempts={LOGIN_RATE_LIMIT_MAX_ATTEMPTS}, "
                    f"window_seconds={LOGIN_RATE_LIMIT_WINDOW}"
                ),
            )

        await user_auth_service.update_failed_login(data.email)
        raise AppCommonException(
            code=CommonCode.AUTH_INVALID_CREDENTIALS,
            ext_msg=(
                "auth_client.login: 邮箱或密码错误: "
                f"email={data.email}, ip={ip_address}"
            ),
        )

    _ensure_user_can_login(user)

    login_response = await _complete_login_flow(user, request)
    return ResponseUtils.ok(_serialize_login_response(login_response))


@router.post("/logout")
async def logout(ctx: UserContext = Depends(get_current_user), request: Request = None):
    """用户登出（只撤销当前 token，不影响其他设备）."""
    if request:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith(HTTP_AUTH_BEARER_PREFIX):
            token = auth_header[HTTP_AUTH_BEARER_PREFIX_LENGTH:]
            await user_token_service.revoke_token(
                token, ctx.user_id, TokenType.USER_ACCESS
            )

    return ResponseUtils.ok({})


@router.post("/extension-login/code")
async def extension_login_issue_code(
    data: ExtensionLoginCodeIssueRequest,
    ctx: UserContext = Depends(get_current_user),
):
    """Website 登录态为插件登录流程签发绑定 challenge 的一次性 code。"""

    user = await user_service.get_by_id(ctx.user_id)
    if not user:
        logger.error(
            f"User not found for user_id={ctx.user_id} in extension-login code endpoint"
        )
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client.extension_login_issue_code: Website token 有效但用户不存在: "
                f"user_id={ctx.user_id}, ip={ctx.ip}"
            ),
        )

    _ensure_user_can_login(user)

    await _enforce_extension_token_rate_limit(
        user_id=ctx.user_id,
        ip=ctx.ip,
        client_product=ctx.client_product,
    )

    code = await extension_login_code_service.create_code(
        ctx.user_id,
        data.code_challenge,
    )
    return ResponseUtils.ok(
        ExtensionLoginCodeIssueResponse(
            code=code,
            expires_in=EXTENSION_LOGIN_CODE_TTL_SECONDS,
        ).model_dump()
    )


@router.post("/extension-login/exchange")
async def extension_login_exchange(
    data: ExtensionLoginCodeExchangeRequest,
    request: Request,
):
    """插件携 verifier 消费一次性 code 换取插件 token（无 Bearer）。

    user_id 以 code 载荷为权威，不信任请求携带的任何身份字段；
    challenge 校验在 code 原子消费之后进行，失败即作废该 code。
    """
    user_id = await extension_login_code_service.consume_code(
        data.code,
        data.code_verifier,
    )

    user = await user_service.get_by_id(user_id)
    if not user:
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client.extension_login_exchange: 一次性 code 对应的用户不存在: "
                f"user_id={user_id}"
            ),
        )

    _ensure_user_can_login(user)

    ip = get_client_ip(request)
    await _enforce_extension_token_rate_limit(
        user_id=user_id,
        ip=ip,
        client_product=normalize_client_product(
            request.headers.get("X-Client-Product")
        ),
    )

    await _best_effort_revoke_old_extension_tokens(data, user_id=user_id)

    token_response = await _create_extension_token_response(user, request, ip=ip)
    return ResponseUtils.ok(_serialize_extension_token_response(token_response))


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest):
    """刷新访问令牌（带 Refresh Token 轮换）.

    流程：
    1. 验证旧的 refresh token（支持宽限期内的旧 token）
    2. 验证用户身份和状态
    3. 生成新的 access token 和 refresh token
    4. 执行 refresh token 轮换（旧 token 移入宽限期 ZSet）
    5. 返回新的 token 对

    宽限期策略：
    - 旧 refresh token 在轮换后保留 30 秒
    - 在此期间内，客户端可以使用旧 token 进行刷新（处理并发请求）
    """
    jwt_data = JwtUnit.decode_token(data.refresh_token)
    if not jwt_data:
        # refresh token 属敏感凭据，ext_msg 不记录其内容
        raise AppCommonException(
            code=CommonCode.AUTH_INVALID_CREDENTIALS,
            ext_msg=(
                "auth_client.refresh_token: refresh token 解析失败或 payload 非法"
            ),
        )

    user = await user_service.get_by_id(jwt_data.user_id)
    if not user:
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client.refresh_token: refresh token 对应的用户不存在: "
                f"user_id={jwt_data.user_id}, token_type={jwt_data.type}"
            ),
        )

    _ensure_user_can_login(user)

    ok = await user_token_service.verify_refresh_token_with_grace_period(
        data.refresh_token,
        jwt_data.user_id,
    )
    if not ok:
        raise AppCommonException(
            code=CommonCode.AUTH_INVALID_CREDENTIALS,
            ext_msg=(
                "auth_client.refresh_token: refresh token 白名单校验失败（含宽限期）: "
                f"user_id={jwt_data.user_id}, token_type={TokenType.USER_REFRESH.value}"
            ),
        )

    new_access_token, new_refresh_token, expires_in = (
        user_auth_service.create_tokens_for_user(user)
    )

    new_access_jwt_data = JwtUnit.decode_token(new_access_token)
    new_refresh_jwt_data = JwtUnit.decode_token(new_refresh_token)
    if not new_access_jwt_data or not new_refresh_jwt_data:
        raise AppCommonException(
            code=CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=(
                "auth_client.refresh_token: 轮换后新签发的 token 解码失败: "
                f"user_id={jwt_data.user_id}, "
                f"access_decoded={new_access_jwt_data is not None}, "
                f"refresh_decoded={new_refresh_jwt_data is not None}"
            ),
        )

    new_access_expires_at = new_access_jwt_data.exp
    new_refresh_expires_at = new_refresh_jwt_data.exp

    rotation_success = await user_token_service.rotate_refresh_token(
        old_refresh_token=data.refresh_token,
        new_refresh_token=new_refresh_token,
        user_id=jwt_data.user_id,
        new_expires_at=new_refresh_expires_at,
    )

    if not rotation_success:
        logger.error(f"Failed to rotate refresh token for user_id={jwt_data.user_id}")

    await user_auth_service.token_ops.store_token(
        new_access_token,
        jwt_data.user_id,
        TokenType.USER_ACCESS,
        new_access_expires_at,
    )

    return ResponseUtils.ok(
        {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": TokenType.BEARER.value,
            "expires_in": expires_in,
        }
    )


@router.get("/me", response_model=CurrentUserInfoResponse)
async def get_me(ctx: UserContext = Depends(get_current_user)):
    """获取当前用户信息."""

    user = await user_service.get_by_id(ctx.user_id)
    if not user:
        logger.error(f"User not found for user_id={ctx.user_id} in /me endpoint")
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client.get_me: token 有效但用户不存在: " f"user_id={ctx.user_id}"
            ),
        )

    data = (await user_service.build_client_user_info(user)).model_dump()
    data["subscription"] = await subscription_status_service.build_status_data(
        user_id=ctx.user_id,
    )
    # 产品线扩展（006）：网站按产品线展示当前套餐；旧字段 subscription
    # 保持插件下载线语义，旧客户端不受影响。
    data["maps_subscription"] = await subscription_status_service.build_status_data(
        user_id=ctx.user_id,
        product_line=MAPS_PRODUCT_LINE,
    )
    data["maps_online_subscription"] = (
        await subscription_status_service.build_status_data(
            user_id=ctx.user_id,
            product_line=MAPS_ONLINE_PRODUCT_LINE,
        )
    )
    data["maps_api_subscription"] = await subscription_status_service.build_status_data(
        user_id=ctx.user_id,
        product_line=MAPS_API_PRODUCT_LINE,
    )
    return ResponseUtils.ok(data)


@router.post("/send-email-code")
async def send_email_verify_code(
    data: SendEmailVerifyRequest,
    request: Request,
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
):
    """发送邮箱验证码.

    1. 检查发送频率限制 (1分钟1次)
    2. 生成6位数字验证码
    3. 存储到 Redis (10分钟过期)
    4. 发送邮件 (重试3次)
    """
    await require_trusted_client_device(
        request=request,
        device_id=x_device_id,
        operation="send_email_verify_code",
    )

    language = get_locale(request).language

    await _send_email_verify_code_or_raise(data.email, language)

    return ResponseUtils.ok({"message": MESSAGE_VERIFY_CODE_SENT})


@router.post("/email-verify-login")
async def email_verify_login(
    data: EmailVerifyLoginRequest,
    request: Request,
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
):
    """邮箱验证码登录/注册.

    1. 验证验证码 (最多5次)
    2. 如果用户不存在 -> 自动注册（赠送注册 Credits）
    3. 如果用户存在 -> 直接登录
    4. 生成 Token 并创建会话
    """
    await require_trusted_client_device(
        request=request,
        device_id=x_device_id,
        operation="email_verify_login",
    )

    # 验证验证码
    is_valid = await email_verification_service.verify_code(data.email, data.code)
    if not is_valid:
        raise AppCommonException(
            code=CommonCode.EMAIL_VERIFY_CODE_INVALID,
            ext_msg=(
                "auth_client.email_verify_login: 邮箱验证码校验失败（无效或超次数）: "
                f"email={data.email}"
            ),
        )

    # 获取用户，不存在则创建（带并发保护）
    user = await user_service.get_user_by_email(data.email)
    if not user:
        register_source, register_user_agent = _extract_registration_context(request)
        register_ip = get_client_ip(request)
        register_country = (
            geoip_service.get_country(register_ip) if register_ip else None
        )
        try:
            user = (
                await user_service.create_user_without_password_with_registration_bonus(
                    email=data.email,
                    full_name=None,
                    register_source=register_source,
                    register_method="email_code",
                    register_user_agent=register_user_agent,
                    register_ip=register_ip,
                    register_country=register_country,
                )
            )
            logger.info(f"New user created via email verification: {data.email}")
        except IntegrityError:
            # 并发创建冲突，重新查询用户
            user = await user_service.get_user_by_email(data.email)
            if not user:
                # 理论上不应该发生，但作为保险
                logger.error(
                    f"Failed to create user after IntegrityError for {data.email}",
                    exc_info=True,
                )
                raise AppCommonException(
                    code=CommonCode.INTERNAL_SERVER_ERROR,
                    ext_msg=(
                        "auth_client.email_verify_login: 并发注册冲突后重查用户仍不存在: "
                        f"email={data.email}, register_method=email_code"
                    ),
                )

    # 检查用户状态并完成登录
    _ensure_user_can_login(user)

    login_response = await _complete_login_flow(user, request)
    return ResponseUtils.ok(_serialize_login_response(login_response))


@router.post("/google-login")
async def google_login(data: GoogleLoginRequest, request: Request):
    """Google ID token 登录/注册.

    1. 服务端验签并校验 Google ID token
    2. Google 权威邮箱直接按 verified email 查找或创建用户
    3. 非权威第三方邮箱先发服务端确认出的邮箱验证码，不签发项目 token
    4. 直登分支复用通用登录流程生成项目 token 和会话
    """
    profile = await google_auth_service.verify_id_token(data.credential)

    if not profile.email_is_authoritative:
        await _send_email_verify_code_or_raise(
            profile.email,
            get_locale(request).language,
        )
        return ResponseUtils.ok(
            {
                "requires_email_verification": True,
                "email": profile.email,
            }
        )

    user = await _get_or_create_external_login_user(profile, request, "google")
    _ensure_user_can_login(user)

    login_response = await _complete_login_flow(user, request)
    return ResponseUtils.ok(_serialize_login_response(login_response))


@router.get("/google/oauth/authorize", include_in_schema=False)
async def google_oauth_authorize(request: Request, return_to: str | None = None):
    """手动 Google 登录按钮入口：校验 return_to 后跳转 Google OAuth。"""
    try:
        ip_address = _require_client_ip(request, "google_oauth_authorize.rate_limit")
        allowed = await _google_oauth_authorize_limiter.is_allowed(
            identifier=ip_address,
            limit=_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_MAX,
            window=_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW,
        )
        if not allowed:
            logger.warning(f"Google OAuth authorize rate limited ip={ip_address}")
            raise AppCommonException(
                code=CommonCode.RATE_LIMIT_EXCEEDED,
                ext_msg=(
                    "auth_client.google_oauth_authorize: Google OAuth 授权触发频率限制: "
                    f"ip={ip_address}, "
                    f"limit={_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_MAX}, "
                    f"window_seconds={_GOOGLE_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW}"
                ),
            )

        normalized_return_to = google_redirect_login_service.normalize_oauth_return_to(
            return_to
        )
        google_auth_service.require_oauth_client_config()
        state = await google_redirect_login_service.create_oauth_state(
            normalized_return_to
        )
        authorize_url = await google_auth_service.build_oauth_authorize_url(
            state=state,
        )
        return RedirectResponse(
            authorize_url,
            status_code=status.HTTP_302_FOUND,
        )
    except GoogleRedirectLoginError as exc:
        logger.warning(f"Google OAuth authorize failed reason={exc.reason}")
        return _google_redirect_error_response(exc.reason, None)
    except AppCommonException as exc:
        logger.warning(f"Google OAuth authorize failed with code={exc.code.name}")
        return _google_redirect_error_response(exc.code.name.lower(), None)
    except Exception as exc:
        logger.error(
            f"Google OAuth authorize failed unexpectedly: {exc}", exc_info=True
        )
        return _google_redirect_error_response(
            CommonCode.INTERNAL_SERVER_ERROR.name.lower(),
            None,
        )


@router.get("/google/oauth/callback", include_in_schema=False)
async def google_oauth_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    """接收 Google OAuth code flow 回调并签发一次性登录 code。"""
    redirect_state: str | None = None
    try:
        oauth_state = (state or "").strip()
        if not oauth_state:
            raise GoogleRedirectLoginError("missing_state")
        redirect_state = await google_redirect_login_service.consume_oauth_state(
            oauth_state
        )

        oauth_error = (error or "").strip()
        if oauth_error:
            logger.warning(f"Google OAuth callback returned error={oauth_error}")
            raise GoogleRedirectLoginError(oauth_error[:80])

        oauth_code = (code or "").strip()
        if not oauth_code:
            raise GoogleRedirectLoginError("missing_code")

        profile = await google_auth_service.exchange_oauth_code_for_profile(
            code=oauth_code,
            redirect_uri=google_auth_service.get_oauth_callback_uri(),
        )

        if not profile.email_is_authoritative:
            await _send_email_verify_code_or_raise(
                profile.email,
                get_locale(request).language,
            )
            return _google_redirect_response(
                {GOOGLE_REDIRECT_EMAIL_VERIFY_PARAM: profile.email},
                redirect_state,
            )

        user = await _get_or_create_external_login_user(profile, request, "google")
        _ensure_user_can_login(user)
        login_code = await google_redirect_login_service.create_login_code(user.user_id)
        logger.info(f"Google OAuth login code created for user_id={user.user_id}")
        return _google_redirect_response(
            {GOOGLE_REDIRECT_CODE_PARAM: login_code},
            redirect_state,
        )
    except GoogleRedirectLoginError as exc:
        logger.warning(f"Google OAuth callback failed reason={exc.reason}")
        return _google_redirect_error_response(exc.reason, redirect_state)
    except AppCommonException as exc:
        logger.warning(f"Google OAuth callback failed with code={exc.code.name}")
        return _google_redirect_error_response(exc.code.name.lower(), redirect_state)
    except Exception as exc:
        logger.error(f"Google OAuth callback failed unexpectedly: {exc}", exc_info=True)
        return _google_redirect_error_response(
            CommonCode.INTERNAL_SERVER_ERROR.name.lower(),
            redirect_state,
        )


@router.post("/google/exchange")
async def google_redirect_exchange(
    data: GoogleLoginCodeExchangeRequest,
    request: Request,
):
    """使用 Google redirect 一次性 code 换取项目 token。"""
    user_id = await google_redirect_login_service.consume_login_code(data.code)
    user = await user_service.get_by_id(user_id)
    if not user:
        raise AppCommonException(
            code=CommonCode.USER_NOT_FOUND,
            ext_msg=(
                "auth_client.google_redirect_exchange: 一次性 code 对应的用户不存在: "
                f"user_id={user_id}"
            ),
        )

    _ensure_user_can_login(user)
    login_response = await _complete_login_flow(user, request)
    return ResponseUtils.ok(_serialize_login_response(login_response))
