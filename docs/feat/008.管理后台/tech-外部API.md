# 008 · 外部 API

> 覆盖使用管理员 API Key 访问的独立外部 API 分组。API Key 的生成 / 轮换见 `@tech-系统设置.md`,后台 admin JWT 与节点 JWT-only 边界见 `@tech-后台架构与认证.md`。

## 定位

外部 API 是给第三方系统或自动化脚本读取后台数据的接口组。它不属于浏览器后台管理接口,不使用 admin Access Token / Refresh Token,也不使用节点本地 JWT-only 鉴权。

## 通用约定

- 路由前缀:`/api/external`。
- 挂载角色:只在 business role 挂载,download role 不挂载。
- 鉴权方式:`Authorization: Bearer <api_key>`。
- API Key 来源:管理员在系统设置页生成;数据库只保存 hash、前缀和生成时间。
- 鉴权依赖:新增 `get_external_api_admin()` 或同等命名的依赖,只负责校验 API Key hash、管理员存在且启用。
- 响应结构沿用 `{ code, data, msg }`,`code == 10000` 为成功。
- 外部 API 只用 GET / POST。
- 外部 API 不接受 admin JWT,不提供登录 / refresh,不调用 `get_admin_user()` 或 `get_admin_jwt_only()`。
- 外部 API 不代理任意 URL,只聚合本系统已登记节点的数据。

## 系统统计大盘

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/external/system/dashboard` | API Key | 返回系统统计大盘 |

响应 `data`:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `today_registered_count` | int | 今日注册人数 |
| `today_paid_order_amounts` | array | 今日付费订单总额,按币种分组 |
| `today_recharge_amounts` | array | 兼容旧调用方字段,值同 `today_paid_order_amounts` |
| `today_fulfillment_failed_count` | int | 今日履约失败订单数,重点展示 |
| `today_fulfillment_failed_amounts` | array | 今日履约失败订单金额,按币种分组,重点展示 |
| `nodes` | array | 当前节点列表 |
| `google_metrics` | object | 最近一次 GSC / GA4 采集快照 |

`today_paid_order_amounts` / `today_recharge_amounts` / `today_fulfillment_failed_amounts` 每项:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `currency` | string | 币种 |
| `amount` | int | 6 位精度整数金额 |
| `display_amount` | string | 十进制展示金额字符串 |

`nodes` 每项:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `node_id` | int | 节点 ID |
| `name` | string | 节点名字 |
| `tg_clients` | array | 节点 TG 客户端列表 |
| `network_rate` | object \| null | 节点下载 / 上传速率 |
| `error` | string | 读取该节点本地信息失败时的错误摘要,成功为空字符串 |

`google_metrics`:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `latest_gsc` | object \| null | 最近一条 GSC 快照;未采集过时为 null |
| `latest_ga4` | object \| null | 最近一条 GA4 快照;未采集过时为 null |

`latest_gsc` / `latest_ga4`:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `snapshot_id` | int | `google_metric_snapshots.id` |
| `collected_at` | int | 采集完成时间,毫秒时间戳 |
| `data` | object | 采集时保存的原始 JSON;GSC 含 24H/7D/28D 窗口,GA4 含 30m/today/7D/28D 窗口 |

`tg_clients` 每项:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `phone` | string | TG 客户端手机号 |
| `has_session_file` | bool | 当前节点是否存在该手机号的 session 文件 |
| `active_request_count` | int | 当前活跃请求数 |
| `download_rate_bytes_per_second` | int \| null | TG 客户端当前下载读取速率 |
| `is_discovered` | bool | 是否已进入当前节点运行态 |
| `status` | string | 调度运行态:`available` / `cooldown` / `unavailable` / 空字符串 |
| `is_available` | bool | 当前是否可参与调度 |
| `cooldown_until` | int | 冷却截止 Unix 秒;没有冷却为 0 |
| `cooldown_remaining_seconds` | int | 冷却剩余秒数;没有冷却为 0 |
| `cooldown_reason` | string | 冷却原因 |
| `unavailable_until` | int | 临时不可用截止 Unix 秒;长期不可用为 0 |
| `unavailable_remaining_seconds` | int | 临时不可用剩余秒数;长期不可用为 0 |
| `unavailable_permanent` | bool | 是否长期不可用,如 session 失效 |
| `unavailable_reason` | string | 不可用原因,如 `flood_wait` / `session_invalid` |
| `unavailable_error` | string | 不可用错误详情 |
| `unavailable_at` | int | 最近标记不可用时间 Unix 秒 |
| `health_status` | string | 健康状态:`ok` / `flood_wait` / `session_expired` / `failed` / 空字符串 |
| `health_message` | string | 健康状态说明 |
| `health_checked_at` | int \| null | 健康状态检查时间 Unix 秒 |

TG 客户端状态判断:

- 正常:`is_available=true` 或 `health_status=ok`。
- CD / 冷却:`status=cooldown` 或 `health_status=flood_wait`;优先展示 `cooldown_remaining_seconds`。
- session 失效:`health_status=session_expired` 或 `unavailable_reason=session_invalid`;需要重新登录该 TG 客户端。
- 其他不可用:`status=unavailable` 或 `health_status=failed`;展示 `unavailable_error` / `health_message`。
- 未加载:`is_discovered=false` 且 `status` / `health_status` 为空;表示 session 文件存在但未进入当前节点运行态。

`network_rate`:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `rx_bytes_per_second` | int | 节点入站速率,按现有监控口径 |
| `tx_bytes_per_second` | int | 节点出站速率,按现有监控口径 |
| `sampled_at` | int | 采样时间 Unix 秒 |

## 统计口径

- 今日边界使用运营统计时区 `UTC+8` / `Asia/Shanghai` 自然日,与现有 Dashboard 口径保持一致。
- 今日注册人数:统计未注销用户今日创建数量。
- 今日付费订单总额:统计今日已支付且履约成功或履约失败的所有商品订单,按 `currency` 分组汇总,不同币种不混加。
- 今日履约失败:在今日付费订单统计口径内额外筛选 `callback_status = FAILED`,返回失败订单数量和按币种分组的失败金额。
- `today_recharge_amounts` 是历史字段名,为避免外部调用方立刻改字段,当前值与 `today_paid_order_amounts` 完全一致。
- 金额使用订单系统 6 位精度整数金额口径;展示金额只在响应边界转换为字符串。
- 当前节点列表来自业务库 `service_nodes`,包含启用和停用节点,按节点 ID 正序。
- 节点 TG 客户端列表来自节点本地快照。
- 节点下载 / 上传速率来自节点本机监控快照。
- Google 指标来自 `google_metric_snapshots` 表,分别按 `metric_type=GSC/GA4` 取 `collected_at desc, id desc` 的最后一条。

## 节点读取规则

外部 API 由业务服务器聚合节点数据:

1. 读取 `service_nodes` 列表。
2. 对每个节点按 `internal_base_url` 请求节点内部快照接口。
3. 节点内部快照接口走 `/internal` 前缀,业务服务器并发请求各节点并携带内部共享凭证,不接受外部 API Key 或 admin JWT。
4. 单节点请求失败时,该节点保留在结果里并写 `error`。

新增节点内部快照接口:

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/internal/service-node/dashboard-snapshot` | 校验内部共享凭证后返回当前节点 TG 客户端列表与网络速率 |

