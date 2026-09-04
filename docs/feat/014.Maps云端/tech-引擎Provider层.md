# tech · 引擎 Provider 层（采集基建）

> 014 B4 的稳定技术合同。抓取配方、字段位表和实验证据的唯一来源是 `@../../research/google-maps-scraping-方案调研.md` §12.30–§13；本文只定义工程边界、对内接口与验收口径。

## 1. 定位与范围

Provider 层把 Google Maps HTTP RPC 与 gosom SaaS 封装成可被业务层直接调用的异步取数能力。它不拥有业务任务，也不决定调用结果如何交付。

本期包含：

- HTTP Search：常规 pb 深分页、浏览器级 pb 补列、未覆盖 fid 的 L2 补齐，输出统一 29 列条目。
- HTTP Reviews：`GetLocalBoqProxy` 单页查询、四种排序与 cursor 翻页。
- gosom：提交单关键词 job、按 `job_id + base_url` 查询状态和结果。
- HTTP 代理列表、每进程出站并发预算、gosom 多实例配置。
- 脱敏原始响应、已验证实验脚本与解析 golden。

本期不包含：

- Online/API 路由、任务表、状态机、协程注册表、后台轮询、重启恢复和多进程领取。
- 用户/批次关联、额度、导出、对象存储和文件交付。
- Photos。调研已证明匿名 `preview/place` 能返回 lite 数据，但产品合同仍待确定，本期不预制接口。

## 2. 分层架构

```text
B1 Online（后续） ─┬─ 显式调用 HTTP Search
                   └─ 显式调用 gosom submit/get

B2 API（后续） ────┬─ 显式调用 HTTP Search
                   └─ 显式调用 HTTP Reviews

                         │
                         ▼
provider/gmap/：异步调用、解析、合并、标准化
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        Google Maps RPC       gosom SaaS API
```

- 不定义统一 Provider ABC。HTTP Search 是一次调用内完成的取数流程，gosom 是提交/查询两步上游 job，强制同构会制造无效状态。
- 不定义自动路由器。业务层根据自身产品合同和 `gmap_engine.provider` 显式选择入口，API Search 与 Online 不必共用业务方法。
- Provider 可以读取运维配置，但不读写业务 Model，不创建后台任务，不保存结果。
- 调用方可以同时执行任意数量的 Provider 协程；HTTP 对 Google 的具体请求受每进程共享信号量限制，不建立任务队列。

## 3. 文件树

```text
backend/src/app/
  provider/gmap/                         # 新增
    __init__.py
    types.py                             # DTO 与技术错误，无 ABC
    http.py                              # Search / Reviews 异步入口与采集编排
    gosom.py                             # gosom submit/get
    rpc/
      client.py                          # curl_cffi、代理、gzip、timeout、重试、信号量
      templates.py                       # NID、两类 pb、preview/place、Reviews 请求模板
      parsers.py                         # 两类 pb、L2、Reviews 解析
      entry.py                           # fid 合并与 29 列序列化
  services/
    maps_engine_service.py               # 修改：代理 URL 列表配置
    gosom_api_service.py                 # 修改：base_url 唯一与定向读取
  api/admin/admin_system_settings.py     # 修改：Gmap Engine 配置接口
  constants/gmap.py                     # 修改：配置键与默认值
  schemas/admin_schema.py                # 修改：代理 URL 列表、gosom base_url 唯一
backend/tests/
  fixtures/gmap/                         # 新增：脱敏响应、实验脚本、golden
  integration/real/provider/gmap/        # 新增：解析 golden 与真实 Provider 冒烟
  integration/real/api/admin/
    test_admin_system_settings_real.py   # 修改：Gmap Engine 配置合同
admin/src/
  api/system-settings.ts                 # 修改：Gmap Engine 配置合同
  views/SystemSettingsView.vue           # 修改：Gmap Engine tab
  i18n/en-US.json / zh-CN.json           # 修改
```

