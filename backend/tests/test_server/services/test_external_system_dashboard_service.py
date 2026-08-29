"""外部系统大盘服务测试。"""

from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from app.services.external_system_dashboard_service import (
    ExternalPaidOrderStats,
    external_system_dashboard_service,
)


def test_format_normalized_amount_returns_decimal_string() -> None:
    """6 位精度整数金额转十进制字符串。"""
    assert external_system_dashboard_service._format_normalized_amount(0) == "0"
    assert (
        external_system_dashboard_service._format_normalized_amount(12_345_678)
        == "12.345678"
    )
    assert (
        external_system_dashboard_service._format_normalized_amount(15_300_000)
        == "15.3"
    )


def test_today_range_ms_uses_admin_utc_plus_8_timezone(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """外部运营大盘今日边界必须按 UTC+8 自然日计算。"""
    fixed_now = datetime(2026, 6, 28, 12, 30, tzinfo=ZoneInfo("Asia/Shanghai"))
    expected_start = int(
        datetime(2026, 6, 28, 0, 0, tzinfo=ZoneInfo("Asia/Shanghai")).timestamp() * 1000
    )
    expected_tomorrow = int(
        datetime(2026, 6, 29, 0, 0, tzinfo=ZoneInfo("Asia/Shanghai")).timestamp() * 1000
    )
    monkeypatch.setattr(
        external_system_dashboard_service,
        "_now_admin_operation",
        lambda: fixed_now,
    )

    assert external_system_dashboard_service._today_range_ms() == (
        expected_start,
        expected_tomorrow,
    )


@pytest.mark.asyncio
async def test_get_dashboard_uses_admin_utc_plus_8_range_for_today_statistics(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """外部 API 今日注册和充值统计共用 UTC+8 今日窗口。"""
    fixed_now = datetime(2026, 6, 28, 12, 30, tzinfo=ZoneInfo("Asia/Shanghai"))
    expected_start = int(
        datetime(2026, 6, 28, 0, 0, tzinfo=ZoneInfo("Asia/Shanghai")).timestamp() * 1000
    )
    expected_tomorrow = int(
        datetime(2026, 6, 29, 0, 0, tzinfo=ZoneInfo("Asia/Shanghai")).timestamp() * 1000
    )
    received_ranges: list[tuple[int, int]] = []

    async def count_today_registered_users(
        *,
        today_start_ms: int,
        tomorrow_start_ms: int,
    ) -> int:
        received_ranges.append((today_start_ms, tomorrow_start_ms))
        return 7

    async def load_today_paid_order_stats(
        *,
        today_start_ms: int,
        tomorrow_start_ms: int,
    ) -> ExternalPaidOrderStats:
        received_ranges.append((today_start_ms, tomorrow_start_ms))
        return ExternalPaidOrderStats(
            amounts=[],
            fulfillment_failed_count=0,
            fulfillment_failed_amounts=[],
        )

    monkeypatch.setattr(
        external_system_dashboard_service,
        "_now_admin_operation",
        lambda: fixed_now,
    )
    monkeypatch.setattr(
        external_system_dashboard_service,
        "_count_today_registered_users",
        count_today_registered_users,
    )
    monkeypatch.setattr(
        external_system_dashboard_service,
        "_load_today_paid_order_stats",
        load_today_paid_order_stats,
    )
    with caplog.at_level("WARNING", logger="server"):
        dashboard = await external_system_dashboard_service.get_dashboard()

    assert dashboard.today_registered_count == 7
    assert received_ranges == [
        (expected_start, expected_tomorrow),
        (expected_start, expected_tomorrow),
    ]
    assert dashboard.today_paid_order_amounts == []
    assert dashboard.today_recharge_amounts == []
    assert dashboard.today_fulfillment_failed_count == 0
    assert dashboard.today_fulfillment_failed_amounts == []
    assert "external_dashboard_stage_timing: stage=today_registered" in caplog.text
    assert "external_dashboard_stage_timing: stage=today_paid_orders" in caplog.text
    assert "external_dashboard_stage_timing: stage=service_total" in caplog.text
