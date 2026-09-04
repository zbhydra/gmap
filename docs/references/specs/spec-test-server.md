# 后端测试规范

> AI 执行者编写后端测试的**强制规范**。所有新增测试必须遵守。
> 代码模板参考现有测试：@backend/tests/integration/real/api/client/test_auth_extension_login_real.py @backend/tests/integration/real/services/test_usage_service_real.py

## 1. 核心原则

1. **Real 测试优先**：real 测试必须使用本文件声明依赖的真实资源，如 MySQL、Redis、本地文件系统、OSS provider 行为。
2. **外部出口可替换**：不可控外部服务可以用明确返回值或明确异常的替身覆盖，如 SMTP、LLM、Feishu、外部 HTTP、OSS SDK 网络出口。
3. **先证明运行路径**：新增测试前，必须确认生产入口能够到达目标代码，且现有测试没有覆盖同一行为。
4. **禁止依赖注入**：不要为了测试而引入依赖注入。
5. **测试即文档**：函数名必须清晰描述被证明的业务行为，如 `test_real_extension_login_issue_exchange_flow_grants_extension_tokens`。
6. **测试业务，不测试框架**：Pydantic 类型检查、SQLAlchemy 参数化等框架行为不重复测试；同一业务流程的相邻断言不拆成多个测试。

## 2. 目录与命名

- 新增后端测试优先放 `integration/real/` 或 `integration/redis/`。
- 新增 real 测试按 `backend/src/app` 目录镜像放置，禁止直接放在 `backend/tests/integration/real/` 根目录。
- 文件命名：`test_{源码文件名}_real.py` / `test_{业务域}_flow_real.py` / `test_redis_{模块名}.py`。
- 函数命名：`test_real_{动作}_{场景}`。

目录映射：

| 源码目录 | Real 测试目录 |
|----------|---------------|
| `backend/src/app/api/**` | `backend/tests/integration/real/api/**` |
| `backend/src/app/services/**` | `backend/tests/integration/real/services/**` |
| `backend/src/app/crons/**` | `backend/tests/integration/real/crons/**` |
| `backend/src/app/middleware/**` | `backend/tests/integration/real/middleware/**` |
| `backend/src/app/provider/**` | `backend/tests/integration/real/provider/**` |
| `backend/src/app/utils/**` | `backend/tests/integration/real/utils/**` |
| `backend/src/app/models/**` | `backend/tests/integration/real/models/**` |
| `backend/src/app/init/**` | `backend/tests/integration/real/init/**` |
| `backend/scripts/**` | `backend/tests/integration/real/scripts/**` |

业务流测试放在最接近入口的目录：

- 端到端 API 流程：`real/api/client/`
- service 事务、数据一致性：`real/services/`
- 定时任务与恢复任务：`real/crons/`
- 运维与一次性脚本：`real/scripts/`
- 真实 provider 行为：`real/provider/`
- 跨目录共享 helper：`real/support/`，禁止放测试函数

## 3. 环境检测

每个 real 测试文件必须声明并检测本文件依赖的真实资源，不可用则 `pytest.skip`。

统一 skip code：

- MySQL 不可用：`REAL_MYSQL_UNAVAILABLE`
- Redis 不可用：`REAL_REDIS_UNAVAILABLE`
- OSS/外部存储不可用：`REAL_OSS_UNAVAILABLE`
- 必要表不存在：`REAL_SCHEMA_UNAVAILABLE`

示例：

```python
pytest.skip("REAL_MYSQL_UNAVAILABLE: MySQL 不可用，跳过 real 测试")
pytest.skip(f"REAL_REDIS_UNAVAILABLE: Redis 不可用，跳过 real 测试: {exc}")
pytest.skip(f"REAL_SCHEMA_UNAVAILABLE: 数据库缺少 {table_name} 表")
```

全量 real 测试前先执行环境 smoke。目标文件为 `tests/integration/real/api/system/test_health_api_real.py`。

```bash
uv run pytest tests/integration/real/api/system/test_health_api_real.py -rs
```

执行 real 测试必须带 `-rs` 输出 skip 原因：

```bash
uv run pytest -m real -rs
```

## 4. Fixture 要求

- **数据清理**：用 `_CleanupState` dataclass 记录创建的资源，fixture teardown 中按子表→父表顺序删除。
- **数据唯一性**：所有写入 DB 的数据必须包含 `test_run_id`，确保并行运行不冲突。
- **辅助函数**：以 `_` 开头，定义在测试文件顶部；多文件共用才放 `conftest.py`；内部也要 assert 关键步骤。
- **Real fixture 命名**：real 专用 fixture 必须放在 `backend/tests/integration/real/conftest.py` 或对应子目录 `conftest.py`，名称必须带 `real_` 前缀，如 `real_async_client`、`real_mysql_ready`、`real_redis_ready`、`real_cleanup_state`。
- **全局 fixture 约束**：`backend/tests/conftest.py` 禁止暴露 fake infra fixture，如 `fake_redis`、`fake_db`、`mock_service`、`mock_current_user`、`mock_permissions`。
- fake / mock fixture 只能放在允许 mock 的测试目录内，例如 `backend/tests/unit/conftest.py`，且不得被 `backend/tests/integration/real/**` 继承。

