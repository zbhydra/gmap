# 000 · 架构 · 项目整体架构

> 跨业务域共享的技术地基与架构事实。本文件描述「现在怎么搭」，不是「应该怎么做」。规则条文见根 `@../../../AGENTS.md`，本文不复述，只在事实与规则有出入时标注差异。
> 业务域（001-007）只描述「功能 + 边界」，技术细节各自落在 `tech-*.md`；本域是它们共同的地基，被各域 `@` 引用。

## 1. 各端职责

monorepo，各前端子项目独立用 pnpm 管理（无根 workspace），后端用 uv。共 4 个应用：

| 端 | 目录 | 技术栈 | 职责 |
| --- | --- | --- | --- |
| **backend** | `backend/` | Python 3 + FastAPI + SQLAlchemy(async) + aiomysql + Redis | 业务服务器（`business` 角色）与执行节点（`download` 角色）共用同一份代码；API、调度、crons、支付、节点管理全在这。详见 `@tech-backend.md` |
| **website** | `website/` | Astro 5 + Vue 3 岛屿 + Tailwind，nginx 部署 | 面向终端用户的 SEO 多语言站点（14 语言），主域 `telegramdownloadmedia.com`，引导下载与安装 extension。详见 `@tech-website.md` |
| **extension** | `extension/` | Vue 3 + Pinia + vue-i18n + Tailwind，**Chrome Manifest V3** | Maps Extractor 插件（TG 下载业务已移除，改造中），跨上下文 RPC、与 backend 同一套 HTTP 契约。详见 `@tech-extension.md` |
| **admin** | `admin/` | Vue 3 + Naive UI + vue-router + Pinia | 独立 SPA 管理后台（节点/订单/渠道/TG 客户端/mark-log 诊断），走 `/api/admin/*`。详见 `@tech-extension.md` 末尾 |

### 1.1 本地开发端口

日常应用固定使用 4 个监听端口；开发服务器启用严格端口模式，端口被占用时启动失败，不自动顺延。

| 端口 | 服务 | 配置来源 |
| --- | --- | --- |
| `9610` | admin 管理后台 | `admin/vite.config.ts` |
| `9620` | website 主站 | `website/astro.config.mjs` |
| `9600` | backend business 业务服务 | `backend/config.yaml` |
| `9601` | backend download 执行节点 | `backend/config.download.yaml` |

extension 常规开发命令执行 watch 构建，不监听 HTTP 端口；显式运行 `pnpm dev:extension` 时固定使用 `5173`。

测试保留 `4332`（website 独立 E2E）和 `9602`（第二个 download E2E 节点），不属于日常应用端口。MySQL `3306`、Redis `6379` 与 Edge CDP `9222` 是外部基础设施或调试工具端口，也不计入上述 5 个应用端口。

## 2. 技术栈速查

- **后端**：Python（uv 管理）、FastAPI、SQLAlchemy 2.x async（aiomysql 驱动）、Redis（redis.asyncio）、Pydantic、click。唯一 ORM/DB 引擎是 MySQL。
- **网站**：Astro（SSG）+ Vue 3 岛屿 + Tailwind + mediabunny（下载引擎）；Playwright e2e。
- **插件**：Vue 3 + Pinia + vite-plugin-web-extension（MV3）+ vue-i18n + Tailwind；Playwright e2e。
- **后台**：Vue 3 + Naive UI + axios + vue-router。
- **包管理**：前端各子项目独立 pnpm（**无根 workspace**，各自 `package.json` + lockfile），后端 uv（`backend/uv.lock`）。

## 3. 数据流主干

