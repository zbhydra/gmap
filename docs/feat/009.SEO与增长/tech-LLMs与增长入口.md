# 009 · LLMs 入口与增长导航(llms.txt + 导航/Install CTA + Solution 分组)

> 技术实现文档。覆盖:website llms.txt / llms-full.txt 内容规则与测试约束、首页导航精简与 Install CTA 拼图图标、Solution 下拉分组的最终状态。
>
> 来源:原 `feat.028 websiteLLMs入口` + `feat.029 website导航与插件CTA识别`(导航/CTA 部分) + `feat.030 ...workaround落地页`(导航 Solution 分组部分)。
>
> 关联:
> - 本域产品:`@feat.md`
> - 平台落地页/Sitemap/长尾文章页:`@tech-落地页与Sitemap.md`
> - 签到后端:`@tech-签到活动.md`
> - website 目录结构/Layout.astro/导航:`@../000.架构/tech-website.md`
> - 14 语言文案 key 组织:`@../010.多语言/tech-website多语言.md`

## 1. llms.txt / llms-full.txt(website)

### 1.1 定位

为网站新增 AI agent 可读的根路径入口:

- `https://telegramdownloadmedia.com/llms.txt`
- `https://telegramdownloadmedia.com/llms-full.txt`

目标是让 LLM、AI 搜索和 agent 在访问网站时能快速理解 Telegram Video Downloader 的产品定位、核心页面、支持平台、限制说明和联系方式。

> 本节只记录 `website` / `telegramdownloadmedia.com` 的主站合同；运行时状态应以该站自身源码、构建产物和真实页面为准。

**llms.txt 不是 robots、sitemap 或训练授权文件**——只是一份 AI 可读目录,不能控制爬虫抓取,也不能保证搜索排名。

### 1.2 文件位置

```
website/public/llms.txt          # 短入口(约 2.8KB)
website/public/llms-full.txt     # 完整入口(约 8.3KB)
```

Astro 构建时复制到 `website/dist/llms.txt` 和 `website/dist/llms-full.txt`。

### 1.3 /llms.txt 短入口结构(以代码为准)

```
# Telegram Video Downloader

> 一句话产品定位

## Core Product
## Download Tools
## Updates
## Key Facts
## Contact
```

内容原则:

- 每条链接一行 Markdown,每条链接包含页面用途说明。
- **保持英文**(默认语言是 en-US,LLMs 入口面向通用 AI agent)。
- 不写无法从当前代码确认的承诺。
- 只允许真实存在的站内 URL;内容页链接限当前网站 canonical 页面。

`## Download Tools` 覆盖:TikTok / X / Vimeo / Instagram / Threads 五个平台下载页(Telegram 首页 `/` 覆盖)。

### 1.4 /llms-full.txt 完整入口结构(以代码为准)

```
# Telegram Video Downloader

> Full content index ...

## Core Product
## Platform Downloaders
## Telegram Workflows
## Download Disabled Channel Workaround Pages
## Language Entrances
## Updates
## Technical Indexes
## Key Facts
## Contact
```

内容原则:

- 收录全部当前页面族。
- **Language Entrances 只列根语言首页**,不展开每个语言下所有重复页面。
- `pt-BR` 内容沿用当前站点路径 `/pt/`,对应 sitemap 文件沿用 hreflang slug `/pt-br-sitemap.xml`。
- **Technical Indexes** 列 sitemap 入口(sitemap.xml 等),帮助 agent 进一步发现 canonical URL;不把 sitemap 内的全部 canonical URL 自动展开进 llms-full.txt(避免长而低价值的重复列表)。

### 1.5 robots.txt 显式 Allow

`website/public/robots.txt` 在 `User-agent: *` 下显式:

```txt
Allow: /llms.txt
Allow: /llms-full.txt
```

作为 AI-readable 入口提示。不新增易过期的 AI crawler 专用 User-Agent 规则;只在 `User-agent: *` 下显式允许 LLMs 入口。

### 1.6 内容禁项(强约束)

