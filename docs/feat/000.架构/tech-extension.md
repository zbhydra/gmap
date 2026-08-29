# 000 · 架构 · 浏览器插件 + 管理后台

> ⚠️ **历史状态(2026-08-29)**:`extension/` 已改造为 Maps Extractor 插件(013 域),本文描述的 Telegram 注入/下载架构不再存在于代码中,仅作历史与机制参考;Maps 插件的合同以 `../../013.Maps插件/` 为准。
> **插件是 Chrome Manifest V3**（`vite-plugin-web-extension` + `@types/chrome`）。本文件记录插件 `extension/` 与管理后台 `admin/` 的稳定结构和已确认契约。规则条文见根 `@../../../AGENTS.md` 与 `@../../references/specs/spec-extension.md`。

## A. 浏览器插件 `extension/`

### A1. 技术栈

- **Vue 3.5 + Pinia 3 + vue-i18n 11 + Tailwind 4 + Vite 7**（`extension/package.json`）。
- 构建：`vite-plugin-web-extension`。
- 本地调试：`pnpm dev` 使用 `vite build --watch --mode development` 构建 `dist`，并通过当前 Microsoft Edge 的 CDP `DevToolsActivePort` 执行 `Extensions.loadUnpacked` 重新加载本地 unpacked extension；不创建新 profile，不接管浏览器启动。
- **Chrome Manifest V3**（`manifest_version: 3`）：平台发布状态以 `extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 为准，权限与入口的最终组装以 `extension/vite.config.ts` 的 `webExtension({ manifest })` 配置为准。标签页 URL 只通过已限定的平台 host_permissions 读取，不申请 `activeTab` 或 `tabs`。API 与 SLS 走标准 CORS，官网登录桥接由 `externally_connectable.matches` 封闭信道授权（对端是网页，经 `onMessageExternal` 接收并校验 `sender.origin`，不注入 content script、不产生权限警告、不授予 host access），三者均不重复进入 host_permissions。
- e2e：Playwright。
- 入口页：`popup`（`src/popup.html`）。旧 `options_page` 已删除,购买与订阅管理统一跳官网 Pricing。

### A2. 目录结构（三上下文 + 共享核心）

```
extension/src/
├── background/           # Service Worker 上下文
│   ├── index.ts          # SW 入口（device_id 初始化）
│   ├── background-register.ts
│   ├── rpc/content.rpc.ts
│   └── services/         # BackgroundMessageRouter / BrowserDownloadService / BadgeManager
├── content/              # Content Script 上下文
│   ├── content-register.ts
│   └── rpc/              # background / injected / 唯一 injectedClient
├── injected/             # MAIN world 注入上下文
│   └── injected-register.ts
├── core/                 # 跨上下文共享核心（插件内部共享层）
│   ├── api/              # config.ts / client/(HttpClient,interceptors) / auth/ mark/ quota/ subscription/ order/
│   ├── rpc/              # 自研 RPC 框架（见 A4）
│   │   ├── serve.ts / errors.ts / injectedReady.ts
│   │   ├── transports/   # ChromeRpcTransport / EventRpcTransport
│   │   ├── types.ts / constants.ts
│   │   └── generator/    # manifest.json + templates（代码生成）
│   ├── stores/           # authStore.ts / quotaStore.ts（Pinia）
│   ├── protocol/ services/ events/ storage/ composables/ constants/ utils/
│   └── components/ content/ injected/
├── popup/                # 工具栏弹窗 UI（popup.html）
│   ├── App.vue / main.ts / components/ / rpc/ / utils/
│   └── stores/resourceStore.ts
├── sites/<platform>/     # 站点特定注入逻辑；content/entry.ts 与 injected/entry.ts 是 manifest 平台入口
└── locales/              # 14 语言 JSON + index.ts（vue-i18n）
```

**上下文划分**：
- `background/`（Service Worker）、`content/`（Content Script）、`injected/`（MAIN world 注入页上下文）各有独立入口与 `*-register.ts`。
- 旧 `options/` 设置页已删除；`popup/`（弹窗 UI）承载资源列表、登录状态、额度/升级入口，底部固定显示可点击、可复制的支持邮箱，复制结果通过全局 Toast 反馈。Popup 最小尺寸为 600×400px；空态资源区填满 header 与 footer 之间的剩余空间，footer 位于 400px 底边，有资源时列表按内容自然增高。未登录按钮经真实 background RPC 恒新开官网统一登录页（`/extension-login-v2/`），官网 v2 登录页经 `externally_connectable` 消息通道（background `onMessageExternal`）把官网登录态换成插件登录态；Popup 内没有邮箱验证码登录弹窗。
- `core/` 是**跨上下文共享核心**——API 客户端、RPC 框架、Pinia store、协议、存储和 `core/content/download/` 的共享单项下载编排。需要页面媒体 API、分片读取或 mux 的来源由各站点 injected provider 负责；可直接保存的 Vimeo Progressive/Thumbnail 由 content 分流到 background 的 Chrome 下载管理器。Telegram 特有解析留在 `sites/telegram/`。
- Instagram 的生产路径固定为 `PageContext -> routeMediaStore Map -> parser/resolver -> buttons/Popup -> downloadOne/downloadMany -> fixed EventRpc`。DOM 只证明实体和挂载位置，主媒体不来自 thumbnail、poster、CSS 背景或 blob/data URL。

### A3. RPC 系统（自研 v2，声明式 + 代码生成）

目录：`extension/src/core/rpc/`。

- **两种 transport**：
  - `ChromeRpcTransport`：走 `chrome.runtime` message（popup ↔ content ↔ background）。
  - `EventRpcTransport`：走固定 DOM `CustomEvent` 通道（content ↔ injected）。
- **EventRpc 信任边界**：DOM transport 对宿主页面可观察、可伪造、可干扰，这一风险被明确接受。入口只做 method allowlist、请求结构和 payload 大小校验；Event handler 的内部异常只向 DOM 返回固定中性错误，Chrome transport 仍保留可定位错误。Chrome API、storage、token、额度和后端权限操作只留在 content/background，站点下载与解析仍校验 host、redirect、MIME 和媒体类型。
- **运行时日志配置**：扩展不访问宿主页面 Web Storage。生产 DEBUG 开关只存于扩展自有 `chrome.storage.local`，由 background 读取；popup / content 通过 Chrome RPC 获取，content 在 injected ready 后再经非可信 EventRpc 把已收窄的布尔配置同步到 MAIN world。EventRpc 不获得存储读取能力，配置读取或同步失败时各上下文保持生产默认 ERROR 级别，页面业务继续初始化。
- **共享下载契约**：上层批量使用顺序 `for...of`，每项独立进入 `downloadOne(resource)`；该调用先执行一次 `checkAndConsume(1)`，再按来源二选一：完整文件 URL 通过短 background RPC 创建 Chrome 下载并查询轻量状态，其他来源执行覆盖媒体读取与处理的完整 `downloadMedia` EventRpc。明确额度不足只跳过当前项，额度服务异常记录后 fail-open，单项错误记录后继续后续项；重复点击允许重复扣额和重复下载。
- **页面瞬时进度**：Telegram / X / Instagram MAIN 下载器以及 Vimeo content 原生下载协调器通过同一个固定、非可信的 DOM 事件报告 `sourceId + progress`，其中 `progress` 为 `0..100` 数值或不可计算的 `null`；X、Instagram、Vimeo 展示向下取整的整数，Telegram 保留原有小数精度。Vimeo 只在页面存活时按 Chrome 的 `bytesReceived/totalBytes` 更新按钮，导航后停止查询但原生任务继续。该事件不是 RPC 或业务状态，不进入 Popup，不参与额度、去重、完成判定或权限操作；页面内完整下载 RPC 使用 24 小时页面生命周期级超时，卡住时刷新，Scheduler/Queue/DownloadStateManager 仍不存在。
- **Popup 与站点边界**：Instagram Popup 打开或刷新时只查询当前 tab，不订阅跨生命周期状态；列表过时由刷新或重开纠正。各站点只实现自己需要的 injected handler，非 Telegram 站点不实现 Telegram stub；Telegram 的资源事件、解析、扫描、sidebar、清理缓存和批量前确认保持站点内既有行为。
- **声明式注册 + 代码生成**：每个上下文写 `*-register.ts`，只声明方法签名（`Handler` 对象返回 `declarationOnly(...)`），不含实现。
- 生成器 `scripts/rpc-generate.mjs` 读取 `core/rpc/generator/manifest.json` 列出的 register 文件 → 校验**调用矩阵**（`transportMatrix`：popup→content、background→content、content/popup→background 用 chrome；content→injected 用 event）→ 生成 typed client 到 `popup/rpc/`、`content/rpc/`、`background/rpc/`。
- **一致性保证**：`pnpm rpc-generate:check` 挂在 `pretype-check` / `prebuild`，生成产物与声明不一致则构建失败。

详见 `feat.010.重构插件RPC系统`。

### A4. Store（Pinia，分散在各上下文）

- `core/stores/authStore.ts`、`core/stores/quotaStore.ts`（核心共享）
- `popup/stores/resourceStore.ts`（弹窗资源列表）

### A5. 配额（单一 Quota 消耗接口）

插件不暴露通用 Counter API。下载前唯一的计数与额度消耗入口是 `core/api/quota/api.ts` 的 `quotaApi.checkAndConsume()`，调用 `/api/client/quota/check`；是否允许下载只读取响应的 `status`。响应可携带服务端每日额度下一次刷新的毫秒时间戳，该字段仅贯穿 content Shadow DOM 与 Popup 降级事件用于展示分钟倒计时和用户本地时区的具体刷新时刻；字段缺失或弹窗异常不得改变额度结论。对应 `@../003.积分系统/`、`@../005.计数器系统/` 与 `@../006.订阅系统/`。

`core/stores/quotaStore.ts` 另通过 `subscriptionApi.getStatus()` 调用 `/api/client/subscription/status`，读取并派生额度展示状态（`remaining` / `dailyLimit` / `isPaidUser`，`daily_limit === -1` 表示付费无限制），同时接收可选 Telegram 反馈群配置。邀请入口从 `config_public.extension_telegram_feedback_url` 读取；公开网页入口从 `config_public.extension_telegram_feedback_group_username` 读取裸用户名，由 Popup 显示为 `@username` 并链接到对应 `t.me` 网页。两项配置各自为空时只隐藏对应入口。Popup Footer 固定分为两行：第一行是联系邮箱和复制按钮，第二行展示公开群网页链接和加入按钮。加入按钮继续使用 Chrome Tabs API 处理 Telegram Web 导航：优先复用已打开的 Telegram Web 标签并保留 A/K 版本，没有现成标签时创建默认 A 版标签。邀请链接转换为 `tg://join`，公开群转换为 `tg://resolve`，二者都只作为 URL fragment 中编码后的官方 `tgaddr` 启动参数。每次导航都带唯一 query，强制 A 版重新启动并消费只在初始化时读取的 `tgaddr`；已有标签先提交 `chrome.tabs.update`，再聚焦窗口，避免 Popup 失焦销毁中断导航。该链路不依赖 content/injected RPC 或 Telegram 页面的非公开全局 API；加入按钮始终停留在 `web.telegram.org`，不会把 `tg://` 交给桌面客户端。该接口不承担计数或额度消耗。

