# 006 · 订阅升级

> 产品口径见 `@feat.md`「升级订阅」；本文是升级技术唯一落点，011 只保留页面交互，plans 只跟踪执行。
> 前置依赖：支付系统同步（`@plans/004.同步支付系统-计费模型与ClinkBill.md`）必须先落地——
> 升级建立在同步后的模型上：订阅实例字段、自然月账期、渠道价 `auto_renew_supported`、Clink 渠道。

## 目标

同一产品线内未过期订阅从中档位换到更高档位（如 Online Lite → Growth、Maps Pro → Business）：
立即生效新档权益，用户只补差价。四条产品线中，`maps_online` / `maps_api` / `maps_extension`
有可升级档位；`extension` 线唯一付费档 Unlimited 之上无更高档，不进入本期升级范围。

## 业务口径

| # | 决策 | 口径 |
| --- | --- | --- |
| 1 | 差额与到期日 | 折旧补差、立即换档、**到期日不变**：`补差 = (目标档月价 − 当前档月价) × 剩余占比`；当前档与目标档都取当前订阅渠道的同币种价格 |
| 2 | 自动续费线收款 | 渠道协议内换价。ClinkBill 服务端 preview→confirm（`immediate=true`）立即扣折算差额；PayPal 自动续费升级禁用。计划变更 Webhook 收敛本地档位，确认接口只在渠道成功后快速同步 |
| 3 | 降级 | 本期不做；到期自动降级是既有语义。降级（下期生效/退款规则）独立需求另立 |
| 4 | 渠道范围 | 差额款支持 PayPal / ClinkBill，协议换价只开放 ClinkBill；Telegram Stars 不参与升级（`maps_extension` 无 Stars 渠道价；一次性线差额为动态金额无 Stars 价目） |

## 档位序与可升级判定

- `display_order` 只控制方案列表与 Pricing 卡片展示顺序，不参与业务判断。
- 档位高低只按商品配置 `tier_rank` 判定；同产品线内 seed 保证 free 最低。
- 可升级 = 同产品线存在未过期订阅行 ∧ 当前档与目标档均为 month ∧ 目标档 `tier_rank` 严格大于当前行 `product_id` 对应配置的 `tier_rank`。
- 升级固定沿用订阅行 `payment_method`；当前档与目标档在该渠道必须都有启用且币种一致的渠道价。缺少实例渠道或目标渠道价时不可升级，不提供跨渠道换档。
- 跨产品线不是升级（各线可并存购买，走既有下单链路）。
- 补差金额 ≤ 0 时不可升级：报价接口返回不可升级原因，前端按钮灰化并提示"当前档位剩余价值不低于目标档，到期后换档"。

## 职责边界

- `PaymentBase` 与渠道 adapter 拥有换档能力、preview/confirm/state 协议及统一结果/action。Clink adapter 核对固定订阅、完整目标 SKU、币种、立即生效条件与渠道终态。
- `subscription_service` 消费统一能力与结果，拥有同线升档、同币种补差、快照履约和本地档位同步；不解析渠道专有状态或类型。
- 客户端入口为 `subscription_client.py`，响应结构由 `subscription_schema.py` 定义；页面交互见 [Pricing 技术合同](../011.Pricing页/tech-pricing与自动续费.md)。
- 复用现有订单与订阅实例；不增加待处理表、后台换档任务或独立状态机。

## 数据模型消融

- `user_subscriptions` 不保存 `product_price_id`：当前渠道价由行内 `(product_id, payment_method)` 唯一确定，付款时选择的价格行 ID 只留在订单快照。
- `user_subscriptions` 不保存 `original_order_no`：渠道事件自带 `custom_id` / `merchantReference` 并直接定位 `orders.order_no`，订阅行不复制订单主键。
- `user_subscriptions` 不保存 `period`：当前周期由行内 `product_id` 对应商品配置确定，购买履约使用订单快照；实例不保存第三份副本。
- 不保存 `cancelled_at`，也不返回本站推测的取消三态：管理入口只跳转渠道页面，本站没有可靠的渠道取消状态写入路径；权益仍只以 `expires_at` 判定。

## 差额计算

```
剩余占比 = (expires_at − now) / (expires_at − period_start)
补差     = (目标档月价 − 当前档月价) × 剩余占比
```

- 即"旧档未用部分折抵 + 新档按剩余时间计费"的净差额：账期初升级补足整月档差，临期升级补差趋近 0，
  不存在"花接近全价买几天权益"的口径。
- `period_start` 取订阅行 `start_at`；该字段由前置支付模型同步在一次性或自动续费履约时写入。
- 金额模型沿用 6 位精度整数与现有 `money` 工具；向下取整到渠道最小单位，差价 ≤ 0 视为不可升级。
- 一次性线按订阅行 `payment_method` 的当前档/目标档渠道价计算；ClinkBill 自动续费线展示其 preview 返回值；PayPal 自动续费线返回渠道不可升级。

