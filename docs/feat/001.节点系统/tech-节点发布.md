# 001 · 节点发布

> 覆盖执行节点(`download` role)的发布:文件规划、env 模板、config 模板、supervisor、nginx、发布流程、脚本行为、测试要点、回滚。
> 关联:`@feat.md` `@tech-角色与路由.md` `@tech-节点数据与调度.md` `@tech-节点Admin与本地管理.md`

## 1. 目标

为执行节点提供单独发布入口:复用现有 SSH、Git、uv、supervisor 发布能力;用 `app.role=download` 启动同一套 backend;不要求业务数据库;不执行数据库结构同步;不要求 SMTP、Google 登录、支付等业务配置;用服务节点健康检查 `/internal/service-node/health`。

## 2. 结论

需要单独执行节点部署脚本。现有 `backend/deploy/deploy.sh` 和 `backend/deploy/script/deploy_remote.sh` 是业务服务器入口,行为包含:强制读取 `DB_HOST` / `DB_USER` / `DB_PASSWD`、基于业务配置生成 `config.yaml`、运行数据库结构同步、重启 supervisor `tg-download`、健康检查 `/api/system/health`。这些不适合执行节点。执行节点发布入口可复用底层工具函数,但必须有独立命令和独立 `.env` 模板。

## 3. 文件规划

新增:

| 文件 | 作用 |
| --- | --- |
| `backend/config.download.yaml.example` | 执行节点目标态 config 模板 |
| `backend/deploy/.env.download.example` | 执行节点发布 `.env` 模板 |
| `backend/deploy/download_init.sh` | 执行节点首次部署入口 |
| `backend/deploy/download_deploy.sh` | 执行节点日常发布入口 |
| `backend/deploy/script/download_deploy_init.sh` | 远端初始化实现 |
| `backend/deploy/script/download_deploy_remote.sh` | 远端日常发布实现 |
| `backend/deploy/supervisor/tg-download-node.conf` | 执行节点 supervisor 配置 |
| `backend/deploy/nginx/download-node.conf` | 执行节点 nginx 示例 |

可复用:SSH 认证、Git 私钥传输、`uv sync` 和 Python 环境、日志目录、备份和回滚目录逻辑。不能复用:业务节点 config 生成的必填 DB 校验、数据库结构同步、`/api/system/health`、业务节点 supervisor program 名。

## 4. 执行节点 `.env` 示例

```bash
DOWNLOAD_NODE_IDS=( "sg-1" "us-1" )

DOWNLOAD_NODE_sg_1=(
  "server_host=203.0.113.10"
  "server_port=22"
  "server_user=root"
  "ssh_private_key_path="
  "app_name=tg-download-node-sg-1"
  "deploy_dir=/data/tg-download-node/sg-1/"
  "backup_dir=/data/tg-download-node/sg-1/.backups/"
  "keep_versions=5"
  "backend_port_py=9600"
  "nginx_server_name=dl-sg-1.example.com"
  "public_api_base_url=https://dl-sg-1.example.com"
  "public_website_base_url=https://telegramdownloadmedia.com"
  "redis_host=127.0.0.1"
  "redis_port=6379"
  "redis_password="
  "redis_key_prefix=tg-download-node-sg-1"
)

REPO_URL="git@github.com:zbhydra/extension-tg-download.git"
BRANCH="main"

# 下载 token:执行节点只配验签公钥,不配签发私钥(token 规格属下载域)
DOWNLOAD_TOKEN_ALGORITHM="EdDSA"
DOWNLOAD_TOKEN_PUBLIC_KEYS='
    - "CHANGE_ME_CURRENT_PUBLIC_KEY_PEM"
    - "CHANGE_ME_PREVIOUS_PUBLIC_KEY_PEM"
'
# CORS 不写入应用配置;跨域在 nginx 或部署层配置
```

规则:

- 多台执行节点维护在同一份 `.env.download` 的 `DOWNLOAD_NODE_IDS` 数组里。
- 每台必须单独配 `server_host`、`app_name`、`deploy_dir`、`backend_port_py`、`nginx_server_name`、`public_api_base_url`、`public_website_base_url`、`redis_*`、`redis_key_prefix`。
- `DOWNLOAD_NODE_<id>` 变量名里中划线写下划线(`sg-1` → `DOWNLOAD_NODE_sg_1`)。
- 执行节点 admin JWT 配置来自 `config.download.yaml.example`,不在 `.env.download` 重复。
- 执行节点只配 `DOWNLOAD_TOKEN_PUBLIC_KEYS` 和 `DOWNLOAD_TOKEN_ALGORITHM`,不配 `DOWNLOAD_TOKEN_PRIVATE_KEY`。
- `app.role`、`telegram.api_hash` 固定写在 `config.download.yaml.example`,不在 `.env.download` 重复。
- `DB_*`、`SMTP_CONFIG` 不属于执行节点 `.env` 必填项。
- Telegram session 落在该节点 `backend/data/`;X / Instagram Cookie 落在相对 `DEPLOY_DIR` 的 `data/media-cookie/`。代码侧解析媒体 Cookie 路径必须基于部署根或显式配置根,不依赖 supervisor 当前工作目录。

