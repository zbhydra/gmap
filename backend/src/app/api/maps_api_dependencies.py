"""用户 API Key 边界，网页 JWT 与管理员 Key 不进入同步采集接口。"""

import re

from fastapi import Request

from app.api.user_dependencies import UserContext
from app.constants.auth import UserLoginStatus
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.user_model import UserModel
from app.services.user_api_key_service import (
    USER_API_KEY_LENGTH,
    USER_API_KEY_PATTERN,
    user_api_key_service,
)
from app.utils.common import get_client_ip, get_locale


def credential_from_request(request: Request, max_length: int) -> str:
    authorization = request.headers.get("authorization", "")
    scheme, separator, credential = authorization.partition(" ")
    if (
        len(authorization) > 7 + max_length
        or not separator
        or scheme.lower() != "bearer"
    ):
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    return credential


def user_context(user: UserModel | None, request: Request) -> UserContext:
    if user is None:
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    status = user.user_status()
    if status == UserLoginStatus.LOCKED:
        raise AppCommonException(CommonCode.AUTH_ACCOUNT_LOCKED)
    if status == UserLoginStatus.DELETED:
        raise AppCommonException(CommonCode.AUTH_USER_DISABLED)
    return UserContext(
        user_id=user.user_id,
        token="",
        language=get_locale(request).language,
        ip=get_client_ip(request),
    )


async def get_api_key_user(request: Request) -> UserContext:
    credential = credential_from_request(request, USER_API_KEY_LENGTH)
    if re.fullmatch(USER_API_KEY_PATTERN, credential) is None:
        raise AppCommonException(CommonCode.AUTH_INVALID_TOKEN, status_code=401)
    return user_context(
        await user_api_key_service.get_user_by_api_key(credential), request
    )
