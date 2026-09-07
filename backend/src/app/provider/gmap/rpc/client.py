"""Google RPC 异步出口：共享并发预算、代理轮换、gzip、timeout 与重试。"""

import asyncio
import random
from collections.abc import Callable
from dataclasses import dataclass
from time import perf_counter
from urllib.parse import urlsplit

from curl_cffi import CurlInfo
from curl_cffi.requests import AsyncSession, Response
from curl_cffi.requests.exceptions import RequestException

from app.provider.gmap.types import GmapConfigurationError, GmapRequestError
from app.utils.logger import logger

_ACCEPT_HEADERS = {
    "Accept-Language": "en-US,en;q=0.9",
}

_TIMING_INFOS = [
    CurlInfo.NAMELOOKUP_TIME,
    CurlInfo.CONNECT_TIME,
    CurlInfo.APPCONNECT_TIME,
    CurlInfo.PRETRANSFER_TIME,
    CurlInfo.STARTTRANSFER_TIME,
    CurlInfo.TOTAL_TIME,
    CurlInfo.NUM_CONNECTS,
    CurlInfo.CONN_ID,
    CurlInfo.HTTP_VERSION,
    CurlInfo.SIZE_DOWNLOAD_T,
]


@dataclass
class GmapRequestState:
    """单次搜索持有代理与日志标识，失败切换后后续请求沿用新代理。"""

    proxy: str
    request_id: str
    sequence: int = 0


def _proxy_label(proxy: str | None) -> str:
    if proxy is None:
        return "unavailable"
    parsed = urlsplit(proxy)
    return f"{parsed.scheme}://{parsed.hostname}:{parsed.port}"


