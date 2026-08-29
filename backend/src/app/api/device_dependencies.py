"""客户端设备相关 FastAPI 依赖。"""

from typing import NoReturn

from fastapi import Header, Request

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


async def require_parse_pre_v2_trusted_client_device(
    request: Request,
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
) -> None:
    """在 parse-pre-v2 用户上下文依赖前完成设备可信校验。"""
    await require_trusted_client_device(
        request=request,
        device_id=x_device_id,
        operation="parse_media_pre_v2",
    )


async def require_download_pre_v2_trusted_client_device(
    request: Request,
    x_device_id: str | None = Header(None, alias="X-Device-Id"),
) -> None:
    """在 download-pre-v2 登录用户依赖前完成设备可信校验。"""
    await require_trusted_client_device(
        request=request,
        device_id=x_device_id,
        operation="download_pre_v2",
    )
