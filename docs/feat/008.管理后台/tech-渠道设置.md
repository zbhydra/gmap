# 008 · 渠道设置

> 覆盖渠道设置菜单中的 X / Instagram 媒体 Cookie 本地池管理。通用 admin 接口约定见 `@tech-管理模块接口.md`,节点本地入口边界见 `@tech-节点本地与中心入口.md`。

## 范围

Cookie 明文只保存在当前 / 目标节点的本地 JSON 文件,不进入业务数据库。两个平台共用一套管理合同和文件池模型,但文件、关键字段和运行时消费链路彼此独立:

| 平台 | 本地文件 | 管理端关键字段 | 运行时顺序 |
| --- | --- | --- | --- |
| X | `data/media-cookie/x.com.cookies.json` | `auth_token`、`ct0`、`twid` | 匿名解析 → 启用 Cookie 随机逐条尝试 → 游客 Playwright Cookie 兜底 |
| Instagram | `data/media-cookie/instagram.com.cookies.json` | `sessionid`、`csrftoken`、`ds_user_id` | 匿名解析 → 启用 Cookie 随机逐条尝试 → 全部失败返回原匿名解析错误 |

Cookie 池文件读写与运行时消费属下载域(`@../002.下载功能`),本域描述 admin 管理合同与 UI。

## 接口

`platform` 只允许 `x` 或 `instagram`。中心业务节点和目标节点直连使用相同路径与响应合同。

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/channel-settings/{platform}/cookies` | `get_admin_user` 或 `get_admin_jwt_only` | 查询指定平台池状态与记录列表,不含明文 |
| POST | `/api/admin/channel-settings/{platform}/cookies` | 同上 | 新增指定平台 Cookie 记录 |
| POST | `/api/admin/channel-settings/{platform}/cookies/{cookie_id}/update` | 同上 | 更新记录;明文留空表示不替换 |
| POST | `/api/admin/channel-settings/{platform}/cookies/{cookie_id}/delete` | 同上 | 删除记录 |

列表响应:

- `exists`:池文件是否存在。
- `updated_at`:池文件更新时间,毫秒时间戳;文件不存在时为 `null`。
- `rows`:每条包含 `cookie_id`、`name`、`enabled`、`cookie_format`、`key_fields`、`last_used_at`、`last_success_at`、`last_failure_at`、`last_failure_reason`、`created_at`、`updated_at`。
- `key_fields`:以 Cookie 名为 key 的布尔映射,按平台动态计算;不在 JSON 文件中冗余持久化。

新增请求:`name`(1..128)、`enabled`、`cookie_text`(非空,支持浏览器 Cookie header 与 Netscape cookiefile 两种格式)。

更新请求:`name`、`enabled`、可选 `cookie_text`(为空或缺省表示只更新名称与启用状态,不替换已存明文)。

## UI 与交互

- 页面顶部为 X、Instagram 两个 Tab,默认 X;首次切换到某个平台时才并发加载该平台的各节点 Cookie 池,之后切换复用已加载状态。
- 每个 Tab 按服务节点展示可折叠区块;节点头展示类型、文件状态、更新时间,区块内提供刷新、新增、编辑、删除。
- 表格列统一为名称、启用状态、格式、平台关键字段、最近成功、最近失败、更新时间、操作;关键字段同时显示字段名和“是 / 否”,不只依赖颜色。
- 新增 / 编辑弹窗标题和占位文案标明当前平台。新增时名称和 Cookie 必填;编辑时 Cookie 留空表示不替换。
- Cookie 文本只存在于当前编辑输入框和提交请求中;关闭弹窗、保存成功、重新加载列表后均不回显。
- 窄屏节点工具栏纵向排列,表格在自身容器内横向滚动,不撑破页面。

## 安全要求

- 任何列表、增删改响应都不返回 Cookie 明文。
- 后端日志不打印 Cookie 明文;运行时失败原因持久化前对 X 与 Instagram 常见敏感字段脱敏。
- JSON 父目录权限为 `0700`,池文件和原子写入临时文件权限为 `0600`。
- Provider 使用的临时 Netscape cookiefile 权限为 `0600`,调用完成立即删除。
- Instagram SSR / Relay 的 HTTP Cookie 只绑定 `.instagram.com`,不得发送给 CDN 或其他域名。
- 旧数据库 Cookie 池表不参与运行时读写。

## 实现锚点

| 边界 | 模块 |
| --- | --- |
| Admin API | `@backend/src/app/api/admin/admin_channel_settings.py` |
| 通用本地池 | `@backend/src/app/provider/media_cookie_pool.py` |
| 运行时消费 | `@backend/src/app/provider/media/x_media.py`、`@backend/src/app/provider/media/instagram_media.py` |
| 节点健康诊断 | `@backend/src/app/api/internal/service_node_health.py` |
| Admin API 与页面 | `@admin/src/api/channel-settings.ts`、`@admin/src/views/ChannelSettingsView.vue` |

## 验收

- X 既有查看、新增、编辑、删除和游客兜底行为不回归。
- 切换 Instagram 后只请求 Instagram 路径,显示 `sessionid` / `csrftoken` / `ds_user_id` 检测结果。
- Instagram 新增请求携带明文,成功响应、后续列表和页面文本均不含该明文。
- 匿名 Instagram 解析失败后能使用池内 Cookie;单条失败记录脱敏原因并继续下一条,任一条成功即停止重试。
- 无效 `platform` 被 API 参数校验拒绝;业务节点与执行节点上的同路径都由对应 admin 鉴权边界保护。