LLMs 文件**不包含**:

- `mailto:` 联系方式或明文邮箱(面向 crawler,直接写 mailto 会放大垃圾邮件风险;只提供站内页面入口)。
- 站外绝对 URL(只引用 `https://telegramdownloadmedia.com/...` 站内 URL)。
- 不存在的站内路径(`features/`/`guide/`/`faq/` 这些已退休信息页不进入索引)。
- pricing(主站 pricing 是公开购买页,可进入 sitemap,但不进入 AI 可读索引)。

### 1.7 测试约束(module-scripts.test.js)

`website/tests/module-scripts.test.js` 显式校验:

1. `dist/llms.txt`、`dist/llms-full.txt` 存在。
2. `llms.txt` 链接到 `https://telegramdownloadmedia.com/llms-full.txt`,反之亦然。
3. 两个文件都链接到 `https://telegramdownloadmedia.com/sitemap.xml`。
4. 两个文件引用的 `https://telegramdownloadmedia.com/...` 站内 URL 都能映射到 `dist` 中的 HTML 或静态文件。
5. 显式校验必需核心页、5 个平台下载页、14 个语言入口、sitemap 技术入口完整存在。
6. 显式校验不包含 `mailto:`、明文邮箱、站外绝对 URL。
7. 显式校验 pricing 不进入 LLM 索引。
8. 显式校验 `robots.txt` 包含 `Allow: /llms.txt` 和 `Allow: /llms-full.txt`。
9. 不引用 `/features/`、`/guide/`、`/faq/` 这些已退休信息页。

### 1.8 方案取舍(为什么手写两份静态文件)

| 方案 | 结论 | 原因 |
| --- | --- | --- |
| 只新增 /llms.txt | 不选 | 后续完整目录会撑长;平台页/语言页/政策页会混在一起 |
| /llms.txt + /llms-full.txt(两份) | 选用 | 短入口可读,完整入口可扩展;符合外部有效样例;不需新增依赖 |
| 构建时从 sitemap 自动生成 | 不选(本阶段) | 会把多语言重复页面机械展开,说明文字质量差;还要新增生成逻辑和测试成本 |

## 2. 首页导航与 Install CTA(最终状态,以代码为准)

> **重要**:导航的最终状态是 feat.029 + feat.030 两轮迭代的合并结果。feat.029(09:26)删除了导航 Solutions 入口、给 Install 按钮加拼图图标;feat.030(11:20,同一天)又把 Solution 分组(作为下拉菜单触发器,不跳 /solutions/)加回来承接 workaround 长尾页。**当前代码最终状态:导航有 Home + Solution 下拉(含 workaround 链接)+ 带拼图图标的 Install 按钮**。feat.029 文档里"删除 solutions 导航字段"的口径已被 030 推翻。

### 2.1 桌面导航(Layout.astro `.nav-links`)

`website/src/layouts/Layout.astro` 桌面导航当前包含:

1. **Home 链接**(`t.layout.nav.home`)。
2. **Solution 下拉菜单**(feat.030 加回):
   - `.nav-menu` 容器,内含 `.nav-menu-trigger` 按钮(label = `t.layout.nav.solutions` + chevron)和 `#nav-solution-panel` 下拉面板。
   - 下拉面板含一个链接:跳当前语言前缀下的 `telegram-download-disabled-channel-workaround/`,label = `t.pages.downloadDisabledChannelWorkaround.label`,带 GA 属性 `data-ga-event="internal_workflow_click"` / `data-ga-source="nav_solution"`。
   - 交互:click trigger 切换展开 + 同步 `aria-expanded`/`aria-hidden`;Escape 关闭;点外部关闭;当前页时 item active。
3. **Install CTA**(feat.029 加图标):
   - 主按钮,Chrome Web Store 链接。
   - 按钮文字左侧 18x18px 拼图形状内联 SVG(插件识别图标),`aria-hidden="true"`,8px 间距,颜色 `currentColor` 继承按钮文字(白)。
   - 按钮可访问名称仍由 i18n 安装文案提供(`t.common.installCta`)。
   - 沿用现有 `outbound_chrome_store_click` 埋点,不改变其 GA 埋点。
