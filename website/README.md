# MapsGrab Marketing Website

MapsGrab 营销站（原 website-mapsgrab/，2026-08-31 起 replaces 退役的 TG 主站成为唯一 `website/`；
TG 线主站已删除，生产 TG 站点不再由本仓维护）。品牌与产品文案当前为占位（EN 首批），
正式内容按 W2-W5 计划填充；域名后配（见 `astro.config.mjs` 的 `SITE_PLACEHOLDER`）。

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

# 构建生产产物（astro check + vue-tsc --noEmit + astro build）
pnpm build

# e2e（四浏览器 project；E2E_WEB_PORT 可覆盖端口）
pnpm test:e2e
pnpm test:e2e:identity   # 浏览器身份门禁
```

## 目录结构

```
website/
├── public/            # 静态资源（favicon/manifest/robots/payment-icons；fonts 自托管字体 + OFL，img 图标 sprite 与等高线）
├── deploy/            # Nginx conf + 部署脚本（域名/服务器占位）
├── cloudflare/        # Cloudflare 配置记录（cache rules / 退役重定向 CSV）
├── e2e/               # Playwright 冒烟 + 浏览器身份门禁
├── scripts/           # Playwright 浏览器身份工具
├── tests/             # 模块脚本单测（node --test）
└── src/
    ├── components/    # auth / pricing / credit-purchase / order-checkout（W5 购买链路基座）
    ├── i18n/          # 纯 TS 字典（当前仅 en-US；多语言架构保留）
    ├── layouts/       # Layout.astro（引入全局样式、首帧主题恢复、外壳装配、GA4 槽位与页级开关）
    ├── lib/           # capabilities.ts 能力可用性表等站级常量
    ├── pages/         # 文件路由（[lang]/ 多语言路由架构保留）
    ├── scripts/       # homepage（api/auth/mark/device/ga4/sls）+ site（chrome 外壳 / motion 动效 / components 声明式交互 / toast / confirm）
    ├── sitemap/       # 语言 sitemap 集成（noindex 路由屏蔽清单）
    └── styles/        # 全局样式：tokens（唯一 token 来源）/ base / motion / components / site
```

## 待回填占位清单

- 正式域名：`astro.config.mjs`、`public/robots.txt`、`public/llms.txt`、`deploy/`、`cloudflare/`
- GA4 measurement ID：env `PUBLIC_GA4_MEASUREMENT_ID`（`.env.production` 或部署环境注入，G- 开头）。
  为空时全站**零注入** gtag（构建期守卫）；配置后 Layout 注入 gtag，事件通道自动生效：
  `tool_view`（工具页进入）/ `tool_use`（功能使用，data-ga-event 委派）/ `cta_click`（data-cta
  统一漏斗事件，带 cta_id 与 utm）。全站唯一豁免的第三方运行时脚本。
- Google Search Console：无真实资产。部署正式域名后在 GSC 添加 Domain 资源，优先 DNS 记录验证；
  若走 HTML 文件验证，把 `google<hash>.html` 放入 `public/` 重新构建部署即可，无需改代码。
- 扩展商店链接：`src/components/extension/ExtensionInstall.astro` 的 `EDGE_STORE_URL_PLACEHOLDER` /
  `FIREFOX_STORE_URL_PLACEHOLDER`（Edge Add-ons / Firefox AMO，上架后按渠道回填）
- 直装 release zip 资产：`src/components/extension/ExtensionInstall.astro` 的 `RELEASE_ZIP_URL_PLACEHOLDER`
  （发版挂资产后回填；替换后删除 `'#'` 占位。`extensionInstall` 能力关闭时这些入口渲染为灰化按钮，占位不外露）
- Google OAuth client：`PUBLIC_GOOGLE_CLIENT_ID` env（购买链路接入时）
- MapsGrab 套餐与支付渠道：`src/i18n/pricing.ts`（W5 接 006）
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

- `robots`：默认 `index, follow`，noindex 页面传 `noindex, nofollow`，并把路由加入
  `src/sitemap/languageSitemap.mjs` 的屏蔽清单（根路径与各语言前缀版本一并排除）。
- `analytics`：默认 `true`；不统计的页面（如 MCP 授权确认页）传 `false`，该页不注入 gtag、不做首开打点（`<html data-analytics="off">`），错误上报、device 图标与登录链照常。
- 其余：`workspaceMode`（工作区，不渲染营销外壳与动效）、`includeSiteAuth`、`includeLanguageSwitcher`、
  `includeAlternateLanguageLinks`、`preloadAccentFont`（首屏标题用 `.accent` 时预加载衬线斜体）。
