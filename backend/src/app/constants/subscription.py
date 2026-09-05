"""订阅周期常量和商品 metadata 配置。"""

import enum
from collections.abc import Mapping

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    ValidationError,
    field_validator,
)

from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode


class SubscriptionPeriodEnum(str, enum.Enum):
    """订阅周期枚举"""

    NONE = "none"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


FREE_SUBSCRIPTION_PRODUCT_ID = "free"

# 产品线标识（006 扩展，C2 裁决的分产品订阅）：订阅按产品线隔离权益，
# 同一账号可同时持有不同产品线的有效订阅，互不冲突也互不续期。
MAPS_EXTENSION_PRODUCT_KIND = "maps_extension"

# maps_extension 产品线付费商品（C2 套餐口径：Pro $39 100,000 / Business $99 500,000 records/月）。
MAPS_EXTENSION_PRO_PRODUCT_ID = "maps_extension_pro"
MAPS_EXTENSION_BUSINESS_PRODUCT_ID = "maps_extension_business"

# MapsGrab 新增订阅产品线（006 扩展）：online = 网页采集套餐（records/月），
# api = API 调用套餐（requests/月）。均为一次性支付月度套餐。
MAPS_ONLINE_PRODUCT_KIND = "maps_online"
MAPS_API_PRODUCT_KIND = "maps_api"

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

# 全部订阅产品线：客户端按线查询订阅状态（如 /subscription/status?product_kind=）
# 的合法值域。
SUBSCRIPTION_PRODUCT_KINDS = (
    MAPS_EXTENSION_PRODUCT_KIND,
    MAPS_ONLINE_PRODUCT_KIND,
    MAPS_API_PRODUCT_KIND,
)


# 订阅订单快照 purpose=upgrade：一次性线差额订单履约分支的识别标记。
SUBSCRIPTION_UPGRADE_PURPOSE = "upgrade"


class SubscriptionUpgradeQuoteReason(str, enum.Enum):
    """升级报价不可升级原因（upgrade-quote 响应合同仅此四值）。"""

    NO_ACTIVE_SUBSCRIPTION = "no_active_subscription"
    NOT_HIGHER_TIER = "not_higher_tier"
    NON_POSITIVE_DIFF = "non_positive_diff"
    CHANNEL_UNAVAILABLE = "channel_unavailable"


class SubscriptionProductMetadata(BaseModel):
    """订阅商品 metadata 配置。"""

    model_config = ConfigDict(extra="ignore")

    # 产品线月度权益额度；单位由产品线定义：maps_extension/maps_online = records/月，
    # maps_api = requests/月；无额度概念的产品线留空。
    monthly_quota: int | None = Field(default=None, description="月度权益额度数")

    @classmethod
    def from_metadata(
        cls,
        metadata: Mapping[str, object],
        *,
        product_id: str,
    ) -> "SubscriptionProductMetadata":
        """解析订阅商品 metadata，错误信息带商品 ID。"""
        try:
            return cls.model_validate(metadata)
        except ValidationError as exc:
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "subscription metadata invalid: "
                    f"product_id={product_id}, "
                    f"errors={_format_metadata_errors(exc)}"
                ),
            ) from exc

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
