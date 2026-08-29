"""Feishu 告警工具测试。"""

from types import SimpleNamespace

import httpx
import pytest

from app.utils import feishu_utils


class _FakeRedis:
    def __init__(self, results: list[bool]) -> None:
        self.results = results
        self.calls: list[dict[str, object]] = []

    async def set(self, key: str, value: str, *, ex: int, nx: bool):
        self.calls.append({"key": key, "value": value, "ex": ex, "nx": nx})
        return self.results.pop(0)


@pytest.mark.asyncio
async def test_send_feishu_alarm_skips_when_disabled(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        feishu_utils,
        "settings",
        SimpleNamespace(
            feishu_alarm=SimpleNamespace(
                enabled=False,
                webhook_url="",
                timeout_seconds=5,
            )
        ),
    )

    async def fail_get_client():
        raise AssertionError("disabled alarm without dedup must not touch redis")

    monkeypatch.setattr(feishu_utils.redis_client, "get_client", fail_get_client)

    await feishu_utils.send_feishu_alarm(
        title="title",
        content="content",
        dedup_key="dedup-key",
    )


@pytest.mark.asyncio
async def test_send_feishu_alarm_uses_redis_dedup(
    monkeypatch: pytest.MonkeyPatch,
):
    fake_redis = _FakeRedis([True, False])
    posted_payloads: list[dict[str, object]] = []

    async def get_client():
        return fake_redis

    class FakeAsyncClient:
        def __init__(self, *, timeout: int) -> None:
            assert timeout == 5

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, url: str, *, json: dict[str, object]):
            assert url == "https://example.test/webhook"
            posted_payloads.append(json)
            return httpx.Response(200, request=httpx.Request("POST", url))

    monkeypatch.setattr(feishu_utils.redis_client, "get_client", get_client)
    monkeypatch.setattr(feishu_utils.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(feishu_utils, "build_redis_key", lambda key: f"test-app:{key}")
    monkeypatch.setattr(
        feishu_utils,
        "settings",
        SimpleNamespace(
            feishu_alarm=SimpleNamespace(
                enabled=True,
                webhook_url="https://example.test/webhook",
                timeout_seconds=5,
            ),
            app=SimpleNamespace(name="test-app"),
        ),
    )

    await feishu_utils.send_feishu_alarm(
        title="TG client 不可用",
        content="body",
        dedup_key="warning_tg_client_account:1",
        dedup_seconds=3600,
    )
    await feishu_utils.send_feishu_alarm(
        title="TG client 不可用",
        content="body",
        dedup_key="warning_tg_client_account:1",
        dedup_seconds=3600,
    )

    assert len(posted_payloads) == 1
    assert posted_payloads[0] == {
        "msg_type": "text",
        "content": {
            "text": "TG client 不可用\n\nAPP_NAME：test-app\nbody",
        },
    }
    assert fake_redis.calls == [
        {
            "key": "test-app:feishu_alarm:warning_tg_client_account:1",
            "value": "1",
            "ex": 3600,
            "nx": True,
        },
        {
            "key": "test-app:feishu_alarm:warning_tg_client_account:1",
            "value": "1",
            "ex": 3600,
            "nx": True,
        },
    ]


@pytest.mark.asyncio
async def test_send_feishu_alarm_logs_webhook_business_error(
    monkeypatch: pytest.MonkeyPatch,
):
    logged_errors: list[str] = []

    async def get_client():
        return _FakeRedis([True])

    class FakeAsyncClient:
        def __init__(self, *, timeout: int) -> None:
            assert timeout == 5

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, url: str, *, json: dict[str, object]):
            _ = json
            return httpx.Response(
                200,
                json={"code": 19024, "msg": "invalid webhook"},
                request=httpx.Request("POST", url),
            )

    monkeypatch.setattr(feishu_utils.redis_client, "get_client", get_client)
    monkeypatch.setattr(feishu_utils.httpx, "AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(feishu_utils.logger, "error", logged_errors.append)
    monkeypatch.setattr(
        feishu_utils,
        "settings",
        SimpleNamespace(
            feishu_alarm=SimpleNamespace(
                enabled=True,
                webhook_url="https://example.test/webhook",
                timeout_seconds=5,
            ),
            app=SimpleNamespace(name="test-app"),
        ),
    )

    await feishu_utils.send_feishu_alarm(
        title="TG client 不可用",
        content="body",
        dedup_key="warning_tg_client_account:1",
    )

    assert "Feishu webhook rejected" in logged_errors[0]
