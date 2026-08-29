# 001 · 角色与路由

> 覆盖节点系统的角色模型、按角色路由组装、无 DB 边界、节点共用配置口径。
> 关联:`@feat.md` `@tech-节点数据与调度.md` `@tech-节点Admin与本地管理.md` `@tech-节点发布.md`
> 下载业务的接口规格(parse-v2 / download-v2 的请求响应、错误码、token)属下载域,见 `@../002.下载功能/tech-链路与授权.md`。本文只在"节点提供哪些执行接口的挂载能力"层面描述,不重复接口规格。

## 1. 角色模型

同一套 backend 代码通过 `app.role` 配置以两种角色启动:

| 角色 | `app.role` | 职责 |
| --- | --- | --- |
| 业务服务器 | `business` | 用户认证、节点管理、节点调度、节点健康检查调度、admin 入口;也作为普通服务节点参与执行 |
| 执行节点 | `download` | 本地执行能力、Telegram session 管理、节点执行接口挂载、健康检查上报、节点本地管理;**不连业务数据库** |

业务服务器本身也是节点(`node_type=1`),具备执行、Telegram session 能力;执行节点是裁剪掉业务数据库能力的节点(`node_type=2`)。

## 2. 节点与本地资源

每个执行节点维护自己的 Telegram session:`backend/data/<phone>/auth.session`。这是 Telegram 用户客户端 session,不是 bot token,也不是业务 secret。不能把同一 `auth.session` 同时复制到多台机器长期运行;现有 `SessionProcessLock` 只保护同一文件系统上的多进程,不保护跨机器共享。

下载授权 token 不绑定节点,客户端可能把同一 token 发给多个节点。客户端只在节点超时、连不上、DNS / TCP / TLS 失败、网关不可达或返回节点不可用时换下一个;明确业务错误不盲目切节点(具体错误语义属下载域,见 `@../002.下载功能/tech-链路与授权.md`)。

## 3. 路由组装(按角色)

`backend/src/app/main.py` 当前挂载完整业务路由,实现时改成按 `app.role` 组装:

| role | 挂载 |
| --- | --- |
| `business` | 当前业务路由 + 节点执行接口(parse-v2 / download-v2,供兜底) |
| `download` | 只挂:无 DB 健康检查、节点执行接口(parse-v2 / download-v2)、节点本地管理(TG client / X、Instagram Cookie) |

`download` role 禁止挂:

- auth、order、subscription、quota、admin dashboard、支付 callback。
- 旧 `link/source_id` 下载入口、旧 `POST /api/client/tg/parse`、`/tg/play-token` 系列、旧 media / TG parse / download / intent。
- 当前 `/api/system/health`(用 `/internal/service-node/health` 替代)。
- 控制面入口(parse-pre-v2 / download-pre-v2):这些是调度控制面,只在 `business` role。
- admin 登录 / refresh / 服务节点 CRUD。
- play-token 创建。

节点本地管理 API(TG client / X、Instagram Cookie)在两个 role 都挂载。

`download` role 的路由、service 和 lifespan 路径禁止导入 `app.core.database` 或任何触发 DB 连接的模块;只有配置类型或共享纯函数确实需要时才允许间接引用,且必须通过启动测试证明 `get_engine()`、`get_async_session()`、`check_db_connection()` 均未被调用。

`download` role 可配置 Redis,但不能作为启动依赖。admin refresh token 的 Redis 校验只在 `business` role 的 admin 登录和 refresh 路由。

## 4. 无 DB 边界

可放到执行节点(`download` role):

- 无 DB 的节点执行接口(parse-v2 / download-v2;具体规格见 `@../002.下载功能/tech-链路与授权.md`)。实际可执行的平台由本地 cookie、session、平台配置、执行依赖决定。
- 不查 DB 的节点健康检查(`/internal/service-node/health`)。
- 节点本地管理接口:Telegram session 管理、X / Instagram Cookie 文件管理。
- admin access JWT 纯验签:校验签名、`ADMIN_ACCESS`、过期时间、必要 claims。

不能放到无 DB 执行节点:

- 已下线的旧 parse、`link/source_id` 下载入口、direct intent、client_mux intent(不恢复)。
- `/tg/play-token` 创建。
- 依赖业务数据库的旧 Cookie 表及其管理 service;运行时只读节点本地媒体 Cookie 文件。
- 当前 DB health。
- play-token(仍只属业务服务器)。
- 控制面入口(parse-pre-v2 / download-pre-v2)。
- 调用 `admin_service.get_by_id()` 的 admin 完整鉴权依赖。
- admin refresh token 校验和轮换。

## 5. 配置口径(节点共用)

所有节点共用的基础配置:

| 配置 | 说明 |
| --- | --- |
| `app.role` | `business` 或 `download` |
| `telegram.session_path` | 本地 Telegram session 目录 |
| `telegram.api_id` / `api_hash` | Telegram API 基础配置 |
| `download_token.private_key` | 下载授权签发私钥,只在 `business` 配置和使用(规格见下载域) |
| `download_token.public_keys` | 验签公钥列表,所有节点用于验签 |
| `auth.jwt_secret_key` / `jwt_algorithm` | admin JWT 共享密钥,所有节点一致(默认 HS256) |
| `admin.access_token_expire` | 固定 1800 秒 |
| `admin.refresh_token_expire` | 固定 604800 秒 |
| `service_node.health_check_interval_seconds` | 健康检查调度间隔,默认 60 秒,范围 10..600(仅 `business` role 生效) |

每台机器差异只来自部署环境和本地数据:进程端口、域名、TLS、反代等发布层配置;`service_nodes.public_base_url` 和 `internal_base_url`;本地 `backend/data` 下的 Telegram session;本地 `data/media-cookie/x.com.cookies.json` 与 `instagram.com.cookies.json`。

`app.public_api_base_url` 不作为节点身份来源。客户端下载和 admin 直连节点本地管理地址以业务数据库中的 `service_nodes.public_base_url` 为准;节点调度只读 `service_nodes`,不要求当前进程把自己映射到某个 `node_id`。

## 6. 发布与配置复用

执行节点使用同一份 `backend` 包 / 镜像 + 同一份 `download` 角色基础配置模板。节点对外地址、启用状态、健康状态、权重由业务服务器的 `service_nodes` 记录管理。

新增执行节点发布流程(发布脚本细节见 `@tech-节点发布.md`):

1. 部署同一份 `backend` 包或镜像。
2. 使用 `download` 角色基础配置启动。
3. 挂载该节点自己的 `backend/data` 和 `data/media-cookie`。
4. 在 admin 服务节点管理中新增节点,填写 `public_base_url`、`internal_base_url`、地区、权重、启用状态。
5. 等业务服务器健康检查通过后,节点才参与调度。

执行节点必须跳过数据库结构同步,允许不配置业务数据库和 SMTP,使用 `/internal/service-node/health` 做健康检查。

## 7. 回滚

- 任意阶段失败,关闭执行节点,让调度只返回健康业务节点。
- admin 可把执行节点 `enabled=false`,业务服务器不再返回该节点。
- 新路径发布失败,回滚到上一版后端 / 前端构建;当前后端不保留旧接口开关。
- `download_token` 密钥轮换失败,恢复旧私钥签发,旧公钥重新加入所有节点。
