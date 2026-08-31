"""Maps Extractor 月度配额 Redis 服务（013 A11，U7）。

配额模型决策（为什么不是 005 计数器 / 003 积分 / 新建表）：
- 005 ``counter_user_monthly`` 唯一键是 ``(user_id, ym, counter_id)``，只有
  user 维度；A11 硬需求要求匿名按 ``device_id`` 归属，把 UUID 字符串映射进
  BigInteger user_id 属语义污染且有碰撞风险，不适配；
- 003 积分是「余额-流水、永不过期、购买/赠送」模型，与「月度窗口重置的
  防滥用计量」语义不同，且同样只按 user_id 归属；
- Redis 月度计数是本仓库既有惯例：spec-redis §2 已有「额度 quota:{type}:
  {u_id}:{YYYYMMDD}」key 形态先例，§5 把「额度校验+扣减」列为 Lua 原子性
  预期用例，§7 明确额度扣减 fail-closed 策略。零新表。

故障策略（spec-redis §7，正确性优先）：Redis 不可用时扣减与查询均抛
``MAPS_USAGE_UNAVAILABLE``（fail-closed），不使用本地状态兜底放行——插件侧
对 usage 查询失败自行 fail-open（采集可用性优先），两侧语义互补。

Redis 重建/丢失的后果是当月已用量清零 = 免费多给额度，属防滥用计量而非
资损，符合容错轴「局部可失败」；持久审计已有 mark_log/SLS 通道。

幂等：插件为每个采集会话生成 ``request_id``，与扣减组成单 Lua 脚本原子
执行——命中幂等键时不重复扣减，按已用量原样返回。
"""

from typing import NamedTuple

from app.constants.maps_usage import (
    DEFAULT_FREE_QUOTA,
    MAPS_QUOTA_CONFIG_KEY,
    build_dedup_key,
    build_usage_key,
    dedup_key_ttl_seconds,
    format_period,
    usage_key_ttl_seconds,
)
from app.constants.subscription import (
    MAPS_PRODUCT_LINE,
    SubscriptionProductMetadata,
)
from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.services.config_public_service import config_public_service
from app.services.subscription_service import subscription_service
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key

# 扣减脚本（原子语义，spec-redis §5）：
# KEYS[1] = 月度用量 key，KEYS[2] = 幂等键
# ARGV[1] = 本次扣减记录数，ARGV[2] = 用量 key 兜底 TTL，ARGV[3] = 幂等键 TTL
# 返回 [applied, used]：applied=1 表示本次实际扣减；0 表示幂等命中（used 原样）。
_CONSUME_SCRIPT = """
local applied = 0
if redis.call('EXISTS', KEYS[2]) == 0 then
    redis.call('SET', KEYS[2], '1', 'EX', tonumber(ARGV[3]))
    applied = 1
end
if applied == 1 then
    local used = redis.call('INCRBY', KEYS[1], tonumber(ARGV[1]))
    if used == tonumber(ARGV[1]) then
        redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
    end
    return {1, used}
end
local current = redis.call('GET', KEYS[1])
if current == false then
    current = 0
end
return {0, current}
"""


class MapsUsageSnapshot(NamedTuple):
    """一次用量读取的稳定结果。"""

    ym: int
    used: int
    total: int
    exhausted: bool


class MapsUsageConsumeResult(NamedTuple):
    """一次扣减上报的稳定结果。"""

    ym: int
    used: int
    total: int
    exhausted: bool
    deducted: bool


