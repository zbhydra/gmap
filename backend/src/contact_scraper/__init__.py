"""单站官网联系方式采集；仅依赖标准库与 curl_cffi。"""

import asyncio
from dataclasses import dataclass, field
import re
import logging
from html import unescape
from time import perf_counter
from urllib.parse import urljoin, urlsplit
from uuid import uuid4

from curl_cffi import CurlInfo, CurlOpt
from curl_cffi.requests import AsyncSession, Response
from curl_cffi.requests.exceptions import RequestException
from traffic_scope import current_scope

from ._safety import assert_safe_http_url

logger = logging.getLogger(__name__)

_MAX_HTML_BYTES = 2 * 1024 * 1024
_MAX_REDIRECTS = 3
_MAX_EMAILS = 5

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


def extract_emails(html: str) -> list[str]:
    """从官网 HTML 抽取邮箱：mailto 优先 + 页面文本正则，去重滤误报。

    结果大小写不敏感去重（保留首见形态）、截尾标点、上限
    ``_MAX_EMAILS`` 条。
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
        if len(emails) >= _MAX_EMAILS:
            break
    return emails


def classify_social_url(url: str) -> dict[str, str]:
    """校验并归类单条 HTTP(S) 社媒主页，不执行 DNS 或网络访问。"""

    try:
        parts = urlsplit(url)
        if (
            parts.scheme not in ("http", "https")
            or not parts.hostname
            or parts.username is not None
            or parts.password is not None
        ):
            return {}
        # 读取 port 以拒绝非法端口，避免直返路径绕过抓取入口的 URL 校验。
        _ = parts.port
    except ValueError:
        return {}
    host = parts.hostname.lower().rstrip(".")
    if any(
        parts.path.lower().startswith(blocked) for blocked in _SOCIAL_PATH_BLOCKLIST
    ):
        return {}
    for platform, host_suffixes in _SOCIAL_PLATFORM_HOSTS.items():
        if any(
            host == suffix or host.endswith(f".{suffix}") for suffix in host_suffixes
        ):
            return {platform: f"https://{host}{parts.path}".rstrip("/")}
    return {}


def extract_social_medias(html: str) -> dict[str, str]:
    """从官网 HTML 的 <a> 外链按域名匹配抽社媒链接，每平台一条（取首个）。"""

    found: dict[str, str] = {}
    for match in _ANCHOR_HREF_RE.finditer(html):
        href = unescape(match.group(1)).strip()
        if href.startswith("//"):
            href = f"https:{href}"
        for platform, url in classify_social_url(href).items():
            found.setdefault(platform, url)
        if len(found) == len(_SOCIAL_PLATFORM_HOSTS):
            break
    return found


@dataclass
class ContactResult:
    emails: list[str] = field(default_factory=list)
    medias: dict[str, str] = field(default_factory=dict)


class ContactScrapeError(Exception):
    """单站采集失败；消息不含目标 URL、代理凭据或上游异常文本。"""

    def __init__(self, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


async def scrape_contacts(
    target: str, *, proxy: str | None, timeout: float = 12.0
) -> ContactResult:
    """抓取目标页面并解析；总时限包含 DNS 与重定向，取消直接传播。"""
    try:
        async with asyncio.timeout(timeout):
            url = target.strip()
            if "://" not in url:
                url = f"https://{url}"
            html = await _fetch_html(url, proxy)
            return ContactResult(extract_emails(html), extract_social_medias(html))
    except ContactScrapeError:
        raise
    except (TimeoutError, OSError, RequestException) as exc:
        raise ContactScrapeError(
            f"scrape_contacts: 采集失败 error={type(exc).__name__}",
            retryable=True,
        ) from None
    except Exception as exc:
        raise ContactScrapeError(
            f"scrape_contacts: 采集失败 error={type(exc).__name__}"
        ) from None


async def _fetch_html(url: str, proxy: str | None) -> str:
    request_id = uuid4().hex
    scope = current_scope.get()
    scope_id = scope.scope_id if scope else "unscoped"
    # 空代理字符串同时关闭 libcurl 的环境代理；None 是公开直连合同。
    async with AsyncSession(
        impersonate="chrome",
        timeout=None,  # type: ignore[arg-type]  # curl_cffi 运行时支持 None，类型桩未同步。
        trust_env=False,
        proxies={"all": proxy or ""},
        curl_options={CurlOpt.NOPROXY: ""},
        allow_redirects=False,
        headers={"Accept-Language": "en-US,en;q=0.9"},
        curl_infos=[
            CurlInfo.NAMELOOKUP_TIME,
            CurlInfo.CONNECT_TIME,
            CurlInfo.APPCONNECT_TIME,
            CurlInfo.PRETRANSFER_TIME,
            CurlInfo.STARTTRANSFER_TIME,
            CurlInfo.CONN_ID,
            CurlInfo.NUM_CONNECTS,
            CurlInfo.HTTP_VERSION,
        ],
    ) as session:
        for hop in range(_MAX_REDIRECTS + 1):
            started = perf_counter()
            safe = False
            try:
                await assert_safe_http_url(url)
                safe = True
            finally:
                logger.info(
                    "contact_scraper.check: scope=%s request=%s hop=%s host=%s safe=%s duration_ms=%.2f",
                    scope_id,
                    request_id,
                    hop,
                    urlsplit(url).hostname,
                    safe,
                    (perf_counter() - started) * 1000,
                )
            started = perf_counter()
            try:
                response = await session.get(url, stream=True)
            except (Exception, asyncio.CancelledError) as exc:
                observed = getattr(exc, "response", None)
                if proxy and scope:
                    if isinstance(observed, Response):
                        scope.site.add(
                            request_bytes=getattr(observed, "request_size", None),
                            header_bytes=getattr(observed, "header_size", None),
                            partial=True,
                        )
                    else:
                        scope.site.add(unmeasured=True)
                logger.info(
                    "contact_scraper.request: scope=%s request=%s hop=%s host=%s "
                    "proxy=%s duration_ms=%.2f error=%s",
                    scope_id,
                    request_id,
                    hop,
                    urlsplit(url).hostname,
                    "proxy" if proxy else "direct",
                    (perf_counter() - started) * 1000,
                    type(exc).__name__,
                )
                raise
            headers_at = perf_counter()
            info = response.infos
            logger.info(
                "contact_scraper.headers: scope=%s request=%s hop=%s host=%s proxy_host=%s "
                "status=%s connection_id=%s new_connections=%s curl_http_version=%s "
                "headers_ms=%.2f dns_ms=%.2f tcp_ms=%.2f tunnel_tls_ms=%.2f ttfb_ms=%.2f",
                scope_id,
                request_id,
                hop,
                urlsplit(url).hostname,
                urlsplit(proxy).hostname if proxy else "direct",
                response.status_code,
                info.get(CurlInfo.CONN_ID, -1),
                info.get(CurlInfo.NUM_CONNECTS, 0),
                info.get(CurlInfo.HTTP_VERSION, 0),
                (headers_at - started) * 1000,
                info.get(CurlInfo.NAMELOOKUP_TIME, 0) * 1000,
                (
                    info.get(CurlInfo.CONNECT_TIME, 0)
                    - info.get(CurlInfo.NAMELOOKUP_TIME, 0)
                )
                * 1000,
                max(
                    0,
                    info.get(CurlInfo.APPCONNECT_TIME, 0)
                    - info.get(CurlInfo.CONNECT_TIME, 0),
                )
                * 1000,
                (
                    info.get(CurlInfo.STARTTRANSFER_TIME, 0)
                    - info.get(CurlInfo.PRETRANSFER_TIME, 0)
                )
                * 1000,
            )
            request_bytes = getattr(response, "request_size", None)
            header_bytes = getattr(response, "header_size", None)
            body_consumed = 0
            body_started = False
            body_complete = False
            first_chunk = True
            try:
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location:
                        raise ContactScrapeError("scrape_contacts: 重定向缺少 location")
                    if hop == _MAX_REDIRECTS:
                        raise ContactScrapeError("scrape_contacts: 重定向超过上限")
                    url = urljoin(url, location)
                    continue
                if not 200 <= response.status_code < 300:
                    raise ContactScrapeError(
                        f"scrape_contacts: HTTP 非成功响应 status={response.status_code}",
                        retryable=response.status_code in (401, 403, 407, 429),
                    )
                chunks: list[bytes] = []
                total = 0
                body_started = True
                async for chunk in response.aiter_content():
                    body_consumed += len(chunk)
                    if first_chunk:
                        request_bytes = getattr(response, "request_size", request_bytes)
                        header_bytes = getattr(response, "header_size", header_bytes)
                        first_chunk = False
                    remaining = _MAX_HTML_BYTES - total
                    chunks.append(chunk[:remaining])
                    total += len(chunks[-1])
                    if total >= _MAX_HTML_BYTES:
                        break
                else:
                    body_complete = True
                raw = b"".join(chunks)
                try:
                    return raw.decode(
                        response.charset_encoding or "utf-8", errors="ignore"
                    )
                except (LookupError, UnicodeDecodeError):
                    return raw.decode("utf-8", errors="replace")
            finally:
                try:
                    await response.aclose()
                finally:
                    if proxy and scope:
                        scope.site.add(
                            request_bytes=getattr(
                                response, "request_size", request_bytes
                            ),
                            header_bytes=getattr(response, "header_size", header_bytes),
                            body_bytes=body_consumed if body_started else None,
                            partial=not body_complete,
                        )
                    logger.info(
                        "contact_scraper.request: scope=%s request=%s hop=%s status=%s "
                        "proxy=%s duration_ms=%.2f body_wait_ms=%.2f",
                        scope_id,
                        request_id,
                        hop,
                        response.status_code,
                        "proxy" if proxy else "direct",
                        (perf_counter() - started) * 1000,
                        (perf_counter() - headers_at) * 1000,
                    )
    raise ContactScrapeError("scrape_contacts: 未取得目标页面")
