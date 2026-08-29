"""客户端设备相关 FastAPI 依赖。"""

from typing import NoReturn

from fastapi import Request

from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.device_service import device_service
from app.utils.common import get_client_ip


def _raise_auth_page_refresh_required(
    *,
    operation: str,
    reason: str,
    request: Request,
    device_id: str | None,
    ip: str | None,
    logo_ip: str | None,
) -> NoReturn:
    """设备可信关系校验失败时统一要求用户刷新页面。"""
    raise AppCommonException(
        code=CommonCode.AUTH_PAGE_REFRESH_REQUIRED,
        ext_msg=(
            "device_dependencies.require_trusted_client_device: "
            "device trust check failed: "
            f"operation={operation}, reason={reason}, device_id={device_id!r}, "
            f"current_ip={ip!r}, logo_ip={logo_ip!r}, path={request.url.path}"
        ),
    )


async def require_trusted_client_device(
    *,
    request: Request,
    device_id: str | None,
    operation: str,
) -> None:
    """校验重要客户端入口必须来自最近加载过 Website 页面的设备。"""
    verify_result = await device_service.verify_request_device(
        device_id=device_id,
        ip=get_client_ip(request),
    )
    if not verify_result.trusted:
        _raise_auth_page_refresh_required(
            operation=operation,
            reason=verify_result.reason,
            request=request,
            device_id=verify_result.device_id,
            ip=verify_result.ip,
            logo_ip=verify_result.logo_ip,
        )
