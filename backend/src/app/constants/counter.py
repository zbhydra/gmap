"""MySQL 用户 Counter 的固定周期与生产注册表。"""

import enum
from dataclasses import dataclass


class CounterCycle(enum.IntEnum):
    """Counter 的固定累计周期。"""

    DAILY = 1
    MONTHLY = 2
    LIFETIME = 3


class CounterId(enum.IntEnum):
    """生产代码永久注册的 Counter ID。"""

    SUBSCRIPTION_REVIEW_REWARD_CLAIMED = 6001
    DEMO_DAILY = 9001
    DEMO_MONTHLY = 9002
    DEMO_LIFETIME = 9003


@dataclass(frozen=True, slots=True)
class CounterDefinition:
    """一个固定 Counter 的 ID 与累计周期定义。"""

    counter_id: int
    cycle: CounterCycle


# 周期只能由生产注册表决定，调用方和数据库行均无权覆盖。
COUNTER_DEFINITIONS: dict[int, CounterDefinition] = {
    CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED: CounterDefinition(
        counter_id=CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED,
        cycle=CounterCycle.LIFETIME,
    ),
    CounterId.DEMO_DAILY: CounterDefinition(
        counter_id=CounterId.DEMO_DAILY,
        cycle=CounterCycle.DAILY,
    ),
    CounterId.DEMO_MONTHLY: CounterDefinition(
        counter_id=CounterId.DEMO_MONTHLY,
        cycle=CounterCycle.MONTHLY,
    ),
    CounterId.DEMO_LIFETIME: CounterDefinition(
        counter_id=CounterId.DEMO_LIFETIME,
        cycle=CounterCycle.LIFETIME,
    ),
}


def get_counter_definition(counter_id: int) -> CounterDefinition:
    """按生产 Counter ID 返回固定定义，未知 ID 直接抛出 ``KeyError``。"""

    return COUNTER_DEFINITIONS[counter_id]
