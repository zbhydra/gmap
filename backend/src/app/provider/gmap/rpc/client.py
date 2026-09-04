"""Google RPC 异步出口：共享并发预算、代理轮换、gzip、timeout 与重试。"""

import asyncio
import random
from collections.abc import Callable
from urllib.parse import urlsplit

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException

from app.provider.gmap.types import GmapConfigurationError, GmapRequestError

_ACCEPT_HEADERS = {
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip",
}


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
            self._session = AsyncSession(impersonate="chrome")

    def _choose_proxy(self, failed: str | None) -> str:
        candidates = [proxy for proxy in self._proxies if proxy != failed]
        return random.choice(candidates or list(self._proxies))

    async def get(
        self,
        url: str,
        *,
        cookie: str | None,
        timeout: float,
        retry_delay: Callable[[int], float],
        accept: Callable[[str], bool] | None = None,
    ) -> str:
        """最多请求三次；失败后有其他代理时优先更换。"""
        if self._semaphore is None or self._session is None:
            raise GmapConfigurationError("gmap rpc get: client is not initialized")
        failed_proxy: str | None = None
        last_error = "no response"
        for attempt in range(3):
            proxy = self._choose_proxy(failed_proxy)
            headers = dict(_ACCEPT_HEADERS)
            if cookie:
                headers["Cookie"] = cookie
            try:
                async with self._semaphore:
                    response = await self._session.get(
                        url,
                        headers=headers,
                        proxy=proxy,
                        timeout=timeout,
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
            failed_proxy = proxy
            if attempt < 2:
                await asyncio.sleep(retry_delay(attempt))
        raise GmapRequestError(
            "gmap rpc get: Google request exhausted retries: "
            f"endpoint={urlsplit(url).path}, proxy={_proxy_label(failed_proxy)}, "
            f"reason={last_error}"
        )

    async def mint_nid(self, hl: str) -> str:
        """通过 Maps 壳页铸造当前 Search 调用独享的 NID。"""
        if self._semaphore is None or self._session is None:
            raise GmapConfigurationError("gmap rpc mint_nid: client is not initialized")
        failed_proxy: str | None = None
        last_error = "NID cookie missing"
        for attempt in range(3):
            proxy = self._choose_proxy(failed_proxy)
            try:
                async with self._semaphore:
                    response = await self._session.get(
                        f"https://www.google.com/maps?hl={hl}",
                        headers={**_ACCEPT_HEADERS, "Cookie": f"SOCS={SOCS_COOKIE}"},
                        proxy=proxy,
                        timeout=40,
                    )
                nid = (
                    response.cookies.get("NID") if response.status_code == 200 else None
                )
                if nid:
                    return str(nid)
                last_error = f"HTTP {response.status_code}, NID cookie missing"
            except (RequestException, asyncio.TimeoutError) as exc:
                last_error = type(exc).__name__
            failed_proxy = proxy
            if attempt < 2:
                await asyncio.sleep(1 + attempt)
        raise GmapRequestError(
            "gmap rpc mint_nid: NID request exhausted retries: "
            f"proxy={_proxy_label(failed_proxy)}, reason={last_error}"
        )


# 与生产脚本一致的固定匿名同意 cookie，不含用户凭据。
from app.provider.gmap.rpc.templates import SOCS_COOKIE
