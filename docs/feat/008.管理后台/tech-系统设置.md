# 008 · 系统设置

> 覆盖系统设置菜单的低频运维动作。通用 admin 接口约定见 `@tech-管理模块接口.md`。

## 范围

系统设置提供低频运维动作:

- 刷新配置读取缓存。
- 生成 / 轮换当前管理员的外部 API Key。
- 维护 gosom 抓取引擎的多条 API 配置(地址 / Key / 权重,存 `system_data`,调用方按权重随机选用)。
- 维护 Maps 云端的引擎选择、代理 URL 列表与每进程出站并发预算。
- 维护多套 R2 / AliOSS 对象存储配置与当前启用项。

除这些明确入口外,它不是通用配置编辑器。

> 历史能力「Google 数据采集」「Telegram DOM 覆盖」「Telegram Config」已分别随 GSC/GA4 采集退役(2026-08-31)与下载功能下线(2026-08 前后)整体移除,接口、前端 tab 与文档章节不再保留;详见各域 changelog。

## 刷新配置读取缓存

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/api/admin/system-settings/config-cache/refresh` | `get_admin_user` | 清空并重新加载当前业务进程内的配置读取缓存 |

响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `refreshed_services` | `string[]` | 本次已刷新服务名 |
| `refreshed_at` | `int` | 刷新完成时间,毫秒时间戳 |

刷新范围:

- `config_public_service`:公共配置缓存。
- `config_subscription_product_service`:订阅商品配置缓存。
- `config_subscription_product_price_service`:订阅商品价格配置缓存。
- `config_credit_product_service`:积分包商品配置缓存。
- `config_credit_product_price_service`:积分包价格配置缓存。
- `config_payment_channel_service`:支付渠道配置缓存。
- `payment_config_service`:订阅 checkout 聚合配置缓存;实际清理其依赖的配置表 service。
- `credit_checkout_config_service`:Credits checkout 聚合配置缓存;实际清理其依赖的配置表 service。
- `system_data_service`:后台可编辑系统数据配置缓存,TTL 30 分钟。

执行规则:

1. API handler 调用独立的 `admin_system_settings_service.refresh_config_caches()`。
2. service 先调用上述服务的 `clear_cache()` 清空进程内缓存。
3. service 随后对可直接重载的读取入口使用 `force_refresh=True` 重新读取一次数据库,确保接口成功返回时当前业务进程已经拿到最新配置。
4. 聚合服务可通过 `get_snapshot(force_refresh=True)` 重载,重复清理同一底层配置服务是幂等操作。
5. 任一配置读取失败时直接让异常上抛,由全局错误处理中间件返回失败;前端展示错误,管理员可重试。

边界:

- 只刷新当前业务服务器进程内缓存,不广播到其他业务进程。多进程 / 多实例部署时,管理员需要访问对应实例或等待对应配置服务的 TTL 自然过期;`system_data_service` 为 30 分钟。
- 不刷新下载解析缓存、Google JWK 缓存、监控缓存、Redis 缓存。
- 不新增依赖注入;API 层可继续使用 `Depends(get_admin_user)` 做鉴权。

前端:

- `admin/src/api/system-settings.ts` 封装 `refreshConfigCache()`。
- `admin/src/views/SystemSettingsView.vue`,页面顶部包含"配置表缓存"、"API Key"、"Gosom API"、"Gmap Engine"、"对象存储"五个 tab。
- 侧边栏"系统设置"菜单,路由名 `SystemSettings`,路径 `/system-settings`。
- 文案写入 `admin/src/i18n/zh-CN.json` 与 `admin/src/i18n/en-US.json`。

验收:

- 已登录管理员点击"系统设置"可进入 `/system-settings`。
- 点击"刷新配置缓存"时按钮 loading,不会重复提交;成功后出现成功提示并展示刷新时间。
- 后端接口成功后,公共配置、支付渠道、订阅商品/价格、积分包商品/价格及两个 checkout 聚合配置的后续读取不再使用旧缓存。
- 后端接口失败时前端展示失败提示,不清理登录态,管理员可再次点击。

## API Key 管理

管理员在系统设置页生成外部 API Key。API Key 只用于访问 `@tech-外部API.md` 定义的 `/api/external/*` 接口,不能用于登录后台、不能调用 `/api/admin/*`。

### 数据模型

`admins` 表字段:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `api_key_hash` | string \| null | API Key 哈希;不保存明文 |
| `api_key_prefix` | string \| null | API Key 前缀,用于后台展示和排查 |
| `api_key_created_at` | int \| null | API Key 生成时间,毫秒时间戳 |

索引:

- `api_key_hash` 加唯一索引,服务外部 API Key 鉴权按 hash 精确查管理员。

存储规则:

- API Key 原文只在生成成功响应中返回一次。
- 普通查询只返回 `api_key_prefix` 与 `api_key_created_at`,不返回原文。
- 重新生成会覆盖 `api_key_hash` / `api_key_prefix` / `api_key_created_at`,旧 key 立即失效。
- 暂不做多 key、过期时间、权限分组、调用审计。

### 接口

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/system-settings/api-key` | `get_admin_user` | 查询当前管理员 API Key 元信息 |
| POST | `/api/admin/system-settings/api-key` | `get_admin_user` | 生成 / 重新生成当前管理员 API Key |

`GET /api-key` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `has_api_key` | bool | 当前管理员是否已生成 API Key |
| `api_key_prefix` | string | API Key 前缀;没有时为空字符串 |
| `api_key_created_at` | int \| null | 生成时间 |

`POST /api-key` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `api_key` | string | 完整 API Key,只在本次响应返回 |
| `api_key_prefix` | string | API Key 前缀 |
| `api_key_created_at` | int | 生成时间 |

API Key 生成格式:

- 使用高熵随机字符串,前缀固定为 `tdm_`。
- `api_key_prefix` 保存前 12 位左右,用于确认当前 key。
- 哈希使用项目已有密码哈希工具或新增不可逆哈希工具;比较时使用恒定时间比较。

### 前端

- API Key 区块展示 `has_api_key`、`api_key_prefix`、生成时间。
- 未生成时按钮文案为"生成 API Key"。
- 已生成时按钮文案为"重新生成 API Key",点击前二次确认。
- 生成成功弹窗展示完整 API Key 与复制按钮,提示"只展示一次"。
- 弹窗关闭后页面只保留前缀与生成时间。

### 验收

- 首次生成后页面弹出完整 API Key,刷新后不再显示完整 key。
- 重新生成后旧 key 访问 `/api/external/*` 失败,新 key 可访问。
- 管理员停用后,其 API Key 不能继续访问外部 API。
- 数据库和日志中不出现 API Key 明文。

## Gosom API 配置

系统设置页维护 gosom 抓取引擎(014 云端线 / ROADMAP B4)的多条 API 配置,每条一行「地址 / Key / 权重」,后续抓取调用方按权重加权随机取一条使用。Key 按运维决策(2026-09-01 hydra)明文存储,不加密、不掩码回显。

### 数据模型

`system_data` 单行:

| 字段 | 值 |
| --- | --- |
| `data_key` | `gosom_api` |
| `data_value` | JSON 数组 `[{"base_url": string, "api_key": string, "weight": int}]` |

存储规则:

- 键名常量 `GOSOM_API_DATA_KEY` 收敛在 `app/constants/gosom.py`,消费方禁止散落硬编码。
- 读写与选取统一走 `gosom_api_service`(`get_items` / `save_items` / `pick`),底层仍是 `system_data_service.get/set`;保存后自动清空 30 分钟读取缓存,本进程立即拿到新值,无需再点「刷新配置缓存」,多进程部署时其他进程受 30 分钟 TTL 约束,与该入口同边界。
- `base_url` 归一化(剥首尾空白 + 末尾斜杠)由 pydantic schema 完成,消费方直接拼路径不会出现双斜杠。
- 整表覆盖保存:`items` 为空数组即清空全部配置;行数上限 100,权重取值 1-10000。
- 2026-09-01 前的旧格式(单对象 `{"base_url", "api_key"}`)在 `get_items` 读取时迁移为权重 1 的单行,下次保存即写回数组格式,无需数据迁移脚本。
- 不做密钥轮换历史与调用审计。

### 选取规则

抓取调用方统一通过 `gosom_api_service.pick()` 取 API:按各行 `weight` 加权随机选择一条(`random.choices`);未配置时返回 `None`,由调用方自行处理。

### 接口

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/system-settings/gosom-api` | `get_admin_user` | 查询配置列表;未配置时 `items` 为空数组 |
| POST | `/api/admin/system-settings/gosom-api` | `get_admin_user` | 整表覆盖保存配置 |

请求与响应 `data` 同构:

| 字段 | 类型 | 必传 | 说明 |
| --- | --- | --- | --- |
| `items` | array | 是 | 全部配置行;可为空数组(清空配置),≤100 行 |
| `items[].base_url` | string | 是 | http(s):// 开头,≤500 字符,末尾斜杠保存前剥掉 |
| `items[].api_key` | string | 是 | ≤500 字符 |
| `items[].weight` | int | 是 | 1-10000,加权随机选取的权重 |

校验由 pydantic schema 完成,失败走全局 `VALIDATION_ERROR`,不新增错误码。

### 前端

- "Gosom API" tab:配置行列表(地址 / Key / 权重三列 + 行删除按钮)+「添加 API」按钮 + 保存按钮;进入页面即加载回显,tab 顶部说明权重语义。
- 增删改都在前端行状态上完成,点保存才整表提交;任一行地址 / Key / 权重缺失时前端直接拦截提示,不发请求。
- 保存成功以后端返回值(归一化后)回填全部行。

### 验收

- 未配置时打开 tab 只有「添加 API」入口;添加两行保存后 `system_data` 的 `gosom_api` 为两行数组,重新打开回显一致且末尾斜杠被剥掉。
- 存在未填完整的行时无法保存;删除全部行后保存即清空配置,重新打开 `items` 为空。
- 旧单对象格式存量数据读取时自动按权重 1 的单行回显。

## Gmap 引擎配置

系统设置页提供 "Gmap Engine" tab，维护 HTTP / gosom 引擎选择、HTTP 代理 URL 列表和每个 business 进程的 Google 出站并发预算。代理的选取、重试与脱敏合同以 `@../014.Maps云端/tech-引擎Provider层.md` §5.3 为唯一事实源。

### 数据与接口

`system_data` 以 `gmap_engine` 单行整对象保存：

| 字段 | 类型 | 必传 | 说明 |
| --- | --- | --- | --- |
| `provider` | enum | 是 | `http` / `gosom`，新任务使用的引擎 |
| `proxies` | `string[]` | 是 | 完整代理 URL，0–100 条；HTTP 保存时至少 1 条 |
| `concurrency` | `int` | 是 | 每个 business 进程的 Google 出站并发预算，至少 1 |

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/system-settings/gmap-engine` | `get_admin_user` | 读取配置；未配置时返回默认视图 |
| POST | `/api/admin/system-settings/gmap-engine` | `get_admin_user` | 校验并整对象覆盖保存 |

保存时将每行首尾空白剔除，忽略空行，按规范化后完整 URL 去重并保留首次出现顺序。URL 只接受 `http`、`https`、`socks5`、`socks5h` scheme，必须有 host 和 port；用户名与密码作为 URL authority 的可选部分。HTTP + 空列表、URL 无效或并发预算小于 1 时返回全局 `VALIDATION_ERROR`，不新增错误码。

代理凭据按运维决策明文存储和回显，但不得进日志或错误文本。旧 `webshare: {endpoint, username, password}` 结构删除，不保留兼容读取或双写。

### 前端

- 引擎用 HTTP / Gosom 分段控件。
- 代理列表用全宽多行输入，每行一条完整 URL，高度至少 200px；支持一次粘贴一条或多条。
- 每进程并发预算用整数输入，宽 160px，最小值 1。
- Gosom 模式下代理列表仍可编辑，允许保存空列表；HTTP 模式下空列表时前端拦截并定位到输入区。
- 全部文案走 i18n；保存成功以后端返回的归一化对象回填。

### 验收

- HTTP 模式分别保存 1 条和多条代理，重载后顺序与内容一致。
- 多行粘贴中的空行与重复 URL 被正确归一化；非法 scheme、无 host/port 和 HTTP 空列表无法保存。
- Gosom 模式可保存空代理列表；系统日志、校验错误与前端通知中均不出现代理凭据。

## 对象存储配置

系统设置页提供“对象存储” tab，供管理员维护多套 R2 与 AliOSS 配置，同一服务类型可以有多套账号或 bucket，并选择一套供新任务使用。本节只定义后台配置读写与对应界面；Online 的配置绑定与旧对象过期合同见 `@../014.Maps云端/tech-Online任务与结果.md`，改造文件与执行步骤见 `@../014.Maps云端/plans/002.Online任务与结果基建.md` U1。

### 数据规格

`system_data` 使用唯一单行：

| 字段 | 值 |
| --- | --- |
| `data_key` | `object_storage` |
| `data_value` | 下述固定结构的 JSON 对象 |

```json
{
  "active_id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "R2 主存储",
      "provider": "R2",
      "account_id": "<account-id>",
      "bucket": "online-a",
      "access_key_id": "<access-key-id>",
      "secret_access_key": "<secret>"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "AliOSS 旧存储",
      "provider": "AliOSS",
      "endpoint": "https://oss-cn-hangzhou.aliyuncs.com",
      "bucket": "online-b",
      "access_key_id": "<access-key-id>",
      "access_key_secret": "<secret>"
    }
  ]
}
```

存储与校验规则：

- `items` 中每项有唯一 UUID `id`、显示名称 `name` 与 `provider`；`provider` 只接受 `R2 / AliOSS`，配置字段按对应类型校验。同类型条目可以重复，ID 不能重复。
- ID 由新增动作使用浏览器原生 `crypto.randomUUID()` 生成，固定保存为 36 字符字符串，不可编辑或复用。名称必填、最长 100 字符；其余配置字符串保存前剔除首尾空白，单字段最长 500 字符。
- 非空列表必须有一个有效 `active_id` 指向列表内条目；空列表的 `active_id` 为 `null`。切换启用项只改变该引用。
- 每个已保存条目的名称和该类型全部配置字段均必填，未启用条目也必须完整，因为历史任务仍会读取它。
- R2 字段为 `account_id / bucket / access_key_id / secret_access_key`；AliOSS 字段为 `endpoint / bucket / access_key_id / access_key_secret`。AliOSS endpoint 只接受 `http / https`，必须有 host，不含用户名、密码、query 或 fragment，path 只能为空或 `/`；保存时删除末尾 `/`。
- 已有 ID 的服务类型、账号定位和 bucket 不可原地变更；API 保存时与已有条目比对。R2 定位为 `account_id / bucket`，AliOSS 定位为 `endpoint / bucket`。可修改名称及轮换访问同一位置的凭据；更换存储位置通过新增配置完成。
- 凭据明文写入 `system_data`，GET 原值回显。请求体、响应体与凭据不得写入日志、后端异常消息、错误响应详情或前端错误通知；共享 SQLAlchemy engine 使用 `hide_parameters=True`。
- `object_storage_config_service.get_config` 通过 `system_data_service.system_data_info` 直接读取对应单行，不使用进程级配置缓存，确保保存后后续读取拿到新启用项与配置列表。无行时返回 `{active_id: null, items: []}`；已有行按新结构校验，非法数据返回不含凭据的内部错误。
- POST 整对象覆盖保存，增删条目与启用切换在同一次提交中生效。管理员在旧对象过期后删除旧配置；删除配置不删除 bucket、对象或历史任务，不扫描业务任务判断是否允许删除。

### 接口

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/system-settings/object-storage` | `get_admin_user` | 读取完整配置；未配置时返回默认空配置 |
| POST | `/api/admin/system-settings/object-storage` | `get_admin_user` | 校验并整对象覆盖保存，返回归一化结果 |

GET 响应 `data` 与 POST 请求、响应 `data` 均采用“数据规格”的固定结构，不增加包装字段。校验失败走全局 `VALIDATION_ERROR`，不新增错误码；鉴权失败沿用通用 Admin 接口错误合同。

### UI 与交互

- “对象存储”作为系统设置页 tab，沿用现有 Naive UI 布局。列表展示启用单选项、名称、服务类型、bucket 与编辑、删除操作；新增按钮打开类型选择与对应配置表单。
- 启用项使用单选控件，编辑和删除使用带可访问名称的图标按钮；切换和删除只修改本地表单，统一点击保存后提交。
- 新条目可选择 R2 或 AliOSS，填写名称及对应类型的字段；已有条目的 ID、类型与存储定位只读，可编辑名称及凭据。编辑表单中的 secret 使用 password input，GET 返回值完整回填。
- 删除当前启用项时，保存前必须另选一项或清空列表；删除操作需要确认，保留已保存的其余配置及其 ID。
- 加载时表单禁用；保存时显示 loading 并禁止重复提交。保存成功以后端归一化对象回填，失败保留编辑内容。校验、错误与按钮文案全部走中英文 i18n，不展示凭据值。

### 验收

- 未配置时列表为空且无启用项；同时新增两套 R2 和两套 AliOSS 后保存，重载时字段、固定 ID 与启用项一致。
- 切换启用项、修改名称或轮换凭据时，其余条目和历史 ID 保持不变；后续配置读取不等待进程缓存过期。
- 删除非启用旧配置后，其余条目仍可读取和选择；删除当前启用项时必须一并选择其他条目或清空列表。
- 重复 ID、不存在的启用 ID、缺少必填字段、非法 endpoint 及变更已有条目存储定位时，API 拒绝保存且不泄漏字段值。
- GET 与 POST 均要求管理员鉴权；日志、后端异常消息、错误响应详情与前端错误通知中不出现 access key、secret 或完整请求/响应体。

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| 系统设置 | `@backend/src/app/api/admin/admin_system_settings.py` | `@backend/src/app/services/admin_system_settings_service.py` |
| API Key | 同上 | `@backend/src/app/services/admin_api_key_service.py` |
| Gosom API 配置 | 同上 | `@backend/src/app/services/gosom_api_service.py`(读写 + 加权随机选取);键名常量在 `@backend/src/app/constants/gosom.py` |
| Gmap 引擎配置 | 同上 | `@backend/src/app/services/maps_engine_service.py`;运行合同见 `@../014.Maps云端/tech-引擎Provider层.md` §5.3 与 §7 |
| 对象存储配置 | 同上 | `@backend/src/app/services/object_storage_config_service.py`;键名常量在 `@backend/src/app/constants/object_storage.py` |
