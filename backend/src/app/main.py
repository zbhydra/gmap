"""
FastAPI 请求处理流程

================================================================================
请求进入 (Request In)
================================================================================

1. Middleware 按添加顺序的**反向**执行（洋葱模型）
   ┌────────────────────────────────────────────────────────────────────┐
   │  RequestLoggingMiddleware (最后添加，最先执行)                     │
   │  ├─ 记录请求开始                                                    │
   │  └─ await call_next(request) ──────────────────────────┐           │
   │                                                          │           │
   │  CrossOriginMiddleware (中间添加)                        │           │
   │  ├─ 处理 CORS                                            │           │
   │  └─ await call_next(request) ─────────────────────────┐ │           │
   │                                                        │ │           │
   │  ErrorHandlingMiddleware (最先添加，最后执行)          │ │           │
   │  ├─ try: await call_next(request) ────────────┐        │ │           │
   └──┼────────────────────────────────────────────┼────────┼───────────┘
      │                                             │        │
      │  ┌──────────────────────────────────────────┼────────┼──────────┐
      │  │  Pydantic 验证请求参数                   │        │          │
      │  │  ├─ 解析请求体                           │        │          │
      │  │  └─ 失败 → raise RequestValidationError  │        │          │
      │  │                                           │        │          │
      │  │  路由处理函数                             │        │          │
      │  │  ├─ 执行业务逻辑                          │        │          │
      │  │  └─ return Response                       │        │          │
      │  └───────────────────────────────────────────┼────────┼──────────┤
      │                                              │        │
      │  ↓ 异常处理流程                              │        │
      │                                              │        │
      │  @app.exception_handler(RequestValidationError) ←─────┘        │
      │  ├─ 捕获 RequestValidationError                       │
      │  ├─ 自定义错误响应                                    │
      │  └─ return JSONResponse (status=422) ─────────┐       │
      │                                                │       │
      │  其他未捕获异常 → 传播回 Middleware ───────────┼───────┘
      │                                                │
      │  ↓ 响应返回 (Response Out)                     │
      │                                                 │
      └─ ErrorHandlingMiddleware except 块捕获异常 ─────┘
         ├─ 捕获 AppCommonException → 翻译后返回
         └─ 捕获其他 Exception → 通用错误响应

================================================================================
异常处理优先级
================================================================================

1. @app.exception_handler() 先触发
   - 处理路由处理阶段抛出的特定异常（如 RequestValidationError）
   - 返回自定义错误响应

2. Middleware 的 except 块后触发
   - 只捕获 Exception Handler 未处理的异常
   - ErrorHandlingMiddleware 处理 AppCommonException 和通用异常

================================================================================
Middleware 添加顺序与执行顺序
================================================================================

添加顺序:
  app.add_middleware(ErrorHandlingMiddleware)      # ① 最先添加
  app.add_middleware(CrossOriginMiddleware)        # ②
  app.add_middleware(RequestLoggingMiddleware)     # ③ 最后添加

请求进入顺序 (从外到内):
  ③ RequestLoggingMiddleware → ② CrossOrigin → ① ErrorHandling → 路由

响应返回顺序 (从内到外):
  路由 → ① ErrorHandling → ② CrossOrigin → ③ RequestLogging → 响应

================================================================================
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from app.middleware.cross_origin import CrossOriginMiddleware
import uvicorn

from app.core.config import settings
from app.utils.logger import logger, setup_logger
from app.middleware import (
    ErrorHandlingMiddleware,
    RequestLoggingMiddleware,
)
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from app.middleware.error_handling import handle_request_validation_error

# 路由模块会级联拉起全部 service / provider 依赖图，统一在模块顶部一次性加载。
from app.api.admin.admin_auth import router as admin_auth_router
from app.api.admin.admin_dashboard import router as admin_dashboard_router
from app.api.admin.admin_order_analytics import router as admin_order_analytics_router
from app.api.admin.admin_orders import router as admin_orders_router
from app.api.admin.admin_system_settings import router as admin_system_settings_router
from app.api.admin.admin_users import router as admin_users_router
from app.api.callback.paypal_callback import router as paypal_callback_router
from app.api.callback.clink_callback import router as clink_callback_router
from app.api.callback.telegram_callback import router as telegram_callback_router
from app.api.callback.test_pay_callback import router as callback_router
from app.api.client.auth_client import router as auth_router
from app.api.client.checkin_client import router as checkin_router
from app.api.client.credit_client import router as credit_router
from app.api.client.credits_asset_client import router as credits_asset_router
from app.api.client.maps_client import router as maps_router
from app.api.client.mark_client import router as mark_router
from app.api.client.order_client import router as order_router
from app.api.client.subscription_client import router as subscription_router
from app.api.external.external_system_dashboard import (
    router as external_system_dashboard_router,
)
from app.api.system.dashboard import router as dashboard_router
from app.api.system.health import router as health_router


# 设置日志
setup_logger("server")

# 收到退出信号后等待存量请求完成的宽限秒数。
GRACEFUL_SHUTDOWN_TIMEOUT_SECONDS = 10


async def _start_cron_scheduler() -> None:
    """启动定时任务调度器。"""
    # 原因：调度器装配延迟到应用启动阶段，import 主模块时不触发。
    from app.crons.crons import cron_scheduler

    await cron_scheduler.start()


async def _stop_cron_scheduler() -> None:
    """停止定时任务调度器。"""
    # 原因：同 _start_cron_scheduler，延迟到启动阶段导入。
    from app.crons.crons import cron_scheduler

    await cron_scheduler.stop()


async def _shutdown_database_resources() -> None:
    """关闭业务数据库资源。"""
    # 原因：引擎关闭动作延迟到应用退出阶段执行，import 主模块时不初始化数据库。
    from app.core.database import close_engine

    await close_engine()


def _create_lifespan():
    """创建生命周期管理器。"""

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        """应用生命周期管理。"""
        logger.info(f"Starting {settings.app.name} v{settings.app.version}")

        await _start_cron_scheduler()

        logger.info("Application started successfully")

        try:
            yield
        finally:
            logger.info("Application is shutting down")

            await _stop_cron_scheduler()
            await _shutdown_database_resources()

    return lifespan


def _add_middlewares(app_instance: FastAPI) -> None:
    """按项目约定添加全局中间件。"""
    app_instance.add_middleware(ErrorHandlingMiddleware)
    app_instance.add_middleware(CrossOriginMiddleware)
    app_instance.add_middleware(RequestLoggingMiddleware)


def _add_exception_handlers(app_instance: FastAPI) -> None:
    """注册需要覆盖 FastAPI 默认响应的全局异常处理器。"""
    app_instance.add_exception_handler(
        RequestValidationError,
        handle_request_validation_error,
    )


def _include_api_info(app_instance: FastAPI) -> None:
    """挂载业务 API 根路径说明。"""

    @app_instance.get("/api")
    async def api_info() -> dict[str, str]:
        """API 根路径。"""
        return {
            "message": f"Welcome to {settings.app.name}",
            "version": settings.app.version,
        }


def _include_business_routes(app_instance: FastAPI) -> None:
    """挂载业务路由。"""
    app_instance.include_router(health_router, prefix="/api/system", tags=["system"])
    app_instance.include_router(dashboard_router, prefix="/api/system", tags=["system"])
    app_instance.include_router(auth_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(checkin_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(credit_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(
        subscription_router, prefix="/api/client", tags=["client"]
    )
    app_instance.include_router(order_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(mark_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(maps_router, prefix="/api/client", tags=["client"])
    app_instance.include_router(credits_asset_router)
    app_instance.include_router(
        callback_router, prefix="/api/callback", tags=["callback"]
    )
    app_instance.include_router(
        telegram_callback_router, prefix="/api/callback", tags=["callback"]
    )
    app_instance.include_router(
        paypal_callback_router, prefix="/api/callback", tags=["callback"]
    )
    app_instance.include_router(
        clink_callback_router, prefix="/api/callback", tags=["callback"]
    )
    app_instance.include_router(admin_auth_router, prefix="/api/admin", tags=["admin"])
    app_instance.include_router(
        admin_dashboard_router, prefix="/api/admin", tags=["admin"]
    )
    app_instance.include_router(
        admin_order_analytics_router, prefix="/api/admin", tags=["admin"]
    )
    app_instance.include_router(
        admin_orders_router, prefix="/api/admin", tags=["admin"]
    )
    app_instance.include_router(admin_users_router, prefix="/api/admin", tags=["admin"])
    app_instance.include_router(
        admin_system_settings_router, prefix="/api/admin", tags=["admin"]
    )
    app_instance.include_router(
        external_system_dashboard_router,
        prefix="/api/external",
        tags=["external"],
    )


def _docs_urls() -> tuple[str | None, str | None, str | None]:
    """返回 FastAPI 文档路由 URL。"""
    return settings.api.docs_url, settings.api.redoc_url, "/openapi.json"


def create_app() -> FastAPI:
    """创建 FastAPI 应用实例。"""
    docs_url, redoc_url, openapi_url = _docs_urls()
    app_instance = FastAPI(
        title=settings.api.title,
        description=settings.api.description,
        lifespan=_create_lifespan(),
        docs_url=docs_url,
        redoc_url=redoc_url,
        openapi_url=openapi_url,
    )
    _add_middlewares(app_instance)
    _add_exception_handlers(app_instance)
    _include_business_routes(app_instance)
    _include_api_info(app_instance)

    return app_instance


# 创建 FastAPI 应用
app = create_app()


def main_entry() -> None:
    """启动单进程 Uvicorn 服务。"""
    uvicorn.run(
        "app.main:app",
        host=settings.app.host,
        port=settings.app.port,
        reload=settings.app.debug,
        log_level=settings.logging.level.lower(),
        access_log=False,
        timeout_graceful_shutdown=GRACEFUL_SHUTDOWN_TIMEOUT_SECONDS,
    )


if __name__ == "__main__":
    main_entry()
