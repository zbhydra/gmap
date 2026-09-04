# 006 · 订阅系统

> 产品需求文档。只描述插件订阅商品、订阅状态、免费档与 Unlimited 权益、extension 额度边界。技术实现见同目录 `tech-*.md`。
>
> 关联:
> - 本域技术:`@tech-订阅商品与状态.md` `@tech-额度与速率档位.md` `@tech-好评赠送订阅.md`
> - 变更记录:`@changelog.md`
> - 新 pricing 页:`@../011.Pricing页/feat.md`
> - 自动续费支付与账单:`@../011.Pricing页/tech-pricing与自动续费.md`
> - 统一订单与支付履约:`@../004.订单系统/feat.md`
> - website 下载计费:`@../003.积分系统/feat.md`
> - extension 每日额度链路:`@../000.架构/tech-extension.md`

> 实现状态:支付模型同步与订阅升级待批准实施；本文相关章节描述目标合同。自动续费管理沿用参考项目方案,只打开支付渠道管理入口,不在站内直接取消。好评赠送活动已于 2026-09-02 下线。

## 系统定性

订阅系统是**分产品线的订阅权益域**(2026-08-31 产品线扩展,C2 裁决落地)。当前四条产品线:`extension`(插件下载 Unlimited)、`maps_extension`(MapsGrab 插件月度 records 套餐,Free 1,000 / Pro $39 100,000 / Business $99 500,000 records/月)、`maps_online`(云端 Online Scraper 月度 records 套餐,4 档)与 `maps_api`(Scraper API 月度 requests 套餐,4 档);权益与重复购买校验按产品线隔离,同一账号可同时持有不同产品线的订阅。产品线仍只定义 extension 下载权益与 maps_extension/新两线采集额度,不定义 website 下载权益。`maps_online`/`maps_api` 两线 8 档全部为 **PayPal / ClinkBill 一次性自然月权益,无自动续费**;两线配额暂无消费方(014 云端落地后复用)。

- Free 是正式订阅档位,当前 extension 每日 5 次。
- Unlimited Download 是月度订阅,是否自动续费由商品配置决定,有效期内 extension 每日下载不限次数。
- 购买入口只在 website pricing 页,见 `@../011.Pricing页/feat.md`。
- extension 不再承载订阅套餐购买页;旧 options 订阅卡和订阅提示弹窗已删除。
- website 下载继续走 Credits,购买 Unlimited 不赠送 Credits、不改变 website 扣费。

## 功能目标

为浏览器插件提供可配置的订阅权益:

1. 免费用户也有明确的每日下载额度。
2. 付费用户通过 Unlimited Download 月度订阅获得插件不限次数下载,计费方式由配置决定。
3. 订阅状态可被 extension 状态接口与已登录账号摘要读取。
4. 自动续费成功时延长订阅有效期,到期未续费时回到 Free。
5. ~~未领取过好评赠送的账号可从 Pricing 购买确认流程领取一次 7 天 Unlimited 权益。~~(2026-09-02 活动下线)

## 功能范围

### 包含

- 订阅商品定义:Free 与 Unlimited Download。
- 订阅权益:extension 每日下载次数上限。
- 用户订阅状态:当前档位、生效/到期时间。
- 订阅到期降级:有效期结束后自动回到 Free。
- 订阅状态查询:给 extension 展示和计数器解析额度使用。
- 与自动续费账单衔接:PayPal / ClinkBill / Telegram Stars 首期成功、后续续费成功、到期降级。
- 已有未过期订阅时拒绝同产品线普通重复购买(升级到更高档除外,见「升级订阅」);不增加并发锁或渠道协议状态机来保证绝不会重复订阅。
- 同产品线升级订阅:未过期订阅补差价换到更高档位,立即生效、到期日不变;一次性支付线差额款走收银台,自动续费线由支付渠道在原协议内换价扣款。
- 自动续费订阅管理:Pricing 按当前产品线打开 PayPal / ClinkBill 渠道管理页;不在站内直接取消。
- ~~好评赠送订阅:活动开关启用时,每个登录账号最多领取一次,领取后直接延长 7 天 Unlimited 权益。~~(2026-09-02 活动下线,接口屏蔽、代码保留)
- 旧插件兼容字段:在可控范围内继续返回标量字段,但值应镜像当前 extension 下载额度。

### 不包含

