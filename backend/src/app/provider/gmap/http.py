"""Gmap HTTP Search / Reviews 唯一异步 Provider 实例。"""

import asyncio
from time import perf_counter
from uuid import uuid4

from app.provider.gmap.rpc.client import GmapRequestState, GmapRpcClient
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
from app.schemas.admin_schema import GmapEngineConfig
from app.utils.logger import logger


class _GmapHttpProvider:
    """编排两类搜索 pb、L2 补列及 Reviews 单页请求。"""

    def __init__(self) -> None:
        self._client = GmapRpcClient()

    async def initialize(self, config: GmapEngineConfig) -> None:
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
        *,
        request_id: str | None = None,
    ) -> GmapSearchResult:
        """完成常规深分页、browser 覆盖与未覆盖 fid 的 L2 补列。"""
        if not 1 <= max_depth <= 10:
            raise ValueError("search_places max_depth must be between 1 and 10")
        stage_started = perf_counter()
        state = GmapRequestState(self._client.choose_proxy(), request_id or uuid4().hex)
        logger.info(
            "gmap_http.search: request=%s keyword=%r stage=start",
            state.request_id,
            keyword,
        )
        nid = await self._client.mint_nid(hl, state=state)
        cookie = self._cookie(nid)
        logger.info(
            "gmap_http.search: request=%s keyword=%r stage=nid duration_ms=%.2f",
            state.request_id,
            keyword,
            (perf_counter() - stage_started) * 1000,
        )

        stage_started = perf_counter()
        regular_rows: list[dict[str, JsonValue]] = []
        seen: set[str] = set()

        async def fetch_page(page: int) -> list[dict[str, JsonValue]]:
            url = regular_search_url(keyword, page * 20, hl, gl, ll)
            body = await self._client.get(
                url,
                state=state,
                cookie=cookie,
                timeout=30,
                retry_delay=lambda attempt: 1 + attempt,
                accept=lambda value: self._accept_regular(value, ll),
            )
            return parse_regular_response(body)

        pending: list[asyncio.Task[list[dict[str, JsonValue]]]] = []
        try:
            for page in range(max_depth):
                if page == 0:
                    page_rows = await fetch_page(0)
                else:
                    if not pending:
                        pending = [
                            asyncio.create_task(fetch_page(i))
                            for i in range(1, max_depth)
                        ]
                    page_rows = await pending[page - 1]
                new_rows = [row for row in page_rows if row.get("fid") not in seen]
                for row in new_rows:
                    fid = row.get("fid")
                    if isinstance(fid, str):
                        seen.add(fid)
                regular_rows.extend(new_rows)
                if len(page_rows) < 20 or not new_rows:
                    break
        finally:
            # 后续页已并行发出；按页序早停后取消未使用请求，回收完成的异常。
            for task in pending:
                if not task.done():
                    task.cancel()
            await asyncio.gather(*pending, return_exceptions=True)

        logger.info(
            "gmap_http.search: request=%s keyword=%r stage=regular duration_ms=%.2f records=%s",
            state.request_id,
            keyword,
            (perf_counter() - stage_started) * 1000,
            len(regular_rows),
        )
        if not regular_rows:
            return GmapSearchResult(entries=[])

        stage_started = perf_counter()
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
                    state=state,
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
                    "gmap_http_provider.search_places: request=%s browser pb supplement failed",
                    state.request_id,
                    exc_info=True,
                )
            count += 60
        browser_rows.extend(browser_by_fid.values())
        logger.info(
            "gmap_http.search: request=%s keyword=%r stage=browser duration_ms=%.2f records=%s",
            state.request_id,
            keyword,
            (perf_counter() - stage_started) * 1000,
            len(browser_rows),
        )

        stage_started = perf_counter()
        l2_rows: dict[str, dict[str, JsonValue]] = {}

        async def fetch_l2(fid: str) -> dict[str, JsonValue] | None:
            try:
                body = await self._client.get(
                    preview_place_url(fid, hl, gl),
                    state=state,
                    cookie=cookie,
                    timeout=40,
                    retry_delay=lambda attempt: 1 + attempt,
                    accept=self._accept_l2,
                )
                return parse_l2_response(body)
            except GmapProviderError:
                logger.error(
                    "gmap_http_provider.search_places: request=%s L2 supplement failed: fid=%s",
                    state.request_id,
                    fid,
                    exc_info=True,
                )
                return None

        async with asyncio.TaskGroup() as group:
            detail_tasks = {
                fid: group.create_task(fetch_l2(fid))
                for fid in seen - browser_by_fid.keys()
            }
        for fid, detail_task in detail_tasks.items():
            detail_row = detail_task.result()
            if detail_row is None:
                partial = True
                warnings.append(f"L2 supplement failed: fid={fid}")
            else:
                l2_rows[fid] = detail_row

        logger.info(
            "gmap_http.search: request=%s keyword=%r stage=l2 duration_ms=%.2f records=%s",
            state.request_id,
            keyword,
            (perf_counter() - stage_started) * 1000,
            len(l2_rows),
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
        body = await self._client.get(
            reviews_url(fid, sort_by, cursor, hl),
            state=GmapRequestState(self._client.choose_proxy(), uuid4().hex),
            cookie=None,
            timeout=40,
            retry_delay=lambda attempt: 1 + attempt,
            accept=self._accept_reviews,
        )
        return parse_reviews_response(body)


gmap_http_provider = _GmapHttpProvider()

__all__ = ["gmap_http_provider"]
