# Google Maps Extractor 产品线 Roadmap

> 立项前规划文档。依据:`@google-maps-scraping-方案调研.md`(云端/API 路线)、`../scratch/G-MAPS-EXTRACTOR-v2.5.1/research/01-架构总览.md`(竞品插件逆向,不入 git)。
> POC 通过后本文件升格为 `docs/feat/013.*/` 业务域(feat / tech / plans 按 `spec-docs.md` 拆分),届时本文件归档或保留为索引。

## 0. 目标与对标

对标 `gmapsextractor.com`:Chrome/Edge 插件(DOM 抓 Google Maps)+ 云端 Online Scraper + API + 营销站,Google OAuth 登录、credits 计费(免费额度 + 付费档)、联盟计划。对标站的真实壁垒在**内容矩阵与抓取稳定性**,不在代码形态。

## 1. 前提条件盘点(2026-08-29)

**已满足(复用本仓库)**:

| 能力 | 载体 |
| --- | --- |
| 用户 / 积分(=credits)/ 订单 / 订阅 / 计数 / 支付全链路 | backend `003`~`007` 域 |
| Google OAuth 登录 | `backend/src/app/services/google_auth_service.py` |
| Astro 5 多语言营销站模板 + SEO 基建(GSC/GA4/sitemap/llms.txt) | `website/`(14 语言) |
| MV3 插件工程骨架(MV3 + Vue3 + RPC + 额度) | `extension/` |
| 「业务服务器 + 多地区执行节点」形态 | 001 节点系统(business/download 双角色) |
| 管理后台 | `admin/` |

**未满足(从零 / 外部)**:Google Maps 抓取引擎(选型已定:gosom/google-maps-scraper,MIT)、插件抓取逻辑(竞品逆向已透)、内容矩阵、代理池。

## 2. 阶段计划

### 阶段 0 · POC(Gate,约 3–5 天)

唯一的进入门槛:一台 Hetzner CX43 + `-c 8` 实跑 gosom/google-maps-scraper(见调研 §10)。

| 项 | 验收标准 |
| --- | --- |
| 封锁率 | 连续 3 天批量抓取,验证码/封禁触发率低于可接受阈值(自定) |
| 资源画像 | 实测单页内存与 CX 共享 vCPU 波动,定 50 槽最终机型组合 |
| Postgres 内网化 | VPC 内网互联 + pg_hba 收敛 + 5432 公网关闭(调研 §9) |

**Gate 决策**:通过 → 进入阶段 1;封锁率不可接受 → 评估代理预算追加或放弃。

### 阶段 1 · 插件 MVP(3–5 周,可与阶段 2 并行)

- 范围:content script 注入 `google.*/maps` + injected hook XHR、字段解析(36 列 CSV,12 个 Pro 专属字段可后置)、结果面板、滚动加载、CSV 导出、登录回流。
- 参照:`scratch/G-MAPS-EXTRACTOR-v2.5.1`(消息封装、storage key、配额常量、通信拓扑均已逆向)。
- 工程:复制 `extension/` 骨架(MV3 + Vue3 + RPC + 额度),目标站点换成 Google Maps。
- 验收:真实 Google Maps 搜索页稳定采集 + 导出,免费/付费额度按 credits 扣减。

### 阶段 2 · 云端服务(2–3 周,依赖阶段 0)

- 部署 gosom SaaS Edition:单入口 + 多 worker(River 队列),「多 worker × 低并发」起步(调研 §6)。
- 产品化集成:backend credits 对接(任务创建扣 credits)、任务 API 封装(POST 任务 → 轮询/webhook)。
- 已知限制:评论约 300 条/店;社媒 6 列硬缺口(见阶段 4 并行项)。
- 验收:网页/API 提交任务 → 扣费 → 结果返回全链路。

### 阶段 3 · 营销站 + 商业化(1–2 周,依赖阶段 1)

- 复制 `website/` Astro 模板开新站(参照已迁走的 tgd-pro 独立站模式);首页在线试玩、Pricing、FAQ。
- 接入现成 backend 链路:Google OAuth 登录、credits 免费额度(对标 1000/月)、订阅档位、支付。
- 插件商店上架(Chrome Web Store 审核)。

### 阶段 4 · 内容矩阵与增长(铺底 2 周+,长期运营)

- 竞品对比页(对标约 10 篇)、Guides 博客、免费小工具(Place ID Finder、Review Link Generator、坐标转换、CSV Merge 等,每个 0.5–1 天)。
- 多语言(复用 website 14 语言基建)。
- 联盟计划。
- 并行专项:社媒 enrichment(官网访问 + footer 外链解析,与主抓取管线解耦)、Kgmid/Claimed/Phones 解析(可给上游提 PR 或 fork)。

## 3. 成本(2026-08 时价,详见调研 §8)

| 项 | 月成本 |
| --- | --- |
| 服务器 50 并发槽(3×CX53 或 7×CX43) | €90–130 |
| 住宅代理(大头) | $100–500 |

## 4. 风险

- **ToS**:违反 Google ToS(公开数据抓取在美国判例灰色地带);接口随 Google 改版随时失效,需盯 gosom 上游 issue。
- **代理是成本与稳定性大头**:裸奔必被封。
- **时间估算的假设**:单人(hydra + AI 助手)、以本仓库熟悉者为标尺;MVP 合计约 6–8 周,完整对标 2–3 个月。

## 5. 仓库前置事项(与新产品线无直接耦合,按需处理)

- `website/src/download/` 工作区(41 文件)当前无挂载点:保留为基建,等待平台下载页(tiktok/x/vimeo/instagram/threads,见 `public/llms.txt` 索引)上线时启用;若确认放弃则连同 i18n workaround 文案与相关测试断言一并清理。
- `website/scripts/playwright-browser-identity.mjs` / `admin/scripts/` 为按契约重建版;若需完整反检测能力(Playwright globals、移动端 platform、UA-CH 头断言),从迁移目标仓库取回原版替换。
