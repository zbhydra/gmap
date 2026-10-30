# 采集权益与批量执行合同

产品上限以 [单次采集权益](feat.md#单次采集权益) 为准，批量按钮与拆分行为以 [批量任务流程](feat.md#批量任务流程) 为准。本页维护跨后端、background、content 的边界合同。

## 权益所有权

Google 插件套餐名与单次权益由 [maps_client.py](../../../backend/src/app/api/client/maps_client.py) 的 `MAPS_ENTITLEMENTS` 同时给出，分别为 `plan_name` 和 `run_limits`。通过 `subscription_service.get_user_subscription_config` 解析 `maps_extension` 的有效商品 ID，再精确选择权益；不根据展示名称或排序推断套餐。匿名、无订阅和过期订阅沿用本产品 Free 配置。

月度用量继续使用 [共享额度基建](../000.架构/tech-额度基建.md)。单次权益只扩展 Google 插件响应，不进入共享用量快照或订阅 metadata。

## HTTP 与缓存

| 入口 | 请求 | 返回数据 |
| --- | --- | --- |
| `GET /api/client/maps/usage` | 身份来自请求头 | 月度用量与有效单次权益 |
| `POST /api/client/maps/usage/report` | `records` 为正整数，`request_id` 为会话幂等标识 | 同形快照及 `deducted` |

共同快照包含 `used`、`total`、`period`、`exhausted`，`plan_name`（Free / Pro / Business），以及 `run_limits` 对象；其 `search`、`reviews`、`photos` 均为正整数。上报响应与查询保持相同权益形状，因为 background 会用上报结果整体替换缓存。

[usageApi.ts](../../../extension/src/sites/maps/usage/usageApi.ts) 在 HTTP 边界验证快照；两个请求都使用现有 token 拦截器，有登录 token 时携带 Bearer，无 token 时继续按设备匿名使用。

## 实际开始与完成

[usageClient.ts](../../../extension/src/sites/maps/usage/usageClient.ts) 的 `getRunLimit` 集中决定本次上限：合法目标与可用月余额的较小值，月余额下界为零。普通采集目标来自服务端单次权益；批量评论目标来自任务内的每店自定义值。

搜索与保存列表共用开始入口。评论、照片工作页首次采集及 Reset 都读取最新用量，再把本次上限传入采集器；采集器内部信任该上限。余额为零时不发 Google 采集请求，保留已有结果并显示额度用尽。工作页面板统一负责重采等待状态，异步检查期间阻止同一 Reset 重入。

用量查询失败沿用既有缓存回退；快照完全不可得时，使用远程配置的默认上限继续采集。页面协议、翻页、节奏等远程配置用途保持独立。

评论与照片工作页使用 `extracting`、`complete`、`stopped`、`empty` 四态：Google 或解析中断进入 stopped，保留已采结果；正常结束零条进入 empty。任一终态都结束用量会话，非空才自动导出，批量评论仍回报完成推进下一项。

完成边沿按实际采集条数上报，搜索、评论、照片与批量工作页复用同一会话规则。Pause / Resume 不换会话，Reset 重采使用新幂等标识；上报失败只记录诊断，不阻断结果导出。月余额在开始时读取，多标签页同时读取同一余额的边界沿用共享计量合同。

## 批量与导出边界

[Dashboard](../../../extension/src/dashboard/App.vue) 的 `createTasks` 只在输入边界去重和拆分；每个拆分任务继续使用既有持久模型与 background 调度器。创建时选择启动只启动首个任务，其余保留在历史中，由用户继续。

[批量预检](../../../extension/src/background/batch/quota.ts) 的 `estimateBulkRecords` 保留关键词包内默认估算与评论每店目标估算。付费单次最大权益用于实际采集上限，不作为每个关键词预期返回数；实际工作页仍按开始时的月余额截断。

搜索完成后的 Email/社媒补全期间，面板显示网站处理进度，Export 与 Reset 等待；补全结束后恢复导出，自动下载与批量强制导出共用此边沿。导出后按钮短暂显示 Exported。

补全请求、结果定位与缓存归属见[官网联系方式采集](../014.Maps云端/tech-官网联系方式采集.md#3-本项目编排)。

搜索、列表、Place 商家区及评论/照片工作页均可导出已有结果。照片媒体以 [photosCsv.ts](../../../extension/src/sites/maps/content/export/photosCsv.ts) 的 `PHOTOS_CSV_COLUMNS` 为字段入口，三种格式保留同一组媒体字段与单媒体计数。

### CSV 文本规则

文本字段首字符为 `=` 时，在最终 CSV 写出边界前置一个 ASCII 单引号，再沿用分隔符、双引号和换行转义。不修剪前导空白，其他首字符与已以单引号开头的文本保持原样。Google 插件的原始采集数据及 JSON、XLSX 导出值不变。Google 搜索、评论与照片共用 [csvText.ts](../../../extension/src/sites/maps/content/export/csvText.ts) 的 `escapeCsvCell`。

## 批量任务列表与详情

[BulkSchedulerController](../../../extension/src/background/batch/controller.ts) 从 IndexedDB 的 `BulkState` 生成读取投影，存储与调度器共用同一任务状态。`getBulkTaskPage` 接收任务类型与从 1 开始的页码，在 background 按类型筛选、按创建顺序倒序后分页；固定页大小由 [BULK_TASK_PAGE_SIZE](../../../extension/src/background/batch/types.ts) 定义。响应只包含当前页 `BulkTaskSummary`、当前类型总数、全局任务总数、有效页码及全局运行任务摘要；摘要保留现有完成、跳过、重试和采集计数，不携带条目。

`getBulkTask` 接收任务 ID，返回该任务的摘要、完整条目与游标；任务已删除时返回 null。Dashboard 查看详情或复制条目时按需读取，查看期间随状态通知刷新。创建成功只返回任务 ID 与业务结果，启停和删除只返回业务结果；错误分类保持 `BulkErrorCode`。命令后重读当前页与已选详情，创建成功回到第一页，删除末页最后一项后由 background 校正到有效末页。`mapsBulkStateChanged` 只通知重读，不传递历史快照。

## 工作页导航与批量上下文

[workUrl.ts](../../../extension/src/background/batch/workUrl.ts) 的 `buildKeywordWorkUrl` / `buildReviewWorkUrl` 接收 `itemCount`，写入 `gme_bulk_total`；现有 `gme_bulk_item` 保持零基索引，展示时加一，不另加显示序号参数。[bulkAuto.ts](../../../extension/src/sites/maps/content/bulkAuto.ts) 在 URL 边界校验并解析参数。搜索与评论工作页面板显示只读序号 / 总数，任务类型由当前页面决定。

面板返回 Dashboard 走仅对 content 开放的 `openBulkDashboard` RPC，边界只接受关键词 / 评论两类任务值，内部复用 [navigation.ts](../../../extension/src/core/utils/navigation.ts) 的同名导航函数复用或打开标签页。

Dashboard 的受限调用沿用[插件 RPC 的扩展页身份合同](../000.架构/tech-插件RPC.md#2-请求权限与错误)，官网身份回调见[统一登录合同](../007.用户系统/tech-第三方登录.md#92-pkce-与回调)。

[vite.config.ts](../../../extension/vite.config.ts) 对 Maps 使用 `https://www.google.com/maps*` 注入匹配，覆盖 Popup 打开的裸 `/maps`；[bootstrap.ts](../../../extension/src/sites/maps/content/bootstrap.ts) 继续在入口限制 Maps 路径，图库交给照片工作页通道。

## 批量工作页启动与恢复

[controller.ts](../../../extension/src/background/batch/controller.ts) 的 `applyEffects` 只创建尚未采集的扩展中转页；[bulk-launch](../../../extension/src/bulk-launch/main.ts) 必须先取得 `authorizeBulkWorkPage` RPC 许可，才能导航到 Google 工作页。

[BackgroundMessageRouter.authorizeBulkWorkPage](../../../extension/src/background/services/BackgroundMessageRouter.ts) 只接受浏览器确认来自本扩展中转页的请求，标签页 ID 取真实 sender，不接收页面自报 ID。[BulkSchedulerController.authorizeWorkPage](../../../extension/src/background/batch/controller.ts) 核对任务、条目与规范工作页目标，再经现有串行状态机登记 owner，成功落盘后才返回许可；同页重复确认幂等，其他中转页不能覆盖已有 owner。

后台在创建页后、登记前停止时，旧页仍未获采集许可；恢复扫描可以补发中转页，最终只有登记成功的 owner 能开始采集。许可失败或被拒绝的中转页关闭自身。正常超时重试仍先关闭已登记的旧工作页，再创建新中转页；暂停、续跑与重试计数沿用既有状态机规则。

## 评论工作页与 Google 协议

实施与验收记录见 [006](plans/006.评论工作页迁移.md)。

| 项 | 合同 |
| --- | --- |
| 工作页 | `www.google.com/maps/place/?q=place_id:{placeId}`，带完整 fid、采集意图与批量参数；普通 Maps 地点页仍是普通入口 |
| 评论接口 | 工作页同源请求 `www.google.com` 下的 `GetLocalBoqProxy`，沿用现有 `reqpld`、每页 10 条、翻页 token 与解析器 |
| 定位参数 | 必须是完整 fid（`0x…:0x…`）；只传短 lrd 时 Google 返回空响应 |
| 参数生命周期 | Google 加载后会以同文档导航清掉工作参数；评论工作页在首个 await 前已有的初始 URL 是唯一来源，fid、`hl` / `gl`、批量任务、序号、总数与每店上限都只读这份快照，翻页与 Reset 不再读活的地址 |
| URL 参数 | 工作页 `gme_fid` 同时携带完整 fid 与我方采集意图 |
| 输入转换 | Maps 地点链接直接用已解析的 fid；Google 评论链接只含 Place ID，在 [placeId.ts](../../../extension/src/sites/maps/content/parser/placeId.ts) 按现有正向编码的同一二进制布局反解，不符合布局的输入在 Dashboard 输入边界按无效链接拒绝 |
| 注入 | Maps 页面与原生照片 `/search` 页面；Google 评论链接仅作为输入转换 |

工作页状态、配额、导出、Reset 与批量完成回报沿用上文四态与会话规则，不新增状态或持久数据。被 Google 判为中国大陆的出口上，评论接口仍会被转往 `.hk` 区域域名，本合同不覆盖这类网络。

## 暂停与重跑

[machine.ts](../../../extension/src/background/batch/machine.ts) 的停止路径把运行中条目本次增加的 try 退回，再置为待处理；先前因卡死累计的尝试保留。离开 Dashboard 详情只切视图，不触发停止。

[controller.ts](../../../extension/src/background/batch/controller.ts) 的 `startTask` 对 completed 任务先按 `items.length` 做额度预检，通过后才重置条目；首次启动和暂停续跑仍按待处理条目计算。额度不足拒绝重跑，并保留原进度。

## 验收入口

逐界面真实证据、构建结果与环境限制统一记录在 [003](plans/003.逐界面对齐与验收.md)；媒体和权益单元证据分别记录在 [004](plans/004.采集面板与媒体导出对齐.md)、[005](plans/005.插件采集分档上限.md)。真实 Pro 采集须同时证明登录身份、实际采集超过 Free 上限、上报业务成功及实际用量增加；照片新产物与零余额停止采集分别保留真实工作页证据。