## 5. 执行节点 config 模板

```yaml
app:
  name: "{APP_NAME}"
  version: "0.1.0"
  host: "0.0.0.0"
  port: {BACKEND_PORT_PY}
  debug: false
  env: "prod"
  public_api_base_url: "{PUBLIC_API_BASE_URL}"
  public_website_base_url: "{PUBLIC_WEBSITE_BASE_URL}"
  role: "download"

service_node:
  health_check_interval_seconds: 60

logging:
  level: "INFO"
  format: "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
  file: "log/app.log"

api:
  title: "tg-download-node-api"
  description: "Download node API"
  version: "0.1.0"
  docs_url: ""
  redoc_url: ""

auth:
  jwt_secret_key: "abcabcss$%^&*()_+"
  jwt_algorithm: "HS256"

admin:
  access_token_expire: 1800
  refresh_token_expire: 604800

download_token:
  algorithm: "{DOWNLOAD_TOKEN_ALGORITHM}"
  public_keys:
{DOWNLOAD_TOKEN_PUBLIC_KEYS}

redis:
  host: "{REDIS_HOST}"
  port: {REDIS_PORT}
  db: 0
  password: "{REDIS_PASSWORD}"
  pool_size: 50
  pool_timeout: 5
  key_prefix: "{REDIS_KEY_PREFIX}"
  socket_timeout: 5
  socket_connect_timeout: 5
  retry_on_timeout: true
  retry_attempts: 3

telegram:
  api_id: 23914308
  api_hash: "bacf7a52b0256d1bcbe25a407a3be0d6"
  session_path: "data/"

download:
  proxy_total_rate_limit_mb_per_second: 0
```

规则:

- `download` role 可存在 `database` 配置块,但发布模板不应要求真实业务数据库;启动和请求不能因缺业务数据库失败。
- `download` role 可存在 `redis` 配置块,但 admin access JWT 校验不能查 Redis。
- `download` role 下 `auth` 只有 `jwt_secret_key` / `jwt_algorithm` 被节点本地 admin JWT 验签使用;用户登录 / access / refresh / 限流字段只属 `business`,下载模板不提供。
- `api.docs_url` / `redoc_url` 生产执行节点默认关闭;配置加载层把空字符串标准化为 `None` 再创建 FastAPI app。
- `app.public_api_base_url` 只用于日志辅助;调度以 `service_nodes.public_base_url` 为准。

业务服务器配置需新增:`service_node.health_check_interval_seconds`(60,范围 10..600)、`admin.access_token_expire: 1800`、`admin.refresh_token_expire: 604800`、`download_token`(含 `private_key` + `public_keys`)。所有业务环境必须显式设置 admin TTL,不依赖代码默认值。

## 6. Supervisor 示例

```ini
[program:{APP_NAME}]
directory={BACKEND_DIR}
command={BACKEND_DIR}/.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port {BACKEND_PORT_PY} --workers 1
user=root
autostart=true
autorestart=true
startsecs=10
startretries=3
stopasgroup=true
killasgroup=true
stopwaitsecs=10
stdout_logfile={BACKEND_DIR}/log/supervisor.log
stderr_logfile={BACKEND_DIR}/log/supervisor_error.log
stdout_logfile_maxbytes=50MB
stderr_logfile_maxbytes=50MB
stdout_logfile_backups=3
stderr_logfile_backups=3
environment=PYTHONUNBUFFERED="1",TZ="America/New_York"
```

supervisor 配置写入 `/etc/supervisor/conf.d/{APP_NAME}.conf`,避免多执行节点互相覆盖。`{BACKEND_DIR}` = `<deploy_dir>/backend`;`{BACKEND_PORT_PY}` 来自 `.env.download`。

## 7. Nginx 合同

