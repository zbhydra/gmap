# 008 · 管理后台 · 变更记录

## 2026-09-02 C6 扩展:用户管理页 + Dashboard 图表 + profile 多线契约

**为什么**:ROADMAP C6 缺口——后台无用户列表 / 搜索入口,查用户要手工查库;Dashboard 只有数据表格没有趋势图;用户信息弹窗的订阅摘要仍是单产品线旧口径,且旧单行读法在用户持有 ≥2 条产品线订阅行时抛 MultipleResultsFound 导致 profile 500(潜伏 bug)。范围经 hydra 裁决:不做 RBAC、订单写操作、订阅 / 额度管理 UI、API key 多条管理,保留「用户管理页(只读)+ Dashboard 图表」。

**变更**:

- 后端新增 `GET /api/admin/users`:分页列表,筛选 = 用户 ID(精确)/ 邮箱(模糊)/ 账号状态(normal/locked/deleted)/ 注册时间范围(毫秒闭开区间,反向范围 `INVALID_REQUEST`);响应含 `total`,排序 `user_id desc`,列表含已注销用户。查询归 `user_service`:`user_lists` 扩 status/created 过滤,新增 `count_users`,二者复用同一套 WHERE(`_apply_user_list_filters`)。
- profile 契约升级:`subscriptions` 固定四行(extension / maps_extension / maps_online / maps_api,经 `get_subscription_row` 按复合主键逐线读,无付费行 = `has_subscription:false` + `expires_at:null`,过期行保留原始过期时间);新增 `usage` 固定三行(maps 三线,经 000 域 usage 门面读当前业务月快照,`total` 真源 = 所持档位月度额度,当前 free 档 1000/1000/20,配置合同破裂 `PAYMENT_GATEWAY_ERROR` fail-closed);删除旧单数 `subscription` 字段与 `get_by_id` 读法(修复多产品线 500)。`UserAccountStatus` 稳定枚举收敛 `constants/auth.py`,列表过滤与展示共用口径(注销优先于锁定)。
- admin 新增 `/users` 用户管理页(菜单顺序 Dashboard → 用户管理 → 订单 → 系统设置):筛选区(ID / 邮箱 / 状态 / 注册时间)+ 远程分页表格(默认 20/页,9 列),用户 ID 点击打开通用弹窗,只读。
- UserInfoDialog 权益区升级:Credits + 四线订阅(绿「订阅中」/ 灰「未订阅」标签、过期时间弱化保留)+ 三线用量(`YYYY-MM` 周期标签、`used/total`、exhausted 红标);产品线 i18n 名 = TG 插件 / Maps 插件 / Maps 云端 / Maps API;删旧单数订阅 UI、类型与 i18n 死键(`common.yes/no`)。
- Dashboard 新增两图:60 天注册数柱状图 + 各打点类型事件数多系列折线(device_count 不上图),数据与表格同口径零后端改动;`ChartCanvas.vue` 承载组件(`echarts/core` 按需注册 + `ResizeObserver` + dispose,`notMerge` 全量替换),失败 `NEmpty` 占位与表格隔离;echarts 为唯一新依赖。HIDDEN/TRAILING 打点过滤机制保留,仅删除已无枚举的三个死成员 `web_parse_input_click` / `web_download_click` / `download_click`。
- 文档:`feat.md` 范围 / UI / 验收同步;新增 `tech-用户管理.md` 并在 `tech-管理模块接口.md` 登记;`tech-用户信息弹窗.md`、`tech-Dashboard.md` 契约同步;ROADMAP C6 置 ✅。

**验收**:backend `black` / `ruff` / `mypy` 通过;real 测试新增 `test_admin_users_real.py` 9 条全过(鉴权 / 邮箱分页排序 / ID+状态+时间范围 / 通配符字面量 / 非法筛选 / 多线订阅与用量 / free 档 total / 用户不存在),全量 real 除既有 credit 2 条失败外全绿(与本次无关)。admin `pnpm build` 通过;e2e `users.spec.ts` 4/4、`dashboard.spec.ts` 12/12(`login.spec.ts` 既有失败与本次无关)。

**边界确认**:

- 用户管理页与弹窗维持只读:不做用户编辑 / 封禁 / 删除 / 代充 / 改订阅,不做列表导出与用量流水列表接口。
- `email` 模糊与 `created_at` 范围查询无专用索引:users 表量级小 + admin 低频,与 `user_credit_logs` 先例同口径,不加索引。
- 订阅 / 用量额度管理 UI 不做(额度 total 真源是 006 商品配置,消费接线待 014);RBAC、订单写操作维持 feat.md 既有排除。

