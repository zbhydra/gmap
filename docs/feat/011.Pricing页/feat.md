# 011 · Pricing 页

> 产品需求文档。描述 MapsGrab 官网 `/pricing` 页(现役 website/ 站点)卖什么、用户如何购买、权益边界、异常流程、UI 元素、埋点与验收。技术实现见 `@tech-实现与配置.md` 与 `@tech-pricing与自动续费.md`。
>
> 历史说明:本域文档原描述 TG 主站(已退役)的 Pricing 单页形态(账号→Credits→Unlimited)。2026-08-31 起以现役 MapsGrab 站三产品线 tab 页为唯一真相;TG 站时代的 Credits 积分包售卖与好评赠送页面流程已随旧站下线,对应技术文档(`@tech-好评赠送.md`)仅作历史参考,后端好评赠送合同见 `@../006.订阅系统/tech-好评赠送订阅.md`。

## 功能目标

Pricing 页按三条产品线分 tab 出售订阅套餐:

1. Online tab(`maps_online` 线):云端 Online Scraper 月度 records 套餐,4 个付费档 + Free 卡。
2. Extension tab(`maps_extension` 线):浏览器插件月度 records 套餐,2 个付费档 + Free 卡。
3. API tab(`maps_api` 线):Scraper API 月度 requests 套餐,4 个付费档 + Free 卡。

购买边界:全部商品均为 PayPal 支付;Online 与 API 各档为 30 天一次性支付(不自动续费),Extension 两档为按月订阅(auto_renew=true,可经渠道侧取消)。配额与权益语义归 `@../006.订阅系统/feat.md`,本页只负责展示与购买。

## 套餐定义(卡面展示事实,真实扣价以下单时支付配置为准)

| Tab | 档位 | SKU | 价格 | 额度 | 支付形态 |
| --- | --- | --- | --- | --- | --- |
| Online | Free | —(不可购买) | $0 | 1,000 records/月 | 默认档 |
| Online | Lite | `online_lite` | $19 | 20,000 records/月 | 一次性 · 30 天 |
| Online | Basic | `online_basic` | $49 | 80,000 records/月 | 一次性 · 30 天(本 tab Most Popular) |
| Online | Growth | `online_growth` | $99 | 250,000 records/月 | 一次性 · 30 天 |
| Online | Professional | `online_pro` | $149 | 500,000 records/月 | 一次性 · 30 天 |
| Extension | Free | —(不可购买) | $0 | 1,000 records/月 | 默认档 |
| Extension | Pro | `maps_extension_pro` | $39 | 100,000 records/月 | 按月订阅(本 tab Most Popular) |
| Extension | Business | `maps_extension_business` | $99 | 500,000 records/月 | 按月订阅 |
| API | Free | —(不可购买) | $0 | 20 requests/月 | 默认档 |
| API | Basic | `api_basic` | $15 | 1,000 requests/月 | 一次性 · 30 天 |
| API | Professional | `api_professional` | $65 | 5,000 requests/月 | 一次性 · 30 天(本 tab Most Popular) |
| API | Business | `api_business` | $115 | 10,000 requests/月 | 一次性 · 30 天 |
| API | Scale | `api_scale` | $365 | 50,000 requests/月 | 一次性 · 30 天 |

Free 档口径(online/api 各 tab 卡面展示)已随各线 free 档位落库,暂无消费方、待云端额度基建接线后生效(见 006 域)。

## 功能范围

### 包含

- 三产品线 tab 切换;tab 是页面唯一状态源,账号区摘要与按钮灰化均随当前 tab 刷新。
- 各 tab 静态渲染档位卡(SSR),付费卡购买按钮加载支付配置后启用。
- 账号区:登录/注册弹窗、账号胶囊(邮箱、头像、当前 tab 产品线的套餐名与到期时间)、退出登录。
- 未登录点击购买先登录,登录成功后继续购买。
- 同产品线已有未过期订阅时购买按钮软灰化,点击提示须等当前档到期;不同产品线互不影响,可同时持有。
- 有效且自动续费的订阅(仅 Extension 两档可能满足)在账号区展示"How to cancel"入口,弹窗展示 PayPal 自助取消三步路径;不调用取消接口、不修改订阅状态。
- 统一订单 checkout 弹窗完成选渠道、创建订单、跳转 PayPal 与支付结果处理。
- PayPal 回跳页(success/cancel)按订单 `product_class` 分发订阅/Credits 文案。
- 插件升级入口(`utm_source=extension`)只做归因标记(购买按钮 GA4 source),不切换页面布局。
- 价格、渠道、额度数字全部来自后端配置;卡面文案为营销展示事实。

