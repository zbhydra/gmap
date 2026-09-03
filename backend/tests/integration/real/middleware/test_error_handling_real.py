"""全局错误响应 real 测试；仅依赖真实 ASGI 应用。"""

from datetime import timedelta
import logging

from httpx import AsyncClient
import pytest

from app.i18n.common_code import CommonCode
from app.utils.jwt import JwtData, JwtUnit


pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_invalid_token_uses_common_response_envelope(
    real_async_client: AsyncClient,
) -> None:
    """无效 token 返回统一 401 业务响应。"""
    response = await real_async_client.get(
        "/api/client/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401
    assert response.json() == {
        "code": CommonCode.AUTH_INVALID_TOKEN,
        "data": {},
        "msg": "Invalid token",
    }


async def test_real_request_validation_failure_uses_common_response_envelope(
    real_async_client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Pydantic 请求校验失败返回统一信封，且日志不泄露敏感输入。"""
    secret = "SECRET_VALIDATION_INPUT_" * 6
    caplog.set_level(logging.ERROR, logger="server")
    response = await real_async_client.post(
        "/api/client/auth/register",
        json={
            "email": "validation-log@example.com",
            "password": secret,
        },
    )

    assert response.status_code == 422
    assert response.json() == {
        "code": CommonCode.VALIDATION_ERROR,
        "data": {},
        "msg": "Request parameters are incomplete or invalid",
    }
    assert "('body', 'password')" in caplog.text
    assert "string_too_long" in caplog.text
    assert secret not in caplog.text


async def test_real_refresh_token_on_access_endpoint_reports_token_type_error(
    real_async_client: AsyncClient,
) -> None:
    """有效 refresh token 不能作为 access token，返回准确业务码。"""
    token, _expires_at = JwtUnit.create_refresh_token(
        JwtData(user_id=1, email="token-type@example.com")
    )

    response = await real_async_client.get(
        "/api/client/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_TOKEN_TYPE_ERROR


async def test_real_expired_access_token_reports_token_expired(
    real_async_client: AsyncClient,
) -> None:
    """过期 access token 返回准确业务码，不进入 Redis 白名单校验。"""
    token, _expires_at = JwtUnit.create_access_token(
        JwtData(user_id=1, email="token-expired@example.com"),
        expires_delta=timedelta(seconds=-1),
    )

    response = await real_async_client.get(
        "/api/client/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_TOKEN_EXPIRED


async def test_real_expired_admin_refresh_reports_refresh_token_expired(
    real_async_client: AsyncClient,
) -> None:
    """过期 admin refresh token 返回 refresh 专用业务码。"""
    token, _expires_at = JwtUnit.create_admin_refresh_token(
        JwtData(user_id=1, email="admin-refresh-expired@example.com"),
        expires_delta=timedelta(seconds=-1),
    )

    response = await real_async_client.post(
        "/api/admin/auth/refresh",
        json={"refresh_token": token},
    )

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_REFRESH_TOKEN_EXPIRED
