"""业务时区时间工具 real 测试。

真实资源依赖：
- 无外部资源；add_natural_months 的账期口径直接决定订阅履约的到期时间。
"""

from datetime import datetime

import pytest

from app.utils import time as business_time
from app.utils.time import (
    add_natural_months,
    datetime_to_timestamp,
    get_day_start_timestamp,
    get_tomorrow_start_timestamp,
    system_timezone,
    timestamp_to_datetime,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@pytest.mark.parametrize(
    ("source", "months", "expected"),
    [
        ((2025, 1, 31), 1, (2025, 2, 28)),
        ((2024, 11, 30), 3, (2025, 2, 28)),
        ((2024, 2, 29), 12, (2025, 2, 28)),
    ],
)
def test_real_add_natural_months_clamps_to_month_end(
    source: tuple[int, int, int], months: int, expected: tuple[int, int, int]
) -> None:
    """自然月续期在目标日期不存在时取目标月末。"""

    source_dt = datetime(*source, 12, tzinfo=system_timezone())
    result = timestamp_to_datetime(
        add_natural_months(datetime_to_timestamp(source_dt), months)
    )
    assert (result.year, result.month, result.day, result.hour) == (*expected, 12)


@pytest.mark.parametrize(
    ("day", "next_day", "hours"),
    [("2030-03-10", "2030-03-11", 23), ("2030-11-03", "2030-11-04", 25)],
)
def test_real_new_york_next_midnight_follows_dst(
    day: str, next_day: str, hours: int, monkeypatch: pytest.MonkeyPatch
) -> None:
    current = timestamp_to_datetime(get_day_start_timestamp(day))
    monkeypatch.setattr(business_time, "timestamp_now_datetime", lambda: current)
    reset_at = get_tomorrow_start_timestamp()
    assert reset_at == get_day_start_timestamp(next_day)
    assert reset_at - get_day_start_timestamp(day) == hours * 60 * 60 * 1000