内部快照响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `tg_clients` | array | 当前节点 TG 客户端列表 |
| `network_rate` | object \| null | 当前节点网络速率 |

边界:

- 外部 API Key 只到业务服务器,不透传给下载节点。
- 不复用 `/api/admin/tg/clients` 或 `/api/admin/node-monitor/network-rate`,因为那组接口的鉴权是 admin JWT / 节点 JWT-only。
- `/internal/service-node/dashboard-snapshot` 不读业务数据库,可在 business / download role 上挂载。
- `/internal/service-node/dashboard-snapshot` 使用 `service_node.internal_auth_token`;未配置或凭证错误时拒绝访问。部署层内网隔离仍作为额外边界。

## 错误处理

- API Key 缺失、格式错误、hash 不匹配、管理员停用:返回鉴权失败。
- 数据库统计失败:整个接口失败。
- Google 快照 JSON 损坏:整个接口失败,调用方稍后重试或管理员修复数据。
- 单个节点读取失败:该节点保留在 `nodes` 中,`tg_clients=[]`,`network_rate=null`,`error` 写失败摘要,其他节点继续返回。
- 不做自动重试;调用方可稍后重试。

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| 外部 API 鉴权 | `@backend/src/app/api/external_dependencies.py` | `@backend/src/app/services/admin_api_key_service.py` |
| 系统统计大盘 | `@backend/src/app/api/external/external_system_dashboard.py` | `@backend/src/app/services/external_system_dashboard_service.py` |
| 节点内部快照 | `@backend/src/app/api/internal/service_node_dashboard_snapshot.py` | 复用 `tg_client_service`、`monitor_service` |
