"""Reoon 账号配置与 Email 验证接口合同；API Key 按管理员运维合同明文保存与回显。"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ReoonAccount(BaseModel):
    model_config = ConfigDict(
        frozen=True, str_strip_whitespace=True, hide_input_in_errors=True
    )

    name: str = Field(min_length=1)
    api_key: str = Field(min_length=1, repr=False)


class ReoonConfig(BaseModel):
    """空账号列表时公开验证接口不可用。"""

    model_config = ConfigDict(frozen=True, hide_input_in_errors=True)

    accounts: list[ReoonAccount] = Field(default_factory=list)

    @model_validator(mode="after")
    def reject_duplicate_names(self) -> "ReoonConfig":
        names = [account.name for account in self.accounts]
        if len(set(names)) != len(names):
            raise ValueError("Reoon 账号名称不能重复")
        return self


class ReoonBalance(BaseModel):
    """ok=True 时只带额度字段，ok=False 时只带 reason；序列化需 exclude_none。"""

    name: str
    ok: bool
    api_status: str | None = None
    daily_credits: int | None = None
    instant_credits: int | None = None
    reason: Literal["unauthorized", "timeout", "upstream_error"] | None = None


class EmailVerifyRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, email: str) -> str:
        # 完整格式校验由前端负责；后端只拦截明显无效输入，避免浪费 Reoon 额度。
        email = email.strip()
        if len(email) > 254 or email.count("@") != 1:
            raise ValueError("邮箱长度不能超过 254 且必须只含一个 @")
        return email


class EmailVerifyResult(BaseModel):
    """我方对外字段；从 Reoon power 响应按同名字段解析，不透传原始响应。"""

    email: str
    username: str
    domain: str
    # Reoon 原值透出，前端只对已知取值做 i18n。
    status: str
    score: int = Field(validation_alias="overall_score")
    is_deliverable: bool
    is_safe_to_send: bool
    can_connect_smtp: bool
    mx_accepts_mail: bool
    is_catch_all: bool
    is_role_account: bool
    is_disposable: bool
    is_free_email: bool
    is_disabled: bool
    has_inbox_full: bool
    is_spamtrap: bool
    mx_records: list[str]