**设备识别**：`background/index.ts` 启动时用 `crypto.randomUUID()` 生成 `device_id` 存 `chrome.storage`（`STORAGE_KEYS.DEVICE_ID = 'counter_device_id'`），HttpClient 拦截器在每次请求注入 `X-Device-Id` 头。对应 `feat.044.统一每日额度服务` 与 `@../005.计数器系统/tech-device_id与匿名下载.md`。

### A6. 与 backend 通信

- `vite.config.ts`：打包时注入 `__API_BASE_URL__` / `__WEBSITE_BASE_URL__`，运行时代码不直接读 `import.meta.env`。默认 dev 为 `http://localhost:9600` + `http://localhost:9620`，默认 prod 为 `https://tg-download-api.telegramdownloadmedia.com` + `https://telegramdownloadmedia.com`；可用 `EXTENSION_API_BASE_URL` / `EXTENSION_WEBSITE_BASE_URL` 覆盖。
- `core/api/config.ts`：消费打包注入的 API / Website base URL；所有端点完整路径常量集中在此。
- 生产 manifest 写入 Chrome Web Store public key,正式包 ID 固定为 `lflkobgaibapekhjnfhkaeagdnojjnla`;开发/预发布 manifest 写入独立 public key,ID 固定为 `cknimihpjagocmakbkplpjdcgjlbnkec`。`pnpm build` 生成商店包,`pnpm build:dev` 生成 localhost 开发包,`pnpm build:pre-release` 生成连接生产服务的预发布包。两个身份可同时安装,且重新构建、移动目录或重新添加都不改变 ID。public key 可提交,私钥不进入仓库。
- manifest `host_permissions` / 站点 `content_scripts.matches` / `externally_connectable.matches` / `web_accessible_resources` 按 dev/prod 与 `src/platforms/registry.ts` 生成，`vite.config.ts` 只消费该注册表：host_permissions 只含平台域，API 域依赖后端通配 CORS，官网登录桥接域经 `externally_connectable.matches` 授权（与官网 origin 白名单同源生成，dev/prod 一致）；prod 包不包含 `localhost:9600` / `localhost:9620`，dev 包不默认请求线上官网；平台关闭时会在编译期移除对应平台页面、CDN 权限与暴露样式资源。站点 content / injected 使用平台独立 entry，关闭平台不会静态加载该平台业务模块。官网登录桥接始终保留，登录页 URL 不传扩展 ID。
- `core/api/client/HttpClient.ts` + `interceptors.ts`：自封装 HttpClient，拦截器链注入 `deviceId / token / Accept-Language / headers`，5xx 重试、401 刷新 token。
- 与 website 走**同一套后端 `/api/client/*` 契约**。

