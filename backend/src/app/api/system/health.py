"""系统健康检查路由：探测数据库连通性并返回服务状态。"""

from fastapi import APIRouter

from app.utils.logger import logger
from app.schemas.health_schema import HealthResponse
from app.core.database import check_db_connection

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    健康检查

    Returns:
        HealthResponse: 健康状态
    """
    try:
        # 检查数据库连接
        db_connected = await check_db_connection()

        if db_connected:
            return HealthResponse(msg="healthy")
        else:
            return HealthResponse(msg="unhealthy")

    except Exception as e:
        logger.error(f"Error during health check: {e}", exc_info=True)
        return HealthResponse(msg="unhealthy")
