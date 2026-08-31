"""Maps Email/社媒补全服务单测（013 A4，U8）。

覆盖：Email/社媒抽取纯函数、SSRF 拒绝收敛为空结果、同 domain 缓存（写入
带全局前缀 key + 命中免抓取，裸子键不存在——spec-redis §2 回归锚）、非 2xx/
超时/重定向跳内网的空结果语义、批预算截断 partial 标注、无 domain 跳过、
同域名去重单次抓取。外网 fetch 全部用 httpx 替身，零真实网络。
"""

import asyncio
import ipaddress

import pytest

from app.constants.maps_enrich import build_enrich_cache_key
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
from app.services import maps_enrich_service as maps_enrich_service_module
from app.services.maps_enrich_service import (
    MapsEnrichService,
    extract_emails,
    extract_social_medias,
)
from app.utils.redis_key import build_redis_key


class _FakeResponse:
    """httpx 流式响应替身：只覆盖 enrich 消费到的面。"""

    def __init__(
        self, status_code: int, body: bytes = b"", headers: dict | None = None
    ) -> None:
        self.status_code = status_code
        self._body = body
        self.headers: dict[str, str] = headers or {}
        self.charset_encoding = "utf-8"

    @property
    def is_redirect(self) -> bool:
        return self.status_code in (301, 302, 307, 308) and "location" in self.headers

    @property
    def is_error(self) -> bool:
        return self.status_code >= 400

    async def aiter_bytes(self):
        yield self._body


class _FakeStreamContext:
    """client.stream(...) 的异步上下文替身。"""

    def __init__(self, response: _FakeResponse) -> None:
        self._response = response

    async def __aenter__(self) -> _FakeResponse:
        return self._response

    async def __aexit__(self, *_args) -> bool:
        return False


class _FakeAsyncClient:
    """按 URL 精确路由的 httpx.AsyncClient 替身；记录请求序供断言。"""

    def __init__(self, routes: dict[str, _FakeResponse]) -> None:
        self._routes = routes
        self.requests: list[str] = []

    async def __aenter__(self) -> "_FakeAsyncClient":
        return self

    async def __aexit__(self, *_args) -> bool:
        return False

    def stream(self, method: str, url: str) -> _FakeStreamContext:
        self.requests.append(url)
        response = self._routes[url]
        return _FakeStreamContext(response)


class _FakeRedis:
    """Redis 替身：只覆盖 enrich 缓存用到的 get/set。"""

    def __init__(self) -> None:
        self.values: dict[str, str] = {}
        self.ttls: dict[str, int | None] = {}

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def set(self, key: str, value: str, ex: int | None = None) -> None:
        self.values[key] = value
        self.ttls[key] = ex


def _install_fake_http(
    monkeypatch: pytest.MonkeyPatch, routes: dict[str, _FakeResponse]
) -> _FakeAsyncClient:
    """把 service 模块内的 httpx.AsyncClient 换成共享替身。"""

    client = _FakeAsyncClient(routes)
    monkeypatch.setattr(
        maps_enrich_service_module.httpx, "AsyncClient", lambda **_kwargs: client
    )
    return client


def _install_fake_redis(monkeypatch: pytest.MonkeyPatch) -> _FakeRedis:
    """把 service 模块消费的 redis 单例换成本文件级替身。"""

    fake = _FakeRedis()

    async def fake_get_client() -> _FakeRedis:
        return fake

    monkeypatch.setattr(
        maps_enrich_service_module.redis_client, "get_client", fake_get_client
    )
    return fake


def _stub_public_dns(monkeypatch: pytest.MonkeyPatch) -> None:
    """把 SSRF 守卫的域名解析钉到公网 IP（service 测试不触真实 DNS）。"""

    from app.utils import ssrf_guard

    async def fake_resolve(hostname: str, port: int) -> list:
        return [ipaddress.ip_address("93.184.216.34")]

    monkeypatch.setattr(ssrf_guard, "resolve_host_ips", fake_resolve)


def _business(domain: str = "", website: str = "", name: str = "", address: str = ""):
    return MapsEnrichBusiness(
        domain=domain, website=website, name=name, address=address
    )


# ============ 抽取纯函数 ============


def test_extract_emails_mailto_first_and_text_fallback() -> None:
    html = (
        '<a href="mailto:info@cafe.com">Mail</a>'
        "<p>Contact support@cafe.com or sales@shop.org</p>"
    )
    assert extract_emails(html) == [
        "info@cafe.com",
        "support@cafe.com",
        "sales@shop.org",
    ]


