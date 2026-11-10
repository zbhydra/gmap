# 000 · 架构 · Astro 网站（website）

> website 的现状事实：目录、多语言、Sitemap、Cloudflare、SEO、SLS 双写。规则条文见根 `@../../../AGENTS.md`。

## 1. 技术栈

- **Astro**（`website/astro.config.mjs`），MapExporter 主站；域名配置与依赖以本端配置和 README 为准。
- 集成：`@astrojs/vue`（Vue 3.5 岛屿）+ 自定义 `languageSitemap()` 集成（`src/sitemap/`）。
- 构建：`pnpm build`，具体门禁以 `website/package.json` 为准；e2e：Playwright。
- 部署：nginx（`website/deploy/mapexporter.conf`）。旧 TG 主站与其下载引擎已退役,本仓网站提供 Maps 产品、Pricing 和工具。

## 2. 目录结构（website）

```
website/
├── astro.config.mjs          # 集成 vue() + languageSitemap()
├── package.json
├── cloudflare/
│   ├── retired-page-redirects.csv   # 退役页重定向配置（当前空表）
│   └── README.md
├── deploy/
│   ├── mapexporter.conf           # nginx 配置（真实目录无尾斜杠→HTTPS 尾斜杠 301；静态 30d immutable）
│   ├── mapexporter-test.conf      # 测试环境
│   └── deploy.sh
└── src/
    ├── components/           # site/ 外壳、pages/ 页面编排，其余按页面或领域分目录（home/ extension/ online/ product/ legal/ company/ tools/ dashboard/ …）
    ├── i18n/
    │   ├── index.ts
    │   ├── ui.ts             # 14 locale + localeNames + localePaths + hreflangMap
    │   ├── content.ts        # getContent(locale)
    │   ├── schema.ts
    │   └── lang/             # 每语言一份 *.ts（完整 SiteContent 文案对象）
    ├── layouts/
    │   └── Layout.astro      # 唯一布局：canonical / hreflang / OG / Twitter / JSON-LD / GA4 / SLS 注入
    ├── legal/
    │   └── legalContent.ts   # terms/privacy 文案中心
    ├── company/
    │   └── companyContent.ts # about/contact 文案（en-US 基线）、页面日期与 footer 标签
    ├── lib/
    │   └── contact.ts        # 公开支持邮箱 DEVELOPER_EMAIL
    ├── middleware.ts         # 当前空壳（pass-through，无语言重定向）
    ├── pages/
    │   ├── index.astro       # 默认 en-US（无 URL 前缀）
    │   ├── *.astro           # 无前缀业务页与非公开流程页
    │   ├── paypal/ clink/ stripe/ # 各渠道支付回跳页
    │   └── [lang]/           # 首页、Maps 产品/API/MCP、Pricing、工具、公司/法务与登录/授权/工作区/支付流程的语言镜像
    ├── scripts/
    │   ├── homepage/         # api / auth / device / ga4 / mark / sls-mark
    │   └── site/             # toast / confirm / language-switcher
    └── sitemap/
        └── languageSitemap.mjs   # 自定义 Astro 集成：按语言分片生成 sitemap
```

## 3. 多语言机制

- **14 个 locale**（`src/i18n/ui.ts`）：de-DE / en-US / es-ES / fr-FR / id-ID / it-IT / ja-JP / ko-KR / pt-BR / ru-RU / th-TH / vi-VN / zh-CN / zh-TW。
- **URL 模式**：`en-US` 为**空前缀**（`/`），其余语言带 `/<lang>/` 前缀（`localePaths` 映射）。`hreflangMap` 供 SEO alternate 用。
- **路由**：**双重页面**——`pages/index.astro`（默认 en-US）+ `pages/[lang]/index.astro`（动态段）；公共渲染抽到 `components/pages/*.astro`，按 `locale` 传参复用。
- **文案**：每语言一份 `src/i18n/lang/*.ts`（完整 `SiteContent` 对象），`getContent(locale)` 取值；`legal/legalContent.ts` 单独管 terms/privacy，`company/companyContent.ts` 单独管 about/contact。
- **语言切换**：`Layout.astro` 生成同页目标语言路径，`scripts/site/language-switcher.ts` 保留当前 query、写 `user-language` cookie（365 天）后执行**整页跳转**（非客户端路由）。
- **middleware.ts**：当前是**空壳 pass-through**（注释明确「当前无语言重定向逻辑」）。
- 一致性约束：`sitemap/languageSitemap.mjs` 的 `LANGUAGE_SITEMAP_LOCALES` 数组必须与 `i18n/ui.ts` 的 `localePaths`/`hreflangMap` **手动保持一致**。

## 4. Sitemap 生成

