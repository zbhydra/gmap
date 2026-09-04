# tech · Online 任务与结果

> 014 B1 的后端稳定合同。Provider 取数合同见 `@tech-引擎Provider层.md`；对象存储配置见 `@../008.管理后台/tech-系统设置.md` 的“对象存储配置”；额度原语见 `@../000.架构/tech-额度基建.md`。

## 1. 范围

本模块负责 Online 关键词任务的持久化、异步执行、进度、对象结果、重启恢复、实际用量计量和下载。

它不负责 Google 协议解析、代理选择或 gosom 队列，也不为 Search / Reviews API 创建任务。用户状态固定为 `processing / completed`；内部错误只用于诊断。

## 2. 架构

```text
Online 创建入口
  -> maps_online_tasks + 对应 item 分表
  -> 当前 APP_NAME 的多进程 worker
  -> HTTP Provider 或 gosom submit/get
  -> R2 / AliOSS item CSV
  -> item 首次完成事务
  -> Online 实际 records 计量
  -> task completed
```

MySQL 是任务唯一事实源，worker 直接扫描未完成任务。

`APP_NAME` 只表示任务所属 business 实例。`redis.key_prefix` 配置在所有节点固定为 `gmapsexporter`，使登录与既有用量状态在横向部署时保持同一命名空间；开发、测试和生产必须使用不同 Redis DB 或实例。Online 任务本身不写 Redis。切换固定前缀时不迁移旧 key：已有登录会话失效，用户重新登录；匿名月度用量从新命名空间重新计数。

## 3. 文件树

```text
backend/src/app/
  api/client/maps_online_client.py            # Online 任务与下载接口
  constants/maps_online.py                    # 20 分表、任务期限、对象前缀
  models/maps_online_task_model.py             # 父任务
  models/maps_online_task_item_model.py        # 同构 item 表注册与路由
  schemas/maps_online_schema.py                # 创建、列表和详情合同
  services/maps_online_task_service.py         # 任务事务、查询和首次完成
  services/maps_online_worker_service.py       # 扫描、flock、Provider 编排
  services/object_storage_service.py           # R2 / AliOSS 写入、签名与下载
backend/config.yaml.example                    # Redis 固定命名空间
backend/deploy/.env.example                    # 不同环境的 Redis DB
backend/deploy/README.md                       # APP_NAME 与 Redis 部署边界
backend/src/app/core/config_schema.py          # Redis 默认前缀
backend/tests/integration/real/
  api/client/test_maps_online_real.py
  services/test_maps_online_task_service_real.py
  services/test_maps_online_worker_service_real.py
docs/references/specs/spec-mysql.md             # 登记固定分表 service 例外
docs/references/specs/spec-redis.md             # Redis 固定前缀合同
```

对象存储 SDK 属于实施依赖，新增前按仓库规则取得批准。R2 通过官方 S3 兼容接口，AliOSS 使用官方 Python SDK；两者的同步网络与文件操作统一由 `object_storage_service` 放入 `asyncio.to_thread`，业务层不接触 SDK 对象。

## 4. 数据模型

### 4.1 `maps_online_tasks`

| 字段 | 类型 | 约束 | 语义 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 分表路由源 |
| `task_no` | `VARCHAR(32)` | NOT NULL, UNIQUE | 对外任务编号与计量幂等键 |
| `user_id` | `BIGINT` | NOT NULL | 任务所属登录用户 |
| `app_name` | `VARCHAR(100)` | NOT NULL | 创建任务的 business 唯一标识 |
| `provider` | `VARCHAR(16)` | NOT NULL | `http / gosom` 创建时快照 |
| `storage_provider` | `VARCHAR(16)` | NOT NULL | `R2 / AliOSS` 创建时快照 |
| `storage_endpoint` | `VARCHAR(500)` | NOT NULL | R2 account endpoint 或 AliOSS endpoint |
| `storage_bucket` | `VARCHAR(255)` | NOT NULL | 创建时 bucket 快照 |
| `request_data` | `JSON` | NOT NULL | `max_depth / hl / gl / ll / extra` |
| `total_count` | `INT` | NOT NULL | item 总数 |
| `processed_count` | `INT` | NOT NULL, DEFAULT 0 | 已收口 item 数 |
| `record_count` | `BIGINT` | NOT NULL, DEFAULT 0 | 已保存结果记录总数 |
| `error_item_count` | `INT` | NOT NULL, DEFAULT 0 | 内部错误 item 数，不对客户端返回 |
| `deadline_at` | `BIGINT` | NOT NULL | 创建后 24 小时，毫秒时间戳 |
| `completed_at` | `BIGINT` | NULL | 用量计量完成后的任务终态时间 |
| `created_at` | `BIGINT` | NOT NULL | 创建时间，毫秒时间戳 |
| `updated_at` | `BIGINT` | NOT NULL | 最近一次进度变化时间 |