## 5. Mock / Monkeypatch 白名单

real 测试默认禁止 mock / monkeypatch 本系统内部逻辑。

允许替换的对象只限不可控外部出口：

- SMTP
- LLM provider
- Feishu 告警发送
- 外部 HTTP API
- OSS SDK 网络出口
- 日志根目录 / 临时文件目录
- 时间窗口边界

允许替换外部出口时，替身必须给出明确返回值或异常。仅当项目包含自定义响应映射，或失败会改变本地 DB、Redis、文件状态时，才增加对应的成功或失败用例。禁止 mock 本系统 service、DB、Redis、权限依赖或业务函数。

示例：

```python
class _FakeLlmProvider:
    async def complete(self, prompt: str) -> str:
        return "fixed translated text"


class _FailingLlmProvider:
    async def complete(self, prompt: str) -> str:
        raise TimeoutError("LLM timeout for real test")
```

## 6. 断言规范

- API 响应必须**同时断言** `status_code` 和 `body["code"]`
- 错误码必须用 `CommonCode` 常量，禁止硬编码数字
- 写入操作必须有**副作用断言**（再查一次确认 DB/Redis 状态变更）

## 7. 测试选择

默认只为一项业务能力保留一个最短主流程测试。新增测试必须同时满足：

1. 存在生产入口到目标代码的真实调用链。
2. 当前测试层不能证明该行为。
3. 覆盖的是项目自有逻辑，而不是依赖或框架的既有能力。

仅以下情况增加独立测试：

- 已发生且可能复发的缺陷。
- 金额、权限、数据丢失或并发一致性。
- 项目实现的非平凡分支、转换或错误映射。
- 外部服务失败会改变本地持久化状态。

不按方法、端点或字段规定最低用例数。同一行为在 API、service、数据访问层只保留最接近真实入口、证据最完整的一条测试。

## 8. 不测试的内容

- Pydantic 已声明的缺字段、错误类型和普通长度约束；自定义 validator 除外。
- SQLAlchemy 参数化已经保证的 SQL 注入转义。
- 没有业务语义的空列表、不存在记录、重复 ID 和普通 CRUD 分支。
- 旧数据、旧协议、旧版本兼容行为。
- 已删除的函数、字段、页面或入口是否仍然不存在。
- 为证明代码被删除、常量未变化或默认配置未变化而新增的测试。
- 尚无生产入口的实现；先接通并验证运行路径，再决定是否需要测试。

修复缺陷时只保留一个能复现该缺陷的回归测试。需要复杂 fixture、状态机、故障矩阵或大量参数化用例时，先确认是否可以缩小业务承诺或直接删除该分支。

## 9. 收集门禁

新增或调整 real 测试后，只执行相关测试文件。需要确认 real 标记时执行：

```bash
uv run pytest --collect-only tests/integration/real -q -m real
```

要求：

- 新增测试必须出现在收集列表。
- `integration/real/**` 下的测试必须能被 `-m real` 收集。
- 如存在非 real 测试，必须迁出 `integration/real/**`。

## 10. 禁止事项

| 禁止 | 原因 |
|------|------|
| `unit/` 下新增后端业务测试文件 | 统一用 real 测试 |
| `backend/tests/conftest.py` 暴露 `FakeRedis` | real 测试会继承 fake infra |
| `FakeRedis` 写 real 测试 | 不能验证 Lua 脚本和 Streams |
| `AsyncMock` / `monkeypatch` mock service | 不能验证真实 DB 交互（SMTP/LLM 除外） |
| 测试函数不带 `@pytest.mark.real` | 无法区分 real / unit 测试 |
| 不清理测试数据 | 污染数据库 |
| 固定 ID / email（不含 test_run_id） | 并行冲突 |
| 依赖测试执行顺序 | 每个测试必须独立可运行 |
| 断言中硬编码错误码数字 | 必须用 CommonCode 常量 |
| 测试或测试脚本写入 `config_*` 配置表 | 配置表是真实开发/部署配置，只能读取，不能由测试覆盖、禁用、删除或清理 |

## 11. Checklist

- [ ] `@pytest.mark.real` + `@pytest.mark.asyncio`
- [ ] 文件声明真实资源依赖
- [ ] 环境检测 fixture 使用统一 skip code
- [ ] 所有创建的数据注册到 cleanup_state
- [ ] cleanup 按依赖顺序清理
- [ ] 数据含 `test_run_id`
- [ ] 断言 `status_code` + `body["code"]`
- [ ] 写入有副作用断言
- [ ] 错误码用 `CommonCode`
- [ ] 已确认生产入口能够到达目标代码
- [ ] 未重复测试框架能力或已有业务行为
- [ ] 外部出口替身只覆盖项目自有映射或本地副作用
- [ ] 无本系统 service / DB / Redis / 权限依赖 mock
- [ ] 可独立运行
