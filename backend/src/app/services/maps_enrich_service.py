"""Maps Extractor Email/社媒补全服务（013 A4，U8，服务端自研基线 #4）。

数据源决策（research/google-maps-scraping §7）：社媒不在 Maps 页面，唯一现实
来源是商家官网；Email 同理。流程：fetch 官网首页 → mailto 优先 + 页面文本
正则抽 Email；全页 ``<a>`` 外链按域名匹配抽社媒（footer 为主，无需理解页面
结构）。搜索兜底数据源留待实测后评估（注释标注，当前不做）；Plus Code 补全
归后续数据源单元，本服务不涉及。

安全红线（SSRF）：商家 website 是用户可控输入，抓取前逐跳过
``ssrf_guard.assert_safe_http_url``（scheme/凭证/解析 IP 全公网），重定向
每跳重验；单站大小/时长上限；批内信号量限并发。

礼貌性构造：同批内每域名去重后至多抓一次（无站内连发），跨批靠 Redis 缓存
（TTL 见 constants），故无需主动站间 sleep。

失败语义（容错轴「局部可失败」）：单站超时/非 2xx/SSRF 拒绝/解析空一律返回
空结果，不报错不阻断整批；抓取失败（超时/网络/非 2xx）不写缓存，下次可重试，
解析成功（即使为空）才写缓存。

计量口径：配额已在采集完成边沿按会话计量（U7），本服务不重复扣减。

Redis 故障策略（spec-redis §7，可用性优先）：缓存读写失败 fail-open——读按
未命中、写静默放弃，主流程（抓取）不依赖缓存。
"""

import asyncio
import re
from html import unescape
from typing import NamedTuple
from urllib.parse import urljoin, urlsplit

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException
from pydantic import BaseModel, Field

from app.constants.maps_enrich import (
    ENRICH_BATCH_BUDGET_SECONDS,
    ENRICH_CONCURRENCY,
    ENRICH_FETCH_TIMEOUT,
    ENRICH_MAX_EMAILS,
    ENRICH_MAX_HTML_BYTES,
    ENRICH_MAX_REDIRECTS,
    ENRICH_SITE_BUDGET_SECONDS,
    build_enrich_cache_key,
    enrich_cache_ttl_seconds,
    normalize_cache_domain,
)
from app.core.redis import redis_client
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key
from app.utils.ssrf_guard import SSRFBlockedError, assert_safe_http_url

# 请求头只补 impersonate 未覆盖的 Accept-Language；UA / Accept / sec-ch-ua
# 与 TLS 指纹由 curl_cffi impersonate="chrome" 成套注入——手写 UA 会覆盖成套
# 头，造成「TLS 指纹与 UA 版本不一致」的新指纹特征，故不设置。
_REQUEST_HEADERS = {
    "Accept-Language": "en-US,en;q=0.9",
}

# mailto 链接优先（商家主动留的联系方式，噪声最低）。
_MAILTO_RE = re.compile(r"mailto:([^\"'?>#\s]+)", re.IGNORECASE)

# 页面文本兜底正则：覆盖主流 ASCII 邮箱形态。
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

# 页面内 <a href> 外链抽取（无需理解 DOM 结构，footer/正文一并覆盖）。
_ANCHOR_HREF_RE = re.compile(r"<a\b[^>]*href=[\"']([^\"'#]+)[\"']", re.IGNORECASE)

# 典型误报过滤（spec 口径：sentry/示例域/图片资源名）：
# - sentry：Sentry SDK 注入的采集地址（任意侧出现即滤）；
# - 示例域：example.com/org/net 与文档域 domain.com/yourdomain（按域精确判定，
#   不做子串匹配，避免误伤 myexampleshop.com 这类真实域名）。
_EMAIL_SENTRY_RE = re.compile(r"sentry", re.IGNORECASE)
_EMAIL_EXAMPLE_DOMAIN_RE = re.compile(r"(?:^|\.)example\.(com|org|net)$", re.IGNORECASE)
_EMAIL_DOC_DOMAINS = {"domain.com", "yourdomain.com", "yourdomain.net"}
# 图片资源误吞形态：local 或 domain 以图片扩展名结尾（如 logo@2x.png）。
_EMAIL_IMAGE_EXT_RE = re.compile(r"\.(png|jpe?g|gif|webp|svg|ico)$", re.IGNORECASE)

