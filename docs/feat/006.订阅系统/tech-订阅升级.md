# 006 · 订阅升级

> 产品口径见 `@feat.md`「升级订阅」；本文是升级技术唯一落点，011 只保留页面交互，plans 只跟踪执行。
> 本文定义已确认的升档目标合同；实施与验证见 [Stripe 与升档接入计划](../004.订单系统/plans/001.Stripe支付接入.md)。
> 升级复用现有订阅实例、渠道价格与订单履约；额度继续按纽约自然月统计。

## 目标

同一产品线内未过期订阅从中档位换到更高档位（如 Online Lite → Growth、Maps Pro → Business）：
抵扣旧套餐剩余价值，支付新套餐完整周期的净价；成功后换档并重开完整账期。`maps_online` / `maps_api` / `maps_extension` 三类产品
均按本类别的档位与渠道能力判断是否可升级。

## 业务口径

| #   | 决策           | 口径                                                                                                                         |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | 抵扣与新账期   | `本次应付 = 新套餐完整周期价 − 旧套餐剩余价值`；付款成功后生效新档并重开完整周期，旧账期结束，不再叠加旧剩余时间             |
| 2   | 自动续费线收款 | Stripe / Clink 在原协议内折算收款并重开账期；确认已付款且换档生效后更新本地档位与账期，后续在新账期边界按新档续费            |
| 3   | 降级           | 本期不做；到期自动降级是既有语义。降级（下期生效/退款规则）独立需求另立                                                      |
| 4   | 渠道范围       | 本次新销售开放 Stripe / Clink 的一次性与自动续费升档；PayPal 暂不开新销售，已有订单与协议继续处理；Telegram Stars 不参与升级 |

## 档位序与可升级判定

- `display_order` 只控制方案列表与 Pricing 卡片展示顺序，不参与业务判断。
- 档位高低只按商品配置 `tier_rank` 判定；同产品线内 seed 保证 free 最低。
- 可升级 = 同产品线存在未过期订阅行 ∧ 当前档与目标档均为 month ∧ 目标档 `tier_rank` 严格大于当前行 `product_id` 对应配置的 `tier_rank`。
- 升级固定沿用订阅行 `payment_method`；当前档与目标档在该渠道必须都有启用且币种一致的渠道价。缺少实例渠道或目标渠道价时不可升级，不提供跨渠道换档。
- 跨产品线不是升级（各线可并存购买，走既有下单链路）。
- 补差金额 ≤ 0 时不可升级：报价接口返回不可升级原因，前端按钮灰化并提示"当前档位剩余价值不低于目标档，到期后换档"。

## 职责边界

