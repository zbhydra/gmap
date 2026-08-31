# ROADMAP · 项目进度大盘

> 本文是**唯一的进度大盘**:只记录项目目标、功能全景与状态。不写功能细节——细节在各业务域 `docs/feat/<域>/`(feat 定合同、tech 定实现、`references/` 放竞品证据与调研材料)。
> 状态流转:`⬜ 未调研` → `🔍 竞品调研完成` →(立项建/扩域)→ `🚧 进行中` → `✅ 已完成`;`♻️` 表示复用现有域,扩展该域时在域内 changelog 记录。
> 功能立项规则:某功能从 🔍 转入 🚧 前,先建域(编号顺延,现有 000–011,新线从 013 起;012 已归档不复用)或在既有域扩展,并把 scratch 中的对应逆向材料迁入该域 `references/`。

## 1 · 项目目标

两条产品线共享一套 backend(AWS 类业务服务器 + 执行节点)与商业化基建:

1. **Telegram 下载**(现役):主站 telegramdownloadmedia.com + 插件,已上线运营。
2. **MapsGrab**(新线,全称 "MapsGrab — Google Maps Scraper & Extractor"):对标 `gmapsextractor.com`——Maps 插件 + 云端 Online Scraper + API + 营销站,订阅分档计费。对标站壁垒在内容矩阵与抓取稳定性,不在代码形态。命名依据见 `research/google-maps-品牌命名调研.md`。

## 2 · 功能全景

### A · Maps 插件(拟建 `013.Maps插件`)

| # | 功能 | 竞品证据 | 调研 | 实施 |
| --- | --- | --- | --- | --- |
| A1 | 地图搜索抓取(XHR 拦截 + 自动滚动 + 去重) | scratch 逆向 01/02/03/05/10 | 🔍 | ✅ (2026-08-30) |
| A2 | 评论抓取(独立页 RPC + 翻页) | 逆向 03/09 | 🔍 | ✅ (2026-08-30) |
| A3 | 照片抓取(uv 页) | 逆向 01/03 | 🔍 | ✅ (2026-08-30) |
| A4 | Email / 社媒链接补全(服务端代抓,付费墙落点) | 逆向 06 | 🔍 | ✅ (2026-08-30) |
| A5 | 36 列字段字典(含 Pro 门控字段) | 逆向 04 | 🔍 | ✅ (2026-08-30) |
| A6 | 批量任务 dashboard(关键词队列 / 评论 URL 队列,IndexedDB) | 逆向 01/09 | 🔍 | ✅ (2026-08-30) |
| A7 | 保存列表(saved lists)抓取 | 官网 FAQ 提及 | 🔍浅 | ✅ (2026-08-30) |
| A8 | 导出 CSV / JSON / XLSX + 字段勾选 + 命名规则 | 逆向 07 | 🔍 | ✅ (2026-08-30) |
| A9 | 设置项(采集间隔 / 格式 / 重试) | 逆向 09 | 🔍 | ✅ (2026-08-30) |
| A10 | Google Drive / HubSpot 集成 | 逆向 06/07 | 🔍 | ✅ (2026-08-30) |
| A11 | 插件侧账号登录 + 配额展示(对应 007/003) | 逆向 06 | 🔍 | ✅ (2026-08-30) |
| A12 | 远端公告 / 版本提示 / GA4 埋点 | 逆向 06/09 | 🔍 | ✅ (2026-08-30) |
| A13 | 插件工程骨架(MV3 + Vue3 + RPC,复用 extension/) | 本仓库 extension/ | ♻️ | ✅ (2026-08-30) |

### B · Maps 云端(拟建 `014.Maps云端`)

| # | 功能 | 竞品证据 | 调研 | 实施 |
| --- | --- | --- | --- | --- |
| B1 | Online Scraper(关键词批量任务,云端执行) | 官网 pricing tab=online | 🔍浅(内部未调研,选型见 research 方案调研) | ⬜ |
| B2 | Scraper API / Reviews API / Photos API | 官方 Postman 文档(v2 三端点契约) | 🔍 | ⬜ |
| B3 | MCP Server(Claude/Cursor/VSCode/Codex 接入) | 官网落地页 | 🔍 | ⬜ |
| B4 | 抓取引擎(gosom/google-maps-scraper SaaS Edition + 代理池) | research 方案调研 §4/§6 | 🔍 | ⬜ |
| B5 | 云端 POC:封锁率 / 资源画像 / Postgres 内网化(Gate) | research 方案调研 §9/§10 | 🔍 | ⬜ |

