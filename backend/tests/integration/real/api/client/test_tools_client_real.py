"""真实 MySQL 配置与 Redis；仅替换 Reoon HTTP 出口。

Reoon 替身形态取自 2026-10-27 实测：无效 key 为 HTTP 401 + status:error，
power 验证结果为 200 + 下方字段。测试结束恢复 system_data.reoon 原值。
"""

from collections.abc import Callable

import httpx
import pytest

from app.constants.reoon import REOON_DATA_KEY
from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.models.system_data_model import JsonValue
from app.schemas.reoon_schema import ReoonAccount, ReoonConfig
from app.services import reoon_service as reoon_service_module
from app.services.reoon_service import reoon_service
from app.services.system_data_service import system_data_service
from app.utils.redis_key import build_redis_key
from app.utils.time import get_tomorrow_start_timestamp

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_ENDPOINT = "/api/client/tools/email-verify"
_VERIFY_BODY: dict[str, JsonValue] = {
    "email": "someone@gmail.com",
    "username": "someone",
    "domain": "gmail.com",
    "status": "safe",
    "overall_score": 98,
    "is_safe_to_send": True,
    "is_valid_syntax": True,
    "is_disposable": False,
    "is_role_account": False,
    "can_connect_smtp": True,
    "has_inbox_full": False,
    "is_catch_all": False,
    "is_deliverable": True,
    "is_disabled": False,
    "is_spamtrap": False,
    "is_free_email": True,
    "mx_accepts_mail": True,
    "mx_records": ["gmail-smtp-in.l.google.com"],
    "verification_mode": "power",
}


async def test_real_email_verify_switches_only_on_reoon_error_and_limits_ip_per_day(
    real_mysql_ready: None,
    real_redis_ready: None,
    real_async_client: httpx.AsyncClient,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    ip = f"pytest-email-verify-{test_run_id}"
    limit_key = build_redis_key(
        f"tool_email_verify:{ip}:{get_tomorrow_start_timestamp()}"
    )
    calls: list[str] = []
    upstream: Callable[[httpx.Request], httpx.Response]

    def respond(request: httpx.Request) -> httpx.Response:
        assert request.url.params["mode"] == "power"
        key = request.url.params["key"]
        calls.append(key)
        if key.startswith("bad"):
            return httpx.Response(
                401, json={"reason": "Invalid API key.", "status": "error"}
            )
        return upstream(request)

    def verified(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json=_VERIFY_BODY)

    def timeout(request: httpx.Request) -> httpx.Response:
        raise httpx.ReadTimeout("reoon timeout for real test", request=request)

    def unparsable(request: httpx.Request) -> httpx.Response:
        return httpx.Response(502, text="<html>")

    monkeypatch.setattr(
        reoon_service_module,
        "AsyncClient",
        lambda **kwargs: httpx.AsyncClient(
            transport=httpx.MockTransport(respond), **kwargs
        ),
    )

    async def verify(keys: list[str], email: str = "someone@gmail.com") -> int:
        await reoon_service.save_config(
            ReoonConfig(accounts=[ReoonAccount(name=key, api_key=key) for key in keys])
        )
        calls.clear()
        response = await real_async_client.post(
            _ENDPOINT, json={"email": email}, headers={"X-Forwarded-For": ip}
        )
        assert response.status_code == 200, response.text
        if response.json()["code"] == CommonCode.SUCCESS:
            data = response.json()["data"]
            assert data["status"] == "safe" and data["score"] == 98
            assert data["is_deliverable"] and data["mx_records"]
            assert "overall_score" not in data and "verification_mode" not in data
        return int(response.json()["code"])

    original = await system_data_service.system_data_info(REOON_DATA_KEY)
    original_value = original.data_value if original is not None else None
    redis = await redis_client.get_client()
    try:
        # 入口校验失败不调用 Reoon，也不计入限流。
        for email in ("a@@b.com", "no-at-sign", "a" * 250 + "@b.com"):
            assert await verify(["good"], email) == CommonCode.VALIDATION_ERROR
            assert calls == []

        upstream = verified
        assert await verify(["bad-1", "good"]) == CommonCode.SUCCESS
        assert calls[-1] == "good" and len(calls) in (1, 2)

        # 超时与无法解析的响应可能已扣额度，只调用一个账号即失败。
        upstream = timeout
        assert await verify(["good-1", "good-2"]) == CommonCode.TOOL_SERVICE_BUSY
        assert len(calls) == 1
        upstream = unparsable
        assert await verify(["good-1", "good-2"]) == CommonCode.TOOL_SERVICE_BUSY
        assert len(calls) == 1

        assert await verify(["bad-1", "bad-2"]) == CommonCode.TOOL_SERVICE_BUSY
        assert sorted(calls) == ["bad-1", "bad-2"]
        assert await verify([]) == CommonCode.TOOL_SERVICE_BUSY

        upstream = verified
        assert await verify(["good"]) == CommonCode.RATE_LIMIT_EXCEEDED
        assert calls == []
        assert await redis.get(limit_key) == "6"
        assert 0 < await redis.pttl(limit_key) <= 24 * 3600 * 1000
    finally:
        await redis.delete(limit_key)
        if original_value is None:
            await system_data_service.system_data_del([REOON_DATA_KEY])
        else:
            await system_data_service.set(REOON_DATA_KEY, original_value)
