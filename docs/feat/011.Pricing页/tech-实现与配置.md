# 011 · Pricing 实现与配置

> 技术说明。数据库配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL,不得新增迁移脚本。
> 实现状态:前端已提供 PayPal 与 Telegram Stars 自助取消指引;站内调用支付渠道取消自动续费仍为后续参考。

## 前端结构

Pricing 页面在 `website` 中拆分:

- `website/src/pages/pricing.astro`:英文默认路由。
- `website/src/pages/[lang]/pricing.astro`:多语言路由。
- `website/src/components/pages/PricingPage.astro`:读取 locale 文案并装配页面。
- `website/src/components/pricing/PricingPageShell.astro`:页面 DOM 壳。
- `website/src/components/pricing/pricing-page-controller.ts`:登录态、商品加载、下单与取消指引入口状态。
- `website/src/components/pricing/pricing-checkout.ts`:订阅 checkout client 和订单协议。
- `website/src/components/pricing/PricingCancellationGuideModal.astro`:PayPal 与 Telegram Stars 自助取消路径的信息弹窗。
- `website/src/components/pricing/PricingSubscriptionConfirmModal.astro`:订阅安装确认、好评倒计时与领取结果专用弹窗。
- 后续实现站内直接取消自动续费时,继续复用 Pricing 账号状态区;API client 放在 `pricing-checkout.ts` 或订阅专用 helper 中,不要新建第二套支付弹窗。
- `website/src/components/pricing/PricingAuthModal.astro`:Pricing 登录弹窗。

Credits 购买复用 `website/src/components/credit-purchase/`。

## 后端接口

Pricing 依赖以下客户端接口:

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/auth/me` | 返回用户、Credits 余额、订阅状态/过期时间 |
| `GET /api/client/credit/checkout-configs` | Credits 一次性购买套餐 |
| `GET /api/client/subscription/checkout-configs` | Free/Unlimited 等订阅商品配置与好评赠送永久领取次数 |
| `POST /api/client/subscription/review-reward/claim` | 计划接口:登录账号领取一次 7 天好评赠送订阅 |
| `POST /api/client/subscription/cancel-auto-renew` | 后续接口:取消当前用户 Unlimited 自动续费;当前暂不实现 |
| `POST /api/client/order/create` | Credits 和订阅统一创建订单 |
| `GET /api/client/order/status/{order_no}` | 支付后轮询订单状态 |

`/api/client/subscription/status` 继续保留给插件兼容,不作为 website 下载额度来源。

好评赠送专用弹窗、倒计时和领取结果见 `@tech-好评赠送.md`;不扩展全站通用确认框。

Pricing 账户摘要中的 `subscription.expires_at` 用于判断订阅按钮状态。已有有效 Unlimited 时按钮软灰化,点击后提示不可重复购买;按钮不使用原生 `disabled`,否则无法响应点击提示。

取消指引入口同时读取 `subscription.expires_at` 与 `subscription.auto_renew`:仅未过期且自动续费的订阅在顶部账号状态区显示“取消”按钮。点击后打开原生 `dialog`,同时展示 Telegram Stars 的 4 步路径与 PayPal 的 6 步路径;不请求取消接口,不修改订阅状态。当前不读取 `subscription.cancel_available/cancel_at_period_end`。后续实现站内直接取消时,入口仍放在账号订阅行,不放在 Unlimited 套餐卡片里。

`utm_source=extension` 切换插件来源 CTA,不隐藏账号摘要;页面隐藏 Credits 积分包且不请求 Credits checkout 配置,只加载与插件权益相关的 Unlimited。插件来源页面初始化时还会通过用户系统的统一发送函数补发 Website 登录态,分别通知正式版和预发布版两个固定扩展 ID;普通入口保持“账号 → Credits → Unlimited”且不触发补发。

网页检测到 `utm_source=extension&source=quota_upgrade_button` 时,异步上报 `web_pricing_open_from_extension`:同时写 SLS 与后端 `mark_logs`,`mark_msg` 保存这两个来源参数。该曝光不去重,每次页面加载和刷新都新增一条;打点失败不阻断账号与商品加载。其他插件来源不写这个类型。

订阅确认弹窗点击“去好评”时,通过同一 `recordHomepageMark()` 双写 `web_extension_store_review_click`,`mark_msg` 为空。每次真实点击都发起一次,上报不等待结果;失败只记录前端错误,不阻断 Chrome Web Store 新标签页和 30 秒倒计时。

## 订阅商品配置

`config_subscription_product.product_id` 是 SKU,不要求等于 `period`。当前约定:

| product_id | period | 说明 |
| --- | --- | --- |
| `free` | `free` | Free 可配置订阅档,当前 daily limit = 5 |
| `unlimited` | `month` | Unlimited 月度订阅,续费方式由 metadata 配置 |

metadata:

```json
{
  "daily_limit": -1,
  "auto_renew": false,
  "proxy_user_rate_limit_mb_per_second": 0
}
```

`daily_limit = -1` 表示不限次数;Free 当前为 `5`。`auto_renew=true` 创建渠道订阅,`auto_renew=false` 创建一次性支付并按 `duration_days` 发放订阅权益。切换续费方式只修改 `auto_renew`。

## sql_executor.py 配置命令

以下命令是直接 SQL 配置方式。实际执行时替换数据库连接参数和价格。不要把这些 SQL 做成迁移脚本。

### 1. Upsert Free 商品

```bash
cd backend
uv run python src/app/init/sql_executor.py \
  --host "$DB_HOST" \
  --port "${DB_PORT:-3306}" \
  --user "$DB_USER" \
  --password "$DB_PASSWORD" \
  --database "$DB_NAME" \
  --sql "INSERT INTO config_subscription_product (product_id,name,period,duration_days,display_currency,display_amount,enabled,sort_order,metadata,created_at,updated_at) VALUES ('free','Free','free',0,'USD',0,1,10,'{\"daily_limit\":5,\"auto_renew\":false,\"proxy_user_rate_limit_mb_per_second\":0}',UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000,UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000) ON DUPLICATE KEY UPDATE name=VALUES(name),period=VALUES(period),duration_days=VALUES(duration_days),display_currency=VALUES(display_currency),display_amount=VALUES(display_amount),enabled=VALUES(enabled),sort_order=VALUES(sort_order),metadata=VALUES(metadata),updated_at=VALUES(updated_at);"