## 2026-09-01 Gosom API 配置升级为多条加权随机

**为什么**:单条 API 无法表达多套上游(备用 / 分流),需要「地址 / Key / 权重」三列多行配置,调用方按权重随机选用。

**变更**:

- `system_data` 的 `gosom_api` 由单对象改为 JSON 数组 `[{"base_url", "api_key", "weight"}]`,整表覆盖保存,空数组即清空;旧单对象格式读取时自动迁移为权重 1 的单行,无需迁移脚本。
- 新增 `gosom_api_service`(`get_items` / `save_items` / `pick`):收敛配置读写与按权重加权随机选取(`random.choices`),后续抓取调用方统一走 `pick()`;`base_url` 归一化(剥首尾空白 + 末尾斜杠)下沉到 pydantic schema。
- `GET/POST /api/admin/system-settings/gosom-api` 请求/响应改为 `{"items": [...]}`;weight 校验 1-10000,行数上限 100。
- admin「Gosom API」tab 改为动态行(地址 / Key / 权重三列 + 行删除 + 添加 API),增删改在前端行状态完成后整表提交;e2e 用例同步为多行增删 + 归一化断言。
- `tech-系统设置.md` 章节与 `feat.md` 范围 / 验收同步。

**验收**:backend `black` / `ruff` / `mypy` 通过,本地 7601 冒烟启动路由可达(无 token 401),service 逻辑桩冒烟(旧格式迁移 / 归一化 / 3:1 加权分布 / 空数组清空)通过;admin `pnpm build` 通过;`system-settings.spec.ts` e2e 6 条全绿。

## 2026-09-01 系统设置新增 Gosom API 配置

**为什么**:云端抓取引擎 gosom(014 / ROADMAP B4)接入前,后台需要一处入口维护其 API 地址与 Key;按 hydra 决策(2026-09-01)明文存 `system_data`,不做加密与掩码。

**变更**:

- 后端新增 `GET/POST /api/admin/system-settings/gosom-api`:经 `system_data_service` 读写 `system_data` 单行 `gosom_api`(JSON `{"base_url", "api_key"}`);`base_url` 保存前剥首尾空白与末尾斜杠;校验走 pydantic schema + 全局 `VALIDATION_ERROR`,无新增错误码;键名常量 `GOSOM_API_DATA_KEY` 收敛在 `app/constants/gosom.py`。
- admin 系统设置页新增「Gosom API」tab(地址 / Key 两个必填输入框 + 保存按钮,进页即加载回显,空白前端拦截);`api/system-settings.ts` 新增 `GosomApiConfig` 类型与读写封装,中英 i18n 同步。
- e2e `system-settings.spec.ts` 补 gosom-api 路由 mock 与「回显 / 必填拦截 / 保存归一化」用例;`tech-系统设置.md` 新增章节并收口三 tab,feat.md 范围 / UI / 验收同步。

**验收**:backend `black` / `ruff` / `mypy` 通过并本地启动接口可达;admin `pnpm build` 通过;`system-settings.spec.ts` e2e 全绿;保存后 `system_data` 落 `gosom_api` 行且回显一致。

## 2026-08-31 admin 移动端友好化重构

**为什么**:admin 布局此前只面向桌面(侧边栏无断点逻辑常驻挤压内容、订单详情抽屉固定 720px、Dashboard 表格无 scroll-x、断点值 960/640/560 散落混用),移动端基本不可用。

**变更**:

- 断点体系统一两档:960(移动/桌面主断点,对齐 design.md「单列阈值 960px」)+ 560(小屏单列);原 SystemSettingsView 的 640 收敛为 560。
- 新增 `admin/src/composables/useResponsive.ts`(模块级 matchMedia 单例 `useIsMobile()`)与 `admin/src/styles/global.css`(admin 唯一非 scoped 样式入口,main.ts 引入)。
- `AdminLayout.vue`:移动端(≤960)隐藏侧边栏,顶栏左侧汉堡 + 应用标题,NDrawer(280px)承载同一份菜单并随路由跳转自动收起;桌面保持可折叠 sider 不变;`100vh` → `100dvh`,内容区/顶栏移动端留白收窄。
- `OrdersView.vue`:筛选表单移动端 label 置顶(桌面左置不变);详情抽屉移动端全宽(桌面 720 不变)。
- `DashboardView.vue`:表格补动态 scroll-x(120 + 90 + N × 140),消除窄屏挤压。
- `UserInfoDialog.vue`:两处描述列表移动端降为单列(桌面 2/3 列不变)。
- `LoginView.vue`:登录卡 `min(400px, calc(100vw - 32px))`、`100dvh`、移动端 label 置顶。
- `global.css`:daterange/datetimerange 双日历面板窄屏约束宽度并横向滚动(宽屏无影响)。
- i18n 中英新增 `layout.openMenu`。
- `tech-后台架构与认证.md` 新增「响应式与移动端适配」章节,目录约定与前端锚点同步补 composables/、styles/。

