# tech · Online 任务与结果

> 014 B1 的后端稳定合同。Provider 取数合同见 `@tech-引擎Provider层.md`；对象存储配置见 `@../008.管理后台/tech-系统设置.md` 的“对象存储配置”；额度原语见 `@../000.架构/tech-额度基建.md`。

## 1. 范围

本模块负责 Online 关键词任务的持久化、异步执行、进度、对象结果、启动恢复、实际用量计量和下载。

用户状态固定为 `processing / completed`；内部错误只用于诊断。Search / Reviews API 使用独立同步接口。

## 2. 架构

```text
Online 创建入口
  -> 同一事务写父任务与 item 分表
  -> service 为每个 item 启动协程
  -> HTTP Search 或 gosom submit/get
  -> R2 / AliOSS item CSV
  -> report_item 首次完成事务
  -> Online 实际 records 计量
  -> task completed
```

MySQL 是任务事实源。创建事务提交后直接启动 item 协程并返回任务信息；business 启动时按 `APP_NAME` 恢复一次未完成任务。

## 3. 文件树

```text
backend/
  config.yaml.example                          # Redis 固定默认值
  deploy/.env.example / README.md              # Redis 环境隔离说明
  pyproject.toml / uv.lock                      # R2 / AliOSS 官方 SDK
  src/app/
    api/client/maps_client.py                   # enrichment Provider 新 owner
    api/client/maps_online_client.py            # Online 任务与下载接口
    core/config_schema.py                       # Redis 固定默认值
    main.py                                      # 启动恢复与关闭协程
    constants/maps_online.py                    # 20 分表、任务期限、对象前缀
    models/__init__.py                           # 导入全部 item 分表
    models/maps_online_task_model.py             # 父任务
    models/maps_online_task_item_model.py        # 同构 item 表注册与路由
    provider/maps_online.py                      # item 外部调用与结果文件
    provider/maps_enrich.py                      # 官网 Email / 社媒补全
    provider/gmap/http.py                        # 配置由调用方传入
    provider/gmap/gosom.py                       # 配置由调用方传入
    provider/gmap/types.py                       # gosom handle 只含 job_id
    schemas/maps_online_schema.py                # 创建、列表和详情合同
    services/gosom_api_service.py                # 只保留配置与加权选择
    services/maps_online_task_service.py         # 任务事务、item 执行与恢复
    services/maps_enrich_service.py              # 删除
    utils/object_storage.py                      # R2 / AliOSS SDK 客户端
  tests/integration/real/
    api/client/test_maps_online_real.py
    api/client/test_maps_integrations_real.py    # enrichment import owner
    provider/gmap/                               # Provider 配置调用合同
    provider/test_maps_online_provider_real.py
    services/test_maps_online_task_service_real.py
    utils/test_object_storage_real.py
```

依赖方向固定为 `service -> provider -> utils`。service 读取运行配置并在初始化 Online Provider 时传入；Provider 不读取或引用 service。R2 通过官方 S3 兼容接口，AliOSS 使用官方 Python SDK，同步 I/O 由对象存储工具放入 `asyncio.to_thread`。

## 4. 数据模型

### 4.1 `maps_online_tasks`

| 字段 | 类型 | 约束 | 语义 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 分表路由源 |
| `task_no` | `VARCHAR(32)` | NOT NULL, UNIQUE | 对外任务编号与计量幂等键 |
| `user_id` | `BIGINT` | NOT NULL | 任务所属登录用户 |
| `app_name` | `VARCHAR(100)` | NOT NULL | 创建任务的 business 标识 |
| `provider` | `VARCHAR(16)` | NOT NULL | `http / gosom` 创建时快照 |
| `storage_id` | `VARCHAR(36)` | NOT NULL | 创建时启用的对象存储配置 ID，任务存续期间不变 |
| `total_count` | `INT` | NOT NULL | item 总数 |
| `processed_count` | `INT` | NOT NULL, DEFAULT 0 | 已收口 item 数 |
| `record_count` | `INT` | NOT NULL, DEFAULT 0 | 已保存结果记录总数 |
| `error_item_count` | `INT` | NOT NULL, DEFAULT 0 | 供运维直接查询的错误 item 数，不对客户端返回 |
| `completed_at` | `BIGINT` | NOT NULL, DEFAULT 0 | `0` 为处理中；正数为终态时间 |
| `created_at` | `BIGINT` | NOT NULL | 创建时间，毫秒时间戳 |

