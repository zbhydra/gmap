# 004 · 金额模型(单字段 + 6 位精度 + Provider 边界转换)

> 技术实现文档。覆盖:订单/商品/支付回调金额字段的统一口径、表字段删除、API 契约、支付渠道边界转换、本地开发配置修复、验收与回滚。
>
> 关联:
> - 本域产品:`@feat.md`
> - 订单数据模型与状态机:`@tech-订单数据与状态机.md`
> - 支付渠道对接与履约:`@tech-支付与履约.md`
> - Credits 商品定价:`@../003.积分系统/tech-购买.md`
> - 订阅商品定价:`@../006.订阅系统/tech-订阅商品与状态.md`

## 0. 目标

把金额模型从「渠道原始金额 + 归一化金额」双字段收敛为「单字段 6 位精度金额」。

最终每个金额语义只保留一个 6 位精度整数单位字段。展示价、渠道收款价、实付价仍是三个不同语义,但每个语义不再同时保留 raw 与 normalized 两套字段:

```text
存储金额 = 真实货币数量 * 1_000_000
```

示例:

| 真实金额 | 存储金额 |
| --- | ---: |
| USD 1.89 | 1_890_000 |
| USD 6.30 | 6_300_000 |
| XTR 850 | 850_000_000 |
| USDT 1.123456 | 1_123_456 |

## 1. 设计决策

### 1.1 最终方案

- 保留 `amount` / `display_amount` / `paid_amount`。
- 删除 `amount_raw` / `display_amount_raw` / `paid_amount_raw`。
- 所有保留金额字段统一为 6 位精度整数。
- 前端、后台和 provider 都只读取一个金额字段,按币种在边界格式化。
- 不保留兼容字段,接受破坏性 API 和数据库变更。
- `display_amount` 是用户可见展示价,不参与支付金额验价;支付验价只认所选渠道的 `currency + amount`。

### 1.2 不采用的方案

| 方案 | 结论 | 原因 |
| --- | --- | --- |
| 继续保留 `raw + amount` 双字段 | 不采用 | `raw` 在 PayPal 美分、Telegram Stars 整数、后台展示价之间含义漂移,是本次 bug 根因 |
| 改成 2 位金额精度 | 不采用 | 当前 USD 足够,但 USDT/USDC 需要 6 位;2 位会重新引入币种特例 |
| 仅修 PayPal provider 除以 100 的问题 | 不采用 | 只能局部止血,后台、配置、API 仍会保留两套金额概念 |

## 2. 字段模型

### 2.1 商品展示价

| 表 | 保留字段 | 删除字段 | 说明 |
| --- | --- | --- | --- |
| `config_credit_product` | `display_currency`, `display_amount` | `display_amount_raw` | Credits 商品用户可见展示价 |
| `config_subscription_product` | `display_currency`, `display_amount` | `display_amount_raw` | 订阅商品用户可见展示价 |

`display_amount` 是用户可见价格的 6 位精度整数。前端展示时做:

```text
display_amount / 1_000_000
```

### 2.2 渠道价格

| 表 | 保留字段 | 删除字段 | 说明 |
| --- | --- | --- | --- |
| `config_credit_product_price` | `currency`, `amount` | `amount_raw` | Credits 商品在具体渠道下的收款金额 |
| `config_subscription_product_price` | `currency`, `amount` | `amount_raw` | 订阅商品在具体渠道下的收款金额 |

`amount` 是渠道收款金额的 6 位精度整数。同一商品可有不同渠道价,但每个渠道价只保留一个金额字段。

配置加载必须校验渠道金额可被对应 provider 无损表示:

| 支付方式 | 币种 | 约束 |
| --- | --- | --- |
| `paypal` | `USD` | `amount > 0` 且 `amount % 10_000 == 0` |
| `telegram_stars` | `XTR` | `amount > 0` 且 `amount % 1_000_000 == 0` |

不满足约束是坏配置,加载 checkout 配置时抛 `PAYMENT_GATEWAY_ERROR`。provider 边界仍重复 exact 校验,禁止舍入或截断。

### 2.3 订单金额

