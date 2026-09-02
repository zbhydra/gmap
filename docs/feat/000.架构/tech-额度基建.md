# 000 · 统一额度基建（usage 服务）

## 1. 目标与边界

为三条 MapsGrab 产品线提供一套共用的月度用量计量基础设施：谁在本月用了多少、扣减是否幂等、多扣能否退回。

- `maps_extension`：插件采集，单位 records/月（`/maps/usage` 两路由在用）。
- `maps_online`：云端采集，单位 records/月（能力就绪，014 接线路由）。
- `maps_api`：API 调用，单位 requests/月（能力就绪，014 接线路由）。

本模块只回答「某归属者在业务时区自然月的 used / total / exhausted，以及一次扣减或退回」。不负责：订阅购买与到期（006 订阅系统）、TG 插件每日下载额度（005 quota_service）、积分余额（003 积分系统）、价格与订单（004）。

total 的单一真源是 006 的 `get_user_subscription_config`：所持档位（付费或本线 free 行）的 metadata `monthly_quota`。行缺失或 `monthly_quota` 为空即配置合同破裂，抛 `PAYMENT_GATEWAY_ERROR` 暴露——不做 config_public / 默认值兜底（兜底会让配置错误静默化为「少给或超给」）。013 U7 时期的 `maps_quota` config_public 键与 `DEFAULT_FREE_QUOTA` 兜底链已删除（表中键行保留，仅删代码引用，运营可后续清理数据行）。

## 2. 方案

存储按归属者身份分派（013 双窗口拍板的延续）：

| 身份 | 存储 | used 来源 | 幂等 |
| --- | --- | --- | --- |
| 登录用户（user_id > 0） | MySQL 只插入流水 `user_usage_logs` | `SUM(delta)` 按 line + user + ym 聚合 | 唯一键 `(product_line, user_id, request_id)` |
| 匿名设备（user_id = 0） | Redis 月度计数 | `GET usage:{line}:{ym}:{identity}` | Lua 脚本内幂等键 |

为什么登录侧从 Redis（013 U7 单轨）改为 MySQL 流水：

- 付费额度是合同义务，Redis 重建/淘汰会把已付费用户当月用量清零，产生真实的客诉与资损面；
- 云端（014）需要 refund（预扣-结算）与负 delta 修正，Redis 计数无法审计、无法退回指定月份；
- 月度 SUM 在「单用户单线单月」桶上是千行级扫描，覆盖索引下成本可忽略。

匿名侧维持 Redis：防滥用计量而非资损，丢失 = 免费多给额度，容忍（013 双窗口拍板）。

不采用：

- 005 Counter：唯一键只有 user 维度装不下「产品线 × 请求键」，且「只增」合同无法表达 refund 负 delta；Counter 面向内部行为计数，不面向配额合同。
- 003 积分：「余额-流水、永不过期、购买/赠送」模型，与「月度窗口重置」语义不同，且只按 user_id 归属。
- 单独的汇总表（每月一行存 used）：读改写并发 + 无法审计单次扣减，流水 + SUM 更简单且免锁。

## 3. MySQL 数据模型

### 3.1 `user_usage_logs`

| 字段 | 类型 | 约束 | 语义 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 记录 ID |
| `product_line` | `VARCHAR(32)` | NOT NULL | 产品线标识（maps_extension / maps_online / maps_api） |
| `user_id` | `BIGINT` | NOT NULL | 用户 ID（匿名走 Redis 不进表，恒大于 0） |
| `ym` | `INT` | NOT NULL | 业务时区自然月 `YYYYMM`；**退回行 = 被修正量所属月** |
| `delta` | `INT` | NOT NULL | 用量变化：正数 = 消费，负数 = 退回 |
| `request_id` | `VARCHAR(64)` | NOT NULL | 业务幂等键（插件采集会话 UUID / 云端任务批次键） |
| `created_at` | `BIGINT` | NOT NULL | 创建时间，毫秒时间戳 |

- 唯一键：`uk_user_usage_logs_line_user_request(product_line, user_id, request_id)`。
- 聚合索引：`idx_user_usage_logs_line_user_ym_delta(product_line, user_id, ym, delta)`（覆盖 SUM 扫描，免回表）。
- 纯插入不可变流水：无 update/del、无 updated_at；`used = SUM(delta)` 是派生值，不存冗余。

### 3.2 幂等域

幂等域 = 产品线 × 用户 × 请求键。唯一键只含这三列，因此：

- 同用户同线同 `request_id` 重放 → 唯一键命中，跳过写入，used 原样返回（`deducted=False`）。
- 跨用户或跨线携带他人 `request_id` → 唯一键不命中，是合法的新扣减（各归属者各自计量，无全局请求键语义）。
- 预扣-结算的多次写入靠请求键命名区分：`{batchId}`（预扣）与 `{batchId}:settle`（结算修正，refund 或 consume 按差值正负分流），见 §5。

