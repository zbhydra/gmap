# 000 · 架构 · 前端可观测与 SLS 打点

> 本文件是 website / extension / extension-bing 三端行为打点的**唯一事实来源**：SLS 配置、字段表、事件字典、脱敏规则、异常捕获。
> **SLS 只在前端写入，后端 Python 不写 SLS**（后端用标准 logging，见 `@tech-backend.md` §7）。本文以代码为准。

## 1. 通道裁决

打点共两条通道，**默认只写 SLS**：

| 通道 | 用途 | 写入方 |
| --- | --- | --- |
| SLS WebTracking | 全部行为与诊断事件 | 三端前端 |
| 后端 `mark_logs` | 仅管理后台 Dashboard 聚合必需的转化事件 | 经 `POST /api/client/mark/record` |

**为什么默认只写 SLS**：后端 `MarkType` 是枚举白名单（`backend/src/app/constants/mark.py`），新增事件必须同步改后端才不返回 422；把点击级事件灌进业务库既污染数据，又让每次埋点都要动后端。只有插件安装、首访、订阅漏斗上游这类进入运营报表的事件保留双写。

双写白名单（website）：`web_first_opened`、`web_extension_install_click`、`web_pricing_open_from_extension`、`web_extension_store_review_click`、`web_credit_purchase_modal_open`、`web_credit_purchase_buy_click`。插件端仅 `install` 双写。其余事件一律 SLS-only。

## 2. 阿里云 SLS 配置

三端**共用一个 project + 一个 logstore**，靠 `client_product` 区分产品线。

**已建索引**（2026-10-25，17 个字段全部开启查询与统计）：`__topic__`、`__source__`、`site`、`client_product`、`mark_type`、`mark_msg`、`device_id`、`user_id`、`page_path`、`mark_time`、`first_opened_at`、`first_opened_days`、`user_agent`、`language`、`viewport`、`surface`、`extension_version`。全文索引开启。新增字段时必须同步补索引，否则只能走全文检索、无法分组统计。

| 项 | 值 |
| --- | --- |
| Project | `gmap` |
| Region | 日本 |
| 公网 Host | `ap-northeast-1.log.aliyuncs.com` |
| Logstore | `gmap-mark-logs` |
| Topic | `mark-log` |
| WebTracking | 已开启（匿名 GET 写入） |

**产品线标识**（`client_product` 与 `__source__` 同源，均为构建期常量，不接受环境变量覆盖）：

| 端 | `client_product` / `__source__` | `site` |
| --- | --- | --- |
| website | `web` | `website` |
| Maps 插件 | `extension-maps` | `extension` |
| Bing 插件 | `extension-bing` | `extension` |

不拆多个 logstore 的理由：三端字段同构、量级相近、同一团队维护；共用后跨端漏斗一条查询即可完成，新增产品线只需增加一个 `client_product` 取值。若将来需要按产品隔离 RAM 权限或保留期，再按 `__topic__` 分流，不为此提前拆库。

## 3. 环境变量

website 读取 `import.meta.env.PUBLIC_ALI_SLS_*`；插件运行时代码不读 `import.meta.env`，由各端 `vite.config.ts` 读取 `EXTENSION_ALI_SLS_*` 并注入 `__ALI_SLS_MARK_CONFIG__`，同时兼容同名 `PUBLIC_ALI_SLS_*`。

| 变量 | 用途 |
| --- | --- |
| `PUBLIC_ALI_SLS_PROJECT` | SLS Project 名 |
| `PUBLIC_ALI_SLS_HOST` | 公网 host |
| `PUBLIC_ALI_SLS_ENDPOINT` | 完整 endpoint，可替代 `PROJECT`+`HOST` |
| `PUBLIC_ALI_SLS_LOGSTORE` | Logstore 名 |
| `PUBLIC_ALI_SLS_TOPIC` | `__topic__` 值，默认 `mark-log` |
| `PUBLIC_ALI_SLS_ENABLED` | `false` 时整体关闭 |
| `EXTENSION_ALI_SLS_*` | 插件端同字段覆盖；生产构建未配置时取 §2 默认值，dev 未配置时关闭 |