## 两条升级路径

### 路径 A：一次性线（maps_online / maps_api）——差额订单走收银台

1. `GET /api/client/subscription/upgrade-quote?product_line=&target_product_id=`（登录）：
   服务端从当前订阅行读取支付渠道，返回可升级性、当前/目标档、`payment_method`、`currency`、`amount`（补差）、`expires_at`（保持不变）。
   实时计算，不落库、无报价单状态；每次展示与下单各算一次，以下单冻结值为准。
2. `POST /api/client/subscription/upgrade/checkout`（登录），body：`product_line + target_product_id`：
   - 服务端校验可升级判定与渠道可用性后**服务端定价**创建订单：`product_class=SUBSCRIPTION`，
     `amount` = 服务端算出的补差，`extra_metadata.product_snapshot` 冻结
     `purpose="upgrade"` + `source_product_id` + `target_product_id` + `base_expires_at` + 折算输入（`period_start`、占比），
     并**跳过现有 `check_product` 的同线有效订阅拦截与客户端价比对**（差额是动态价，不存在配置价目）。
   - 调 Provider `create_payment` 返回支付数据，前端复用 order-checkout 弹窗完成支付与轮询。
3. 支付成功回调 → 履约分支：快照 `purpose=upgrade` 时以
   `(user_id, product_line, product_id=source_product_id, expires_at=base_expires_at)` 条件更新；命中时只换档，
   写 `product_id = target_product_id`，`expires_at` 保持不变，`auto_renew=false`。
   条件未命中说明订阅已过期或已变化，履约失败转人工，不覆盖当前订阅。
   配额即时跟随行内 `product_id` 生效（`usage_service` 读行内档位），当月已用量自然延续。

### 路径 B：自动续费线（maps_extension）——渠道协议内换价

升级固定沿用订阅行内渠道。换价以渠道侧生效为准，本地档位由渠道计划变更事件收敛；确认接口在渠道响应后执行同一同步逻辑作为快速路径。事件不按外部订阅 ID 扫描用户订阅表：PayPal 用 subscription `custom_id`，ClinkBill 用 Subscription `merchantReference` 定位本地首单，再按首单用户与产品线主键读取订阅行并核对 `channel_subscription_id`。PayPal `plan_id`、ClinkBill `productId:priceId` 必须在同渠道唯一命中一个启用价格行后才能换档。不新增索引、pending 表或锁。

**B-Clink（ClinkBill 渠道）**：

1. `GET upgrade-quote` 调 ClinkBill preview，展示渠道返回的补差金额。
2. 前端确认弹窗（展示补差估算与"将立即扣款"）→ `POST /api/client/subscription/upgrade/confirm`
   （登录，body：`product_line + target_product_id`）。**不创建订单、不走收银台**。
3. 服务端按行内 `channel_subscription_id` 调 ClinkBill update：preview 核对官方 `immediate=true`，再以 `priceSnapshotId` confirm 折算扣款；渠道返回统一成功结果后尝试本地同步换档：行内 `product_id` 更新为新档，
   `expires_at`、`channel_subscription_id`、`payment_method`、`auto_renew=true` 不变。
4. `subscription.updated.plan_changed` Webhook 执行同一同步逻辑，保证用户关闭页面后仍能收敛；重复 confirm 或重复事件按渠道“已是该价”幂等成功。
5. confirm 不预建本地订单。换价后的 `invoice.paid` 经验签和渠道查询核对 `subscriptionId`、`sessionId`、首单引用与币种，再由 `order_service._recurring_payment_order` 通过首购单定位并创建本次实付订单。订单记录发票实付金额，不与首单或新档整月金额比较。折算发票的 `periodEnd` 未推进时不得延长到期时间。

**PayPal 渠道**：自动续费实例在共享能力边界返回不可升级；一次性差额订单仍走现有 Orders 支付。已有 `BILLING.SUBSCRIPTION.UPDATED` 查询收敛保留，不开放站内协议换价。

**共用规则**：渠道已生效但确认请求内的本地同步失败时返回错误；渠道 Webhook 重试仍可完成同步。续费事件只推进账期，不承担档位同步。

### 续费履约档位保护（随本特性一并落地的履约规则修正）

自动续费履约（同步方案中的 `_fulfill_auto_renew` 路径）**只在首购单上覆盖行内 `product_id`**：
回调解析出的 `provider_subscription.original_order_no` 等于当前回调单号时才写档位；
续费/折算发票回调只推进 `expires_at` 等账期事实，不覆盖档位。否则升级后下一期续费会把档位快照打回首购档。

