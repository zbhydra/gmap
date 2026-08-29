# 009 · 落地页与 Sitemap(平台落地页 + 多语言 Sitemap 生成器 + 长尾文章页)

> 技术实现文档。覆盖:website 平台 SEO 落地页的共享模板与路由、自定义 Astro sitemap 集成(14 语言拆分 + lastmod)、长尾文章页结构。
>
> 来源:原 `feat.020 平台SEO落地页` + `feat.026 website多语言Sitemap治理` + `feat.030 website禁下载频道workaround落地页` + `feat.024 website首页private视频下载改造`(首页 SEO 内容改造,§6)。
>
> 关联:
> - 本域产品:`@feat.md`
> - llms.txt 内容、导航/Install CTA:`@tech-LLMs与增长入口.md`
> - 签到后端:`@tech-签到活动.md`
> - website 目录结构、Astro 技术栈、构建配置:`@../000.架构/overview.md` `@../000.架构/tech-website.md`
> - 14 语言清单/locale→URL 路径映射:`@../010.多语言/tech-website多语言.md`
> - 下载工作区组件:`@../002.下载功能/feat.md`

## 1. 平台 SEO 落地页(website)

### 1.1 现状(以代码为准)

源文档 feat.020 只规划 TikTok/X/Vimeo 三个平台,实际代码已落地 **5 个平台落地页**:

```
website/src/pages/
├── tiktok-downloader.astro          # en-US TikTok 入口
├── x-downloader.astro               # en-US X 入口
├── vimeo-downloader.astro           # en-US Vimeo 入口
├── instagram-downloader.astro       # en-US Instagram 入口
├── threads-downloader.astro         # en-US Threads 入口
└── [lang]/                          # 13 语言镜像(每种语言 5 个平台页)
    ├── tiktok-downloader.astro
    ├── x-downloader.astro
    ├── vimeo-downloader.astro
    ├── instagram-downloader.astro
    └── threads-downloader.astro
```

> 注意:`website/src/components/pages/PlatformDownloaderPage.astro` 头部注释仍写"为 TikTok / X / Vimeo 三个平台",这是**过时注释**,实际 `Platform` 类型联合已扩到 5 个平台(`'tiktok' | 'x' | 'vimeo' | 'instagram' | 'threads'`)。

### 1.2 共享模板 PlatformDownloaderPage.astro

`website/src/components/pages/PlatformDownloaderPage.astro` 是所有平台落地页的共享模板。

Props:

```ts
interface Props {
  locale: Locale
  platform: 'tiktok' | 'x' | 'vimeo' | 'instagram' | 'threads'
}
```

页面区块顺序(从上到下):

1. **Hero 工具区**:复用首页 `.hero.hero-tool` 样式(含左右光晕装饰),内嵌 `DownloadWorkspace` 组件,`headingLevel="h1"`。平台专属覆盖字段(title/linkPlaceholder/emptyHint/helperText)从 i18n `pages.platformDownloaders[platform].workspace` 取。
2. **Features 特性卡片**:标题 + 副标题 + 3 列卡片网格,960px 以下转单列;样式参考 `.no-limits-grid`/`.no-limits-card`,scoped 在组件 `<style>` 内。
3. **HowTo 使用步骤**:复用 `HomepageHowToSection` 组件,3 步(复制链接→粘贴→下载)。
4. **FAQ 区块**:复用 `HomepageFaqSection`(details/summary 折叠),每平台 5 个问答。
5. **Cross-Links 互链**:标题 "Download from other platforms",3 列卡片网格,链接到其他平台落地页 + 首页(Telegram)。

### 1.3 链接过滤策略

- **不做链接平台过滤**:任何平台的链接都能在任何平台落地页解析。用户在 TikTok 页粘 X 链接也能正常下载,不阻断。
- 平台落地页只通过 SEO meta 和文案差异化承接搜索流量,下载能力对所有平台一致。

### 1.4 JSON-LD 结构化数据

每个落地页注入两个 schema:

- **FAQPage**:对应 FAQ 区块的问答。
- **WebApplication**:标注在线工具(`applicationCategory: MultimediaApplication`,`operatingSystem: Any`,`offers.price: 0`,name 用品牌名)。

