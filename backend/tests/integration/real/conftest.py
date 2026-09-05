"""Real 集成测试专用 fixture。"""

from collections.abc import AsyncIterator
import inspect

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, text

from app.constants.auth import TokenType
from app.core.database import check_db_connection, get_async_session, get_engine
from app.core.redis import redis_client
from app.main import app
from app.models.order_model import OrderModel
from app.models.subscription_model import UserSubscriptionModel
from app.models.user_model import UserModel
from app.services.user_service import UserService
from app.services.user_token_service import user_token_service
from app.utils.jwt import JwtData, JwtUnit


@pytest.fixture
async def real_async_client() -> AsyncIterator[AsyncClient]:
    """
    提供 real API 测试客户端。

    Yields:
        AsyncClient: 通过 ASGI 调用真实 FastAPI 应用的客户端。
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://test",
        timeout=30.0,
    ) as client:
        yield client


@pytest.fixture
async def real_mysql_ready() -> None:
    """
    检查 MySQL 可用性。

    Raises:
        pytest.skip: MySQL 不可用时跳过 real 测试。
    """
    if not await check_db_connection():
        pytest.skip("REAL_MYSQL_UNAVAILABLE: MySQL 不可用，跳过 real 测试")


@pytest.fixture
async def real_schema_ready(real_mysql_ready) -> None:
    """
    检查播放器相关 real 测试需要的表。

    Args:
        real_mysql_ready: MySQL 可用性 fixture。

    Raises:
        pytest.skip: 必要表不存在时跳过 real 测试。
    """
    required_tables = {"users", "user_subscriptions"}
    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(text("SHOW TABLES"))
        tables = {str(row[0]) for row in result.fetchall()}

    missing = sorted(required_tables - tables)
    if missing:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing)} 表")


@pytest.fixture
async def real_redis_ready() -> None:
    """
    检查 Redis 可用性。

    Raises:
        pytest.skip: Redis 不可用时跳过 real 测试。
    """
    try:
        redis = await redis_client.get_client()
        ping_result = redis.ping()
        if inspect.isawaitable(ping_result):
            await ping_result
    except Exception as exc:
        pytest.skip(f"REAL_REDIS_UNAVAILABLE: Redis 不可用，跳过 real 测试: {exc}")


@pytest.fixture
async def real_user_factory() -> AsyncIterator:
    """真实无密码用户工厂：签发单个 access token，创建后立即登记。

    teardown 撤销 token 并按订阅、订单、用户顺序清理，异常前半程创建的用户同样覆盖。
    """

    users: list[tuple[int, str]] = []

    async def create(email: str) -> tuple[int, str]:
        user = await UserService().create_user_without_password(email=email)
        users.append((user.user_id, email))
        token, expires_at = JwtUnit.create_access_token(
            JwtData(user_id=user.user_id, email=email)
        )
        await user_token_service.store_token(
            token, user.user_id, TokenType.USER_ACCESS, expires_at
        )
        return user.user_id, token

    try:
        yield create
    finally:
        for user_id, _email in users:
            await user_token_service.revoke_all_user_tokens(user_id)
            async with get_async_session() as db:
                await db.execute(
                    delete(UserSubscriptionModel).where(
                        UserSubscriptionModel.user_id == user_id
                    )
                )
                await db.execute(
                    delete(OrderModel).where(OrderModel.user_id == user_id)
                )
                await db.execute(delete(UserModel).where(UserModel.user_id == user_id))
                await db.commit()