**验收**:pnpm build 通过;Playwright e2e 36 通过(2 条失败为既有失败:`/tg-clients` 路由已删除但守卫测试残留,与本次无关,stash 后复测同样失败);375×812 视口全页面截图走查(抽屉导航、表格横滚 + 固定操作列、详情抽屉全屏、用户弹窗单列、日期面板兜底),1280 桌面无回归。

## 2026-08-31 移除系统设置 Google 数据采集 tab,清理外部 API 死文档

**为什么**:GSC/GA4 运行时采集后端主体已随后端清理移除,管理后台设置页的「google 数据采集」tab 与零散死代码一并退役;运营观测改用 Search Console 与 GA4 官方控制台。

**变更**:

- `SystemSettingsView.vue` 删除「google 数据采集」tab 及配置/授权/断开/手动采集逻辑;页面只剩「配置表缓存」「API Key」两个 tab。
- `admin/src/api/system-settings.ts` 删除 GoogleData* 类型与 5 个接口封装;中英 i18n 删除对应文案。
- `admin/e2e/system-settings.spec.ts` 删除 Google 数据 mock 与 7 条用例。
- 后端 `admin_system_settings.py` 删除遗留 GoogleData* 请求模型;`common_code.py` 删除 31001-31004 错误码;14 个 locale 删除对应消息。
- `tech-系统设置.md` 删除「Google 数据采集」章节(以及早前已下线的 Telegram DOM / Telegram Config 死章节),范围收口为两个 tab。
- `tech-外部API.md` 删除 `google_metrics` 响应字段与已下线节点系统的 `nodes` / 内部快照章节,大盘响应收口为 5 个统计字段(以 `external_system_dashboard_service.py` 为准)。
- `feat.md` 系统设置范围与 UI 描述同步收敛为两个 tab。

## 2026-08-31 新增用户积分记录接口

**为什么**:运营查看用户当前积分时,还需要直接追溯每次获得和消耗,避免再手工查询积分流水表。

**变更**:

- 新增 `GET /api/admin/users/{user_id}/credits`:按流水 ID 倒序分页读取 `user_credit_logs`,返回流水 ID、变动量、变动原因、扩展 JSON 快照和创建时间。
- 后端接口先行落地;admin 用户信息弹窗的「积分记录」tab 前端另行接入。

**边界确认**:

- 不提供积分筛选、导出、编辑、代充或余额修正。
- `user_credit_logs` 保持无索引;该接口仅用于 admin 低频排查,不修改 model 或数据库结构。

## 2026-08-27 系统设置增加 Telegram Config 编辑

**为什么**:新版扩展需要在同一份远端配置中读取 Telegram DOM 和下载参数,同时已发布旧版依赖的 Telegram DOM 配置必须保持独立且不受改写。

**变更**:

- 系统设置从四个 tab 增加为五个,新增独立「Telegram Config」JSON 编辑区;记录不存在时显示 `{}`,不展示扩展包内默认值。
- 新配置复用 `system_data.data_key="telegram_config"`,公共读取与 Admin 读写均直接传输顶层对象,不增加 `config` 包装。
- Admin 只校验合法 JSON 和顶层对象,支持读取失败后显式重试;保存成功或失败都保留编辑文本。
- 新增聚焦 E2E,覆盖首次读取、失败重试、宽松对象保存、非法输入拦截、保存失败保留文本和 Telegram DOM 状态隔离。

**边界确认**:

- Telegram Config 与 Telegram DOM 不迁移、不投影、不双写;旧标签、接口、存储和测试行为保持不变。
- 不提供默认值展示、字段表单、格式化、自动保存、“恢复默认”、版本、历史或回滚,不新增 UI 组件或依赖。

## 2026-08-26 管理员 refresh token ZSet 增加 key TTL

**为什么**:管理员 refresh token 的过期时间只保存在 ZSet score 中，停止访问后无 TTL 的账号 key 不会自动回收。

**变更**:

