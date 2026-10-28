# 网站用户 Dashboard

> 本文负责网站账户工作区的入口、布局和前端消费边界；业务规则归属用户、订阅与 Maps 云端领域。渠道管理入口的页面归属自 `@../011.Pricing页/tech-pricing与自动续费.md` 迁入本文。

## 用户行为

- 全站导航右侧：匿名时显示登录，登录后显示 Dashboard。通过导航登录成功后进入 Dashboard；取消登录留在原页。
- Dashboard 默认打开 Online Scraper，左侧四个菜单：Online Scraper、History、API 管理、订阅管理。每个菜单有独立 URL，支持刷新、直接访问和浏览器前进后退；站内切换不重新加载页面，侧栏与顶栏保持不动，各视图保留离开前的状态与滚动位置。
- 侧栏底部用户卡展示头像、姓名与邮箱，以及 Online 当前套餐与本月记录用量；订阅读取失败显示不可用，不显示为免费。无头像使用姓名或邮箱首字母。品牌链接也可回到主页。
- 点击用户卡展开账户菜单（在用户卡上方弹出，图标栏时在侧栏右侧）：
  - 三条产品线的订阅各一行：有效订阅显示套餐与到期日并进入订阅视图；免费显示升级入口并进入 Pricing 对应产品；读取失败显示不可用，该行不能操作。另有管理订阅入口。
  - 主题（浅色、深色、跟随系统）点选立即生效，菜单保持打开；与页头共用同一主题偏好。
  - 语言在同一菜单内展开 14 种语言列表，选中后跳到该语言下的同一视图，保留地址里的筛选。
  - 退出后清除本站登录态并回到当前语言主页。
- 未登录直接访问工作区时展示登录入口，不加载私人数据；登录成功回到所访问的工作区页面，取消后回主页。认证失效沿用同一流程；普通网络失败展示重试，不误判为退出。
- 宽屏（≥ 960px）使用固定侧栏与独立主内容区，侧栏可收起为图标栏并记住选择；窄屏侧栏收为抽屉，通过菜单按钮展开，选中页面后关闭。个人信息和退出在窄屏仍可达。
- 视觉按 [website 设计合同](../../references/specs/design-website.md) 的基础层，以紧凑标题、列表、分隔线和明确选中态承载操作；外壳、视图状态与交互细则见 [Dashboard 设计稿](../../design/website/dashboard/README.md)。侧栏以外不叠加营销导航与页脚，不增加统计总览页。所有文字进入现有 i18n，键盘焦点、菜单关闭和焦点返回可用。

## 功能归属

### Online Scraper

- 视图上方为任务创建区，下方为最近任务（最新 5 条，任务名链到 History 中的该任务；每次定位都展开该任务，与 History 当前筛选无关）。创建区有 Keywords、Map、Regions 三种模式；关键词与地区生成的查询各对应一个 item，地图将单个关键词与各网格视口组合提交。创建权益和首页预览规则归 [首页预览与任务创建](../014.Maps云端/tech-首页预览与任务创建.md)。
- Keywords 模式在标签旁提供跳到 Regions 的入口。Regions 模式：国家单选，州或地区多选（可不选），城市多选（限于所选州，未选州时为全国，过滤后可全选 / 全不选）；生成时取最细的一层——有城市按城市，否则有州按州，否则按国家；Generate queries 位于措辞下方。
- Map 模式左侧依次为单行单关键词输入、区域定位和 Radius / Grid spacing 滑杆，右侧为地图；窄屏按表单、地图顺序排列。区域选择器按国家 → 州/省 → 城市逐级选择，可返回上一级修改；输入搜索词时不限当前层级，跨三级匹配（忽略大小写与变音符号，全等 > 前缀 > 词首 > 包含，同级时上层在前，最多 50 条），结果附上级路径以区分同名的省和市，选中后按完整路径落位，有下级时继续进入下一层；选中有坐标的区域后更新地图中心。地图点选与可展开的经纬度输入同样能设置中心。各模式独立保留关键词输入；定位数据在首次展开区域选择器时加载，来源见 [地区数据说明](../../../website/src/data/gmap-regions/SOURCE.md)。
- queued、collecting、publishing 每 5 秒轮询，completed、partial、failed 停止；最近任务的轮询在其他视图继续，页面在后台时暂停、回到前台立即刷新一次。任务进入终态时提示一次（最近任务与 History 共用同一份观察记录）并刷新用量。不自动重投，失败由用户重新提交。