## 4. Service 合同

`app/services/usage_service.py`：模块内私有基类 `_BaseUsageService` 持 `product_line` 类属性，三个薄门面继承并绑定常量，模块底部暴露单例 `extension_usage_service` / `online_usage_service` / `api_usage_service`。不使用构造器依赖注入（红线 4）。

三原语（身份分派见 §2）：

```text
get_usage(identity, *, user_id) -> UsageSnapshot(ym, used, total, exhausted)
consume(identity, *, user_id, records, request_id) -> UsageConsumeResult(+deducted)
refund(*, user_id, records, request_id, target_ym=None) -> UsageSnapshot
```

- `get_usage`：total（§1 真源）+ used（SUM 或 Redis GET），未命中按零。
- `consume`：MySQL 路径 INSERT 一行 `delta=records`，唯一键 `IntegrityError` = 幂等命中（返回当前快照 `deducted=False`）；Redis 路径沿用 013 U7 的单 Lua 脚本原子幂等（脚本原样迁移，key 换新构建）。`records` 正数合同由 API 层校验。
- `refund`：**仅登录路径**（`user_id<=0` 抛 `ValueError`，表合同要求恒大于 0）。内部写 `delta=-records`（入参 records > 0）；`target_ym` 默认当前月，预扣结算传原预扣行 ym。不校验 SUM 非负——退回量由内部调用方保证，与 `CounterService.add` 信任内部合同同口径。返回退回后的**当月**快照（target_ym 指向历史月时不改变当月 used）。

total 链：`(await get_user_subscription_config(user_id, line))[1].metadata.monthly_quota`。匿名（user_id=0）走该函数既有分支返回本线 free 档（006 U4）。三线 free 档合同值：maps_extension=1000 / maps_online=1000 / maps_api=20。

公共形态：`UsageSnapshot` / `UsageConsumeResult`（NamedTuple）、`usage_identity(user_id, device_id)`（`u:{id}` / `d:{id}`）、`usage_payload(snapshot)`（竞品同构 used/total/period/exhausted）。

失败语义（spec-redis §7，正确性优先 fail-closed）：Redis / MySQL 故障三原语统一抛 `EXTENSION_USAGE_UNAVAILABLE`（31102），错误消息带 product_line 与上下文字段；配置合同破裂（行缺失 / monthly_quota 空）抛 `PAYMENT_GATEWAY_ERROR`。插件侧对 usage 失败自行 fail-open（采集可用性优先），两侧互补。

### 4.1 原子数据结构例外（spec-mysql §4 登记）

本 service 是 spec-mysql §4 登记的第二个原子数据结构例外（第一个是 MySQL 用户 Counter）：公开任意 CRUD 会破坏「只插入 + 唯一键幂等」合同——一条 UPDATE 就能篡改历史用量、一条 DELETE 就能凭空恢复额度。因此只提供插入（consume/refund 内部）与聚合读（get_usage/SUM），不提供 `lists / info / update / del` 四标准方法。

## 5. 预扣后退组合用法（014 落地约定）

云端任务按批次预扣、按结果结算：

```text
提交任务            consume(预估量, request_id=batchId)                        # 预扣，落 ym=提交月
任务完成·实际<预估   refund(预估-实际, request_id=batchId:settle, target_ym=提交月)   # 退多扣
任务完成·实际>预估   consume(实际-预估, request_id=batchId:settle)                  # 补少扣（正负互斥，同键安全）
任务失败            refund(全额预估, request_id=batchId:refund, target_ym=提交月)
```

差值方向：refund 合同是「入参 records>0、内部写 delta=-records」，因此结算退多扣传**预估-实际**（正数）；实际超过预估的补扣走 consume（**实际-预估**，正数、落当前月）。两支同用 `batchId:settle` 键——同一批次只会命中其一（相等时不落行），正负互斥，同键不冲突。

键位约定：失败全额退回**不复用**预扣的 `batchId`——同一 request_id 已被 consume 的预扣行占用，refund 若同键会被唯一键吞掉（只留一行）。因此失败退回写 `batchId:refund`、结算修正写 `batchId:settle`，与预扣行三行并存（+预估、±修正，SUM 自洽）。014 接线时按此命名。

## 6. Redis key 与生命周期

