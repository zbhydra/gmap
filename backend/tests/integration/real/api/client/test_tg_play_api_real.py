"""Telegram 播放 API real 契约测试。"""

import pytest

from app.i18n.common_code import CommonCode


pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_play_token_create_rejects_empty_link(real_async_client):
    """
    验证创建播放 token 的最小长度校验。

    Args:
        real_async_client: real API 客户端。
    """
    response = await real_async_client.post(
        "/api/client/tg/play-token",
        json={
            "link": "",
            "source_id": "source-video-1",
            "client_request_id": "request-1",
        },
        headers={"X-Device-Id": "real-device-fixed"},
    )

    body = response.json()
    assert response.status_code == 422
    assert body["detail"][0]["loc"] == ["body", "link"]
    assert body["detail"][0]["type"] == "string_too_short"


async def test_real_play_token_create_validates_required_fields(real_async_client):
    """
    验证创建播放 token 请求体字段校验。

    Args:
        real_async_client: real API 客户端。
    """
    response = await real_async_client.post(
        "/api/client/tg/play-token",
        json={
            "link": "https://t.me/example/123",
            "source_id": "source-video-1",
        },
        headers={"X-Device-Id": "real-device-fixed"},
    )

    body = response.json()
    assert response.status_code == 422
    assert body["detail"][0]["loc"] == ["body", "client_request_id"]
    assert body["detail"][0]["type"] == "missing"


async def test_real_play_token_refresh_maps_invalid_token_to_json_error(
    real_async_client,
):
    """
    验证续签播放 token 入口已屏蔽。

    Args:
        real_async_client: real API 客户端。
    """
    response = await real_async_client.post(
        "/api/client/tg/play-token/refresh",
        json={"token": "invalid-token"},
        headers={"X-Device-Id": "real-device-fixed"},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["code"] == CommonCode.TG_PLAY_SESSION_UNAVAILABLE.value


async def test_real_play_route_is_unavailable(real_async_client):
    """
    验证 /play 播放流入口已屏蔽。

    Args:
        real_async_client: real API 客户端。
    """
    response = await real_async_client.get(
        "/api/client/tg/play",
        params={"token": "invalid-token"},
    )

    body = response.json()
    assert response.status_code == 200
    assert body["code"] == CommonCode.TG_PLAY_SESSION_UNAVAILABLE.value
