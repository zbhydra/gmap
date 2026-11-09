"""Stripe snapshot 事件：收款走订单域，已付生效计划走订阅域。"""

from typing import cast

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.constants.payment import STRIPE_PAYMENT_METHOD
from app.services.order_service import order_service
from app.services.payment_service import payment_service
from app.services.subscription_service import subscription_service
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/stripe", tags=["stripe-callback"])


@router.post("/payment")
async def stripe_payment_callback(request: Request) -> JSONResponse:
    provider = await payment_service.get_provider_for_existing_payment(
        STRIPE_PAYMENT_METHOD
    )
    verified = await provider.verify_callback(request)
    if verified.subscription_state is not None:
        await subscription_service.sync_plan_from_channel(
            payment_method=STRIPE_PAYMENT_METHOD,
            channel_subscription_id=cast(
                str, (verified.provider_data or {})["stripe_subscription_id"]
            ),
            state=verified.subscription_state,
        )
    elif verified.processed:
        await order_service.handle_payment_callback(
            payment_method=STRIPE_PAYMENT_METHOD, callback=verified
        )
    return ResponseUtils.ok(
        {"processed": verified.processed or verified.subscription_state is not None}
    )
