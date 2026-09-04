# 000 · 架构 · 变更记录

## 2026-09-01 统一额度基建：usage 服务三线门面 + user_usage_logs

**为什么**：013 U7 的 Maps 月度配额是「Redis 单轨 + config_public 兜底」的线内方案；006 产品线扩展后 maps_extension / maps_online / maps_api 三线共用同一额度语义，且 014 云端需要按任务幂等记录实际产出，Redis 计数与兜底链都不再成立。

**实际产出**：
- 新表 `user_usage_logs`（只插入不可变流水，used = 按月 SUM(delta)，唯一键 `(product_line, user_id, request_id)` 幂等 + 覆盖索引聚合）；`usage_service` 以 `_BaseUsageService` + 三薄门面（extension/online/api）提供 `get_usage/consume/refund`，登录走 MySQL、匿名走 Redis 月度计数（Lua 原子幂等原样迁移，key 换 `usage:{line}:{ym}:{identity}`）。
- total 单一真源切到 `get_user_subscription_config` 的 `monthly_quota`（付费档或本线 free 档），行缺失/额度空抛 `PAYMENT_GATEWAY_ERROR`；删除 `maps_quota` config_public 兜底链与 `DEFAULT_FREE_QUOTA`（表数据行未动）。Online/Api 门面能力就绪、无路由。
- 删除 `constants/maps_usage.py` 与 `services/maps_usage_service.py`；`/maps/usage` 两路由改调 `extension_usage_service`，HTTP 契约零变更。spec-mysql §4 登记第二个原子数据结构例外。

**已验证**：schema sync 建表 + DDL 核对；新增/改造 real 测试 15 passed（consume/refund 幂等、SUM 聚合、跨月 target_ym、三线 free 档 total、quota 缺失抛错、匿名 Redis 回归、登录 MySQL 路由契约）；全量 real 84 passed（2 个 credit_purchase 存量失败与本任务无关）；black/ruff/限定 mypy 通过；business 启动冒烟 + 两路由双身份 HTTP 实测通过。

技术规格见 `@tech-额度基建.md`。

## 2026-08-29 website-shared 并入 website、extension-pro 闭环合同删除、e2e 身份脚本自持

**为什么**：hydra 三项决策——extension-pro 闭环合同删除；website-shared 消亡、代码统一进 website；website/admin e2e 浏览器身份按原契约重建。

**实际产出**：
- **闭环合同删除**：`012.Extension Pro` 域整体移入 `archive/`；007 删 §9.6 独立登录合同；011 删 Extension Pro 升级跳转章节与 Pro 异常/验收条目（主插件订阅模式保留）；009 两处半句清理；011/009 两个 Pro 相关 plans 删除；AGENTS.md 与 spec-docs.md 目录口径同步为 `001`~`011`。主站代码无 Pro 扩展 ID，无死代码。
- **website-shared 统一**：homepage-runtime 13 个文件落位 `website/src/scripts/homepage/`（原 wrapper 为兼容入口，真身直接覆盖落位）；components 三目录与 download 树落位 `website/src/components/`、`website/src/download/`；跨目录 import 与 5 个消费文件路径修正；astro.config/tsconfig 的 `@website-shared` alias、`languageSitemap.mjs` lastmod 路径、`tests/module-scripts.test.js` 编译路径同步；env.d.ts 合并缺失字段；modern 主题死分支（32 处，主站零消费者）连同 coin 图标 HTML/CSS/JS 分叉整体删除；`website-shared/` 目录删除。
- **e2e 身份脚本重建**：`website/scripts/` 与 `admin/scripts/` 各自持有 `playwright-browser-identity.mjs`（原脚本随顶层 `scripts/` 迁出无法恢复，按 config 与门禁 spec 契约重建：headless Chromium UA 去 HeadlessChrome 标记 + webdriver/Client Hints 消除，Mobile Chrome 与 admin chromium 用本机稳定版 Chrome channel）；两端 config 与 spec 的 import 路径改指本端。
- **迁移遗留测试收口**：`module-scripts.test.js` 修剪对已移除功能的断言（workaround 页面、下载工作区 `data-defer` 挂载、llms 索引条目的构建产物强校验），活功能断言保留；`public/llms.txt` 与 `llms-full.txt` 删除 workaround 死链条目。下载工作区源码作为基建保留。