### C · 商业化(扩展现有域)

| # | 功能 | 归属域 | 竞品证据 | 调研 | 实施 |
| --- | --- | --- | --- | --- | --- |
| C1 | 用户体系(含竞品 license key 辅轨的取舍) | ♻️ `007.用户系统` | 逆向 06 | 🔍 | ⬜ |
| C2 | 订阅套餐(统一 credits 池 vs 竞品式分产品订阅,阶段 3 决策) | ♻️ `006.订阅系统` | 官网 pricing 三 tab | 🔍 | ⬜ |
| C3 | 积分 / 用量计量(服务端计数、免费月度额度) | ♻️ `003.积分系统` / `005.计数器系统` | 逆向 06 | 🔍 | ⬜ |
| C4 | 订单与支付(Stripe / Paddle) | ♻️ `004.订单系统` | 逆向 06 | ♻️ | ⬜ |
| C5 | Pricing 页(三产品形态分 tab 展示) | ♻️ `011.Pricing页` | 官网 /pricing | 🔍浅 | ⬜ |
| C6 | 管理后台扩展 | ♻️ `008.管理后台` | — | ♻️ | ⬜ |

### D · 增长与内容(拟建 `015.工具与增长`)

| # | 功能 | 竞品证据 | 调研 | 实施 |
| --- | --- | --- | --- | --- |
| D1 | 免费工具矩阵(email-checker、merge-csv、license-generator、Place ID Finder、坐标转换等约 7 个) | 官网 /tools | 🔍浅 | ⬜ |
| D2 | 竞品对比页(约 10 篇:vs Outscraper / Apify 等) | 官网 /articles | ⬜ | ⬜ |
| D3 | Guides 博客 | 官网 /guides | ⬜ | ⬜ |
| D4 | Affiliates 联盟计划(25% 循环佣金) | 官网 /affiliates 营销页 | 🔍(门户内部需注册) | ⏸ 暂不做 |
| D5 | 营销站(Astro 模板复用,多语言) | ♻️ `010.多语言` 基建 + website/ 模板 | ♻️ | ⬜ |
| D6 | SEO 基建(sitemap / llms.txt / GSC / GA4) | ♻️ `009.SEO与增长` | ♻️ | ⬜ |

### E · Bing 插件(`016.Bing插件`,2026-08-30 立项)

| # | 功能 | 竞品证据 | 调研 | 实施 |
| --- | --- | --- | --- | --- |
| E1 | Bing Maps 列表采集(data-entity 解析 + 滚动/翻页) | 竞品 v2.4.9 逆向+动态验证 | ♻️ | ✅ |
| E2 | 18 列导出 CSV/XLSX(免费 20 条 + Pro 门控,自有订阅体系) | 同上(实测导出样本) | ♻️ | ✅ |
| E3 | 面板 UI(Vue 直插,非 iframe)+ Pricing 信息页 | 同上 §9.1 | ♻️ | ✅ |
| E4 | 官网登录桥接收(website 页 + 插件端 onMessageExternal/authStore 收编均已落地) | 本站自有模式 | ♻️ | ✅ |
| E5 | 远程配置热修通道(本地默认+稀疏覆盖,机制复用;后端端点未上线,回退路径已验) | 竞品 bingMapsVersions | ♻️ | ✅ |
| E6 | Email/社媒挖掘(与 013 A4 同源自研服务,云端执行归 014;输入平台无关) | 竞品 mqfyia/frkaizm 实测 | ♻️ | ⬜ 二期 |
| E7 | 打点(search/export/install 等,自有 SLS 通道) | 竞品 sdfvaohi 日志 | ♻️ | ✅ |

## 3 · 阶段计划

