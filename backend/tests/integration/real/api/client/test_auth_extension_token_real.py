"""Website 登录态换取插件 token 的 real API 测试。

真实资源依赖：
- MySQL: users / user_credit_accounts 表
- Redis: 用户 access/refresh token 白名单与签发限流

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
POST /api/client/auth/extension-token | Y | centralized | optional-body | pydantic | N/A | rate-limit | ignored-extra | ignored-extra | ignored-extra | Y
"""

from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass
from typing import Any
import uuid

from httpx import AsyncClient
import pytest
from sqlalchemy import delete, select, text

from app.constants.auth import TokenType
from app.core.database import get_async_session, get_engine
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_credit_account_model import UserCreditAccountModel
from app.models.user_credit_log_model import UserCreditLogModel
from app.models.user_model import UserModel
from app.services.user_service import UserService
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit


pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass(slots=True)
class _CleanupState:
    """记录本文件创建的真实测试用户。"""

    emails: list[str]


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


async def _delete_extension_auth_user(email: str) -> None:
    """删除本文件创建的用户及其 Redis token。"""

    async with get_async_session() as db:
        user_id = await db.scalar(
            select(UserModel.user_id).where(UserModel.email == email)
        )
        if user_id is None:
            return

        await user_token_service.revoke_all_user_tokens(user_id)
        await db.execute(
            delete(UserCreditLogModel).where(UserCreditLogModel.user_id == user_id)
        )
        await db.execute(
            delete(UserCreditAccountModel).where(
                UserCreditAccountModel.user_id == user_id
            )
        )
        await db.execute(
            delete(UserSubscriptionModel).where(
                UserSubscriptionModel.user_id == user_id
            )
        )
        await db.execute(delete(UserModel).where(UserModel.user_id == user_id))
        await db.commit()


async def _create_real_web_access_token(user_id: int, email: str) -> str:
    """创建真实 Website access token，并写入 Redis 白名单。"""

    token, expires_at = JwtUnit.create_access_token(
        JwtData(user_id=user_id, email=email)
    )
    await user_token_service.store_token(
        token,
        user_id,
        TokenType.USER_ACCESS,
        expires_at,
    )
    return token


async def _create_real_user_with_web_token(email: str) -> tuple[UserModel, str]:
    """创建真实用户并返回可通过 get_current_user 的 web access token。"""

    user = await UserService().create_user_without_password(email=email)
    web_access_token = await _create_real_web_access_token(user.user_id, email)
    return user, web_access_token


async def _issue_extension_token(
    real_async_client: AsyncClient,
    web_access_token: str,
    *,
    payload: dict[str, str] | None = None,
    forwarded_for: str | None = None,
) -> dict[str, Any]:
    """调用插件 token 签发接口并返回 data。

    HTTP JSON 响应无静态结构（response.json() 本身是 Any），
    这里保持 dict[str, Any]，由各断言处做具体的 isinstance 校验。
    """

    headers = {
        "Authorization": f"Bearer {web_access_token}",
        "X-Client-Product": "web",
    }
    if forwarded_for:
        headers["X-Forwarded-For"] = forwarded_for
    else:
        headers["X-Forwarded-For"] = f"198.51.100.{int(uuid.uuid4().hex[:2], 16)}"

    if payload is None:
        response = await real_async_client.post(
            "/api/client/auth/extension-token",
            headers=headers,
        )
    else:
        response = await real_async_client.post(
            "/api/client/auth/extension-token",
            json=payload,
            headers=headers,
        )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS
    data = body["data"]
    assert isinstance(data, dict)
    return data


def _token_string(data: dict[str, object], key: str) -> str:
    """从响应 data 中取 token 字符串。"""

    value = data[key]
    assert isinstance(value, str)
    return value