### History

- 唯一的完整历史页面，默认最新在前，按现有接口分页，默认每页 20 条（可选 20 / 50 / 100，改条数回到第一页），支持手动刷新。可按任务号前缀或关键词搜索、按状态与时间范围筛选：时间范围有最近 7 天、最近 30 天（都含今天）、全部和自定义区间，自定义区间是两端都含的浏览器本地日历日，点应用才生效。视图较窄时状态与时间范围收进一个筛选菜单，菜单内可一键清除筛选。筛选、页码与每页条数只把非默认值写进地址，刷新后保持且不占后退记录；工具栏排布与浮层细则见 [Dashboard 设计稿](../../design/website/dashboard/README.md) §3.3。输入完整任务号且命中时自动展开该任务；改筛选或翻页时收起全部展开，手动刷新与轮询不会重新展开用户收起的任务。
- 展示真实 Job 编号、创建时间、采样总数、已收口采样数、整 Job 去重交付行数及六种状态。时间戳直接按毫秒读取，按浏览器时区展示、不标时区；未开始或未结束的时间留空。
- 点击任务在本页展开明细，展示真实 Run 编号、开始及结束时间、联系方式开关快照，以及每个 item 的关键词、可选视口、去重交付行数、收口和错误事实。item 已收口不等于采集成功；有错误时显示本地化原因。
- 仅按后端 `has_file` 展示整 Job CSV 下载按钮；合法零结果完成且没有文件，局部结果保留已交付行。无逐 item 下载或任务 ZIP；文件不可用时就地提示。
- 列表加载、无历史、请求失败可重试均为真实状态；不显示演示记录。首屏、翻页与改筛选失败时列表区换成失败面板，手动刷新与轮询失败保留上次结果并提示。展开详情失败只影响该任务，下载失败只影响该操作。
- History 是当前视图且当前页有运行中任务时每 5 秒静默刷新当前页；离开后不轮询，回到时若期间提交过任务、有任务结束或当前页有运行中任务则静默刷新一次。已展开的运行中任务随轮询静默刷新明细，进入终态时再刷新一次以展示最终计数。

### API 管理

- 登录后展示本人 API Key 摘要，支持首次生成及确认后轮换。完整 Key 只在生成响应后保留于当前视图内存，离开（含生成中离开）或刷新页面后不能再次读取或复制；轮换立即使旧 Key 失效。
- 展示 API 与 MCP 共用的月请求用量、周期和额度耗尽状态，以及现有账号摘要中的 API 套餐、到期和自动续费状态；计量与订阅合同分别归 [额度基建](../000.架构/tech-额度基建.md) 和 [订阅状态](../006.订阅系统/tech-订阅商品与状态.md)。读取失败明确提示重试，不显示为零用量或免费套餐。
- API 基础地址和 MCP 地址只使用服务端连接信息；MCP 地址为空时显示不可用。产品介绍保留在营销页，套餐选购及已有订阅管理仍进入订阅工作区。
- 接入面板按 API、MCP（OAuth 登录授权）、MCP + API Key 三个 tab 切换，默认 API，每个 tab 只展示该方式的地址、示例和对应文档入口（API 产品页字段参考、MCP 产品页客户端接入、MCP 产品页 API Key 接入）。API tab 是 Search 接口的 curl 快速上手（沿用营销 API 页样例）；两个 MCP tab 是通用 `mcpServers` 客户端配置，MCP + API Key 额外带 `Authorization: Bearer` 请求头。示例里有 Key 时以 Key 前缀加省略号占位，没有 Key 时显示 YOUR_API_KEY，并提示换成完整 Key；示例只做展示，不发请求，不提供复制按钮，也从不展示完整 Key。
- 已连接应用只在 MCP（OAuth）tab 内展示，按回调主机、应用自报名称、连接时间和最近刷新时间展示，每页 20 条；无应用和读取失败分别显示。撤销前确认影响，按授权 ID 撤销本人授权并刷新列表。名称与时间不保证唯一，不将自报名称标记为已验证。
- 接口、凭证和权限边界统一归 [API、MCP 与 OAuth 合同](../014.Maps云端/tech-API与MCP.md)，不使用管理员 API Key。

