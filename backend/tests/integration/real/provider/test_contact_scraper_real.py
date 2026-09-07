"""独立库真实解析与安全边界，仅替换官网 HTTP 出口。"""

import asyncio
import traceback
from collections.abc import AsyncIterator

import pytest
from curl_cffi import CurlOpt
from curl_cffi.requests import AsyncSession

from contact_scraper import ContactScrapeError, scrape_contacts

from app.provider.maps_enrich import maps_enrich_provider
from app.schemas.maps_enrich_schema import MapsEnrichBusiness

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


class _Page:
    charset_encoding = "utf-8"

    def __init__(self, location: str | None = None) -> None:
        self.is_redirect = location is not None
        self.status_code = 302 if location else 200
        self.headers = {"location": location} if location else {}
        self.infos: dict = {}

    async def aiter_content(self) -> AsyncIterator[bytes]:
        yield (
            '<a href="mailto:Owner@merchant.test">email</a> owner@merchant.test '
            "nobody@example.com logo@2x.png "
            + "".join(
                f'<a href="https://{host}/merchant?tracking=1">social</a>'
                for host in (
                    "facebook.com",
                    "instagram.com",
                    "youtube.com",
                    "tiktok.com",
                    "linkedin.com",
                    "x.com",
                )
            )
        ).encode()

    async def aclose(self) -> None:
        pass


async def test_real_contacts_reuses_connection_across_same_host_redirect(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """只替换 HTTP 目的地，实际 curl 连续两跳必须复用同一条 TCP 连接。"""
    connections = 0
    requests = 0
    closed = asyncio.Event()

    async def respond(
        reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        nonlocal connections, requests
        connections += 1
        try:
            while True:
                try:
                    await reader.readuntil(b"\r\n\r\n")
                except asyncio.IncompleteReadError:
                    return
                requests += 1
                body = (
                    b"moved"
                    if requests == 1
                    else b'<a href="mailto:owner@merchant.test">email</a>'
                )
                status = (
                    b"302 Found\r\nLocation: /contact" if requests == 1 else b"200 OK"
                )
                writer.write(
                    b"HTTP/1.1 "
                    + status
                    + b"\r\nContent-Length: "
                    + str(len(body)).encode()
                    + b"\r\nConnection: keep-alive\r\n\r\n"
                    + body
                )
                await writer.drain()
        finally:
            writer.close()
            await writer.wait_closed()
            closed.set()

    server = await asyncio.start_server(respond, "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]
    original_get = AsyncSession.get

    async def local_site(session: AsyncSession, url: str, *, stream: bool):
        return await original_get(
            session, f"http://127.0.0.1:{port}/", stream=stream, proxy=""
        )

    monkeypatch.setattr(AsyncSession, "get", local_site)
    try:
        result = await scrape_contacts("http://1.1.1.1/start", proxy=None)
        await asyncio.wait_for(closed.wait(), 1)
        assert result.emails == ["owner@merchant.test"]
        assert requests == 2 and connections == 1
    finally:
        server.close()
        await server.wait_closed()


async def test_real_contacts_preserves_path_proxy_safety_and_cancellation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: list[str] = []
    proxy: str | None = "http://user:secret@proxy.test:8080"
    redirect = "/contact"
    started = asyncio.Event()
    cancelled = asyncio.Event()
    blocked = False

    async def get(session: AsyncSession, url: str, *, stream: bool) -> _Page:
        assert stream and session.timeout is None and not session.trust_env
        assert session.proxies == {"all": proxy or ""}
        assert session.curl_options[CurlOpt.NOPROXY] == ""
        calls.append(url)
        if blocked:
            started.set()
            try:
                await asyncio.Event().wait()
            finally:
                cancelled.set()
        return _Page(redirect if url.endswith("/start") else None)

    monkeypatch.setattr(AsyncSession, "get", get)
    result = await scrape_contacts("https://1.1.1.1/start", proxy=proxy)
    assert calls == ["https://1.1.1.1/start", "https://1.1.1.1/contact"]
    assert result.emails == ["Owner@merchant.test"]
    assert result.medias == {
        key: f"https://{host}/merchant"
        for key, host in (
            ("facebook", "facebook.com"),
            ("instagram", "instagram.com"),
            ("youtube", "youtube.com"),
            ("tiktok", "tiktok.com"),
            ("linkedin", "linkedin.com"),
            ("twitter", "x.com"),
        )
    }
    redirect = "http://127.0.0.1/private?token=secret"
    with pytest.raises(ContactScrapeError) as caught:
        await scrape_contacts("https://1.1.1.1/start", proxy=proxy)
    assert len(calls) == 3
    assert "secret" not in "".join(traceback.format_exception(caught.value))
    with pytest.raises(ContactScrapeError):
        await scrape_contacts("https://user:secret@1.1.1.1", proxy=proxy)
    assert len(calls) == 3

    proxy = None
    await scrape_contacts("1.1.1.1/contact", proxy=proxy)
    assert calls[-1] == "https://1.1.1.1/contact"
    blocked = True
    task = asyncio.create_task(scrape_contacts("https://1.1.1.1", proxy=proxy))
    await asyncio.wait_for(started.wait(), 1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert cancelled.is_set()
    with pytest.raises(ContactScrapeError, match="TimeoutError"):
        await scrape_contacts("https://1.1.1.1", proxy=proxy, timeout=0.01)


async def test_real_enrich_shared_slots_start_site_budget_after_wait(
    real_redis_ready: None,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls = 0
    active = 0
    peak = 0
    started = asyncio.Event()

    async def get(_session: AsyncSession, _url: str, *, stream: bool) -> _Page:
        nonlocal calls, active, peak
        calls += 1
        active += 1
        peak = max(peak, active)
        try:
            if calls <= 50:
                if calls == 50:
                    started.set()
                await asyncio.Event().wait()
            return _Page()
        finally:
            active -= 1

    monkeypatch.setattr(AsyncSession, "get", get)
    # 不可缓存的唯一归属键，避免测试缓存掩盖真实并发；HTTP 出口保持确定。
    businesses = [
        MapsEnrichBusiness(domain=f"site/{i}", website="https://1.1.1.1")
        for i in range(51)
    ]
    first = asyncio.create_task(
        maps_enrich_provider.enrich(businesses[:50], proxies=None)
    )
    try:
        await asyncio.wait_for(started.wait(), 1)
        last = await maps_enrich_provider.enrich(businesses[50:], proxies=None)
        await first
        assert peak == 50 and calls == 51 and active == 0
        assert last["results"][0]["emails"] == ["Owner@merchant.test"]
        assert not last["partial"]
        empty_pool = await maps_enrich_provider.enrich(businesses[50:], proxies=[])
        assert empty_pool["results"][0]["emails"] == [] and calls == 51
    finally:
        first.cancel()
        await asyncio.gather(first, return_exceptions=True)