def test_extract_emails_dedupes_case_insensitively() -> None:
    # mailto 优先：同址多形态时保留 mailto 候选的首见形态
    assert extract_emails("Contact A@Cafe.com <a href='mailto:A@cafe.com'>x</a>") == [
        "A@cafe.com"
    ]


def test_extract_emails_filters_false_positives() -> None:
    html = (
        "sentry@example.io biz@example.com cover.jpg@shop.com "
        "logo@2x.png someone@domain.com real@cafe.com"
    )
    assert extract_emails(html) == ["real@cafe.com"]


def test_extract_emails_strips_trailing_punctuation() -> None:
    assert extract_emails("write to info@cafe.com, or info@shop.org.") == [
        "info@cafe.com",
        "info@shop.org",
    ]


def test_extract_emails_caps_result_size() -> None:
    html = " ".join(f"user{i}@cafe.com" for i in range(10))
    assert len(extract_emails(html)) == 5


def test_extract_social_medias_matches_all_platforms() -> None:
    html = "".join(
        [
            '<a href="https://www.instagram.com/cafe/">Ig</a>',
            '<a href="https://facebook.com/cafehouse">Fb</a>',
            '<a href="https://www.youtube.com/@cafetv">Yt</a>',
            '<a href="https://www.tiktok.com/@cafe">Tt</a>',
            '<a href="https://www.linkedin.com/company/cafe">Li</a>',
            '<a href="https://twitter.com/cafe">Tw</a>',
        ]
    )
    medias = extract_social_medias(html)
    assert list(medias.keys()) == [
        "instagram",
        "facebook",
        "youtube",
        "tiktok",
        "linkedin",
        "twitter",
    ]
    assert medias["facebook"] == "https://facebook.com/cafehouse"
    assert medias["twitter"] == "https://twitter.com/cafe"


def test_extract_social_medias_accepts_x_com_and_protocol_relative() -> None:
    html = '<a href="https://x.com/brand">X</a><a href="//instagram.com/brand">Ig</a>'
    medias = extract_social_medias(html)
    assert medias["twitter"] == "https://x.com/brand"
    assert medias["instagram"] == "https://instagram.com/brand"


def test_extract_social_medias_skips_share_and_plugin_links() -> None:
    html = "".join(
        [
            '<a href="https://www.facebook.com/sharer/sharer.php?u=x">Share</a>',
            '<a href="https://twitter.com/intent/tweet?text=x">Tweet</a>',
            '<a href="https://www.facebook.com/plugins/page.php">Plugin</a>',
            '<a href="https://www.facebook.com/tr?id=1">Pixel</a>',
            '<a href="https://www.facebook.com/cafehouse">Fb</a>',
        ]
    )
    assert extract_social_medias(html) == {
        "facebook": "https://www.facebook.com/cafehouse"
    }


def test_extract_social_medias_ignores_non_social_links() -> None:
    html = '<a href="https://example.com/page">Other</a><a href="mailto:a@b.com">M</a>'
    assert extract_social_medias(html) == {}


# ============ 服务行为 ============


