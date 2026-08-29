# 009 · SEO 与增长

> 产品需求文档。只描述"做哪些 SEO 资产、承接哪些增长流量、签到活动、边界、验收"。技术实现(落地页生成、Sitemap 多语言生成器、llms.txt 内容、签到后端)见同目录 `tech-*.md`。
>
> 关联:
> - 本域技术:`@tech-落地页与Sitemap.md` `@tech-LLMs与增长入口.md` `@tech-签到活动.md`
> - 变更记录:`@changelog.md`
> - website 目录结构、构建配置、Astro 技术栈:`@../000.架构/overview.md`
> - 多语言机制(14 语言清单、locale→URL 路径映射、文案 key 规则):`@../010.多语言/feat.md`
> - 下载工作区与下载链路:`@../002.下载功能/feat.md`
> - 用户/账户入口、登录态:`@../007.用户系统/feat.md`
> - 签到发放的 Credits 余额、流水、扣费:`@../003.积分系统/feat.md`

## 系统定性:SEO 与流量增长域

本域管**让站点被搜索引擎和 AI agent 发现、承接自然搜索与长尾流量、用签到活动拉动登录用户回访**的全部产品口径。具体包含四件事:

1. **平台 SEO 落地页**:为各下载平台(TikTok / X / Vimeo / Instagram / Threads 等)建独立的长尾关键词落地页,承接"平台名 + downloader"类搜索流量。
2. **多语言 Sitemap 与可发现性资产**:把站点 URL 按 14 语言拆分 sitemap、提供准确 lastmod、维护 robots 与 llms.txt,让搜索引擎和 AI agent 能高效发现全部 canonical 页面。
3. **签到活动与首页账户入口**:用 14 天签到发 Credits 拉动登录用户每日回访,同时把首页登录态入口改成移动端优先的"圆形账户按钮 + Credits 徽标"。
4. **增长入口**:首页导航/页脚的内部导流、长尾文章页(如禁下载频道 workaround)。

> **边界声明(重要)**:本域只管 SEO/增长资产与签到活动本身。相邻内容不在本域:
> - 14 语言清单、locale→URL 路径映射、文案 key 组织规则:`@../010.多语言/feat.md`(本域只说"sitemap 按语言拆分、hreflang 覆盖 14 语言",不重复定义语言清单)
> - 下载工作区的解析/下载链路:`@../002.下载功能/feat.md`(本域落地页只是把下载工作区放进 SEO 外壳)
> - 登录态、用户身份、Google 登录、退出登录:`@../007.用户系统/feat.md`(本域只描述账户按钮入口长什么样、签到要求登录)
> - Credits 余额账户、流水、下载扣费、积分包购买:`@../003.积分系统/feat.md`(本域签到只调用"发 Credits + 返回最新余额"的能力,不定义 Credits 模型)
> - website 目录结构、构建配置、Astro 集成机制:`@../000.架构/overview.md`

## 功能目标

1. **平台落地页获取自然流量**:为每个支持的下载平台建独立 SEO 落地页,通过"平台名 + downloader / no watermark / HD"等长尾关键词从搜索引擎获取自然流量,平台间互链形成 topic cluster。
2. **Sitemap 让搜索引擎高效抓取**:把站点从"单混合 sitemap + 无 lastmod"治理为"根 sitemap index + 14 语言 sitemap + 准确 lastmod",提升多语言页面抓取管理与 Search Console 分组观察能力。
3. **AI agent 可读入口**:提供 llms.txt / llms-full.txt,让 LLM、AI 搜索和 agent 在访问站点时快速理解产品定位、核心页面、支持平台、限制说明。
4. **签到活动拉动回访**:登录用户首次进入签到系统起算 14 天活动,前 7 天每日 6 Credits、第 8-14 天每日 3 Credits,用每日签到奖励拉动回访;同时改造首页登录态入口。
5. **承接精准长尾文章流量**:针对具体长尾关键词(如"telegram download disabled channel workaround")建文章型 SEO 落地页,进入导航和页脚内链。

## 功能范围

