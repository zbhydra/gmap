# 004 · ClinkBill 支付渠道

> 状态：待用户批准，尚未实施。
>
> 本文定义 ClinkBill Hosted Checkout 对接的最终合同。Credits 一次性支付与 Unlimited 一次性/自动续费必须在同一次交付中完成，不发布仅支持一次性支付的中间版本。

## 1. 目标与边界

### 1.1 目标

- 新增 `clink` Payment Provider，复用现有统一下单、支付回调、订单 CAS 和履约链路。
- 服务端用 `CLINK_SECRET_KEY` 创建 Checkout Session，对外返回 `checkoutUrl`。
- 客户在 ClinkBill Hosted Checkout 完成支付；一次性支付只由验签后的 `order.succeeded` 确认，自动续费只由验签后的 `invoice.paid` 确认。
- Credits 始终创建一次性支付。
- Unlimited 按创建订单时的 `metadata.auto_renew` 决定一次性或自动续费。
- 支持 Sandbox 首笔真实支付验收，交付本地 curl、Webhook CLI 和数据库核对步骤。

### 1.2 非目标

- 不实现退款、部分退款、争议处理或对账系统。
- 不实现用户对已生效订阅开启/关闭自动续费。本期的“动态修改”只指运营修改 Unlimited 商品配置，影响之后创建的订单。
- 不新建支付订单、支付尝试或 Webhook Inbox 表。
- 不改写现有订单状态机、履约事务或补偿任务。
- 不引入 Clink SDK 或新 Web 框架；使用项目已有 `httpx`。

## 2. 已证实的现有合同

- `SubscriptionProductMetadata.auto_renew` 是运营可修改的 JSON bool，付费商品不在代码中写死计费方式。
- 创建订阅订单时，`check_product` 只读取一次运营配置：同一份配置既生成 `OrderCreateParam.auto_renew`，也完整写入 `orders.extra_metadata.product_snapshot.metadata`。因此 `auto_renew` 在本地订单创建时已经冻结，不需要新增订单字段。
- 订单创建后，`OrderCreateParam.auto_renew` 立即通过 `PaymentRequest` 传给 Provider；创建 Clink Session 不再读取实时运营配置。
- 自动续费回调可通过 `RecurringPaymentReference.original_order_no` 定位首单；首单已支付时，订单服务会按新的渠道扣款号创建本地续费订单。
- 一次性重复回调由现有订单状态 CAS 和履约状态 CAS 收敛；自动续费并发回调额外复用 OrderService 已有 Redis 短锁和渠道扣款号查重，不新增 Clink 专用幂等层。
- `orders.payment_data` 可保存 Clink `sessionId` 和 Checkout URL；`orders.payment_channel_order_no` 可保存本次履约的渠道幂等号。

## 3. 渠道配置

### 3.1 渠道标识

| 字段 | 值 |
| --- | --- |
| `channel_code` | `clink` |
| `channel_name` | `ClinkBill` |
| `config_json.environment` | `sandbox` / `live` |
| `config_json.request_timeout_seconds` | 正数，不在 Provider 中写死 |

Provider 根据 `environment` 选择官方固定 API 根地址，不允许从前端或下单请求覆盖：

| 环境 | API 根地址 |
| --- | --- |
| `sandbox` | `https://uat-api.clinkbill.com/api/` |
| `live` | ClinkBill 正式 API 官方根地址，上线前用当时 OpenAPI 复核 |

### 3.2 密钥

| 环境变量 | 用途 | 来源 |
| --- | --- | --- |
| `CLINK_SECRET_KEY` | 创建 Session 和调用服务端 API | Sandbox Dashboard API Key |
| `CLINK_WEBHOOK_SIGNING_KEY` | Webhook HMAC-SHA256 验签 | `clink webhook endpoint ensure --save-secret` |

- 两个密钥只存在运维侧 `.env.*`、业务服务器权限为 `0600` 的运行时 `.env` 或密钥管理器。
- 不写入源码、`config.yaml`、`config_payment_channel.config_json`、Supervisor 模板、前端变量、日志、测试 fixture 或文档示例，也不作为部署脚本命令行参数传输。
- 部署脚本把两个值通过标准输入安全同步到业务服务器运行时 `.env`，Supervisor 启动业务进程时加载该文件；download 节点不生成、不读取。
- Provider 直接读取模块级环境配置，不新增依赖注入。

