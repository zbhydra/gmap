"""Admin 用户列表与用户 profile API real 集成测试。

真实资源依赖：
- MySQL: admins / users / user_subscriptions / user_usage_logs /
  config_subscription_product（config 表只读，读 free 档 monthly_quota）

用户行直接落库构造（精确控制 is_del / locked_until / created_at），订阅行
预置多产品线合成数据，结束后按订阅行 → 用户行顺序清理。
profile 多线用例回归旧 get_by_id 单行读法在复合主键下的 MultipleResultsFound。

覆盖矩阵：
Endpoint                          Happy Permission Missing Type Min/Max Overflow XSS SQLi Unicode Side Effect
GET /api/admin/users              Y     Y          n/a     Y    Y       Y        Y   Y    n/a     reads DB only
GET /api/admin/users/{id}/profile Y     centralized n/a    n/a  n/a     n/a      n/a n/a  n/a     reads DB only
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
import uuid

import pytest
from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants.subscription import (
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    ONLINE_BASIC_PRODUCT_ID,
)
from app.core.database import get_engine
from app.i18n.common_code import CommonCode
from app.models.admin_model import AdminModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_model import UserModel
from app.services.admin_service import admin_service
from app.utils.crypto import hash_password
from app.utils.time import get_current_ym, timestamp_now


pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_TEST_ADMIN_PASSWORD = "AdminUsersRealTest123!"
_DAY_MS = 86_400_000


@dataclass
class _CleanupState:
    """记录 real 测试创建的数据。"""

    user_ids: list[int] = field(default_factory=list)


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""
    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


@pytest.fixture
async def real_admin_users_schema_ready(real_mysql_ready) -> None:
    """检查用户管理 real 测试需要的表。"""
    required_tables = (
        "admins",
        "users",
        "user_subscriptions",
        "user_usage_logs",
        "config_subscription_product",
    )
    missing = [table for table in required_tables if not await _table_exists(table)]
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_admin_token_for_users(
    real_admin_users_schema_ready,
    test_run_id: str,
) -> AsyncIterator[str]:
    """创建真实管理员并返回 access token。"""
    username = f"pytest-admin-users-{uuid.uuid4().hex[:8]}-{test_run_id}"
    admin = AdminModel(  # type: ignore[call-arg]
        username=username,
        password_hash=hash_password(_TEST_ADMIN_PASSWORD),
        is_active=True,
    )
    engine = get_engine()
    async with AsyncSession(engine) as session:
        session.add(admin)
        await session.commit()
        await session.refresh(admin)

    try:
        access_token, _refresh_token, _access_expire, _refresh_expire = (
            admin_service.create_token_pair(admin)
        )
        yield access_token
    finally:
        async with AsyncSession(engine) as session:
            await session.execute(
                delete(AdminModel).where(AdminModel.username == username)
            )
            await session.commit()


@pytest.fixture
async def real_admin_users_cleanup(
    real_admin_users_schema_ready,
) -> AsyncIterator[_CleanupState]:
    """清理本测试创建的订阅行和用户行（子表 → 父表）。"""
    state = _CleanupState()
    try:
        yield state
    finally:
        engine = get_engine()
        async with AsyncSession(engine) as session:
            if state.user_ids:
                await session.execute(
                    delete(UserSubscriptionModel).where(
                        UserSubscriptionModel.user_id.in_(state.user_ids)
                    )
                )
                await session.execute(
                    delete(UserModel).where(UserModel.user_id.in_(state.user_ids))
                )
            await session.commit()


async def _insert_real_user(
    *,
    email: str,
    cleanup: _CleanupState,
    is_del: bool = False,
    locked_until: int | None = None,
    created_at: int,
) -> UserModel:
    """直接落库构造用户行，精确控制状态字段与注册时间，并登记清理。"""
    user = UserModel(  # type: ignore[call-arg]
        email=email,
        password_hash="!NOLOGIN!",
        is_del=is_del,
        locked_until=locked_until,
        login_count=0,
        created_at=created_at,
        updated_at=created_at,
    )
    engine = get_engine()
    async with AsyncSession(engine) as session:
        session.add(user)
        await session.commit()
        await session.refresh(user)
    cleanup.user_ids.append(user.user_id)
    return user


def _make_real_email(label: str, test_run_id: str) -> str:
    """生成本轮专属邮箱：label 与 runid 相邻，二者组合即可做唯一模糊搜索词。"""
    return f"pytest-{label}-{test_run_id}-{uuid.uuid4().hex[:8]}@example.com"


def _email_keyword(label: str, test_run_id: str) -> str:
    """邮箱模糊搜索词：label+runid 是同轮所有用户 email 的公共子串。"""
    return f"{label}-{test_run_id}"


async def _insert_subscription_row(
    user_id: int,
    product_line: str,
    product_id: str,
    expires_at: int,
) -> None:
    """预置一条订阅行（有效或过期），由 cleanup fixture 负责清理。"""
    now_ms = timestamp_now()
    engine = get_engine()
    async with AsyncSession(engine) as session:
        session.add(
            UserSubscriptionModel(  # type: ignore[call-arg]
                user_id=user_id,
                product_line=product_line,
                product_id=product_id,
                expires_at=expires_at,
                created_at=now_ms,
                updated_at=now_ms,
            )
        )
        await session.commit()


async def test_real_admin_users_requires_admin(real_async_client) -> None:
    """用户列表未登录返回 401。"""
    response = await real_async_client.get("/api/admin/users")

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS


async def test_real_admin_user_profile_requires_admin(real_async_client) -> None:
    """用户 profile 未登录返回 401。"""
    response = await real_async_client.get("/api/admin/users/1/profile")

    assert response.status_code == 401
    assert response.json()["code"] == CommonCode.AUTH_MISSING_CREDENTIALS


async def test_real_admin_users_filter_by_email_paginate_and_order(
    real_async_client,
    real_admin_token_for_users,
    real_admin_users_cleanup: _CleanupState,
    test_run_id: str,
) -> None:
    """邮箱模糊筛选命中本轮数据，分页 total 正确，按 user_id 倒序。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    email_keyword = _email_keyword("users-real", test_run_id)
    first = await _insert_real_user(
        email=_make_real_email("users-real", test_run_id),
        cleanup=real_admin_users_cleanup,
        created_at=timestamp_now(),
    )
    second = await _insert_real_user(
        email=_make_real_email("users-real", test_run_id),
        cleanup=real_admin_users_cleanup,
        created_at=timestamp_now(),
    )

    page_one = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"email": email_keyword, "page": 1, "page_size": 1},
    )
    page_two = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"email": email_keyword, "page": 2, "page_size": 1},
    )

    assert page_one.status_code == 200
    body_one = page_one.json()
    assert body_one["code"] == CommonCode.SUCCESS
    assert body_one["data"]["total"] == 2
    assert [row["user_id"] for row in body_one["data"]["rows"]] == [second.user_id]
    assert body_one["data"]["rows"][0]["email"] == second.email
    assert page_two.status_code == 200
    body_two = page_two.json()
    assert body_two["code"] == CommonCode.SUCCESS
    assert [row["user_id"] for row in body_two["data"]["rows"]] == [first.user_id]
    assert body_two["data"]["total"] == 2
    assert body_two["data"]["page"] == 2


