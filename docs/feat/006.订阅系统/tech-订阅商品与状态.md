# 006 · 订阅商品与状态

> 当前源码实现口径。覆盖订阅商品配置、用户订阅状态、订单履约续期。
> 实现状态:站内取消自动续费暂不实现;相关字段、接口和履约补充为后续保留方案。
> 关联:`@tech-额度与速率档位.md` `@../011.Pricing页/tech-pricing与自动续费.md` `@../011.Pricing页/tech-实现与配置.md`

## 当前订阅档位

| product_id | period | 名称 | duration_days | extension 权益 |
| --- | --- | --- | ---: | --- |
| `free` | `free` | Free | 0 | 5 次/天 |
| `unlimited` | `month` | Unlimited | 30 | 不限次数 |

`product_id` 是 SKU,不要求等于 `period`。当前付费 Unlimited 配置为 `period=month`,但用户权益表只写 Unlimited 到期时间。

## 配置表

订阅商品配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL 修改,不得新增迁移脚本。配置命令见 `@../011.Pricing页/tech-实现与配置.md`。

### config_subscription_product

当前业务字段只有:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识,当前 `free` / `unlimited` |
| `name` | 商品展示名 |
| `period` | 订阅周期,当前 `free` / `month` |
| `duration_days` | 订阅天数,Free=0,Unlimited=30 |
| `display_currency` | 展示币种 |
| `display_amount` | 展示金额,统一 6 位精度整数 |
| `enabled` | 是否启用 |
| `sort_order` | 排序值 |
| `metadata` | JSON 扩展配置 |

支付方式由 `metadata.auto_renew` 决定,不是独立列。

### config_subscription_product_price

订阅商品渠道价按 `(product_id, channel_code)` 唯一:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识 |
| `channel_code` | 支付渠道 |
| `currency` | 币种 |
| `amount` | 渠道金额,统一 6 位精度整数 |
| `provider_sku` | 渠道侧商品或价格标识 |
| `enabled` | 是否启用 |

### metadata

`SubscriptionProductMetadata` 当前有效字段:

| 字段 | 说明 |
| --- | --- |
| `daily_limit` | 插件每日下载额度;Free=5,Unlimited=-1 |
| `extension_daily_download_limit` | 插件每日下载额度兼容字段 |
| `auto_renew` | 是否自动续费商品 |
| `proxy_user_rate_limit_mb_per_second` | 展示字段,当前实际限速不读它 |

Free 档允许 metadata 为空,服务端补 `daily_limit=5,auto_renew=false`。付费商品直接使用 metadata 中通过类型和范围校验的值,不根据 `product_id` 锁死额度或计费方式。

## 用户订阅状态

`user_subscriptions` 当前只保存用户当前 Unlimited 到期时间;Free 不落库。站内取消自动续费暂不实现,下表中的渠道订阅引用和取消状态字段为后续保留方案:

| 字段 | 说明 |
| --- | --- |
| `user_id` | 用户 ID,主键 |
| `expires_at` | Unlimited 到期时间,毫秒时间戳 |
| `payment_method` | 后续字段:最近一次生效订阅的支付渠道;当前 `paypal` / `telegram_stars` |
| `channel_subscription_id` | 后续字段:渠道侧取消句柄;PayPal 为 Billing Subscription id,Telegram Stars 为待 Test DC 实测确认期次的 `telegram_payment_charge_id` |
| `channel_uid` | 后续字段:渠道侧付款用户 ID;PayPal 可为空,Telegram Stars 为付款 Telegram user id |
| `billing_mode` | 后续字段:当前订阅实例的购买模式快照;当前 `auto_renew` |
| `cancelled_at` | 后续字段:本站最近一次确认渠道已取消自动续费的时间,毫秒时间戳;最近一次订阅付款成功后清空 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

无有效记录或 `expires_at` 已过期时服务层返回 Free。存在未过期记录时按当前 `unlimited` 配置映射权益。`period` 只存在于 `config_subscription_product` 和接口兼容响应,不再存在于 `user_subscriptions`。

后续实现站内取消自动续费时,不能用当前商品 metadata 判断用户订阅实例的购买方式。商品配置会变,用户订阅实例只保存购买时的计费模式、渠道取消句柄和本站最后确认的取消时间,不保存渠道实时协议状态:

