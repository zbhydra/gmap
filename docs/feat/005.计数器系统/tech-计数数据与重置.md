# 005 · 计数数据与重置

> 覆盖 extension 每日下载次数的存储模型、日期 key、按天重置、并发原子扣减、失败放行、单次扣减区间。
> 关联:`@feat.md` `@tech-device_id与匿名下载.md` `@tech-额度查询与前端.md`
> 本域是后端每日额度服务在 extension 下载次数这一口径上的现行实现。website 下载额度走 Credits(`@../003.积分系统/feat.md`),不在本文件范围。

## 1. 存储模型

每日下载次数用 Redis 的"日期 key"模型存储,不落 SQL 表。

### 1.1 key 结构

```
quota:{quota_type_int}:{u_id}:{YYYYMMDD}
```

- `quota_type_int`:额度类型整数,本域固定使用插件下载额度类型(`3`)。本域业务代码不直接写字面量 `3`,统一走额度类型枚举。
- `u_id`:作用域字符串。登录用户传 `str(user_id)`;匿名设备传 device_id 原文。两者不加命名空间前缀,但 device_id 的生成规则保证不会与纯数字 user_id 冲突(见 `@tech-device_id与匿名下载.md`)。
- `YYYYMMDD`:服务器本地自然日,由服务器系统时区计算。
- 整体再过一层统一的 Redis key 前缀构造,确保全局命名空间一致。

> 说明:user_id 与 device_id 共享同一 key 命名空间、不做前缀区分,是接受的设计取舍:device_id 的校验规则禁止纯数字(见 `@tech-device_id与匿名下载.md`),因此两者在 key 上不会碰撞。

### 1.2 值

key 的 value 是当天该作用域该类型的"已用次数"整数(从 0 开始累加)。缺失 key 视为 0。

### 1.3 过期与按天重置

- 每次写入当天 key 时,用 `EXPIREAT` 把过期时间设到**服务器本地次日 00:00:00** 的 Unix 秒时间戳。
- key 过期后自然失效,跨天后新一天的查询读不到昨天的 key,即"按天重置"。
- 计算"次日 0 点"必须用**系统时区**的 aware datetime,不能把 UTC 0 点当作本地 0 点。
- "距离次日 0 点的秒数"与"次日 0 点的 Unix 秒"都派生自同一个本地 0 点计算,避免双源不一致。

> 与项目规范一致:所有按天结算都以服务器系统时区 0 点为界。

## 2. 额度上限

- extension 每日下载次数上限来自订阅配置。
- Free 档当前上限为 `5`。
- Unlimited Download 有效期内上限为 `-1`,表示不限次数。
- 匿名设备和无有效订阅的登录用户都按 Free 档处理。
- 解析额度上限的入口在 service 层统一完成,调用方只传作用域和额度类型,不传上限值。

## 3. 单次扣减区间

- 单次扣减条数 `number` 必须是整数,且满足 `0 < number <= 10000`。
- 越界一律抛出带详细 msg 的参数错误,不进入 Redis。
- bool 类型显式拒绝(避免 `True` 被当作 `1`)。

## 4. 并发原子扣减

当日次数的"校验上限 + 累加已用 + 设置过期"必须原子完成,用 Redis Lua 脚本一次性执行。

Lua 流程:

```text
current = tonumber(GET key) or 0
if current + number > daily_limit:
    return {0, current, 0}          # 不允许,不增加已用
new_used = INCRBY key number
EXPIREAT key expire_at
return {1, new_used, daily_limit - new_used}   # 允许,返回新已用和剩余
```

返回约定:三元素数组 `{allowed_flag, used, remaining}`。

- 同一作用域并发扣减时,Lua 单线程执行保证不会因竞态越过上限。
- 额度不足(命中 `current + number > limit`)时**不写 Redis**,已用次数保持不变。

## 5. 失败放行(fail-open)

本域对 extension 下载次数采用**可失败放行**策略:

- Lua 执行抛异常(Redis 不可用、网络错误等)时,service 层捕获后:
  1. `logger.error` 打印能定位到 `u_id / quota_type / number / limit / key / 异常类型与信息`的详细日志;
  2. 抛出一个带详细 ext_msg 的业务异常。
- 在 extension 下载额度扣减入口(`/api/client/quota/check`,见 `@tech-额度查询与前端.md`)的 API 层捕获该业务异常,降级为"允许下载"返回(`allowed=true, used=0, remaining=-1, status=1`),**不阻断**用户下载。

> 取舍依据:extension 下载是用户当前正在执行的本地保存动作,少量额度漏扣的代价小于误拦截;线上通过详细日志定位异常。这与 website Credits 扣费等需要 fail-closed 的链路不同,不要把策略混用。

只有 extension 下载次数扣减入口走 fail-open;service 层本身不做 fail-open(只负责抛带详细 msg 的异常),放行策略集中在 API 层。

## 6. 读取口径

- 读取当天用量只读"今天的日期 key",不读历史 key。
- 批量读取一个作用域所有额度类型的当天用量用 `MGET`,缺失值按 0 返回。
- 读取异常同样抛带详细 msg 的业务异常;展示层(订阅状态)对读取异常的容忍口径见 `@tech-额度查询与前端.md`。

## 7. service 形态

- 额度服务是一个类(`@singleton`),方法是类方法,不是裸函数(符合项目规范:service 都是类)。
- service 内部不直接读写事务;事务相关不在本域。
- service 不做依赖注入。
- service 对外只暴露每日额度基础能力:`get` / `get_lists` / `set` / 构建 key / 解析额度上限 / 计算次日 0 点秒数。

## 8. 边界场景

| 场景 | 行为 |
| --- | --- |
| 今天该作用域无 key | 按"已用 0"参与判断;扣减时新建 key |
| 昨天的 key 仍在 Redis | 不被今天读取(日期 key 含 `YYYYMMDD`) |
| 额度上限为不限制语义(`-1`) | 直接允许,不写 Redis,返回 `used=0, remaining=-1` |
| 单次扣减条数越界 | 参数错误,不进入 Redis |
| `u_id` 为空或含 `:` | 参数错误(`:` 与 key 分隔符冲突) |
| 并发扣减 | Lua 原子,不越过上限 |
| Lua 执行异常 | service 抛带详细 msg 异常;extension 下载入口 fail-open 放行 |

## 9. 关键代码位置

- 额度类型常量:`@backend/src/app/constants/quota.py`
- 订阅额度配置:`@../006.订阅系统/tech-额度与速率档位.md`
- 每日额度 service(日期 key / Lua / 重置 / 读取):`@backend/src/app/services/quota_service.py`
- 服务器时区与本地 0 点工具:`@backend/src/app/utils/time.py`
- extension 下载额度扣减入口(API 层 fail-open):`@backend/src/app/api/client/quota_client.py`

## 10. 测试覆盖要点

- `set` 在额度充足时原子扣减并返回 used / remaining。
- `set` 在额度不足时不增加已用、返回不允许。
- `set` 在无限额度(`-1`)时直接允许,不写 Redis。
- `set` 并发调用不会越过上限。
- key 的 `EXPIREAT` 不晚于次日 0 点且大于当前时间。
- `u_id` 为空 / 含 `:` / number 越界 / bool number 抛明确错误。
- 日期 key 含 `YYYYMMDD`,昨天的 key 不影响今天读取。
- extension 下载额度扣减入口在底层异常时 fail-open 放行。
- 真实 Redis 集成测试覆盖上述原子性与 TTL。
