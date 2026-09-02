"""统一用量计量常量（额度基建，000 域）。

用量模型分派：登录用户（user_id>0）走 MySQL 只插入流水
``user_usage_logs``（按月 SUM(delta)）；匿名设备（user_id=0）走 Redis 月度
计数（容忍丢失的防滥用计量，013 双窗口拍板）。决策依据见
``app/services/usage_service.py`` 模块注释与
``docs/feat/000.架构/tech-额度基建.md``（含旧 013 U7 Redis 单轨 key 的
不迁移说明）。
"""

from app.utils.time import get_current_ym

# 月度 Redis key 的兜底 TTL（秒）：跨月后按 ym 换新 key，旧 key 在该窗口内自然清理。
_USAGE_KEY_TTL_SECONDS = 45 * 24 * 60 * 60

# 幂等键 TTL（秒）：覆盖调用方上报失败后的重试窗口。
_DEDUP_KEY_TTL_SECONDS = 7 * 24 * 60 * 60


def build_usage_key(product_line: str, identity: str) -> tuple[str, int]:
    """构建匿名月度用量业务子键，返回 ``(subkey, ym)``。

    仅业务语义段（无全局前缀）；service 层写入/读取前必须经
    ``build_redis_key()`` 包裹（spec-redis §2 禁止裸 key）。
    ym 为业务时区（America/New_York）当前自然月，天然表达月度窗口重置；
    登录用户不走该 key（MySQL 按行聚合），identity 仅匿名设备使用。
    """

    ym = get_current_ym()
    return f"usage:{product_line}:{ym}:{identity}", ym


def build_dedup_key(request_id: str) -> str:
    """构建匿名扣减幂等业务子键（无全局前缀，包裹规则同 ``build_usage_key``）。

    匿名幂等按请求键全局命中即可：匿名用量是容忍丢失的防滥用计量，
    且 request_id 由插件为每个采集会话生成的 UUID，跨设备碰撞可忽略。
    """

    return f"usage:dedup:{request_id}"


def usage_key_ttl_seconds() -> int:
    """返回月度用量 key 的兜底 TTL。"""

    return _USAGE_KEY_TTL_SECONDS


def dedup_key_ttl_seconds() -> int:
    """返回幂等键 TTL。"""

    return _DEDUP_KEY_TTL_SECONDS


def format_period(ym: int) -> str:
    """把 YYYYMM 整数格式化为竞品同构的 ``YYYY-MM`` 周期文本。"""

    return f"{ym // 100:04d}-{ym % 100:02d}"
