# 网站用户 Dashboard

> 已批准；代码已落地，三轮 review 通过，已有本地后端+DB+本地存储替身下载闭环通过（2026-09-06）。外部对象存储端点（R2/AliOSS）未验证，用户决定停止验收。本文负责网站账户工作区的入口、布局和前端消费边界；业务规则继续归属用户、订阅与 Maps 云端领域。渠道管理入口的页面归属自 `@../011.Pricing页/tech-pricing与自动续费.md` 迁入本文。

## 用户行为

- 全站导航右侧：匿名时显示登录，登录后显示 Dashboard。通过导航登录成功后进入 Dashboard；取消登录留在原页。
- Dashboard 默认打开在线导出历史，左侧仅三个菜单：在线导出历史、API 管理、订阅管理。菜单具有独立 URL，支持刷新、直接访问和浏览器前进后退。
- 侧栏底部展示头像、姓名与邮箱；无头像使用姓名或邮箱首字母。点击个人信息展开菜单，点击退出后清除本站登录态并回到当前语言主页。品牌链接也可回到主页。
- 未登录直接访问工作区时展示登录入口，不加载私人数据；登录成功回到所访问的工作区页面，取消后回主页。认证失效沿用同一流程；普通网络失败展示重试，不误判为退出。
- 桌面使用固定侧栏与独立主内容区；窄屏侧栏收起，通过菜单按钮展开，选中页面后关闭。个人信息和退出在窄屏仍可达。
- 视觉沿用 [设计合同](../../references/specs/design.md) 与 [暗色合同](../../references/specs/design.dark.md)，以紧凑标题、列表、分隔线和明确选中态承载操作。侧栏以外不叠加营销导航与页脚，不增加统计总览页。所有文字进入现有 i18n，键盘焦点、菜单关闭和焦点返回可用。

## 功能归属

### 在线导出历史

- 历史列表是唯一历史管理页面，默认最新在前，按现有接口分页，每页 20 条，支持手动刷新。
- 展示任务编号、创建时间、关键词总数、已处理数、结果条数及处理中或已完成状态。时间按后端业务时区 America/New_York 展示并标明时区。
- 点击任务在本页展开关键词明细，展示关键词和记录数。完成不代表每个关键词都成功，不显示接口没有提供的成功或失败结论。
- 已完成任务提供 ZIP 下载；明细提供单项 CSV 下载。接口没有逐项可下载标识，不按记录数猜测是否有文件；点击后由后端判定，无文件或已过期时就地提示。处理中任务不提供整包下载。
- 列表加载、无历史、请求失败可重试均为真实状态；不显示演示记录。展开详情失败只影响该任务，下载失败只影响该操作。
- 本轮只消费历史与下载，不接首页关键词创建入口，不新增任务创建、删除、取消、重跑或实时推送。没有历史时展示空态，不放无效的创建按钮。

### API 管理

- 本轮展示明确的未开放状态，不提供创建、复制、重置 Key 的按钮，不请求管理员 API Key 接口。
- 客户 API Key 及调用鉴权随 014 API 产品另行规划。API 产品营销页面已有获取 Key 类 CTA 统一进入此页面；产品介绍仍留在原营销页。

### 订阅管理

- 同屏展示 Online、Extension、API 三种订阅的套餐、有效状态、到期时间和自动续费状态；这三种不包括 Telegram 或 Bing。
- 无有效付费订阅时展示免费或未订阅状态，订阅按钮跳至 Pricing 对应产品 tab；读取失败或配置不可用时明确显示不可用，不能伪装成未订阅。
- 有效订阅展示套餐及到期日；选购或升级统一跳 Pricing。有效自动续费订阅在这里打开支付渠道管理页，并复用已有 URL 为空时的渠道操作指引与弹窗拦截提示。一次性套餐不出现取消自动续费动作。
- Pricing 删除独立账户摘要、个人菜单、退出与渠道管理操作，只负责套餐比较、购买与升级；套餐卡的 Current Plan 与升级资格提示仍保留，因为它们属于选购决策。
- Pricing 购买触发的登录在原页继续既有待购流程；该按钮只是受保护操作的认证步骤，与导航登录共用同一个弹窗和会话，不再保留独立登录组件实例。
- 产品线映射和支付规则复用 [Pricing 合同](../011.Pricing页/tech-pricing与自动续费.md) 与 [订阅状态合同](../006.订阅系统/tech-订阅商品与状态.md)。实施时将渠道管理的页面归属从 Pricing 文档迁至本文，协议和支付规则不复制。