async def test_real_admin_users_filter_by_user_id_status_and_created_range(
    real_async_client,
    real_admin_token_for_users,
    real_admin_users_cleanup: _CleanupState,
    test_run_id: str,
) -> None:
    """用户 ID 精确 / 状态 / 注册时间闭开区间筛选，列表含已注销用户。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    email_keyword = _email_keyword("users-status", test_run_id)
    created_at = timestamp_now()

    normal_user = await _insert_real_user(
        email=_make_real_email("users-status", test_run_id),
        cleanup=real_admin_users_cleanup,
        created_at=created_at,
    )
    locked_user = await _insert_real_user(
        email=_make_real_email("users-status", test_run_id),
        cleanup=real_admin_users_cleanup,
        locked_until=timestamp_now() + 3_600_000,
        created_at=created_at + 1_000,
    )
    deleted_user = await _insert_real_user(
        email=_make_real_email("users-status", test_run_id),
        cleanup=real_admin_users_cleanup,
        is_del=True,
        created_at=created_at + 2_000,
    )

    by_user_id = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"user_id": normal_user.user_id},
    )
    by_normal = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"email": email_keyword, "status": "normal"},
    )
    by_locked = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"email": email_keyword, "status": "locked"},
    )
    by_deleted = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"email": email_keyword, "status": "deleted"},
    )
    # 闭开区间 [start, end)：含 created_at+1000，不含恰好等于 end 的行。
    in_range = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={
            "email": email_keyword,
            "created_start": created_at + 500,
            "created_end": created_at + 1_500,
        },
    )
    # end 恰好等于 locked_user.created_at：只命中更早的 normal_user。
    range_exclusive_end = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={
            "email": email_keyword,
            "created_end": created_at + 1_000,
        },
    )

    for response in (
        by_user_id,
        by_normal,
        by_locked,
        by_deleted,
        in_range,
        range_exclusive_end,
    ):
        assert response.status_code == 200
        assert response.json()["code"] == CommonCode.SUCCESS

    assert [row["user_id"] for row in by_user_id.json()["data"]["rows"]] == [
        normal_user.user_id
    ]
    assert by_normal.json()["data"]["rows"][0]["account_status"] == "normal"
    assert [row["user_id"] for row in by_normal.json()["data"]["rows"]] == [
        normal_user.user_id
    ]
    assert [row["user_id"] for row in by_locked.json()["data"]["rows"]] == [
        locked_user.user_id
    ]
    assert by_locked.json()["data"]["rows"][0]["account_status"] == "locked"
    # 列表含已注销用户，靠状态列区分。
    assert [row["user_id"] for row in by_deleted.json()["data"]["rows"]] == [
        deleted_user.user_id
    ]
    assert by_deleted.json()["data"]["rows"][0]["account_status"] == "deleted"
    assert [row["user_id"] for row in in_range.json()["data"]["rows"]] == [
        locked_user.user_id
    ]
    assert [row["user_id"] for row in range_exclusive_end.json()["data"]["rows"]] == [
        normal_user.user_id
    ]


async def test_real_admin_users_email_filter_treats_wildcards_literally(
    real_async_client,
    real_admin_token_for_users,
    test_run_id: str,
) -> None:
    """邮箱搜索词中的 SQL 通配符与注入串按字面处理，不误命中不报错。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    payloads = [
        f"%users-{test_run_id}%",
        f"_{test_run_id}",
        "' OR '1'='1",
        f"<script>alert('{test_run_id}')</script>",
    ]

    for payload in payloads:
        response = await real_async_client.get(
            "/api/admin/users",
            headers=headers,
            params={"email": payload, "page": 1, "page_size": 10},
        )
        assert response.status_code == 200, payload
        body = response.json()
        assert body["code"] == CommonCode.SUCCESS, payload
        assert body["data"]["rows"] == [], payload


