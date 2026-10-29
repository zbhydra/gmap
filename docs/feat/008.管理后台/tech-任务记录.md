# 后台任务记录

管理后台提供一个只读“任务记录”菜单，包含 Online 任务、API/MCP 调用记录两个独立标签页。分别查询、筛选、分页和查看详情；不提供混合时间线或跨类型汇总计数。数据归属见 [Online 接口](../014.Maps云端/tech-Online任务与结果.md) 和 [调用记录](../014.Maps云端/tech-采集记录.md)，实施跟踪见 [011](../014.Maps云端/plans/011.任务记录实施计划.md)。

## 查询接口

前缀 `/api/admin/task-records`，只使用 GET，统一走 `get_admin_user` 和既有响应信封；未认证返回 HTTP 401。

| 路径                  | 数据与顺序                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| `/online`             | Online Job/Run，按创建时间、任务编号倒序；服务端处理现有分表的全局分页 |
| `/online/{job_no}`    | 列表行字段加执行进度与逐采样事实                                       |
| `/calls`              | API/MCP 调用记录，按创建时间、请求编号倒序；服务端处理分表的全局分页   |
| `/calls/{request_id}` | 列表行字段加参数、摘要与错误码；按编号末两位槽号定位分表               |

编号 `job_no` / `request_id` 为 32 位小写 hex 加两位槽号，即 `^[0-9a-f]{32}0[0-9]$`。路径与筛选中的编号都精确匹配；格式非法返回 `VALIDATION_ERROR`，格式合法但记录不存在时详情返回 `NOT_FOUND`。

| 参数                                | 规则                                                                     | 适用          |
| ----------------------------------- | ------------------------------------------------------------------------ | ------------- |
| `page`                              | 整数 ≥ 1，默认 1                                                         | 两个列表      |
| `page_size`                         | 1–100，默认 20                                                           | 两个列表      |
| `user_id`                           | 整数 ≥ 1                                                                 | 两个列表      |
| `job_no` / `request_id`             | 编号，精确匹配                                                           | Online / 调用 |
| `status`                            | 单值，Online 运行状态码（10/20/30/40/50/60）；调用记录只出现 20/40/50/60 | 两个列表      |
| `source`                            | 单值，`2=API`、`3=MCP`                                                   | 调用          |
| `operation`                         | 单值，`1=搜索`、`2=评论`、`3=照片`                                       | 调用          |
| `created_from_ms` / `created_to_ms` | 毫秒时间戳 ≥ 0，对 `created_at` 取闭开区间 `[from, to)`                  | 两个列表      |

参数类型、范围或格式错误返回 `VALIDATION_ERROR`；`created_from_ms > created_to_ms` 返回 `INVALID_REQUEST`，`data.field=created_range`。列表返回 `{rows,total,page,page_size}`，字段如下：

- Online 列表行：`job_no`、`user_id`、`keywords`（去重并保持输入顺序）、`status`、`sample_count`（逻辑采样项数）、`record_count`（CSV 已写行数，与用户端历史同义）、`created_at`、`finished_at`。
- Online 详情：列表行字段加 `run_no`、`include_contacts`、`export_locale`、`processed_count`（已完成采样项数）、`has_file`、`node_name`、`error_code`、`started_at` 与 `items[]`。每项为 `item_index`、`result_count`、`completed`、`error_code`、`keyword`、`viewport`（`{lat,lng,zoom}` 或 null）。
- 调用列表行：`request_id`、`user_id`、`source`、`operation`、`status`、`record_count`（取自摘要）、`created_at`（开始时间）、`finished_at`。
- 调用详情：列表行字段加 `params`、`summary` 与 `error_code`；参数与摘要结构见 [采集记录](../014.Maps云端/tech-采集记录.md#参数与摘要)。

时间均为毫秒时间戳。处理中与失败的调用没有摘要，`summary` 与 `record_count` 为 null；未开始、未结束或无错误时，对应时间与 `error_code` 为 null。耗时不单独返回，由页面按 `finished_at - created_at` 计算。

Online 直接读取原 Job/Run，保持其状态、输入与结果含义。管理员查询不借用用户登录态或客户端本人查询接口，不为记录功能改变 Online 模型、Runtime、用户历史或下载合同。两类记录都是十张分表，跨分表排序与分页在数据库执行，不增加 Python 归并器；用户 ID 或编号能够定位分表时直接查询目标表。调用记录的参数与摘要原样投影，不重新校验业务参数，不接入 Online 调度或文件流程。

## 页面行为

- 菜单路由 `/task-records`；每次进入标签页都读取对应列表，切换标签页时保留各自的筛选与页码，再次进入按保留的条件读取。
- Online 列表展示任务编号、用户、关键词、状态、采样与结果数量、创建和结束时间；详情查看既有执行进度、逐采样事实及错误。
- 调用列表展示请求编号、用户、API/MCP 来源、搜索/评论/照片操作、状态、结果数量和开始/结束时间；详情展示业务参数、摘要、错误码与耗时。状态 20 在调用记录中显示为「处理中」，在 Online 中显示为「采集中」。
- 用户 ID 复用既有用户信息弹窗。文案走中英文 i18n，时间使用现有后台格式与 UTC+8；时间筛选按浏览器本地时区解析，与现有用户管理、订单页一致；字段不可得时显示占位符。
- 两个列表均提供手动刷新；加载失败展示现有错误提示，允许再次查询；记录页面不提供修改、重跑或删除动作。

界面复用现有 Naive UI 组件与后台设计规范。用户 Dashboard 保持现有 Online 历史范围，不新增调用记录页面。