`src/sitemap/languageSitemap.mjs`（自定义 Astro 集成，钩 `astro:build:done`）：
1. 收集所有 canonical URL。
2. `classifySitemapUrl` 按**语言前缀分组**。
3. `lastmod` 从 `git log` 取（失败回退文件 mtime）。
4. 输出：`sitemap.xml` + `sitemap_index.xml`（索引）+ 每语言一份 `<slug>-sitemap.xml`（共 14 份）+ `sitemap-0.xml`（兼容旧扁平格式）+ `sitemap.xsl`（人类可读样式表）。

页面族源文件由 `getRouteSourceFiles` 定义，`getUrlSourceFiles` 再追加共享内容与当前语言字典。完整合同见 [落地页与 Sitemap](../009.SEO与增长/tech-落地页与Sitemap.md#2-多语言-sitemap-治理website)。

## 5. Cloudflare / 部署

- `cloudflare/retired-page-redirects.csv`：当前为空，未携带旧 TG 页的 14 语言 301 清单。仓库空表不代表线上 Cloudflare 状态；外部规则需另行查询。Pricing 是当前有效购买页。
- `cloudflare/README.md`：使用说明。
- `deploy/mapexporter.conf` / `deploy/mapexporter-test.conf`：nginx 配置——仅对构建产物中真实存在的目录执行「无尾斜杠 → HTTPS 尾斜杠」单跳 301，不维护第二份路由白名单；不据旧站文档恢复退役 URL 映射。
- `deploy/deploy.sh`：发布静态版本后将对应环境的 vhost 安装到 `/usr/local/nginx/vhost/`，执行 `nginx -t`，失败恢复原配置，通过后 reload；静态资源使用 30 天 immutable 缓存。

## 6. SEO 基建

- **唯一布局 `src/layouts/Layout.astro`** 集中注入：
  - canonical URL
  - hreflang alternate 链（含 `x-default` → en-US）
  - Open Graph / Twitter card（不绑定旧 TG X 账号）
  - JSON-LD 结构化数据（`schemaName = MapExporter`；`SoftwareApplication` + 带公开 `ContactPoint` 的 `Organization`，邮箱来自 `lib/contact.ts` 的 `DEVELOPER_EMAIL`，不含旧 Chrome 商店 / X `sameAs`；可叠加页面级 `structuredData` props）
  - GA4：`PUBLIC_GA4_MEASUREMENT_ID` 非空且页面 `analytics` 为真时加载；没有固定旧 ID 或 Clarity 注入
- 页面通过 props 传 `title / description / ogImage / structuredData`，布局内组装 meta。
- 现役内容围绕 Maps 插件、Online、API / MCP 和工具；页面级 SEO 文案由各页面传入，TG 下载关键词属于历史。

## 7. SLS 日志双写（website）

> 对应 `feat.033.website前端SLS日志双写`。**website 写 SLS，后端 Python 不写 SLS；extension 的独立 SLS mark-log 见 `@tech-extension.md` §A7。**

机制（`src/scripts/homepage/sls-mark.ts` + 各处 import）：
- 阿里云 SLS **WebTracking** 旁路上报，**不依赖阿里云 SDK、不新增 npm 依赖**。
- mark-log 写后端 `/api/client/mark/record` 时**同时**写一份 SLS。
- SLS `first_opened_at` 与后端 `mark_logs.first_opened_at` 都来自 website 本地首次打开毫秒时间；旧客户端不传后端字段时默认 `0`。
- website `device_id` 只使用 UUID，存储 key 为 `homepage_device_id_v2`；上线后脚本会删除旧 `homepage_device_id` / `homepage_legacy_device_ids`。
- 全局 `error` / `unhandledrejection`、后端连接失败/超时 → 只写 SLS（`web_frontend_uncaught_error`、`web_backend_connect_failed`），不请求 mark 接口、不进后端 `mark_logs`。
- SLS 上报**不依赖本项目后端**（后端不可用时仍尝试写 SLS），失败**不得影响**产品、工具、安装 CTA、登录与订阅流程。
- 字段只含排障必需信息，**不发送** Cookie/Authorization/访问令牌/完整下载直链；API path 预脱敏（只留 path）。

## 8. 与 backend 的契约

website 前端调用统一后端的 `/api/client/*`，现役入口包括登录、账号、Maps 预览、Export、API key / MCP 授权、用量、订阅、订单、工具与转化打点。共享 Credits / 签到路由仍在 `backend/src/app/main.py` 的 `_include_business_routes` 注册，但路由保留不代表网站仍展示旧下载或充值 UI。base URL 由 `src/scripts/homepage/api.ts` 的 `getApiBaseUrl` 读取构建配置；完整路由聚合见 [后端架构](tech-backend.md#10-应用-lifespan-与路由聚合)。

TG 解析 / 下载接口、下载工作区与每日下载 quota 已退役，不属于现役网站调用合同。
