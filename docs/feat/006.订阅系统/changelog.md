# 006 · 订阅系统 - 变更记录

## 2026-09-02 FREE 档统一（复合唯一键 + 每产品线 free 行 + 下单按 product_id 反查）

**Why**: 分产品订阅后 Free 仍是全局一行（`product_line` 为空串），maps 线查 free 档会误读 extension 线 free 的 `daily_limit` 配置；且 `config_subscription_product` 的单列唯一键 `uk(product_id)` 锁死商品标识全局唯一，每条产品线无法各自配置 free 档。前序 U1 已把产品线 `maps` 改名 `maps_extension`（常量、存量行与 seed 同步），本批在其上完成 free 档统一。

**变更**:

- 唯一键 `uk(product_id)` → `uk(product_line, product_id)`（兄弟表 `config_subscription_product_price` 已是复合键先例）；单列键随之删除（复合键最左前缀之外不再保留全局唯一语义）。
- 支付配置快照（payment_config_service）主 dict 键改为 `(product_line, product_id)`，同时构建 `product_id` 辅助索引供下单反查；下单链路 `get_subscription_checkout_config` 按 product_id 反查：唯一命中放行，未命中返回 `PAYMENT_PRICE_UPDATED`，付费 SKU 跨线重名（seed 合同破坏）返回 `PAYMENT_GATEWAY_ERROR`；free 各线同名是合法状态，返回任一条由订阅层 free 拒单保护统一拒绝。checkout 方案列表对无法唯一归属商品的孤儿价格行跳过。
- `subscription_service._get_subscription_product_config` 改为按 `(product_line, product_id)` 精确读取（仍走只读商品表的轻量路径）；`get_user_subscription_config` 三分支（user_id=0 / 无权益行 / 已过期）均程序构造内存订阅对象（不入 `user_subscriptions` 表）并返回本线 free 配置，修复 maps 线误读 extension 线 free 配置的裂缝。
- seed 脚本（`scripts/seed_subscription_products.py`）重写为 dataclass 表驱动并纳入四条产品线 free 行：extension 线原样保留存量 metadata（`daily_limit=5` 等，含 `one_time` 历史残留），maps_extension / maps_online 线 `monthly_quota=1000`、maps_api 线 `monthly_quota=20`；free 行 `period='free'`、`display_amount=0`、无渠道价、sort_order=10（各线内低于全部付费档）。文件头写明 SKU 唯一性合同：付费 SKU 的 product_id 必须全线唯一（下单只携带 product_id），free 是唯一允许各线同名的档位。
- HTTP 契约与 website 下单请求不变（仍只传 product_id）。

**实际产出**（本地 dev 库，经 `sql_executor.py` / `sync_database_schema --yes` 执行）:

- U1 存量迁移：三条 UPDATE 把订阅商品、用户订阅等存量行的产品线标识 `maps` 改名 `maps_extension`，seed upsert 命中既有行未新建。
- 本批存量迁移：`UPDATE config_subscription_product SET product_line='extension' WHERE product_id='free' AND product_line=''`（rowcount=1），保证 (extension, free) upsert 命中旧行（id=90）不新建。
- 结构同步：`CREATE UNIQUE INDEX uk_config_subscription_product_line_product_id` + `DROP INDEX uk_config_subscription_product_product_id`。
- seed 播种后 15 行 = 4 条 free + 11 条付费；付费行数与播种前一致，幂等重跑行数不变；手工 INSERT 重复 `(maps_api, free)` 被复合唯一键拒绝（Duplicate entry 'maps_api-free'）。

**已验证**:

- 新增 real 测试 `tests/integration/real/services/test_subscription_service_real.py` 7 passed：三分支按线返回本线 free（maps 线 monthly_quota=1000/20、extension 线 daily_limit=5，互不串线）且 `user_subscriptions` 无新增行；付费档 check_product 反查唯一命中通过；未命中 product_id 与 free 下单均按 `PAYMENT_PRICE_UPDATED` 拒绝。
- 付费 SKU 跨线重名分支需破坏 config 表合同才能构造，由进程内验证覆盖（构造快照调 `_resolve_checkout_product`，断言 `PAYMENT_GATEWAY_ERROR`）。
- 回归：health smoke、subscription status / review_reward 屏蔽态 / 订单自动续费相关 real 测试全绿；`collect-only` 与 `-m real` 收集数一致（79=79）。
- `black` / `ruff` / 限定范围 `mypy` 通过；`sync_database_schema --yes` 通过；本地 7600 启动 smoke：health 正常、checkout-configs 返回 11 个付费方案（free 无渠道价不出现在可购列表）、匿名 status 返回 free。

## 2026-09-02 好评赠送活动下线(前端删除、后端接口屏蔽)

**Why**:活动停止运营。前端入口与流程删除,后端保留代码以便未来重启。

**变更**:

- website `pricing-checkout.ts` 删除 `review_reward_enabled` / `review_reward_claimed_count` 契约字段(TG 时代 UI 已随旧站下线,MapsGrab 页面本就不消费);模块测试夹具同步删除。
- `POST /api/client/subscription/review-reward/claim` 在路由层直接抛 `INVALID_REQUEST`(HTTP 400),不再读取活动开关,不写 Counter 或订阅;`subscription_review_reward_service` 全部代码保留。
- `checkout-configs` 的 `review_reward_enabled` 固定 `false`、`review_reward_claimed_count` 固定 `0`(字段保留以维持响应结构稳定)。
- real 测试重写为屏蔽态断言:配置响应固定关闭态、claim 拒绝且无副作用(原 6 个领取流程用例随行为下线删除)。

**验证**:real 测试 `2 passed`;black / ruff / mypy 通过;本地 7600 端口启动 smoke,checkout-configs 返回关闭态、claim 匿名 401(登录态 400 由 real 测试覆盖);website `node --test` 47 passed、`pnpm build` 22 页通过。

## 2026-08-31 订阅扩展 maps_online / maps_api 产品线(8 档,PayPal 一次性支付)

**Why**:MapsGrab 商业化对标竞品分产品订阅,Online Scraper 与 API 两条产品线需要可购买的档位。占位期用户决策(auto_renew=false,PayPal 一次性支付):使真实 PayPal 凭据下立即可购买,无需先落渠道订阅协议;后续接自动续费时改商品配置并替换真实 provider_sku 即可。两线配额暂无消费方,014 云端落地后直接复用月度额度模型。

**变更**:

- 新增产品线 `maps_online`(Online Lite $19 / Basic $49 / Growth $99 / Pro $149,20,000/80,000/250,000/500,000 records/月)与 `maps_api`(API Basic $15 / Professional $65 / Business $115 / Scale $365,1,000/5,000/10,000/50,000 requests/月);全部 `period=month`、`duration_days=30`、`auto_renew=false`。
- 商品 metadata `monthly_records` 全量改名 `monthly_quota`(语义 = 月度额度数,单位由产品线定义:maps_extension/maps_online 为 records,maps_api 为 requests);checkout-configs 响应键同步改名。
- `/api/client/auth/me` 新增 `maps_online_subscription`、`maps_api_subscription`(与 `maps_extension_subscription` 同构)。
- 播种脚本重构为表驱动 `scripts/seed_subscription_products.py`(幂等 upsert 11 个付费 SKU;新 8 档 provider_sku 占位 `{product_id}-paypal`);删除旧脚本 `seed_maps_subscription_products.py`。

技术口径见 `@tech-订阅商品与状态.md`。

## 2026-08-14 增加订单自动续费人工运维脚本

**Why**:支持人员需要按订单号核对并停止渠道后续扣款,但客户端取消接口和本地订阅实例取消状态仍未实施。

- 新增查询与取消两个 CLI 脚本;省略订单号时支持交互输入,取消默认要求输入 `CANCEL` 二次确认。
- PayPal 查询 Billing Subscription 实时状态并通过 cancel API 停止续费;Telegram Stars 通过 `editUserStarSubscription` 取消。
- Telegram Bot API 没有订阅状态查询能力,查询脚本明确输出未知状态,不从当前商品配置推断。
- 脚本只操作渠道长期协议,不改历史订单、不退款、不改权益到期时间。
- 历史订阅使用包含已停用渠道的最新配置,避免停止新销售后无法处理存量订阅。