@pytest.fixture
async def real_extension_auth_schema_ready(real_mysql_ready, real_redis_ready) -> None:
    """检查插件 token real 测试需要的真实表。"""

    required_tables = {
        "users",
        "user_credit_accounts",
        "user_credit_logs",
        "user_subscriptions",
    }
    missing = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_extension_auth_cleanup_state(
    real_extension_auth_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """清理本文件创建的真实测试用户。"""

    state = _CleanupState(emails=[])
    try:
        yield state
    finally:
        for email in state.emails:
            await _delete_extension_auth_user(email)


@pytest.fixture
def make_extension_auth_real_email(
    real_extension_auth_cleanup_state: _CleanupState,
    make_test_email: Callable[[str], str],
) -> Callable[[str], str]:
    """生成可清理的插件 token real 测试邮箱。"""

    def _make_extension_auth_real_email(label: str) -> str:
        email = make_test_email(label)
        real_extension_auth_cleanup_state.emails.append(email)
        return email

    return _make_extension_auth_real_email


async def test_real_extension_token_issues_registered_tokens_and_refresh_works(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """签发接口返回插件 token，并登记到 Redis 供业务鉴权和 refresh 使用。"""

    email = make_extension_auth_real_email("extension-token-happy")
    user, web_access_token = await _create_real_user_with_web_token(email)

    data = await _issue_extension_token(real_async_client, web_access_token)

    extension_access_token = _token_string(data, "extension_access_token")
    extension_refresh_token = _token_string(data, "extension_refresh_token")
    access_jwt = JwtUnit.decode_token(extension_access_token)
    refresh_jwt = JwtUnit.decode_token(extension_refresh_token)

    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["user_id"] == user.user_id
    assert data["user"]["email"] == email
    assert access_jwt is not None
    assert refresh_jwt is not None
    assert access_jwt.user_id == user.user_id
    assert refresh_jwt.user_id == user.user_id
    assert access_jwt.type == TokenType.USER_ACCESS.value
    assert refresh_jwt.type == TokenType.USER_REFRESH.value
    assert await user_token_service.verify_token(
        extension_access_token,
        user.user_id,
        TokenType.USER_ACCESS,
    )
    assert await user_token_service.verify_token(
        extension_refresh_token,
        user.user_id,
        TokenType.USER_REFRESH,
    )

    me_response = await real_async_client.get(
        "/api/client/auth/me",
        headers={"Authorization": f"Bearer {extension_access_token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["code"] == CommonCode.SUCCESS
    assert me_response.json()["data"]["user_id"] == user.user_id

    refresh_response = await real_async_client.post(
        "/api/client/auth/refresh",
        json={"refresh_token": extension_refresh_token},
    )
    assert refresh_response.status_code == 200
    assert refresh_response.json()["code"] == CommonCode.SUCCESS
    assert refresh_response.json()["data"]["access_token"] != extension_access_token


async def test_real_extension_token_consecutive_calls_issue_new_tokens(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """连续调用每次签发新的插件 token。"""

    email = make_extension_auth_real_email("extension-token-new")
    _user, web_access_token = await _create_real_user_with_web_token(email)

    first = await _issue_extension_token(real_async_client, web_access_token)
    second = await _issue_extension_token(real_async_client, web_access_token)

    assert _token_string(first, "extension_access_token") != _token_string(
        second,
        "extension_access_token",
    )
    assert _token_string(first, "extension_refresh_token") != _token_string(
        second,
        "extension_refresh_token",
    )


async def test_real_extension_token_revokes_same_user_old_tokens(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """携带同账号旧插件 token 时，新 token 签发后旧 access/refresh 被撤销。"""

    email = make_extension_auth_real_email("extension-token-revoke")
    user, web_access_token = await _create_real_user_with_web_token(email)
    old_tokens = await _issue_extension_token(real_async_client, web_access_token)
    old_access_token = _token_string(old_tokens, "extension_access_token")
    old_refresh_token = _token_string(old_tokens, "extension_refresh_token")

    new_tokens = await _issue_extension_token(
        real_async_client,
        web_access_token,
        payload={
            "old_extension_access_token": old_access_token,
            "old_extension_refresh_token": old_refresh_token,
        },
    )
    new_access_token = _token_string(new_tokens, "extension_access_token")
    new_refresh_token = _token_string(new_tokens, "extension_refresh_token")

    assert not await user_token_service.verify_token(
        old_access_token,
        user.user_id,
        TokenType.USER_ACCESS,
    )
    assert not await user_token_service.verify_token(
        old_refresh_token,
        user.user_id,
        TokenType.USER_REFRESH,
    )
    assert await user_token_service.verify_token(
        new_access_token,
        user.user_id,
        TokenType.USER_ACCESS,
    )
    assert await user_token_service.verify_token(
        new_refresh_token,
        user.user_id,
        TokenType.USER_REFRESH,
    )


async def test_real_extension_token_skips_invalid_and_type_mismatched_old_tokens(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """旧 token 无效或字段类型错位时跳过撤销，但仍返回新的插件 token。"""

    email = make_extension_auth_real_email("extension-token-invalid-old")
    user, web_access_token = await _create_real_user_with_web_token(email)
    old_tokens = await _issue_extension_token(real_async_client, web_access_token)
    old_access_token = _token_string(old_tokens, "extension_access_token")
    old_refresh_token = _token_string(old_tokens, "extension_refresh_token")

    new_tokens = await _issue_extension_token(
        real_async_client,
        web_access_token,
        payload={
            "old_extension_access_token": old_refresh_token,
            "old_extension_refresh_token": "not-a-jwt-token",
        },
    )

    assert _token_string(new_tokens, "extension_access_token") != old_access_token
    assert await user_token_service.verify_token(
        old_access_token,
        user.user_id,
        TokenType.USER_ACCESS,
    )
    assert await user_token_service.verify_token(
        old_refresh_token,
        user.user_id,
        TokenType.USER_REFRESH,
    )


async def test_real_extension_token_does_not_revoke_cross_user_old_tokens(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """跨账号旧插件 token 只跳过撤销，不能删除旧 token 所属账号的 Redis 记录。"""

    current_email = make_extension_auth_real_email("extension-token-current")
    other_email = make_extension_auth_real_email("extension-token-other")
    _current_user, current_web_token = await _create_real_user_with_web_token(
        current_email
    )
    other_user, other_web_token = await _create_real_user_with_web_token(other_email)
    other_tokens = await _issue_extension_token(real_async_client, other_web_token)
    other_access_token = _token_string(other_tokens, "extension_access_token")
    other_refresh_token = _token_string(other_tokens, "extension_refresh_token")

    current_tokens = await _issue_extension_token(
        real_async_client,
        current_web_token,
        payload={
            "old_extension_access_token": other_access_token,
            "old_extension_refresh_token": other_refresh_token,
        },
    )

    assert current_tokens["user"]["email"] == current_email
    assert await user_token_service.verify_token(
        other_access_token,
        other_user.user_id,
        TokenType.USER_ACCESS,
    )
    assert await user_token_service.verify_token(
        other_refresh_token,
        other_user.user_id,
        TokenType.USER_REFRESH,
    )


async def test_real_extension_token_rejects_invalid_web_access_token(
    real_async_client: AsyncClient,
    real_extension_auth_schema_ready,
) -> None:
    """web access token 无效时沿用 get_current_user 的 401 认证失败口径。"""

    response = await real_async_client.post(
        "/api/client/auth/extension-token",
        json={},
        headers={"Authorization": "Bearer invalid-web-access-token"},
    )

    assert response.status_code == 401


async def test_real_extension_token_rate_limit_is_ten_per_user_per_five_minutes(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """同一用户在 5 分钟固定窗口内第 11 次签发被限流。"""

    email = make_extension_auth_real_email("extension-token-limit")
    _user, web_access_token = await _create_real_user_with_web_token(email)
    forwarded_for = f"203.0.113.{int(uuid.uuid4().hex[:2], 16)}"

    for _index in range(10):
        await _issue_extension_token(
            real_async_client,
            web_access_token,
            forwarded_for=forwarded_for,
        )

    response = await real_async_client.post(
        "/api/client/auth/extension-token",
        json={},
        headers={
            "Authorization": f"Bearer {web_access_token}",
            "X-Forwarded-For": forwarded_for,
        },
    )
    body = response.json()

    assert response.status_code == 200
    assert body["code"] == CommonCode.RATE_LIMIT_EXCEEDED.value


async def test_real_extension_token_rate_limit_does_not_block_other_users_on_same_ip(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
) -> None:
    """同一出口 IP 下不同用户不互相消耗签发限流额度。"""

    first_email = make_extension_auth_real_email("extension-token-limit-first")
    second_email = make_extension_auth_real_email("extension-token-limit-second")
    _first_user, first_web_token = await _create_real_user_with_web_token(first_email)
    _second_user, second_web_token = await _create_real_user_with_web_token(
        second_email
    )
    forwarded_for = f"203.0.113.{int(uuid.uuid4().hex[:2], 16)}"

    for _index in range(10):
        await _issue_extension_token(
            real_async_client,
            first_web_token,
            forwarded_for=forwarded_for,
        )

    second_data = await _issue_extension_token(
        real_async_client,
        second_web_token,
        forwarded_for=forwarded_for,
    )

    assert second_data["user"]["email"] == second_email


async def test_real_extension_token_rate_limit_fail_open_still_issues_token(
    real_async_client: AsyncClient,
    make_extension_auth_real_email: Callable[[str], str],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """限流 Redis 检查异常时按 fail-open 放行签发。"""

    email = make_extension_auth_real_email("extension-token-limit-open")
    _user, web_access_token = await _create_real_user_with_web_token(email)

    from app.api.client import auth_client as auth_client_module

    def _broken_build_key(identifier: str, window: int) -> str:
        raise RuntimeError(
            "test limiter redis unavailable: "
            f"identifier={identifier}, window={window}"
        )

    monkeypatch.setattr(
        auth_client_module._extension_token_limiter,
        "_build_key",
        _broken_build_key,
    )

    data = await _issue_extension_token(real_async_client, web_access_token)

    assert data["user"]["email"] == email
