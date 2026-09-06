"""仅替换不可控 Google 出口，验证 RPC client 重试与代理策略。"""

import asyncio

import pytest
from curl_cffi.requests import AsyncSession, Response

import app.provider.gmap.rpc.client as client_module
from app.provider.gmap.rpc.client import GmapRpcClient
from app.provider.gmap.types import GmapRequestError

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


async def test_real_rpc_client_honors_concurrency_and_isolates_search_cookies(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """本地 HTTP 出口保留真实 curl 连接池与 Cookie 行为，复现两项批量缺陷。"""
    parallel = 16
    received = 0
    all_connected = asyncio.Event()
    release = asyncio.Event()
    cookie_headers: list[bytes] = []

    async def respond(
        reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        nonlocal received
        try:
            headers = await reader.readuntil(b"\r\n\r\n")
            received += 1
            sequence = received
            cookie_headers.append(headers)
            if received >= parallel:
                all_connected.set()
            await release.wait()
            # Google 已收到 NID 时通常不再下发新的 NID。
            cookie = (
                b""
                if b"NID=" in headers
                else f"Set-Cookie: NID=search-{sequence}; Path=/\r\n".encode()
            )
            writer.write(
                b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n"
                + cookie
                + b"\r\nok"
            )
            await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()

    server = await asyncio.start_server(respond, "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]
    original_get = AsyncSession.get

    async def local_google(
        session: AsyncSession, url: str, *, headers: dict[str, str], **kwargs: object
    ) -> Response:
        return await original_get(
            session,
            f"http://127.0.0.1:{port}/maps",
            headers=headers,
            proxy="",
            timeout=5,
        )

    monkeypatch.setattr(AsyncSession, "get", local_google)
    client = GmapRpcClient()
    await client.initialize(["http://proxy.test:8000"], parallel)
    calls = [asyncio.create_task(client.mint_nid("en")) for _ in range(parallel)]
    try:
        await asyncio.wait_for(all_connected.wait(), timeout=5)
        release.set()
        nids = await asyncio.gather(*calls)
        nids.extend([await client.mint_nid("en"), await client.mint_nid("en")])
        assert len(set(nids)) == parallel + 2
        assert all(b"NID=" not in headers for headers in cookie_headers)
    finally:
        release.set()
        for call in calls:
            call.cancel()
        await asyncio.gather(*calls, return_exceptions=True)
        if client._session is not None:
            await client._session.close()
        server.close()
        await server.wait_closed()


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
