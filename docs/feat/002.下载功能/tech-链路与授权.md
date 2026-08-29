# 002 · V2 链路与授权(流程 + Token + 接口规格)

> 技术实现文档。覆盖:V2 协议链路、下载 token、V2 四接口规格(parse-pre-v2 / parse-v2 / download-pre-v2 / download-v2)、扣积分去重、4GiB 保护、完整流程图。
>
> 关联:
> - 本域产品:`@feat.md`
> - 下载方法与续传:`@tech-下载方法与续传.md`
> - 速率治理:`@tech-速率治理.md`
> - 后端 Provider 架构:`@tech-后端媒体Provider架构.md`
> - 前端切换:`@tech-前端切换.md`
> - 执行环境/角色/路由/调度:`@../001.节点系统/feat.md`
> - 计费/扣费规则:`@../003.积分系统/feat.md`
>
> 来源:原 `feat.041 §2 V2 协议链路 / §3 节点与 session(V2部分)/ §4 下载 token / §5 API 规格` 全部接口规格与错误码。

## 1. V2 协议链路

新前端所有 Download 按钮统一走:

```text
parse-pre-v2 -> parse-v2 -> download-pre-v2 -> download-v2
```

阶段职责:

| 阶段 | 控制面/执行面 | 角色 | 职责 |
| --- | --- | --- | --- |
| `parse-pre-v2` | 控制面 | 仅业务服务器 | 返回有序解析节点列表(最多 3 个) |
| `parse-v2` | 执行面 | 业务 + 下载 | 节点本地解析资源,返回通用 media schema |
| `download-pre-v2` | 控制面 | 仅业务服务器 | 校验登录、扣积分、签发下载 token、返回下载节点列表 |
| `download-v2` | 执行面 | 业务 + 下载 | 验签 token,调用 Provider 执行,返回文件流/直链/轨道 |

`download-v2` 是统一执行端点(不是 TG 专用):`proxy` 返回文件流,`direct` 返回直链 JSON,`client_mux` 返回轨道 JSON。业务服务器不在下载授权阶段重新解析资源;direct URL / client_mux tracks 由节点的 `download-v2` 返回。

下载 token 不绑定节点,客户端可能把同一 token 发给多个节点。客户端只在节点超时、连不上、DNS/TCP/TLS 失败、网关不可达或返回 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE` 时换下一个;已配置 session 但上游无权限、资源不存在、文件过大、token 错误等明确业务错误不盲目切节点。

平台已识别但当前节点缺 Provider 属于节点不可用,不是平台不支持:parse-v2 返回 `MEDIA_PARSE_NODE_UNAVAILABLE`,download-v2 返回 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE`,均带 `data.reason = "provider_missing"`。

## 2. 下载 token

### 2.1 语义

下载 token 是短期 JWT,用于证明业务服务器已完成额度判断和授权签发。下载节点只验签和校验时间,不回查业务数据库。

token 有效期内允许重复下载。浏览器多次 Range 请求、网络重试、刷新页面后重试或换节点续传时,复用同一 token。首阶段不维护 token 消费状态,不按 `jti` 一次性核销;`jti` 只用于日志关联、问题排查和后续风控统计。

### 2.2 claims

```json
{
  "typ": "media_download",
  "v": 1,
  "platform": "telegram",
  "download_mode": "proxy",
  "link": "https://t.me/channel/123",
  "sid": "123456789",
  "size": 104857600,
  "uid": 123,
  "proxy_user_rate_limit_bytes_per_second": 524288,
  "extra": { "tg_client_ref": "a5c8..." },
  "iat": 1234567890,
  "exp": 1234571490,
  "jti": "uuid"
}
```

