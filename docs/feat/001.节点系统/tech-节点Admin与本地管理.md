# 001 · 节点 Admin 与节点本地管理

> 覆盖 admin 节点 CRUD、admin 直连节点本地管理架构、Telegram session 节点本地接口、X / Instagram Cookie 节点本地接口、JWT-only admin 鉴权、改动范围、测试要点、回滚。
> 关联:`@feat.md` `@tech-角色与路由.md` `@tech-节点数据与调度.md`
> admin 页面 UI 见 `@feat.md`。

## 1. Admin 节点管理 API(业务服务器)

```text
GET  /api/admin/service-nodes
POST /api/admin/service-nodes
POST /api/admin/service-nodes/{node_id}/update
POST /api/admin/service-nodes/{node_id}/enable
POST /api/admin/service-nodes/{node_id}/disable
POST /api/admin/service-nodes/{node_id}/health-check
```

只使用 GET 和 POST。`/enable` 设 `enabled=true` 并自动写历史字段 `status=1`;`/disable` 设 `enabled=false` 并写 `status=3`。

创建 / 更新字段:`node_type`(1 / 2)、`name`、`region`、`public_base_url`、`internal_base_url`、`enabled`、`weight`(合法范围 `0..1000`,默认 100;0 表示不参与分配)。

规则:

- admin 只配置节点基础信息、权重和启用状态;`status` 是历史字段,由 `enabled` 自动派生,不在页面单独展示。
- 所有节点按同一套执行接口合同暴露;缺 cookie / session / 平台配置 / 执行依赖时由节点本地接口返回节点不可用错误(具体错误码属下载域,见 `@../002.下载功能/tech-链路与授权.md`)。
- 手动健康检查返回的节点本地运行态诊断只用于展示和排查,不参与调度。

## 2. Admin 直连节点本地管理(架构)

业务服务器只提供节点列表、节点配置、登录和 refresh。admin 前端按目标节点 `public_base_url` **直接请求目标节点本地管理接口,不经业务服务器代理**。

节点本地管理是一套独立 router,`business` 和 `download` role 都挂载,都用同一个 JWT-only admin 鉴权依赖。业务节点不能在该 router 上复用会查数据库的 `get_admin_user()`。若某节点本地管理路径与旧 admin 路径相同,`business` role 上也必须由 JWT-only 节点本地 router 接管该路径,不能同路径同时注册旧 DB 鉴权 router;旧 admin 页面继续用同一路径和同一 admin access JWT,前端行为不变。

节点直连请求头:`Authorization: Bearer <admin_access_jwt>`。

目标节点返回 401 且前端仍持有 refresh token 时:

1. admin 前端只向业务服务器 `POST /api/admin/auth/refresh` 刷新。
2. 业务服务器校验 refresh token 和 Redis 状态后签发新 access token。
3. admin 前端用新 access token 重试原目标节点请求一次。
4. 重试仍失败跳转登录或展示节点鉴权失败;**不能在执行节点调 refresh**。

## 3. 节点本地管理接口

Telegram client:

```text
GET  <node.public_base_url>/api/admin/tg/clients
POST <node.public_base_url>/api/admin/tg/verify
POST <node.public_base_url>/api/admin/tg/login/start
POST <node.public_base_url>/api/admin/tg/login/code
POST <node.public_base_url>/api/admin/tg/login/2fa
POST <node.public_base_url>/api/admin/tg/login/resend
POST <node.public_base_url>/api/admin/tg/login/cancel
POST <node.public_base_url>/api/admin/tg/clients/delete
```

媒体 Cookie(`platform` 只允许 `x`、`instagram`):

```text
GET  <node.public_base_url>/api/admin/channel-settings/{platform}/cookies
POST <node.public_base_url>/api/admin/channel-settings/{platform}/cookies
POST <node.public_base_url>/api/admin/channel-settings/{platform}/cookies/{cookie_id}/update
POST <node.public_base_url>/api/admin/channel-settings/{platform}/cookies/{cookie_id}/delete
```

规则:

- admin 前端只从业务服务器读节点列表和刷新 admin token;直连目标节点用当前 admin access JWT。
- 节点本地管理接口只验签 JWT、校验 `type/exp/user_id/jti`,不回查业务数据库,不查 Redis。
- 执行节点不提供 admin 登录和 refresh 接口。
- 节点本地管理接口暴露在节点 `public_base_url` 下;安全边界是 `ADMIN_ACCESS` JWT。
- 所有节点必须允许 admin 前端来源跨域访问节点本地管理接口,允许 `Authorization` header;该放行由 nginx 或部署层配置,不在应用代码新增 CORS 中间件。
- 节点本地 Telegram client 写入目标节点本地 `backend/data`;X / Instagram Cookie 分别写入 `data/media-cookie/x.com.cookies.json`、`data/media-cookie/instagram.com.cookies.json`。
- 两个平台共用媒体 Cookie JSON 文件格式和管理合同,关键字段与运行时读取链路按平台配置;详情见 `@../002.下载功能/tech-站点适配.md` 与 `@../008.管理后台/tech-渠道设置.md`。

