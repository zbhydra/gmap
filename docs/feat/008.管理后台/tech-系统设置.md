# 008 · 系统设置

> 覆盖系统设置菜单的低频运维动作。通用 admin 接口约定见 `@tech-管理模块接口.md`。

## 范围

系统设置提供低频运维动作:

- 刷新配置读取缓存。
- 生成 / 轮换当前管理员的外部 API Key。
- 维护 gosom 抓取引擎的多条 API 配置(地址 / Key / 权重,存 `system_data`,调用方按权重随机选用)。
- 维护 Maps 云端的引擎选择、代理 URL 列表与每进程出站并发预算。

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
- `admin/src/views/SystemSettingsView.vue`,页面顶部包含"配置表缓存"、"API Key"、"Gosom API"三个 tab。
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

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| 系统设置 | `@backend/src/app/api/admin/admin_system_settings.py` | `@backend/src/app/services/admin_system_settings_service.py` |
| API Key | 同上 | `@backend/src/app/services/admin_api_key_service.py` |
| Gosom API 配置 | 同上 | `@backend/src/app/services/gosom_api_service.py`(读写 + 加权随机选取);键名常量在 `@backend/src/app/constants/gosom.py` |
| Gmap 引擎配置 | 同上 | `@backend/src/app/services/maps_engine_service.py`;运行合同见 `@../014.Maps云端/tech-引擎Provider层.md` §5.3 与 §7 |