### A7. SLS mark-log 上报

- 插件端旧的后端 `/api/client/mark/record` 写入已停用；`core/api/mark/api.ts` 现在只写阿里云 SLS WebTracking，不再进入后端 `mark_logs`。
- `core/api/mark/sls.ts` 复用 website 的 WebTracking GET 协议：`APIVersion=0.6.0`、`__topic__=mark-log`、`__source__=extension`，不引入阿里云 SDK。
- `core/api/mark/mark-sanitizer.ts` 对 `mark_msg` 做 URL query、token、Cookie、Authorization、直链脱敏后再上报。
- popup 打开与下载点击直接调用 `markApi.record()`；Telegram content script 的初始化和下载点击仍通过 `BackgroundMessageRouter.recordMark()` 交给 background 写 SLS。
- 共享升级弹窗从隐藏进入显示时广播 `upgradeModalOpened`；`ExtensionMarkReporter` 在 background 统一写 `upgrade_modal_open`，不区分 Popup / Content 来源，关闭后重开再次记录。
- `vite.config.ts` 生产构建默认使用 `tg-download / ap-southeast-1.log.aliyuncs.com / tg-download-mark-log`，dev 未配置时关闭；可用 `EXTENSION_ALI_SLS_*` 覆盖，也兼容 `PUBLIC_ALI_SLS_*`。SLS WebTracking 对匿名 GET 返回通配 CORS，不申请该域名的 `host_permissions`。