落地页设置 `includeSoftwareApplicationSchema={false}`,避免与全局 Chrome 扩展 schema 冲突。

### 1.5 SEO meta(每平台)

| 平台 | Title | Description |
| --- | --- | --- |
| TikTok | TikTok Video Downloader No Watermark \| TG Downloader | Download TikTok videos without watermark in HD quality. Save TikTok to MP4, free online TikTok video saver. |
| X | X (Twitter) Video Downloader \| TG Downloader | Download X (Twitter) videos and GIFs in highest quality. Save tweets with video to MP4. |
| Vimeo | Vimeo Video Downloader HD \| TG Downloader | Download Vimeo videos in HD quality. Save Vimeo to MP4, choose resolution. |
| Instagram | (i18n 同模式) | (i18n) |
| Threads | (i18n 同模式) | (i18n) |

Title 后缀统一使用主站品牌 `TG Downloader`。完整 14 语言 title/description/keywords 在 `website/src/i18n/lang/{locale}.ts` 的 `pages.platformDownloaders` 字段,由 schema interface 约束字段齐全。

### 1.6 多语言路由

`[lang]/*-downloader.astro` 用统一模式生成路径(以 tiktok 为例):

```ts
export function getStaticPaths() {
  return Object.entries(localePaths)
    .filter(([locale]) => locale !== 'en-US')   // en-US 走无前缀根路由
    .map(([locale, path]) => ({ params: { lang: path }, props: { locale: locale as Locale } }))
}
```

locale→URL 前缀映射见 `@../010.多语言/tech-website多语言.md`(en-US 无前缀,pt-BR 前缀是 `pt` 不是 `pt-br`,等)。

### 1.7 不修改现有首页结构

平台落地页是纯新增,不修改首页;不加入导航栏(靠搜索流量和互链发现);不新增后端接口;Telegram 不需要独立落地页(首页已覆盖)。

## 2. 多语言 Sitemap 治理(website)

### 2.1 替换默认 @astrojs/sitemap

源文档基线:单个混合语言 sitemap-0.xml + 无 lastmod + 静态 public/sitemap.xml。

代码事实:`website/astro.config.mjs` 已**移除 `@astrojs/sitemap` integration**,接入自定义 `languageSitemap()`:

```js
// website/astro.config.mjs
import languageSitemap from './src/sitemap/languageSitemap.mjs'
export default defineConfig({
  site: 'https://telegramdownloadmedia.com',
  integrations: [vue(), languageSitemap()],
  trailingSlash: 'always',
  // ...
})
```

`website/public/sitemap.xml`(静态索引)**已删除**,所有 sitemap 文件由构建生成。

### 2.2 自定义 integration: languageSitemap.mjs

`website/src/sitemap/languageSitemap.mjs` 是自定义 Astro integration(`name: 'language-sitemap'`),默认导出一个工厂函数返回 Astro hooks。

**构建后写入的文件**(`writeSitemaps` 阶段):

| 文件 | 内容 |
| --- | --- |
| `dist/sitemap.xml` | 根 sitemap index,robots 和 GSC 主入口 |
| `dist/sitemap_index.xml` | 内容与 sitemap.xml 相同(命名兼容排查) |
| `dist/sitemap-0.xml` | 扁平 urlset,收录全部 canonical URL(对照旧版 GSC 成功读取入口) |
| `dist/sitemap.xsl` | 浏览器可读表格样式;搜索引擎仍读原始 XML |
| `dist/{slug}-sitemap.xml` × 14 | 14 语言 sitemap |

**14 语言 sitemap 文件名**:

| Locale | URL 前缀 | sitemap 文件 |
| --- | --- | --- |
| en-US | `/` | `en-sitemap.xml` |
| zh-CN | `/zh-cn/` | `zh-cn-sitemap.xml` |
| zh-TW | `/zh-tw/` | `zh-tw-sitemap.xml` |
| ja-JP | `/ja/` | `ja-sitemap.xml` |
| ko-KR | `/ko/` | `ko-sitemap.xml` |
| es-ES | `/es/` | `es-sitemap.xml` |
| pt-BR | `/pt/` | `pt-br-sitemap.xml` |
| de-DE | `/de/` | `de-sitemap.xml` |
| fr-FR | `/fr/` | `fr-sitemap.xml` |
| ru-RU | `/ru/` | `ru-sitemap.xml` |
| it-IT | `/it/` | `it-sitemap.xml` |
| vi-VN | `/vi/` | `vi-sitemap.xml` |
| th-TH | `/th/` | `th-sitemap.xml` |
| id-ID | `/id/` | `id-sitemap.xml` |

> 注意:`pt-BR` 的 URL 前缀是 `/pt/`(不是 `/pt-br/`),但 sitemap 文件名用 `pt-br-sitemap.xml`(用 hreflangMap 的语言值);两套映射独立,不要混。这份配置必须和 `website/src/i18n/ui.ts` 的 localePaths/hreflangMap 一致。

### 2.3 每个 `<url>` 字段

每个 `<url>` 只包含:

- `<loc>`:完整绝对 URL(https://telegramdownloadmedia.com/...)。
- `<lastmod>`:W3C Datetime。

**不输出 `<priority>` / `<changefreq>`**(Google 忽略它们)。

### 2.4 lastmod 计算规则

`lastmod` 必须代表页面内容或结构的最后一次有效变更,**不能用构建时间**。

执行顺序(`getGitLastmod` → `getMtimeLastmod`):

1. 对页面族源文件列表执行 `git log -1 --format=%cI -- <files>`(committer date,ISO),取最新提交时间。
2. 没有 Git 结果(构建环境无 Git 历史)时,退到相关源文件的 `mtime`(最大 mtimeMs),并在构建日志打 warning 说明哪个 URL 用了 fallback、Git 查询失败原因、fallback 文件路径与时间。

### 2.5 页面族 → 源文件映射(getRouteSourceFiles)

`getRouteSourceFiles(routePath)` 把 URL 路径归到页面族,返回该族的源文件列表(只从族源文件算 lastmod,不叠加全局壳层/配置/locale 大文件):

| route pattern | source group |
| --- | --- |
| `/`、`/{lang}/` | `src/pages/index.astro` + `src/pages/[lang]/index.astro` + `src/components/pages/HomePage.astro` |
| `/changelog/`、`/{lang}/changelog/` | changelog.astro + [lang]/ + `src/i18n/content.ts` |
| `/terms/`、`/privacy/`、`/{lang}/terms|privacy/` | `LegalPage.astro` + `legalContent.ts` |
| `/about/`、`/contact/`、`/{lang}/about|contact/` | `CompanyPage.astro` + `companyContent.ts` |
| `/telegram-download-disabled-channel-workaround/`、`/{lang}/...` | 该页 + [lang]/ + `TelegramDownloadDisabledGuidePage.astro` + `i18n/downloadDisabledChannelWorkaround.ts` |
| `/*-downloader/`、`/{lang}/*-downloader/` | 对应 page + [lang]/ + `PlatformDownloaderPage.astro` |

**不叠加** `src/layouts/Layout.astro`、`src/i18n/ui.ts`、`src/i18n/lang/{locale}.ts`:这些粒度过粗,会让壳层/配置/整种语言的翻译改动污染全站或整语言的 lastmod。

### 2.6 语言分组规则

- URL path 为 `/` 或第一段不是任何语言前缀 → 归入 en-US。
- URL path 第一段命中 `localePaths` 的 pathPrefix → 归入对应 locale。
- 每个 locale 内部 URL 按路径字母序排序;URL 去重后再写。

### 2.7 排除规则

不进入 sitemap:

- `404`、`500`。
- noindex 页面、非 HTML 页面。
- 已退休的 `/solutions/` 及其所有子路径；历史入口由 Cloudflare 301 到 workaround 指南。
- 已退休信息页 `/features/`、`/guide/`、`/faq/` 及各语言前缀版本(这些由 Cloudflare Bulk Redirects 301 到对应语言首页,不生成页面)。

> **pricing 的处理(以代码为准)**:源文档 feat.026 说"pricing 由 robots.txt 屏蔽,不进入 sitemap"。代码事实:主站 `website/public/robots.txt` 当前对 `User-agent: *` **无 Disallow**(不屏蔽 pricing)。本域按主站现状写。

### 2.8 XML 写入

XML 写入做实体转义(`&`→`&amp;`、`<`→`&lt;`、`>`→`&gt;`、`"`→`&quot;`、`'`→`&apos;`)。sitemap index 内每个 sitemap 的 `<lastmod>` 用该语言 sitemap 内 URL 的最大 lastmod。

### 2.9 robots.txt(website 主站)

`website/public/robots.txt`:

```txt
User-agent: *
Disallow: /extension-login/
Disallow: /paypal/cancel/
Disallow: /paypal/success/

Allow: /llms.txt
Allow: /llms-full.txt

Sitemap: https://telegramdownloadmedia.com/sitemap.xml
```

- `User-agent: *` 下屏蔽登录回跳页 `/extension-login/` 与 PayPal 回跳页 `/paypal/cancel/`、`/paypal/success/`；这些页面也不进入 sitemap。
- 显式 Allow `/llms.txt` 和 `/llms-full.txt` 作为 AI-readable 入口提示。
- 只暴露根 sitemap 入口。

## 3. 长尾文章页:禁下载频道 workaround(website)

### 3.1 路由

```
website/src/pages/
├── telegram-download-disabled-channel-workaround.astro          # en-US 入口(英文无前缀)
└── [lang]/telegram-download-disabled-channel-workaround.astro   # 13 语言镜像
```

14 语言路径:en-US `/telegram-download-disabled-channel-workaround/`;其余 13 语言 `/{前缀}/telegram-download-disabled-channel-workaround/`(如 `/zh-cn/...`、`/ja/...`、`/pt/...`)。slug 保持英文,避免多语言 URL 产生额外映射。所有 URL 保持尾斜杠,canonical 由 Layout.astro 按当前路径生成。

### 3.2 共享组件 TelegramDownloadDisabledGuidePage.astro

`website/src/components/pages/TelegramDownloadDisabledGuidePage.astro`(约 21KB)是文章页共享模板。

Props:`locale: Locale`。从 `getContent(locale)` 取文案,从 `t.pages.downloadDisabledChannelWorkaround` 取页面内容。

HTML 结构(从上到下):

```
Layout
  article.guide-page
    section.guide-hero-section
      header.guide-hero            # H1
      section.guide-workspace      # DownloadWorkspace, headingLevel="p"(标题用 <p> 不占 heading)
      div.guide-summary-shell      # intro + quick answer + TOC
    section.guide-content          # 多张 section card
    section.guide-comparison       # 方法对比表
    section.guide-howto            # HowTo timeline
    section.guide-faq              # details/summary 卡片
    section.guide-bottom-line      # 结论(橙色弱底卡片)
```

### 3.3 关键 UI 规格

| 元素 | 桌面 | 移动 |
| --- | --- | --- |
| H1 | 24px,line-height 1.18,最大 760px,不用 viewport font size | 24px 自然换行 |
| 工作区标题 | `<p>` 小提示 `Paste Telegram Video Link`(不占 heading,避免和首页抢关键词权重) | 同 |
| guide-summary-shell | 首页同款 36px 大圆角白色玻璃 shell | 28px 圆角 |
| quick answer | 蓝色弱底 callout,内边距 18px | 20px |
| TOC | 真 `ul/li` 列表 + 浅灰面板 + 行式链接 + 小蓝点/箭头 | 单列自适应 |
| section card | 26px 圆角灰底卡片,段落 15px | 22px 圆角 |
| comparison table | 首页 InfoTable 风格 | 表头隐藏、每行转卡片,不横向滚动 |
| howTo | 首页 timeline 双栏 shell | 单列 timeline |
| FAQ | 首页 FAQ shell + 两列 details 卡片 | 单列 details 卡片 |
| bottom line | 橙色弱底卡片 | 同款移动间距 |

### 3.4 结构化数据

页面传给 Layout 的 `structuredData` 用一个 `@graph`:

- **Article**
- **BreadcrumbList**(JSON-LD breadcrumb,不渲染页面内可见 breadcrumb)
- **FAQPage**(和页面可见 FAQ 文案同源)
- **HowTo**(step `url` 用 `${pageUrl}#${step.anchor}`)

规则:所有 `@id`/`url`/`item` 用 `Astro.site` + 当前路径生成;`author.name`/`publisher.name` 用品牌名;`publisher.logo` 用 `/favicon.svg`;Article image 用真实存在的站内图片;HowTo step 没有真实图片时省略 `image` 字段;**不保留 `example.com`、`Your Site Name` 或不存在的图片路径**;不给 schema 对象声明 `Record<string, unknown>`。

### 3.5 正文章节(section id)

sections 的 id 与锚点一致:`why-disabled`、`before-you-start`、`workaround-1`、`workaround-2`、`workaround-3`、`workaround-4`、`third-party`、`legal`。

comparison.rows 含 5 行:Ask the admin / Telegram Desktop/Web / Screen recording / Forward → Saved Messages / Third-party unlocker bots。

faq.items 含 5 个问题(与 FAQPage JSON-LD 一致)。

### 3.6 sitemap route family

`getRouteSourceFiles` 已加 `/telegram-download-disabled-channel-workaround/` 映射(见 §2.5),保证新页进入 14 语言 sitemap 与 sitemap-0。

### 3.7 退休 /solutions/

`/solutions/` 与各语言版本不再生成页面，也不进入 sitemap、LLM 索引或 Breadcrumb 结构化数据。Cloudflare 继续保留一跳 301，将历史 URL 转到同语言的 `/telegram-download-disabled-channel-workaround/`。导航 Solution 分组只作为 workaround 页入口，不链接退役 URL。

## 4. 验收/验证命令

### website

```bash
cd website
pnpm tsc --noEmit
pnpm build
pnpm test:module-scripts
# 抽查构建产物:
#   dist/tiktok-downloader/index.html, dist/x-downloader/index.html, ...
#   dist/zh-cn/tiktok-downloader/index.html (多语言抽查)
#   dist/sitemap.xml, dist/sitemap_index.xml, dist/sitemap-0.xml, dist/*-sitemap.xml
#   dist/llms.txt, dist/llms-full.txt, dist/robots.txt
xmllint --noout dist/sitemap.xml dist/sitemap_index.xml dist/sitemap-0.xml dist/*-sitemap.xml
```

## 5. 回滚

### Sitemap

1. 恢复 `@astrojs/sitemap` integration。
2. 恢复 `website/public/sitemap.xml` 静态索引。
3. 删除 `website/src/sitemap/languageSitemap.mjs`。
4. 重新 `pnpm build`。回滚后站点仍能通过 `robots.txt → sitemap.xml → sitemap-0.xml` 暴露 URL,只是失去语言拆分和 lastmod。

## 6. 首页 Telegram Private Video Downloader 改造(website)

> 来源:原 `feat.024 website首页private视频下载改造`(纯 SEO 内容改造,14 语言、JSON-LD、sitemap、关键词,归本域而非下载功能域)。

### 6.1 定位

把主站首页 `/`(及 14 语言 `/[lang]/`)从"通用 Telegram 视频下载"改造成围绕核心关键词 **"Telegram Private Video Downloader"** 的 SEO + 转化着陆页,承接私有频道 / 受限视频下载意图的自然流量。**只改内容结构,不改下载解析逻辑**(`DownloadWorkspace` 仅作 Hero 保留,功能不变)。

### 6.2 SEO meta 独立化

- 在 i18n 的 `pages.homepage` 下新增**必填** `seo: { title; description; keywords }` 字段,所有 locale 的首页 meta 都从该字段取值。
- 不再走 `t.site.name` / `t.site.keywords`(全站共享,无法承载首页 private 口径)。
- 由 TypeScript schema 强制 14 语言齐全(运行期不缺字段)。
- H1 唯一:解析工具标题 `workspace.parse.title` 直接替换为飞书 H1 文案(`Telegram Private Video Downloader: Download Any Private Media`),**不新增独立标题行、不动 `headingLevel`**。

### 6.3 首页区块顺序(从上到下)

1. **Hero(复用现有解析工具区,仅改文案)**:H1(替换 `workspace.parse.title`)→ 解析输入框 → 副描述(`workspace.parse.helperText` 换飞书 Description)→ **Trust Points**(新增 `heroTrustPoints`,4 个纯文字徽标:`HD video download` / `No registration` / `Mobile friendly` / `Works on Windows, Mac, Android, and iPhone`)。(V4 视觉层:徽标渲染为白底 pill + 主色圆形对勾图标;hero 另加点阵纹理、顶部蓝色辉光与桌面端浮动平台图标卡装饰层,均纯装饰 aria-hidden,不新增文案。)
2. **情景匹配表**(新增 InfoTable):标题 `Start Here: Which Situation Matches Yours?`,2 列 × 4 行;移动端转纵向卡片堆叠,不横向滚动。
3. **HowTo**(复用 `HomepageHowToSection`,3 步):Copy the Video Link → Paste and Analyze → Download in HD。
4. **Solutions**(新增 SolutionsSection):标题 + intro + quickAnswer 强调段 + 4 张方案卡(Online Telegram Video Downloader / Telegram Desktop Save Video As / Mobile or Desktop Screen Recording / Android File Manager Check)。
5. **卖点网格**(新增 BenefitsSection,6 卡):Save Videos in High Quality / Works Across Devices / No Telegram Login Required / Easy Offline Playback / Fast Link-Based Process / Clear Permission Boundary。(V4 视觉层:每张卡下半部按序位嵌入纯装饰迷你 mockup 插图——格式 chips / 设备框 / 解析结果行 / 进度条 / 链接解析流 / 权限清单,aria-hidden,占位内容为非语言装饰。)
6. **排错清单**(新增,内联):`If the Telegram Video Link Does Not Work`,6 条无序清单。
7. **合规声明**(新增,内联):`Important Permission Note`,独立卡片。
8. **方法对比表**(新增 InfoTable):4 列 × 5 行(Situation / Recommended Solution / Best For / What to Check),移动端转卡片堆叠。
9. **交叉链接**(复用 `CrossLinksSection`):5 个平台互链卡(TikTok / X / Vimeo / Instagram / Threads),保留 GA 埋点。(V4 视觉层:卡片顶部增加品牌色平台图标,平台身份由 href 推导,不新增 i18n 文案。)
10. **FAQ**(复用 `HomepageFaqSection`,换 8 题新版)。

删除:首页旧 `workflows` 区块(链 `/solutions/` 的卡片网格)、旧 `metaDescription` 字段(由 `seo` 取代)。

### 6.4 首页结构化数据

- **FAQPage JSON-LD**:在 `HomePage.astro` 构造 `faqSchema` 对象,通过 `structuredData={[faqSchema]}` 传给 `Layout`(走 Layout 现有结构化数据渲染链路),**不要用 `slot="head"` 注入**(Layout 不消费该 slot,会变成不渲染的 bug)。
- 验收断言:渲染后 `<head>` 内存在 `application/ld+json` 且含 `FAQPage` 与 8 个 `mainEntity`。

### 6.5 响应式

- ≤960px:卡片网格转单列。
- ≤640px:两张 InfoTable(情景匹配表 / 方法对比表)转纵向卡片堆叠,不横向溢出。

### 6.6 合规边界

- 首页允许使用 `No registration` / `No Telegram Login Required`。
- 屏幕录制与 Android 文件管理器方案不得宣称绕过权限,只描述保存用户已经有权访问或已加载的内容。

### 6.7 移动端 private 边界(登记,非本节技术范围)

前端对 `t.me/c/` 真私有频道链接先本地识别并展示扩展引导,后端保留 `requires_client` 兜底。移动端装不了扩展;普通搜索用户多数粘贴公开消息链接(`t.me/{username}/{id}`,可在线解析)。该关键词簇转化天然受限属策略预期。

### 6.8 专有名词锁定不翻译

`Telegram` `Telegram Video Downloader` `Telegram Web` `Chrome`/`Edge`/`Brave` `TikTok`/`Instagram`/`Threads`/`Vimeo`/`X` `t.me` `MP4`/`MP3`/`JPG` 等专有名词锁定不翻译。

### 6.9 埋点

保留现有 `data-ga-event` / `data-ga-source` 委派埋点机制。新增可点击内链 / CTA 沿用 `data-ga-event="internal_workflow_click"`,`data-ga-source` 区分区块(如 `homepage_situation` / `homepage_solutions` / `homepage_comparison`)。交叉链接与解析 CTA 的现有埋点不变。不新增自定义事件类型(本节为内容改造,非埋点改造)。

## 7. SEO meta 来源治理(website)

### 7.1 JSON-LD 品牌字段与页面 SEO 解耦

`website/src/layouts/Layout.astro` 应以一个本地常量固定 schema 主实体品牌 `Telegram Video Downloader`,与页面 `<title>` / `<meta description>` 来源完全解耦:

```ts
const schemaName = 'Telegram Video Downloader'
```

`schemaName` 同时写入 `SoftwareApplication.name`、`Organization.name`、`SoftwareApplication.author.name`。页面级 title / description 继续由各页传入,不反向影响 schema 主实体。

收益:schema 品牌实体保持统一;`site.name`(导航/页脚品牌)和首页 `pages.homepage.seo.title` 可独立做长度控制,不会污染结构化数据主实体。

> 本节只记录 `website` / `telegramdownloadmedia.com` 主站的 JSON-LD 品牌合同；运行时同步、构建产物扫描和真实页面验证均须由该站自身的证据确认。

### 7.2 页面 SEO 字段独立化模式

每个需要独立 SEO 口径的页面族,在 i18n 内维护**专用 SEO 字段**,不复用 `site.*` 或页面正文标题:

| 页面族 | SEO 字段位置 | 取值方式 |
| --- | --- | --- |
| 首页 `/` | `pages.homepage.seo.{title,description,keywords}` | 由 schema 强制 14 语言齐全(见 §6.2) |
| Changelog `/changelog/` | `pages.changelog.{seoTitle,seoDescription}` | 页面回退到正文 `title` / `description` |
| Legal `/terms/` `/privacy/` | `legalContent.ts` 的 `seoTitle` / `seoDescription` | `LegalPage.astro` 直接读 |
| Company `/about/` `/contact/` | `companyContent.ts` 的 `seoTitle` / `seoDescription` | `CompanyPage.astro` 直接读 |

构建产物验收按西文 title ≤60、description 140-160 字符,CJK title ≤40、description 70-90 字符扫描;这些阈值不作为运行时常量。

Changelog 页(`website/src/pages/changelog.astro`、`[lang]/changelog.astro`)显式回退:

```ts
const title = t.pages.changelog.seoTitle || t.pages.changelog.title
const description = t.pages.changelog.seoDescription || t.pages.changelog.description
```

> 原因:页面正文标题(如 changelog 的 "Telegram Video Download Changelog")长度与 SEO 最优长度不一致,SEO title 需要独立控制；仅在不重复时追加规范品牌。英文首页遵循 §6.2 的批准 Title，不追加品牌后缀。

### 7.3 规范品牌合同

唯一品牌为 `Telegram Video Downloader`，不追加其他品牌后缀。页面 Title 仅在自然且不重复时包含该精确品牌；英文首页固定使用 `Telegram Video Downloader for Private Media`。

- `schemaName`、全站 i18n `site.name`、导航 `nav.brand`、页脚版权、Legal `serviceName`、sitemap、`application-name`、`og:site_name`、`WebSite.name`、`WebApplication.name` 与 `Organization.name` 均使用 `Telegram Video Downloader`。
- 不使用私有频道保存器后缀,也不保留其他品牌别名作为运行时回退。
- Chrome 商店命名属于商店域,不在本技术文档范围。

### 7.4 结构化数据合规约束

- `Layout.astro` JSON-LD 不得输出无法由真实数据支持的 `aggregateRating`。
- `SoftwareApplication.featureList` 只描述用户已加载或已有权访问的内容,不得出现 `100%`、`bypass` 等绝对化或绕过权限的承诺。