| 字段 | 说明 |
| --- | --- |
| `typ` | 固定 `media_download` |
| `v` | token 版本,首版 `1` |
| `platform` | 平台标识,例如 `telegram`、`reddit`、`douyin` |
| `download_mode` | `proxy` / `direct` / `client_mux` |
| `link` | canonical link |
| `sid` | source_id(= API 层 `source_id`) |
| `size` | 文件大小,未知时 `null` |
| `uid` | 登录用户 ID |
| `proxy_user_rate_limit_bytes_per_second` | proxy 下载用户级限速,单位 bytes/s |
| `extra` | Provider 私有 JSON object;来自 parse 阶段,只原样透传给同平台 Provider 的 download |
| `iat` / `exp` | 签发 / 到期时间,Unix 秒 |
| `jti` | token 唯一 ID |

resource token 可携带 `filename` 快照用于展示和扣费记录;media download token 不依赖它生成文件响应头。proxy 文件响应名以 `StreamDownloadResult.filename` 为候选,API/service 清理和编码后再写 `Content-Disposition`。不保存节点列表、缩略图、完整解析结果。

`extra` 是平台私有定位材料,不是授权边界。字段名固定叫 `extra`;是否加密是 token 编码策略,不通过更换字段名表达。公共层只签名、验签、原样透传,不读取其中字段做业务分支。JWT 只签名不加密,客户端可解码看到 `extra`,因此不能放直链、cookie、secret 或真实手机号;敏感材料要么放服务端缓存,extra 只放缓存 key;要么后续把 token 改成加密方案。

`extra` 必须是 JSON object,compact JSON 后不超过 2048 bytes,最大嵌套深度不超过 4。resource token issuer 在签发前校验可序列化和大小;失败时不签发 token,返回 `MEDIA_PARSE_NODE_UNAVAILABLE` + `data.reason = "invalid_extra"`。缓存 key 必须随机不可猜测,缓存记录绑定 `platform`、`canonical_link`、`source_id`、过期时间;含用户敏感材料时还绑定 `uid`。不能绑定“当前 token jti”:resource token 与 media download token 的 `jti` 不同,download-v2 看不到 resource token jti。token 不绑定节点,因此下载必需的 cache key 必须指向共享缓存且 TTL 覆盖 token TTL。节点本地材料只能作为可失效 hint,缺失时 Provider 必须降级到普通解析/账号池路径;必须依赖节点本地缓存的平台,后续要单独设计 node-bound 候选过滤,并且过滤发生在 `download-pre-v2` 扣费前。

Telegram 的 `extra.tg_client_ref` 是账号亲和提示:下载节点优先尝试该 client,失败后允许回退账号池原调度。该字段使用 `sha256(phone + "***SEC***")`,避免暴露明文手机号或裸手机号 hash。它只影响同进程账号亲和;亲和失效时回退普通账号池调度。

该亲和只在 parse 与 download 落到同一节点且该节点仍持有对应账号状态时产生收益;跨节点时退化为普通账号池调度。

### 2.3 TTL 分档(二进制单位)

| 文件大小 | token 有效期 |
| --- | --- |
| 未知(`null`) | 6 小时 |
| `0 <= size <= 100MiB` | 1 小时 |
| `100MiB < size <= 500MiB` | 3 小时 |
| `500MiB < size <= 4GiB` | 6 小时 |
| `size > 4GiB` | 拒绝签发 |

`size=0` 表示上游确认为 0 字节资源,允许签发并归入 `0 <= size <= 100MiB` 的 1 小时 TTL。无法识别大小时用 6 小时。`size=null` 不等于无限制下载,`download-v2` 必须继续 4GiB 上限保护。

### 2.4 签名与轮换

非对称签名(`EdDSA`)。`business` role 配置签发私钥 + 验签公钥列表;`download` role 只配置验签公钥列表。`business` role 才暴露签发入口;`download` role 即使误配 `private_key` 也只挂 token 下载和验签路径。

验签流程:

1. 固定只接受配置指定算法。
2. 依次用 `download_token.public_keys` 中的公钥尝试验签。
3. 任一公钥验签成功即通过。
4. 全部失败则返回 token 无效。

不依赖 `kid`。密钥轮换流程:

1. 业务服务器配置新私钥;所有节点配置新公钥,并保留上一轮公钥。
2. 业务服务器切换到新私钥签发。
3. 等待最长 token TTL 过期,再加时钟偏移缓冲。
4. 所有节点删除上一轮公钥。

公钥列表只保留当前和上一个轮换窗口内的 key,避免过期 key 长期有效。

> 角色模型、`app.role` 配置口径、按角色组装路由见 `@../001.节点系统/feat.md` 及其 tech 文档。

### 2.5 传输

`download-v2` 用 POST body 传 token,不用 query:

```text
POST /api/client/media/download-v2
Content-Type: application/json

{"token":"<download_token>"}
```

- 同路径保留浏览器原生下载 GET 能力:`GET /api/client/media/download-v2?token=<download_token>`。Website 的 `proxy` 默认使用 POST;只有 POST 所需的 origin storage 预检失败时才把完整 action plan 自动切换为 GET。`direct` / `client_mux` 不使用该 fallback。POST body 与 GET query 的 token 长度合同统一为 1..8192 字符;Nginx 使用 16 KiB 请求行 buffer 覆盖路径和请求头开销。
- POST 方式不需要下载 URL 长度预算,也不会把 token 放进浏览器地址栏、Referer 或 nginx query 日志。
- GET 入口会把 token 放入 query,启用时前端必须使用 `_blank + noopener + no-referrer`,后端响应仍 `Cache-Control: no-store`。原生导航无法观测文件响应,因此只记录 start/handoff,不记录 download success 或命中节点。
- `download-v2` 响应必须返回 `Cache-Control: no-store`。
- 应用日志不能记录完整 token;排查时只记录 token hash 或 `jti`。业务节点和下载节点的 Nginx 模板对 `download-v2` 及其尾斜杠形式使用不含 query 的 access log 并关闭 error log,其他 API 保留既有日志。
- CORS 不进入应用配置;跨域由 nginx 或部署层按实际域名放行。

### 2.6 resource token 边界

`parse-v2` 给每个 resource 签发的 `resource_token` 不是 media download token。它用于把 parse 结果交给 `download-pre-v2` 做登录、扣额度和 media download token 签发。

- `resource_token` 使用 `HS256` 和 `download_token.resource_token_secret`。
- `business` 与 `download` role 都可能挂 `parse-v2`,因此都必须持有 `resource_token_secret` 才能签发 resource token。
- `media_download` token 使用 `EdDSA`;`download` role 只需要验签公钥,不需要 media download 私钥。
- `extra` 在 `resource_token` 和 `media_download` token 中都是必填 claim；无平台私有数据时写空 object。

## 3. 接口规格

### 3.1 parse-pre-v2(解析控制面,仅业务服务器)

```text
POST /api/client/media/parse-pre-v2
```

请求:

```json
{ "link": "https://t.me/channel/123" }
```

响应:

```json
{
  "nodes": [
    { "node_id": 2, "url": "https://dl-sg-1.example.com/api/client/media/parse-v2" },
    { "node_id": 1, "url": "https://api.example.com/api/client/media/parse-v2" }
  ]
}
```

规则:

- 请求必须通过 Website 设备可信校验;未建立或已过期时返回 `AUTH_PAGE_REFRESH_REQUIRED`,前端提示用户刷新页面后重试。IP 不参与拒绝,只用于日志排障。
- 返回最多 3 个健康、启用、`weight>0` 且 URL 合法的统一候选节点;不按平台或下载模式过滤。
- 没有健康下载节点时,可返回健康可用且 `weight>0` 的业务节点;候选池为空时返回节点不可用。
- 不强制登录,不扣额度,不签发下载 token。
- link 校验只管空值、协议、长度;真实平台识别由 `parse-v2` 执行,不按平台过滤节点。
- 客户端记录本次解析成功的 Pre 节点 `node_id`,作为后续 `download-pre-v2` 的 `preferred_node_id`(仅亲和提示)。

