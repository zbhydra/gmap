"""统一 usage 服务 real 测试（额度基建，000 域，U5）。

真实资源依赖：
- MySQL: user_usage_logs（只插入流水）/ user_subscriptions /
  config_subscription_product（config 表只读，读 free 档 monthly_quota）
- Redis: 三线 total 用例经匿名 get_usage 读月度计数 key

用合成 user_id（无外键）+ 随机 request_id 隔离，结束后删除本轮流水量。
覆盖：MySQL consume/refund 幂等、SUM 聚合、refund 退回指定 target_ym、
三线 free 档 total、monthly_quota 缺失抛 PAYMENT_GATEWAY_ERROR、
匿名 refund 拒绝。匿名 Redis 路径回归在
tests/integration/real/api/client/test_maps_usage_real.py。
"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from uuid import uuid4

import pytest
from sqlalchemy import delete, func, select, text

from app.constants.subscription import EXTENSION_PRODUCT_LINE
from app.core.database import get_async_session, get_engine
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.usage_service import (
    _BaseUsageService,
    api_usage_service,
    extension_usage_service,
    online_usage_service,
)
from app.utils.time import get_current_ym

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass(slots=True)
class _UsageCleanupState:
    """记录本轮测试独占的合成 user_id，结束后删除其全部用量流水。"""

    user_ids: list[int] = field(default_factory=list)


class _NoQuotaLineService(_BaseUsageService):
    """extension 线门面（free 档无 monthly_quota），验证配置缺失抛错合同。"""

    product_line = EXTENSION_PRODUCT_LINE


async def _table_exists(table_name: str) -> bool:
    """判断真实数据库表是否存在。"""

    engine = get_engine()
    async with engine.begin() as conn:
        result = await conn.execute(
            text("SHOW TABLES LIKE :table_name"),
            {"table_name": table_name},
        )
        return result.first() is not None


def _synthetic_user_id() -> int:
    """生成本轮测试独占的合成 user_id（user_usage_logs 无用户外键）。"""

    return 9_200_000_000_000 + uuid4().int % 1_000_000_000_000


async def _sum_delta(user_id: int, ym: int) -> int:
    """直接聚合指定用户在指定月的流水 delta（副作用断言用）。"""

    async with get_async_session() as db:
        result = await db.execute(
            select(func.coalesce(func.sum(UserUsageLogModel.delta), 0)).where(
                UserUsageLogModel.user_id == user_id,
                UserUsageLogModel.ym == ym,
            )
        )
        return int(result.scalar_one())


@pytest.fixture
async def real_usage_schema_ready(
    real_mysql_ready: None, real_redis_ready: None
) -> None:
    """检查 usage 服务测试需要的真实 MySQL 表与 Redis。"""

    required_tables = {
        "user_usage_logs",
        "user_subscriptions",
        "config_subscription_product",
    }
    missing_tables = [
        table_name
        for table_name in sorted(required_tables)
        if not await _table_exists(table_name)
    ]
    if missing_tables:
        pytest.skip(
            f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(missing_tables)} 表"
        )


@pytest.fixture
async def real_usage_cleanup_state(
    real_usage_schema_ready: None,
) -> AsyncIterator[_UsageCleanupState]:
    """为测试分配合成 user_id 登记表，结束后清理其用量流水。"""

    state = _UsageCleanupState()
    try:
        yield state
    finally:
        async with get_async_session() as db:
            await db.execute(
                delete(UserUsageLogModel).where(
                    UserUsageLogModel.user_id.in_(state.user_ids)
                )
            )
            await db.commit()


async def test_real_consume_is_idempotent_by_request_id(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """同 request_id 二次 consume：deducted=False 且当月 used 不变。"""

    user_id = _synthetic_user_id()
    real_usage_cleanup_state.user_ids.append(user_id)
    identity = f"u:{user_id}"
    request_id = uuid4().hex

    first = await extension_usage_service.consume(
        identity, user_id=user_id, records=30, request_id=request_id
    )
    replay = await extension_usage_service.consume(
        identity, user_id=user_id, records=30, request_id=request_id
    )

    assert first.deducted is True
    assert first.used == 30
    assert replay.deducted is False
    assert replay.used == 30
    assert await _sum_delta(user_id, first.ym) == 30


async def test_real_consume_accumulates_across_request_ids(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """不同 request_id 独立累计：used = 各次消费之和（SUM 聚合正确）。"""

    user_id = _synthetic_user_id()
    real_usage_cleanup_state.user_ids.append(user_id)
    identity = f"u:{user_id}"

    await extension_usage_service.consume(
        identity, user_id=user_id, records=5, request_id=uuid4().hex
    )
    await extension_usage_service.consume(
        identity, user_id=user_id, records=7, request_id=uuid4().hex
    )
    third = await extension_usage_service.consume(
        identity, user_id=user_id, records=11, request_id=uuid4().hex
    )

    assert third.used == 23
    assert await _sum_delta(user_id, third.ym) == 23


async def test_real_refund_reduces_usage_and_is_idempotent(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """refund 写负 delta 抵减当月 used；同 request_id 重放只退一次。"""

    user_id = _synthetic_user_id()
    real_usage_cleanup_state.user_ids.append(user_id)
    identity = f"u:{user_id}"
    consume_id = uuid4().hex
    refund_id = uuid4().hex

    await extension_usage_service.consume(
        identity, user_id=user_id, records=100, request_id=consume_id
    )
    first = await extension_usage_service.refund(
        user_id=user_id, records=40, request_id=refund_id
    )
    replay = await extension_usage_service.refund(
        user_id=user_id, records=40, request_id=refund_id
    )

    assert first.used == 60
    assert replay.used == 60
    assert await _sum_delta(user_id, first.ym) == 60


async def test_real_refund_targets_original_month(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """跨月结算：refund(target_ym=原月) 修正历史月，当前月不受影响。"""

    user_id = _synthetic_user_id()
    real_usage_cleanup_state.user_ids.append(user_id)
    identity = f"u:{user_id}"
    current_ym = get_current_ym()
    previous_ym = current_ym - 1 if current_ym % 100 != 1 else current_ym - 89

    await extension_usage_service.consume(
        identity, user_id=user_id, records=80, request_id=uuid4().hex
    )
    snapshot = await extension_usage_service.refund(
        user_id=user_id,
        records=25,
        request_id=uuid4().hex,
        target_ym=previous_ym,
    )

    # 当月快照不受历史月退回影响；两个月 SUM 各自自洽
    assert snapshot.ym == current_ym
    assert snapshot.used == 80
    assert await _sum_delta(user_id, current_ym) == 80
    assert await _sum_delta(user_id, previous_ym) == -25


async def test_real_three_lines_read_free_monthly_quota(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """匿名身份读三线 total：maps_extension=1000 / maps_online=1000 / maps_api=20。"""

    expectations = [
        (extension_usage_service, 1000),
        (online_usage_service, 1000),
        (api_usage_service, 20),
    ]
    for service, expected_total in expectations:
        snapshot = await service.get_usage(f"d:{uuid4().hex}", user_id=0)
        assert snapshot.total == expected_total, service.product_line
        assert snapshot.used == 0
        assert snapshot.exhausted is False


async def test_real_get_total_raises_when_monthly_quota_missing(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """monthly_quota 缺失（extension 线 free 档）抛 PAYMENT_GATEWAY_ERROR。"""

    with pytest.raises(AppCommonException) as exc_info:
        await _NoQuotaLineService().get_usage(f"u:{_synthetic_user_id()}", user_id=0)

    assert exc_info.value.code == CommonCode.PAYMENT_GATEWAY_ERROR


async def test_real_refund_rejects_anonymous_user(
    real_usage_cleanup_state: _UsageCleanupState,
) -> None:
    """匿名（user_id=0）不提供 refund：表合同要求 user_id 恒大于 0。"""

    with pytest.raises(ValueError, match="refund requires a logged-in user"):
        await extension_usage_service.refund(
            user_id=0, records=1, request_id=uuid4().hex
        )
