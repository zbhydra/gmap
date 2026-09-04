# 006 · 订阅升级

> 状态：待用户批准，禁止实施。
> 产品口径见 `@feat.md`「升级订阅」；本文是唯一技术落点，004/011 只放引用。
> 前置依赖：支付系统同步（`@plans/004.同步支付系统-计费模型与ClinkBill.md`）必须先落地——
> 升级建立在同步后的模型上：订阅实例字段、自然月账期、渠道价 `auto_renew_supported`、Clink 渠道。

## 目标

同一产品线内未过期订阅从中档位换到更高档位（如 Online Lite → Growth、Maps Pro → Business）：
立即生效新档权益，用户只补差价。四条产品线中，`maps_online` / `maps_api` / `maps_extension`
有可升级档位；`extension` 线唯一付费档 Unlimited 之上无更高档，无升级场景（未来加档时本方案直接覆盖，无需改造）。

## 已拍板口径（用户确认前为显式假设）

| # | 决策 | 口径 |
| --- | --- | --- |
| 1 | 差额与到期日 | 折旧补差、立即换档、**到期日不变**：`补差 = 目标档月价 − 当前档月价 × 剩余占比`；与 Stripe / ClinkBill 的 immediate proration 同语义 |
| 2 | 自动续费线收款 | 渠道协议内换价（PayPal `revise` / ClinkBill update），存着的付款方式直接扣折算差额，用户不再走收银台 |
| 3 | 降级 | 本期不做；到期自动降级是既有语义。降级（下期生效/退款规则）独立需求另立 |
| 4 | 渠道范围 | 差额款与协议换价只走 PayPal / ClinkBill；Telegram Stars 不参与升级（`maps_extension` 无 Stars 渠道价；一次性线差额为动态金额无 Stars 价目） |

## 档位序与可升级判定

- 档位高低按商品配置 `sort_order` 升序判定（同产品线内，配置即档位序，seed 已保证 free 最小）。
- 可升级 = 同产品线存在未过期订阅行 ∧ 目标档 `sort_order` 严格大于当前行 `product_id` 对应配置的 `sort_order`。
- 跨产品线不是升级（各线可并存购买，走既有下单链路）。
- 补差金额 ≤ 0 时不可升级：报价接口返回不可升级原因，前端按钮灰化并提示"当前档位剩余价值不低于目标档，到期后换档"。

## 差额计算

```
剩余占比 = (expires_at − now) / (expires_at − period_start)
补差     = 目标档月价(display/渠道价按币种) − 当前档月价 × 剩余占比
```

- `period_start` 取订阅行 `start_at`；行缺失 `start_at`（历史行）按 30 天账期折算。
- 升级特性落地起，一次性线履约也写 `start_at = 本次购买/续期起点`（同步方案中一次性履约 `start_at` 为空，此处收紧）。
- 金额模型沿用 6 位精度整数与现有 `money` 工具；向下取整到渠道最小单位，差价 ≤ 0 视为不可升级。
- 订阅线（渠道 revise）最终扣款额由渠道折算得出，可能与站点展示额有微小出入：以渠道为准，本地不二次对账。

## 两条升级路径

### 路径 A：一次性线（maps_online / maps_api）——差额订单走收银台

1. `GET /api/client/subscription/upgrade-quote?product_line=&target_product_id=`（登录）：
   返回可升级性、当前/目标档、`currency`、`amount`（补差）、`expires_at`（保持不变）。
   实时计算，不落库、无报价单状态；每次展示与下单各算一次，以下单冻结值为准。
2. `POST /api/client/subscription/upgrade/checkout`（登录），body：`product_line + target_product_id + payment_method`：
   - 服务端校验可升级判定与渠道可用性后**服务端定价**创建订单：`product_class=SUBSCRIPTION`，
     `amount` = 服务端算出的补差，`extra_metadata.product_snapshot` 冻结
     `purpose="upgrade"` + `target_product_id` + `base_expires_at` + 折算输入（`period_start`、当前档、占比），
     并**跳过现有 `check_product` 的同线有效订阅拦截与客户端价比对**（差额是动态价，不存在配置价目）。
   - 调 Provider `create_payment` 返回支付数据，前端复用 order-checkout 弹窗完成支付与轮询。
3. 支付成功回调 → 履约分支：快照 `purpose=upgrade` 时**只换档不续期**——
   upsert 行内 `product_id = target_product_id`、`product_price_id`、`payment_method`，
   `expires_at` 保持 `base_expires_at` 不变，`auto_renew=false`、渠道引用字段清空。
   配额即时跟随行内 `product_id` 生效（`usage_service` 读行内档位），当月已用量自然延续。

### 路径 B：自动续费线（maps_extension）——渠道协议内换价

