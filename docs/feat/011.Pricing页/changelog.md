# 011 · Pricing 页 - 变更记录

## 2026-09-05 Pricing 订阅升级与产品线入口接通(005 U4/U5)

- `pricing-page-controller.ts` 消费服务端报价标记当前档与可升级档,并按 `product_line` 入口参数打开既有 tab;普通跨线购买与管理入口沿用原流程。
- 公共 checkout 复用确认、外链、等待、成功事件与刷新:一次性升级固定订阅渠道创建补差订单;自动续费按统一 `status/action` 处理,等待时只读 quote 的当前档,不重复确认。PayPal 自动续费升级禁用,一次性补差保留。
- i18n 同步升级金额、到期日不变与失败提示;自动续费等待按钮为 Close,关闭不代表取消渠道操作。`upgrade_quote_shown` 与成功后的 `upgrade_confirmed` 接入既有 GA4 通道。
- 验证通过(website 目录):`pnpm build`、`pnpm type-check:tests`、`node --test --test-name-pattern='Order checkout protocol|Pricing checkout client' tests/module-scripts.test.js`(2 项)、`pnpm exec playwright test e2e/website.spec.ts --grep 'Pricing full purchase path' --project=chromium --project='Mobile Chrome' --workers=1`(同一路径,2 项)。开发服务器以 `PUBLIC_API_BASE_URL=http://homepage-api.test pnpm dev --host 127.0.0.1 --port 7620` 启动并完成页面验证;桌面/移动截图核对确认与等待文案无重叠。
- 首次 E2E 因新增 PayPal 回跳检查的选择器与 mock 作用域错误失败,修正后通过;一次中间复跑中止。无环境 skip。验证为网站 route mock,真实支付、自动续费 SKU 与公网 webhook 未验收;`redirect` action 未做真实渠道验证。
- 运行环境补验:初次 mock 环境因本地后端未启动,设备图标代理出现 `ECONNREFUSED`。随后按现有配置启动 `PYTHONPATH=src uv run uvicorn app.main:app --host 127.0.0.1 --port 7600`,网站以 `PUBLIC_API_BASE_URL=http://127.0.0.1:7600 pnpm dev --host 127.0.0.1 --port 7620` 对齐本地 API。实际请求 health 返回 `healthy`、Pricing 返回 200、携带设备 Cookie 的图标经网站代理返回 200 SVG;检查两端启动及请求日志无错误。未修改后端或运行配置,未重跑已通过测试,两端保留为后台预览服务。

## 2026-09-05 Pricing 购买模型同步落地(004 计划 U3)与 e2e 收敛

**Why**: 后端计费模型同步(商品单一计费模式 + `auto_renew + period` 下单 + ClinkBill 渠道 + 渠道订阅管理入口)后,Pricing 购买链路需对齐新合同并同步文档;TG 时代的旧 tech 文档(metadata.auto_renew / duration_days / 站内取消指引)与实现割裂。

**变更**:

- 前端:checkout 类型与请求体增 `auto_renew + period`;支付选项按商品级单一计费模式展示 `Auto-renews until canceled` / `One-time payment`;新增 Clink 渠道(图标 + `uat-checkout.clinkbill.com` / `checkout.clinkbill.com` 域名白名单);新增 Clink success/cancel 回跳页(`/clink/success|cancel`,noindex)并把 `credit-purchase/paypal-return.ts` 泛化为 PayPal / Clink 共用 payment return 脚本(删除 `credit-checkout.ts`);账号区 `Manage subscription` 调 `POST /api/client/subscription/management`,返回 URL 新标签页打开渠道管理页,空 URL 弹渠道内指引弹窗。
- 文档(最终分工):`tech-pricing与自动续费.md` 为 Pricing 消费合同唯一 owner(下单参数、渠道白名单、回跳、渠道管理入口、约 3 分钟配置生效的用户可见行为);`tech-实现与配置.md` 只保留前端文件责任与商品配置命令,商品配置唯一口径指向 006 状态 tech;`feat.md` 只定义 10 个付费 SKU,当前可售数量归 ROADMAP C4/C5 与本 changelog。
- 测试:`website/e2e/website.spec.ts` 收敛为两条用例——Pricing 完整购买主路径(单一计费模式、下单 `auto_renew + period`、Clink success/cancel 回跳、Manage subscription)与压缩保留的站点结构路径;2 tests × 4 项目(chromium/firefox/webkit/Mobile Chrome)= 8 passed;`pnpm build` 24 页通过。