不新增 Model、数据库表、Redis key 或对象存储模块，不删除既有文件。

## 4. 对内接口合同

全部网络入口都是 `async` 方法；返回 DTO，不返回数据库 Model。

| 入口 | 入参 | 返回 | 失败 |
| --- | --- | --- | --- |
| `gmap_http_provider.search_places` | `keyword: str`、`max_depth: int`（1–10）、`hl: str`、`gl: str \| None`、`ll: GmapViewport \| None` | `GmapSearchResult` | 代理缺失、主分页失败、地理软降级重试耗尽、解析失败 |
| `gmap_http_provider.list_reviews` | `fid: str`、`sort_by: int`（1–4）、`cursor: str \| None`、`hl: str` | `GmapReviewPage` | 代理缺失、请求或解析失败 |
| `gmap_gosom_provider.submit_job` | `keyword: str`、`max_depth: int`、`lang: str` | `GosomJobHandle` | gosom 配置缺失、提交失败 |
| `gmap_gosom_provider.get_job` | `GosomJobHandle` | `GosomJobSnapshot` | 配置已删除、上游 job 不存在、查询失败 |

DTO 最小字段：

- `GmapViewport`：`lat / lng / zoom`。
- `GmapSearchResult`：`entries: list[GmapPlaceEntry] / partial: bool / warnings: list[str]`。补列局部失败时 `partial=true`；主分页失败不返回结果。
- `GmapReviewPage`：`reviews / next_cursor`。
- `GosomJobHandle`：`job_id / base_url`。`base_url` 随 handle 返回，供未来业务层持久化后定向查询。
- `GosomJobSnapshot`：`status: pending | running | completed | failed / result_count: int / entries: list[GmapPlaceEntry] | None / error: str | None`。`pending/running` 是非终态且 entries 为空；`completed` 是成功终态，entries 可以是空列表；`failed` 是失败终态且 error 非空。

`GmapPlaceEntry` 的 `name / fid / search_keyword` 为非空字符串；其余标量字段不能确认时为 `None`，不能用空字符串伪装已确认的空值：

| 类型 | 字段 |
| --- | --- |
| `str` | `name / fid / search_keyword` |
| `str \| None` | `full_address / street / municipality / about / phone / owner / owner_id / owner_link / review_url / cid / featured_image / time_zone / website / domain / google_knowledge_url / kgmid / google_maps_url / place_id` |
| `list[str]` | `categories / phones`，保持上游顺序并去重；无值为空列表 |
| `bool \| None` | `claimed`；`None` 表示补列失败后无法判断，不能等同 `False` |
| `int \| None` | `review_count` |
| `float \| None` | `average_rating / latitude / longitude` |
| `list[GmapNamedValues]` | `opening_hours`；`GmapNamedValues` 为 `name: str / values: list[str]`，保持上游顺序 |

上述字段序列化为调研 §12.30 的 Title Case 29 列。Categories、Phones、About 与 Opening Hours 的最终字符串格式由入库 golden 固化；在 golden 完成前不自行选择分隔符。

`GmapReview` 合同：

| 类型 | 字段 |
| --- | --- |
| `str` | `review_id / author_name / origin`；origin 固定为 `Google` |
| `str \| None` | `relative_date / author_url / text / translated_text / language / owner_response` |
| `int` | `published_at_ms / rating` |
| `int \| None` | `author_review_count / owner_response_at_ms` |
| `bool` | `author_is_local_guide` |
| `list[str]` | `images`，保持上游顺序并去重；无值为空列表 |

`GmapReviewPage` 为 `reviews: list[GmapReview] / next_cursor: str | None`。字段位表和时间戳来源只引用调研 §12.36；未有真实样本的 guided 评分块不进入本期 DTO。

Provider 技术错误统一继承 `GmapProviderError`；不在本层映射用户文案或 `AppCommonException`。未来 B1/B2 入口各自完成鉴权、错误码和 i18n 映射。

