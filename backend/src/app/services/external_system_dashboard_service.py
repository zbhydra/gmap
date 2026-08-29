"""外部系统统计大盘服务。

服务聚合业务数据库统计（注册 / 付费订单）。API Key 只在业务服务器鉴权。
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
import time
from typing import cast
from zoneinfo import ZoneInfo

from sqlalchemy import case, func, select

from app.constants.order import CallbackStatus, OrderStatus
from app.core.database import get_async_session
from app.models.order_model import OrderModel
from app.models.system_data_model import JsonValue
from app.models.user_model import UserModel
from app.utils.logger import logger
from app.utils.money import format_normalized_amount

_ADMIN_OPERATION_TIMEZONE = ZoneInfo("Asia/Shanghai")
JsonObject = dict[str, JsonValue]


@dataclass(frozen=True, slots=True)
class ExternalCurrencyAmount:
    """外部大盘按币种聚合的金额。"""

    #: 币种。
    currency: str
    #: 6 位精度整数金额。
    amount: int
    #: 十进制展示金额字符串。
    display_amount: str


@dataclass(frozen=True, slots=True)
class ExternalPaidOrderStats:
    """外部大盘今日付费订单统计。"""

    #: 今日付费订单总额，按币种分组。
    amounts: list[ExternalCurrencyAmount]
    #: 今日履约失败订单数。
    fulfillment_failed_count: int
    #: 今日履约失败订单金额，按币种分组。
    fulfillment_failed_amounts: list[ExternalCurrencyAmount]


@dataclass(frozen=True, slots=True)
class ExternalSystemDashboard:
    """外部系统统计大盘。"""

    #: 今日注册人数。
    today_registered_count: int
    #: 今日付费订单总额，按币种分组；包含所有商品类别，包含履约成功与失败。
    today_paid_order_amounts: list[ExternalCurrencyAmount]
    #: 兼容旧调用方的字段，值同 today_paid_order_amounts。
    today_recharge_amounts: list[ExternalCurrencyAmount]
    #: 今日履约失败订单数。
    today_fulfillment_failed_count: int
    #: 今日履约失败订单金额，按币种分组。
    today_fulfillment_failed_amounts: list[ExternalCurrencyAmount]


class ExternalSystemDashboardService:
    """外部系统统计大盘服务。"""

    async def get_dashboard(self) -> ExternalSystemDashboard:
        """获取外部系统统计大盘。"""
        total_started_at = time.perf_counter()
        today_start_ms, tomorrow_start_ms = self._today_range_ms()

        stage_started_at = time.perf_counter()
        today_registered_count = await self._count_today_registered_users(
            today_start_ms=today_start_ms,
            tomorrow_start_ms=tomorrow_start_ms,
        )
        logger.warning(
            "external_dashboard_stage_timing: stage=today_registered "
            f"duration_ms={(time.perf_counter() - stage_started_at) * 1000:.2f}"
        )

        stage_started_at = time.perf_counter()
        paid_order_stats = await self._load_today_paid_order_stats(
            today_start_ms=today_start_ms,
            tomorrow_start_ms=tomorrow_start_ms,
        )
        logger.warning(
            "external_dashboard_stage_timing: stage=today_paid_orders "
            f"duration_ms={(time.perf_counter() - stage_started_at) * 1000:.2f}"
        )

        result = ExternalSystemDashboard(
            today_registered_count=today_registered_count,
            today_paid_order_amounts=paid_order_stats.amounts,
            today_recharge_amounts=paid_order_stats.amounts,
            today_fulfillment_failed_count=paid_order_stats.fulfillment_failed_count,
            today_fulfillment_failed_amounts=(
                paid_order_stats.fulfillment_failed_amounts
            ),
        )
        logger.warning(
            "external_dashboard_stage_timing: stage=service_total "
            f"duration_ms={(time.perf_counter() - total_started_at) * 1000:.2f}"
        )
        return result

    def _now_admin_operation(self) -> datetime:
        """返回运营统计使用的当前 +8 时区时间，方便测试覆盖。"""
        return datetime.now(_ADMIN_OPERATION_TIMEZONE)

    def _today_range_ms(self) -> tuple[int, int]:
        """返回运营统计 UTC+8 今日起止毫秒时间戳。"""
        today_start = self._now_admin_operation().replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        tomorrow_start = today_start + timedelta(days=1)
        return int(today_start.timestamp() * 1000), int(
            tomorrow_start.timestamp() * 1000
        )

    async def _count_today_registered_users(
        self,
        *,
        today_start_ms: int,
        tomorrow_start_ms: int,
    ) -> int:
        """统计运营时区今日未注销注册用户数。"""
        async with get_async_session() as db:
            result = await db.execute(
                select(func.count())
                .select_from(UserModel)
                .where(
                    UserModel.is_del.is_(False),
                    UserModel.created_at >= today_start_ms,
                    UserModel.created_at < tomorrow_start_ms,
                )
            )
            return int(result.scalar_one())

    async def _load_today_paid_order_stats(
        self,
        *,
        today_start_ms: int,
        tomorrow_start_ms: int,
    ) -> ExternalPaidOrderStats:
        """按运营时区今日统计所有已支付订单金额及履约失败情况。"""
        failed_amount_expr = case(
            (
                OrderModel.callback_status == CallbackStatus.FAILED.value,
                OrderModel.amount,
            ),
            else_=0,
        )
        failed_count_expr = case(
            (
                OrderModel.callback_status == CallbackStatus.FAILED.value,
                1,
            ),
            else_=0,
        )
        async with get_async_session() as db:
            result = await db.execute(
                select(
                    OrderModel.currency,
                    func.coalesce(func.sum(OrderModel.amount), 0),
                    func.coalesce(func.sum(failed_count_expr), 0),
                    func.coalesce(func.sum(failed_amount_expr), 0),
                )
                .where(
                    OrderModel.order_status == OrderStatus.PAID.value,
                    OrderModel.callback_status.in_(
                        [
                            CallbackStatus.SUCCESS.value,
                            CallbackStatus.FAILED.value,
                        ]
                    ),
                    OrderModel.paid_at >= today_start_ms,
                    OrderModel.paid_at < tomorrow_start_ms,
                )
                .group_by(OrderModel.currency)
                .order_by(OrderModel.currency.asc())
            )
            rows = list(result.all())

        amounts: list[ExternalCurrencyAmount] = []
        failed_amounts: list[ExternalCurrencyAmount] = []
        failed_count_total = 0
        for currency, amount, failed_count, failed_amount in rows:
            amount_int = int(amount or 0)
            failed_count_int = int(failed_count or 0)
            failed_amount_int = int(failed_amount or 0)
            currency_code = str(currency)
            amounts.append(self._currency_amount(currency_code, amount_int))
            failed_count_total += failed_count_int
            if failed_count_int > 0:
                failed_amounts.append(
                    self._currency_amount(currency_code, failed_amount_int)
                )
        return ExternalPaidOrderStats(
            amounts=amounts,
            fulfillment_failed_count=failed_count_total,
            fulfillment_failed_amounts=failed_amounts,
        )

    def _format_normalized_amount(self, amount: int) -> str:
        """把 6 位精度整数金额格式化为十进制字符串。"""
        return format_normalized_amount(amount)

    def _currency_amount(self, currency: str, amount: int) -> ExternalCurrencyAmount:
        """构造外部响应用金额对象。"""
        return ExternalCurrencyAmount(
            currency=currency,
            amount=amount,
            display_amount=self._format_normalized_amount(amount),
        )


external_system_dashboard_service = ExternalSystemDashboardService()