### MCP OAuth 授权确认

- `/oauth/consent/` 及语言路由承载 MCP 客户端发起的授权确认。使用现有站级会话和登录弹窗；公共页脚沿用原设备可信资源入口，不改变登录、注册、JWT、刷新或设备来源规则。
- 入口只读 fragment 票据或授权端错误；立即清除 fragment，同标签页存储用于刷新及登录往返恢复。票据格式、期限和清理行为沿用 OAuth 参考合同，逻辑由 `scripts/mcp-oauth/client.ts` 持有。
- 确认页以回调主机为主要标识，名称注明应用自报；回环地址显示本机应用提示。展示当前账号和 Search / Reviews 权限及 API 月额度影响，用户明确允许或拒绝后只跳转服务端返回地址。
- 决定固定使用读取已展示账号时的凭证；本地凭证变化时重新读取并展示账号，再由用户决定。401 沿用站级失效及登录能力。成功决定或票据失效清除待确认票据，网络失败保留票据供重试。
- 页面使用 `noindex, nofollow` 并排除 sitemap；`analytics=false` 关闭 GA4 与首开上报，保留既有诊断、设备及认证请求。

### 订阅管理

- 同屏展示 Online、Extension、API 三种订阅的套餐、有效状态、到期时间和自动续费状态；这三种不包括 Telegram 或 Bing。
- 无有效付费订阅时展示免费或未订阅状态；读取失败或配置不可用时明确显示不可用，不能伪装成未订阅。选购入口消费站点唯一能力表：Online 可选购，插件由 `extensionPurchase` 控制，API 由 `scraperApi` 控制；不可用时灰化并提示“即将上线”，无链接、checkout 或点击埋点。
- 有效订阅展示套餐及到期日；能力已开放的选购或升级统一跳 Pricing 对应 tab。有效自动续费订阅的渠道管理不受购买能力开关影响，仍复用已有 URL 为空时的渠道操作指引与弹窗拦截提示。一次性套餐不出现取消自动续费动作。
- Pricing 删除独立账户摘要、个人菜单、退出与渠道管理操作，只负责套餐比较、购买与升级；套餐卡的 Current Plan 与升级资格提示仍保留，因为它们属于选购决策。
- Pricing 购买触发的登录在原页继续既有待购流程；该按钮只是受保护操作的认证步骤，与导航登录共用同一个弹窗和会话，不再保留独立登录组件实例。
- 产品线映射和支付规则复用 [Pricing 合同](../011.Pricing页/tech-pricing与自动续费.md) 与 [订阅状态合同](../006.订阅系统/tech-订阅商品与状态.md)。实施时将渠道管理的页面归属从 Pricing 文档迁至本文，协议和支付规则不复制。

## 技术边界

