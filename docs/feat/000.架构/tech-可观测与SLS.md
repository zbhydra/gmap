# 000 · 架构 · 前端可观测与 SLS 双写细节

> 对应 `feat.033.website前端SLS日志双写` + `feat.033.002.website前端SLS异常捕获`。本文件补 `@tech-website.md` §7 没写全的细节:完整字段表、环境变量、WebTracking URL 协议、脱敏规则、两类异常事件。extension 独立 mark-log 入口见 `@tech-extension.md` §A7。
> **SLS 在 website / extension 前端写入,后端 Python 不写 SLS**(后端用标准 logging,见 `@tech-backend.md` §7)。规则条文见根 `@../../../AGENTS.md`。本文以代码为准。

## 1. 实现文件

| 站点 | 文件 |
| --- | --- |
| website | `website/src/scripts/homepage/sls-mark.ts` |
| extension | `extension/src/core/api/mark/sls.ts`、`extension/src/core/api/mark/api.ts`、`extension/src/core/content/services/ContentMarkReporter.ts`、`extension/src/background/services/ExtensionMarkReporter.ts` |
| Website 共享实现 | `website/src/scripts/homepage/mark.ts`(`recordHomepageMark` 双写入口)、`website/src/download/scripts/media-api.ts`(下载节点连接失败 → SLS)、`website/src/scripts/homepage/api.ts`(后端连接失败 → SLS) |
| 异常捕获 | `website/src/scripts/homepage/frontend-error-capture.ts` |
| 脱敏 | `website/src/scripts/homepage/mark-sanitizer.ts`、`extension/src/core/api/mark/mark-sanitizer.ts` |

## 2. 阿里云 SLS 配置

| 项 | 值 |
| --- | --- |
| Project | `tg-download` |
| Region | 新加坡 |
| 公网 Host | `ap-southeast-1.log.aliyuncs.com` |
| Logstore | `tg-download-mark-log` |
| WebTracking | 已开启(匿名 GET 写入) |

## 3. 环境变量

website 读取 `import.meta.env.PUBLIC_ALI_SLS_*`；extension 运行时代码不读 `import.meta.env`，由 `vite.config.ts` 读取 `EXTENSION_ALI_SLS_*` 并注入 `__ALI_SLS_MARK_CONFIG__`，同时兼容同名 `PUBLIC_ALI_SLS_*`。

| 变量 | 用途 |
| --- | --- |
| `PUBLIC_ALI_SLS_PROJECT` | SLS Project 名(`tg-download`) |
| `PUBLIC_ALI_SLS_HOST` | 公网 host(`ap-southeast-1.log.aliyuncs.com`) |
| `PUBLIC_ALI_SLS_ENDPOINT` | 完整 endpoint,可替代 `PROJECT`+`HOST`(如 `https://tg-download.ap-southeast-1.log.aliyuncs.com`) |
| `PUBLIC_ALI_SLS_LOGSTORE` | Logstore(`tg-download-mark-log`) |
| `PUBLIC_ALI_SLS_TOPIC` | `__topic__` 值,默认 `mark-log` |
| `PUBLIC_ALI_SLS_SOURCE` | `__source__` 值;未配时回落到固定站点名 `website` |
| `PUBLIC_ALI_SLS_ENABLED` | `false` 时整体关闭 |
| `EXTENSION_ALI_SLS_*` | 插件端同字段覆盖；生产构建未配置时默认 project/host/logstore/topic/source 为 `tg-download` / `ap-southeast-1.log.aliyuncs.com` / `tg-download-mark-log` / `mark-log` / `extension`，dev 未配置时关闭 |

## 4. WebTracking URL 协议

阿里云 SLS WebTracking **HTTP GET**(不 POST、不用 `__logs__`、不引入 SDK、不新增 npm 依赖):

```text
https://{project}.{host}/logstores/{logstore}/track?APIVersion=0.6.0&__topic__=mark-log&__source__={source}&{字段...}
```

请求参数:`method: 'GET'`、`credentials: 'omit'`(不带 Cookie)、`keepalive: true`(降低离页取消概率,安装 CTA 跳转场景关键)。WebTracking 响应允许通配 CORS，不为 SLS 申请 `host_permissions`。失败只写 `console.error` / `logger.error` 后吞掉,**不影响**页面解析/下载/安装 CTA/登录/订阅/插件下载。