### 3.3 商品与渠道价

Credits 和 `auto_renew=false` 的 Unlimited 使用非注册商品模式，不需要 Clink Product/Price ID。

`auto_renew=true` 的 Unlimited 必须使用 Clink 预注册商品与 recurring Price：

| 本地字段 | Clink 字段 | 处理 |
| --- | --- | --- |
| 新增 `config_subscription_product_price.provider_product_id` | `productId` | 保存 `prd_...` |
| 现有 `provider_sku` | `priceId` | Clink 价格行保存 `price_...` |

- 不把两个 ID 拼接进一个字符串，不用 JSON 字符串伪装 SKU。
- `provider_product_id` 是渠道价属性，不放入全局渠道配置。
- 订阅订单快照补充 `provider_product_id`。计费模式只由下单时冻结的 `metadata.auto_renew` 决定；`provider_product_id` 和 `provider_sku` 只冻结该笔 recurring Checkout 使用的 Clink Catalog 资源。
- 使用官方 `clink catalog validate/plan/import` 创建 Sandbox Product/Price，再用项目 `sql_executor.py` 写入渠道价配置。

## 4. Checkout Session

### 4.1 公共请求字段

| Clink 字段 | 本地来源 |
| --- | --- |
| `referenceCustomerId` | 登录用户 ID |
| `merchantReferenceId` | `orders.order_no` |
| `originalAmount` | `orders.amount` 从 6 位精度整数转为主币种单位 |
| `originalCurrency` | `orders.currency` |
| `uiMode` | `hostedPage` |
| `successUrl` / `cancelUrl` | 由服务端公开 Website 根地址生成 |
| `metadata.order_no` | `orders.order_no` |

- 请求头使用 `X-API-Key: CLINK_SECRET_KEY`、当前毫秒 `X-Timestamp` 和 `Content-Type: application/json`。
- 金额只在 Provider 边界转换一次。数量固定为 1，`originalAmount` 必须与商品单价一致。
- 价格、币种、商品名、返回 URL 和引用 ID 全部由服务端订单快照/配置决定，不接受前端覆盖。

### 4.2 一次性分支

Credits 和 `auto_renew=false` Unlimited 发送：

```json
{
  "priceDataList": [
    {
      "name": "<order product snapshot>",
      "quantity": 1,
      "unitAmount": 12.99,
      "currency": "USD"
    }
  ]
}
```

不同时发送 `productId` / `priceId`。

### 4.3 自动续费分支

`auto_renew=true` Unlimited 发送：

```json
{
  "productId": "prd_...",
  "priceId": "price_..."
}
```

不发送 `priceDataList`。两个 ID 任一缺失时，该笔订单创建支付入口失败，用户修正运营配置后重试。

### 4.4 本地返回合同

Clink 成功响应取 `data.sessionId` 和 `data.url`，保存为：

```json
{
  "sessionId": "sess_...",
  "checkoutUrl": "https://uat-checkout.clinkbill.com/pay/...",
  "payment_url": "https://uat-checkout.clinkbill.com/pay/...",
  "url": "https://uat-checkout.clinkbill.com/pay/..."
}
```

- `checkoutUrl` 是 Clink 明确合同。
- `payment_url` 供现有统一前端读取；这不是旧版兼容层，而是当前 Payment Provider 统一返回合同。
- Session 创建时还没有 Clink Order，不写 `channel_order_id`，不用 `sessionId` 伪装渠道扣款号。

## 5. Webhook

### 5.1 路由与订阅事件

```text
POST /api/callback/clink/payment
```

本期只注册并处理两个成功事件：

- `order.succeeded`：一次性 Credits 和 `auto_renew=false` Unlimited。
- `invoice.paid`：`auto_renew=true` Unlimited 的首期与后续每期扣款。

Clink 可能同时发送 recurring `order.succeeded`；该事件验签、识别为 recurring 后直接返回 2xx，不触发履约。自动续费只认 `invoice.paid`，避免同一账期被 Order 和 Invoice 两种事件各履约一次。

退款、争议、取消和订阅状态同步不在本期注册事件中。续费失败不会延长本地到期时间；当前权益到期后自然失效，因此本期不需要复制 Clink 订阅状态机。

### 5.2 验签顺序