**边界确认**:订阅升级 UI 未实现(005 计划待实施),feat 升级相关章节为目标合同;Clink 公网 webhook 首笔人工验收与 maps_extension 真实渠道 SKU 为外部待办。

## 2026-09-02 Free 档口径校准(已落库生效)

- 上条「Free 档口径仅卡面展示,不落库、暂不生效」已被 006 域 2026-09-02「FREE 档统一」推翻:free 行已播种落库(monthly_quota:online 1,000 records/月、maps_extension 1,000 records/月、api 20 requests/月),maps_extension 线免费额度经 `/maps/usage` 真实生效(usage total 为唯一真源);online/api 两线尚无消费入口,待 014 云端落地。

## 2026-08-31 Pricing 页重写为三产品线 tab 版(文档同步)

**Why**:TG 主站退役、MapsGrab 站接管 website/ 后,Pricing 页实态已是 Online / Extension / API 三 tab 形态;旧文档仍描述已不存在的单页(账号→Credits→Unlimited)与好评赠送流程,与源码及 ROADMAP C5 口径割裂。本文档单元不改代码,只把 feat/tech 重建到现役实现口径。

**变更**:

- `feat.md` 以现役 `/pricing` 页为唯一真相重写:三 tab(online×5 卡 / extension×3 卡 / api×5 卡,均含 Free 引导卡),10 个可购买付费 SKU(online 4 + maps 2 + api 4,卡面如实区分 one-time·30 days 与按月订阅),账号区按当前 tab 展示线状态,PayPal 回跳按订单 product_class 分发文案,取消指引仅 PayPal 三步路径且只对有效自动续费订阅(Extension 两档)展示。
- 移除旧站的 Credits 积分包售卖与好评赠送页面流程章节,并标注归属:后端好评赠送合同保留于 006 域(`checkout-configs` 响应字段页面不消费),`tech-好评赠送.md` 降为历史参考。
- `tech-实现与配置.md`:前端结构对齐现役文件(删除 `PricingSubscriptionConfirmModal.astro` 死引用,补 `pricing-auth-controller.ts`、统一 OrderCheckout 弹窗、`pages/paypal/success|cancel.astro`);后端接口表移除页面不调用的 review-reward/cancel-auto-renew 与 Credits 接口;商品约定表补全 10 个新 SKU 与播种脚本;埋点口径改为 `upgrade_cta_click`(plan 维度 = SKU,10 个付费 SKU)。

**边界确认**:

- 现役页面唯一支付渠道为 PayPal;不做好评赠送入口、不做站内取消自动续费。
- Free 档口径(online 1,000 records/月、api 20 requests/月)仅卡面展示,不落库、暂不生效。
- `credit-purchase/` 组件目录保留为历史基建,页面不消费。

## 2026-08-21 插件来源 Pricing 补发登录态

**Why**:用户可能先在 Website 登录和支付,再从插件重新打开 Pricing;此时需要用已有 Website token 恢复插件登录态。

**变更**:

- Pricing 识别到现有插件来源标记时调用用户系统统一同步函数,向正式版和预发布版两个固定扩展 ID 各发送一次。
- 普通 Pricing 不发送;任一插件未安装或同步失败不影响账号展示、商品加载与购买。
- 旧 `/extension-login` 页面和旧插件协议不参与本次改动。

## 2026-08-18 插件来源订阅卡首屏完整展示

**Why**:插件来源的 Pricing 页仅有 Unlimited 一个商品，但桌面端较矮视口仍沿用普通 Pricing 的宽松纵向间距，导致订阅卡底部和权益在首屏被截断。

**变更**:

- `website-shared/src/components/pricing/PricingPageShell.astro`:在插件来源且桌面端视口高度不超过 `900px` 时收紧页面、Hero 和卡片纵向间距，权益列表改为两列；`800px` 及以下进一步收紧。
- `website/e2e/website.spec.ts`:增加 `1556×844` 和 `1366×768` 的订阅卡首屏边界回归检查。

**边界确认**:

- 不隐藏、裁剪或减少订阅卡内容。
- 普通 Pricing 入口和移动端布局保持原有节奏。

## 2026-08-11 接入好评赠送活动开关

**Why**:后端关闭活动后,Pricing 必须隐藏所有活动入口,同时保留正常 Unlimited 购买流程。

