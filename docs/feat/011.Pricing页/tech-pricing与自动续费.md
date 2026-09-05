# 011 · Pricing 页与订阅配置

> 当前源码实现口径。本文是 Pricing 页消费合同的唯一 owner:checkout 配置消费、下单请求、订单轮询、支付回跳与渠道管理入口都在这里;`tech-实现与配置.md` 只负责前端文件责任与商品配置命令。
> 订阅商品、状态与订单履约的唯一合同在 `@../006.订阅系统/tech-订阅商品与状态.md` 与 `@../004.订单系统/tech-ClinkBill支付.md`、`@../004.订单系统/tech-支付与履约.md`;升级接口与业务规则见 `@../006.订阅系统/tech-订阅升级.md`,本文只定义网站消费方式。

## 实现结论

- 页面按三产品线 tab 展示(online / extension / api),档位卡 SSR 静态渲染;购买走全站统一 OrderCheckout 弹窗,不自建第二套支付弹窗。
- 入口查询参数 `product_line` 经 `pricing-page-controller.ts` 的 `PRICING_LINE_CONFIG` 映射到初始 tab,例如 `/pricing/?product_line=maps_extension`;缺省或未知值为 Online。正常 tab 切换保持内存状态,不改 URL。插件与网站共用这条购买、升级及管理路径。
- checkout 配置按商品单一计费模式消费:商品的 `auto_renew` 与 `period` 是商品级字段,支付选项文案据此展示 `Auto-renews until canceled` 或 `One-time payment`。
- 下单请求携带 `auto_renew + period`,与商品配置不一致时后端按价格已更新拒绝,页面重载配置。
- 支付渠道为 PayPal 与 ClinkBill;页面不实现 Telegram Stars 渠道。
- 已登录账号各产品线订阅摘要来自 `/api/client/auth/me` 的 `maps_online_subscription` / `maps_extension_subscription` / `maps_api_subscription`(六字段合同,见 006 状态 tech)。
- 有效自动续费订阅在账号区展示 `Manage subscription`,经 `POST /api/client/subscription/management` 打开渠道管理页(PayPal Automatic Payments / ClinkBill Customer Portal);URL 为空时展示渠道内操作指引弹窗。站内不做取消、退款或渠道状态同步。

## 后端接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/auth/me` | 已登录用户摘要:用户信息、Credits、各产品线订阅状态(六字段) |
| `GET /api/client/subscription/checkout-configs` | 全部启用订阅商品、商品级 `auto_renew`/`period`、渠道价(响应含好评赠送合同字段,页面不消费) |
| `POST /api/client/order/create` | 创建订阅订单(请求含 `auto_renew + period`) |
| `GET /api/client/order/status/{order_no}` | 支付后轮询订单状态 |
| `POST /api/client/order/cancel` | Clink cancel 回跳页把用户取消落到本地订单 |
| `POST /api/client/subscription/management` | 请求只含 `product_line`,返回当前线自动续费订阅的渠道管理 URL(可空) |

`/api/client/subscription/status` 继续保留给插件兼容,Pricing 不使用。`POST /api/client/subscription/review-reward/claim` 为 006 域合同(入口已下线),现役页面不调用。

## 下单请求

Pricing 订阅下单调用 `POST /api/client/order/create`,请求核心字段:

| 字段 | 来源 |
| --- | --- |
| `product_class` | 1,即 `SUBSCRIPTION` |
| `product_id` | 所点卡片的 SKU |
| `payment_method` | checkout 弹窗内选中的渠道(默认 PayPal) |
| `currency` / `amount` | 所选渠道价行,6 位精度 |
| `auto_renew` / `period` | 商品级单一计费模式字段,必须与商品配置一致 |

同产品线已有未过期订阅时,由服务端升级报价决定卡片状态,见下节;跨产品线购买互不影响。价格被后台调整时弹窗提示价格更新并重载配置。订单快照、履约双路径与渠道幂等合同见 006 状态 tech 与 004 支付履约 tech,本文不重复。

## 升级交互