## 接口合同

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/client/subscription/upgrade-quote` | GET | 展示用实时报价；未登录 401，无可升级返回 `available=false` + `reason` |
| `/api/client/subscription/upgrade/checkout` | POST | 一次性线按当前订阅渠道创建差额订单并返回既有支付数据；不允许客户端指定渠道或金额 |
| `/api/client/subscription/upgrade/confirm` | POST | 自动续费线协议换价；返回统一 `status/action`，见下表 |

`upgrade-quote` 响应 data（最小合同）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `available` | bool | 是否可升级 |
| `reason` | string \| null | 不可升级原因：`no_active_subscription` / `not_higher_tier` / `non_positive_diff` / `channel_unavailable` |
| `current_product_id` | string \| null | 当前档；无有效订阅时为空 |
| `target_product_id` | string | 目标档 |
| `payment_method` | string \| null | 当前订阅渠道；不可升级时可为空 |
| `currency` | string \| null | 当前订阅渠道的币种；不可升级时可为空 |
| `amount` | int \| null | 一次性线补差或 Clink preview 金额；不可升级时为空 |
| `expires_at` | int \| null | 升级后到期时间；可升级时等于当前到期时间 |

### confirm 结果与动作

请求体仍只含 `product_line` 与 `target_product_id`，响应 data：

| status | action | 客户端处理 |
| --- | --- | --- |
| `succeeded` | `null` | 渠道已生效且本地已同步，刷新权益 |
| `requires_action` | `{type:"wait",url:null}` | 保持 pending 展示并轮询，不再次 confirm |
| `requires_action` | `{type:"redirect",url:"https://..."}` | 打开渠道 GET 跳转地址并等待本地换档 |
| `failed` | `null` | 展示失败，不换本地档位 |

Clink 官方 status=1/2/3/5 分别归一为成功、等待、失败、动作；只有 5 声明 action，2 要求等待终态、禁止重复扣款。统一 action 仅承载现有等待与 GET 跳转，不照搬官方 form/QR 能力全集。

wait/redirect 后，客户端轮询同一 `upgrade-quote`，仅以 `current_product_id == target_product_id` 判断完成；`available=false` 不是成功判据。`auth/me` 与 `subscription/status` 摘要无档位 ID。读源由 `plan_changed` webhook 更新的 `user_subscriptions.product_id` 提供；pending 是客户端展示态，不是新订单或后端持久状态。等待期间不推断失败，不增加超时恢复。

官方依据：[confirm](https://docs.clinkbill.com/api-reference/endpoint/confirm-subscription-update.md)、[Subscriptions](https://docs.clinkbill.com/subscriptions.md)。

## 渠道能力矩阵

| 渠道 | 路径 A（差额单） | 路径 B（协议换价） | 依据 |
| --- | --- | --- | --- |
| PayPal | 一次性差额单（现有 Orders API） | 禁用 | 产品范围 |
| ClinkBill | 一次性 Hosted Checkout Session（现有） | 服务端 update preview→confirm，`immediate=true` 立即折算扣款；`subscription.updated.plan_changed` 收敛本地档位 | docs.clinkbill.com/subscriptions |
| Telegram Stars | 不参与（无动态价目） | 不支持协议修改（Bot API 无 revise） | — |

## 异常流程

- 升级差额单支付回调时订阅行已过期或已被其他操作修改：条件更新不命中，订单进入异常待人工/退款；
  前端订单状态展示失败文案。不做"过期按整期新购"折中，避免临期小额补差套利。
- 并发两笔升级单都支付成功：第一笔命中快照并换档，后续旧快照不覆盖当前档位，订单转人工处理。
- 订阅线渠道换价返回订阅不存在/已取消：本地不改，报错引导用户重试或换档到期重购。
- 配置变更窗口（目标档下架/改价）：下单时以服务端实时配置为准，报价与下单间价格变动按下单值冻结。
- `upgrade/confirm` 与续费扣款并发：渠道侧协议操作原子，本地同步按渠道当前 plan 幂等，无锁。

## 验收口径

1. 一次性线：Lite 有效订阅升级 Growth，支付补差后行内档位/配额立即为新档，`expires_at` 与升级前一致。
2. 订阅线：Maps Pro 升级 Business，ClinkBill 按渠道报价折算扣款，仅终态成功换档；关闭页面时 Webhook 仍可同步本地档位。PayPal 自动续费升级被拒绝，一次性补差仍可用。Clink 折算发票不延长账期，完整续费才推进到期时间，续费不回退档位。
3. 不可升级场景（无订阅/已是最高档/补差≤0/过期行）全部被报价接口拒绝，前端有对应文案。
4. 升级订单在管理后台订单详情可见升级快照（`extra_metadata.product_snapshot.purpose=upgrade`，复用现有 JSON 渲染，无 admin 改动）。

## 对既有文档的修订点

- `feat.md`：功能范围加「升级订阅」；异常流程"已有有效订阅时再次购买拒绝"收窄为"非更高档购买拒绝"。
- `tech-订阅商品与状态.md`：履约表补 `purpose=upgrade` 分支与 `start_at` 写入收紧。
- `004/tech-支付与履约.md`：订单分发表补升级分支引用本文。
- `011.Pricing页`：升级按钮态与两路径交互（见该域文档）。
