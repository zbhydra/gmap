# Google Maps 评论/商家数据采集方案调研

> 调研日期：2026-08-29 · 调研人：hydra + AI 助手 · 三缺口收敛：2026-09-03
> 背景：评估自建「Google Maps 评论/商家数据采集服务」的技术路线、开源选型（gosom/google-maps-scraper）、部署架构、资源成本与数据覆盖缺口。

## 1. 结论摘要

- **技术路线**：官方 Places API 每地点仅返回 5 条评论且有存储限制，全量评论产品只能走抓取路线。业界通用做法是逆向 Google Maps 网页版内部接口（快、易碎）或无头浏览器渲染（慢、稳），商业服务再外包一层 REST API + 计费。gmapsextractor.com 这类小服务多为 Apify Actor 或开源方案的包装。
- **选型结论**：自研 HTTP RPC fetcher 是主引擎，gosom SaaS Edition 作可切换的备选 Provider。HTTP 路线已用 1,500 词 / 66,796 条记录验证，相对 gosom 浏览器路线吞吐更高、资源和代理流量更低；证据见 §12.19、§12.32–§12.34。
- **HTTP 主链**：常规 `search?tbm=map` 深分页 + NID 解锁批量字段 → 浏览器级 pb 批量补 Owner/Claimed/Featured Image/About → 仅对未覆盖 fid 调 `preview/place` 补齐。正确分页模板是 `!7i20!8i{offset}`，必须开 gzip。
- **部署边界**：HTTP Provider 是异步取数调用，可由调用方直接并发；Provider 不建立任务队列。gosom Provider 只提交和查询上游 job，River/Postgres 队列完全归 gosom 管理。
- **字段合同**：对标竞品云端 36 列，其中 29 列为 Maps 核心列，Emails + 6 个社媒链接归独立官网 enrichment；逐列取值见 §12.30。
- **三缺口定论（2026-09-04 终版）**：`ll` 视口块注入精确生效可接入（§12.35）；Reviews 走 GetLocalBoqProxy 全量可行、四排序/商家回复全通（§12.36）；Photos **批量纯 HTTP 打通**——门控为服务端按 cookie 会话记录的交互状态，headful 点击一次养会话后，curl 即可全量翻页（12 页/232 条与浏览器一致、跨 fid 复用会话）（§12.37）。

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
- 阶段性选型曾以 gosom 为主；生产实验后已改为自研 HTTP RPC 为主、gosom 为备选（见 §12.19、§12.34）。社媒与邮箱复用本仓现有官网 enrichment，不再引入第二套抓取引擎。

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

### 4.6 SaaS 通信机制：worker 直连 Postgres，不走 REST API

REST API 只服务一种角色：**提交任务的客户端**（内部仅往队列表插行）。worker 与主节点之间没有任何 HTTP 通信——两者都是 Postgres 的客户端，队列的传输层就是 Postgres 本身（River）。证据链：

1. worker 进程入口：SaaS compose 的 `command: ["worker"]` 走 `RunModeDatabase` 模式（`main.go:72` → `runnerFactory` → `databaserunner.New`），该模式的判定条件就是带了 DSN（`runner/runner.go:237`）；DSN 由 `-dsn` 参数提供（`runner/runner.go:118`）。
2. worker 对 DSN 的用途：`sql.Open("pgx", dsn)` 直开 Postgres 连接（`runner/databaserunner/databaserunner.go:175-176`），完成领任务、写结果、更新状态、读 `app_config`（`rqueue/worker_jobs.go` 直接 `pool.QueryRow`）。
3. DSN 来源：cloud-init 给 worker 写入 `.env` 的 `DATABASE_URL={{DATABASE_URL}}`（`infra/cloudinit/cloudinit.go`），指向 `GenerateDBScript` 建的 Postgres（`infra/vps/scripts.go`）。
4. 无其他传输层：`go.mod` 队列依赖仅 `riverqueue/river` + `riverpgxv5`，无 Redis/RabbitMQ。`DATABASE_URL` 不可达则 worker 连任务都领不到，**5432 可达性是该架构的硬前提**（见 §9）。

设计含义：worker 只需**出站**连数据库，天然躲在 NAT 后、无入站 API 端口（唯一入站是 2222/SSH，仅供 Admin 健康检查旁路）；代价是 Postgres 成为咽喉——既是存储又是队列，承载全部 worker 的连接与轮询，这也是 §9 内网化不是可选项的原因。50 worker 以内规模 Postgres 无压力。

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

## 6. gosom 备选 Provider 的部署架构

本节只描述 gosom 路径，不适用于自研 HTTP Provider。业务服务器只面对 gosom API；任务排队、worker 认领和扩容由 gosom SaaS Edition 自带的 River/Postgres 负责，本仓不重复实现。

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

Postgres 在此架构中不仅是存储、还是唯一的任务传输通道（§4.6），所以它的网络暴露面就是整个系统的安全边界。

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
| HTTP 路线验证 | 已完成 | 1,500 词新架构压测见 §12.34；正式 Gate 仍需长周期爬坡观察封锁率 |
| Postgres 内网化 | gosom 上线前必做 | 仅影响 gosom SaaS Edition，部署时按 §9 接线 |
| 社媒 enrichment | 能力已有 | 复用 013 A4 的官网补全服务；云端任务与计费接线归 014 产品化 |
| 29 列解析 | 已验证 | 常规 pb、浏览器级 pb 与 `preview/place` 的字段账见 §12.30–§12.34 |
| ToS/合规 | 已知风险 | 违反 Google ToS（抓公开数据在美国判例下属灰色地带）；接口随 Google 改版随时失效，需盯上游 issue 区 |
| 评论 300 条上限 | 已知限制 | `-extra-reviews` 每店约 300 条，更老的店拿不全 |

## 11. 主要参考