- `PaymentBase` 与渠道 adapter 拥有换档能力、preview/confirm/state 协议及统一结果/action，核对固定订阅、完整目标 SKU、币种、账期重开条件、付款及渠道终态。
- `subscription_service` 消费统一能力与结果，拥有同线升档、同币种抵扣、快照履约和本地档位 / 账期同步；不解析渠道专有状态或类型。
- 客户端入口为 `subscription_client.py`，响应结构由 `subscription_schema.py` 定义；页面交互见 [Pricing 技术合同](../011.Pricing页/tech-pricing与自动续费.md)。
- Provider 在预览与确认时读取渠道的期末取消设置，执行 [升级订阅](feat.md#升级订阅) 的恢复续费前置条件；不新增本地取消状态，页面根据拒绝原因引导打开已有渠道管理入口。
- 复用现有订单与订阅实例；不增加待处理表、后台换档任务或独立状态机。

## 数据模型消融

- `user_subscriptions` 不保存 `product_price_id`：当前目标渠道价由行内商品与渠道确定，付款时选择的价格行 ID 留在订单快照；旧权益的本期整期价值从已生效付款快照或渠道原账期报价读取。
- `user_subscriptions` 不保存 `original_order_no`：渠道事件自带 `custom_id` / `merchantReference` 并直接定位 `orders.order_no`，订阅行不复制订单主键。
- `user_subscriptions` 不保存 `period`：当前周期由行内 `product_id` 对应商品配置确定，购买履约使用订单快照；实例不保存第三份副本。
- 不保存 `cancelled_at`，也不返回本站推测的取消三态：管理入口只跳转渠道页面，本站没有可靠的渠道取消状态写入路径；权益仍只以 `expires_at` 判定。

## 差额计算

```
剩余占比 = (expires_at − now) / (expires_at − period_start)
旧套餐剩余价值 = 旧套餐周期价 × 剩余占比
本次应付       = 新套餐完整周期价 − 旧套餐剩余价值
```

- 新档按一个完整周期计价。按 30 天估算，10 美元旧套餐用了 3 天，剩余价值 9 美元；升级 50 美元套餐时支付 41 美元，并使用本次升档对应的新月度账期。临近旧周期结束时，旧权益抵扣趋近 0，本次应付趋近新档整期价格。
- `period_start` 取订阅行 `start_at`；该字段由前置支付模型同步在一次性或自动续费履约时写入。
- 金额模型沿用 6 位精度整数与现有 `money` 工具；向下取整到渠道最小单位，差价 ≤ 0 视为不可升级。
- 一次性线沿用订阅行 `payment_method`，旧套餐取本期已生效的完整周期价格，新套餐取目标渠道当前同币种整期价。自动续费展示 Stripe / Clink 的渠道预览，确认必须使用相同的重开账期与折算策略。
- 一次性旧权益的价值通过既有订单查询读取该用户、商品与原渠道最近成功履约的订阅订单，普通购买与新升档快照的 `product_snapshot.amount` 统一保存目标整期价格，`orders.amount` 保存本次净应付，不再新增一套目标价格字段。上次支付 41 美元并抵扣 9 美元换得 50 美元套餐时，本期整期价值为 50 美元；不能以 41 美元净实付或后台后来修改的标价代替。
- 一次性付款成功后，以该次支付完成时间按目标周期增加自然月；自动续费以渠道确认的本次已付新账期为准。Webhook 接收、重试或本地补偿时间不另起一个账期。
- Stripe 的 `now` 锚点取协议更新请求时刻，Clink 的 `now` 也以渠道本次更新生效的账期为准。等待认证或稍后付清时，自动续费新账期可能早于付款完成开始；本站付款成功前不授新档，成功后采信渠道已付周期，不从本地确认时刻另加一整月。

## 用量与付费账期

用量继续遵循 [额度基建](../000.架构/tech-额度基建.md) 的纽约自然月窗口。`used` 是本月消费流水累计，`total` 从当前档位读取；升档改变 `total`，保留 `used`，不迁移或清空消费流水。已用 300、目标上限 5000 时为 `300 / 5000`，剩余 4700。

付费账期重开与自然月用量重置是独立规则。升档不触发额外额度重置，付费有效期内按自然月边界进入下个月额度窗口。

## 两条升级路径

### 路径 A：非自动续费

1. `GET /api/client/subscription/upgrade-quote?product_kind=&target_product_id=`（登录）：
   服务端从当前订阅行读取支付渠道，返回可升级性、当前 / 目标档、`payment_method`、`currency`、`amount`（新周期价减旧权益抵扣）、`expires_at`（预计新到期时间）。
   实时计算，不落库、无报价单状态；每次展示与下单各算一次，以下单冻结值为准。
2. `POST /api/client/subscription/upgrade/checkout`（登录），body：`product_kind + target_product_id`：
   - 服务端校验可升级判定与渠道可用性后**服务端定价**创建订单：`product_class=SUBSCRIPTION`，
     `amount` = 服务端算出的补差，`extra_metadata.product_snapshot` 冻结
     `purpose="upgrade"` + `source_product_id` + `target_product_id` + `base_expires_at`，`amount / period` 保存目标整期价格与周期，折算输入只保留 `period_start`、占比、旧期整期价值与旧权益抵扣，
     并**跳过现有 `check_product` 的同线有效订阅拦截与客户端价比对**（差额是动态价，不存在配置价目）。
   - 调 Provider `create_payment` 返回支付数据，前端复用 order-checkout 弹窗完成支付与轮询。
3. 支付成功回调 → 履约分支：快照 `purpose=upgrade` 时以
   `(user_id, product_kind, product_id=source_product_id, expires_at=base_expires_at)` 条件更新；命中时同时换档并重开账期，
   写目标商品、新 `start_at / expires_at`，保持 `auto_renew=false`。不能在已抵扣旧权益后继续叠加旧剩余时间。
   条件未命中说明订阅已过期或已变化，履约失败转人工，不覆盖当前订阅。
   配额即时跟随行内 `product_id` 生效（`usage_service` 读行内档位），当月已用量自然延续。

### 路径 B：自动续费

升级固定沿用订阅行内渠道。换价与新账期以渠道已付款且变更已生效为准，本地通过渠道事件收敛；确认接口在渠道响应后执行同一核对作为快速路径。通过 Provider 保存的本地首单引用定位用户和产品线，再读取该用户订阅并核对渠道协议。渠道当前 SKU 必须在原渠道唯一映射到目标商品；付款与计划事件乱序不得导致未付款先换档或先延长到期时间。

**Stripe / Clink 共用流程**：

1. `GET upgrade-quote` 调渠道预览，展示新档整期费用减旧权益抵扣的应付金额与预计新账期。
2. 前端确认弹窗（展示补差估算与"将立即扣款"）→ `POST /api/client/subscription/upgrade/confirm`
   （登录，body：`product_kind + target_product_id`）。**不创建订单、不走收银台**。
3. 服务端按行内协议调用渠道换价：Clink preview / confirm 显式使用 `immediate=true`、`billingCycleAnchor=now`、`prorationBehavior=always_invoice`；Stripe 重置账期锚点为当前时刻，使用立即折算开票与付款后应用变更。参数结构按固定 API 版本核对。
4. 渠道付款且目标价已生效后，由确认成功路径或计划事件同步 `product_id`；已付发票路径独立推进 `start_at / expires_at`，复用既有幂等守卫，不要求同一事务写入两类事实。渠道、协议 ID 和自动续费方式保持；等待操作或失败时不提前授予新档。
5. Clink `subscription.updated.plan_changed`、Stripe 目标 items 已生效的 `customer.subscription.updated` 与 `customer.subscription.pending_update_applied` 触发同一档位核对，覆盖立即成功与稍后成功；用户关闭页面后仍能收敛，重复 confirm 或重复事件按渠道当前已付状态幂等处理。
6. confirm 不预建本地订单。`invoice.paid` 验签后通过首单引用进入统一实付建单链。商品与价格快照取本次已付发票对应的新档整期价，遵循 [订阅订单履约](tech-订阅商品与状态.md#订单履约)，不复制首购商品模板；订单金额记录新档整期费用减旧权益抵扣后的实付，不与首单整期金额比较。只使用本次已付新账期；重开账期后不得继续沿用旧到期日，也不在新到期日上额外累加一次周期。

**PayPal 渠道**：本次暂不开新销售；保留已有订单、回调及协议处理，不开放自动续费协议内升档。

**共用规则**：渠道已生效但确认请求内的本地同步失败时返回错误；渠道 Webhook 重试仍可完成同步。档位同步与已付账期推进分别幂等，普通续费不恢复旧档。

### 续费履约档位保护（随本特性一并落地的履约规则修正）

自动续费履约入口为 `SubscriptionService._fulfill_auto_renew_in_session`，**只在首购单上覆盖行内 `product_id`**：
回调解析出的 `provider_subscription.original_order_no` 等于当前回调单号时才写档位；
续费/折算发票回调只推进 `expires_at` 等账期事实，不覆盖档位。否则升级后下一期续费会把档位快照打回首购档。

## 接口合同

| 接口                                        | 方法 | 说明                                                                             |
| ------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `/api/client/subscription/upgrade-quote`    | GET  | 展示用实时报价；未登录 401，无可升级返回 `available=false` + `reason`            |
| `/api/client/subscription/upgrade/checkout` | POST | 一次性线按当前订阅渠道创建差额订单并返回既有支付数据；不允许客户端指定渠道或金额 |
| `/api/client/subscription/upgrade/confirm`  | POST | 自动续费线协议换价；返回统一 `status/action`，见下表                             |

`upgrade-quote` 响应 data（最小合同）：

| 字段                 | 类型           | 说明                                                                                                                                 |
| -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `available`          | bool           | 是否可升级                                                                                                                           |
| `reason`             | string \| null | 不可升级原因：`no_active_subscription` / `not_higher_tier` / `non_positive_diff` / `channel_unavailable` / `renewal_resume_required` |
| `current_product_id` | string \| null | 当前档；无有效订阅时为空                                                                                                             |
| `target_product_id`  | string         | 目标档                                                                                                                               |
| `payment_method`     | string \| null | 当前订阅渠道；不可升级时可为空                                                                                                       |
| `currency`           | string \| null | 当前订阅渠道的币种；不可升级时可为空                                                                                                 |
| `amount`             | int \| null    | 一次性净应付或渠道 preview 应付金额；不可升级时为空                                                                                  |
| `expires_at`         | int \| null    | 预计新账期到期时间；支付成功后刷新订阅状态读取实际值                                                                                 |

已安排期末取消的协议先在原渠道恢复续费，再重新报价。quote 返回 `available=false`、`reason=renewal_resume_required`；confirm 再次核对渠道取消安排，并经既有错误 `data.reason` 返回同值。网站沿用原 management 入口引导恢复，不保存本地取消状态。

### confirm 结果与动作

请求体仍只含 `product_kind` 与 `target_product_id`，响应 data：

| status            | action                                | 客户端处理                              |
| ----------------- | ------------------------------------- | --------------------------------------- |
| `succeeded`       | `null`                                | 渠道已生效且本地已同步，刷新权益        |
| `requires_action` | `{type:"wait",url:null}`              | 保持 pending 展示并轮询，不再次 confirm |
| `requires_action` | `{type:"redirect",url:"https://..."}` | 打开渠道 GET 跳转地址并等待本地换档     |
| `failed`          | `null`                                | 展示失败，不换本地档位                  |

Clink 官方 status=1/2/3/5 分别归一为成功、等待、失败、动作；只有 5 声明 action，2 要求等待终态、禁止重复扣款。统一 action 仅承载现有等待与 GET 跳转，不照搬官方 form/QR 能力全集。

wait/redirect 后，客户端轮询同一 `upgrade-quote`，仅以 `current_product_id == target_product_id` 判断完成；`available=false` 不是成功判据。`auth/me` 与 `subscription/status` 摘要无档位 ID。读源由 `plan_changed` webhook 更新的 `user_subscriptions.product_id` 提供；pending 是客户端展示态，不是新订单或后端持久状态。等待期间不推断失败，不增加超时恢复。

官方依据：[Clink confirm](https://docs.clinkbill.com/api-reference/endpoint/confirm-subscription-update.md)、[Clink preview](https://docs.clinkbill.com/api-reference/endpoint/preview-subscription-update.md)、[Stripe 重开账期](https://docs.stripe.com/billing/subscriptions/billing-cycle)、[Stripe Pending updates](https://docs.stripe.com/billing/subscriptions/pending-updates)。

## 渠道能力矩阵

| 渠道           | 路径 A（差额单）                 | 路径 B（协议换价）                                            | 依据                                   |
| -------------- | -------------------------------- | ------------------------------------------------------------- | -------------------------------------- |
| Stripe         | Hosted Checkout 净应付订单       | 原协议折算收款并重开账期，付款与换档终态共同决定权益          | Stripe billing-cycle / pending-updates |
| ClinkBill      | Hosted Checkout 净应付订单       | preview→confirm，明确立即折算与重开账期；计划事件核对生效结果 | Clink preview / confirm                |
| PayPal         | 本次不开新销售，保留已有订单处理 | 禁用                                                          | 产品范围                               |
| Telegram Stars | 不参与（无动态价目）             | 不支持协议修改（Bot API 无 revise）                           | —                                      |

## 异常流程

- 升级差额单支付回调时订阅行已过期或已被其他操作修改：条件更新不命中，订单进入异常待人工/退款；
  前端订单状态展示失败文案。不做"过期按整期新购"折中，避免临期小额补差套利。
- 并发两笔升级单都支付成功：第一笔命中快照并换档，后续旧快照不覆盖当前档位，订单转人工处理。
- 订阅线渠道换价返回订阅不存在/已取消：本地不改，报错引导用户重试或换档到期重购。
- 配置变更窗口（目标档下架/改价）：下单时以服务端实时配置为准，报价与下单间价格变动按下单值冻结。
- `upgrade/confirm` 与续费扣款并发：渠道侧协议操作原子，本地同步按渠道当前 plan 幂等，无锁。

## 验收口径

1. 一次性线：旧档剩余价值抵扣后收取新档整期净价，成功后同时换档与重开完整账期；旧剩余时间不再叠加。
2. 自动续费线：Stripe / Clink 按相同业务模型开票，只有付款且协议换档成功才更新权益与新到期日；关闭页面后仍能收敛，后续按新账期、新档扣款，重复事件不重复延长，续费不回退档位。
3. 不可升级场景（无订阅/已是最高档/补差≤0/过期行）全部被报价接口拒绝，前端有对应文案。
4. 一次性升级订单在管理后台订单详情可见升级快照（`extra_metadata.product_snapshot.purpose=upgrade`，复用现有 JSON 渲染，无 admin 改动）。

## 对既有文档的修订点

- `feat.md`：功能范围加「升级订阅」；异常流程"已有有效订阅时再次购买拒绝"收窄为"非更高档购买拒绝"。
- `tech-订阅商品与状态.md`：履约表补 `purpose=upgrade` 分支与 `start_at` 写入收紧。
- `004/tech-支付与履约.md`：订单分发表补升级分支引用本文。
- `011.Pricing页`：升级按钮态与两路径交互（见该域文档）。
