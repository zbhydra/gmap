"""统一每日额度服务。

本服务只负责按服务器本地自然日统计额度：
1. 调用方传入用户 ID 或设备 ID 字符串。
2. 服务按 quota:{type}:{u_id}:{YYYYMMDD} 读写 Redis。
3. 消耗额度时用 Redis Lua 原子完成校验、扣减和过期时间设置。
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import TypeGuard

from app.constants.quota import (
    ALL_QUOTA_TYPES,
    QuotaTypeEnum,
    normalize_quota_type,
)
from app.constants.subscription import SubscriptionProductMetadata
from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.subscription_service import subscription_service
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key
from app.utils.time import (
    get_today_date,
    get_tomorrow_start_timestamp,
    timestamp_now,
)


_QUOTA_SET_SCRIPT = """
local key = KEYS[1]
local number = tonumber(ARGV[1])
local daily_limit = tonumber(ARGV[2])
local expire_at = tonumber(ARGV[3])

local current = tonumber(redis.call('GET', key)) or 0
if current + number > daily_limit then
    return {0, current, 0}
end

local new_used = redis.call('INCRBY', key, number)
redis.call('EXPIREAT', key, expire_at)
return {1, new_used, daily_limit - new_used}
"""


@dataclass(frozen=True, slots=True)
class QuotaSetResult:
    """每日额度消耗结果。"""

    allowed: bool
    used: int
    remaining: int
    reset_at: int


class QuotaService:
    """统一每日额度读写服务。"""

    async def get(self, u_id: str, quota_type: int | QuotaTypeEnum) -> int:
        """读取指定作用域当天指定类型的已用额度。"""
        normalized_type = normalize_quota_type(quota_type)
        key = self.build_quota_key(u_id, normalized_type)
        try:
            redis = await redis_client.get_client()
            value = await redis.get(key)
        except Exception as exc:
            logger.error(
                "quota_service_get_failed: "
                f"u_id={u_id}, quota_type={int(normalized_type)}, "
                f"key={key}, error={type(exc).__name__}: {exc}",
                exc_info=True,
            )
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg=(
                    "quota_service.get: Redis quota read failed, "
                    f"u_id={u_id}, quota_type={int(normalized_type)}, "
                    f"key={key}, error={type(exc).__name__}: {exc}"
                ),
            ) from exc
        return _parse_redis_int(value)

    async def get_lists(self, u_id: str) -> dict[int, int]:
        """一次读取指定作用域当天所有额度类型的已用次数。"""
        self._validate_u_id(u_id)
        keys = [
            self.build_quota_key(u_id, quota_type) for quota_type in ALL_QUOTA_TYPES
        ]
        try:
            redis = await redis_client.get_client()
            values = await redis.mget(keys)
        except Exception as exc:
            logger.error(
                "quota_service_get_lists_failed: "
                f"u_id={u_id}, keys={keys}, error={type(exc).__name__}: {exc}",
                exc_info=True,
            )
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg=(
                    "quota_service.get_lists: Redis quota list read failed, "
                    f"u_id={u_id}, keys={keys}, error={type(exc).__name__}: {exc}"
                ),
            ) from exc

        return {
            int(quota_type): _parse_redis_int(values[index])
            for index, quota_type in enumerate(ALL_QUOTA_TYPES)
        }

    async def set(
        self,
        u_id: str,
        quota_type: int | QuotaTypeEnum,
        number: int,
    ) -> QuotaSetResult:
        """尝试消耗指定数量的当天额度。"""
        normalized_type = normalize_quota_type(quota_type)
        self._validate_u_id(u_id)
        self._validate_number(number)

        reset_at = self.next_reset_at()
        daily_limit = await self.resolve_quota_limit(u_id, normalized_type)
        if daily_limit == -1:
            return QuotaSetResult(
                allowed=True,
                used=0,
                remaining=-1,
                reset_at=reset_at,
            )

        key = self.build_quota_key(u_id, normalized_type)
        expire_at = reset_at // 1000
        try:
            redis = await redis_client.get_client()
            raw_result = await redis.eval(
                _QUOTA_SET_SCRIPT,
                1,
                key,
                number,
                daily_limit,
                expire_at,
            )
        except Exception as exc:
            logger.error(
                "quota_service_set_failed: "
                f"u_id={u_id}, quota_type={int(normalized_type)}, number={number}, "
                f"limit={daily_limit}, key={key}, error={type(exc).__name__}: {exc}",
                exc_info=True,
            )
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg=(
                    "quota_service.set: Redis quota consume failed, "
                    f"u_id={u_id}, quota_type={int(normalized_type)}, "
                    f"number={number}, error={type(exc).__name__}: {exc}"
                ),
            ) from exc

        if not isinstance(raw_result, list) or len(raw_result) != 3:
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg=(
                    "quota_service.set: invalid Redis Lua result, "
                    f"u_id={u_id}, quota_type={int(normalized_type)}, "
                    f"result={raw_result!r}"
                ),
            )

        allowed_value, used_value, remaining_value = raw_result
        if not all(
            _is_redis_int_value(value)
            for value in (allowed_value, used_value, remaining_value)
        ):
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg=(
                    "quota_service.set: Redis Lua result contains non-integer values, "
                    f"u_id={u_id}, quota_type={int(normalized_type)}, "
                    f"result={raw_result!r}"
                ),
            )

        return QuotaSetResult(
            allowed=int(allowed_value) == 1,
            used=int(used_value),
            remaining=int(remaining_value),
            reset_at=reset_at,
        )

    def build_quota_key(
        self,
        u_id: str,
        quota_type: int | QuotaTypeEnum,
    ) -> str:
        """构建当天每日额度 Redis key。"""
        self._validate_u_id(u_id)
        normalized_type = normalize_quota_type(quota_type)
        ymd = get_today_date().replace("-", "")
        return build_redis_key(f"quota:{int(normalized_type)}:{u_id}:{ymd}")

    async def resolve_quota_limit(
        self,
        u_id: str,
        quota_type: QuotaTypeEnum,
    ) -> int:
        """按作用域和额度类型解析当前每日额度上限。"""
        self._validate_u_id(u_id)
        user_id = int(u_id) if u_id.isdigit() and int(u_id) > 0 else 0
        if quota_type in (QuotaTypeEnum.WEB_DOWNLOAD, QuotaTypeEnum.WEB_PLAY):
            return 0
        if quota_type == QuotaTypeEnum.EXTENSION_DOWNLOAD:
            _subscription, config = (
                await subscription_service.get_user_subscription_config(user_id)
            )
            metadata = SubscriptionProductMetadata.from_metadata(
                config.metadata,
                product_id=config.product_id,
                period=config.period,
            )
            return metadata.daily_limit

        raise ValueError(f"Unsupported quota_type: {quota_type!r}")

    @staticmethod
    def seconds_at_next_local_midnight() -> int:
        """返回当前服务器本地时间距离次日 00:00 的秒数。"""
        remaining_ms = get_tomorrow_start_timestamp() - timestamp_now()
        return max(1, (remaining_ms + 999) // 1000)

    @staticmethod
    def next_reset_at() -> int:
        """返回每日额度下一次刷新的毫秒时间戳。"""
        return get_tomorrow_start_timestamp()

    @staticmethod
    def _validate_u_id(u_id: str) -> None:
        """校验额度作用域 ID。"""
        if not isinstance(u_id, str):
            raise ValueError(f"u_id must be string, type={type(u_id).__name__}")
        if not u_id:
            raise ValueError("u_id must not be empty")
        if ":" in u_id:
            raise ValueError(f"u_id must not contain ':', value={u_id!r}")

    @staticmethod
    def _validate_number(number: int) -> None:
        """校验单次额度消耗数量。"""
        if isinstance(number, bool) or not isinstance(number, int):
            raise ValueError(
                f"quota number must be integer, type={type(number).__name__}"
            )
        if number <= 0:
            raise ValueError(f"quota number must be positive, value={number}")
        if number > 10000:
            raise ValueError(f"quota number too large, value={number}, max=10000")


def _parse_redis_int(value: object) -> int:
    """把 Redis 字符串值解析成整数；缺失或异常值按 0 展示。"""
    if value is None:
        return 0
    try:
        if _is_redis_int_value(value):
            return int(value)
        return 0
    except (TypeError, ValueError):
        return 0


def _is_redis_int_value(
    value: object,
) -> TypeGuard[str | bytes | bytearray | int | float]:
    """收窄 Redis 中可按整数读取的标量类型。"""
    return isinstance(value, (str, bytes, bytearray, int, float))


quota_service = QuotaService()