## 5. mark-log 字段表(`buildSlsMarkFields`)

| 字段 | 必填 | 来源 / 说明 |
| --- | --- | --- |
| `event` | 是 | 固定 `mark-log` |
| `site` | 是 | `website` / `extension` |
| `client_product` | 是 | website 固定 `web`；extension 固定 `extension` |
| `mark_type` | 是 | 现有 mark type(如 `web_parse_click`) |
| `mark_msg` | 是 | 业务 builder 生成的不超过 1000 字符的脱敏内容；website 的结构化内容必须保持完整 JSON |
| `device_id` | 是 | RequestContext 的 deviceId |
| `page_path` | 是 | `location.pathname` |
| `mark_time` | 是 | `Date.now()` 毫秒 |
| `first_opened_at` | 是 | website 本地首次打开毫秒时间；extension 固定 `0` |
| `user_agent` | 是 | `navigator.userAgent` 裁剪 |
| `language` | 是 | `navigator.language` |
| `viewport` | 是 | `${innerWidth}x${innerHeight}` |

字段长度上限:`mark_msg` 1000、`user_agent` 512、其他文本字段 256。

## 6. 脱敏规则(`mark-sanitizer.ts`)

- website 的结构化 `mark_msg` 先解析 JSON,逐字段脱敏(移除 URL query、token、完整下载直链)后重新序列化并在字段层降级到 1000 字符以内；禁止直接切片。extension 仍按普通文本裁剪。
- 异常诊断字段额外走 `sanitizeSlsDiagnosticField()`:脱敏后用 `REDACTED_KEY_VALUE_RE` 把敏感 key 的值替换为 `_redacted`,保持 JSON 仍可解析。
- **不发送**:Cookie、Authorization、访问令牌、完整下载直链、用户输入 URL query、API base URL。
- API path 预脱敏(只留 path)。

## 7. 只写 SLS 的事件

下列事件**不请求** `/api/client/mark/record`、**不进**后端 `mark_logs`:

| `mark_type` | 触发 | `mark_msg` 口径 |
| --- | --- | --- |
| `web_frontend_uncaught_error` | 全局 `error` / `unhandledrejection` 捕获未处理异常 | `error_kind`、`error_name`、`error_message`、`page_path`、`source_file`、`line`、`column` |
| `web_backend_connect_failed` | `fetch` reject 或 AbortController 超时(连不上/超时) | `method`、`api_path`、`failure_reason`、`error_name`、`error_message`、`timeout_ms` |
| `upgrade_modal_open` | extension 共享升级弹窗从隐藏进入显示 | 空字符串 |
| `download_click` | extension 单个资源进入共享下载队列 | `resource_type`、`source_kind` |
| `download_success` | extension 单个资源完成实际下载 | `resource_type`、`source_kind` |
| `download_failed` | extension 单个资源下载抛错 | `error_name`、`error_message`、`resource_type`、`source_kind` |
| `download_quota_insufficient` | extension 单个资源因额度不足未开始下载 | `resource_type`、`source_kind` |

边界:
- **HTTP 4xx / 5xx 业务错误**不触发 `web_backend_connect_failed`(服务器已返回响应,不属于「连不上或超时」)。
- 图片/脚本/样式等**资源加载失败**不捕获(噪音高)。
- 同一页面生命周期内按错误指纹做短窗口去重,避免重复日志。
- SLS 上报 promise 内部 catch,不产生二次未处理 rejection。
- `upgrade_modal_open` 不按错误指纹去重;只由弹窗可见状态跃迁控制,关闭后重开会再次记录,不区分触发入口。
- extension 下载事件以单个资源任务为单位;批量下载 N 个资源产生 N 组事件。额度拒绝记录 `download_click` + `download_quota_insufficient`,不误记成功或失败;失败消息不携带媒体 URL、文件名或消息身份,并继续经过统一脱敏与长度限制。
- extension 接入行为 mark-log(包含 `upgrade_modal_open`),不接入全局 `error` / `unhandledrejection` 和后端连接失败 SLS-only 事件。

## 8. 覆盖入口