- 管理员 refresh token 写入与轮换在 transaction pipeline 中同步执行 `ZADD + EXPIREAT`，成功后独立清理过期 member。
- 新 refresh token 的 `exp` 只要求不早于当前 ZSet 已有 score；同秒签发时允许相等。
- 旧 refresh token 的短宽限期、JWT、Redis key/member/score 与登录续签 API 均保持不变。
- 更新前有效的无 TTL refresh token 继续通过现有验证路径；生产历史清理由独立 CLI 在人工确认后执行，本次代码交付不代表已经清理生产数据。

## 2026-08-19 系统设置增加 Telegram DOM 编辑

**为什么**:Telegram Web DOM 变化需要在不等待插件发版时更新活动 selector，同时线上多个扩展版本必须宽松共存，不能由后端按某一版本强制完整字段合同。

**变更**:

- 系统设置从三个 tab 增加为四个，新增「Telegram DOM」JSON 编辑区；记录不存在时显示 `{}`，不展示客户端默认值。
- 后端复用 `system_data.data_key="telegram_dom"`，提供无登录公共读取与 Admin 读写接口；对象直接作为请求体和响应 data，不增加版本层级。
- 只要求合法 JSON 和顶层对象；缺少字段、未知字段、字段类型和 selector 语法不做严格校验，保存时原样保留。
- 页面只显式保存，不自动格式化、自动保存，也不提供字段表单、版本选择、历史、回滚或“恢复默认”。

**边界确认**:

- 本轮只完成后端与 Admin；扩展端读取和 DOM 消费方迁移保留后续实施。后续扩展合同仍是每个 Telegram document 只读取一次，失败使用当前包内默认值，Admin 保存后由用户刷新 Telegram 页面生效。
- 不新增表、Redis、锁、依赖注入、跨实例缓存广播或未来 AI 巡检逻辑。

## 2026-08-09 Dashboard 展示插件商店评价点击

**为什么**:运营需要在 Admin 直接查看“去好评”点击量,不能只依赖数据库查询。

- Dashboard 明确把 `web_extension_store_review_click` 排在 `web_pricing_open_from_extension` 后。
- 每个自然日继续展示“事件数/独立设备数”,复用现有动态列与 UTC+8 聚合。
- 补充后端真实聚合断言与 Admin 浏览器表格回归。

## 2026-07-13 渠道设置增加 Instagram Cookie 池

**为什么**:Instagram 的匿名 Reel/Post、图片 SSR 和 Story SSR/Relay 解析会遇到登录墙,需要像 X 一样由管理员在每个执行节点维护可轮换 Cookie,同时不能把两个平台做成两套割裂的管理模型。

**变更**:

- 渠道设置从单一 X 页改为 X / Instagram 双 Tab,每个平台按 Tab 懒加载各节点独立池。
- Admin API 收敛为受限 `{platform}` 路径,平台只允许 `x`、`instagram`;列表关键字段从 X 专用 `has_*` 改为通用 `key_fields`。
- Instagram 使用独立 `data/media-cookie/instagram.com.cookies.json`,管理端展示 `sessionid`、`csrftoken`、`ds_user_id` 是否存在。
- Cookie 明文继续只提交不回显;JSON / 临时文件使用私有权限,失败原因脱敏,Instagram HTTP Cookie 只发送给 `.instagram.com`。

**边界确认**:

- X 保留“匿名 → 本地池 → 游客 Playwright”三级链路。
- Instagram 使用“匿名 → 本地池”链路,全部失败返回原匿名错误,不复用 X 的游客 Playwright。
- 本次不增加 Cookie 自动登录、定时巡检、跨节点同步或业务数据库表。

## 2026-07-08 订单统计笔数字段展示去重人数

**为什么**:运营看每日充值和商品统计时,只看订单笔数不够,需要同时知道对应去重下单人数。

**变更**:

- 后端 `order-analytics` 两个接口新增 `success_user_count` 和 `total_user_count`。
- 前端每日充值(+8)和商品统计(+8)的成功/全部笔数列改为 `x/y`,其中 `x` 是订单笔数,`y` 是去重用户数。
- 列名同步为「笔数/人数(成功)」「笔数/人数(全部)」。

**边界确认**:

- 每日充值按 UTC+8 日期去重用户。
- 商品统计按 UTC+8 日期 + 商品 ID 去重用户。
- 金额口径和成功/全部订单口径不变。

## 2026-07-08 订单统计默认时间范围改为 7 天

**为什么**:每日充值和商品统计按自然日看趋势,24 小时默认窗口容易只覆盖两天的零散片段,不利于运营判断最近一周表现。

**变更**:

- `AnalyticsView.vue`:每日充值(+8)和商品统计(+8)两个 tab 默认时间范围改为最近 7 天。
- `tech-数据分析.md`:同步默认时间范围口径;下载维度仍默认最近 24 小时。

