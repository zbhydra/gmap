"""远程 MCP OAuth 授权服务器：元数据、DCR 注册、授权入口、令牌端点与 SDK provider。

流程：
1. 客户端读取 PRM 与授权服务器元数据，调用 /oauth/register 取得 client_id；
2. 浏览器打开 /oauth/authorize：按固定顺序校验，失败 302 到官网确认页 #error=，
   成功把请求暂存为待确认票据并 302 到 #request=（不回跳客户端，RFC 9700 §4.11.2）；
3. 官网确认接口（mcp_oauth_client.py）同意后签发授权码并返回回跳地址；
4. /oauth/token 由 SDK TokenHandler 调用本模块 provider 兑换授权码与轮换刷新令牌。

provider 依赖 SDK “先 load 后 exchange”的调用顺序保证原子性：授权码在 load 时即原子取走，
刷新令牌在 exchange 时按当前摘要条件更新。升级 SDK 时须重新核对该顺序。
"""

import re
import secrets
from collections.abc import Sequence
from urllib.parse import urlsplit

from mcp.server.auth.handlers.authorize import AuthorizationRequest
from mcp.server.auth.handlers.metadata import (
    MetadataHandler,
    ProtectedResourceMetadataHandler,
)
from mcp.server.auth.handlers.register import RegistrationHandler
from mcp.server.auth.handlers.token import TokenHandler
from mcp.server.auth.middleware.client_auth import ClientAuthenticator
from mcp.server.auth.provider import (
    AccessToken,
    AuthorizationCode,
    AuthorizationParams,
    OAuthAuthorizationServerProvider,
    RefreshToken,
    RegistrationError,
    TokenError,
)
from mcp.server.auth.routes import validate_issuer_url
from mcp.server.auth.settings import ClientRegistrationOptions
from mcp.server.transport_security import (
    DEFAULT_MAX_REQUEST_BODY_SIZE,
    RequestBodyLimitMiddleware,
)
from mcp.shared.auth import (
    OAuthClientInformationFull,
    OAuthMetadata,
    OAuthToken,
    ProtectedResourceMetadata,
)
from pydantic import AnyHttpUrl, AnyUrl, ConfigDict, TypeAdapter, ValidationError
from redis.exceptions import RedisError
from starlette.requests import Request
from starlette.responses import JSONResponse, RedirectResponse, Response
from starlette.routing import Route, request_response

from app.constants.auth import UserLoginStatus
from app.constants.mcp_oauth import (
    MCP_OAUTH_ACCESS_TOKEN_TTL_SECONDS,
    MCP_OAUTH_AUTHORIZATION_SERVER_METADATA_PATH,
    MCP_OAUTH_AUTHORIZE_PATH,
    MCP_OAUTH_AUTHORIZE_RATE_LIMIT_MAX,
    MCP_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW_SECONDS,
    MCP_OAUTH_CLIENT_NAME_MAX_LENGTH,
    MCP_OAUTH_CONSENT_PATH,
    MCP_OAUTH_GRANT_IDLE_TTL_MS,
    MCP_OAUTH_LOOPBACK_HOSTS,
    MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH,
    MCP_OAUTH_REDIRECT_HOST_MAX_LENGTH,
    MCP_OAUTH_REFRESH_FAMILY_RANDOM_BYTES,
    MCP_OAUTH_REFRESH_SECRET_RANDOM_BYTES,
    MCP_OAUTH_REFRESH_TOKEN_PATTERN,
    MCP_OAUTH_REFRESH_TOKEN_PREFIX,
    MCP_OAUTH_REGISTER_PATH,
    MCP_OAUTH_REGISTER_RATE_LIMIT_MAX,
    MCP_OAUTH_REGISTER_RATE_LIMIT_WINDOW_SECONDS,
    MCP_OAUTH_SCOPE,
    MCP_OAUTH_TOKEN_PATH,
    McpOAuthAuthorizeError,
)
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.models.mcp_oauth_client_model import McpOAuthClientModel
from app.models.mcp_oauth_grant_model import McpOAuthGrantModel
from app.services.mcp_oauth_ticket_service import (
    McpOAuthRequestTicket,
    mcp_oauth_ticket_service,
)
from app.services.mcp_oauth_service import (
    mcp_oauth_client_service,
    mcp_oauth_grant_service,
)
from app.services.user_service import user_service
from app.utils.common import get_client_ip
from app.utils.logger import logger
from app.utils.redis_rate_limiter import RedisRateLimiter
from app.utils.time import timestamp_now

