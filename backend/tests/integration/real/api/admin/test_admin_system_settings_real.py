"""Admin Provider 配置 API real 集成测试。

真实资源依赖：MySQL 的 admins / system_data 表。配置表只读；POST 仅提交必然在
schema 层拒绝的请求，并断言数据库无副作用。

覆盖矩阵：
Endpoint                                     Happy Permission Missing Type Min/Max Overflow XSS SQLi Unicode Side Effect
GET  /api/admin/system-settings/gmap-engine  Y     Y          N/A     N/A  N/A     N/A      N/A N/A  N/A     read-only
POST /api/admin/system-settings/gmap-engine  skip  Y          Y       Y    Y       Y        Y   Y    Y       Y
POST /api/admin/system-settings/gosom-api    skip  centralized N/A   N/A  N/A     duplicate N/A N/A  N/A     Y

合法 POST 会覆盖真实运维配置，按 spec-test-server §10 禁止执行。
"""

from __future__ import annotations

from copy import deepcopy
import traceback

import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.gmap import GMAP_ENGINE_DATA_KEY
from app.constants.gosom import GOSOM_API_DATA_KEY
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue, SystemDataModel
from app.exceptions.common_exception import AppCommonException
from app.schemas.admin_schema import (
    GmapEngineConfig,
    GmapEngineConfigRequest,
    GosomApiConfigRequest,
)
from app.services.gosom_api_service import gosom_api_service
from app.services.maps_engine_service import maps_engine_service


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_GMAP_ENDPOINT = "/api/admin/system-settings/gmap-engine"
_GOSOM_ENDPOINT = "/api/admin/system-settings/gosom-api"


async def _read_config(data_key: str) -> JsonValue | None:
    """绕过进程缓存读取配置，供只读与无副作用断言使用。"""
    async with AsyncSession(get_engine()) as session:
        value = await session.scalar(
            select(SystemDataModel.data_value).where(
                SystemDataModel.data_key == data_key
            )
        )
    return deepcopy(value)


async def test_real_get_gmap_engine_requires_admin(
    real_async_client,
    real_admin_system_settings_cleanup,
) -> None:
    """未登录读取配置返回 401，且不改数据库。"""
    before = await _read_config(GMAP_ENGINE_DATA_KEY)

    response = await real_async_client.get(_GMAP_ENDPOINT)

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS
    assert await _read_config(GMAP_ENGINE_DATA_KEY) == before


async def test_real_get_gmap_engine_returns_current_contract_without_write(
    real_async_client,
    real_admin_token_for_system_settings: str,
) -> None:
    """真实 GET 返回统一 provider/proxies/concurrency 合同且不写配置。"""
    before = await _read_config(GMAP_ENGINE_DATA_KEY)
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}

    response = await real_async_client.get(_GMAP_ENDPOINT, headers=headers)

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.SUCCESS
    config = GmapEngineConfig.model_validate(response.json()["data"])
    assert config.model_dump().keys() == {"provider", "proxies", "concurrency"}
    assert await _read_config(GMAP_ENGINE_DATA_KEY) == before


@pytest.mark.parametrize(
    "payload",
    [
        {"provider": "http", "proxies": [], "concurrency": 1},
        {"provider": "http", "concurrency": 1},
        {"provider": "http", "proxies": ["ftp://proxy.example:21"], "concurrency": 1},
        {"provider": "http", "proxies": ["http://proxy.example"], "concurrency": 1},
        {
            "provider": "http",
            "proxies": ["http://user:<script>@proxy.example:80"],
            "concurrency": 1,
        },
        {
            "provider": "http",
            "proxies": ["http://user:' OR 1=1 --@proxy.example:80"],
            "concurrency": 1,
        },
        {
            "provider": "http",
            "proxies": ["http://user:\u202e@proxy.example:80"],
            "concurrency": 1,
        },
        {"provider": "http", "proxies": ["http://proxy.example:80"], "concurrency": 0},
        {"provider": "http", "proxies": ["http://proxy.example:80"], "concurrency": {}},
    ],
)
async def test_real_save_gmap_engine_rejects_invalid_input_without_write(
    real_async_client,
    real_admin_token_for_system_settings: str,
    payload: dict[str, object],
) -> None:
    """所有非法输入统一返回无凭据详情的校验错误，且不改配置表。"""
    before = await _read_config(GMAP_ENGINE_DATA_KEY)
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}

    response = await real_async_client.post(
        _GMAP_ENDPOINT, json=payload, headers=headers
    )

    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR
    assert "secret" not in response.text
    assert await _read_config(GMAP_ENGINE_DATA_KEY) == before