- 严格校验订阅配置的 `review_reward_enabled` 布尔字段。
- 开关关闭时隐藏插件来源活动横幅和购买确认弹窗中的好评区域;继续购买按钮保持可用。
- 登录切换、退出、鉴权失效、配置重载与加载失败时先清空本地开关,避免短暂展示旧活动状态。
- 模块测试覆盖开关响应合同,浏览器 E2E 覆盖关闭态的两个入口与正常购买入口。

## 2026-08-11 插件来源页增加好评赠送入口

**Why**:插件来源 Pricing 只展示账号摘要和 Unlimited 卡片,好评赠送藏在购买确认内,首屏信息密度不足且活动不易发现。

- 在账号摘要与 Unlimited 卡片之间增加紧凑活动按钮,与账号区保持 420px 对齐。
- 活动按钮使用奖励标题和操作说明两级文案,明确 Chrome 应用商店好评、返回页面、自动验证领取的完整路径,不展示预计领取时长。
- 仅插件来源、已登录、当前登录态资格加载成功且永久领取次数为 `0` 时显示;匿名、已领取、加载失败和普通 Pricing 入口隐藏。
- 点击后直接打开 Chrome Web Store `/reviews` 并进入现有 30 秒检测/领取流程,不经过付费确认。
- 补齐全部 Pricing locale,并增加 eligible/ineligible E2E 与桌面、移动视口验收。

## 2026-08-09 记录插件商店评价点击

**Why**:需要在后端 `mark_logs` 中统计用户实际点击“去好评”的次数,同时保留 SLS 逃生观测。

- 新增 `web_extension_store_review_click`,每次点击通过现有 website mark 通道双写 SLS 与后端。
- `mark_msg` 保持为空;上报失败只记错误,不阻断 Chrome Web Store 跳转、倒计时或领取。
- 不新增好评曝光、倒计时完成、领取成功或失败事件。

## 2026-08-09 补充好评检测等待提示

**Why**:好评检测需要保留当前页面与弹窗,用户提交评论后也需要等待倒计时完成。

- 全部 Pricing 语言的检测说明补充“不要关闭或刷新窗口”和“已经评论时等待检测”。
- 真实浏览器 smoke 增加简体中文完整提示断言。

## 2026-08-07 实现好评赠送 7 天订阅

**Why**:未订阅用户在进入付费 checkout 前可选择前往 Chrome Web Store 好评并领取一次 7 天插件订阅。

**变更**:

- Pricing 专用订阅确认弹窗保留现有安装提示,未领取账号额外展示赠送文案与“去好评”。
- 点击后打开商店 `/reviews`,同一弹窗切换为 30 秒检测界面并终止本次付费路径。
- 倒计时结束自动领取;失败可直接重试,关闭或刷新不保存和恢复。
- 通用站点确认框、Extension 和活动埋点保持不变。
- 订阅配置保存永久领取次数;登录成功后用账号 token 重新加载,领取完成后刷新账号订阅状态。
- 全部 Pricing locale 已补齐流程文案;新增独立真实后端 Playwright project,不进入默认 mock 跑。
- checkout configs 和领取响应在 API client 边界严格校验领取次数与结果枚举;坏响应按加载或领取失败处理,不会开放购买。
- 订阅配置加载使用单调请求版本,登录后的带 token 响应不会被较晚返回的匿名响应覆盖。
- 领取失败只向用户展示本地连接/解析失败文案、服务器繁忙专用文案或明确的后端业务消息;完整内部错误保留在 console。
- 真实 API smoke 禁止复用已有 dev server;Pricing smoke 默认使用可覆盖的专用网站端口 `4332`。

**验证**:

- `cd website && pnpm test:module-scripts`
- `cd website && pnpm tsc --noEmit`
- `cd website && pnpm build`
- `cd website && pnpm test:e2e:pricing-review-reward-smoke`（需要本地真实后端、MySQL、Redis）

技术规格见 `@tech-好评赠送.md`,执行计划见 `@plans/001.好评赠送订阅-Pricing前端.md`。

## 2026-08-07 删除重复的一次性商品开关

**Why**: Pricing 只需要根据 `auto_renew` 展示自动续费或按需付费,不需要第二个支付方式开关。

**变更**:

- 删除 checkout 配置和账户订阅响应中的 `one_time`。
- 删除两站一次性方案专用文案和渲染分支。
- 套餐周期继续显示月度,计费方式只根据 `auto_renew` 展示。

## 2026-08-07 Pricing 支持配置切换自动续费