错误契约:

| 场景 | HTTP | 业务 code | 前端动作 |
| --- | --- | --- | --- |
| 设备可信关系缺失或过期 | 200 | `AUTH_PAGE_REFRESH_REQUIRED` | 刷新页面后重试 |
| link 缺失或格式非法 | 400 | `MEDIA_PARSE_PRE_INVALID_LINK` | 展示输入错误 |
| 没有任何可返回节点 / 节点选择失败 | 503 | `MEDIA_SERVICE_NODE_UNAVAILABLE` / `MEDIA_SERVICE_NODE_SELECT_FAILED` | 展示解析暂不可用 |

### 3.2 parse-v2(节点执行,业务 + 下载)

```text
POST /api/client/media/parse-v2
```

请求:`{ "link": "https://www.reddit.com/r/example/comments/abc/title/" }`

响应是独立通用 media schema:

```json
{
  "status": "ok",
  "platform": "reddit",
  "original_link": "...",
  "canonical_link": "...",
  "post": { "content_id": "reddit:abc", "title": "title", "owner": { "id": "example", "title": "example" } },
  "resources": [
    {
      "source_id": "reddit:abc:video:1",
      "platform": "reddit",
      "filename": "title.mp4",
      "type": "video",
      "mime_type": "video/mp4",
      "size": null,
      "duration": 12.3,
      "width": 1280, "height": 720,
      "content_id": "reddit:abc",
      "capabilities": { "download": true, "play": false },
      "download_mode": "client_mux",
      "resource_token": "<resource_token>"
    }
  ]
}
```

`resources[].capabilities` 是资源级展示字段,只给 UI 展示 download/play 状态;**不是节点调度能力配置,也不是 V2 下载链路的分支依据**。本域不新增 `service_nodes.capabilities`,新下载链路只依据 `download_mode`、`preferred_node_id` 和 `*_NODE_UNAVAILABLE` 错误语义。

Telegram 字段映射:

- `platform = "telegram"`;`canonical_link` 用现有 TG parse 规范化后的消息链接。
- `post.content_id` = `telegram:{chat_id}:{message_id}`;拿不到稳定 `chat_id` 时用 canonical link hash。
- `post.owner.id` 优先用链接里的 username,其次用 `chat_id`;`post.owner.title` 允许空字符串。
- TG parse 不为了 `post.owner.title` / 频道展示名额外调用 `get_entity()` 获取完整 chat entity;当前前端下载详情和 token 签发不依赖这些展示字段。
- 每个可下载媒体 `source_id` 沿用现有 TG parse 的 source id;`content_id` = 所属 `post.content_id`。
- 首阶段 TG 资源 `download_mode = "proxy"`,`capabilities.download = true`、`capabilities.play = false`;V2 调度和重试不得读该字段。
- parse-v2 公开 JSON 不返回 Provider 私有 `extra`,也不写入 `resources[].extra`；公开 `resource_token` 是授权材料,不是 extra。
- `resource_token` 签发时把 Provider parse result 中对应 `source_id` 的 `extra` 原样写入 token;非 Telegram 平台可为空 object。

约束:

- 不接受客户端传入 `node_id`(节点 ID 来自 Pre 列表,前端自己知道当前请求哪个节点)。
- 能拿到资源大小时必须返回 `size`;只有现有 parse 结果确实未知时才 `size=null`。
- `status = requires_client` 时仍返回 `platform/original_link/canonical_link/reason`,`resources` 为空。
- 首阶段每个 resource 只有一个 `download_mode`;同一素材有多种执行形态时,parse 层拆成多个 resource/source_id 或按产品规则选默认模式。
- 不强制登录、不扣额度、不访问业务数据库;允许匿名访问。parse-v2 可 best-effort 解析 `Authorization` 得到 `user_id`,解析失败按匿名继续;`X-Device-Id` 可选,非法或缺失时为 `None`;`client_ip` 来自可信反代/请求上下文。平台已有解析限流按 user -> device -> IP 回退执行。
- 不返回 direct URL 或 client_mux tracks(这些只由授权后的 `download-v2` 返回)。
- 私有频道、客户端扩展引导沿用现有平台解析服务。
- `business` 和 `download` role 都挂 `parse-v2`;`download` role 不能挂 `/parse`。