**已验证**：website 构建 102 页通过、preview HTTP 200；admin e2e 62 passed；website e2e 73 passed（5 skipped 为真实账号 smoke）；`module-scripts.test.js` 100/100 通过。

## 2026-08-29 清理 website-tgd-pro 与 scripts 迁移残留

**为什么**：`website-tgd-pro/` 与 `scripts/` 已迁移至其他项目、磁盘不复存在，但契约/架构文档与共享代码仍残留对二者的描述与指涉。

**实际产出**：
- AGENTS.md 仓库地图移除 `website-tgd-pro/`、`scripts/` 两行；删除「网站关联边界」段（其约束对象已全部迁出本仓库）。
- overview.md 各端职责表与监听端口表（9630）同步收敛为 4 应用 + 1 辅助目录、4 端口；数据流图去掉 tgd-pro 分支；移除 extension-pro 端口说明。
- website-shared 清理 6 处已迁走站点的文案指涉：4 条主题分叉注释去掉站点名、`homepage-runtime/api.ts` 的 `PUBLIC_API_BASE_URL` 缺失错误消息改指 `website/deploy/deploy.sh`。

**已验证**：website 构建 102 页通过、preview 启动首页 HTTP 200；grep 确认契约/架构文档与各端代码无 tgd-pro 残留。007 §9.6、009、011、012 中 extension-pro ↔ website-tgd-pro 闭环合同（产品合同主体，非残留引用）与 website/admin e2e 对顶层 `scripts/playwright-browser-identity.mjs` 的活依赖保持原状，待决策。

## 2026-08-26 Redis token key 生命周期收口

**为什么**：token ZSet 的 score 只能判断 member 是否过期，不能让不再访问的账号 key 自动回收；无 TTL key 会随历史账号持续累积。

**实际产出**：
- Redis 通用合同明确临时业务状态必须设置 key TTL，并区分 transaction pipeline 的固定命令事务与 Lua read-modify-write。
- 当前 token 写入允许同秒签发产生相等 `exp`；新 token 的绝对过期时间只要求不早于同 key 已有 score。
- 新增一次性历史 token key 清理 CLI：默认 dry-run，只扫描运行配置命名空间；显式执行时仅为无 TTL key 按最大 score 设置 `EXPIREAT NX`。
- 清理工具未接入应用启动、定时任务或部署脚本；生产历史清理仍需按 dry-run、人工确认、execute 的顺序单独执行。

**已验证**：10 项真实 Redis 生命周期测试、health smoke、real collect 门禁、Black、Ruff、`compileall`、diff check 与隔离前缀 business HTTP 登录/refresh smoke 通过；限定 mypy 被既有 `core/config_schema.py` 27 个错误阻断。启动时 Google Metrics cron 的外部 OAuth 请求出现 `ConnectError`，不影响 health 与认证链路。

## 2026-08-18 移除 Extension 的官网登录桥接 host permission

**为什么**：官网登录桥接已由静态 `content_scripts.matches` 取得精确页面注入权限，同一域名再次进入 `host_permissions` 属于重复授权。

**实际产出**：
- dev Manifest 不再包含 `http://localhost:4321/*` host permission，生产 Manifest 同步移除官网裸域与 www 域的重复 host permission。
- dev/prod 官网桥接 matches、脚本注入和 CSP `connect-src` 保持不变。
- 构建配置测试锁定桥接 matches 保留且 host permissions 不含官网域名。

## 2026-08-18 移除 Extension 的 API 域 host permission

**为什么**：后端 API 已返回通配 CORS（`Access-Control-Allow-Origin: *`，放行 `Authorization / X-Device-Id / X-Client-Product` 全部自定义头与 PNA），扩展 fetch 走标准跨域即可，无需 host_permissions 豁免；本地 dev 后端同样放行。

**实际产出**：
- dev/prod Manifest 均不再把 `tg-download-api.telegramdownloadmedia.com` 加入 `host_permissions`。
- API 域继续保留在 CSP `connect-src`，请求链路与鉴权（Bearer header，无 cookie 依赖）不变。
- 构建配置测试锁定 dev/prod 均无 API host permission 的边界。

