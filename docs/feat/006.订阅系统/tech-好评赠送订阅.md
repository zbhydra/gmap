# 006 · 好评赠送订阅

> 技术规格。定义领取资格、永久 Counter、Redis 短锁、订阅加时与客户端接口。Pricing 交互见 `@../011.Pricing页/tech-好评赠送.md`。
> 实现状态:2026-09-02 活动下线——前端字段删除、claim 路由直接返回 INVALID_REQUEST、checkout-configs 活动字段固定关闭态;本文件描述的 service 与锁逻辑代码全部保留,重启活动时恢复路由调用即可。

## 1. 目标与边界

为登录账号提供一次 7 天 Unlimited 赠送。系统只用 30 秒前端等待降低直接点击领取的概率,不验证 Chrome Web Store 评价、商店账号或评价内容。

不新增活动表、订单、补偿任务、对账、锁续租、版本号、session token 或依赖注入。Extension 不参与该流程。

## 2. 唯一方案与已放弃方案

采用“`config_public` 活动开关 + 现有 checkout 配置返回开关与领取次数 + 独立领取接口 + 永久 Counter + 账号级 Redis 短锁 + 订阅统一加时”。

不采用:

- 独立领取状态 GET:领取次数已经随订阅购买配置加载,避免第二次状态请求。
- 把活动字段写入 `auth/me`:账号摘要不应长期绑定一次性增长活动。
- 新活动表或领取流水:永久 Counter 已能表达每账号领取次数。
- MySQL 行锁或跨库事务:该活动允许部分失败,不扩大事务边界。
- 前端凭证或后端倒计时:不验证等待过程,不建立可伪装的安全协议。

## 3. 活动开关

公共配置使用以下结构:

```text
c_key = subscription_review_reward
g_value = true
```

初始化配置:

```sql
INSERT IGNORE INTO config_public (c_key, g_value)
VALUES ('subscription_review_reward', 'true');
```

运营关闭活动时把值改为 JSON 布尔值 `false`;重新开放时改回 `true`。只有值严格等于 JSON 布尔值 `true` 才开启活动,其余值统一按关闭处理。数据库读取失败由请求统一失败。

`config_public_service` 内存缓存 TTL 为 180 秒。修改后可以在管理后台“系统设置 → 刷新配置缓存”重载当前业务进程;多进程或多实例需要逐实例刷新或等待 TTL 到期。

## 4. 永久 Counter

在 MySQL Counter 注册表增加:

```text
CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED = 6001
cycle = LIFETIME
```

`counter_user_lifetime` 现有唯一键 `(user_id, counter_id)` 覆盖读取和 upsert,不增加索引或 Model。领取次数只增不减,不提供运营重置入口。

## 5. 接口合同

### 5.1 获取订阅购买配置

```text
GET /api/client/subscription/checkout-configs
```

接口改为可选鉴权,响应 `data` 顶层增加:

| 字段 | 类型 | 语义 |
| --- | --- | --- |
| `checkout_configs` | array | 现有 Unlimited 购买配置 |
| `review_reward_enabled` | bool | 当前好评赠送活动是否开放 |
| `review_reward_claimed_count` | int | 登录账号的永久领取次数;匿名固定为 `0` |

缺少、过期或无效登录态按匿名公开配置处理,不阻断商品展示。活动关闭时不读取账号 Counter,领取次数固定返回 `0`;活动开启时读取 Counter 失败则整个配置请求失败,沿用 Pricing 配置失败行为。

### 5.2 领取赠送

```text
POST /api/client/subscription/review-reward/claim
```

要求有效登录态,无请求体。成功响应 `data`:

| 字段 | 类型 | 语义 |
| --- | --- | --- |
| `result` | `granted` \| `already_claimed` | 本次成功加时或此前已领取 |
| `review_reward_claimed_count` | int | 当前永久领取次数 |

`already_claimed` 是成功结果,不返回业务错误,不修改 Counter 或订阅。

Redis 锁不可用或 1 秒内抢不到锁返回 `SUBSCRIPTION_REVIEW_REWARD_BUSY = 26001`。活动关闭、配置缺失或非法时复用通用 `INVALID_REQUEST`,不增加活动专用错误码。

数据库读写失败由统一异常处理中间件返回服务端错误,不在业务层吞掉。

## 6. 领取流程

```text
鉴权
  -> 读取活动开关
  -> 开关关闭:返回 INVALID_REQUEST
  -> 获取账号级 Redis 锁
  -> 读取永久领取次数
  -> 次数 > 0: 返回 already_claimed
  -> Counter +1 并提交
  -> 订阅 +7 天并单独提交
  -> 返回 granted 与领取次数
  -> finally 释放锁
```

订阅加时规则复用统一到期时间算法:

