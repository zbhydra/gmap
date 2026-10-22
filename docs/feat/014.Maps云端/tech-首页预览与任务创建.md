# 首页预览与 Dashboard 任务创建

> 已批准方案。执行与验收见 [实施与验收记录](plans/010.Export服务端实施.md)。

## 目标与边界

首页提供单关键词的快速采集体验；正式 Online 任务在现有 Dashboard 创建，使用 [Export 接口](tech-Online任务与结果.md)、原计量和整 Job CSV 下载。

用户已确定：匿名只采一页基础数据，不创建任务；允许查看首屏结果的前 3 行基础预览，完整查看与导出必须登录；匿名记录不随登录保留，用户必须重新提交。

## 用户流程

- 首页操作区改为单关键词输入，去除原多行批量输入和 100 条占位上限。提交期间禁用重复提交，显示加载状态；失败就地提示重试，零结果显示真实空态。
- 基础字段为名称、地址、分类、评分、评论数、电话；只使用首屏已有值，缺值显示空缺，Collector 可按批准合同对同一首屏做一次 browser 补列。数量文案只称本次首屏条数，不声称全量搜索结果。
- 结果区是搜索框与信任条下方的独立结果表（Name / Address / Category / Rating / Reviews / Phone），提供预览行和登录引导，不接管首屏演示剧场；隐藏部分由占位行表达，不能把未授权数据发给浏览器后仅用透明度遮挡。服务端只返回允许公开的样本行。
- 结果区的继续操作使用站级登录入口，登录后进入当前语言的 Dashboard。匿名结果和关键词不写浏览器持久存储、URL、任务表或对象存储，不携带到登录后；不会自动提交、解锁旧结果或补扣匿名用量。
- 已登录用户在首页操作区看到进入 Dashboard 的入口，正式采集仍需在 Dashboard 手动提交。
- Dashboard 默认历史页上方增加任务创建表单，下方保留唯一历史列表。侧栏该项改称 Online Scraper，不增加第二套历史页或新工作区路由。
- 创建表单包含多行关键词、去空行并去重后的数量与上限、Email/社媒开关、月度已用与总额度、额度按纽约时间每月重置的说明和提交按钮。权益、关键词上限、计量及任务状态遵循 [Online 需求](feat.md) 与 [任务合同](tech-Online任务与结果.md)。
- 创建约束加载失败时显示重试，不能猜免费档。提交失败保留当前页面输入并提示；成功后清空输入，刷新历史第一页并展示新任务。提交不自动重试；响应丢失时用户可先刷新历史确认。
- 当前页出现进行中任务时每 5 秒串行刷新当前页列表及已展开的处理中明细；页面内没有进行中任务或组件卸载时停止。列表读取与提交互斥，提交结束后统一刷新目标页并恢复轮询；明细每次展开重新读取。轮询失败停止并给出手动刷新，完成后刷新用量；下载使用同一份整 Job CSV，按 [Export 接口](tech-Online任务与结果.md) 获取本人签名。
- Online 落地页的开始采集 CTA 接入同一个 Dashboard 入口；导航 Online 仍指向产品介绍页。首页和落地页相关占位、批量承诺与导出文案随实际能力同步，完整任务交付一份 CSV。

## 后端边界

### 匿名首屏接口

公开 `POST /api/client/maps-online/preview`，请求头必须携带有效的 `X-Device-Id`，复用 `validate_request_device_id` 校验；IP 取 `get_client_ip`，不可获取时拒绝。请求仅含 `keyword`：去首尾空白后 1–500 字符，单行、单关键词；不接受页数、字段模式、联系方式或 Provider 选择。额外字段按项目 Pydantic 默认规则忽略，但不参与执行。

