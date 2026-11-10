# 000 · 架构 · 浏览器插件 + 管理后台

> ⚠️ **历史状态(2026-08-29)**:`extension/` 已改造为 Maps Extractor 插件(013 域),本文描述的 Telegram 注入/下载架构不再存在于代码中,仅作历史与机制参考;Maps 插件的合同以 `../../013.Maps插件/` 为准。
>
> **现役范围**：`extension/` 为 MapExporter Google Maps 插件，`extension-bing/` 为 Bing 插件；业务合同分别见 [013](../013.Maps插件/feat.md) 与 [016](../016.Bing插件/feat.md)。下文现役结构与单独标注的 TG 历史说明分别适用。
> **插件是 Chrome Manifest V3**（`vite-plugin-web-extension` + `@types/chrome`）。本文件记录插件 `extension/` 与管理后台 `admin/` 的稳定结构和已确认契约。规则条文见根 `@../../../AGENTS.md` 与 `@../../references/specs/spec-extension.md`。

## A. 浏览器插件 `extension/`

### A1. 技术栈

- **Vue 3.5 + Pinia 3 + vue-i18n 11 + Tailwind 4 + Vite 7**（`extension/package.json`）。
- 构建：`vite-plugin-web-extension`。
- 本地调试：`pnpm dev` 使用 `vite build --watch --mode development` 构建 `dist`，并通过当前 Microsoft Edge 的 CDP `DevToolsActivePort` 执行 `Extensions.loadUnpacked` 重新加载本地 unpacked extension；不创建新 profile，不接管浏览器启动。
- **Chrome Manifest V3**（`manifest_version: 3`）：平台发布状态以 `extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 为准，权限与入口的最终组装以 `extension/vite.config.ts` 的 `webExtension({ manifest })` 配置为准。标签页 URL 只通过已限定的平台 host_permissions 读取，不申请 `activeTab` 或 `tabs`。API 与 SLS 走标准 CORS，官网登录走 v3 浏览器身份流程（`chrome.identity.launchWebAuthFlow` + PKCE + 一次性 code 回跳；不登记扩展 ID、无 `externally_connectable`、不注入官网 content script，合同见 `../007.用户系统/tech-第三方登录.md` §9），三者均不重复进入 host_permissions。
- e2e：Playwright。
- 入口页：`popup`（`src/popup.html`）、Options（`src/options.html`）、批量 Dashboard（`src/dashboard.html`）与批量工作页启动器（`src/bulk-launch.html`）。`vite.config.ts` 的 `options_ui` 注册当前设置页；购买与订阅管理跳官网。

### A2. 目录结构（三上下文 + 共享核心）

```
extension/src/
├── background/           # Service Worker 上下文
│   ├── index.ts          # SW 入口（device_id 初始化）
│   ├── background-register.ts
│   └── services/         # BackgroundMessageRouter 与后台业务服务
├── content/              # Content Script 上下文
│   └── rpc/              # background typed client
├── injected/             # MAIN world 注入上下文
│   └── index.ts          # Maps 搜索 XHR 拦截与采集事件转发
├── core/                 # 跨上下文共享核心（插件内部共享层）
│   ├── api/              # config.ts / client/(HttpClient,interceptors) / auth/ mark/ subscription/
│   ├── rpc/              # 自研 RPC 框架（见 A3）
│   │   ├── serve.ts / errors.ts
│   │   ├── transports/   # ChromeRpcTransport
│   │   ├── types.ts / constants.ts
│   │   └── generator/    # manifest.json + templates（代码生成）
│   ├── stores/           # authStore.ts（后台认证状态）
│   ├── protocol/ services/ events/ storage/ composables/ constants/ utils/
│   └── components/ content/ injected/
├── popup/                # 工具栏弹窗 UI（popup.html）
│   ├── App.vue / main.ts / components/ / rpc/ / utils/
│   └── stores/authStore.ts
├── options/              # 设置、字段选择与导出预览
├── dashboard/            # 批量任务创建、进度与历史
├── bulk-launch/          # 批量工作页启动
├── sites/<platform>/     # 站点特定注入逻辑；content/entry.ts 与 injected/entry.ts 是 manifest 平台入口
└── locales/              # 14 语言 JSON + index.ts（vue-i18n）
```

**上下文划分**：
- `background/`（Service Worker）通过 `background-register.ts` 声明 RPC；`content/` 调用 background，Maps 的 `injected/`（MAIN world）只向 content 转发站点搜索响应。
- `popup/` 提供打开 Maps、批量工具、账号、月度用量与官网入口；`options/` 承载设置与导出预览，`dashboard/` 承载批量任务。Popup 未登录按钮通过 background RPC 发起 v3 浏览器身份登录（`launchWebAuthFlow` → 官网 `/extension-login` → 一次性 code + PKCE 换插件独立 token），不在 Popup 内嵌邮箱验证码表单。页面职责以各自 `App.vue` 为入口，UI 合同见 [013](../013.Maps插件/feat.md)。
- `core/` 是**跨上下文共享核心**，包含 API 客户端、RPC 框架、Pinia store、协议和存储；站点采集逻辑位于各端的 `sites/maps/` 或 `sites/bing/`。

### A3. RPC 系统（自研 v2，声明式 + 代码生成）

双插件的 RPC 实现位于各自 `src/core/rpc/`，通过 Chrome message 连接 popup/content 与 background。方法声明、生成流程、权限与 payload 边界见 [插件 RPC 系统](tech-插件RPC.md)。

Maps 的 MAIN world 入口保留站点搜索 XHR 拦截，使用单向 CustomEvent 向 content 转发响应；Bing 采集在 content 中执行。两端采集与导出合同分别见 [Maps 插件](../013.Maps插件/feat.md) 和 [Bing 插件](../016.Bing插件/feat.md)。

运行时日志配置由 background 从扩展自有 `chrome.storage.local` 读取，popup 通过 `getRuntimeConfig()` 获取；content 与 Maps injected 使用构建环境对应的默认日志级别。

### A4. Store（Pinia，分散在各上下文）

- 双插件的 `popup/stores/authStore.ts` 只保存账号展示状态，通过 background RPC 校验会话和退出；Bing 的 `core/stores/authStore.ts` 由 background 管理登录提交与订阅缓存。认证写入与刷新合同见[插件侧认证行为](../007.用户系统/tech-第三方登录.md#95-插件侧行为maps--bing-同构)。Maps 月度用量由 `sites/maps/usage/` 维护。

### A5. 订阅状态与月度用量

双插件的 `subscriptionApi.getStatus()` 均显式请求 `/api/client/subscription/status?product_kind=maps_extension`,共享插件产品类别。状态响应只表达档位与账期,合同见 [订阅商品与状态](../006.订阅系统/tech-订阅商品与状态.md)。

Google Maps 与 Bing 月度用量分别由各端 `sites/maps/usage/usageService.ts`、`sites/bing/usage/usageService.ts` 维护，共用 `/api/client/maps/usage` 与 `/api/client/maps/usage/report`，语义见 [额度基建](tech-额度基建.md)。插件购买入口跳转 website Pricing 并携带 `product_kind=maps_extension`;订阅状态接口不承担额度扣减。

**设备识别**：`background/index.ts` 启动时用 `crypto.randomUUID()` 生成 `device_id` 存 `chrome.storage`（`STORAGE_KEYS.DEVICE_ID = 'counter_device_id'`），HttpClient 拦截器在每次请求注入 `X-Device-Id` 头。匿名月度计量边界见 [额度基建](tech-额度基建.md#2-方案)，不再使用每日下载 quota。

### A6. 与 backend 通信

- `vite.config.ts`：打包时注入 `__API_BASE_URL__` / `__WEBSITE_BASE_URL__`，运行时代码不直接读 `import.meta.env`；各环境地址与覆盖变量以本端构建配置为准,网站入口指向 MapExporter。
- `core/api/config.ts`：消费打包注入的 API / Website base URL；所有端点完整路径常量集中在此。
- Maps 的 Chrome/Edge 构建向 manifest 注入同一个固定 `key`（`extension/vite.config.ts` 的 `CHROMIUM_PUBLIC_KEY`），保证 ZIP 解压加载跨用户、跨路径的扩展 ID 一致；开发、真实验收与生产构建共用该身份。公钥可提交，RSA 私钥保存在被 git 忽略的 `extension/.keys/`，权限为 `600`，不进入仓库或分发包。Firefox 仍使用独立 Gecko 身份；第三方 OAuth 登记见 [A10](../013.Maps插件/references/A10-Drive与HubSpot集成.md#固定身份与-oauth-登记)。`pnpm build` 生成生产包，`pnpm build:dev` 生成 localhost 开发包，`pnpm build:pre-release` 生成连接生产服务的预发布包。
- manifest `host_permissions` / 站点 `content_scripts.matches` / `web_accessible_resources` 按 dev/prod 与 `src/platforms/registry.ts` 生成，`vite.config.ts` 只消费该注册表：host_permissions 只含平台域，API 域依赖后端通配 CORS；prod 包不包含 `localhost:7600` / `localhost:7620`，dev 包不默认请求线上官网；平台关闭时会在编译期移除对应平台页面、CDN 权限与暴露样式资源。站点 content / injected 使用平台独立 entry，关闭平台不会静态加载该平台业务模块。官网登录为 v3 浏览器身份流程（不登记扩展 ID、无 `externally_connectable`），登录 URL 不传扩展 ID。
- `core/api/client/HttpClient.ts` + `interceptors.ts`：自封装 HttpClient，拦截器链注入 `deviceId / token / Accept-Language / headers`，5xx 重试、401 刷新 token。
- 与 website 走**同一套后端 `/api/client/*` 契约**。

### A7. SLS mark-log 上报

- 插件常规行为经 `core/api/mark/api.ts` 写入 SLS；安装/更新由 `background/services/InstallMarkReporter.ts` 按[通道合同](tech-可观测与SLS.md#1-通道裁决)双报。
- `core/api/mark/sls.ts` 使用 WebTracking GET 协议：`APIVersion=0.6.0`、`__topic__=mark-log`；`__source__` 与 `client_product` 由构建常量同源生成，Maps 为 `extension-maps`，Bing 为 `extension-bing`，不接受环境变量覆盖，不引入阿里云 SDK。
- `core/api/mark/mark-sanitizer.ts` 对 `mark_msg` 做 URL query、token、Cookie、Authorization、直链脱敏后再上报。
- 现役行为事件与字段见 [SLS 事件字典](tech-可观测与SLS.md#6-事件字典)，插件不做 GA4，install 使用 SLS + 后端 mark 双报。

  > **【历史 · TG 下载站已退役】** popup 打开与下载点击直接调用 `markApi.record()`；Telegram content script 的初始化和下载点击仍通过 `BackgroundMessageRouter.recordMark()` 交给 background 写 SLS。

- 共享升级弹窗从隐藏进入显示时广播 `upgradeModalOpened`；`ExtensionMarkReporter` 在 background 统一写 `upgrade_modal_open`，不区分 Popup / Content 来源，关闭后重开再次记录。
- 两端 `vite.config.ts` 的 `DEFAULT_PROD_ALI_SLS_*` 提供生产默认 project / 日本 host / logstore，与 [现役 SLS 配置](tech-可观测与SLS.md#2-阿里云-sls-配置) 一致；dev 未配置时关闭。可用 `EXTENSION_ALI_SLS_*` 覆盖配置，同时兼容 `PUBLIC_ALI_SLS_*`。SLS WebTracking 使用标准 CORS，不申请该域名的 `host_permissions`。

---

## B. 管理后台 `admin/`

### B1. 技术栈

- **Vue 3.5 + vue-router 4 + Pinia 3 + vue-i18n 11 + naive-ui 2.44 + axios + @vicons/antd**，Vite 7。
- **完全独立的 Vue SPA**，与 website 无关，未嵌入 Astro；与 extension/website 无代码共享。
- i18n 仅 **2 语言**（`en-US.json` / `zh-CN.json`），与网站/插件的 14 语言不同。

### B2. 目录结构

**现役结构**：

```
admin/src/
├── api/            # request.ts（axios 实例）+ auth.ts / dashboard.ts / orders.ts /
│                   #   system-settings.ts / task-records.ts / users.ts
├── i18n/           # index.ts + en-US.json + zh-CN.json
├── layouts/        # AdminLayout.vue（带侧边栏主布局）
├── router/         # index.ts（vue-router + beforeEach 鉴权守卫）
├── stores/         # auth.ts（唯一 store：token 管理）
├── types/          # api.ts（响应与分页类型）
├── views/          # LoginView.vue / DashboardView.vue / UsersView.vue /
│                   #   OrdersView.vue / TaskRecordsView.vue / SystemSettingsView.vue
├── App.vue / main.ts / env.d.ts
admin/deploy/       # deploy.sh + mapexporter-admin.conf（nginx）+ .env.example
```

**【历史 · TG 后台已退役】** 以下保留旧目录快照，仅作历史参考。

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

- `router/index.ts` 使用 `createWebHistory`。两层：`/login`（Login，无需鉴权）+ `/`（`AdminLayout` 嵌套，`requiresAuth: true`，children: Dashboard / Users / Orders / TaskRecords / SystemSettings，路径依次为 `/`、`/users`、`/orders`、`/task-records`、`/system-settings`）。
- `beforeEach` 守卫：未登录访问受保护页 → 跳 `/login?redirect=...`；已登录访问 `/login` → 跳 `/`。

> **【历史 · TG 后台已退役】** `createWebHistory`。两层：`/login`（无需鉴权）+ `/`（`AdminLayout` 嵌套，`requiresAuth: true`，children: Dashboard / ServiceNodes / TgClients / MarkLogs / DownloadLogs / Orders / ChannelSettings）。

### B4. 与 backend 通信

- `api/request.ts`：axios 实例 `baseURL` 为 `${API_BASE}/api/admin`，`API_BASE` 取自构建变量 `VITE_API_BASE_URL`（去掉尾部斜杠）；未配置时使用相对路径，由 Vite proxy（`vite.config.ts` 把 `/api` → `localhost:7600`）转发到后端 FastAPI。
- Admin 生产构建由 `admin/vite.config.ts` 读取 `admin/deploy/production.conf` 的 `ADMIN_API_BASE_URL` 编译上述接口，字段见 [production.conf.example](../../../admin/deploy/production.conf.example)；进程变量与 `.env.production` 不覆盖或补充生产参数。显式 `.env.test` 部署使用 test 模式构建，保留测试文件的 API 地址。
- 响应拦截器解包 `{ code, data, msg }` 信封：`code !== 10000` 抛 `BusinessError`；HTTP 401 在当前会话内用 refresh_token 续签并最多重试一次（同会话刷新通过 Promise 去重），续签失败清登录态并跳 `/login?redirect=...`；旧会话响应被拒绝。
- 业务 api 文件为 `auth.ts / dashboard.ts / orders.ts / system-settings.ts / task-records.ts / users.ts`，均基于 `request.ts` 实例封装。

> **【历史 · TG 后台已退役】** 各业务 api 文件（orders / dashboard / service-nodes 等）基于此实例封装。

---

## C. 三前端关系速览

- **website**（Astro 静态站，nginx）面向终端用户做 SEO/落地页，引导安装 extension。
- **extension / extension-bing**（Chrome MV3）分别运行在 Google Maps / Bing Maps，跨上下文 RPC 使用 Chrome message；登录、订阅与用量调用同一后端。
- **admin**（独立 Vue SPA，nginx @ admin 域，Vite proxy → :7600）管后台，走 `/api/admin/*`。
- website 与 admin 无代码共享；website 运行时代码在其 `src/` 内（components、scripts 等），无独立共享包；extension 的 `core/` 是其内部共享层。
- 各前端与统一后端共用同一套 HTTP 契约与错误信封（`{code,data,msg}`，`code=10000` 为成功）。