## 2026-08-18 移除 Extension 的 Ali SLS host permission

**为什么**：SLS WebTracking 匿名 GET 已通过通配 CORS 允许普通跨域请求，扩展 background 直连不需要额外取得该域名的特权访问能力。

**实际产出**：
- 生产 Manifest 不再把 `tg-download.ap-southeast-1.log.aliyuncs.com` 加入 `host_permissions`。
- SLS endpoint 继续保留在 CSP `connect-src`，background 上报链路、字段、失败策略和环境变量均不改变。
- 构建配置测试同时锁定“无 Ali host permission”和“保留 Ali connect-src”两个边界。

## 2026-08-12 Popup 反馈群使用订阅状态配置

**为什么**：Popup 已在打开时请求订阅状态，反馈群入口复用该响应可避免增加独立请求，同时允许服务端更换或关闭群链接。

**实际产出**：
- `/api/client/subscription/status` 从 `config_public.extension_telegram_feedback_url` 返回 Telegram 反馈群邀请入口，并从 `config_public.extension_telegram_feedback_group_username` 返回公开群用户名；任一配置缺失或非字符串时对应字段返回空字符串。
- Extension 在订阅状态请求成功且链接非空后才展示“加入反馈群”；入口不显示图标，点击后直接通过 Chrome Tabs API 把已打开的 Telegram Web A/K 标签导航到携带官方 `tgaddr` 启动参数的 Web 地址；没有现成标签时创建 A 版标签。邀请链接编码为 `tg://join`，公开群编码为 `tg://resolve`，它们只存在于 `web.telegram.org` 的 fragment 中，不会交给桌面客户端。每次点击的唯一 query 保证 A 版完整重载并消费深链；导航提交后才聚焦窗口，避免 Popup 提前销毁。失败时入口恢复可点击并显示错误 Toast。
- 删除上一版为反馈群新增的 content/injected RPC、MAIN world 导航代码和对 K 版非公开 `appImManager` 全局对象的依赖。该方案在真实页面前验证不充分，且 Popup 先聚焦窗口的执行顺序可以中断后续 RPC，是“点击无反应”的主要风险。
- Popup Footer 使用两行稳定布局：首行展示联系邮箱和复制按钮，次行把 `@公开群用户名` 作为普通 `t.me` 网页链接，同时保留加入按钮的 Telegram Web 邀请导航，为用户提供两条独立入口；任一配置为空时只隐藏对应入口。

## 2026-08-09 增加插件商店评价点击双写打点

**为什么**：Pricing 好评赠送需要在后端 `mark_logs` 中留下用户实际前往商店评价页的点击记录。

**实际产出**：
- 后端注册 `web_extension_store_review_click` 打点类型。
- website 在“去好评”点击时通过现有 `recordHomepageMark()` 同时写 SLS 与后端,空 `mark_msg`。
- 打点失败不阻断商店新标签页、倒计时和后续领取流程。

## 2026-08-07 注册好评赠送永久 Counter

**为什么**：好评赠送需要记录账号一生最多领取一次的事实，复用 MySQL Counter 地基即可表达，不应新增活动状态表或重置入口。

**实际产出**：
- 注册 `SUBSCRIPTION_REVIEW_REWARD_CLAIMED=6001`，固定路由到 `LIFETIME`；沿用 `counter_user_lifetime` 的 `(user_id, counter_id)` 唯一约束和原子 upsert，不变更 Model、索引或 schema。
- 订阅活动在账号级 Redis 短锁内先读后增 Counter；Counter 独立提交后再提交订阅加时，明确接受前者成功而后者失败且不补偿。

**已验证**：Counter real 测试 `9 passed`；好评赠送 API 的首次、重复、并发和预占锁场景均核对真实 MySQL 副作用；后端限定范围 Black、Ruff、mypy、`compileall`、real collect-only 与 business 角色启动通过。全量 mypy 仍被既有 `core/config_schema.py` 27 个错误阻断，不记为通过。

业务语义与完整验证见 `@../006.订阅系统/changelog.md`。

## 2026-08-07 清理 Extension 旧 Counter 入口

**为什么**：Extension 的 `counterApi` 只有定义和导出，没有业务调用；下载消耗与额度展示分别使用既有 quota/subscription 链路，继续保留旧入口会形成两套并行计数表面。

