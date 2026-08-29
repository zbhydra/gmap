# 008 · Dashboard

> 覆盖管理后台 Dashboard 菜单的只读统计接口。通用 admin 接口约定见 `@tech-管理模块接口.md`,后台架构与认证见 `@tech-后台架构与认证.md`。

## 范围

Dashboard 只读展示运营统计,复用现有 Dashboard 服务。打点数据口径属计数器 / 用户域,本文件只描述 admin 侧读取接口。

## 接口

| 方法 | 路径 | 鉴权 |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | `get_admin_user` |

响应:

- `summary`: `total_users`、`new_users`、`new_users_yesterday_same_period`、`new_users_yesterday_same_period_change_percent`、`active_users_24h`、`active_users_7d`。昨日同期口径为 UTC+8 昨日 0 点到昨日当前同一时刻。
- `mark_types`: 打点类型数组。
- `rows`: 60 天按天数据,每行含 `date_label`、`registered_count`、各打点类型的 `event_count` / `device_count`。

Admin 前端展示规则:

- 表格不展示 `web_parse_input_click`、`web_download_click`、`web_page_open`;只在 admin UI 层隐藏,后端响应、数据库与打点采集不删除。
- `web_first_opened` 作为动态打点列第一列展示;`content_open`、`download_click`、`popup_open` 移到动态列末尾,其余打点保持后端返回顺序。
- `web_extension_store_review_click` 紧跟 `web_pricing_open_from_extension`,用于对照插件来源 Pricing 曝光与实际前往商店评价页的点击;单元格继续展示事件数 / 独立设备数。

## 实现锚点

| 模块 | 后端 API | 后端 service |
| --- | --- | --- |
| Dashboard | `@backend/src/app/api/admin/admin_dashboard.py` | 复用 DashboardService |