采集链路：公开入口 → `gmap_collector_config_service` → 共享 client 的同步 `search_item(mode=preview)` → 白名单投影。目标为首屏最多 20 条，Collector 可做一次 browser 补列；不调用官网补全、不创建 Export Job 或文件。同步协议与执行器归 [Collector 合同](tech-Export与Collector重构.md#33-collector-异步调用与恢复)。

- 入口用标准库超时给整个预览采集预算 15 秒，含排队、采集和解析；到期返回可重试错误。该预算是等待上限，不承诺所有网络条件下都能成功。
- 成功数据为 `count`（本次首屏有效条数）与 `rows`（最多 3 行，不足 3 行按实际返回）。每行仅含 `name`、`address`、`category`、`rating`、`review_count`、`phone`；名称为字符串，其余允许空值，分类用现有映射得到的分类文本。不返回原始 RPC、fid、网站、联系方式补全或剩余行。
- 统一响应信封、业务错误与 i18n；匿名响应设置 `Cache-Control: no-store`。不写任务或结果文件、不扣 Online/API/插件月度额度；复用现有请求日志，日志不保存商家结果正文。
- 每设备每日最多 3 次、每 IP 每日最多 30 次；任一限额用尽后再次预览，返回现有 `RATE_LIMIT_EXCEEDED`（998），不调用 Collector。准入规则由 [maps_online_client.py](../../../backend/src/app/api/client/maps_online_client.py) 的 `_PREVIEW_ADMISSION_SCRIPT` 与 `_admit_preview` 负责。
- 后端是唯一计数源；Lua 在同一次原子操作中先检查两维，再同时计数，拒绝不消耗任一维预算。只计已准入采集请求，采集失败不退款。独立 Redis 子前缀为 `maps_online_preview`；复用 `get_tomorrow_start_timestamp`，以 `America/New_York` 次日 0 点作为两维分桶与 `PEXPIREAT` 绝对毫秒过期时间，覆盖 DST 日界。
- Redis 故障时记录日志及堆栈后放行，不创建匿名账号或新 token。

已接受的限制：设备 ID 可被重置，共享 IP 共用每日 IP 预算；现有 IP 工具信任代理头，公网发布需核对可信入口覆盖这些头；Redis 故障放行不提供硬费用上限。不增加验证码、全局费用控制或独立并发池。

### Dashboard 创建约束

登录保护的 `GET /api/client/maps-online/options`，返回 `keyword_limit`、`logical_sample_limit`（地图模式最多 50 个逻辑采样）、`contacts_allowed` 与 `usage`（复用 `usage_service.usage_payload` 的 `used/total/period/exhausted` 合同）。读取既有订阅配置、`KEYWORD_LIMITS` 和 `online_usage_service`，不扩展通用账号摘要，不在前端维护套餐映射。

创建入口和 options 在本模块复用同一份权益读取逻辑，创建请求仍重新校验实时上限、有效订阅和用量。options 不初始化采集引擎、不探测代理或对象存储。配置或用量不可用时按现有错误合同返回，前端不放行提交。

创建、历史、详情和下载使用 [Export 接口](tech-Online任务与结果.md)；`/maps-online` 仅保留预览与 options。

## 前端归属

- 首页的状态和结果渲染放在一个 Vue 采集组件，由 `HomePage.astro` 装配；删除被替代的占位计数脚本和操作区样式，静态营销段保留。已有 Astro/Vue 集成与 `client:load` 的核实依据见 [Dashboard 技术合同](../015.工具与增长/tech-用户Dashboard.md#集成依据)，此次不变更框架版本或引入依赖。
- `DashboardApp.vue` 继续负责会话和工作区外壳；现有 `HistoryView.vue` 承载创建及历史，必要时仅将表单拆为实际有职责的局部组件，不建立新状态管理层。
- `scripts/dashboard/api.ts` 继续封装登录业务请求并处理 401；匿名预览使用已有 `homepage/api.ts` 请求信封与请求头边界，不在前端维护限额次数。`HeroPreview.vue` 捕获 `HomepageApiError.code === 998` 后调用现有 `signIn()`，清空匿名预览并打开站级登录弹窗，登录后按 `props.dashboardUrl` 进入 Dashboard；其他采集失败保留现有失败提示。
- 响应字段在现有解析边界收窄，禁止新增 `any`、宽泛 `unknown` 或用断言代替校验。所有用户文字走现有 i18n，服务端地点名称等原始数据用文本插值渲染。
- 视觉使用 [website 设计合同](../../references/specs/design-website.md) 的 token；截图仅参考信息层次。预览面板窄屏不横向溢出，表单标签、加载/结果提示、错误与键盘焦点可访问。

## 验证与限制

验收结果归 [实施与验收记录](plans/010.Export服务端实施.md)。预览字段由同一首屏及可选 browser 补列提供，字段覆盖随 Google 结果而变化；15 秒预算的长期成功率与可信代理头部署仍需发布环境核对。
