# 008 · 系统设置

> 覆盖系统设置菜单的低频运维动作。通用 admin 接口约定见 `@tech-管理模块接口.md`。

## 范围

系统设置提供低频运维动作:

- 刷新配置读取缓存。
- 生成 / 轮换当前管理员的外部 API Key。
- 编辑 Google 数据采集配置,管理授权并手动触发一次采集。
- 编辑 Telegram DOM 全局稀疏覆盖对象,供扩展打开 Telegram 页面时读取。
- 编辑独立的 Telegram Config 全局稀疏配置对象,供新版扩展打开 Telegram 页面时读取。

除 Google 数据采集、Telegram DOM 和 Telegram Config 三个明确配置入口外,它不是通用配置编辑器。

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

- 只刷新当前业务服务器进程内缓存,不广播到 download 节点或其他业务进程。多进程 / 多实例部署时,管理员需要访问对应实例或等待对应配置服务的 TTL 自然过期;`system_data_service` 为 30 分钟。
- 不刷新下载解析缓存、Reddit / Threads 等媒体解析缓存、Google JWK 缓存、监控缓存、Redis 缓存。
- 不新增依赖注入;API 层可继续使用 `Depends(get_admin_user)` 做鉴权。

前端:

- 新增 `admin/src/api/system-settings.ts`,封装 `refreshConfigCache()`。
- 新增 `admin/src/views/SystemSettingsView.vue`,页面顶部包含"配置表缓存"、"API Key"、"google 数据采集"、"Telegram DOM"、"Telegram Config"五个 tab。
- 侧边栏新增"系统设置"菜单,路由名 `SystemSettings`,路径 `/system-settings`。
- 文案写入 `admin/src/i18n/zh-CN.json` 与 `admin/src/i18n/en-US.json`。

验收:

- 已登录管理员点击"系统设置"可进入 `/system-settings`。
- 点击"刷新配置缓存"时按钮 loading,不会重复提交;成功后出现成功提示并展示刷新时间。
- 后端接口成功后,公共配置、支付渠道、订阅商品/价格、积分包商品/价格及两个 checkout 聚合配置的后续读取不再使用旧缓存。
- 后端接口失败时前端展示失败提示,不清理登录态,管理员可再次点击。

## API Key 管理

管理员在系统设置页生成外部 API Key。API Key 只用于访问 `@tech-外部API.md` 定义的 `/api/external/*` 接口,不能用于登录后台、不能调用 `/api/admin/*`、不能调用节点本地 JWT-only 接口。

### 数据模型

在 `admins` 表新增字段:

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

## Telegram DOM 覆盖

Telegram DOM 使用一份全局、稀疏、顶层 JSON 对象。后端不知道扩展版本，也不维护字段 schema；客户端完整默认值与已知键合同见 `@../002.下载功能/tech-扩展端TG扫描.md` §4.7。

### 数据合同

- 存储复用 `system_data.data_key="telegram_dom"`，`data_value` 保存管理员提交的完整顶层对象；不新增表、字段或索引。
- 记录不存在时读取结果为 `{}`。Admin 首次打开因此显示空对象，不从任何扩展版本反推默认值。
- 保存使用现有 upsert 与缓存清理能力。公共读取与 Admin 读取按 `data_key` 精确查当前数据库值，不使用 `system_data` 的 30 分钟全表读取缓存，保证保存后新打开或刷新的 Telegram 页面能读到新值。
- 顶层对象允许缺少任意键，也允许未知键；后端原样保存和返回，不补默认、不裁剪、不排序、不按扩展版本拆分。
- 对象值允许任意 JSON value。后端不检查已知字段类型，不验证 selector 语法，也不判断字段是否属于当前扩展。
- 请求 JSON 无法解析或顶层为数组、字符串、数字、布尔值、`null` 时不保存。这只是保证 `data_value` 为对象的存储合同，不扩展为逐字段严格校验。
- 同名键覆盖的语义完全由各客户端版本负责；缺少键由客户端包内默认值补齐，多余键由不认识它的客户端忽略。

配置示例只展示稀疏覆盖，不包含版本层级：

```json
{
  "aMessageSelector": ".Message, .new-message",
  "aStoryActiveViewerSelector": "#StoryViewer.shown"
}
```

### 接口

下列表格中的“响应”均指项目统一响应 envelope 的 `data`。三个接口都直接以 Telegram DOM 对象作为 `data` 或请求体，不再包一层 `config`。