class GmapRpcClient:
    """供唯一 HTTP Provider 持有的 Google RPC 客户端。"""

    def __init__(self) -> None:
        self._init_lock = asyncio.Lock()
        self._semaphore: asyncio.Semaphore | None = None
        self._proxies: tuple[str, ...] = ()
        self._session: AsyncSession | None = None

    async def initialize(self, proxies: list[str], concurrency: int) -> None:
        """首次调用固定每进程配置；后续配置变更须重启进程。"""
        if self._semaphore is not None:
            return
        async with self._init_lock:
            if self._semaphore is not None:
                return
            if not proxies:
                raise GmapConfigurationError(
                    "gmap rpc initialize: no proxy configured for Google requests"
                )
            self._proxies = tuple(proxies)
            self._semaphore = asyncio.Semaphore(concurrency)
            # 连接池沿用配置预算；Cookie 由每次 Search 显式持有，禁止跨调用累积。
            self._session = AsyncSession(
                impersonate="chrome",
                max_clients=concurrency,
                discard_cookies=True,
                curl_infos=_TIMING_INFOS,
            )

    def choose_proxy(self, failed: str | None = None) -> str:
        candidates = [proxy for proxy in self._proxies if proxy != failed]
        return random.choice(candidates or list(self._proxies))

    async def _request(
        self,
        url: str,
        state: GmapRequestState,
        cookie: str | None,
        timeout: float,
        *,
        proxy: str,
        sequence: int,
    ) -> Response:
        if self._semaphore is None or self._session is None:
            raise GmapConfigurationError("gmap rpc request: client is not initialized")
        started = perf_counter()
        headers = dict(_ACCEPT_HEADERS)
        if cookie:
            headers["Cookie"] = cookie
        async with self._semaphore:
            acquired = perf_counter()
            try:
                response = await self._session.get(
                    url, headers=headers, proxy=proxy, timeout=timeout
                )
            except (RequestException, asyncio.TimeoutError) as exc:
                logger.warning(
                    "gmap_rpc.request: request=%s seq=%s host=%s path=%s proxy=%s "
                    "queue_ms=%.2f duration_ms=%.2f error=%s",
                    state.request_id,
                    sequence,
                    urlsplit(url).hostname,
                    urlsplit(url).path,
                    _proxy_label(proxy),
                    (acquired - started) * 1000,
                    (perf_counter() - started) * 1000,
                    type(exc).__name__,
                )
                raise
        info = response.infos
        logger.info(
            "gmap_rpc.request: request=%s seq=%s host=%s path=%s final_host=%s proxy=%s "
            "status=%s connection_id=%s new_connections=%s curl_http_version=%s "
            "queue_ms=%.2f duration_ms=%.2f network_ms=%.2f dns_ms=%.2f "
            "tcp_ms=%.2f tunnel_tls_ms=%.2f ttfb_ms=%.2f body_ms=%.2f "
            "bytes=%s decoded_bytes=%s content_encoding=%s",
            state.request_id,
            sequence,
            urlsplit(url).hostname,
            urlsplit(url).path,
            urlsplit(response.url).hostname,
            _proxy_label(proxy),
            response.status_code,
            info.get(CurlInfo.CONN_ID, -1),
            info.get(CurlInfo.NUM_CONNECTS, 0),
            info.get(CurlInfo.HTTP_VERSION, 0),
            (acquired - started) * 1000,
            (perf_counter() - started) * 1000,
            info.get(CurlInfo.TOTAL_TIME, 0) * 1000,
            info.get(CurlInfo.NAMELOOKUP_TIME, 0) * 1000,
            (info.get(CurlInfo.CONNECT_TIME, 0) - info.get(CurlInfo.NAMELOOKUP_TIME, 0))
            * 1000,
            (info.get(CurlInfo.APPCONNECT_TIME, 0) - info.get(CurlInfo.CONNECT_TIME, 0))
            * 1000,
            (
                info.get(CurlInfo.STARTTRANSFER_TIME, 0)
                - info.get(CurlInfo.PRETRANSFER_TIME, 0)
            )
            * 1000,
            (
                info.get(CurlInfo.TOTAL_TIME, 0)
                - info.get(CurlInfo.STARTTRANSFER_TIME, 0)
            )
            * 1000,
            info.get(CurlInfo.SIZE_DOWNLOAD_T, 0),
            len(response.content),
            response.headers.get("content-encoding", "identity"),
        )
        return response

    async def _retry(
        self,
        state: GmapRequestState,
        previous: str,
        sequence: int,
        reason: str,
        delay: float,
    ) -> None:
        # 并行请求可能已经完成切换，旧请求的失败不再覆盖新的代理选择。
        if state.proxy == previous:
            state.proxy = self.choose_proxy(previous)
        logger.warning(
            "gmap_rpc.retry: request=%s seq=%s previous_proxy=%s next_proxy=%s "
            "reason=%s wait_ms=%.2f",
            state.request_id,
            sequence,
            _proxy_label(previous),
            _proxy_label(state.proxy),
            reason,
            delay * 1000,
        )
        await asyncio.sleep(delay)

    async def get(
        self,
        url: str,
        *,
        state: GmapRequestState,
        cookie: str | None,
        timeout: float,
        retry_delay: Callable[[int], float],
        accept: Callable[[str], bool] | None = None,
    ) -> str:
        """最多请求三次；失败后有其他代理时优先更换。"""
        last_error = "no response"
        for attempt in range(3):
            state.sequence += 1
            sequence, proxy = state.sequence, state.proxy
            try:
                response = await self._request(
                    url, state, cookie, timeout, proxy=proxy, sequence=sequence
                )
                if response.status_code != 200:
                    last_error = f"HTTP {response.status_code}"
                elif not response.text:
                    last_error = "empty response"
                elif accept is not None and not accept(response.text):
                    last_error = "response rejected by protocol canary"
                else:
                    return response.text
            except (RequestException, asyncio.TimeoutError) as exc:
                last_error = type(exc).__name__
            if attempt < 2:
                await self._retry(
                    state, proxy, sequence, last_error, retry_delay(attempt)
                )
        raise GmapRequestError(
            "gmap rpc get: Google request exhausted retries: "
            f"endpoint={urlsplit(url).path}, proxy={_proxy_label(proxy)}, "
            f"reason={last_error}"
        )

    async def mint_nid(self, hl: str, *, state: GmapRequestState) -> str:
        """通过 Maps 壳页铸造当前 Search 调用独享的 NID。"""
        last_error = "NID cookie missing"
        for attempt in range(3):
            state.sequence += 1
            sequence, proxy = state.sequence, state.proxy
            try:
                response = await self._request(
                    f"https://www.google.com/maps?hl={hl}",
                    state,
                    f"SOCS={SOCS_COOKIE}",
                    40,
                    proxy=proxy,
                    sequence=sequence,
                )
                nid = (
                    response.cookies.get("NID") if response.status_code == 200 else None
                )
                if nid:
                    return str(nid)
                last_error = f"HTTP {response.status_code}, NID cookie missing"
            except (RequestException, asyncio.TimeoutError) as exc:
                last_error = type(exc).__name__
            if attempt < 2:
                await self._retry(state, proxy, sequence, last_error, 1 + attempt)
        raise GmapRequestError(
            "gmap rpc mint_nid: NID request exhausted retries: "
            f"proxy={_proxy_label(proxy)}, reason={last_error}"
        )


# 与生产脚本一致的固定匿名同意 cookie，不含用户凭据。
from app.provider.gmap.rpc.templates import SOCS_COOKIE
