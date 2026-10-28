"""
Admin 管理后台请求/响应 Schema
"""

import ipaddress
import re
from typing import Annotated, Literal
from urllib.parse import urlsplit, urlunsplit
from uuid import UUID

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)
from pydantic_core import PydanticCustomError


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


class AdminProfileResponse(BaseModel):
    """当前登录管理员信息"""

    admin_id: int = Field(..., description="管理员 ID")
    username: str = Field(..., description="管理员用户名")


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


class GmapProxyList(BaseModel):
    """保存配置和连通性校验共用的代理格式边界。"""

    proxies: list[str] = Field(
        default_factory=list,
        description="完整代理 URL 列表",
    )

    @field_validator("proxies", mode="before")
    @classmethod
    def _normalize_proxies(cls, value: object) -> object:
        """去空行并规范化完整 URL，错误项号对应原始输入数组。"""
        if not isinstance(value, list):
            return value
        normalized: list[object] = []
        for index, item in enumerate(value):
            if isinstance(item, str):
                if not item.strip():
                    continue
                try:
                    item = _normalize_url(item, schemes=_PROXY_SCHEMES, proxy=True)
                except ValueError as exc:
                    raise PydanticCustomError(
                        "proxy_url", "代理 URL 格式无效", {"index": index + 1}
                    ) from exc
            normalized.append(item)
        return normalized


class GmapProxyCheckRequest(GmapProxyList):
    """按批校验，限制单次网络请求数量。"""

    proxies: list[str] = Field(min_length=1, max_length=20)


class GmapProxyCheckResult(BaseModel):
    """连通性结果不返回凭据或底层异常文本。"""

    proxy: str
    status: Literal["ok", "http_error", "timeout", "connection_error"]
    status_code: int | None = None
    duration_ms: int


StorageId = Annotated[
    str,
    Field(min_length=36, max_length=36),
    AfterValidator(lambda value: str(UUID(value))),
]


class _StorageConfig(BaseModel):
    """所有保存项必须完整，历史任务会按 ID 读取非启用项。"""

    model_config = ConfigDict(hide_input_in_errors=True, str_strip_whitespace=True)

    id: StorageId
    name: str = Field(min_length=1, max_length=100)
    bucket: str = Field(min_length=1, max_length=500)
    access_key_id: str = Field(min_length=1, max_length=500, repr=False)


class R2StorageConfig(_StorageConfig):
    """Cloudflare R2 对象存储配置。"""

    provider: Literal["R2"]
    account_id: str = Field(min_length=1, max_length=500)
    secret_access_key: str = Field(min_length=1, max_length=500, repr=False)


class AliOssStorageConfig(_StorageConfig):
    """阿里云 OSS 对象存储配置。"""

    provider: Literal["AliOSS"]
    endpoint: str = Field(min_length=1, max_length=500)
    access_key_secret: str = Field(min_length=1, max_length=500, repr=False)

    @field_validator("endpoint")
    @classmethod
    def _normalize_endpoint(cls, value: str) -> str:
        """只接受不含凭据和路径的 HTTP(S) OSS 根地址。"""
        try:
            parsed = urlsplit(value)
            _port = parsed.port
            host = parsed.hostname
        except ValueError as exc:
            raise ValueError("AliOSS endpoint 格式无效") from exc
        if (
            parsed.scheme not in ("http", "https")
            or not host
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or parsed.path not in ("", "/")
        ):
            raise ValueError("AliOSS endpoint 格式无效")
        return value.rstrip("/")


ObjectStorageItem = Annotated[
    R2StorageConfig | AliOssStorageConfig, Field(discriminator="provider")
]


class ObjectStorageConfig(BaseModel):
    """对象存储配置及未配置时的默认读取视图。"""

    model_config = ConfigDict(hide_input_in_errors=True)

    active_id: StorageId | None
    items: list[ObjectStorageItem]

    @model_validator(mode="after")
    def _validate_selection(self) -> "ObjectStorageConfig":
        ids = [item.id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("对象存储配置 ID 不能重复")
        if (ids and self.active_id not in ids) or (
            not ids and self.active_id is not None
        ):
            raise ValueError("对象存储启用项必须指向列表内配置，空列表不得有启用项")
        return self