| 表 | 保留字段 | 删除字段 | 说明 |
| --- | --- | --- | --- |
| `orders` | `currency`, `amount` | `amount_raw` | 订单创建时的最终金额快照 |
| `orders` | `paid_currency`, `paid_amount` | `paid_amount_raw` | 支付渠道确认后的实付金额快照 |

`orders` 不再保留历史金额字段;订单金额只以 `amount` 存储。

## 3. API 契约

### 3.1 下单请求

`POST /api/client/order/create` 请求金额字段改为:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `currency` | string | 是 | 当前选中支付渠道币种 |
| `amount` | int | 是 | 当前选中支付渠道金额,6 位精度整数 |

删除 `amount_raw`。

### 3.2 下单响应和订单状态

`CreateOrderResponse`、`OrderStatusResponse`、订单列表、未完成订单列表只返回:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `currency` | string | 订单币种 |
| `amount` | int | 订单金额,6 位精度整数 |

删除 `amount_raw`。

### 3.3 checkout-configs 响应

Credits 与订阅 checkout-configs 统一:

```json
{
  "display_currency": "USD",
  "display_amount": 15_300_000,
  "payment_channels": [
    {
      "payment_method": "paypal",
      "currency": "USD",
      "amount": 15_300_000
    }
  ]
}
```

删除:

- `display_amount_raw`
- `payment_channels[].amount_raw`

### 3.4 价格过期错误

`PAYMENT_PRICE_UPDATED` 的 `data` 只回:

```json
{
  "product_id": "credit_200",
  "payment_method": "paypal",
  "currency": "USD",
  "amount": 15_300_000
}
```

## 4. Service 契约

### 4.1 OrderCheckProductParam

```python
@dataclass
class OrderCheckProductParam:
    user_id: int
    product_class: int
    product_id: str
    payment_method: str
    amount: int
    currency: str
    client_ip: str | None = None
    language: str | None = None
```

### 4.2 OrderCreateParam

```python
@dataclass
class OrderCreateParam:
    user_id: int
    product_class: int
    product_id: str
    product_name: str
    amount: int
    payment_method: str
    currency: str = "USD"
    client_ip: str | None = None
    extra_metadata: str | None = None
    language: str | None = None
```

### 4.3 PaymentRequest

```python
@dataclass
class PaymentRequest:
    order_no: str
    payment_method: str
    order_status: int
    amount: int
    currency: str
    product_name: str
    expired_at: int
```

### 4.4 CallbackVerificationResult

```python
@dataclass
class CallbackVerificationResult:
    valid: bool
    amount: int | None = None
    currency: str | None = None
    ...
```

删除 `amount_raw`。

### 4.5 order_success

`order_service.order_success(...)` 参数改为:

```python
order_success(
    *,
    order_no: str,
    channel_order_no: str,
    channel_uid: str | None,
    payment_method: str,
    extra_metadata: str | None,
    paid_amount: int,
    paid_currency: str,
) -> dict
```

金额校验只比较:

```text
orders.currency == paid_currency
orders.amount == paid_amount
```

## 5. Provider 边界转换

内部金额统一是 6 位精度整数。外部支付渠道需要自己的协议单位时,只允许在 provider 边界转换。

### 5.1 PayPal

PayPal Orders API 需要两位小数字符串:

```text
paypal_amount_value = Decimal(amount) / Decimal(1_000_000)
```

创建 PayPal order 前必须校验:

```text
amount > 0
amount % 10_000 == 0
```

不满足说明 USD 金额无法无损表达为 PayPal 两位小数,直接抛 `PaymentProviderError`,不做四舍五入、截断或补救。

示例:

| 内部 `amount` | PayPal `amount.value` |
| ---: | --- |
| 1_890_000 | `"1.89"` |
| 15_300_000 | `"15.30"` |

PayPal capture 回包的小数字符串转回内部金额:

```text
paid_amount = Decimal(value) * Decimal(1_000_000)
```

转换结果必须是整数且满足 `paid_amount % 10_000 == 0`。否则视为 PayPal 回包金额不可被内部模型无损表达,回调失败并记录错误。