@pytest.mark.asyncio
async def test_enrich_skips_business_without_domain(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _install_fake_redis(monkeypatch)
    client = _install_fake_http(monkeypatch, {})

    result = await MapsEnrichService().enrich([_business(name="Cafe")])

    assert result == {
        "results": [{"key": "", "emails": [], "medias": {}}],
        "partial": False,
    }
    assert client.requests == []


@pytest.mark.asyncio
async def test_enrich_rejects_private_target_as_empty_result(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """SSRF 红线：内网目标收敛为空结果且不发起抓取、不写缓存。"""

    fake_redis = _install_fake_redis(monkeypatch)
    client = _install_fake_http(monkeypatch, {})

    result = await MapsEnrichService().enrich([_business(domain="127.0.0.1")])

    assert result == {
        "results": [{"key": "127.0.0.1", "emails": [], "medias": {}}],
        "partial": False,
    }
    assert client.requests == []
    assert fake_redis.values == {}


@pytest.mark.asyncio
async def test_enrich_extracts_caches_and_hits_cache(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """解析成功写缓存（带全局前缀）；命中后同域名免二次抓取；裸子键不存在。"""

    fake_redis = _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    routes = {
        "https://cafe.com": _FakeResponse(
            200,
            b'<a href="mailto:info@cafe.com">Mail</a>'
            b'<a href="https://www.instagram.com/cafe/">Ig</a>',
        )
    }
    client = _install_fake_http(monkeypatch, routes)
    service = MapsEnrichService()

    first = await service.enrich([_business(domain="cafe.com")])
    second = await service.enrich([_business(domain="cafe.com")])

    expected_item = {
        "key": "cafe.com",
        "emails": ["info@cafe.com"],
        "medias": {"instagram": "https://www.instagram.com/cafe"},
    }
    assert first == {"results": [expected_item], "partial": False}
    assert second == {"results": [expected_item], "partial": False}
    # 单次抓取：第二次走缓存
    assert client.requests == ["https://cafe.com"]
    # 缓存 key 带全局前缀；裸业务子键不存在（spec-redis §2 回归锚）
    prefixed = build_redis_key(build_enrich_cache_key("cafe.com"))
    assert prefixed in fake_redis.values
    assert "info@cafe.com" in fake_redis.values[prefixed]
    assert build_enrich_cache_key("cafe.com") not in fake_redis.values


@pytest.mark.asyncio
async def test_enrich_non_2xx_returns_empty_without_cache(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake_redis = _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    client = _install_fake_http(monkeypatch, {"https://cafe.com": _FakeResponse(500)})
    service = MapsEnrichService()

    first = await service.enrich([_business(domain="cafe.com")])
    second = await service.enrich([_business(domain="cafe.com")])

    empty_item = {"key": "cafe.com", "emails": [], "medias": {}}
    assert first["results"] == [empty_item]
    assert second["results"] == [empty_item]
    # 抓取失败不写缓存：两次都真实发起（失败可重试语义）
    assert len(client.requests) == 2
    assert fake_redis.values == {}


@pytest.mark.asyncio
async def test_enrich_redirect_to_private_is_blocked(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """重定向跳内网：第二跳过 SSRF 校验被拒，收敛为空结果。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    client = _install_fake_http(
        monkeypatch,
        {
            "https://cafe.com": _FakeResponse(
                302, headers={"location": "http://169.254.169.254/latest/meta-data/"}
            )
        },
    )

    result = await MapsEnrichService().enrich([_business(domain="cafe.com")])

    assert result["results"] == [{"key": "cafe.com", "emails": [], "medias": {}}]
    # 只发了第一跳：第二跳在守卫处被拦截
    assert client.requests == ["https://cafe.com"]


@pytest.mark.asyncio
async def test_enrich_site_budget_timeout_returns_empty(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """单站超时（asyncio.TimeoutError）收敛为空结果。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    _install_fake_http(monkeypatch, {})
    monkeypatch.setattr(maps_enrich_service_module, "ENRICH_SITE_BUDGET_SECONDS", 0.05)
    service = MapsEnrichService()

    async def slow_fetch(url: str) -> str:
        await asyncio.sleep(5)
        return "<html></html>"

    monkeypatch.setattr(service, "_fetch_html", slow_fetch)

    result = await service.enrich([_business(domain="cafe.com")])

    assert result["results"] == [{"key": "cafe.com", "emails": [], "medias": {}}]
    assert result["partial"] is False


@pytest.mark.asyncio
async def test_enrich_batch_budget_marks_partial(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """批预算超时：未完成条目返回空并置 partial=true，已完成条目正常返回。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    _install_fake_http(monkeypatch, {})
    monkeypatch.setattr(maps_enrich_service_module, "ENRICH_BATCH_BUDGET_SECONDS", 0.1)
    service = MapsEnrichService()

    async def mixed_fetch(url: str) -> str | None:
        if "slow" in url:
            await asyncio.sleep(5)
            return None
        return '<a href="mailto:fast@fast.com">m</a>'

    monkeypatch.setattr(service, "_fetch_html", mixed_fetch)

    result = await service.enrich(
        [
            _business(domain="slow-site.com"),
            _business(domain="fast-site.com"),
        ]
    )

    assert result["partial"] is True
    results = result["results"]
    assert {"key": "slow-site.com", "emails": [], "medias": {}} in results
    assert {
        "key": "fast-site.com",
        "emails": ["fast@fast.com"],
        "medias": {},
    } in results


@pytest.mark.asyncio
async def test_enrich_dedupes_same_domain_single_fetch(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """同域名多行合并为一次抓取，结果扇回各行。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    routes = {
        "https://cafe.com": _FakeResponse(200, b'<a href="mailto:info@cafe.com">M</a>')
    }
    client = _install_fake_http(monkeypatch, routes)

    result = await MapsEnrichService().enrich(
        [
            _business(domain="cafe.com", name="Cafe A"),
            _business(domain="cafe.com", name="Cafe B"),
        ]
    )

    assert result["partial"] is False
    assert len(client.requests) == 1
    assert result["results"] == [
        {"key": "cafe.com", "emails": ["info@cafe.com"], "medias": {}},
        {"key": "cafe.com", "emails": ["info@cafe.com"], "medias": {}},
    ]


@pytest.mark.asyncio
async def test_enrich_website_fallback_and_key_derivation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """domain 缺省时以 website 主机名为归属键；URL 优先取 website。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    routes = {"https://shop.example/": _FakeResponse(200, b"<p>owner@shop.example</p>")}
    _install_fake_http(monkeypatch, routes)

    result = await MapsEnrichService().enrich(
        [_business(website="https://shop.example/")]
    )

    assert result["results"] == [
        {"key": "shop.example", "emails": ["owner@shop.example"], "medias": {}}
    ]


@pytest.mark.asyncio
async def test_enrich_truncates_oversized_html_and_still_parses(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """超 2MB 响应截断解析：上限内的邮箱照常抽出、上限外的被截掉，不异常。"""

    from app.constants.maps_enrich import ENRICH_MAX_HTML_BYTES

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    # head 邮箱在 2MB 上限内；tail 邮箱从上限之后开始，必须被截断丢弃。
    # 填充用「=」（不在 email 正则字符类内）：连续 token 长跑会触发正则平方级
    # 回溯（真实 HTML 有标签切分不成立），测试只验证截断语义本身。
    head = b'<a href="mailto:head@cafe.com">M</a>'
    padding = b"=" * (ENRICH_MAX_HTML_BYTES - len(head))
    tail = b'<a href="mailto:tail@cafe.com">T</a>'
    routes = {"https://cafe.com": _FakeResponse(200, head + padding + tail)}
    _install_fake_http(monkeypatch, routes)

    result = await MapsEnrichService().enrich([_business(domain="cafe.com")])

    assert result["results"] == [
        {"key": "cafe.com", "emails": ["head@cafe.com"], "medias": {}}
    ]
    assert result["partial"] is False


@pytest.mark.asyncio
async def test_enrich_redirect_chain_over_limit_returns_empty(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """重定向超过 3 跳（第 4 跳仍为 302）：循环耗尽收敛空结果，不异常。"""

    from app.constants.maps_enrich import ENRICH_MAX_REDIRECTS

    assert ENRICH_MAX_REDIRECTS == 3
    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    hops = [
        "https://hop1.com",
        "https://hop2.com",
        "https://hop3.com",
        "https://hop4.com",
    ]
    # hop1→hop2→hop3→hop4→(hop5)：前 3 跳 302，第 4 跳仍 302，循环耗尽后不再跟随
    routes = {
        "https://hop1.com": _FakeResponse(
            302, headers={"location": "https://hop2.com"}
        ),
        "https://hop2.com": _FakeResponse(
            302, headers={"location": "https://hop3.com"}
        ),
        "https://hop3.com": _FakeResponse(
            302, headers={"location": "https://hop4.com"}
        ),
        "https://hop4.com": _FakeResponse(
            302, headers={"location": "https://hop5.com"}
        ),
    }
    client = _install_fake_http(monkeypatch, routes)

    result = await MapsEnrichService().enrich([_business(domain="hop1.com")])

    assert result["results"] == [{"key": "hop1.com", "emails": [], "medias": {}}]
    assert result["partial"] is False
    # 4 跳全部发出（每跳均 302），第 5 跳不再跟随
    assert client.requests == hops


@pytest.mark.asyncio
async def test_enrich_malformed_charset_falls_back_to_utf8(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Content-Type 声明未知 charset（x-nonexistent）：回退 UTF-8 解码，不 500。"""

    _install_fake_redis(monkeypatch)
    _stub_public_dns(monkeypatch)
    response = _FakeResponse(200, b'<a href="mailto:info@cafe.com">M</a>')
    response.charset_encoding = "x-nonexistent"
    _install_fake_http(monkeypatch, {"https://cafe.com": response})

    result = await MapsEnrichService().enrich([_business(domain="cafe.com")])

    # 回退解码生效：邮箱照常抽出，请求正常完成（不因 LookupError 抛 500）
    assert result["results"] == [
        {"key": "cafe.com", "emails": ["info@cafe.com"], "medias": {}}
    ]
    assert result["partial"] is False
