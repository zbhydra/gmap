# 同步 API、MCP 与 OAuth 授权

## 业务入口与计量

REST 与 MCP 共用 `backend/src/app/api/maps_api_operations.py` 的 `search` / `reviews`，调用本仓 HTTP Provider。两者均不创建 Online 任务，不写对象存储。

Search 的 `page` 是累计采集页数，映射 Provider 的 `max_depth`，不是第 N 页。`extra=true` 使用现有 `maps_enrich_provider.enrich` 和 `ENRICH_BATCH_BUDGET_SECONDS`，补全邮箱与社媒；权限归 API 请求额度，不检查 Online 订阅。

鉴权、入参及月额度检查通过后执行 Provider；成功返回（含零结果与 partial）才消费一次请求，Provider 抛错不扣量。服务端生成请求编号，调用 `api_usage_service.consume(records=1)`，产品线固定 `maps_api`，自然月及总额度归 [额度基建](../000.架构/tech-额度基建.md)。并行请求允许超过当时剩余额度；计量失败返回错误，客户端重试视为新请求。

## REST 与 Dashboard

客户端接口统一前缀 `/api/client/maps/api`。业务响应使用 `{code,data,msg}`，成功码为 `SUCCESS`；认证无效 HTTP 401，其余业务错误 HTTP 200。

| 方法与路径           | 认证                                   | 请求 / data                                                                                                              |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| `GET /key`           | 本站用户 JWT，严格 Redis 白名单        | `{has_api_key:boolean,api_key_prefix:string,api_key_created_at:number                                                    | null}` |
| `POST /key/generate` | 同上                                   | 无 body；`{api_key:string,api_key_prefix:string,api_key_created_at:number}`                                              |
| `GET /usage`         | 同上                                   | `{used:number,total:number,period:"YYYY-MM",exhausted:boolean}`                                                          |
| `GET /connection`    | 同上                                   | `{api_base_url:string,mcp_url:string}`；连接地址读取部署配置                                                             |
| `POST /search`       | `Authorization: Bearer <用户 API Key>` | `{q:string,page?:1..10,hl?:string,ll?:"@lat,lng,zoom",extra?:boolean}` → `{places:[],partial:boolean,warnings:string[]}` |
| `POST /reviews`      | 同上                                   | `{fid:string,cursor?:string,sort_by?:1\|2\|3\|4,hl?:string}` → `{reviews:[],next_cursor:string                           | null}` |

`page` 默认 1，`hl` 默认 `en`，`extra` 默认 false，Reviews 排序默认相关性（1；2 最新、3 最高、4 最低）。`ll` 范围与解析由 `MapsSearchRequest.parse_viewport` 定义。Reviews 的 cursor 原样传给下一次调用，不保存页码状态。

地点及评论字段分别沿用 `GmapPlaceEntry`、`GmapReview` 的 snake_case DTO，定义位于 `backend/src/app/provider/gmap/types.py`。开启 extra 后每条地点增加 `emails:string[]` 与 `medias:Record<string,string>`。Provider 局部补列状态透传为 `partial` / `warnings`。

每个账号仅一个 API Key，`users` 保存 SHA-256 摘要、展示前缀和生成时间；完整 Key 仅生成响应出现，轮换后旧 Key 立即无效。凭证鉴权逐请求检查账号可用状态。额度耗尽返回 `MAPS_API_QUOTA_EXHAUSTED`；存储不可用由现有用量 owner 返回 `EXTENSION_USAGE_UNAVAILABLE`。

## MCP 协议

入口为 `/mcp/`，官方 SDK 版本由 `backend/pyproject.toml` / `uv.lock` 固定；无状态 Streamable HTTP，仅 POST JSON，GET 返回 405，`/mcp` 返回 404。工具 `search_places`、`list_reviews` 分别复用 REST 入参，未知字段按严格机器合同拒绝。结果同时提供 text JSON 与 structured content；业务错误返回 `isError` 和本地化 `{code,message}`。

MCP 接受用户 API Key 或本服务签发的 OAuth access token。两者均逐请求查询账号，OAuth 另查询授权撤销状态。凭据无效返回 401 Bearer challenge，携带受保护资源元数据 URL；账号不可用返回 403，不循环启动授权。

## OAuth 授权服务器