**边界确认**:

- 只改默认值,不改接口参数、统计 SQL、快捷按钮和手动查询行为。
- 下载资源分析 / 下载排名 / 下载统计 / 用户地理分析继续默认最近 24 小时。

## 2026-07-08 数据分析新增订单统计标签

**为什么**:运营需要在数据分析页直接看每日付费订单和商品维度订单表现,并且金额需要按 XTR / USD 等币种拆分展示。

**变更**:

- `feat.md`:数据分析范围从四个子标签页扩展为六个,新增「每日充值(+8)」和「商品统计(+8)」。
- `tech-数据分析.md`:新增订单统计数据源、UTC+8 日桶、成功/全部口径、两个 `order-analytics` 接口和 UI 规格。
- 后端新增 `/api/admin/order-analytics/daily-recharge` 与 `/api/admin/order-analytics/product-statistics`。
- 前端 `AnalyticsView.vue` 新增两个 tab,金额展示为 `12 XTR, 15.3 USD`。

**边界确认**:

- 成功订单只看 `order_status = 2`;全部订单不筛状态。
- 日期按 `orders.created_at` 归属 UTC+8 自然日。
- 金额使用订单金额快照 `amount/currency`,按币种分组,不跨币种混加。

## 2026-07-05 外部统计大盘付费金额口径调整

**为什么**:外部监控需要看到真实今日付费收入口径,订阅收入和履约失败订单不能被静默排除;履约失败还需要单独突出,方便及时排查到账 / 开通异常。

**变更**:

- `tech-外部API.md`:今日金额口径从"履约成功的充值订单"改为"履约成功或失败的所有已支付订单";新增 `today_paid_order_amounts`、`today_fulfillment_failed_count`、`today_fulfillment_failed_amounts`。
- `external-api-integration.md`:补充外部接入类型、响应示例和统计口径;`today_recharge_amounts` 保留为兼容旧调用方字段,值同 `today_paid_order_amounts`。
- 后端 `GET /api/external/system/dashboard` 聚合 `order_status=PAID`、`callback_status in (SUCCESS, FAILED)` 的订单,不按 `product_class` 过滤,并额外汇总履约失败数量和金额。

**边界确认**:

- 今日边界仍为 `Asia/Shanghai` 自然日,时间字段仍按 `paid_at`。
- 不同币种继续分组返回,不混加。
- `callback_status=PENDING` 仍不计入今日付费金额,避免把尚未最终履约的订单提前确认为收入。

## 2026-07-05 通用用户信息弹窗

**为什么**:运营在订单、下载排名、TG 当前使用明细中看到用户 ID 后,需要快速查看该用户基础资料、Credits、订阅、最近下载和订单记录,否则要在多个页面和数据库之间手工拼信息。

**变更**:

- `feat.md`:新增通用用户信息弹窗范围、验收和 UI 规格。
- `tech-用户信息弹窗.md`(新增):定义 profile 接口、最近下载分页接口、订单分页接口、字段口径、前端组件和接入点。
- `tech-管理模块接口.md`:登记共享能力。
- `tech-订单管理.md`、`tech-数据分析.md`、`tech-TG客户端.md`:补充用户 ID 入口接入通用弹窗。
- `plans/003.用户信息弹窗-后端接口.md`、`plans/004.用户信息弹窗-前端接入.md`:拆分后端接口与前端接入执行计划。

**边界确认**:

- 最近下载列表使用 `user_download_records`,订单列表使用 `orders`;两个 tab 均分页但不筛选。
- 所有已有用户 ID 展示位都可接入,首批包括订单管理、数据分析下载排名、TG 当前使用明细。
- IP 归属地只展示已有字段,格式为 `ip (归属地)`,不在弹窗打开时重新做 GeoIP 查询。
- 弹窗只读,不做用户编辑、封禁、代充、人工改订阅、导出、积分流水或 extension 下载历史。
- 管理后台所有时间展示统一为 `YYYY-MM-DD HH:mm:ss`,固定 UTC+8。

## 2026-07-01 数据分析百分比展示

**为什么**:运营查看资源分布和用户地区分布时,只看绝对次数 / 人数不方便判断结构占比。

**变更**:

- `feat.md`:数据分析范围与 UI 补充下载资源分析次数百分比、用户地理分析人数百分比。
- `tech-数据分析.md`:明确百分比不改后端接口,前端基于当前响应数组一次性求分母并在内存计算。

**边界确认**:

