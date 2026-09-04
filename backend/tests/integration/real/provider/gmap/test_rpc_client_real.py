"""仅替换不可控 Google 出口，验证 RPC client 重试与代理策略。"""

import asyncio

import pytest

import app.provider.gmap.rpc.client as client_module
from app.provider.gmap.rpc.client import GmapRpcClient
from app.provider.gmap.types import GmapRequestError

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


class _Response:
    def __init__(self, status_code: int, text: str) -> None:
        self.status_code = status_code
        self.text = text
        self.cookies: dict[str, str] = {}


class _Session:
    outcomes: list[object] = []
    proxies: list[str] = []

    def __init__(self, **kwargs: object) -> None:
        self._outcomes = list(self.outcomes)

    async def get(self, url: str, **kwargs: object) -> _Response:
        proxy = kwargs.get("proxy")
        if isinstance(proxy, str):
            self.proxies.append(proxy)
        outcome = self._outcomes.pop(0)
        if isinstance(outcome, BaseException):
            raise outcome
        assert isinstance(outcome, _Response)
        return outcome


async def _client(
    monkeypatch: pytest.MonkeyPatch, outcomes: list[object]
) -> GmapRpcClient:
    _Session.outcomes = outcomes
    _Session.proxies = []
    monkeypatch.setattr(client_module, "AsyncSession", _Session)
    client = GmapRpcClient()
    await client.initialize(
        ["http://user:secret@proxy-a.test:8000", "http://proxy-b.test:8000"], 2
    )
    return client


async def test_real_rpc_client_returns_successful_google_body(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = await _client(monkeypatch, [_Response(200, "ok")])

    body = await client.get(
        "https://www.google.com/test",
        cookie=None,
        timeout=30,
        retry_delay=lambda attempt: 0,
    )

    assert body == "ok"


async def test_real_rpc_client_timeout_retries_with_another_proxy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = await _client(monkeypatch, [asyncio.TimeoutError(), _Response(200, "ok")])

    assert (
        await client.get(
            "https://www.google.com/test",
            cookie=None,
            timeout=30,
            retry_delay=lambda attempt: 0,
        )
        == "ok"
    )
    assert len(_Session.proxies) == 2
    assert _Session.proxies[0] != _Session.proxies[1]


@pytest.mark.parametrize(
    "outcome,accept",
    [
        (_Response(503, "unavailable"), None),
        (_Response(200, "invalid"), lambda body: body.startswith(")]}'")),
    ],
    ids=["non_2xx", "invalid_protocol_response"],
)
async def test_real_rpc_client_maps_exhausted_google_failures(
    monkeypatch: pytest.MonkeyPatch,
    outcome: _Response,
    accept: object,
) -> None:
    client = await _client(monkeypatch, [outcome, outcome, outcome])

    with pytest.raises(GmapRequestError, match="exhausted retries") as caught:
        await client.get(
            "https://www.google.com/test",
            cookie=None,
            timeout=30,
            retry_delay=lambda attempt: 0,
            accept=accept if callable(accept) else None,
        )

    assert "secret" not in str(caught.value)