| 方法 | 路径 | 鉴权 | 请求 | 响应 | 说明 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/client/tg/dom-config` | 无 | 无 | JSON object | 扩展每个 Telegram document 读取一次；记录不存在返回 `{}` |
| GET | `/api/admin/system-settings/telegram-dom` | `get_admin_user` | 无 | JSON object | Admin 读取当前稀疏对象 |
| POST | `/api/admin/system-settings/telegram-dom` | `get_admin_user` | JSON object | JSON object | 原样覆盖保存并返回已保存对象 |

接口边界：

- 公共接口只暴露 DOM selector、class/attribute 名和语义前缀等本就存在于 Telegram 页面或扩展包内的信息，不返回其他 `system_data` 键。
- Admin GET/POST 沿用统一 admin JWT 鉴权；API 层可继续使用 `Depends(get_admin_user)`，不新增依赖注入。
- Admin POST 只有 JSON 解析和顶层对象判断。解析失败、顶层类型错误、数据库写入失败分别沿用项目统一请求校验或服务端错误响应，不增加 DOM 专用错误码。
- 扩展读取失败时由客户端使用本地默认值；后端不做重试、降级对象、版本选择或旧值回滚。

### Admin 前端

- `SystemSettingsView.vue` 增加第四个 `Telegram DOM` tab；第一次进入该 tab 时读取一次，切换离开再返回不自动重复请求，读取失败时由管理员点击重试。
- 编辑器使用全宽 `NInput type="textarea"`，等宽字体，最小高度 360px。服务端返回 `{}` 时文本固定显示 `{}`；不注入客户端默认对象和字段清单。
- 保存只由显式按钮触发，不自动保存。点击时解析当前文本，并且只判断结果是不是非数组顶层对象；通过后原样提交。
- JSON 解析或顶层对象错误在编辑器下方显示，按钮不发请求；保存失败保留当前文本，成功后保留当前文本并提示刷新 Telegram 页面生效。
- 不自动格式化，不排序键，不删除未知键，不提供“恢复默认”、版本选择、历史或回滚。管理员需要清空全部覆盖时手工输入并保存 `{}`。
- 新增中英文 i18n 文案：tab 名、保存、保存成功、读取失败/重试、JSON 解析错误、顶层对象错误和刷新 Telegram 页面生效提示。

### 验收

- `telegram_dom` 记录不存在时，公共接口和 Admin GET 都返回 `{}`。
- Admin 可保存只有一个键的对象；再次读取逐项相同，后端不补客户端默认键。
- Admin 可保存包含未知键、未来键或任意 JSON value 的对象；再次读取不丢失这些项。
- 非 JSON 和非对象顶层值不能保存；缺少已知字段、存在多余字段、已知字段类型异常或 selector 语法异常不被逐字段拒绝。
- 公共接口无需用户或 admin 登录，且只能读取 `telegram_dom`；Admin 两个接口未登录时不可访问。
- Admin 保存 `{}` 后没有“恢复默认”语义，只表示远端不覆盖；各扩展版本继续使用各自包内默认值。
- 保存成功后，新打开或刷新的 Telegram 页面可读到新对象；已经打开的页面不热更新。
- 不存在扩展版本上报、按版本响应、配置历史、Redis、锁、轮询、WebSocket 或持久客户端缓存。

## Telegram Config

Telegram Config 是新版扩展独立使用的全局、稀疏、顶层 JSON 对象。它与现有 Telegram DOM 配置的接口、存储、Admin 编辑状态和客户端消费方完全独立,不迁移、不投影、不双写。新版扩展的完整默认值与字段消费合同见 `@../002.下载功能/tech-扩展端TG扫描.md` 和 `@../002.下载功能/tech-Telegram大文件与资源元数据.md`。

### 数据合同

- 存储复用 `system_data.data_key="telegram_config"`,`data_value` 保存管理员提交的完整顶层对象;不新增表、字段或索引。
- 记录不存在时读取结果为 `{}`。Admin 首次打开因此显示空对象,不展示扩展包内默认值,也不读取现有 `telegram_dom`。
- 顶层允许缺少分组、缺少字段和出现未知键;后端原样保存和返回,不补默认、不裁剪、不排序、不按扩展版本拆分。
- 对象值允许任意 JSON value。后端与 Admin 只校验请求可解析为非数组顶层对象,不维护字段表单或扩展版本 schema。
- 管理员保存 `{}` 只表示取消全部远端覆盖。默认值、已知字段类型和未知字段消费由各版本扩展在客户端边界处理。

### 接口

下列表格中的“响应”均指项目统一响应 envelope 的 `data`;配置对象直接作为 `data` 或请求体,不增加 `config` 包装。

| 方法 | 路径 | 鉴权 | 请求 | 响应 | 说明 |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/client/tg/config` | 无 | 无 | JSON object | 新版扩展每个 Telegram document 读取一次;记录不存在返回 `{}` |
| GET | `/api/admin/system-settings/telegram-config` | `get_admin_user` | 无 | JSON object | Admin 读取当前稀疏对象 |
| POST | `/api/admin/system-settings/telegram-config` | `get_admin_user` | JSON object | JSON object | 原样覆盖保存并返回已保存对象 |

