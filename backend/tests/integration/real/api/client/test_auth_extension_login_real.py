"""插件登录 v3（browser identity + PKCE）的 real API 测试。

真实资源依赖：
- MySQL: users / user_credit_accounts 表
- Redis: 一次性 code 存储、用户 access/refresh token 白名单与签发限流

覆盖矩阵：
Endpoint | Happy | Permission | Missing | Type | Min/Max | Overflow | XSS | SQLi | Unicode | Side Effect
POST /api/client/auth/extension-login/code | Y | Y | centralized | centralized | Y | Y | centralized | centralized | centralized | Y
POST /api/client/auth/extension-login/exchange | Y | N/A（设计上无 Bearer） | centralized | centralized | Y | centralized | centralized | centralized | centralized | Y

缺项说明：Missing/Type/Overflow/XSS/SQLi/Unicode 由 pydantic pattern 或按字面
处理（与既有认证端点一致），Permission 中 exchange 无 Bearer 属协议设计。
"""

import base64
import hashlib
import json
import secrets
from collections.abc import AsyncIterator, Callable
from dataclasses import dataclass
from typing import Any
import uuid

from httpx import AsyncClient
import pytest
from sqlalchemy import delete, select, text

from app.constants.auth import TokenType
from app.core.database import get_async_session, get_engine
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_credit_account_model import UserCreditAccountModel
from app.models.user_credit_log_model import UserCreditLogModel
from app.models.user_model import UserModel
from app.services.user_service import UserService
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit
from app.utils.redis_key import build_redis_key


pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass(slots=True)
class _CleanupState:
    """记录本文件创建的真实测试用户。"""

    emails: list[str]


def _generate_pkce_pair() -> tuple[str, str]:
    """生成真实 PKCE S256 verifier/challenge 对（43 字符 Base64URL）。"""

    verifier = (
        base64.urlsafe_b64encode(secrets.token_bytes(32)).rstrip(b"=").decode("ascii")
    )
    challenge = (
        base64.urlsafe_b64encode(hashlib.sha256(verifier.encode("ascii")).digest())
        .rstrip(b"=")
        .decode("ascii")
    )
    return verifier, challenge


def _code_redis_key(code: str) -> str:
    """按服务端合同构建一次性 code 的 Redis key（只存 sha256 摘要）。"""

    code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
    return build_redis_key(f"extension_login_code:{code_hash}")


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


async def _delete_extension_login_user(email: str) -> None:
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


async def _create_real_user_with_web_token(email: str) -> tuple[UserModel, str]:
    """创建真实用户并返回可通过 get_current_user 的 web access token。"""

    user = await UserService().create_user_without_password(email=email)
    token, expires_at = JwtUnit.create_access_token(
        JwtData(user_id=user.user_id, email=email)
    )
    await user_token_service.store_token(
        token,
        user.user_id,
        TokenType.USER_ACCESS,
        expires_at,
    )
    return user, token