- 当前 `expires_at > now`:新到期时间为原 `expires_at + 7 天`。
- 无记录、已过期或到期时间为空:新到期时间为 `now + 7 天`。
- 用 MySQL upsert 在数据库表达式内计算,避免普通读改写覆盖并发的支付续期。

订阅 service 抽出可复用的“按天数延长权益”原子能力。支付订单履约和好评赠送都调用同一算法;好评场景自行开启并提交 session,支付履约继续使用订单 service 已持有的 session。

跨 Counter、Redis 锁和订阅的活动编排放在独立 `SubscriptionReviewRewardService`。模块底部暴露单例,内部直接引用 `counter_service`、`subscription_service` 与模块级 `RedisLock`,不使用构造器依赖注入。`SubscriptionService` 只保留订阅读取和加时原子能力,API 只处理鉴权与响应。

## 7. Redis 锁

使用现有 `RedisLock`,不手写 `SET NX`:

| 项 | 值 |
| --- | --- |
| 业务 key | `subscription_review_reward:{user_id}` |
| 最终前缀 | 由 `RedisLock` 与 `build_redis_key` 统一生成 |
| TTL | 5 秒 |
| 获取超时 | 1 秒 |
| 释放 | 正常或异常结束时校验 owner 后释放 |
| 续租 | 无 |
| 降级 | fail-closed,返回 `SUBSCRIPTION_REVIEW_REWARD_BUSY` |

5 秒内未完成视为慢请求异常。锁到期后允许下一次请求重试;不增加心跳或租约协议。

该短锁只收敛正常请求并发,不是绝对幂等协议。若临界区异常超过 5 秒且后续请求在首个 Counter 提交前进入,仍可能重复增加 Counter 和订阅;接受该极低概率风险。

## 8. 事务与失败语义

Counter 和订阅使用两个独立 MySQL 事务,顺序固定为 Counter 后订阅:

| 失败位置 | 结果 |
| --- | --- |
| 活动关闭、配置缺失或非法 | 无 Counter、订阅或 Redis 写入,返回请求无效 |
| 锁获取失败 | 无数据库写入,返回服务器繁忙 |
| Counter 读取失败 | 无数据库写入,请求失败 |
| Counter 写入失败 | 订阅不加时,请求失败 |
| Counter 已提交、订阅加时失败 | Counter 保留为已领取,请求失败,不补偿 |
| 客户端未收到成功响应 | 后续重试按 Counter 结果返回 `already_claimed` |

明确接受“Counter 已领取但未获得 7 天”的小概率部分失败。不回滚 Counter,不自动或人工补发,不建立恢复任务。

## 9. 文件责任

```text
backend/src/app/constants/counter.py                    # 注册永久业务 Counter
backend/src/app/i18n/common_code.py                     # 服务器繁忙错误码
backend/src/app/schemas/subscription_schema.py          # 配置与领取响应合同
backend/src/app/api/client/subscription_client.py       # 可选鉴权配置与领取端点
backend/src/app/services/subscription_service.py        # 统一订阅加时原子能力
backend/src/app/services/subscription_review_reward_service.py # 锁与跨 service 编排
backend/tests/integration/real/api/client/              # MySQL + Redis 真实 API 流程
```

不新增 Model、schema migration 或第三方依赖。`config_public` 只新增一条人工维护的活动配置,业务代码和测试不写配置表。

## 10. 测试与验收

后端只写真实 MySQL + Redis 测试,不 mock service、数据库、Redis 或鉴权:

- 匿名配置返回活动开关和领取次数 `0`,商品配置保持可用。
- 已登录未领取账号返回 `0`;已有永久 Counter 返回真实次数。
- 活动关闭时配置接口返回 `review_reward_enabled=false`;人工验证领取接口不写 Counter、订阅或 Redis 锁,不为配置表开关增加写库测试。
- 首次领取写入 Counter `1`,无订阅时从当前时间增加约 7 天。
- 有效订阅首次领取从原到期时间精确增加 7 天。
- 重复领取返回 `already_claimed`,Counter 和到期时间不变。
- 两个并发领取只有一个 `granted`,另一个为 `already_claimed` 或服务器繁忙,最终只增加 7 天。
- 正常 5 秒临界区内的并发只增加 7 天;测试不构造或承诺超过 TTL 的绝对幂等。
- 预占同账号锁后领取返回 `SUBSCRIPTION_REVIEW_REWARD_BUSY`,数据库无副作用。
- 无登录态调用领取接口被拒绝。
- 测试数据使用唯一 `test_run_id`,结束后清理 Counter、订阅与用户数据。

索引不变,因此不执行 schema sync。交付验证包含 Black、Ruff、限定范围 mypy、real health smoke、目标 real 测试、real collect-only 与 Backend business 启动。
