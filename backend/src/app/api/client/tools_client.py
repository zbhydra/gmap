"""免费工具公开接口，不需要登录。"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.constants.reoon import EMAIL_VERIFY_DAILY_LIMIT_PER_IP
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.reoon_schema import EmailVerifyRequest
from app.services.reoon_service import reoon_service
from app.utils.common import get_client_ip
from app.utils.redis_fixed_limiter import RedisFixedLimiter
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/tools", tags=["工具"])

_email_verify_limiter = RedisFixedLimiter(key_prefix="tool_email_verify")


@router.post("/email-verify")
async def verify_email(request: Request, payload: EmailVerifyRequest) -> JSONResponse:
    """入口校验失败的请求由 FastAPI 在进入本函数前拒绝，因此不计入限流。"""
    ip = get_client_ip(request)
    if not ip:
        raise AppCommonException(
            CommonCode.INTERNAL_SERVER_ERROR,
            ext_msg=(
                "tools_client.verify_email: missing client ip for rate limit: "
                f"path={request.url.path}"
            ),
        )
    if not await _email_verify_limiter.is_allowed_today(
        ip, EMAIL_VERIFY_DAILY_LIMIT_PER_IP
    ):
        raise AppCommonException(
            CommonCode.RATE_LIMIT_EXCEEDED,
            ext_msg=f"tools_client.verify_email: daily limit reached: ip={ip}",
        )
    result = await reoon_service.verify_email(payload.email)
    return ResponseUtils.ok(result.model_dump())
