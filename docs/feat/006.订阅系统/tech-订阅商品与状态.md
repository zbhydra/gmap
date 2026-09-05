# 006 · 订阅商品与状态

> 当前源码实现口径。覆盖订阅商品配置、用户订阅状态、订单履约续期与渠道订阅管理。
> 已随「004 同步支付系统-计费模型与 ClinkBill」实施:商品单一计费模式 + 订阅实例账期(自然月/渠道归一)+ ClinkBill 渠道 + 渠道订阅管理入口。
> 订阅按 `product_kind` 隔离:`maps_extension`(Google Maps 与 Bing 插件共享)、`maps_online`(Online Scraper)与 `maps_api`(Scraper API)。同一账号可同时持有不同类别的有效订阅。
> 关联:`@../000.架构/tech-额度基建.md` `@../011.Pricing页/tech-pricing与自动续费.md` `@../011.Pricing页/tech-实现与配置.md`

## 周期与计费模式

- 周期枚举:`SubscriptionPeriodEnum = none | month | quarter | year`;free 档 `period='none'`(不是商品,不可下单)。
- **单一计费模式**:每个商品只有一种售卖形态,由商品列 `auto_renew` 表达(不再读 metadata);渠道价 `auto_renew_supported` 决定该渠道能否卖自动续费模式。
- 一次性支付按快照 `period` 的**自然月**续期(month=1/quarter=3/year=12,业务时区,缺日取月末),不再使用 `duration_days` 天数累加;好评赠送按天加时保留(`extend_subscription_days`)。
- 普通购买和续费只按 `expires_at` 判断账期;实例 `start_at` 只供升级折算。

## 当前订阅档位

| product_id | product_kind | period | auto_renew | 名称 | 权益 |
| --- | --- | --- | --- | --- | --- |
| `free` | `maps_extension` | `none` | false | Free | 1,000 records/月 |
| `free` | `maps_online` | `none` | false | Free | 1,000 records/月 |
| `free` | `maps_api` | `none` | false | Free | 20 requests/月 |
| `maps_extension_pro` | `maps_extension` | `month` | true | Maps Pro | 100,000 records/月 |
| `maps_extension_business` | `maps_extension` | `month` | true | Maps Business | 500,000 records/月 |
| `online_lite` | `maps_online` | `month` | false | Online Lite | 20,000 records/月 |
| `online_basic` | `maps_online` | `month` | false | Online Basic | 80,000 records/月 |
| `online_growth` | `maps_online` | `month` | false | Online Growth | 250,000 records/月 |
| `online_pro` | `maps_online` | `month` | false | Online Pro | 500,000 records/月 |
| `api_basic` | `maps_api` | `month` | false | API Basic | 1,000 requests/月 |
| `api_professional` | `maps_api` | `month` | false | API Professional | 5,000 requests/月 |
| `api_business` | `maps_api` | `month` | false | API Business | 10,000 requests/月 |
| `api_scale` | `maps_api` | `month` | false | API Scale | 50,000 requests/月 |

`product_id` 是 SKU,不要求等于 `period`。**SKU 唯一性合同**:付费 SKU 的 `product_id` 必须全线唯一(下单请求只携带 `product_id`,跨线重名会让下单反查无法确定目标,命中歧义按 `PAYMENT_GATEWAY_ERROR` 拒绝);`free` 是唯一允许各线同名的档位(不下单、无渠道价,无渠道价自然被验价拒绝)。每条产品线一套档位,配置读取按 `(product_kind, product_id)` 精确命中,free 查找返回本线 free 行。产品线内重复购买校验按 `product_kind` 隔离:同产品线存在未过期订阅时拒绝新下单,不同产品线互不影响。月度额度在 metadata `monthly_quota`(正整数,单位由产品线定义:`maps_extension`/`maps_online` 为 records,`maps_api` 为 requests),购买成功后对应线配额总量从免费档切到所购档位,到期自动回退。

## 配置表

订阅商品配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL 修改,不得新增迁移脚本;结构变更走 `sync_database_schema.py`。

### config_subscription_product

