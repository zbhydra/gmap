# 000 · 架构 · 浏览器插件 + 管理后台

> ⚠️ **历史状态(2026-08-29)**:`extension/` 已改造为 Maps Extractor 插件(013 域),本文描述的 Telegram 注入/下载架构不再存在于代码中,仅作历史与机制参考;Maps 插件的合同以 `../../013.Maps插件/` 为准。
> **插件是 Chrome Manifest V3**（`vite-plugin-web-extension` + `@types/chrome`）。本文件记录插件 `extension/` 与管理后台 `admin/` 的稳定结构和已确认契约。规则条文见根 `@../../../AGENTS.md` 与 `@../../references/specs/spec-extension.md`。

## A. 浏览器插件 `extension/`

### A1. 技术栈

- **Vue 3.5 + Pinia 3 + vue-i18n 11 + Tailwind 4 + Vite 7**（`extension/package.json`）。
- 构建：`vite-plugin-web-extension`。
- 本地调试：`pnpm dev` 使用 `vite build --watch --mode development` 构建 `dist`，并通过当前 Microsoft Edge 的 CDP `DevToolsActivePort` 执行 `Extensions.loadUnpacked` 重新加载本地 unpacked extension；不创建新 profile，不接管浏览器启动。
- **Chrome Manifest V3**（`manifest_version: 3`）：平台发布状态以 `extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 为准，权限与入口的最终组装以 `extension/vite.config.ts` 的 `webExtension({ manifest })` 配置为准。标签页 URL 只通过已限定的平台 host_permissions 读取，不申请 `activeTab` 或 `tabs`。API 与 SLS 走标准 CORS，官网登录走 v3 浏览器身份流程（`chrome.identity.launchWebAuthFlow` + PKCE + 一次性 code 回跳；不登记扩展 ID、无 `externally_connectable`、不注入官网 content script，合同见 `../007.用户系统/tech-第三方登录.md` §9），三者均不重复进入 host_permissions。
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
- 旧 `options/` 设置页已删除；`popup/`（弹窗 UI）承载资源列表、登录状态、额度/升级入口，底部固定显示可点击、可复制的支持邮箱，复制结果通过全局 Toast 反馈。Popup 最小尺寸为 600×400px；空态资源区填满 header 与 footer 之间的剩余空间，footer 位于 400px 底边，有资源时列表按内容自然增高。未登录按钮经真实 background RPC 发起 v3 浏览器身份登录（background `launchWebAuthFlow` 打开官网统一确认页 `/extension-login`，用户确认后一次性 code 回跳换取插件独立 token，2026-09-01 替代原 v2 `externally_connectable` 官网推送桥）；Popup 内没有邮箱验证码登录弹窗。
- `core/` 是**跨上下文共享核心**——API 客户端、RPC 框架、Pinia store、协议、存储和 `core/content/download/` 的共享单项下载编排。需要页面媒体 API、分片读取或 mux 的来源由各站点 injected provider 负责；可直接保存的 Vimeo Progressive/Thumbnail 由 content 分流到 background 的 Chrome 下载管理器。Telegram 特有解析留在 `sites/telegram/`。
- Instagram 的生产路径固定为 `PageContext -> routeMediaStore Map -> parser/resolver -> buttons/Popup -> downloadOne/downloadMany -> fixed EventRpc`。DOM 只证明实体和挂载位置，主媒体不来自 thumbnail、poster、CSS 背景或 blob/data URL。

### A3. RPC 系统（自研 v2，声明式 + 代码生成）

目录：`extension/src/core/rpc/`。

- **两种 transport**：
  - `ChromeRpcTransport`：走 `chrome.runtime` message（popup ↔ content ↔ background）。
  - `EventRpcTransport`：走固定 DOM `CustomEvent` 通道（content ↔ injected）。
- **EventRpc 信任边界**：DOM transport 对宿主页面可观察、可伪造、可干扰，这一风险被明确接受。入口只做 method allowlist、请求结构和 payload 大小校验；Event handler 的内部异常只向 DOM 返回固定中性错误，Chrome transport 仍保留可定位错误。Chrome API、storage、token、额度和后端权限操作只留在 content/background，站点下载与解析仍校验 host、redirect、MIME 和媒体类型。
- **运行时日志配置**：扩展不访问宿主页面 Web Storage。生产 DEBUG 开关只存于扩展自有 `chrome.storage.local`，由 background 读取；popup / content 通过 Chrome RPC 获取，content 在 injected ready 后再经非可信 EventRpc 把已收窄的布尔配置同步到 MAIN world。EventRpc 不获得存储读取能力，配置读取或同步失败时各上下文保持生产默认 ERROR 级别，页面业务继续初始化。
- **Maps 采集与导出**：宿主页面采集和结果导出归 [Maps 插件](../013.Maps插件/feat.md) 与 [Bing 插件](../016.Bing插件/feat.md)。历史媒体下载平台的 RPC 与每日下载额度不作为现役产品合同。
- **声明式注册 + 代码生成**：每个上下文写 `*-register.ts`，只声明方法签名（`Handler` 对象返回 `declarationOnly(...)`），不含实现。
- 生成器 `scripts/rpc-generate.mjs` 读取 `core/rpc/generator/manifest.json` 列出的 register 文件 → 校验**调用矩阵**（`transportMatrix`：popup→content、background→content、content/popup→background 用 chrome；content→injected 用 event）→ 生成 typed client 到 `popup/rpc/`、`content/rpc/`、`background/rpc/`。
- **一致性保证**：`pnpm rpc-generate:check` 挂在 `pretype-check` / `prebuild`，生成产物与声明不一致则构建失败。

详见 `feat.010.重构插件RPC系统`。

### A4. Store（Pinia，分散在各上下文）

- `core/stores/authStore.ts` 保存认证状态；Maps 月度用量由 `sites/maps/usage/` 维护。

### A5. 订阅状态与月度用量

双插件的 `subscriptionApi.getStatus()` 均显式请求 `/api/client/subscription/status?product_kind=maps_extension`,共享插件产品类别。状态响应只表达档位与账期,合同见 [订阅商品与状态](../006.订阅系统/tech-订阅商品与状态.md)。

Google Maps 月度用量由 `sites/maps/usage/usageService.ts` 通过 `/maps/usage` 读取与上报,语义见 [额度基建](tech-额度基建.md)。插件购买入口跳转 website Pricing 并携带 `product_kind=maps_extension`;订阅状态接口不承担额度扣减。

**设备识别**：`background/index.ts` 启动时用 `crypto.randomUUID()` 生成 `device_id` 存 `chrome.storage`（`STORAGE_KEYS.DEVICE_ID = 'counter_device_id'`），HttpClient 拦截器在每次请求注入 `X-Device-Id` 头。对应 `feat.044.统一每日额度服务` 与 `@../005.计数器系统/tech-device_id与匿名下载.md`。

### A6. 与 backend 通信

- `vite.config.ts`：打包时注入 `__API_BASE_URL__` / `__WEBSITE_BASE_URL__`，运行时代码不直接读 `import.meta.env`；各环境地址与覆盖变量以本端构建配置为准,网站入口指向 MapsGrab。
- `core/api/config.ts`：消费打包注入的 API / Website base URL；所有端点完整路径常量集中在此。
- manifest 不再写入固定 public key(TG 时代的固定扩展 ID 体系已废,登录 v3 亦无需登记扩展 ID);`pnpm build` 生成商店包,`pnpm build:dev` 生成 localhost 开发包,`pnpm build:pre-release` 生成连接生产服务的预发布包。public key 可提交,私钥不进入仓库。
- manifest `host_permissions` / 站点 `content_scripts.matches` / `web_accessible_resources` 按 dev/prod 与 `src/platforms/registry.ts` 生成，`vite.config.ts` 只消费该注册表：host_permissions 只含平台域，API 域依赖后端通配 CORS；prod 包不包含 `localhost:7600` / `localhost:7620`，dev 包不默认请求线上官网；平台关闭时会在编译期移除对应平台页面、CDN 权限与暴露样式资源。站点 content / injected 使用平台独立 entry，关闭平台不会静态加载该平台业务模块。官网登录为 v3 浏览器身份流程（不登记扩展 ID、无 `externally_connectable`、无 manifest 固定 key），登录 URL 不传扩展 ID。
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

- `api/request.ts`：axios 实例 `baseURL = "/api/admin"`，dev 由 Vite proxy（`vite.config.ts` 把 `/api` → `localhost:7600`）转发到后端 FastAPI。
- 响应拦截器解包 `{ code, data, msg }` 信封：`code !== 10000` 抛 `BusinessError`；401 自动用 refresh_token 续签（Promise 去重防并发），失败清登录态跳 `/login`。
- 各业务 api 文件（orders / dashboard / service-nodes 等）基于此实例封装。

---

## C. 三前端关系速览

- **website**（Astro 静态站，nginx）面向终端用户做 SEO/落地页，引导安装 extension。
- **extension / extension-bing**（Chrome MV3）分别运行在 Google Maps / Bing Maps，跨上下文 RPC 使用 chrome message + DOM event；登录、订阅与用量调用同一后端。
- **admin**（独立 Vue SPA，nginx @ admin 域，Vite proxy → :7600）管后台，走 `/api/admin/*`。
- website 与 admin 无代码共享；website 运行时代码在其 `src/` 内（components、download、scripts/homepage），无独立共享包；extension 的 `core/` 是其内部共享层。
- 三个前端 + 后端 business 共用同一套 HTTP 契约与错误信封（`{code,data,msg}`，`code=10000` 为成功）。