```
用户
 │
 ├─ 浏览器 ─→ website (Astro 静态站)
 │             │  解析/下载/计费 调 backend business (HTTP)
 │             │  mark-log 双写: backend /api/client/mark + 阿里云 SLS WebTracking (后端不可用时逃生)
 │             ▼
 │      backend (business 角色, FastAPI)
 │        ├─ /api/client/*   互联网客户端接口 (下载/解析/积分/计数/订单/登录/签到)
 │        ├─ /api/admin/*    admin 后台接口
 │        ├─ /api/system/*   健康检查/看板
 │        ├─ /api/internal/* 节点内部接口 (无业务 DB 依赖)
 │        ├─ /api/callback/* 支付/Telegram 回调
 │        ├─ crons 框架 (注册表 + MySQL 游标 + 调度器)
 │        ├─ 调度: 按 权重/健康 加权随机抽 service_nodes →
 │        │
 │        ▼  (业务服务器转发执行请求到选中节点)
 │      backend (download 角色, 同一份代码, 多地区多实例)
 │        ├─ 不连业务数据库, 只连本地运行态 (tg session / cookie 文件)
 │        ├─ /download-pre-v2 /download-v2 执行接口 (由 business 转发)
 │        └─ 上游: Telegram / TikTok / Instagram / X / Reddit / Vimeo / Threads ...
 │
 └─ 桌面浏览器 ─→ extension (Chrome MV3, 跑在 web.telegram.org)
                  │  content/background/injected 三上下文, 自研 RPC
                  │  HTTP 调同一 backend business (X-Device-Id + token)
                  │  下载大文件时引导用户用插件本地下载
                  ▼
              backend business (同上, /api/client/*)
```

要点：
- **website / extension / admin 走同一套后端 HTTP 契约**，客户端前缀 `/api/client/*`、后台前缀 `/api/admin/*`。接口只用 GET 和 POST（见 `@../../../AGENTS.md` §3）。
- **SLS 日志双写在 website 前端**，不在 backend Python 侧（后端用标准 logging：控制台 + 文件）。见 `@tech-website.md` 与 `feat.033`。

## 4. 业务域依赖地图

7 个业务域（001-007），依赖信号取各域 `feat.md` 里的 `@` 引用（行依赖列）：

| 依赖方 ↓ ＼ 被依赖方 → | 001 节点 | 002 下载 | 003 积分 | 004 订单 | 005 计数器 | 006 订阅 | 007 用户 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **001 节点系统** | — | ✓ | ✓ | | | | |
| **002 下载功能** | ✓ | — | ✓ | | | | |
| **003 积分系统** | ✓ | ✓ | — | ✓ | ✓ | | |
| **004 订单系统** | | | ✓ | — | | ✓ | ✓ |
| **005 计数器系统** | ✓ | ✓ | ✓ | — | | | |
| **006 订阅系统** | ✓ | ✓ | ✓ | ✓ | ✓ | — | |
| **007 用户系统** | ✓ | ✓ | ✓ | ✓ | ✓ | | — |

观察（用于判断地基归属）：
- **001 节点系统**被 6 个域引用，是执行底座；**003 积分系统**被 5 个域引用，是现行计费权威；**002 下载功能**被 5 个域引用，是核心业务链路。这三个是「最底层」业务域。
- **006 订阅系统**已重新激活为插件专属权益域,购买入口归 011 Pricing,额度扣减归 005 计数器。
- 001↔002 存在双向 `@`（节点提供执行环境 ↔ 下载业务跑在节点上）。
- 007 用户系统在 001-007 内出度最多（5）但在该范围内不被其他域 `@` 回指（其他域谈 user_id 时未加链接），属不对称——因为账号/会话是横切底座，所有域都隐含依赖它。

**000 架构域与 001-007 的关系**：000 是所有业务域之下的技术地基（DB / 后端分层 / crons / 配置 / 多语言 / 跨端通信），001-007 的 `tech-*.md` 在涉及这些地基时 `@` 回本域对应文件。000 不描述任何业务实现，业务在各自域。

## 5. 共享约定入口（指向各 tech-*.md）

| 地基主题 | 文件 |
| --- | --- |
| MySQL / 时区 / 结构同步 / 索引规则 | `@tech-数据库.md` |
| FastAPI 分层 / 异常中间件 / 配置 / crons / Redis / SLS | `@tech-backend.md` |
| Astro 目录 / 多语言 / Sitemap / Cloudflare / SEO | `@tech-website.md` |
| 插件上下文 / RPC / store / quota / 与后端通信 + admin 后台 | `@tech-extension.md` |
| 本次建立记录 | `@changelog.md` |

规则文档（指令性，非本域重复）：
- 常驻契约（优先级链 / 硬约束 / 仓库地图 / 交付标准）`@../../../AGENTS.md`
- 注释与错误消息 `../../references/specs/spec-code.md`
- 索引规则 `../../references/specs/spec-index.md`
- 各端与测试 spec 索引见 `@../../../AGENTS.md` §6。