_DEFAULT_PORTS = {"http": 80, "https": 443}
_rate_limiter = RedisRateLimiter()
# 与 SDK 客户端注册模型相同的回调解析配置（保留空路径），注册值与请求值按同一规则规范化。
_REDIRECT_URI = TypeAdapter(AnyUrl, config=ConfigDict(url_preserve_empty_path=True))
_PORT_SLOT = re.compile(r":[0-9]{1,5}")


# ---------------------------------------------------------------- 纯规则


def mcp_oauth_issuer() -> str:
    """issuer 取 MCP 公开地址的 scheme、主机与端口，不带路径与尾斜杠；三处引用同一字符串。"""
    parts = urlsplit(settings.app.mcp_url)
    return f"{parts.scheme}://{parts.netloc}"


def is_loopback_uri(uri: str) -> bool:
    """回调主机为 localhost、127.0.0.1 或 [::1]。"""
    return urlsplit(uri).hostname in MCP_OAUTH_LOOPBACK_HOSTS


def is_registrable_redirect_uri(uri: str) -> bool:
    """注册回调必须是 https 或回环 http，且不含 query 与 fragment。"""
    parts = urlsplit(uri)
    if parts.query or parts.fragment or "?" in uri or "#" in uri:
        return False
    if parts.scheme == "https":
        return bool(parts.hostname)
    return parts.scheme == "http" and parts.hostname in MCP_OAUTH_LOOPBACK_HOSTS


def resolve_redirect_uri(requested: str, registered: Sequence[AnyUrl]) -> AnyUrl | None:
    """按原文校验请求回调，返回票据保存、回跳与兑换比较共用的值；不匹配返回 None。

    与注册时 SDK 保存的注册字符串逐字比较，不做任何规范化等价。仅回环注册值例外：
    请求须为“scheme://主机” + 空或 ":端口数字" + 注册值端口之后的原文（RFC 8252 §7.3）。
    匹配后只解析一次：精确匹配时解析结果不变，回环时至多端口写法不同（如去掉 :80）。
    """
    if not any(_matches_registered(requested, uri) for uri in registered):
        return None
    try:
        return _REDIRECT_URI.validate_python(requested)
    except ValidationError:
        return None


def _matches_registered(requested: str, uri: AnyUrl) -> bool:
    registered = str(uri)
    if requested == registered:
        return True
    host = uri.host or ""
    if uri.username is not None or host.strip("[]") not in MCP_OAUTH_LOOPBACK_HOSTS:
        return False
    prefix = f"{uri.scheme}://{host}"
    if not registered.startswith(prefix):
        return False
    tail = registered[len(prefix) :]
    rest = tail[len(port.group()) :] if (port := _PORT_SLOT.match(tail)) else tail
    if (
        len(requested) < len(prefix) + len(rest)
        or not requested.startswith(prefix)
        or not requested.endswith(rest)
    ):
        return False
    slot = requested[len(prefix) : len(requested) - len(rest)]
    matched = _PORT_SLOT.fullmatch(slot)
    return slot == "" or (matched is not None and int(slot[1:]) <= 65535)


def _canonical_resource(value: str) -> str | None:
    try:
        parts = urlsplit(value)
    except ValueError:
        return None  # 非法 URL（如未闭合的 IPv6 方括号）按不符处理
    if "?" in value or "#" in value or not parts.scheme or not parts.netloc:
        return None
    return (
        f"{parts.scheme.lower()}://{parts.netloc.lower()}{parts.path.removesuffix('/')}"
    )


def match_resource(resource: str | None) -> bool:
    """与 MCP 公开地址在 scheme、主机小写并忽略一个尾斜杠后逐字一致；缺少即不符。"""
    if not resource:
        return False
    canonical = _canonical_resource(resource)
    return canonical is not None and canonical == _canonical_resource(
        settings.app.mcp_url
    )


def redirect_host(uri: str) -> str:
    """回调主机，含非默认端口；回环回调不含端口（端口每次不同）。"""
    parts = urlsplit(uri)
    host = parts.hostname or ""
    if ":" in host:
        host = f"[{host}]"
    port = parts.port
    if port is None or port == _DEFAULT_PORTS.get(parts.scheme) or is_loopback_uri(uri):
        return host
    return f"{host}:{port}"


