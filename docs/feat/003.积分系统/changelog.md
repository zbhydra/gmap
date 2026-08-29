# 003 · 积分系统 - 变更记录

## 2026-07-03 注册赠送接入 IP 注册权益风控

**Why**: 注册赠送仍归 Credits 底座发放,但是否可发由用户系统按注册 IP 窗口判断,避免同一 IP 批量注册持续领取赠送。

**变更**:

- `feat.md`:注册赠送说明增加用户系统 IP 注册权益风控边界。
- `tech-数据模型与扣费.md`:注册赠送接入规则改为"用户系统判定可发后才调用积分服务"。

**边界确认**:

- 积分系统不保存风控状态,不查询 `user_ip_registers`。
- 命中风控时不调用 `user_credit_service.add_balance()`,因此不写注册赠送流水。

## 2026-06-29 pricing 页主动购买 Credits

**Why**: 新 pricing 页需要直接售卖 50 / 200 / 1000 Credits。下载工作区仍在 Credits 不足时弹购买弹窗,但 pricing 页也成为主动购买入口。

**变更**:

- `feat.md`:补充 pricing 页主动购买 Credits,两个入口复用同一商品配置和订单履约。
- `tech-购买.md`:标题和域边界从“旧 pricing 退出”调整为“下载弹窗 + pricing 入口”。

**边界确认**:

- website 下载仍只扣 Credits。
- Unlimited Download 不属于积分系统,见 `@../011.Pricing页/feat.md` 与 `@../006.订阅系统/feat.md`。

## 2026-06-26 Credits 商品金额字段收敛

**Why**: Credits 商品展示价和渠道价需要跟订单系统统一为单字段 6 位金额模型,避免 `display_amount_raw/amount_raw` 与真实展示金额混用。

**变更**:

- `tech-购买.md`:默认商品配置、checkout-configs、下单请求和 `check_product` 校验删除 `display_amount_raw/amount_raw`,统一使用 `display_amount/amount = 真实金额 * 1_000_000`。
- `feat.md`:购买埋点展示价字段从 `display_amount_raw` 改为 `display_amount`。
- 金额统一引用 `@../004.订单系统/tech-金额模型.md`。

## 2026-06-24 PayPal 双渠道与支付方式确认

**Why**: PayPal 账号已确认是 Business 类型,且已创建 Developer App。Credits 一次性积分包购买需要从 Telegram Stars 单渠道升级为 PayPal / Telegram Stars 双渠道,但用户只应看到商品美元展示价,不展示渠道价。

**变更**:

- `feat.md`:购买流程改为"先点积分包 → 再选支付方式 → 最后确认支付";默认支付方式为 PayPal,Telegram Stars 对所有 website 用户可见。
- `tech-购买.md`:补充 PayPal 渠道价配置、支付方式确认 DOM 合同、`selecting_payment_method` 状态、PayPal approval URL 读取和 success/cancel 回跳口径。
- 购买 UI 明确为两层 modal:第一层只显示商品列表;点击商品 `Buy Now` 后打开第二层支付方式确认,第二层显示已选商品美元价、支付方式和协议,点击 `Continue to payment` 才创单跳转。
- 明确本期不考虑 extension 购买入口,不恢复 pending 订单,PayPal 和 Telegram Stars 都在新窗口 / 新标签页打开支付入口。

## 2026-06-23 文档结构迁移

**Why**: Credits 独立成"积分系统"域。它是 website 下载计费的现行权威,与下载链路(002)、订单/支付/履约(004)、节点(001)、extension 计数器(005)都是不同系统,各自独立成域。原 `feat.051` 把 Credits 模型、下载扣费、积分包购买、前端弹窗混在一篇需求里,迁移时按"产品需求 vs 技术实现"拆分,并按子主题切到多个 tech 文件。

**From → To**:

- `docs/feat/feat.051.Credits下载积分.md` → `docs/feat/003.积分系统/feat.md`(产品需求,剔除 API/表/配置/错误码)+ `docs/feat/003.积分系统/tech-购买.md` + `docs/feat/003.积分系统/tech-前端与清理.md`。
- 原 plan feat.051.001.Credits数据模型与迁移 → `docs/feat/003.积分系统/tech-数据模型与扣费.md`(数据模型 + 注册/存量迁移部分)。
- 原 plan feat.051.002.Credits下载扣费后端 → `docs/feat/003.积分系统/tech-数据模型与扣费.md`(扣费算法 + resource token + 6 小时窗口 + extension 边界 + 旧 quota 清理)。

**边界确认**:

- 051 是 website 计费权威;extension 计数器是另一个系统,不并入本域(见 `@../005.计数器系统/feat.md`)。
- 订单履约(051.004)属于订单系统(`@../004.订单系统/feat.md`),本域只提供积分包商品定义与到账写流水的 service 能力。

## 2026-06-23 补数据埋点章节

**Why**: `feat.md` 缺 `数据埋点` 章节(project-rule 要求 feat 必备段)。源 `feat.051 §13 数据埋点` 的埋点口径在迁移时未带入产品文档。

**From → To**: `feat.051 §13` → 本域 `feat.md` 新增「数据埋点」小节:下载消费新增字段(`credits_cost`/`credits_balance`)+ 5 个购买事件(`web_credit_purchase_modal_open`/`buy_click`、`credit_purchase_order_created`/`paid`/`failed),事件名与 `mark_msg` 字段为产品规格,技术实现见 `@tech-购买.md` 与 `@../002.下载功能/feat.md`。