- 下载资源分析新增两个百分比列:消耗积分百分比分母为当前 `buckets` 的 `sum(paid_count)`,总和百分比分母为当前 `buckets` 的 `sum(total_count)`。
- 用户地理分析人数列显示为 `人数 (百分比%)`,分母为当前 `regions` 的 `sum(count)`。
- 分母为 `0` 时显示 `0%`;不新增接口字段、不新增图表、不引入依赖。

## 2026-06-29 系统设置支持 Google 数据采集配置

**为什么**:GSC/GA4 采集目标和 OAuth client 必须由管理员在后台明确配置,不能依赖脚本默认值或部署 YAML 推断。

**变更**:

- `tech-系统设置.md`:系统设置顶部改为「配置表缓存」「API Key」「google 数据采集」三个 tab。
- Google 数据采集 tab 增加配置表单:Client ID、Client Secret、GSC Site URL、GA4 Property ID;OAuth 回调地址由后端生成,页面不展示。
- 新增 `POST /api/admin/system-settings/google-data/config`,保存到 `system_data.google_data`。
- `system_data_service` 读取缓存 30 分钟,保存后清空缓存。
- GSC Site URL 支持填写裸域名,保存时归一化为 `sc-domain:` 域名属性;显式 `http://` / `https://` 才按 URL-prefix 属性采集。
- 单次采集只要返回 `errors` 就在页面弹出错误摘要,避免 HTTP 200 的部分失败被误看成全部成功。

**边界确认**:

- Client Secret 不回显,保存时留空表示保留旧值。
- status 只返回 `client_secret_configured`,不返回密钥明文。

## 2026-06-29 外部统计大盘返回 Google 指标快照

**为什么**:外部自动化系统需要通过已有 API Key 统计接口读取最后一次采集的 GSC 和 GA4 数据。

**变更**:

- `tech-外部API.md`:系统统计大盘响应新增 `google_metrics.latest_gsc` 与 `google_metrics.latest_ga4`。
- `external-api-integration.md`:补充外部接入类型定义、响应示例和字段说明。
- 后端 `GET /api/external/system/dashboard` 按 `metric_type=GSC/GA4` 分别读取 `google_metric_snapshots` 最后一条快照并返回原始采集 JSON。

**边界确认**:

- 不新增外部接口路径,复用现有 API Key 鉴权。
- 未采集过时对应字段为 `null`;已有调用方可继续忽略新增字段。

## 2026-06-29 新增数据分析菜单

**为什么**:运营需要按时间范围查看下载数据的分布、排名、汇总和用户注册地区,此前无此类聚合视图。

**变更**:

- `feat.md`:包含范围补「数据分析」模块;不包含补口径边界(不做图表、不含 extension 下载);用户操作逻辑补数据分析页 UI。
- `tech-数据分析.md`(新增):四个只读聚合接口规格、聚合 SQL 逻辑、分桶 / 积分口径、时间范围选择器组件、文件树、UI 规格、实现锚点、边界与性能。
- `tech-管理模块接口.md`:菜单文档索引登记「数据分析」。

**边界确认**:

- 下载维度三页统一基于 `user_download_records`(website 付费下载记录),不含 extension 下载;「消耗积分」= `credits_cost > 0`,「总和」=全部记录。
- 资源大小按左开右闭区间分 11 个大小档(10 个有上界 ≤4GB + 1 个 >4GB)+ 未知大小(`size_bytes IS NULL` 或 `=0`),共 12 桶;单位用 MiB / GiB 与后端一致。
- 仅表格 + 统计卡片,不引入图表库;国家名用浏览器原生 `Intl.DisplayNames` 转换,不引入新依赖。
- 时间为区间汇总聚合(非按自然日分桶),直接 `created_at` 毫秒闭区间过滤,不复用 Dashboard 的 UTC+8 日桶逻辑;时间窗口取管理员客户端时区(已知局限)。
- `user_download_records` **不加 `created_at` 索引**:聚合按 `created_at` 范围过滤,无索引宽窗下退化为全表扫描;但该接口仅 admin 低频运营使用 + 开发期数据量小,可接受,不为此改动 model 与 schema 落库流程;数据量增长后再按需补索引。
- 已知口径局限(实现不改,文档与 UI 已点明):「次数(总和)」含 6 小时内免扣重复请求;下载维度含历史已注销用户(无软删标记,保持单表),地理维度排除注销用户;admin 顶栏无语言切换 UI,国名默认显示中文。

## 2026-06-28 接码平台适配层与自动模式批量登录