async def test_real_gmap_schema_normalizes_and_deduplicates_proxies(
    real_mysql_ready,
) -> None:
    """保存 schema 去空行、规范化 host/scheme，并按首次出现顺序去重。"""
    config = GmapEngineConfigRequest.model_validate(
        {
            "provider": "gosom",
            "proxies": [
                "  HTTP://user:p%40ss@Proxy.Example:8080/  ",
                "",
                "http://user:p%40ss@proxy.example:8080",
                "socks5h://proxy-2.example:1080",
            ],
            "concurrency": 7,
        }
    )

    assert config.proxies == [
        "http://user:p%40ss@proxy.example:8080",
        "socks5h://proxy-2.example:1080",
    ]


async def test_real_gmap_schema_applies_limit_after_normalization(
    real_mysql_ready,
) -> None:
    """重复和空代理先归一，再按 provider 合同执行数量与非空校验。"""
    duplicate = ["http://proxy.example:8080"] * 101
    assert GmapEngineConfigRequest(
        provider="http", proxies=duplicate, concurrency=1
    ).proxies == ["http://proxy.example:8080"]
    assert (
        GmapEngineConfigRequest(
            provider="gosom", proxies=[""] * 101, concurrency=1
        ).proxies
        == []
    )
    with pytest.raises(ValidationError):
        GmapEngineConfigRequest(provider="http", proxies=[""] * 101, concurrency=1)


async def test_real_gmap_stored_validation_error_does_not_leak_proxy_credentials(
    real_mysql_ready,
) -> None:
    """持久化脏代理经过真实读取边界后，异常链不包含原始凭据。"""
    secret = "stored-user:stored-password"
    with pytest.raises(AppCommonException) as exc_info:
        maps_engine_service._parse_stored_config(
            {
                "provider": "http",
                "proxies": [f"http://{secret}@proxy.example:invalid"],
                "concurrency": 1,
            }
        )

    rendered = "".join(
        traceback.format_exception(type(exc_info.value), exc_info.value, exc_info.tb)
    )
    assert secret not in rendered
    assert exc_info.value.code == CommonCode.INTERNAL_SERVER_ERROR


async def test_real_gosom_schema_normalizes_and_rejects_duplicate_base_url(
    real_mysql_ready,
) -> None:
    """gosom base_url 先规范化，再执行唯一性约束。"""
    with pytest.raises(ValidationError):
        GosomApiConfigRequest.model_validate(
            {
                "items": [
                    {
                        "base_url": " HTTPS://Gosom.Example/ ",
                        "api_key": "a",
                        "weight": 1,
                    },
                    {"base_url": "https://gosom.example", "api_key": "b", "weight": 2},
                ]
            }
        )


async def test_real_gosom_duplicate_post_does_not_write_or_leak_key(
    real_async_client,
    real_admin_token_for_system_settings: str,
) -> None:
    """重复 gosom 地址在入口拒绝，响应不泄漏 API key，配置表不变。"""
    before = await _read_config(GOSOM_API_DATA_KEY)
    headers = {"Authorization": f"Bearer {real_admin_token_for_system_settings}"}
    payload = {
        "items": [
            {"base_url": "https://gosom.example/", "api_key": "secret-a", "weight": 1},
            {"base_url": "https://GOSOM.example", "api_key": "secret-b", "weight": 1},
        ]
    }

    response = await real_async_client.post(
        _GOSOM_ENDPOINT, json=payload, headers=headers
    )

    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR
    assert "secret" not in response.text
    assert await _read_config(GOSOM_API_DATA_KEY) == before


async def test_real_gosom_directional_read_uses_normalized_base_url(
    real_gmap_engine_schema_ready,
) -> None:
    """有现存 gosom 配置时，按规范化 base_url 精确读取同一行。"""
    items = await gosom_api_service.get_items()
    if not items:
        pytest.skip("REAL_CONFIG_UNAVAILABLE: gosom_api 未配置，跳过定向读取冒烟")

    assert await gosom_api_service.get_by_base_url(items[0].base_url) == items[0]
    assert await gosom_api_service.get_by_base_url("https://missing.invalid") is None


async def test_real_valid_config_posts_are_not_run_against_shared_config_table() -> (
    None
):
    """合法写配置冒烟禁止覆盖真实运维配置。"""
    pytest.skip("REAL_CONFIG_WRITE_FORBIDDEN: 测试禁止写 config_* 配置表")