## 5. HTTP Provider

### 5.1 Search

单次 `search_places` 调用：

```text
铸造一枚 NID
→ 常规 pb 按 offset 深分页，按 fid 去重
→ 浏览器级 pb 自适应补覆盖
→ 只对仍未覆盖的 fid 请求 preview/place
→ 合并并序列化 29 列
```

- 常规 pb 必须使用 `!7i20!8i{offset}` 并启用 gzip；`!7i{offset}` 已被实验证伪。
- `max_depth` 上限 10。单页不足 20 条或没有新 fid 时停止后续分页。
- NID 在一次 Search 调用内共享，不绑定代理出口；不同 Search 调用互不共享 NID。
- 常规分页重试耗尽则整次调用失败。浏览器级 pb 或 L2 补列失败时保留核心列表，以 `partial + warnings` 返回。
- `ll` 同时注入常规 pb 与浏览器级 pb。软降级检测及换代理策略必须来自调研 §12.35 对应实验脚本，不根据文档描述重新猜测阈值。

### 5.2 Reviews

- 固定调用 `GetLocalBoqProxy`，不经过 gosom。
- `sort_by` 只接受 1 相关、2 最新、3 最高、4 最低。
- 每页最多 60 条；cursor 原样表达上游翻页位置，调用方负责继续请求。
- 返回字段覆盖 review ID、绝对/相对时间、作者与 Local Guide、星级、原文/译文/语言、商家回复、图片和来源。

### 5.3 HTTP 客户端与代理

- 复用已安装的 `curl-cffi` `AsyncSession` 和浏览器 impersonation；不新增 HTTP 依赖。
- `http.py` 只导出模块级唯一实例 `gmap_http_provider`，调用方不得自行实例化。该实例持有进程级 semaphore；首次初始化由同一把进程内 `asyncio.Lock` 串行完成，避免并发首调创建多个并发预算。
- NID、常规 pb、浏览器级 pb、L2 和 Reviews 的每个 Google 请求都先取得同一个进程级 `asyncio.Semaphore`。
- `gmap_engine.concurrency` 表示**每个 business 进程**的 Google 出站并发数。多实例多进程总上限为 `实例数 × 每实例进程数 × concurrency`；本期不增加集群级分布式并发控制。
- 每个 Google 请求从代理列表等概率随机选择一条。重试时存在其他代理则排除本次失败代理；只有一条时继续使用同一条。
- 请求 timeout 和最多 3 次尝试使用脱敏入库的生产脚本参数，不从压测摘要反推。
- 日志和异常只能记录脱敏后的 scheme、host、port，不得包含用户名、密码、完整代理 URL、NID 或上游响应正文。

## 6. gosom Provider

