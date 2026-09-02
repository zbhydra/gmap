# 014 · Maps 云端

## 功能目标

服务端化的 Google Maps 数据采集,两条产品形态:**Online Scraper**(网页批量任务台,面向运营/销售用户)与 **API**(开发者程序化接入),共用同一抓取引擎与代理池,按订阅分档计量。对标竞品 gmapsextractor.com 的 Online + API 产品线。

## 当前状态

- 抓取引擎选型与部署/成本/安全调研完成:`@../../research/google-maps-scraping-方案调研.md`(gosom/google-maps-scraper SaaS Edition;POC 是云端路线 Gate)。
- 竞品 Online 已登录实测、API 官方文档全量抓取(B1/B2 ✅)、MCP 已盘(B3);云端内部引擎不可见也不需要——自研走 gosom。
- 未开始开发;Gate(B5)未执行。进度见根 `@../../ROADMAP.md`。
- **hydra 裁决(2026-08-30)**:Online Scraper 产品化暂缓——营销站的 Online 入口**留空、点击无效**(015 D5 占位);Gate POC 与 gosom 部署待启动后按本文推进。

## 已拍板差异

- 引擎不自研,采用 gosom/google-maps-scraper(MIT)+ SaaS Edition 部署(方案调研 §4/§6)。
- 计费口径(统一 credits 池 vs 竞品式分产品订阅)在阶段 3 决策(C2);本文按「云端任务消耗额度」的口径描述,不绑定具体计费形态。
- **订阅配置已占位落地(2026-08-31,006 域)**:`maps_online`(4 档,records/月)与 `maps_api`(4 档,requests/月)产品线 SKU 与 `monthly_quota` 月度额度配置已在 006 订阅系统落地并可通过 PayPal 一次性支付购买;统一额度消费基建(usage 服务三门面,含云端预扣-结算所需的 consume/refund)已于 000 域落地,云端接线时直接调 `online_usage_service` / `api_usage_service`,见 `@../000.架构/tech-额度基建.md` 与 `@../006.订阅系统/tech-订阅商品与状态.md`。

## 产品范围

### 包含

- B1 Online Scraper:关键词批量任务台(网页)、任务状态与结果导出
- B2 API:Scraper / Reviews / Photos 三件套,密钥 + 限流
- B4 抓取引擎部署(SaaS Edition 多 worker + 代理池 + Postgres 内网化)
- B5 云端 POC(Gate,见 ROADMAP)
- Email/社媒补全的云端执行(与 013 A4 同一服务端能力)

### 不包含

- 插件端采集(013);营销站与登录页(015/007);计费模式决策(006/C2)
- MCP 接口(竞品有,我方未调研,暂不入范围)

## 业务流程

### Online Scraper 主流程(用户视角)

1. 官网 Google 登录(007 域)后进入任务台(竞品称 Cloud Dashboard,证据 `@references/B1-OnlineScraper竞品口径.md`)。
2. 新建任务:输入关键词(批量,档位决定单任务关键词数上限:免费 2 个 → 高档 200 个),提交云端。
3. 任务进入队列,云端 worker 抓取;用户在任务列表查看状态(pending/running/completed/failed)。
4. 完成后导出 CSV/Excel/JSON(含 Email/社媒列,视套餐)。
5. 额度:按产出记录数(records/月)扣减;免费档每月固定额度,无需绑卡。
6. 团队档位含多 seats(竞品 3/10/20 座席,即将上线)。

异常:任务失败(代理耗尽/封控)→ 任务标记 failed 并可重试;额度不足 → 禁止提交,引导订阅。

### API 主流程(开发者视角)

1. 注册并获取 API 密钥。
2. 提交抓取任务(`POST` 任务接口)→ 轮询任务状态或接收 webhook → 下载 JSON 结果。
3. 限流:竞品口径 300 requests/分钟;超出返回限流错误。
4. 计量:按 requests/月,独立档位。

## 界面与操作逻辑(Online 任务台)

竞品任务台需登录后可见,公开口径只有定价与营销壳;界面需求按下述最小集合定义,上线前用竞品免费账号实测一轮补齐(待办)。

| 区块 | 元素 | 行为 |
| --- | --- | --- |
| 任务创建 | 关键词输入(单条/批量)、每任务关键词上限提示、提交按钮 | 提交后进入队列;超档位上限拒绝 |
| 任务列表 | 表:任务名 / 关键词数 / 状态 / 记录数 / 创建时间 / 操作 | 状态实时刷新;操作 = 导出 / 重试 / 删除 |
| 额度区 | 本期已用 / 总额度 / 重置时间 | 额度不足置灰提交 |
| 导出 | 按任务导出 CSV/Excel/JSON | 与 013 A8 的字段 schema 对齐 |

## 非功能性需求

- **安全红线(POC Gate 项)**:Postgres 仅内网可达(VPC + pg_hba 收敛 + 关闭 5432 公网入站);云厂商 token 用子账号限额(worker 自动开通场景)。
- **容量**:并发槽按内存规划(单槽 0.5–1GB),50 槽 ≈ 3×CX53 或 7×CX43;扩容 = 加 worker。
- **成本边界**:代理是持续成本大头($100–500/月);上线前必须有 Gate 封锁率数据。
- **隔离**:任务间无抢占(FIFO 队列);单任务失败不影响其他任务。

## 数据埋点

- 任务创建/完成/失败(含关键词数、记录数、耗时、失败原因枚举)
- 导出行为(格式、条数)
- API 调用(密钥、端点、限流触发)
- 额度水位(扣减事件)

## 验收标准(域级)

1. Gate 通过:连续 3 天批量抓取封锁率低于可接受阈值;资源画像实测完成;Postgres 内网化完成。
2. Online:免费账号从登录 → 提交任务 → 导出全链路通过;额度扣减正确。
3. API:密钥签发、任务提交、轮询/结果下载、限流生效。
4. 引擎 Google 改版容忍:依赖 gosom 上游,建立上游 release 跟踪。

## 功能索引

| 编号 | 功能 | 调研 |
| --- | --- | --- |
| B1 | Online Scraper(登录实测:界面 + 后端契约) | `@references/B1-OnlineScraper竞品口径.md` |
| B2 | API 三件套(官方文档全量契约) | `@references/B2-API竞品口径.md` |
| B4/B5 | 引擎与 POC | `@../../research/google-maps-scraping-方案调研.md` |

## 待决

- ~~竞品 Online 任务台登录后实测~~ 已完成(2026-08-30,B1 文档)。
- ~~竞品 API 文档~~ 已完成(2026-08-30,Postman 全量契约入 B2);错误码表文档未列,对接时实测补。
- C2 计费形态决策影响 B1/B2 的额度表述。
