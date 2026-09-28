"""独立库真实解析与安全边界，仅替换官网 HTTP 出口。"""

import asyncio
import gzip
import traceback
from collections.abc import AsyncIterator

import pytest
from curl_cffi import CurlOpt
from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException
from traffic_scope import TrafficScope, current_scope

from contact_scraper import (
    ContactScrapeError,
    classify_social_url,
    extract_social_medias,
    scrape_contacts,
)

from app.provider.maps_enrich import maps_enrich_provider
from app.schemas.maps_enrich_schema import MapsEnrichBusiness

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


class _Page:
    charset_encoding = "utf-8"

    def __init__(self, location: str | None = None, status: int = 200) -> None:
        self.is_redirect = location is not None
        self.status_code = 302 if location else status
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
    proxy = "http://user:secret@proxy.test:8080"
    scope = TrafficScope("site-cancel")
    token = current_scope.set(scope)
    task = asyncio.create_task(scrape_contacts("https://1.1.1.1", proxy=proxy))
    await asyncio.wait_for(started.wait(), 1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert cancelled.is_set()
    assert scope.site.attempts == scope.site.unmeasured_attempts == 1
    current_scope.reset(token)
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
        assert empty_pool["results"][0]["emails"] == ["Owner@merchant.test"]
        assert calls == 52
    finally:
        first.cancel()
        await asyncio.gather(first, return_exceptions=True)


async def test_real_online_contacts_retry_proxy_only_for_recoverable_direct_failures(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    proxy = "http://proxy.test:8000"
    calls: list[str] = []
    direct_failure: int | str = 403

    async def get(session: AsyncSession, _url: str, *, stream: bool) -> _Page:
        assert stream
        exit_proxy = session.proxies["all"]
        calls.append(exit_proxy)
        if exit_proxy:
            assert exit_proxy == proxy
            return _Page()
        if direct_failure == "network":
            raise RequestException("connection failed")
        if direct_failure == "timeout":
            raise TimeoutError
        assert isinstance(direct_failure, int)
        return _Page(status=direct_failure)

    monkeypatch.setattr(AsyncSession, "get", get)
    scope = TrafficScope("site-retry")
    token = current_scope.set(scope)
    for failure in (401, 403, 407, 429, "network", "timeout"):
        direct_failure = failure
        calls.clear()
        result = await maps_enrich_provider.enrich(
            [MapsEnrichBusiness(domain="retry/case", website="https://1.1.1.1")],
            proxies=[proxy],
        )
        assert calls == ["", proxy]
        assert result["results"][0]["emails"] == ["Owner@merchant.test"]

    for failure in (404, 502):
        direct_failure = failure
        calls.clear()
        result = await maps_enrich_provider.enrich(
            [MapsEnrichBusiness(domain="retry/case", website="https://1.1.1.1")],
            proxies=[proxy],
        )
        assert calls == [""]
        assert result["results"][0]["emails"] == []

    direct_failure = 403
    for proxies in (None, []):
        calls.clear()
        result = await maps_enrich_provider.enrich(
            [MapsEnrichBusiness(domain="retry/case", website="https://1.1.1.1")],
            proxies=proxies,
        )
        assert calls == [""]
        assert result["results"][0]["emails"] == []

    calls.clear()
    result = await maps_enrich_provider.enrich(
        [MapsEnrichBusiness(domain="retry/private", website="https://127.0.0.1")],
        proxies=[proxy],
    )
    assert not calls and result["results"][0]["emails"] == []
    current_scope.reset(token)
    assert scope.site.attempts == 6
    assert scope.site.unmeasured_attempts == 0
    assert scope.site.partial_attempts == 0
    assert scope.site.body_bytes is not None and scope.site.body_bytes > 0


async def test_real_contacts_proxy_gzip_stream_counts_consumed_body_and_truncation(
    caplog: pytest.LogCaptureFixture,
) -> None:
    bodies = {
        "/full": b'<a href="mailto:owner@merchant.test">email</a>',
        "/limit": b"<p>x</p>" * (2 * 1024 * 1024 // 8 + 1024),
    }

    async def respond(
        reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        request = await reader.readuntil(b"\r\n\r\n")
        path = request.split(b" ", 2)[1].decode().removeprefix("http://1.1.1.1")
        compressed = gzip.compress(bodies[path])
        writer.write(
            b"HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nContent-Length: "
            + str(len(compressed)).encode()
            + b"\r\nConnection: close\r\n\r\n"
            + compressed
        )
        await writer.drain()
        writer.close()
        await writer.wait_closed()

    server = await asyncio.start_server(respond, "127.0.0.1", 0)
    port = server.sockets[0].getsockname()[1]
    scope = TrafficScope("site-gzip")
    token = current_scope.set(scope)
    try:
        proxy = f"http://127.0.0.1:{port}"
        result = await scrape_contacts("http://1.1.1.1/full", proxy=proxy)
        assert result.emails == ["owner@merchant.test"]
        assert scope.site.body_bytes == len(bodies["/full"])
        await scrape_contacts("http://1.1.1.1/limit", proxy=proxy)
    finally:
        current_scope.reset(token)
        server.close()
        await asyncio.wait_for(server.wait_closed(), 2)
    assert scope.site.attempts == 2
    assert scope.site.partial_attempts == 1
    assert scope.site.unmeasured_attempts == 0
    assert (
        scope.site.body_bytes is not None and scope.site.body_bytes >= 2 * 1024 * 1024
    )
    assert scope.site.request_bytes is not None and scope.site.request_bytes > 0
    assert scope.site.header_bytes is not None and scope.site.header_bytes > 0
    assert "contact_scraper.request: scope=site-gzip request=" in caplog.text
    assert "contact_scraper.request: task=" not in caplog.text


async def test_real_enrich_social_homepages_bypass_fetch_without_mixing_merchants(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """真实解析与编排；无数据库依赖，不可缓存归属键避免读写 Redis，仅替换 HTTP。"""
    calls: list[str] = []

    async def get(_session: AsyncSession, url: str, *, stream: bool) -> _Page:
        assert url == "https://1.1.1.1/contact"
        calls.append(url)
        return _Page()

    monkeypatch.setattr(AsyncSession, "get", get)
    profiles = [
        ("instagram", "https://www.instagram.com/First"),
        ("facebook", "https://facebook.com/First"),
        ("youtube", "https://youtube.com/@First"),
        ("tiktok", "https://tiktok.com/@First"),
        ("linkedin", "https://linkedin.com/company/First"),
        ("twitter", "https://x.com/First"),
        ("twitter", "https://twitter.com/Second"),
        ("facebook", "https://facebook.com/Second"),
    ]
    businesses = [
        MapsEnrichBusiness(domain="social/test", website=url + "/?tracking=1#about")
        for _, url in profiles
    ]
    for proxies in (None, []):
        batch = await maps_enrich_provider.enrich(businesses, proxies=proxies)
        assert not batch["partial"]
        assert [row["medias"] for row in batch["results"]] == [
            {platform: url} for platform, url in profiles
        ]
        assert all(not row["emails"] for row in batch["results"])
    assert not calls

    rejected = [
        "https://facebook.com.evil.test/shop",
        "https://notfacebook.com/shop",
        "https://user:secret@facebook.com/shop",
        "ftp://facebook.com/shop",
        "https://facebook.com:bad/shop",
        "https://facebook.com:65536/shop",
        "https://[broken",
        *(
            f"https://facebook.com{path}"
            for path in (
                "/sharer.php",
                "/share.php",
                "/intent/tweet",
                "/plugins",
                "/dialog",
                "/tr",
                "/LOGIN",
            )
        ),
    ]
    for url in rejected:
        assert classify_social_url(url) == {}
        assert extract_social_medias(f'<a href="{url}">link</a>') == {}
    assert not calls
    batch = await maps_enrich_provider.enrich(
        [
            *businesses,
            MapsEnrichBusiness(
                domain="ordinary/test", website="https://1.1.1.1/contact"
            ),
        ],
        proxies=None,
    )
    assert calls == ["https://1.1.1.1/contact"]
    assert batch["results"][-1]["emails"] == ["Owner@merchant.test"]
    assert [row["medias"] for row in batch["results"][:-1]] == [
        {platform: url} for platform, url in profiles
    ]
    bare = await maps_enrich_provider.enrich(
        [MapsEnrichBusiness(website="facebook.com/Third")], proxies=[]
    )
    assert bare["results"] == [
        {
            "key": "facebook.com",
            "emails": [],
            "medias": {"facebook": "https://facebook.com/Third"},
        }
    ]