| 阶段 | 内容 | 前置 | 估时 |
| --- | --- | --- | --- |
| **Gate · 云端 POC** | B5:一台 CX43 + `-c 8` 实跑,封锁率/资源画像/DB 内网化;**只 Gate 云端路线,不阻塞插件** | 无 | 3–5 天 |
| **阶段 1 · 插件全量** | **A1–A13 全部 13 项**,验收 = 功能面对齐竞品 v2.5.1(已拍板的架构差异除外:不强制登录、自研服务端、不上 Chrome 商店)。顺序:A1 地基(骨架+远程配置+搜索闭环)→ A2/A3/A5/A8 采集导出主链 → A6 批量面板 → A9/A12 打磨 → A11 账号配额(扩 007/003)→ A4 服务端自研+接入 → A10 集成 → A7(已调研完毕)→ A13 上架 | 无,可立即启动 | 7–9 周 |
| **阶段 2 · 云端服务** | B4 + B1/B2 部署与 credits 对接。**与阶段 1 并行**:技术栈零交集(Go/gosom vs TS/MV3);唯一耦合点 = 003 计量对接,C2 计费骨架决策已前置。**C2 已拍板(2026-08-30 hydra):套餐参考竞品分产品订阅**(插件 Free/$39 Pro/$99 Business 月付;Online/API 档位随云端产品化解禁);006 需一轮扩展(产品线维度 + 月度 records 额度映射,当前为 TG 单产品每日次数形态) | Gate 通过;C2 骨架决策 | 2–3 周 |
| **阶段 3 · 营销站 + 商业化** | D5 + C2/C5 定价决策与接入;Edge/Firefox 商店页。**Online 入口留空点击无效**(2026-08-30 hydra 裁决,云端产品化暂缓) | 阶段 1 | 1–2 周 |
| **阶段 3 ✅ 营销站已交付(2026-08-31)** | website-mapsgrab/ 17 页(首页/产品页/下载页/Pricing 三档/7 工具/法务/About/Contact),006 产品线扩展 + PayPal 购买链路 + 额度映射,GA4/SEO/Lighthouse ≥95,插件订阅跳转接线。执行:W1–W7 全部 done + 整体汇合审查通过(1 跨单元 finding:工具页内链闭环已修)。验证:e2e 166 passed、module-scripts 47/47、backend 535 passed。剩余:域名/GA4 ID/渠道 SKU 后配,商店上架(real smoke) | 阶段 1 ✅;W5 含 013 回归验证 | 计划 1–2 周,实际约 2 天 |
| **阶段 4 · 内容与增长** | D1–D3 铺底后持续运营(D4 联盟暂不做) | 阶段 3 | 铺底 2 周+ |

成本与部署细节见 `@research/google-maps-scraping-方案调研.md`(服务器 €90–130/月 + 代理 $100–500/月,代理是大头)。

## 4 · 风险

- **ToS**:抓公开数据违反 Google ToS(美国判例灰色地带);接口随改版失效,盯 gosom 上游 issue。
- **代理成本与封控**是云端路线的存亡项(Gate 裁决);插件路线由用户环境天然化解。
- 估时假设:单人 + AI 助手;插件全量(阶段 1)约 7–9 周,加云端与增长完整对标约 3–4 个月。

## 5 · 变更记录