**实际产出**：
- 删除 `extension/src/core/api/counter/`、三个 `/api/client/counter/**` 端点常量、公共导出和示例注释。
- 下载前额度消耗继续调用 `/api/client/quota/check`，额度展示继续调用 `/api/client/subscription/status`，未改变两条业务链路。
- `tech-extension.md` 同步为单一 Quota 消耗接口现状，`tech-数据库.md` 同步已落地的三个 Counter Model 文件；本执行单元不修改 Backend，也不记录 Backend schema、测试或启动验证结论。

**已验证**：Extension 源码静态检索确认旧 Counter wrapper、类型、端点和业务调用无残留，quota/subscription 调用仍存在；`pnpm tsc --noEmit` 与 `pnpm build` 通过。

## 2026-08-07 落地 MySQL 用户 Counter 基础设施

**为什么**：现有通用 Counter 使用带 TTL 的 Redis，不能提供永久事实；正式 extension 每日额度另由 quota 服务承担。后端需要一套不绑定具体业务的 MySQL Counter 地基。

**实际产出**：
- 新增 DAILY、MONTHLY、LIFETIME 三张 Counter Model，建立固定生产注册表与 `DEMO_DAILY=9001`、`DEMO_MONTHLY=9002`、`DEMO_LIFETIME=9003`，并由统一 MySQL Service 提供正增量原子 upsert、单项读取和跨周期批量读取。
- `add/get/get_list` 自行获取 session，不使用构造器依赖注入；非法增量、未知 ID 和数据库错误直接抛出，不增加减计数、reset、锁、幂等、补偿或跨业务事务。
- 删除无业务调用的旧 Redis Counter HTTP API；Extension 旧 wrapper 的清理及业务链路保持情况见同日“清理 Extension 旧 Counter 入口”记录。
- 补充业务时区的自然日/自然月桶工具，三个 Model 已注册到 `app.models`；`tech-counter.md` 已按实际源码行号完成索引三件套审查。

**已验证**：
- schema sync 预览与执行成功，三张表已创建；`information_schema` 核对字段、comment、PK 与 UK 符合规格且无额外索引。
- Backend real health smoke 通过；全量 real 与 `-m real` 两次 collect-only 均成功；Counter real 测试 `9 passed`。
- Backend 变更文件通过 Black、Ruff、`compileall`、限定范围 mypy 与 diff check；business 角色在 `19600` 端口启动成功，三张 Counter Model、路由装配和 lifespan 无异常。
- Extension `pnpm tsc --noEmit` 与 `pnpm build` 通过。
- 全量 `uv run mypy src/app` **未通过**：被既有 `src/app/core/config_schema.py` 的 27 个错误阻断；本次只确认计划所列 Counter 相关文件的限定范围 mypy 通过，不将全量 mypy 记为通过。

技术规格见 `@tech-counter.md`，执行清单见 `@plans/002.mysql用户Counter基础设施.md`。

## 2026-07-16 统一记录插件升级弹窗曝光

**为什么**：升级弹窗同时可运行在 Popup 与页面 Content,打点应绑定真实显示状态,不应由各入口分别推断。

**产出**：
- 共享升级弹窗在每次从隐藏进入显示时广播 `upgradeModalOpened`。
- background 统一向 SLS 写入 `upgrade_modal_open`;不区分打开入口,已显示时不重复,关闭后重开再次记录。
- 广播失败静默忽略,SLS 请求失败只记错误,均不影响弹窗展示和升级操作。

## 2026-07-16 增加插件升级入口 Pricing 双写打点

**为什么**：插件端只写 SLS,但升级入口的 Pricing 页面曝光需要进入后端 `mark_logs` 供 Dashboard 统计。

**产出**：
- 后端新增 `web_pricing_open_from_extension` 类型并纳入 Dashboard 顺序。
- website Pricing 精确识别 `utm_source=extension&source=quota_upgrade_button`,通过现有 `recordHomepageMark()` 同时写 SLS 与后端。
- 曝光按页面加载记录,刷新允许重复;插件不恢复后端 mark 接口调用。

## 2026-07-15 增加 Chrome 原生直连下载 RPC

