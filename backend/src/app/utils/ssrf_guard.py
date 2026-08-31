"""外抓 URL 的 SSRF 防护工具（013 A4，U8 enrich 端点安全红线）。

enrich 服务端要代替插件抓取商家官网。商家 website 是用户可控输入，若不校验，
攻击者可借服务端带宽探测内网（私网/环回/云元数据 169.254.169.254 等）。
本模块提供唯一入口 ``assert_safe_http_url``：scheme / 凭证 / 解析结果 IP 三重
校验，任一解析 IP 不为公网地址即拒绝（全拒绝而非部分放行，防 DNS 多记录绕过）。

DNS 重绑定（校验后 TTL 内换记录）不做连接级 pin，属既有架构的已知边界；
防护目标是「插件直接给内网 URL」与「30x 跳内网」两类显式绕过。
"""

import asyncio
import ipaddress
from urllib.parse import urlsplit

from app.utils.logger import logger

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
        raise SSRFBlockedError(f"schema 拒绝: scheme={parts.scheme!r}, url={url!r}")
    if parts.username or parts.password:
        raise SSRFBlockedError(f"URL 携带凭证被拒绝: url={url!r}")
    hostname = parts.hostname
    if not hostname:
        raise SSRFBlockedError(f"URL 缺少主机名: url={url!r}")

    port = parts.port or (443 if parts.scheme.lower() == "https" else 80)
    # 字面量 IP 不经 DNS 直接判定；域名解析后全量判定（多记录全拒绝）。
    try:
        literal = ipaddress.ip_address(hostname)
    except ValueError:
        ips = await resolve_host_ips(hostname, port)
    else:
        ips = [literal]

    for ip in ips:
        if not is_allowed_ip(ip):
            logger.warning(f"ssrf_guard: 内网地址被拒绝: host={hostname!r}, ip={ip!r}")
            raise SSRFBlockedError(f"非公网地址被拒绝: host={hostname!r}, ip={ip!r}")
    return url