**为什么**:自动模式批量登录在生产基本不可用(主要靠手动加号)。实测定位根因不是单一问题:jiema 单平台硬编码、jiema 秒级限速被前端 5 秒轮询自伤、CF 偶发拦截、解析端点零日志导致历史"被挡"无据可查。需要把接码拉取 + 解析重构成多平台架构,并接入第二个接码平台 next.tgapi.de。

**变更**:

- `feat.md`:TG 客户端管理范围与 UI 补「自动模式批量登录」(此前文档未记录该现存功能);验收标准补自动模式。
- `tech-TG客户端.md`:新增「自动模式批量登录与接码解析」菜单级概要。
- `tech-接码平台适配层.md`(新增):接码拉取 + 解析子系统完整规格 —— 平台注册表架构、jiema / next 协议规格、`curl_cffi` 指纹拉取、CF challenge 检测与降级、日志补全、分阶段实施与待确认项。

**边界确认**:

- 平台识别在后端按 URL 自动分派(host 严格相等 + 启动唯一性自检),前端不加平台选择、不改用户输入格式(仍「手机号 + 接码链接」)。前端必要改动(均不改输入交互):`CodeLinkParseResult` 加 `cf_blocked` 状态、`waitAutoLoginCode` 重构错误模型(单号失败只 `continue` 不中断整批,仅基础设施故障 fatal 中断整批)、`no_code` 轮询间隔从 5s 上调到 8s(根因治理平台限速)、`parseTgCodeLink` 透传 `phone`。
- 仅接码拉取层引入 `curl_cffi`(版本 `>=0.7.4,<0.12`,允许新指纹对抗 CF),不全局替换 httpx;不引入 headless 浏览器,`curl_cffi` 过不了的 JS Challenge / Turnstile 只告警降级。
- `code-link/parse` 请求新增可选 `phone`(next URL 内手机号与输入手机号一致性校验,防批量错位),端点签名不变(不做节流,无需注入 admin),响应 `status` 枚举新增 `cf_blocked`;其余契约不变。
- `curl_cffi` 全局不可用时端点走 200 + `network_error` 降级(不 raise、不中断自动队列);交付前在生产镜像验证 `import curl_cffi` 的 wheel 可用。
- jiema 迁移到新架构后行为不变(以 bit-for-bit 样本回归保障);next 实测无冷却/限速(RESTful 路径每次返回最新状态),无冷却正则、无码态主判据为 `#code` 缺失。
- 速率治理只靠前端 `no_code` 轮询间隔上调到 8s(根因:原 5s 快于平台对同 id 的秒级限速,轮询自伤);后端**不做请求节流**(`code-link/parse` 是管理后台内部接口,流量可控,前端节奏已是根因治理);next 无冷却/限速,8s 间隔绰绰有余,速率治理主要约束 jiema 的秒级限速;多管理员同号的平台层串号已知不修,运营需协调不同时登录同一号。

## 2026-06-26 外部 API Key 与系统统计大盘

**为什么**:第三方系统需要读取系统统计大盘,但鉴权不能复用浏览器后台 admin JWT 或节点本地 JWT-only 鉴权,否则会混淆三套边界。

**变更**:

- `feat.md`:新增外部 API Key 认证边界、系统设置 API Key UI、外部系统统计大盘产品口径。
- `tech-系统设置.md`:新增当前管理员 API Key 生成 / 轮换接口与 `admins` 表字段设计。
- `tech-外部API.md`:新增独立 `/api/external/*` 外部 API 分组,当前提供 `GET /api/external/system/dashboard`。
- `tech-后台架构与认证.md`:新增外部 API Key 认证边界,明确 `/api/admin` 与 `/api/external` 分离。

**边界确认**:

- API Key 只访问 `/api/external/*`,不能调用后台管理接口或节点本地管理接口。
- 外部 API Key 只到业务服务器,不透传给下载节点;跨节点 TG 客户端和速率通过业务服务器调用 `/internal/service-node/dashboard-snapshot` 聚合。
- `admins` 表只保存 API Key hash、前缀和生成时间,不保存明文。

## 2026-06-26 管理模块技术文档按菜单拆分

**为什么**:`tech-管理模块接口.md` 同时承载多个菜单的接口规格,后续每加一个菜单都会继续膨胀,查找和维护成本变高。

**变更**:

- `tech-管理模块接口.md` 降级为索引与通用约定。
- 新增菜单级技术文档:`tech-Dashboard.md`、`tech-服务节点.md`、`tech-TG客户端.md`、`tech-日志排查.md`、`tech-下载详情.md`、`tech-订单管理.md`、`tech-渠道设置.md`、`tech-系统设置.md`。
- `feat.md`、`tech-后台架构与认证.md`、`tech-节点本地与中心入口.md` 的引用改为指向索引或具体菜单文档。