### 包含

- **平台 SEO 落地页**:每个平台一个落地页,每个落地页 14 语言版本;页面含工具区(复用下载工作区)、平台特性卡片、使用步骤、FAQ、平台间互链区块;注入 FAQPage + WebApplication 结构化数据;平台专属 title/description/keywords;不做链接平台过滤(任何平台链接都能在任何页面解析)。
- **Pricing 页可发现性**:主站 `/pricing/` 及多语言版本是公开购买页,进入 sitemap;pricing 不进入 LLM 索引。
- **多语言 Sitemap 治理**:根 sitemap index + 14 语言 sitemap + 扁平 sitemap-0 + 可读样式 sitemap.xsl;每个 URL 带 lastmod(以页面族源文件的 git 提交时间为准);不输出 priority/changefreq;robots 只暴露根 sitemap 入口;排除 noindex、已退休信息页、404/500。
- **llms.txt / llms-full.txt**:短入口给一句话定位 + 核心页面;完整入口给平台页、文章页、14 语言入口、技术索引(sitemap);英文为主(默认语言 en-US,面向通用 AI agent);只引用真实存在的站内 URL;不含 mailto/明文邮箱/站外绝对 URL;robots 显式 Allow 这两个入口。
- **签到活动**:仅 website 提供;登录用户首次触发签到系统创建活动记录,不按注册时间算;14 天活动周期按服务器时区自然日计算;前 7 天每日 6 Credits、第 8-14 天每日 3 Credits;每天手动签到一次;漏签不补;14 天结束后永久结束;签到奖励写入现有 Credits 余额与流水。命中用户系统 IP 注册权益风控的账号在注册阶段直接创建已过期活动,不发签到奖励。
- **首页账户入口改造**:登录态从"邮箱全文 + 次数 pill"改为移动端优先的"圆形账户按钮(头像或邮箱首字母) + Credits 徽标";账户按钮展开仅含退出登录的下拉菜单;点击 Credits 在活动未结束时打开签到弹窗;当天首次进入首页且可签到时自动弹窗,当天关闭后不再自动弹。
- **长尾文章落地页**:针对精准长尾关键词建文章型 SEO 页(如禁下载频道 workaround),14 语言版本;页面含 Hero+工具区、Quick answer、目录、正文章节、方法对比表、FAQ、结论;注入 Article + BreadcrumbList + FAQPage + HowTo 结构化数据;进入导航 Solution 分组和页脚内链。
- **导航与安装 CTA**:首页导航精简(只保留必要入口);Install Now 安装按钮增加浏览器插件识别图标(拼图形状),让用户点击前知道这是 Chrome 扩展入口。
- **官方 X 身份入口**:主站 14 语言 Footer 的 Company 分组与 Contact 页展示官方 X 账号 `@TGDownload`;链接在新标签页打开;邮件仍是主要支持渠道;全站机器可读身份声明关联同一账号。
- **GSC/GA4 运行时指标采集**:在管理后台由管理员手动完成 Google OAuth 只读授权,后端 cron 定期采集 GSC 的 24H / 7D / 28D 点击、曝光、平均点击率、平均排名,以及 GA4 的最近 30 分钟活跃用户和 today / 7D / 28D 活跃用户,写入统一 JSON 快照表;详见 `@tech-GSC与GA4采集.md`。

### 不包含

- **不修改下载工作区核心交互**:落地页只是把下载工作区放进 SEO 外壳,不重写解析/下载链路(见 `@../002.下载功能/feat.md`)。
- **不修改 14 语言清单与 locale 路径映射**:本域只用语言清单,不定义它(见 `@../010.多语言/feat.md`)。
- **不新增后端下载/解析接口**(签到接口除外)。
- **签到不支持**:extension 签到、补签、多轮活动、签到任务/提醒/推送/邮件通知、"以后不再提示"永久开关、活动结束结果弹窗、后台人工重置签到周期、新独立积分币种(直接发 Credits)。
- **签到不做金融级补偿设计**:允许出错让用户重试。
- **llms.txt 不当 robots/sitemap/训练授权文件**:只是一份 AI 可读目录,不能控制爬虫抓取,也不保证搜索排名;不新增易过期的 AI crawler 专用 User-Agent 规则。
- **llms-full.txt 不自动展开 sitemap 全部 canonical URL**:避免生成长而低价值的重复列表。
- **GSC/GA4 运行时采集不做**:Search Console URL Inspection、sitemap 提交、关键词/页面明细排行、GA4 事件明细、告警、趋势图、数据补偿重算、多站点多属性管理、Google Service Account 授权、Google 授权账号邮箱展示。
- **robots.txt 不自动提交或调用 Search Console sitemap 提交接口**。

