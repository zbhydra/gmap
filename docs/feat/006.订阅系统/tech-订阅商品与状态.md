# 006 · 订阅商品与状态

> 当前源码实现口径。覆盖订阅商品配置、用户订阅状态、订单履约续期。
> 实现状态:站内取消自动续费暂不实现;相关字段、接口和履约补充为后续保留方案。
> 产品线扩展(2026-08-31,C2 裁决落地):订阅按产品线隔离——`extension`(插件下载 Unlimited)、`maps`(MapsGrab 插件月度 records 套餐)、`maps_online`(云端 Online Scraper 月度 records 套餐)与 `maps_api`(Scraper API 月度 requests 套餐);同一账号可同时持有不同产品线的有效订阅。
> 关联:`@tech-额度与速率档位.md` `@../011.Pricing页/tech-pricing与自动续费.md` `@../011.Pricing页/tech-实现与配置.md`

## 当前订阅档位

| product_id | product_line | period | 名称 | duration_days | 权益 |
| --- | --- | --- | --- | ---: | --- |
| `free` | `extension` | `free` | Free | 0 | 插件下载 5 次/天 |
| `unlimited` | `extension` | `month` | Unlimited | 30 | 插件下载不限次数 |
| `maps_pro` | `maps` | `month` | Maps Pro | 30 | 100,000 records/月 |
| `maps_business` | `maps` | `month` | Maps Business | 30 | 500,000 records/月 |
| `online_lite` | `maps_online` | `month` | Online Lite | 30 | 20,000 records/月 |
| `online_basic` | `maps_online` | `month` | Online Basic | 30 | 80,000 records/月 |
| `online_growth` | `maps_online` | `month` | Online Growth | 30 | 250,000 records/月 |
| `online_pro` | `maps_online` | `month` | Online Pro | 30 | 500,000 records/月 |
| `api_basic` | `maps_api` | `month` | API Basic | 30 | 1,000 requests/月 |
| `api_professional` | `maps_api` | `month` | API Professional | 30 | 5,000 requests/月 |
| `api_business` | `maps_api` | `month` | API Business | 30 | 10,000 requests/月 |
| `api_scale` | `maps_api` | `month` | API Scale | 30 | 50,000 requests/月 |

`product_id` 是 SKU,不要求等于 `period`。产品线内重复购买校验按 `product_line` 隔离:同产品线存在未过期订阅时拒绝新下单,不同产品线互不影响(含 `maps_online`/`maps_api` 新线)。月度额度在 metadata `monthly_quota`(正整数,语义为月度额度数,单位由产品线定义:`maps`/`maps_online` 为 records,`maps_api` 为 requests),购买成功后对应线配额总量从免费档切到所购档位,到期自动回退(见 `@tech-额度与速率档位.md` 与 `app/services/maps_usage_service.py`)。`maps_online`/`maps_api` 两线 8 档全部 `auto_renew=false`,当前以 PayPal 一次性支付购买(占位期决策,额度消费方待 014 云端落地后接入)。

## 配置表

订阅商品配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL 修改,不得新增迁移脚本。配置命令见 `@../011.Pricing页/tech-实现与配置.md`。

### config_subscription_product

当前业务字段只有:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识,当前 `free` / `unlimited` / `maps_pro` / `maps_business` 及 `maps_online`、`maps_api` 两线 8 档(见「当前订阅档位」表) |
| `product_line` | 产品线标识: `extension` / `maps` / `maps_online` / `maps_api`;历史行缺省回退 `extension` |
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
| `monthly_quota` | 月度额度数(正整数);单位由产品线定义——`maps`/`maps_online` 为 records,`maps_api` 为 requests;仅这两类产品线配置,extension 线留空 |
| `proxy_user_rate_limit_mb_per_second` | 展示字段,当前实际限速不读它 |

Free 档允许 metadata 为空,服务端补 `daily_limit=5,auto_renew=false`。付费商品直接使用 metadata 中通过类型和范围校验的值,不根据 `product_id` 锁死额度或计费方式。

## 用户订阅状态

`user_subscriptions` 按**复合主键 `(user_id, product_line)`** 一行保存用户在一条产品线上的当前付费订阅;Free 不落库。行内 `product_id` 记录购买/续期时的档位 SKU(同产品线多档位时唯一能说明当前权益的字段,履约续期时刷新)。站内取消自动续费暂不实现,下表中的渠道订阅引用和取消状态字段为后续保留方案:

| 字段 | 说明 |
| --- | --- |
| `user_id` | 用户 ID,复合主键之一 |
| `product_line` | 产品线标识,复合主键之一;`extension` / `maps` / `maps_online` / `maps_api` |
| `product_id` | 当前生效档位 SKU;extension 线历史行缺省按 `unlimited` 回退 |
| `expires_at` | 订阅到期时间,毫秒时间戳 |
| `payment_method` | 后续字段:最近一次生效订阅的支付渠道;当前 `paypal` / `telegram_stars` |
| `channel_subscription_id` | 后续字段:渠道侧取消句柄;PayPal 为 Billing Subscription id,Telegram Stars 为待 Test DC 实测确认期次的 `telegram_payment_charge_id` |
| `channel_uid` | 后续字段:渠道侧付款用户 ID;PayPal 可为空,Telegram Stars 为付款 Telegram user id |
| `billing_mode` | 后续字段:当前订阅实例的购买模式快照;当前 `auto_renew` |
| `cancelled_at` | 后续字段:本站最近一次确认渠道已取消自动续费的时间,毫秒时间戳;最近一次订阅付款成功后清空 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

无有效记录或 `expires_at` 已过期时服务层返回该产品线的 Free。存在未过期记录时按行内 `product_id` 读取商品配置映射权益(extension 线历史行缺档位时回退 `unlimited`)。`period` 只存在于 `config_subscription_product` 和接口兼容响应,不存在于 `user_subscriptions`。`/api/client/auth/me` 在旧字段 `subscription`(extension 线)之外新增 `maps_subscription`(maps 线)、`maps_online_subscription`(`maps_online` 线)与 `maps_api_subscription`(`maps_api` 线)三个同构状态对象,旧客户端忽略即可。

### 结构迁移与部署(产品线扩展,必读)

`user_subscriptions` 的 `product_line`/`product_id` 列与复合主键改造按以下顺序落库。**自研 `sync_database_schema.py` 只做列级 diff,不支持主键重定义**,所以第 2 步必须用 `sql_executor.py` 手工执行:

1. 先跑结构同步加列(两列 NOT NULL,存量行自动回填默认值 `extension` / `unlimited`):

```bash
cd backend
uv run python -m app.init.sync_database_schema --yes
```

2. 再用 `sql_executor.py` 把主键改为 `(user_id, product_line)`:

```bash
cd backend
uv run python src/app/init/sql_executor.py   --host "$DB_HOST" --port "${DB_PORT:-3306}" --user "$DB_USER"   --password "$DB_PASSWORD" --database "$DB_NAME"   --sql "ALTER TABLE user_subscriptions DROP PRIMARY KEY, ADD PRIMARY KEY (user_id, product_line)"
```

3. 播种订阅商品与渠道价(幂等 upsert 脚本,表驱动,可重复执行;覆盖 11 个付费 SKU:`unlimited`、`maps_pro`、`maps_business` 与 `maps_online`/`maps_api` 两线 8 档;`maps_online`/`maps_api` 新档 provider_sku 为占位 `{product_id}-paypal`,接入真实 PayPal 渠道前替换为渠道后台注册的商品 ID):

```bash
cd backend
uv run python scripts/seed_subscription_products.py
```

存量行回退行为:迁移前已存在的 Unlimited 权益行 `product_line` 自动落默认值 `extension`、`product_id` 落 `unlimited`,插件下载权益与状态接口行为完全不变。

**不迁移的后果**:主键仍是 `(user_id)` 时,履约 upsert 的 `ON DUPLICATE KEY` 仍按 user_id 命中——用户购买 Maps 套餐会**覆盖**其插件 Unlimited 行(或反向),跨产品线第二笔订单插入即主键冲突报错;表现为「付款成功后仍显示 Free/另一产品线权益被顶掉」,属资损级缺陷。列缺失则服务启动后所有订阅读写直接报错。

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

订阅订单创建时快照新增 `product_line`(下单时商品配置的产品线),履约按快照把权益写入 `(user_id, product_line)` 行并刷新行内 `product_id`;历史订单快照缺 `product_line` 时回退 `extension`(行为不变)。`GET /api/client/order/status/{order_no}` 响应新增 `product_line` 字段,供客户端按产品线区分展示语义(如 PayPal 回跳页的订阅/Credits 文案)。

支付成功 webhook 进入统一订单成功流程后,订单系统按 `order.product_class` 分发:

| product_class | 行为 |
| --- | --- |
| `RECHARGE` | 发放 Credits |
| `SUBSCRIPTION` | 读取快照 `product_line` 与 `duration_days`,upsert 对应产品线行的 `expires_at`;后续取消方案恢复时再写入本次渠道订阅引用 |

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