### 5.2 Telegram Stars

Telegram Stars `prices[].amount` 和回调 `total_amount` 都是 Stars 整数。provider 边界规则:

```text
createInvoiceLink.prices[0].amount = amount / 1_000_000
successful_payment.total_amount -> paid_amount = total_amount * 1_000_000
```

创建 invoice 前必须校验:

```text
amount > 0
amount % 1_000_000 == 0
```

不整除说明配置不是整 Stars,直接抛 `PaymentProviderError`,让用户重试或换渠道。

## 6. 展示格式

前端 website 与 admin 后台统一用:

```text
human_amount = amount / 1_000_000
```

格式:

| 币种 | 展示 |
| --- | --- |
| USD | 固定 2 位小数,如 `USD 1.89` / `$1.89` |
| XTR | 去尾 0,如 `XTR 850` |
| USDT / USDC | 最多 6 位小数,去尾 0 |

后台订单页列表和详情都展示 `amount` / `paid_amount`,不再展示 `amount_raw`。

## 7. 本地开发配置修复

本次不提交配置修复脚本,只直接修当前开发环境配置表。上线前按同一顺序人工执行。

需要修复的表:

- `config_credit_product.display_amount`
- `config_credit_product_price.amount`
- `config_subscription_product.display_amount`
- `config_subscription_product_price.amount`

修复口径:

| 旧真实含义 | 新值 |
| --- | ---: |
| USD 1.89 | 1_890_000 |
| USD 6.30 | 6_300_000 |
| USD 15.30 | 15_300_000 |
| XTR 350 | 350_000_000 |
| XTR 850 | 850_000_000 |
| XTR 3500 | 3_500_000_000 |

执行顺序:

1. 关闭充值入口和支付入口。
2. 清空订单表。
3. 修配置表金额为 6 位精度。
4. 删除旧 raw 列。
5. 启动新版后端、website、admin。
6. 拉取 checkout-configs 并人工确认 PayPal 显示 `$1.89` / Telegram Stars provider 收到整 Stars。

手工 DDL:

```sql
TRUNCATE TABLE orders;

ALTER TABLE config_credit_product DROP COLUMN display_amount_raw;
ALTER TABLE config_credit_product_price DROP COLUMN amount_raw;
ALTER TABLE config_subscription_product DROP COLUMN display_amount_raw;
ALTER TABLE config_subscription_product_price DROP COLUMN amount_raw;
ALTER TABLE orders DROP COLUMN cash;
ALTER TABLE orders DROP COLUMN amount_raw;
ALTER TABLE orders DROP COLUMN paid_amount_raw;
```

不处理历史订单。上线前清空订单表;当前充值入口已关闭,不处理新旧订单并发兼容。

## 8. 实施范围

### 8.1 后端

- Model 删除字段:
  - `ConfigCreditProductModel.display_amount_raw`
  - `ConfigCreditProductPriceModel.amount_raw`
  - `ConfigSubscriptionProductModel.display_amount_raw`
  - `ConfigSubscriptionProductPriceModel.amount_raw`
  - `OrderModel.cash`
  - `OrderModel.amount_raw`
  - `OrderModel.paid_amount_raw`
- Schema 删除字段:
  - Credits checkout configs 的 `display_amount_raw` / `amount_raw`
  - Subscription checkout configs 的 `display_amount_raw` / `amount_raw`
  - Order create/status/list 的 `amount_raw`
- 常量 dataclass 删除 `amount_raw`。
- service 价格校验改为只比较 `currency + amount`。
- provider 回调结果和回调 API 改为只传 `amount`。
- `money.py` 保留 `NORMALIZED_AMOUNT_SCALE = 6`、`NORMALIZED_AMOUNT_FACTOR = 1_000_000`、`normalize_currency`;删除按币种 raw scale 转换的概念。

### 8.2 前端与后台

- website Credits 购买类型和请求删除 `display_amount_raw` / `amount_raw`。
- Credits 商品价展示用 `display_amount / 1_000_000`。
- admin 订单类型和订单页删除 `amount_raw` / `paid_amount_raw`。
- admin 订单页金额展示用 `amount` / `paid_amount`。