def consent_url(fragment: str) -> str:
    """官网确认页地址；票据或原因码只放 fragment，不进入访问日志与 Referer。"""
    base = settings.app.public_website_base_url.rstrip("/")
    return f"{base}{MCP_OAUTH_CONSENT_PATH}#{fragment}"


# ---------------------------------------------------------------- provider


class McpOAuthCode(AuthorizationCode):
    """SDK 授权码对象，附带确认账号。"""

    user_id: int


class McpOAuthRefresh(RefreshToken):
    """SDK 刷新令牌对象，附带 load 时读到的授权与当前摘要，供条件轮换。"""

    grant_id: int
    user_id: int
    family: str  # 轮换后新令牌沿用同一 family
    refresh_hash: str


def _new_refresh_token(family: str) -> str:
    return (
        MCP_OAUTH_REFRESH_TOKEN_PREFIX
        + family
        + "_"
        + secrets.token_hex(MCP_OAUTH_REFRESH_SECRET_RANDOM_BYTES)
    )


async def _ensure_user_active(user_id: int) -> None:
    """兑换与刷新前检查账号状态；禁用、锁定或不存在统一 invalid_grant。"""
    user = await user_service.get_by_id(user_id)
    if user is None or user.user_status() != UserLoginStatus.OK:
        raise TokenError("invalid_grant", "account is not available")


