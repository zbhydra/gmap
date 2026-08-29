# 008 · TG 客户端管理

> 覆盖 TG 客户端菜单的列表、批量验证、交互式新增登录、删除和登录过期告警。通用 admin 接口约定见 `@tech-管理模块接口.md`,节点本地入口边界见 `@tech-节点本地与中心入口.md`。

## 范围

TG 客户端管理包含列表、批量验证、交互式新增登录、删除。登录会话在内存中维护,状态机:`created → pending_code → (pending_2fa) → completed / expired`;`verifying` / `check_2fa` 是请求内的瞬时状态,不持久化。同一时间只允许一个登录流程,120 秒超时自动清理。

手机号格式约定:API 层接受国际格式(如 `+8613800138000`),内部标准化为纯数字后传入 service 层,与连接池 key 和文件目录名一致。

## 列表与批量验证

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/tg/clients` | `get_admin_user` 或 `get_admin_jwt_only` | 扫描本地 session 目录 + 结合连接池运行时状态 |
| POST | `/api/admin/tg/verify` | `get_admin_user` 或 `get_admin_jwt_only` | 批量验证(SSE),`phones` 数组最多 20 个 |

`GET /tg/clients` 响应:每条含 `phone`、`has_session_file`、`active_request_count`、`is_discovered`;节点本地版额外返回当前节点 `network_rate`。

`POST /tg/verify` 为 SSE(`Content-Type: text/event-stream`),逐条串行验证(间隔 1 秒,避免 Telegram 限流),推送 `event: result`(每条 `phone` / `status` / `message`)与 `event: done`(汇总 `total` / `ok` / `fail`);中途不可恢复异常推送 `event: error` 后仍以 `event: done` 兜底。

## 当前使用明细

TG 客户端管理页底部展示当前活跃下载使用明细,其中非空用户 ID 可点击打开通用用户信息弹窗。弹窗接口与字段见 `@tech-用户信息弹窗.md`;TG 客户端接口不内嵌用户详情。

## 交互式新增登录

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/admin/tg/login/start` | 同上 | 开始登录,发送验证码 |
| POST | `/api/admin/tg/login/code` | 同上 | 提交验证码 |
| POST | `/api/admin/tg/login/2fa` | 同上 | 提交两步验证密码 |
| POST | `/api/admin/tg/login/resend` | 同上 | 重发验证码(120 秒冷却) |
| POST | `/api/admin/tg/login/cancel` | 同上 | 取消登录(对已过期 / 不存在的会话幂等返回成功) |

`/login/start` 请求:`phone`(国际格式);响应:`login_id`、`timeout`(120)、`code_type`(`sms` / `app` / `other`)。手机号已存在(session 文件存在或连接池已注册)时拒绝;手机号是否在连接池通过连接池公开方法检查,不直接访问内部状态字典。

`/login/code` 请求:`login_id`、`code`;响应 `status`:`success` / `need_2fa`。验证码错误 / 过期 / 手机号未注册 / 状态不匹配各自映射独立错误码。

`/login/2fa` 请求:`login_id`、`password`;响应 `status`:`success`;密码错误映射独立错误码。

`/login/resend` 请求:`login_id`;响应 `status`:`resent`、`code_type`。

登录成功的写入:确保目标目录存在 → 原子重命名临时 session 为最终路径(`os.replace`)。session 文件落盘后,连接池在下次分配时懒加载,不影响列表页(列表走文件系统扫描)。

### 登录会话数据结构

`TgLoginService` 在进程内存维护 `_sessions: dict[login_id, LoginSession]` + 单一互斥量 `_active_login_id`(同一时间只允许一个登录流程)。`LoginSession` 字段:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `login_id` | str | UUID,唯一标识一次登录 |
| `phone` | str | 手机号(纯数字,如 `8613800138000`;API 层负责从国际格式标准化) |
| `client` | `TelegramLinkClient` | 分步登录专用独立实例,内部持有 Telethon 客户端与 `phone_code_hash`;与连接池实例不共享 |
| `status` | str | `created` / `pending_code` / `pending_2fa` / `completed` / `expired` |
| `created_at` | float | 创建时间(`time.time()`) |
| `last_active_at` | float | 最后活跃时间(每次 API 调用更新,用于超时判断) |

状态机里的 `verifying` / `check_2fa` 是 API 请求内的瞬时态,不写入 `status`,只流转持久态四值 + 终态 `expired`。

设计要点:

- `client` 是独立新建的 `TelegramLinkClient` 实例,不与连接池共享;分步登录方法直接在该实例上调用。`start_login` 传入最终路径 `{data_root}/{phone}/auth.session`,但分步过程用 `.tmp.session` 变体(`_temporary_session_file_path()`);`start_login` 阶段不调用 `start()`。
- `phone_code_hash` 复用 Telethon 内部机制:`send_code_request` 存入 `_phone_code_hash[phone]`,`sign_in(phone, code)` 自动取缓存;`resend_login_code` 再次 `send_code_request(phone)` 时 Telethon 检测到已有 hash 并内部转 `ResendCodeRequest`。`LoginSession` 不关心 hash 细节。
- 手机号已存在检查:`auth.session` 文件是否存在 + 连接池 `has_phone(phone)` 公开方法;只检查最终路径 `auth.session`,不检查 `.tmp.session`,确保 `finalize_login` 崩溃残留的临时文件不会误拦下次登录。

### TelegramLinkClient 分步登录方法

分步登录方法直接加在 `backend/src/tg_link_client/client.py` 现有类中,复用 `_temporary_session_file_path` / `_build_client_for_session` / `_cleanup_session_artifacts`,不另建文件。

| 方法 | 作用 |
| --- | --- |
| `start_login(phone)` | 创建临时 session,连接 Telegram,调 `send_code_request`,返回 `StartLoginResult(code_type)` |
| `submit_code(code)` | 调 `sign_in(phone, code)`,不传 `phone_code_hash`,Telethon 自动用内部缓存,返回 `LoginStepResult` |
| `submit_2fa(password)` | 调 `sign_in(password=password)`,返回 `LoginStepResult` |
| `resend_login_code()` | 再次 `send_code_request(phone)`,返回 `ResendResult(code_type)` |
| `cancel_login()` | 断开连接,复用 `_cleanup_session_artifacts` 清理临时 session 文件 |
| `finalize_login()` | 清除分步登录状态字段 → 断开临时客户端 → `mkdir(parents=True, exist_ok=True)` → `os.replace()` 原子重命名 `.tmp.session` 为 `auth.session` → 清理 `-journal/-shm/-wal` 残留,返回最终路径 |

返回值:

- `StartLoginResult(code_type)`、`ResendResult(code_type)`:`code_type ∈ {"sms", "app", "other"}`,来自 Telethon `SentCode.type` 映射。
- `LoginStepResult(status)`:`success` / `need_2fa` / `code_invalid` / `code_expired` / `phone_not_registered` / `password_invalid`。

Telethon 异常映射在分步方法内集中完成:`SessionPasswordNeededError`→`need_2fa`;`PhoneCodeInvalidError` / `PhoneCodeExpiredError` / `PhoneNumberUnoccupiedError` / `PasswordHashInvalidError`→对应 status;`PhoneNumberBannedError` / `FloodWaitError`→业务异常。

## 自动模式批量登录与接码解析

交互式登录一次只登录一个号;自动模式用于一次粘贴多个号 + 各自接码链接,串行自动完成。接码链接的拉取与解析是独立子系统,完整规格见 `@tech-接码平台适配层.md`,本节只给菜单级概要。

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/admin/tg/code-link/parse` | `get_admin_user` 或 `get_admin_jwt_only` | 后端代请求接码链接并解析验证码 / 两步验证 / 状态 |

- 前端 `TgClientView.vue` 自动模式 Tab:按行解析「手机号 + 接码链接」,串行循环每个号:start → 等待 5 秒避开接码平台缓存旧码 → 轮询 `code-link/parse` 取码 → 提交 code →(可选)两步验证;同一时刻只处理一个号。
- 接码链接由后端代请求(SSRF 防护:只允许已登记的接码平台域名),后端按 URL 自动识别平台(jiema / next.tgapi.de)并分派解析器,前端无需选择平台。
- `code-link/parse` 响应 `data.status`:`success` / `cooldown` / `no_code` / `cf_blocked` / `timeout` / `network_error` / `unknown`。`cooldown` 按返回秒等待,`no_code` 短间隔重试,`cf_blocked` 较长间隔重试(连续 2 次标记该号失败),`timeout` / `network_error` / `unknown` 直接标记该号失败;**单号失败只 `continue` 到下一个号,不中断整批**,仅基础设施级故障(curl_cffi 全局不可用 / 节点不可达 / 登录会话崩溃)才中断整批。
- 拉取层用 `curl_cffi`(Chrome 指纹);前端发码成功后首次取码等待 5s,`no_code` 后续轮询间隔 8s,后端不做节流(内部接口)。解析失败 / CF / 超时均落日志。详见 `@tech-接码平台适配层.md`。
- 接码解析不引入独立错误码,全部走 `status` 枚举返回前端。

## 删除客户端

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/admin/tg/clients/delete` | 同上 | 删除客户端及其文件 |

