# 采集记录

Online 与同步调用分别存储。Online 的领域与执行合同继续归 [Export 与 Collector](tech-Export与Collector重构.md) 和 [Online 接口](tech-Online任务与结果.md)；本页定义 API/MCP 调用记录。管理界面归 [后台任务记录](../008.管理后台/tech-任务记录.md)，实施跟踪归 [011](plans/011.任务记录实施计划.md)。

## 存储与归属

API 与 MCP 共用 `export_api_jobs_00` ~ `export_api_jobs_09` 十张分表，与 Online 一样按 `user_id % EXPORT_SHARD_COUNT` 选表，不创建 Online Job/Run。请求仍由 [API 与 MCP](tech-API与MCP.md) 的共享业务入口同步执行。记录与用量流水各自拥有职责，以原服务端 `request_id` 关联。

| 字段           | 合同                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `id`           | BIGINT 分表内自增主键                                                                              |
| `request_id`   | CHAR(34)，UUID hex 加两位分表槽号，生成规则同 Online `job_no`，分表内唯一；同时作为用量请求键      |
| `user_id`      | BIGINT，所属登录用户                                                                               |
| `source`       | INTEGER，`2=API`、`3=MCP`，由入口指定；使用 API Key 调用 MCP 仍为 MCP                              |
| `operation`    | INTEGER，`1=搜索`、`2=评论`、`3=照片`                                                              |
| `status`       | INTEGER，`20=处理中`、`40=成功`、`50=局部成功`、`60=失败`，取值与含义沿用 Online `ExportRunStatus` |
| `params_json`  | JSON，已校验的业务参数                                                                             |
| `summary_json` | JSON 可空，有效结果的终态摘要；处理中与失败为 null                                                 |
| `error_code`   | INTEGER 可空，现有业务错误码；内部错误按现有通用错误处理                                           |
| `created_at`   | BIGINT，业务执行开始时间，毫秒时间戳                                                               |
| `finished_at`  | BIGINT 可空，终态时间，毫秒时间戳                                                                  |

沿项目使用 `timestamp_now`、既有数据库 session 与结构同步工具，分表 Model 沿 Online `ExportJobModel` 的抽象基类加槽位生成方式。请求编号末两位即槽号，按编号可直接定位分表。主键与请求编号唯一约束承担身份定位，不为后台低频筛选预建额外索引；实施时按实际查询及 [索引规范](../../references/specs/spec-index.md) 评估。

## 参数与摘要

参数字段由 [maps_api_schema](../../../backend/src/app/schemas/maps_api_schema.py) 中的 `MapsSearchRequest`、`MapsReviewsRequest`、`MapsPhotosRequest` 拥有，MCP 采用对应子类的相同业务字段。只序列化校验后的模型，不保存原始 HTTP/MCP 报文、Authorization、API Key 或 OAuth token。

参数由校验后的请求模型直接序列化，后台详情原样展示 JSON，不新增参数读取 schema 或重新校验。Search 的 `ll` 保存为已解析的坐标对象，不重新套用 HTTP 入参的字符串解析器；摘要在写入边界按操作定义明确 schema。

| 操作 | 摘要                                                       |
| ---- | ---------------------------------------------------------- |
| 搜索 | `record_count`、`warnings`                                 |
| 评论 | `record_count`、`has_more`，不保存返回的评论或下一页游标   |
| 照片 | `record_count`、`reported_total`、`reason`，不保存照片数组 |

结果数量来自实际返回列表长度；未取得的数量与元数据为 null，不伪造零结果。局部交付由状态表达，错误码独立保存。合法零结果与采集失败的判断继续遵守原各操作合同，不以空列表统一分类。

终态分类固定：Search 的 `partial=true` 记局部成功，否则记成功；Reviews 有效页（含空页）记成功；Photos 有效交付一律记局部成功，具体原因保留在摘要 `reason`；业务执行异常记失败，不因结果数量或原因另建状态。

## 记录流程

- 沿现有身份、参数与额度准入，通过后在共享业务入口建立处理中记录，再执行采集；开始记录写入失败则报错，用户可重试。
- 普通业务异常由共享入口的一处异常处理覆盖配置读取、采集与补全。`AppCommonException` 保留原业务码，其他 `Exception` 记录 `INTERNAL_SERVER_ERROR`；更新失败记录后原样抛出，不扣量。失败记录本身无法写入时只记诊断日志，保留原异常。取消自然传播，不单独捕获。
- 取得有效结果后，在业务异常处理范围外，用同一个短事务更新终态及摘要，并使用原 `api_usage_service.consume_in_session` 写入一次请求用量。事务失败时原样抛出，REST 与 MCP 都返回通用 `INTERNAL_SERVER_ERROR`；终态与用量共同回滚，记录可遗留处理中，不再追加失败落库。网络采集期间不持有数据库事务。
- 取消、进程硬退出、失败状态写入失败或结算事务回滚均可遗留处理中记录；不增加取消落库、恢复、重采、补偿或自动重试。
- Reviews 每次翻页独立记录；客户端重试仍是新请求。鉴权、参数或额度拒绝，未知 MCP 工具、初始化、授权流程及匿名预览不生成调用记录。

实际结果数量与请求用量分别表达，调用记录不替代 `user_usage_logs`。Online 的存储、恢复、发布与用量事务保持其原合同。