索引合同：

- PK `(id)`。
- UK `uk_maps_online_tasks_task_no(task_no)`：任务详情、下载和用量幂等定位。
- INDEX `idx_maps_online_tasks_user_id(user_id)`：用户任务列表按 `id DESC` 读取。
- INDEX `idx_maps_online_tasks_completed_at(completed_at)`：启动时定位少量 `completed_at = 0` 的任务，再过滤 `app_name`。

实现索引时按 `spec-index.md` 补齐实际查询与 `EXPLAIN`，不添加其他索引。

### 4.2 `maps_online_task_items_00` 至 `_19`

20 张表使用同一字段合同，路由固定为 `task_id % 20`。同一任务的全部 item 在同一张表，查询先取得父任务 `id`，不跨分表查询或聚合。

| 字段 | 类型 | 约束 | 语义 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK, AUTO_INCREMENT | 分表内 item ID |
| `task_id` | `BIGINT` | NOT NULL | 父任务 ID |
| `sequence` | `INT` | NOT NULL | 关键词原始顺序，从 1 开始 |
| `keyword` | `VARCHAR(500)` | NOT NULL | 规范化后的关键词 |
| `object_key` | `VARCHAR(1000)` | NULL | 首次完成者的 CSV key |
| `record_count` | `INT` | NOT NULL, DEFAULT 0 | 本 item 实际保存记录数 |
| `error` | `TEXT` | NULL | 内部错误或 partial warning，禁止对客户端返回 |
| `completed_at` | `BIGINT` | NOT NULL, DEFAULT 0 | `0` 可再次执行；正数已经收口 |

每张表只有 PK `(id)` 与 UK `(task_id, sequence)`。按 `task_id` 命中后最多读取单任务 50 行。

item 模型模块用一个抽象模型定义字段，一次生成 20 个物理模型，并暴露 `task_id -> model` 的唯一路由函数。service 直接路由到单表；`models/__init__.py` 导入分表集合，使 20 张表注册到 `Base.metadata`。

## 5. 创建与查询接口

所有接口要求登录用户，只使用 GET / POST。

### 5.1 创建任务

`POST /api/client/maps-online/tasks`

| 字段 | 类型 | 必传 | 说明 |
| --- | --- | --- | --- |
| `keywords` | `string[]` | 是 | 逐项 trim、删除空项并按首次出现顺序去重 |

关键词上限由 `constants/maps_online.py` 按当前 `product_id` 固定映射：`free=2 / online_lite=5 / online_basic=10 / online_growth=20 / online_pro=50`。入口读取当前用量；已经 exhausted 时拒绝新任务，本次任务不预留额度。

Online 固定使用 `max_depth=3`、`hl/lang=en`、无 `gl/ll`，并执行 Email 与社媒补全；深度取值依据调研 §12.3 的批量甜点位。入口读取 `gmap_engine` 与 `object_storage`，把采集 Provider 和当前启用项的 `storage_id` 写入父任务；没有启用的完整对象存储配置时拒绝创建。

service 提交创建事务后，用当前引擎与对象存储配置初始化 Online Provider，并立即按 item 启动协程。响应返回 `task_no / status / total_count / processed_count / record_count / created_at`。

### 5.2 查询与下载合同

任务摘要固定为 `task_no / status / total_count / processed_count / record_count / created_at`；item 摘要固定为 `item_id / sequence / keyword / record_count`。响应不包含 `app_name / error_item_count / error / storage_id / object_key`。