1. `GET upgrade-quote` 同上（展示补差估算）。
2. `POST /api/client/subscription/upgrade/confirm`（登录），body：`product_line + target_product_id`：
   - 前端确认弹窗（展示补差估算与"将立即扣款"）后调用；**不创建订单、不走收银台**。
   - 服务端按行内 `channel_subscription_id` 调渠道换价：PayPal `POST /v1/billing/subscriptions/{id}/revise`，
     ClinkBill update（preview → confirm，`immediate=true` 立即折算扣款）。
   - 渠道调用成功即本地同步换档：行内 `product_id / product_price_id` 更新为新档，
     `expires_at`、`channel_subscription_id`、`payment_method`、`auto_renew=true` 不变；写 `cancelled_at=null`。
   - 渠道返回成功但本地换档失败：返回错误让用户重试（confirm 幂等：重复调用按渠道"已是该价"幂等成功）。
3. 渠道折算扣款的后续 webhook（PayPal `PAYMENT.SALE.COMPLETED`、Clink `invoice.paid`）按既有续费履约兜底，
   依赖下节「续费履约档位保护」不把档位打回旧档。

### 续费履约档位保护（随本特性一并落地的履约规则修正）

自动续费履约（同步方案中的 `_fulfill_auto_renew` 路径）**只在首购单上覆盖行内 `product_id`**：
回调解析出的 `provider_subscription.original_order_no` 等于当前回调单号时才写档位与 `product_price_id`；
续费/折算发票回调只推进 `expires_at` 等账期事实，不覆盖档位。否则升级后下一期续费会把档位快照打回首购档。

## 接口合同

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/client/subscription/upgrade-quote` | GET | 展示用实时报价；未登录 401，无可升级返回 `available=false` + `reason` |
| `/api/client/subscription/upgrade/checkout` | POST | 一次性线差额订单创建 + 支付数据；幂等性同普通下单（不锁，重复支付按履约兜底） |
| `/api/client/subscription/upgrade/confirm` | POST | 订阅线渠道换价 + 本地换档；幂等成功 |

`upgrade-quote` 响应 data（最小合同）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `available` | bool | 是否可升级 |
| `reason` | string \| null | 不可升级原因：`no_active_subscription` / `not_higher_tier` / `non_positive_diff` / `channel_unavailable` |
| `current_product_id` / `target_product_id` | string | 当前与目标档 |
| `currency` | string | 跟随目标档在指定渠道的渠道价币种 |
| `amount` | int | 补差金额（6 位精度整数），渠道折算扣款时为估算值 |
| `expires_at` | int | 升级后到期时间（= 当前到期时间，不变） |

`upgrade-quote` 请求需带 `payment_method`（差额币种与渠道相关）；`upgrade/confirm` 不需要。

## 渠道能力矩阵

| 渠道 | 路径 A（差额单） | 路径 B（协议换价） | 依据 |
| --- | --- | --- | --- |
| PayPal | 一次性差额单（现有 Orders API） | `revise`：折算立即扣款，`next_billing_time` 不变 | Subscriptions API revise |
| ClinkBill | 一次性 Hosted Checkout Session（现有） | update preview→confirm，`immediate=true` 折算；事件 `subscription.updated.plan_changed` | docs.clinkbill.com/subscriptions |
| Telegram Stars | 不参与（无动态价目） | 不支持协议修改（Bot API 无 revise） | — |

## 异常流程

- 升级差额单支付回调时订阅行已过期：履约失败（快照校验 `base_expires_at` 失效），订单进入异常待人工/退款；
  前端订单状态展示失败文案。不做"过期按整期新购"折中，避免临期小额补差套利。
- 并发两笔升级单都支付成功：后履约者为准，先到差额不退，极少数由支持处理（与既有重复付款口径一致）。
- 订阅线渠道 revise 返回订阅不存在/已取消：本地不改，报错引导用户重试或换档到期重购。
- 配置变更窗口（目标档下架/改价）：下单时以服务端实时配置为准，报价与下单间价格变动按下单值冻结。
- `upgrade/confirm` 与续费扣款并发：渠道侧协议操作原子，本地换档幂等，无锁。

## 验收口径

1. 一次性线：Lite 有效订阅升级 Growth，支付补差后行内档位/配额立即为新档，`expires_at` 与升级前一致。
2. 订阅线：Maps Pro（PayPal/Clink）升级 Business，渠道扣折算差额，本地档位立即更新，
   下一期续费按新价扣款且续费回调不回退档位（续费履约档位保护）。
3. 不可升级场景（无订阅/已是最高档/补差≤0/过期行）全部被报价接口拒绝，前端有对应文案。
4. 升级订单在管理后台订单列表可见且带升级标记，金额为补差金额。

## 对既有文档的修订点

- `feat.md`：功能范围加「升级订阅」；异常流程"已有有效订阅时再次购买拒绝"收窄为"非更高档购买拒绝"。
- `tech-订阅商品与状态.md`：履约表补 `purpose=upgrade` 分支与 `start_at` 写入收紧。
- `004/tech-支付与履约.md`：订单分发表补升级分支引用本文。
- `011.Pricing页`：升级按钮态与两路径交互（见该域文档）。
