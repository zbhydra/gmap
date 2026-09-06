"""逐跳校验 URL 与全部 DNS 地址；不实施连接级地址固定。"""

import asyncio
import ipaddress
from urllib.parse import urlsplit


# 允许的 scheme：只抓网页，file/ftp/gopher 等一律拒绝。
_ALLOWED_SCHEMES = ("http", "https")


class SSRFBlockedError(ValueError):
    """URL 未通过 SSRF 校验（携带具体拒绝原因，调用方按失败处理）。"""


def is_allowed_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """判断解析出的 IP 是否允许外抓：仅公网单播地址放行。

    IPv4-mapped IPv6（::ffff:10.0.0.1）先解包再判——否则映射形式的内网地址
    会以 v6 身份绕过 v4 私网判定。
    """

    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped is not None:
        ip = ip.ipv4_mapped
    return not (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
        or not ip.is_global
    )


async def resolve_host_ips(
    hostname: str, port: int
) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    """解析主机名为全部 IP（经事件循环的异步 getaddrinfo，不阻塞）。"""

    loop = asyncio.get_running_loop()
    infos = await loop.getaddrinfo(hostname, port)
    return [ipaddress.ip_address(info[4][0]) for info in infos]


async def assert_safe_http_url(url: str) -> str:
    """校验外抓 URL 的 SSRF 安全性，通过则原样返回。

    Args:
        url: 待校验的绝对 URL。

    Returns:
        校验通过的 URL（与入参相同）。

    Raises:
        SSRFBlockedError: scheme 非法、携带凭证、主机为字面量内网 IP、
            或 DNS 解析结果中任一 IP 非公网。
    """

    parts = urlsplit(url)
    if parts.scheme.lower() not in _ALLOWED_SCHEMES:
        raise SSRFBlockedError("URL 协议被拒绝")
    if parts.username is not None or parts.password is not None:
        raise SSRFBlockedError("URL 携带凭证被拒绝")
    hostname = parts.hostname
    if not hostname:
        raise SSRFBlockedError("URL 缺少主机名")

    port = parts.port or (443 if parts.scheme.lower() == "https" else 80)
    # 字面量 IP 不经 DNS 直接判定；域名解析后全量判定（多记录全拒绝）。
    try:
        literal = ipaddress.ip_address(hostname)
    except ValueError:
        ips = await resolve_host_ips(hostname, port)
    else:
        ips = [literal]

    if not ips:
        raise SSRFBlockedError("DNS 未返回地址")
    for ip in ips:
        if not is_allowed_ip(ip):
            raise SSRFBlockedError("非公网地址被拒绝")
    return url
