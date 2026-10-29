"""验证码发送限流的真实 API 回归测试。

依赖真实 Redis 与 MySQL（只读设备校验配置）；SMTP 出口固定返回成功或失败。
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field

import pytest
from httpx import AsyncClient

from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.i18n.dependencies import SupportedLanguage
from app.services.device_service import device_service
from app.utils.email_sender import email_sender
from app.utils.redis_key import build_redis_key

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass
class _CleanupState:
    keys: list[str] = field(default_factory=list)


@pytest.fixture
async def real_email_send_cleanup(
    real_redis_ready: None,
) -> AsyncIterator[_CleanupState]:
    cleanup = _CleanupState()
    try:
        yield cleanup
    finally:
        if cleanup.keys:
            redis = await redis_client.get_client()
            await redis.delete(*cleanup.keys)


@pytest.mark.parametrize("send_success", [True, False])
async def test_real_email_send_limits_each_ip_across_emails_including_smtp_failures(
    real_async_client: AsyncClient,
    real_mysql_ready: None,
    real_email_send_cleanup: _CleanupState,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    send_success: bool,
) -> None:
    """同 IP 第四封拒绝，其他 IP 独立；SMTP 失败也保留 IP 已用次数。"""
    case = int(send_success)
    ip_prefix = f"2001:db8:{test_run_id[:4]}:{test_run_id[4:8]}:{test_run_id[8:]}::"
    ip = f"{ip_prefix}{case + 1}"
    other_ip = f"{ip_prefix}{case + 3}"
    device_id = f"pytest-email-send-{case}-{test_run_id}"
    emails = [f"pytest-email-{case}-{i}-{test_run_id}@example.com" for i in range(5)]
    sent_emails: list[str] = []

    async def send_email(email: str, code: str, language: SupportedLanguage) -> bool:
        sent_emails.append(email)
        return send_success

    monkeypatch.setattr(email_sender, "send_verify_code", send_email)
    ip_key = build_redis_key(f"rate_limit:email_verify_ip:{ip}")
    other_ip_key = build_redis_key(f"rate_limit:email_verify_ip:{other_ip}")
    real_email_send_cleanup.keys.extend(
        [ip_key, other_ip_key, build_redis_key(f"device_trust:{device_id}")]
    )
    for email in emails:
        real_email_send_cleanup.keys.extend(
            [
                build_redis_key(f"email_verify:{email}"),
                build_redis_key(f"rate_limit:email_verify:{email}"),
            ]
        )
    await device_service.set(device_id, ip)
    redis = await redis_client.get_client()
    expected_code = (
        CommonCode.SUCCESS if send_success else CommonCode.EMAIL_VERIFY_SEND_FAILED
    )
    for index, email in enumerate(emails):
        headers = {
            "X-Device-Id": device_id,
            "X-Forwarded-For": other_ip if index == 4 else ip,
        }
        response = await real_async_client.post(
            "/api/client/auth/send-email-code", json={"email": email}, headers=headers
        )
        assert response.status_code == 200
        assert response.json()["code"] == (
            CommonCode.EMAIL_VERIFY_SEND_TOO_FREQUENT if index == 3 else expected_code
        )
        assert bool(await redis.get(build_redis_key(f"email_verify:{email}"))) == (
            send_success and index != 3
        )
        assert await redis.zcard(ip_key) == min(index + 1, 3)

        if index == 0 and send_success:
            retry = await real_async_client.post(
                "/api/client/auth/send-email-code",
                json={"email": email},
                headers=headers,
            )
            assert retry.status_code == 200
            assert retry.json()["code"] == CommonCode.EMAIL_VERIFY_SEND_TOO_FREQUENT
            assert await redis.zcard(ip_key) == 1

    assert sent_emails == emails[:3] + emails[4:]
    assert await redis.zcard(other_ip_key) == 1