接口边界:

- 公共接口只读取 `telegram_config`,不读取或回退到 `telegram_dom`;旧 Telegram DOM 三个接口保持不变。
- Admin GET/POST 沿用统一 admin JWT 鉴权。POST 只有 JSON 解析和顶层对象判断,不增加 Telegram Config 专用错误码。
- 配置读取、保存或客户端消费失败不触发新旧配置之间的复制、回退或恢复。

### Admin 前端

- `SystemSettingsView.vue` 增加独立的 `Telegram Config` tab;第一次进入时读取一次,切换离开再返回不自动重复请求,读取失败时由管理员点击重试。
- 编辑器使用全宽 `NInput type="textarea"`,等宽字体,最小高度 360px。服务端返回 `{}` 时文本固定显示 `{}`。
- 保存只由显式按钮触发,保存中禁止重复提交。JSON 解析或顶层对象错误在编辑器下方显示且不发请求。
- 保存成功和失败都保留当前文本;成功时提示刷新 Telegram 页面生效,失败时允许再次保存。
- 不自动格式化,不展示扩展默认值,不提供字段表单、自动保存、“恢复默认”、版本、历史或回滚。

### 实现文件

- `admin/src/api/system-settings.ts`
- `admin/src/views/SystemSettingsView.vue`
- `admin/src/i18n/zh-CN.json`
- `admin/src/i18n/en-US.json`
- `admin/e2e/system-settings.spec.ts`

### 验收

- Admin 首次进入 Telegram Config tab 时独立读取一次;未配置显示 `{}`,失败时提供显式重试。
- Admin 可保存空对象、缺少分组或字段、包含未知键和任意 JSON value 的顶层对象,保存后保留原文本。
- 非 JSON 和非对象顶层值不能提交;保存失败保留未保存文本。
- Telegram Config 的读取、保存和错误状态不改写 Telegram DOM 文本、接口调用次数或已保存内容。
- 保存成功后,新打开或刷新的 Telegram 页面可读取新对象;已经打开的页面不热更新。
- 不新增 UI 组件、依赖、表、字段、索引、版本、历史或回滚能力。

## Google 数据采集

系统设置页提供 Google Search Console / GA4 数据采集的运维入口。敏感 token 不在前端展示。

### 接口

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/system-settings/google-data/status` | `get_admin_user` | 查询后端配置、授权和最近采集状态 |
| POST | `/api/admin/system-settings/google-data/config` | `get_admin_user` | 保存 Google 数据采集配置;写入 `system_data` 后清空缓存 |
| POST | `/api/admin/system-settings/google-data/oauth/authorize` | `get_admin_user` | 创建 Google OAuth 授权 URL |
| POST | `/api/admin/system-settings/google-data/disconnect` | `get_admin_user` | 断开 Google 数据授权 |
| POST | `/api/admin/system-settings/google-data/collect-once` | `get_admin_user` | 手动触发一次 Google 数据采集 |

`GET /google-data/status` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `configured` | bool | Google OAuth、GSC、GA4 必要配置是否完整 |
| `authorized` | bool | 是否已有有效授权 |
| `last_authorized_at` | int \| null | 最近授权时间,毫秒时间戳 |
| `last_gsc_success_at` | int \| null | 最近 GSC 成功时间,毫秒时间戳 |
| `last_gsc_error_msg` | string | 最近 GSC 错误摘要 |
| `last_ga4_success_at` | int \| null | 最近 GA4 成功时间,毫秒时间戳 |
| `last_ga4_error_msg` | string | 最近 GA4 错误摘要 |
| `gsc_site_url` | string | 已配置的 GSC Site URL |
| `ga4_property_id` | string | 已配置的 GA4 Property ID |
| `client_id` | string | 已配置的 Google OAuth Client ID |
| `client_secret_configured` | bool | 是否已配置 Google OAuth Client Secret;不返回密钥明文 |
| `redirect_uri` | string | 后端按 `app.public_api_base_url + /api/admin/system-settings/google-data/oauth/callback` 自动生成的 OAuth 回调地址 |

`POST /google-data/config` 请求:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `client_id` | string | Google OAuth Web Client ID |
| `client_secret` | string | Google OAuth Web Client Secret;留空表示保留已保存密钥 |
| `gsc_site_url` | string | Search Console Site URL;裸域名保存时归一化为 `sc-domain:域名`,显式 `https://...` 按 URL-prefix 属性保留 |
| `ga4_property_id` | string | GA4 Property ID |

