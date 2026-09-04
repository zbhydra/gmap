"""通过唯一 Provider 公共入口验证 Search 编排，仅替换 Google HTTP 出口。"""

import asyncio
from collections.abc import AsyncIterator
from pathlib import Path
from urllib.parse import unquote, urlsplit

import pytest

import app.provider.gmap.http as http_module
from app.provider.gmap import GmapProviderError, GmapViewport, gmap_http_provider
from app.provider.gmap.rpc.parsers import (
    parse_l2_response,
    parse_regular_response,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_RAW = Path(__file__).parents[4] / "fixtures/gmap/raw"
_REGULAR = (_RAW / "regular_pb_response.txt").read_text()
_BROWSER_1 = (_RAW / "browser_pb_response_1.txt").read_text()
_BROWSER_2 = (_RAW / "browser_pb_response_2.txt").read_text()
_L2 = (_RAW / "l2_response.txt").read_text()
_L2_FID = str(parse_l2_response(_L2)["fid"])
_MISSING_FID = str(
    (
        {row["fid"] for row in parse_regular_response(_REGULAR)}
        - {
            row["fid"]
            for body in (_BROWSER_1, _BROWSER_2)
            for row in http_module.parse_browser_response(body)
        }
    ).pop()
)
_EMPTY_REGULAR = ")]}'\n[[null,[null]]]"


class _Response:
    def __init__(self, status_code: int, text: str, nid: str | None = None) -> None:
        self.status_code = status_code
        self.text = text
        self.cookies = {"NID": nid} if nid else {}


class _GoogleSession:
    scenario = ""
    urls: list[str] = []
    browser_calls = 0

    async def get(self, url: str, **kwargs: object) -> _Response:
        self.urls.append(url)
        if url.startswith("https://www.google.com/maps?hl="):
            return _Response(200, "maps", nid="test-nid")
        if "/search?" in url and "maps.google.com" in url:
            if self.scenario == "empty":
                return _Response(200, _EMPTY_REGULAR)
            if self.scenario == "timeout":
                raise asyncio.TimeoutError
            if self.scenario == "non_2xx":
                return _Response(503, "unavailable")
            if self.scenario == "invalid":
                return _Response(200, "invalid")
            return _Response(200, _REGULAR)
        if "/search?tbm=map" in url:
            type(self).browser_calls += 1
            body = _BROWSER_1 if type(self).browser_calls == 1 else _BROWSER_2
            if self.scenario == "adaptive_l2":
                body = body.replace(_L2_FID, _MISSING_FID)
            return _Response(200, body)
        if "/maps/preview/place" in url:
            if self.scenario == "l2_failure":
                raise asyncio.TimeoutError
            return _Response(200, _L2)
        raise AssertionError(f"unexpected Google URL: {url}")


async def _no_sleep(delay: float) -> None:
    return None


@pytest.fixture(autouse=True)
async def real_google_exit(
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[None]:
    """为编排安装独立 client 状态，并在用例结束后完整恢复唯一实例。"""
    client = gmap_http_provider._client  # noqa: SLF001
    original = (
        client._init_lock,
        client._semaphore,
        client._proxies,
        client._session,
    )
    session = _GoogleSession()
    _GoogleSession.urls = []
    _GoogleSession.browser_calls = 0
    client._init_lock = asyncio.Lock()
    client._semaphore = asyncio.Semaphore(2)
    client._proxies = (
        "http://proxy-a.test:8000",
        "http://proxy-b.test:8000",
    )
    client._session = session
    monkeypatch.setattr(http_module.asyncio, "sleep", _no_sleep)
    try:
        yield
    finally:
        (
            client._init_lock,
            client._semaphore,
            client._proxies,
            client._session,
        ) = original


@pytest.mark.parametrize("scenario", ["timeout", "non_2xx", "invalid"])
async def test_real_http_public_search_rejects_main_page_failure(
    scenario: str,
) -> None:
    _GoogleSession.scenario = scenario

    with pytest.raises(GmapProviderError):
        await gmap_http_provider.search_places("coffee", 1, "en")


async def test_real_http_public_search_treats_ll_empty_page_as_normal_stop() -> None:
    _GoogleSession.scenario = "empty"

    result = await gmap_http_provider.search_places(
        "coffee", 1, "en", ll=GmapViewport(45.523, -122.676, 14)
    )

    assert result.entries == []
    assert result.partial is False
    assert not any(
        urlsplit(url).hostname == "www.google.com" and urlsplit(url).path == "/search"
        for url in _GoogleSession.urls
    )


async def test_real_http_public_search_marks_l2_failure_partial() -> None:
    _GoogleSession.scenario = "l2_failure"

    result = await gmap_http_provider.search_places("coffee shop in Portland", 1, "en")

    assert len(result.entries) == 20
    assert result.partial is True
    assert result.warnings == [f"L2 supplement failed: fid={_MISSING_FID}"]


async def test_real_http_public_search_adapts_then_requests_only_uncovered_l2() -> None:
    _GoogleSession.scenario = "adaptive_l2"

    result = await gmap_http_provider.search_places("coffee shop in Portland", 1, "en")

    l2_urls = [unquote(url) for url in _GoogleSession.urls if "/preview/place" in url]
    assert _GoogleSession.browser_calls == 2
    assert len(l2_urls) == 1
    assert _L2_FID in l2_urls[0]
    entry = next(entry for entry in result.entries if entry.fid == _L2_FID)
    assert entry.owner_id is not None
    assert result.partial is False
