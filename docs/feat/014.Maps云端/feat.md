# 014 · Maps 云端

## 功能目标

服务端化的 Google Maps 数据采集,两条产品形态:**Online Scraper**(网页批量任务台,面向运营/销售用户)与 **API**(开发者程序化接入),共用同一抓取引擎与代理池,按订阅分档计量。对标竞品 gmapsextractor.com 的 Online + API 产品线。

## 当前状态

- 抓取引擎调研与生产压测完成：自研 HTTP RPC 为主、gosom 为备选，当前定论见 `@../../research/google-maps-scraping-方案调研.md` §12.30–§13。
- 竞品 Online 已登录实测、API 官方文档全量抓取(B1/B2 ✅)、MCP 已盘(B3)。
- 引擎 Provider 层技术合同见 `@tech-引擎Provider层.md`；具体进度以根 `@../../ROADMAP.md` 为准。
- 未开始产品化开发；Gate(B5)正式判定未做——HTTP 路线待长周期封锁率/代理流量爬坡，gosom 路线上线前待 Postgres 内网化验证。进度见根 `@../../ROADMAP.md`。

## 已拍板差异

- Provider 层只封装取数与 gosom 提交/查询；Online/API 各自决定调用方式和任务合同。HTTP 调用可直接并发，gosom 队列由上游负责。
- 计费按产品线分开：Online 按实际产出 records/月，API 按 requests/月。
- **订阅配置已占位落地(2026-08-31,006 域)**:`maps_online`(4 档,records/月)与 `maps_api`(4 档,requests/月)产品线 SKU 与 `monthly_quota` 月度额度配置已在 006 订阅系统落地并可通过 PayPal 一次性支付购买;统一额度消费基建(usage 服务三门面,含云端预扣-结算所需的 consume/refund)已于 000 域落地,云端接线时直接调 `online_usage_service` / `api_usage_service`,见 `@../000.架构/tech-额度基建.md` 与 `@../006.订阅系统/tech-订阅商品与状态.md`。

## 产品范围

### 包含

- B1 Online Scraper:关键词批量任务台(网页)、任务状态与结果导出
- B2 API:Scraper / Reviews / Photos 三件套,密钥 + 限流
- B4 抓取引擎（自研 HTTP RPC 为主、gosom 为备选）与代理池
- B5 云端 POC(Gate,见 ROADMAP)
- Email/社媒补全的云端执行(与 013 A4 同一服务端能力)

### 不包含

- 插件端采集(013);营销站与登录页(015/007);计费模式决策(006/C2)
- MCP 接口（B3 已调研，暂不入当前产品范围）

## 业务流程

### Online Scraper 主流程(用户视角)

1. 官网 Google 登录(007 域)后进入任务台(竞品称 Cloud Dashboard,证据 `@references/B1-OnlineScraper竞品口径.md`)。
2. 新建任务:输入关键词(批量,档位决定单任务关键词数上限:免费 2 个 → 高档 200 个),提交云端。
3. 任务开始采集：HTTP 引擎的任务直接并发执行，gosom 由上游排队；用户只在任务列表查看统一状态。
4. 完成后导出 CSV/Excel/JSON(含 Email/社媒列,视套餐)。
5. 额度:按产出记录数(records/月)扣减;免费档每月固定额度,无需绑卡。
6. 团队档位含多 seats(竞品 3/10/20 座席,即将上线)。

异常:任务失败(代理耗尽/封控)→ 任务标记 failed 并可重试;额度不足 → 禁止提交,引导订阅。

### API 主流程(开发者视角)

1. 注册并获取 API 密钥。
2. 调用 Search、Reviews 或 Photos；Search 的同步响应或异步任务合同在 B2 技术设计时确定，不与 Online 任务入口绑定。
3. 限流:竞品口径 300 requests/分钟;超出返回限流错误。
4. 计量:按 requests/月,独立档位。

## 界面与操作逻辑(Online 任务台)

竞品任务台需登录后可见,公开口径只有定价与营销壳;界面需求按下述最小集合定义,上线前用竞品免费账号实测一轮补齐(待办)。

| 区块 | 元素 | 行为 |
| --- | --- | --- |
| 任务创建 | 关键词输入(单条/批量)、每任务关键词上限提示、提交按钮 | 提交后开始采集;超档位上限拒绝 |
| 任务列表 | 表:任务名 / 关键词数 / 状态 / 记录数 / 创建时间 / 操作 | 状态实时刷新;操作 = 导出 / 重试 / 删除 |
| 额度区 | 本期已用 / 总额度 / 重置时间 | 额度不足置灰提交 |
| 导出 | 按任务导出 CSV/Excel/JSON | 与 013 A8 的字段 schema 对齐 |

## 非功能性需求

- **安全红线**：gosom 的 Postgres 仅内网可达；自研 HTTP 引擎不引入 Postgres。
- **容量**：HTTP 任务并发执行，全部 Google 出站请求共享运维可调的并发预算；gosom 容量由上游 worker 数量决定。
- **成本边界**：代理流量与封锁率按调研 §12.34 的全链路口径继续爬坡观察。
- **隔离**：单任务失败不影响其他任务；HTTP 任务不排队，gosom 的排队由上游负责。

## 数据埋点

- 任务创建/完成/失败(含关键词数、记录数、耗时、失败原因枚举)
- 导出行为(格式、条数)
- API 调用(密钥、端点、限流触发)
- 额度水位(扣减事件)

## 验收标准(域级)

1. Gate 通过:连续 3 天批量抓取封锁率低于可接受阈值;资源画像实测完成;Postgres 内网化完成。
2. Online:免费账号从登录 → 提交任务 → 导出全链路通过;额度扣减正确。
3. API:密钥签发、Search/Reviews 接口、限流和计量生效；Photos 按后续产品合同验收。
4. 引擎 Google 改版容忍：HTTP 解析器有脱敏原始响应与 golden 回归；gosom 继续跟踪上游 release。

## 功能索引

| 编号 | 功能 | 调研 |
| --- | --- | --- |
| B1 | Online Scraper(登录实测:界面 + 后端契约) | `@references/B1-OnlineScraper竞品口径.md` |
| B2 | API 三件套(官方文档全量契约) | `@references/B2-API竞品口径.md` |
| B4/B5 | 引擎与 POC | `@../../research/google-maps-scraping-方案调研.md` |
