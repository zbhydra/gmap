# 011 · Pricing 页与订阅配置

> 当前源码实现口径。覆盖 Pricing 页、订阅 checkout 配置、订单快照、支付成功履约。
> 实现状态:前端已提供 PayPal 与 Telegram Stars 自助取消指引;站内调用支付渠道取消自动续费仍为后续保留方案。

## 实现结论

- Credits 一次性购买走 `ProductClass.RECHARGE`,支付成功后发放 Credits。
- Unlimited 订阅走 `ProductClass.SUBSCRIPTION`,支付成功后续期 `user_subscriptions.expires_at`。
- 订阅商品当前为 `product_id=free, period=free` 与 `product_id=unlimited, period=month`。
- 商品是否自动续费只由 `metadata.auto_renew` 表达,不是独立列。
- 下单把当前商品的 `metadata.auto_renew` 传给支付 Provider:`true` 创建渠道订阅,`false` 创建一次性支付。
- `user_subscriptions` 当前用 `user_id/expires_at` 判权;取消自动续费所需渠道订阅引用为后续方案,Free 不落库。
- 后续实现取消自动续费时,不保存 `auto_renew_enabled`;本站展示状态由订阅实例 `billing_mode/cancelled_at` 计算,不得从当前商品 metadata 推断。
- 订阅订单快照写入 `orders.extra_metadata.product_snapshot.period` 和 `duration_days`,履约续期只依赖 `duration_days`。
- 已有未过期 Unlimited 时,前端灰化订阅购买按钮并提示不可重复购买;后端 `subscription_service.check_product` 拒绝普通重复下单,不为极少数并发或跨渠道重复支付增加锁和协议状态机。
- 有效且自动续费的订阅在 Pricing 账号状态区展示取消入口,弹窗引导用户到 PayPal 或 Telegram Stars 自助取消。
- 当前取消指引不调用后端接口,不修改订阅状态或 `expires_at`。
- 履约层仍保留续期能力,用于正常首期支付、续费回调、补偿或历史订单。
- `/api/client/auth/me` 返回 website 需要的用户信息、Credits、订阅状态/过期时间。
- `/api/client/subscription/status` 保持插件兼容。
- 数据库配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL,不得新增迁移脚本。

## 后端接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/auth/me` | 已登录用户摘要:用户信息、Credits、订阅状态/过期时间 |
| `GET /api/client/credit/checkout-configs` | Credits 一次性购买套餐 |
| `GET /api/client/subscription/checkout-configs` | Free/Unlimited 订阅商品配置、好评赠送活动开关与永久领取次数 |
| `POST /api/client/subscription/review-reward/claim` | 领取一次 7 天好评赠送订阅;活动关闭时拒绝领取 |
| `POST /api/client/subscription/cancel-auto-renew` | 后续接口:取消当前用户 Unlimited 自动续费;当前暂不实现 |
| `POST /api/client/order/create` | Credits 和订阅统一创建订单 |
| `GET /api/client/order/status/{order_no}` | 支付后轮询订单状态 |

好评赠送不进入订单 checkout,详细合同见 `@tech-好评赠送.md` 与 `@../006.订阅系统/tech-好评赠送订阅.md`。

## 订阅商品配置

`config_subscription_product` 当前业务字段:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识;当前 `free` / `unlimited` |
| `name` | 商品名 |
| `period` | 订阅周期;当前 `free` / `month` |
| `duration_days` | 订阅天数;Free=0,Unlimited=30 |
| `display_currency` / `display_amount` | 用户可见展示价 |
| `enabled` | 是否启用 |
| `sort_order` | 排序 |
| `metadata` | JSON 扩展配置 |

当前约定:

| product_id | period | daily_limit | auto_renew |
| --- | --- | ---: | --- |
| `free` | `free` | 5 | false |
| `unlimited` | `month` | -1 | false |

Free 不配置付费渠道。Unlimited 渠道价在 `config_subscription_product_price` 中配置,下单时服务端按 `(product_id, channel_code)` 重新验价。Pricing 按 `product_id=unlimited` 选择商品,不重复限制配置中的周期、额度和续费方式。

## 下单与订单快照

Pricing 订阅下单调用:

```text
POST /api/client/order/create
```

订阅请求核心字段:

| 字段 | 说明 |
| --- | --- |
| `product_class` | 1,即 `SUBSCRIPTION` |
| `product_id` | `unlimited` |
| `payment_method` | 启用支付渠道 |
| `currency` / `amount` | checkout 配置返回的渠道价 |

`subscription_service.check_product` 先读取用户当前订阅状态。若同一产品线(006 产品线扩展:下单商品的 `product_line`)上 `user_subscriptions.expires_at` 仍未过期,返回 `INVALID_REQUEST` 和 `reason=active_subscription_exists`,不创建订单;不同产品线互不影响(插件 Unlimited 与 maps_extension 套餐可并存)。无有效订阅时继续读取当前订阅配置并验价,通过后创建订单。订单快照写入:

| 字段 | 说明 |
| --- | --- |
| `period` | 商品配置周期快照,只用于校验 Free/非法周期不能作为付费订阅发货 |
| `duration_days` | 商品配置天数,履约续期的唯一时长来源 |
| `metadata` | 商品 metadata |
| `provider_sku` | 渠道侧 SKU |

## 支付成功履约

支付 webhook 确认成功后进入统一订单成功流程:

```text
provider webhook -> order_service.order_success -> order_service.fulfill_paid_order
```

订单履约按 `order.product_class` 分发:

| product_class | 行为 |
| --- | --- |
| `RECHARGE` | 读取 Credits 快照并发放积分 |
| `SUBSCRIPTION` | 读取订阅快照 `duration_days`,续期 `user_subscriptions.expires_at` |