请求:`phone`(国际格式,API 层标准化)。删除由连接池的 `remove_client(phone)` 统一处理,返回结果枚举:已删除 / 有活跃请求(响应 `data` 含 `active_request_count`) / 不存在。两路分支都遵循 `shutdown()` 的锁模式:锁内只改 `_states` / `_deleting_phones`,耗时 IO(`close`、`SessionProcessLock` 释放、目录删除)一律在锁外执行。

路径 A(在连接池 `_states` 中):获取 `_lock` → 检查 `active_request_count > 0`(是则返回有活跃请求)→ `_states.pop(phone)` 取出 `_ManagedClientState` → 加入 `_deleting_phones` 集合 → 释放锁 → 锁外关闭 `TelegramLinkClient` 连接 → 锁外释放 `SessionProcessLock` → 锁外删除 `data/<phone>/` 目录(失败只 `logger.error`,不影响返回)→ `finally` 中重新获取锁 `_deleting_phones.discard(phone)`。

路径 B(仅在文件系统,未被连接池加载):获取 `_lock` → 检查 `data/<phone>/` 目录存在(不存在返回 NOT_FOUND)→ `_deleting_phones.add(phone)`(阻止 `_discover_states_locked` 重新注册)→ 释放锁 → 锁外删除目录(`try/except`,失败 `logger.error`)→ `finally` 中 `_deleting_phones.discard(phone)`。

并发控制关键:`_deleting_phones: set[str]` 解决 TOCTOU 竞态。`_discover_states_locked` 在扫描目录后,除了原有的 `phone in self._states` 检查,额外检查 `phone in self._deleting_phones`,跳过正在删除的 phone。不用 sentinel 方案是因为 sentinel 会污染所有遍历 `self._states.values()` 的代码路径;`_deleting_phones` 是独立集合,不影响这些遍历。

自愈性:路径 A 锁外删除失败时,目录会被 `_discover_states_locked` 重新发现并注册回连接池,管理员可重试删除;进程崩溃后 `_deleting_phones` 自动清空,未完整删除的目录也会被重新发现。

源 feat.027 过时点:`feat.027` §4.4 描述路径 B 为"锁外删除后再获取锁 discard",路径 A 未加入 `_deleting_phones`;实际代码两条路径都先在锁内 `add`,统一在 `finally` 中 `discard`。以代码为准。另外代码注释明确:`has_phone` 读取 `_deleting_phones` 时无锁(单线程 asyncio 模型下 set 读取安全),`start_login` 的 `send_code_request` 最坏情况下可能与删除并发,属可接受的 TOCTOU 窗口。

## 错误码

| 错误码 | 触发 |
| --- | --- |
| 30006 | 已有登录进行中 |
| 30007 | 登录会话已过期或不存在(cancel 幂等,不返回此码) |
| 30008 | 登录步骤状态不匹配 |
| 30009 | 手机号被 Telegram 封禁 |
| 30010 | Telegram 限流(响应 `data.wait_seconds`) |
| 30011 | 验证码已过期 |
| 30012 | 手机号未注册 Telegram |
| 30013 | 该手机号客户端已存在 |
| 30014 | 验证码无效 |
| 30015 | 两步验证密码错误 |
| 30016 | 客户端有活跃请求,无法删除(响应 `data.active_request_count`) |
| 30017 | 客户端不存在 |

## 登录过期飞书通知

运行时使用 TG client 发现 session 失效(`SessionRequiredError` / `LoginRequiredError`)时,通过项目通用飞书告警工具发送通知,同一手机号 3600 秒内最多 1 条(去重 key `warning_tg_client_account:{phone}`,Redis `SET NX EX 3600`)。通知内容含手机号、触发场景(`client_activate` / `admin_verify`)、错误类型、时间、处理建议。通知失败不阻塞用户请求主流程,只记后端日志。客户端列表展示最近健康状态(登录过期)以便管理员定位。不新增独立飞书服务 / webhook / OpenAPI 鉴权,统一复用既有告警出口。

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| TG 客户端 | `@backend/src/app/api/admin/admin_tg_client.py`、`@backend/src/app/schemas/admin_tg_client_schema.py` | `@backend/src/app/services/tg_client_service.py`、`@backend/src/app/services/tg_login_service.py`、`@backend/src/tg_link_client/client.py` |
| 飞书告警 | — | 项目通用飞书告警 utils |
