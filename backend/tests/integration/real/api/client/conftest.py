"""Client Online real 验收：独占配置写入，结束后恢复配置并清理任务。"""

from collections.abc import AsyncIterator
from dataclasses import dataclass, field

import pytest
from sqlalchemy import delete, select, text

from app.core.database import get_async_session
from app.models.maps_online_task_item_model import ITEM_MODELS, get_item_model
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.maps_online_task_service import maps_online_task_service
from tests.integration.real.api.admin.conftest import (
    real_admin_system_settings_cleanup,  # noqa: F401
    real_system_settings_schema_ready,  # noqa: F401
)


@dataclass
class _CleanupState:
    user_ids: list[int] = field(default_factory=list)


@pytest.fixture
async def real_online_api_cleanup(
    real_mysql_ready: None,
    real_redis_ready: None,
    real_user_factory,
    real_admin_system_settings_cleanup: object,  # noqa: F811
) -> AsyncIterator[_CleanupState]:
    required = {
        "users",
        "user_subscriptions",
        "user_usage_logs",
        "maps_online_tasks",
        "config_subscription_product",
    } | {model.__tablename__ for model in ITEM_MODELS}
    async with get_async_session() as db:
        tables = set((await db.execute(text("SHOW TABLES"))).scalars().all())
    if missing := required - tables:
        pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {','.join(sorted(missing))}")
    state = _CleanupState()
    try:
        yield state
    finally:
        await maps_online_task_service.close()
        async with get_async_session() as db:
            task_ids = list(
                (
                    await db.scalars(
                        select(MapsOnlineTaskModel.id).where(
                            MapsOnlineTaskModel.user_id.in_(state.user_ids)
                        )
                    )
                ).all()
            )
            for task_id in task_ids:
                item_model = get_item_model(task_id)
                await db.execute(
                    delete(item_model).where(item_model.task_id == task_id)
                )
            await db.execute(
                delete(MapsOnlineTaskModel).where(MapsOnlineTaskModel.id.in_(task_ids))
            )
            await db.execute(
                delete(UserUsageLogModel).where(
                    UserUsageLogModel.user_id.in_(state.user_ids)
                )
            )
            await db.commit()
