"""SSRF 防护工具单测（013 A4，U8 enrich 安全红线）。

覆盖：scheme/凭证拒绝、字面量与解析后的私网/环回/link-local/元数据/CGNAT/
组播地址拒绝、IPv4-mapped IPv6 解包判定、公网地址放行。域名解析经
``resolve_host_ips`` 注入替身，不触真实 DNS。
"""

import ipaddress
from collections.abc import Awaitable, Callable

import pytest

from app.utils.ssrf_guard import SSRFBlockedError, assert_safe_http_url

# 替身解析器工厂：返回固定 IP 列表（域名形态用例不触真实 DNS）。


def _fake_resolver(ips: list[str]) -> Callable[[str, int], Awaitable[list]]:
    async def resolve(hostname: str, port: int) -> list:
        return [ipaddress.ip_address(value) for value in ips]

    return resolve


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "url",
    [
        "ftp://example.com/",
        "file:///etc/passwd",
        "https://user:pass@example.com/",
        # 字面量内网/环回/link-local/元数据/CGNAT/组播/保留
        "http://127.0.0.1/",
        "http://10.1.2.3/",
        "http://172.16.0.1/",
        "http://192.168.1.1/",
        "http://169.254.169.254/latest/meta-data/",
        "http://0.0.0.0/",
        "http://100.64.0.1/",
        "http://224.0.0.1/",
        "http://240.0.0.1/",
        "http://[::1]/",
        "http://[fe80::1]/",
        "http://[fc00::1]/",
        # IPv4-mapped IPv6 携带内网 v4
        "http://[::ffff:10.0.0.1]/",
        # 域名解析到环回
        "http://evil.example.com/",
    ],
)
async def test_rejects_unsafe_urls(url: str, monkeypatch: pytest.MonkeyPatch) -> None:
    """非 http(s)、凭证、内网/环回/link-local/元数据地址一律拒绝。"""

    from app.utils import ssrf_guard

    monkeypatch.setattr(ssrf_guard, "resolve_host_ips", _fake_resolver(["127.0.0.1"]))

    with pytest.raises(SSRFBlockedError):
        await assert_safe_http_url(url)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "url",
    [
        "https://93.184.216.34/",
        "https://8.8.8.8/path",
        "http://[2606:4700::1]/",
    ],
)
async def test_allows_public_literal_urls(url: str) -> None:
    """公网字面量 IP 放行（字面量不经 DNS，无需替身）。"""

    assert await assert_safe_http_url(url) == url


@pytest.mark.asyncio
async def test_allows_hostname_resolving_to_public(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """域名解析为公网地址时放行。"""

    from app.utils import ssrf_guard

    monkeypatch.setattr(
        ssrf_guard, "resolve_host_ips", _fake_resolver(["93.184.216.34"])
    )

    assert await assert_safe_http_url("http://info.cafe-example.com/") == (
        "http://info.cafe-example.com/"
    )


@pytest.mark.asyncio
async def test_rejects_when_any_resolved_ip_is_private(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """多记录解析中任一 IP 非公网即整体拒绝（防部分放行绕过）。"""

    from app.utils import ssrf_guard

    monkeypatch.setattr(
        ssrf_guard,
        "resolve_host_ips",
        _fake_resolver(["93.184.216.34", "192.168.0.9"]),
    )

    with pytest.raises(SSRFBlockedError):
        await assert_safe_http_url("http://mixed.example.com/")
