"""测试用支付回调路由：模拟支付网关回调以联调订单流程，禁止在生产使用。"""

from app.schemas.callback_schema import TestPayCallBack
from app.utils.logger import logger
from fastapi import APIRouter

router = APIRouter(prefix="/callback", tags=["回调管理"])


@router.post("/test-the-test-bank-callback")
async def test_pay_callback(data: TestPayCallBack):
    """
    测试支付回调

    """
    logger.info(f"Test pay callback: {data}")

    return None
