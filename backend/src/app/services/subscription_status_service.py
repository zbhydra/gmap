"""客户端订阅状态响应组装服务。"""

from app.constants.quota import QuotaTypeEnum
from app.constants.subscription import SubscriptionProductMetadata
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.services.payment_config_service import SubscriptionProductConfig
from app.services.quota_service import quota_service
from app.services.subscription_service import subscription_service
from app.utils.logger import logger
from app.utils.time import get_today_date

_SUBSCRIPTION_STATUS_UNAVAILABLE = "unavailable"


def _daily_quota_status(*, used: int, limit: int) -> dict[str, int]:
    """构建结构化每日额度响应。"""
    if limit == -1:
        return {"use": 0, "remaining": -1, "limit": -1}
    return {"use": used, "remaining": max(0, limit - used), "limit": limit}


def _unavailable_quota_status() -> dict[str, int]:
    """构建配置异常时的保守额度展示值。"""
    return {"use": 0, "remaining": 0, "limit": 0}


class SubscriptionStatusService:
    """复用同一套订阅配置和 quota 读数构建客户端状态。"""

    async def build_status_data(
        self,
        *,
        user_id: int,
        quota_u_id: str,
    ) -> dict[str, object]:
        """构建订阅状态 data，供 /status 与 /auth/me 复用同一额度契约。"""

        try:
            (
                subscription,
                config,
                metadata,
            ) = await self._load_subscription_metadata(user_id)
        except AppCommonException as exc:
            if exc.code != CommonCode.PAYMENT_GATEWAY_ERROR:
                raise
            logger.error(
                "subscription_status_config_unavailable: "
                f"user_id={user_id}, quota_u_id={quota_u_id}, "
                f"code={exc.code}, ext_msg={exc.ext_msg}",
                exc_info=True,
            )
            return self._unavailable_status_data()

        extension_download_used = await quota_service.get(
            quota_u_id,
            QuotaTypeEnum.EXTENSION_DOWNLOAD,
        )
        extension_download = _daily_quota_status(
            used=extension_download_used,
            limit=metadata.daily_limit,
        )

        return {
            "period": config.period,
            "display_name": config.name,
            "expires_at": subscription.expires_at,
            "daily_limit": extension_download["limit"],
            "used": extension_download["use"],
            "remaining": extension_download["remaining"],
            "extension_download": extension_download,
            "reset_date": get_today_date(),
            "auto_renew": metadata.auto_renew,
            "status": "active",
        }

    async def _load_subscription_metadata(
        self,
        user_id: int,
    ) -> tuple[
        UserSubscriptionModel,
        SubscriptionProductConfig,
        SubscriptionProductMetadata,
    ]:
        """读取用户订阅记录、商品配置和 metadata。"""

        subscription, config = await subscription_service.get_user_subscription_config(
            user_id
        )
        metadata = SubscriptionProductMetadata.from_metadata(
            config.metadata,
            product_id=config.product_id,
            period=config.period,
        )
        return subscription, config, metadata

    def _unavailable_status_data(self) -> dict[str, object]:
        """订阅配置异常时返回可渲染状态，不阻断账户和 Credits 业务。"""

        quota = _unavailable_quota_status()
        return {
            "period": _SUBSCRIPTION_STATUS_UNAVAILABLE,
            "display_name": "Subscription unavailable",
            "expires_at": None,
            "daily_limit": quota["limit"],
            "used": quota["use"],
            "remaining": quota["remaining"],
            "extension_download": quota,
            "reset_date": get_today_date(),
            "auto_renew": False,
            "status": _SUBSCRIPTION_STATUS_UNAVAILABLE,
        }


subscription_status_service = SubscriptionStatusService()
