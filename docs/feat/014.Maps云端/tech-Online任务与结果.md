# Online Export 接口

执行、恢复、CSV 与用量事务的唯一合同归 [Export 与 Collector](tech-Export与Collector重构.md#3-export-领域与执行)。本页定义网站接口与历史检索存储边界；本期状态与延期联调归 [010](plans/010.Export服务端实施.md)。

## 身份与响应

前缀 `/api/client/export`，全部使用本人登录 Bearer Token。成功响应为 `{code:10000,data,msg}`；认证失败 HTTP 401，其余业务错误 HTTP 200。不存在与他人 Job 均返回 `NOT_FOUND`，不支持匿名下载。

| 方法与路径                    | 请求                                                      | 成功 data                                                      |
| ----------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| POST `/jobs`                  | `{items:[{keyword,viewport?}],include_contacts?:boolean}` | `{job,items}`                                                  |
| GET `/jobs`                   | 分页与筛选见[历史查询](#历史查询)                         | `{jobs:[job],total,offset,limit}`，按 `job_id` 倒序            |
| GET `/jobs/{job_no}`          | 本人编号                                                  | `{job,items}`                                                  |
| GET `/jobs/{job_no}/download` | 本人且已发布的编号                                        | `{url,filename}`，整 Job CSV，签名有效期 300 秒，响应 no-store |

`include_contacts` 为可选 boolean，省略默认 true；关闭时必须显式传 false。

创建输入由 `ExportCreateRequest` 拥有：最多 50 个逻辑采样，每项关键词规范空白后 1–500 字符；相同关键词与视口组合拒绝。视口是有限 `lat/lng` 与严格整数 `zoom=1..21`，省略表示普通或地区关键词。不同关键词数按当前套餐校验，地图点数不占关键词档位；每 item 采用 CAS 默认 200 条目标。服务端忽略未知字段，不接收 Provider、用户、节点、存储或自定 Run 参数。

### 历史查询

`GET /jobs` 的查询参数均可选：

| 参数                                | 合同                                                                                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `offset`                            | 非负整数，默认 0                                                                                                                                                                                               |
| `limit`                             | 1–100 的整数，默认 20                                                                                                                                                                                          |
| `q`                                 | 去除首尾空白后最多 100 字符，空白不筛选。全为十六进制字符时，任务号以 `q` 开头或任一关键词包含 `q` 即命中；其他文本只匹配任一关键词包含 `q`。匹配不区分大小写，LIKE 通配符及转义字符按字面处理，不跨关键词匹配 |
| `status`                            | 可重复，例如 `status=queued&status=collecting`；取值为下文六种公开状态，多值按「或」过滤任务表状态，未知值按参数校验错误处理                                                                                   |
| `created_from_ms` / `created_to_ms` | 非负毫秒时间戳；分别限定 `created_from_ms ≤ created_at < created_to_ms`。起点大于终点返回 `INVALID_REQUEST`，相等为空区间；只传一端时仅限制该端                                                                |

各类筛选条件按「且」组合，并始终限定本人 `user_id`。列表与计数共用过滤逻辑，`total` 是分页前的筛选结果数。服务端只比较毫秒时间戳，纽约自然日边界由调用方换算。

## 公开字段

`job` 包含 `job_no`、`run_no`、`status`、`include_contacts`、`keyword_preview`、`keyword_count`、`total_count`、`processed_count`、`record_count`、`has_file`、`created_at`、`started_at`、`finished_at`、`error_code`。

- 编号均为 JSON string，34 位小写十六进制文本（UUID hex 与两位 owner 槽号）。Job/Run 各 10 张同构表，按 `user_id % 10` 路由，一 Job 一 Run。
- 状态为 `queued/collecting/publishing/completed/partial/failed`；后三种为终态。列表与详情不将失败统一显示为完成。
- 列表与详情的 `keyword_count` 为 `options_json.items` 中已规范化关键词的去重数；按精确文本比较、保留首次出现顺序，视口不参与关键词去重。`keyword_preview` 默认取首个关键词；列表带有效 `q` 时取首个不区分大小写包含 `q` 的关键词，无关键词命中时仍取首个；详情取首个关键词。
- `total_count` 为采样数，`processed_count` 为已收口采样数，`record_count` 为整 Job 去重后的交付行数；三者均为非负整数。`has_file` 表示已成功提交的本人下载引用。
- `created_at` 为非空毫秒 Unix 时间戳；`started_at/finished_at` 为同单位整数或 null。首次开始时间在恢复时不刷新。
- `include_contacts` 是创建时按当前有效 Online 订阅和用户开关确定的 boolean 快照；详情不重新按当前套餐改变既有任务。
- `error_code` 为本地化业务码或 null；网站通过自身 i18n 展示状态与错误。

详情 `items` 每项包含 `item_index`（0 起）、`keyword`、`viewport`（对象或 null）、`result_count`、`completed`、`error_code`。completed 表示已提交收口事实，不能单独作为采集成功依据；result_count 是去重后归属于该项的行数。

`EXPORT_TARGET_FAILED=31301`、`EXPORT_PARTIAL_RESULT=31302`、`EXPORT_REQUEST_RETRY=31303`、`EXPORT_PUBLISH_FAILED=31304`；普通校验使用 999，额度耗尽使用 400，配置不可用使用 500。无文件、未成功发布、对象已移除或非本人下载使用 404 业务码。

## 关键词检索存储

各 Job 分表的 `keywords_text` 为 `MEDIUMTEXT NOT NULL`，继承表默认的大小写不敏感排序规则。它保存上述去重关键词按首次出现顺序以换行连接的文本，与 `options_json` 在创建 Job 的同一事务写入。单关键词已规范空白、不含换行，分隔符不属于关键词内容；`q` 中的内部换行不能跨关键词命中。

存量任务通过 `backend/scripts/backfill_export_keywords.py` 一次性回填：遍历 10 张分表，按各表主键 `job_id` 递增游标分批读取 `options_json`，依照相同去重规则批量写入 `keywords_text`，每批提交。列结构通过项目既有 `sync_database_schema` 同步。

索引保持主键 `job_id`、唯一索引 `job_no` 和普通索引 `user_id`。历史查询先按 `user_id` 收窄，InnoDB 用户索引自带主键，可服务本人历史倒序；状态是低基数，关键词包含匹配使用 `LIKE '%q%'`，不为两者新增 B-tree 索引。

## CSV 与权益

整 Job 仅一份 UTF-8 BOM CSV；第一行固定英文列名，第二行为创建请求语言的字段说明，第三行起为数据。共 37 个公开列，连续行号为 `#`，来源列为 `Search Keyword`。精确顺序由 `provider/export/gmap_columns.py` 拥有；内部 record_id、item_index 与搜索视口来源列不全部对外投影。跨关键词重复商家只保留首次提交行及其关键词。

关闭联系方式时不查询补全缓存或调用补全；Emails 与六类社媒列保留为空，不改变列数。启用时尽力补全，失败保留基础行。合法零结果为 completed，无文件且不扣量；partial 按已发布且去重后的行数消费。

`GET /api/client/maps-online/options` 保留 `{keyword_limit,logical_sample_limit,contacts_allowed,usage}`。usage 沿原 `{used,total,period,exhausted}`，period 为纽约自然月 `YYYY-MM`，Online 计量单位为 records；运行中的任务允许超过剩余额度，耗尽后拒绝新建。原商品、账户和账本归 [额度基建](../000.架构/tech-额度基建.md)。

稳定实现入口为 `api/client/export_client.py`、`services/export_job_service.py`、`runtime/export_job_runtime.py` 与 `services/export_file_service.py`。旧 tasks、逐关键词下载、ZIP 和追加执行不提供适配。
