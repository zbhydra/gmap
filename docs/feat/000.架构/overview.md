# 000 · 架构 · 项目整体架构

> 跨业务域共享的技术地基与架构事实。本文件描述「现在怎么搭」，不是「应该怎么做」。规则条文见根 `@../../../AGENTS.md`，本文不复述，只在事实与规则有出入时标注差异。
> 业务域（001-007）只描述「功能 + 边界」，技术细节各自落在 `tech-*.md`；本域是它们共同的地基，被各域 `@` 引用。

## 1. 各端职责

monorepo，各前端子项目独立用 pnpm 管理（无根 workspace），后端用 uv。现役端如下：

| 端 | 目录 | 技术栈 | 职责 |
| --- | --- | --- | --- |
| **backend** | `backend/` | Python 3 + FastAPI + SQLAlchemy(async) + aiomysql + Redis | 业务服务器（`business` 角色）与执行节点（`download` 角色）共用同一份代码；API、调度、crons、支付、节点管理全在这。详见 `@tech-backend.md` |
| **website** | `website/` | Astro，nginx 部署；依赖以本端 package.json 为准 | MapsGrab 主站，提供产品页、Pricing 与工具；站点配置见本端 README，工程职责见 `@tech-website.md` |
| **extension** | `extension/` | Vue 3 + Pinia + vue-i18n，**Chrome Manifest V3** | Google Maps 采集插件，跨上下文 RPC、与 backend 共用 HTTP 契约。详见 `@tech-extension.md` |
| **extension-bing** | `extension-bing/` | Vue 3，**Chrome Manifest V3** | Bing Maps 采集插件，与 Google Maps 插件共享 `maps_extension` 订阅类别。详见 `@../016.Bing插件/feat.md` |
| **admin** | `admin/` | Vue 3 + Naive UI + vue-router + Pinia | 独立 SPA 管理后台，展示用户、订单、三类订阅和用量，走 `/api/admin/*`。详见 `@../008.管理后台/feat.md` |

### 1.1 本地开发端口

日常应用固定使用 4 个监听端口；开发服务器启用严格端口模式，端口被占用时启动失败，不自动顺延。

| 端口 | 服务 | 配置来源 |
| --- | --- | --- |
| `7610` | admin 管理后台 | `admin/vite.config.ts` |
| `7620` | website 主站 | `website/astro.config.mjs` |
| `7600` | backend business 业务服务 | `backend/config.yaml` |
| `7601` | backend download 执行节点 | `backend/config.download.yaml` |

extension 常规开发命令执行 watch 构建，不监听 HTTP 端口；显式运行 `pnpm dev:extension` 时固定使用 `5173`。

测试保留 `4332`（website 独立 E2E）和 `7602`（第二个 download E2E 节点），不属于日常应用端口。MySQL `3306`、Redis `6379` 与 Edge CDP `9222` 是外部基础设施或调试工具端口，也不计入上述 5 个应用端口。

## 2. 技术栈速查

- **后端**：Python（uv 管理）、FastAPI、SQLAlchemy 2.x async（aiomysql 驱动）、Redis（redis.asyncio）、Pydantic、click。唯一 ORM/DB 引擎是 MySQL。
- **网站**：Astro（SSG）；依赖以 `website/package.json` 为准，Playwright e2e。
- **插件**：Vue 3 + Pinia + vite-plugin-web-extension（MV3）+ vue-i18n + Tailwind；Playwright e2e。
- **后台**：Vue 3 + Naive UI + axios + vue-router。
- **包管理**：前端各子项目独立 pnpm（**无根 workspace**，各自 `package.json` + lockfile），后端 uv（`backend/uv.lock`）。

## 3. 数据流主干

```
用户
 │
 ├─ 浏览器 ─→ website (Astro 静态站)
 │             │  登录/订阅/订单 调 backend business (HTTP)
 │             │  mark-log 双写: backend /api/client/mark + 阿里云 SLS WebTracking (后端不可用时逃生)
 │             ▼
 │      backend (business 角色, FastAPI)
 │        ├─ /api/client/*   Maps 采集/用量/订阅/订单/登录接口
 │        ├─ /api/admin/*    admin 后台接口
 │        ├─ /api/system/*   健康检查/看板
 │        ├─ /api/internal/* 节点内部接口 (无业务 DB 依赖)
 │        ├─ /api/callback/* 共享支付回调 (保留 Telegram Stars)
 │        ├─ crons 框架 (注册表 + MySQL 游标 + 调度器)
 │        └─ Maps 云端任务 → 采集 Provider / 结果存储
 │
 └─ 桌面浏览器 ─→ extension / extension-bing (Google Maps / Bing Maps)
                  │  content/background/injected 三上下文, 自研 RPC
                  │  HTTP 调同一 backend business (X-Device-Id + token)
                  │  采集结果本地导出；订阅购买和管理跳转 website Pricing
                  ▼
              backend business (同上, /api/client/*)
```

要点：
- **website / extension / admin 走同一套后端 HTTP 契约**，客户端前缀 `/api/client/*`、后台前缀 `/api/admin/*`。接口只用 GET 和 POST（见 `@../../../AGENTS.md` §3）。
- **SLS 日志双写在 website 前端**，不在 backend Python 侧（后端用标准 logging：控制台 + 文件）。见 `@tech-website.md` 与 `feat.033`。

## 4. 业务域依赖地图

现役 Maps 产品复用 003–011 的共享计费、订单、计数器、订阅、用户与增长基建。006 按三类产品隔离订阅，购买入口归 011，月度计量归 [额度基建](tech-额度基建.md)；013 与 016 共享插件订阅，014 承接 Online/API。

以下是 TG 下载工程时期 001–007 的历史依赖地图,不表示下载产品仍在本仓运营：

| 依赖方 ↓ ＼ 被依赖方 → | 001 节点 | 002 下载 | 003 积分 | 004 订单 | 005 计数器 | 006 订阅 | 007 用户 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **001 节点系统** | — | ✓ | ✓ | | | | |
| **002 下载功能** | ✓ | — | ✓ | | | | |
| **003 积分系统** | ✓ | ✓ | — | ✓ | ✓ | | |
| **004 订单系统** | | | ✓ | — | | ✓ | ✓ |
| **005 计数器系统** | ✓ | ✓ | ✓ | — | | | |
| **006 订阅系统** | ✓ | ✓ | ✓ | ✓ | ✓ | — | |
| **007 用户系统** | ✓ | ✓ | ✓ | ✓ | ✓ | | — |

历史依赖说明：
- **001 节点系统**、**002 下载功能**是原下载工程的执行链路；共享能力复用边界以各域现行合同为准。
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