## 现状说明(以代码为准)

- **平台落地页已扩到 5 个**:源文档 feat.020 只规划 TikTok/X/Vimeo 三个,实际代码已落地 5 个平台落地页(TikTok、X、Vimeo、Instagram、Threads),共享模板支持这 5 个平台。源文档"3 个平台"的口径已过时。
- **长尾文章页已落地**:禁下载频道 workaround 页已上线,导航 Solution 下拉分组 + 页脚内链都已就位;Solution 下拉菜单当前包含这一个 workaround 链接。
- **导航最终状态**:先有 feat.029 删除导航 Solutions 入口、Install 按钮加拼图图标;随后 feat.030 又把 Solution 分组(作为下拉菜单触发器,不跳 /solutions/)加回来承接 workaround 页。**当前最终状态:导航有 Home + Solution 下拉(含 workaround 链接)+ 带拼图图标的 Install 按钮**;`layout.nav.solutions` 字段仍保留在 i18n schema。feat.029 文档里"删除 solutions 导航字段"的口径已被 030 推翻,本域按最终状态写。
- **Sitemap 已完成治理**:已从 `@astrojs/sitemap` 默认输出切换到自定义 languageSitemap 集成;主站 sitemap 文件全部由构建生成,旧的静态 `public/sitemap.xml` 已删除。
- **robots.txt 主站不屏蔽 pricing**:主站 robots 当前不屏蔽 pricing,仅屏蔽登录/支付回跳页(`/extension-login/`、`/paypal/cancel/`、`/paypal/success/`)。
- **签到 i18n 是顶层字段**:签到弹窗文案在 i18n schema 里是顶层 `checkin` 字段组,不是嵌套在 workspace 下。
- **签到后端是两个 POST 接口**:一个"进入签到系统/读状态"、一个"领取今日奖励";接口路径与字段见 `@tech-签到活动.md`。
- **首页已重定位为 private video downloader 着陆页**:原 feat.024 把主站首页 `/` 及 14 语言版本改造成围绕"Telegram Private Video Downloader"关键词簇的 SEO 着陆页(数据依据:首页 private 关键词簇约 621 点击,移动端占 79.4%);只改内容结构,不改下载解析逻辑,具体区块顺序/SEO meta 独立化/FAQPage JSON-LD/合规登记见 `@tech-落地页与Sitemap.md` §6。

## 业务流程

### 平台落地页访问(自然搜索进入)

1. 用户在搜索引擎搜"TikTok video downloader no watermark"等长尾词,命中平台落地页。
2. 进入页面,首屏是 Hero 工具区(平台专属 title + 下载工作区),用户直接粘贴链接即可下载。
3. 页面下方提供平台特性、使用步骤、FAQ;底部 Cross-Links 引导到其他平台落地页与首页(topic cluster 互链)。
4. 页面注入 FAQPage + WebApplication 结构化数据,提升搜索结果丰富度。
5. 14 语言版本通过 URL 前缀(如 `/zh-cn/tiktok-downloader/`)覆盖各语种搜索。

### 长尾文章页访问(精准长尾进入)