# 社媒平台 → 接受的域名后缀（twitter 含 x.com 新域；按 canonical 键序输出）。
_SOCIAL_PLATFORM_HOSTS: dict[str, tuple[str, ...]] = {
    "instagram": ("instagram.com",),
    "facebook": ("facebook.com",),
    "youtube": ("youtube.com",),
    "tiktok": ("tiktok.com",),
    "linkedin": ("linkedin.com",),
    "twitter": ("twitter.com", "x.com"),
}

# 分享器/插件/埋点类链接不是商家主页，按路径前缀剔除（路径恒以 / 开头）。
_SOCIAL_PATH_BLOCKLIST = (
    "/sharer",
    "/share.php",
    "/intent",
    "/plugins",
    "/dialog",
    "/tr",
    "/login",
)


def _looks_like_image_asset(email: str) -> bool:
    """判断邮箱是否为图片资源名被正则误吞（local/domain 任一侧以图片扩展名结尾）。"""

    local, _, domain = email.rpartition("@")
    return bool(_EMAIL_IMAGE_EXT_RE.search(local) or _EMAIL_IMAGE_EXT_RE.search(domain))


def _is_false_positive_email(email: str) -> bool:
    """典型误报判定：sentry 注入地址、文档示例域、图片资源名。"""

    if _EMAIL_SENTRY_RE.search(email):
        return True
    local, _, domain = email.rpartition("@")
    if _EMAIL_EXAMPLE_DOMAIN_RE.search(domain) or domain.lower() in _EMAIL_DOC_DOMAINS:
        return True
    return _looks_like_image_asset(email)


class _SiteDataPayload(BaseModel):
    """单站点补全结果（缓存 JSON 载荷同构，pydantic 校验替代 Any 解析）。"""

    emails: list[str] = Field(default_factory=list)
    medias: dict[str, str] = Field(default_factory=dict)


class _EnrichTarget(NamedTuple):
    """单条商家的补全目标（key 为空 = 无官网可抓，直接空结果）。"""

    key: str
    cache_domain: str | None
    fetch_url: str | None


def extract_emails(html: str) -> list[str]:
    """从官网 HTML 抽取邮箱：mailto 优先 + 页面文本正则，去重滤误报。

    结果大小写不敏感去重（保留首见形态）、截尾标点、上限
    ``ENRICH_MAX_EMAILS`` 条。
    """

    candidates: list[str] = []
    candidates.extend(unescape(match.group(1)) for match in _MAILTO_RE.finditer(html))
    candidates.extend(match.group(0) for match in _EMAIL_RE.finditer(unescape(html)))

    seen: set[str] = set()
    emails: list[str] = []
    for candidate in candidates:
        email = candidate.strip().strip(".,;:!?")
        if not email or len(email) > 254:
            continue
        if _is_false_positive_email(email):
            continue
        dedupe_key = email.lower()
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)
        emails.append(email)
        if len(emails) >= ENRICH_MAX_EMAILS:
            break
    return emails