```

### 2. Upsert Unlimited 商品

示例价格为 `$12.99`。如定价调整,只改 `display_amount` 和价格表 `amount`。

```bash
cd backend
uv run python src/app/init/sql_executor.py \
  --host "$DB_HOST" \
  --port "${DB_PORT:-3306}" \
  --user "$DB_USER" \
  --password "$DB_PASSWORD" \
  --database "$DB_NAME" \
  --sql "INSERT INTO config_subscription_product (product_id,name,period,duration_days,display_currency,display_amount,enabled,sort_order,metadata,created_at,updated_at) VALUES ('unlimited','Unlimited','month',30,'USD',12990000,1,20,'{\"daily_limit\":-1,\"auto_renew\":false,\"proxy_user_rate_limit_mb_per_second\":0}',UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000,UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000) ON DUPLICATE KEY UPDATE name=VALUES(name),period=VALUES(period),duration_days=VALUES(duration_days),display_currency=VALUES(display_currency),display_amount=VALUES(display_amount),enabled=VALUES(enabled),sort_order=VALUES(sort_order),metadata=VALUES(metadata),updated_at=VALUES(updated_at);"
```

### 3. Upsert PayPal 价格

```bash
cd backend
uv run python src/app/init/sql_executor.py \
  --host "$DB_HOST" \
  --port "${DB_PORT:-3306}" \
  --user "$DB_USER" \
  --password "$DB_PASSWORD" \
  --database "$DB_NAME" \
  --sql "INSERT INTO config_subscription_product_price (product_id,channel_code,currency,amount,provider_sku,enabled,created_at,updated_at) VALUES ('unlimited','paypal','USD',12990000,'unlimited-monthly-paypal',1,UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000,UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000) ON DUPLICATE KEY UPDATE currency=VALUES(currency),amount=VALUES(amount),provider_sku=VALUES(provider_sku),enabled=VALUES(enabled),updated_at=VALUES(updated_at);"
```

执行后可用同一脚本查询确认:

```bash
cd backend
uv run python src/app/init/sql_executor.py \
  --host "$DB_HOST" \
  --port "${DB_PORT:-3306}" \
  --user "$DB_USER" \
  --password "$DB_PASSWORD" \
  --database "$DB_NAME" \
  --sql "SELECT product_id,period,display_amount,enabled,metadata FROM config_subscription_product WHERE product_id IN ('free','unlimited');"
```

## 订单履约

订阅订单创建时把商品快照写入 `orders.extra_metadata.product_snapshot`,包括:

- `period`
- `duration_days`
- `metadata`
- `provider_sku`

支付成功 webhook 只更新订单支付状态并触发统一订单履约。订单系统按 `product_class` 分发:

- `RECHARGE`:发放 Credits。
- `SUBSCRIPTION`:读取订单快照 `duration_days`,续期 `user_subscriptions.expires_at`。

订阅下单前会拒绝已有未过期 Unlimited 的用户再次创建普通订阅订单,减少重复购买。该检查不增加并发锁或跨渠道协议协调;用户分别确认的两笔付款都成功时由履约层按订单快照续期,极少数重复订阅由支持处理。`user_subscriptions` 只表示 Unlimited 到期时间。
