"""
Admin 管理后台请求/响应 Schema
"""

import ipaddress
import re
from typing import Literal
from urllib.parse import urlsplit, urlunsplit

from pydantic import BaseModel, Field, field_validator, model_validator

from app.constants.gmap import GMAP_ENGINE_DEFAULT_CONCURRENCY


# ========== 认证相关 ==========


class AdminCaptchaResponse(BaseModel):
    """验证码响应"""

    captcha_id: str = Field(..., description="验证码 ID")
    image_base64: str = Field(
        ..., description="Base64 编码的验证码图片（含 data:image/png;base64, 前缀）"
    )


class AdminLoginRequest(BaseModel):
    """管理员登录请求"""

    username: str = Field(..., min_length=1, max_length=64, description="用户名")
    password: str = Field(..., min_length=1, description="密码")
    captcha_id: str = Field(..., description="验证码 ID")
    captcha_code: str = Field(..., min_length=4, max_length=4, description="验证码")


class AdminLoginResponse(BaseModel):
    """管理员登录响应"""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    expires_in: int = Field(..., description="Access Token 有效期（秒）")
    refresh_expires_in: int = Field(..., description="Refresh Token 有效期（秒）")


class AdminRefreshRequest(BaseModel):
    """管理员 Token 续签请求"""

    refresh_token: str = Field(..., min_length=1, description="管理员 refresh token")


class AdminRefreshResponse(BaseModel):
    """管理员 Token 续签响应"""

    access_token: str = Field(..., description="新 JWT access token")
    refresh_token: str = Field(..., description="管理员 refresh token")
    expires_in: int = Field(..., description="Access Token 有效期（秒）")
    refresh_expires_in: int = Field(..., description="Refresh Token 有效期（秒）")


# ========== 系统设置相关 ==========


_PROXY_SCHEMES = frozenset({"http", "https", "socks5", "socks5h"})
_HOST_LABEL_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
_USERINFO_RE = re.compile(r"^(?:[a-zA-Z0-9._~!$&'()*+,;=:-]|%[0-9a-fA-F]{2})*$")


def _normalize_url(value: str, *, schemes: frozenset[str], proxy: bool) -> str:
    """校验并规范化外部 URL；错误消息不回显可能包含的凭据。"""
    raw = value.strip()
    if not raw or len(raw) > 2_048 or any(ord(char) <= 32 for char in raw):
        raise ValueError("URL 格式无效")
    try:
        parsed = urlsplit(raw)
        port = parsed.port
        host = parsed.hostname
    except ValueError as exc:
        raise ValueError("URL 格式无效") from exc
    scheme = parsed.scheme.lower()
    if (
        scheme not in schemes
        or not host
        or (proxy and port is None)
        or parsed.query
        or parsed.fragment
        or (proxy and parsed.path not in ("", "/"))
    ):
        raise ValueError("URL 格式无效")

    try:
        normalized_host = host.encode("idna").decode("ascii").lower()
    except UnicodeError as exc:
        raise ValueError("URL 格式无效") from exc
    try:
        ipaddress.ip_address(normalized_host)
    except ValueError:
        if not all(
            _HOST_LABEL_RE.fullmatch(label) for label in normalized_host.split(".")
        ):
            raise ValueError("URL 格式无效")

    userinfo, separator, _authority = parsed.netloc.rpartition("@")
    if separator and (
        not userinfo or userinfo.startswith(":") or not _USERINFO_RE.fullmatch(userinfo)
    ):
        raise ValueError("URL 格式无效")
    host_text = f"[{normalized_host}]" if ":" in normalized_host else normalized_host
    normalized_authority = f"{userinfo}@" if separator else ""
    normalized_authority += host_text
    if port is not None:
        normalized_authority += f":{port}"
    path = parsed.path.rstrip("/") if not proxy else ""
    return urlunsplit((scheme, normalized_authority, path, "", ""))


class GosomApiItem(BaseModel):
    """gosom 引擎单条 API 配置"""

    base_url: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="gosom 引擎 API 根地址，http(s):// 开头；末尾斜杠由 schema 统一剥掉",
    )
    api_key: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="gosom 引擎 API Key，明文保存到 system_data",
    )
    weight: int = Field(
        ...,
        ge=1,
        le=10_000,
        description="选择权重，≥1；多条配置按权重加权随机选用，越大被选中概率越高",
    )

    @field_validator("api_key", mode="before")
    @classmethod
    def _strip_before_validate(cls, value: object) -> object:
        """先剥首尾空白再进 pattern/长度校验，避免可修剪输入被误拒。"""
        return value.strip() if isinstance(value, str) else value

    @field_validator("base_url", mode="before")
    @classmethod
    def _normalize_base_url(cls, value: object) -> object:
        """规范化 HTTP(S) 根地址，保证唯一性比较使用同一口径。"""
        if not isinstance(value, str):
            return value
        return _normalize_url(value, schemes=frozenset({"http", "https"}), proxy=False)


class GosomApiConfigRequest(BaseModel):
    """gosom 引擎 API 配置保存请求；整表覆盖保存，items 为空即清空配置"""

    items: list[GosomApiItem] = Field(
        default_factory=list,
        max_length=100,
        description="全部 API 配置行，一行一个 url / key / 权重",
    )

    @model_validator(mode="after")
    def _base_urls_must_be_unique(self) -> "GosomApiConfigRequest":
        """禁止规范化后指向同一 gosom 实例的重复配置。"""
        base_urls = [item.base_url for item in self.items]
        if len(base_urls) != len(set(base_urls)):
            raise ValueError("gosom base_url 不能重复")
        return self


class GmapEngineConfig(BaseModel):
    """gmap 采集引擎配置与未配置时的默认读取视图。"""

    provider: Literal["http", "gosom"] = Field(
        default="http",
        description="抓取引擎选择：http=自研直采，gosom=云端引擎",
    )
    proxies: list[str] = Field(
        default_factory=list,
        max_length=100,
        description="完整代理 URL 列表；保存 HTTP 配置时至少一条",
    )
    concurrency: int = Field(
        default=GMAP_ENGINE_DEFAULT_CONCURRENCY,
        ge=1,
        description="每个 business 进程的 Google 出站并发预算",
    )

    @field_validator("proxies", mode="before")
    @classmethod
    def _normalize_proxies(cls, value: object) -> object:
        """去空行并按规范化后的完整 URL 去重，保留首次出现顺序。"""
        if not isinstance(value, list):
            return value
        normalized: list[object] = []
        seen: set[str] = set()
        for item in value:
            if isinstance(item, str):
                if not item.strip():
                    continue
                item = _normalize_url(item, schemes=_PROXY_SCHEMES, proxy=True)
                if item in seen:
                    continue
                seen.add(item)
            normalized.append(item)
        return normalized


class GmapEngineConfigRequest(GmapEngineConfig):
    """gmap 引擎保存请求；HTTP 模式必须配置代理。"""

    @model_validator(mode="after")
    def _http_requires_proxy(self) -> "GmapEngineConfigRequest":
        """HTTP Provider 没有代理无法工作，保存时直接拒绝。"""
        if self.provider == "http" and not self.proxies:
            raise ValueError("HTTP provider 至少需要一条代理 URL")
        return self
