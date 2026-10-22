# MapsGrab Marketing Website

MapsGrab 的营销页、用户 Dashboard、插件官网下载与支付回跳页面。

## 技术栈

- **Astro 5**（SSG 静态站）+ 原生 TS + 命令式 DOM；Dashboard 工作区（`/dashboard/*`）用 **Vue 3** 单文件组件（`@astrojs/vue` 官方集成，`client:load`），非 SPA、无客户端路由
- TypeScript `strict`；类型门禁 = `astro check` + `vue-tsc --noEmit`（构建脚本内串联）
- 测试：`node --test tests/module-scripts.test.js` + Playwright e2e

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 7620，全仓专属）
pnpm dev

# 测试环境：配置 API 与网站地址后构建网站和两份插件 ZIP
cp .env.test.example .env.test
pnpm --dir ../extension install
pnpm build:test
pnpm preview --host 0.0.0.0 --port 7620

# 生产环境使用 .env.production；模板为 .env.production.example
pnpm build

# e2e（四浏览器 project；E2E_WEB_PORT 可覆盖端口）
pnpm test:e2e
pnpm test:e2e:identity   # 浏览器身份门禁
```

## 目录结构

```
website/
├── public/            # 静态资源（favicon/manifest/robots/payment-icons；fonts 自托管字体 + OFL，img 图标 sprite 与等高线）
├── deploy/            # Nginx conf + 按环境文件读取连接配置的部署脚本
├── cloudflare/        # Cloudflare 配置记录（cache rules / 退役重定向 CSV）
├── e2e/               # Playwright 冒烟 + 浏览器身份门禁
├── scripts/           # 网站/插件联合构建与 Playwright 浏览器身份工具
├── tests/             # 模块脚本单测（node --test）
└── src/
    ├── components/    # auth / pricing / credit-purchase / order-checkout（W5 购买链路基座）
    ├── i18n/          # 纯 TS 静态字典、语言表与字典注册
    ├── layouts/       # Layout.astro（引入全局样式、首帧主题恢复、外壳装配、GA4 槽位与页级开关）
    ├── lib/           # capabilities.ts 能力可用性表等站级常量
    ├── pages/         # 默认英语根路径，其他语言走 [lang]/ 静态路由
    ├── scripts/       # homepage（api/auth/mark/device/ga4/sls）+ site（chrome 外壳 / motion 动效 / components 声明式交互 / toast / confirm）
    ├── sitemap/       # 语言 sitemap 集成（noindex 路由屏蔽清单）
    └── styles/        # 全局样式：tokens（唯一 token 来源）/ base / motion / components / site