def extract_social_medias(html: str) -> dict[str, str]:
    """从官网 HTML 的 <a> 外链按域名匹配抽社媒链接，每平台一条（取首个）。"""

    found: dict[str, str] = {}
    for match in _ANCHOR_HREF_RE.finditer(html):
        href = unescape(match.group(1)).strip()
        if href.startswith("//"):
            href = f"https:{href}"
        parts = urlsplit(href)
        if parts.scheme not in ("http", "https") or not parts.hostname:
            continue
        host = parts.hostname.lower().rstrip(".")
        path = parts.path.lower()
        if any(path.startswith(blocked) for blocked in _SOCIAL_PATH_BLOCKLIST):
            continue
        for platform, host_suffixes in _SOCIAL_PLATFORM_HOSTS.items():
            if platform in found:
                continue
            if any(
                host == suffix or host.endswith(f".{suffix}")
                for suffix in host_suffixes
            ):
                found[platform] = f"https://{host}{parts.path}".rstrip("/")
                break
        if len(found) == len(_SOCIAL_PLATFORM_HOSTS):
            break
    return found


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


class MapsEnrichService:
    """商家官网 Email/社媒补全（批处理 + 缓存 + SSRF 防护）。"""

    def __init__(self) -> None:
        # 批内抓取并发上限：asyncio 信号量跨请求共享（服务为模块级单例），
        # 防多插件同时补全时对外网的瞬时并发放大。
        self._site_semaphore = asyncio.Semaphore(ENRICH_CONCURRENCY)

    async def enrich(self, businesses: list[MapsEnrichBusiness]) -> dict[str, object]:
        """批量补全，返回与入参位置对齐的 ``{results, partial}`` 载荷。

        同域名商家合并为一次抓取（结果扇回同域名各行）；批预算
        ``ENRICH_BATCH_BUDGET_SECONDS`` 内未完成的条目取消并返回空结果，
        ``partial=true`` 标注截断。
        """

        results: list[dict[str, object]] = [
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
                group_key: asyncio.create_task(self._enrich_site(target))
                for group_key, (target, _indexes) in groups.items()
            }
            done, pending = await asyncio.wait(
                tasks.values(), timeout=ENRICH_BATCH_BUDGET_SECONDS
            )
            if pending:
                for task in pending:
                    task.cancel()
                # 回收已取消任务，避免事件循环残留「task destroyed」告警。
                await asyncio.gather(*pending, return_exceptions=True)
            partial = len(pending) > 0
            if partial:
                logger.warning(
                    "maps_enrich_service.enrich: 批预算超时，未完成条目返回空结果: "
                    f"pending={len(pending)}, total={len(tasks)}"
                )
            for group_key, task in tasks.items():
                if task not in done:
                    continue
                payload = task.result()
                for index in groups[group_key][1]:
                    results[index] = payload

        return {"results": results, "partial": partial}

    async def _enrich_site(self, target: _EnrichTarget) -> dict[str, object]:
        """抓取并解析单站点；任何失败路径都收敛为空结果（局部可失败）。

        返回 ``{key, emails, medias}``：同域名分组共用该结果。
        """

        cached = await self._read_cache(target.cache_domain)
        if cached is not None:
            return {"key": target.key, "emails": cached.emails, "medias": cached.medias}

        try:
            html = await asyncio.wait_for(
                self._fetch_html(target.fetch_url or ""),
                timeout=ENRICH_SITE_BUDGET_SECONDS,
            )
        except asyncio.TimeoutError:
            logger.warning(
                "maps_enrich_service._enrich_site: 单站预算超时，返回空结果: "
                f"url={target.fetch_url!r}"
            )
            return {"key": target.key, "emails": [], "medias": {}}

        if html is None:
            return {"key": target.key, "emails": [], "medias": {}}

        payload = _SiteDataPayload(
            emails=extract_emails(html), medias=extract_social_medias(html)
        )
        await self._write_cache(target.cache_domain, payload)
        return {"key": target.key, "emails": payload.emails, "medias": payload.medias}

    async def _fetch_html(self, url: str) -> str | None:
        """抓取官网 HTML：curl_cffi 浏览器指纹 + 逐跳 SSRF 校验 + 手动重定向 + 大小截断。

        impersonate="chrome" 成套注入 Chrome TLS 指纹（JA3/JA4）与配套请求头
        （UA/Accept/sec-ch-ua），规避站点对 python TLS 指纹的 403/挑战拦截；
        重定向关自动跟随，逐跳经 SSRF 校验后手动跟随。

        Returns:
            页面文本；scheme 非法 / 内网地址 / 非 2xx / 网络失败返回 None。
        """

        current_url = url
        try:
            async with self._site_semaphore:
                async with AsyncSession(
                    impersonate="chrome",
                    timeout=ENRICH_FETCH_TIMEOUT,
                    allow_redirects=False,
                    headers=_REQUEST_HEADERS,
                ) as session:
                    for _hop in range(ENRICH_MAX_REDIRECTS + 1):
                        # 每跳重验（重定向可能跳向内网）；拒绝即失败不重试。
                        await assert_safe_http_url(current_url)
                        response = await session.get(current_url, stream=True)
                        if response.is_redirect:
                            location = response.headers.get("location")
                            await response.aclose()
                            if not location:
                                logger.error(
                                    "maps_enrich_service._fetch_html: 重定向缺少 location: "
                                    f"url={current_url!r}, status={response.status_code}"
                                )
                                return None
                            current_url = urljoin(current_url, location)
                            continue
                        if not 200 <= response.status_code < 300:
                            logger.error(
                                "maps_enrich_service._fetch_html: 非 2xx 响应: "
                                f"url={current_url!r}, status={response.status_code}"
                            )
                            await response.aclose()
                            return None
                        chunks: list[bytes] = []
                        total = 0
                        async for chunk in response.aiter_content():
                            if total + len(chunk) > ENRICH_MAX_HTML_BYTES:
                                # 超限截断：保留上限内的部分（单个大 chunk 不得
                                # 整体丢弃，footer 内容通常在前部）
                                remaining = ENRICH_MAX_HTML_BYTES - total
                                if remaining > 0:
                                    chunks.append(chunk[:remaining])
                                break
                            total += len(chunk)
                            chunks.append(chunk)
                        await response.aclose()
                        raw = b"".join(chunks)
                        charset = response.charset_encoding or "utf-8"
                        try:
                            return raw.decode(charset, errors="ignore")
                        except (LookupError, UnicodeDecodeError):
                            # 站点声明了未知/畸形 charset：回退 UTF-8 宽松解码，
                            # 不因编码问题中断补全（footer 链接为 ASCII，损失可控）。
                            logger.warning(
                                "maps_enrich_service._fetch_html: charset 解码失败，"
                                f"回退 UTF-8: charset={charset!r}, url={current_url!r}"
                            )
                            return raw.decode("utf-8", errors="replace")
        except SSRFBlockedError as exc:
            # 安全拒绝是预期路径（商家脏数据），warning 级别即可。
            logger.warning(
                f"maps_enrich_service._fetch_html: SSRF 拒绝: url={url!r}, {exc}"
            )
            return None
        except (RequestException, asyncio.TimeoutError) as exc:
            logger.error(
                f"maps_enrich_service._fetch_html: 站点抓取失败: url={current_url!r}, error={exc!r}",
                exc_info=True,
            )
            return None
        logger.error(
            f"maps_enrich_service._fetch_html: 重定向超过 {ENRICH_MAX_REDIRECTS} 跳: url={url!r}"
        )
        return None

    async def _read_cache(self, cache_domain: str | None) -> _SiteDataPayload | None:
        """读同 domain 缓存；Redis 故障 fail-open 按未命中处理。"""

        if cache_domain is None:
            return None
        try:
            redis = await redis_client.get_client()
            raw = await redis.get(build_redis_key(build_enrich_cache_key(cache_domain)))
        except Exception as exc:
            logger.error(
                "maps_enrich_service._read_cache: Redis 读取失败，按未命中处理: "
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
                "maps_enrich_service._read_cache: 缓存载荷非法，按未命中处理: "
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
                "maps_enrich_service._write_cache: Redis 写入失败（不阻断主流程）: "
                f"domain={cache_domain}, error={exc!r}",
                exc_info=True,
            )


maps_enrich_service = MapsEnrichService()