**为什么**：共享下载只有 content→injected 的长 request-response，无法让大文件传输脱离 Vimeo 页面生命周期；MV3 background 自己持有大文件 fetch 同样会受 Service Worker 生命周期约束。

**产出**：
- Manifest 增加 `downloads` permission；共享 `downloadOne` 按来源分流，Vimeo Progressive/Thumbnail 使用短 background RPC 创建 Chrome 下载，DASH/HLS 和其他站点继续使用原 EventRpc。
- background 新增创建任务与查询快照两个声明式能力，校验 Vimeo caller、descriptor、CDN finalUrl、MIME 和扩展任务归属；不长期等待文件完成。
- content 只在页面存活时轮询按钮进度和维持顺序批量；页面销毁不取消 Chrome 任务，Popup 仍不订阅下载状态，也没有新增任务账本或恢复状态机。

## 2026-07-13 保证错误响应携带 CORS 头

**为什么**：业务 Nginx 会隐藏 FastAPI 返回的 CORS 头并统一重写，但 `add_header` 未带 `always`，导致 401 等错误响应没有 `Access-Control-Allow-Origin`。Website 实际收到的是无法读取状态码的 CORS 网络错误，过期 token 因而不会被清理。

**产出**：
- 业务 Nginx 的 Origin、Methods、Headers 和预检缓存头统一使用 `always`，覆盖成功与错误响应。
- 初始化和日常发布新增严格鉴权 CORS 检查：经本机 Nginx 请求无效 `/api/client/auth/me`，必须返回 401 且保留 `Access-Control-Allow-Origin`。
- 部署模板测试锁定 Nginx 指令与发布检查，避免只验证 OPTIONS、遗漏实际错误响应。

## 2026-07-12 扩展瞬时按钮进度到 Instagram 页面

**为什么**：Instagram 已复用共享下载进度事件，但架构文档仍写成 Telegram/X 两站合同，会误导后续把 Instagram 的页面反馈删掉或另建一套业务状态协议。

**产出**：
- 共享单向、不可信 DOM progress event 的适用站点从 Telegram/X 扩展为 Telegram/X/Instagram；payload、Popup、权限和业务终态边界不变。
- Instagram content 只接受本次资源 ID，并只更新每个实体最近一次短命页面按钮会话；旧事件和旧结束不能覆盖新显示。
- Instagram 重复点击不禁用、不互斥；每次点击仍独立解析、扣额和下载，更早调用继续执行。
- Scheduler、Queue、DownloadStateManager、Popup 状态订阅和第二套下载协议继续不存在。

## 2026-07-12 扩展瞬时按钮进度到 X 页面

**为什么**：X 下载需要页面内可见进度，但不应恢复已删除的业务下载状态机，也不能用宿主页面可伪造的 DOM 事件承担下载终态。

**产出**：
- 固定单向 DOM 进度 payload 从只描述 Telegram 数字百分比 → `sourceId + number|null`；`null` 只表达不可计算。
- Telegram 继续只更新当前主消息按钮；X 只更新当前 tweet 活动会话，按 tweet 互斥、跨 tweet 并发，Popup 不订阅。
- 下载成功继续由完整 `downloadMedia` request-response 和浏览器 download 副作用验证；DOM 事件不参与额度、权限、完成判定或 RPC 生成。
- Scheduler、Queue、DownloadStateManager、动态事件与跨页面任务状态保持不存在。

**已验证**：公共出口保持 Telegram 小数进度，X 在自己的读取/展示层 floor；Telegram + X 定向回归 42/42、全量 Unit/Integration 432/432、完整 UI E2E 27/27、覆盖率 80% 门禁、`pnpm check`、RPC 生成检查、production build 与 `dev:extension` 启动通过。详细记录见下载域 Plan 019。

## 2026-07-12 区分业务下载状态与瞬时按钮进度

**为什么**：删除下载状态机时错误地把 Telegram 用户可见进度也归入业务状态，造成主消息按钮下载期间无反馈。