**Why**: Pricing 不应因 `auto_renew`、周期或额度取值拒绝展示已启用的 Unlimited 商品。

**变更**:

- Pricing 只按 `product_id=unlimited` 选择订阅商品,其余展示和支付语义读取配置。
- 套餐静态描述改为中性的月度订阅,续费行按 `auto_renew` 动态展示。
- 默认配置示例关闭自动续费;后续只修改 `auto_renew` 即可切换支付方式。

## 2026-08-06 插件入口隐藏 Website Credits 积分包

**Why**:插件用户进入 Pricing 是为了购买插件 Unlimited 权益,Website Credits 积分包与当前任务无关且容易造成权益范围误解。

**变更**:

- `utm_source=extension` 等插件来源入口保留账号摘要,只展示 Unlimited 订阅商品。
- 隐藏 Credits 积分包并跳过 Credits checkout 配置请求;普通 Pricing 入口继续展示并加载 Credits。
- E2E 覆盖插件入口的商品可见性与 Credits 请求边界。

**边界确认**:

- 账号摘要中的 Credits 余额仍然展示,仅隐藏 Credits 购买商品。
- Unlimited 与 Credits 的使用范围及普通 Pricing 购买流程不变。

## 2026-07-30 增加 PayPal 自助取消路径

**Why**:Unlimited 同时支持 PayPal 与 Telegram Stars 自动续费,取消提醒只展示 Telegram Stars 会让 PayPal 用户找不到对应入口。

**变更**:

- 取消提醒按渠道分组,保留 Telegram Stars 路径并增加 `PayPal → Settings → Payments → Automatic payments → TG Downloader → Cancel`。
- 全部 Pricing locale 同步增加 PayPal 路径文案。
- 增加双渠道文案合同与弹窗交互验收。

**边界确认**:

- 弹窗只提供支付渠道后台路径,不调用站内取消接口,不修改订阅状态或到期时间。
- 账号摘要暂不返回当前支付渠道,因此弹窗同时展示两条路径,由用户选择原支付渠道。

## 2026-07-16 增加插件升级入口 Pricing 曝光

**Why**: 插件免费用户点击升级后会进入 Pricing,需要在后端 `mark_logs` 中直接统计该入口的页面曝光。

**变更**:

- 网页精确识别 `utm_source=extension&source=quota_upgrade_button`,上报 `web_pricing_open_from_extension`。
- 同一事件同时写 SLS 与后端 `mark_logs`,`mark_msg` 保留两个来源参数。
- 页面刷新重复上报;其他 Pricing 或插件来源不写该类型。

**边界确认**:

- 插件仍只负责打开 Pricing URL,不恢复插件到后端 `mark_logs` 的写入链路。
- 打点失败不阻断 Pricing 账号和商品加载。

## 2026-07-14 增加取消指引并恢复插件入口账号摘要

**Why**: 站内直接取消方案暂缓期间,有效订阅用户仍需要明确、可找到的自助取消路径。

**变更**:

- 有效且自动续费的订阅在 Pricing 账号订阅行展示“取消”按钮。
- 点击后使用原生 `dialog` 展示 `telegram → settings → Telegram Stars → My subscriptions`。
- 插件跳转入口恢复账号摘要,页面顺序为“账号 → Unlimited → Credits”。
- 补齐全部 Pricing locale 文案,并增加按钮可见性、弹窗内容、关闭和焦点恢复的测试。

**边界确认**:

- 指引弹窗不调用后端取消接口,不修改订阅状态或到期时间。
- Free、过期、一次性和非自动续费状态不展示入口。

## 2026-07-14 简化自动续费展示状态

**Why**: Pricing 无法实时得知用户是否已在支付渠道后台取消,不应把本地布尔值描述为渠道真实续费状态。

**变更**:

- 后续取消方案删除 `auto_renew_enabled`,改由 `billing_mode/cancelled_at/expires_at` 计算展示状态。
- 最近一次订阅付款成功清空 `cancelled_at`;取消成功或渠道返回已经取消时写入 `cancelled_at`。
- 明确有效订阅检查不保证阻止并发或跨渠道的两次用户确认付款,不为此增加复杂协调机制。

**边界确认**:

- 渠道后台状态可以领先于 Pricing 展示;用户再次点击取消即可同步。
- 极少数重复订阅由支持处理。

## 2026-07-14 修正多语言自动续费文案