class MapsUsageService:
    """按「user_id 或 device_id 归属 + 业务时区自然月窗口」管理采集配额。

    额度映射（006 扩展）：登录用户持有未过期 Maps 订阅时，月度 total 从
    免费配额切到所购档位的 ``monthly_quota``；到期/退订/配置异常自动回退
    免费配额（读不到付费档 = 少给不超给，防滥用口径优先）。匿名设备恒免费档。
    """

    async def get_total(self, user_id: int) -> int:
        """读取归属用户当月配额总量：付费档 > 免费配置 > 兜底默认值。"""

        if user_id > 0:
            plan_quota = await self._get_plan_quota(user_id)
            if plan_quota is not None:
                return plan_quota
        return await self._get_free_quota()

    async def _get_plan_quota(self, user_id: int) -> int | None:
        """读取用户 Maps 订阅档位的月度额度；无有效订阅/配置异常返回 None。"""

        try:
            subscription, config = (
                await subscription_service.get_user_subscription_config(
                    user_id, MAPS_PRODUCT_LINE
                )
            )
            if subscription.expires_at is None:
                return None
            metadata = SubscriptionProductMetadata.from_metadata(
                config.metadata,
                product_id=config.product_id,
                period=config.period,
            )
            return metadata.monthly_quota
        except Exception as exc:
            # 付费档读取失败不放大为整体不可用：回退免费配额（fail-open 到免费，
            # 与 get_total 的免费配置口径一致），由日志暴露配置问题。
            logger.error(
                "maps_usage_service._get_plan_quota: Maps 订阅额度读取失败，"
                f"回退免费配额: user_id={user_id}, error={exc}",
                exc_info=True,
            )
            return None

    async def _get_free_quota(self) -> int:
        """读取免费月度配额总量；config_public 缺失或非法时回退默认值。"""

        try:
            raw_value = await config_public_service.get(MAPS_QUOTA_CONFIG_KEY)
        except Exception:
            # 配置读取失败不改变配额语义：按默认值放行（fail-open 到默认）。
            logger.error(
                "maps_usage_service._get_free_quota: config_public 读取失败，"
                f"回退默认配额 {DEFAULT_FREE_QUOTA}: c_key={MAPS_QUOTA_CONFIG_KEY}",
                exc_info=True,
            )
            return DEFAULT_FREE_QUOTA

        if (
            isinstance(raw_value, bool)
            or not isinstance(raw_value, int)
            or raw_value <= 0
        ):
            if raw_value is not None:
                logger.error(
                    "maps_usage_service._get_free_quota: 配置非法，回退默认配额"
                    f" {DEFAULT_FREE_QUOTA}: c_key={MAPS_QUOTA_CONFIG_KEY},"
                    f" raw_value={raw_value!r}"
                )
            return DEFAULT_FREE_QUOTA

        return raw_value

    async def get_usage(self, identity: str, *, user_id: int) -> MapsUsageSnapshot:
        """读取归属者当月用量快照；未命中按零处理。"""

        total = await self.get_total(user_id)
        # build_usage_key 返回业务子键，全局前缀统一在此处包裹（spec-redis §2）
        usage_subkey, ym = build_usage_key(identity)
        usage_key = build_redis_key(usage_subkey)
        try:
            redis = await redis_client.get_client()
            raw_used = await redis.get(usage_key)
        except Exception as exc:
            raise self._unavailable("get_usage", identity=identity) from exc

        used = int(raw_used) if raw_used else 0
        return MapsUsageSnapshot(ym=ym, used=used, total=total, exhausted=used >= total)

    async def consume(
        self, identity: str, *, user_id: int, records: int, request_id: str
    ) -> MapsUsageConsumeResult:
        """按幂等键原子扣减当月用量，返回扣减后的最新快照。

        同一 ``request_id`` 重复上报只扣一次（幂等命中时 ``deducted=False``，
        used 原样返回），供插件上报重试与批量恢复场景防重放。
        """

        total = await self.get_total(user_id)
        usage_subkey, ym = build_usage_key(identity)
        usage_key = build_redis_key(usage_subkey)
        dedup_key = build_redis_key(build_dedup_key(request_id))
        try:
            redis = await redis_client.get_client()
            result = await redis.eval(  # type: ignore[misc]
                _CONSUME_SCRIPT,
                2,
                usage_key,
                dedup_key,
                records,
                usage_key_ttl_seconds(),
                dedup_key_ttl_seconds(),
            )
        except Exception as exc:
            raise self._unavailable(
                "consume", identity=identity, records=records, request_id=request_id
            ) from exc

        applied, used = int(result[0]), int(result[1])
        return MapsUsageConsumeResult(
            ym=ym,
            used=used,
            total=total,
            exhausted=used >= total,
            deducted=applied == 1,
        )

    @staticmethod
    def _unavailable(action: str, **context: object) -> AppCommonException:
        """把 Redis 故障映射为明确的业务错误码（fail-closed，调用方可重试）。"""

        logger.error(
            f"maps_usage_service.{action}: Redis 不可用，配额操作失败: "
            + " ".join(f"{key}={value!r}" for key, value in context.items()),
            exc_info=True,
        )
        return AppCommonException(
            CommonCode.MAPS_USAGE_UNAVAILABLE,
            ext_msg=(
                f"maps_usage_service.{action}: redis unavailable, "
                + " ".join(f"{key}={value!r}" for key, value in context.items())
            ),
        )


def maps_usage_identity(user_id: int, device_id: str | None) -> str:
    """推导配额归属键：登录用户按 user_id，匿名按已校验 device_id。"""

    if user_id > 0:
        return f"u:{user_id}"
    return f"d:{device_id}"


def usage_payload(
    snapshot: MapsUsageSnapshot | MapsUsageConsumeResult,
) -> dict[str, object]:
    """组装竞品同构的 usage 响应载荷（used/total/period/exhausted）。"""

    return {
        "used": snapshot.used,
        "total": snapshot.total,
        "period": format_period(snapshot.ym),
        "exhausted": snapshot.exhausted,
    }


maps_usage_service = MapsUsageService()
