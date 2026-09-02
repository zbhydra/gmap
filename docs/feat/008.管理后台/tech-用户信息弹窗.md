# 008 · 通用用户信息弹窗

> 覆盖管理后台内复用的客户端用户信息只读弹窗。通用 admin 接口约定见 `@tech-管理模块接口.md`;用户账号数据属 `@../007.用户系统`,Credits 属 `@../003.积分系统`,订阅属 `@../006.订阅系统`,用量计量属 `@../000.架构/tech-额度基建.md`,订单属本域订单管理。本文只描述 admin 侧聚合展示和前端复用入口;profile 接口契约定义在 `@tech-用户管理.md`。

## 范围

### 包含

- 后台内展示的非空 `user_id` 都可作为入口打开同一个用户信息弹窗。
- 用户基础信息:ID、邮箱、注册来源、注册方式、注册 IP(归属地)、最后登录 IP(归属地)、最后一次操作 IP(归属地)、注册时间、最后登录时间、登录次数、账号状态。
- 权益信息:当前 Credits 余额、四条产品线(extension / maps_extension / maps_online / maps_api)各自的订阅状态与过期时间、三条 Maps 产品线的当月用量快照。
- 下方「订单列表」区块:数据源为 `orders`,远程分页,不筛选状态,成功/失败/待支付/取消/过期等所有订单都展示。
- 管理后台所有展示时间统一格式为 `YYYY-MM-DD HH:mm:ss`,按固定 UTC+8 展示,不使用浏览器 locale 默认格式。

### 不包含

- 用户编辑、封禁、删除、改邮箱、代充、人工改订阅。
- 风控记录。
- 积分记录查看 UI(后端 `/credits` 接口已提供,前端暂无消费方)及其筛选、导出。
- 打开弹窗时用 IP 实时 GeoIP 查询。IP 归属地只读 `users` 表已有国家 / 地区字段。

## 已裁决方案

采用「聚合 profile 接口 + 订单独立分页接口 + 前端复用弹窗组件」:

- `GET /api/admin/users/{user_id}/profile` 读取用户基础信息、Credits 余额、四线订阅摘要与三线用量快照(契约与错误码见 `@tech-用户管理.md`)。
- `GET /api/admin/users/{user_id}/credits` 按流水 ID 倒序分页读取 `user_credit_logs`;前端当前无消费方,接口保留备查。
- `GET /api/admin/users/{user_id}/orders` 分页读取该用户全部订单。
- 前端 `UserInfoDialog.vue`,各页面在展示用户 ID 的位置调用弹窗 `open(userId)`。

未采用方案:

- 把积分记录和订单列表塞进 profile 接口:分页会让 profile 响应和 tab 状态耦合,后续 tabs 扩展更难维护。
- 在订单详情接口内附带用户信息:只能服务订单页,无法覆盖其他用户 ID 入口。
- 打开弹窗实时查 GeoIP:增加依赖和不稳定外部行为,且与需求确认的「ip(归属地)」现有字段展示不一致。

## 数据口径

### 用户基础信息

来源 `users`:

| 字段 | 说明 |
| --- | --- |
| `user_id` | 用户 ID |
| `email` | 当前邮箱 |
| `full_name` / `avatar_url` | 当前资料字段,可为空 |
| `register_source` | 注册来源,例如 website / extension |
| `register_method` | 首次注册方式,例如 google / email_code |
| `register_ip` + `register_country` | 注册 IP(归属地) |
| `last_login_ip` + `last_login_country` | 最后登录 IP(归属地) |
| `last_operation_ip` + `last_operation_country` | 最后一次操作 IP(归属地) |
| `created_at` / `updated_at` / `last_login_at` | 毫秒时间戳 |
| `login_count` | 登录次数 |
| `is_del` | 账号是否已注销 |

展示规则:

- IP 和归属地成对展示为 `ip (country)`,IP 或国家缺失时缺失部分显示 `-`,两者都缺失时整项显示 `-`。
- `is_del=true` 显示已注销;否则显示正常。
- 用户不存在返回业务错误,前端 toast 后保留错误态,不伪造用户信息。

### Credits

来源 `user_credit_accounts`,通过 `user_credit_service.get_balance(user_id)` 读取。账户不存在返回 0。

### 订阅(按产品线)

来源 `user_subscriptions` 原始行,`subscriptions` 固定四行;逐线读取方式、`has_subscription` 折算公式、无付费行 / 过期行口径与历史 MultipleResultsFound 修复记录见 `@tech-用户管理.md`(契约唯一落点),本文不重复。

### 用量快照

来源 000 域统一用量服务三线门面,`usage` 固定三行;`total` 单一真源与 `PAYMENT_GATEWAY_ERROR` fail-closed 语义见 `@tech-用户管理.md` 与 `@../000.架构/tech-额度基建.md`,本文不重复。

### 积分记录

来源 `user_credit_logs`:

| 字段 | 说明 |
| --- | --- |
| `id` | 流水 ID |
| `change_amount` | Credits 变化量,正数为获得,负数为消耗 |
| `reason` | 变动原因标识,原值返回 |
| `metadata_json` | 业务扩展 JSON 快照,可为空 |
| `created_at` | 流水创建时间 |

排序只按 `id desc`;流水 ID 的递增顺序即写入顺序。分页参数 `page` 默认 1,`page_size` 默认 20,最大 100。

### 订单列表

来源 `orders`,复用订单管理列表的只读字段和状态口径:

- 只按 `user_id` 过滤,不提供状态、商品、支付方式等筛选。
- 展示全部订单状态和全部履约状态,包括成功、失败、未回调、超过重试等。
- 排序按 `created_at desc, id desc`;分页参数 `page` 默认 1,`page_size` 默认 20,最大 100。

