"""订阅周期常量和商品 metadata 配置。"""

import enum
import math
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
    model_validator,
)

from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode


class SubscriptionPeriodEnum(str, enum.Enum):
    """订阅周期枚举"""

    FREE = "free"
    MONTH = "month"


FREE_SUBSCRIPTION_PRODUCT_ID = "free"
UNLIMITED_SUBSCRIPTION_PRODUCT_ID = "unlimited"
FREE_EXTENSION_DAILY_DOWNLOAD_LIMIT = 5


class SubscriptionProductMetadata(BaseModel):
    """订阅商品 metadata 配置。"""

    model_config = ConfigDict(extra="ignore")

    daily_limit: int = Field(description="插件端每日下载额度，-1 表示不限次数")
    extension_daily_download_limit: int = Field(description="插件端每日下载额度")
    auto_renew: bool = Field(default=False, description="是否自动续费")
    proxy_user_rate_limit_mb_per_second: float = Field(
        default=0,
        description="用户 proxy 下载限速，单位 MB/s",
    )

    @classmethod
    def from_metadata(
        cls,
        metadata: dict[str, Any],
        *,
        product_id: str,
        period: str | SubscriptionPeriodEnum | None = None,
    ) -> "SubscriptionProductMetadata":
        """解析订阅商品 metadata，错误信息带商品 ID。"""
        period_value = (
            period.value if isinstance(period, SubscriptionPeriodEnum) else period
        )
        try:
            return cls.model_validate(
                {**metadata, "_product_id": product_id, "_period": period_value}
            )
        except ValidationError as exc:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription metadata invalid: "
                    f"product_id={product_id}, period={period_value}, "
                    f"errors={_format_metadata_errors(exc)}"
                ),
            ) from exc

    @model_validator(mode="before")
    @classmethod
    def _normalize_legacy_fields(cls, value: object) -> object:
        """Free 补齐默认值，其余商品直接使用配置的权益和计费方式。"""
        if not isinstance(value, dict):
            return value

        metadata = dict(value)
        product_id = str(metadata.pop("_product_id", "")).strip().lower()
        period = str(metadata.pop("_period", "")).strip().lower()
        is_free = period == SubscriptionPeriodEnum.FREE.value or (
            product_id == FREE_SUBSCRIPTION_PRODUCT_ID
        )

        if (
            "daily_limit" not in metadata
            and "extension_daily_download_limit" in metadata
        ):
            metadata["daily_limit"] = metadata["extension_daily_download_limit"]

        if is_free:
            if "daily_limit" not in metadata:
                metadata["daily_limit"] = FREE_EXTENSION_DAILY_DOWNLOAD_LIMIT
            if "auto_renew" not in metadata:
                metadata["auto_renew"] = False
        if "extension_daily_download_limit" not in metadata:
            metadata["extension_daily_download_limit"] = metadata.get("daily_limit")

        return metadata

    @field_validator(
        "daily_limit",
        "extension_daily_download_limit",
        mode="before",
    )
    @classmethod
    def _validate_daily_limit(cls, value: object) -> int:
        """每日额度必须是 int，且 -1 表示不限次数。"""
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(f"must be integer, value={value!r}")
        if value < -1:
            raise ValueError(f"must be greater than or equal to -1, value={value}")
        return value

    @field_validator("proxy_user_rate_limit_mb_per_second", mode="before")
    @classmethod
    def _normalize_proxy_user_rate_limit(cls, value: object) -> float:
        """用户限速字段缺失或非法时按不限速处理。"""
        if (
            isinstance(value, bool)
            or not isinstance(value, int | float)
            or not math.isfinite(value)
        ):
            return 0
        return max(0, value)

    @field_validator("auto_renew", mode="before")
    @classmethod
    def _validate_auto_renew(cls, value: object) -> bool:
        """自动续费开关必须是 JSON bool，避免配置含义漂移。"""
        if not isinstance(value, bool):
            raise ValueError(f"must be boolean, value={value!r}")
        return value


def _format_metadata_errors(exc: ValidationError) -> str:
    """把 metadata 校验错误压成可定位字段。"""
    return "; ".join(
        f"{'.'.join(str(part) for part in error.get('loc', ()))}: "
        f"{error.get('msg', str(exc))}"
        for error in exc.errors()
    )
