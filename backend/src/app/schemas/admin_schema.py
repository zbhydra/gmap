"""
Admin 管理后台请求/响应 Schema
"""

from pydantic import BaseModel, Field, field_validator


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


class GosomApiItem(BaseModel):
    """gosom 引擎单条 API 配置"""

    base_url: str = Field(
        ...,
        min_length=1,
        max_length=500,
        pattern=r"^https?://.+$",
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

    @field_validator("base_url", "api_key", mode="before")
    @classmethod
    def _strip_before_validate(cls, value: object) -> object:
        """先剥首尾空白再进 pattern/长度校验，避免可修剪输入被误拒。"""
        return value.strip() if isinstance(value, str) else value

    @field_validator("base_url", mode="after")
    @classmethod
    def _rstrip_slash(cls, value: str) -> str:
        """剥掉末尾斜杠，保证消费方拼路径不出现双斜杠。"""
        return value.rstrip("/")


class GosomApiConfigRequest(BaseModel):
    """gosom 引擎 API 配置保存请求；整表覆盖保存，items 为空即清空配置"""

    items: list[GosomApiItem] = Field(
        default_factory=list,
        max_length=100,
        description="全部 API 配置行，一行一个 url / key / 权重",
    )