- 使用 Astro SSG + Vue 3：Astro 负责公开内容与文件路由，Vue 负责 Dashboard 的响应式状态和交互。已引入官方 `@astrojs/vue` 集成与 `vue`，`vue-tsc --noEmit` 已接入 `pnpm build` 门禁（astro check → vue-tsc → astro build）；未增加 UI 库、数据库表或新的会话机制。
- Dashboard 由 `components/pages/DashboardPage.astro` 装配同一个 `DashboardApp.vue`，四个视图地址由静态 catch-all 路由各产出一份 HTML 并按地址决定初始视图；使用 `client:load` 输出公共初始壳并立即激活交互，用户请求只在客户端挂载后执行。视图首次进入时挂载，此后切换只显示或隐藏，保留各自状态。Vue 内按侧栏、用户卡和四个业务视图拆组件，局部状态用 `ref/computed`，组件间用 props/emits，不增加 Pinia、provide/inject 或全局依赖注入；额度、最近任务与轮询、下载状态按登录 token 建一份工作区数据，由根组件经 props 下发，换号或会话失效时整体重建。
- 账户菜单、History 时间范围与筛选菜单、每页条数和地区选择都消费共享浮层（`scripts/site/pop.ts` 与 `PopMenu` / `PopListbox` / `PopCombobox`，规范见 [website 规范](../../references/specs/spec-website.md) §4）。订阅行、查询条件和地区候选的过滤排序留在各自使用方；切换视图、换号或退出、收起侧栏时关闭浮层。
- 视图切换由工作区内最小的 History API 路由承担，不引入 Vue Router：切换视图 `pushState`，History 的筛选与页码 `replaceState`；前进后退按地址恢复视图与滚动位置，切换后焦点移到视图标题。侧栏链接是真实地址，修饰键与中键点击交给浏览器。通用规则见 [website 规范](../../references/specs/spec-website.md) §8。
- 静态营销区块继续用 Astro 组件；本轮因全站账号入口和工作区外壳产生的导航职责按需抽为站级组件。后续新增复杂交互优先用 Vue，不因组件化重写无关工具、Pricing 支付或插件登录桥。
- 现有界面也允许按需要迁为 Vue 组件，不受原技术栈限制。迁移以本轮实际改动为依据：当保留命令式 DOM 会造成重复状态、重复渲染或 Vue 与旧控制器争用同一 DOM 时，将该界面的渲染与交互一并迁移，复用底层业务 API，并删除被替代的控制器及样式。静态内容的组件化仍由 Astro 承担；当前已核对的调用链尚不要求整体重写登录、Pricing 或工具页面。
- 继续由 `website/src/layouts/Layout.astro` 唯一持有 HTML 外壳与全局运行时，并统一引入全局样式（token 唯一来源为 `styles/tokens.css`）；增加工作区展示模式以装配侧栏和正文，避免复制全局外壳。
- 路由：`/dashboard/` 为 Online（创建与最近任务），`/dashboard/history/` 为 History，`/dashboard/api/` 为 API，`/dashboard/subscriptions/` 为订阅；遵循现有默认语言根路径与非默认语言前缀规则。
- 工作区输出 `noindex, nofollow`，四个地址均从现有 sitemap 生成集合排除并列入登录后跳转白名单；SSG 只产出公共壳，私有数据登录后请求，服务端认证与归属校验仍是权限边界。
- 现有 Pricing 登录弹窗及控制器已迁到 `components/auth/`（`SiteAuthModal.astro` + `site-auth-controller.ts`），由 `Layout.astro` 全站唯一装配；`/extension-login/` 传 `includeSiteAuth=false` 保留插件授权桥独立 owner，不装配站级控制器也不重复消费 Google 回跳。事件为 `site-auth:success` / `site-auth:close`，全局对象为 `window.siteAuthController`。导航登录通过 `open({ redirectTo })` 声明 Dashboard 目的地（sessionStorage 持久化跨 OAuth 回跳，仅白名单本站路由）；Pricing 待购与工作区不带 redirect 留在原页。登录成功结果经 `scripts/site/session.ts` 的 `setSiteSession` 写入共享会话，导航入口、Pricing 与 Vue 工作区消费同一份数据，无第二次 auth/me。
- 导航登录、工作区登录、Pricing 待购分别按触发上下文决定登录后位置；保留既有 Google 回跳换票及待购恢复。只使用本站确定的路由作为目的地，不增加任意外部回跳参数。
- `/extension-login/` 保留其独立插件授权确认流程，不装配第二个站级登录控制器，也不在登录后转 Dashboard；它继续复用底层认证能力。
- 用户资料和三线订阅直接复用 `GET /api/client/auth/me`；导航和当前页面共用一次会话恢复结果（`scripts/site/session.ts`：无 token 匿名不发请求，401 清 token 回匿名，网络失败返回 unreachable 且不缓存——重试真正重新请求）。业务请求 401 由 `scripts/dashboard/api.ts` 边界统一汇入站级会话失效（清 token + `site-session:expired` 事件），工作区回到登录面板走同一登录流程；普通网络错误就地提示不误判退出。退出调用现有 logout 并清除本地 token，跳当前语言主页；不改变后端仅撤销当前 token 的合同。
- 创建、历史分页、详情和本人整 Job CSV 下载消费 [Online Export 接口](../014.Maps云端/tech-Online任务与结果.md)，稳定业务口径归 [Export 与 Collector](../014.Maps云端/tech-Export与Collector重构.md)。全部 JSON 请求使用现有鉴权与会话封装；下载时先取得新签名，再以浏览器链接下载，不把 Bearer token 放入链接。不保留旧任务 DTO、逐项文件和 ZIP 解析路径。
- 用户已允许按实际需求引入 Vue 和组件化；Astro 内容与 Vue 交互边界、状态、路由及类型检查规则见 `spec-website.md`。全局样式归 `styles/`、由 `Layout.astro` 统一引入；Dashboard 专属样式放在 `components/dashboard/` 下由页面组件引入，页面组件先引入同一组全局样式再引入专属样式，保证构建产物里专属样式排在全局样式之后（Astro 构建按导入路径排序页面 CSS）。Vue 组件消费现有 token，不复制第二套设计系统。

