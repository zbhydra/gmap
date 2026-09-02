# 011 · Pricing 实现与配置

> 技术说明,以现役 MapsGrab 站(website/)三产品线 tab 版 Pricing 页为口径。数据库配置必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL 或幂等播种脚本,不得新增迁移脚本。
> 实现状态:前端已提供 PayPal 自助取消指引(仅自动续费的 Extension 订阅展示);站内调用支付渠道取消自动续费仍为后续参考。

## 前端结构

Pricing 页面在 `website` 中拆分:

- `website/src/pages/pricing.astro`:英文默认路由。
- `website/src/pages/[lang]/pricing.astro`:多语言路由。
- `website/src/components/pages/PricingPage.astro`:读取文案(`src/i18n/pricing.ts`)并装配页面。
- `website/src/components/pricing/PricingPageShell.astro`:页面 DOM 壳(SSR 静态渲染三 tab 与全部档位卡)。
- `website/src/components/pricing/pricing-page-controller.ts`:登录态恢复、tab 切换(唯一状态源)、支付配置加载、购买按钮态、checkout 打开与账号摘要渲染。
- `website/src/components/pricing/pricing-checkout.ts`:订阅 checkout-configs client、产品线常量与支付配置解析。
- `website/src/components/pricing/PricingAuthModal.astro` + `pricing-auth-controller.ts`:登录/注册弹窗。
- `website/src/components/pricing/PricingCancellationGuideModal.astro`:PayPal 自助取消三步路径的信息弹窗。
- 支付弹窗复用全站统一组件 `website/src/components/order-checkout/`(OrderCheckoutModal 等),Pricing 不自建第二套支付弹窗。
- PayPal 回跳页:`website/src/pages/paypal/success.astro` / `cancel.astro`,按订单 `product_class` 分发文案。
- `website/src/components/credit-purchase/`:旧站 Credits 购买组件,现役 Pricing 页不消费,保留为共享基建历史代码。

## 后端接口

Pricing 依赖以下客户端接口:

| 接口 | 用途 |
| --- | --- |
| `GET /api/client/auth/me` | 返回用户与各产品线订阅摘要(`maps_online_subscription` / `maps_extension_subscription` / `maps_api_subscription`) |
| `GET /api/client/subscription/checkout-configs` | 全部启用订阅商品与 PayPal 渠道价(响应含好评赠送合同字段,页面不消费) |
| `POST /api/client/order/create` | 统一创建订阅订单 |
| `GET /api/client/order/status/{order_no}` | 支付后轮询订单状态 |

`/api/client/subscription/status` 继续保留给插件兼容,Pricing 不使用。`POST /api/client/subscription/review-reward/claim` 与 `cancel-auto-renew` 为 006 域合同/后续接口,现役页面不调用。

页面灰化与拦截口径:当前 tab 产品线在 auth/me 中有未过期订阅时,该线付费卡按钮加软灰态(`aria-disabled` + 样式类,不用原生 `disabled` 以保留点击提示),点击提示须等当前档到期;与后端下单校验同口径。取消指引按钮只在当前线订阅 `status=active`、`expires_at` 未过期且 `auto_renew=true` 时显示(现役商品中仅 Extension 两档可能满足);点击打开 PayPal 三步路径弹窗,不请求取消接口、不修改订阅状态。

`utm_source=extension` 只做归因标记:给全部购买按钮加 `data-ga-source=extension` 供 GA4 通道上报,不切换布局、不隐藏任何卡片。

## 订阅商品配置

`config_subscription_product.product_id` 是 SKU,不要求等于 `period`。当前约定:

| product_id | period | 说明 |
| --- | --- | --- |
| `free` | `free` | Free 可配置订阅档,当前 daily limit = 5 |
| `unlimited` | `month` | Unlimited 月度订阅,续费方式由 metadata 配置 |
| `maps_extension_pro` / `maps_extension_business` | `month` | Maps 插件线月度套餐(自动续费) |
| `online_lite` / `online_basic` / `online_growth` / `online_pro` | `month` | `maps_online` 线月度套餐,`auto_renew=false`,PayPal 一次性支付 |
| `api_basic` / `api_professional` / `api_business` / `api_scale` | `month` | `maps_api` 线月度套餐,`auto_renew=false`,PayPal 一次性支付 |

`maps_online`/`maps_api` 两线的月度额度在 metadata `monthly_quota`(单位由产品线定义:records / requests),完整档位表与字段口径见 `@../006.订阅系统/tech-订阅商品与状态.md`。全部付费 SKU(11 个)由幂等播种脚本一次性写入,替代逐条手写 SQL:

```bash
cd backend
uv run python scripts/seed_subscription_products.py
```

下方 Free / Unlimited 示例保留为单条手工配置方式参考。

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
- `SUBSCRIPTION`:读取订单快照 `product_line` 与 `duration_days`,upsert 对应产品线行的 `expires_at`。

订阅下单前会拒绝同一产品线已有未过期订阅的用户再次创建普通订阅订单,减少重复购买。该检查不增加并发锁或跨渠道协议协调;用户分别确认的两笔付款都成功时由履约层按订单快照续期,极少数重复订阅由支持处理。`user_subscriptions` 按 `(user_id, product_line)` 一行保存各产品线的当前订阅。
