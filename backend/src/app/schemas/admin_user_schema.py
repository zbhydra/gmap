"""管理后台用户信息弹窗与用户列表响应 Schema。

这些 schema 只服务 admin 只读排查界面，不包含密码、token、验证码等敏感字段。
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.constants.auth import UserAccountStatus


class AdminUserBasicInfo(BaseModel):
    """用户基础信息。"""

    user_id: int = Field(..., description="用户 ID")
    email: str | None = Field(None, description="当前邮箱")
    full_name: str | None = Field(None, description="当前用户昵称")
    avatar_url: str | None = Field(None, description="当前头像 URL")
    register_source: str | None = Field(None, description="注册来源")
    register_method: str | None = Field(None, description="首次注册方式")
    register_user_agent: str | None = Field(None, description="注册 User-Agent")
    register_ip: str | None = Field(None, description="注册 IP")
    register_country: str | None = Field(None, description="注册 IP 归属地")
    last_login_at: int | None = Field(None, description="最后登录时间（毫秒时间戳）")
    last_login_ip: str | None = Field(None, description="最后登录 IP")
    last_login_country: str | None = Field(None, description="最后登录 IP 归属地")
    last_operation_ip: str | None = Field(None, description="最后操作 IP")
    last_operation_country: str | None = Field(None, description="最后操作 IP 归属地")
    login_count: int = Field(..., description="登录次数")
    locked_until: int | None = Field(None, description="锁定截止时间（毫秒时间戳）")
    is_del: bool = Field(..., description="是否已注销")
    account_status: UserAccountStatus = Field(..., description="账号状态")
    created_at: int = Field(..., description="注册时间（毫秒时间戳）")
    updated_at: int = Field(..., description="更新时间（毫秒时间戳）")


class AdminUserCreditsInfo(BaseModel):
    """用户 Credits 信息。"""

    balance: int = Field(..., description="当前 Credits 余额")


class AdminUserSubscriptionLineInfo(BaseModel):
    """单产品线订阅摘要。

    user_subscriptions 按产品线一行、只保存付费权益（Free 不落库）：
    无付费行 = has_subscription False + expires_at null；过期行保留原始
    过期时间，只把 has_subscription 压成 False。
    """

    product_line: str = Field(..., description="产品线标识")
    has_subscription: bool = Field(..., description="该线是否持有有效付费订阅")
    expires_at: int | None = Field(
        None, description="订阅原始过期时间（毫秒时间戳），无付费行为 null"
    )


class AdminUserUsageLineInfo(BaseModel):
    """单产品线当月用量快照（当前业务月）。"""

    product_line: str = Field(..., description="产品线标识")
    ym: int = Field(..., description="业务月，格式 YYYYMM")
    used: int = Field(..., description="当月已用量")
    total: int = Field(..., description="当月配额总量（所持档位，含 free 档）")
    exhausted: bool = Field(..., description="当月配额是否已耗尽")


class AdminUserProfileData(BaseModel):
    """用户信息弹窗 profile 聚合响应。"""

    user: AdminUserBasicInfo = Field(..., description="用户基础信息")
    credits: AdminUserCreditsInfo = Field(..., description="Credits 信息")
    subscriptions: list[AdminUserSubscriptionLineInfo] = Field(
        ...,
        description="订阅摘要，固定四行：extension / maps_extension / maps_online / maps_api",
    )
    usage: list[AdminUserUsageLineInfo] = Field(
        ..., description="当月用量快照，固定三行：maps 三线"
    )


class AdminUserListItem(BaseModel):
    """用户列表行（用户管理页筛选表格）。"""

    user_id: int = Field(..., description="用户 ID")
    email: str | None = Field(None, description="当前邮箱")
    register_source: str | None = Field(None, description="注册来源")
    register_method: str | None = Field(None, description="首次注册方式")
    register_country: str | None = Field(None, description="注册时国家/地区")
    account_status: UserAccountStatus = Field(..., description="账号状态")
    login_count: int = Field(..., description="登录次数")
    last_login_at: int | None = Field(None, description="最后登录时间（毫秒时间戳）")
    created_at: int = Field(..., description="注册时间（毫秒时间戳）")


class AdminUsersPageData(BaseModel):
    """用户列表分页响应，含已注销用户（状态列区分）。"""

    rows: list[AdminUserListItem] = Field(..., description="用户行，按 user_id 倒序")
    total: int = Field(..., description="符合筛选条件的总数")
    page: int = Field(..., description="页码")
    page_size: int = Field(..., description="每页数量")


class AdminUserCreditRecordData(BaseModel):
    """用户积分流水记录行。"""

    id: int = Field(..., description="积分流水 ID")
    change_amount: int = Field(..., description="Credits 变化量")
    reason: str = Field(..., description="变更原因")
    metadata_json: str | None = Field(None, description="扩展 JSON 快照")
    created_at: int = Field(..., description="创建时间（毫秒时间戳）")


class AdminUserCreditsPageData(BaseModel):
    """用户积分流水分页响应。"""

    rows: list[AdminUserCreditRecordData] = Field(..., description="积分流水行")
    total: int = Field(..., description="总数")
    page: int = Field(..., description="页码")
    page_size: int = Field(..., description="每页数量")


class AdminUserOrderRecordData(BaseModel):
    """用户订单记录行。"""

    id: int = Field(..., description="订单 ID")
    order_no: str = Field(..., description="订单号")
    user_id: int = Field(..., description="用户 ID")
    user_email: str = Field(..., description="用户当前邮箱")
    product_class: int = Field(..., description="商品类别")
    product_id: str = Field(..., description="商品 ID")
    product_name: str = Field(..., description="商品名称快照")
    amount: int = Field(..., description="订单金额，6 位精度整数")
    currency: str = Field(..., description="订单币种")
    order_status: int = Field(..., description="订单状态")
    callback_status: int = Field(..., description="履约回调状态")
    payment_method: str = Field(..., description="支付方式")
    payment_data: object | None = Field(None, description="支付入口数据")
    payment_channel_order_no: str = Field(..., description="支付渠道订单号")
    payment_transaction_id: str = Field(..., description="支付渠道交易流水 ID")
    payment_channel_uid: str = Field(..., description="支付渠道用户 ID")
    paid_amount: int | None = Field(None, description="渠道实付金额，6 位精度整数")
    paid_currency: str = Field(..., description="渠道实付币种")
    created_at: int = Field(..., description="创建时间（毫秒时间戳）")
    updated_at: int = Field(..., description="更新时间（毫秒时间戳）")
    paid_at: int | None = Field(None, description="支付时间（毫秒时间戳）")
    expired_at: int = Field(..., description="过期时间（毫秒时间戳）")
    client_ip: str = Field(..., description="下单客户端 IP")
    extra_metadata: object | None = Field(None, description="订单扩展元数据")


class AdminUserOrdersPageData(BaseModel):
    """用户订单分页响应。"""

    rows: list[AdminUserOrderRecordData] = Field(..., description="订单行")
    total: int = Field(..., description="总数")
    page: int = Field(..., description="页码")
    page_size: int = Field(..., description="每页数量")