## 接口

所有接口前缀 `/api/admin`,鉴权 `get_admin_user`,只读 GET。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/admin/users/{user_id}/profile` | 用户基础信息 + Credits + 四线订阅摘要 + 三线用量快照 |
| GET | `/api/admin/users/{user_id}/credits` | 用户积分记录分页,按流水 ID 倒序 |
| GET | `/api/admin/users/{user_id}/orders` | 用户订单分页,全状态 |

### Profile 响应

`user` 块字段不变;权益块(`credits` / `subscriptions` / `usage`)的结构、折算口径与响应示例见 `@tech-用户管理.md`(契约唯一落点),本文不重复。

### Credits 响应

```jsonc
{
  "rows": [
    {
      "id": 12,
      "change_amount": -2,
      "reason": "download_charge",
      "metadata_json": null,
      "created_at": 1780000000000
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

### Orders 响应

响应结构与订单管理列表行一致,外层分页结构如下:

```jsonc
{
  "rows": [
    {
      "id": 1,
      "order_no": "ORD...",
      "user_id": 123,
      "user_email": "user@example.com",
      "product_class": 1,
      "product_id": "unlimited",
      "product_name": "Unlimited",
      "amount": 9900000,
      "currency": "USD",
      "order_status": 2,
      "callback_status": 3,
      "payment_method": "paypal",
      "payment_data": {},
      "payment_channel_order_no": "P-xxx",
      "payment_transaction_id": "PAYID-xxx",
      "payment_channel_uid": "",
      "paid_amount": 9900000,
      "paid_currency": "USD",
      "created_at": 1780000000000,
      "updated_at": 1780000000000,
      "paid_at": 1780000000000,
      "expired_at": 1780001800000,
      "client_ip": "1.2.3.4",
      "extra_metadata": {}
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

## 后端实现

后端文件与实现规则(含 2026-09-02 profile 多线契约升级涉及的 `user_service` / `subscription_service` / `usage_service` 改动)统一见 `@tech-用户管理.md` 的文件树与实现锚点;本节不重复。弹窗相关的既有约束仍然有效:

- API 层校验 `user_id >= 1`、`page >= 1`、`1 <= page_size <= 100`。
- service 为类 + 模块级实例,不使用 `@singleton`,不新增依赖注入。
- profile 聚合允许读取多个业务域,但只读不写。
- credits 查询用 `WHERE user_id = ? ORDER BY id DESC OFFSET ? LIMIT ?`;count 与列表复用同一用户条件。
- orders 查询复用订单 service,仅传 `user_ids=[user_id]`,不传任何状态过滤。
- 不新增索引。`user_credit_logs` 保持无索引;本接口是 admin 低频分页排查,单个用户流水量可接受排序开销。

## 前端实现

新增 / 修改:

```text
admin/src/api/users.ts
admin/src/components/UserInfoDialog.vue
admin/src/utils/time.ts
admin/src/views/UsersView.vue        # 2026-09-02 新增接入点
admin/src/i18n/zh-CN.json
admin/src/i18n/en-US.json
```

组件规则:

- `UserInfoDialog.vue` 内部持有 profile loading 与订单分页状态。
- 暴露 `open(userId: number): void`;每次打开重置订单分页为 1,加载 profile + 订单第一页数据。
- modal 使用 `NModal preset="card"` 或同等 Naive UI 组件,宽度 `min(960px, calc(100vw - 32px))`。
- 上半部分为基础信息和权益信息;下半部分为「订单列表」区块(无 tabs)。
- 权益信息三块:
  - Credits 余额(描述列表项,原样数字)。
  - 订阅权益:固定四行,行 label = 产品线 i18n 名(TG 插件 / Maps 插件 / Maps 云端 / Maps API),值 = 状态标签 + 过期时间;订阅中绿标签,未订阅灰标签;过期行的过期时间弱化(灰)展示;`expires_at` 为 null 显示 `-`。
  - 当月用量:固定三行,行 label 同上,值 = 周期标签(`ym` 整数转 `YYYY-MM`)+ `used/total`(表格数字对齐);`exhausted=true` 追加红色「已耗尽」标签。
- 订单表格远程分页,列为订单号、商品、金额、订单状态、履约状态、支付方式、创建时间。
- 所有用户可见文案走 `userInfo.*` i18n;产品线名与订阅 / 用量文案中英同步。
- 所有时间展示调用 `admin/src/utils/time.ts`,固定输出 `YYYY-MM-DD HH:mm:ss` UTC+8。
- 用户 ID 入口使用按钮或链接样式,有 hover / focus 可见反馈;点击不影响行内复制、查看详情等其他按钮。

接入点:

| 页面 | 位置 |
| --- | --- |
| 用户管理 | 用户列表用户 ID 列 |
| 订单管理 | 订单列表用户列、订单详情抽屉用户项 |

## 异常与空态

- profile 加载失败:弹窗显示错误状态并 toast,不让页面崩溃。
- orders 加载失败:保留 profile,订单区显示错误 toast 和空表或上次数据。
- 时间为空:显示 `-`。
- `user_id=null` 的位置不渲染入口,显示 `-`。

## 验证

后端(real 测试,含列表 / 多线 profile / 用量断言):

```bash
cd backend
uv run pytest tests/integration/real/api/admin/test_admin_users_real.py
```

前端:

```bash
cd admin
pnpm build
pnpm test:e2e -- users.spec.ts
```

人工:

- 用户管理页与订单管理的用户 ID 都能打开同一个弹窗。
- 弹窗展示 IP(归属地)、Credits、四线订阅(绿 / 灰标签与过期时间)、三线用量(周期标签、used/total、耗尽红标);订单列表可分页。
- 字段缺失、用户不存在不导致页面崩溃。
