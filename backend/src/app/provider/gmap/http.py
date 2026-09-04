"""Gmap HTTP Search / Reviews 唯一异步 Provider 实例。"""

import asyncio

from app.provider.gmap.rpc.client import GmapRpcClient
from app.provider.gmap.rpc.entry import merge_entries
from app.provider.gmap.rpc.parsers import (
    JsonValue,
    parse_browser_response,
    parse_l2_response,
    parse_regular_response,
    parse_reviews_response,
    viewport_matches,
)
from app.provider.gmap.rpc.templates import (
    BROWSER_SEARCH_TEMPLATE_URL,
    SOCS_COOKIE,
    browser_search_url,
    preview_place_url,
    regular_search_url,
    reviews_url,
)
from app.provider.gmap.types import (
    GmapParseError,
    GmapProviderError,
    GmapReviewPage,
    GmapSearchResult,
    GmapViewport,
)
from app.services.maps_engine_service import maps_engine_service
from app.utils.logger import logger


class _GmapHttpProvider:
    """编排两类搜索 pb、L2 补列及 Reviews 单页请求。"""

    def __init__(self) -> None:
        self._client = GmapRpcClient()

    async def _initialize(self) -> None:
        config = await maps_engine_service.get_config()
        await self._client.initialize(config.proxies, config.concurrency)

    @staticmethod
    def _cookie(nid: str) -> str:
        return f"SOCS={SOCS_COOKIE}; NID={nid}"

    @staticmethod
    def _accept_regular(body: str, ll: GmapViewport | None) -> bool:
        try:
            rows = parse_regular_response(body)
        except GmapParseError:
            return False
        return not rows or ll is None or viewport_matches(rows, ll.lat, ll.lng)

    @staticmethod
    def _accept_browser(body: str, ll: GmapViewport | None) -> bool:
        try:
            rows = parse_browser_response(body)
        except GmapParseError:
            return False
        return ll is None or viewport_matches(rows, ll.lat, ll.lng)

    @staticmethod
    def _accept_l2(body: str) -> bool:
        try:
            parse_l2_response(body)
        except GmapParseError:
            return False
        return True

    @staticmethod
    def _accept_reviews(body: str) -> bool:
        try:
            parse_reviews_response(body)
        except (GmapParseError, ValueError):
            return False
        return True

    async def search_places(
        self,
        keyword: str,
        max_depth: int,
        hl: str,
        gl: str | None = None,
        ll: GmapViewport | None = None,
    ) -> GmapSearchResult:
        """完成常规深分页、browser 覆盖与未覆盖 fid 的 L2 补列。"""
        if not 1 <= max_depth <= 10:
            raise ValueError("search_places max_depth must be between 1 and 10")
        await self._initialize()
        nid = await self._client.mint_nid(hl)
        cookie = self._cookie(nid)

        regular_rows: list[dict[str, JsonValue]] = []
        seen: set[str] = set()
        for page in range(max_depth):
            url = regular_search_url(keyword, page * 20, hl, gl, ll)
            body = await self._client.get(
                url,
                cookie=cookie,
                timeout=30,
                retry_delay=lambda attempt: 1 + attempt,
                accept=lambda value: self._accept_regular(value, ll),
            )
            page_rows = parse_regular_response(body)
            new_rows = [row for row in page_rows if row.get("fid") not in seen]
            for row in new_rows:
                fid = row.get("fid")
                if isinstance(fid, str):
                    seen.add(fid)
            regular_rows.extend(new_rows)
            if len(page_rows) < 20 or not new_rows:
                break
            if page + 1 < max_depth:
                await asyncio.sleep(0.8)

        if not regular_rows:
            return GmapSearchResult(entries=[])

        partial = False
        warnings: list[str] = []
        browser_rows: list[dict[str, JsonValue]] = []
        browser_by_fid: dict[str, dict[str, JsonValue]] = {}
        count = max(20, ((len(seen) + 19) // 20) * 20)
        for _ in range(4):
            try:
                body = await self._client.get(
                    browser_search_url(
                        BROWSER_SEARCH_TEMPLATE_URL, keyword, count, hl, gl, ll
                    ),
                    cookie=cookie,
                    timeout=60,
                    retry_delay=lambda attempt: 2 + attempt * 2,
                    accept=lambda value: self._accept_browser(value, ll),
                )
                for row in parse_browser_response(body):
                    fid = row.get("fid")
                    if isinstance(fid, str) and fid not in browser_by_fid:
                        browser_by_fid[fid] = row
                covered = sum(fid in browser_by_fid for fid in seen)
                if not seen or covered >= len(seen) * 0.95:
                    break
            except GmapProviderError:
                partial = True
                warnings.append("browser pb supplement failed")
                logger.error(
                    "gmap_http_provider.search_places: browser pb supplement failed",
                    exc_info=True,
                )
            count += 60
            await asyncio.sleep(1)
        browser_rows.extend(browser_by_fid.values())

        l2_rows: dict[str, dict[str, JsonValue]] = {}
        for fid in seen - browser_by_fid.keys():
            try:
                body = await self._client.get(
                    preview_place_url(fid, hl, gl),
                    cookie=cookie,
                    timeout=40,
                    retry_delay=lambda attempt: 1 + attempt,
                    accept=self._accept_l2,
                )
                l2_rows[fid] = parse_l2_response(body)
            except GmapProviderError:
                partial = True
                warnings.append(f"L2 supplement failed: fid={fid}")
                logger.error(
                    "gmap_http_provider.search_places: L2 supplement failed: fid=%s",
                    fid,
                    exc_info=True,
                )

        return GmapSearchResult(
            entries=merge_entries(keyword, regular_rows, browser_rows, l2_rows),
            partial=partial,
            warnings=warnings,
        )

    async def list_reviews(
        self,
        fid: str,
        sort_by: int,
        cursor: str | None,
        hl: str,
    ) -> GmapReviewPage:
        """获取 GetLocalBoqProxy 单页，保留上游 cursor。"""
        if sort_by not in (1, 2, 3, 4):
            raise ValueError("list_reviews sort_by must be between 1 and 4")
        await self._initialize()
        body = await self._client.get(
            reviews_url(fid, sort_by, cursor, hl),
            cookie=None,
            timeout=40,
            retry_delay=lambda attempt: 1 + attempt,
            accept=self._accept_reviews,
        )
        return parse_reviews_response(body)


gmap_http_provider = _GmapHttpProvider()

__all__ = ["gmap_http_provider"]
