# 001 · 节点数据与调度

> 覆盖 service_nodes 表结构、节点状态语义、节点选择策略、健康检查调度、健康接口规格。
> 关联:`@feat.md` `@tech-角色与路由.md` `@tech-节点Admin与本地管理.md`
> 本文件定义通用的节点选择策略;下载域的 parse-pre-v2 / download-pre-v2 控制面接口使用本策略,接口规格见 `@../002.下载功能/tech-链路与授权.md`。

## 1. service_nodes 表

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `node_id` | `BigInteger` PK | 节点 ID,自增主键 |
| `node_type` | `Integer` | 1=business,2=download |
| `name` | `String(100)` | 展示名 |
| `region` | `String(64)` | 地区 |
| `public_base_url` | `String(255)` | 客户端下载和 admin 直连节点本地管理的地址 |
| `internal_base_url` | `String(255)` | 业务服务器健康检查访问地址 |
| `enabled` | `Boolean` | admin 控制的启用状态 |
| `status` | `Integer` | 历史调度状态:1=启用 / 3=停用;由 `enabled` 自动派生,不在 admin 单独管理 |
| `weight` | `Integer` | 随机选择权重 |
| `last_health_status` | `Integer` | 0=unknown / 1=healthy / 2=unhealthy |
| `last_health_at` | `BigInteger` nullable | 最近健康检查 Unix 秒 |
| `last_error` | `String(512)` nullable | 最近错误 |
| `session_count` | `Integer` | 最近上报 session 数 |
| `version` | `String(64)` nullable | 节点版本 |
| `created_at` | `BigInteger` | 创建时间 Unix 秒 |
| `updated_at` | `BigInteger` | 更新时间 Unix 秒 |

索引:`node_id` 是主键,不额外加普通索引。首版先按真实查询落地后再决定索引;若出现高频大表扫描,再按 `../../references/specs/spec-index.md` 补现有索引、查询位置和用途。不提前加"可能以后用"的索引。

## 2. 节点状态语义

| 字段 | 值 | 行为 |
| --- | --- | --- |
| `node_type` | `1` | business,具备业务数据库能力,也作为普通节点参与执行 |
| `node_type` | `2` | download,不连业务数据库,只提供节点执行接口、健康检查、节点本地管理 |
| `enabled` | `true` | 可参与调度选择 |
| `enabled` | `false` | 不参与分配,但保留健康检查和 admin 管理 |
| `status` | `1` | 历史字段,`enabled=true` 时自动写入 |
| `status` | `3` | 历史字段,`enabled=false` 时自动写入 |
| `last_health_status` | `0` | unknown,未检查或状态未知 |
| `last_health_status` | `1` | healthy,最近一次健康检查通过 |
| `last_health_status` | `2` | unhealthy,最近一次健康检查失败 |

业务节点是普通 `service_nodes` 记录,不由控制面接口静默创建,也不要求当前进程匹配某个 `node_id`。admin 可创建一个或多个 `node_type=1` 业务节点;是否参与候选池由 `weight` 控制。

## 3. 节点选择策略

通用候选规则(适用于所有使用本节点池的调度入口,下载域的 parse-pre-v2 / download-pre-v2 直接复用):

1. 候选池不区分 `node_type`,业务节点和执行节点同池。
2. 只选 `enabled=true`。
3. 只选 `last_health_status=1`。
4. 只选 `weight>0` 且 `public_base_url` 合法。
5. 只按 `weight` 加权随机,不按 `last_health_at` 排序。
6. 加权随机不放回抽取最多 3 次,每次选中后从候选池移除。
7. `weight=0` 表示保留记录但不进随机池。

候选不足 3 个时返回实际可用数量。候选池为空时返回节点不可用错误,不能抛除零或空池错误。admin 创建节点 `weight` 默认 100,API 层合法范围 `0..1000`。

本阶段不做节点平台 / 执行模式能力字段。所有节点都视为暴露统一执行接口;某平台能否在节点执行由本地 cookie、session、平台配置、执行依赖、上游权限决定,失败时由节点接口返回明确错误。

### 亲和 hint

调度入口可接收一个 `preferred_node_id` 作为亲和提示(下载域:由解析成功节点回传给下载授权入口)。命中候选池时排第一;缺失 / 无效 / 不可用时退回普通选择;剩余按通用规则抽取,总数最多 3,不重复已优先命中的节点。`preferred_node_id` 只是 hint,不作鉴权或资源真实性依据。

> 具体哪个接口接收 `preferred_node_id`、亲和字段名、错误码语义,属下载域接口规格,见 `@../002.下载功能/tech-链路与授权.md`。本节只规定亲和提示如何影响本策略的候选排序。

## 4. 健康检查

业务服务器定时调用节点:

```text
GET /internal/service-node/health
```

写回 `service_nodes`:`last_health_status`、`last_health_at`、`last_error`、`session_count`、`version`。

- `service_nodes.session_count` 写回健康响应的 `session_count`;`discovered_session_count` 不写独立列,需要时放 `runtime_status` 诊断。
- 健康响应不返回业务数据库 `node_id`;检查某条记录时直接写回当前记录;URL 配错按被检查地址的真实状态写回。
- 业务节点也暴露同一健康接口,响应 `role=business`;健康检查调度对业务节点和执行节点用同一条 HTTP 路径。

健康响应可选 `runtime_status`(JSON):节点自报本地 cookie、session、依赖等诊断,只用于日志和 admin 展示,不参与调度,不能自动改变线上分流。

调度方式:

- 不新增调度依赖。
- `business` role 在 FastAPI lifespan 中启动一个 `asyncio.create_task` 后台循环。
- 循环按固定间隔检查 `service_nodes` 中业务节点和执行节点,关闭时取消任务并等待退出。
- 默认间隔 60 秒,配置 `service_node.health_check_interval_seconds`,范围 `10..600`。
- `download` role 不启动健康检查调度。
- 单个节点检查失败只写回该节点 `last_health_status` / `last_error`,不影响其他节点检查。

## 5. 健康检查响应规格

```json
{
  "status": "ok",
  "role": "download",
  "version": "0.1.0",
  "session_count": 2,
  "discovered_session_count": 2,
  "runtime_status": {
    "tg_session_count": 2,
    "x_cookie_file_exists": true,
    "instagram_cookie_file_exists": true,
    "last_local_error": null
  }
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `runtime_status` | JSON nullable | 节点自报本地诊断,只用于日志和 admin 展示;缺失不影响调度 |
| `runtime_status.x_cookie_file_exists` | boolean | 当前节点 X Cookie JSON 池文件是否存在 |
| `runtime_status.instagram_cookie_file_exists` | boolean | 当前节点 Instagram Cookie JSON 池文件是否存在 |

健康检查不得调用 `check_db_connection()`。