**产出**：
- 保持单一完整 `downloadMedia` EventRpc、`downloadOne` 和顺序 `downloadMany`，不恢复 Scheduler、Queue、DownloadStateManager 或 Popup 状态订阅。
- Telegram MAIN 使用一个固定、非可信的瞬时 DOM 事件报告 `sourceId + percent`；content 只更新本次主消息按钮，页面伪造事件不能扣额度或触发下载。
- Segment/Blob 报告分块百分比，A `mediaHash` 无字节回调时只报告 0%/100%；按钮不禁用，重复点击仍是独立操作。
- 完整下载 RPC 使用 24 小时页面生命周期级超时；30 秒 timeout 无法取消 MAIN handler，会破坏顺序批量并提前清除进度，卡住时直接刷新页面。

## 2026-07-11 同步插件最终上下文与 RPC 边界

**为什么**：固定 EventRpc 与站点 provider 已完成迁移，架构文档仍列出已删除的 early handshake、page caller 和旧目录，且没有区分 DOM 中性错误与 Chrome 可定位错误。

**产出**：
- `tech-extension.md`：目录树改为实际的 `injectedReady.ts`、`types.ts` 和模块级 download client；补 Instagram 当前路由 Map 生产路径与 Telegram/X/Instagram enabled、Threads/Vimeo `disabled-unverified` 状态。
- `tech-插件RPC.md`：EventRpc 只描述 content→injected 固定不可信通道；普通 handler 异常向 DOM 返回固定中性 `SERVER_ERROR`，Chrome transport 仍保留原有可定位错误。
- MAIN world 只保留页面已有的媒体查询、白名单 fetch/mux 和文件触发能力；Chrome API、storage、token、额度与本项目后端权限留在 content/background。
- 删除 handshake/early、injected batch/progress/cancel、非本站 stub 和动态下载事件；保留 Telegram A sidebar 的站点内部缓存更新信号，它不属于下载状态协议。
- 删除未被生产代码挂载的 Popup `LoginModal.vue` 及其 scoped 样式；当前登录入口固定为 `AppHeader -> background RPC -> 官网统一登录页 -> websiteAuthBridge`。

## 2026-07-10 收敛插件共享下载与 EventRpc 契约

**为什么**：Instagram 接入草案把普通下载扩成了多阶段任务、跨生命周期恢复和动态通道体系，增加了共享层复杂度，也扩大了误改 Telegram 的风险；本项目允许单项失败后由用户重试，不需要这套可靠性基础设施。

**产出**：
- `tech-extension.md`：共享下载收敛为上层顺序循环、逐项 `checkAndConsume(1)` 和一次完整 `downloadMedia` request-response；单项失败记录后继续，重复点击允许重复扣额和重复下载。
- `tech-插件RPC.md`：删除 `startDownload`、异步 outcome、取消、任务账本、恢复与动态握手目标；EventRpc 改为固定 DOM 通道，明确接受页面可观察和伪造风险，只保留 allowlist、schema、payload 大小及站点媒体校验。
- Popup 只在打开或刷新时查询当前 tab；各站点只实现需要的 handler，Telegram 的解析、扫描、sidebar 和批量前确认保持站点内原有行为。

## 2026-07-09 插件 mark-log 改写 SLS

**为什么**：extension 旧的 `/api/client/mark/record` 打点链路已被注释停用，需要恢复插件端打点但改为和 website 一样写阿里云 SLS WebTracking，不再进入后端 `mark_logs`。

**产出**：
- `tech-extension.md`：新增 §A7，说明插件端 SLS mark-log 文件、入口、环境变量和 manifest 权限。
- `tech-可观测与SLS.md`：补充 extension 实现文件、字段口径、环境变量和覆盖入口。
- `tech-website.md` / `tech-backend.md` / `references/index.md`：修正“SLS 只在 website 前端”的旧口径。

## 2026-06-29 同步订阅系统重新激活口径

**为什么**：006 订阅系统已因 Pricing 与 Unlimited Download 自动续费重新激活,旧“停售存量期”描述会误导后续删错状态接口和插件额度能力。

**产出**：
- `overview.md`：订阅系统观察项改为插件专属权益域,购买入口归 011 Pricing,额度扣减归 005 计数器。
- `tech-extension.md`：标注旧 options 订阅购买页已删除,插件升级入口跳 website Pricing。

## 2026-06-23 建立基础设施域