| 方法与路径 | 入参 | 成功 `data` |
| --- | --- | --- |
| `POST /api/client/maps-online/tasks` | `{keywords: string[]}` | 任务摘要 |
| `GET /api/client/maps-online/tasks` | `offset: int = 0 / limit: int = 20` | `{tasks: 任务摘要[], total, offset, limit}`，按 `id DESC` |
| `GET /api/client/maps-online/tasks/{task_no}` | path `task_no` | `{task: 任务摘要, items: item 摘要[]}` |
| `GET /api/client/maps-online/tasks/{task_no}/items/{item_id}/download` | path `task_no / item_id` | `{url, filename}` |
| `GET /api/client/maps-online/tasks/{task_no}/download` | path `task_no` | ZIP 文件响应 |

统一复用现有错误码：未登录沿用认证错误；请求格式错误使用 `VALIDATION_ERROR`；额度耗尽使用 `INVALID_REQUEST`；任务、item 或可下载文件不属于当前用户或不存在时使用 `NOT_FOUND`；额度或对象存储不可用时使用现有 `EXTENSION_USAGE_UNAVAILABLE / INTERNAL_SERVER_ERROR`。

## 6. 对象存储与 CSV

Online 对象 key 固定为：

```text
online/{Ymd}/{task_no}/{item_id}/{attempt_id}.csv
```

- `Ymd` 从父任务 `created_at` 按业务时区 `America/New_York` 推导为 `yyyyMMdd`。
- `attempt_id` 每次执行重新生成，重复执行不会覆盖其他 attempt。
- CSV 的完整 36 列列名与顺序以已验证脚本 `@backend/tests/fixtures/gmap/scripts/stress_test.py` 的 `CSV_HEADERS` 为准：Emails 与 6 个社媒列位于 `Search Keyword` 前，`Search Keyword` 为最后一列。按表头列名从 Provider 的 29 个核心字段与 enrichment 结果中取值；未产出时保持空值。字段来源见调研 §12.30。
- CSV 使用标准库 `csv`，采用 RFC 4180、CRLF、UTF-8 BOM；Provider 返回空结果时仍写只有表头的 CSV。
- 对象保留期由运维在 R2 / AliOSS 配置生命周期规则，按功能前缀自动清理；保留天数不写死在应用中。
- R2 与 AliOSS bucket 为私有；Client 下载通过鉴权后的短期签名 URL 或后端 ZIP 响应。

父任务只保存 `storage_id`；服务类型、endpoint、bucket 和凭据统一归对应配置项。创建时绑定当前启用项，执行、启动恢复和下载始终按该 ID 取配置，切换启用项只影响新任务。后台多配置与读取合同见 `@../008.管理后台/tech-系统设置.md` 的“对象存储配置”。

切换存储时新增一套配置并设为启用项，保留旧配置、凭据和 bucket 权限；旧任务继续写入和下载原存储，旧对象按保留期自然清理后，由管理员删除旧配置。退役时间以旧存储最后写入的对象完成过期清理为准，不从切换启用项时直接起算。应用不复制对象、不改绑历史任务，也不自动删除配置。

Online Provider 接收 service 按 `storage_id` 取得的配置。历史任务对应配置已删除时，下载按文件不可用返回 `NOT_FOUND`，不改用当前启用项。

## 7. Item 执行与恢复

### 7.1 执行

