# 011 · Pricing 实现与配置

> 技术说明,以现役 MapsGrab 站(website/)三产品线 tab 版 Pricing 页为口径。
> 分工:本页对后端接口的消费合同、下单参数、支付渠道与回跳、渠道管理入口的唯一 owner 是 `@tech-pricing与自动续费.md`;本文只记录前端文件责任与商品配置命令。

## 前端结构

Pricing 页面在 `website` 中拆分:

- `website/src/pages/pricing.astro`:英文默认路由。
- `website/src/pages/[lang]/pricing.astro`:多语言路由。
- `website/src/components/pages/PricingPage.astro`:读取文案(`src/i18n/pricing.ts`)并装配页面。
- `website/src/components/pricing/PricingPageShell.astro`:页面 DOM 壳(SSR 静态渲染三 tab、全部档位卡、对比表与用量说明;未交付能力的入口按站级能力表灰化)。
- `website/src/components/pricing/pricing-page-controller.ts`:登录态恢复、URL 选线与 hash 回写、支付配置与升级报价加载、卡片按钮态、checkout 打开与账号摘要刷新;tab 交互本身由站级 tabs 组件承担。
- `website/src/components/pricing/CompareCell.astro` / `pricing-compare.ts`:对比单元格呈现与取值比较;桌面表格与移动端对比卡共用,移动端按「各档取值是否相同」拆分行,不另设数据。
- `website/src/components/pricing/pricing-page.ts`:展示层交互(价格滚动、用量估算条、对比表分段联动、用量动画),不读写购买状态;估算条纯函数与动画样例分别在 `pricing-finder.ts`、`pricing-samples.ts`。
- `website/src/components/pricing/pricing-checkout.ts`:订阅配置与升级接口 client、产品线常量与支付配置解析。
- 登录复用站级登录弹窗(`website/src/components/auth/`)与站级会话(`website/src/scripts/site/session.ts`)。
- 支付弹窗复用全站统一组件 `website/src/components/order-checkout/`(OrderCheckoutModal 等);`order-checkout-controller.ts` 统一处理普通订单、升级差额订单、协议确认的 action 与等待状态。
- 回跳页:PayPal `website/src/pages/paypal/success.astro` / `cancel.astro`,Clink `website/src/pages/clink/success.astro` / `cancel.astro`(noindex,`components/pages/ClinkReturnPage.astro` + `i18n/clink-return.ts`);两渠道共用 `credit-purchase/paypal-return.ts` 的通用 payment return 脚本。

## 商品配置命令

订阅商品、渠道价与 metadata 合同的唯一口径见 `@../006.订阅系统/tech-订阅商品与状态.md`,全部 SKU 由幂等播种脚本一次性写入,替代逐条手写 SQL:

```bash
cd backend
uv run python scripts/seed_subscription_products.py
```

运营性单条配置修改用 `backend/src/app/init/sql_executor.py` 直接执行 SQL(替换连接参数后执行,不做成迁移脚本);列结构与索引变更走 `sync_database_schema.py`。