`__source__` 无独立环境变量：它是产品身份，由构建常量派生，避免与 `client_product` 漂移。

## 4. WebTracking URL 协议

阿里云 SLS WebTracking **HTTP GET**（不 POST、不用 `__logs__`、不引入 SDK、不新增 npm 依赖）：

```text
https://{project}.{host}/logstores/{logstore}/track?APIVersion=0.6.0&__topic__=mark-log&__source__={source}&{字段...}
```

请求参数：`method: 'GET'`、`credentials: 'omit'`（不带 Cookie）、`keepalive: true`（降低离页取消概率）。WebTracking 响应允许通配 CORS，不为 SLS 申请 `host_permissions`。失败只写 `console.error` / `logger.error` 后吞掉，**不影响**任何业务操作。

## 5. 字段表

### 5.1 公共字段

| 字段 | 来源 / 说明 |
| --- | --- |
| `event` | 固定 `mark-log` |
| `site` | §2 产品线表 |
| `client_product` | §2 产品线表 |
| `mark_type` | 事件字典（§6） |
| `mark_msg` | `key=value, key=value` 或完整 JSON；≤ 1000 字符 |
| `device_id` | 三端匿名设备标识 |
| `mark_time` | `Date.now()` 毫秒 |
| `first_opened_at` | website 本地首访毫秒；插件为首次安装毫秒（`INSTALLED_AT`） |
| `first_opened_days` | 距首次访问/安装的天数，`0` = 首日，`-1` = 未知。新用户分析的核心维度 |
| `page_path` | website 为 `location.pathname`；插件为页面 URL 的 pathname |
| `user_agent` | 裁剪至 512 |
| `language` | `navigator.language` |
| `viewport` | `${innerWidth}x${innerHeight}` |

### 5.2 插件端附加字段

| 字段 | 说明 |
| --- | --- |
| `user_id` | 已登录为账号 ID（website 从 JWT 载荷读取，不验签），匿名固定 `0` |
| `extension_version` | `chrome.runtime.getManifest().version` |
| `surface` | 事件发生的插件界面：`popup` / `content` / `dashboard` / `options` / `background` |

`surface` 由来源 URL 推断：扩展页按文件名判定（`popup.html` / `dashboard.html` / `options.html`），宿主页面一律视为 `content`，无来源时按 `background`。

长度上限：`mark_msg` 1000、`user_agent` 512、其他文本字段 256。

## 6. 事件字典

命名口径 `<对象>_<动作>`。高频、易变的界面按钮统一收敛为单个动作事件，按钮名进 `mark_msg` 的 `action` 字段——按钮会随 UI 迭代增删，每加一个就扩一次事件合同会让 SLS 里的事件名失控，而查询按 `action` 分组并不损失粒度。

### 6.1 website

| mark_type | 触发 | mark_msg 关键字段 |
| --- | --- | --- |
| `web_first_opened` | 首次访问（双写） | — |
| `web_page_view` | 每个页面加载 | `path`、`locale`、`ref_host`、`utm_*` |
| `web_cta_click` | 任意 `data-cta` 元素点击 | `cta_id`、`tag`、`href`、`utm_*` |
| `web_ui_action` | 带 `data-ga-event` 的按钮、导航、语言切换 | `action`、`event`、`utm_*` |
| `web_auth_event` | 登录流程各阶段 | `stage`(modal_open/modal_close/send_code/code_login)、`outcome`、`reason` |
| `web_checkout_event` | Pricing 与下单流程 | `stage`(pricing_view/pricing_tab_switch/plan_click/checkout_submit/checkout_success/checkout_failed)、`product_kind`、`sku`、`payment_method` |
| `web_dashboard_action` | Dashboard 工作区动作 | `action`(view_switch/job_submit/job_submit_failed/session_expired/api_key_generate/api_value_copy/mcp_grant_revoke) |
| `web_tool_event` | 免费工具使用 | `action`(view/use/copy/download/open_link)、`tool_id` |
| `web_mcp_event` | MCP 授权流程 | `action`(consent_view/consent_decide)、`client_name`、`is_loopback` |
| `web_api_error` | HTTP 4xx/5xx 与业务码 | `method`、`api_path`、`http_status`、`code`、`message` |
| `web_extension_install_click` | 插件安装 CTA（双写） | 资源摘要 JSON |
| `web_pricing_open_from_extension` | 插件来源进入 Pricing（双写） | — |
| `web_extension_store_review_click` | 插件商店评价点击（双写） | — |
| `web_credit_purchase_modal_open` | 积分购买弹窗打开（双写） | — |
| `web_credit_purchase_buy_click` | 积分购买按钮点击（双写） | — |
| `web_backend_connect_failed` | fetch 拒绝或超时 | `method`、`api_path`、`failure_reason`、`timeout_ms` |
| `web_frontend_uncaught_error` | 全局未捕获异常 | `error_kind`、`error_name`、`error_message`、`page_path`、`file`、`line` |