**Why**:日、韩、西、葡、德、法、俄、意、越、泰、印尼文的 Unlimited 套餐错误显示为一次性付款,与实际月度自动续费商品不一致。

**变更**:

- `website/src/i18n/pricing.ts`:修正 11 个 locale 的套餐眉题和自动续费状态文案。
- `website/tests/module-scripts.test.js`:增加多语言 Pricing 自动续费文案契约测试。

**边界确认**:

- Unlimited 明确展示月度自动续费。
- Credits 和一次性商品文案保持不变。

## 2026-07-06 取消自动续费暂缓实现

**Why**: 站内取消自动续费已完成方案设计,但当前不进入 Pricing 实现。

**变更**:

- `feat.md`:取消自动续费入口改为后续方案,当前 Pricing 不展示取消按钮。
- `tech-pricing与自动续费.md`:标记取消接口、按钮位置和状态字段为暂缓设计。
- `tech-实现与配置.md`:标记接口依赖和前端结构为后续实现参考。

## 2026-07-05 取消自动续费设计

**Why**: Pricing 是当前订阅购买和账号状态展示入口,取消自动续费也应在同一页面闭环。

**变更**:

- `feat.md`:增加取消 Unlimited 自动续费用户流程、异常、埋点和验收标准。
- `tech-pricing与自动续费.md`:补充取消自动续费接口、渠道动作和前端状态展示。
- `tech-实现与配置.md`:补充 Pricing 取消入口和后端接口依赖。

**边界确认**:

- 取消后保留权益到 `expires_at`。
- 不做退款、立即降级和到期前恢复自动续费。
- 前端展示以订阅实例状态为准,不从当前商品配置推断是否仍会续费。

## 2026-06-30 有效订阅按钮软灰化

**Why**: 用户已有有效 Unlimited 时继续购买没有意义,还会在支付渠道侧产生多条自动续费记录。

**变更**:

- `feat.md`:已有有效 Unlimited 时不可重复购买,点击灰化按钮提示存在有效订阅。
- `tech-pricing与自动续费.md`:记录后端 `check_product` 拒绝重复订阅订单和前端软灰化按钮。
- `tech-实现与配置.md`:补充 Pricing 账户摘要驱动订阅按钮状态。

**边界确认**:

- 灰化按钮不使用原生 `disabled`,保留点击提示。
- Credits 购买不受订阅状态影响。
- 已过期订阅允许重新购买。

## 2026-06-30 账户订阅展示降级

**Why**: Pricing 账户区需要展示账号和 Credits,订阅配置异常不能让账户摘要整体失败。

**边界确认**:

- `/api/client/auth/me` 中订阅配置异常时返回 `subscription.status=unavailable`。
- Pricing 下单配置仍走完整支付配置校验,配置错误时不创建订单。

## 2026-06-29 按已合并源码修正订阅配置和履约口径

**Why**: 当前源码没有新增订阅协议状态列,订阅商品为 `free/unlimited`,商品语义由 metadata 表达。文档需要删除旧设计字段,回到已合并实现。

**变更**:

- `feat.md`:收口为 Pricing 购买、账户摘要和插件权益边界。
- `tech-pricing与自动续费.md`:改为当前实现说明,明确商品配置字段、metadata 语义、订单快照 `duration_days`、履约按 `product_class` 分发。

**边界确认**:

- 当前订阅商品为 `product_id=free, period=free` 和 `product_id=unlimited, period=month`。
- Free daily limit 5;Unlimited daily limit -1。
- `metadata.auto_renew` 表达商品支付方式。
- `user_subscriptions` 只用 `user_id/expires_at` 判权,Free 不落库。
- `orders.extra_metadata.product_snapshot.period` 只做配置快照校验;履约续期读取 `duration_days`。
- `/api/client/auth/me` 服务 website 账户摘要;`/api/client/subscription/status` 保持插件兼容。
- 配置 SQL 必须使用 `backend/src/app/init/sql_executor.py` 直接执行,不得新增迁移脚本。

## 2026-06-29 Pricing 顶部展示账户状态

**Why**: Pricing 页是购买入口,用户在购买前需要看到当前账号、剩余 Credits、当前订阅和订阅到期时间。

**边界确认**:

- 余额和订阅到期只用于展示,创建订单前仍以后端商品校验和订单快照为准。
- 未登录用户不请求 `auth/me`;Free 档说明来自公开 Pricing 配置。
- `subscription/status` 是插件端当前订阅权益与今日次数状态接口,支持匿名 device_id。