1. 用户搜"telegram download disabled channel workaround"等精准长尾,命中文章页。
2. 页面 Hero 含 H1 + 工具区(工具区提示文案是 `<p>` 不占 heading,避免和首页抢关键词权重)+ 导语。
3. Quick answer 给 3 个最快处理方式 + 风险提示。
4. 目录锚点跳转到正文章节(为什么禁下载、10 秒检查、4 种 workaround、第三方 bot 风险、合法性)。
5. 方法对比表、FAQ、结论区;Article + BreadcrumbList + FAQPage + HowTo 四套结构化数据。
6. 导航 Solution 分组与页脚内链导流到此页。

### 签到活动主流程

1. 登录用户进 website 首页下载工作区,前端发起"进入签到系统"请求。
2. 后端先读取该用户最新一条签到活动;存在则直接按这条活动返回状态,即使活动已过期也不创建新一轮。
3. 后端发现完全没有活动记录时,创建正常活动;活动开始日是首次触发当天(不是注册日),老用户首次进入也给完整 14 天。
4. 后端返回当前活动日、14 天逐日状态、今日是否已签到、今日可得奖励、活动是否结束、Credits 余额、当前可领取状态或下一次可领取时间。
5. 今天未签到且前端本地未记录"今天已关闭自动弹窗"时,自动弹签到弹窗。
6. 用户点签到按钮,后端校验今天未签到且活动未结束,增加 Credits 余额、写 Credits 流水、写签到明细。
7. 前端刷新 Credits 余额、签到状态、倒计时。
8. 当天关闭弹窗后,当天不再自动弹,但仍可手动点 Credits 打开。
9. 今日已签到时点 Credits 仍打开状态弹窗;第 1-13 天展示已领取和下次可领取倒计时,第 14 天只展示最终领取结果。
10. 第 14 天结束后活动永久结束,不再弹、点 Credits 不再打开签到弹窗,但账户按钮和 Credits 余额仍展示。

### GSC/GA4 运行时指标采集

1. 管理员进入管理后台「系统设置」,点击 Google 数据授权按钮。
2. 后端生成 Google OAuth 授权地址,管理员在 Google 页面同意 Search Console 与 GA4 只读权限。
3. Google 回调到后端,后端换取 refresh token 并保存授权状态。
4. cron 按固定间隔刷新 access token,分别请求 GSC Search Analytics 与 GA4 Data API。
5. 每次采集分别写入 GSC 与 GA4 两条 JSON 快照;某一侧失败不影响另一侧落库。
6. 授权失效、属性配置错误或 Google 返回权限错误时,本轮记录日志并跳过失败侧;管理员回到系统设置页重新授权或修正配置后,下一轮恢复。

## 非功能性需求

- **不新增第三方依赖**;不新增依赖注入(service 是进程级单例,backend api 层可用 `Depends`)。
- **只能用 GET 和 POST**(签到接口都是 POST;SEO 资产是静态文件无接口)。
- **所有 SEO 页面 14 语言全量静态生成**;响应式(960px 以下三列转单列等);纯静态,无额外 JS bundle(下载工作区交互脚本除外)。
- **可访问性**:语义化 HTML(h1/h2/h3 层级、details/summary、nav landmarks);图标 `aria-hidden`。
- **移动端优先**:首页账户入口、签到弹窗必须先按小屏设计再扩展桌面;移动端不依赖 hover。
- **签到时区**:统一用后端服务器时区(`America/New_York`)按本地 00:00 切天;前端倒计时只基于后端返回的下一次可领取时间,不自行推断时区。
- **lastmod 必须代表页面内容或结构的最后一次有效变更**,不能用构建时间;优先 git 提交时间,无 git 时退文件 mtime 并打 warning。
- **llms 文件只写当前源码能确认的页面和能力**,不写无法确认的承诺。
- **i18n**:所有面向用户文案支持 14 语言;Lighthouse 移动端 Performance 目标 85+。
- **GSC/GA4 数据口径**:GSC 24H 依赖 Search Console fresh/hourly 数据,允许后续修正,不承诺与 UI 卡片永久完全一致,也不把截图一致性作为验收;GSC 7D / 28D 使用 Search Analytics 最终或普通聚合数据;GA4 最近 30 分钟活跃用户使用 Realtime API;GA4 today / 7D / 28D 活跃用户使用 Core Reporting API 的自然日 date range,不承诺滚动到秒的 24 小时去重;后台必须展示 GSC 与 GA4 各自窗口时区和日期范围,避免误读为同一口径。
- **抛错带可定位 msg**。