| 语义 | 计算口径 |
| --- | --- |
| 当前是否有效 Unlimited | `expires_at > now` |
| 当前订阅实例是否自动续费类型 | `billing_mode = "auto_renew"` |
| 本站是否展示为自动续费 | 有效 Unlimited 且 `billing_mode="auto_renew"` 且 `cancelled_at` 为空 |
| 当前是否可站内取消 | 本站展示为自动续费且 `payment_method/channel_subscription_id` 存在;Telegram Stars 还要求 `channel_uid` 存在 |
| 本站是否已确认取消 | 有效 Unlimited 且 `billing_mode="auto_renew"` 且 `cancelled_at` 不为空 |

后续实现时,`auto_renew` 在商品配置里表示该商品当前售卖形态;在用户订阅状态响应里只表示本站是否在最近一次订阅付款后确认过取消。状态响应不得从当前商品 metadata 推断,应由 `billing_mode` 和 `cancelled_at` 计算。本站确认取消后返回 `auto_renew=false,cancel_at_period_end=true`,但 `expires_at` 和 Unlimited 权益不变。

`cancelled_at` 不是渠道实时状态。它为空只表示本站在最近一次订阅付款后没有确认取消,不保证渠道仍会继续扣款。用户在 PayPal / Telegram 后台取消时,渠道可能不通知本站,页面可以继续展示自动续费和取消按钮;用户再次点击站内取消后,渠道明确返回取消成功、已经取消或非续费状态时写入 `cancelled_at=now` 即可。

后续实现时,`cancel_at_period_end` 是响应字段,由 `billing_mode/cancelled_at/expires_at` 计算,不是数据库列。`/api/client/auth/me` 与 `/api/client/subscription/status` 的订阅对象额外返回 `billing_mode/auto_renew/cancel_at_period_end/cancelled_at/cancel_available/payment_method`;旧插件可忽略新增字段。

## 订单履约

订阅购买统一走 `orders`。

订阅订单创建时在 `orders.extra_metadata.product_snapshot` 保存快照:

| 字段 | 说明 |
| --- | --- |
| `period` | 商品配置周期快照,只用于校验 Free/非法周期不能作为付费订阅发货 |
| `duration_days` | 商品配置天数,履约续期的唯一时长来源 |
| `metadata` | 商品 metadata |
| `provider_sku` | 渠道侧 SKU |
| `billing_mode` | 后续取消方案字段:购买时的计费模式快照;当前为 `auto_renew`,后续不受商品配置变更影响 |

支付成功 webhook 进入统一订单成功流程后,订单系统按 `order.product_class` 分发:

| product_class | 行为 |
| --- | --- |
| `RECHARGE` | 发放 Credits |
| `SUBSCRIPTION` | 读取快照 `duration_days`,续期 `user_subscriptions.expires_at`;后续取消方案恢复时再写入本次渠道订阅引用 |

后续实现站内取消自动续费时,订阅履约写入渠道引用:

| 支付渠道 | `channel_subscription_id` 来源 | `channel_uid` 来源 |
| --- | --- | --- |
| `paypal` | 首期订单 `payment_channel_order_no` 或 `payment_data.paypal_subscription_id`;续费订单沿用首期订阅 ID | 可为空 |
| `telegram_stars` | `successful_payment.telegram_payment_charge_id`;保存首期还是最新续费 ID 待 Test DC A/B 实测 | `successful_payment.from.id` |

后续实现站内取消自动续费时,首期订阅付款成功应写入 `billing_mode=auto_renew,cancelled_at=null`;后续每一笔订阅付款成功也清空 `cancelled_at`。Telegram 只要收到 `is_recurring=true` 的成功付款就清空,不区分首期的 `is_first_recurring=true` 与后续续费。

Telegram Bot API 的 `editUserStarSubscription` 只要求“订阅的 `telegram_payment_charge_id`”,没有说明必须使用首期、最新续费或任意一期 ID。公开资料也没有包含同一订阅两期付款和取消响应的可复核实测。订单系统已支持 Test DC 的 60 秒订阅;完成首期 ID / 最新 ID A/B 取消实验前,本域不固定 `channel_subscription_id` 的写入期次。实验步骤见 `@../004.订单系统/tech-支付与履约.md` 第 11.4 节。

订阅订单创建前会读取当前用户订阅状态;存在未过期 `expires_at` 时直接拒绝创建新的订阅订单,减少普通重复购买。已过期订阅会按 Free 处理,允许重新下单。该检查不加并发锁,也不保证用户不会分别确认两次跨渠道支付;极少数重复订阅由支持处理。