- `maps_online_task_service` 读取配置、初始化 Online Provider，并持有本进程创建的后台 task（item 执行与启动恢复时的任务完成操作）；task 结束后从集合移除，business 关闭时取消剩余 task。
- 每个 item task 调用 Online Provider，并把返回结果或异常转换为一次 `report_item`。
- HTTP item 调用一次 `gmap_http_provider.search_places`。Google 出站并发使用 Provider 已有的进程级限制。
- gosom 每个 item 提交一次单关键词 job，并在同一协程中每 5 秒按返回的 handle 查询；pending/running 继续等待，completed 进入 CSV 流程，failed 抛出 Provider 错误。
- Online Provider 按 50 条分批调用 `maps_enrich_provider.enrich`，把位置对齐的 Emails 与 6 个社媒链接合并进 CSV；enrichment 继续使用现有 fail-open Redis 缓存。
- 所有 item 共用父任务 `created_at + 60 分钟` 的采集截止时间；每个 item 协程按剩余时间限制 Online Provider 调用，覆盖 HTTP 并发等待、取数、gosom 轮询、enrichment 和对象写入。启动恢复沿用原截止时间。
- 达到期限时取消本地未完成采集，按 0 条错误收口；已经完成的 item 及其 CSV、记录数保持不变。期限只覆盖 Provider 调用，`report_item` 与最终计量在其外执行。
- HTTP partial 保存已有结果，并把 warning 写入内部状态文本。

### 7.2 `report_item`

`MapsOnlineTaskService.report_item` 是 service 内部静态方法，只接收 item 终态：

```text
report_item(task_id, item_id, status, record_count, object_key, status_text)
status = success | failed
```

| 状态 | `record_count` | `object_key` | `status_text` |
| --- | --- | --- | --- |
| success | 实际数量，可为 0 | CSV key | 空字符串或 partial warning |
| failed | 0 | NULL | 内部错误 |

成功结果先写独立 attempt object，再执行 item 条件更新：

```text
UPDATE item
SET object_key, record_count, error, completed_at
WHERE id = item_id AND completed_at = 0
```

只有更新影响一行的首次报告者，才在同一事务增加父任务 `processed_count / record_count / error_item_count`。`error_item_count` 只在 `status = failed` 时增加；重复报告不增加计数，未引用对象交给同一生命周期规则清理。

报告事务发生数据库异常时，原 item 协程间隔 5 秒重试，总共尝试 3 次（含首次）。每次使用新的事务，复用相同终态参数和已写入的 CSV key，不重新采集或上传；CAS 更新 0 行属于正常幂等结果，不算失败。

三次均失败时记录异常，并直接调用 `@backend/src/app/utils/feishu_utils.py` 的 `send_feishu_alarm` 发送一次告警，随后结束该 item 协程。告警包含任务编号、item ID、尝试次数与脱敏错误摘要，使用协程已有上下文，不为组装告警查询数据库；按 `task_id / item_id` 复用工具的去重能力，应用名由工具统一追加。告警文案走现有 i18n；工具未启用或发送失败时沿用其只记日志的行为。任务保留数据库已有状态，交给后续启动恢复。

报告事务成功或幂等命中后，原协程都调用 service 的任务完成方法，覆盖提交已生效但响应丢失后的重放：读取父任务，已完成或 item 尚未全部收口时返回；全部 item 收口时，`record_count = 0` 跳过计量，正数时调用 `online_usage_service.consume(usage_identity(user_id, None), user_id=user_id, records=record_count, request_id=task_no)`，成功或幂等命中后更新父任务：

```text
UPDATE maps_online_tasks
SET completed_at = now
WHERE id = task_id AND completed_at = 0 AND processed_count = total_count
```

任务完成方法中的父任务读取、计量或终态提交失败时，原协程等待 5 秒后重试该方法，直到任务完成或协程被取消。重试沿用 `task_no` 幂等键，只执行任务完成操作，不重新采集、写 CSV 或报告 item。采集期限不终止最终计量重试；取消信号直接向外传播，由 business 关闭流程回收协程。

### 7.3 启动恢复

business 启动时查询一次 `completed_at = 0 AND app_name = settings.app.name` 的父任务：

- `processed_count < total_count`：读取对应分表中 `completed_at = 0` 的 items，并重新启动协程；已过采集期限的 item 直接按 0 条报告，不再读取存储配置或调用 Provider。
- `processed_count = total_count`：启动后台协程调用 §7.2 的同一任务完成方法，按相同规则重试。