## 验收标准

产品视角的关键验收(技术层验收见各 `tech-*.md`):

- 平台落地页:每个平台页(含 14 语言版本)正常渲染;下载工作区能解析对应平台链接;title/description/keywords 正确;FAQPage + WebApplication 结构化数据存在且格式正确;hreflang 覆盖 14 语言 + x-default;平台间互链跳转正确。
- 长尾文章页:14 语言页面可访问;英文 title/description/H1 与文案源一致;非英文完成本地化;导航 Solution 下拉与页脚内链就位;canonical 正确;hreflang 覆盖 14 语言 + x-default;Article + BreadcrumbList + FAQPage + HowTo 结构化数据齐全且不含示例占位(example.com/Your Site Name);FAQ 可见文本与 FAQPage 一致;14 语言 sitemap 与 sitemap-0 包含新 URL。
- Sitemap:根 sitemap.xml 是 sitemapindex 且收录 14 语言 sitemap;sitemap_index.xml 内容相同;sitemap-0.xml 收录全部 canonical URL;14 语言 sitemap 全部存在;每个 URL 有 loc + lastmod 且 lastmod 是 W3C Datetime;不输出 priority/changefreq;sitemap URL 总数等于构建 canonical HTML 数扣除 robots 屏蔽页;不含已退休的 `/solutions/` 及其子路径;robots 屏蔽 `/extension-login/`、`/paypal/cancel/`、`/paypal/success/` 并指向根 sitemap。
- llms.txt:两个文件存在且 pnpm build 后 dist 有;llms.txt 链接到 llms-full.txt 反之亦然;都链接到 sitemap.xml;robots 显式 Allow 两个入口;引用的站内路径在 dist 都能找到;不含 mailto/明文邮箱/站外绝对 URL;主站 pricing 可进 sitemap 但不进入 LLM 索引。
- 签到:老用户首次进入签到系统从当天起算 14 天;第 1-7 天签到发 6 Credits、第 8-14 天发 3 Credits、第 15 天起不可签且接口活动日封顶为 14;同一自然日只能成功一次;不支持补签;首页登录态入口是圆形账户按钮 + Credits 徽标(不显示邮箱全文);账户按钮下拉仅含退出登录;点 Credits 活动未结束时打开签到弹窗;活动结束后点 Credits 不再弹;当天首次进入可签到时自动弹;当天关闭后不再自动弹;移动端布局可用不依赖 hover;今日可签弹窗展示"现在可领取"不展示未来倒计时;第 1-13 天已签弹窗展示下次可领取倒计时与绝对时间,第 14 天已签不再展示下一次领取时间;命中 IP 注册权益风控的账号首次进入只得到已结束活动,不会看到可领取奖励。
- 导航与 CTA:Install 按钮含拼图插件图标 + i18n 文案 + 跳转 Chrome Web Store;Solution 下拉分组就位并跳 workaround 页(当前最终状态)。
- 官方 X 入口:14 语言 Footer 与 Contact 页都能看到本地化账号标签;链接统一指向 `https://x.com/TGDownload`;Contact 同时保留邮件支持;全站主体结构化数据和 X Card 元数据声明该官方账号。
- GSC/GA4 采集:管理员可在后台完成 Google OAuth 只读授权;授权成功后 cron 能写入 `GSC` 与 `GA4` 两类快照;GSC 快照含 `24h`、`7d`、`28d` 的 `clicks`、`impressions`、`ctr`、`position`;GA4 快照含 `realtime_30m.active_users` 与 `today`、`7d`、`28d` 的 `active_users`;每个窗口都保存并展示窗口口径;GSC 与 GA4 最近成功时间和错误摘要分开展示;撤销授权或配置错误时页面能提示需要重新授权或修正配置,不影响其他后台模块。

## 用户操作逻辑与 UI 元素