class MapsOAuthProvider(
    OAuthAuthorizationServerProvider[McpOAuthCode, McpOAuthRefresh, AccessToken]
):
    """SDK 授权服务器 provider；与 Server(on_list_tools=...) 同属第三方回调合同，以模块级单例提供。

    出错只有三条规则：load 未命中、失效、归属不符或刚完成重放撤销返回 None（SDK 生成
    invalid_grant）；exchange 遇账号不可用或轮换失败抛 TokenError(invalid_grant)；
    数据库或 Redis 故障不转换，保持 5xx 由客户端重试。
    """

    async def get_client(self, client_id: str) -> OAuthClientInformationFull | None:
        record = await mcp_oauth_client_service.get_mcp_oauth_client_detail(client_id)
        if record is None:
            return None
        return OAuthClientInformationFull.model_validate(record.client_info)

    async def register_client(self, client_info: OAuthClientInformationFull) -> None:
        # SDK 未声明认证方式时已按 client_secret_post 处理、并已拒绝 private_key_jwt。
        if client_info.token_endpoint_auth_method not in {"none", "client_secret_post"}:
            raise RegistrationError(
                "invalid_client_metadata",
                "token_endpoint_auth_method must be 'none' or 'client_secret_post'",
            )
        uris = [str(uri) for uri in client_info.redirect_uris or []]
        if not uris or not all(is_registrable_redirect_uri(uri) for uri in uris):
            raise RegistrationError(
                "invalid_redirect_uri",
                "redirect_uris must be https or loopback http without query or fragment",
            )
        await mcp_oauth_client_service.create(
            McpOAuthClientModel(  # type: ignore[call-arg]
                client_id=client_info.client_id,
                client_info=client_info.model_dump(mode="json", exclude_none=True),
                created_at=timestamp_now(),
            )
        )

    async def authorize(
        self, client: OAuthClientInformationFull, params: AuthorizationParams
    ) -> str:
        """暂存已校验请求为待确认票据，返回官网确认页地址；scope 不入票据，授予固定为 exports。"""
        ticket = await mcp_oauth_ticket_service.create_mcp_oauth_request(
            McpOAuthRequestTicket(
                client_id=client.client_id,
                redirect_uri=str(params.redirect_uri),
                code_challenge=params.code_challenge,
                state=params.state,
            )
        )
        return consent_url(f"request={ticket}")

    async def load_authorization_code(
        self, client: OAuthClientInformationFull, authorization_code: str
    ) -> McpOAuthCode | None:
        # 此处原子取走：重复、并发兑换或随后 PKCE 失败都只消耗一次，用户重新授权即可。
        ticket = await mcp_oauth_ticket_service.consume_mcp_oauth_code(
            authorization_code
        )
        if ticket is None:
            return None
        return McpOAuthCode(
            code=authorization_code,
            scopes=[MCP_OAUTH_SCOPE],
            expires_at=ticket.expires_at,
            client_id=ticket.client_id,
            code_challenge=ticket.code_challenge,
            redirect_uri=AnyUrl(ticket.redirect_uri),
            redirect_uri_provided_explicitly=True,
            resource=settings.app.mcp_url,
            subject=str(ticket.user_id),
            user_id=ticket.user_id,
        )

    async def exchange_authorization_code(
        self, client: OAuthClientInformationFull, authorization_code: McpOAuthCode
    ) -> OAuthToken:
        await _ensure_user_active(authorization_code.user_id)
        family = secrets.token_hex(MCP_OAUTH_REFRESH_FAMILY_RANDOM_BYTES)
        refresh_token = _new_refresh_token(family)
        grant = await mcp_oauth_grant_service.create(
            McpOAuthGrantModel(  # type: ignore[call-arg]
                user_id=authorization_code.user_id,
                client_id=client.client_id,
                client_name=(client.client_name or "")[
                    :MCP_OAUTH_CLIENT_NAME_MAX_LENGTH
                ]
                or None,
                redirect_host=redirect_host(str(authorization_code.redirect_uri))[
                    :MCP_OAUTH_REDIRECT_HOST_MAX_LENGTH
                ],
                family_hash=mcp_oauth_grant_service.token_digest(family),
                refresh_hash=mcp_oauth_grant_service.token_digest(refresh_token),
                created_at=timestamp_now(),
            )
        )
        access_token = await mcp_oauth_grant_service.issue_access_token(
            grant_id=grant.grant_id, user_id=grant.user_id, client_id=client.client_id
        )
        return self._token_response(access_token, refresh_token)

    async def load_refresh_token(
        self, client: OAuthClientInformationFull, refresh_token: str
    ) -> McpOAuthRefresh | None:
        matched = re.fullmatch(MCP_OAUTH_REFRESH_TOKEN_PATTERN, refresh_token)
        if matched is None:
            return None
        # 先限定已认证 client_id：其他客户端提交同一 family 查不到，不会触发撤销。
        grants = await mcp_oauth_grant_service.list_mcp_oauth_grants(
            family_hashes=[
                mcp_oauth_grant_service.token_digest(matched.group("family"))
            ],
            client_ids=[client.client_id],
            limit=1,
        )
        if not grants:
            return None
        grant = grants[0]
        idle_since = grant.last_refreshed_at or grant.created_at
        if (
            grant.revoked_at is not None
            or idle_since <= timestamp_now() - MCP_OAUTH_GRANT_IDLE_TTL_MS
        ):
            return None
        if not secrets.compare_digest(
            mcp_oauth_grant_service.token_digest(refresh_token), grant.refresh_hash
        ):
            # 已轮换的令牌再次出现说明可能泄露，撤销整条授权（RFC 9700 §4.14.2）。
            await mcp_oauth_grant_service.soft_delete([grant.grant_id])
            return None
        return McpOAuthRefresh(
            token=refresh_token,
            client_id=grant.client_id,
            scopes=[MCP_OAUTH_SCOPE],
            resource=settings.app.mcp_url,
            subject=str(grant.user_id),
            grant_id=grant.grant_id,
            user_id=grant.user_id,
            family=matched.group("family"),
            refresh_hash=grant.refresh_hash,
        )

    async def exchange_refresh_token(
        self,
        client: OAuthClientInformationFull,
        refresh_token: McpOAuthRefresh,
        scopes: list[str],
    ) -> OAuthToken:
        # 请求的 scope 已由 SDK 限定为 exports 子集，授予仍固定为 exports。
        await _ensure_user_active(refresh_token.user_id)
        new_refresh = _new_refresh_token(refresh_token.family)
        # 先签发访问令牌（Redis）再做不可回退的轮换：Redis 故障时授权不变，客户端用原令牌重试。
        # 轮换落败时 Redis 只多一条从未交出的访问令牌摘要，到期自然清除。
        access_token = await mcp_oauth_grant_service.issue_access_token(
            grant_id=refresh_token.grant_id,
            user_id=refresh_token.user_id,
            client_id=client.client_id,
        )
        rotated = await mcp_oauth_grant_service.rotate_refresh_hash(
            refresh_token.grant_id,
            old_hash=refresh_token.refresh_hash,
            new_hash=mcp_oauth_grant_service.token_digest(new_refresh),
        )
        if not rotated:
            # 并发刷新落败或期间被撤销；不设宽限或补偿。
            raise TokenError("invalid_grant", "refresh token is no longer valid")
        return self._token_response(access_token, new_refresh)

    async def load_access_token(self, token: str) -> AccessToken | None:
        """只解析 Redis 绑定；授权撤销与账号状态由 MCP 入口逐请求检查。"""
        record = await mcp_oauth_grant_service.get_access_token(token)
        if record is None:
            return None
        return AccessToken(
            token=token,
            client_id=record.client_id,
            scopes=[MCP_OAUTH_SCOPE],
            resource=settings.app.mcp_url,
            subject=str(record.user_id),
            claims={"grant_id": record.grant_id},
        )

    async def revoke_token(self, token: AccessToken | McpOAuthRefresh) -> None:
        # RFC 7009 撤销端点本期不挂载：SDK 拒绝省略 client_secret 的公开客户端。
        raise NotImplementedError("MCP OAuth revocation endpoint is not mounted")

    @staticmethod
    def _token_response(access_token: str, refresh_token: str) -> OAuthToken:
        return OAuthToken(
            access_token=access_token,
            expires_in=MCP_OAUTH_ACCESS_TOKEN_TTL_SECONDS,
            scope=MCP_OAUTH_SCOPE,  # RFC 6749 §3.3：实际授予与请求不同时须回传
            refresh_token=refresh_token,
        )