错误契约:

| 场景 | HTTP | 业务 code | 前端动作 |
| --- | --- | --- | --- |
| link 缺失或格式非法 | 400 | `MEDIA_PARSE_INVALID_LINK` | 展示输入错误 |
| URL 无法识别为任何支持平台 | 400 | `MEDIA_PARSE_UNSUPPORTED_PLATFORM` | 展示不支持 |
| 私有频道或需要客户端扩展 | 403 | `MEDIA_PARSE_REQUIRES_CLIENT` | 走扩展引导 |
| 资源不存在或上游不可解析 | 404 | `MEDIA_PARSE_RESOURCE_NOT_FOUND` | 展示解析失败 |
| 节点缺本地 cookie/session/平台配置/执行依赖、registry 缺 Provider、TG session 忙或本地执行资源不足 | 503 | `MEDIA_PARSE_NODE_UNAVAILABLE` | 尝试下一个解析节点 |

### 3.3 download-pre-v2(下载授权控制面,仅业务服务器)

```text
POST /api/client/media/download-pre-v2
```

请求:`{ "resource_token": "...", "preferred_node_id": 2 }`

响应:

```json
{
  "token": "...",
  "expires_at": 1234567890,
  "credits_balance": 8,
  "download_mode": "proxy",
  "nodes": [
    { "node_id": 2, "url": "https://dl-sg-1.example.com/api/client/media/download-v2" },
    { "node_id": 1, "url": "https://api.example.com/api/client/media/download-v2" }
  ]
}
```

字段约束:

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `resource_token` | 是 | string | `parse-v2` 返回的资源 token;业务服务器只信任 token 内的资源和计费字段 |
| `preferred_node_id` | 否 | integer\|null | 前端解析成功使用的 Pre 节点 ID,仅亲和 hint |

流程:

1. 校验参数,读取登录用户上下文得 `user_scope = user:{user_id}`;不接受游客身份。media download token 的 `uid` 来自本阶段登录 access token,不是 resource token;resource token 是解析阶段产物,不携带用户身份。
2. 通过 Website 设备可信校验;未建立或已过期时返回 `AUTH_PAGE_REFRESH_REQUIRED`,前端提示用户刷新页面后重试。IP 不参与拒绝,只用于日志排障。
3. 按 `user_scope` 获取 5 秒 Redis 短锁;同一用户同一时刻最多处理一个 `download-pre-v2`。
4. 获取锁失败时不等待,直接返回 `RATE_LIMIT_EXCEEDED_MEDIA`,前端展示请求过于频繁。
5. 校验 `resource_token`/`preferred_node_id`,从 signed token claims 读资源、计费字段和可选 `extra`。
6. 按 `preferred_node_id` + 统一候选规则组装最多 3 个节点;preferred 命中候选池排第一,剩余按 `weight` 加权随机。
7. 按 resource token claims 的 `size` 算 TTL;已知 `size > 4GiB` 拒绝,`size=null` 用 6 小时。
8. 签发 media download token;把 `extra` 原样继续写入 download token。
9. 在同一个用户短锁内调用 Credits 扣费;是否免扣由积分系统按 `user_id + resource_key` 的 6 小时下载记录窗口判断。
10. 返回 token、过期时间、`credits_balance`、下载模式、节点列表。

当前已注册的 `proxy` / `direct` / `client_mux` 都按 `download-pre-v2` 授权阶段扣费。active limit、上游不可达或用户取消保存都不自动退费;用户可用同一 token 重试,同一资源 6 小时窗口内不会重复扣费。后续新 mode 如果要求“download-v2 校验失败不扣费”,必须另起设计,把校验前置到授权阶段或补退款补偿,不能直接套用本流程。

