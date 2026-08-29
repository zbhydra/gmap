"""统一每日额度 API 测试。"""

import pytest

from app.api.user_dependencies import (
    UserContext,
    get_current_user_optional,
)
from app.constants.client_product import ClientProductEnum
from app.constants.quota import QuotaTypeEnum
from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.main import app
from app.models.subscription_model import UserSubscriptionModel
from app.services.quota_service import QuotaSetResult, quota_service
from app.services.config_public_service import config_public_service
from app.services.payment_config_service import SubscriptionProductConfig
from app.services.subscription_service import subscription_service
from app.utils.time import get_today_date, get_tomorrow_start_timestamp


def _subscription_product(
    *,
    product_id: str,
    name: str,
    extension_daily_download_limit: int,
) -> SubscriptionProductConfig:
    """构造订阅商品 metadata 测试配置。"""
    return SubscriptionProductConfig(
        product_id=product_id,
        name=name,
        period=product_id,
        duration_days=0,
        display_currency="USD",
        display_amount=0,
        sort_order=0,
        metadata={
            "extension_daily_download_limit": extension_daily_download_limit,
            "auto_renew": product_id == "unlimited",
            "proxy_user_rate_limit_mb_per_second": 0,
        },
    )


@pytest.mark.asyncio
class TestWebQuotaAPI:
    @pytest.fixture(autouse=True)
    def _default_feedback_config(self, monkeypatch):
        """普通 API 测试不读取真实 config_public。"""

        async def fake_config_get_lists() -> dict[str, object]:
            return {}

        monkeypatch.setattr(config_public_service, "get_lists", fake_config_get_lists)

    async def test_subscription_status_returns_extension_quota_only(
        self, async_client, monkeypatch
    ):
        """订阅状态只返回插件下载额度，不承载 website 下载或播放额度。"""

        async def override_user() -> UserContext:
            return UserContext(
                user_id=42,
                token="test-token",
                device_id="device-web",
                client_product=ClientProductEnum.WEB,
            )

        async def fake_subscription(user_id: int):
            assert user_id == 42
            return (
                UserSubscriptionModel(
                    user_id=user_id,
                    expires_at=4_102_444_800_000,
                ),
                _subscription_product(
                    product_id="unlimited",
                    name="Unlimited",
                    extension_daily_download_limit=-1,
                ),
            )

        async def fake_get(u_id: str, quota_type: int | QuotaTypeEnum) -> int:
            assert u_id == "42"
            assert quota_type == QuotaTypeEnum.EXTENSION_DOWNLOAD
            return 5

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fake_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fake_get)

        try:
            response = await async_client.get(
                "/api/client/subscription/status",
                headers={"X-Client-Product": "web"},
            )
        finally:
            app.dependency_overrides.clear()

        body = response.json()
        assert response.status_code == 200
        assert body["code"] == 10000
        data = body["data"]
        assert data["extension_download"] == {
            "use": 0,
            "remaining": -1,
            "limit": -1,
        }
        assert data["daily_limit"] == -1
        assert data["used"] == 0
        assert data["remaining"] == -1
        assert "web_download" not in data
        assert "web_play" not in data
        assert "daily_play_limit" not in data
        assert "play_used" not in data
        assert "play_remaining" not in data
        assert "credits_balance" not in data
        assert data["reset_date"] == get_today_date()

    async def test_subscription_status_extension_mirrors_extension_download(
        self, async_client, monkeypatch
    ):
        """插件或缺省产品域继续用旧标量字段读取插件下载额度。"""

        async def override_user() -> UserContext:
            return UserContext(user_id=0, token="", device_id="device-extension")

        async def fake_subscription(user_id: int):
            assert user_id == 0
            return (
                UserSubscriptionModel(
                    user_id=0,
                    expires_at=None,
                ),
                _subscription_product(
                    product_id="free",
                    name="免费版",
                    extension_daily_download_limit=5,
                ),
            )

        async def fake_get(u_id: str, quota_type: int | QuotaTypeEnum) -> int:
            assert u_id == "device-extension"
            assert quota_type == QuotaTypeEnum.EXTENSION_DOWNLOAD
            return 3

        async def fake_config_get_lists() -> dict[str, object]:
            return {
                "extension_telegram_feedback_url": "  https://t.me/+pytest-feedback  ",
                "extension_telegram_feedback_group_username": "  pytest_feedback  ",
            }

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fake_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fake_get)
        monkeypatch.setattr(config_public_service, "get_lists", fake_config_get_lists)

        try:
            response = await async_client.get("/api/client/subscription/status")
        finally:
            app.dependency_overrides.clear()

        body = response.json()
        assert response.status_code == 200
        assert body["code"] == 10000
        data = body["data"]
        assert data["extension_download"] == {
            "use": 3,
            "remaining": 2,
            "limit": 5,
        }
        assert data["daily_limit"] == 5
        assert data["used"] == 3
        assert data["remaining"] == 2
        assert data["telegram_feedback_url"] == "https://t.me/+pytest-feedback"
        assert data["telegram_feedback_group_username"] == "pytest_feedback"
        assert "web_download" not in data
        assert "web_play" not in data
        assert "daily_play_limit" not in data
        assert "play_used" not in data
        assert "play_remaining" not in data
        assert "credits_balance" not in data

    async def test_subscription_status_rejects_numeric_anonymous_device_id(
        self, async_client, monkeypatch
    ):
        """匿名纯数字设备 ID 不允许作为 quota uid，避免和 user_id 共用命名空间。"""

        async def fail_subscription(user_id: int):
            raise AssertionError(f"subscription should not be called: {user_id}")

        async def fail_get(u_id: str, quota_type: int | QuotaTypeEnum):
            raise AssertionError(f"quota should not be called: {u_id}")

        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fail_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fail_get)

        response = await async_client.get(
            "/api/client/subscription/status",
            headers={"X-Device-Id": "123456"},
        )
        body = response.json()

        assert response.status_code == 200
        assert body["code"] == CommonCode.QUOTA_INVALID_REQUEST.value

    async def test_subscription_status_quota_read_failure_fails_closed(
        self, async_client, monkeypatch
    ):
        """订阅状态读取 quota 失败时不能返回伪 0。"""

        async def override_user() -> UserContext:
            return UserContext(
                user_id=42,
                token="test-token",
                device_id="device-web",
                client_product=ClientProductEnum.WEB,
            )

        async def fake_subscription(user_id: int):
            assert user_id == 42
            return (
                UserSubscriptionModel(
                    user_id=user_id,
                    expires_at=None,
                ),
                _subscription_product(
                    product_id="free",
                    name="免费版",
                    extension_daily_download_limit=5,
                ),
            )

        async def fail_get(u_id: str, quota_type: int | QuotaTypeEnum) -> int:
            assert u_id == "42"
            assert quota_type == QuotaTypeEnum.EXTENSION_DOWNLOAD
            raise AppCommonException(
                CommonCode.QUOTA_INVALID_REQUEST,
                ext_msg="test Redis mget failed",
            )

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fake_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fail_get)

        try:
            response = await async_client.get(
                "/api/client/subscription/status",
                headers={"X-Client-Product": "web"},
            )
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 200
        body = response.json()
        assert body["code"] == CommonCode.QUOTA_INVALID_REQUEST.value
        assert body["data"] == {}

    async def test_subscription_status_config_failure_degrades(
        self, async_client, monkeypatch
    ):
        """订阅配置异常只返回状态不可用，不阻断插件初始化。"""

        async def override_user() -> UserContext:
            return UserContext(
                user_id=42,
                token="test-token",
                device_id="device-web",
                client_product=ClientProductEnum.WEB,
            )

        async def fail_subscription(user_id: int):
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "test_subscription_status_config_failure_degrades: "
                    f"broken subscription config, user_id={user_id}"
                ),
            )

        async def fail_get(u_id: str, quota_type: int | QuotaTypeEnum):
            raise AssertionError(f"quota should not be called: {u_id}")

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fail_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fail_get)

        try:
            response = await async_client.get(
                "/api/client/subscription/status",
                headers={"X-Client-Product": "web"},
            )
        finally:
            app.dependency_overrides.clear()

        body = response.json()
        assert response.status_code == 200
        assert body["code"] == 10000
        assert body["data"]["status"] == "unavailable"
        assert body["data"]["period"] == "unavailable"
        assert body["data"]["daily_limit"] == 0
        assert "web_download" not in body["data"]
        assert "web_play" not in body["data"]

    async def test_subscription_status_returns_empty_feedback_url_when_not_configured(
        self, async_client, monkeypatch
    ):
        """反馈群未配置时返回空字符串，插件保持入口隐藏。"""

        async def override_user() -> UserContext:
            return UserContext(user_id=0, token="", device_id="device-no-feedback")

        async def fake_subscription(user_id: int):
            assert user_id == 0
            return (
                UserSubscriptionModel(user_id=0, expires_at=None),
                _subscription_product(
                    product_id="free",
                    name="免费版",
                    extension_daily_download_limit=5,
                ),
            )

        async def fake_get(u_id: str, quota_type: int | QuotaTypeEnum) -> int:
            assert u_id == "device-no-feedback"
            assert quota_type == QuotaTypeEnum.EXTENSION_DOWNLOAD
            return 0

        async def fake_config_get_lists() -> dict[str, object]:
            return {
                "extension_telegram_feedback_url": None,
                "extension_telegram_feedback_group_username": False,
            }

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(
            subscription_service,
            "get_user_subscription_config",
            fake_subscription,
        )
        monkeypatch.setattr(quota_service, "get", fake_get)
        monkeypatch.setattr(config_public_service, "get_lists", fake_config_get_lists)

        try:
            response = await async_client.get("/api/client/subscription/status")
        finally:
            app.dependency_overrides.clear()

        body = response.json()
        assert response.status_code == 200
        assert body["code"] == 10000
        assert body["data"]["telegram_feedback_url"] == ""
        assert body["data"]["telegram_feedback_group_username"] == ""

    async def test_extension_quota_check_consumes_extension_download(
        self, async_client, monkeypatch
    ):
        """插件额度检查固定消耗 EXTENSION_DOWNLOAD。"""
        calls: list[tuple[str, QuotaTypeEnum, int]] = []

        async def override_user() -> UserContext:
            return UserContext(user_id=42, token="token", device_id="device-ext")

        async def fake_set(u_id: str, quota_type: QuotaTypeEnum, number: int):
            calls.append((u_id, quota_type, number))
            return QuotaSetResult(
                allowed=True,
                used=2,
                remaining=3,
                reset_at=2_000_000_000_000,
            )

        app.dependency_overrides[get_current_user_optional] = override_user
        monkeypatch.setattr(quota_service, "set", fake_set)

        try:
            response = await async_client.post(
                "/api/client/quota/check",
                json={"count": 2},
                headers={"X-Client-Product": "web"},
            )
        finally:
            app.dependency_overrides.clear()

        assert response.status_code == 200
        data = response.json()["data"]
        assert data["allowed"] is True
        assert data["used"] == 2
        assert data["remaining"] == 3
        assert data["reset_at"] == 2_000_000_000_000
        assert calls == [("42", QuotaTypeEnum.EXTENSION_DOWNLOAD, 2)]

    async def test_extension_quota_check_rejects_numeric_anonymous_device_id(
        self, async_client, monkeypatch
    ):
        """匿名纯数字设备 ID 不允许消耗插件额度。"""

        async def fail_set(u_id: str, quota_type: QuotaTypeEnum, number: int):
            raise AssertionError(
                f"quota should not be called: {u_id}, {quota_type}, {number}"
            )

        monkeypatch.setattr(quota_service, "set", fail_set)

        response = await async_client.post(
            "/api/client/quota/check",
            json={"count": 1},
            headers={"X-Device-Id": "123456"},
        )
        body = response.json()

        assert response.status_code == 200
        assert body["code"] == CommonCode.QUOTA_INVALID_REQUEST.value

    async def test_quota_service_uses_date_key_and_lists_missing_as_zero(
        self, monkeypatch
    ):
        """quota service 只读今天日期 key，缺失类型返回 0。"""
        u_id = "quota-test-device"
        redis = await redis_client.get_client()
        keys = [
            quota_service.build_quota_key(u_id, quota_type)
            for quota_type in (
                QuotaTypeEnum.WEB_DOWNLOAD,
                QuotaTypeEnum.WEB_PLAY,
                QuotaTypeEnum.EXTENSION_DOWNLOAD,
            )
        ]
        await redis.delete(*keys)
        await redis.set(keys[0], "2")

        try:
            values = await quota_service.get_lists(u_id)
        finally:
            await redis.delete(*keys)

        assert keys[0].endswith(f":quota:1:{u_id}:{get_today_date().replace('-', '')}")
        assert values == {
            int(QuotaTypeEnum.WEB_DOWNLOAD): 2,
            int(QuotaTypeEnum.WEB_PLAY): 0,
            int(QuotaTypeEnum.EXTENSION_DOWNLOAD): 0,
        }

    async def test_quota_service_set_rejects_over_limit_without_increment(
        self, monkeypatch
    ):
        """set 原子扣减额度，超限时不增加用量。"""
        u_id = "quota-set-device"
        key = quota_service.build_quota_key(u_id, QuotaTypeEnum.WEB_DOWNLOAD)
        redis = await redis_client.get_client()
        await redis.delete(key)

        async def fake_limit(_u_id: str, quota_type: QuotaTypeEnum) -> int:
            assert _u_id == u_id
            assert quota_type == QuotaTypeEnum.WEB_DOWNLOAD
            return 1

        monkeypatch.setattr(quota_service, "resolve_quota_limit", fake_limit)

        try:
            first = await quota_service.set(u_id, QuotaTypeEnum.WEB_DOWNLOAD, 1)
            second = await quota_service.set(u_id, QuotaTypeEnum.WEB_DOWNLOAD, 1)
            stored = await redis.get(key)
            ttl = await redis.ttl(key)
        finally:
            await redis.delete(key)

        expected_reset_at = get_tomorrow_start_timestamp()
        assert first == QuotaSetResult(
            allowed=True,
            used=1,
            remaining=0,
            reset_at=expected_reset_at,
        )
        assert second == QuotaSetResult(
            allowed=False,
            used=1,
            remaining=0,
            reset_at=expected_reset_at,
        )
        assert stored == "1"
        assert 0 < ttl <= quota_service.seconds_at_next_local_midnight()