- 2026-08-29 建立大盘:功能全景 A13/B5/C6/D6 项,来源为 11 篇竞品逆向(`scratch/G-MAPS-EXTRACTOR-v2.5.1/research/`)、官网 pricing/tools/api 抓取与 `research/google-maps-scraping-方案调研.md`。调研状态:插件侧 13 项已完成,云端/工具/内容侧多为 🔍浅 或 ⬜。
- 2026-08-29 调研细节落位:建立 `feat/013.Maps插件/`(feat + references A1–A13 逐功能竞品调研,含已拍板决策)与 `feat/014.Maps云端/`、`feat/015.工具与增长/`(feat + B1/B2/D1 竞品口径初版);B4/B5 细节指向 research 方案调研;D2–D4、B3 仍 ⬜。A 组 13 项全部具备立项条件。
- 2026-08-30 A7 登录态实测完成(013 最后一个验证点关闭):当前 Maps 列表页 URL 仍含 `10m1!1e1` 标记,但竞品的精确触发子串在深层保存列表页失效(`4m2` → `4m6!1m2` 漂移)——我方必须宽松匹配 + 远程配置,照抄竞品会漏抓深层列表。至此 013/014/015 三域调研全部完成,无未知项。
- 2026-08-30 hydra 拍板:D4 联盟计划**暂不做**(调研成果保留于 015 域,启动时无需重新调研);阶段 4 范围调整为 D1–D3。
- 2026-08-30 **阶段 1 插件全量开发完成(execute-loop)**:U1–U11 全部 done,每单元 worker–reviewer 循环闭环(共 11 单元、11 轮单元审查 + 1 轮整体汇合审查,reviewer 全部「干的不错」)。验证:extension unit 313 passed、e2e 17 passed(全自动零外网)、lint 零警告、三渠道 build:store 产物核对;backend maps 范围 pytest 全绿。品牌定名 MapsGrab。剩余:real smoke 清单(见 013 feat「当前状态」)。
- 2026-08-30 调研缺口清零:B2 API v2 契约(Postman 官方文档,search/photos/reviews 三端点 + Bearer + fid 体系)、B3 MCP 落地页、D1 代表工具交互全部补齐入档;全部功能仅剩 D4 联盟(需注册)与 A7 登录态 URL 验证(实现期)两个外部依赖项。
- 2026-08-30 **016.Bing插件 立项**:竞品 "Maps Scraper & Map data extractor" v2.4.9(mapsscraper.net)静态逆向 + Playwright 动态验证完成(云端协议抓包/采集实测/导出样本,`research/bing-maps-scraper-竞品调研.md`);工程底座 `extension-bing/` 就绪(复制 extension/ 清理 gmap+tg 残留,单测 124 绿;固定扩展 ID;website `/extension-login-bing` 桥接页已建);商业化口径拍板 = 竞品数值(免费 20 条/Email 社媒 Pro 占位)+ 自有订阅后端;Email/社媒挖掘与 013 A4 同源自研服务、云端执行归 014,一期不做。范围 E1–E7(打点随各条目实施),计划 `feat/016.Bing插件/plans/001.一期实施.md`,M1 已完成,M2 待启动。黄金样本入域 references/golden-samples/。
- 2026-08-30 B1 登录实测完成:竞品 Online 任务台(hydra 账号)界面/任务生命周期/后端云函数契约全量抓取——云端 Parse 端点 `cloud.gmapsextractor.com/parse/functions/*`(submitKeywords/getTaskStatus/getCloudUsage/isPro),与插件共用账号与付费判定;Free 档 1000 records/月实测扣减 322。详见 `feat/014.Maps云端/references/B1`。014 域 feat/references 同步。
- 2026-08-29 工程落点已决并完成第 1 步:`extension/` 原地改造为 Maps 插件底座(TG 下载业务/官网桥/升级弹窗/manual 用例删除,保留 RPC/构建/HTTP/打点/远端配置/i18n 测试底座;manifest 中性化 version 0.1.0;locales 英文基线)。验证:build 通过、单测 121/121、lint 零警告。下一步 = A1 搜索闭环。
- 2026-08-29 三项更新:①阶段 1 改为 A1–A13 全量交付(验收 = 功能面对齐竞品 v2.5.1,已拍板架构差异除外),估时 7–9 周,实施顺序见 `feat/013.Maps插件/feat.md`;②A7 升级为 🔍 完成(源码级:列表模式 = A1 通道 + UI/滚动变体,URL 标记 `data=!4m2!10m1!1e1`,仅剩实现期登录态验证点);③待决:插件工程落点(monorepo 子项目 vs 独立仓库)阻塞阶段 1 第 1 步,其余全部可开工。
- 2026-08-30 新线命名拍板:**MapsGrab**(全称 "MapsGrab — Google Maps Scraper & Extractor");否决 GMap Extractor(与竞品 G Maps Extractor 混淆且 gmapextractor.com 被其 301 截流),exporter 词义分流排除,SEO 双词覆盖 scraper+extractor。词频与域名数据见 `research/google-maps-品牌命名调研.md`;§1 项目目标同步更名。
- 2026-08-30 UI token 选型拍板:全项目采用 **Material You**(06 亮 / 06D 暗,曾短暂选型 Aurora Glass 后弃用);旧 Geist 规范整体替换为 Material You token 合同(`design.md` 亮色 / `design.dark.md` 暗色,暗色主题为本次新增),状态实底色引入 `*-fg` 深字配对合同;12 皮肤全组件探索稿在 `scratch/design-explore/`(不入 git)。