> 本域直接拥有的 UI:首页账户入口(账户按钮 + Credits 徽标 + 下拉)、签到弹窗、安装 CTA 图标、Solution 下拉分组、官方 X 入口、长尾文章页布局。各平台落地页与下载工作区内部元素归 `@../002.下载功能/feat.md`,文案 key 组织归 `@../010.多语言/feat.md`。文案需 i18n。

### 首页账户入口(登录态,位于下载工作区标题右侧)

| 元素 | 形式 | 可点击 | 行为 | 尺寸/样式 |
| --- | --- | --- | --- | --- |
| 账户按钮 | 圆形按钮 | 是 | 点击展开下拉菜单 | 36x36px mobile,40x40px desktop;圆形;轻微阴影 |
| 账户按钮内容 | 用户头像或邮箱首字母 | 否 | 仅展示 | 字号 14-16px,字重 700 |
| 下拉菜单 | 浮层菜单 | 是 | 点账户按钮打开,再次点击/点外部/Escape 关闭 | mobile 宽 160px 起;圆角 16px |
| 退出菜单项 | 菜单按钮 | 是 | 退出登录 | 高度 44px,整行可点击 |
| Credits 徽标 | 圆角胶囊 | 是 | 活动未结束点开签到弹窗;活动结束后禁用 | 高 36px mobile,40px desktop |
| Credits 图标 | 小图标 | 否 | 纯展示 | 16x16 mobile,18x18 desktop |
| Credits 文本 | 余额数字 + `Credits` | 否 | 纯展示 | 字号 13-15px,字重 700 |

展示规则:不显示邮箱全文;优先头像,空时显邮箱首字母;活动结束后 Credits 区域保留可见但失去签到弹窗点击行为;entry 失败时不展示假余额。

### 签到弹窗(移动端优先,小于参考图,单手操作)

**今日可签到弹窗**:

| 元素 | 形式 | 可点击 | 行为 | 尺寸/样式 |
| --- | --- | --- | --- | --- |
| 弹窗容器 | 底部/居中卡片 | 否 | 承载签到内容 | mobile 最大宽 340px,圆角 24px |
| 标题 | 文本 | 否 | 展示今日可领奖励 | 字号 20px mobile,字重 800 |
| 活动进度说明 | 文本 | 否 | 当前第几天、今日奖励 | 字号 13-14px |
| 下次可领状态 | 文本 | 否 | 展示"现在可领取" | 字号 12-13px |
| 奖励图标 | 插画/图标 | 否 | 强化签到感知 | 64-88px 方形区 |
| 14 天进度条/日历条 | 轻量进度组件 | 否 | 标示 14 天区间、今天位置、已签状态 | 移动端横向可滚或压缩 |
| 主按钮 | `Claim 6 Credits`/`Claim 3 Credits` | 是 | 发起签到 | 高 48px,宽 100% |
| 次按钮 | `Not now`/`稍后再说` | 是 | 关闭并记录今日已关闭自动弹窗 | 高 44px |
| 关闭按钮 | 角标 | 是 | 关闭并记录今日已关闭自动弹窗 | 32x32px |

**今日已签到弹窗**:标题展示"今天已领取" + 今日奖励结果 + 14 天进度 + 关闭按钮;第 1-13 天额外展示距下次可领取倒计时和绝对时间,第 14 天不展示不存在的下一次领取时间;不展示可点击的签到主按钮;不修改自动弹窗关闭本地状态;倒计时与绝对时间持续更新到下一次服务器日切。

### Install CTA(导航栏)

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| Install 按钮 | 主按钮(Chrome Web Store 链接) | 是 | 跳转 Chrome Web Store 安装 |
| 拼图图标 | 内联 SVG,18x18px,按钮文字左侧,8px 间距,`aria-hidden`,颜色继承按钮文字(白) | 否 | 让用户知道这是浏览器扩展入口 |
| 按钮文案 | i18n 安装文案 | — | 按钮可访问名称由文案提供 |

