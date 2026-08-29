# 001 · 节点系统 · 变更记录

## 2026-07-13 节点本地管理增加 Instagram Cookie 池

**为什么**:Instagram 后端解析需要按节点维护登录 Cookie,节点系统必须让业务节点与执行节点使用同一条直连管理边界,并在健康诊断中独立报告文件状态。

**from → to**:节点本地 Cookie 管理从 X 单平台路径与单文件诊断 → 受限 `x / instagram` 平台路径、两份独立本地文件和 `instagram_cookie_file_exists` 运行态字段;鉴权、直连、停用节点仍可配置等边界不变。

## 2026-07-01 TG 账号池增加 client_ref 亲和调度

**为什么**:Telegram parse 与 download 可能分配到不同账号,导致下载阶段无法复用解析账号的 Telethon entity cache,重复触发 `ResolveUsernameRequest` 并引发 FloodWait。

**from → to**:`@tech-TG账号池.md` 从纯「最少活跃请求数优先」→ 增加可选 `preferred_client_ref` 软亲和选择;`_ManagedClientState` 增加 `client_ref = sha256(phone + "***SEC***")` 作为 token 透传的账号亲和标识,亲和账号不可用或负载过高时回退原负载策略。

## 2026-06-23 文档结构迁移

**为什么**:文档结构重整,把"通用执行节点底座"与"跑在节点上的下载业务"分离成独立域,让节点系统可被未来其他业务复用,避免节点底座与下载接口规格耦合在同一份文档。

**from → to**:`docs/feat/041.TG下载节点/` 中节点相关部分(角色 / 路由 / 无 DB 边界 / 配置口径、service_nodes 表与调度、Admin 与节点本地管理、节点发布配置)→ 新建 `docs/feat/001.节点系统/` 域(`feat.md` + 4 份 `tech-*.md` + 本 changelog + `references/`)。下载业务流程、V2 接口规格、token 设计、前端切换仍属下载域,迁往 `@../002.下载功能/`。

## 2026-06-23 并入 013 TG 账号池

**为什么**:TG 账号池(多 session 发现 / 进程内复用 / 最少活跃请求数分配 / 进程级 lease / 飞书告警)本质是节点承载的 Telegram 客户端会话池管理,属 001 节点系统的 TG 客户端管理面,应并入 001 而非独立 feat。

**from → to**:`docs/feat/feat.013.telegram账号池调度.md`(执行计划 原 plan feat.013.001.telegram账号池调度)→ 新增 `@tech-TG账号池.md`,并在 `@references/index.md` 登记。

**边界**:001 原有 `tech-节点Admin与本地管理.md` 只覆盖 admin 对 session 的增删改查 HTTP 入口,不覆盖账号池内部机制;本次新增 tech 只写内部机制,二者不重复。001 已有 `feat.md` / 其他 `tech-*.md` 未改动。以代码为准,源文档未覆盖的 `cooldown_until` / `_deleting_phones` / `unavailable_error` 告警等已在新增 tech 中补齐(见其第 7 节差异说明)。
