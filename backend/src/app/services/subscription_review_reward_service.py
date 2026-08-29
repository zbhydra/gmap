"""好评赠送订阅的账号级互斥与跨服务编排。"""

from dataclasses import dataclass
from typing import Literal

from app.constants.counter import CounterId
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.config_public_service import config_public_service
from app.services.counter_service import counter_service
from app.services.subscription_service import subscription_service
from app.utils.logger import logger
from app.utils.redis_lock import RedisLock

# 好评赠送活动在 config_public 中的布尔开关键。
SUBSCRIPTION_REVIEW_REWARD_CONFIG_KEY = "subscription_review_reward"
_REVIEW_REWARD_DURATION_DAYS = 7
_REVIEW_REWARD_LOCK_TTL_SECONDS = 5
_REVIEW_REWARD_LOCK_TIMEOUT_SECONDS = 1
_review_reward_lock = RedisLock()


@dataclass(frozen=True, slots=True)
class SubscriptionReviewRewardClaimResult:
    """一次领取请求的稳定业务结果。"""

    result: Literal["granted", "already_claimed"]
    review_reward_claimed_count: int


class SubscriptionReviewRewardService:
    """用永久 Counter 幂等领取，并在独立事务中延长订阅。"""

    async def is_enabled(self) -> bool:
        """读取活动开关；只有 JSON 布尔值 true 表示开启。"""

        raw_config = await config_public_service.get(
            SUBSCRIPTION_REVIEW_REWARD_CONFIG_KEY
        )
        return raw_config is True

    async def claim(self, user_id: int) -> SubscriptionReviewRewardClaimResult:
        """领取一次 7 天订阅，重复领取按成功幂等返回。"""

        if not await self.is_enabled():
            raise AppCommonException(
                CommonCode.INVALID_REQUEST,
                ext_msg=(
                    "subscription_review_reward_claim: campaign disabled: "
                    f"user_id={user_id}, c_key={SUBSCRIPTION_REVIEW_REWARD_CONFIG_KEY}"
                ),
            )

        lock_key = f"subscription_review_reward:{user_id}"
        try:
            lock_value = await _review_reward_lock.acquire(
                lock_key,
                ttl=_REVIEW_REWARD_LOCK_TTL_SECONDS,
                timeout=_REVIEW_REWARD_LOCK_TIMEOUT_SECONDS,
            )
        except Exception as exc:
            # 互斥底座不可用时必须 fail-closed，避免多个请求同时赠送。
            logger.error(
                "subscription_review_reward_claim: Redis lock acquire failed: "
                f"user_id={user_id}, lock_key={lock_key}, error={exc}",
                exc_info=True,
            )
            raise self._busy_error(
                user_id, lock_key, reason="redis_unavailable"
            ) from exc

        if lock_value is None:
            raise self._busy_error(user_id, lock_key, reason="lock_timeout")

        try:
            claimed_count = await counter_service.get(
                user_id,
                CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
            )
            if claimed_count > 0:
                return SubscriptionReviewRewardClaimResult(
                    result="already_claimed",
                    review_reward_claimed_count=claimed_count,
                )

            # 两次调用各自提交事务；Counter 成功而订阅失败是活动明确接受的结果。
            await counter_service.add(
                user_id,
                CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
                1,
            )
            await subscription_service.extend_subscription_days(
                user_id=user_id,
                duration_days=_REVIEW_REWARD_DURATION_DAYS,
            )
            return SubscriptionReviewRewardClaimResult(
                result="granted",
                review_reward_claimed_count=claimed_count + 1,
            )
        finally:
            await _review_reward_lock.release(lock_key, lock_value)

    def _busy_error(
        self,
        user_id: int,
        lock_key: str,
        *,
        reason: str,
    ) -> AppCommonException:
        """构造领取互斥失败的统一可重试错误。"""

        return AppCommonException(
            CommonCode.SUBSCRIPTION_REVIEW_REWARD_BUSY,
            ext_msg=(
                "subscription_review_reward_claim: account lock unavailable: "
                f"user_id={user_id}, lock_key={lock_key}, reason={reason}"
            ),
        )


subscription_review_reward_service = SubscriptionReviewRewardService()