- 仓库源码（浅克隆逐文件核对）：`runner/runner.go`、`runner/webrunner/`、`runner/databaserunner/`、`web/job.go`、`rqueue/`、`infra/cloudinit/`、`infra/vps/scripts.go`、`gmaps/entry.go`
- [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) · [SaaS 文档](https://github.com/gosom/google-maps-scraper/blob/main/docs/saas.md) · [issue #38](https://github.com/gosom/google-maps-scraper/issues/38)
- [Hetzner 调价公告（2026-06-15）](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) · [Hetzner Network zone FAQ](https://docs.hetzner.com/networking/networks/faq/)
- [DigitalOcean Droplets 定价](https://www.digitalocean.com/pricing/droplets)
- [gmapsextractor Reviews API 落地页](https://gmapsextractor.com/google-maps-reviews-scraper-api)（实现原理参照）

## 12. 生产实测（2026-09-01，Hetzner CX33 单机压测）

选型落地的首日实测：单台 CX33（4C/8G + 6G swap，$10/月）部署 SaaS Edition，6 个 worker

### 12.0 实验数据索引（完整数据：`docs/research/gmaps-rpc-data/`）

| 数据文件 | 内容 | 对应小节 |
|---|---|---|
| `e12_ll_bias.json` / `e12c_ll_sticky.json` | ll 视口块注入首测（Webshare rotate 混合出口）；711 三出口受控实验 | §12.35 |
| `e12e_ll_decide.json` / `e12f_ll_pair.json` | ll 决胜变量（夏威夷对照+NID 有无+交替）；常规/浏览器 pb 同视口对拍 | §12.35 |
| `e13_reviews_boq.json` / `e13b_boq_full.json` | GetLocalBoqProxy：cookie/四排序/翻页 token/字段结构；全量翻页对账 rc | §12.36 |
| `e14_photos.json` / `e14_hspqx_req_sample.md` / `e14_hspqx_bulk_resp.txt` | preview/place 图片层 + hspqX 批量通道模板与 157 张原始响应 | §12.37 |
| `e14b2_server_replay.json` | hspqX 服务端匿名复现失败记录（结构对齐过程 + 400 er/3 定位） | §12.37 |
| `rpc_result_full.json` | 500 词 RPC 压测 per-keyword（条数/失败/饱和页） | §12.19 |
| `pagination_pages.json` | Portland 分页 offset 20-200：每页 place_ids + 店名样本 | §12.18 |
| `webshare_round1/2.json` | Webshare 两轮 200 词 per-keyword 明细（关键词/条数/耗时/状态） | §12.6 |
| `e1_saturation.json` | Hollywood 同城 4 查询变体覆盖饱和度 | §12.22 |
| `uz_job.json` | 乌兹别克区级地名 40 条全字段记录 | §12.17 |
| `v2_portland2.json` / `v2_final.json` | fetcher v2（L1+L2）验证输出 | §12.20 |
| `competitor_220.json` | 友商 220 条全字段记录（DOM 导出，含 place_id/owner/kgmid） | §12.8 |
| `bare_coffee_shop.json` | 裸词 coffee shop 单趟 60 条（Houston 锚点） | §12.12 |
| `l1_fill_survey.json` | L1 填充率 12 词调查：457 条全记录 + b[4] 原始数组样本 + server 日志 `survey.log` | §12.23 |
| `e2_place_http.json` / `e2c_tls.json` | place 页纯 HTTP 变量矩阵 16 变体 + TLS 指纹 4 变体 | §12.24 |
| `e3_preview_place.json` | /maps/preview/place 单店详情 RPC 复现（3 实体 × 无NID/NID 全字段） | §12.26 |
| `e4_l2_coverage.json` | L2 覆盖边界：Denver 42 + Ajo 15，99 次 L2 请求全字段记录 | §12.27 |
| `e5_field_completion.json` | L2 剩余字段位置实测：Denver 42 全量（hours/星级分布/plus_code/缩略图/popular_times/about/review_link） | §12.28 |
| `e6_concurrency.json` / `e7_restaurant_desc.json` | 并发阶梯（8/16/32）实测；餐饮类目 description 阴性样本 | §12.29 |
| `e9_l1_nid.json` / `e9b_l1_nid_multi.json` | L1+NID 批量 rc：Denver 三 cookie 变体对照；4 词×2 变体（0%→100%） | §12.32 |
| `e10_l1nid_extended.json` | 常规 pb 富变体扩展字段解剖（60 行：place_id/hours 批量，owner 缺席） | §12.32 |
| `e11d_browser_pb_fill.json` | 浏览器级 pb 批量 owner 统计（owner_id 20/20、图片/About 20/20） | §12.33 |
| `stress_batch500/` | 500 词新架构压测：summary.json + 3 个样本 CSV（全量 500 CSV/JSON 在服务器 `/data/gmaps-research/stress/batch500` 与本地 `scratch/stress_batch500/`，不入 git） | §12.34 |
| `stress_batch1000_summary.json` | batch1000 复测汇总（第 501–1500 词；全量 CSV/JSON 在服务器 `/data/gmaps-research/stress/batch1000`） | §12.34 |
| `scratch/e2-place-page/e3_denhit_nid_raw.txt`（不入 git） | preview/place 原始响应全文（den_hit + NID） | §12.26 |
| `scratch/e2-place-page/e2_shell_proxy.html`（不入 git） | place 页 JS 壳完整 HTML 原文（206KB） | §12.24 |
| `depth_map*.tsv` / `e1_map.tsv` / `merge_test.tsv` / `kw*.txt` / `*_cut.env` | 任务映射 / 关键词集 / 时间戳 | 全部 |
### 12.1 压测数据（499 关键词，depth=5，美国小镇词集）

| 指标 | 实测值 |
|---|---|
| 成功率 | **499/499 = 100%**（零封禁、零验证码、零丢弃；中途两次 worker 重建打断的任务全部自动重试成功） |
| 批次墙钟 | 约 2 小时 13 分（提交→最后完成）；稳定产出窗口 103 分钟，产出速率 ≈ 4.8 词/分钟 |
| 任务耗时 | 平均 73s（中位 98s / P90 112s / 最慢 166s），超时 0 个 |
| 采集量 | **13,207 条**，均值 26.5 条/词；覆盖分布：≤20 条 215 词、21-99 条 284 词、≥100 条 0 词（最大 60） |
| 资源 | 内存 used 峰值 ≈ 6.9G，swap 偶发换入（si=24KB/s），结束回落 1.4G；磁盘 20% |
### 12.2 代理流量与单位成本（实测）

当日总消耗 **2.09 GB**（含 depth2 试跑 19 词 + depth5 压测 499 词）：

| 归因 | 单位消耗 |
|---|---|
| depth=5 关键词 | ≈ 4.1 MB/词 |
| depth=2 关键词 | ≈ 2 MB/词 |
| **每条记录** | **≈ 160 KB/条**（2.05 GB ÷ 13,207 条） |

成本 = 0.00016 GB/条 × 代理单价。711proxy 实际档位（促销价，有效期分档，旋转+粘性会话）：

| 711proxy 档位 | 单价 | 有效期 | 每关键词(depth5) | 每条记录 | 50 万条/月（≈80GB）流量成本 |
|---|---|---|---|---|---|
| 5 GB | $3/GB | 30 天 | $0.0123 | $0.00047 | $240（16 包） |
| 40 GB | $1.4/GB（$56） | 30 天 | $0.0057 | $0.00022 | $112 |
| 100 GB 加赠 20 | $0.98/GB（$117） | 30 天 | $0.0040 | $0.00015 | $117（用 80/120GB） |
| 500 GB+25 | $0.76/GB（$400） | **终生** | $0.0031 | $0.00012 | 一次性 $400 覆盖 330 万条 |
| 1000 GB | $0.65/GB（$680） | **终生** | $0.0027 | $0.00010 | 一次性 $680 覆盖 650 万条 |
| 2000 GB+100 | $0.62/GB（$1300） | **终生** | $0.0026 | $0.00010 | 一次性 $1300 覆盖 1300 万条 |

对照友商零售价（≈$0.0006/条）：**$0.62-1.4/GB 档的代理成本约为其零售价的 17-37%**；
服务器固定成本可忽略。有效期分档是关键采购参数：小包 30 天（须贴月消耗买），500 GB
起终生有效——大包无过期风险，采购决策变成「资本占用 vs 业务存续信心」：只要业务
生命周期内确定能耗完（≈330 万条起），提前买大包锁定低价即合理，不存在作废损失。
### 12.3 实测发现的坑（重要，直接影响生产）

1. **SaaS 版代理不轮换（源码实锤）**：scrapemate v1.3.0 的 session-slot 路径中
   `recycleIfNeeded()` 为空实现（`session_slot.go:207`）——代理在浏览器创建时从池中
   轮询取一次后**终身绑定**，且每个 worker 进程各自从 0 计数，`--scale` 复制模式下
   全部副本绑死第一个入口。规避：**按入口拆 worker**（每个实例独立 env、独占一个入口，
   禁用 --scale）；根治需上游修复 `recycleIfNeeded` + 定期重建浏览器（顺带解决 Chrome
   长驻内存泄漏，实测 swap 换入即其症状）。
2. **DB flush 瓶颈**：Postgres 与 worker 同机时，6 worker 满载下结果落库等待
   60-113s（watchdog 阈值 20s，`flush wait exceeded` 反复出现）——不丢数据但拖慢吞吐，
   且推测为批次前段 30 分钟启动延迟的嫌疑。DB 分离（入口机 2C/4G 足够，QPS<10、
   写入<0.5MB/s）列入待办。
3. **depth 边际收益**：小镇词集 depth=5 无一词打满 100 条（max 60，Google 侧结果就
   那么多），depth 2→5 采集量仅 +32% 而耗时 ×2。**常规批量 depth=3 为甜点**，高密度
   大词才值得 depth=5。提交端显式传 `max_depth`（镜像内置默认 1 写死，改它需 fork）。
4. **EnsureSSHKey 上游 bug**：向导按名字复用已存在的 SSH key 注册、不比对内容
   （`infra/hetzner/hetzner.go:44`），删机重开会把新服务器绑到旧公钥上，状态与服务器
   永久失配。规避：重开前删除项目内旧 `gmapssaas-worker` 密钥。上游 issue 候选。
5. **评论抓取兜底直连**：评论 RPC 失败时 fallback 无代理直连（`stealth.New(..., nil)`），
   会把机房 IP 暴露给 Google——监控中未触发，但配置代理后需盯日志。
### 12.4 运维定版

- worker 扩容：复制 compose 中 `worker-N` 块 + 对应 `proxy-711NNN.env`（711007-711010
  已预建），禁用 `--scale`
- 巡检：服务器 crontab 每小时跑 `/opt/gms-ops/proxy_health.py`（读 `.env` 全量入口测
  出口 IP + worker/DB/内存/磁盘），**异常才推送飞书**，全程留痕
  `/var/log/gmap-proxy-health.log`
- 日志：全部容器 json-file 上限 512m×2
- 备份：Postgres + 部署配置纳入外部备份机内网拉取（DB 走内网 `10.0.0.2:5432`，TLS）
### 12.5 待办（压测后）

| 项 | 说明 |
|---|---|
| DB / worker 分离 | 压测数据已支撑（利用率 34%、flush 瓶颈）：入口机 2C/4G 跑 serve+PG，worker 机专职浏览器；顺带完成 5432 收敛 + `DATABASE_URL` 切内网 `10.0.0.2` |
| 上游 issue × 2 | `EnsureSSHKey` 按名复用 bug；SaaS 代理不轮换 / 浏览器不回收 |
| 3 天连续 soak | roadmap 阶段 0 门槛（封锁率连续 3 天低于阈值），当前第 1 天 100% 通过 |
| 社媒 enrichment | 友商 31 字段含社媒/Kgmid/Claimed 实证可取，阶段 4 专项从可选转必须 |
### 12.6 供应商对照：Webshare Free（datacenter 轮换池，2026-09-01 两轮实测）

配置：`p.webshare.io:80` SOCKS5 轮换端点（`-rotate` 用户名，**每请求换 IP**），免费档
= 10 个机房代理。两轮各 100 词（词表 1-100 / 101-200，美国小镇集）、depth=3、6 worker：

| 指标 | Webshare Free 第 1 轮 | 第 2 轮（累计 200 词） | 711proxy（住宅 sticky）depth5 参照 |
|---|---|---|---|
| 成功率 | 100/100 | **100/100（累计 200/200）** | 499/499 |
| 均条/词 | 20.0 | 22.0 | 26.5 |
| 平均耗时 | 56s | 61s | 73s |
| 墙钟 | ~16 分钟（6.1 词/分） | ~17 分钟（5.9 词/分） | 103 分钟/499 词（4.8 词/分） |
| 封禁/验证码/零结果 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| 出口 IP 质量 | 全部机房段（Leaseweb/Cogent/SYN LTD），ip-api 与 proxycheck 双库标记 `proxy=yes / type=VPN` | 同左 | 英国住宅 ISP 段 |
| 会话 | 每请求换 IP（无粘性） | 同左 | sticky 180 分钟 |
| 成本 | 免费 | 免费 | $0.98-1.4/GB |

**结论（第 2 轮后修正）**：原预期「机房 + 每请求轮换在 100-200 词量级会触发风控」
**未被实测验证**——200 词累计、每请求换出口，全程零验证码、零封禁、零零结果，单
worker 内部页任务 357 个零失败。推测原因：小镇词竞争度低 + 每请求轮换使单 IP 累计
量极小 + 浏览器指纹过关。据此修正定性：**Webshare Free 机房轮换池在当前词型与量级下
是可用的生产级选项（零成本）**，711 住宅 sticky 仍是更保守的主池（IP 质量干净、会话
稳定、已被 499×depth5 验证）。真正未验证的区间：高密度大词、enrichment（访问商家
官网）、周/月级别的持续满载。另注：机房池每请求轮换使单 IP 累计频率理论上极低，
规模化封锁风险或低于此前判断；但 10 IP 池为全部免费用户共享，池子质量随时间的变化
需持续观察（飞书巡检每小时覆盖）。
### 12.7 depth 标定实验：曲线、崩点与 60 条硬顶（2026-09-01）

高密度词标定（出口=英国住宅 sticky，6 worker）：

**实验 1 — London「coffee shop in London」depth 1-10：**

| depth | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 |
|---|---|---|---|---|---|---|---|---|
| 条数 | 16 | 20 | 20 | 36 | 40 | 48 | **20** | **20** |

**实验 2 — 排除偶发与地域因素（NY 锚定词 + London d8 重测）：**

| 任务 | NY d6 | NY d8 | NY d10 | NY d12 | London d8 重测 |
|---|---|---|---|---|---|
| 条数 | 48 | **20** | **20** | 42 | **60** |

结论：

1. **Google 供给硬顶 ≈ 60 条/词**：当日全部 ~700 个任务的历史最大值即 60（DOM 滚动
   路线下，服务端对这个查询形态的返回就这么多）。
2. **崩点非 depth 的确定函数**：d8 一次 20、重测 60；d12=42——同词同深度波动 20-60，
   属 Google 服务端供给的非确定性，不是「深度超过 8 就被限制」。
3. **查询地域锚定无效**：NY 锚定词与 London 词曲线一致（48→20→20→42 vs 48→20→60），
   IP 地域与查询地域的匹配与否不改变供给上限。
4. **友商 220 条/词不是 depth 参数差距**：DOM 滚动路线的硬顶 ~60；220 意味着绕过 UI
   滚动的采集技术（内部 RPC 分页 + pagination token，见 §2），或多个切片/缩放级别
   合并。复刻路径是 fork 加 RPC 分页，调 depth 无用。
### 12.8 竞品 220 条任务解剖（浏览器实测，2026-09-01）

借用户已登录的 gmapsextractor dashboard 读取 220 条任务的全量记录（免费视图 34 列，
ZIP 导出被升级墙拦截，但 DOM 内含全量数据）：

- 关键词为裸词 `coffee shop`（无地名），220 条记录横跨两个州：**Buffalo, NY 前 20 条
  （位置 0-19 连续，恰好一个滚动批次）+ 南佛州迈阿密都会区 192 条**（Aventura 24 /
  Hallandale Beach 15 / Hollywood 14 / Sunny Isles 11 / Miami 多邮编），沿 US-1 走廊
  （Biscayne Blvd → Federal Hwy → Collins Ave）由南向北连续分布
- **实质：多地点覆盖合并**。引擎按地点锚点分至少 2 遍采集（Buffalo 一遍 20 条 +
  南佛州一遍 ~202 条），再按 placeId 合并去重（残留 2 条重复——友商去重不彻底）
- 南佛州单遍即滚出 ~200 条，超过我们单会话 ~60 条的软限 → 竞品的滚动会话更强
  （IP 轮换或 RPC），但其产品逻辑「多地点 × 每地点深采 × 合并」可以低成本复刻
- 其他观察：Claimed=YES 91%；评论总量 106,337；**社媒/邮箱列 220 行全空**（付费
  enrichment 管线，免费视图不填充）；uniqueNames 202/220（连锁店同名多分支）
- 产品启示：①「多地点覆盖」应作为我们的采集特性（词无地名时自动多锚点跑 + 合并，
  直接对齐友商 220 的能力，无需改引擎）；②去重要按 placeId 精确做，质量可超越友商；
  ③免费视图不填充 enrichment 列是其转化付费的手段，我们的 credits 体系可复用
### 12.9 竞品 168 条任务解剖（Portland，2026-09-01）

任务 #d92f1877（元数据 2 关键词 / 168 条）浏览器全量读取：

- 记录列只有单一关键词值 `coffee shop in Portland`，**100% Portland, OR 单城**
  （10 个邮编 97201-97266，纬度 45.47-45.60，全城覆盖无多地点迹象）
- 168 行 / 162 唯一 placeId（6 条重复，3.6%）——与「2 关键词各采 ~87 条，
  placeId 合并去重」完美吻合（87+87−6=168）；87 恰为另一单关键词任务的实测产出
- Claimed YES 94%；社媒/邮箱列全空（免费视图付费墙，同 §12.8）
- 行序从市中心扫至东郊再回西北，全城覆盖

**友商引擎统一模型（三个任务交叉验证）**：

| 任务形态 | 合并结构 |
|---|---|
| 220 条 / 1 词无地名 | 两遍不同**地点**锚点（Buffalo 20 + 南佛州 202）− 2 重复 |
| 168 条 / 2 词带地名 | 两遍不同**关键词**同城市 − 6 重复 |
| 87 条 / 1 词密集市场 | 单遍产出（= 其单遍滚动深度上限） |

即：任务 = N 个关键词 × M 个地点锚点的笛卡尔采集，placeId 合并去重后交付。
单遍产出上限 ~87-90 条（我们 ~60，差距 = 滚动批次数 9 vs 6，即会话软限前能滚的批次）。
**复刻要点**：任务级多关键词/多地点采集 + placeId 去重合并全部在我们 backend 层实现
（架构已支持）；唯一需要改引擎的是把单遍滚动深度从 6 批次撑到 9+（批次间换 sticky
入口或加退避，fork 级小改）。
### 12.10 Austin 单文件解剖与模型修正（2026-09-01）

f7cb3177 的 Task Files 弹窗实锤：**324 条 = 两个独立文件之和（Portland 168 + Austin
156），友商不做跨关键词合并**，每关键词一个独立 CSV。此前「87+87 任务级合并」的
推断作废。Austin 单文件（`restaurant in Austin`，156 行）解剖：

- 单关键词、**仅 1 条重复**——一趟干净的市中心锚定连续采集（Congress Ave 出发，
  覆盖 78701 主城 100 条 + 东郊），非多锚点合并
- **单趟 156 条 ≈ 13+ 个滚动批次**，远超我们 gosom 会话的 ~6 批次/60 条
- Claimed 97%；存储体量 ≈ 2 KB/条（CSV 322KB/156 条，与我们的 schema 量级一致）

**关键修正与发现：我们的 60 条天花板大概率不是 Google 的墙，是 gosom 的滚动节奏。**
证据：同会话 d8 首跑 20 条、重测 60 条、Austin 趟 156 条——若 Google 在 6 批次后
断供，这些数字不应存在。最合理解释：gosom 滚动等待太短、「无新结果」判定太急，
代理链路下懒加载稍慢即提前收工（首跑/重测的巨大方差也是服务延迟波动的症状）。

**fork 的价值重估**：修滚动节奏（加长等待、容忍 2-3 次空滚动再放弃）+ 修
`recycleIfNeeded`（内存泄漏），两处小改即可把单趟产出 ~60 → 150+（2.5 倍），
无需任何代理侧变更。此为当前最高优先级的工程项，优先于代理预算升级。

产品层同时确认：友商任务交付为「每关键词一个独立 CSV」，不做跨关键词去重合并——
我们 backend 层的跨关键词 placeId 去重是免费的产品差异化。
### 12.11 fast_mode 实验与「突破 120」机制定论（2026-09-01）

fast_mode（stealth HTTP）实验：`coffee shop in Portland` + geo_coordinates +
depth 10/30/60/100，GB 出口与 US 出口各一轮——**全部 rc=0**。worker 日志实锤错误：
`playwright: Download is starting`（Google 对 `maps.google.com/search?...&tbm=map`
内部 URL 返回下载响应而非页面），且日志暴露 fast_mode 的 URL 构造含 **`pb=...!7i20!8i0`
分页偏移参数（每页 20 条）**——即 fast_mode 的 depth 就是内部接口的页数。

**「突破 120」机制定论**（全部线索收敛）：

1. UI 滚动硬顶 120（人工实验确认）；gosom 浏览器模式实际 ~60（滚动节奏提前收工）
2. 友商 156/168/220 > 120 → 其主采集为**内部 RPC 分页**（depth = 页数，每页 20；
   友商 220 ≈ 11 页，156 ≈ 8 页，数字完全吻合 20/页粒度）
3. 220 任务的双地点结构（Buffalo 20 + 南佛州 200）为**地点覆盖合并**（产品层）
4. gosom 自带的 fast_mode（同原理）在当前 build 损坏，不可用；自研 RPC 是复刻
   >120 的唯一路径

**可行动路径（按成本排序）**：A. 多锚点合并（backend 按「城市/邮编/街区」拆分关键词
子查询，每个子查询 <120，placeId 合并——零引擎改造，今天可用）；B. fork 修滚动节奏
（60 → 接近 120）；C. 自研 RPC 分页（>120 的唯一路径，工程量最大）。A+B 组合可先
对齐友商常规区间（87-168），C 决定天花板。
### 12.12 三方重叠分析：我们 vs 友商（2026-09-02）

将友商 220 条（DOM 全量导出，含 place_id）与我们两组采集做 placeId 级重叠：

| 数据集 | 行/唯一 | 与友商 219 唯一的重叠 |
|---|---|---|
| 我们 5 城市子查询合并（depth5） | 180/153 | **76 个（35%）** |
| 我们裸词 `coffee shop`（depth8，单趟） | 60/53 | **0 个（0%）** |

关键发现：

1. **裸词结果 100% 跟随出口 IP 地理**：我们 US 出口本次恰好落在 Houston, TX
   （lat 29.65-29.86），裸词 `coffee shop` 采回的 60 条全是休斯顿的店——与友商
   迈阿密结果 0 重叠。实证：无地名词的查询，地点完全由出口 IP 决定；友商的
   Buffalo 锚点即其某出口 IP 的位置。
   **勘误（2026-09-03，§12.35）**：此现象实为「无数据小视口下的回退」——当时
   fetcher 硬编码内布拉斯加 3.8km 视口（无数据），城区坐标视口注入后结果 100%
   锚定视口、出口不参与。
2. **同城市重叠也只有 38%**：友商 FL 191 条中我们 5 城合并覆盖 73 条。未覆盖样例
   集中在 Coral Gables / Doral / Davie / 33165 等卫星城——我们的 5 个城市锚点粒度
   粗于友商的实际覆盖。
3. **重叠度低的三种解释（未完全定论）**：(a) 锚点粒度不足（我们 5 城vs友商更细）；
   (b) Google 结果集本身随会话/IP/时间高方差（友商数据采集于 08-29，早我们 3 天）；
   (c) 友商走 RPC 路线返回的结果集与 UI 路线不同。35% 无法在三者间归因。
4. **多锚点合并机制本身验证成立**：5 子查询合并 153 唯一 ≈ 单趟 60 硬顶的 2.5 倍；
   但「合并即等效友商」的说法收回——覆盖差距约 3 倍，需更细锚点 + 更深 depth +
   多轮合并逼近，且永远存在 Google 会话方差。

**产品启示**：① 出口 IP 地理是采集的「地区」控制旋钮，产品层应作为参数暴露
（客户选地区 = 我们选对应出口）；② 想宣称「覆盖 X 城市全部咖啡店」，需要街区级
锚点矩阵 + 多轮采集合并，且「覆盖率」本身只能定义为本系统多次采集的并集相对
单次查询的增量收敛，不存在绝对口径；③ 友商的数据完整性（220 含卫星城）说明其
锚点矩阵比我们粗测的更细，其宣称的「99.7% 成功率」背后是真实的锚点矩阵工程。
### 12.13 双账号对照：友商实现方案定论（2026-09-02）

同一裸词 `coffee shop`，两个不同账号（= 不同出口 IP 会话）各导出 220 条 CSV
（36 列，schema 完全一致，社媒/邮箱列在 CSV 导出中亦为空）：

| | 账号 1 | 账号 2 |
|---|---|---|
| 行 0-19（20 条） | 布法罗都会区半径展开（Buffalo 各区 + Rochester + Niagara Falls） | 奥马哈都会区半径展开（Omaha + Council Bluffs + Fremont） |
| 行 20-219（200 条） | **整体切换至南佛州海岸**（Aventura 24 / Hallandale 15 / Hollywood 14 / Sunny Isles 11 / Miami） | 留在奥马哈深挖（78701 型市中心 16 + 全市）+ **6 条曼哈顿混入** |
| 两段重叠 | 0 | 0 |
| 总行数 | **220 整** | **220 整** |
| 内部重复 | 1 条 | 1 条 |
| 跨账号重叠 | **0/220（0%）** | — |

**友商实现定论**：

1. 采集 = 内部 RPC 分页（`maps.google.com/search` + `pb` 参数，`!7i20!8i{偏移}` 每页
   20 条，depth = 页数）。**每关键词固定预算 220 = 11 页 × 20**（两账号分毫不差），
   是引擎设定而非能力上限——数据端供给远超 220
2. **分页锚点 = 当前出口 IP 的地理位置**，且长任务中出口 IP 会漂移（账号 1:
   Buffalo → 南佛州；账号 2: Omaha 全程 + 6 条 NYC 混入）——漂移即代理池轮换的
   自然行为，轮换后分页锚点跟着新 IP 走
3. **UI 的 120 上限是「UI 停止请求」的位置，不是数据端边界**——人工滚动无法突破
   120 与 RPC 可取 220 并不矛盾：UI 到 120 就不再翻页，RPC 用显式偏移可继续索取
4. 无地名词查询的结果 100% 由出口 IP 地理决定（双账号 0 重叠 + 我们 Houston 出口
   实验三方互证）——**勘误（2026-09-03，§12.35）**：成立条件是「无 ll 或视口无数据」；显式注入城区视口后出口不参与地理锚定。友商账号 1 的 Buffalo→南佛州「漂移」应重新归因于其 ll 未传时的 IP 回退，而非分页锚点机制。
5. 合并去重不彻底（各 1 条重复）；社媒/邮箱列连 CSV 导出都为空（enrichment 为
   独立付费管线或根本未实现）

**对我们**：① fast_mode 的 URL 构造与此路线一致（`!7i20` 分页已在其代码中），
修复「Download is starting」的导航问题即可获得同款能力，无需从零自研；② 我们
A 路径（多锚点子查询 + placeId 合并）在交付上等效且锚点可控性更强（主动规划
vs 被动漂移），产品层应把「出口 IP 地理」作为一等参数暴露；③ 每关键词 220 条
预算 = 干净的计费单元（11 页 × 20 条 × 160KB/条 ≈ 每关键词流量成本可直接定价）。
### 12.14 生成器取证：没有地理数据库（2026-09-02 浏览器动态取证）

`bulk-keywords-generator.html` 反混淆（javascript-obfuscator，已还原 `/tmp/bulk-deob.js`）+
网络抓包结论：

- **不存在自建地理数据库**。地理数据全部实时调用第三方公共 API
  `countriesnow.space/api/v0.1/`（国家→州→城市，纯名称字符串，**零经纬度、零邮编、
  零街区**）。美国全国城市 19,485 条（含县名）。样本已提取
  `/tmp/gazetteer_sample.json`（345.9KB）
- 生成逻辑 = **纯字符串拼接**：`{GMB分类} {in|near} {city}, {state}, {ISO2}`；连接词
  仅 none/in/near 三选一；type=none 时产生双空格 bug（`Restaurant  Abbeville, US`）
- 内嵌 `/js/gmb.js` = **4074 条 GMB 分类词表**（纯名词，可直接复用作我们的关键词
  种子类目）；混淆 JS 里另有死代码 `fetchIP()`（freeipapi.com 按 IP 定位默认国家，
  未被调用）
- 页面有防嵌入检查（非 gmapsextractor 域名直接 return）；生成即自动产生全美
  19,485 条关键词（默认国家硬编码 United States）
- **推论**：坐标解析发生在 Google 侧（搜索词里的地点文本由 Google geocode），
  竞品的「220 条能力」与这个生成器无关——生成器只是营销引流工具。我们的坐标
  级锚点能力（如有）反而是超越点
### 12.15 友商引擎方案定论（2026-09-02，多源指纹交叉）

**定性：自研引擎，非 gosom / Outscraper / omkarcloud / HasData 的任何一种改造。**
证据强度：中高（Postman 官方样例 + 两版 Outscraper 官方 schema + omkarcloud 删除前
源码 + HasData 文档四方排除）。

| 维度 | 友商实测/官方说法 | 含义 |
|---|---|---|
| schema | Title Case 自研体系（Fulladdress/Municipality/Claimed/Owner Id/Phones 多值/Kgmid/Google Knowledge URL/Fid），继承自其 Chrome 扩展（2022 起做 DOM 抓取） | 6 个鉴别字段在 Outscraper/omkarcloud/gosom 三方均不存在 |
| API 参数 | `q / page / ll(@lat,lng,zoomz) / hl / gl / extra(email+社媒)`，与 gosom 参数名**精确重合 0 个**、概念重合 3 个 | 命名完全贴 Google Maps 原生 URL 语义（@lat,lng,zoomz / hl / gl 是 Google 原生参数） |
| 分页 | **`page` 参数 × 每页固定 20 条，公开 API 上限 10 页 = 200 条**；我们仪表盘实测 220 = 11 页（内部比 API 多放行一页） | 与我们「每页 20」粒度推断完全吻合；**>120 的机制 = 内部 search 分页** |
| 引擎自述 | "full browser environment, automatically resolving CAPTCHAs" + "routing requests via the nearest proxy server" | 云端 = 真浏览器 + 自动解验证码 + 就近代理 |
| 关键词语义 | `q` = "anything you would use in a regular Google Maps search"；Postman 明确警告 "near me 可能与坐标不符，建议查询里写 city/state/zip" | 官方证实我们的实测：裸词跟随出口 IP；in/near 是文本地点词；坐标走 `ll` 参数 |
| enrichment | `extra=true` 返回 emails + 8 类社媒链接 + meta/tracking_ids | 付费 enrichment 是 API 参数级功能（非独立管线） |
| 时间线 | 2022 Chrome 扩展（DOM 抓取+auto-scroll）→ 2025-09 云端 Web Scraper → 2026-04 v2 API/Reviews/Photos API/MCP | 云端引擎继承扩展的 Title Case 字段集；robots.txt 含中文注释（疑似中文团队） |
| 生成器 | 纯字符串拼接 + countriesnow.space 公共 API，无地理数据库 | 见 §12.14 |
### 12.16 工程决策影响（调研收官）

1. **突破 120 的唯一机制 = 内部 search 接口的 page 分页（每页 20）**，友商的
   220/168/156 全部吻合 20/页粒度。gosom 的 fast_mode 本就是同路线（pb 参数
   `!7i20!8i{offset}` 分页已在代码中），坏的只是导航处理（`Download is starting`）——
   **修复 fast_mode = 直接获得 page 分页能力**，维持「fork 最高优先级」判断
2. 我们的 A 路径（多锚点子查询 + placeId 合并）在产品交付上与友商等效，且我们
   可用坐标级锚点（友商只有文本锚点）做出更细的覆盖矩阵
3. GMB 分类词表（4074 条）与 countriesnow 城市词表（19,485 条）均可零成本复用为
   我们的关键词生成种子
4. 友商 enrichment（email + 8 类社媒链接）是 API 参数级功能（`extra=true`），我们
   的对应实现应设计为 API 参数而非独立管线
5. 裸词跟随出口 IP 已被官方文档侧面证实（"near me" 免责声明）——产品的「地区
   参数」必须显式化（出口 IP 或 ll 坐标二选一）
### 12.17 文本路径对生僻地名的有效性验证（乌兹别克斯坦，2026-09-02）

用友商生成器格式（含 type=none 双空格 bug 特征）的关键词
`Restaurant  Shahrikhon Tumani, Andijon Region, UZ`（乌兹别克斯坦安集延州沙赫里汗区，
区级生僻地名）在我们引擎上走文本路径（浏览器模式，depth5）：

- Nominatim 确认地名存在：Shahrixon tumani（行政级，中心 40.717/72.067）
- 结果：**40 条，100% 落在区内**（距区中心 0.6-6.6km），店名为真实本地店铺
  （乌兹别克语/俄语：`Qobiljon Shashliklari`、`Somsakhona`、`Anxor choyxonasi`、
  `"Taj Mahal" ресторан`）
- 说明：**文本直提交时，区级（tumani）生僻地名的 geocode 由 Google 侧完成**，
  无需我方维护任何经纬度数据库

**对「友商是否做区域转坐标」的定论**：三条独立证据一致指向「**直接提交文本，
不做区域转坐标**」——① 其生成器地理数据为纯城市名（countriesnow.space），无坐标
可转（§12.14）；② 官方 Postman 文档明确 `q` 可以是任何 Google Maps 搜索词，且
免责声明建议把地点写进查询文本而非依赖坐标（§12.15）；③ 本文实证文本路径对
区级生僻地名完全有效，转坐标无必要。无法 100% 排除其后端有隐藏 geocode 步骤，
但按奥卡姆剃刀，「文本直提交」是唯一无需附加假设的解释。
### 12.18 分页机制复刻实验：shell 脚本打通全流程（2026-09-02，决定性）

纯 curl（US 住宅 sticky 出口）直打 `maps.google.com/search?tbm=map` 内部接口，
pb 参数 `!7i20!8i{offset}` 递增（每页 20 条），「coffee shop in Portland」实测：

| offset | 本页唯一 | 新增 | 累计唯一 |
|---|---|---|---|
| 20-120 | 20/页 | +20/页 | 20→120（线性） |
| 140 | 140 | +20 | **突破 UI 120 上限** |
| 160 | 146 | +6 | 衰减开始 |
| 180-200 | 146 | +0~3 | 耗尽，存量 ≈ 149 |

结论：

1. **UI 的 120 上限是「前端停止请求」，数据端供给远超**——offset 120-200 照常返回
2. **分页完全复刻成功**：`!7i20!8i{offset}` 递增、每页 20 条、单页 ~106KB
   （**≈5.3KB/条，比浏览器路线 160KB/条便宜 30 倍**）
3. 「coffee shop in Portland」真实存量 ≈ 149 家（友商同词 168 行，覆盖率 89%）
4. **C 路径（自研 RPC）的原型已通**：剩余工程 = 解析器（gosom 的
   ParseSearchResults 可参考移植）+ 并发 + 集成，不再是「大工程」
5. gosom fast_mode 的 rc=0 之谜同时解开：内部接口返回
   `content-disposition: attachment`（下载响应），playwright 路径必死，
   纯 HTTP 客户端（curl/azuretls）正常拿到数据——fast_mode 修复方向 = 改用
   纯 HTTP 处理该响应
6. 每请求间隔 ≥2s、10 页连续请求未触发任何验证码/封锁（单会话累计 149 条供给）

**待补**：高频/大规模下的封锁行为；完整字段解析（place 详情需额外按 fid 请求）；
多城市并发下的速率控制。
### 12.19 RPC 路径全量压测终报（Webshare 付费池，2026-09-02）

配置：500 关键词 × 10 页（offset 20→200）、6 线程、Webshare 付费池
（100 US IP 轮换 / 250GB 月流量 / High IP Reputation，$3.887/月）、纯 HTTP
（curl 子进程，UA firefox，重试 3 次，页间 0.8s）：

| 指标 | RPC 路径（本测） | 711 住宅 sticky 浏览器模式（昨日参照，depth5） |
|---|---|---|
| 成功率 | **500/500 = 100%** | 499/499 = 100% |
| 页请求失败 | **0**（~4,300 页请求） | — |
| 墙钟 | **29.5 分钟** | 2 小时 13 分 |
| 吞吐 | **16.9 词/分钟 ≈ 2,031 条/分钟** | ≈ 99 条/分钟 |
| 总条数 | **59,906** | 13,207 |
| 均条/词 | 119.8（**最大 839**） | 26.5 |
| 饱和分布 | 136 词打满 10 页预算；348 词 1-5 页自然耗尽 | — |
| 内存 | **<1GB（峰值 945M）** | 6-7GB |
| 流量 | ≈ 530MB（5.3KB/条） | ≈ 2.09GB/518 词（160KB/条） |

**定论**：

1. RPC 路径全维度碾压浏览器路线：吞吐 20 倍、单趟深度 2 倍（60→120+，136 个词
   打满 10 页预算仍未耗尽，最大单词 839 条）、内存 1/7、流量 1/30
2. Webshare 付费池全程零失败零验证码——「High IP Reputation」档位经 4,300 页
   请求实测可信
3. 路径 C（自研 RPC fetcher）原型已验证完毕，可进入产品化（解析 31 字段、
   按 fid 补详情、并入现有 API/credits）
4. 成本口径：$3.887/月套餐即可支撑本测 46 倍的年化吞吐，代理成本在单条
   成本中趋近于零——**瓶颈只剩 Google 侧的风控容忍度**
### 12.20 fetcher v2 验证结果与字段获取模型定稿（2026-09-02）

v2 脚本（Layer1 listing 分页解析 + Layer2 place 详情）在 Portland 词上实测：

- **Layer 1 完全可用（生产级）**：depth3 = 3 页 / 9 秒 / 61 个地点 / 零失败。
  字段填充：title、fulladdress、latitude、rating、place_id 100%；website 85%、
  phone 70%；**kgmid 98%（listing 直出，无需详情页）**；review_count 仅 34%
  （listing 供给不全，需 Layer 2 补）
- **Layer 2 纯 HTTP 不可行（实证）**：place 页（按 fid 构造 URL，206KB）是 JS 空壳——
  APP_INITIALIZATION_STATE 里无任何地点数据（店名/城市字符串均不存在），数据由
  浏览器渲染后的内部调用注入。这正是友商官方宣称 "full browser environment" 的
  原因，也是 gosom 浏览器模式 place job 的设计依据
  （勘误与全变量矩阵复测见 §12.24：原提取器有取数深度 bug，修正后结论不变）

**字段获取模型定稿（修正 §13.3）**：

| 层 | 通道 | 字段 | 成本 |
|---|---|---|---|
| L1 | 内部 listing 分页（纯 HTTP，自研 fetcher） | 20+ 字段含 **kgmid**（实体最稳主键） | 5.3KB/条，便宜 30 倍 |
| L2 | **单店详情 RPC `/maps/preview/place`（纯 HTTP）**；gosom 浏览器渲染降为备选 | review_count 补全、claimed/owner 系、cid、ChIJ place_id | ~100KB/店、1.0–1.5s/店（§12.26 实证） |
| L3 | 官网访问 enrichment | emails + 社媒 ×6 | 竞品同样做成付费参数 |

**修正（2026-09-02 晚，实验 E2/E3）**：本节原「L2=浏览器渲染 place 页」的结论被
推翻——place 页 HTML 是纯配置壳（§12.24 全矩阵），单店详情的纯 HTTP 通道为
`/maps/preview/place` RPC，全字段直出已在生产代理环境复现（§12.26）。三层模型
保留，L2 通道以 §12.26 为准。

**修正**：kgmid 从「Layer 2 详情获取」移入 Layer 1（listing 直出，实测 98% 填充）。
本节的阶段性工程路线已被 §12.32–§12.34 继续收敛：L1 常规 pb 为主力分页，
浏览器级 pb 批量补 Owner/Claimed/Featured Image/About，`preview/place` 只补前两层
未覆盖的 fid；无需为补字段启动 gosom 浏览器 worker。L3 仍是独立官网 enrichment。
### 12.21 补充：Owner/Claimed 字段解剖修正（2026-09-02）

- **Owner 列是派生字段**：220 行中 218 行的 Owner = `店名 + " (Owner)"`（仅 2 个
  Starbucks 例外：店名 "Starbucks Coffee Company"、owner "Starbucks"）。真实增量
  数据只有 **Owner Id**（非空 200，与 Claimed=YES 精确一一对应）与 Claimed 本身
  （YES 200 / NO 20）
- 修正 §12.8 的归因：Buffalo 前 20 行**全部 Claimed=YES**；20 个 NO 分布在南佛州段
### 12.22 同城覆盖饱和度实验（Hollywood，4 查询变体，2026-09-02）

目的：验证同城市查询的「40 条/查询封顶」是服务端截断还是真实存量；量化同词重跑
与变体查询的边际收益。配置：同一地理（Hollywood, FL），4 个查询变体各 depth5。
完整数据：`e1_saturation.json`。

| 步骤 | 行数 | 新增唯一 | 累计唯一 |
|---|---|---|---|
| 基线 coffee shop in Hollywood, FL | 40 | 38 | 38 |
| + 同词重跑 | 40 | +8 | 46 |
| + coffee shop near Hollywood, FL | 40 | +2 | 48 |
| + cafe in Hollywood, FL | 40 | +8 | 56 |

结论：

1. **同词重跑也有 8 个新地点**（20% 方差）——Google 供给的非确定性再次实证
2. 查询变体边际递减：4 查询 160 行只换来 56 唯一（35%），同城市继续加变体收益
   快速衰减
3. **覆盖策略定稿：扩覆盖优先扩地理锚点**（新城市/街区），同城市变体仅作补充；
   40 条/查询的封顶接近该锚点下的实际供给，不是深度截断

### 12.23 L1 listing 字段填充率多词调查（2026-09-02，实验 E1）

背景：§12.20 的 review_count 34% 仅 Portland 单词 61 条样本；本轮量化「缺失面」。
配置：12 词（城市密度 × 品类 × 词式）× depth2（2 页/词）、Webshare 付费池、与
rpc_v2 相同取数位置；额外保存每词 review_count 命中/缺失记录的 `b[4]` 原始数组。
完整数据：`l1_fill_survey.json`（457 条全记录 + b4 样本 + `survey.log`）。

| 词 | n | review_count | rating | website | kgmid | phone |
|---|---|---|---|---|---|---|
| coffee shop in Portland, OR | 41 | **0** | 41 | 35 | 41 | 29 |
| restaurant in Manhattan, New York | 40 | **0** | 40 | 38 | 35 | 38 |
| plumber in Houston, TX | 40 | **0** | 40 | 39 | 40 | 40 |
| hotel in Miami Beach, FL | 40 | **0** | 40 | 40 | 38 | 40 |
| dentist in Austin, TX | 40 | **0** | 40 | 40 | 40 | 40 |
| gym in Chicago, IL | 40 | **0** | 40 | 39 | 39 | 38 |
| law firm in Denver, CO | 40 | **25 (62%)** | 40 | 39 | 40 | 40 |
| bakery in Seattle, WA | 40 | **20 (50%)** | 40 | 40 | 40 | 38 |
| barber shop in Los Angeles, CA | 41 | **0** | 41 | 36 | 41 | 40 |
| car repair in Detroit, MI | 40 | **0** | 40 | 17 | 40 | 40 |
| Restaurant near Alabaster, US | 40 | **0** | 40 | 36 | 40 | 39 |
| Restaurant near Ajo, US | 15 | **0** | 14 | 7 | 15 | 13 |
| **聚合（457 条）** | 457 | **9.85%** | 99.78% | 88.84% | 98.25% | 95.19% |
| （title/categories/lat/lon/timezone/fid 均 100%） | | | | | | |

发现：

1. **review_count 按词双峰**：12 词中 10 词 0%、2 词 50-62%；且 Portland 词昨日
   v2_final 34%（21/61）→ 今日 0/41——同一词跨会话不稳定，listing 供给不可依赖
2. **rc 命中与 `b[4][3]`「reviews 链接块」强关联**。命中记录 b4 含：

   ```
   b[4][3] = ["https://search.google.com/local/reviews?placeid=ChIJfb0Y...&q=law+firm+in+Denver,+CO&authuser=0&hl=en&gl=US",
              "1,981 reviews", null, "0ahUKEwi..."], b[4][7]=4.7, b[4][8]=1981
   ```

   缺失记录 b4 长度仅 8、非空只有 `[7]=rating`——rc 块整体缺席，不是取数位置错
3. **形态按响应切换，非按记录**：Seattle bakery 第 1 页 20/20 全有、第 2 页 0/20
   全无；Denver 两页均为部分命中（14/20、11/20）——响应级形态选择叠加记录级差异
4. 对照：竞品 220 条 reviews 填充 215/220（97.7%，`competitor_220.json`）——远超
   L1 listing 的可供给水平（本轮聚合 9.85%）

### 12.24 单店详情页纯 HTTP 可行性全变量矩阵（2026-09-02，实验 E2/E2b/E2c）

背景：§12.20 初测 place 页为 JS 空壳，但当时只测了单一请求形态；本轮穷尽客户端
变量，并对壳页做结构解剖。

- 实体 3 个（均来自 §12.23 数据）：den_hit（Bachus & Schanker，rc=1981 已知值可
  校验）、den_miss（Flatiron Legal）、por_miss（Drip Drop Coffee）
- 变体矩阵（16+4 次）：{data fid URL / slug+data URL / kgmid URL} × {跟随重定向} ×
  {consent cookies CONSENT+SOCS} × {Firefox / Chrome UA} × {Webshare 美国住宅 /
  服务器直连} × {curl 原生 / curl_cffi chrome124 / firefox133 完整 TLS 指纹模拟}
- 数据：`e2_place_http.json`、`e2c_tls.json`、壳页原文
  `scratch/e2-place-page/e2_shell_proxy.html`（206KB，不入 git）

结果（全矩阵一致，无一例外）：

1. 全部 HTTP 200、206-211KB；`APP_INITIALIZATION_STATE` 存在；其 `[3]` 下唯一
   payload 是 **1.9KB 配置载荷**，以 fid 开头（`[["0x876c...:0xb0d7...",null,[[661142...`），
   为视口/引导配置
2. **任何变体的页面都不含地点数据**：全文检索店名 / "1981" / "1,981" / kgmid /
   "Denver" 全部为 false（含已知 rc=1981 的 den_hit 实体）
3. 服务器直连（Hetzner 德国 IP）被 302 到 `consent.google.com` 同意墙（657KB 同意
   页）；美国代理出口无 consent 墙——地域差异，与数据有无无关
4. **TLS 指纹不改变响应形态**：chrome124 / firefox133 完整指纹模拟与原生 curl
   完全一致的配置壳
5. **勘误（修正 §12.20 提取器）**：payload 字符串实际位于
   `APP_INITIALIZATION_STATE[3]` 的元素位（第 5 位），§12.20 所用脚本在
   `[3][s][6/5]` 深一层找——取数深度 bug；修正后能取到该 1.9KB 载荷，但其中无
   地点数据，**结论不变**

机制定论（实测）：place 页初始 HTML 是 JS 引导壳；地点数据由浏览器 JS 启动后的
内部调用注入 app_state。已测全部客户端变量（URL 形态/重定向/cookie/UA/TLS 指纹/
IP 类型/地域）均不能使 Google 服务端在初始 HTML 直出数据。
（单店数据的纯 HTTP 通道另见 §12.26：`/maps/preview/place` RPC 实证可行。）

### 12.25 gosom 普通模式字段获取链路（源码定论，2026-09-02）

> 源码指纹调研（/tmp/gosom-src 基于 scrapemate v1.3.0），全部结论有 文件:行号。

1. **普通模式 = playwright chromium 渲染**：种子 GmapJob 浏览器打开
   `google.com/maps/search/<query>?hl=<lang>`，DOM 解析 `div[role=feed]` 提取 place
   链接（job.go:118-187）→ 每个 place 派生 PlaceJob：浏览器 Goto place URL →
   `page.Eval` 读 `APP_INITIALIZATION_STATE` → `EntryFromJSON` 魔法索引取值
   （place.go:154-212、305-327）
2. **review_count**：place 详情 JSON `darray[4][8]`（entry.go:389）。普通模式搜索
   阶段只从 DOM 提取链接、不从搜索响应构建 Entry——普通模式 rc 全部来自详情页
3. **Owner 三件套**：name=`darray[57][1]`、id=`darray[57][2]`（entry.go:477-480）；
   link 是**拼接构造** `maps/contrib/<id>`（482-484）。注意 cid（`jd[25][3][0][13][0][0][1]`，
   entry.go:420）是 place 的 customer id，不是 owner id
4. **fast 模式 owner 三件套恒空**：流水线在搜索后终止（searchjob.go:130 返回 nil
   下批 job），place job 永不生成；Entry 由 `ParseSearchResults` 填充，无任何
   Owner/cid 赋值。fast 模式 rc 来自搜索响应 `business[4][8]`（multiple.go:49）——
   **与 rpc_v2 同一取数位置**；plus_code 在 fast 模式是经纬度 OLC 本地编码
5. **请求配方**：gosom 全库无 `gl` 参数；place URL 不带 hl（place.go:157 用
   `GetURL()` 不拼 URLParams，搜索页用 `GetFullURL()` hl 生效）；无自定义
   header/cookie 注入，UA 为 jshttp 默认 Chrome/91；consent 靠渲染后页面内点击
   （job.go:279-302）；place URL 直接用搜索 feed 的 href（slug 形态）
6. 评论**列表**（非 count）：浏览器会话内 fetch `maps/rpc/listugcposts?authuser=0&hl=en&pb=...`
   （reviews.go:256，`credentials:'include'` 借用浏览器 cookie）

### 12.26 单店详情层纯 HTTP 定论：`/maps/preview/place` RPC（2026-09-02，实验 E3 + 外部源码调研）

**E3 生产环境复现**（Webshare 美国住宅轮换代理，uv/py3.13，`/data/gmaps-research`）：

配方：`GET /maps/preview/place?authuser=0&hl=en&gl=us&pb={模板}`。pb 模板取自
SurfSense `_PLACE_DETAIL_PB`（浏览器抓包后 generic 化；fid 注入 `!1m13!1s{fid}`，
EI session token 用 filler——**值不被校验**，实测通过）。headers 仅浏览器 UA +
`Accept-Language: en-US`；cookie `SOCS`（consent）+ `NID`。NID 由
`GET /maps?hl=en` 的 Set-Cookie 铸造（238 字符）；本轮铸造与使用出口 IP 不同
（rotate 代理）仍生效——非 IP 绑定。响应 `)]}'` XSSI 前缀 JSON，`jd[6]`=darray，
**与 gosom EntryFromJSON 同构**（rpc_v2.parse_details 直接复用）。

3 实体 × {无 NID / NID}，6/6 全 200：

| 实体 | 无NID 负载 | NID 负载 | rc（无NID） | rc（NID） | owner 块 |
|---|---|---|---|---|---|
| den_hit（rc=1981 已知值） | 97KB | 97KB | **1981 ✓ 与 E1 一致** | 1981 | 全有 |
| den_miss（Flatiron Legal） | 48KB | 105KB | 无 | **525** | 全有 |
| por_miss（Drip Drop Coffee） | 20KB | 166KB | 无 | **350** | 全有 |

字段实测（3 实体，全部填充）：title / fid / rating / **owner_name、owner_id** /
**cid** / **place_id（ChIJ…，L1 没有）** / kgmid / website / phone / borough /
street（d[183][1] 地址组件）。**NID 门控**：rc 与 price_range 缺 NID 时被裁剪
（den_hit 无 NID 也给 rc——门控非全量确定）；时延 1.0–1.5s/店，负载 ~100KB/店。

与 L1 对照（数据量级）：listing 5.3KB/条（20 条/页）vs 详情 ~100KB/店（1 店/请求，
字节 ≈19 倍、请求数 ≈20 倍/条）。L1 缺失的 rc 在 L2 一击补全（3/3）。

外部源码调研结论（与本地实验互证）：

1. **路径 A（/maps/place HTML 提取）已死**：本仓 E2 全矩阵（§12.24）+ gosom 历史
   fastmode 纯 HTTP 尝试被官方移除（issue #102「抓不全+易封」）+ conor extractor
   2026 仍在维护但只剩 4 个稀疏字段（cid/name/coords/place_id）
2. **路径 B（tbm=map 单店专用 pb）未找到可靠来源**；相邻事实：tbm=map 列表响应
   `entry[14]` 内嵌与详情同构的 darray，但不带 session-gated 字段（rc/分布/
   popular times）【SurfSense 自述 verified live】
3. **路径 C 配方双开源源**：SurfSense fetch.py（_PLACE_DETAIL_PB L241-265、
   _mint_nid L284、fetch_place_darray L325-339）+ parsers.py parse_place L300-382
   （完整位置表：hours 新 `d[203][0]`/旧 `d[34][1]`、about `d[100][1]`、星级分布
   `d[175][3][0..4]`、popular times `d[84][0]`、酒店 `d[35]` 等）；字段位置与
   gosom entry.go 双源一致
4. **未找到可靠来源的**：claimed 的独立下标（`d[57]` 非空判定仅正例实测，本轮
   3/3 均 claimed 形态，unclaimed 样本未测）；preview/place 的公开频率阈值；
   Outscraper 内部实现（确认不公开）。数据中心 IP 直封【SurfSense README +
   scrape.do 双源，与本仓 E2b 德国直连 consent 墙互证】
5. 配套线（本轮未实测）：评论列表 `listugcposts` 匿名已失效【公开确认】，
   现役替代 `GetLocalBoqProxy`（gosom reviews.go 2025-12 模板 / SurfSense 实现）

数据：`e3_preview_place.json`、原始响应
`scratch/e2-place-page/e3_denhit_nid_raw.txt`（不入 git）、服务端脚本
`/data/gmaps-research/scripts/e3_preview_place.py`。

### 12.27 L2 覆盖边界实验：覆盖率 / 一致性 / NID 门控 / claimed 信号（2026-09-02，实验 E4）

配置：Denver `law firm` 42 条（L1 rc 命中 25）+ Ajo 小镇 `Restaurant` 15 条（L1 rc
命中 0）。Denver 全量 L2 两遍（无 NID / 带 NID），Ajo 一遍（带 NID）；共 99 次详情
请求、345s、轮换代理。

| 指标 | Denver 无NID | Denver 带NID | Ajo 带NID |
|---|---|---|---|
| L1 rc 命中 | 25/42 | 25/42 | 0/15 |
| L1 缺失由 L2 补全 | 1/17 | **17/17 = 100%** | 14/15 |
| rc 双层同有时一致 | 25/25 精确相等 | 25/25 精确相等 | — |
| rating 双层一致 | 25/25 | 25/25 | — |
| owner_id 为空的店 | 0 | 0 | **4/15** |

结论：

1. **覆盖率**：L1 缺失的 rc，带 NID 的 L2 在 Denver 全量补齐（17/17）；Ajo 14/15，
   唯一未覆盖的「Ajo Cafe」在 L1 同样无 rating/phone——实体级退化（双层全缺），
   非覆盖机制失败
2. **一致性**：双层同时有 rc 的 25 条逐一精确相等（rating 同）——L2 补全不引入
   与 L1 的值冲突
3. **NID 门控实证**：无 NID 时 L2 对 L1-缺失实体的 rc 同样被裁剪（仅 1/17 有值），
   带 NID 解锁 16 个——L1 的 rc 缺失与 L2 无 NID 裁剪同源（session-gated 字段），
   NID 即稳定解锁手段
4. **claimed 信号修正（递进 §12.21）**：`d[57][1]`（owner_name）恒为「店名 (Owner)」
   展示位——Ajo 4 个 owner_id 为空的店 owner_name 仍在；**claimed 判定 =
   `d[57][2]`（owner_id）非空**，与竞品 220 条「Owner Id 非空 200 与 Claimed=YES
   一一对应」精确吻合。rc 与 claimed 无关（3 个未认领店 rc = 407/249/55）
5. 观察：「同词跨会话不稳定」按词而异——Portland 词 34%→0%（§12.23），Denver 词
   两日 rc 命中数值完全一致（25 条，1981/1681/1049…）

数据：`e4_l2_coverage.json`；服务端脚本 `/data/gmaps-research/scripts/e4_l2_coverage.py`。

### 12.28 L2 剩余字段位置实测：对标友商 36 列补完（2026-09-02，实验 E5）

配置：Denver 42 实体全量 L2（带 NID），42/42 解析成功、零失败、87s。对 §12.26/
§12.27 之外仅有位置表、无实测的 6 字段逐一验证（数据 `e5_field_completion.json`）：

| 字段（友商列名） | 位置 | 填充 | 样本 |
|---|---|---|---|
| Opening Hours | `d[203][0]`（新位，42/42；旧位 `d[34][1]` 0/42 已死） | **100%** | 结构化周时刻表（含日期） |
| Plus Code | `d[183][2][2][0]` | **100%** | `P2W6+X3 Denver, Colorado` |
| reviews_per_rating | `d[175][3][0..4]` | **100%** | `[140,8,14,47,1772]`，**加总=1981=rc 自洽** |
| Featured Image | `d[72][0][1][6][0]` | **100%** | googleusercontent URL |
| Review URL | `d[4][3][0]` | **100%** | `search.google.com/local/reviews?placeid=ChIJ…` |
| About（属性表） | `d[100][1]` | **100%** | 结构化 service_options 组 |
| Popular Times | `d[84][0]` | 66.7% | 按店有数据（真实分布或缺口未定） |
| About（描述文本） | `d[32][1][1]` | 0/42 | 待定性：位置过时或律所类目无描述 |
| Price Range | `d[4][2]` | 0/42 | 类目相关（E3 餐饮实体有 `$10–20`） |

**字段账（对标友商 36 列，忽略社媒/emails）**：除上表 3 个待定性项外全部有实测
数据支撑——Name/Fulladdress/Street/Municipality(`d[183][1]`)/Categories/About(属
性表)/Phone/Owner 三件套/Review Count(NID)/Average Rating/星级分布/Review URL/
Cid/Fid/Lat/Lon/Featured Image/Time Zone/Website/Opening Hours/Google Maps URL
(cid 构造)/Place Id/Kgmid/Plus Code/Claimed(`d[57][2]` 非空)。质量口径：rc 与 L1
精确一致（§12.27 25/25）、星级分布加总=rc、claimed 对应关系与竞品 220 条吻合。

待定性 3 项→已收敛 2 项（见 §12.29）：description 位置经名店验证**存活**；
popular_times 66.7% 的真实分布 vs 抓取缺口仍待与友商对拍。另「同词同地理 vs
友商」端到端全字段对拍实验（尚未做）。

### 12.29 L2 并发度实测与 description 定论（2026-09-02，实验 E6/E7/E8）

**E6 并发阶梯**（Denver 42 店，共享单 NID，轮换代理，`e6_concurrency.json`）：

| 并发 | 墙钟 | 成功 | 数值漂移 | 吞吐 |
|---|---|---|---|---|
| 8 | 10.6s | 42/42 | 0 | 237 店/分 |
| 16 | 7.8s | 42/42 | 0 | 324 店/分 |
| 32 | **3.0s** | 42/42 | 0 | **854 店/分** |

零失败、零验证码、rc 值与单遍基准逐一相等。注：三档连续跑同一批 fid，后档可能
受益 Google 侧缓存，3.0s 含缓存效应；并发可行性本身（无封无错无值漂移）成立，
恒定吞吐需独立 fid 集复测。对照：串行 E5 同批 87s（≈29 店/分）。

**E7/E8 description 定论**：`d[32][1][1]` 位置**存活**——Katz's Delicatessen
（rc=54977）返回完整描述 "No-frills deli with theatrically cranky service
serving mile-high sandwiches since 1888."。此前 Denver 律所 0/42、Ajo 餐饮 0/11
（`e7_restaurant_desc.json`）是样本实体本身无描述，非抓取缺口。SurfSense 与
gosom 同用此位，三方一致。

**同批发现（原始响应解剖，`scratch/e2-place-page/e3_denhit_nid_raw.txt`）**：
多值电话在 `d[178][0][1]`（主号 + 备选格式列表 `["(303) 222-2222",1],
["+1 303-222-2222",2]`，对齐友商 Phones 多值列）；图片数组在 `d[171][0]`
（含多图 URL，对齐友商 Images 列）。

### 12.30 竞品 36 列实锤与我方逐列覆盖（2026-09-02，源码级调研）

竞品云端导出器源码实锤（`gmapsextractor.com/dashboard/assets/csvExport.3af77208.js`
的 `exportFields` 数组，恰 36 列）+ Postman 官方 v2 响应示例（20 条真实记录）交叉
验证取值格式。**其中 Emails + 6 个社媒 Links 共 7 列是付费字段**（与「忽略社媒」
口径吻合），免费核心 = 29 列：

| # | 竞品列名 | 我方来源 | 状态 |
|---|---|---|---|
| 1 | Name | L1/L2 `d[11]` | ✓ 实测 |
| 2 | Fulladdress | L1 聚合 / `d[18]` | ✓ 实测 |
| 3 | Street / 4 Municipality | `d[183][1][0..6]` 地址组件（城市/邮编/州拆分） | ✓ 位置实测（组件级） |
| 5 | Categories | `d[13]` | ✓ 实测 |
| 6 | About（属性组） | `d[100][1]`，格式「组: [值列表]」 | ✓ 42/42 |
| 7 | Phone / 8 Phones 多值 | `d[178][0][0]` / `d[178][0][1]` 备选格式 | ✓ 结构实测 |
| 9 | Claimed（YES/NO） | `d[57][2]` 非空 → YES | ✓ 与竞品 220 一一对应验证 |
| 10-12 | Owner / Owner Id / Owner Link | `d[57][1]` / `d[57][2]` / 拼 `maps/contrib/{id}` | ✓ 实测 |
| 13 | Review Count | `d[4][8]` + NID | ✓ 覆盖 17/17+14/15 |
| 14 | Average Rating | `d[4][7]` | ✓ 25/25 双层一致 |
| 15 | Review URL | `d[4][3][0]`（与竞品格式逐字符同构） | ✓ 42/42 |
| 16-17 | Cid / Fid | `jd[25][3][0][13][0][0][1]` / `d[10]` | ✓ 实测 |
| 18-19 | Latitude / Longitude | `d[9][2]` / `d[9][3]` | ✓ 100% |
| 20 | Featured Image | `d[72][0][1][6][0]` | ✓ 42/42 |
| 21 | Time Zone | `d[30]` | ✓ 100% |
| 22-23 | Website / Domain | `d[7][0]`（竞品存无协议头形态）/ 域名截取 | ✓ 实测/构造 |
| 24 | Opening Hours | `d[203][0]`（「星期(日期): [时段]」7 天结构，非 JSON） | ✓ 42/42 |
| 25-26 | Google Knowledge URL / Kgmid | 构造 `google.com/search?kgmid=` / `d[89]`+walk | ✓ 构造/实测 |
| 27 | Google Maps URL | 构造 `maps?cid=` | ✓ 构造 |
| 28 | Place Id | `d[78]` | ✓ 实测 |
| 29 | Search Keyword | 任务输入词 | ✓ |
| — | Emails + 6×Links（付费 7 列） | L3 官网 enrichment 线（豁免口径） | 线外 |

**格式对齐注意**（复刻竞品取值形态）：Claimed 用 YES/NO；Owner 固定「店名
(Owner)」后缀；Website 无协议头；Opening Hours 带 7 天具体日期；Google Knowledge
URL 是 `search?kgmid=`（非 maps）；Categories/多值列拼接符云端样例未见（插件版为
`, ` / `,`）。

**勘误**：此前文档片段列的「Popular Times」不在竞品当前云端 36 列中（导出器源码
与 Postman v2 均无）；About/Description 云端不分列、无 Images/Price Range/Plus
Code 列。Popular Times 66.7% 填充的定位随之从「字段缺口」降级为「非竞品列」。
插件版（DOM 版 v2.5.1）另有 Description/Note/Amenities/Hotel Class 列，云端无。

### 12.31 APP_INITIALIZATION_STATE 更新机制定论（2026-09-02，真实浏览器第一手观测）

> Kimi WebBridge 驱动真实 Chrome + 网络捕获 + 页内 performance 时钟 + 页内
> write-spy（Proxy/getter-setter 钩子）。证据 49 文件：`scratch/ais-research/`
> （不入 git）。与 §12.24/E3 的服务端实验互证闭环。

**因果链（place 页，页内相对时钟两次实测）**：

1. **t=0 服务端**：HTML 内联 app_state 引导壳全 36KB；place 域 `A[3]` 是 6 元素
   数组 `[null×5, str1934]`——即 §12.24 解剖过的 1.9KB mini-payload
2. **~1.4s Maps boot JS**（主文档仍在流式解析、load 事件之前）携带 fid+视口发起
   **一次** `/maps/preview/place` RPC（782ms，压缩传输 21.9KB）
3. **~2.2s RPC 回调**：响应体**原文**（含 `)]}'` 前缀）整体作为字符串写入
   app_state——实测落点 `A[3].og[6]`（99,009 字符），**SHA-256 与网络响应体逐字节
   一致**（连前缀和尾部换行都未动）；boot 同时把 `A[3]` 从数组改写为 `{og:[...]}`
   包裹结构并解析填充 og[0..4]
4. **此后整个 SPA 生命周期不再写 app_state**：点击结果/滚动/打开评论区，write-spy
   零写入、零新 RPC——它是**每次文档加载一次性写入的启动数据通道**，运行时数据在
   框架内部 store
5. **gosom 时点**：等 DCL+URL 稳定后读，恰在第 3 步之后 → 全量可读；其 JS 探针
   遍历 `A[3]` 各子项的 6/5 位，正好兼容数组（早期）与 `{og:[...]}`（boot 后）两种
   形态

**分项观测**：

- **rc 非懒加载**：rc=1981 在 og[6] pos=481（近头部），随 preview/place 首屏一次
  注入；首批评论正文同在 og[6]；点击 More Reviews 后 app_state 长度恒定、
  listugcposts 零调用（该交互走框架 store）
- **SPA 点击结果**：同一文档未刷新，被点 place 的数据**早已在搜索页 boot 时的
  app_state 里**（608KB payload 含全部 8 条结果，og[3]）——面板直接消费存量，无新
  请求；直接导航 place href 则整页 reload、app_state 从头重建。注：该搜索页 boot
  载荷的原始响应体未被捕获（≈76KB/条，远富于我方 L1 的 5.3KB/条），**是否含
  review_count 未验证**；若含，即 §12.23「富变体」现象的浏览器侧同源证据
- **列表翻页**：观测页（law firm in Denver）feed 仅 8 条滚不动，未能制造真实翻页
  对照；方向性证据（T3/T5）为列表数据不进 app_state（限制如实记录）。
  **补充实测（2026-09-03，主agent）**：Portland 词（多结果）boot 后 app_state
  842KB 含 **26 个不同 fid，而 DOM feed 只渲染 6 张卡**——boot 嵌入量 > UI 渲染量；
  程序化 scrollBy 无法触发真实翻页（scrollTop 卡死，isTrusted 墙），「第 2 页起是
  否进 app_state」仍无直接对照，但 write-spy 的运行时零写入 + 一次性机制强烈指向
  后续批次进框架 store
- **异常**：快速连续程序化导航会拿到未解析的降级空 place 页（og[6] 仅 4.3KB 且无
  preview/place 请求）

**对本仓的含义（数据性结论）**：我们 preview/place fetcher 与浏览器 boot 发的是
**同一个请求**——浏览器渲染路径相对纯 HTTP 无任何增量数据；app_state 是一次性
启动通道，不存在「渲染更久能拿到更多」的机制。gosom 浏览器模式的全部价值就是
替你执行了这一次 RPC。

### 12.32 批量通道定论：搜索页 app_state 来源 + NID 解锁 L1 批量 rc（2026-09-03，E9/E9b/E10 + 浏览器取证）

**搜索页 app_state 来源（浏览器取证，SHA-256 同源验证）**：boot 期间唯一数据请求
是 `search?tbm=map`（**与我方 L1 同端点**；浏览器 pb 以 `!1s{query}` 开头、`gl` 跟
随出口 IP）。响应体 350,621 字符，app_state `A[3].og[2]` 与之 **SHA-256 逐字节
一致**。即：place 页 ← 一次 `preview/place`，搜索页 ← 一次 `search?tbm=map`——
app_state 的两个域都来自我方已在用的两个端点。浏览器响应含 20 个
`local/reviews?placeid` 块与「1,981 reviews」格式化文本——**浏览器会话拿到的是
富变体，rc 随列表批量下发**。

**E9/E9b：NID 是会话门控的唯一变量（决定性）**。同一 fetcher、同一 pb，仅差
cookie：

| 词 | 无 cookie | SOCS+NID |
|---|---|---|
| coffee shop in Portland（此前两次 0%） | 0/40 | **40/40** |
| restaurant in Manhattan | 0/43 | **40/40** |
| bakery in Seattle | 0/40 | **40/40** |
| plumber in Houston | 0/40 | **40/40** |

共 155 个共同 fid，无真实值冲突（差异全部是 null→有值）。E9 Denver 单词同日
无 cookie 78% / 仅 SOCS 68% / +NID 100%——**§12.23 的「按词双峰/跨会话不稳」
就是无会话时的裁剪随机性，NID 池彻底消除**。

**E10：L1+NID 富变体的批量字段清单**（Denver 60 行解剖，`e10_l1nid_extended.json`）：

- **随列表批量下发**：rc 54/60（本轮）、**Place Id `b[78]` 60/60**、
  **Opening Hours `b[203]` 60/60**、Street/Borough `b[183][1]`、Kgmid、Review URL
  （随 rc）、Time Zone、Website、Categories、Phone——均为此前认为需要 L2 的字段
- **listing 始终没有**：Owner 系（`b[57]` 0/60）、Cid（`jd[25]` 路径不存在）、
  Plus Code、星级分布、Featured Image、Popular Times、Price、About 属性
- **Cid 免费构造**：`cid = int(fid.split(':')[1], 16)`——3 实体与 L2 实测值精确
  一致（12742658851072361065 / 9813097217250269993 / 835930047526441365）

**对竞品 29 免费列的阶段性结论**：22 列可由 L1+NID 批量获得；剩余 6 列
Claimed/Owner/Owner Id/Owner Link、Featured Image、About 在常规 pb 中缺席。星级分布
不在竞品 29 列中。后续 §12.33 证明这 6 列可用浏览器级 pb 批量获得，无需对全量商家
逐店请求 L2。

数据：`e9_l1_nid.json`、`e9b_l1_nid_multi.json`、`e10_l1nid_extended.json`
（+原始响应 `e10_l1nid_p1/p2.txt`）。

### 12.33 批量 owner/claimed 定论：浏览器级 pb + NID（2026-09-03，E11 系列）

浏览器搜索响应（350KB/20 条）里发现 owner 块（`(Owner)` ×20、已知 owner_id
`117921637462099317974` 命中）——**owner 是否随列表下发由 pb 的字段选择决定**，
我方常规 pb 不请求该 feature，浏览器 pb 请求。提取浏览器完整 URL
（`search?tbm=map&pb=!1s{query}!4m8...`，2482 字符）在服务器复现：

- 响应结构与常规 pb 不同：business 块位于 `$[64][i][1]`（常规 pb 在
  `data[0][1][i][14]`），递归按「title@11 + fid@10」定位
- **E11d 全量统计（NID，单请求 20 店）**：**owner_name 20/20、owner_id 20/20**、
  place_id 20/20、**Featured Image 20/20**、**About 属性 20/20**、hours/street/
  phone/categories/lat/tz 20/20、rc 14/20、**星级分布 0/20**
- 无 cookie 同 pb 也能拿到（268KB）——owner 不属于 session-gated 裁剪范围

**最终分层（竞品 29 免费列）**：

| 通道 | 覆盖列 | 成本 |
|---|---|---|
| 常规 pb + NID（`!7i20!8i{offset}` 可深分页） | rc 100%、Place Id、Opening Hours、Kgmid、街道组件 + 基础列 | 1 请求/20 条 |
| 浏览器级 pb + NID | **Claimed/Owner 三件套**、Featured Image、About、Place Id 等（rc 70% 互补） | 1 请求/20 条 |
| preview/place 逐店 | 仅剩**星级分布**（及单店核验） | 按需 |

即：owner/claimed 批量成立，claimed = 批量 owner_id 非空判定。浏览器级 pb 的独立深分页
参数未验证；后续 §12.34 采用「常规 pb 深分页 + 浏览器级 pb 单次自适应补覆盖」，
实测 Claimed 覆盖 90.7%–91.9%；生产时对未覆盖 fid 再调 `preview/place` 补齐。

数据：`e11d_browser_pb_fill.json`；脚本 `e11_browser_pb.py`/`e11c_walk.py`/`e11d_fill.py`。

### 12.34 新架构 500 词压测终报（2026-09-03，双 pb 批量 + NID 池 + 抽样 L2 → 竞品 36 列 CSV）

配置：500 词（`Restaurant {城镇}, US`，test-keyword2.txt 前批）× 深度 10 页 ×
6 线程；每词 = 常规 pb 窗口分页（`!7i20!8i{offset}`，NID 池 3 张轮换）+ 浏览器级
pb 单次全量（按 fid 重合度自适应放大重试）+ 抽样 3 店 preview/place（星级分布）；
curl + gzip；页间 0.8s、重试 3。产物：每词独立 CSV（竞品 36 列顺序，社媒 7 列留空）
+ 每词 JSON + summary.json。

**总表（36.3 分钟，零失败词）**：

| 指标 | 数值 | 占比 |
|---|---|---|
| 关键词 | 500/500 成功 | 100% |
| 记录总数 | 21,965 | — |
| Review Count | 21,484 | **97.8%** |
| Place Id | 21,965 | **100%** |
| Opening Hours | 19,617 | 89.3% |
| Claimed 判定覆盖 | 19,925 | **90.7%**（其中 YES 17,715 / NO 2,210） |
| Owner Id（=Claimed YES） | 17,715 | 80.6% |
| 星级分布（抽样 L2） | 1,252 次调用 | 3 店/词样本口径 |
| 流量 | **387.5MB（0.78MB/词）** | — |
| 请求 | ~7,400（常规 5,000 + 浏览器 1,160 + L2 1,252） | browser_fail 0 |

吞吐：13.8 词/分钟、605 条/分钟（§12.19 为 16.9 词/分、2,031 条/分——本版多
owner/claimed/hours 等字段与逐店抽样，换取 29 列全 schema）。

**传输经济学（v1→v2，同 500 词口径）**：v1 中途实测 60MB/词（预算 30GB）→ 根因
三个：`!7i` 误作偏移导致 O(n²) 重复下载（正确偏移在 `!8i`）、curl 未开 gzip
（实测同页 420KB→41KB，10.2 倍）、NID 富变体单条 21KB（4 倍，字段增多的固有成
本）。修复后 **0.78MB/词——比 §12.19 纯 L1（1.06MB/词）还低 26%，且交付 29 列**。

**已知边界**：Claimed 覆盖 90.7%（自适应重试 4 次封顶后仍有 9.3% 词内 fid 未被
浏览器通道覆盖，可加二次补偿轮）；hours 89.3%（部分实体 Google 不下发）；本次
代理零验证码零封锁，规模化风控阈值仍未测。

**batch1000 复测（同日，第 501–1500 词，78.8 分钟）**：1,000 词仅 2 失败（0.2%），
44,831 条；rc **97.98%**、Place Id 100%、Claimed 覆盖 **91.9%**（YES 81.2%）、
hours 89.4%；流量 842.7MB（0.84MB/词）、browser_fail 0。与 batch500 全指标一致
——**速率与质量在 2 倍跑量下无衰减**。两轮累计 1,500 词 / 66,796 条，全程零验证
码零封锁。数据：`stress_batch1000_summary.json`；全量 CSV/JSON 在服务器
`/data/gmaps-research/stress/batch1000`。

数据：`stress_batch500/summary.json` + 样本 CSV；全量产物 87MB
`scratch/stress_batch500/`（本地）与服务器 `/data/gmaps-research/stress/batch500`；
脚本 `/data/gmaps-research/stress_test.py`。

生产补齐策略可由该批次直接推导：batch1000 的浏览器级 pb 平均未覆盖
4.13 店/有结果词，而实验已为星级分布抽样平均调用 L2 2.87 次/有结果词。生产不输出
星级分布，因此将「抽样 L2」替换为「未覆盖 fid 补齐」后，平均仅净增约 1.26 次
请求/词，即可补齐 Claimed/Owner/Featured Image/About。个别高密度词缺口可达
121 店，所有 L2 请求仍必须走调用进程共享的出站并发闸门。

### 12.35 ll 坐标偏置定论：视口块注入精确生效（2026-09-03，E12/E12c–f 系列）

**机制**：`search?tbm=map` 请求 pb 的**视口块** `!4m12!1m3!1d{直径米}!2d{lng}!3d{lat}` 即竞品 `ll`（`@lat,lng,zoomz`）的注入位；浏览器级 pb 的同构坐标块（`!4m8` 之后的 `!1d!2d!3d`）同理。zoom→直径按 Web Mercator 换算（zoom 14 城区 ≈ 20km 直径已够城市级锚定）。

**E12c/E12e（711 住宅 sticky 三出口受控实验，裸词 coffee shop）**：

| 出口（ip-api 实测） | 注入视口 | 结果重心 | 命中 |
|---|---|---|---|
| Costa Mesa, CA (AT&T) | Portland | (45.522, -122.678) | ✓ 距注入点 <100m |
| Perry, GA (Windstream) | Portland | (45.522, -122.678) | ✓ |
| Ridgeland, SC (PRTC) | Miami | (25.795, -80.199) | ✓ |
| **Kailua-Kona, HI**（4000km 对照） | Portland→Miami 交替 ×2 轮 | 精确随视口切换 | 8/8 |

- 结果地理 100% 锚定视口、完全不跟出口走（夏威夷出口拿到 Portland 店：Stumptown/Coava 等真实本地店）；同会话内 portland→miami 交替完全可重复；NID 有无不影响。
- **两路一致**（E12f，生效态 canary 后对拍）：常规 pb 与浏览器级 pb 同视口的结果重心几乎重合（Portland 45.523/-122.68 vs 45.520/-122.675），fid 集合 jaccard 0.05–0.08——与两路已知字段/排序差异一致（互补非镜像，§12.33 生产策略不受影响）。
- **新失效模式（E12d 反例）**：个别 sticky 会话遭遇 Google **软降级**——HTTP 200 正常返回、但视口被静默忽略、结果回退出口地理（Baton Rouge 出口→Baton Rouge 结果）。Webshare 机房 rotate 出口下更常见（E12 v2 重心漂移）。生产必须带 canary 检测（如以已知城市视口校验结果 bbox）。
- 勘误 §12.12/§12.13：「裸词 100% 跟出口 IP」的旧结论实为「无数据小视口（内布拉斯加 3.8km 农田）下的回退行为」；城区坐标视口下出口不参与地理锚定。竞品「出口 IP 漂移带动结果漂移」（§12.13）同样应重新归因于其 ll 未传时的回退路径。
- **产品定论**：`ll` 可作为一等地区参数接入 HTTP Provider（13.2 的 B2 前置实验完成）；文本地名与视口同时提供时按 §12.15/§12.17 文本优先。

数据：`e12_ll_bias.json`、`e12c_ll_sticky.json`、`e12e_ll_decide.json`、`e12f_ll_pair.json`；脚本 `scripts/e12_ll_bias.py`、`e12c_ll_711.py`、`e12e_ll_decide.py`、`e12f_ll_pair.py`。

### 12.36 Reviews 通道定论：GetLocalBoqProxy 全量可行（2026-09-03，E13/E13b）

配方源：SurfSense `fetch.py`/`parsers.py`（配 google-maps-review-scraper npm 的位表）；gosom 最新版仍走浏览器内 `listugcposts` fetch（纯 HTTP 已死确认）。

**配方**：`GET www.google.com/httpservice/web/PrivateLocalSearchUiDataService/GetLocalBoqProxy?msc=gwsrpc&hl=en&reqpld={json}`。reqpld：`[null,[null×9,[12 槽 inner]]]`，`inner[1]=排序码`（1=relevant/2=newest/3=highest/4=lowest）、`inner[9]=页大小`（请求 100 实得 60）、`inner[11]=[fid]`；翻页时 inner 扩至 20 槽、`inner[19]=上一页 token`。

**E13/E13b 实测（den_hit rc=1981、por_miss rc=350，Webshare rotate）**：

| 项 | 实测 |
|---|---|
| cookie 门控 | **无**——无 cookie 与 SOCS+NID 结果完全一致（11/11 请求零失败） |
| 页大小 | 60 条/页（请求 100 封顶 60，SurfSense 上限注释实证） |
| **全量翻页** | den_hit 34 页 = **1981/1981 与 L2 rc 精确自洽**；por_miss 6 页 = 350/350；翻页零重复 |
| 排序正确性 | newest 严格时间递减（180 条单调）、highest 全 5★、lowest 全 1★、relevant 混合 |
| 排序稳定性 | 同排序两遍请求 id 序列完全一致（120/120） |
| 时延 | 1.0–1.2s/页；全量 1981 条 ≈ 40s |
| 字段 | review_id、绝对时间戳（ms→ISO）、相对日期、作者+评论数+Local Guide、星级、原文/译文/语言、**商家回复**（den_hit 98% 有回复，律所主动回复形态）、评论图片、origin=Google、guided 评分块（r[30]，本轮样本实体无数据，位表存疑待产品化时核） |

**产品定论**：Reviews API 可承诺——全量（以 rc 封顶）、四种排序、商家回复、时间戳；单店全量成本 ≈ ⌈rc/60⌉ 次 RPC。远超 gosom ~300 条/店上限。旧 `listugcposts` 匿名失效结论不变，此通道为现役替代。

数据：`e13_reviews_boq.json`、`e13b_boq_full.json`；脚本 `scripts/e13_reviews_boq.py`、`e13b_boq_full.py`。

### 12.37 Photos 通道定论：浏览器翻页打通、纯 HTTP boot cursor 未打通（2026-09-03，E14）

**preview/place 匿名侧（服务器实验）**：`d[37][1]`=相册总数（den_hit 48 / por_miss 263）；`d[171][0]`=分类 tab（por_miss 13 个：All/Latest/Videos/Menu/Food & drink/Vibe/Iced coffee/.../By owner/Street View & 360°），每 tab 仅 1 张缩略图 + 2 张 hero，全响应可提 URL 仅 10–38 张——匿名 preview/place 覆盖不了相册（与 SurfSense 自述一致）。pb `!3i20` 参数与 photos 数量无关（20/100/300 三变体响应逐字节同长）。跨会话两次请求 tab/URL 序列完全稳定。

**真实通道（浏览器取证，Kimi WebBridge + 页内 fetch 重放）**：现代 Maps 相册走 **`POST /maps/_/MapsWizUi/data/batchexecute?rpcids=hspqX`**（非老的 `listentityphotos` GET；Apify 老方案的 listentityphotos 已非现役入口）。请求模板与响应结构见 `e14_hspqx_req_sample.md`：

- reqpld 为 JSON 字符串：`payload[2][0]`=fid、`payload[4][2]=[null,20,null,null,1]`=**数量参数**（20→500 实测 23→**156 张唯一**；1000/5000 封顶 156）、`[[[2]],[195,195],20]`=缩略图规格；需 `at` XSRF token（页面颁发）。
- 响应：`[0]`=照片扁平数组（URL 可改尺寸、原始分辨率、GPS、上传来源 bizbuilder:gmb_ios / photos:gmm_android_review_post、上传日期、owner uid+cid）；`[12]`=13 个 tab 块（state_b64 + tab_token + 代表照）；`[5]`=1394 字符 base64 游标。
- **对拍**：单响应 156 张 = preview/place 总数 263 的 59%（263 口径含视频帧/Street View panoid）；单次批量已 > 竞品 Photos API 每页 20 的 7 页。
- **未破解**：翻页——tab_token 与完整游标回填 payload[5] 均返回同批（overlap 156/156）；剩余 ~40%（Latest 段旧图为主）的续页槽位未定位。UI 相册 feed 滚到底不再发请求（首响应即 feed 全量供给）。

**E14b 服务端匿名复现（2026-09-03 追加，curl_cffi chrome124 + Webshare）**：结果**失败**，且定位到根因是**登录态门控**——

- 服务端链路：GET 壳页（207KB，200）→ 提取 XSRF 候选 → POST batchexecute 全形态对齐，全部 `400 [["er",...,3]]`（INVALID_ARGUMENT）。
- 对齐过程排除了请求结构因素：payload 与浏览器捕获**逐字符 diff** 后完全一致（中途两处手抄括号层差异修复后仍 400）、URL 全参数（source-path/_reqid/rt=c）、Origin/Referer、at 编码形态均排除；at 有无、原生 curl vs chrome124 TLS 指纹结果一致（400 非 TLS 敏感）。
- 根因证据：匿名壳页 `SNlM0e`（batchexecute XSRF）为**空**——Google 不给匿名会话颁发有效 at；壳页另一 token `Tu8Y1b`（形同 `xxx:timestamp`）不获接受。浏览器侧重放成功恰因该会话有 Google 登录态（有效 XSRF + 登录 cookie）。SurfSense 源码注释独立佐证："scraping thousands of photos would need the **signed-in** photo-listing RPC"。
- **未登录浏览器对照（Edge 全新 profile，Kimi WebBridge 实测，2026-09-03 两轮）**：
  - 首屏：gallery 打开显示 12 张（2 hero + 每 tab 1 缩略图），**零 hspqX 请求**——首屏数据内联在主 HTML（Edge 版 537KB，含 19 个 gps-cs-s URL；服务端匿名 curl 拿到的壳页仅 205KB、零 photos 数据=降级壳）。
  - **翻页可用**：继续翻页时前端发 hspqX（`[null,20,"<游标>",null,1]` 形态、**无 at**、body 以 `&` 结尾）→ **200、每页 ~32 张**。登录态门控假设**被推翻**。
  - **真门控 = boot 游标**：翻页请求的数量槽第三位携带会话游标（响应 payload[5] 回填到下页请求）；无游标的首屏形态一律 400 er/3（页内消融 C 证实：同 URL 同 cookie，带游标 200 / 无游标 400）；跨会话移植游标也 400（E14c：Edge 游标在 Webshare 会话发 → 400，游标与获得它的会话绑定）。
  - 登录 Chrome 首开 gallery 即发 hspqX（23 张）与未登录 Edge 首开零请求的差异，源于登录态 boot 载荷不带 photos，与批量通道权限无关。
- d[37][1] 口径勘误：263 是**媒体条目数**（含视频帧与 Street View panoid），不是照片总数；157 张批量响应同样含视频/街景条目（CIHM*/panoid 前缀）。

**E14c–k 服务端穷尽复现（2026-09-03，全部 400）**：Edge 对照照亮全部配方后，服务端做了单变量穷尽——payload 与 Edge 成功请求**逐字符一致**（无游标首翻 495B 与带游标翻页形态均试）；URL 全参数与简化形（页内消融证 URL 无关）；cookie 搬运 Edge 全套（SNID/AEC/NID/STRP，HttpOnly 经 CDP 提取）；同 IP sticky（711 住宅，preview/place 与 hspqX 同出口同 cookie 会话流）；Sec-Fetch-*/Accept 全套浏览器头；curl_cffi chrome124/131/edge101；真 Chromium headless 与 headful(Xvfb) 页内 fetch（真浏览器网络栈）；去 `navigator.webdriver` stealth——**全部 400 er/3**。同期用户日常 Edge（未登录）页内 fetch 一路 200（重放、翻页均通）。

**E14m 终局突破（2026-09-04，门控实锤 + 自动化打通）**：「会话信誉」假设被最后一组对照实验推翻并定位真因——**门控 = 真实用户交互标记**。三段对照：① Edge 冷 reload 后（无任何交互）页内 fetch 首翻 → **400**（此前 Edge 200 的全部场景都发生在用户真实点击/翻页之后）；② Edge 内用我们 PLACE_PB 响应的游标发 hspqX → 400（旧 pb 形态的游标 hspqX 不认，有效游标须来自交互后的原生请求链）；③ **headful stealth Chromium（服务器直连 IP、无登录）+ playwright trusted 点击「See photos」（CDP Input，isTrusted=true）→ 浏览器原生 hspqX 200（27 张），trusted wheel 滚动翻页第二页 200（31 张）**——全自动化、无登录、机房 IP 直接打通。

**E15 终局（2026-09-04，标记载体定位 + 纯 HTTP 方案成立）**：E15a 在 headful 会话内对「点击前/后」做请求级 diff（cookie 快照、原生 payload、请求头全量捕获）——点击后原生请求仅多出 `x-maps-diversion-context-bin: CAE=` 与 `x-same-domain: 1` 两个头，cookie 零变化；但删减矩阵证明**这两个头可删、cookie 才是必需**：同 payload 同头下，「点击后的 cookie」→ 200/27 张，「新 mint 的 SOCS+NID」→ 200 空响应。**门控载体 = Google 服务端按 cookie 会话（NID 等）记录的交互状态**——trusted 点击改变的是服务端会话状态，不改变任何请求可见特征。由此：
- headful worker 只需**一次性点击**（养会话）→ 导出 cookie → **curl 纯 HTTP** 即可全量拉取。
- **E15f 纯 HTTP 全量翻页实测**：字节级模板（首翻 body 上替换游标位）连续翻 **12 页全部 200、累计 232 个唯一媒体条目**（与浏览器 E14n 完全一致），每页 20 个完整照片对象（lh3 URL + 原始分辨率 + 上传来源/日期）；13 页起游标耗尽开始重复（停止条件=唯一数不增长）。263 与 232 差值=视频/Street View 条目。
- **E15e 跨 fid 复用**：同一会话的 payload 会话串（如 `V0qaauHHJ9Gsi-gPn6GLQQ`，页面加载时生成、会话级有效）+ cookie 不变，字节级替换 fid/kg → 另一商家相册 200/20 张。**一次养会话，多店批量纯 HTTP**。
- 工程形态：混合架构——少量 headful 会话养护（点击一次/会话）+ 大量纯 curl 采集（跨 fid 复用）；比纯浏览器 worker 成本大幅降低。
- **E16d 出口无关实证（同日）**：同一新鲜凭证包在 {直连, Webshare rotate（每请求换 IP）, 711 sticky} 三出口全部 200/27 张——**交互标记与出口 IP 零关联**，轮换代理直接可用，养护与采集无需同出口。此前 E16 的 100 连败归因为凭证过期（会话串为页面加载时一次性值），非代理因素。

**E17 静态代理全生命周期定稿（2026-09-04，用户静态出口 154.30.1.52 Ashburn）**：
- 养护：headful Chromium 经 gost 本地桥（`socks5://127.0.0.1:1080` → 静态代理，解决 chromium 不支持 socks5 认证）完成交互，凭证包（cookie+原生 body+头）导出。
- **E17a 交叉采集全绿**：凭证包在 {静态代理 socks5/http、本地桥、直连、Webshare rotate、711 sticky} 全部 200/27 张。
- **E17c 100 连测全过**：原生 body 字节级替换 fid/kg，静态代理连拉 100 个不同 fid（Portland/NYC/Houston 多城市），**100/100 OK、每店 13-32 张、1.3s/req、零失败**——单会话 ≥100 店无衰减。之前 E16 的 100 连败确认为自构造 payload + 过期凭证双因，与代理无关（「自构造 payload 必 400」铁律第 3 次应验——工程实现必须走原生 body 字节级替换）。
- **E17d 寿命探针（进行中）**：每 30 分钟用同一会话拉新店，3 连空判死，最长观测 48h；数据 `e17d_lifetime.json`。
- 生产配方（全部实测）：① gost 桥（常驻）→ ② headful 点击养护（15s/会话）→ ③ 凭证包导出 → ④ curl 字节级替换批量采集（~1.3s/店）→ ⑤ 唯一数不增长即翻页终止。
- 注意实现细节：payload/游标必须**字节级替换**（decode→re-encode 会因转义差异 400）；停止条件用「唯一 id 数不增长」（游标在耗尽后仍返回）。
- 数据：`e15a_native_reqs.json`（点击前后原生请求全量头+payload）、`e15f_paging.json`（12 页明细）、`e14n_exhaustive.json`（浏览器侧 232 对照）。

**匿名 HTTP Provider 合同按「混合架构」定稿**：lite 口径（preview/place）为纯 HTTP 无状态补充；photos 批量 = 会话养护（浏览器点击一次）+ 纯 HTTP 游标翻页，进入 Provider 设计。

数据：`e14_photos.json`、`e14_hspqx_req_sample.md`、`e14_hspqx_bulk_resp.txt`（157 张原始响应样本）；脚本 `scripts/e14_photos.py`。

## 13. 当前引擎 Provider 定论

### 13.1 Provider 边界

1. Provider 只负责异步取数和上游协议适配，不拥有任务状态、结果存储、业务路由或恢复流程。
2. `http`：一次 Search 调用完成常规 pb、浏览器级 pb 与 L2 补齐；调用方可直接并发多个调用。全部 Google 请求共享当前 business 进程的信号量，Provider 不建立任务队列。
3. `gosom`：一次 `submit` 只提交一个关键词并返回 `job_id + base_url`，一次 `get` 只查询该上游 job；River/Postgres 排队、worker 调度和执行完全由 gosom 负责。
4. admin 维护 `http / gosom` 选择、标准代理 URL 列表和每进程并发预算；具体业务入口显式选择 Provider，不由本层统一成任务接口。

### 13.2 HTTP 采集链

1. 每次 Search 调用铸造一枚 NID；NID 不绑定出口 IP，可跨请求级轮换代理使用。
2. 常规 pb 以 `!7i20!8i{offset}` 分页，开 gzip，每页用 fid 去重；请求最多重试 3 次。
3. 浏览器级 pb 按 fid 与常规分页结果合并，沿用 §12.34 的自适应放大重试策略。
4. 对浏览器级 pb 未覆盖的 fid 调 `preview/place`，补 Claimed/Owner/Featured Image/About；不为 29 列以外的星级分布做抽样请求。
5. 常规分页重试后仍失败则整任务失败；批量补列或单店补列失败只标记部分结果，不丢弃已取得的核心列表。

`ll` 坐标偏置已验证（§12.35）：常规 pb 视口块 `!1d{直径米}!2d{lng}!3d{lat}` 注入即生效，城区精度 <100m，浏览器级 pb 同构位；接入时须带视口 canary（软降级会静默回退出口地理）。B2 的地区参数按此实现。

### 13.3 字段与容量

- 29 列的唯一字段合同在 §12.30；Provider 和其他文档只引用，不再复制列表。
- 7 个付费补全列归现有官网 enrichment，不进 Provider 取数原语。
- batch1000 实测综合流量 0.84MB/词、平均 44.8 条/词；250GB 按该全链路口径约支撑 29.7 万词或 1,330 万条。该数字只是本次词集的容量基线，不代表封锁阈值。
- 本次 100 IP 平均速率下零封锁；周/月持续负载仍需爬坡观察。

### 13.4 实施证据边界

- §12.34 的最终脚本仍只在生产服务器 `/data/gmaps-research/stress_test.py`；实施前必须脱敏入库，作为自适应浏览器 pb、停止条件、gzip 和重试策略的源证据。§12.35/§12.36 实验脚本同样先入库再实现 `ll` 软降级检测与 Reviews 位表。
- 三项缺口已收敛（2026-09-03）：`ll` 已验证可接入（§12.35，含软降级 canary 要求）；Reviews 走 GetLocalBoqProxy 全量可行（§12.36，配方/位表/翻页全通）；Photos 的匿名 lite 能力与 hspqX 会话信誉门控见 §12.37，但 Photos 产品合同仍待确定，不进入本期 Provider。