## 2026-08-12 增加插件反馈群公开用户名配置

**Why**:插件需要同时提供普通 `t.me` 网页入口和现有 Telegram Web 邀请入口,公开用户名不能从私有邀请链接可靠推导。

- 开发库新增字符串配置 `config_public.extension_telegram_feedback_group_username`，保存不带 `@` 的 Telegram 公开用户名。
- `/api/client/subscription/status` 在既有 `telegram_feedback_url` 外增加 `telegram_feedback_group_username`;两项配置一次读取,缺失或非字符串分别返回空字符串。
- 两个字段互不依赖,客户端可只展示当前已配置的入口。

## 2026-08-11 增加好评赠送活动开关

**Why**:运营需要在不发版的情况下同时关闭活动展示和订阅发放,不能只隐藏前端入口。

- 开发库新增 JSON 布尔配置 `config_public.subscription_review_reward=true`;只有 `true` 开启活动,其余值按关闭处理。
- `checkout-configs` 返回 `review_reward_enabled`;关闭时不读取账号永久 Counter。
- 领取接口在 Redis 锁、Counter 和订阅写入前检查开关,关闭时复用 `INVALID_REQUEST`。
- 公共配置继续使用 180 秒缓存,可由管理后台刷新当前进程。

## 2026-08-07 实现好评赠送 7 天订阅后端

**Why**：Pricing 需要用稳定后端合同读取账号领取次数，并让登录账号一次性领取 7 天 Unlimited 权益。

**实际产出**：

- `checkout-configs` 顶层增加 `review_reward_claimed_count`；无凭据、过期或无效 access token 按匿名返回 `0`，有效账号读取永久 Counter。
- 新增严格登录的 `review-reward/claim`，返回 `granted` 或 `already_claimed` 与当前次数；账号级 Redis 锁固定 TTL 5 秒、抢锁 1 秒且不续租，Redis 不可用或超时统一返回 `SUBSCRIPTION_REVIEW_REWARD_BUSY=26001`。
- 锁内按 Counter 查询、Counter `+1` 独立提交、订阅 `+7` 天独立提交；重复领取成功跳过，Counter 成功而订阅失败不回滚、不补偿。
- 订阅 service 抽出 MySQL 原子按天加时能力，支付履约与赠送共用同一 upsert 算法：有效订阅从当前到期日累加，无记录、空值或已过期从当前时间计算。
- 全部 14 个后端 locale 增加服务器繁忙文案；未新增 Model、索引、依赖、依赖注入、锁续租或恢复任务。

**已验证**：

- real health smoke `1 passed`；Counter real 测试 `9 passed`；好评赠送真实 MySQL + Redis API 流程 `6 passed`，覆盖匿名/登录配置、首次领取、有效订阅、重复领取、同账号并发、预占锁和未登录拒绝。
- real 普通与 `-m real` 两次 collect-only 均成功且数量一致；新增 6 个用例均被收集。
- 后端改动通过 Black、Ruff、限定范围 mypy、`compileall` 和全部 locale JSON 解析；全链路 mypy 被既有 `core/config_schema.py` 27 个错误阻断，不记为通过。
- business 角色在 `127.0.0.1:19600` 启动成功，`/api/system/health` 返回 200/healthy，路由装配、lifespan 启停与数据库连接无异常。

技术规格见 `@tech-好评赠送订阅.md`，执行计划见 `@plans/003.好评赠送订阅-后端.md`。

## 2026-08-07 设计好评赠送 7 天订阅

**Why**:在 Pricing 购买确认中提供一次性好评赠送,用现有永久 Counter 与订阅权益模型完成简单领取。

**设计**:

- checkout 配置响应附带账号永久领取次数,匿名固定为 0。
- 领取接口使用账号级 5 秒 Redis 短锁,抢锁最多等待 1 秒,失败返回服务器繁忙。
- 未领取时先提交 Counter +1,再独立提交订阅 +7 天;接受前者成功、后者失败且不补偿。
- 重复领取按成功跳过,不验证真实评价,不新增活动表、订单或埋点。