### 不包含

- 不做 Credits 积分包售卖与展示(website 下载计费归 `@../003.积分系统/feat.md`;TG 站时代的积分包卡片已随旧站下线)。
- 不做好评赠送入口与倒计时流程(后端合同保留在 checkout-configs 响应中但页面不消费;合同见 `@../006.订阅系统/tech-好评赠送订阅.md`)。
- 不做站内直接取消自动续费;用户按指引到 PayPal 侧取消。
- 不做退款、优惠码、年付、多席位、地区差异定价。
- 不做 Telegram Stars 渠道(当前页面上线渠道仅 PayPal)。
- 不承载插件端购买 UI;插件只跳转本页。

## 用户流程

### 浏览与选择

1. 页面默认展示 Online tab;点击 tab 切换产品线面板。
2. 每个面板展示:线说明、档位卡(名称/标语/价格/额度/功能列表/CTA)、额度口径注记(records 或 requests 的计量与每月 1 日重置、不滚存说明)。
3. Free 卡 CTA 为引导动作(Online/API「Start free」、Extension「Install the extension」),不进入购买。

### 购买付费档

1. 用户点击付费卡购买按钮;按钮未加载配置或该商品无可用渠道时置灰并提示。
2. 该产品线已有未过期订阅时:当前档卡片标记"当前套餐"且购买按钮灰化;更高档卡片按钮变为升级入口(见「升级订阅」),更低档卡片保持灰化(降级不做)。
3. 无有效订阅时未登录先打开登录弹窗,成功后继续。
4. 上报 `upgrade_cta_click`(plan 维度 = SKU),打开统一 checkout 弹窗确认价格与渠道后跳 PayPal。
5. 支付成功回跳/轮询确认后,页面刷新账号区套餐摘要并刷新各卡按钮态。
6. 价格在下单时被后台调整时,弹窗提示价格更新并重载支付配置。

### 升级订阅

1. 当前线有有效订阅时,更高档卡片 CTA 显示"升级"与补差金额(如 `Upgrade · $78.20`),金额来自后端实时报价(按旧档剩余时间折算,到期日不变)。
2. 点击升级:未登录先登录;报价显示不可升级(已是最高档/补差不为正)时按钮灰化并展示原因文案。
3. 一次性支付线(Online / API):打开统一 checkout 弹窗,金额为补差金额、渠道为 PayPal / ClinkBill;支付成功轮询确认后,当前档标记切到新档,额度上限按新档展示。
4. 自动续费线(Maps Pro / Business):打开升级确认弹窗,明确展示补差估算与"将立即按此金额扣款";确认后由后端在原订阅协议内换价并直接扣款,不跳转收银台;成功后刷新账号区与按钮态。
5. 报价金额与实际扣款不一致时以后端/渠道为准;失败时保留原档位并提示重试。

### 取消自动续费(仅 Extension 订阅)

1. 当前 tab 为 Extension 且账号在该线有有效、自动续费的订阅时,账号区显示"How to cancel"。
2. 点击打开信息弹窗,展示 PayPal 三步路径(Settings → Payments → Automatic Payments → 选择 MapsGrab → Cancel)。
3. 关闭弹窗不视为取消成功,不修改订阅状态与到期时间。

### PayPal 回跳

- 支付成功落地 `paypal/success`,按订单 `product_class` 分发文案(订阅类展示订阅生效口径,Credits 类展示到账口径);取消落地 `paypal/cancel` 展示未完成口径。

## 异常流程

- 支付配置加载失败:展示重试提示,付费卡按钮不可用。
- 商品或渠道被后台下架:下单前重新校验;商品存在但无渠道时在卡内提示无可用支付方式。
- 支付失败/取消:不生效订阅,允许重试。
- 同线重复购买:前端软灰化 + 提示;后端下单校验同样拒绝,两道口径一致;更高档走升级流程。
- 升级报价失败:升级按钮灰化并提示重试,不影响普通购买。
- 升级支付失败/渠道换价失败:保持原档位不变,提示重试或到期换档;不产生半升级状态。
- 升级确认弹窗与页面离开:关闭弹窗不产生任何扣款或状态变更。
- 用户在两个未完成的 checkout 分别确认付款:不做并发锁;两笔均成功按正常订单履约,极少数重复订阅由支持处理。
- 账号摘要加载失败:展示错误与登录入口重试;不影响档位卡展示。
- checkout 中鉴权失效:清空本地登录态,重新打开登录弹窗。
- webhook 重复到达:不重复履约(订单系统口径)。
- 履约失败:按统一 checkout 弹窗的失败口径展示,保留订单号。