### 8.3 数据库

`sync_database_schema.py` 当前只会补缺列、改类型、改 nullable、处理索引,不会自动删除数据库多余列。删除字段按 §7 的手工 DDL 执行。

本次设计只使用 `sync_database_schema.py` 做结构同步,不提交其他数据库结构变更脚本;实现后需要人工确认开发库和上线库字段状态:

- `SHOW COLUMNS FROM config_credit_product LIKE 'display_amount_raw';` 无结果。
- `SHOW COLUMNS FROM config_credit_product_price LIKE 'amount_raw';` 无结果。
- `SHOW COLUMNS FROM config_subscription_product LIKE 'display_amount_raw';` 无结果。
- `SHOW COLUMNS FROM config_subscription_product_price LIKE 'amount_raw';` 无结果。
- `SHOW COLUMNS FROM orders LIKE 'cash';` 无结果。
- `SHOW COLUMNS FROM orders LIKE 'amount_raw';` 无结果。
- `SHOW COLUMNS FROM orders LIKE 'paid_amount_raw';` 无结果。

## 9. 验收

- 代码中不再出现业务字段 `cash`、`amount_raw`、`display_amount_raw`、`paid_amount_raw`。
- 下单 API 请求和响应只包含 `currency + amount`。
- Credits / Subscription checkout-configs 只返回 `display_amount` 和渠道 `amount`。
- PayPal 下单 `amount=1_890_000` 时发送给 PayPal 的值是 `"1.89"`。
- PayPal 下单 `amount=1_234_567` 时 provider 拒绝,不创建 PayPal order。
- PayPal capture `"1.89"` 回调落入订单成功入口的 `paid_amount` 是 `1_890_000`。
- Telegram Stars 下单 `amount=850_000_000` 时发送给 Telegram 的 `prices[0].amount` 是 `850`。
- Telegram Stars 下单 `amount=850_500_000` 时 provider 拒绝,不创建 invoice。
- Telegram successful_payment `total_amount=850` 时落入订单成功入口的 `paid_amount` 是 `850_000_000`。
- 订单金额校验只比较 `currency + amount`。
- 后台订单页显示 `USD 1.89`,不显示 `USD 189`。
- 本地开发配置表金额已按 6 位精度修正。

## 10. 验证命令

```bash
cd backend
uv run black --check src/app/models src/app/services src/app/api/client src/app/api/callback src/app/provider/payment src/app/utils
uv run ruff check src/app/models src/app/services src/app/api/client src/app/api/callback src/app/provider/payment src/app/utils
uv run mypy src/app/services/order_service.py src/app/services/subscription_service.py src/app/services/user_credit_service.py src/app/provider/payment/tg_star.py src/app/provider/payment/paypal.py src/app/utils/money.py
uv run pytest tests/test_server/utils/test_money.py -rs
uv run pytest tests/test_server/api/test_order_api.py -rs
uv run pytest tests/test_server/api/test_credit_checkout_config_api.py -rs
uv run pytest tests/test_server/api/test_subscription_checkout_config_api.py -rs
uv run pytest tests/test_server/services/test_telegram_payment_service.py -rs
uv run pytest tests/test_server/services/test_paypal_payment_service.py -rs
uv run pytest tests/test_server/api/test_telegram_callback_api.py -rs
uv run pytest tests/test_server/api/test_paypal_callback_api.py -rs
```

```bash
cd admin
pnpm build
```

```bash
cd website
pnpm build
```

## 11. 风险与回滚

风险:

- 这是破坏性 API 和数据库变更,旧前端/后台/测试不能兼容。
- 配置表若未修复,PayPal 会收到极小金额或 Telegram Stars 会因非整 Stars 被拒绝。
- 删除列不由现有 schema sync 自动完成,需要人工确认数据库结构。

回滚:

- 代码回滚到双字段模型。
- 配置表保留修复后的 6 位金额不会兼容旧双字段模型,回滚代码前需按旧口径重写配置。
- 因上线前订单表会清空,无需回滚历史订单数据。