- 用量：`usage:{line}:{ym}:{identity}`（identity 形如 `u:{user_id}` / `d:{device_id}`，当前仅匿名设备使用）。
- 幂等：`usage:dedup:{request_id}`——匿名防重放按请求键全局命中即可（UUID 跨设备碰撞可忽略，且匿名口径容忍偏差）。
- 一律经 `build_redis_key()` 包全局前缀（spec-redis §2）；用量 key 45 天兜底 TTL、幂等 key 7 天（沿用 013 U7 现值）。
- 旧 key `maps:usage:*`（013 U7 单轨方案）**不迁移**：45 天自然过期；迁移只会把「容忍丢失」的匿名计数复杂化。

## 7. 索引审查

### 7.1 新表初始清单

- PK `(id)`；UK `uk_user_usage_logs_line_user_request(product_line, user_id, request_id)`；INDEX `idx_user_usage_logs_line_user_ym_delta(product_line, user_id, ym, delta)`。

### 7.2 实际查询

| 操作 | 实际 WHERE / 冲突检测 | 当前源码位置 |
| --- | --- | --- |
| SUM 聚合读 | `product_line = ? AND user_id = ? AND ym = ?`（SELECT delta 求和） | `backend/src/app/services/usage_service.py:246-249` |
| 插入幂等 | UK `(product_line, user_id, request_id)` 冲突检测 | `backend/src/app/services/usage_service.py` `_insert_log`（db.add + commit） |

三件套审查：§7.1 已列出新表完整 PK/UK/INDEX 清单；SUM 的 WHERE + 投影列 delta 被聚合索引完整覆盖（覆盖索引免回表）；UK 承担插入冲突检测。两索引均以 (product_line, user_id) 为最左前缀但后续列与用途不同（request_id 幂等 / ym+delta 聚合），互不为对方前缀重复；无单列索引需要回收。Model 中两索引行尾已注明服务的查询（`user_usage_log_model.py:19,25`）。

## 8. 量级口径

Business 档 500,000 records/月。按插件上报粒度（采集会话/批量条目完成边沿，平均约 20 records/次）常态 ≈2.5 万行/月；最坏每条 record 一次上报 ≈50 万行/月。行宽窄，单表千万行内 SUM 走覆盖索引无压力。数据永久保留（审计与对账依据）；达到百万行级再评估归档方案，不在本期建设。

## 9. 文件责任

```text
backend/src/app/constants/usage.py                  # Redis key 构建、TTL、format_period
backend/src/app/models/user_usage_log_model.py      # user_usage_logs 表
backend/src/app/models/__init__.py                  # 注册 UserUsageLogModel
backend/src/app/services/usage_service.py           # _BaseUsageService + 三门面 + 公共形态
backend/src/app/api/client/maps_client.py           # /maps/usage 两路由接 extension_usage_service
backend/src/app/constants/maps_usage.py             # 删除（旧 Redis 单轨常量）
backend/src/app/services/maps_usage_service.py      # 删除（旧 Redis 单轨服务）
backend/tests/integration/real/services/test_usage_service_real.py
backend/tests/integration/real/api/client/test_maps_usage_real.py
```

## 10. 测试与验收

- MySQL 路径（real，合成 user_id + 随机 request_id，流水行随用例清理）：consume 幂等（同 request_id 二次 `deducted=False` 且 used 不变）、多 request_id SUM 聚合、refund 抵减且幂等、refund `target_ym` 跨月行各月 SUM 自洽、三线 free 档 total（1000/1000/20）、monthly_quota 缺失抛 `PAYMENT_GATEWAY_ERROR`（extension 线 free 档真实配置）、匿名 refund 拒绝。
- HTTP 契约（real，ASGI 进程内）：匿名 Redis 路径全量回归（首查/扣减/幂等重放/前缀 key/累计/422/触顶）+ 登录 MySQL 路径（free 档 total=1000、扣减、重放、流水副作用断言）。
- `sync_database_schema --yes` 建表；`SHOW CREATE TABLE` 核对列、comment、PK/UK/INDEX。
- schema 同步、black / ruff / mypy（限定范围）、全量 real 回归、business 启动冒烟 + 两路由双身份 HTTP 实测。

## 11. 失败语义

- Redis 故障：三原语抛 `EXTENSION_USAGE_UNAVAILABLE`（fail-closed），插件侧 fail-open 降级放行（013 既有口径）。
- MySQL 故障：同上 fail-closed；扣减失败由调用方重试，唯一键保证重试幂等。
- 配置合同破裂（商品行缺失 / monthly_quota 空）：`PAYMENT_GATEWAY_ERROR`，不静默兜底。
- 业务成功但 consume 失败：可能少记，接受（与插件上报失败同口径）；consume 成功但上层失败：多记，由 refund 显式修正。
- Redis 匿名计数丢失：当月匿名 used 清零 = 免费多给，接受；登录用量在 MySQL，不受影响。
