# 008 · Dashboard

> 覆盖管理后台 Dashboard 菜单的只读统计接口与图表展示。通用 admin 接口约定见 `@tech-管理模块接口.md`,后台架构与认证见 `@tech-后台架构与认证.md`。

## 范围

Dashboard 只读展示运营统计,复用现有 Dashboard 服务。打点数据口径属计数器 / 用户域,本文件只描述 admin 侧读取接口与图表展示。

## 接口

| 方法 | 路径 | 鉴权 |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | `get_admin_user` |

响应:

- `summary`: `total_users`、`new_users`、`new_users_yesterday_same_period`、`new_users_yesterday_same_period_change_percent`、`active_users_24h`、`active_users_7d`。昨日同期口径为 UTC+8 昨日 0 点到昨日当前同一时刻。
- `mark_types`: 打点类型数组。
- `rows`: 60 天按天数据,每行含 `date_label`、`registered_count`、各打点类型的 `event_count` / `device_count`。

## 图表

Dashboard 在统计卡片与表格之间展示两张图表,数据与表格**完全同口径**(同一份接口响应,零后端改动、不做二次加工):

- **注册趋势(柱状图)**:X 轴 = 60 天日期(`rows` 倒序数据反转为时间从旧到新),单系列 = 每日 `registered_count`;axis 触发 tooltip。
- **打点事件趋势(多系列折线图)**:每个 admin 可见打点类型一条折线,取各天 `event_count`(`device_count` 不上图);系列名 = 打点类型原值,与表格列头同口径;顶部滚动 legend,点击可隐藏 / 显示系列。

展示规则:

- 图表高度桌面 320px、移动端(≤960 单列体系)260px;宽度铺满容器。
- 加载失败时两图各自显示 `NEmpty` 空态占位,与下方表格隔离(表格继续展示自身加载态,互不影响)。
- echarts Canvas 不能直接消费 CSS 变量,option 构建时从 `styles/global.css` 读取当前主题 token 的计算值:6 色循环取色,轴文字 text-3、轴线 / 分隔线 border;系统亮暗偏好变化时重新生成 option。

### ChartCanvas 组件

`admin/src/components/ChartCanvas.vue` 是唯一的 echarts 承载组件,职责单一:

- 管理 echarts 实例生命周期(mount 时 init + setOption,unmount 时 dispose)。
- `ResizeObserver` 监听容器尺寸变化触发 `chart.resize()`;`option` 变更时以 `notMerge` 全量替换,避免系列增减时残留旧系列。
- option 由调用方(DashboardView)全量构建,组件不做业务加工。
- 按需注册:只引 `echarts/core` + Bar / Line 图 + Grid / Tooltip / Legend 组件 + Canvas 渲染器,不引 wrapper 库;echarts 是本次唯一新增依赖(2026-09-02)。

## 打点列可见性

Admin 前端展示规则:

- 表格与折线图都不展示 `web_page_open`(HIDDEN);`content_open`、`popup_open` 移到动态列与折线图 legend 末尾(TRAILING),其余打点保持后端返回顺序。`web_first_opened` 作为动态打点列第一列展示。
- `web_extension_store_review_click` 紧跟 `web_pricing_open_from_extension`,用于对照插件来源 Pricing 曝光与实际前往商店评价页的点击;单元格继续展示事件数 / 独立设备数。
- HIDDEN / TRAILING 只是 admin UI 层过滤,后端响应、数据库与打点采集不删数据。2026-09-02 起,两列表中已无枚举、无上报方的三个死成员 `web_parse_input_click`、`web_download_click`、`download_click` 从过滤清单删除(`content_open` / `popup_open` 仍有活跃上报,保留)。

## 实现锚点

| 模块 | 后端 API | 后端 service | 前端 |
| --- | --- | --- | --- |
| Dashboard | `@backend/src/app/api/admin/admin_dashboard.py` | 复用 DashboardService | `admin/src/views/DashboardView.vue`(option 构建)、`admin/src/components/ChartCanvas.vue`(echarts 生命周期) |