保存规则:

- `client_id`、`client_secret`、`gsc_site_url`、`ga4_property_id` 保存到 `system_data.data_key="google_data"` 的 JSON 值。
- `gsc_site_url` 保存前统一归一化:裸域名如 `telegramdownloadmedia.com` 存成 `sc-domain:telegramdownloadmedia.com`;只有管理员明确填写 `http://` 或 `https://` 时才作为 URL-prefix 属性采集。
- `redirect_uri` 不保存到 `system_data`,由后端从 `app.public_api_base_url` 和固定 callback path 生成。
- `system_data_service` 读取缓存 TTL 为 30 分钟。
- 写入后立即清空本进程 `system_data_service` 缓存。
- status 和保存响应都不返回 `client_secret` 明文。

`POST /google-data/oauth/authorize` 请求:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `admin_return_base_url` | string | 授权完成后的 Admin SPA 回跳根地址;前端传 `window.location.origin` |

`POST /google-data/oauth/authorize` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `authorization_url` | string | Google OAuth 授权跳转地址;Google 回调地址是后端 API callback,Admin 回跳地址保存在一次性 state |

`POST /google-data/disconnect` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `disconnected` | bool | 是否已断开授权 |

`POST /google-data/collect-once` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `gsc_saved` | bool | 本次是否保存 GSC 快照 |
| `ga4_saved` | bool | 本次是否保存 GA4 快照 |
| `errors` | string[] | 本次采集错误摘要 |
| `collected_at` | int | 采集完成时间,毫秒时间戳 |

### 前端

- `admin/src/api/system-settings.ts` 封装 Google 数据配置保存、状态、授权、断开授权、单次采集 API。
- `admin/src/views/SystemSettingsView.vue` 的"google 数据采集"tab 提供 Google OAuth Client ID、Client Secret、GSC Site URL、GA4 Property ID 表单;OAuth 回调地址不展示,由后端生成,Client Secret 不回显,留空保存时表示保留旧值。
- 初始进入页面同时加载 API Key 和 Google 数据状态;任一区块失败只展示本区块重试状态。
- 配置不完整时禁用授权和采集按钮,提示先在本页补齐配置。
- 未授权时展示"授权 Google 数据";点击后创建授权 URL 并跳转。
- 已授权时展示"重新授权"、"断开授权"、"立即采集一次";断开前二次确认。
- 单次采集完成后展示 GSC/GA4 保存结果、采集时间和错误摘要;只要 `errors` 非空就弹出错误摘要,随后刷新 status。
- 页面展示窗口口径提示: GSC 24H 用 Search Console fresh hourly;GSC 7D/28D 用 PT 最近完整日;GA4 30m 用 Realtime activeUsers;GA4 today/7D/28D 用 property reporting time zone 且 7D/28D 包含今天。
- OAuth callback 处理完 Google token 后,按一次性 state 中的 `admin_return_base_url` 跳回 `/system-settings?google_data_authorized=1` 或 `/system-settings?google_data_error=...`;前端展示提示并用 `replace` 清理 query。

### 验收

- Google 数据状态展示不包含 refresh token 或其他敏感信息。
- Google 数据状态和保存响应不包含 `client_secret` 明文。
- 状态接口失败时 API Key 区块仍可正常使用,Google 区块提供重试入口。
- 管理员可在后台保存 Google OAuth、GSC、GA4 采集配置;保存后清空 `system_data` 缓存。
- 配置缺失、未授权、已授权三类状态的按钮可用性符合预期。
- 手动采集允许部分失败,前端展示 `errors` 而不是吞掉错误摘要。

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| 系统设置 | `@backend/src/app/api/admin/admin_system_settings.py` | `@backend/src/app/services/admin_system_settings_service.py` |
| API Key | 同上 | `@backend/src/app/services/admin_api_key_service.py` |
| Telegram DOM | `@backend/src/app/api/admin/admin_system_settings.py`, `@backend/src/app/api/client/tg_client.py` | `@backend/src/app/services/system_data_service.py` |
| Telegram Config | `@backend/src/app/api/admin/admin_system_settings.py`, `@backend/src/app/api/client/tg_client.py` | `@backend/src/app/services/system_data_service.py` |
| Google 数据采集 | `@backend/src/app/api/admin/admin_system_settings.py` | `@backend/src/app/services/google_data_oauth_service.py`, `@backend/src/app/services/google_metrics_collect_service.py` |