async def _issue_login_code(
    real_async_client: AsyncClient,
    web_access_token: str,
    code_challenge: str,
) -> dict[str, Any]:
    """以 Website Bearer 调用一次性 code 签发接口并返回 data。"""

    response = await real_async_client.post(
        "/api/client/auth/extension-login/code",
        json={"code_challenge": code_challenge},
        headers={
            "Authorization": f"Bearer {web_access_token}",
            "X-Client-Product": "web",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS
    data = body["data"]
    assert isinstance(data, dict)
    return data


async def _exchange_login_code(
    real_async_client: AsyncClient,
    code: str,
    code_verifier: str,
    *,
    payload_extra: dict[str, str] | None = None,
) -> tuple[int, dict[str, Any]]:
    """无 Bearer 调用 exchange 接口，返回 (status_code, body)。"""

    payload: dict[str, str] = {"code": code, "code_verifier": code_verifier}
    if payload_extra:
        payload.update(payload_extra)
    response = await real_async_client.post(
        "/api/client/auth/extension-login/exchange",
        json=payload,
        headers={"X-Forwarded-For": f"198.51.100.{int(uuid.uuid4().hex[:2], 16)}"},
    )
    assert response.status_code == 200
    body: dict[str, Any] = response.json()
    assert isinstance(body, dict)
    return response.status_code, body


def _token_string(data: dict[str, object], key: str) -> str:
    """从响应 data 中取 token 字符串。"""

    value = data[key]
    assert isinstance(value, str)
    return value


@pytest.fixture
async def real_extension_login_schema_ready(real_mysql_ready, real_redis_ready) -> None:
    """检查插件登录 real 测试需要的真实表。"""

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
async def real_extension_login_cleanup_state(
    real_extension_login_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """清理本文件创建的真实测试用户。"""

    state = _CleanupState(emails=[])
    try:
        yield state
    finally:
        for email in state.emails:
            await _delete_extension_login_user(email)


@pytest.fixture
def make_extension_login_real_email(
    real_extension_login_cleanup_state: _CleanupState,
    make_test_email: Callable[[str], str],
) -> Callable[[str], str]:
    """生成可清理的插件登录 real 测试邮箱。"""

    def _make_extension_login_real_email(label: str) -> str:
        email = make_test_email(label)
        real_extension_login_cleanup_state.emails.append(email)
        return email

    return _make_extension_login_real_email


async def test_real_extension_login_issue_exchange_flow_grants_extension_tokens(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """全链路：Website Bearer 签发 code，verifier exchange 后插件 token 可访问 /auth/me。"""

    email = make_extension_login_real_email("extension-login-happy")
    user, web_access_token = await _create_real_user_with_web_token(email)
    code_verifier, code_challenge = _generate_pkce_pair()

    issue_data = await _issue_login_code(
        real_async_client,
        web_access_token,
        code_challenge,
    )
    login_code = _token_string(issue_data, "code")
    assert issue_data["expires_in"] == 60

    # 副作用断言：Redis 只落 sha256 摘要 key，值含 user_id 且不含明文 code
    redis = await redis_client.get_client()
    stored_value = await redis.get(_code_redis_key(login_code))
    assert stored_value is not None
    assert login_code not in stored_value
    stored_payload = json.loads(stored_value)
    assert stored_payload["user_id"] == user.user_id
    assert stored_payload["code_challenge"] == code_challenge

    status_code, body = await _exchange_login_code(
        real_async_client,
        login_code,
        code_verifier,
    )
    assert status_code == 200
    assert body["code"] == CommonCode.SUCCESS
    data = body["data"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["user_id"] == user.user_id
    assert data["user"]["email"] == email

    extension_access_token = _token_string(data, "extension_access_token")
    extension_refresh_token = _token_string(data, "extension_refresh_token")
    access_jwt = JwtUnit.decode_token(extension_access_token)
    refresh_jwt = JwtUnit.decode_token(extension_refresh_token)
    assert access_jwt is not None and access_jwt.user_id == user.user_id
    assert refresh_jwt is not None and refresh_jwt.user_id == user.user_id
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

    # 消费后 code 的 Redis key 已删除（一次性）
    assert await redis.get(_code_redis_key(login_code)) is None

    # 插件 token 可访问 /auth/me
    me_response = await real_async_client.get(
        "/api/client/auth/me",
        headers={"Authorization": f"Bearer {extension_access_token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["code"] == CommonCode.SUCCESS
    assert me_response.json()["data"]["user_id"] == user.user_id


async def test_real_extension_login_wrong_verifier_burns_code_before_challenge_check(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """错误 verifier 消费后，同 code + 正确 verifier 也失败（证明先消费后校验）。"""

    email = make_extension_login_real_email("extension-login-burn")
    _user, web_access_token = await _create_real_user_with_web_token(email)
    code_verifier, code_challenge = _generate_pkce_pair()
    wrong_verifier, _wrong_challenge = _generate_pkce_pair()
    assert wrong_verifier != code_verifier

    issue_data = await _issue_login_code(
        real_async_client,
        web_access_token,
        code_challenge,
    )
    login_code = _token_string(issue_data, "code")

    first_status, first_body = await _exchange_login_code(
        real_async_client,
        login_code,
        wrong_verifier,
    )
    assert first_status == 200
    assert first_body["code"] == CommonCode.AUTH_INVALID_CREDENTIALS.value
    assert "data" not in first_body or not first_body["data"]

    # code 在 verifier 校验前已被原子消费：同 code 换正确 verifier 仍失败
    second_status, second_body = await _exchange_login_code(
        real_async_client,
        login_code,
        code_verifier,
    )
    assert second_status == 200
    assert second_body["code"] == CommonCode.AUTH_INVALID_CREDENTIALS.value

    # 副作用断言：失败校验后 Redis key 已删除
    redis = await redis_client.get_client()
    assert await redis.get(_code_redis_key(login_code)) is None


async def test_real_extension_login_replayed_code_is_rejected(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """同一 code 成功消费后重放 exchange 失败（一次性）。"""

    email = make_extension_login_real_email("extension-login-replay")
    user, web_access_token = await _create_real_user_with_web_token(email)
    code_verifier, code_challenge = _generate_pkce_pair()

    issue_data = await _issue_login_code(
        real_async_client,
        web_access_token,
        code_challenge,
    )
    login_code = _token_string(issue_data, "code")

    first_status, first_body = await _exchange_login_code(
        real_async_client,
        login_code,
        code_verifier,
    )
    assert first_status == 200
    assert first_body["code"] == CommonCode.SUCCESS
    assert first_body["data"]["user"]["user_id"] == user.user_id

    replay_status, replay_body = await _exchange_login_code(
        real_async_client,
        login_code,
        code_verifier,
    )
    assert replay_status == 200
    assert replay_body["code"] == CommonCode.AUTH_INVALID_CREDENTIALS.value


async def test_real_extension_login_exchange_revokes_old_extension_tokens(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """exchange 携带同账号旧插件 token 时，新 token 签发后旧的被撤销。"""

    email = make_extension_login_real_email("extension-login-revoke")
    user, web_access_token = await _create_real_user_with_web_token(email)
    first_verifier, first_challenge = _generate_pkce_pair()
    second_verifier, second_challenge = _generate_pkce_pair()

    first_code = _token_string(
        await _issue_login_code(real_async_client, web_access_token, first_challenge),
        "code",
    )
    first_status, first_body = await _exchange_login_code(
        real_async_client,
        first_code,
        first_verifier,
    )
    assert first_status == 200
    assert first_body["code"] == CommonCode.SUCCESS
    old_access_token = _token_string(first_body["data"], "extension_access_token")
    old_refresh_token = _token_string(first_body["data"], "extension_refresh_token")

    second_code = _token_string(
        await _issue_login_code(real_async_client, web_access_token, second_challenge),
        "code",
    )
    second_status, second_body = await _exchange_login_code(
        real_async_client,
        second_code,
        second_verifier,
        payload_extra={
            "old_extension_access_token": old_access_token,
            "old_extension_refresh_token": old_refresh_token,
        },
    )
    assert second_status == 200
    assert second_body["code"] == CommonCode.SUCCESS
    new_access_token = _token_string(second_body["data"], "extension_access_token")
    assert new_access_token != old_access_token

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


async def test_real_extension_login_issue_rejects_invalid_web_access_token(
    real_async_client: AsyncClient,
    real_extension_login_schema_ready,
) -> None:
    """Website access token 无效时沿用 get_current_user 的 401 认证失败口径。"""

    response = await real_async_client.post(
        "/api/client/auth/extension-login/code",
        json={"code_challenge": "a" * 43},
        headers={"Authorization": "Bearer invalid-web-access-token"},
    )

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_INVALID_TOKEN


async def test_real_extension_login_issue_rejects_malformed_code_challenge(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """challenge 不是 43 字符 Base64URL 时被 schema 正则拒绝。"""

    email = make_extension_login_real_email("extension-login-bad-challenge")
    _user, web_access_token = await _create_real_user_with_web_token(email)

    response = await real_async_client.post(
        "/api/client/auth/extension-login/code",
        json={"code_challenge": "short-challenge"},
        headers={"Authorization": f"Bearer {web_access_token}"},
    )

    # Pydantic 校验失败走统一错误信封，不进入业务处理。
    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR


async def test_real_extension_login_exchange_rejects_malformed_code_verifier(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """verifier 不满足 RFC 7636 字符集/长度时被 schema 正则拒绝，不消费 code。"""

    email = make_extension_login_real_email("extension-login-bad-verifier")
    _user, web_access_token = await _create_real_user_with_web_token(email)
    code_verifier, code_challenge = _generate_pkce_pair()

    issue_data = await _issue_login_code(
        real_async_client,
        web_access_token,
        code_challenge,
    )
    login_code = _token_string(issue_data, "code")

    response = await real_async_client.post(
        "/api/client/auth/extension-login/exchange",
        json={"code": login_code, "code_verifier": "invalid verifier with spaces!"},
    )

    # Pydantic 校验失败走统一错误信封，且发生在 code 消费之前。
    assert response.status_code == 422
    assert response.json()["code"] == CommonCode.VALIDATION_ERROR

    # 校验失败发生在消费之前，code 仍有效，正确 verifier 可完成 exchange
    status_code, exchange_body = await _exchange_login_code(
        real_async_client,
        login_code,
        code_verifier,
    )
    assert status_code == 200
    assert exchange_body["code"] == CommonCode.SUCCESS


async def test_real_extension_login_issue_rate_limit_is_ten_per_user_per_five_minutes(
    real_async_client: AsyncClient,
    make_extension_login_real_email: Callable[[str], str],
) -> None:
    """同一用户在 5 分钟固定窗口内第 11 次签发被限流。"""

    email = make_extension_login_real_email("extension-login-limit")
    _user, web_access_token = await _create_real_user_with_web_token(email)
    _verifier, code_challenge = _generate_pkce_pair()

    for _index in range(10):
        issue_data = await _issue_login_code(
            real_async_client,
            web_access_token,
            code_challenge,
        )
        assert issue_data["expires_in"] == 60

    response = await real_async_client.post(
        "/api/client/auth/extension-login/code",
        json={"code_challenge": code_challenge},
        headers={"Authorization": f"Bearer {web_access_token}"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.RATE_LIMIT_EXCEEDED.value