4. **语言切换器**。

### 2.2 i18n schema(layout.nav.solutions 仍保留,以代码为准)

源文档 feat.029 说"删除 `layout.nav.solutions` schema 和各语言包"。**代码事实**:`website/src/i18n/schema.ts` 仍保留 `layout.nav.solutions: string`(约 585 行),因为 feat.030 把 Solution 分组加回来后这个字段又需要了。本域按代码最终状态写:`layout.nav.solutions` 保留。

### 2.3 移动导航

移动菜单里直接展示 Home + workaround 链接(`t.pages.downloadDisabledChannelWorkaround.label`),不额外展示不可点击的 Solution label(避免小屏信息过密)。

### 2.4 Solution 下拉只有一个 item(当前)

当前下拉面板只含 workaround 一个链接(因为只有一个公开 solution 页面)。这是满足"Solution 栏下有 item"的最低复杂度方案。后续若新增更多长尾文章页,可继续往这个下拉加 item。

### 2.5 Install 图标规格

| 元素 | 规格 |
| --- | --- |
| 图标 | 内联 SVG(拼图插件形状),18x18px |
| 位置 | 按钮文字左侧 |
| 间距 | 图标与文字 8px |
| 颜色 | `currentColor`,继承按钮文字(白) |
| 可访问性 | `aria-hidden="true"`,按钮可访问名称由文字提供 |
| 资源 | 不新增图片资源,不新增 icon 依赖,内联 SVG |

## 3. Footer 内链

Footer 在 Changelog 链接旁增加 Solution 内链分组(当前含 workaround 同名内链):

```astro
<nav class="footer-link-groups" aria-label={t.layout.nav.solutions}>
  <div class="footer-link-group">
    <p class="footer-link-title">{t.layout.nav.solutions}</p>
    <a href={`${currentLocalePath}telegram-download-disabled-channel-workaround/`}
       data-ga-event="internal_workflow_click"
       data-ga-source="footer"
       data-ga-target="download_disabled_channel_workaround">
      {t.pages.downloadDisabledChannelWorkaround.linkLabel}
    </a>
  </div>
</nav>
```

href 同当前语言前缀;点击上报 `internal_workflow_click`,`source=footer`。

## 4. 语言切换保持 slug(长尾文章页)

当前语言切换 `data-path` 原本只指向语言首页。长尾文章页实现时让语言切换保持当前 slug:

- 使用已有 `pagePathWithoutLocale` 计算目标语言 URL。
- `data-path` 从 `/${path}/` 改为目标语言完整路径。
- 对首页仍输出语言首页。

验收:

- 在 `/telegram-download-disabled-channel-workaround/` 切日语 → `/ja/telegram-download-disabled-channel-workaround/`。
- 在 `/ja/telegram-download-disabled-channel-workaround/` 切英文 → `/telegram-download-disabled-channel-workaround/`。

## 5. 验收/验证命令

```bash
cd website
pnpm build
pnpm test:module-scripts
# 导航 e2e:
pnpm exec playwright test e2e/website.spec.ts --project=chromium \
  --grep "primary nav removes|should keep direct no-limits|install CTA communicates|should keep the reduced nav size|Solution"
# 移动导航:
pnpm exec playwright test e2e/website.spec.ts --project="Mobile Chrome" --grep "mobile nav"
```

## 6. 回滚

### LLMs

1. 删除 `website/public/llms.txt`、`website/public/llms-full.txt`。
2. 删除 `website/tests/module-scripts.test.js` 中新增的 LLMs 断言。
3. 重新 `pnpm build`。

### 导航/Install 图标

1. 恢复 `Layout.astro` 的 Solutions 导航链接状态(如需)。
2. 恢复 `layout.nav.solutions` schema 和各语言文案(如已删除)。
3. 恢复 e2e 导航数量断言。
4. 重新执行验证命令。