| 项目 | 合同 |
| --- | --- |
| 监听 | HTTP 80，`server_name` 由 `NGINX_SERVER_NAME` 渲染 |
| 请求行预算 | 4 个 16 KiB buffer，覆盖 8192 字符 GET token 及路径/请求头开销 |
| 上游 | 名称带 `{BACKEND_PORT_PY}` 避免同机多环境冲突，目标为 `127.0.0.1:{BACKEND_PORT_PY}`，keepalive 64 |
| CORS | origin / methods / request headers / exposed headers 均放开，OPTIONS 返回 204 |
| Referrer | 响应统一 `no-referrer` |
| 真实 IP | 透传 Host、X-Real-IP、X-Forwarded-For、CF-Connecting-IP 和 X-Forwarded-Proto |
| 下载流 | 关闭响应缓冲、临时文件和请求缓冲，透传 Range / If-Range，读写超时 3600 秒 |
| `download-v2` | 无尾斜杠/有尾斜杠路径均使用不含 query 的 access log，log format 和文件名带 `{BACKEND_PORT_PY}` 避免重复，关闭 error log |
| 其他路径 | 统一交给 download role 应用裁剪路由 |

规则:

- 只保留 `download-v2` 精确日志保护和通用代理入口。精确入口只使用 method + path 的 access log 并关闭 error log,不做鉴权、限流或路径白名单;路由是否存在仍由 download role 应用决定。
- 不配 `limit_req`、`limit_conn`、路径白名单、来源白名单。
- 代理响应缓冲默认关闭,透传 `Range` / `If-Range`,保证续传和未知大小 Range 拒绝逻辑。
- CORS 放开为 `*`;`download-v2` access log 禁止 query, error log 关闭,其他路径保留既有日志;应用日志不记录完整 token。
- 响应可补 `Referrer-Policy: no-referrer`;执行接口的应用响应必须含 `Cache-Control: no-store`。
- 健康检查可只允许业务服务器来源 IP;若做 IP 限制,admin 手动健康检查也应由业务服务器发起。

业务服务器 nginx 也必须暴露同一套节点本地管理路径(`/api/admin/tg/`、`/api/admin/channel-settings/{x|instagram}/cookies`),因为业务节点也可被 admin 直连管理;`business` role 这些路径同样走 JWT-only 节点本地管理 router,部署层按真实 admin 前端来源放行 `OPTIONS` 和 `Authorization`。

## 8. 发布流程

首次部署:`bash backend/deploy/download_init.sh backend/deploy/.env.download sg-1`
日常发布:`bash backend/deploy/download_deploy.sh backend/deploy/.env.download sg-1`

发布后在业务服务器 admin 新增节点(`node_type=2`、name、region、`public_base_url`、`internal_base_url`、`enabled=false`、`weight=100`),健康检查通过后再启用。

脚本行为:

- 初始化:连接 → 克隆仓库 → 生成 `config.yaml` → 创建 `backend/log`、`backend/data`、`data/media-cookie` → 装 Python / uv → **不跑数据库结构同步** → 安装 supervisor program → 启动 → 检查 `/internal/service-node/health`。
- 日常发布:备份代码和 `config.yaml` → 拉最新代码 → 生成 `config.yaml` → 装依赖 → **不跑数据库结构同步** → 重启 supervisor → 检查 `/internal/service-node/health` → 失败回滚到上一备份并重启;回滚仍失败保留日志退出非 0。

## 9. 测试要点

- 不提供 `DB_HOST` / `SMTP_CONFIG` 时发布配置生成成功;脚本不执行数据库结构同步;supervisor program 名来自 `.env.download`;健康检查用 `/internal/service-node/health`。
- nginx 统一反代、不额外阻断节点本地 admin 路由、不加限流、关 proxy buffering、允许 `Authorization`。
- 业务服务器 nginx 暴露业务节点本地管理路径并允许 `Authorization`;部署后先创建至少一条 `node_type=1` 业务节点记录并确认健康检查通过(没有业务节点允许运行但需明确没有兜底)。
- 执行节点挂载 `backend/data/`(Telegram session)和相对 `DEPLOY_DIR` 的 `data/media-cookie/`(X / Instagram Cookie);不得把媒体 Cookie 挂到 `backend/data/media-cookie/`。
- 日志不记录完整 token;响应含 `Cache-Control: no-store`。
- `bash -n` 校验四个脚本语法。

## 10. 回滚

- 执行节点发布失败,不在 admin 启用该节点;已启用异常则在 admin 停用。
- 业务服务器和旧前端不依赖执行节点,回滚执行节点不影响旧下载路径。