扣费并发边界:同一 `user_scope` 的 5 秒短锁覆盖 token 签发和 Credits 扣费,防止双击重复进入扣费;普通用户请求不续租,正常结束立即释放,抢不到锁让用户重试。不再使用 `media:download_pre_charged:*` 60 秒 marker。

> 积分余额与扣费规则(按用户口径、订单/订阅关系等)见 `@../003.积分系统/feat.md`;本域只描述"下载授权时按用户口径扣减、同一用户同一资源 6 小时内只扣一次"这一入口事实。

`size` 必须是非负整数或 `null`;只能做预拒绝和 TTL 分档,不能作为安全边界(目标节点 `download-v2` 必须重新解析真实大小再校验)。`download-pre-v2` 不在业务服务器本机二次解析资源。

`download-pre-v2` 只接受登录用户 access token;额度 scope 固定 `user:{user_id}`;`X-Device-Id` 仍作通用请求头但不作下载额度身份。已扣额度后只能用本次授权返回的 `nodes`/`token` 重试;`download-v2` 发现不可达或过大时首阶段不自动退额度(已接受的小概率风险,后续退款用 `jti` 幂等补偿)。

错误契约:

| 场景 | HTTP | 业务 code | 前端动作 |
| --- | --- | --- | --- |
| 设备可信关系缺失或过期 | 200 | `AUTH_PAGE_REFRESH_REQUIRED` | 刷新页面后重试 |
| `resource_token`/`preferred_node_id` 缺失或非法 | 400 | `MEDIA_DOWNLOAD_PRE_INVALID_REQUEST` | 展示下载失败 |
| 缺登录或登录 token 无效 | 401 | `AUTH_INVALID_TOKEN` / `MEDIA_DOWNLOAD_PRE_INVALID_CLIENT_IDENTITY` | 打开登录弹窗 |
| 没有任何可返回节点 | 503 | `MEDIA_SERVICE_NODE_UNAVAILABLE` | 展示下载暂不可用 |
| 资源 size > 4GiB | 413 | `MEDIA_DOWNLOAD_FILE_TOO_LARGE` | 展示文件过大 |
| Credits 不足 | 200 | `CREDIT_INSUFFICIENT` | 展示购买积分弹窗 |
| 同一用户已有 `download-pre-v2` 正在处理 | 200 | `RATE_LIMIT_EXCEEDED_MEDIA` | 展示请求过于频繁 |
| Redis 锁基础设施暂不可用 | 503 | `MEDIA_DOWNLOAD_PRE_UNAVAILABLE` | 展示下载暂不可用 |

### 3.4 download-v2(节点执行,业务 + 下载)

```text
POST /api/client/media/download-v2
Content-Type: application/json
{"token":"<download_token>"}

GET /api/client/media/download-v2?token=<download_token>
```

流程:

1. POST 从 JSON body 读 `token`;GET 能力从 query 读 `token`;随后共用同一套解码验签与执行流程。Website 线上默认只调用 POST。
2. 校验 `typ/v/exp/link/sid/size` 和可选 `extra`。
3. `media_provider_service` 根据 `claims.platform` 取得对应 Provider。
4. `Range` 头不在公共层判定,原样传给 Provider。GET 浏览器下载时前端不主动设置 Range,只被动接收浏览器/系统下载器自行发来的 Range。
5. 如果 token 已知 `size > 4GiB`,直接拒绝,不 acquire、不打开上游资源。
6. 读取 `provider.policy`。如果 `active_limited=True`,按 `user:{uid}` 获取进程内活跃下载 guard;当前同用户上限 3,超过返回 `RATE_LIMIT_EXCEEDED_MEDIA` + `data.reason=active_download_limit_exceeded`。
7. 如果 `bandwidth_limited=True`,用 token 内用户限速值更新后端输出限速 bucket。
8. 调用 Provider 执行本次下载,传入 `extra`,返回 `StreamDownloadResult` 或 `JsonDownloadResult`。
9. `download_mode` 只做响应契约校验和前端分派;公共治理不按它分支。不匹配时执行 `release_once()` 并返回 `MEDIA_DOWNLOAD_NODE_UNAVAILABLE`。
10. 用 `StreamDownloadResult.total_size` 校验 4GiB 上限;若已打开资源后才发现超限,先执行 `release_once()` 再返回错误。
11. token `size=0` 且真实 size 也为 0 时,文件流返回 `Content-Length: 0` 空文件,不进未知大小流式保护。
12. Range 行为由 Provider 决定;不支持 Range 或本次上游不能满足 Range 时返回 `MEDIA_RANGE_NOT_SATISFIABLE`,不能静默从头返回 200。
13. `JsonDownloadResult` 直接返回对应 JSON；如前面已 acquire,返回前执行 `release_once()`。
14. 未知大小文件流按累计发送字节计数;达 4GiB 立即中断流、释放上下文、记 `MEDIA_DOWNLOAD_FILE_TOO_LARGE`。
15. stream 结束、报错、客户端断开或 BackgroundTask 兜底时执行幂等 `release_once()`。

约束:

- `token` 与 `link/source_id` 不能混用;同时包含时返回 400,不按优先级静默选择。
- `download` role 只允许 `download-v2` token 模式;`business` role 只保留 V2 模式和 Pre 控制面。
- token 下载路由拆成独立 router,`download` role 只挂 `download-v2` router,不挂含 play-token 的 `tg_client.py` router。
- 每次请求独立解析执行上下文;不信任 token 中的 `size` 作为最终大小。
- 应用日志不记录完整 token;排查只记 `jti`、token hash、错误码。
- 响应必须 `Cache-Control: no-store`。
- `size=null` 且 Provider resolve 后仍未知时,不支持任意偏移续传,只允许从头流式;非 0 起点 Range 由 Provider 返回 `MEDIA_RANGE_NOT_SATISFIABLE`。
- 未知大小流式超 4GiB 时中断连接、释放资源、写结构化日志,不尝试改写成 JSON 错误。
- Telegram Provider 从 `extra.tg_client_ref` 取账号亲和 hint,由 `TelegramMedia` 通过 `telegram_manager` 解析下载上下文;账号池只把该值当作优先级 hint,不可用时自动回退原调度。登录链路固定为 `tg_login_service -> telegram_manager`,不是媒体 Provider 反向获取登录 service。
- Provider 不创建 FastAPI response;API 只负责从 `StreamDownloadResult.filename/content_length/content_range/accept_ranges/media_type/status_code` 生成关键文件响应头并转成 `StreamingResponse`,把 `JsonDownloadResult` 包装成 JSON。
- 用户活跃下载并发限制只由 `provider.policy.active_limited` 决定；当前 direct / client_mux Provider 默认不进入该限制。
- `download-v2` 的 JSON envelope 错误沿用现行 HTTP 契约:除 Range 不可满足返回 416 外,其他业务错误(含 token 无效/过期)随 HTTP 200 返回;前端必须按业务 code 判定失败,不能只按 HTTP 200 当成功。
- `download_mode=proxy` 的文件流成功响应必须由 API 层生成 `Content-Disposition: attachment; filename="<safe-ascii-fallback>"; filename*=UTF-8''...`;Provider 返回的 filename 只是不可信候选值,写头前必须清理 CR/LF、路径分隔符、控制字符和危险引号。ASCII fallback 尽量保留安全文件 stem/扩展名,为空时用 `download`。JSON envelope 错误禁止带该头。前端按该头区分文件流和错误 envelope,不能按 `Content-Type` 判断。

> 三种下载模式的执行细节、Range/续传策略见 `@tech-下载方法与续传.md`;后端 Provider 契约、release_once 与 ProviderPolicy 见 `@tech-后端媒体Provider架构.md`。

响应规格:

| `download_mode` | 响应 |
| --- | --- |
| `proxy` | `StreamingResponse`/文件响应,必含清理和编码后的 `Content-Disposition: attachment; filename="<safe-ascii-fallback>"; filename*=UTF-8''...`;filename 候选来自 `StreamDownloadResult.filename` |
| `direct` | `MediaDirectDownloadIntentResponse` 同形 JSON,字段来自节点执行结果 |
| `client_mux` | `MediaClientMuxDownloadIntentResponse` 同形 JSON,字段来自节点执行结果 |

direct / client_mux 的 `expires_at` 是平台 CDN 直链或 tracks 的过期时间,不是 download token 的 `exp`。direct 示例:

```json
{
  "download_mode": "direct", "source_id": "abc", "platform": "douyin",
  "download_url": "https://cdn.example.com/file.mp4", "filename": "video.mp4",
  "mime_type": "video/mp4", "size": 10485760, "expires_at": 1234567890
}
```

错误契约:

| 场景 | HTTP | 业务 code | 前端动作 |
| --- | --- | --- | --- |
| token 无效或验签失败 | 200 | `MEDIA_DOWNLOAD_TOKEN_INVALID` | 停止换节点,重新创建下载授权 |
| token 过期 | 200 | `MEDIA_DOWNLOAD_TOKEN_EXPIRED` | 停止换节点,重新创建下载授权 |
| 上游无权限或资源不可达 | 200 | `MEDIA_DOWNLOAD_RESOURCE_UNREACHABLE` | 展示失败或重新走 Pre |
| 真实文件 > 4GiB | 200 | `MEDIA_DOWNLOAD_FILE_TOO_LARGE` | 展示文件过大 |
| 未知大小流式累计 > 4GiB | 连接中断 | `MEDIA_DOWNLOAD_FILE_TOO_LARGE` | 展示下载失败/过大 |
| 节点缺本地 cookie/session/平台配置/执行依赖、registry 缺 Provider 或临时失败 | 200 | `MEDIA_DOWNLOAD_NODE_UNAVAILABLE` | 尝试下一个节点 |
| 活跃下载超限 | 200 | `RATE_LIMIT_EXCEEDED_MEDIA` | 展示请求过于频繁/稍后再试,不切节点 |
| Range 不可满足 | 416 | `MEDIA_RANGE_NOT_SATISFIABLE` | 按下载器 Range 错误处理,不盲目换节点 |

## 4. 完整流程图

```text
用户
  -> 业务服务器:parse-pre-v2
  <- 有序 parse 节点列表
  -> 解析节点 1:parse-v2
  -> 解析节点 2:节点 1 超时或连不上时继续
  <- 解析结果 + canonical_link + platform + download_mode + source_id + size + resource_token
  -> 业务服务器:download-pre-v2(resource_token, preferred_node_id)
  -> 用户短锁、节点列表组装、TTL 计算、token claims 组装
  -> 签发 media_download token
  -> Credits 按 user:{user_id} + resource_key 判断 6 小时窗口,必要时扣额度
  <- token + 最多 3 个下载入口
  -> 下载入口 1:download-v2({token})
  -> 下载入口 2:入口 1 超时或连不上时继续
```

下载模式完整路径:

- `proxy` → `download-pre-v2 -> 扣额度 -> download-v2 返回文件流`
- `direct` → `download-pre-v2 -> 扣额度 -> download-v2 返回 download_url -> 前端请求平台 CDN`
- `client_mux` → `download-pre-v2 -> 扣额度 -> download-v2 返回 tracks -> 前端合成`

## 5. 回滚

- 任意阶段失败,关闭执行节点,让 V2 只返回健康业务节点(节点停用入口见 `@../001.节点系统/feat.md`)。
- 新路径发布失败,回滚到上一版后端/前端构建;当前后端不保留接口分支开关。
- `download_token` 密钥轮换失败,恢复上一轮私钥签发,上一轮公钥重新加入所有节点。