同一 item 可能被多个进程重复执行，`report_item` 保证父任务计数、对象引用和实际用量只生效一次。gosom 协程中断后重新 submit。

迁移 business 实例时，停止旧实例，把该 `APP_NAME` 下 `completed_at = 0` 的父任务更新为目标 `APP_NAME`，再启动目标实例。

## 8. 进度、终态与额度

- `progress = processed_count / total_count`。
- item 保存 CSV 或按错误收口后增加 `processed_count`。
- `completed_at = 0` 为 processing；正数为 completed。
- 实际计量不预扣、不退款、不截断已运行任务，used 可以超过 total；后续创建入口按 exhausted 拒绝。
- item 错误不产生用户可见状态。Completed 只表示全部 item 已收口，不承诺每个关键词都有结果文件。

## 9. 下载

### 9.1 单 item CSV

`GET /api/client/maps-online/tasks/{task_no}/items/{item_id}/download`

入口先按当前用户读取父任务，再在对应分表使用 `id = item_id AND task_id = parent.id` 查询有 `object_key` 的 item，随后由 Online Provider 返回短期签名下载 URL。文件名为 `{item_id}_{关键字}.csv`。

文件名在下载边界清理路径分隔符、控制字符和文件系统保留字符，保留关键词原语言；完整文件名按 Unicode 边界截断到 200 个 UTF-8 字节。清理后关键词为空时使用 `{item_id}.csv`。

### 9.2 整任务 ZIP

`GET /api/client/maps-online/tasks/{task_no}/download`

入口校验任务属于当前用户、已经 completed 且至少有一个 `object_key`。Online Provider 按 item 顺序将 CSV 下载到独立临时目录，同步 `zipfile` 压缩放入 `asyncio.to_thread`；ZIP 内文件名与单 item 合同一致。响应文件名为 `{task_no}.zip`，发送完成后删除临时目录。

## 10. 容量

设计输入：1,000 个 Business 用户每月最多 500,000 records，100,000 个 Free 用户每月最多 1,000 records，平均每关键词 50 records。

- 结果约 6 亿 records/月，全部进入对象存储。
- item 约 1,200 万行/月；20 表后约 60 万行/表/月、720 万行/表/年。
- 父任务约 120 万–300 万行/月，保持单表；`completed_at` 索引定位少量运行中任务，`user_id` 索引支持用户列表。

## 11. 最少验证

- 一条 service real 主流程覆盖分表路由、`report_item` 幂等与有限重试、启动恢复、采集期限和实际用量计量，包含报告重试耗尽后发送一次飞书告警，以及一次计量失败后无需重启即可自动完成且只计量一次；仅替换飞书外部发送出口，不实际发送测试告警。
- 一条 Client API real 主流程覆盖创建、列表、详情、单 item、ZIP、跨用户拒绝，以及切换启用配置后新旧任务各自使用绑定存储。
- 一条 Online Provider real 主流程覆盖 HTTP、enrichment、CSV 与对象写入组合，并核对 §6 的完整 36 列表头顺序，不重复底层 Provider 解析测试。
- R2 与 AliOSS 分别执行真实最小写入、下载、签名及私有 bucket 冒烟；无凭据时按 real 规范 skip。
- 修改 Model 后执行 `sync_database_schema`，核对 21 张表、列、注释和索引，再执行受影响范围的 black、ruff、mypy、real 测试与 business 启动。
- 最终消融审查逐项删除不影响上述真实路径的字段、索引、service、helper、分支和测试，独立 reviewer 复验后交付。

## 12. 外部合同

- Cloudflare R2 S3 API：<https://developers.cloudflare.com/r2/api/s3/api/>
- Cloudflare R2 boto3：<https://developers.cloudflare.com/r2/examples/aws/boto3/>
- AliOSS Python SDK V2：<https://github.com/aliyun/alibabacloud-oss-python-sdk-v2>
- gosom SaaS API：<https://github.com/gosom/google-maps-scraper/blob/v1.17.4/docs/saas.md>