gosom 官方 SaaS 合同按 [v1.17.4 SaaS 文档](https://github.com/gosom/google-maps-scraper/blob/v1.17.4/docs/saas.md) 与 [v1.17.4 API 实现](https://github.com/gosom/google-maps-scraper/blob/v1.17.4/api/api.go) 固定：

```text
POST /api/v1/scrape
  X-API-Key: <api_key>
  {keyword: str, lang: str, max_depth: int}
  → 202 {job_id, status}

GET /api/v1/jobs/{job_id}
  X-API-Key: <api_key>
  → {status, result_count, results, error}
```

- 一次提交只接受一个关键词。本仓不批量包装关键词，不感知 River/Postgres 队列，不管理 worker。
- 上游 `available/scheduled/retryable` 映射为 `pending`，`running` 保持不变，`completed` 保持不变，`cancelled/discarded` 映射为 `failed`；Provider 对外只暴露这四种状态。
- `submit_job` 按现有权重选择一条 gosom 配置，返回其规范化 `base_url` 与 `job_id`。
- `get_job` 必须按 handle 中的 `base_url` 定向找到当前 API key，不重新随机选择实例。
- 上游完成时会在状态响应中直接返回完整 `results` 数组；Provider 将其映射为同一 `GmapPlaceEntry`，缺失字段保持空值。
- Provider 不循环轮询、不调用上游删除接口。轮询频率、结果落地和清理由未来任务层决定。

## 7. 配置合同

`system_data.gmap_engine`：

```text
{
  provider: "http" | "gosom",
  proxies: string[],
  concurrency: int >= 1
}
```

- `proxies` 接受 0–100 条完整 URL，scheme 只允许 `http / https / socks5 / socks5h`，必须有 host 和 port；凭据特殊字符必须 URL encode。
- 保存时去掉首尾空白和空行，按规范化后的完整 URL 去重并保留首次出现顺序。
- HTTP 模式至少一条代理；gosom 模式允许空列表。
- 旧 `webshare: {endpoint, username, password}` 整体删除，不兼容读取、不双写。
- 配置明文存储和回显；日志与校验错误不得包含代理凭据。
- 未配置时返回 `provider=http`、`proxies=[]` 与默认并发预算。进程内首次 HTTP Provider 调用按当时配置创建信号量，之后不热改容量；修改 `concurrency` 后需重启对应 business 进程。

gosom API 配置继续使用独立的 `system_data.gosom_api` 多实例列表。保存时规范化 `base_url` 并禁止重复；`gosom_api_service` 同时提供加权选择和按 `base_url` 定向读取。

后台接口和界面规格以 `@../008.管理后台/tech-系统设置.md` 的“Gmap 引擎配置”为唯一事实源。

## 8. 数据边界

- Provider 不产生持久状态，没有数据表、索引、分表或 schema 同步。
- Search 和 Reviews 返回内存 DTO；API 可以直接响应，Online 可以在后续任务层写对象存储。
- Provider 不接受 `task_id / user_id / APP_NAME / object_key`，也不返回任务状态。
- 29 个核心字段归 Provider；Email 与 6 个社媒字段归现有官网 enrichment，不进入本期。

## 9. 已知边界

| 项 | 本期合同 |
| --- | --- |
| `ll` | 注入已验证；软降级检测必须以 §12.35 实验脚本为实现证据 |
| Reviews | 实现单页与 cursor；是否抓取全量由调用方循环决定 |
| Photos | 待实现，不暴露空接口 |
| gosom 字段 | 上游 Entry 不完全覆盖 29 列，缺失字段保持空值 |
| Google 风控 | 现有压测只证明对应样本和时段；周/月持续负载阈值仍未知 |
| 结果存储 | 不属于 Provider；Online 任务与 OSS 继续单独设计 |

## 10. 验收

- 先将生产服务器 `/data/gmaps-research/stress_test.py` 及 §12.35/§12.36 对应实验脚本脱敏放入 `backend/tests/fixtures/gmap/`；脚本中的凭据、服务器地址和本地绝对路径必须删除。
- 使用已入库原始响应生成解析 golden，逐列验证 29 列、两类 pb 合并、L2 补缺和 Reviews cursor；不通过 mock 猜测 Google 位表。
- 最少相关测试覆盖 Search 主链、补列 partial、Reviews 单页、代理选择/换代理、gosom submit/get 映射和配置规范化；允许只替换不可控的 Google/gosom HTTP 出口，并同时验证固定成功响应与 timeout、非 2xx、非法响应的错误映射，不 mock 内部 Provider/service。新增后端测试只放 `integration/real/` 并遵守 real 标记与 skip code。
- 真实最小冒烟覆盖一个 Search、一个 L2、两页 Reviews 和一个 gosom submit/get；没有可用凭据时明确报告未执行项，不能以 mock 代替真实冒烟结论。
- 后端执行 black、ruff、mypy、compileall 与最少相关测试，完成 business 启动；管理后台执行 `pnpm build`（含类型检查）并启动。
- 静态检索确认本期改动没有新增 task Model/service、OSS、Redis 队列、后台轮询或 Photos 接口。