**为什么**：整个活文档库只有业务域（001-007），缺少一份跨域共享的「项目技术地基」文档。后端分层、crons 框架、配置体系、多语言、数据库结构同步、跨端通信、SLS 双写等横切事实散落在代码与各 feat 文档里，业务域 tech-*.md 想引用时无统一锚点。新建 `000.架构` 作为地基，被 001-007 `@` 引用，与 docs/ 根的规则文档（「应该怎么做」）区分——本域只提炼「现在怎么搭」。

**产出**：
- `overview.md` — 各端职责、技术栈、数据流主干、001-007 域依赖地图（基于 feat.md 实际 `@` 引用核对）、共享约定入口。
- `tech-数据库.md` — MySQL/aiomysql、业务时区 America/New_York（project-rule 已对齐为 NY）、按天 0 点、模型组织、`sync_database_schema.py` 结构同步机制、索引规则概要。
- `tech-backend.md` — FastAPI 目录与三段分层、异常中间件（AppCommonException i18n 翻译）、配置体系（business/download 双角色 + reload 候选校验）、crons 框架（注册表 + MySQL 游标 + 调度器）、Redis 能力、依赖注入禁令、GET/POST only。
- `tech-website.md` — Astro 目录、14 语言双重页面路由、自定义 Sitemap 集成、Cloudflare retired-redirects、SEO 基建、**SLS 日志双写在前端**（feat.033，后端不写 SLS）、website-shared 共享源码包。
- `tech-extension.md` — **插件是 Chrome MV3 非 Electron**（纠正任务描述）；三上下文 + core 共享层、自研 RPC v2（代码生成 + 调用矩阵校验）、Pinia store、counter/quota 双接口与 device_id、与后端契约；附 admin 后台（独立 Vue + Naive UI SPA）。

**关键事实校正（相对任务描述与 CLAUDE.md）**：
1. **`backend_go/` 不存在**——仓库根无此目录（`ls` 失败）。CLAUDE.md/AGENTS.md 的提及是过期信息，go 后端从未落地或已清理。各文档标注「不存在、不维护」。
2. **插件不是 Electron**——是 Chrome Manifest V3（`vite-plugin-web-extension`），无 electron 依赖。
3. **SLS 日志双写在 website 前端**，不在 backend Python（后端用标准 logging）。任务描述把它归到 backend 是不准确的。
4. **业务时区是 `America/New_York`**（`utils/time.py` 硬编码），有意为之；project-rule 已对齐为 NY。
5. 存在额外目录：`admin/`（独立后台）、`website-shared/`（Website 共享源码包）、`cf-worker-tg-poc/`（未接入主链路的 POC）——均在 overview 与对应 tech 文档中列出。

**自检结果**：
1. backend_go 状态如实写：不存在、不维护（overview §1 + 本文件）。
2. 各 tech-*.md 带真实目录树与关键文件绝对路径，非空泛套话。
3. overview 域依赖地图基于 001-007 feat.md 实际 `@` 引用核对（入度最高：001 节点 6、003 积分 5、002 下载 5；006 订阅当时仅被 004 引用一次,该「停售存量期」判断已在 2026-06-29 被新 Pricing 口径替换）。
4. 未把 001-007 业务实现搬进 000——000 只描述地基，业务细节用 `@../00X.xxx/...` 指向各域。

## 2026-06-23 并入 009/010/033/043 基础设施

**为什么**：4 个扁平 feat 都是跨业务域共享的基础设施（插件目录结构、插件 RPC、前端可观测 SLS、后端 Crons 框架），属 000 地基性质，但细节散落在各自 feat 文档里。把它们并入 000，统一被各域 `@` 引用，避免业务域 tech 重复描述这些横切机制。只新增，不改 000 已有 5 文件（overview / tech-数据库 / tech-backend / tech-website / tech-extension）的已有段落。

**产出（只新增）**：
- `references/index.md` — 索引 4 个源 feat（绝对路径 + 一句话 + 指向 000 哪个 tech + 与代码是否一致），并单列 feat.043 过时点。
- `tech-插件RPC.md` — feat.010 细节：EventRpc 通道、调用矩阵、能力清单、安全要求、下载调用语义、异常分类（旧“私有”术语已更正为不可信 DOM transport；`@tech-extension.md` §A3 已覆盖骨架，不重复）。
- `tech-可观测与SLS.md` — feat.033 细节：完整字段表、环境变量、WebTracking URL 协议、脱敏规则、两类只写 SLS 的异常事件（`@tech-website.md` §7 已覆盖机制概要，不重复）。
- `tech-Crons框架.md` — feat.043 细节：`CronTaskSpec` 字段与校验、`cron_task_cursor` 表、领取/释放/超时释放语义、超时常量、daily 时区口径（`@tech-backend.md` §6 已覆盖骨架，不重复）。