订阅续期规则:

- 新订阅:从当前时间加周期时长。
- 未过期记录:从当前 `expires_at` 继续加时。
- 已过期后订阅:从当前时间重新加时。
- `user_subscriptions` 当前保存 Unlimited 到期时间,不存在旧套餐降级分支;取消续费所需渠道引用为后续方案。
- 后续实现取消状态后,每一笔订阅付款成功都清空 `cancelled_at`;Telegram 收到 `is_recurring=true` 即执行,不区分首期与后续续费。

普通单窗口购买会被有效订阅检查拦截;上述未过期续期规则继续处理并发 checkout、自动续费回调、补偿任务或历史订单。

## 支付渠道自助取消指引

Pricing 使用 `/api/client/auth/me` 已有的 `subscription.expires_at` 与 `subscription.auto_renew` 判断入口状态:

1. `expires_at` 晚于当前时间且 `auto_renew=true` 时,在账号订阅行展示“取消”按钮。
2. 点击后打开原生 `dialog`,同时展示两条渠道路径:
   - Telegram Stars:`Telegram → Settings → Telegram Stars → My subscriptions`。
   - PayPal:`PayPal → Settings → Payments → Automatic payments → TG Downloader → Cancel`。
3. 弹窗支持关闭按钮、遮罩点击和 Escape,关闭后焦点回到“取消”按钮。
4. 打开或关闭弹窗都不调用 API,不更新本地订阅状态。

Free、已过期、一次性或非自动续费状态隐藏入口。当前 `auth/me` 不增加取消专用字段。

## 站内直接取消自动续费（暂不实现）

以下为后续保留方案,当前 Pricing 不调用该接口:

Pricing 调用:

```text
POST /api/client/subscription/cancel-auto-renew
```

后端流程:

1. 按登录用户读取 `user_subscriptions`。
2. 无未过期 Unlimited 时返回业务错误。
3. `cancelled_at` 不为空时幂等返回当前状态。
4. 缺少 `payment_method/channel_subscription_id`;Telegram Stars 缺少 `channel_uid` 时返回可恢复错误,不修改本地状态。
5. 按 `payment_method/channel_subscription_id/channel_uid` 调支付渠道取消。
6. 渠道成功或明确返回已经取消 / 非自动续费状态时写入 `cancelled_at=now,updated_at=now`。
7. 渠道订阅不存在、权限不足、参数非法、网络失败等不确定状态不更新本地,让用户重试或联系支持。

支付渠道取消动作:

| 渠道 | 动作 | 关键入参 |
| --- | --- | --- |
| `paypal` | PayPal Subscriptions API cancel | `channel_subscription_id` |
| `telegram_stars` | Telegram Bot API `editUserStarSubscription` | `channel_uid` + `channel_subscription_id` + `is_canceled=true` |

后续实现时,取消成功不创建订单、不退款、不改 `expires_at`。`auto_renew/cancel_at_period_end` 是展示字段,由 `billing_mode/cancelled_at/expires_at` 计算。`cancelled_at` 为空只表示本站尚未确认取消,不代表渠道实时状态。用户在支付平台后台取消但平台未通知本站时,页面仍可显示自动续费;下一次站内取消请求收到渠道“已取消”结果后写入 `cancelled_at`。

## 用户状态

`GET /api/client/auth/me` 返回 website Pricing 所需账户摘要:

| 字段 | 说明 |
| --- | --- |
| 用户基础信息 | `user_id/email/full_name/avatar_url/created_at` |
| `credits_balance` | Credits 余额 |
| `subscription` | 当前订阅状态、到期时间、额度对象;后续取消方案再额外返回 `billing_mode/auto_renew/cancel_at_period_end` |

`GET /api/client/subscription/status` 继续作为插件兼容接口,支持已登录用户和匿名设备。

订阅商品配置异常时,账户摘要和订阅状态接口不返回错误;订阅对象返回 `status=unavailable`、`period=unavailable` 和 0 额度,只影响订阅展示。支付下单接口仍按配置错误失败,避免创建错误订单。

## 前端订阅购买状态

Pricing 读取 `/api/client/auth/me` 的 `subscription.expires_at` 判断当前账户是否已有有效 Unlimited:

- 无有效订阅:订阅按钮保持可购买,点击后进入插件安装确认和公共 checkout。
- 有有效订阅:按钮使用软灰化样式,设置 `aria-disabled=true`,但不写原生 `disabled`,保证用户点击后能看到“已有有效订阅,不可重复购买”的提示。
- 有有效订阅且 `subscription.auto_renew=true`:在 Pricing 顶部账号订阅行展示“取消”按钮,点击后打开 PayPal 与 Telegram Stars 自助取消指引。
- Free、已过期、一次性或 `subscription.auto_renew=false`:隐藏取消入口。
- 后续实现取消自动续费时,有有效订阅且 `cancel_available=true`:在 Pricing 顶部账号状态区的订阅状态行右侧展示取消自动续费按钮;移动端放到同一状态块的到期时间下方。
- 后续实现取消自动续费时,有有效订阅且 `cancel_at_period_end=true`:隐藏取消按钮,展示到期停止续费状态。
- Credits 购买不受订阅状态影响。

后续实现取消自动续费时,取消按钮不放入 Unlimited 套餐卡片。套餐卡片继续只表达购买动作,账号状态区表达当前订阅管理动作。

## 配置上线

- 订阅商品和价格配置命令见 `@tech-实现与配置.md`。
- 配置修改只使用 `backend/src/app/init/sql_executor.py` 直接执行 SQL。
- 不新增迁移脚本承载商品配置。
- 配置更新后支付配置缓存最多 3 分钟生效。
