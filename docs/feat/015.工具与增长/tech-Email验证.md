# Email Checker 真实验证

> 本文负责 Email Checker 工具页的验证链路：Reoon 账号配置、公开验证接口与结果展示合同。工具页通用模板归 [feat.md](feat.md#工具页模板统一)。

## 决策

- 2026-10-27 hydra：Email Checker 对齐竞品的邮箱可投递性验证，替代原「纯格式校验」裁决。原裁决来自「工具无后端依赖」的推断，竞品实际为 SMTP 验证（见 [D1 竞品调研](references/D1-免费工具矩阵.md)）。
- 验证由第三方 Reoon Email Verifier 承担，不自建 SMTP 探测。测试服（腾讯云）出站 25 端口实测不通，且腾讯云解封后的 25 端口只允许连接第三方发信服务；自建探测对 Outlook / Yahoo 等大厂邮箱也只能得到 unknown。
- 多个 Reoon 账号由 admin 配置，每次验证随机选一个账号；靠多个免费账号叠加额度可能违反 Reoon 条款，账号被封的风险由 hydra 接受，后果仅为验证暂不可用。

## Reoon 外部合同

官方文档：[Reoon API Documentation](https://www.reoon.com/articles/api-documentation-of-reoon-email-verifier/)。

| 用途 | 请求 | 说明 |
| --- | --- | --- |
| 单邮箱验证 | `GET https://emailverifier.reoon.com/api/v1/verify?email=&key=&mode=power` | power 模式会做 SMTP 投递检查，耗时为几秒到一分钟以上；quick 模式不检查收件箱，不使用。官方要求单接口并发不超过 5。 |
| 账号余额 | `GET https://emailverifier.reoon.com/api/v1/check-account-balance/?key=` | 2026-10-27 实测返回 `api_status`、`remaining_daily_credits`、`remaining_instant_credits`、`status:"success"`，不扣额度，约 4 秒。 |
| 失败形态 | 响应体 `{"status":"error","reason":"..."}` | 无效 key 实测为 HTTP 401 + `reason:"Invalid API key."`；额度耗尽的形态官方未写明，按同一 `status:"error"` 处理。 |

power 模式的 `status` 取值：`safe`、`invalid`、`disabled`、`disposable`、`inbox_full`、`catch_all`、`role_account`、`spamtrap`、`unknown`。按 Reoon 官方说法，unknown 结果与接口报错不扣额度。

## 账号配置

- 存储：`system_data` 新增一个配置 key，值为 `{"accounts": [{"name": str, "api_key": str}]}`；由新的 Reoon 配置 service 唯一负责读写，读写方式与 Collector 配置一致：整对象保存，明文保存与回显。
- 校验：`name` 和 `api_key` 去首尾空白后不能为空，`name` 在列表内不能重复。允许保存空列表，空列表时公开验证接口返回不可用。
- admin 接口：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/admin/system-settings/reoon` | 读取配置，`Cache-Control: no-store` |
| POST | `/api/admin/system-settings/reoon` | 整对象保存，返回保存后的配置 |
| GET | `/api/admin/system-settings/reoon/balances` | 按已保存配置的顺序并发查询各账号余额，返回 `{"items": [{"name", "ok": true, "api_status", "daily_credits", "instant_credits"} 或 {"name", "ok": false, "reason": "unauthorized" \| "timeout" \| "upstream_error"}]}` |

- admin 系统设置页新增「Reoon 邮箱验证」区块：可增删账号行（名称、API Key），整体保存；每个已保存账号显示当日剩余、一次性剩余与账号状态，进入页面、点击「刷新额度」和保存成功后加载；额度只显示在名称与 Key 均与已保存配置一致的行，未保存的新增或改动行不显示；查询失败只在该行显示原因，不影响其他行。
- 余额查询单账号超时 15 秒，超时记为该行 `timeout`。

## 公开验证接口

`POST /api/client/tools/email-verify`，不用登录。

请求：`{"email": str}`，去首尾空白后长度不超过 254，且只含一个 `@`；不合规时返回 `VALIDATION_ERROR`（999），不计次、不调用 Reoon。

流程：

1. 按客户端 IP 做固定窗口限流，每 IP 每个纽约自然日 5 次，到纽约次日 0 点重置；超限返回已有的 `RATE_LIMIT_EXCEEDED`（998）。只有通过入口校验的请求才计数。Redis 故障时放行，接受多耗额度，额度耗尽后返回系统繁忙。
2. 读取账号配置并随机打乱顺序，逐个调用 power 模式验证：
   - Reoon 返回验证结果：结束，按下表整理后返回。
   - Reoon 返回 `status:"error"`（无效 key、额度耗尽等）：记录告警日志（账号名 + reason），换下一个账号。
   - 超时、网络错误或响应无法解析：不换账号，直接返回系统繁忙错误，避免同一次查询重复扣额度。
3. 账号列表为空，或全部账号返回 `status:"error"`：返回系统繁忙错误。

单次 Reoon 调用超时 50 秒，低于 nginx 默认 `proxy_read_timeout` 60 秒，不改反代配置。

响应 data（字段名为我方合同，不透传 Reoon 原始响应）：

| 字段 | 类型 | 来源 |
| --- | --- | --- |
| `email` / `username` / `domain` | str | 同名字段 |
| `status` | str | Reoon power `status`，原值透出，前端只对已知取值做 i18n，未知取值按 `unknown` 展示 |
| `score` | int | `overall_score` |
| `is_deliverable` / `is_safe_to_send` / `can_connect_smtp` / `mx_accepts_mail` | bool | 同名字段 |
| `is_catch_all` / `is_role_account` / `is_disposable` / `is_free_email` / `is_disabled` / `has_inbox_full` / `is_spamtrap` | bool | 同名字段 |
| `mx_records` | list[str] | 同名字段 |

新增错误码 `TOOL_SERVICE_BUSY`（27001），文案走后端 i18n，含义为「系统繁忙，请稍后重试」（hydra 2026-10-27：额度用完不单独提示）。覆盖以下场景：无可用账号、全部账号报错、Reoon 超时、网络错误、响应无法解析。

## 工具页展示

- 提交前沿用前端格式校验（`checkEmailFormat`）：格式不合法时就地展示问题清单，不请求后端；常见服务商域名拼写提示照常展示，不阻止提交。
- 格式合法时调用验证接口：按钮进入 loading 并禁用，提示「验证可能需要数十秒」；前端请求超时 70 秒。
- 成功后按竞品展示明细表：总体状态（带状态色）、能否投递、MX 记录列表、邮箱地址、域名、账号类型（普通 / 角色 / 一次性 / 免费邮箱）、是否接收任意地址（catch-all）、评分。
- 失败时在结果区展示错误文案，可重新提交：998 显示前端本地文案「今日免费验证次数已用完，请明天再试」；其他业务码显示后端 msg；网络失败、超时或响应无法解析显示前端本地「暂不可用」文案。
- 页面 H1 下说明、SEO 正文、FAQ 与 `llms.txt` 中「纯格式校验 / 在浏览器内运行」的表述，改为「通过邮件服务器检查邮箱能否收信」，覆盖全部启用语言。
- 隐私表述：页面如实说明地址提交到服务端、由验证服务商核实、不发信；站内「工具本地运行」类表述已追加 Email Checker 例外。