maps_oauth_provider = MapsOAuthProvider()


# ---------------------------------------------------------------- 端点


async def _rate_limited(action: str, request: Request, limit: int, window: int) -> bool:
    """按 IP 滑动窗口限流；Redis 故障放行（fail-open），后续票据写入仍会 fail-closed。"""
    ip = get_client_ip(request) or "unknown"
    try:
        return not await _rate_limiter.is_allowed(
            f"mcp_oauth:{action}:{ip}", limit, window
        )
    except RedisError:
        logger.error("mcp_oauth_rate_limit_failed action=%s", action, exc_info=True)
        return False


def _consent_redirect(url: str) -> RedirectResponse:
    return RedirectResponse(url, status_code=302, headers={"Cache-Control": "no-store"})


def _authorize_error(reason: McpOAuthAuthorizeError) -> RedirectResponse:
    # 错误态不回显 state、client_id 或回调地址，也不回跳客户端。
    return _consent_redirect(consent_url(f"error={reason.value}"))


async def authorize_endpoint(request: Request) -> Response:
    """GET /oauth/authorize：按合同顺序校验，遇首个失败即跳官网错误态。"""
    if await _rate_limited(
        "authorize",
        request,
        MCP_OAUTH_AUTHORIZE_RATE_LIMIT_MAX,
        MCP_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW_SECONDS,
    ):
        return _authorize_error(McpOAuthAuthorizeError.RATE_LIMITED)
    params = request.query_params
    client_id = params.get("client_id")
    client = await maps_oauth_provider.get_client(client_id) if client_id else None
    if client is None:
        return _authorize_error(McpOAuthAuthorizeError.INVALID_CLIENT)
    redirect_uri = resolve_redirect_uri(
        params.get("redirect_uri") or "", client.redirect_uris or []
    )
    if redirect_uri is None:
        return _authorize_error(McpOAuthAuthorizeError.INVALID_REDIRECT_URI)
    if params.get("response_type") != "code":
        return _authorize_error(McpOAuthAuthorizeError.UNSUPPORTED_RESPONSE_TYPE)
    if (
        not params.get("code_challenge")
        or params.get("code_challenge_method") != "S256"
    ):
        return _authorize_error(McpOAuthAuthorizeError.INVALID_PKCE)
    if not match_resource(params.get("resource")):
        return _authorize_error(McpOAuthAuthorizeError.INVALID_RESOURCE)
    # 前述校验已覆盖全部必填字段，这里只取 SDK 的类型化参数；scope 不校验。
    auth_request = AuthorizationRequest.model_validate(dict(params))
    try:
        url = await maps_oauth_provider.authorize(
            client,
            AuthorizationParams(
                state=auth_request.state,
                scopes=[MCP_OAUTH_SCOPE],
                code_challenge=auth_request.code_challenge,
                redirect_uri=redirect_uri,
                redirect_uri_provided_explicitly=True,
                resource=settings.app.mcp_url,
            ),
        )
    except AppCommonException:
        # 票据服务已记录 Redis 故障；授权 fail-closed。
        return _authorize_error(McpOAuthAuthorizeError.SERVER_ERROR)
    return _consent_redirect(url)


