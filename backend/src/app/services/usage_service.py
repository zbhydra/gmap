"""统一用量计量服务（额度基建，000 域）——三产品线共用门面。

配额模型决策（为什么不是 005 计数器 / 003 积分 / 纯 Redis）：
- 005 ``counter_user_*`` 唯一键只有 user 维度，装不下「产品线 × 幂等请求键」，
  且 Counter 是「只增」合同，无法表达 refund 的负 delta 修正；
- 003 积分是「余额-流水、永不过期、购买/赠送」模型，与「月度窗口重置的
  防滥用计量」语义不同，且同样只按 user_id 归属；
- 登录用户用量改为 MySQL 只插入流水 ``user_usage_logs``：used = 按月
  SUM(delta)，幂等由唯一键 (product_line, user_id, request_id) 承担，
  可审计、可退回（云端 014 预扣-结算需要 refund 语义）；
- 匿名设备（user_id=0）维持 Redis 月度计数（013 双窗口拍板：匿名按
  device_id 归属、容忍丢失的防滥用计量），扣减与幂等组成单 Lua 脚本原子执行。

total 单一真源：``get_user_subscription_config`` 返回档位的 metadata
``monthly_quota``（付费档或本线 free 档）。行缺失或 ``monthly_quota`` 为空
即配置合同破裂，抛 ``PAYMENT_GATEWAY_ERROR``——不再回退 config_public /
默认值兜底（少给不超给让配置错误静默化）。

故障策略（spec-redis §7，正确性优先）：Redis / MySQL 故障时三原语均抛
``EXTENSION_USAGE_UNAVAILABLE``（fail-closed），不使用本地状态兜底放行——
插件侧对 usage 查询失败自行 fail-open（采集可用性优先），两侧语义互补。

Redis 重建/丢失的后果是匿名当月已用量清零 = 免费多给额度，属防滥用计量
而非资损，符合容错轴「局部可失败」；登录用量在 MySQL，不受影响。
"""

from typing import NamedTuple

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.constants.subscription import (
    MAPS_API_PRODUCT_LINE,
    MAPS_EXTENSION_PRODUCT_LINE,
    MAPS_ONLINE_PRODUCT_LINE,
    SubscriptionProductMetadata,
)
from app.constants.usage import (
    build_dedup_key,
    build_usage_key,
    dedup_key_ttl_seconds,
    format_period,
    usage_key_ttl_seconds,
)
from app.core.database import get_async_session
from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.models.user_usage_log_model import UserUsageLogModel
from app.services.subscription_service import subscription_service
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key
from app.utils.time import get_current_ym, timestamp_now

# 匿名扣减脚本（原子语义，spec-redis §5）：
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


class UsageSnapshot(NamedTuple):
    """一次用量读取的稳定结果。"""

    ym: int
    used: int
    total: int
    exhausted: bool


class UsageConsumeResult(NamedTuple):
    """一次扣减上报的稳定结果。"""

    ym: int
    used: int
    total: int
    exhausted: bool
    deducted: bool


