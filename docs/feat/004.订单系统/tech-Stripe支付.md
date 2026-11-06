# 004 · Stripe 支付接入设计

本文定义 Stripe 渠道边界；实施与验收进度见 [接入计划](plans/001.Stripe支付接入.md)。共享订单与履约规则见 [支付与履约](tech-支付与履约.md)，商品计费与权益规则见 [订阅商品与状态](../006.订阅系统/tech-订阅商品与状态.md)。

## 商品与渠道合同

- 渠道编码为 `stripe`，覆盖 Maps 三条产品线的付费商品。商品配置决定单次购买或自动续费，同一商品保持一种计费模式；网站按服务端配置展示。
- 沿用美元定价和现有 6 位精度金额。Stripe 边界换算为整数美分，金额必须是 `10_000` 的整数倍；补差金额也按美分取整。
- 单次购买使用 Hosted Checkout 的 `payment` 模式；自动续费使用 `subscription` 模式，支持商品已有的月、季、年周期。
- 单次购买与自动续费升档都抵扣旧套餐剩余价值，收取新套餐完整周期净价，付款与换档成功后重开完整账期。业务公式、起止时间及验收由 [订阅升级](../006.订阅系统/tech-订阅升级.md) 统一定义；沿用同产品线、月付、档位递增和原支付渠道规则。Customer Portal 关闭套餐和数量变更，升级由站内流程发起。
- 现有商品的计费模式由配置维护。新增渠道支持与现售商品切换计费模式是不同操作，接入部署不批量切换商品模式。
- 付费账期重开不改变自然月用量窗口；升档提高额度上限并保留本月已用量，具体合同见 [订阅升级](../006.订阅系统/tech-订阅升级.md#用量与付费账期)。

## 商品模式与渠道记录

沿用现有两层模型：`config_subscription_product.auto_renew` 决定商品的新售计费模式；`config_subscription_product_price` 按 `(product_id, channel_code)` 唯一，保存该商品在渠道上的金额、币种、自动续费支持标志、渠道 SKU 与启用状态。渠道支持标志不覆盖商品模式，同一商品在各渠道采用相同计费方式。

| 商品模式   | 渠道记录                                             | 新购行为                                       |
| ---------- | ---------------------------------------------------- | ---------------------------------------------- |
| 非自动续费 | 商品、渠道、价格行启用，金额与币种合法               | 创建一次性支付，不受价格行自动续费支持标志影响 |
| 自动续费   | 上述条件成立，且价格行支持自动续费、渠道协议配置有效 | 创建自动续费协议                               |
| 自动续费   | 无渠道价，或渠道价未配置自动续费支持                 | 不提供该渠道，不转为一次性支付                 |

自动续费 SKU 的格式、金额与周期在 Provider 边界核对；已有配置读取和下单验价共用 `_is_price_available` 的商品模式筛选。新增 Stripe 沿用此边界，无需为两种模式增加价格维度或新表。

升档路径读取用户订阅实例的续费方式与支付渠道，目标档必须具有适用于该方式的渠道配置。商品模式变更只影响新销售，不改写已有协议、历史订单或订阅快照；升档保持原渠道与续费方式。

共用一份启用渠道价格快照：`_load_snapshot` 保留与商品关联有效的价格，商品模式筛选移到新购列表与下单入口；`_resolve_upgrade` 按订阅实例模式核对原渠道和目标价。既有协议同步也读取同一快照，不另建升档价格读取服务。

### 渠道能力目标

本次只开放 Stripe、Clink 的完整购买与升档路径。PayPal 暂不开放新销售，后续接入时只支持一次性商品及其补差升档；已有订单和自动续费协议继续处理：

| 渠道      | 非自动续费购买与补差升档 | 自动续费购买、续期与协议内升档                  |
| --------- | ------------------------ | ----------------------------------------------- |
| Stripe    | 支持                     | 支持，补差付款成功且渠道已换档后更新权益        |
| ClinkBill | 支持                     | 支持，复用已有 preview / confirm 与计划变更事件 |
| PayPal    | 本次暂不开放             | 不开放新销售；已有协议的付款通知与权益履约保留  |

两种商品模式的新购都只展示已配置的 Stripe / Clink 渠道。同一商品在各渠道保持相同计费模式；若同一档位要同时销售两种计费方式，使用不同商品 SKU。

### 与 Clink 的统一业务规则

| 环节         | 两个渠道统一的本站行为                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| 一次性购买   | 收款成功后按购买周期发放权益，不产生后续自动扣款                                                         |
| 一次性升档   | 本站计算新套餐整期价减旧权益抵扣，走原渠道收银台；成功后换档并重开完整账期                               |
| 自动续费     | 渠道负责扣款，每笔已付发票形成订单并推进权益；付款失败不延长本地有效期                                   |
| 自动续费升档 | 使用原协议按渠道报价抵扣旧权益并收取新档整期净价；付款及换档成功后采用已付新账期，后续按新账期、新档续费 |
| 取消续费     | 打开对应 Customer Portal，采用期末取消；当前已付权益保留到到期日                                         |

渠道差异集中在 Provider：Clink 通过 preview / confirm 换价，Stripe 通过 Invoice preview 与 Subscription update 换价；两者归一为成功、等待付款或用户操作、失败，订阅域和网站消费同一结果。

Clink 的预览与确认都显式使用 `immediate=true`、`billingCycleAnchor=now`、`prorationBehavior=always_invoice`，并核对新账期与抵扣选项。官方 `priceSnapshotId` 只标识目标价格快照，不保存这些选项，确认时会重新计算；Adapter 在预览与确认两次调用中显式传入同一计费策略。

Stripe 升档把账期锚点重置为当前时刻，并用 `always_invoice + pending_if_incomplete` 抵扣旧权益、收取新档整期费用，字段结构按固定 API 版本实现。预览是估算，确认按渠道当时的折算结果收款；两次采用相同计费策略，不保存锁价报价。Clink 以 `subscription.updated.plan_changed` 触发档位同步；Stripe 同时核对立即换档和待处理更新应用的事件，不能仅覆盖后者。账期继续由已验签的已付发票推进，档位与账期不要求在同一事务写入。

## 接入边界

复用 `PaymentBase`、`payment_service`、`order_service.handle_payment_callback` 与订阅域履约，不新增订单表、客户映射表、事件表或履约队列。

服务端使用已安装的 `httpx` 调用 Stripe REST API，Webhook 验签使用标准库 `hmac` / `hashlib`。前端直接打开服务端返回的 Hosted Checkout URL。

请求 API 版本由 `backend/src/app/provider/payment/stripe.py` 的 `STRIPE_API_VERSION` 固定；Webhook 事件接收端使用同一版本的 snapshot 事件。接口版本升级时一起复核解析边界与事件配置，不增加多个版本的解析分支。

渠道凭据沿用 `config_payment_channel.config_json`，只供后端读取：

| 配置                      | 用途                                            |
| ------------------------- | ----------------------------------------------- |
| `secret_key`              | 当前环境的 Stripe API 凭据                      |
| `webhook_secret`          | 当前 Webhook 接收端或本地 Stripe CLI 的签名密钥 |
| `request_timeout_seconds` | 请求超时，沿用已有 Provider 的配置方式          |

测试与正式环境使用各自凭据和 Webhook 密钥。停用新销售后，已存在付款的确认、Webhook 与订阅管理继续通过 `get_provider_for_existing_payment` 读取配置。

## 创建支付

入口仍为 `POST /api/client/order/create`：服务端验价、冻结商品快照并创建订单，再由 Stripe Provider 创建 Checkout Session。

### 单次购买

使用订单冻结的名称、币种与金额构造 `price_data`，数量固定为一。动态补差订单复用此路径，不要求预先注册 Stripe Price。

Session 的 `client_reference_id` / metadata 保存本地订单引用；服务端以 `payment_data.sessionId` 和 `payment_data.checkoutUrl` 返回支付入口，官网只依赖 `checkoutUrl`。支付凭证由 Stripe 查询结果与验签事件提供。

### 自动续费

渠道价的 `provider_sku` 保存预先注册的 Stripe recurring Price ID。创建 Session 前查询 Price，核对启用状态、固定价格、币种、金额及周期；月、季、年分别对应一个月、三个月、一年。

共享支付请求补齐商品周期，从已校验商品配置传入，避免 Provider 重新推测。Subscription metadata 保存本地首购订单号和用户引用，后续发票据此定位首单。

每次订阅 Checkout 让 Stripe 创建对应 Customer，返回的 Customer ID 存入已有订阅实例的 `channel_uid`；无需另建全局客户映射。

### 金额与入口约束

- Checkout 使用服务端固定美元金额，逐会话关闭 Managed Payments 与 Adaptive Pricing，不启用折扣、试用或自动税额计算，保持现有订单金额匹配合同。
- 支付 URL 只允许 HTTPS `checkout.stripe.com`，不开放自定义收银台域名。
- 本地订单的 30 分钟可见期与 Stripe Session 的有效期分别处理。Stripe `expires_at` 至少为创建 Session 后 30 分钟，不能直接传更早创建的本地订单截止时间；Session 使用官方默认有效期，本地订单状态仍由共享订单域裁决。

## 收款确认与续费

### 单次购买

监听 `checkout.session.completed` 与 `checkout.session.async_payment_succeeded`。仅处理 `mode=payment` 且 `payment_status=paid` 的 Session；延迟支付尚未到账时不履约。

优先使用已验签 Session 快照中的本地引用、币种、金额、付款状态和 PaymentIntent 引用，进入共享订单核对与幂等履约；载荷缺少必要付款事实时才补查，不为重读已有字段再查询 Session 与 PaymentIntent。渠道订单号使用 Session ID，实际交易号使用 PaymentIntent ID。

### 自动续费

首期和后续续费统一消费 `invoice.paid`；`mode=subscription` 的 Checkout 完成事件只确认接收，不单独发放权益。

Provider 优先从已验签发票快照读取首单引用、协议、Customer、Price、币种及本次账期；首单引用使用发票定稿时保存的订阅 metadata。共享订单入口负责已有的本地订单、渠道、金额和归属核对，Provider 不重复实现；付款关联或实际交易凭证等必要字段缺失时才补查；统一 Invoice 查询展开 `payments`，读取成功 Invoice Payment。首期金额必须与本地订单快照一致；后续发票以新档正计费行的 Price 与整期金额进入共享建单，按既有商品映射冻结本次目标快照，净实付单独记录在订单金额中，见 [订阅订单履约](../006.订阅系统/tech-订阅商品与状态.md#订单履约)。站外手动标记已付、无实付或未完成付款的发票不进入收款履约。

归一化字段：

| 共享字段              | Stripe 来源                                        |
| --------------------- | -------------------------------------------------- |
| 渠道订单号            | Invoice ID；首期与续费均使用它作为该次付款身份     |
| 实际交易号            | 成功 Invoice Payment 关联的 PaymentIntent / Charge |
| 首单引用              | Subscription metadata 中的本地首购订单号           |
| 渠道订阅 ID / 客户 ID | Subscription ID / Customer ID                      |
| 实付金额与币种        | 已核对的发票实付字段，转换为项目金额格式           |
| 权益起止              | 本次订阅发票行的服务区间，秒转毫秒                 |

账期取本次发票行的 `period`，不使用 Invoice 顶层账单汇总区间，也不使用查询时订阅的最新账期覆盖历史发票。共享订阅履约只向后推进到期时间，重复或乱序事件不得缩短权益。

续费失败不创建成功订单、不延长到期时间；取消续费按原已付到期日结束权益。失败通知与渠道取消不引入本地取消状态机。

### Webhook 边界

新增 `POST /api/callback/stripe/payment`，仅在业务角色挂载。读取原始请求体，按 Stripe 官方算法校验 `Stripe-Signature`：HMAC-SHA256、`v1` 签名、恒定时间比较和五分钟时间容差；JSON 解析在验签之后进行。

已验签但不参与履约的事件返回成功。收款事件完成持久化与共享履约后返回成功；瞬时处理失败归为既有 `RETRYABLE`，由回调错误边界返回 HTTP 500 并触发 Stripe 重试；永久核对失败沿用既有分类与人工处理。付款去重继续使用既有渠道流水唯一约束、订单 CAS 和履约状态，不另存一套事件去重记录。

## 回跳与订阅管理

- 新增本地化 `/stripe/success/`、`/stripe/cancel/`，复用现有支付回跳控制器、订单轮询和成功文案。
- success 页只轮询既有本地订单状态，到账由 Webhook 驱动；不新增 Stripe 主动付款确认接口。Webhook 投递延迟时页面保持等待，瞬时失败依靠渠道重试。
- 回跳参数与前端通知只触发查询；页面到账状态仍以本地订单已付且履约成功为准。Stripe cancel 页只表示退出收银台，通知原页查询状态，不调用本地取消订单接口；文案明确订单仍可继续付款。
- 通用 `POST /api/client/order/cancel` 拒绝直接取消 Stripe 待支付单。`cancel_url` 不会关闭 Stripe Session，直接把本地订单置为取消会导致随后到账无法履约；真正关闭渠道支付入口另需 Session expire 与付款结果核对。
- Dashboard 通过现有 `POST /api/client/subscription/management` 获取 Stripe Customer Portal Session。Customer ID 从当前用户的有效订阅实例读取，前端不传入客户或订阅 ID；返回地址由本站配置构造。
- Stripe Portal 的默认配置允许更新付款方式和期末取消续费，关闭套餐与数量变更。取消不提前撤销本期已付权益。

## 自动续费升级

复用现有升级报价、确认、统一结果与渠道同步流程；已付发票推进账期，确认成功及已生效计划事件同步档位，保留现有两条写入路径。Stripe Provider 提供金额预览、协议换价和当前订阅状态查询；重置账期锚点，使用 `proration_behavior=always_invoice` 与 `payment_behavior=pending_if_incomplete` 抵扣旧权益并收取新档完整周期净价，付款成功再应用变更。自动续费的收款配置须满足 Stripe pending updates 的适用条件。

只有确认渠道付款与换档成功，才切换本地权益。等待付款、需要用户操作或失败时，不提前切换档位。立即扣款成功和待处理更新稍后应用都必须覆盖：`customer.subscription.updated` 的 items 变化与 `customer.subscription.pending_update_applied` 进入同一档位核对入口。发票已付和换档已应用可能不在同一个 API 请求内完成，不能只凭创建发票或普通 updated 事件切换权益；只有 Provider 确认本次已付款且目标价已生效才授权益。

净实付记入订单，权益使用本次已付完整新账期；不叠加旧剩余时间，不在渠道新到期日上再加一个周期，后续续费不得恢复首购旧档。用户关闭页面后仍由渠道事件同步最终结果。共享预览沿用价格引用与净应付两个值，不增加报价表或通用上下文容器；价格引用仅用于渠道确认目标价，Clink 使用价格快照 ID，Stripe 使用不可变的目标 Price ID，不把它解释为锁价凭证。共享预览以 `price_reference` 表达渠道价格引用。

期末取消与恢复续费的升档门禁由 [升级接口合同](../006.订阅系统/tech-订阅升级.md#接口合同) 统一定义。

## 配置与调用方

商品播种脚本补齐 Stripe / Clink 渠道价；重复执行不得覆盖环境已配置的商品续费方式、渠道自动续费支持标志和渠道 SKU，不能清掉已配置的可售渠道。自动续费 Price 映射由对应环境配置，缺失或不匹配时拒绝创建支付。

网站共用 checkout 增加 Stripe 支付 URL 校验、渠道展示和回跳 provider；Dashboard 沿用已有管理入口。插件继续跳转网站购买，后台订单页按渠道数据展示，无需新增独立支付界面。

## 官方依据

- [Checkout 工作机制](https://docs.stripe.com/payments/checkout/how-checkout-works)：单次与订阅模式、托管 URL、Session 有效期。
- [创建 Checkout Session](https://docs.stripe.com/api/checkout/sessions/create)：价格、首单引用与订阅 metadata；[Managed Payments 限制](https://docs.stripe.com/payments/managed-payments/update-checkout#remove-unsupported-parameters)说明其强制启用 Adaptive Pricing。
- [支付履约](https://docs.stripe.com/checkout/fulfillment)：到账判断、异步付款、回跳与 Webhook 并存。
- [订阅 Webhook](https://docs.stripe.com/billing/subscriptions/webhooks)：付款成功与续费通知。
- [Stripe 订阅换价](https://docs.stripe.com/billing/subscriptions/change-price) 与 [Pending updates](https://docs.stripe.com/billing/subscriptions/pending-updates)：立即折算收款、付款后应用变更、适用收款方式及终态事件。
- [Stripe Invoice preview](https://docs.stripe.com/api/invoices/create_preview) 与 [取消订阅](https://docs.stripe.com/billing/subscriptions/cancel)：折算时点与期末取消。
- [Stripe 账期重置](https://docs.stripe.com/billing/subscriptions/billing-cycle)：重开完整周期并抵扣旧账期已付剩余价值。
- [Clink 订阅](https://docs.clinkbill.com/subscriptions.md)、[升档预览](https://docs.clinkbill.com/api-reference/endpoint/preview-subscription-update.md)与[升档确认](https://docs.clinkbill.com/api-reference/endpoint/confirm-subscription-update.md)：旧权益抵扣、新账期选择、参数复用与确认重新计算。
- [Webhook 验签与发送语义](https://docs.stripe.com/webhooks)：原始请求体、手工验签、重复事件、乱序和重试。
- [Invoice 对象](https://docs.stripe.com/api/invoices/object) 与 [官方 OpenAPI](https://github.com/stripe/openapi/blob/master/openapi/spec3.json)：发票关联、支付记录及发票行账期。
- [创建 Customer Portal Session](https://docs.stripe.com/api/customer_portal/sessions/create)：客户与本站返回地址。
