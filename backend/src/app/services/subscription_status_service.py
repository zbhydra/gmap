"""客户端订阅状态响应组装服务。"""

from app.constants.subscription import SubscriptionProductMetadata
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.services.payment_config_service import SubscriptionProductConfig
from app.services.subscription_service import subscription_service
from app.utils.logger import logger

_SUBSCRIPTION_STATUS_UNAVAILABLE = "unavailable"


class SubscriptionStatusService:
    """复用同一套订阅配置构建客户端订阅状态。"""

    async def build_status_data(
        self,
        *,
        user_id: int,
    ) -> dict[str, object]:
        """构建订阅状态 data，供 /status 与 /auth/me 复用同一契约。"""

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
                f"user_id={user_id}, "
                f"code={exc.code}, ext_msg={exc.ext_msg}",
                exc_info=True,
            )
            return self._unavailable_status_data()

        return {
            "period": config.period,
            "display_name": config.name,
            "expires_at": subscription.expires_at,
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

        return {
            "period": _SUBSCRIPTION_STATUS_UNAVAILABLE,
            "display_name": "Subscription unavailable",
            "expires_at": None,
            "auto_renew": False,
            "status": _SUBSCRIPTION_STATUS_UNAVAILABLE,
        }


subscription_status_service = SubscriptionStatusService()