class _BaseUsageService:
    """单一产品线的用量门面基类：子类只绑定 ``product_line`` 常量。

    存储分派按调用方身份：``user_id > 0`` 走 MySQL 只插入流水（匿名不进表），
    ``user_id = 0`` 走 Redis 月度计数（identity 必为 ``d:{device_id}``）。
    """

    product_line: str = ""

    async def get_usage(self, identity: str, *, user_id: int) -> UsageSnapshot:
        """读取归属者当月用量快照；未命中按零处理。"""

        try:
            total = await self._get_total(user_id)
            usage_subkey, ym = build_usage_key(self.product_line, identity)
            if user_id > 0:
                used = await self._sum_used(user_id, ym)
            else:
                used = await self._redis_used(usage_subkey)
        except AppCommonException:
            raise
        except Exception as exc:
            raise self._unavailable(
                "get_usage", identity=identity, user_id=user_id
            ) from exc

        return UsageSnapshot(ym=ym, used=used, total=total, exhausted=used >= total)

    async def consume(
        self, identity: str, *, user_id: int, records: int, request_id: str
    ) -> UsageConsumeResult:
        """按幂等键扣减当月用量，返回扣减后的最新快照。

        同一 ``request_id``（同线同用户）重复上报只扣一次——MySQL 路径由
        唯一键 ``uk_user_usage_logs_line_user_request`` 承担，重放命中时
        ``deducted=False``、used 原样；Redis 路径由 Lua 内幂等键承担。
        """

        try:
            total = await self._get_total(user_id)
            usage_subkey, ym = build_usage_key(self.product_line, identity)
            if user_id > 0:
                deducted = await self._insert_log(
                    user_id=user_id, ym=ym, delta=records, request_id=request_id
                )
                used = await self._sum_used(user_id, ym)
            else:
                applied, used = await self._redis_consume(
                    usage_subkey, records, request_id
                )
                deducted = applied == 1
        except AppCommonException:
            raise
        except Exception as exc:
            raise self._unavailable(
                "consume",
                identity=identity,
                user_id=user_id,
                records=records,
                request_id=request_id,
            ) from exc

        return UsageConsumeResult(
            ym=ym,
            used=used,
            total=total,
            exhausted=used >= total,
            deducted=deducted,
        )

    async def refund(
        self,
        *,
        user_id: int,
        records: int,
        request_id: str,
        target_ym: int | None = None,
    ) -> UsageSnapshot:
        """退回已消费用量（仅登录路径）：写 ``delta = -records`` 流水行。

        幂等键与 consume 同域（同线同用户同 request_id 命中即跳过），预扣-
        结算场景以 ``batchId`` / ``batchId:settle`` 区分两次写入。
        ``target_ym`` 默认当前月；跨月结算传原预扣行的 ym，让历史月 SUM
        自洽。返回退回后的**当月**快照（target_ym 指向历史月时不改变当月
        used）。不校验 SUM 非负——退回量由内部调用方保证，与
        CounterService.add 信任内部合同同口径。
        """

        if user_id <= 0:
            raise ValueError(
                "usage_service.refund: refund requires a logged-in user: "
                f"product_line={self.product_line}, user_id={user_id}, "
                f"records={records}, request_id={request_id}"
            )

        current_ym = get_current_ym()
        target = current_ym if target_ym is None else target_ym
        try:
            total = await self._get_total(user_id)
            await self._insert_log(
                user_id=user_id, ym=target, delta=-records, request_id=request_id
            )
            used = await self._sum_used(user_id, current_ym)
        except AppCommonException:
            raise
        except Exception as exc:
            raise self._unavailable(
                "refund", user_id=user_id, records=records, request_id=request_id
            ) from exc

        return UsageSnapshot(
            ym=current_ym, used=used, total=total, exhausted=used >= total
        )

    async def _get_total(self, user_id: int) -> int:
        """读取本产品线当月配额总量：所持档位（付费或 free）的 monthly_quota。

        匿名（user_id=0）走 get_user_subscription_config 既有分支返回本线
        free 档；行缺失由该函数抛 PAYMENT_GATEWAY_ERROR。
        """

        _, config = await subscription_service.get_user_subscription_config(
            user_id, self.product_line
        )
        metadata = SubscriptionProductMetadata.from_metadata(
            config.metadata,
            product_id=config.product_id,
        )
        if metadata.monthly_quota is None:
            # usage 三线商品行的 monthly_quota 必填（表合同），缺失即配置
            # 破裂——抛错暴露，不做少给/超给兜底。
            raise AppCommonException(
                CommonCode.PAYMENT_GATEWAY_ERROR,
                ext_msg=(
                    "usage_service._get_total: usage product missing monthly_quota: "
                    f"product_line={self.product_line}, "
                    f"product_id={config.product_id}"
                ),
            )
        return metadata.monthly_quota

    async def _sum_used(self, user_id: int, ym: int) -> int:
        """按覆盖索引聚合当月用量：SUM(delta)，无行时为 0。"""

        async with get_async_session() as db:
            result = await db.execute(
                select(func.coalesce(func.sum(UserUsageLogModel.delta), 0)).where(
                    UserUsageLogModel.product_line == self.product_line,
                    UserUsageLogModel.user_id == user_id,
                    UserUsageLogModel.ym == ym,
                )
            )
            return int(result.scalar_one())

    async def _insert_log(
        self, *, user_id: int, ym: int, delta: int, request_id: str
    ) -> bool:
        """插入一条用量流水；唯一键命中（幂等重放）返回 False。"""

        log = UserUsageLogModel(  # type: ignore[call-arg]
            product_line=self.product_line,
            user_id=user_id,
            ym=ym,
            delta=delta,
            request_id=request_id,
            created_at=timestamp_now(),
        )
        try:
            async with get_async_session() as db:
                db.add(log)
                await db.commit()
        except IntegrityError:
            # 唯一键 (product_line, user_id, request_id) 命中 = 同一请求的
            # 幂等重放，是正常业务路径而非故障，INFO 级避免稀释真实错误
            # 信号；回滚由 get_async_session 统一负责。
            logger.info(
                "usage_service._insert_log: 唯一键命中，按幂等重放跳过: "
                f"product_line={self.product_line}, user_id={user_id}, "
                f"ym={ym}, delta={delta}, request_id={request_id}"
            )
            return False
        return True

    async def _redis_used(self, usage_subkey: str) -> int:
        """读取匿名月度用量计数；未命中按零处理。"""

        redis = await redis_client.get_client()
        raw_used = await redis.get(build_redis_key(usage_subkey))
        return int(raw_used) if raw_used else 0

    async def _redis_consume(
        self, usage_subkey: str, records: int, request_id: str
    ) -> tuple[int, int]:
        """匿名扣减：Lua 原子执行「幂等检查 + 计数 + TTL」。"""

        redis = await redis_client.get_client()
        result = await redis.eval(  # type: ignore[misc]
            _CONSUME_SCRIPT,
            2,
            build_redis_key(usage_subkey),
            build_redis_key(build_dedup_key(request_id)),
            records,
            usage_key_ttl_seconds(),
            dedup_key_ttl_seconds(),
        )
        return int(result[0]), int(result[1])

    def _unavailable(self, action: str, **context: object) -> AppCommonException:
        """把 Redis/MySQL 故障映射为明确的业务错误码（fail-closed，可重试）。"""

        context_line = " ".join(f"{key}={value!r}" for key, value in context.items())
        logger.error(
            f"usage_service.{action}: 存储不可用，用量操作失败 "
            f"(product_line={self.product_line}): {context_line}",
            exc_info=True,
        )
        return AppCommonException(
            CommonCode.EXTENSION_USAGE_UNAVAILABLE,
            ext_msg=(
                f"usage_service.{action}: usage storage unavailable "
                f"(product_line={self.product_line}): {context_line}"
            ),
        )


