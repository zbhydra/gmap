# 008 · 用户管理

> 覆盖用户管理菜单的只读查询接口与通用用户信息弹窗的 profile 契约。通用 admin 接口约定见 `@tech-管理模块接口.md`;用户账号数据属 `@../007.用户系统`,订阅属 `@../006.订阅系统`,用量计量属 `@../000.架构/tech-额度基建.md`。

## 范围

用户数据模型属用户域,本域只提供只读查询接口,不做任何写操作。列表包含已注销用户(状态列区分),服务运营排障。

## 用户列表

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/api/admin/users` | `get_admin_user` | 分页 + 多条件筛选用户列表,含已注销用户 |

Query 参数:

| 参数 | 类型 | 必传 | 说明 |
| --- | --- | --- | --- |
| `page` | int | 否 | 页码,默认 1,≥1 |
| `page_size` | int | 否 | 每页数量,默认 20,1-100 |
| `user_id` | int | 否 | 用户 ID,精确匹配,≥1 |
| `email` | string | 否 | 当前邮箱包含(模糊)匹配,≤64 字符,内部做 normalize |
| `status` | string | 否 | 账号状态枚举 `normal` / `locked` / `deleted`,不传 = 全部 |
| `created_start` | int | 否 | 注册时间起点,毫秒时间戳(闭开区间,含起点) |
| `created_end` | int | 否 | 注册时间终点,毫秒时间戳(闭开区间,不含终点) |

错误码:

- `created_start > created_end` 时返回 `INVALID_REQUEST`,响应 `data` 携带 `{"field": "created_range"}`。
- 用户不存在场景仅出现在 profile 弹窗(见下文),列表无此错误。

响应 `data`:`rows`(行结构如下)、`total`(符合筛选条件总数)、`page`、`page_size`。

行字段:`user_id`、`email`(可空)、`register_source`(可空)、`register_method`(可空)、`register_country`(可空)、`account_status`、`login_count`、`last_login_at`(可空)、`created_at`。

列表边界与口径:

- 排序固定 `user_id desc`,与既有 `user_lists` 一致。
- 账号状态过滤口径与 `UserModel.account_status()` 一致,注销优先于锁定:`deleted` = `is_del` 为真;`locked` = 未注销且 `locked_until` 非空并大于当前时间;`normal` = 未注销且未处于锁定期。
- `email` 模糊与 `created_at` 范围查询无专用索引:users 表量级小 + admin 低频排查,与 `user_credit_logs` 先例同口径,不加索引(不满足 spec-index 触发条件)。
- 列表与计数复用同一套 WHERE 条件(`user_service._apply_user_list_filters`),避免两套口径漂移。

## profile 契约(用户信息弹窗聚合)

`GET /api/admin/users/{user_id}/profile` 响应升级为多产品线订阅 + 当月用量快照:

```jsonc
{
  "user": { "...": "AdminUserBasicInfo 字段不变" },
  "credits": { "balance": 88 },
  "subscriptions": [
    { "product_line": "maps_extension", "has_subscription": true, "expires_at": 1782000000000 }
  ],
  "usage": [
    { "product_line": "maps_extension", "ym": 202609, "used": 320, "total": 1000, "exhausted": false }
  ]
}
```

- `subscriptions` 固定四行,顺序 `extension` → `maps_extension` → `maps_online` → `maps_api`;经 `subscription_service.get_subscription_row(user_id, product_line)` 按复合主键逐线读原始行,不再使用旧 `get_by_id` 单行读法(用户持有 ≥2 条产品线订阅行时会 MultipleResultsFound 导致 500,本次修复)。
- `has_subscription = expires_at is not None and expires_at > now_ms`;无付费行(Free 不落库口径)= `false` + `expires_at: null`;已过期行压成 `false` 但保留原始过期时间供排障。
- `usage` 固定三行(maps 三线),经 000 域 usage 三线门面各调 `get_usage(usage_identity(user_id, None), user_id=user_id)`;`ym` 为当前业务月(YYYYMM),`total` 单一真源 = 所持档位(付费或 free 档)配置的月度额度,当前 free 档配置为 maps_extension / maps_online 各 1000、maps_api 20。
- 档位配置合同破裂(配置行缺失或月度额度为空)由 usage 门面抛 `PAYMENT_GATEWAY_ERROR` 维持 fail-closed,profile 不兜底(三线 free 档已配,常态不触发)。
- 旧单数 `subscription` 字段删除,前后端同仓同步改,不留兼容。
- 用户不存在返回 `USER_NOT_FOUND`。
- 弹窗展示规格(绿 / 灰标签、exhausted 红标、ym 周期标签、产品线 i18n 名)见 `@tech-用户信息弹窗.md`。

## 前端

- 侧边栏菜单「用户管理」(顺序:Dashboard → 用户管理 → 订单管理 → 系统设置),路由 `Users`,`/users`,需登录。
- 筛选区:用户 ID 数字输入(精确)、邮箱文本输入(包含)、账号状态下拉(全部 / normal / locked / deleted)、注册时间 datetimerange(闭开区间);查询按钮回第一页加载,重置按钮清空全部条件并重新加载;空筛选不下发对应参数。
- 表格:远程分页(默认 20,可选 20 / 50 / 100),9 列 = 用户 ID、邮箱(超长省略 + 悬停气泡)、注册来源、注册方式、注册国家、账号状态(标签:绿 normal / 黄 locked / 红 deleted)、登录次数、最后登录时间、注册时间;`scroll-x` 1210;空值占位 `-`。
- 用户 ID 列为文字按钮,点击打开通用用户信息弹窗(`UserInfoDialog.open(userId)`),弹窗契约见 `@tech-用户信息弹窗.md`。
- 加载失败:toast 错误并清空表格,可重试。
- 文案走 `users.*` i18n,中英同步。

## 文件树

后端修改:

```text
backend/src/app/api/admin/admin_users.py            # 新增列表端点
backend/src/app/services/admin_user_profile_service.py  # get_users + profile 契约升级
backend/src/app/services/user_service.py            # user_lists 扩 status/created 过滤 + count_users
backend/src/app/services/subscription_service.py    # _get_subscription_row 公开为 get_subscription_row
backend/src/app/models/user_model.py                # account_status() 收敛为模型方法
backend/src/app/schemas/admin_user_schema.py        # 列表/订阅行/用量行 schema
backend/src/app/constants/auth.py                   # UserAccountStatus 稳定枚举
backend/tests/integration/real/api/admin/test_admin_users_real.py  # 新增,real 9 条
```

前端新增 / 修改:

```text
admin/src/views/UsersView.vue        # 新增,用户管理页
admin/e2e/users.spec.ts              # 新增,e2e 4 条
admin/src/api/users.ts               # 列表封装 + profile 类型升级
admin/src/router/index.ts            # /users 路由
admin/src/layouts/AdminLayout.vue    # 菜单项
admin/src/i18n/zh-CN.json / en-US.json
```

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| 用户列表 / profile | `@backend/src/app/api/admin/admin_users.py` | `@backend/src/app/services/admin_user_profile_service.py`(聚合)、`@backend/src/app/services/user_service.py`(列表 + 计数)、`@backend/src/app/services/subscription_service.py`(按线读订阅行)、`@backend/src/app/services/usage_service.py`(三线用量门面) |
