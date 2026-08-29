# 000 · 架构 · Astro 网站（website）

> website 的现状事实：目录、多语言、Sitemap、Cloudflare、SEO、SLS 双写。规则条文见根 `@../../../AGENTS.md`。

## 1. 技术栈

- **Astro 5**（`website/astro.config.mjs`，`site=https://telegramdownloadmedia.com`，`base='/'`）。
- 集成：`@astrojs/vue`（Vue 3.5 岛屿）+ 自定义 `languageSitemap()` 集成（`src/sitemap/`）。
- 下载引擎：`mediabunny`（dev 软链本地 node_modules）。
- 构建：`pnpm build`（先产出压缩版 `/tg-play-sw.js`，再 `astro check && astro build`）；e2e：Playwright（对接 backend 真实 API）。
- 部署：nginx（`website/deploy/tg-web.conf`，主域 `telegramdownloadmedia.com`）。

## 2. 目录结构（website）

```
website/
├── astro.config.mjs          # 集成 vue() + languageSitemap()
├── package.json
├── cloudflare/
│   ├── retired-page-redirects.csv   # 废弃 URL 301 重定向表（14 语言全量）
│   └── README.md
├── deploy/
│   ├── tg-web.conf           # nginx 配置（真实目录无尾斜杠→HTTPS 尾斜杠 301；静态 30d immutable）
│   ├── tg-web-test.conf      # 测试环境
│   └── deploy.sh
└── src/
    ├── components/           # download/ homepage/ pages/ site/ UI 组件
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
    │   └── companyContent.ts # about/contact 的 14 语言文案、页面日期与 footer 标签
    ├── lib/
    │   └── contact.ts        # 公开支持邮箱与官方 X 账号身份常量
    ├── middleware.ts         # 当前空壳（pass-through，无语言重定向）
    ├── pages/
    │   ├── index.astro       # 默认 en-US（无 URL 前缀）
    │   ├── *.astro           # 无前缀业务页与非公开流程页
    │   ├── paypal/           # 支付成功/取消结果页
    │   └── [lang]/           # 动态语言段镜像（index/changelog/privacy/terms + *-downloader + disabled-channel-workaround）
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

详见 `feat.026.website多语言Sitemap治理`。

## 5. Cloudflare / 部署

- `cloudflare/retired-page-redirects.csv`：废弃 URL 的 301 重定向表（features/guide/faq/solutions 等历史页，按 14 语言全量列），格式 `source,target,301,true`。Pricing 是当前有效购买页,不在退役页列表中。
- `cloudflare/README.md`：使用说明。
- `deploy/tg-web.conf` / `deploy/tg-web-test.conf`：nginx 配置——仅对构建产物中真实存在的目录执行「无尾斜杠 → HTTPS 尾斜杠」单跳 301，不维护第二份路由白名单；已退休 URL 只由 Cloudflare Bulk Redirects 承接。
- `deploy/deploy.sh`：发布静态版本后将对应环境的 vhost 安装到 `/usr/local/nginx/vhost/`，执行 `nginx -t`，失败恢复原配置，通过后 reload；静态资源使用 30 天 immutable 缓存。

## 6. SEO 基建

- **唯一布局 `src/layouts/Layout.astro`** 集中注入：
  - canonical URL
  - hreflang alternate 链（含 `x-default` → en-US）
  - Open Graph / Twitter card（`twitter:site` 绑定官方 X 账号）
  - JSON-LD 结构化数据（`SoftwareApplication` + 带公开 `ContactPoint`、Chrome Web Store 与官方 X `sameAs` 的 `Organization`，可叠加页面级 `structuredData` props）
  - GA4（`G-LBSKJD0H16`）内联加载
- 页面通过 props 传 `title / description / ogImage / structuredData`，布局内组装 meta。
- 主推关键词：`Telegram Private Video Downloader`（见 MEMORY 产品策略）。

## 7. SLS 日志双写（website）

> 对应 `feat.033.website前端SLS日志双写`。**website 写 SLS，后端 Python 不写 SLS；extension 的独立 SLS mark-log 见 `@tech-extension.md` §A7。**

机制（`src/scripts/homepage/sls-mark.ts` + 各处 import）：
- 阿里云 SLS **WebTracking** 旁路上报，**不依赖阿里云 SDK、不新增 npm 依赖**。
- mark-log 写后端 `/api/client/mark/record` 时**同时**写一份 SLS。
- SLS `first_opened_at` 与后端 `mark_logs.first_opened_at` 都来自 website 本地首次打开毫秒时间；旧客户端不传后端字段时默认 `0`。
- website `device_id` 只使用 UUID，存储 key 为 `homepage_device_id_v2`；上线后脚本会删除旧 `homepage_device_id` / `homepage_legacy_device_ids`。
- 全局 `error` / `unhandledrejection`、后端连接失败/超时 → 只写 SLS（`web_frontend_uncaught_error`、`web_backend_connect_failed`），不请求 mark 接口、不进后端 `mark_logs`。
- SLS 上报**不依赖本项目后端**（后端不可用时仍尝试写 SLS），失败**不得影响**页面解析/下载/安装 CTA/登录/订阅。
- 字段只含排障必需信息，**不发送** Cookie/Authorization/访问令牌/完整下载直链；API path 预脱敏（只留 path）。

## 8. 与 backend 的契约

website 前端调用 backend business 的 `/api/client/*`（下载/解析/积分/计数/订单/登录/签到）与 `/api/client/mark/record`（mark-log）。base URL 在 `src/scripts/homepage/api.ts`。后端契约同 `@tech-backend.md`。