状态由 `completed_at` 派生：空值为 `processing`，非空为 `completed`，不保存另一列状态枚举。

索引合同：

- PK `(id)`。
- UK `uk_maps_online_tasks_task_no(task_no)`：任务详情、下载和用量幂等定位。
- INDEX `idx_maps_online_tasks_user_created(user_id, created_at)`：用户任务列表。
- INDEX `idx_maps_online_tasks_app_completed(app_name, completed_at)`：worker 高频扫描当前实例未完成任务。

实现索引时必须按 `spec-index.md` 补齐实际 SQL、现有索引清单和 `EXPLAIN`，不再添加其他预防性索引。

### 4.2 `maps_online_task_items_00` 至 `_19`

20 张表使用同一字段合同，路由固定为 `task_id % 20`。同一任务的全部 item 在同一张表，任何热路径都先取得父任务 `id`，不跨分表查询或聚合。

| 字段 | 类型 | 约束 | 语义 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 分表内 item ID |
| `task_id` | `BIGINT` | NOT NULL | 父任务 ID |
| `sequence` | `INT` | NOT NULL | 关键词原始顺序，从 1 开始 |
| `keyword` | `VARCHAR(500)` | NOT NULL | 规范化后的关键词 |
| `provider_job_id` | `VARCHAR(255)` | NULL | gosom job ID；HTTP 为空 |
| `provider_base_url` | `VARCHAR(500)` | NULL | gosom 提交实例；HTTP 为空 |
| `last_checked_at` | `BIGINT` | NULL | 最近一次 submit/get 时间 |
| `object_key` | `VARCHAR(1000)` | NULL | 首次完成者的 CSV key |
| `record_count` | `INT` | NOT NULL, DEFAULT 0 | 本 item 实际保存记录数 |
| `error` | `TEXT` | NULL | 内部错误或 partial warning，禁止对客户端返回 |
| `completed_at` | `BIGINT` | NULL | 空值可再次执行，非空已经收口 |
| `created_at` | `BIGINT` | NOT NULL | 创建时间，毫秒时间戳 |
| `updated_at` | `BIGINT` | NOT NULL | 最近一次执行变化时间 |

每张表只有 PK `(id)` 与 UK `(task_id, sequence)`。按 `task_id` 命中后最多读取单任务 50 行，不继续为 `completed_at / last_checked_at` 添加索引。

模型模块用一份字段定义注册 20 张表，并暴露唯一分表路由函数；service 不复制 20 份实现。20 张表全部注册到 `Base.metadata`，由现有 `sync_database_schema` 创建和同步。

## 5. 创建与查询接口

所有接口要求登录用户，只使用 GET / POST。

### 5.1 创建任务

`POST /api/client/maps-online/tasks`

请求：

| 字段 | 类型 | 必传 | 说明 |
| --- | --- | --- | --- |
| `keywords` | `string[]` | 是 | 逐项 trim、删除空项并按首次出现顺序去重 |
| `max_depth` | `int` | 是 | 1–10 |
| `hl` | `string` | 是 | Google 语言参数 |
| `gl` | `string \| null` | 否 | Google 国家参数 |
| `ll` | `{lat, lng, zoom} \| null` | 否 | HTTP Provider 坐标偏置 |
| `extra` | `bool` | 是 | 是否执行 Email / 社媒补全 |

关键词上限由 `constants/maps_online.py` 按当前 `product_id` 固定映射：`free=2 / online_lite=5 / online_basic=10 / online_growth=20 / online_pro=50`。入口读取当前用量；已经 exhausted 时拒绝新任务，但不为本次任务预留或扣减额度。

入口同时读取 `gmap_engine` 与 `object_storage`，把 Provider 和非密钥存储定位信息写入父任务。当前启用的对象存储配置不完整时拒绝创建；gosom 不支持 `gl / ll`，选择 gosom 且携带任一参数时在创建入口拒绝，不在 worker 内静默忽略或重复校验。

响应返回 `task_no / status / total_count / processed_count / record_count / created_at`。

### 5.2 任务列表与详情

- `GET /api/client/maps-online/tasks`：按当前用户分页，按 `created_at DESC` 返回父任务摘要。
- `GET /api/client/maps-online/tasks/{task_no}`：返回父任务进度，以及已经生成 CSV 的 `item_id / sequence / keyword / record_count` 列表。

响应不包含 `app_name / error_item_count / error / provider job handle / storage locator / object_key`。

## 6. 对象存储与 CSV

所有对象 key 采用 `{feature}/{Ymd}/...`。`feature` 由业务代码固定，Online 使用：

