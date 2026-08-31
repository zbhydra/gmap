"""Maps Extractor 月度配额常量（013 A11，U7）。

配额模型采用 Redis 月度计数（零新表），决策依据见
``app/services/maps_usage_service.py`` 模块注释。
"""

from app.utils.time import get_current_ym

# config_public 中 Maps 免费月度配额的键（运营可调，缺省用 DEFAULT_FREE_QUOTA）。
MAPS_QUOTA_CONFIG_KEY = "maps_quota"

# 免费档默认月度记录数配额（竞品口径 free 1000 records/月）。
DEFAULT_FREE_QUOTA = 1000

# 月度 Redis key 的兜底 TTL（秒）：跨月后按 ym 换新 key，旧 key 在该窗口内自然清理。
_USAGE_KEY_TTL_SECONDS = 45 * 24 * 60 * 60

# 幂等键 TTL（秒）：覆盖插件上报失败后的重试窗口。
_DEDUP_KEY_TTL_SECONDS = 7 * 24 * 60 * 60


def build_usage_key(identity: str) -> tuple[str, int]:
    """构建月度用量业务子键，返回 ``(subkey, ym)``。

    仅业务语义段（无全局前缀）；service 层写入/读取前必须经
    ``build_redis_key()`` 包裹（spec-redis §2 禁止裸 key）。
    ym 为业务时区（America/New_York）当前自然月，天然表达月度窗口重置。
    """

    ym = get_current_ym()
    return f"maps:usage:{ym}:{identity}", ym


def build_dedup_key(request_id: str) -> str:
    """构建采集会话幂等业务子键（无全局前缀，包裹规则同 ``build_usage_key``）。"""

    return f"maps:usage:dedup:{request_id}"


def usage_key_ttl_seconds() -> int:
    """返回月度用量 key 的兜底 TTL。"""

    return _USAGE_KEY_TTL_SECONDS


def dedup_key_ttl_seconds() -> int:
    """返回幂等键 TTL。"""

    return _DEDUP_KEY_TTL_SECONDS


def format_period(ym: int) -> str:
    """把 YYYYMM 整数格式化为竞品同构的 ``YYYY-MM`` 周期文本。"""

    return f"{ym // 100:04d}-{ym % 100:02d}"
