"""官网补全业务编排：域名缓存、去重、共享并发与显式出站策略。"""

import asyncio
import random
from collections.abc import Sequence
from typing import NamedTuple, TypedDict
from urllib.parse import urlsplit

from contact_scraper import ContactScrapeError, scrape_contacts
from pydantic import BaseModel, Field

from app.constants.maps_enrich import (
    ENRICH_CONCURRENCY,
    build_enrich_cache_key,
    enrich_cache_ttl_seconds,
    normalize_cache_domain,
)
from app.core.redis import redis_client
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key

_SITE_SEMAPHORE = asyncio.Semaphore(ENRICH_CONCURRENCY)


class _SiteDataPayload(BaseModel):
    """单站点补全结果（缓存 JSON 载荷同构，pydantic 校验替代 Any 解析）。"""

    emails: list[str] = Field(default_factory=list)
    medias: dict[str, str] = Field(default_factory=dict)


class _EnrichTarget(NamedTuple):
    """单条商家的补全目标（key 为空 = 无官网可抓，直接空结果）。"""

    key: str
    cache_domain: str | None
    fetch_url: str | None


def _derive_business_key(business: MapsEnrichBusiness) -> str:
    """推导结果归属键：domain 优先，缺省取 website 主机名，均为空返回空串。"""

    domain = business.domain.strip().lower()
    if domain:
        return domain
    hostname = urlsplit(business.website).hostname
    return hostname.lower().rstrip(".") if hostname else ""


def _resolve_enrich_target(business: MapsEnrichBusiness) -> _EnrichTarget | None:
    """解析单商家抓取目标；无 domain/website 返回 None（空结果直通）。"""

    key = _derive_business_key(business)
    if not key:
        return None
    website = business.website.strip()
    if website:
        fetch_url = website if "://" in website else f"https://{website}"
    else:
        fetch_url = f"https://{key}"
    return _EnrichTarget(
        key=key, cache_domain=normalize_cache_domain(key), fetch_url=fetch_url
    )


class EnrichResult(TypedDict):
    key: str
    emails: list[str]
    medias: dict[str, str]


class EnrichBatch(TypedDict):
    results: list[EnrichResult]
    partial: bool


class MapsEnrichProvider:
    """商家官网 Email/社媒补全（批处理 + 缓存 + SSRF 防护）。"""

    async def enrich(
        self,
        businesses: list[MapsEnrichBusiness],
        *,
        proxies: Sequence[str] | None,
        batch_timeout: float | None = None,
    ) -> EnrichBatch:
        """批量补全，返回与入参位置对齐的 ``{results, partial}`` 载荷。

        同域名共用结果；None 代理策略为插件直连，空池拒绝真实抓取。
        只有插件传批预算，Online 由父任务期限约束。
        """

        results: list[EnrichResult] = [
            {"key": _derive_business_key(business), "emails": [], "medias": {}}
            for business in businesses
        ]

        # 按缓存域名分组去重：同域名一次抓取扇回多行（礼貌性构造之一）。
        groups: dict[str, tuple[_EnrichTarget, list[int]]] = {}
        for index, business in enumerate(businesses):
            target = _resolve_enrich_target(business)
            if target is None or target.fetch_url is None:
                continue
            group_key = target.cache_domain or f"raw:{target.key}"
            group = groups.get(group_key)
            if group is None:
                groups[group_key] = (target, [index])
            else:
                group[1].append(index)

        partial = False
        if groups:
            tasks = {
                group_key: asyncio.create_task(self._enrich_site(target, proxies))
                for group_key, (target, _indexes) in groups.items()
            }
            try:
                done, pending = await asyncio.wait(
                    tasks.values(), timeout=batch_timeout
                )
            finally:
                # 外层任务期限或进程关闭取消本批时，也必须回收站点协程。
                for task in tasks.values():
                    if not task.done():
                        task.cancel()
                await asyncio.gather(*tasks.values(), return_exceptions=True)
            partial = len(pending) > 0
            if partial:
                logger.warning(
                    "maps_enrich_provider.enrich: 批预算超时，未完成条目返回空结果: "
                    f"pending={len(pending)}, total={len(tasks)}"
                )
            for group_key, task in tasks.items():
                if task not in done:
                    continue
                payload = task.result()
                for index in groups[group_key][1]:
                    results[index] = payload

        return {"results": results, "partial": partial}

    async def _enrich_site(
        self, target: _EnrichTarget, proxies: Sequence[str] | None
    ) -> EnrichResult:
        cached = await self._read_cache(target.cache_domain)
        if cached is not None:
            return {"key": target.key, "emails": cached.emails, "medias": cached.medias}
        try:
            if proxies is not None and not proxies:
                raise ContactScrapeError("maps_enrich: 官网代理池为空")
            async with _SITE_SEMAPHORE:
                contacts = await scrape_contacts(
                    target.fetch_url or "",
                    proxy=random.choice(proxies) if proxies is not None else None,
                )
        except ContactScrapeError:
            logger.error(
                "maps_enrich_provider._enrich_site: 单站补全失败",
                exc_info=True,
            )
            return {"key": target.key, "emails": [], "medias": {}}
        payload = _SiteDataPayload(emails=contacts.emails, medias=contacts.medias)
        await self._write_cache(target.cache_domain, payload)
        return {"key": target.key, "emails": payload.emails, "medias": payload.medias}

    async def _read_cache(self, cache_domain: str | None) -> _SiteDataPayload | None:
        """读同 domain 缓存；Redis 故障 fail-open 按未命中处理。"""

        if cache_domain is None:
            return None
        try:
            redis = await redis_client.get_client()
            raw = await redis.get(build_redis_key(build_enrich_cache_key(cache_domain)))
        except Exception as exc:
            logger.error(
                "maps_enrich_provider._read_cache: Redis 读取失败，按未命中处理: "
                f"domain={cache_domain}, error={exc!r}",
                exc_info=True,
            )
            return None
        if not raw:
            return None
        try:
            return _SiteDataPayload.model_validate_json(raw)
        except ValueError:
            logger.error(
                "maps_enrich_provider._read_cache: 缓存载荷非法，按未命中处理: "
                f"domain={cache_domain}",
                exc_info=True,
            )
            return None

    async def _write_cache(
        self, cache_domain: str | None, payload: _SiteDataPayload
    ) -> None:
        """写同 domain 缓存（解析成功即写，含空结果）；Redis 故障 fail-open。"""

        if cache_domain is None:
            return
        try:
            redis = await redis_client.get_client()
            await redis.set(
                build_redis_key(build_enrich_cache_key(cache_domain)),
                payload.model_dump_json(),
                ex=enrich_cache_ttl_seconds(),
            )
        except Exception as exc:
            logger.error(
                "maps_enrich_provider._write_cache: Redis 写入失败（不阻断主流程）: "
                f"domain={cache_domain}, error={exc!r}",
                exc_info=True,
            )


maps_enrich_provider = MapsEnrichProvider()
