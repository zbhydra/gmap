# 000 · 架构 · FastAPI 后端

> 后端 `backend/` 的现状事实：目录结构、分层、异常中间件、配置体系、crons 框架、日志、Redis、依赖注入禁令、HTTP 方法约束。MySQL 用户 Counter 的目标结构与实施合同见 `@tech-counter.md`。规则条文见根 `@../../../AGENTS.md` 与 `@../../references/specs/spec-python.md`。

## 1. 目录结构

```
backend/
├── src/
│   └── app/                         # 应用主体
│   │   ├── main.py                  # FastAPI app 入口 + lifespan + 中间件挂载 + 路由聚合
│   │   ├── api/                     # API 层（只做参数判断/处理，不碰事务）
│   │   │   ├── admin/               #   /api/admin/*    后台认证、用户、订单、任务、系统设置与看板
│   │   │   ├── client/              #   /api/client/*   Maps、用量、订阅、订单、登录、积分与签到
│   │   │   ├── external/            #   /api/external/* 外部开发者 / 第三方系统接口（按子前缀区分 API Key）
│   │   │   ├── system/              #   /api/system/*   健康检查/看板
│   │   │   ├── callback/            #   /api/callback/* 支付/Telegram 回调
│   │   │   ├── admin_dependencies.py  admin 侧 FastAPI 依赖（Depends 只在 api 入口）
│   │   │   └── user_dependencies.py    client 侧 FastAPI 依赖
│   │   ├── services/                # 业务层（类，事务都在这）
│   │   │   ├── base_service.py      #   BaseService[ModelType] 抽象基类，泛型 model_class
│   │   │   └── *_service.py         #   如 user_service / order_service / usage_service ...
│   │   ├── models/                  # SQLAlchemy 模型（见 @tech-数据库.md）
│   │   ├── schemas/                 # Pydantic 请求/响应模型（按域 *_schema.py）
│   │   ├── core/
│   │   │   ├── config.py            #   全局 settings 单例
│   │   │   ├── config_schema.py     #   配置模型 + reload + 候选校验
│   │   │   ├── database.py          #   异步引擎/会话工厂/Base
│   │   │   └── redis.py             #   RedisClient 单例（连接池）
│   │   ├── middleware/
│   │   │   ├── error_handling.py    #   错误处理中间件（AppCommonException 翻译）
│   │   │   ├── request_logging.py   #   请求日志（request_id、慢请求 1s）
│   │   │   └── cross_origin.py      #   CORS
│   │   ├── exceptions/
│   │   │   └── common_exception.py  #   AppCommonException
│   │   ├── crons/                   # cron 框架（见 §6）
│   │   ├── init/                    # DB 初始化与结构同步（sync_database_schema.py 等，见 @tech-数据库.md）
│   │   ├── i18n/                    # 国际化（见 §7）
│   │   ├── provider/                # 外部能力提供者
│   │   │   ├── payment/             #   共享支付 Provider（含 Telegram Stars）
│   │   │   └── gmap/                #   Collector 客户端与采集/补全
│   │   ├── runtime/                 # Export 任务运行时
│   │   ├── constants/               # 常量与枚举（按域 *.py）
│   │   ├── templates/               # 邮件等模板（email_verification.html）
│   │   └── utils/                   # 工具（见 §8）
├── config.yaml / config.yaml.example         # 统一运行配置
├── pyproject.toml / uv.lock                  # uv 管理
├── scripts/ / data/ / deploy/ / resources/
└── README.md                                 # 后端开发与运行说明
```

## 2. 分层约定

三段式：`api → service → model`。`schemas` 做请求/响应结构，`constants` 放枚举。