```text
online/{Ymd}/{task_no}/{item_id}/{attempt_id}.csv
```

- `Ymd` 从父任务 `created_at` 按业务时区 `America/New_York` 推导为 `yyyyMMdd`，重做时不改日期。
- `attempt_id` 每次执行重新生成，重复执行不会覆盖其他 attempt。
- CSV 使用调研 §12.30 的 36 列顺序：Provider 提供 29 个核心字段，Email 与 6 个社媒列由 enrichment 填充；未产出时保持空值。
- CSV 采用 RFC 4180、CRLF、UTF-8 BOM，与 013 的 CSV 合同一致。
- Provider 成功但结果为空时仍写只有表头的 CSV；Provider 或对象写入最终失败时不写 `object_key`。
- 不即时删除未引用 attempt。对象由运维按 `{feature}/{Ymd}/` 清理，MySQL 不创建对象清理状态。
- R2 与 AliOSS bucket 必须为私有，禁止匿名读取和 public listing；Client 下载只通过鉴权后的短期签名 URL 或后端 ZIP 响应。

父任务快照 endpoint 与 bucket，不保存 access key 或 secret。执行和下载按 `storage_provider` 读取后台当前凭据。R2 在同一 account 内、AliOSS 在同一 RAM 授权域内轮换凭据时，新凭据必须同时访问新旧 bucket，直到对象迁移完成；R2 跨 account 迁移不属于本合同。

后台允许未启用配置块不完整，因此 `object_storage_service` 在进入 SDK 前只校验任务 `storage_provider` 对应的凭据块；失败信息不包含字段值。业务 worker 和下载路由不重复解析配置。

对象存储配置变更顺序固定为：先让新旧凭据都能访问迁移期间的新旧 bucket，再保存后台配置并重启全部 business 进程，之后迁移对象，最后撤销旧权限。重启使各进程越过 `system_data` 的 30 分钟缓存，不增加配置广播机制。

## 7. Worker 与恢复

### 7.1 领取

- 每个业务进程周期扫描 `app_name = settings.app.name AND completed_at IS NULL` 的父任务。
- 同一个 `APP_NAME` 只部署在一台共享本地文件锁目录的机器上；该机器可以运行多个进程。
- 每个进程最多同时执行 `gmap_engine.concurrency` 个 item。HTTP Provider 内部的 Google 请求继续共享同一配置值对应的 semaphore。
- item 按最久未检查优先；没有 gosom handle 时 submit，已有 handle 时 get。gosom 两次检查至少间隔 5 秒，每次只做一次短调用并更新 `last_checked_at`。
- 文件锁固定为系统临时目录下 `gmapsexporter/online/{Ymd}/{task_no}/{item_id}.lock`。执行前非阻塞取得 `fcntl.flock`，取得后重新读取 `completed_at` 与 gosom 轮询间隔；文件描述符保持到本次调用和数据库收口结束，终态事务提交后删除锁文件。

进程崩溃时操作系统立即释放锁。新进程扫描 `completed_at IS NULL` 的 item 后直接重做。

删除 business 实例时，先彻底停止旧实例，再把该 `APP_NAME` 下 `completed_at IS NULL` 的父任务批量改为目标实例 `APP_NAME`，最后启动目标实例；旧实例仍存活时不得迁移归属。该低频操作不增加任务 owner 或迁移状态。

### 7.2 Provider 处理

- HTTP item 直接调用一次 `search_places`。
- gosom item 没有 handle 时只提交并持久化 `job_id + base_url`；已有 handle 时按该 base URL 查询。
- gosom 返回 pending/running 时只更新时间，之后由扫描器再次查询；completed 时进入 CSV 流程；failed 时按错误 item 收口。
- Provider 自身有限重试耗尽、gosom 明确失败或父任务达到 `deadline_at` 时，以 0 条和内部错误收口。
- HTTP partial 保存已有结果，内部记录 warning，不丢弃 CSV。
- `extra=true` 时，Provider 结果按 50 条分批调用现有 `maps_enrich_service.enrich`，把位置对齐的 Emails 与 6 个社媒链接合并进 CSV；补全 partial 或单站失败只记录内部 warning，其余字段照常保存且不重复计量。
- 对象存储 SDK 的有限重试耗尽后，以 0 条和内部错误收口，不创建补偿任务。

gosom submit 已被上游接受、但 `job_id` 尚未提交到 MySQL 时进程可能崩溃；恢复后允许再次提交并留下一个无引用上游 job。item 首次完成事务仍保证本地进度、计量和对象引用只生效一次。

### 7.3 首次完成事务

成功结果先写独立 attempt object，再执行 item 条件更新：