订单履约仍保留续期语义:新订阅从当前时间加周期时长;未过期记录从当前 `expires_at` 后加;已过期从当前时间重新加。普通单窗口购买会被有效订阅检查拦截;并发 checkout、支付回调、补偿或历史订单仍可能对未过期记录续期。

## 接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/subscription/checkout-configs` | 返回启用订阅商品、渠道价格和好评赠送永久领取次数 |
| `GET /api/client/subscription/status` | 插件兼容订阅状态接口,支持匿名设备 |
| `POST /api/client/subscription/review-reward/claim` | 计划接口:登录账号领取一次 7 天好评赠送订阅 |
| `POST /api/client/subscription/cancel-auto-renew` | 后续接口:当前登录用户取消 Unlimited 自动续费;当前暂不实现 |
| `GET /api/client/auth/me` | website 已登录账户摘要,包含 Credits 和订阅状态 |

`/api/client/subscription/status` 保持给插件使用;website Pricing 读取 `/api/client/auth/me` 展示账户状态。

好评赠送的 Counter、锁、加时与失败语义见 `@tech-好评赠送订阅.md`。

订阅商品配置异常时,`/api/client/auth/me` 和 `/api/client/subscription/status` 仍返回成功响应;`subscription.status`/`data.status` 为 `unavailable`,`period` 为 `unavailable`,额度字段按 0 返回。该状态只表示订阅展示不可用,不能阻断登录态、Credits 或插件初始化等正常业务。

### 取消自动续费接口（暂不实现）

以下为后续保留方案,当前不实现该接口:

```text
POST /api/client/subscription/cancel-auto-renew
```

请求体为空,必须登录。响应 data:

| 字段 | 说明 |
| --- | --- |
| `status` | `active` 或 `unavailable` |
| `expires_at` | 当前 Unlimited 到期时间 |
| `auto_renew` | 取消成功后为 false |
| `cancel_at_period_end` | 取消成功后为 true |
| `cancelled_at` | 取消成功时间 |
| `cancel_available` | 当前账号是否可由站内发起取消自动续费 |
| `billing_mode` | 当前订阅实例的购买模式 |
| `payment_method` | 被取消的支付渠道 |

规则:

- 没有未过期 Unlimited 时返回业务错误,不创建订单。
- `cancelled_at` 不为空时幂等返回当前状态,不再调用渠道。
- 缺少 `payment_method/channel_subscription_id` 时返回可恢复错误,提示用户联系支持或到渠道侧取消;不修改本地状态。
- PayPal 调用 Subscriptions API cancel;Telegram Stars 调用 Bot API `editUserStarSubscription(is_canceled=true)`。
- 渠道返回成功或明确表示已经取消 / 非自动续费状态时,都按幂等成功处理,写本地 `cancelled_at=now`。
- 渠道返回订阅不存在、权限不足、参数非法、网络失败等不确定状态时,不修改本地状态,让用户重试或联系支持。

### 订单自动续费人工运维脚本

客户端取消接口仍不开放。支持人员可在 `backend/` 目录按本地订单号执行两个独立脚本:

```text
uv run python scripts/query_order_auto_renew.py [order_no]
uv run python scripts/cancel_order_auto_renew.py [--yes] [order_no]
```

规则:

- 省略 `order_no` 时由终端交互输入;取消脚本默认要求再次输入 `CANCEL`,`--yes` 只供明确的自动化操作使用。
- 脚本只接受订阅订单。一次性订阅订单返回非自动续费;充值等非订阅订单直接报错。
- PayPal 从首期 `payment_data` 或续费回调快照提取 Billing Subscription ID,通过 Subscriptions API 查询实时状态或取消。
- Telegram Stars 从订单成功回调保存的付款人 ID 与 `telegram_payment_charge_id` 发起取消。Bot API 没有按 charge ID 查询订阅状态的接口,查询结果明确返回 `QUERY_UNAVAILABLE`,不得用商品配置伪造实时状态。
- 取消只停止渠道后续扣款,不修改历史订单、不退款、不修改当前 `expires_at`,也不写入尚未实现的本地 `cancelled_at` 状态。
- 历史订单操作按渠道编码读取最新渠道凭据,不受渠道是否停止新销售影响;渠道配置被删除时直接报错。