_registration_handler = RegistrationHandler(
    maps_oauth_provider, options=ClientRegistrationOptions(enabled=True)
)


async def register_endpoint(request: Request) -> Response:
    """POST /oauth/register：按 IP 限流后交给 SDK RegistrationHandler。"""
    if await _rate_limited(
        "register",
        request,
        MCP_OAUTH_REGISTER_RATE_LIMIT_MAX,
        MCP_OAUTH_REGISTER_RATE_LIMIT_WINDOW_SECONDS,
    ):
        return JSONResponse(
            {"error": "rate_limited"},
            status_code=429,
            headers={"Retry-After": str(MCP_OAUTH_REGISTER_RATE_LIMIT_WINDOW_SECONDS)},
        )
    return await _registration_handler.handle(request)


def _metadata() -> OAuthMetadata:
    issuer = mcp_oauth_issuer()
    # model_validate 走模型的 url_preserve_empty_path，issuer 不被补尾斜杠。
    return OAuthMetadata.model_validate(
        {
            "issuer": issuer,
            "authorization_endpoint": issuer + MCP_OAUTH_AUTHORIZE_PATH,
            "token_endpoint": issuer + MCP_OAUTH_TOKEN_PATH,
            "registration_endpoint": issuer + MCP_OAUTH_REGISTER_PATH,
            "scopes_supported": [MCP_OAUTH_SCOPE],
            "response_types_supported": ["code"],
            "grant_types_supported": ["authorization_code", "refresh_token"],
            "token_endpoint_auth_methods_supported": ["none", "client_secret_post"],
            "code_challenge_methods_supported": ["S256"],
            "authorization_response_iss_parameter_supported": True,
        }
    )


def _protected_resource_metadata() -> ProtectedResourceMetadata:
    return ProtectedResourceMetadata.model_validate(
        {
            "resource": settings.app.mcp_url,
            "authorization_servers": [mcp_oauth_issuer()],
            "scopes_supported": [MCP_OAUTH_SCOPE],
        }
    )


def build_mcp_oauth_routes() -> list[Route]:
    """校验 MCP 公开地址（由 app.public_api_base_url 派生）与 issuer 后返回协议路由。

    SDK 元数据与 PRM 经 AnyHttpUrl 规范化（主机小写、去显式默认端口），回跳 iss 与 resource
    比较用配置原文；配置必须已是规范形式，三处才逐字一致，否则启动失败。
    """
    public_url = settings.app.mcp_url
    canonical = str(AnyHttpUrl(public_url))
    if public_url != canonical:
        raise ValueError(
            f"app.public_api_base_url must yield a canonical MCP URL {canonical!r} "
            f"(lowercase scheme and host, no explicit default port), got {public_url!r}"
        )
    validate_issuer_url(AnyHttpUrl(mcp_oauth_issuer()))
    token_handler = TokenHandler(
        maps_oauth_provider, ClientAuthenticator(maps_oauth_provider)
    )
    return [
        Route(
            MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH,
            endpoint=ProtectedResourceMetadataHandler(
                _protected_resource_metadata()
            ).handle,
            methods=["GET"],
        ),
        Route(
            MCP_OAUTH_AUTHORIZATION_SERVER_METADATA_PATH,
            endpoint=MetadataHandler(_metadata()).handle,
            methods=["GET"],
        ),
        Route(MCP_OAUTH_AUTHORIZE_PATH, endpoint=authorize_endpoint, methods=["GET"]),
        Route(
            MCP_OAUTH_REGISTER_PATH,
            endpoint=RequestBodyLimitMiddleware(
                request_response(register_endpoint), DEFAULT_MAX_REQUEST_BODY_SIZE
            ),
            methods=["POST"],
        ),
        Route(
            MCP_OAUTH_TOKEN_PATH,
            endpoint=RequestBodyLimitMiddleware(
                request_response(token_handler.handle), DEFAULT_MAX_REQUEST_BODY_SIZE
            ),
            methods=["POST"],
        ),
    ]