## 集成依据

- [Astro 官方 Vue 集成](https://docs.astro.build/en/guides/integrations-guide/vue/)支持 Vue 3 的服务端渲染及客户端激活；[client:load 指令](https://docs.astro.build/en/reference/directives-reference/#clientload)在页面加载时立即激活组件。
- 规划核对的 `website/pnpm-lock.yaml` 锁定 Astro 5.16.15；npm 官方元数据 `npm view @astrojs/vue@5 peerDependencies --json` 确认集成 5.x 接受 Astro 5 和 Vue 3。实施选择该兼容大版本并由 lockfile 固定，不为此升级 Astro 大版本。
- [Vue 官方 TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)明确 Vite 构建只转译、不做类型检查。实施时将 `vue-tsc --noEmit` 接入构建门禁，与现有 `astro check && astro build` 一起运行；工具版本按仓库 TypeScript 的实际兼容性锁定。

## 证据与限制

- 落地文件：`src/components/dashboard/`（Vue 工作区组件）、`src/scripts/dashboard/`（接口封装、路由、工作区数据与任务口径）、`src/scripts/site/{session,account-entry}.ts`、`src/components/auth/{SiteAuthModal.astro,site-auth-controller.ts}`、`src/components/pages/DashboardPage.astro` 与 `src/pages/dashboard/[...view].astro`、`src/pages/[lang]/dashboard/[...view].astro` 静态路由；Pricing 侧删去 `PricingAuthModal.astro`、`pricing-auth-controller.ts`、`PricingCancellationGuideModal.astro`（渠道指引改 Vue 版）。
- `backend/src/app/api/client/export_client.py` 提供本人 Job 创建、历史、详情与签名 CSV 下载；`maps_online_client.py` 保留创建选项和匿名预览。网站不读取内部工作文件，不为旧任务或下载协议提供兼容层。
- 客户 Key、连接与用量由 `scripts/dashboard/api.ts` 消费 014 接口；OAuth 票据、确认与本人授权接口由 `scripts/mcp-oauth/client.ts` 持有。管理员 Key 仍属于独立的后台外部接入。
- Export 网站接线及当前验收范围见 [实施记录](../014.Maps云端/plans/010.Export服务端实施.md)；构造 CSV 的真实后端与对象存储验证不代表 Collector/Google 采集联调。旧界面实施记录保留为历史，不能替代现行合同验收。工作区认证与支付验证范围仍见下方实施清单。

执行与验证见 [实施清单](plans/003.用户Dashboard.md)。
