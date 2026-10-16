"""远程 MCP OAuth 的官网确认接口与“已连接应用”管理接口。

确认接口复用本站严格登录会话，校验先于票据读取或消费；票据由当前登录账号确认。
已连接应用只允许查看和撤销本人授权。
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from mcp.server.auth.provider import construct_redirect_uri

from app.api.mcp_oauth import (
    maps_oauth_provider,
    is_loopback_uri,
    mcp_oauth_issuer,
    redirect_host,
)
from app.api.user_dependencies import UserContext, get_current_user
from app.constants.mcp_oauth import MCP_OAUTH_CODE_TTL_SECONDS
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.mcp_oauth_schema import (
    McpOAuthGrantData,
    McpOAuthGrantListData,
    McpOAuthRequestDecideData,
    McpOAuthRequestDecideRequest,
    McpOAuthRequestDetailData,
    McpOAuthRequestDetailRequest,
)
from app.services.mcp_oauth_ticket_service import (
    McpOAuthCodeTicket,
    mcp_oauth_ticket_service,
)
from app.services.mcp_oauth_service import mcp_oauth_grant_service
from app.services.user_service import user_service
from app.utils.response import ResponseUtils
from app.utils.time import timestamp_now_seconds

router = APIRouter(prefix="/mcp-oauth", tags=["远程 MCP OAuth"])


@router.post("/requests/detail")
async def get_mcp_oauth_request_detail(
    request_data: McpOAuthRequestDetailRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """读取待确认请求的展示信息，不消费票据。"""
    ticket = await mcp_oauth_ticket_service.find_mcp_oauth_request(
        request_data.request, consume=False
    )
    client = await maps_oauth_provider.get_client(ticket.client_id) if ticket else None
    if ticket is None or client is None:
        raise AppCommonException(CommonCode.MCP_OAUTH_REQUEST_INVALID)
    user = await user_service.get_by_id(current_user.user_id)
    data = McpOAuthRequestDetailData(
        client_name=client.client_name,
        redirect_host=redirect_host(ticket.redirect_uri),
        is_loopback=is_loopback_uri(ticket.redirect_uri),
        user_email=(user.email if user else None) or "",
    )
    return ResponseUtils.ok(data.model_dump(mode="json"))


@router.post("/requests/decide")
async def decide_mcp_oauth_request(
    request_data: McpOAuthRequestDecideRequest,
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """原子消费票据；同意签发授权码，拒绝回传 access_denied，回跳地址只按票据回调拼接。"""
    ticket = await mcp_oauth_ticket_service.find_mcp_oauth_request(
        request_data.request, consume=True
    )
    if ticket is None:
        raise AppCommonException(CommonCode.MCP_OAUTH_REQUEST_INVALID)
    if request_data.approved:
        code = await mcp_oauth_ticket_service.create_mcp_oauth_code(
            McpOAuthCodeTicket(
                **ticket.model_dump(),
                user_id=current_user.user_id,
                expires_at=timestamp_now_seconds() + MCP_OAUTH_CODE_TTL_SECONDS,
            )
        )
        redirect_url = construct_redirect_uri(
            ticket.redirect_uri, code=code, state=ticket.state, iss=mcp_oauth_issuer()
        )
    else:
        redirect_url = construct_redirect_uri(
            ticket.redirect_uri,
            error="access_denied",
            state=ticket.state,
            iss=mcp_oauth_issuer(),
        )
    response = ResponseUtils.ok(
        McpOAuthRequestDecideData(redirect_url=redirect_url).model_dump(mode="json")
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/grants")
async def list_mcp_oauth_grants(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """列出本人有效授权，按创建时间倒序。"""
    items = await mcp_oauth_grant_service.list_mcp_oauth_grants(
        user_ids=[current_user.user_id],
        active_only=True,
        offset=(page - 1) * page_size,
        limit=page_size,
    )
    total = await mcp_oauth_grant_service.count_mcp_oauth_grants(
        user_ids=[current_user.user_id], active_only=True
    )
    data = McpOAuthGrantListData(
        items=[McpOAuthGrantData.model_validate(item) for item in items], total=total
    )
    return ResponseUtils.ok(data.model_dump(mode="json"))


@router.post("/grants/{grant_id}/revoke")
async def revoke_mcp_oauth_grant(
    grant_id: int, current_user: UserContext = Depends(get_current_user)
) -> JSONResponse:
    """只撤销本人授权，重复撤销成功；不存在或属于他人统一 NOT_FOUND。"""
    matched = await mcp_oauth_grant_service.soft_delete(
        [grant_id], user_ids=[current_user.user_id]
    )
    if matched == 0:
        raise AppCommonException(CommonCode.NOT_FOUND)
    return ResponseUtils.ok({"revoked": True})
