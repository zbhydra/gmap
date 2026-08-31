"""Telegram Bot webhook 回调入口。

职责仅限：落原始日志 → Provider 验签 → 交给 OrderService.handle_payment_callback。
续费派单、并发收敛、履约、购买成功消息全部由 OrderService + Provider 统一处理。
"""

import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Request

from app.core.config import settings
from app.provider.payment.tg_star import TELEGRAM_STARS_PAYMENT_METHOD
from app.services.order_service import order_service
from app.services.payment_service import payment_service
from app.utils.time import system_timezone
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/telegram", tags=["telegram-callback"])
_TELEGRAM_PAYMENT_LOG_DIR = Path("log") / "payment" / "telegram"
_SECRET_HEADER = "x-telegram-bot-api-secret-token"


@router.post("/payment")
async def telegram_payment_callback(
    request: Request,
):
    """处理 Telegram Bot webhook。

    当前支持 Telegram Stars 支付的 pre_checkout_query 与 successful_payment。
    """

    body = await request.body()
    _write_raw_callback_log(request, body)
    provider = await payment_service.get_provider(TELEGRAM_STARS_PAYMENT_METHOD)
    verified = await provider.verify_callback(request)
    if not verified.valid:
        return ResponseUtils.ok(
            {
                "processed": verified.processed,
                "event": verified.event,
                "order_no": verified.order_no,
                "payment_valid": False,
                "provider_data": verified.provider_data or {},
                "error_message": verified.error_message,
            }
        )

    result = await order_service.handle_payment_callback(
        payment_method=TELEGRAM_STARS_PAYMENT_METHOD,
        callback=verified,
    )
    return ResponseUtils.ok(
        {
            "processed": verified.processed,
            "event": verified.event,
            "order_no": result.order_no,
            "idempotent": result.idempotent,
        }
    )


def _write_raw_callback_log(request: Request, body: bytes) -> None:
    """第一时间记录 Telegram payment webhook 原始请求。"""

    log_dir = Path(settings.root_path) / _TELEGRAM_PAYMENT_LOG_DIR
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"{datetime.now(system_timezone()).strftime('%Y-%m-%d')}.log"
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() != _SECRET_HEADER
    }
    entry = {
        "received_at": datetime.now(system_timezone()).isoformat(
            timespec="milliseconds"
        ),
        "path": request.url.path,
        "headers": headers,
        "body": body.decode("utf-8", errors="replace"),
    }
    with log_file.open("a", encoding="utf-8") as file:
        file.write(json.dumps(entry, ensure_ascii=False, separators=(",", ":")))
        file.write("\n")