---

## B. 管理后台 `admin/`

### B1. 技术栈

- **Vue 3.5 + vue-router 4 + Pinia 3 + vue-i18n 11 + naive-ui 2.44 + axios + @vicons/antd**，Vite 7。
- **完全独立的 Vue SPA**，与 website 无关，未嵌入 Astro；与 extension/website 无代码共享。
- i18n 仅 **2 语言**（`en-US.json` / `zh-CN.json`），与网站/插件的 14 语言不同。

### B2. 目录结构

```
admin/src/
├── api/            # request.ts(axios 实例, baseURL=/api/admin) + auth/channel-settings/dashboard/
│                   #   mark-log/node-monitor/node-request/orders/service-nodes/tg-client.ts
├── i18n/           # index.ts + en-US.json + zh-CN.json
├── layouts/        # AdminLayout.vue（带侧边栏主布局）
├── router/         # index.ts（vue-router + beforeEach 鉴权守卫）
├── stores/         # auth.ts（唯一 store：token 管理）
├── types/
├── views/          # Login / Dashboard / ServiceNodes / TgClient / MarkLogDiagnostics /
│                   #   DownloadLogs / Orders / ChannelSettings
├── App.vue / main.ts / env.d.ts
admin/deploy/       # deploy.sh + tg-admin.conf（nginx）+ .env.example
```

### B3. 路由与鉴权

- `createWebHistory`。两层：`/login`（无需鉴权）+ `/`（`AdminLayout` 嵌套，`requiresAuth: true`，children: Dashboard / ServiceNodes / TgClients / MarkLogs / DownloadLogs / Orders / ChannelSettings）。
- `beforeEach` 守卫：未登录访问受保护页 → 跳 `/login?redirect=...`；已登录访问 `/login` → 跳 `/`。

### B4. 与 backend 通信

- `api/request.ts`：axios 实例 `baseURL = "/api/admin"`，dev 由 Vite proxy（`vite.config.ts` 把 `/api` → `localhost:9600`）转发到后端 FastAPI。
- 响应拦截器解包 `{ code, data, msg }` 信封：`code !== 10000` 抛 `BusinessError`；401 自动用 refresh_token 续签（Promise 去重防并发），失败清登录态跳 `/login`。
- 各业务 api 文件（orders / dashboard / service-nodes 等）基于此实例封装。

---

## C. 三前端关系速览

- **website**（Astro 静态站，nginx）面向终端用户做 SEO/落地页，引导安装 extension。
- **extension**（Chrome MV3）运行在 `PLATFORM_REGISTRY[*].releaseStatus` 启用的平台页面，跨上下文 RPC 使用 chrome message + DOM event；登录、额度等 HTTP 能力调用同一后端 `tg-download-api.telegramdownloadmedia.com`（9680）。
- **admin**（独立 Vue SPA，nginx @ admin 域，Vite proxy → :9600）管后台，走 `/api/admin/*`。
- website 与 admin 无代码共享；website 运行时代码在其 `src/` 内（components、download、scripts/homepage），无独立共享包；extension 的 `core/` 是其内部共享层。
- 三个前端 + 后端 business 共用同一套 HTTP 契约与错误信封（`{code,data,msg}`，`code=10000` 为成功）。
