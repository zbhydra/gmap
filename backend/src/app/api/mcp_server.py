"""官方 MCP SDK 协议边界；Search / Reviews 与 REST 共用业务入口。"""

import json
from contextvars import ContextVar

import mcp_types as types
from mcp.server.context import ServerRequestContext
from mcp.server.lowlevel import Server
from mcp.server.transport_security import (
    TransportSecurityMiddleware,
    TransportSecuritySettings,
)
from pydantic import BaseModel, ValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import Receive, Scope, Send

from app.api import maps_api_operations
from app.api.mcp_dependencies import get_mcp_user
from app.api.mcp_oauth import mcp_oauth_issuer
from app.api.user_dependencies import UserContext
from app.constants.mcp_oauth import (
    MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH,
    MCP_OAUTH_SCOPE,
)
from app.core.config import settings
from app.exceptions.common_exception import AppCommonException
from app.i18n import translator
from app.i18n.common_code import CommonCode
from app.schemas.maps_api_schema import McpSearchRequest, McpReviewsRequest
from app.utils.common import get_locale
from app.utils.logger import logger

_current_user: ContextVar[UserContext] = ContextVar("mcp_current_user")
# 只读上游，但每次成功调用都消耗账号请求额度，重复调用不幂等。
_METERED_READ = types.ToolAnnotations(
    read_only_hint=False,
    destructive_hint=False,
    idempotent_hint=False,
    open_world_hint=True,
)
_TOOLS: dict[str, type[BaseModel]] = {
    "search_places": McpSearchRequest,
    "list_reviews": McpReviewsRequest,
}


def _error(code: CommonCode, language: str) -> dict[str, object]:
    return {
        "code": code.value,
        "message": translator.translate(f"resp_code.{code.name}", language),
    }


def _bearer_challenge(has_credential: bool) -> str:
    """RFC 6750 / RFC 9728 挑战，引导客户端发现授权服务器；携带了凭证才标 invalid_token。

    未配置 mcp.public_url 时不挂载 OAuth 端点，只返回裸 Bearer。
    """
    if not settings.mcp.public_url:
        return "Bearer"
    params = [
        f'resource_metadata="{mcp_oauth_issuer()}{MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH}"',
        f'scope="{MCP_OAUTH_SCOPE}"',
    ]
    if has_credential:
        params.append('error="invalid_token"')
    return "Bearer " + ", ".join(params)


async def list_tools(
    context: ServerRequestContext[object],
    params: types.PaginatedRequestParams | None,
) -> types.ListToolsResult:
    user = _current_user.get()
    return types.ListToolsResult(
        tools=[
            types.Tool(
                name=name,
                description=translator.translate(f"mcp.tools.{name}", user.language),
                input_schema=model.model_json_schema(),
                annotations=_METERED_READ,
            )
            for name, model in _TOOLS.items()
        ]
    )


async def call_tool(
    context: ServerRequestContext[object],
    params: types.CallToolRequestParams,
) -> types.CallToolResult:
    user = _current_user.get()
    is_error = False
    try:
        model = _TOOLS.get(params.name)
        if model is None:
            raise AppCommonException(CommonCode.INVALID_REQUEST)
        args = model.model_validate(params.arguments or {})
        if isinstance(args, McpSearchRequest):
            data = await maps_api_operations.search(args, user)
        else:
            assert isinstance(args, McpReviewsRequest)
            data = await maps_api_operations.reviews(args, user)
    except ValidationError:
        data, is_error = _error(CommonCode.VALIDATION_ERROR, user.language), True
    except AppCommonException as exc:
        logger.warning("mcp_tool_failed: tool=%s code=%s", params.name, exc.code.value)
        data, is_error = _error(exc.code, user.language), True
    except Exception:
        logger.error("mcp_tool_failed: tool=%s", params.name, exc_info=True)
        data, is_error = _error(CommonCode.INTERNAL_SERVER_ERROR, user.language), True
    return types.CallToolResult(
        content=[
            types.TextContent(type="text", text=json.dumps(data, ensure_ascii=False))
        ],
        structured_content=data,
        is_error=is_error,
    )


mcp_server: Server[object] = Server(
    "MapsGrab", on_list_tools=list_tools, on_call_tool=call_tool
)
_security_settings = TransportSecuritySettings(
    allowed_hosts=settings.mcp.allowed_hosts,
    allowed_origins=settings.mcp.allowed_origins,
)
_sdk_app = mcp_server.streamable_http_app(
    streamable_http_path="/mcp/",
    stateless_http=True,
    json_response=True,
    transport_security=_security_settings,
)


class _AuthenticatedMcpEndpoint:
    """精确 ASGI 入口；SDK 负责 Host/Origin，身份严格按单请求设置/重置。"""

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        request = Request(scope, receive)
        language = get_locale(request).language
        try:
            user = await get_mcp_user(request)
        except AppCommonException as exc:
            if exc.status_code == 401:
                has_credential = "authorization" in request.headers
                await JSONResponse(
                    _error(
                        (
                            CommonCode.AUTH_INVALID_TOKEN
                            if has_credential
                            else CommonCode.AUTH_MISSING_CREDENTIALS
                        ),
                        language,
                    ),
                    status_code=401,
                    headers={"WWW-Authenticate": _bearer_challenge(has_credential)},
                )(scope, receive, send)
            else:
                await JSONResponse(_error(exc.code, language), status_code=403)(
                    scope, receive, send
                )
            return
        # 旧协议的无状态 GET 仍会开启 SSE；本服务只提供 POST JSON 响应。
        if request.method == "GET":
            await Response(status_code=405, headers={"Allow": "POST, OPTIONS"})(
                scope, receive, send
            )
            return
        token = _current_user.set(user)
        try:
            await _sdk_app(scope, receive, send)
        finally:
            _current_user.reset(token)


_cors_app = CORSMiddleware(
    _AuthenticatedMcpEndpoint(),
    allow_origins=settings.mcp.allowed_origins,
    allow_methods=["POST"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Accept-Language",
        "Mcp-Protocol-Version",
        "Mcp-Session-Id",
        "Mcp-Method",
        "Mcp-Name",
    ],
    expose_headers=["Mcp-Session-Id", "Mcp-Protocol-Version"],
)
_security = TransportSecurityMiddleware(_security_settings)


class McpEndpoint:
    """精确路径与传输安全先于 CORS 预检及凭证处理。"""

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["path"] != "/mcp/":
            await Response(status_code=404)(scope, receive, send)
            return
        rejection = await _security.validate_request(Request(scope, receive))
        if rejection is not None:
            await rejection(scope, receive, send)
            return
        await _cors_app(scope, receive, send)


mcp_endpoint = McpEndpoint()
