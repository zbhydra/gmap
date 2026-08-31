"""Maps 月度配额服务测试（U7 + 006 额度映射）。

免费档行为回归（013 U7）：无套餐用户恒按免费配额计数，门控语义不变；
付费映射（006 扩展）：登录用户持有未过期 Maps 订阅时 total 切到套餐额度，
到期/异常回退免费配额。Redis 扣减脚本不在本文件覆盖（real 测试覆盖）。
"""

import pytest

from app.constants.maps_usage import DEFAULT_FREE_QUOTA
from app.constants.subscription import MAPS_PRODUCT_LINE
from app.models.subscription_model import UserSubscriptionModel
from app.services import maps_usage_service as maps_usage_service_module
from app.services.config_public_service import config_public_service
from app.services.maps_usage_service import maps_usage_identity, maps_usage_service


def _plan_config(product_id: str, monthly_records: int | None) -> object:
    """构造 get_user_subscription_config 返回的 (订阅行, 商品配置) 元组。"""

    class _Config:
        pass

    config = _Config()
    config.product_id = product_id
    config.period = "month" if product_id != "free" else "free"
    config.metadata = (
        {"auto_renew": True, "monthly_records": monthly_records}
        if monthly_records is not None
        else {"auto_renew": True}
    )
    subscription = UserSubscriptionModel(  # type: ignore[call-arg]
        user_id=42,
        product_line=MAPS_PRODUCT_LINE,
        product_id=product_id,
        expires_at=1_981_231_144_935,
    )
    return subscription, config


@pytest.mark.asyncio
async def test_free_total_reads_config_public(monkeypatch):
    """免费档总量读 config_public maps_quota，非法值回退默认 1000（U7 行为不变）。"""

    async def fake_get_ok(c_key: str):
        assert c_key == "maps_quota"
        return 2000

    async def fake_get_invalid(c_key: str):
        return 0

    monkeypatch.setattr(config_public_service, "get", fake_get_ok)
    assert await maps_usage_service.get_total(0) == 2000

    monkeypatch.setattr(config_public_service, "get", fake_get_invalid)
    assert await maps_usage_service.get_total(0) == DEFAULT_FREE_QUOTA


@pytest.mark.asyncio
async def test_plan_quota_maps_monthly_records_for_active_maps_subscription(
    monkeypatch,
):
    """登录用户持有有效 Maps 订阅时，total 切换为所购档位 monthly_records。"""

    async def fake_get_config(user_id: int, product_line: str):
        assert user_id == 42
        assert product_line == MAPS_PRODUCT_LINE
        return _plan_config("maps_pro", 100_000)

    monkeypatch.setattr(
        maps_usage_service_module.subscription_service,
        "get_user_subscription_config",
        fake_get_config,
    )

    assert await maps_usage_service.get_total(42) == 100_000


@pytest.mark.asyncio
async def test_plan_quota_returns_none_without_active_subscription(monkeypatch):
    """无有效订阅（Free 占位）时回退免费配额，013 免费档行为不变。"""

    async def fake_get_config(user_id: int, product_line: str):
        subscription = UserSubscriptionModel(  # type: ignore[call-arg]
            user_id=user_id,
            product_line=product_line,
            expires_at=None,
        )
        free_config = type("Config", (), {})()
        free_config.product_id = "free"
        free_config.period = "free"
        free_config.metadata = {}
        return subscription, free_config

    async def fake_free_quota():
        return DEFAULT_FREE_QUOTA

    monkeypatch.setattr(
        maps_usage_service_module.subscription_service,
        "get_user_subscription_config",
        fake_get_config,
    )
    monkeypatch.setattr(maps_usage_service, "_get_free_quota", fake_free_quota)

    assert await maps_usage_service.get_total(42) == DEFAULT_FREE_QUOTA


@pytest.mark.asyncio
async def test_plan_quota_falls_back_to_free_when_tier_lacks_monthly_records(
    monkeypatch,
):
    """付费行存在但档位配置缺 monthly_records 时回退免费配额（不放大为不可用）。"""

    async def fake_get_config(user_id: int, product_line: str):
        return _plan_config("maps_pro", None)

    async def fake_free_quota():
        return DEFAULT_FREE_QUOTA

    monkeypatch.setattr(
        maps_usage_service_module.subscription_service,
        "get_user_subscription_config",
        fake_get_config,
    )
    monkeypatch.setattr(maps_usage_service, "_get_free_quota", fake_free_quota)

    assert await maps_usage_service.get_total(42) == DEFAULT_FREE_QUOTA


@pytest.mark.asyncio
async def test_plan_quota_falls_back_to_free_when_subscription_read_fails(monkeypatch):
    """订阅读取异常（DB 故障/配置缺失）时回退免费配额并记日志，不抛不可用。"""

    async def fake_get_config(user_id: int, product_line: str):
        raise RuntimeError("db unavailable")

    async def fake_free_quota():
        return DEFAULT_FREE_QUOTA

    monkeypatch.setattr(
        maps_usage_service_module.subscription_service,
        "get_user_subscription_config",
        fake_get_config,
    )
    monkeypatch.setattr(maps_usage_service, "_get_free_quota", fake_free_quota)

    assert await maps_usage_service.get_total(42) == DEFAULT_FREE_QUOTA


def test_identity_rules_unchanged():
    """归属键规则回归：登录按 user_id、匿名按 device_id（U7 语义不变）。"""

    assert maps_usage_identity(7, "device-x") == "u:7"
    assert maps_usage_identity(0, "device-x") == "d:device-x"