async def test_real_admin_users_reject_invalid_filters(
    real_async_client,
    real_admin_token_for_users,
) -> None:
    """非法状态值、非法分页与反向时间范围被拒绝。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    now_ms = timestamp_now()

    invalid_status = await real_async_client.get(
        "/api/admin/users", headers=headers, params={"status": "abc"}
    )
    invalid_page = await real_async_client.get(
        "/api/admin/users", headers=headers, params={"page": 0}
    )
    invalid_page_size = await real_async_client.get(
        "/api/admin/users", headers=headers, params={"page_size": 101}
    )
    negative_created = await real_async_client.get(
        "/api/admin/users", headers=headers, params={"created_start": -1}
    )
    reversed_range = await real_async_client.get(
        "/api/admin/users",
        headers=headers,
        params={"created_start": now_ms, "created_end": now_ms - 1},
    )

    assert invalid_status.status_code == 422
    assert invalid_status.json()["code"] == CommonCode.VALIDATION_ERROR
    assert invalid_page.status_code == 422
    assert invalid_page.json()["code"] == CommonCode.VALIDATION_ERROR
    assert invalid_page_size.status_code == 422
    assert invalid_page_size.json()["code"] == CommonCode.VALIDATION_ERROR
    assert negative_created.status_code == 422
    assert negative_created.json()["code"] == CommonCode.VALIDATION_ERROR
    assert reversed_range.status_code == 400
    assert reversed_range.json()["code"] == CommonCode.INVALID_REQUEST.value


async def test_real_admin_user_profile_multi_line_subscriptions_and_usage(
    real_async_client,
    real_admin_token_for_users,
    real_admin_users_cleanup: _CleanupState,
    test_run_id: str,
) -> None:
    """多产品线订阅行用户不再 500；订阅恒四行、用量恒三行且 total 随档位。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    user = await _insert_real_user(
        email=_make_real_email("users-profile", test_run_id),
        cleanup=real_admin_users_cleanup,
        created_at=timestamp_now(),
    )
    now_ms = timestamp_now()
    active_extension_expires = now_ms + 30 * _DAY_MS
    active_maps_expires = now_ms + 15 * _DAY_MS
    expired_online_expires = now_ms - _DAY_MS
    await _insert_subscription_row(
        user.user_id, "extension", "unlimited", active_extension_expires
    )
    await _insert_subscription_row(
        user.user_id,
        "maps_extension",
        MAPS_EXTENSION_PRO_PRODUCT_ID,
        active_maps_expires,
    )
    await _insert_subscription_row(
        user.user_id,
        "maps_online",
        ONLINE_BASIC_PRODUCT_ID,
        expired_online_expires,
    )

    response = await real_async_client.get(
        f"/api/admin/users/{user.user_id}/profile", headers=headers
    )
    assert response.status_code == 200
    body = response.json()
    data = body["data"]

    assert body["code"] == CommonCode.SUCCESS
    # 旧单数 subscription 字段已删净，新旧不并存。
    assert "subscription" not in data
    assert data["credits"]["balance"] == 0

    subscriptions = data["subscriptions"]
    assert [line["product_line"] for line in subscriptions] == [
        "extension",
        "maps_extension",
        "maps_online",
        "maps_api",
    ]
    assert subscriptions[0]["has_subscription"] is True
    assert subscriptions[0]["expires_at"] == active_extension_expires
    assert subscriptions[1]["has_subscription"] is True
    assert subscriptions[1]["expires_at"] == active_maps_expires
    # 已过期行保留原始过期时间，has_subscription 压成 False。
    assert subscriptions[2]["has_subscription"] is False
    assert subscriptions[2]["expires_at"] == expired_online_expires
    # 无付费行 = Free 不落库口径。
    assert subscriptions[3]["has_subscription"] is False
    assert subscriptions[3]["expires_at"] is None

    # total 单一真源 = 所持档位 monthly_quota：持 Pro 的线读 Pro 配置，
    # 过期线与无行线折算 free 档。
    usage = data["usage"]
    assert [line["product_line"] for line in usage] == [
        "maps_extension",
        "maps_online",
        "maps_api",
    ]
    expected_totals = {"maps_extension": 100_000, "maps_online": 1000, "maps_api": 20}
    current_ym = get_current_ym()
    for line in usage:
        assert line["ym"] == current_ym, line["product_line"]
        assert line["used"] == 0, line["product_line"]
        assert line["total"] == expected_totals[line["product_line"]], line[
            "product_line"
        ]
        assert line["exhausted"] is False, line["product_line"]


