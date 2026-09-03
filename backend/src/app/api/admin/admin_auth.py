"""
Admin 认证 API

提供管理员登录所需的验证码获取、登录验证、Token 续签三个接口。

流程：验证码 → 登录签发 token pair → refresh token 轮换续签
"""

import time

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.constants.auth import TokenType
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import (
    AdminCaptchaResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    AdminRefreshRequest,
    AdminRefreshResponse,
)
from app.services.admin_service import admin_service
from app.services.admin_token_service import admin_token_service
from app.services.captcha_service import captcha_service
from app.utils.jwt import JwtUnit
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/auth", tags=["admin-auth"])


def _remaining_seconds(expires_at: int) -> int:
    """把 JWT 绝对过期时间转换成剩余秒数。"""

    return max(0, expires_at - int(time.time()))


@router.post("/captcha")
async def get_captcha() -> JSONResponse:
    """获取图片验证码"""
    captcha_id, image_base64 = await captcha_service.generate_captcha()
    return ResponseUtils.ok(
        AdminCaptchaResponse(
            captcha_id=captcha_id, image_base64=image_base64
        ).model_dump()
    )


@router.post("/login")
async def login(req: AdminLoginRequest) -> JSONResponse:
    """
    管理员登录

    流程：验证码校验 → 查 admins 表 → bcrypt 校验密码 → 检查 is_active → 签发 JWT
    """
    # 1. 验证码校验
    if not await captcha_service.verify_captcha(req.captcha_id, req.captcha_code):
        raise AppCommonException(
            CommonCode.ADMIN_CAPTCHA_FAILED,
            ext_msg=(
                "admin_auth.login: 图片验证码校验失败: "
                f"captcha_id={req.captcha_id}, username={req.username}"
            ),
        )

    # 2. 用户名 + 密码校验
    admin = await admin_service.authenticate(req.username, req.password)
    if not admin:
        raise AppCommonException(
            CommonCode.ADMIN_AUTH_FAILED,
            ext_msg=f"admin_auth.login: 管理员用户名或密码错误: username={req.username}",
        )

    # 3. 检查 is_active
    if not admin.is_active:
        raise AppCommonException(
            CommonCode.ADMIN_INACTIVE,
            ext_msg=(
                "admin_auth.login: 管理员账号已停用: "
                f"admin_id={admin.admin_id}, username={req.username}"
            ),
        )

    # 4. 签发 access token 和 refresh token
    access_token, refresh_token, access_expire, refresh_expire = (
        admin_service.create_token_pair(admin)
    )
    await admin_token_service.store_refresh_token(
        refresh_token,
        admin.admin_id,
        refresh_expire,
    )

    return ResponseUtils.ok(
        AdminLoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=_remaining_seconds(access_expire),
            refresh_expires_in=_remaining_seconds(refresh_expire),
        ).model_dump()
    )


@router.post("/refresh")
async def refresh_token(req: AdminRefreshRequest) -> JSONResponse:
    """使用 refresh token 续签管理员 token pair。"""

    jwt_data = JwtUnit.require_token(
        req.refresh_token,
        TokenType.ADMIN_REFRESH,
        "admin_auth.refresh_token",
    )

    ok = await admin_token_service.verify_refresh_token_with_grace_period(
        req.refresh_token,
        jwt_data.user_id,
    )
    if not ok:
        raise AppCommonException(
            CommonCode.ADMIN_SESSION_INVALID,
            ext_msg=(
                "admin_auth.refresh_token: admin refresh token revoked or expired: "
                f"admin_id={jwt_data.user_id}"
            ),
            status_code=401,
        )

    admin = await admin_service.get_by_id(jwt_data.user_id)
    if not admin:
        raise AppCommonException(
            CommonCode.ADMIN_SESSION_INVALID,
            ext_msg=(
                "admin_auth.refresh_token: refresh token admin not found: "
                f"admin_id={jwt_data.user_id}"
            ),
            status_code=401,
        )
    if not admin.is_active:
        raise AppCommonException(
            CommonCode.ADMIN_INACTIVE,
            ext_msg=(
                "admin_auth.refresh_token: refresh token admin inactive: "
                f"admin_id={jwt_data.user_id}"
            ),
            status_code=401,
        )

    access_token, refresh_token, access_expire, refresh_expire = (
        admin_service.create_token_pair(admin)
    )
    await admin_token_service.rotate_refresh_token(
        req.refresh_token,
        refresh_token,
        admin.admin_id,
        refresh_expire,
    )
    return ResponseUtils.ok(
        AdminRefreshResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=_remaining_seconds(access_expire),
            refresh_expires_in=_remaining_seconds(refresh_expire),
        ).model_dump()
    )