```text
UPDATE item
SET object_key, record_count, error, completed_at
WHERE id = item_id AND completed_at IS NULL
```

错误收口执行同一条件更新，但 `object_key = NULL / record_count = 0 / error != NULL`。

只有更新影响一行的首次完成者，才在同一 MySQL 事务中增加父任务 `processed_count / record_count / error_item_count / updated_at`。重复完成者不增加进度、不重复通知；其未引用对象留待日期目录清理。

## 8. 进度、终态与额度

- `progress = processed_count / total_count`。item 已成功保存或已按错误收口后才增加 `processed_count`。
- `processed_count < total_count` 时任务保持 processing。
- 全部 item 收口且 `record_count = 0` 时直接写 `completed_at`。
- `record_count > 0` 时调用 `online_usage_service.consume(records=record_count, request_id=task_no)`；成功或幂等命中后写 `completed_at`。
- consume 失败时父任务保持未完成，由同一扫描器再次执行 finalizer；唯一键保证不会重复计量。
- 父任务终态使用 `WHERE completed_at IS NULL AND processed_count = total_count` 条件更新；只有影响一行的完成者记录完成埋点。
- 计量不预扣、不退款、不截断已运行任务，实际 used 可以超过 total。后续新任务在创建入口按 exhausted 拒绝。

内部 item 错误不产生用户可见状态。任务终态只说明处理已经收口，不承诺每个关键词都有结果文件。

## 9. 下载

### 9.1 单 item CSV

`GET /api/client/maps-online/tasks/{task_no}/items/{item_id}/download`

入口先按当前用户读取父任务，再在对应分表使用 `id = item_id AND task_id = parent.id` 查询有 `object_key` 的 item，随后返回短期签名下载 URL。签名响应设置 attachment 文件名 `{item_id}_{关键字}.csv`；对象已被运维清理时，由对象存储返回不存在。

文件名只在下载边界清理路径分隔符、控制字符和文件系统保留字符，保留关键词原语言；按 Unicode 边界限制长度，空值使用 `keyword`。

### 9.2 整任务 ZIP

`GET /api/client/maps-online/tasks/{task_no}/download`

入口先校验任务属于当前用户、已经 completed 且至少有一个 `object_key`。对象存储层按 item 顺序将 CSV 下载到独立临时目录，同步 `zipfile` 压缩放入 `asyncio.to_thread`；ZIP 内文件名与单 item 合同一致。响应文件名为 `{task_no}.zip`，发送完成后删除临时目录。

ZIP 不预生成、不写回对象存储、不增加任务状态。下载或压缩失败时清理临时目录并返回错误，用户可以重新请求；进程崩溃遗留的临时目录由操作系统临时目录运维处理。

## 10. 容量

设计输入：1,000 个 Business 用户每月最多 500,000 records，100,000 个 Free 用户每月最多 1,000 records，平均每关键词 50 records。

- 结果约 6 亿 records/月，全部进入对象存储。
- item 约 1,200 万行/月；20 表后约 60 万行/表/月、720 万行/表/年。
- 父任务约 120 万–300 万行/月，保持单表，通过用户列表和 APP_NAME worker 两条实际查询建立索引。
- item 平均收口约 4.6 次/秒，20 分表用于控制长期单表与索引体积，不用于替代并发预算。

## 11. 最少验证

- 分表路由：固定 `task_id % 20`，同任务的创建、查询和完成只命中一张表；不为 20 张表复制测试。
- 首次完成：重复 attempt 只有一次增加父任务进度和记录数。
- Worker 默认覆盖一次完整主流程；对 gosom handle 恢复这一非平凡崩溃边界单独验证，不重复 Provider 解析测试。
- 额度：实际记录数消费与同 `task_no` 重放幂等使用真实 MySQL；消费失败不通过 mock 或破坏共享配置制造，只审查异常路径没有写 `completed_at`。
- 下载：单 item 与 ZIP 分别验证当前用户归属、文件名和内容；跨用户拒绝单独覆盖。
- 对象存储真实冒烟必须验证匿名 GET 与 public listing 均不可用。
- 修改 Model 后执行 `sync_database_schema`，核对 21 张表、列、注释和索引，再执行后端 black、ruff、mypy、相关 real 测试与启动。

## 12. 外部合同

- Cloudflare R2 S3 API：<https://developers.cloudflare.com/r2/api/s3/api/>
- Cloudflare R2 boto3：<https://developers.cloudflare.com/r2/examples/aws/boto3/>
- AliOSS Python SDK V2：<https://github.com/aliyun/alibabacloud-oss-python-sdk-v2>
- gosom SaaS API：<https://github.com/gosom/google-maps-scraper/blob/v1.17.4/docs/saas.md>