| 站点 | 入口 |
| --- | --- |
| website | `website/src/scripts/homepage/mark.ts` 兼容入口；实现为 `website/src/scripts/homepage/mark.ts` 的 `recordHomepageMark()` |
| website | `website/src/scripts/homepage/first-opened-mark.ts` 首次访问 mark-log |
| website | `website/src/scripts/globalClickEvents.ts` 安装 CTA mark-log |
| website | `website/src/components/pricing/pricing-page-controller.ts` 插件升级入口 Pricing 曝光 |
| website | `website/src/components/pricing/pricing-subscription-confirm-controller.ts` 插件商店评价点击 |
| website | 全局 `error` / `unhandledrejection` |
| website | `website/src/scripts/homepage/api.ts` 连接后端失败/超时 |
| website | `website/src/download/scripts/media-api.ts` 连接解析/下载节点失败/超时 |
| extension | `extension/src/popup/App.vue` 弹窗打开 |
| extension | `extension/src/sites/telegram/content/index.ts` content 初始化 |
| extension | `extension/src/core/content/download/downloadManager.ts` 所有已发布站点及 Popup 的单资源下载点击、成功、失败 |
| extension | `extension/src/core/content/components/UpgradeModal.vue` 广播升级弹窗打开事件,background 统一写 SLS |

## 9. 业务流程要点

- **下载工作区 mark-log**:用户触发解析/下载/恢复/失败 → `recordHomepageMark()` → 立即 fire-and-forget SLS → 继续请求后端 `/api/client/mark/record`;任一通道失败都不阻断用户操作。
- **安装 CTA**:`globalClickEvents.ts` 生成 `web_extension_install_click` → SLS(keepalive)→ `postJsonKeepalive()` 请求后端 mark;CTA 跳转不被等待。
- **插件升级入口 Pricing 曝光**:网页精确检测 `utm_source=extension&source=quota_upgrade_button` → `recordHomepageMark()` 双写 `web_pricing_open_from_extension`;页面刷新重复写入,其他来源不写该类型,失败不阻断 Pricing 初始化。
- **插件商店评价点击**:Pricing 订阅确认弹窗点击“去好评” → `recordHomepageMark()` 双写 `web_extension_store_review_click`,空 `mark_msg`;每次点击都发起,失败不阻断商店跳转和领取倒计时。
- **首次打开网站时间**:website 首次运行时把毫秒时间戳写入 `homepage_first_opened_at`;SLS 的 `first_opened_at` 与后端 `mark_logs.first_opened_at` 使用同一口径,旧客户端不传后端字段时默认 `0`。extension 只写 SLS，`first_opened_at` 固定为 `0`。
- **首次访问事件**:website 确认 `homepage_first_opened_at` 后,若本机没有 `homepage_web_first_opened_submitted_at` 提交标记,异步上报 `web_first_opened`,同时写 SLS 与后端 `mark_logs`,并写入提交标记。`localStorage` 不可用或写入失败时仍上报,`mark_msg` 为 `{"reason":"localStorage_unavailable"}`;这种场景不能跨刷新去重,Dashboard 排查时按 reason 区分。
- **后端不可用**:后端 mark 失败/超时,业务静默处理;SLS 可达则留客户端侧日志,排障时与后端 `mark_logs` 对照判断丢失窗口。
- **插件 mark-log**:旧的插件后端 mark 写入已改为只写 SLS；content 事件通过 background 发起，popup 打开事件直接发起。下载生命周期统一由 content 的共享下载队列上报，失败只打 `logger.error`，不影响下载。
- **插件升级弹窗曝光**:`UpgradeModal` 从隐藏进入显示 → 广播 `upgradeModalOpened` → background 异步写 `upgrade_modal_open`;已显示时不重复,关闭后重开重新记录,来源不进入事件合同。

## 10. 与源文档差异

- feat.033 字段表、环境变量、URL 协议、脱敏、异常事件名与代码实现一致。
- feat.033 §3「阿里云侧配置」中的测试 mark_type `manual_test_20260608124539` 是建仓期的一次性验证值,非生产配置,本文不收录。
- 实现层多了 `inferSlsMarkSite()`(hostname 兜底推断 site)、`frontend-error-capture.ts`(独立异常捕获器)与指纹去重,源文档未单列,本文据此补齐。
