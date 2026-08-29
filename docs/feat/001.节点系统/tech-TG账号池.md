# 001 · TG 账号池(进程内会话池)

> 覆盖节点承载的 Telegram 客户端会话池的内部机制:账号目录发现、进程内 client 复用、最少活跃请求数优先分配、进程级 lease 与心跳、失败与冷却语义、飞书告警。
> admin 对 session 的增删改查 HTTP 入口(verify / login / delete 等)见 `@tech-节点Admin与本地管理.md` 第 3 节,本文件不重复。
> 关联:`@feat.md` `@tech-节点数据与调度.md`。

## 1. 定位与边界

- TG 账号池 = 节点(业务节点或执行节点)本机 `<data_root>/<phone>/auth.session` 目录承载的多个 Telegram 客户端会话,在单个 Python 进程内被 `TelegramManager` 统一调度。
- 仅处理单进程内账号选择与复用;跨进程全局负载均衡不纳入,改由进程级 lease 保证同一 session 不被多进程同时持有。
- 不做后台 watcher、不做定时扫描:每次 `acquire_client()` 按需扫描 `data_root` 发现新账号目录。
- 运行中删除账号目录后的自动回收不纳入:本进程保留已发现账号状态直到 manager `shutdown()`。删除账号走 admin 的 `/tg/clients/delete` 入口(见 `@tech-节点Admin与本地管理.md`)。
- `user_key` 只用于日志追踪和透传给释放逻辑,不参与账号选择。
- 可选 `preferred_client_ref` 只作为客户端亲和提示:命中可调度且负载未明显高于最低负载账号时优先使用,未命中、冷却、不可用、负载过高或激活失败时回退原负载策略。
- 调用方:`backend/src/app/services/tg_client_service.py` 的 `parse_link()` 用 `use_reserved_client_with_ref()` 短请求释放;下载流 `resolve_download_context()` 用 `acquire_client()` 占用、`get_reserved_client()` 复用、`release_download_context()` 释放。

实现代码:`backend/src/app/provider/telegram_manager.py`、`backend/src/app/utils/tg_client_alarm_utils.py`。

## 2. 账号目录与进程内状态

账号目录固定结构:

```text
<data_root>/<phone>/
├── auth.session   # 必须存在,作为 Telegram session 文件;缺失则扫描时忽略
├── lock           # 运行时创建,SessionProcessLock 的 owner token
└── expire_at      # 运行时创建,lease 过期时间戳(Unix 秒)
```

扫描规则:每次 `acquire_client()` 内调用 `_discover_states_locked()` 扫描 `data_root`,按目录名排序;已发现的账号保留在进程内 `_states: dict[phone, _ManagedClientState]`(Python 3.7+ 保持插入顺序),后续请求复用;正在删除中的手机号进入 `_deleting_phones` 阻止重新注册。

`_ManagedClientState` 字段(`backend/src/app/provider/telegram_manager.py:351`):

| 字段 | 作用 |
| --- | --- |
| `phone` | 账号标识(目录名) |
| `client_ref` | 客户端亲和标识,值为 `hashlib.sha256((phone + "***SEC***").encode("utf-8")).hexdigest()`,用于 token 透传和调度对比 |
| `session_path` | `auth.session` 路径 |
| `client` | `TelegramLinkClient` 实例 |
| `active_request_count` | 当前活跃请求数,分配 +1、释放 -1 |
| `process_lock` | 当前进程持有的 `SessionProcessLock` |
| `cooldown_until` | Telegram 上游限流冷却结束时间戳 |
| `cooldown_reason` | 最近一次临时冷却原因 |

## 3. 客户端持有与接口

每个账号在一个 Python 进程内对应一个 `TelegramLinkClient`。同进程内的 acquire / release 由 `TelegramManager._lock` 串行化。管理器接口固定:

| 方法 | 行为 | 错误 |
| --- | --- | --- |
| `acquire_client(user_key, preferred_client_ref=None)` | 返回 `(phone, client)`,优先尝试 `preferred_client_ref` 命中的可调度且负载不过高账号;否则按负载策略选择,选中后启动或恢复 client 并 `active_request_count += 1` | 所有账号不可用时抛 `RATE_LIMIT_EXCEEDED` 或全账号冷却时抛 `TG_FLOOD_WAIT` |
| `release_client(user_key, phone)` | 仅 `active_request_count -= 1`;client 与 lease 继续保留到进程退出 | 幂等,不抛错,`phone` 不存在时忽略 |
| `use_client(user_key)` | 上下文管理,内部复用 acquire / release | 同 acquire |
| `use_reserved_client(user_key)` | 上下文管理,内部复用 acquire / release,返回 `(phone, client)` | 同 acquire |
| `use_reserved_client_with_ref(user_key)` | 上下文管理,返回 `(phone, client, client_ref)`,供 parse 链路把实际账号亲和标识写入内部 token 上下文 | 同 acquire |
| `get_reserved_client(phone)` | 返回已被本进程占用(`active_request_count > 0`)的 client | 未占用时抛 `RATE_LIMIT_EXCEEDED` |
| `mark_client_cooldown(phone, reason, wait_seconds)` | 标记账号临时不可用到 `cooldown_until` | — |
| `remove_client(phone)` | 删除账号:在 `_states` 则校验无活跃引用后 pop 并清理;仅文件系统则删目录 | 返回 `(RemoveClientResult, active_count)`,有活跃引用时返回 `HAS_ACTIVE_REQUESTS` |

下载流请求持有账号直到流式下载释放;链接解析请求在解析完成后立即释放引用。`shutdown()` 清空 `_states`、关闭所有 client、释放所有 lease。

## 4. 进程级 lease(SessionProcessLock)

