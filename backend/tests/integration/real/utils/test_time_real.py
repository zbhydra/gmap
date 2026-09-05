"""自然月时间工具 real 测试。

真实资源依赖：
- 无外部资源；add_natural_months 的账期口径直接决定订阅履约的到期时间。
"""

from datetime import datetime

import pytest

from app.utils.time import (
    add_natural_months,
    datetime_to_timestamp,
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