1. 读取未修改的原始 body，不先解析 JSON。
2. `X-Clink-SignType` 必须等于 `SHA256`。
3. `X-Clink-Timestamp` 必须是整数秒或毫秒时间戳，与当前时间前后相差不超过 300 秒。
4. 签名原文为 `timestamp + "." + raw_body`。
5. 用 `CLINK_WEBHOOK_SIGNING_KEY` 计算 HMAC-SHA256 hex，使用常量时间比较。
6. 验签成功后才解析 JSON，校验 `event_` ID、`object="event"`、毫秒 `created`、允许的事件类型和对象形式 `data.object`。

验签、结构或事件类型不合法时返回非 2xx，不进入订单服务。

### 5.3 一次性支付对账

`order.succeeded` 且 `data.object.type="onetime"` 时，Provider 在返回 `CallbackVerificationResult` 前完成下列核对：

1. `data.object.merchantReferenceId` 精确定位本地订单。
2. 本地订单的 `payment_method` 必须是 `clink`。
3. 本地 `payment_data.sessionId` 必须与 `data.object.sessionId` 一致。
4. `amountTotal` 转换为项目 6 位精度整数后，必须与本地订单 `amount` 一致。
5. `paymentCurrency` 必须与本地订单 `currency` 一致。
6. 订单快照中的 `auto_renew` 必须是 `false`。

项目已有 Provider 查询本地订单的先例；Clink 本地双引用核对放在 Provider 内，不给通用 OrderService 添加 Clink 专用分支。

一次性成功映射为：

```text
channel_order_no = data.object.orderId
order_no = data.object.merchantReferenceId
```

Provider 把已验证金额/币种的结果交给现有 `handle_payment_callback`。`orderId + 订单 CAS` 负责重复投递幂等，不新增 Redis 或数据库 Inbox。

### 5.4 自动续费对账与成功映射

`invoice.paid` 以 Clink 的 `subscriptionId + invoiceId` 表示订阅关系和本账期，不能套用一次性订单的 `merchantReferenceId + sessionId` 规则。Provider 按以下顺序处理：

1. 从 Invoice 事件取得 `subscriptionId`、`invoiceId`、`orderId`、金额和币种。
2. 服务端调用 `GET /subscription/{subscriptionId}`，取得该订阅的 `merchantReference` 和 `sessionId`。
3. 用 `merchantReference` 精确定位首笔本地订单，再比对本地 `payment_data.sessionId`、`payment_method=clink` 和订单快照 `auto_renew=true`。
4. 比对 Invoice 金额、币种与首单；本期不支持促销码和中途变价，因此每期金额必须与首单快照一致。
5. 任一查询或核对失败就返回非 2xx，等待 Clink 重试；不新增本地恢复任务。

核对通过后映射为：

```text
channel_order_no = invoice.invoiceId
transaction_id = invoice.orderId
recurring_reference.original_order_no = subscription.merchantReference
```

- `invoiceId` 进入现有 `(payment_method, payment_channel_order_no)` 查重与续费建单链路，保证同一账期只履约一次。
- Clink `subscriptionId`、`orderId`、`invoiceId`、`sessionId`、`event.id` 保存在订单支付扩展元数据中用于排查；不把它们提升为新的本地订阅状态，也不为本期新增订单字段。
- 首期支付时首单仍为 `PENDING`，现有链路直接将首单置为已支付并发放 30 天 Unlimited。
- 后续扣款时首单已为 `PAID`，现有链路按新 `invoiceId` 创建本地续费订单，复制首单商品快照并续期。
- 运营之后把 `auto_renew` 修改为 `false` 不影响已存在的 Clink 周期协议；续费订单继续使用首单快照。

Clink 针对 `order.succeeded` 的 API 文档明确允许按 `event.id` 或 `orderId` 幂等；订阅指南要求每个 `invoiceId` 只履约一次。本方案分别使用 `orderId` 和 `invoiceId` 进入现有订单幂等链路，并复用自动续费已有 Redis 短锁，不增加 Clink 专用 Redis key 或持久 Inbox 真相源。

Clink 通用 skill 推荐所有事件额外写入按 `event.id` 唯一的持久 Inbox。本项目只消费两个支付成功终态，底层业务对象已经分别有稳定的 `orderId` / `invoiceId`，且用户接受 Redis 或数据库短暂故障时由渠道重试，因此明确不引入该通用加固层。

## 6. 前端合同