- **api 层**：做完所有参数判断和参数处理，**不把参数处理放到 service**；**不直接调用事务**（事务在 service 层）；FastAPI 依赖（`Depends`）只允许出现在 api 入口与 `*_dependencies.py`。
- **service 层**：**每个 service 都是类**（不是函数），函数写在类里或 `utils/` 里；继承 `BaseService[ModelType]`（泛型绑定 model_class）。事务在这里开。
- **model 层**：纯数据定义，继承 `BaseDBModel`。
- **utils/**：与 DB 无关的工具函数（crypto / time / money / redis_lock / email_sender / jwt / filename / geoip / network ...）。

HTTP 方法约束：**只能用 GET 和 POST**（根 `@../../../AGENTS.md` §3 红线 9）。无 PUT / PATCH / DELETE。

## 3. 异常与错误中间件

异常基类：`backend/src/app/exceptions/common_exception.py`
- `AppCommonException(code: CommonCode, ext_msg: str = "", *, data: dict | None = None, status_code: int | None = None)`：唯一业务异常，`code` 是 `i18n.common_code.CommonCode` 枚举，`ext_msg` 必须可定位（哪里的错误、错误的是什么、什么请求/接口/返回），`data` 携带 `wait_seconds` 等结构化附加；业务码与 HTTP 状态不同时由 `status_code` 显式指定。

错误中间件：`middleware/error_handling.py` 的 `ErrorHandlingMiddleware`（洋葱模型最内层）。处理顺序：
1. `AppCommonException` → `ResponseUtils.error(code, locale, data, status_code)`（**i18n 翻译**）；认证失败返回 HTTP 401，不记录异常堆栈。其他业务错误默认 HTTP 200，保留异常 ERROR 与堆栈（`@../../references/specs/spec-code.md` §2）；支付回调的分类应答见[支付失败分类与恢复边界](../004.订单系统/tech-支付与履约.md#81-失败分类与恢复边界)。
2. FastAPI `RequestValidationError` → 应用级异常处理器返回 `VALIDATION_ERROR` 统一信封与 HTTP 200；消息带首个错误字段路径，代理 URL 错误使用包含项号及修正格式的 i18n 文案，不记录敏感输入。
3. `pydantic.ValidationError` → 中间件翻译为 `VALIDATION_ERROR`。
4. 其他未捕获 `Exception` → 记录带 `exc_info` 的 error，返回 HTTP 200，响应体 `code=500`。

统一响应出口 `ResponseUtils.json()` 为所有非成功业务码记录一条 INFO，包含 `code`、HTTP 状态与翻译后的 `msg`，不记录请求输入或响应 `data`；请求访问日志继续保留。

约束（`@../../references/specs/spec-python.md` §6.3）：**不要乱加 try/except**。只有满足「释放资源 / 储存运行结果 / 即使出错也要继续往下」之一才加，否则让中间件统一处理。抛 `AppCommonException` 必须带详细 `ext_msg`。

中间件挂载顺序（`main.py._add_middlewares`，添加序与执行序相反）：
```
添加: ErrorHandling → CrossOrigin → RequestLogging
进入: RequestLogging → CrossOrigin → ErrorHandling → 路由
```
`RequestLoggingMiddleware` 注入 `request.state.request_id`（uuid4），慢请求阈值 1s（`SLOW_REQUEST_SECONDS`）。

生产业务 API 由 Nginx 统一重写 CORS 头：先隐藏 FastAPI 上游的同名头，再补充允许的 Origin、Methods、Headers 和预检缓存时间。所有 `add_header` 必须带 `always`，保证 401/403/500 与成功响应具有相同的跨域可读性；否则 Website 只能收到网络错误，无法按真实 HTTP 状态处理过期登录态。初始化和日常发布会经本机 Nginx 请求一次无效 `/api/client/auth/me`，只有同时得到 401 与 `Access-Control-Allow-Origin` 才通过健康检查。

## 4. 配置体系

入口：`core/config.py` 的全局 `settings = Settings()` 单例。模型在 `core/config_schema.py`。

- 配置来源：默认 `backend/config.yaml`，也可由 `Settings(config_path=...)` 显式指定。`Settings.__init__` 读 YAML → `_apply_config_data()` 映射为强类型子配置。
- 子配置由 `core/config_schema.py` 的 `Settings._apply_config_data` 定义：`app / database / logging / api / auth / redis / feishu_alarm / smtp / admin`；SMTP 是至少一个账号的列表，其余对应强类型配置对象。
- **统一进程**：现役配置没有 `app.role`、下载节点或下载 token 段；不再按 business/download 分派启动。Collector 连接配置属于 Maps 采集配置，入口见 [引擎 Provider](../014.Maps云端/tech-引擎Provider层.md)。
- **热加载**：`settings.reload()` 重新读文件再 `_apply_config_data`；`settings.load_candidate()` 与 `load_settings_candidate(path)` 不影响运行态、只做前置校验，失败抛 `ConfigReloadError`（聚合 YAML/文件系统/字段校验错误为可定位路径，供后台 reload 接口返回）。后台改配置走候选校验 → reload。
- 各 Settings 子类都是 `pydantic.BaseSettings`。

## 5. 数据库会话与 Redis

- **DB 会话**：`core/database.py`，`get_engine()` 单例异步引擎，`get_async_session()` 上下文管理器。`close_engine()` 在统一 lifespan shutdown 时调用。
- **Redis**：`core/redis.py` 的 `RedisClient` 单例（`BlockingConnectionPool` + `asyncio.Lock` 双检锁）。带 `RedisException / RedisConnectionError / RedisOperationError`。Redis 之上的能力在 `utils/`：`redis_lock`（分布式锁）、`redis_rate_limiter` / `redis_fixed_limiter`（限流）、`redis_queue`、`redis_key`（key 命名）。

## 6. crons 框架

> 对应 `feat.043.后端Crons定时任务框架`，由统一 lifespan 启停。

目录：`backend/src/app/crons/`
```
crons/
├── crons.py          # 稳定导出口：cron_scheduler = CronScheduler(CRON_TASKS)
├── registry.py       # CRON_TASKS 注册表（进程启动时唯一任务列表）
├── schedule.py       # CronTaskSpec / CronTaskKind / 各种超时常量
├── scheduler.py      # CronScheduler：注册表 + MySQL 游标 + 周期扫描
├── executor.py       # execute_claimed_task：超时取消 + 释放 DB 占用
└── task/             # 具体任务实现
    ├── maintenance.py        # log_cron_health（每小时）
    └── order_fulfillment.py  # compensate_paid_pending_subscription_orders（每分钟）
```

机制要点：
- **声明式注册**：`registry.CRONT_TASKS: list[CronTaskSpec]` 是唯一注册点。`CronTaskSpec(task_key, task, kind="interval", interval_seconds=...)`。新增任务只改 `registry.py` + 在 `task/` 加实现。
- **MySQL 游标 + 领取**：`cron_task_cursor_service` 在 `cron_task_cursors` 表记录每个 task_key 的上次执行/占用状态，调度器周期扫描到期任务、领取（防多实例重复）、执行、释放。
- **超时与取消**：`executor.execute_claimed_task` 用 `asyncio.wait_for(asyncio.shield(business_task), timeout)`；超时/取消后异步消费残留 task 并释放游标。
- **启动/停止**：`cron_scheduler.start()` / `.stop()` 由 `main.py._start_cron_scheduler` / `_stop_cron_scheduler` 在 lifespan 内调用。

## 7. 日志与 i18n

**后端日志**（`utils/logger.py`）：标准 `logging`，`setup_logger("server")` 配控制台 + 文件两个 handler，级别/格式/文件路径从 `settings.logging` 取。文件日志达到 100MiB 后 copy-truncate 到同目录 `.1` 备份并清空原文件，只保留当前日志和最近一份备份。Supervisor stdout/stderr 日志按 50MB 轮转，最多保留 3 份备份。**没有阿里云 SLS 接入**——SLS 在 website / extension 前端写入（见 `@tech-可观测与SLS.md`），后端不写 SLS。

**i18n**（`app/i18n/`）：
- `common_code.py`：`CommonCode` 错误码枚举。
- `translator.py`：`Translator` 从 `i18n/locales/*.json` 加载 14 语言翻译，`translate(key, language, **kwargs)` 多层 key 用点连接。
- `locales/`：14 份 JSON（de-DE / en-US / es-ES / fr-FR / id-ID / it-IT / ja-JP / ko-KR / pt-BR / ru-RU / th-TH / vi-VN / zh-CN / zh-TW）。
- `dependencies.py`：`LocaleContext` + `DEFAULT_LANGUAGE` + `LANGUAGE_MAPPING`；语言从请求取（`utils/common.get_locale(request)`）。
- 错误响应统一 `ResponseUtils.error(code, locale, data=...)`，中间件把 `AppCommonException` 翻译后返回。文字必须支持 i18n（根 `@../../../AGENTS.md` §3 红线 8）。

## 8. utils/ 能力清单

`backend/src/app/utils/`（与 DB 无关的纯工具，供 service/api 复用）：
```
common.py                 # get_locale 等通用
crypto.py                 # 加解密
email_sender.py           # SMTP 发信
feishu_utils.py           # 飞书告警/工具
geoip.py                  # 地理定位
jwt.py                    # JWT 签发/校验
money.py                  # 金额处理
network.py                # 网络工具
redis_fixed_limiter.py / redis_lock.py / redis_queue.py / redis_rate_limiter.py / redis_key.py
response.py               # ResponseUtils（统一响应封装）
time.py                   # 业务时间工具（America/New_York，见 @tech-数据库.md §2）
logger.py                 # setup_logger
```

`feishu_utils.py:send_feishu_alarm` 是唯一 Feishu 告警出口，组装最终文本时统一在标题后追加 `APP_NAME：{settings.app.name}`；业务调用方只提供领域正文，不重复拼接应用名。

## 9. 依赖注入禁令

根 `@../../../AGENTS.md` §3 红线 4：**新增代码不允许有依赖注入**。FastAPI 的 `Depends` 只允许出现在 **api 入口**与 `api/*_dependencies.py`，service/utils/内部不得引入 DI。`BaseService` 用泛型绑定 model_class、模块级单例（如 `user_service = UserService()`），不通过容器注入。

## 10. 应用 lifespan 与路由聚合

`backend/src/app/main.py` 的 `_create_lifespan()` 不接收 role：

- 启动 crons 与 `export_job_runtime`，在 MCP `session_manager.run()` 上下文内服务请求。
- 退出时停止 crons 与 Export runtime，关闭 `gmap_collector_client` 与业务 DB 引擎。
- **请求排空边界**：收到停止信号后立即停止监听新请求，存量请求最多等待 10 秒；超时取消存量请求，禁止长下载阻塞进程重启。

`create_app()` 聚合中间件、异常处理器与 `_include_business_routes()`。现役路由覆盖 `/api/client/*`、`/api/admin/*`、`/api/external/*`、`/api/system/*`、共享支付回调及 MCP/OAuth；没有 TG 解析/下载或 internal 节点路由。路由模块在模块顶部统一导入。