class ExtensionUsageService(_BaseUsageService):
    """maps_extension 门面：插件采集 records/月（/maps/usage 两路由在用）。"""

    product_line = MAPS_EXTENSION_PRODUCT_LINE


class OnlineUsageService(_BaseUsageService):
    """maps_online 门面：云端采集 records/月（能力就绪，014 接线路由）。"""

    product_line = MAPS_ONLINE_PRODUCT_LINE


class ApiUsageService(_BaseUsageService):
    """maps_api 门面：API requests/月（能力就绪，014 接线路由）。"""

    product_line = MAPS_API_PRODUCT_LINE


extension_usage_service = ExtensionUsageService()
online_usage_service = OnlineUsageService()
api_usage_service = ApiUsageService()


def usage_identity(user_id: int, device_id: str | None) -> str:
    """推导用量归属键：登录用户按 user_id，匿名按已校验 device_id。"""

    if user_id > 0:
        return f"u:{user_id}"
    return f"d:{device_id}"


def usage_payload(
    snapshot: UsageSnapshot | UsageConsumeResult,
) -> dict[str, object]:
    """组装竞品同构的 usage 响应载荷（used/total/period/exhausted）。"""

    return {
        "used": snapshot.used,
        "total": snapshot.total,
        "period": format_period(snapshot.ym),
        "exhausted": snapshot.exhausted,
    }