- `clink` 加入 Credits 和 Unlimited checkout 允许的支付渠道集合。
- 渠道展示名从后端 `payment_method_name` 读取，不在多个组件各自写死。
- 读取 URL 顺序包含 `checkoutUrl`、`payment_url`、`url`，最终只允许 HTTPS 且 host 为 ClinkBill 官方 Checkout 域名：Sandbox `uat-checkout.clinkbill.com`，正式 `checkout.clinkbill.com`。
- 用户点击支付后在新标签页打开 Hosted Checkout，原页继续轮询本地订单状态。
- Clink `successUrl` 只返回 Website，不向原页发送“已支付”信号，不绕过现有订单轮询。

## 7. 错误语义

- Session 创建网络失败、超时、Clink 非 2xx、响应结构错误：抛出包含本地订单号、请求路径、HTTP 状态和 Clink 错误码的 `PaymentProviderError`，用户重试创建新订单。
- Webhook 验签失败：非 2xx，不查订单、不履约。
- Webhook 对账不一致：非 2xx，错误必须包含 event ID、Clink order/invoice/session ID 和本地订单号，不自动修正。
- 重复 Webhook：返回 2xx 幂等结果，不重复履约。
- 密钥缺失：`clink` 渠道创建 Provider 失败，其他支付渠道不受影响。
- 日志不输出 Secret Key、Webhook 签名、完整 Checkout URL token 或完整原始支付方式信息。

## 8. 配置与首笔支付验收

### 8.1 Webhook 注册

Sandbox 使用与当前 skill 一起发布的 CLI，不使用另一个 customer wallet `clink-cli`：

```bash
clink webhook endpoint ensure \
  --url https://<public-api>/api/callback/clink/payment \
  --events order.succeeded,invoice.paid \
  --save-secret \
  --sync-env-file <ignored-env-file> \
  --json
```

命令成功后重启/重新部署后端，使新的 `CLINK_WEBHOOK_SIGNING_KEY` 生效。

### 8.2 最小 demo

交付时提供两组可直接运行的 curl：

1. 调用项目 `POST /api/client/order/create` 创建 Credits/Unlimited Clink 订单，从 `data.payment_data.checkoutUrl` 取支付地址。
2. 仅用于排查的直连 Sandbox `POST /checkout/session` 示例，密钥只从当前 shell 环境变量读取。

两组示例都不包含真实密钥、真实用户 token 或固定线上商品价格。

### 8.3 真实 Sandbox 验收

1. 确认后端渠道开启，创建一笔 Clink 订单。
2. 检查返回包含 `sessionId` 和 HTTPS `checkoutUrl`，数据库订单仍为待支付。
3. 由人在 Hosted Checkout 完成 Sandbox 支付。
4. 确认真实 Clink Webhook 命中公网端点并返回 2xx，不以本地 simulate 代替。
5. 核对本地订单为已支付且履约成功，Credits 余额或 Unlimited 到期时间已实际变化。
6. 重放同一一次性事件和同一 Invoice 事件，确认本地订单幂等返回，权益不再增加。
7. 分别把 Unlimited `metadata.auto_renew` 设为 `false` 和 `true` 创建新订单，确认前者发送 `priceDataList`，后者发送 `productId + priceId`，两者均能完成首期履约。
8. 对自动续费 Sandbox 订阅使用 Clink Test Clock 推进一个周期，确认新 `invoiceId` 产生新本地续费订单且只续期一次；后续运营修改 `auto_renew` 不改变该结果。

## 9. 官方证据

- [ClinkBill Integration Skill](https://github.com/clinkbillcom/clink-integ-skills)
- [API Introduction](https://docs.clinkbill.com/api-reference/introduction)
- [OpenAPI](https://docs.clinkbill.com/api-reference/openapi.json)
- [Hosted Checkout](https://docs.clinkbill.com/build-integration)
- [Checkout Session](https://docs.clinkbill.com/guides/payments/checkout_session)
- [Subscriptions](https://docs.clinkbill.com/subscriptions)
- [Order Webhook](https://docs.clinkbill.com/api-reference/webhook/order)

本次设计使用的 skill 仓库版本已于 2026-08-20 刷新官方文档缓存，捆绑 `clink-integ-cli 0.2.1`。实施和上线前必须重跑 freshness gate，不使用本文代替当时官方合同。