**以代码为准的差异校正**：
1. **feat.043 时区过时**：文档 §4.4 说「服务器 IANA 时区（`TZ`），回退 UTC」；代码 `utils/time.py` 硬编码 `America/New_York`，daily 任务按 NY 本地日历日触发。tech-Crons框架 §6 与 tech-数据库 §2 口径一致，标注 feat.043 过时。
2. **feat.043 内置任务过时**：文档 §4.1 说第一阶段只内置 `maintenance.cron_health_log`；代码已追加 `order_fulfillment.compensate_paid_pending_subscription_orders`（每分钟）。tech-Crons框架 §1 以代码为准。
3. **feat.033 实现多出兜底**：代码有 `inferSlsMarkSite()`（hostname 推断 site）、`frontend-error-capture.ts`（独立异常捕获器）、指纹去重，源文档未单列，tech-可观测与SLS §10 据此补齐。

**自检结果**：
1. 000 已有 5 文件（overview / tech-数据库 / tech-backend / tech-website / tech-extension）未被修改（本批只新增 references/ + 3 个新 tech + 本 changelog 追加）。
2. 4 个源都有归宿：feat.009 进 index（tech-extension §A2 已覆盖）；feat.010 进 index + tech-插件RPC；feat.033 进 index + tech-可观测与SLS；feat.043 进 index + tech-Crons框架。
3. 不与现有 tech 重复：3 个新 tech 各自声明「骨架见 §X，本文不重复」，只补未覆盖细节。
4. 本批新增内容未引入 feat.044（feat.044 统一每日额度服务属业务域 005 计数器，不属 000 地基；`tech-extension.md` §A5 原有的 device_id 段落引用 feat.044 是跨域指引，非本次新增，未改动）。
5. 未混入业务域内容（001-007 的实现未搬进 000）。

## 2026-06-23 并入 008 SMTP 多账号发送

**为什么**：feat.008 是后端跨业务域共享的邮件发送基础设施（SMTP 多账号权重轮换 + 失败排除 + i18n 模板），被 007 用户域邮箱验证码等引用，属 000 地基性质，原散落在 feat/008 文档与代码里。并入 000 统一被各域 `@` 引用。只新增,不改 000 已有 5 文件已有段落。

**产出（只新增）**：
- `references/index.md` — 追加索引 feat.008（绝对路径 + 一句话 + 指向 `tech-邮件发送.md` + 与代码一致）与对应 plan 条目。
- `tech-邮件发送.md` — feat.008 细节：账号池配置（`SMTPSettings`/`SMTPSettingsList`）、权重抽取纯函数 `select_smtp_account`、单次请求内失败排除语义（无全局熔断）、`email_verification.html` 模板 + 14 语言 i18n 文案、密码脱敏、`@singleton` + 测试注入、调用方失败清理分工。

**以代码为准的差异校正**：
1. **Go 后端不存在**：源/plan §提到 `backend_go` 同步，仓库无该目录（见 overview §1），go 后端不维护，能力只在 Python `backend/`。
2. **失败清理在调用方**：源 §4.8 把清理验证码/重置限流写成发送流程一步，实际由 `email_verification_service` 在 `EmailSender` 返回 `False` 后执行。
3. **调试打印已移除**：源 §6「发送器会打印完整 SMTP 配置，需移除」，代码已完成移除。
4. **`retry_times` 是兼容废参**：源未提，代码保留但实际不生效，尝试次数由账号数决定。

**自检结果**：
1. 000 已有 5 文件（overview / tech-数据库 / tech-backend / tech-website / tech-extension）未被修改。
2. 008 要点（多账号轮换/失败排除/模板/失败语义）归宿 `tech-邮件发送.md`，骨架不与现有 tech 重复（现有 tech 未覆盖 SMTP）。
3. 未引入 feat.044。
