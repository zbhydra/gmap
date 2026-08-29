# Google Maps 评论/商家数据采集方案调研

> 调研日期：2026-08-29 · 调研人：hydra + AI 助手
> 背景：评估自建「Google Maps 评论/商家数据采集服务」的技术路线、开源选型（gosom/google-maps-scraper）、部署架构、资源成本与数据覆盖缺口。

## 1. 结论摘要

- **技术路线**：官方 Places API 每地点仅返回 5 条评论且有存储限制，全量评论产品只能走抓取路线。业界通用做法是逆向 Google Maps 网页版内部接口（快、易碎）或无头浏览器渲染（慢、稳），商业服务再外包一层 REST API + 计费。gmapsextractor.com 这类小服务多为 Apify Actor 或开源方案的包装。
- **选型结论**：[gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper)（Go + Playwright，MIT，5.6k stars，活跃维护）是当前最成熟的自托管方案，自带 REST API 模式和 SaaS Edition（多用户 + 队列 + worker），与商业服务形态差距主要在代理池规模。
- **部署建议**：SaaS Edition 单入口 + 多 worker；全部机器放 Hetzner 同一网络区域（eu-central）走私有网络，`DATABASE_URL` 指向内网地址，避免默认配置把 Postgres 暴露公网。
- **成本量级**：服务器 €90–130/月（50 并发槽）+ 住宅代理 $100–500/月（代理才是大头）。
- **数据缺口**：对照 Outscraper 风格的 34 列 schema，25 列直接覆盖、5 列可推导，真正硬缺口 3 类 9 列——社媒链接（6 列，唯一大缺口）、Kgmid/Knowledge URL（2 列）、多号码（1 列）。

## 2. 商业服务的实现原理

