"""订阅周期常量和商品 metadata 配置。"""

import enum
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

# 产品线标识（006 扩展，C2 裁决的分产品订阅）：订阅按产品线隔离权益，
# 同一账号可同时持有不同产品线的有效订阅，互不冲突也互不续期。
# extension = 插件下载 Unlimited（历史单产品线的兜底默认值，旧数据行为不变）；
# maps_extension = MapsGrab 插件采集订阅（maps_extension_pro / maps_extension_business）。
EXTENSION_PRODUCT_LINE = "extension"
MAPS_EXTENSION_PRODUCT_LINE = "maps_extension"

# maps_extension 产品线付费商品（C2 套餐口径：Pro $39 100,000 / Business $99 500,000 records/月）。
MAPS_EXTENSION_PRO_PRODUCT_ID = "maps_extension_pro"
MAPS_EXTENSION_BUSINESS_PRODUCT_ID = "maps_extension_business"

# MapsGrab 新增订阅产品线（006 扩展）：online = 网页采集套餐（records/月），
# api = API 调用套餐（requests/月）。均为一次性支付月度套餐。
MAPS_ONLINE_PRODUCT_LINE = "maps_online"
MAPS_API_PRODUCT_LINE = "maps_api"

# maps_online 产品线付费商品（records/月额度档位）。
ONLINE_LITE_PRODUCT_ID = "online_lite"
ONLINE_BASIC_PRODUCT_ID = "online_basic"
ONLINE_GROWTH_PRODUCT_ID = "online_growth"
ONLINE_PRO_PRODUCT_ID = "online_pro"

# maps_api 产品线付费商品（requests/月额度档位）。
API_BASIC_PRODUCT_ID = "api_basic"
API_PROFESSIONAL_PRODUCT_ID = "api_professional"
API_BUSINESS_PRODUCT_ID = "api_business"
API_SCALE_PRODUCT_ID = "api_scale"


class SubscriptionProductMetadata(BaseModel):
    """订阅商品 metadata 配置。"""

    model_config = ConfigDict(extra="ignore")

    auto_renew: bool = Field(default=False, description="是否自动续费")
    # 产品线月度权益额度；单位由产品线定义：maps_extension/maps_online = records/月，
    # maps_api = requests/月；无额度概念的产品线留空。
    monthly_quota: int | None = Field(default=None, description="月度权益额度数")

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

        if is_free and "auto_renew" not in metadata:
            metadata["auto_renew"] = False

        return metadata

    @field_validator("auto_renew", mode="before")
    @classmethod
    def _validate_auto_renew(cls, value: object) -> bool:
        """自动续费开关必须是 JSON bool，避免配置含义漂移。"""
        if not isinstance(value, bool):
            raise ValueError(f"must be boolean, value={value!r}")
        return value

    @field_validator("monthly_quota", mode="before")
    @classmethod
    def _validate_monthly_quota(cls, value: object) -> int | None:
        """月度额度必须是正整数或缺省；0/负数一律按配置错误拒绝。"""
        if value is None:
            return None
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(f"must be a positive integer or null, value={value!r}")
        if value <= 0:
            raise ValueError(f"must be a positive integer or null, value={value!r}")
        return value


def _format_metadata_errors(exc: ValidationError) -> str:
    """把 metadata 校验错误压成可定位字段。"""
    return "; ".join(
        f"{'.'.join(str(part) for part in error.get('loc', ()))}: "
        f"{error.get('msg', str(exc))}"
        for error in exc.errors()
    )
