"""Admin 用户管理 API。

提供用户分页列表（用户管理页）和后台内所有 user_id 入口共用的用户
profile、积分记录和订单分页，只读不写。
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query
from fastapi.responses import JSONResponse

from app.api.admin_dependencies import AdminContext, get_admin_user
from app.constants.auth import UserAccountStatus
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.admin_user_profile_service import admin_user_profile_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/users", tags=["admin-users"])

UserIdPath = Annotated[int, Path(ge=1, description="用户 ID")]


@router.get("")
async def list_admin_users(
    page: int = Query(default=1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(default=20, ge=1, le=100, description="每页数量"),
    user_id: int | None = Query(default=None, ge=1, description="用户 ID（精确匹配）"),
    email: str | None = Query(
        default=None,
        max_length=64,
        description="当前邮箱包含（模糊）",
    ),
    status: UserAccountStatus | None = Query(
        default=None,
        description="账号状态（normal/locked/deleted，不传 = 全部）",
    ),
    created_start: int | None = Query(
        default=None,
        ge=0,
        description="注册时间起点，毫秒时间戳（闭开区间，含起点）",
    ),
    created_end: int | None = Query(
        default=None,
        ge=0,
        description="注册时间终点，毫秒时间戳（闭开区间，不含终点）",
    ),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """分页查询用户列表，含已注销用户（状态列区分）。"""
    if (
        created_start is not None
        and created_end is not None
        and created_start > created_end
    ):
        raise AppCommonException(
            CommonCode.INVALID_REQUEST,
            ext_msg=(
                "admin_user_list: invalid created range: "
                f"created_start={created_start}, created_end={created_end}"
            ),
            data={"field": "created_range"},
        )

    data = await admin_user_profile_service.get_users(
        user_id=user_id,
        email=email,
        status=status,
        created_from_ms=created_start,
        created_to_ms=created_end,
        page=page,
        page_size=page_size,
    )
    return ResponseUtils.ok(data.model_dump())


@router.get("/{user_id}/profile")
async def get_admin_user_profile(
    user_id: UserIdPath,
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """读取用户基础信息、Credits 和订阅摘要。"""
    data = await admin_user_profile_service.get_profile(user_id)
    return ResponseUtils.ok(data.model_dump())


@router.get("/{user_id}/orders")
async def list_admin_user_orders(
    user_id: UserIdPath,
    page: int = Query(default=1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(default=20, ge=1, le=100, description="每页数量"),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """分页读取用户全部订单，不按成功/失败或状态过滤。"""
    data = await admin_user_profile_service.get_orders(
        user_id=user_id,
        page=page,
        page_size=page_size,
    )
    return ResponseUtils.ok(data.model_dump())


@router.get("/{user_id}/credits")
async def list_admin_user_credits(
    user_id: UserIdPath,
    page: int = Query(default=1, ge=1, description="页码，从 1 开始"),
    page_size: int = Query(default=20, ge=1, le=100, description="每页数量"),
    _admin: AdminContext = Depends(get_admin_user),
) -> JSONResponse:
    """按流水 ID 倒序分页读取用户积分记录。"""
    data = await admin_user_profile_service.get_credits(
        user_id=user_id,
        page=page,
        page_size=page_size,
    )
    return ResponseUtils.ok(data.model_dump())


__all__ = ["router"]