```

## 语言与路由

英语使用根路径，其他语言使用静态语言前缀。启用语言、名称、路径与 hreflang 由
[src/i18n/ui.ts](src/i18n/ui.ts) 的 `locales`、`localeNames`、`localePaths`、`hreflangMap` 定义；
[src/i18n/localized-content.ts](src/i18n/localized-content.ts) 的 `localizedContent` 注册各语言完整字典，
静态文案存放在 [src/i18n/lang/](src/i18n/lang/) 的同名 locale 文件中。

各语言生成相同的页面集合。桌面与移动导航均可切换语言，切换保留当前查询参数；站内产品、工具、Dashboard、登录与法务链接使用当前语言。插件授权和支付渠道的固定回跳入口使用默认英语，站内语言由 URL 路径确定。

## 环境与官网下载

`pnpm build:test` 读取 `.env.test`，`pnpm build` 读取 `.env.production`；同名进程环境变量优先。`scripts/build.mjs` 完成两端类型检查、按浏览器构建插件 ZIP，再构建静态网站。下载资产自动进入 `dist/downloads/`，不手工提交二进制文件。

- `PUBLIC_API_BASE_URL`：网站请求和下载包共用的后端地址。
- `PUBLIC_SITE_URL`：网站 canonical 地址与插件登录回跳入口。
- `PUBLIC_SHARED_COOKIE_DOMAIN`：测试环境可留空，使用当前主机 Cookie。
- `DEPLOY_*`：部署脚本的 SSH、目录与 Nginx 配置；域名配置仍需和对应 Nginx 文件保持一致。

内网其他设备安装时，将测试环境的两个 URL 改成可访问的内网 IP 或域名，后端监听地址与 `app.public_website_base_url` 同步匹配；后端部署由 `backend/deploy/.env.example` 的 `PUBLIC_WEBSITE_BASE_URL` 渲染该字段。PayPal 凭据继续由 `config_payment_channel` 的 `paypal` 配置管理，渠道读取入口是 `backend/src/app/services/payment_service.py` 的 `get_provider`，不写入前端环境文件。

插件页提供 Chromium 与 Firefox 各自的 ZIP，安装及更新规则见 [插件合同](../docs/feat/013.Maps插件/feat.md#官网分发)。新商品与支付渠道由 `backend/scripts/seed_subscription_products.py` 的 `_SEED_ROWS` 维护，首次部署或更新商品时执行该脚本。

## 待回填占位清单

- 正式 API / 网站地址：`.env.production`；公开索引地址另见 `public/robots.txt`、`public/llms.txt` 与 `cloudflare/`。
- GA4 measurement ID：env `PUBLIC_GA4_MEASUREMENT_ID`（`.env.production` 或部署环境注入，G- 开头）。
  为空时全站**零注入** gtag（构建期守卫）；配置后 Layout 注入 gtag，事件通道自动生效：
  `tool_view`（工具页进入）/ `tool_use`（功能使用，data-ga-event 委派）/ `cta_click`（data-cta
  统一漏斗事件，带 cta_id 与 utm）。全站唯一豁免的第三方运行时脚本。
- Google Search Console：无真实资产。部署正式域名后在 GSC 添加 Domain 资源，优先 DNS 记录验证；
  若走 HTML 文件验证，把 `google<hash>.html` 放入 `public/` 重新构建部署即可，无需改代码。
- Google OAuth client：`PUBLIC_GOOGLE_CLIENT_ID` env（购买链路接入时）
- 样式按 Atlas 合同（`docs/references/specs/design-website.md`）消费 `src/styles/tokens.css`；sitemap XSL
  构建时注入同一份 tokens.css。`python3 ../scripts/ui_token_lint.py` 的 website 为 enforced，
  违规即失败。
- favicon：`public/favicon.svg` 仍是旧占位 pin 图，与外壳品牌标（`src/components/site/BrandMark.astro`）不同形，
  正式品牌图标定稿后替换

## 能力可用性（未交付能力灰化）

- 唯一真相：`src/lib/capabilities.ts`（插件安装 / 插件购买 / Scraper API（含 Reviews）/ Photos API / MCP），
  `false` 时界面照常展示入口但灰化并提示 `common.comingSoon`，鼠标、键盘都不能触发安装、购买或接入；
  介绍页本身始终可访问。能力交付后只改这张表。
- Astro 动作入口用 `components/site/CapabilityAction.astro`，入口标记用 `components/site/SoonBadge.astro`；
  Vue 与命令式脚本直接 import 能力表（Dashboard 订阅页的选购按钮即如此）。

## Layout 页级开关

- `robots`：默认 `index, follow`，noindex 页面传 `noindex, nofollow`、关闭 `includeAlternateLanguageLinks`，并把路由加入
  `src/sitemap/languageSitemap.mjs` 的屏蔽清单（根路径与各语言前缀版本一并排除）。
- `analytics`：默认 `true`；不统计的页面（如 MCP 授权确认页）传 `false`，该页不注入 gtag、不做首开打点（`<html data-analytics="off">`），错误上报、device 图标与登录链照常。
- 其余：`workspaceMode`（工作区，不渲染营销外壳与动效）、`includeSiteAuth`、`includeLanguageSwitcher`、
  `includeAlternateLanguageLinks`、`preloadAccentFont`（首屏标题用 `.accent` 时预加载衬线斜体）。