`SessionProcessLock`(`backend/src/app/provider/telegram_manager.py:77`)用文件声明账号 session 的进程级所有权,防止多进程同时持有同一 session。

- `lock` 文件存储 owner token,格式 `"{pid}:{uuid}"`,区分同机不同进程持有者。
- `expire_at` 存储过期时间戳。持有者通过后台心跳 task 定期刷新。
- `acquire()` 成功后立即启动心跳 task;`release()` 先取消心跳,再删 `lock` 与 `expire_at`。
- 进程异常退出后心跳停止,`expire_at` 到期后其他进程下一次 acquire 可接管该账号。
- 本进程 lease 失联(`is_locked_by_owner()` 失败)时清空当前进程缓存的 lease 并拒绝新 acquire,保护正在进行的活跃引用。

| 参数 | 默认值 | 作用 |
| --- | --- | --- |
| `lock_ttl_seconds` | `15` | 进程级 lease 过期时长 |
| `heartbeat_interval_seconds` | `5` | lease 心跳刷新间隔(必须小于 ttl) |

拿不到某账号 lease 时本次分配跳过该账号尝试下一个;全部不可用抛 `RATE_LIMIT_EXCEEDED`。

## 5. 分配策略

「可选软亲和优先;未命中时最少活跃请求数优先,同活跃数随机」,在 `_acquire_state()`(`backend/src/app/provider/telegram_manager.py:844`)实现:

1. `_discover_states_locked()` 扫描并注册新账号目录。
2. 过滤可调度候选(`_is_client_schedulable`:无冷却、未被失联 lease 拒绝)。
3. 计算候选中的最低活跃数 `min_active_request_count`。
4. 如果传入 `preferred_client_ref`,先在候选中查找 `state.client_ref == preferred_client_ref` 的账号。
5. 亲和账号存在且 `state.active_request_count <= min_active_request_count + 1` 时尝试 `_activate_state_locked()`;成功则直接返回。
6. 亲和账号不存在、不可调度、负载高于最低负载 1 个以上或激活失败时不报错,继续原策略。
7. `random.shuffle(candidate_states)` 打乱,避免相同负载下固定偏向某个目录名。
8. `candidate_states.sort(key=lambda s: s.active_request_count)` 稳定排序,升序。
9. 依次尝试 `_activate_state_locked()`:获取 lease → 健康检查 → `active_request_count += 1`。
10. 候选获取 lease 后 client 无法恢复则释放 lease,继续下一个候选。
11. 首个激活成功的账号即为分配结果;全部失败抛 `RATE_LIMIT_EXCEEDED`。

### 5.1 `client_ref` 生成与边界

- `client_ref` 在 `_ManagedClientState` 创建时直接计算:`hashlib.sha256((phone + "***SEC***").encode("utf-8")).hexdigest()`。
- 不额外封装 `_build_client_ref()` helper;生成规则只在 state 创建处使用一次。
- `client_ref` 不是安全密钥,只是避免把真实手机号或裸手机号 hash 写入跨接口 token 的稳定亲和标识。
- 固定后缀变更只影响旧 token 的亲和命中率;旧 token 仍可回退普通账号池调度。
- `_states` 仍以真实 `phone` 为 key;`client_ref` 只用于匹配和优先选择,不能替代 `phone` 参与 session 目录、释放引用、告警或 admin 展示。
- `client_ref` 只能通过 manager 的正式 reservation 返回值向上层暴露;service 不允许反查或读取 `_states`。
- 空字符串、格式不合法或找不到对应账号的 `preferred_client_ref` 一律当作未传处理,不影响正常下载。

示例(同一进程、前一个 acquire 已完成未 release):

| 请求 | A 活跃数 | B 活跃数 | 选择 |
| --- | ---: | ---: | --- |
| 用户 1 | 0 | 0 | A 或 B(随机) |
| 用户 2 | 1 | 0 | B |
| 用户 3 | 1 | 1 | A 或 B(随机) |
| 用户 4 | 2 | 1 | B |

策略让多个账号在同一进程内自然分摊长下载请求。

## 6. 失败与冷却语义

| 场景 | 行为 |
| --- | --- |
| 新账号目录缺 `auth.session` | 扫描时忽略 |
| 某账号 lease 被其他进程持有 | 跳过该账号 |
| 某账号 lease 失联 | 清空当前进程缓存 lease,拒绝新 acquire |
| client 健康检查失败且无活跃引用 | 关闭并尝试重启一次;仍不可用则释放 lease 并跳过 |
| client 健康检查失败且有活跃引用 | 拒绝新 acquire,保留现有引用等自然释放 |
| client 启动连接连续失败 | 重试 `TG_CLIENT_CONNECT_RETRY_COUNT = 5` 次仍失败则跳过,并发送飞书告警(同手机号 `TG_CLIENT_CONNECT_FAILED_ALARM_DEDUP_SECONDS = 3600` 秒去重) |
| client 进入上游限流冷却(`cooldown_until` 未到) | 不参与调度,`_client_status` 返回 `cooldown` |
| client 进入不可用(`unavailable_error`) | 发送飞书告警(同手机号 `TG_CLIENT_UNAVAILABLE_ALARM_DEDUP_SECONDS = 3600` 秒去重) |
| 所有账号不可用 | 抛 `RATE_LIMIT_EXCEEDED` |
| 请求处理中异常 | 调用方负责 release 已占用引用 |
| 进程异常退出 | lease 依靠 `expire_at` 超时自动失效,其他进程下一次请求可接管 |

飞书告警实现在 `backend/src/app/utils/tg_client_alarm_utils.py` 与 `backend/src/app/utils/feishu_utils.py:send_feishu_alarm`,纯文本告警。