async def test_real_admin_user_profile_usage_reads_free_tier_totals(
    real_async_client,
    real_admin_token_for_users,
    real_admin_users_cleanup: _CleanupState,
    test_run_id: str,
) -> None:
    """无任何订阅行用户：usage 三线 total 均为本线 free 档（1000/1000/20）。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}
    user = await _insert_real_user(
        email=_make_real_email("users-free", test_run_id),
        cleanup=real_admin_users_cleanup,
        created_at=timestamp_now(),
    )

    response = await real_async_client.get(
        f"/api/admin/users/{user.user_id}/profile", headers=headers
    )
    assert response.status_code == 200
    body = response.json()
    data = body["data"]

    assert body["code"] == CommonCode.SUCCESS
    usage = data["usage"]
    assert [line["product_line"] for line in usage] == [
        "maps_extension",
        "maps_online",
        "maps_api",
    ]
    expected_totals = {"maps_extension": 1000, "maps_online": 1000, "maps_api": 20}
    for line in usage:
        assert line["total"] == expected_totals[line["product_line"]], line[
            "product_line"
        ]
        assert line["used"] == 0
        assert line["exhausted"] is False
    # Free 不落库：四线订阅全部无权益。
    assert all(
        line["has_subscription"] is False and line["expires_at"] is None
        for line in data["subscriptions"]
    )


async def test_real_admin_user_profile_user_not_found(
    real_async_client,
    real_admin_token_for_users,
) -> None:
    """不存在的用户返回 USER_NOT_FOUND。"""
    headers = {"Authorization": f"Bearer {real_admin_token_for_users}"}

    response = await real_async_client.get(
        "/api/admin/users/999999999999/profile", headers=headers
    )

    assert response.status_code == 200
    assert response.json()["code"] == CommonCode.USER_NOT_FOUND
