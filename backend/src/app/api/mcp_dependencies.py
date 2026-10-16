"""MCP 凭证按前缀分流；授权撤销与账号状态逐请求检查。"""

import re

from starlette.requests import Request

from app.api.maps_api_dependencies import (
    credential_from_request,
    get_api_key_user,
    user_context,
)
from app.api.user_dependencies import UserContext
from app.constants.mcp_oauth import (
    MCP_OAUTH_ACCESS_TOKEN_LENGTH,
    MCP_OAUTH_ACCESS_TOKEN_PATTERN,
    MCP_OAUTH_ACCESS_TOKEN_PREFIX,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.mcp_oauth_service import mcp_oauth_grant_service
from app.services.user_api_key_service import USER_API_KEY_LENGTH
from app.services.user_service import user_service


async def get_mcp_user(request: Request) -> UserContext:
    credential = credential_from_request(
        request, max(USER_API_KEY_LENGTH, MCP_OAUTH_ACCESS_TOKEN_LENGTH)
    )
    if not credential.startswith(MCP_OAUTH_ACCESS_TOKEN_PREFIX):
        return await get_api_key_user(request)
    if re.fullmatch(MCP_OAUTH_ACCESS_TOKEN_PATTERN, credential) is None:
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    # Redis 故障直接上抛；授权不能在无法验证时放行。
    record = await mcp_oauth_grant_service.get_access_token(credential)
    if record is None:
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    grant = await mcp_oauth_grant_service.get_mcp_oauth_grant_detail(record.grant_id)
    if grant is None or grant.revoked_at is not None:
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    return user_context(await user_service.get_by_id(grant.user_id), request)