用户从 MCP 客户端打开官网，经现有登录后点击允许，返回 MCP 客户端。官网确认复用 `get_current_user`，不改变登录、JWT 或刷新协议。

固定协议 scope 保持 `exports`；它只授予本站 MCP 的 Search / Reviews 能力，计量产品线仍为 `maps_api`。resource 必须匹配配置的 `mcp.public_url`，token 只在 MCP 入口使用。

| 协议端点                                         | 行为                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `GET /.well-known/oauth-authorization-server`    | 授权服务器发现                                                                    |
| `GET /.well-known/oauth-protected-resource/mcp/` | MCP 受保护资源发现                                                                |
| `POST /oauth/register`                           | 动态注册；公开客户端 `none` 或保密客户端 `client_secret_post`                     |
| `GET /oauth/authorize`                           | 验证 client、回调、code、S256 PKCE、resource，然后跳官网确认页                    |
| `POST /oauth/token`                              | form body；授权码兑换或刷新轮换，由 SDK 校验 client、redirect_uri、PKCE、resource |

协议端点使用标准 OAuth 响应，不套 REST 信封。回调只能注册 HTTPS 或回环 HTTP，不能含 query/fragment；授权时逐字匹配，回环仅允许端口变化。授权校验失败只跳官网错误页，不回跳未经校验的客户端。

官网确认页 `/oauth/consent/` 只从 fragment 读取 `request` 或 `error`。错误原因为 `rate_limited`、`invalid_client`、`invalid_redirect_uri`、`unsupported_response_type`、`invalid_pkce`、`invalid_resource`、`server_error`。

以下接口前缀为 `/api/client/mcp-oauth`，使用本站严格 JWT 和 REST 信封：

| 方法与路径                        | 请求 / data                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `POST /requests/detail`           | `{request:string}` → `{client_name:string                                                               | null,redirect_host:string,is_loopback:boolean,user_email:string}`；只读票据 |
| `POST /requests/decide`           | `{request:string,approved:boolean}` → `{redirect_url:string}`；同意和拒绝均原子消费票据，前端仅跳该 URL |
| `GET /grants?page=1&page_size=20` | `{items:[{grant_id,client_name,redirect_host,created_at,last_refreshed_at}],total}`；仅本人有效授权     |
| `POST /grants/{grant_id}/revoke`  | `{revoked:true}`；仅本人，重复撤销成功，他人或不存在返回 NOT_FOUND                                      |

失效或已消费票据返回 `MCP_OAUTH_REQUEST_INVALID`。客户端名称是注册时自报值，确认页应以回调主机为主要标识。时间戳均为毫秒。

## 存储与部署

`mcp_oauth_clients` 保存 SDK 注册信息；保密客户端密钥按 SDK 明文比对要求存储。`mcp_oauth_grants` 保存用户归属、客户端与展示快照、刷新 family/current hash、创建/刷新/撤销时间。Redis 保存摘要键的确认票据、一次性授权码及 access token 绑定，均设置 TTL；失效时间和限流阈值唯一来源为 `backend/src/app/constants/mcp_oauth.py`。

授权码在 load 时原子取走，错误 PKCE 同样消费；刷新按旧摘要条件更新，重放旧令牌撤销该客户端的整条授权。Redis 故障对票据及访问令牌 fail-closed；注册和授权入口的 IP 限流 fail-open。无额外锁、重试或补偿。

索引服务实际查询：客户端主键 `client_id`；授权主键 `grant_id`、唯一 `family_hash`（刷新查询）、普通 `user_id`（本人列表/计数）；用户唯一 `api_key_hash`（Key 鉴权）。用户原有主键和 email 唯一键不能覆盖 Key 摘要查询。

配置入口 `McpSettings`：`public_url`、`allowed_hosts`、`allowed_origins`。公开地址须为规范化的 `/mcp/` URL，Host/Origin 使用精确清单；未配置公开 URL 时不挂 OAuth 端点。部署模板从既有 API/官网地址与 Nginx 域名生成配置。应用 lifespan 启动 SDK session manager；错误中间件不包装协议错误；Nginx 显式透传元数据路径并关闭 MCP 缓冲。

## 验收入口

模型结构使用 `uv run python -m app.init.sync_database_schema --yes` 同步。公开协议和采集验证使用真实 MySQL、Redis 与独立本地后端，执行记录归本次实施单元；仅 Google 外部网络成功后才能证明真实采集闭环。