## 非功能性需求

- 不新增依赖注入;文案全部 i18n(en-US 基线)。
- 商品价格、权益、渠道价都来自后端配置;页面不写死扣价。
- 订阅配置修改必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL 或幂等播种脚本,不得新增迁移脚本。
- 支付密钥不出现在前端、日志、启动参数。
- 不做金融级系统;允许局部失败,用户可重试。

## 用户操作逻辑与 UI 元素

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 产品线 tab | 三个 tab 按钮(role=tablist) | 是 | 切换面板;账号区与按钮态随当前线刷新 |
| 档位卡 | 每线一组静态卡(SSR),含 Most Popular 徽标 | 卡内按钮可点 | 见购买流程;Free 卡按钮为引导链接 |
| 账号胶囊(未登录) | 登录按钮 | 是 | 打开登录/注册弹窗 |
| 账号胶囊(已登录) | 头像 + 邮箱 + 当前线套餐名/到期 | 是 | 展开账号菜单(退出登录) |
| How to cancel | 账号区按钮,条件显示 | 是 | 打开 PayPal 取消指引弹窗 |
| 取消指引弹窗 | 原生 dialog,PayPal 三步路径 | 关闭可点 | 关闭不产生任何状态变更 |
| 额度口径注记 | 面板底部文本 | 否 | 说明计量单位与每月重置口径 |
| FAQ | 折叠问答列表 | 是 | 展开查看计费基础问题 |
| checkout 弹窗 | 统一 OrderCheckout 弹窗 | 是 | 选渠道、确认、跳 PayPal、展示结果;升级差额单复用同一弹窗 |
| 升级按钮 | 更高档卡片 CTA(有效订阅时替换购买态) | 是 | 展示补差金额;一次性线打开 checkout 弹窗,自动续费线打开升级确认弹窗 |
| 当前档标记 | 当前档卡片"Current Plan"徽标 | 否 | 当前档购买按钮灰化 |
| 升级确认弹窗 | 原生 dialog,展示补差估算与立即扣款提示 | 确认/关闭可点 | 确认后调后端协议换价;关闭不产生任何状态变更 |

## 数据埋点

| 事件 | 触发时机 | 关键字段 |
| --- | --- | --- |
| `upgrade_cta_click` | 点击付费档购买按钮(打开 checkout 前) | `source`(pricing / extension)、`location=plan_card`、`plan`(=SKU) |
| `upgrade_quote_shown` | 有效订阅时更高档卡片展示补差金额 | `current_plan`、`target_plan`、`amount` |
| `upgrade_confirmed` | 升级确认成功(一次性线支付成功/订阅线换价成功) | `current_plan`、`target_plan`、`payment_method`、`amount` |
| 其他 data-cta 点击 | 页面各引导入口,经全站 GA4 cta_click 通道 | `data-cta` 归因属性 |

`plan` 维度取值为商品 SKU;当前可购买付费 SKU 共 10 个:`online_lite` / `online_basic` / `online_growth` / `online_pro`、`maps_extension_pro` / `maps_extension_business`、`api_basic` / `api_professional` / `api_business` / `api_scale`。Free 卡不可购买、不计入。

## 验收标准

- 页面渲染 Online / Extension / API 三个 tab,默认 Online;各 tab 档位卡数量与「套餐定义」表一致(5/3/5 张,含 Free 卡)。
- 卡面价格与额度与后端配置一致;Online/API 卡面如实标注 one-time · 30 days,Extension 两档为按月口径。
- Free 卡不产生购买请求;CTA 为引导动作。
- 未登录点击购买先登录;登录成功后重新加载配置与账号摘要。
- 同产品线有效订阅时按钮软灰化,点击提示;跨产品线购买不受影响。
- Online/API 档走 PayPal 一次性支付;Extension 档可经 PayPal 订阅支付。
- 仅当前 tab 产品线的有效自动续费订阅显示取消指引;弹窗只展示路径,不改状态。
- PayPal 回跳页按订单 product_class 正确分发文案。
- 支付成功后账号区套餐摘要与按钮态刷新。
- `upgrade_cta_click` 的 `plan` 字段等于所点卡片 SKU。

## 关联文档

- 订阅商品配置与状态:`@../006.订阅系统/tech-订阅商品与状态.md`
- 订单与支付履约:`@../004.订单系统/feat.md`
- 实现与配置:`@tech-实现与配置.md`
- 自动续费与取消指引(Extension 线,含旧站历史口径):`@tech-pricing与自动续费.md`