- `pricing-page-controller.ts` 的 `loadUpgradeQuotes` 在登录与配置加载完成、登录成功及支付成功刷新后请求各卡报价。`current_product_id` 唯一决定 Current Plan;`available/reason` 决定升级按钮与禁用提示,不按卡片顺序、展示价或 `auth/me` 套餐名猜档位。
- `openUpgradeCheckout` 将报价金额、币种与当前订阅渠道交给公共 checkout,隐藏渠道选择,展示补差及到期日不变说明。当前订阅的 `auto_renew` 决定一次性差额订单或协议内确认。三个升级接口的字段与原因合同由 006 升级 tech 维护。
- 一次性差额订单继续由 `order-checkout-controller.ts` 创建、打开外部支付页并轮询订单;沿用 PayPal/Clink 既有回跳。后端重新计算补差,网站提交的升级请求只含产品线与目标档位。
- 自动续费确认统一消费 `status/action`。`succeeded` 展示成功;`failed` 展示失败;`requires_action` 复用 `pending_payment`,按 `wait` 等待或按 `redirect` 打开 HTTPS 地址,随后只轮询 quote。仅 `current_product_id === target_product_id` 结束等待,不重复 POST confirm、不以无档位 ID 的 `auth/me` 或 `subscription/status` 判定升级成功。
- 自动续费升级不产生订单,公共成功事件的 `orderNo/orderStatus` 为空;Pricing 沿用成功事件刷新 `auth/me` 与报价。关闭弹窗停止页面轮询,服务端渠道事件继续负责最终档位。
- PayPal 自动续费升级由服务端报价拒绝,页面展示渠道不可升级提示;一次性 PayPal 补差保留。升级交互与文案不按渠道写两份流程。
- `upgrade_quote_shown` 在当前 tab 的可升级卡片曝光时上报;`upgrade_confirmed` 在共享 checkout 确认履约或新档生效时上报,提交按钮点击不算成功。

验证入口为 `website/e2e/website.spec.ts` 的 `Pricing full purchase path`。route mock 证明网站交互与协议,不证明真实渠道扣款或 webhook;真实 SKU、公网 webhook 的验收归 004/006。

## 支付渠道与回跳

- 渠道展示名与图标:展示名读后端 `payment_method_name`;图标 PayPal / ClinkBill 走本地静态资源。
- 支付 URL 白名单:PayPal 只允许 HTTPS `paypal.com`(含子域),Clink 只允许 HTTPS `uat-checkout.clinkbill.com` / `checkout.clinkbill.com`;其余一律拒绝并在弹窗内提示。
- 用户确认后新标签页打开 Hosted Checkout,原页按 2 秒间隔轮询本地订单状态,直到已支付且履约成功;BroadcastChannel/postMessage 同源通知可加速轮询,但不替代轮询。
- PayPal 回跳页:`/paypal/success|cancel`;Clink 回跳页:`/clink/success|cancel`(noindex)。success 页轮询本地订单状态后确认,确认文案按订单 `product_class` 分发(订阅口径 / Credits 口径);cancel 页调用 `/api/client/order/cancel` 落取消状态。两个渠道共用同一个 payment return 脚本(`credit-purchase/paypal-return.ts`),文案经页内 data 钩子注入。

## 渠道管理入口(Manage subscription)

- 展示条件:当前 tab 产品线的 `auth/me` 订阅对象 `status=active`、`expires_at` 未过期且 `auto_renew=true`。
- 点击行为:同步预开空白新标签页(用户手势内,防 popup 拦截),再 `POST /api/client/subscription/management`(`product_line` 为当前线);返回 URL 时新标签页导航到渠道管理页,URL 为空时关闭空白页并弹出渠道内操作指引弹窗(PayPal Automatic Payments 三步 / ClinkBill Customer Portal 三步)。
- 页面只打开渠道入口,不调用取消接口、不修改订阅状态或到期时间;渠道侧状态允许滞后于本站展示。

## 用户状态

`GET /api/client/auth/me` 返回 website Pricing 所需账户摘要:用户基础信息、`credits_balance` 与各产品线订阅对象(六字段合同)。订阅商品配置异常时账户摘要不报错,对应线订阅对象返回 `status=unavailable`、`period=unavailable`;支付下单接口仍按配置错误失败,避免创建错误订单。

## 配置上线

- 订阅商品与渠道价的配置方式、播种脚本与修改命令见 `@tech-实现与配置.md`;商品档位表与字段口径见 `@../006.订阅系统/tech-订阅商品与状态.md`。
- 后端支付配置有缓存:配置更新后最多约 3 分钟在页面上生效,期间新下单仍按旧配置验价并按价格已更新拒绝。
