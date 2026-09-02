"""管理后台通用用户信息弹窗与用户列表聚合服务。

本服务只读聚合用户基础资料、Credits、订阅、用量、积分记录和订单记录。
它服务 admin 排查界面，允许跨业务域读取，但不写入任何业务数据。
"""

from __future__ import annotations

from sqlalchemy import desc, func, select

from app.api.admin.admin_order_response import serialize_admin_order
from app.constants.auth import UserAccountStatus
from app.constants.subscription import (
    EXTENSION_PRODUCT_LINE,
    MAPS_API_PRODUCT_LINE,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_ONLINE_PRODUCT_LINE,
)
from app.core.database import get_async_session
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.user_credit_log_model import UserCreditLogModel
from app.models.user_model import UserModel
from app.schemas.admin_user_schema import (
    AdminUserBasicInfo,
    AdminUserCreditRecordData,
    AdminUserCreditsInfo,
    AdminUserCreditsPageData,
    AdminUserListItem,
    AdminUserOrderRecordData,
    AdminUserOrdersPageData,
    AdminUserProfileData,
    AdminUserSubscriptionLineInfo,
    AdminUserUsageLineInfo,
    AdminUsersPageData,
)
from app.services.order_service import order_service
from app.services.subscription_service import subscription_service
from app.services.usage_service import (
    api_usage_service,
    extension_usage_service,
    online_usage_service,
    usage_identity,
)
from app.services.user_credit_service import user_credit_service
from app.services.user_service import user_service
from app.utils.time import timestamp_now

# profile 订阅摘要固定四行，顺序 = extension 历史线在前、maps 三线在后。
_PROFILE_SUBSCRIPTION_LINES = (
    EXTENSION_PRODUCT_LINE,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_ONLINE_PRODUCT_LINE,
    MAPS_API_PRODUCT_LINE,
)

# profile 用量快照固定三行（maps 三线门面）。
_PROFILE_USAGE_SERVICES = (
    extension_usage_service,
    online_usage_service,
    api_usage_service,
)


class AdminUserProfileService:
    """Admin 用户信息弹窗与用户列表聚合服务。"""

    async def get_users(
        self,
        *,
        user_id: int | None,
        email: str | None,
        status: UserAccountStatus | None,
        created_from_ms: int | None,
        created_to_ms: int | None,
        page: int,
        page_size: int,
    ) -> AdminUsersPageData:
        """分页查询用户列表（含已注销用户，状态列区分）。"""
        user_ids = [user_id] if user_id is not None else None
        offset = (page - 1) * page_size
        users = await user_service.user_lists(
            user_ids=user_ids,
            email_like=email,
            status=status,
            created_from_ms=created_from_ms,
            created_to_ms=created_to_ms,
            offset=offset,
            limit=page_size,
        )
        total = await user_service.count_users(
            user_ids=user_ids,
            email_like=email,
            status=status,
            created_from_ms=created_from_ms,
            created_to_ms=created_to_ms,
        )

        return AdminUsersPageData(
            rows=[
                AdminUserListItem(
                    user_id=user.user_id,
                    email=user.email,
                    register_source=user.register_source,
                    register_method=user.register_method,
                    register_country=user.register_country,
                    account_status=user.account_status(),
                    login_count=user.login_count,
                    last_login_at=user.last_login_at,
                    created_at=user.created_at,
                )
                for user in users
            ],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_profile(self, user_id: int) -> AdminUserProfileData:
        """读取用户基础信息、Credits 余额、按线订阅摘要和 maps 三线用量快照。

        subscriptions 固定四行：无付费行（Free 不落库）与已过期行都压成
        has_subscription=False，过期行保留原始过期时间供排障。
        usage 固定三行：total 来自所持档位配置（含 free 档），配置合同
        破裂由 usage 门面抛 PAYMENT_GATEWAY_ERROR（fail-closed），不兜底。
        """
        user = await self._get_user(user_id, action="admin_user_profile")
        balance = await user_credit_service.get_balance(user_id)
        now_ms = timestamp_now()

        subscriptions = []
        for product_line in _PROFILE_SUBSCRIPTION_LINES:
            row = await subscription_service.get_subscription_row(user_id, product_line)
            expires_at = row.expires_at if row else None
            subscriptions.append(
                AdminUserSubscriptionLineInfo(
                    product_line=product_line,
                    has_subscription=(expires_at is not None and expires_at > now_ms),
                    expires_at=expires_at,
                )
            )

        identity = usage_identity(user_id, None)
        usage = []
        for facade in _PROFILE_USAGE_SERVICES:
            snapshot = await facade.get_usage(identity, user_id=user_id)
            usage.append(
                AdminUserUsageLineInfo(
                    product_line=facade.product_line,
                    ym=snapshot.ym,
                    used=snapshot.used,
                    total=snapshot.total,
                    exhausted=snapshot.exhausted,
                )
            )

        return AdminUserProfileData(
            user=self._build_user_info(user),
            credits=AdminUserCreditsInfo(balance=balance),
            subscriptions=subscriptions,
            usage=usage,
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

    async def get_credits(
        self,
        *,
        user_id: int,
        page: int,
        page_size: int,
    ) -> AdminUserCreditsPageData:
        """按流水 ID 倒序分页读取用户积分记录。"""
        await self._get_user(user_id, action="admin_user_credits")
        offset = (page - 1) * page_size
        model = UserCreditLogModel

        async with get_async_session() as db:
            total_result = await db.execute(
                select(func.count()).select_from(model).where(model.user_id == user_id)
            )
            rows_result = await db.execute(
                select(model)
                .where(model.user_id == user_id)
                .order_by(desc(model.id))
                .offset(offset)
                .limit(page_size)
            )
            total = int(total_result.scalar_one())
            records = list(rows_result.scalars().all())

        return AdminUserCreditsPageData(
            rows=[
                AdminUserCreditRecordData(
                    id=record.id,
                    change_amount=record.change_amount,
                    reason=record.reason,
                    metadata_json=record.metadata_json,
                    created_at=record.created_at,
                )
                for record in records
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
            account_status=user.account_status(),
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


admin_user_profile_service = AdminUserProfileService()