## 4. JWT-only admin 鉴权

admin JWT claims:

```json
{
  "type": "admin_access",
  "user_id": 1,
  "email": "admin",
  "exp": 1234569690,
  "jti": "uuid"
}
```

`type` 真实值以 `TokenType.ADMIN_ACCESS.value` 为准(当前 `admin_access`)。`email` 沿用现有 JWT 结构,执行节点 JWT-only 鉴权不依赖该字段内容。

admin token 配置:

```yaml
auth:
  jwt_secret_key: "{JWT_SECRET_KEY}"
  jwt_algorithm: "HS256"
admin:
  access_token_expire: 1800
  refresh_token_expire: 604800
```

规则:

- 实现时把现有 `AdminSettings.access_token_expire` 默认值从 604800 秒改为 1800 秒。该默认值只影响新签发 token;存量 admin access JWT 按自身 `exp` 校验,过期前仍可用,解码时不能用新默认值覆盖旧 token 有效期。
- 发布前必须检查所有环境配置文件是否已显式设置 `admin.access_token_expire: 1800`;未显式设置的环境先补配置,避免依赖代码默认值的环境静默改变会话时长。
- `business` role 签发 access 和 refresh token;`download` role 不挂 admin 登录 / 刷新 / 签发接口。
- JWT-only admin 鉴权依赖禁止调用 `admin_service.get_by_id()`,禁止复用会查数据库的 `get_admin_user()`,禁止调用 `admin_token_service` 或 Redis。
- 与节点本地管理路径重名的旧业务 admin router 不再单独挂载,避免 FastAPI 同路径路由顺序导致鉴权合同漂移。
- 管理员停用、refresh token 被轮换或 Redis refresh token 被移除后,已签发的 admin access JWT 在节点本地管理接口最长仍可用 30 分钟。

JWT-only admin 鉴权伪流程:

```text
读取 Authorization: Bearer <token>
-> JwtUnit.decode_token(token)
-> 要求 type = TokenType.ADMIN_ACCESS
-> 要求 user_id > 0
-> 要求 jti 非空
-> 返回 admin_id/user_id 和原始 token
```

当前实现事实:

- `backend/src/app/utils/jwt.py` 的 `JwtUnit.decode_token()` 只做 JWT 签名、算法、过期校验,不访问 Redis。
- `backend/src/app/api/admin_dependencies.py` 的 `get_admin_user()` 会调 `admin_service.get_by_id()`,需业务数据库,不能用于执行节点。
- `backend/src/app/services/admin_token_service.py` 的 refresh token 校验用 Redis,只能留业务服务器 admin refresh 流程。

业务节点和执行节点的节点本地管理接口即使配置了 Redis,也不能用 Redis 判断 admin access JWT 是否有效。

## 5. 改动范围

后端:

| 文件 / 目录 | 改动 |
| --- | --- |
| `backend/src/app/api/admin/` | 服务节点 CRUD;`download` role 挂载 Telegram client 和媒体 Cookie 节点本地管理 API;JWT-only admin 鉴权依赖 |
| `backend/src/app/provider/media_cookie_pool.py` | X / Instagram 独立本地池、格式解析、脱敏和临时 cookiefile |
| `backend/src/app/services/` | 节点 admin 服务与 Telegram client 管理流程 |
| `backend/src/app/main.py` | `business` 和 `download` role 都挂统一节点本地管理 API;`download` role 不挂 admin 登录 / refresh / dashboard / 业务 DB API |

admin 前端:

| 文件 / 目录 | 改动 |
| --- | --- |
| `admin/src/api/` | 新增 service node API |
| `admin/src/views/` | 服务节点管理页面,扩展 Telegram 客户端页面和 X / Instagram Cookie 页面支持目标节点 |
| `admin/src/router/index.ts` | 增加节点管理路由 |
| `admin/src/i18n/` | 补充文案 |

## 6. 测试要点

- admin 节点 CRUD;enable / disable;手动健康检查写回节点状态。
- 业务 / 执行节点的 Telegram 管理和 X / Instagram Cookie 管理都由 admin 直连 `public_base_url` + JWT-only router。
- admin access JWT 30 分钟、refresh 7 天;节点本地管理接口验签时不访问 Redis、不调 `admin_service.get_by_id()`。
- 业务节点上与中心 admin 路径重名的 Telegram / 媒体 Cookie 接口由 JWT-only router 接管,不存在同路径 DB 鉴权 router。
- 执行节点不提供 refresh 接口;即使配 Redis 也不通过 Redis 校验 access JWT。
- 目标节点 access 过期时,前端回业务服务器 refresh 后重试。
- `cd backend && uv run black . && uv run ruff check . && uv run mypy .` / `cd admin && pnpm tsc --noEmit && pnpm build`。

## 7. 回滚

- admin 停用所有执行节点;业务服务器仍保留旧下载路径;节点本地管理异常不影响旧前端下载。
- 部署后最长 7 天内可能同时存在旧 7 天和新 30 分钟有效期的 admin access token;7 天后再验证新签发 token 均为 30 分钟。