## 技术边界

- 使用 Astro SSG + Vue 3：Astro 负责公开内容与文件路由，Vue 负责 Dashboard 的响应式状态和交互。已引入官方 `@astrojs/vue` 集成与 `vue`，`vue-tsc --noEmit` 已接入 `pnpm build` 门禁（astro check → vue-tsc → astro build）；未增加 UI 库、数据库表或新的会话机制。
- Dashboard 每个 Astro 路由装配同一个 `DashboardApp.vue`，通过页面标识选择历史、API 或订阅组件；使用 `client:load` 输出公共初始壳并立即激活交互，用户请求只在客户端挂载后执行。Vue 内按侧栏、个人菜单和三个业务视图拆组件，局部状态用 `ref/computed`，组件间用 props/emits，不增加 Pinia、provide/inject 或全局依赖注入。
- 页面跳转仍使用真实链接与 Astro 文件路由，不新增 Vue Router；切页会重新加载页面，浏览器前进后退与直接访问自然沿用现有部署。后续若明确需要跨页保留编辑状态，再单独评估工作区客户端路由。
- 静态营销区块继续用 Astro 组件；本轮因全站账号入口和工作区外壳产生的导航职责按需抽为站级组件。后续新增复杂交互优先用 Vue，不因组件化重写无关工具、Pricing 支付或插件登录桥。
- 现有界面也允许按需要迁为 Vue 组件，不受原技术栈限制。迁移以本轮实际改动为依据：当保留命令式 DOM 会造成重复状态、重复渲染或 Vue 与旧控制器争用同一 DOM 时，将该界面的渲染与交互一并迁移，复用底层业务 API，并删除被替代的控制器及样式。静态内容的组件化仍由 Astro 承担；当前已核对的调用链尚不要求整体重写登录、Pricing 或工具页面。
- 继续由 `website/src/layouts/Layout.astro` 唯一持有 HTML 外壳、主题 token 与全局运行时；增加工作区展示模式以装配侧栏和正文，避免复制全局外壳。
- 路由建议：`/dashboard/` 为历史，`/dashboard/api/` 为 API，`/dashboard/subscriptions/` 为订阅；遵循现有默认语言根路径与非默认语言前缀规则。
- 工作区输出 `noindex, nofollow`，从现有 sitemap 生成集合排除；SSG 只产出公共壳，私有数据登录后请求，服务端认证与归属校验仍是权限边界。
- 现有 Pricing 登录弹窗及控制器已迁到 `components/auth/`（`SiteAuthModal.astro` + `site-auth-controller.ts`），由 `Layout.astro` 全站唯一装配；`/extension-login/` 传 `includeSiteAuth=false` 保留插件授权桥独立 owner，不装配站级控制器也不重复消费 Google 回跳。事件为 `site-auth:success` / `site-auth:close`，全局对象为 `window.siteAuthController`。导航登录通过 `open({ redirectTo })` 声明 Dashboard 目的地（sessionStorage 持久化跨 OAuth 回跳，仅白名单本站路由）；Pricing 待购与工作区不带 redirect 留在原页。登录成功结果经 `scripts/site/session.ts` 的 `setSiteSession` 写入共享会话，导航入口、Pricing 与 Vue 工作区消费同一份数据，无第二次 auth/me。
- 导航登录、工作区登录、Pricing 待购分别按触发上下文决定登录后位置；保留既有 Google 回跳换票及待购恢复。只使用本站确定的路由作为目的地，不增加任意外部回跳参数。
- `/extension-login/` 保留其独立插件授权确认流程，不装配第二个站级登录控制器，也不在登录后转 Dashboard；它继续复用底层认证能力。
- 用户资料和三线订阅直接复用 `GET /api/client/auth/me`；导航和当前页面共用一次会话恢复结果（`scripts/site/session.ts`：无 token 匿名不发请求，401 清 token 回匿名，网络失败返回 unreachable 且不缓存——重试真正重新请求）。业务请求 401 由 `scripts/dashboard/api.ts` 边界统一汇入站级会话失效（清 token + `site-session:expired` 事件），工作区回到登录面板走同一登录流程；普通网络错误就地提示不误判退出。退出调用现有 logout 并清除本地 token，跳当前语言主页；不改变后端仅撤销当前 token 的合同。
- 历史列表、详情、下载复用 [Online 任务与结果合同](../014.Maps云端/tech-Online任务与结果.md) 的客户端接口。JSON 请求使用现有 API 封装；整包 ZIP 是二进制响应，使用同一请求头构建与认证规则发起 fetch，区分失败信封和文件成功响应，下载后释放临时对象 URL。禁止把 token 放入下载链接或用 JSON 封装读取 ZIP。
- 本轮不修改后端业务合同。工作树中的订阅与 Online 后端改动是读取依据，实施前重新核对实际响应，不覆盖其他工作。
- 用户已允许按实际需求引入 Vue 和组件化；实施时同步修订 `spec-website.md` 的纯 Astro/命令式 DOM 限制，明确 Astro 内容与 Vue 交互边界、状态及类型检查规则。`Layout.astro` 继续持有全局样式，Vue 组件消费现有 token，不复制第二套设计系统。