技术规格见 `@tech-好评赠送订阅.md`,执行计划见 `@plans/003.好评赠送订阅-后端.md`。

## 2026-08-07 删除重复的一次性商品开关

**Why**: `one_time` 与 `auto_renew` 重复表达支付方式,还能组合出前端显示一次性、渠道实际自动续费的矛盾状态。

**变更**:

- 删除订阅 metadata、API 响应和前端契约中的 `one_time`。
- `auto_renew=true` 创建渠道订阅,`auto_renew=false` 创建一次性支付。
- 权益时长继续只读取 `duration_days`。

## 2026-08-07 续费方式改为商品配置驱动

**Why**: `auto_renew` 是运营配置,不应由付费商品校验和下单代码锁死。

**变更**:

- 订阅 metadata 只校验字段类型和合法范围,不限制具体额度与续费取值。
- 下单直接读取商品 `auto_renew`;开启时创建渠道订阅,关闭时创建一次性支付。
- 既有渠道续费回调继续按原订单履约。

## 2026-07-14 暂缓确定 Telegram 取消句柄期次

**Why**:Bot API 只要求订阅的 `telegram_payment_charge_id`,没有说明自动续费后必须使用首期、最新一期或任意一期 ID;公开资料也没有可复核的取消实测。

**变更**:

- 删除“Telegram 永久保存首期 charge ID”的未证实口径。
- `channel_subscription_id` 的 Telegram 写入时机改为等待 Test DC 60 秒订阅 A/B 实验结论。
- 取消自动续费验收增加首期 ID / 最新续费 ID 的回调、请求响应和客户端状态证据。

## 2026-07-14 简化自动续费取消状态

**Why**: 扣款由支付渠道发起,且渠道后台取消不一定通知本站。维护 `auto_renew_enabled` 会把本地记录误解为渠道实时状态,并与 `cancelled_at` 重复。

**变更**:

- 删除后续方案中的 `auto_renew_enabled`,只保留渠道取消句柄、`billing_mode` 和 `cancelled_at`。
- 每一笔订阅付款成功都清空 `cancelled_at`;Telegram 以 `is_recurring=true` 为准。
- 渠道返回取消成功、已经取消或非自动续费状态时写入 `cancelled_at=now`。
- `auto_renew/cancel_at_period_end/cancel_available` 改为由 `billing_mode/cancelled_at/expires_at` 计算的本站展示状态,不承诺反映渠道实时状态。
- 有效订阅检查只减少普通重复购买;不增加并发锁或跨渠道协议状态机,极少数重复订阅由支持处理。

**边界确认**:

- 用户在渠道后台取消但本站未收到通知时,本站允许继续显示自动续费;用户可再次点击取消完成本地同步。
- 两个 checkout 都需要用户分别确认付款;两笔均成功时按正常订单履约。

## 2026-07-06 取消自动续费暂缓实现

**Why**: 站内取消自动续费已完成方案设计,但当前不进入实现。

**变更**:

- `feat.md`:标记站内取消自动续费暂不实现,当前用户仍到支付渠道侧取消。
- `tech-订阅商品与状态.md`:标记新增订阅实例字段、取消接口和状态响应字段为后续方案。
- `plans/001.*` / `plans/002.*`:标记执行计划暂缓,不得按当前计划直接开工。

## 2026-07-05 取消自动续费设计

**Why**: 用户需要在站内停止下一次订阅扣款,但当前周期 Unlimited 权益应继续可用到到期时间。

**变更**:

- `feat.md`:增加取消自动续费流程、异常和验收口径。
- `tech-订阅商品与状态.md`:补充 `user_subscriptions` 的渠道订阅引用、取消状态字段和取消接口。

**边界确认**:

- 取消只停止下一次扣款,不退款、不立即降级。
- 已取消续费但尚未到期时仍不可重复购买;到期后可重新购买。
- 到期前恢复自动续费不在本期范围。
- 用户续费状态不能从当前商品配置推断,必须保存订阅实例的 `billing_mode/auto_renew_enabled`。（该设计已于 2026-07-14 被 `billing_mode/cancelled_at` 取代。）
- 支付渠道侧已取消但未通知本站时,站内取消接口按渠道“已取消”结果幂等同步本地状态。

## 2026-06-30 有效订阅禁止重复购买

**Why**: PayPal / Telegram Stars 允许同一用户产生多条自动续费订阅。有效期内再次购买会让渠道扣款周期和站内 `expires_at` 叠加逻辑混在一起,没有业务收益。

**变更**:

- `feat.md`:购买 Unlimited 流程增加已有有效订阅时不可重复购买。
- `tech-订阅商品与状态.md`:订阅下单前检查当前用户未过期订阅,存在时拒绝创建订阅订单。

**边界确认**:

- 已过期订阅按 Free 处理,允许重新购买。
- 履约层仍保留续期逻辑,用于自动续费回调、补偿和历史订单。

## 2026-06-30 订阅状态移除 website 额度字段

**Why**: 订阅是插件权益域,website 下载与播放不属于订阅状态。

**变更**:

- `tech-订阅商品与状态.md`:移除 subscription metadata 中的 website quota 字段。
- `tech-额度与速率档位.md`:订阅状态只返回 `extension_download` 和旧插件下载标量字段。

**边界确认**:

- `/api/client/subscription/status` 不返回 `web_download` / `web_play` 或播放标量字段。
- `/api/client/subscription/checkout-configs` 不返回 website 下载或播放额度配置字段。

## 2026-06-30 订阅状态配置异常降级

**Why**: 订阅配置错误最多影响权益展示,不能阻断登录态、Credits 和插件初始化。

**变更**:

- `GET /api/client/auth/me` 和 `GET /api/client/subscription/status` 在订阅配置异常时返回 `status=unavailable` 的订阅对象。
- 状态链路只读取订阅商品配置,不扫描支付渠道和渠道价格。
- 支付 checkout/下单链路仍保留配置错误失败,避免创建错误订单。

## 2026-06-29 按已合并源码修正订阅配置口径

**Why**: 当前源码没有新增订阅权益列,订阅商品为 `free` 与 `unlimited`;商品语义由 metadata 表达。文档需要删除旧设计字段,回到源码事实。

**变更**:

- `tech-订阅商品与状态.md`:改为当前 `config_subscription_product` 字段、`user_subscriptions` 字段、订单快照和履约分发实现。
- `tech-额度与速率档位.md`:把商品标识修正为 `free/unlimited`,明确 Free=5、Unlimited=-1。

**边界确认**:

- `config_subscription_product` 业务字段只有 `product_id/name/period/duration_days/display_currency/display_amount/enabled/sort_order/metadata`。
- `metadata.auto_renew` 表达商品支付方式。
- `user_subscriptions` 只用 `user_id/expires_at` 判权,Free 不落库。
- 订阅订单快照保留 `period` 配置校验字段,履约续期只读取 `duration_days`。
- 配置修改必须直接使用 `backend/src/app/init/sql_executor.py` 执行 SQL,不得新增迁移脚本。

## 2026-06-29 订阅状态接口作为插件状态入口保留

**Why**: 插件端需要同时知道当前订阅权益和今日剩余次数。Pricing 的已登录账户摘要整合进账号信息接口,避免 website 重复请求。

**边界确认**:

- `GET /api/client/auth/me` 返回已登录用户信息、Credits 余额和订阅状态。
- `GET /api/client/subscription/status` 返回插件订阅权益和今日次数对象,并继续保留旧插件兼容标量字段。

## 2026-06-29 重新激活为插件订阅权益域

**Why**: Pricing 页需要售卖插件专属 Unlimited 月度订阅,同时 Free 档成为正式配置档位。

**边界确认**:

- website 下载仍走 Credits。
- 订单支付、webhook、订单状态机和履约事务归订单系统。
- Free 是正式权益档;Unlimited 权益由有效订阅周期和当前商品配置表达。