按**复合唯一键 `(product_kind, product_id)`** 约束。业务字段:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识(见「当前订阅档位」表) |
| `product_kind` | 必须显式指定 `maps_extension` / `maps_online` / `maps_api`,无默认类别 |
| `name` | 商品展示名 |
| `period` | 商业与权益周期:`none` / `month` / `quarter` / `year`;free 档为 `none` |
| `auto_renew` | 单一计费模式:当前商品是否由渠道自动续费 |
| `display_currency` / `display_amount` | 商品卡默认展示币种/金额(6 位精度整数) |
| `enabled` | 是否启用 |
| `display_order` | 展示排序值,仅展示用 |
| `tier_rank` | 业务档次,仅业务用(升级折算/档位比较),0=free,同线付费档递增 |
| `metadata` | JSON 扩展配置(`monthly_quota` 等) |

已删除列:`duration_days`(被自然月周期替代)、`sort_order`(改名 `display_order`);由模型 `schema_sync_drop_columns` 声明,`sync_database_schema` 负责删除。

### config_subscription_product_price

订阅商品渠道价按 `(product_id, channel_code)` 唯一:

| 字段 | 说明 |
| --- | --- |
| `product_id` | 商品标识 |
| `channel_code` | 支付渠道 |
| `auto_renew_supported` | 是否允许当前商品以渠道自动续费方式下单(商品 `auto_renew=true` 时渠道价必须为 true) |
| `currency` | 币种;须通过渠道币种合同(`payment_currency_matches_channel`) |
| `amount` | 渠道金额,统一 6 位精度整数 |
| `provider_sku` | 渠道侧标识:PayPal 自动续费为 Plan ID(`P-...`),Clink 自动续费为 `productId:priceId`;一次性支付可为空 |

价格行 `id` 即 `product_price_id`,随 checkout-configs 透出并冻结进订单快照。

### metadata

`SubscriptionProductMetadata` 当前有效字段只有 `monthly_quota`;`auto_renew` 已上移为商品列,不再从 metadata 读取。

## 用户订阅状态

`user_subscriptions` 按**复合主键 `(user_id, product_kind)`** 一行保存用户在一条产品线上的当前订阅实例;Free 不落库。行内 `product_id` 记录购买/续期时的档位 SKU(同产品线多档位时唯一能说明当前权益的字段,履约续期时刷新)。实例字段:

| 字段 | 说明 |
| --- | --- |
| `user_id` / `product_kind` | 复合主键 |
| `product_id` | 当前生效档位 SKU,无默认付费档 |
| `auto_renew` | 购买时续费方式快照;状态响应的 `auto_renew` 还要求 `expires_at > now` |
| `payment_method` | 最近一次生效订阅的支付渠道 |
| `channel_subscription_id` | 渠道侧订阅协议/取消句柄;PayPal 为 Billing Subscription id,Clink 为 subscriptionId,Telegram Stars 为 `telegram_payment_charge_id` |
| `channel_uid` | 渠道付款用户标识;Telegram Stars 为付款 user id,Clink 为 `customerId`(供 Customer Portal 复用) |
| `start_at` | 当前账期开始(毫秒时间戳),只供升级折算,不参与账期判断 |
| `expires_at` | 订阅到期时间,毫秒时间戳;唯一账期真相,upsert 时最后写入 |
| `created_at` / `updated_at` | 毫秒时间戳 |

不保留 `period/product_price_id/original_order_no/cancelled_at` 实例列:`period` 由当前商品配置提供,`product_price_id` 冻结在订单快照,自动续费本地首单号留在订单元数据,取消状态不落库(取消续费只打开渠道管理入口,不推测渠道实时状态)。

无有效记录或 `expires_at` 已过期时服务层返回该产品类别的 Free。存在未过期记录时按行内 `product_id` 读取商品配置映射权益,不补默认付费档。

### 订阅状态响应(六字段合同,唯一口径)

`GET /api/client/subscription/status` 必须显式传 query `product_kind`,合法值见本页开头。它与 `/api/client/auth/me` 的 `maps_extension_subscription` / `maps_online_subscription` / `maps_api_subscription` 复用同一份状态 data,固定以下六个字段:

| 字段 | 类型与取值 |
| --- | --- |
| `status` | `active` / `unavailable` |
| `period` | `free` / `month` / `quarter` / `year` / `unavailable` |
| `display_name` | 商品展示名 |
| `expires_at` | 毫秒时间戳;空表示无到期时间(即 Free) |
| `auto_renew` | 实例续费方式快照;有效自动续费订阅才为 true |
| `payment_method` | 最近一次生效订阅的支付渠道;无记录为空 |

- `period` 由当前商品配置提供;`expires_at` 为空时返回 `free`;`auto_renew / payment_method` 从订阅实例透出。
- 响应只表达档位与账期;采集额度归 `@../000.架构/tech-额度基建.md`。
- 插件端按六字段收窄解析(`period` 含 quarter/year、`auto_renew` 必填、透出 `payment_method/status`),响应允许多余字段,多余字段被客户端忽略。
- `/api/client/auth/me` 仅提供三个 Maps 订阅摘要,不提供旧 `subscription` 字段。客户端与后端同步使用新合同,无旧字段双读。

### 结构同步与商品初始化

`user_subscriptions`、`config_subscription_product`、`user_usage_logs` 的类别列由模型 `schema_sync_rename_columns` 声明原名,结构同步先原地改列名,再按 `schema_sync_rename_indexes` 改相关索引名。使用 MySQL 的 `RENAME COLUMN` / `RENAME INDEX`,保留行值与索引约束,不通过删列重建完成改名;语法见 [MySQL ALTER TABLE](https://dev.mysql.com/doc/refman/8.4/en/alter-table.html)。旧名仅用于迁移元数据,不用于运行时兼容读取。

在 `backend/` 执行 `uv run python -m app.init.sync_database_schema --yes`,再按需运行 `uv run python scripts/seed_subscription_products.py` 初始化三类 Maps 商品。seed 幂等 upsert,每类一条 Free、付费档定义见上表;不创建或删除旧 TG 商品。渠道价与自动续费 `provider_sku` 由运营配置,实际可售状态以 checkout 配置为准。

历史 TG 数据保留,但订阅配置读取边界只接收三类 Maps 商品。结构改名不改订单 JSON;有历史订单的环境需单独核对并按订单快照语义处理,不能补默认产品类别。本次本地迁移与数据核对证据见 [变更记录](changelog.md)。

## 订单履约

订阅购买统一走 `orders`。

订阅订单创建时在 `orders.extra_metadata.product_snapshot` 保存快照:

| 字段 | 说明 |
| --- | --- |
| `product_kind` | 订阅履约必须显式读取合法类别,定位 `(user_id, product_kind)` 行;缺失或非法时拒绝履约,不补默认类别 |
| `product_price_id` | 付款时渠道价行 ID；升级折算按订阅实例的商品与渠道读取当前价 |
| `auto_renew` | 购买时计费模式快照,决定履约走哪条路径 |
| `period` | 商品配置周期快照,决定一次性购买的自然月数,并校验非法周期不能发货 |
| `currency` / `amount` / `provider_sku` | 冻结该笔购买使用的渠道价资源 |

订阅履约按快照写入 `(user_id, product_kind)` 行：

| 路径 | 触发 | 行为 |
| --- | --- | --- |
| 一次性升级 | 快照 `purpose=upgrade` | 条件换档与账期保持见 [升级合同](tech-订阅升级.md#路径-a一次性线maps_online--maps_api差额订单走收银台) |
| 一次性 | 快照 `auto_renew=false` 且非升级 | 按快照 `period` 自然月续期(活动行从当前 `expires_at` 起算,否则从 now),显式覆盖实例事实(`auto_renew=false`、渠道引用清空),`start_at` 写入本次账期起点 |
| 自动续费 | 快照 `auto_renew=true` | 只按回调 `payment_callback.provider_subscription` 里 Provider 归一化的 `expires_at` 推进;`advances` 守卫(本地到期更晚不回退),实例字段按账期推进保护；仅首购单写档位，续费或折算发票只推进账期事实；账期推进时写入 `channel_subscription_id/channel_uid/start_at` |

| 支付渠道 | `channel_subscription_id` 来源 | `channel_uid` 来源 |
| --- | --- | --- |
| `paypal` | `PAYMENT.SALE.COMPLETED` 回调查询订阅状态后的 Subscription ID | payer id(可为空) |
| `clink` | `invoice.paid` 回调查询订阅后的 `subscriptionId` | 订阅查询返回的 `customerId` |
| `telegram_stars` | `successful_payment.telegram_payment_charge_id` | 付款 Telegram user id |

订阅订单创建前会读取当前用户订阅状态;存在未过期 `expires_at` 时拒绝普通重复购买，更高档升级走 [升级入口](tech-订阅升级.md#接口合同)。已过期订阅会按 Free 处理,允许重新下单。该检查不加并发锁,也不保证用户不会分别确认两次跨渠道支付;极少数重复订阅由支持处理。

好评赠送按天加时(`extend_subscription_days`)保留:活动行从当前 `expires_at` 累加并原样保留计费事实,非活动行从 now 起算并重置计费事实。

## 接口

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/subscription/checkout-configs` | 返回可售商品(`period ∈ month/quarter/year`)、当前计费模式与周期、默认展示价、可用渠道价格和好评赠送永久领取次数 |
| `GET /api/client/subscription/status?product_kind=maps_extension` | 订阅状态,支持匿名设备;query `product_kind` 必传,双插件均使用 `maps_extension` |
| `POST /api/client/subscription/review-reward/claim` | 计划接口:登录账号领取一次 7 天好评赠送订阅(当前入口已下线,直接拒绝) |
| `POST /api/client/subscription/management` | 登录账号创建指定产品线有效自动续费订阅的渠道管理入口,请求只含 `product_kind`;响应 URL 为空表示客户端使用渠道内指引 |
| `GET /api/client/auth/me` | website 已登录账户摘要,包含 Credits 和订阅状态 |

`/api/client/subscription/status` 保持给插件使用；website Pricing 读取 `/api/client/auth/me` 展示账户状态。两者均无档位 ID，升级判定与终态读源见 [升级接口合同](tech-订阅升级.md#接口合同)。

订单状态的 `product_kind` 为 `string | null`:订阅订单从快照返回合法产品类别,Credits 订单为空;不从缺失快照推导默认订阅产品。

好评赠送的 Counter、锁、加时与失败语义见 `@tech-好评赠送订阅.md`。

订阅管理由订阅域读取当前实例并通过统一 Payment Provider 能力处理:Clink 用 `channel_uid`(customerId)创建 Customer Portal Session;PayPal 返回固定官方 Automatic Payments 页面;Telegram Stars 不提供 Web URL。业务层和客户端不按渠道分支;站内不做取消、退款或渠道状态同步。

订阅商品配置异常时,`/api/client/auth/me` 和 `/api/client/subscription/status` 仍返回成功响应;六字段合同的 `status` 为 `unavailable`、`period` 为 `unavailable`。该状态只表示订阅展示不可用,不能阻断登录态、Credits 或插件初始化等正常业务。

### 订单自动续费人工运维脚本

站内取消不开放(取消续费只打开渠道管理入口)。支持人员可在 `backend/` 目录按本地订单号执行两个独立脚本:

```text
uv run python scripts/query_order_auto_renew.py [order_no]
uv run python scripts/cancel_order_auto_renew.py [--yes] [order_no]
```

规则:

- 省略 `order_no` 时由终端交互输入;取消脚本默认要求再次输入 `CANCEL`,`--yes` 只供明确的自动化操作使用。
- 脚本只接受订阅订单。一次性订阅订单返回非自动续费;充值等非订阅订单直接报错。
- PayPal 从首期 `payment_data` 或续费回调快照提取 Billing Subscription ID,通过 Subscriptions API 查询实时状态或取消。
- Telegram Stars 从订单成功回调保存的付款人 ID 与 `telegram_payment_charge_id` 发起取消。Bot API 没有按 charge ID 查询订阅状态的接口,查询结果明确返回 `QUERY_UNAVAILABLE`,不得用商品配置伪造实时状态。
- 取消只停止渠道后续扣款,不修改历史订单、不退款、不修改当前 `expires_at`,也不写本地取消状态(本站不维护渠道实时取消状态)。
- 历史订单操作按渠道编码读取最新渠道凭据,不受渠道是否停止新销售影响;渠道配置被删除时直接报错。
