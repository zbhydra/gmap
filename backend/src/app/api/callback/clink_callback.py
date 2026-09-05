"""ClinkBill 支付 Webhook 路由。"""

import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.constants.payment import CLINK_PAYMENT_METHOD
from app.provider.payment.clink import (
    CLINK_ORDER_SUCCEEDED_EVENT,
    CLINK_SUBSCRIPTION_PLAN_CHANGED_EVENT,
)
from app.services.order_service import order_service
from app.services.payment_service import payment_service
from app.services.subscription_service import subscription_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/clink", tags=["clink-callback"])
_CLINK_PAYMENT_LOG_DIR = Path("log") / "payment" / "clink"
_SENSITIVE_CLINK_HEADERS = {"authorization", "x-clink-signature"}


@router.post("/payment")
async def clink_payment_callback(request: Request) -> JSONResponse:
    """验签 ClinkBill Webhook，并把支付成功事件交给统一订单服务。"""

    body = await request.body()
    _write_raw_callback_log(request, body)
    provider = await payment_service.get_provider_for_existing_payment(
        CLINK_PAYMENT_METHOD
    )
    verified = await provider.verify_callback(request)

    if verified.event == CLINK_SUBSCRIPTION_PLAN_CHANGED_EVENT:
        # 计划变更事件不进订单履约：按渠道订阅 ID 查当前价格并收敛本地档位。
        subscription_id = (verified.provider_data or {}).get("clink_subscription_id")
        if not isinstance(subscription_id, str) or not subscription_id:
            raise ValueError(
                "clink_payment_callback: plan_changed subscription id missing: "
                f"provider_data={verified.provider_data!r}"
            )
        synced = await subscription_service.sync_plan_from_channel(
            payment_method=CLINK_PAYMENT_METHOD,
            channel_subscription_id=subscription_id,
        )
        return ResponseUtils.ok(
            {
                "processed": True,
                "event": verified.event,
                "subscription_id": subscription_id,
                "synced": synced,
            }
        )

    # 仅未支持的已验签事件早退（确认接收）；processed 的支付成功事件继续走订单回调。
    if verified.event != CLINK_ORDER_SUCCEEDED_EVENT and not verified.processed:
        data: dict[str, object] = {
            "processed": False,
            "event": verified.event,
        }
        reason = (verified.provider_data or {}).get("reason")
        if isinstance(reason, str):
            data["reason"] = reason
        return ResponseUtils.ok(data)

    if verified.processed:
        result = await order_service.handle_payment_callback(
            payment_method=CLINK_PAYMENT_METHOD,
            callback=verified,
        )

    # 官方 Order Webhook 合同：所有已验证 order.succeeded 都以 account 事件应答。
    # 本地下单要求登录，订单用户必然已存在，固定 account.reloaded；
    # 重复事件同样回传原始核对数据，幂等由订单 CAS 收敛。
    if verified.event == CLINK_ORDER_SUCCEEDED_EVENT:
        provider_data = verified.provider_data or {}
        return JSONResponse(
            {
                "object": "event",
                "type": "account.reloaded",
                "data": {
                    "customerEmail": provider_data["clink_customer_email"],
                    "webSite": settings.app.public_website_base_url,
                    "userId": provider_data["clink_user_id"],
                    "amount": provider_data["clink_amount_total"],
                    "currency": provider_data["clink_currency"],
                },
            }
        )

    # invoice.paid 履约后返回项目统一成功 envelope。
    return ResponseUtils.ok(
        {
            "processed": True,
            "event": verified.event,
            "order_no": result.order_no,
            "idempotent": result.idempotent,
        }
    )


def _write_raw_callback_log(request: Request, body: bytes) -> None:
    """第一时间记录 ClinkBill payment webhook 原始请求。"""

    log_dir = Path(settings.root_path) / _CLINK_PAYMENT_LOG_DIR
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"{datetime.now().strftime('%Y-%m-%d')}.log"
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in _SENSITIVE_CLINK_HEADERS
    }
    entry = {
        "received_at": datetime.now().isoformat(timespec="milliseconds"),
        "path": request.url.path,
        "headers": headers,
        "body": body.decode("utf-8", errors="replace"),
    }
    with log_file.open("a", encoding="utf-8") as file:
        file.write(json.dumps(entry, ensure_ascii=False, separators=(",", ":")))
        file.write("\n")
