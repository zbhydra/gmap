"""管理后台通用用户信息弹窗聚合服务。

本服务只读聚合用户基础资料、Credits、订阅和订单记录。它服务 admin
排查界面，允许跨业务域读取，但不写入任何业务数据。
"""

from __future__ import annotations


from app.api.admin.admin_order_response import serialize_admin_order
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.user_model import UserModel
from app.schemas.admin_user_schema import (
    AdminUserAccountStatus,
    AdminUserBasicInfo,
    AdminUserCreditsInfo,
    AdminUserOrderRecordData,
    AdminUserOrdersPageData,
    AdminUserProfileData,
    AdminUserSubscriptionInfo,
)
from app.services.order_service import order_service
from app.services.subscription_service import subscription_service
from app.services.user_credit_service import user_credit_service
from app.services.user_service import user_service
from app.utils.time import timestamp_now


class AdminUserProfileService:
    """Admin 用户信息弹窗聚合服务。"""

    async def get_profile(self, user_id: int) -> AdminUserProfileData:
        """读取用户基础信息、Credits 余额和订阅摘要。"""
        user = await self._get_user(user_id, action="admin_user_profile")
        balance = await user_credit_service.get_balance(user_id)
        subscription = await subscription_service.get_by_id(user_id)
        expires_at = subscription.expires_at if subscription else None

        return AdminUserProfileData(
            user=self._build_user_info(user),
            credits=AdminUserCreditsInfo(balance=balance),
            subscription=AdminUserSubscriptionInfo(
                has_subscription=(
                    expires_at is not None and expires_at > timestamp_now()
                ),
                expires_at=expires_at,
            ),
        )

    async def get_orders(
        self,
        *,
        user_id: int,
        page: int,
        page_size: int,
    ) -> AdminUserOrdersPageData:
        """分页读取用户全部订单，不按订单状态或履约状态过滤。"""
        user = await self._get_user(user_id, action="admin_user_orders")
        offset = (page - 1) * page_size
        orders = await order_service.order_lists(
            user_ids=[user_id],
            offset=offset,
            limit=page_size,
            order_by="created_at_desc",
        )
        total = await order_service.count_orders(user_ids=[user_id])
        user_email = user.email or ""

        return AdminUserOrdersPageData(
            rows=[
                AdminUserOrderRecordData.model_validate(
                    serialize_admin_order(order, user_email)
                )
                for order in orders
            ],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def _get_user(self, user_id: int, *, action: str) -> UserModel:
        """读取用户；不存在时抛定位明确的业务错误。"""
        users = await user_service.user_lists(user_ids=[user_id], limit=1)
        if users:
            return users[0]
        raise AppCommonException(
            CommonCode.USER_NOT_FOUND,
            ext_msg=f"{action}: user not found: user_id={user_id}",
            data={"user_id": user_id},
        )

    def _build_user_info(self, user: UserModel) -> AdminUserBasicInfo:
        """构建弹窗基础用户信息。"""
        return AdminUserBasicInfo(
            user_id=user.user_id,
            email=user.email,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            register_source=user.register_source,
            register_method=user.register_method,
            register_user_agent=user.register_user_agent,
            register_ip=user.register_ip,
            register_country=user.register_country,
            last_login_at=user.last_login_at,
            last_login_ip=user.last_login_ip,
            last_login_country=user.last_login_country,
            last_operation_ip=user.last_operation_ip,
            last_operation_country=user.last_operation_country,
            login_count=user.login_count,
            locked_until=user.locked_until,
            is_del=user.is_del,
            account_status=self._account_status(user),
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    def _account_status(self, user: UserModel) -> AdminUserAccountStatus:
        """把用户状态压成前端稳定枚举。"""
        if user.is_del:
            return "deleted"
        if user.is_locked():
            return "locked"
        return "normal"


admin_user_profile_service = AdminUserProfileService()