### 6.2 Maps 插件

| mark_type | 触发 | mark_msg 关键字段 |
| --- | --- | --- |
| `install` | 安装/更新（双写） | `reason`、`version` |
| `popup_open` | 弹窗打开 | — |
| `content_open` | content 初始化 | — |
| `ui_action` | popup / 面板动作 | `action`(open_maps/open_bulk_dashboard/sign_in/sign_out/start/pause/resume/export/reset/start_reviews/start_photos/open_pricing/quota_blocked)、`source`、`surface` |
| `search` | 搜索采集开始 | `kw`、`bulk` |
| `search_finish` | 采集进入终态 | `count`、`stop_reason`(limit/end)、`limit`、`mode`(search/list) |
| `scrape_reviews_content` | 评论采集开始 | `fid` |
| `scrape_photos_content` | 照片采集开始 | `fid` |
| `export_results` | 导出 | `count`、`format`、`kw` |
| `pricing_open` | 打开官网订阅页 | `source`、`plan` |
| `bulk_task_create` | 批量任务创建 | `type`、`count`、`chunks`、`start_now` |
| `bulk_task_action` | 批量任务状态动作 | `action`(start/pause/delete)、`ok`、`code` |
| `settings_change` | 设置项变更 | `key=value` 列表 |
| `sync_to_google_drive` | Drive 同步 | `rows`、`outcome` |
| `enrich_complete` | Email/社媒补全完成 | `count`、`written`、`partial`、`ok` |
| `extension_uncaught_error` | 三上下文未捕获异常 | `kind`、`name`、`message`、`file`、`line` |

### 6.3 Bing 插件

| mark_type | 触发 | mark_msg 关键字段 |
| --- | --- | --- |
| `install` | 安装/更新（双写） | `reason`、`version` |
| `popup_open` | 弹窗打开 | — |
| `content_open` | content 初始化 | — |
| `ui_action` | popup / 面板动作 | `action`(sign_in/sign_out/start/stop/go_back/export) |
| `search` | 采集开始 | `version`(适配器名) |
| `search_finish` | 采集进入终态 | `count`、`stop_reason`(free_limit/manual/failure/end)、`adapter` |
| `free_limit_reached` | 免费档行数截断 | `count` |
| `gate_state_change` | 登录/Pro 门控翻转 | `authenticated`、`is_pro` |
| `export_results` | 导出 | `format`、`count`、`plan` |
| `pricing_open` | 打开官网订阅页 | `source` |
| `enrich_complete` | Email/社媒补全完成 | `count`、`written`、`partial`、`ok` |
| `extension_uncaught_error` | 三上下文未捕获异常 | `kind`、`name`、`message`、`file`、`line` |

## 7. 脱敏规则

- website 的结构化 `mark_msg` 先解析 JSON，逐字段脱敏（移除 URL query、token、完整下载直链）后重新序列化，超长时逐级降级，**禁止直接切片**破坏 JSON 结构。插件按普通文本裁剪。
- **不发送**：Cookie、Authorization、访问令牌、完整下载直链、用户输入 URL query、API base URL。
- API path 预脱敏，只保留 path。
- 异常诊断字段额外走 `sanitizeSlsDiagnosticField()`，用 `REDACTED_KEY_VALUE_RE` 把敏感 key 的值替换为 `_redacted`，保证 JSON 仍可解析。

## 8. 异常捕获