### Solution 下拉分组(桌面导航)

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| Solution 触发器 | 按钮 + chevron | 是 | 打开/关闭下拉,同步 aria-expanded/aria-hidden |
| 下拉面板 | 浮层 | — | 含当前语言的长尾文章页链接 |
| 链接项 | 链接(当前语言短标签) | 是 | 跳当前语言前缀下的 workaround 页;当前页时 active |

关闭条件:点页面其他位置、按 Escape、点菜单内链接。移动菜单直接展示该链接,不额外展示不可点击的 Solution label。

### 官方 X 入口

| 元素 | 形式 | 可点击 | 行为 | 尺寸/样式 |
| --- | --- | --- | --- | --- |
| Footer 官方账号 | X 品牌图标 + 本地化文字链接 | 是 | 新标签页打开 `https://x.com/TGDownload` | 位于 Company 分组的 Contact 后;13px 链接;图标 1em;7px 间距 |
| Contact 官方账号 | 次级按钮,X 品牌图标 + 本地化标签 + `@TGDownload` | 是 | 新标签页打开同一官方账号 | 高 44px;6px 圆角;移动端占满一行;邮箱主按钮保持第一顺位 |

两处 X 图标均为装饰图标并设置 `aria-hidden`;链接的可访问名称来自可见文案,Footer 额外包含 handle;外链使用 `noopener noreferrer`。

### 长尾文章页布局(从上到下)

1. Hero:H1 + 工具区(下载工作区,标题用 `<p>` 小提示不占 heading)+ 导语 + Quick answer callout + 目录。
2. 正文:多张 section card(为什么禁下载、10 秒检查、4 种 workaround、第三方 bot 风险、合法性)。
3. 方法对比表(Method/Success rate/Account risk/Allowed?/Best for)。
4. HowTo timeline。
5. FAQ(details/summary 卡片)。
6. 结论(橙色弱底卡片)。

## 数据埋点

- **网站访问分析**:`telegramdownloadmedia.com` 与 `telegramvideodownload.pro` 全站加载 GA4 与 Microsoft Clarity;Clarity 用于页面交互热图和会话回放,两个域名使用独立项目,避免跨站数据混合。
- **平台落地页/长尾文章页**:复用现有 `data-ga-event` 委派,不新增脚本。导航/页脚/目录点击上报 `internal_workflow_click`(source=nav_solution/footer/guide_toc,target=对应页)。
- **签到弹窗**:新增 website 埋点字段,不新增复杂事件体系——首页签到弹窗自动展示、手动点击 Credits 打开、点击签到成功、关闭签到弹窗,各自记录活动日序号、当日奖励、弹窗来源(自动/手动)、领取结果、Credits 余额等字段(具体字段名见 `@tech-签到活动.md`)。
- **Install CTA**:沿用现有 `outbound_chrome_store_click`,不改变其 GA 埋点。
- **官方 X 入口**:统一上报 `official_x_click`,`source` 区分 `footer` / `contact`,`target=official_x`,外链地址由全局点击委派自动附带。
- **GSC/GA4 采集**:内部后台运维能力,不新增用户行为埋点;采集成功/失败只写后端结构化日志与数据库快照。

## 关联文档

- 平台落地页生成、Sitemap 多语言生成器、长尾文章页结构:`@tech-落地页与Sitemap.md`
- llms.txt 内容规则、导航与 Install CTA:`@tech-LLMs与增长入口.md`
- 签到活动后端(活动规则/Credits 发放/接口):`@tech-签到活动.md`
- GSC/GA4 运行时授权与采集:`@tech-GSC与GA4采集.md`
- 变更记录:`@changelog.md`
- website 目录结构/构建配置/Astro 集成机制:`@../000.架构/overview.md`
- 14 语言清单/locale→URL 路径映射/文案 key 规则:`@../010.多语言/feat.md`
- 下载工作区与下载链路:`@../002.下载功能/feat.md`
- 登录态/用户身份/退出登录:`@../007.用户系统/feat.md`
- Credits 余额/流水/扣费/积分包购买:`@../003.积分系统/feat.md`