- website 下载额度或 website 无限下载;website 下载只走 Credits。
- Credits 余额、扣费、积分包购买。
- 下载解析、下载执行、节点调度。
- 退款、补偿、发票、税务、对账。
- 同产品线降级与折算退差;降级(下期生效)属后续需求。
- 其他订阅档位、多席位、优惠码。
- extension 端直接拉起支付;购买入口首版只在 website pricing 页。
- extension options 订阅套餐页、订阅卡片、插件内订阅支付提示弹窗。
- 站内直接取消自动续费;用户从 Pricing 打开支付渠道管理页完成操作。
- 取消后的退款、按比例退费、立即降级。
- 到期前恢复自动续费;已取消续费的用户仍等到订阅到期后重新购买。
- 注册试用订阅的新设计;注册赠送 Credits 属于积分系统。
- 验证用户是否真实提交好评、读取评价内容或与 Chrome Web Store 账号关联。
- 好评赠送的补偿、对账、人工补发和倒计时恢复。

## 订阅档位

| 档位 | 产品线 | 价格 | 购买方式 | 权益 |
| --- | --- | --- | --- | --- |
| Free | `extension` | `$0` | 默认档位,不可购买 | 插件下载 5 次/天 |
| Unlimited Download | `extension` | `$12.99 / month` | PayPal / Telegram Stars;是否自动续费由商品配置决定 | 插件下载不限次数 |
| Maps Free | `maps_extension` | `$0` | 默认档位,不可购买 | 1,000 records/月 |
| Maps Pro | `maps_extension` | `$39 / month` | PayPal / ClinkBill;自动续费 | 100,000 records/月 |
| Maps Business | `maps_extension` | `$99 / month` | PayPal / ClinkBill;自动续费 | 500,000 records/月 |
| Online Lite | `maps_online` | `$19 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 20,000 records/月 |
| Online Basic | `maps_online` | `$49 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 80,000 records/月 |
| Online Growth | `maps_online` | `$99 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 250,000 records/月 |
| Online Pro | `maps_online` | `$149 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 500,000 records/月 |
| API Basic | `maps_api` | `$15 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 1,000 requests/月 |
| API Professional | `maps_api` | `$65 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 5,000 requests/月 |
| API Business | `maps_api` | `$115 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 10,000 requests/月 |
| API Scale | `maps_api` | `$365 / month` | PayPal / ClinkBill 一次性支付,自然月,无自动续费 | 50,000 requests/月 |

Telegram Stars 初始价格为 `800 Stars / month`。maps_extension 线月度额度即 U7 计量的月度 records 总量:购买成功后该账号(登录态)配额总量切到所购档位,到期自动回退免费档;匿名设备恒免费档(见 `@tech-额度与速率档位.md`)。`maps_online`/`maps_api` 两线配额暂无消费方,云端额度消费落地时直接复用同一额度模型(见 `@../014.Maps云端/feat.md`)。online / api 免费口径(online 1,000 records/月、api 20 requests/月)已随各线 free 档位落库,暂无消费方、待云端额度基建接线后生效。

## 业务流程

### 免费用户下载

1. 用户未购买 Unlimited 时处于 Free 档。
2. extension 下载前调用计数器系统扣减当日次数。
3. 当天未超过 5 次时允许下载。
4. 超过 5 次时不扣减,extension 展示升级引导,引导到 website pricing 页。

### 购买 Unlimited

1. 用户在 website pricing 页选择 Unlimited Download。
2. 如用户在该产品线上已有未过期订阅,pricing 页订阅按钮灰化;点击后提示存在有效订阅,不可重复购买(重复购买校验按产品线隔离,适用于包括 `maps_online`/`maps_api` 在内的全部产品线,互不影响另一产品线的购买)。
3. 无有效 Unlimited 时,pricing 页按商品配置创建一次性支付或自动续费订阅,支付渠道为 PayPal 或 Telegram Stars。
4. 支付渠道付款成功后,系统按商品周期发放自然月订阅权益。
5. 用户刷新 extension 订阅状态后,extension 下载额度变为不限。

购买页面、支付确认、轮询和异常见 `@../011.Pricing页/feat.md`。

### 自动续费

1. 支付渠道在每个周期自动扣款。
2. 扣款成功后,系统延长订阅有效期。
3. 扣款失败时,当前已付周期内权益保留;到期仍未续费则回到 Free。
4. 重复 webhook 不重复延长同一周期。

### 领取好评赠送订阅(已下线)

2026-09-02 活动下线:前端入口与流程删除,`review-reward/claim` 直接返回请求无效,checkout-configs 的 `review_reward_enabled` 固定 `false`、`review_reward_claimed_count` 固定 `0`;领取 service 代码保留,重启活动时恢复路由调用即可。以下为下线前的历史流程:

1. 系统读取好评赠送活动开关;关闭、缺失或配置非法时不展示入口且不允许领取。
2. 未领取账号在 Pricing 的订阅购买确认中选择“去好评”。
3. Pricing 打开插件的 Chrome Web Store 评价页,并在原页面显示 30 秒检测倒计时。
4. 倒计时结束后,系统按登录账号检查永久领取次数。
5. 未领取时先将永久次数增加 1,再把当前订阅到期时间增加 7 天;无有效订阅时从当前时间起算 7 天。
6. 已领取时不再增加订阅,按已完成返回。
7. 领取成功后 Pricing 刷新账号订阅状态,不再进入本次付费购买。

该流程不验证真实评价。界面与交互见 `@../011.Pricing页/feat.md`,技术合同见 `@tech-好评赠送订阅.md`。

### 管理自动续费

1. 已登录用户在 Pricing 查看当前产品线的有效自动续费订阅。
2. 页面展示“Manage subscription”;点击后由服务端根据当前产品线和订阅实例确定支付渠道。
3. PayPal 打开 Automatic Payments,ClinkBill 打开 Customer Portal;没有网页管理入口的渠道展示渠道内操作路径。
4. 页面只负责打开渠道入口,不在站内直接取消、不修改订阅状态或到期时间。
5. 用户在渠道侧取消后,当前已付周期权益仍保留到原到期时间;渠道未通知本站时,页面状态允许暂时滞后。

### 升级订阅

1. 适用范围:同一产品线内从当前付费档换到更高档位(maps_extension 的 Pro → Business,maps_online 与 maps_api 各档位向上)。extension 线当前仅一个付费档,无升级场景。
2. 已登录用户在 pricing 页当前产品线的更高档卡片上看到升级入口与补差金额;当前档卡片标记为当前套餐。
3. 补差金额按旧档剩余时间折算:补差 = (目标档月价 − 旧档月价) × 剩余时间占比;两档价格都取当前订阅渠道的同币种价格,到期日保持不变。账期初升级补足整月档差,临期升级补差趋近 0。
4. 升级沿用当前订阅的支付渠道,不跨渠道换档。一次性支付线(Online / API)确认后按补差金额创建差额订单,支付成功后立即切换到新档权益。
5. 自动续费线(Maps Pro / Business)按渠道分两种交互:ClinkBill 渠道在确认弹窗明确提示将立即按渠道报价扣款,由渠道在原订阅协议内换价并直接扣款;PayPal 渠道需要用户到 PayPal 侧批准换价,折算差额在下一个账期随续费一起扣收。两种渠道均以服务端收到计划变更事实后切换本地档位,不依赖用户停留在回跳页。
6. 升级后当月额度上限立即按新档计算,当月已用量延续。
7. 不可升级情形:同线无有效订阅(走正常购买)、目标不是更高档、补差金额不为正;升级入口灰化并提示原因。
8. 支付渠道沿用当前订阅实例的 PayPal 或 ClinkBill;Telegram Stars 不参与升级。

### 订阅状态查询

1. 已登录用户按账号读取订阅状态。
2. 匿名用户按 Free 档处理,并用 device_id 统计当日已用次数。
3. 状态返回当前权益、当日已用、剩余次数、重置日期。
4. website 下载不读取订阅状态决定扣费。
5. 订阅状态按产品线读取:`/api/client/auth/me` 的 `subscription` 字段为 extension 线,新增 `maps_extension_subscription`、`maps_online_subscription`、`maps_api_subscription` 字段分别为 maps_extension / maps_online / maps_api 线(同构状态对象);`/api/client/subscription/status` 保持 extension 线口径,旧插件不受影响。

### extension 升级入口

1. extension popup 或内容页只展示当前额度状态、额度不足升级引导和登录入口。
2. 用户点击升级按钮时,插件打开官网 pricing 页。
3. 官网 pricing 页负责登录、套餐展示、支付确认、订单轮询和订阅生效。
4. 插件端不展示旧订阅方案,不展示购买卡片,不弹插件内订阅支付提示。

## 异常流程

- 自动续费首期支付失败:不生效 Unlimited,用户仍为 Free。
- 已有有效 Unlimited 时再次购买:前端订阅按钮灰化并提示不可重复购买;后端下单校验同样拒绝创建订阅订单;更高档位改走升级流程。
- 升级差额订单支付完成时原订阅已过期或已被其他操作修改:不覆盖当前订阅,订单转人工处理。
- 自动续费线渠道换价失败或原订阅协议不存在:本地权益保持不变,用户可重试或到期后按新档重新购买;渠道已完成换价但页面关闭时,服务端仍通过渠道事件同步档位。
- PayPal 渠道升级用户放弃批准或未完成批准:本地权益与扣款均无变化,可重新发起。
- 用户在两个未完成的普通购买 checkout 中分别确认付款:不做并发锁或跨渠道协议协调;两笔成功付款按正常订单履约,极少数重复订阅由支持处理。
- 后续续费失败:当前周期到期前保持权益,到期后降级。
- 渠道管理入口创建失败:页面展示重试,不修改订阅状态或到期时间。
- 用户在渠道侧取消但本站未收到通知:本站可继续显示自动续费状态,不主动猜测或改写渠道事实。
- webhook 重复到达:不重复延长。
- 订阅状态读取失败:前端展示重试;下载扣减失败仍按计数器系统 fail-open 口径。
- 支付成功但订阅写入失败:进入自动续费账单补偿/人工排查,用户看到“开通异常,请联系支持”。
- 好评赠送活动关闭、配置缺失或配置非法:不展示入口;旧页面或直接请求领取时返回请求无效,不写 Counter 或订阅。(2026-09-02 起活动下线,任何请求领取均返回请求无效)
- 好评赠送抢锁失败或 Redis 不可用:返回服务器繁忙,用户可在检测界面直接重试。(活动下线,当前不可达)
- 好评赠送永久次数已存在:按已领取完成,不报错、不重复加时。(活动下线,当前不可达)
- 好评赠送 Counter 已写入但订阅加时失败:本次返回失败;不回滚 Counter、不补偿,后续请求按已领取跳过。(活动下线,当前不可达)

## 非功能性需求

- 不新增第三方依赖;不新增依赖注入。
- 订阅配置、价格、权益只走配置表,不写死在前端。
- 文案需 i18n。
- 不做金融级对账;失败让用户重试,已支付未履约走补偿或人工排查。
- 好评赠送只使用 5 秒 Redis 短锁,不续租、不增加复杂状态机或跨数据库事务。
- 所有业务时间口径以 `America/New_York` 为准。
- 旧插件兼容字段不得突然删除。

## 验收标准

- Free 用户每日 extension 下载上限为 5 次。
- Unlimited 有效用户 extension 下载上限为不限次数。
- 未登录匿名设备按 Free 5 次/天计数。
- website 下载不受订阅影响,仍只扣 Credits。
- Unlimited 可通过 pricing 页使用 PayPal / Telegram Stars 购买;是否自动续费由商品配置决定。
- 已有有效 Unlimited 时不能再次购买 Unlimited,点击灰化订阅按钮会提示存在有效订阅。
- 有效订阅可补差升级到同线更高档:升级后档位与当月额度立即为新档,到期时间与升级前一致。
- 一次性支付线升级沿用当前订阅渠道并只补差价;ClinkBill 自动续费升级立即按渠道报价扣款,PayPal 升级经用户批准后生效、折算差额下个账期随续费扣收;用户关闭回跳页时服务端仍能同步新档,两种渠道下一期均按新档价格续费。
- 非更高档、补差金额不为正、同线无有效订阅时,升级入口不可用并有明确提示。
- 有效自动续费订阅在 Pricing 展示管理入口;PayPal / ClinkBill 分别打开对应渠道管理页。
- 打开、返回或关闭渠道管理页不会修改本站订阅状态与到期时间。
- extension options 不再出现订阅套餐购买页;旧订阅卡片和插件内订阅提示弹窗已移除或不再被引用。
- 订阅状态接口能返回当前档位、到期时间、当日 extension 已用/剩余/上限。
- 旧标量额度字段镜像当前 extension 下载上限。
- 续费 webhook 重复到达不重复延长权益。

## 用户操作逻辑与 UI 元素

### extension 订阅状态展示

extension UI 只做状态展示和升级引导,不做套餐选择和购买。

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 当前档位 | 文本 | 否 | 展示 Free 或 Unlimited Download |
| 次数计数器 | 文本 | 否 | Free 展示剩余/每日上限;Unlimited 隐藏或展示 Unlimited |
| 升级按钮 | 按钮 | 是 | 打开 website pricing 页 |
| 到期提示 | 文本 | 否 | Unlimited 显示到期或续费状态 |

旧 options 订阅套餐页不是当前产品界面。`SubscriptionPlans` 这类插件内购买组件、`options_page` 入口和打开 options 的升级路径都应保持删除状态。

### pricing 页订阅卡

订阅卡归 `@../011.Pricing页/feat.md`。本域只声明权益和状态,不重复页面 UI。

## 数据埋点

订阅购买埋点归 pricing 页,见 `@../011.Pricing页/feat.md`。本域额外关注 extension 额度:

| 事件 | 说明 | 关键字段 |
| --- | --- | --- |
| `extension_quota_exhausted` | Free 用户当日次数用尽 | `limit`、`used`、`login_state` |
| `extension_upgrade_click` | 点击升级入口 | `source`、`current_plan` |
| `extension_subscription_status_loaded` | 订阅状态加载成功 | `plan`、`limit`、`remaining` |

## 关联文档

- 订阅商品配置与状态:`@tech-订阅商品与状态.md`
- 订阅升级:`@tech-订阅升级.md`
- 额度与速率档位:`@tech-额度与速率档位.md`
- 好评赠送订阅:`@tech-好评赠送订阅.md`
- Pricing 页:`@../011.Pricing页/feat.md`
- extension 每日额度链路:`@../000.架构/tech-extension.md`