| 端 | 实现 | 覆盖上下文 |
| --- | --- | --- |
| website | `website/src/scripts/homepage/frontend-error-capture.ts` | 全局 `error` / `unhandledrejection` |
| 两个插件 | `core/utils/uncaughtErrorMark.ts` | background / content / popup / options / dashboard |

共同口径：同指纹 30 秒去重；只报 `error_name` / `error_message` / 位置，不报堆栈与页面数据；上报失败不产生二次未处理 rejection。

资源加载失败（图片/脚本/样式）不捕获，噪音过高。

## 9. 覆盖入口

| 端 | 入口 |
| --- | --- |
| website | `layouts/Layout.astro`（页面浏览） |
| website | `scripts/globalClickEvents.ts`（`data-cta` 与 `data-ga-event` 全局委派） |
| website | `scripts/homepage/web-mark.ts`（事件辅助出口：`trackPageView` / `trackCtaClick` / `trackUiAction` / `trackAuthEvent` / `trackCheckoutEvent` / `trackDashboardAction` / `trackToolEvent` / `trackMcpEvent` / `trackApiError`） |
| website | `scripts/homepage/api.ts`（连接失败 + 业务错误） |
| website | `components/auth/site-auth-controller.ts`、`components/pricing/pricing-page-controller.ts`、`components/order-checkout/order-checkout-controller.ts`、`components/dashboard/*`、`components/auth/McpOAuthConsent.vue` |
| Maps | `background/services/ExtensionMarkReporter.ts`（跨上下文事件统一写 SLS） |
| Maps | `sites/maps/content/bootstrap.ts`（面板动作）、`photos/photosScraper.ts`、`dashboard/App.vue`、`options/App.vue`、`popup/App.vue` |
| Bing | `sites/bing/content/marks.ts`（content 打点出口）、`bootstrap.ts`、`collector.ts`、`gate.ts`、`panel/BingPanel.vue`、`popup/App.vue` |

## 10. 业务流程要点

- 所有打点 **fire-and-forget**，任一通道失败都不阻断用户操作。
- 插件 content 事件经 `ChromeEventEmitter` 广播，background 统一写 SLS；popup / dashboard / options 经 `recordMark` RPC 由 background 代写，`page_path` 取 `senderUrl` 以便区分界面。
- 后端不可用时，SLS 可达则保留客户端侧日志，排障时与 `mark_logs` 对照判断丢失窗口。
- `search_finish` / `search` 的 `stop_reason` 是判断免费→付费转化的直接依据：`limit` / `free_limit` 表示被额度截断。

## 11. 看板

project `gmap` 下三份 dashboard，结构与 tg-download 对齐（统计口径 Asia/Shanghai 自然日、设备去重 `approx_distinct(device_id)`、时间范围最近 30 天）：

| 看板 | 过滤 | 图表数 |
| --- | --- | --- |
| `gmap-website` | `client_product = 'web'` | 8 |
| `gmap-extension-maps` | `client_product = 'extension-maps'` | 9 |
| `gmap-extension-bing` | `client_product = 'extension-bing'` | 9 |

每份看板在 tg-download 原有图表之外，固定追加三张新用户分析图：新用户趋势（`first_opened_days = 0`）、留存曲线（`first_opened_days` 分桶）、新用户首日行为构成（按 `mark_type` 分组）。

完整的图表清单与 SQL 原文见 `docs/scratch/gmap-dashboards.md`（临时调研产物，不入 git）；需要长期留存时把关键 SQL 迁入本文件。

**依赖 `mark_msg` 的图表**：采集终态与额度截断类图表用 `mark_msg LIKE '%stop_reason=limit%'` 之类的条件过滤。如果后续把 `mark_msg` 改成 JSON 格式，这些条件必须同步调整。

## 12. 与旧文档的差异

本文替代此前的 `tg-download` 口径（project `tg-download`、logstore `tg-download-mark-log`、新加坡 region、`__source__` 独立环境变量）。现役配置以 §2 为准；插件端 `client_product` 从共用的 `extension` 拆分为 `extension-maps` / `extension-bing`，修复了两端事件在 SLS 中无法区分的问题。