## 集成依据

- [Astro 官方 Vue 集成](https://docs.astro.build/en/guides/integrations-guide/vue/)支持 Vue 3 的服务端渲染及客户端激活；[client:load 指令](https://docs.astro.build/en/reference/directives-reference/#clientload)在页面加载时立即激活组件。
- 规划核对的 `website/pnpm-lock.yaml` 锁定 Astro 5.16.15；npm 官方元数据 `npm view @astrojs/vue@5 peerDependencies --json` 确认集成 5.x 接受 Astro 5 和 Vue 3。实施选择该兼容大版本并由 lockfile 固定，不为此升级 Astro 大版本。
- [Vue 官方 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)明确 Vite 构建只转译、不做类型检查。实施时将 `vue-tsc --noEmit` 接入构建门禁，与现有 `astro check && astro build` 一起运行；工具版本按仓库 TypeScript 的实际兼容性锁定。

## 证据与限制

- 落地文件：`src/components/dashboard/`（Vue 工作区组件）、`src/scripts/dashboard/api.ts`、`src/scripts/site/{session,account-entry}.ts`、`src/components/auth/{SiteAuthModal.astro,site-auth-controller.ts}`、`src/pages/dashboard/` 与 `src/pages/[lang]/dashboard/` 路由；Pricing 侧删去 `PricingAuthModal.astro`、`pricing-auth-controller.ts`、`PricingCancellationGuideModal.astro`（渠道指引改 Vue 版）。
- `backend/src/app/api/client/maps_online_client.py` 提供按当前用户查询历史、详情、签名 CSV 与 ZIP 下载；`schemas/maps_online_schema.py` 只公开任务两态和关键词记录数。整包 ZIP 为二进制响应，前端用同一请求头边界 fetch 并区分失败信封。
- 现有 API Key 路径属于 `backend/src/app/api/admin/admin_system_settings.py`，对应管理员外部接入，不是客户 Maps API 能力。
- `website/src/components/pages/HomePage.astro` 的采集提交按钮仍为占位。历史界面交付不代表 Online 创建链路已产品化。
- 真实 Google 登录、真实对象存储下载与支付渠道可用性未在本轮验证：前端验证走 Playwright route mock（证明已核实接口合同的 UI 交互），真实账号/任务下载冒烟依赖本地后端 + 对象存储凭据，见实施清单验收记录。

执行与验证见 [实施清单](plans/003.用户Dashboard.md)。