**边界确认**:

- 本次只拆文档结构,不改变产品范围、接口契约或实现方案。
- 新增菜单以后优先新增独立 `tech-菜单名.md`,并在 `tech-管理模块接口.md` 登记。

## 2026-06-26 系统设置刷新配置缓存

**为什么**:配置类服务默认有 3 分钟进程内缓存,后台或数据库手动改配置后,管理员需要一个明确的低频运维入口立即让当前业务进程使用最新配置。

**变更**:

- `feat.md`:新增"系统设置"模块,当前只包含刷新配置缓存按钮;明确不做配置编辑器、配置审计、跨节点广播。
- `tech-后台架构与认证.md`:新增 `/system-settings` 路由与前端实现锚点。
- `tech-系统设置.md`:新增系统设置接口 `POST /api/admin/system-settings/config-cache/refresh`,定义刷新范围、执行规则、当前进程边界和前端验收。

**边界确认**:

- 刷新范围只包含配置读取服务:公共配置、支付渠道、订阅商品/价格、积分包商品/价格、订阅 checkout 聚合配置、Credits checkout 聚合配置。
- 只刷新当前业务进程,不做 download 节点或多实例广播;失败让管理员重试。
- 不展示或编辑任何配置值。

## 2026-06-23 文档结构迁移

**为什么**:把散落在 `feat.025 / 027 / 040 / 046 / 047 / 048` 的管理后台扁平文档重构为独立域,与节点执行底座(`@../001.节点系统`)、订单数据(`@../004.订单系统`)、下载记录(`@../002.下载功能`)、客户端用户(`@../007.用户系统`)解耦,让"运营管理后台"作为一个独立 SPA 系统自成域,避免管理后台接口规格与被管理的业务数据耦合在同一份文档。

**from → to**:

- `docs/feat/feat.025.管理后台.md` → 本域(`feat.md` 产品边界 + `tech-后台架构与认证.md` 架构 / 登录 / JWT-only 认证 + `tech-管理模块接口.md` 各模块接口)。
- `docs/feat/feat.027.管理后台TG客户端新增与删除.md`(+ plan 第二阶段飞书通知) → 本域 `tech-TG客户端.md`。
- `docs/feat/feat.040.管理后台渠道设置与X-Cookie池.md` → 本域 `tech-渠道设置.md`;X Cookie 运行时解析链路口径归下载域,仅以 @ 引用。
- `docs/feat/feat.046.管理后台下载详情列表.md` → 本域 `tech-下载详情.md`;打点表与下载记录归 `@../002.下载功能`。
- `docs/feat/feat.047.管理后台节点本机监控.md` → 本域 `tech-服务节点.md`(监控 admin 接口)与 `tech-节点本地与中心入口.md`(节点本地入口);采集服务本身的进程内缓存与采样口径保留在本域。
- `docs/feat/feat.048.管理后台订单只读查询.md` → 本域 `tech-订单管理.md`;订单数据模型与状态机归 `@../004.订单系统`。
- 服务节点管理 UI 仍属 `@../001.节点系统`,本域 `feat.md` 只以 @ 引用并在路由表中声明 `/service-nodes` 入口。

**与源差异(以代码为准)**:

- 源文档按 feat 编号切分(025 / 027 / 040 / 046 / 047 / 048),重构后按系统域切分;同一模块(如 TG 客户端)的列表 / 登录 / 删除 / 飞书通知合并到同一处,消除跨文档跳转。
- 源 `feat.025` 把 admin 认证与各模块混在一份文档,重构后拆为 `tech-后台架构与认证.md`(认证 / SPA / 部署)、`tech-管理模块接口.md`(接口索引 / 通用约定)与各菜单级 `tech-*.md`。
- 源文档未显式声明三套认证边界(admin DB 认证、客户端用户认证、节点 admin 本地认证),本域 `feat.md` 与 `tech-后台架构与认证.md` 据代码(`get_admin_user` vs `get_admin_jwt_only` 双依赖、`download` role 不挂登录 / 续签 router)显式写清边界。
- 源 `feat.047` 把节点本地接口与 admin 前端直连模式写在同一份,重构后 `tech-节点本地与中心入口.md` 专注 admin 域的双路由挂载与节点直连,节点本地管理架构完整契约归 `@../001.节点系统`。
- `feat.md` 严格保持零代码符号:无 `/api/` 路径、无表名 / 字段名 / 类名 / 函数名 / 错误码 / YAML / SQL,指向代码一律用 @ 相对路径。技术细节全部下沉到 `tech-*.md`。