以 [gmapsextractor.com 的 Reviews Scraper API](https://gmapsextractor.com/google-maps-reviews-scraper-api) 为例（落地页营销话术，细节在其 Postman 文档）：

- 按 **FID**（`0x...:0x...` 十六进制内部 ID，从 Maps URL 可解析）提取公开评论，说明走的是非官方通道（官方 API 用 place_id/CID 体系）。
- 通用实现套路：
  1. **逆向内部接口**：Maps 前端自身调用的 `search?tbm=map`（batchexecute）、`listugcposts` 等 RPC，无需 API key，靠浏览器 cookie 即可调用；返回 `)]}'` 开头的 protobuf 序列化数组，需手写解析器；评论翻页靠 pagination token，可取全量。
  2. **对抗反爬**（真正的壁垒）：住宅/移动代理池请求级轮换、Google 会话（cookie）池、TLS 指纹伪装（curl-impersonate 类）、频控与结果缓存。
  3. **产品封装**：POST 任务 → 轮询/webhook → JSON 结果，按条计费。

## 3. 开源方案对比

| 项目 | Stars | 语言 | 特点 | 许可 |
|---|---|---|---|---|
| [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) | 5.6k | Go | Playwright 无头浏览器；REST API + SaaS Edition；评论至 ~300 条/店 | MIT |
| [omkarcloud/google-maps-scraper](https://github.com/omkarcloud/google-maps-scraper) | 3.1k | Python | 主打线索挖掘，50+ 字段含**社媒**/邮箱/电话 | — |
| [gaspa93/googlemaps-scraper](https://github.com/gaspa93/googlemaps-scraper) | 516 | Python | Selenium 抓评论，代码量小，适合读原理 | GPL-3.0 |
| [georgekhananaev/google-reviews-scraper-pro](https://github.com/georgekhananaev/google-reviews-scraper-pro) | 324 | Python | 评论专用：多语言、图片下载、MongoDB、增量 | — |
| [YasogaN/google-maps-review-scraper](https://github.com/YasogaN/google-maps-review-scraper) | 119 | TypeScript | npm 包 | — |

- Apify 的 Google Maps (Reviews) Extractor 是该领域最成熟的商业 Actor，但源码不开放；ScrapingBee 的同名仓库是商业 API 示例，非开源方案。
- 选型：主方案 gosom；社媒刚需用 omkarcloud 补位或自行扩展（见 §7）。

## 4. gosom/google-maps-scraper 深入评估（源码结论）

### 4.1 技术路线

Go + Playwright 无头浏览器，渲染真实 Maps 页面后解析（稳定优先）。内置资源保护：`PageReuseLimit(2)`、`BrowserReuseLimit(200)`——Chromium 长驻必泄漏，定期重启是唯一可靠回收手段（`runner/webrunner/webrunner.go`）。

### 4.2 三种运行形态

| 形态 | 入口 | 适用 |
|---|---|---|
| CLI | 关键词文件 → CSV/JSON/Postgres/S3 | 手工跑批 |
| REST API 模式 | `POST /api/v1/jobs` → 轮询 → `/download`（OpenAPI 文档 `/api/docs`） | 自建调度 |
| SaaS Edition | `POST /api/v1/scrape`（`X-API-Key`）+ Admin UI（密钥/worker/任务/2FA）+ River 队列 + worker | 多用户平台，一条 `PROVISION` 脚本部署 |

SaaS 队列为 [River](https://riverqueue.com)（Postgres 实现，FIFO，无抢占）；worker 领取任务、跑完再领下一个。

### 4.3 并发模型（关键源码结论）

- **任务级**：web runner 每秒 `SelectPending(Limit: 1)`，单节点任务**串行**执行（`runner/webrunner/webrunner.go`）。同时执行的任务数 = 节点/容器数。
- **页面级**：`-c` / `CONCURRENCY` 决定任务内部并行打开的浏览器页数。**总抓取并发 = Σ(各节点 `-c`)，与任务数无关**。
- 单关键词任务会浪费并发（`-c 10` 的节点只忙 1 页），关键词必须打包进任务（建议几十~几百个/任务）。
- SaaS 的 Admin 表单 concurrency 默认 8；平台生成的 compose 对**每个并发槽硬编码** `cpus: "1.5"` / `mem_limit: "2g"` / `shm_size: "1g"`（`infra/cloudinit/cloudinit.go`）——这是作者给出的生产级单槽资源画像。

### 4.4 代理模型

- API 模式：任务请求体可带 `proxies` 数组（`web/job.go:75`），优先级为节点级 `cfg.Proxies` > 任务级；CLI 模式只有进程级 `-proxies` / `-proxies-file`。
- SaaS：代理是 **worker 级**（开通时写入环境变量），无任务级入口；需要按任务切代理池时按代理池拆 worker 组。
- 裸奔必被封：50 并发需 30–50 个轮换住宅/ISP IP。

### 4.5 关键词回溯（Search Keyword 的替代）

每行结果第一列 `input_id` 关联来源搜索，但默认是随机 UUID、关键词文本不落盘（`gmaps/searchjob.go:48`）。输入行支持 `关键词#!#自定义ID` 语法（`runner/jobs.go:245`），派任务时拼好即可让 `input_id` 等价于 Search Keyword 列。API 模式同样适用（共用解析函数）。

## 5. 字段覆盖对照（Outscraper 风格 34 列 schema）

对照源码 `gmaps/entry.go` 的 `Entry` 结构与 CSV 列：

- **直接覆盖（25 列）**：Name(`title`)、Fulladdress/Street/Municipality(`address`+`complete_address` 拆分)、Categories、About(`about`+`description`)、Phone、Owner/Owner Id/Owner Link（三个全有）、Review Count、Average Rating（另送 `reviews_per_rating` 星级分布）、Review URL、**Cid/Fid(`cid`/`data_id`)**、Latitude/Longitude、Featured Image(`thumbnail`+`images[]`)、Time Zone、Website、Opening Hours（另送 `popular_times`）、Google Maps URL(`link`)、Place Id、Emails（**需 `-email`**，会访问商家官网，速度显著变慢）。
- **可推导/替代（5 列）**：Search Keyword（`#!#`）、Domain（从 Website 解析）、Claimed（有 Owner 即近似已认领，issue [#38](https://github.com/gosom/google-maps-scraper/issues/38) 请求精确值未实现）、Google Maps URL 可由 Cid 构造。
- **硬缺口（3 类 9 列）**：
  1. **社媒链接 ×6**（Facebook/Instagram/Youtube/Tiktok/Linkedin/Twitter）——数据不在 Maps 页面，在商家官网；
  2. **Kgmid / Google Knowledge URL ×2**——在页面 payload 里，仅缺解析；
  3. **Phones（多号码）×1**——只取主号码，解析层小改进。
- **反向超出**：全量评论对象（含商家回复、语言、时间戳）、PriceRange、PlusCode、StreetViewURL、Reservations/OrderOnline/Menu、CreditCardsAccepted。
- 照片：`images[]` 仅 URL（`lh3.googleusercontent.com` 公共 CDN），非二进制、非全量相册；批量下载自行实现（简单 HTTP GET，无需代理）。

### ID 体系速查

| 标识 | 体系 | 用途 |
|---|---|---|
| place_id（`ChIJ...`） | 官方 Maps Platform | 调官方 API |
| cid（纯数字） | 商家聚合 | 主键候选，可拼 Maps URL |
| fid/data_id（`0x...`） | Maps 内部要素 | 商业服务的 FID 即此 |
| kgmid（`/g/...`） | 知识图谱实体 | 最稳的实体主键，改名搬迁不变；本项目未导出 |

各 ID 之间基本不可换算（fid↔cid 除外），并存是为了对接不同 Google 入口。

## 6. 部署架构建议（对应「业务服务器 + 采集节点」规划）

**推荐：SaaS Edition**。业务服务器只面对一个 API 地址，队列 + worker 认领机制自带；扩容 = Admin UI 加 worker，免自建调度。

- **worker 来源三选一**：
  1. DO/Hetzner 自动开通：Admin 填云 API token → 表单选区域/机型/并发/代理 → 平台调 API 开机 + cloud-init 自动拉起（**代买服务器，费用走你的云账号**；token 建议用子账号限额）；
  2. 通用 VPS：走 `PROVISION` 向导的 SSH 路径（填 host/port/user/私钥，脚本自动装 Docker 并接入）——注意 Admin 表单只认 DO/Hetzner，VPS 路径走向导；
  3. 完全手动：任意能连上 Postgres 的机器跑同一镜像 `command: ["worker"]` + `DATABASE_URL`/`PROXIES` 环境变量，等价但无面板健康数据。
- **配置心智**：任务数并发 = 实例数；页面并发 = `-c`/槽位。交互式多用户场景优先「多 worker × 低并发」（隔离好、爆炸半径小），后台大批量场景可用「少 worker × 大 CONCURRENCY」（省浏览器启动开销）。
- **扩展决策**：任务积压 → 加 worker/节点；单任务慢 → 调大 `-c` 或换代理。

## 7. 社媒数据专项

- Google 搜索侧知识面板曾展示社媒（由官网 `sameAs` 标记驱动），**2019-06 官方弃用该标记**改为自动发现；且覆盖集中在品牌/组织/公众人物，**本地小商家面板基本无社媒**；2025 年前后 Google 又从知识图谱清理约 30 亿实体。
- 结论：社媒的现实来源只有**商家官网**（footer 外链正则匹配 `facebook.com/` 等域名即可，无需理解页面结构）。补法：独立 enrichment 步骤（复用 `-email` 的官网访问路径加解析，或接第三方服务），与主抓取管线解耦。
- 来源：[Google Search Central 弃用公告](https://x.com/googlesearchc/status/1143558928439005184)、[知识图谱清理报道](https://www.soci.ai/blog/local-memo-google-removes-3-billion-knowledge-panels-new-attribute-confirmations-creating-a-why-choose-us-page-for-ai/)。

## 8. 资源画像与成本测算（2026-08 时价）

### 8.1 资源画像

- 单页（=单并发槽）：内存 0.5–1GB（平台硬上限 2GB）、CPU 峰值 1 核（平台上限 1.5 核）、平均 CPU 占空比仅 20–40%（大部分时间等网络）。
- **容量按内存规划，`-c` 按 CPU 规划**：CPU 低估成立（C=1 时 2 核绰绰有余），内存不因等待而减少。
- `CONCURRENCY=5` ≈ 5–7.5GB / 峰值 5 核；任务内部并行提速，任务间仍串行。
- swap 可作保险丝（2–4G、`vm.swappiness=10`，NVMe 上代价可接受——本负载非延迟敏感），但不可当容量用；监控信号：`vmstat` 的 si/so 持续非零 → 加内存。

### 8.2 云价格（欧盟区，净价不含 VAT）

⚠️ Hetzner 于 **2026-06-15 调价**，旧评测价格作废（[官方说明](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)）：

| 机型 | 规格 | 月价 |
|---|---|---|
| Hetzner CX23 | 2C/4G | €5.49 |
| Hetzner CX33 | 4C/8G | €8.49 |
| Hetzner CX43 | 8C/16G | €15.99 |
| Hetzner CX53 | 16C/32G | €29.49 |
| Hetzner CPX22（Intel） | 2C/4G | €19.49（涨 1.4 倍） |
| DigitalOcean Basic | 4C/8G | $48 |

- CX（共享 CPU）涨幅最小，对本负载（CPU 占空比低）是性价比之选；DO 同配置是 Hetzner 的约 5 倍价。
- **50 并发槽 ≈ 3×CX53（€88/月）或 7×CX43（€112/月）**，单槽约 €2。
- 更大规模可考虑 Hetzner Robot 独服（128GB 档约 €100/月，未受此轮调价影响）。
- **代理是大头**：住宅代理 $1.5–7/GB，每月 $100–500。

## 9. 安全要点（重要）

- **默认部署把 Postgres 开在公网**：DB 脚本 `5432:5432` 全网卡映射 + `pg_hba` 接受 `0.0.0.0/0`（仅 TLS + scram 密码防护），主服务器 UFW 未放行 5432 也未覆盖 DB 主机（`infra/vps/scripts.go`）。风险必须处理。
- **修复路径**（DO/Hetzner 免费原生支持）：
  1. 同 VPC / Cloud Network 内网互联，`DATABASE_URL` 填私网 IP（该字段是纯字符串，填私网即走私网）；
  2. `pg_hba` 的 `0.0.0.0/0` 改为内网网段，云防火墙关闭 5432 公网入站；
  3. 向导**不会自动做这些**，需手动接线。
- **网络区域边界**：DO VPC 区域锁死；Hetzner Network 支持同 zone 跨机房（Falkenstein/Nuremberg/Helsinki 同属 `eu-central`），跨 zone（欧美之间）不行。本业务**不需要跨区 worker**——Google 看到的是代理出口 IP，与 worker 位置无关，worker 只需离队列近、便宜。
- 全 VPS / 跨 zone 兜底：Tailscale/WireGuard 覆盖网络（`DATABASE_URL` 指 tailnet IP）。
- 平台云 token 等于「能花钱」权限：用子账号 + 限额；worker SSH 被脚本自动加固到 2222 端口仅密钥登录。

## 10. 风险与待办

| 项 | 状态 | 说明 |
|---|---|---|
| 路线验证（POC） | 待办 | 一台 CX43 + `-c 8` 小规模实跑，测单页内存、封锁率、CX 共享 vCPU 的性能波动，再定 50 槽最终配置（官方 sizing 文档缺失，实测是唯一可靠方法） |
| Postgres 内网化 | 待办 | 部署时按 §9 接线 |
| 社媒 enrichment | 待办 | 确认业务是否刚需；是则评估「官网访问 + 外链解析」独立模块，或混用 omkarcloud 方案 |
| Kgmid/Claimed/Phones 解析 | 可选 | 纯解析层小改动，可给上游提 PR 或 fork 维护（代价：Google 改版时自行跟进） |
| ToS/合规 | 已知风险 | 违反 Google ToS（抓公开数据在美国判例下属灰色地带）；接口随 Google 改版随时失效，需盯上游 issue 区 |
| 评论 300 条上限 | 已知限制 | `-extra-reviews` 每店约 300 条，更老的店拿不全 |

## 11. 主要参考

- 仓库源码（浅克隆逐文件核对）：`runner/webrunner/`、`web/job.go`、`rqueue/`、`infra/cloudinit/`、`infra/vps/scripts.go`、`gmaps/entry.go`
- [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) · [SaaS 文档](https://github.com/gosom/google-maps-scraper/blob/main/docs/saas.md) · [issue #38](https://github.com/gosom/google-maps-scraper/issues/38)
- [Hetzner 调价公告（2026-06-15）](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) · [Hetzner Network zone FAQ](https://docs.hetzner.com/networking/networks/faq/)
- [DigitalOcean Droplets 定价](https://www.digitalocean.com/pricing/droplets)
- [gmapsextractor Reviews API 落地页](https://gmapsextractor.com/google-maps-reviews-scraper-api)（实现原理参照）
