# MapsGrab Marketing Website

MapsGrab 营销站（原 website-mapsgrab/，2026-08-31 起 replaces 退役的 TG 主站成为唯一 `website/`；
TG 线主站已删除，生产 TG 站点不再由本仓维护）。品牌与产品文案当前为占位（EN 首批），
正式内容按 W2-W5 计划填充；域名后配（见 `astro.config.mjs` 的 `SITE_PLACEHOLDER`）。

## 技术栈

- **Astro 5**（SSG 静态站）+ 原生 TS + 命令式 DOM（非 SPA，无 Vue 集成）
- TypeScript `strict`，`astro check` 做类型门禁
- 测试：`node --test tests/module-scripts.test.js` + Playwright e2e

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 7620，全仓专属）
pnpm dev

# 构建生产产物（astro check + astro build）
pnpm build

# e2e（四浏览器 project；E2E_WEB_PORT 可覆盖端口）
pnpm test:e2e
pnpm test:e2e:identity   # 浏览器身份门禁
```

## 目录结构

```
website/
├── public/            # 静态资源（favicon/manifest/robots/payment-icons）
├── deploy/            # Nginx conf + 部署脚本（域名/服务器占位）
├── cloudflare/        # Cloudflare 配置记录（cache rules / 退役重定向 CSV）
├── e2e/               # Playwright 冒烟 + 浏览器身份门禁
├── scripts/           # Playwright 浏览器身份工具
├── tests/             # 模块脚本单测（node --test）
└── src/
    ├── components/    # auth / pricing / credit-purchase / order-checkout（W5 购买链路基座）
    ├── i18n/          # 纯 TS 字典（当前仅 en-US；多语言架构保留）
    ├── layouts/       # Layout.astro（design token 合同 + GA4 槽位）
    ├── pages/         # 文件路由（[lang]/ 多语言路由架构保留）
    ├── scripts/       # homepage（api/auth/mark/device/ga4/sls）+ site
    └── sitemap/       # 语言 sitemap 集成
```

## 待回填占位清单

- 正式域名：`astro.config.mjs`、`public/robots.txt`、`public/llms.txt`、`deploy/`、`cloudflare/`
- GA4 measurement ID：env `PUBLIC_GA4_MEASUREMENT_ID`（`.env.production` 或部署环境注入，G- 开头）。
  为空时全站**零注入** gtag（构建期守卫）；配置后 Layout 注入 gtag，事件通道自动生效：
  `tool_view`（工具页进入）/ `tool_use`（功能使用，data-ga-event 委派）/ `cta_click`（data-cta
  统一漏斗事件，带 cta_id 与 utm）。全站唯一豁免的第三方运行时脚本。
- Google Search Console：无真实资产。部署正式域名后在 GSC 添加 Domain 资源，优先 DNS 记录验证；
  若走 HTML 文件验证，把 `google<hash>.html` 放入 `public/` 重新构建部署即可，无需改代码。
- 扩展商店链接：`src/components/pages/ExtensionPage.astro` 的 `EDGE_STORE_URL_PLACEHOLDER` /
  `FIREFOX_STORE_URL_PLACEHOLDER`（Edge Add-ons / Firefox AMO，上架后按渠道回填）
- 直装 release zip 资产：`src/components/pages/ExtensionPage.astro` 的 `RELEASE_ZIP_URL_PLACEHOLDER`
  （发版挂资产后回填；替换后删除 href="#" 占位）
- Google OAuth client：`PUBLIC_GOOGLE_CLIENT_ID` env（购买链路接入时）
- MapsGrab 套餐与支付渠道：`src/i18n/pricing.ts`（W5 接 006）
- 页面样式已全量消费 `Layout.astro` 的 Material You 亮暗语义 token；独立生成的 sitemap XSL
  镜像所需的同名 token。`python3 ../scripts/ui_token_lint.py` 将两者作为 website enforced 门禁。
- favicon：`public/favicon.svg` 当前为 MapsGrab 占位 pin 图（与 Layout logo 同形），正式品牌图标定稿后替换
