# 014 · Maps 云端

## 功能目标

提供两种服务端 Google Maps 采集产品：面向运营与销售用户的 Online Scraper，以及面向开发者的同步 API。两者复用抓取 Provider 和代理配置，分别按 Online records/月与 API requests/月计量。

## 当前状态

- HTTP Search、HTTP Reviews 与 gosom submit/get Provider 已完成，合同见 `@tech-引擎Provider层.md`。
- Online 的任务、结果存储、进度、恢复和下载合同见 `@tech-Online任务与结果.md`，实施清单见 `@plans/002.Online任务与结果基建.md`。
- R2 / AliOSS 后台配置已完成，配置合同见 `@../008.管理后台/tech-系统设置.md` 的“对象存储配置”。
- API 竞品合同已确认；Search 与 Reviews 后续按同步 REST 实现，Photos 待实现。
- 云端正式上线仍需完成 ROADMAP B5 的长期封锁率、代理流量与 gosom Postgres 内网化 Gate。

## 产品范围

### Online Scraper

- 登录用户按行输入关键词并提交任务。
- 每个任务的关键词上限为 Free 2、Lite 5、Basic 10、Growth 20、Pro 50。
- HTTP 引擎直接异步执行；gosom 的任务排队由 gosom 自身处理。
- 任务列表展示任务编号、关键词数、已处理数、记录数、状态、创建时间和操作。
- 用户状态只有 Processing 与 Completed。单个关键词没有产出或内部执行失败，都不增加用户状态分支。
- 每个有结果文件的关键词可以单独下载 CSV；整个任务可以下载包含全部 CSV 的 ZIP。
- Online 按实际产出的 records 计量；提交和执行期间不预扣，当前任务允许超过剩余额度。已经 exhausted 的账号不能继续提交新任务。

### API

- Search 与 Reviews 是独立的同步 REST 接口，不创建 Online 任务，也不写对象存储。
- Search 接受查询词、页数、语言和可选坐标偏置；Reviews 接受 fid、cursor 和排序方式。
- API 按成功受理的 HTTP 请求计量，使用 `maps_api` 独立月度额度。
- Photos 保持待实现，不提供占位接口。

## Online 主流程

1. 用户登录后进入 Online Scraper 任务台。
2. 用户在多行输入框中逐行填写关键词并提交。
3. 系统立即返回任务编号，任务进入 Processing。
4. 每个关键词执行完成或内部失败收口后，已处理数增加；记录数只累计实际保存的记录。
5. 全部关键词收口并完成实际用量计量后，任务进入 Completed。
6. 用户可以下载单个关键词 CSV，或下载包含该任务全部可用 CSV 的 ZIP。

## 界面与操作

| 区块 | 元素 | 行为 |
| --- | --- | --- |
| 任务创建 | 多行关键词输入框 | 每行一个关键词；显示当前数量与套餐上限 |
| 任务创建 | Submit 按钮 | 输入为空、超过套餐上限或当前额度已 exhausted 时禁用；提交中显示 loading |
| 额度 | 已用量、总额度、重置时间 | 只展示当前月用量；运行中的任务不占用预留额度 |
| 当前任务 | 任务编号、状态、进度、记录数 | Processing 时轮询；Completed 后停止轮询 |
| 任务列表 | Task ID、Keywords、Records、Status、Created At、Actions | 支持分页；不提供删除、取消或重试操作 |
| 文件列表 | 关键词、记录数、CSV 下载按钮 | 只列出已经生成对象文件的 item |
| 整体下载 | ZIP 下载按钮 | Completed 且至少存在一个 CSV 时可用 |

界面沿用主站现有工作台布局和响应式规则；具体尺寸、间距、状态色与组件落点在前端实施文档中定义，不在后端任务合同中重复。

## 失败行为

- 单个关键词最终取数失败、对象存储失败或超过任务期限时，该关键词以 0 条收口，任务继续处理其他关键词。
- 内部保存失败原因与错误 item 数，不向用户增加 Failed 或 Partial 状态。
- 任务没有任何可下载 CSV 时，下载操作返回失败；用户可以重新创建任务。
- 已按日期清理的对象不再恢复；单文件链接或 ZIP 下载失败时，用户可以重新创建任务。

## 非功能需求

- gosom 的 Postgres 只允许内网访问。
- 同一个 `APP_NAME` 只部署在一台共享本地锁目录的机器上；该机器可以运行多个业务进程。
- Online 结果写入当前启用的 R2 或 AliOSS，MySQL 不保存商家明细。
- 设计容量为每月约 1,200 万关键词 item、6 亿结果记录；item 固定拆为 20 张同构表。
- 对象按功能与业务日期组织，支持运维按日期前缀清理。

## 验收标准

1. Online 用户可以提交关键词任务，刷新或业务进程重启后任务继续收口。
2. 多进程不会在正常运行时重复执行同一个 item；崩溃重做不会重复增加进度或记录数。
3. 每个成功或真实零结果 item 生成 CSV；Completed 任务可以分别下载 CSV 和 ZIP。
4. Online 不预扣额度，按最终实际记录数幂等计量，并允许当前任务超过剩余额度。
5. Search 与 Reviews API 同步返回 Provider 结果，不创建 Online 任务；Photos 接口不存在。
6. R2 与 AliOSS 都能按 `online/{Ymd}/...` 写入和下载结果。

## 功能索引

| 编号 | 功能 | 合同或调研 |
| --- | --- | --- |
| B1 | Online Scraper | `@tech-Online任务与结果.md`、`@references/B1-OnlineScraper竞品口径.md` |
| B2 | Search / Reviews API；Photos 待实现 | `@references/B2-API竞品口径.md` |
| B4 | 引擎 Provider | `@tech-引擎Provider层.md` |
| B5 | 云端 POC Gate | `@../../research/google-maps-scraping-方案调研.md` |
