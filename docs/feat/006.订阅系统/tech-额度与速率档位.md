# 006 · 额度与速率档位

> 当前源码实现口径。覆盖订阅档位对 extension 下载额度的配置、website 下载边界、旧插件标量字段兼容。

## 每日额度

| 类型 | 当前用途 |
| --- | --- |
| `EXTENSION_DOWNLOAD` | extension 下载每日次数 |
| `WEB_DOWNLOAD` | 历史枚举;website 下载不走订阅 |
| `WEB_PLAY` | 历史枚举;播放入口已屏蔽 |

| 商品 | metadata.daily_limit |
| --- | ---: |
| `free` | 5 |
| `unlimited` | -1 |

`-1` 表示不限次数。website 下载继续走 Credits,不读取订阅额度。

## metadata 字段

| 字段 | 说明 |
| --- | --- |
| `daily_limit` | 插件每日下载上限 |
| `extension_daily_download_limit` | 插件每日下载上限兼容字段 |
| `auto_renew` | 商品当前售卖形态是否为自动续费,不能用于判断用户当前是否仍会自动续费 |
| `proxy_user_rate_limit_mb_per_second` | 展示字段,当前实际限速不读它 |

Free 档可省略 metadata 并由服务端补 5 次/天。付费商品的额度和续费方式直接读取 metadata;`auto_renew=true` 创建渠道订阅,`auto_renew=false` 创建一次性支付。字段只校验类型和合法范围,不在代码中锁死运营配置值。站内取消自动续费暂不实现;后续实现时,用户订阅实例的本站取消状态由 `billing_mode/cancelled_at` 计算,不读取当前商品 metadata。

## 计数器衔接

`quota_service` 读取当前用户订阅配置后返回插件下载上限:

- Free:每日 5 次。
- Unlimited:不限次数。
- 匿名设备:按 Free。

## 订阅状态响应

结构化字段:

| 字段 | 取值 |
| --- | --- |
| `extension_download.limit` | 当前插件上限,Free=5,Unlimited=-1 |
| `extension_download.use` | 今日已用 |
| `extension_download.remaining` | 剩余次数,不限时为 -1 |

订阅状态不返回 `web_download` / `web_play` 或播放标量字段。旧下载标量字段继续保留并镜像插件下载额度,用于旧插件兼容。

## 边界

| 场景 | 行为 |
| --- | --- |
| website 下载 | 只扣 Credits |
| extension Free 用户 | 每日 5 次 |
| extension Unlimited 用户 | 不限次数 |
| 额度服务异常 | 按计数器系统 fail-open 策略 |
