# 009 · GSC 与 GA4 运行时采集

> 技术实现文档。覆盖:后台手动 Google OAuth 授权、GSC / GA4 指标采集口径、统一快照表、cron 任务、系统设置页入口。
>
> 关联:
> - 本域产品:`@feat.md`
> - admin 系统设置入口:`@../008.管理后台/tech-系统设置.md`
> - cron 框架:`@../000.架构/tech-Crons框架.md`
> - 数据库规范:`@../000.架构/tech-数据库.md`

## 1. 结论

所有目标数据都能通过 Google 官方 API 采集,但口径分两类:

| 来源 | 目标数据 | 是否可采集 | API 与口径 |
| --- | --- | --- | --- |
| GSC | 24H 点击、曝光、平均点击率、平均排名 | 可采集 | Search Analytics `query`,使用 `dataState=hourly_all` + `hour` 维度得到 fresh/hourly 部分数据;数据可能后续变化 |
| GSC | 24H 查询词列表 | 可采集 | Search Analytics `query`,使用 `dataState=hourly_all` + `query` / `hour` 维度,按最近 24 个可用小时本地聚合 top rows |
| GSC | 7D / 28D 点击、曝光、平均点击率、平均排名 | 可采集 | Search Analytics `query`,普通日期范围聚合 |
| GSC | 7D / 28D 查询词、页面、国家、设备、日期趋势、高曝光低 CTR | 可采集 | Search Analytics `query`,按 `query` / `page` / `country` / `device` / `date` 维度聚合,仍只保存 top 聚合快照 |
| GA4 | Active users in last 30 minutes | 可采集 | Analytics Data API `runRealtimeReport`,metric=`activeUsers` |
| GA4 | Active users | 可采集 | Analytics Data API `runReport`,metric=`activeUsers`,按 today / 7D / 28D 三个自然日窗口采 |
| GA4 | 用户首次来源、会话来源、入口页、页面参与、国家、事件 | 可采集 | Analytics Data API `runReport`,按 `firstUser*` / `session*` / `landingPagePlusQueryString` / `pagePath` / `eventName` 等维度采 top 聚合快照 |

这些窗口不是跨产品同一时区口径:GSC 日期按 Search Console API 的 PT 日期解释;GA4 日期按 GA4 property reporting time zone 解释。后台展示和 JSON 都必须带窗口定义,避免把 GSC 7D / 28D 与 GA4 7D / 28D 当成完全同一自然日区间比较。

官方依据:

- Search Console Search Analytics 返回 `clicks` / `impressions` / `ctr` / `position`,并支持 `dataState=hourly_all` 返回小时数据;官方说明 `hourly_all` 可能包含未完成数据。
- Search Console 私有用户数据必须 OAuth 2.0 授权,只读 scope 是 `https://www.googleapis.com/auth/webmasters.readonly`。
- GA4 Core Reporting 支持 `activeUsers` metric。
- GA4 Realtime API 支持 `activeUsers` metric 和 `minutesAgo` dimension,实时方法与 core report 支持的维度指标集合不同。
- GA4 Data API `DateRange` 是连续自然日范围,支持 `today` / `yesterday` / `NdaysAgo`;不直接表达滚动到秒的 24 小时去重窗口。
- Google OAuth web server flow 用 `access_type=offline` 获取 refresh token,供后台离线刷新 access token。

官方链接:

- GSC Search Analytics:`https://developers.google.com/webmaster-tools/v1/searchanalytics/query`
- GSC OAuth scopes:`https://developers.google.com/webmaster-tools/v1/how-tos/authorizing`
- GA4 Core dimensions / metrics:`https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema`
- GA4 DateRange:`https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/DateRange`
- GA4 Realtime dimensions / metrics:`https://developers.google.com/analytics/devguides/reporting/data/v1/realtime-api-schema`
- Google OAuth web server flow:`https://developers.google.com/identity/protocols/oauth2/web-server`

## 2. 范围

### 2.1 包含

- 系统设置页新增 Google 数据授权区块。
- 后端保存一个 Google OAuth 授权。
- 系统设置页配置一个 Google OAuth client、一个 GSC siteUrl 与一个 GA4 propertyId。
- cron 定期采集 GSC 与 GA4 指标。
- 用一张统一快照表保存采集结果:时间戳、类型、数据 JSON。
- 后台可查看授权状态与最近一次采集状态。

### 2.2 不包含

- 不做多 Google 账号、多 GSC 站点、多 GA4 property 管理。
- 不做 Service Account 授权;Search Console 与 GA4 都走管理员手动 OAuth。
- 不采全量 GSC 查询词 / 页面 / 国家 / 设备明细,只采 24H / 7D / 28D top 聚合快照。
- 不采全量 GA4 事件、页面、来源渠道明细,只采 top 聚合快照。
- 不采 GA4 留存、收入、电商、广告成本。
- 不做图表、告警、导出、补偿重算。
- 不展示 Google 授权账号邮箱;首版只申请 GSC / GA4 两个只读数据 scope,不额外申请 `openid` / `email`。

## 3. 授权方案

### 3.1 唯一方案

后台系统设置页由管理员手动 OAuth 授权,后端保存 refresh token。

不采用配置文件 token JSON 的原因:

- JSON token 适合离线脚本,不适合后台可见的运行时授权状态。
- refresh token 失效后需要重新授权,后台入口能让管理员自助恢复。
- cron 运行在业务进程中,从 DB 读取授权状态更直接。

### 3.2 Google Cloud 前置条件与后台配置

Google Cloud 控制台需启用:

- Google Search Console API。
- Google Analytics Data API。

后台系统设置页「google 数据采集」tab 需填写并保存:

| 配置 | 说明 |
| --- | --- |
| `client_id` | Google OAuth Web Client ID |
| `client_secret` | Google OAuth Web Client Secret;保存后不回显,再次保存留空表示保留旧值 |
| `gsc_site_url` | GSC siteUrl;可填 `sc-domain:telegramdownloadmedia.com` 或裸域名,裸域名保存时归一化为 `sc-domain:` |
| `ga4_property_id` | GA4 property ID |

`redirect_uri` 不由管理员填写且不在后台展示,后端按 `app.public_api_base_url + /api/admin/system-settings/google-data/oauth/callback` 自动生成。授权接口不做站点地址 fallback,`app.public_api_base_url` 必须明确配置为当前 Admin API 对外根地址。

可编辑配置保存到 `system_data.data_key="google_data"` 的 JSON 中。运行时采集链路只读取该表和 `app.public_api_base_url`,不再从部署 YAML、离线脚本或历史默认值推断采集目标。

OAuth consent screen 需允许:

- `https://www.googleapis.com/auth/webmasters.readonly`
- `https://www.googleapis.com/auth/analytics.readonly`
- `https://www.googleapis.com/auth/chromewebstore.readonly`

首版不申请 `openid` / `email` scope,因此后台不展示 Google 授权账号邮箱。

### 3.3 OAuth 流程

1. 管理员点击系统设置页「授权 Google 数据」。
2. 前端请求 `POST /api/admin/system-settings/google-data/oauth/authorize`。
3. 前端提交 `admin_return_base_url=window.location.origin`;后端生成随机 `state`,写 Redis,返回 Google 授权 URL。
4. 前端跳转授权 URL。
5. 管理员在 Google 页面同意授权。
6. Google 回调 `GET /api/admin/system-settings/google-data/oauth/callback?code=&state=`。
7. 回调接口不走 admin bearer 鉴权,只校验并原子消费 `state`;`state` 中保存发起授权的 `admin_id`、API callback 地址和 Admin 回跳根地址。
8. 后端用 code 换 token。
9. 后端保存 `refresh_token` 与实际授权 scope。
10. 回调页按 `state.admin_return_base_url` 303 跳回 admin `/system-settings?google_data_authorized=1`。

授权 URL 参数:

| 参数 | 值 |
| --- | --- |
| `response_type` | `code` |
| `access_type` | `offline` |
| `prompt` | `consent` |
| `include_granted_scopes` | `true` |
| `scope` | GA4 / GSC / Chrome Web Store 三个只读 scope |

`prompt=consent` 必须保留,避免 Google 因历史授权不再返回 refresh token。

回调接口不依赖 admin JWT / Cookie,原因是 Google 跳回时管理员会话可能过期或浏览器不会带上原页面的 Authorization header;授权发起者只由一次性 `state` 绑定。

## 4. 数据模型

### 4.1 `google_data_oauth_token`

保存当前运行时采集使用的 Google OAuth 授权。首版只允许一条 `provider="google_data"` 记录。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | bigint PK | 自增 ID |
| `provider` | varchar(32) unique | 固定 `google_data` |
| `refresh_token` | text | Google refresh token |
| `scope` | varchar(512) | 实际授权 scope,空格分隔 |
| `is_active` | bool | 是否启用该授权 |
| `last_authorized_at` | bigint | 最近授权时间（毫秒时间戳） |
| `last_gsc_success_at` | bigint null | 最近 GSC 采集成功时间（毫秒时间戳） |
| `last_gsc_error_msg` | varchar(1024) null | 最近 GSC 采集错误摘要 |
| `last_ga4_success_at` | bigint null | 最近 GA4 采集成功时间（毫秒时间戳） |
| `last_ga4_error_msg` | varchar(1024) null | 最近 GA4 采集错误摘要 |
| `created_at` | bigint | 创建时间（毫秒时间戳） |
| `updated_at` | bigint | 更新时间（毫秒时间戳） |

索引:

- `provider` 唯一索引,服务按固定 provider 读取当前授权。

安全:

- 不在 API 响应、日志中输出 refresh token。
- token 可直接存 DB;本项目普通应用不引入额外 KMS / envelope encryption。泄漏风险由数据库访问控制承担。
- 重新授权覆盖旧 refresh token。
- 提供断开授权操作:本地删除 refresh token 并调用 Google revoke endpoint 尝试撤销;撤销接口失败时也删除本地 token,管理员可重新授权恢复。
- DB 备份、日志、错误响应不得包含 refresh token 明文。

### 4.2 `google_metric_snapshots`

统一指标快照表。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | bigint PK | 自增 ID |
| `collected_at` | bigint | 本次采集完成时间（毫秒时间戳） |
| `metric_type` | varchar(16) | `GSC` 或 `GA4` |
| `data_json` | mediumtext | 指标 JSON |
| `created_at` | bigint | 创建时间（毫秒时间戳） |

索引:

- 首版不加 `metric_type` / `collected_at` 索引。当前没有已实现查询路径,按项目索引规范不提前加。
- 后续如后台列表要按类型和时间倒序查,再补 `metric_type + collected_at` 联合索引,并在 PR 中补三件套。

### 4.3 `system_data`

后台可编辑系统数据配置表。Google 数据采集使用其中一行:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `data_key` | varchar(100) PK | 配置键;Google 数据采集固定为 `google_data` |
| `data_value` | json | 配置 JSON |
| `created_at` | bigint | 创建时间（毫秒时间戳） |
| `updated_at` | bigint | 更新时间（毫秒时间戳） |

`data_value` 结构:

```json
{
  "client_id": "xxx.apps.googleusercontent.com",
  "client_secret": "google-oauth-secret",
  "gsc_site_url": "sc-domain:telegramdownloadmedia.com",
  "ga4_property_id": "522445679"
}
```

缓存规则:

- `system_data_service` 读取全表并缓存 30 分钟。
- 更新 `system_data` 后立即清空本进程缓存。
- `client_secret` 不进入 status/API 响应,只返回 `client_secret_configured`。

### 4.4 GSC JSON

```json
{
  "source": "gsc",
  "site_url": "sc-domain:telegramdownloadmedia.com",
  "collected_at": 1799999999000,
  "windows": {
    "24h": {
      "window_label": "GSC fresh hourly last available 24 hours",
      "timezone": "America/Los_Angeles",
      "start": "2026-06-28T16:00:00-07:00",
      "end": "2026-06-29T15:00:00-07:00",
      "data_state": "hourly_all",
      "is_fresh": true,
      "first_incomplete_hour": "2026-06-29T12:00:00-07:00",
      "partial_hours": 4,
      "clicks": 4979,
      "impressions": 17700,
      "ctr": 0.281,
      "position": 4.5,
      "top_queries": [
        {
          "query": "telegram video downloader",
          "clicks": 120,
          "impressions": 800,
          "ctr": 0.15,
          "position": 3.2
        }
      ]
    },
    "7d": {
      "window_label": "GSC PT last 7 complete days ending yesterday",
      "timezone": "America/Los_Angeles",
      "start_date": "2026-06-22",
      "end_date": "2026-06-28",
      "data_state": "final",
      "clicks": 0,
      "impressions": 0,
      "ctr": 0,
      "position": 0,
      "top_queries": [
        {
          "query": "telegram video downloader",
          "clicks": 10,
          "impressions": 200,
          "ctr": 0.05,
          "position": 6.4
        }
      ],
      "top_pages": [],
      "countries": [],
      "devices": [],
      "dates": []
    },
    "28d": {
      "window_label": "GSC PT last 28 complete days ending yesterday",
      "timezone": "America/Los_Angeles",
      "start_date": "2026-06-01",
      "end_date": "2026-06-28",
      "data_state": "final",
      "clicks": 0,
      "impressions": 0,
      "ctr": 0,
      "position": 0,
      "top_queries": [],
      "top_pages": [],
      "countries": [],
      "devices": [],
      "dates": [],
      "high_impression_low_ctr_queries": [],
      "high_impression_low_ctr_pages": []
    }
  }
}
```

GSC 24H 计算:

1. 请求 `dimensions=["hour"]`,`dataState="hourly_all"`。
2. 额外请求 `dimensions=["query","hour"]`,`dataState="hourly_all"`,用于生成 24H `top_queries`。
3. 取 Search Console 返回的小时行与 `metadata.first_incomplete_hour`。
4. 选择最近 24 个可用小时求和 clicks / impressions;不丢弃 `first_incomplete_hour` 之后的行,但在 JSON 中记录 `first_incomplete_hour` 与 `partial_hours`,明确这是 fresh 数据。
5. 24H `top_queries` 最多扫描 25,000 条 `query + hour` rows,只保留落在上述 24 小时边界内的数据并按 query 聚合 clicks / impressions / ctr / position;聚合后按 impressions 降序、clicks 作为同曝光时的次排序,最多保存 200 行。
6. `ctr = clicks / impressions`,impressions 为 0 时为 0。
7. `position` 按 impressions 加权平均;impressions 为 0 时为 0。
8. 保留 `is_fresh=true`,提醒该值会随 Google 后续处理修正。
9. 验收只要求 API 字段完整和口径标记正确,不要求与 Search Console UI 截图完全一致;截图所在 property 必须与后台 `system_data.google_data.gsc_site_url` 配置相同才可人工对比。

GSC 7D / 28D 计算:

- 请求无 dimensions 的聚合报表。
- 同一窗口额外请求 `query` / `page` / `country` / `device` / `date` 维度 top rows。
- `query` 维度最多扫描 25,000 行,本地按 impressions 降序、clicks 次排序后保存前 200 行;page / country / device 等其他维度继续沿用原有 Top 20 口径。
- 日期范围以 PT 日期传给 Search Console。
- GSC 与 GA4 快照在完成全部计算和筛选后,落库前将所有 float 值四舍五入到最多 4 位小数;整数和字符串类型不变。
- 默认 endDate 使用昨日,避免今天未完成数据污染 7D / 28D。
- 7D 是昨日往前 7 个 PT 自然日,28D 是昨日往前 28 个 PT 自然日。
- 28D 额外基于 query/page top rows 生成 `high_impression_low_ctr_*`;默认阈值为 `impressions >= 100 && ctr < 0.02`,再按 impressions 降序截断。
- JSON 必须写入 `window_label` 和 `timezone`,后台也要展示该口径。

### 4.5 GA4 JSON

```json
{
  "source": "ga4",
  "property_id": "522445679",
  "collected_at": 1799999999000,
  "realtime_30m": {
    "active_users": 12,
    "event_count": 24,
    "screen_page_views": 18
  },
  "windows": {
    "today": {
      "window_label": "GA4 property today",
      "timezone": "GA4 property reporting time zone",
      "start_date": "today",
      "end_date": "today",
      "active_users": 100
    },
    "7d": {
      "window_label": "GA4 property last 7 days including today",
      "timezone": "GA4 property reporting time zone",
      "start_date": "2026-06-23",
      "end_date": "2026-06-29",
      "active_users": 500,
      "overview": {
        "active_users": 500,
        "new_users": 200,
        "total_users": 620,
        "sessions": 900,
        "engaged_sessions": 500,
        "engagement_rate": 0.55,
        "average_session_duration": 64.5,
        "screen_page_views": 1200,
        "event_count": 3200
      },
      "user_acquisition": {
        "default_channel_group": [],
        "source_medium": [],
        "campaigns": []
      },
      "traffic_acquisition": {
        "default_channel_group": [],
        "source_medium": [],
        "campaigns": []
      },
      "landing_pages": [],
      "countries": [],
      "events": [],
      "business_events": [],
      "page_engagement": []
    },
    "28d": {
      "window_label": "GA4 property last 28 days including today",
      "timezone": "GA4 property reporting time zone",
      "start_date": "2026-06-02",
      "end_date": "2026-06-29",
      "active_users": 1800,
      "overview": {},
      "user_acquisition": {},
      "traffic_acquisition": {},
      "landing_pages": [],
      "countries": [],
      "events": [],
      "business_events": [],
      "page_engagement": []
    }
  }
}
```

GA4 30 分钟:

- 调 `properties/{property}:runRealtimeReport`。
- metrics: `activeUsers` / `eventCount` / `screenPageViews`。
- 不传 dimensions 时取总数。

GA4 today / 7D / 28D:

- 调 `properties/{property}:runReport`。
- today 仍只采 `activeUsers`,保持轻量。
- 7D / 28D 额外采:
  - `overview`: `activeUsers` / `newUsers` / `totalUsers` / `sessions` / `engagedSessions` / `engagementRate` / `averageSessionDuration` / `screenPageViews` / `eventCount`。
  - `user_acquisition`:按 `firstUserDefaultChannelGroup` / `firstUserSourceMedium` / `firstUserManualCampaignName` 聚合,回答“新增和活跃用户最初从哪里来”。
  - `traffic_acquisition`:按 `sessionDefaultChannelGroup` / `sessionSourceMedium` / `sessionManualCampaignName` 聚合,回答“当前会话从哪里来”。
  - `landing_pages`:按 `landingPagePlusQueryString` 聚合。
  - `countries`:按 `country` 聚合。
  - `events`:按 `eventName` 聚合。
  - `business_events`:只过滤项目核心事件 `form_start` / `form_submit` / `outbound_chrome_store_click` / `extension_recommended_click` / `internal_workflow_click`。
  - `page_engagement`:按 `pagePath` 聚合。
- 每个窗口单独请求一次,避免把 `dateRange` 当普通 dimension 导致 GA4 Data API 返回 `INVALID_ARGUMENT`。
- dateRange:
  - `today`: `startDate="today"`,`endDate="today"`。
  - `7d`: `startDate="6daysAgo"`,`endDate="today"`。
  - `28d`: `startDate="27daysAgo"`,`endDate="today"`。
- `today` / `NdaysAgo` 由 GA4 property reporting time zone 解释。
- 不把小时维度的 `activeUsers` 相加成滚动 24H,因为 activeUsers 是去重人数,跨小时相加会重复计算同一用户。
- JSON 必须写入 `window_label` 和 `timezone`,后台也要展示该口径。

> 注意:如果未来必须采精确滚动 24 小时去重活跃用户,需要事件级数据源(如 BigQuery Export)重新设计;首版不做。

## 5. 后端实现

### 5.1 文件结构

新增:

```
backend/src/app/models/google_data_oauth_token_model.py
backend/src/app/models/google_metric_snapshot_model.py
backend/src/app/models/system_data_model.py
backend/src/app/services/system_data_service.py
backend/src/app/services/google_data_config_service.py
backend/src/app/services/google_data_oauth_service.py
backend/src/app/services/google_metrics_collect_service.py
backend/src/app/crons/task/google_metrics.py
```

修改:

```
backend/src/app/crons/registry.py
backend/src/app/api/admin/admin_system_settings.py
backend/src/app/models/__init__.py
admin/src/api/system-settings.ts
admin/src/views/SystemSettingsView.vue
admin/src/i18n/zh-CN.json
admin/src/i18n/en-US.json
```

### 5.2 service 约束

- 不新增依赖注入;API handler import 模块级 service 实例。
- HTTP 请求使用 `httpx.AsyncClient`。
- service 使用 `async with get_async_session() as db`。
- 写 DB 显式 `commit`;异常回滚交给 `get_async_session`。
- Google API 失败只让本侧采集失败,不能中断 cron 扫描循环。
- catch 后必须 `logger.error(..., exc_info=True)`。

### 5.3 `google_data_oauth_service`

职责:

- 生成 OAuth 授权 URL。
- 校验和消费 state。
- code 换 token。
- refresh token 换 access token。
- 查询授权状态。
- 断开授权。
- 清除授权错误状态。

接口方法:

| 方法 | 说明 |
| --- | --- |
| `create_authorization_url(admin_id: int, public_api_base_url: str \| None = None) -> GoogleDataAuthorizationUrl` | 写 Redis state,返回授权 URL |
| `handle_oauth_callback(code: str, state: str) -> None` | 换 token 并保存 |
| `get_status() -> GoogleDataOAuthStatus` | 给后台展示授权状态 |
| `get_access_token() -> str | None` | cron 采集前刷新 access token;无授权返回 None |
| `disconnect() -> None` | 删除本地 refresh token,并尽力调用 Google revoke |

配置来源:

- 通过 `google_data_config_service` 读取 `system_data.google_data`。
- `redirect_uri` 由 `google_data_config_service` 按 `app.public_api_base_url` 生成,不读取或保存到 `system_data.google_data`。
- 授权前会强制刷新一次 `system_data.google_data`,避免其他进程 30 分钟缓存命中旧配置导致误报 `GOOGLE_DATA_CONFIG_INCOMPLETE`。
- 配置不完整时抛 `GOOGLE_DATA_CONFIG_INCOMPLETE`。
- status 返回 `client_id`、`redirect_uri`、`gsc_site_url`、`ga4_property_id` 与 `client_secret_configured`,不返回 `client_secret`。

Redis key:

| key | TTL | value |
| --- | --- | --- |
| `google_data_oauth_state:{sha256(state)}` | 600 秒 | `{"admin_id":123,"created_at":...}` |

### 5.4 `google_metrics_collect_service`

职责:

- 获取 access token。
- 调 GSC API。
- 调 GA4 API。
- 分别写入 GSC 与 GA4 snapshot。
- 分别更新 OAuth token 的 GSC / GA4 成功时间与错误摘要。

方法:

| 方法 | 说明 |
| --- | --- |
| `collect_once() -> GoogleMetricsCollectResult` | cron 调用入口 |
| `collect_gsc(access_token: str) -> dict` | 返回 GSC JSON |
| `collect_ga4(access_token: str) -> dict` | 返回 GA4 JSON |
| `save_snapshot(metric_type: str, payload: dict) -> None` | JSON 序列化后落库 |

JSON 序列化使用 `json.dumps(..., ensure_ascii=False, separators=(",", ":"))`。

### 5.5 cron 注册

新增任务:

| task_key | kind | interval | 函数 |
| --- | --- | --- | --- |
| `growth.google_metrics_collect` | `interval` | 3600 秒 | `collect_google_metrics` |

采集频率首版固定 1 小时,不做后台配置。

执行语义:

- 无授权时记录 info 并返回。
- GSC 和 GA4 分开 try/catch。
- GSC 成功就写 GSC 快照;GA4 成功就写 GA4 快照。
- 一侧失败不回滚另一侧。
- GSC / GA4 各自更新 `last_*_success_at` 或 `last_*_error_msg`,避免一侧成功掩盖另一侧长期失败。

## 6. API

全部挂在 `/api/admin/system-settings/google-data/*`。除 OAuth callback 外,均鉴权 `get_admin_user`;OAuth callback 只校验一次性 `state`。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/google-data/status` | 查询 Google 数据授权与最近采集状态 |
| POST | `/google-data/config` | 保存 Google 数据采集配置 |
| POST | `/google-data/oauth/authorize` | 生成授权 URL |
| GET | `/google-data/oauth/callback` | Google OAuth 回调,不走 admin 鉴权,成功后 303 回 admin |
| POST | `/google-data/collect-now` | 手动触发一次采集 |
| POST | `/google-data/disconnect` | 断开授权并删除本地 token |

`GET /status` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `configured` | bool | client / site / property 配置是否齐全 |
| `authorized` | bool | 是否已有启用 refresh token |
| `last_authorized_at` | int \| null | 最近授权时间 |
| `last_gsc_success_at` | int \| null | 最近 GSC 采集成功时间 |
| `last_gsc_error_msg` | string | 最近 GSC 错误摘要 |
| `last_ga4_success_at` | int \| null | 最近 GA4 采集成功时间 |
| `last_ga4_error_msg` | string | 最近 GA4 错误摘要 |
| `gsc_site_url` | string | 当前配置的 GSC siteUrl |
| `ga4_property_id` | string | 当前配置的 GA4 property ID |
| `client_id` | string | 当前配置的 Google OAuth Client ID |
| `client_secret_configured` | bool | 是否已配置 Google OAuth Client Secret |
| `redirect_uri` | string | 当前配置的 OAuth 回调地址 |

`POST /config` 请求:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `client_id` | string | Google OAuth Web Client ID |
| `client_secret` | string | Google OAuth Web Client Secret;留空保留旧值 |
| `gsc_site_url` | string | GSC siteUrl |
| `ga4_property_id` | string | GA4 property ID |

响应同 `GET /status`。

`POST /authorize` 请求:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `admin_return_base_url` | string | 授权完成后的 Admin SPA 回跳根地址;前端传 `window.location.origin` |

`POST /authorize` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `authorization_url` | string | 前端跳转地址 |

`POST /collect-now` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `gsc_saved` | bool | 本次是否写入 GSC 快照 |
| `ga4_saved` | bool | 本次是否写入 GA4 快照 |
| `errors` | string[] | 失败摘要 |
| `collected_at` | int | 本次完成时间 |

`POST /disconnect` 响应:

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `disconnected` | bool | 是否已删除本地授权 |

## 7. 前端 UI

系统设置页顶部新增三个 tab:「配置表缓存」「API Key」「google 数据采集」。Google 数据采集 tab 包含配置表单、授权状态与采集动作。

| 元素 | 形式 | 可点击 | 行为 |
| --- | --- | --- | --- |
| 区块标题 | 文本 | 否 | 显示「Google 数据采集」 |
| 配置状态 | `NTag` | 否 | 配置齐全为 success,缺配置为 warning |
| 授权状态 | `NTag` | 否 | 已授权 / 未授权 / 授权异常 |
| Google Client ID | `NInput` | 是 | 编辑 OAuth Client ID |
| Google Client Secret | password `NInput` | 是 | 不回显;留空保存表示保留旧密钥 |
| GSC siteUrl | 文本 | 否 | 展示当前配置 |
| GA4 property ID | 文本 | 否 | 展示当前配置 |
| 保存 Google 配置 | 主按钮 | 是 | 调 `/google-data/config`,成功后刷新 status |
| 窗口口径提示 | 文本 | 否 | 展示 GSC 使用 PT 且 7D/28D 到昨日,GA4 使用 property 时区且 today/7D/28D 到今天 |
| 最近 GSC 采集 | 文本 | 否 | 成功时间 / 错误摘要 |
| 最近 GA4 采集 | 文本 | 否 | 成功时间 / 错误摘要 |
| 授权按钮 | 主按钮 | 是 | 请求授权 URL 并跳转 Google |
| 重新授权按钮 | 普通按钮 | 是 | 与授权按钮同逻辑 |
| 立即采集按钮 | 普通按钮 | 是 | 调 `collect-now`;loading 期间禁用 |
| 断开授权按钮 | 危险按钮 | 是 | 二次确认后调用 `disconnect` |
| 刷新状态按钮 | 图标按钮 | 是 | 重新请求 status |

交互:

- 页面加载时请求 status。
- `?google_data_authorized=1` 存在时展示成功提示并清理 query。
- `?google_data_error=...` 存在时展示失败提示并清理 query。
- 缺配置时授权按钮和立即采集按钮 disabled。
- 未授权时立即采集按钮 disabled。

文案写入 `admin/src/i18n/zh-CN.json` 与 `admin/src/i18n/en-US.json`。

## 8. 异常与边界

| 场景 | 行为 |
| --- | --- |
| 未配置 client_id / secret / gsc_site_url / ga4_property_id | status 返回 `configured=false`,页面按当前表单禁用授权 |
| 保存配置时 client_secret 留空 | 保留已保存 secret;首次配置仍会因为 secret 缺失显示未配置 |
| GSC siteUrl 填裸域名 | 保存为 `sc-domain:域名`;只有显式 `http://` / `https://` 才按 URL-prefix 属性采集 |
| 管理员拒绝授权 | 回调按 `state.admin_return_base_url` 跳回系统设置并带错误提示 |
| state 过期或不匹配 | 回调失败,不保存 token;因无法可信确定 Admin 回跳地址,直接返回 400 |
| Google 不返回 refresh_token | 提示重新授权;授权 URL 保持 `prompt=consent` |
| refresh token 失效 | 采集失败,记录 GSC / GA4 错误摘要,页面提示重新授权 |
| GSC siteUrl 无权限 | GSC 失败,GA4 继续 |
| GA4 property 无权限 | GA4 失败,GSC 继续 |
| Google API 限流 / 5xx | 本轮失败,下一轮重试 |
| GSC 24H 返回小时不足 24 个 | 用可用小时计算,JSON 记录实际 start/end 与 `partial_hours` |
| impressions 为 0 | ctr 和 position 记 0 |
| snapshot JSON 增长 | query 扫描结果不直接落库,每个窗口只保存 200 行;float 最多保留 4 位小数,仍使用 mediumtext |

## 9. 验收

- 系统设置页能展示 Google 数据采集区块。
- 系统设置页顶部能切换「配置表缓存」「API Key」「google 数据采集」。
- 管理员可在后台保存 Google OAuth、GSC、GA4 采集配置;保存后清空 `system_data` 缓存。
- 缺配置时页面展示缺配置状态,不能发起授权。
- 配置齐全时管理员能跳转 Google 授权并回到系统设置页。
- 授权后 status 显示已授权。
- 手动「立即采集」能写入两条 snapshot:`GSC` 与 `GA4`。
- `GSC` JSON 含 `24h`、`7d`、`28d` 四个目标指标。
- `GSC` 24H JSON 含 `top_queries`,每行含 `query`、`clicks`、`impressions`、`ctr`、`position`。
- `GSC` 7D / 28D JSON 含 `top_queries`、`top_pages`、`countries`、`devices`、`dates`;28D 额外含 `high_impression_low_ctr_queries`、`high_impression_low_ctr_pages`。
- `GSC` 各窗口 `top_queries` 按 impressions 降序、clicks 次排序且最多 200 行;其他 top 维度数量不随之扩大。
- GSC / GA4 快照 JSON 中的 float 指标最多保留 4 位小数,四舍五入不参与筛选和聚合计算。
- `GA4` JSON 含 `realtime_30m.active_users`、`realtime_30m.event_count`、`realtime_30m.screen_page_views` 与 `today`、`7d`、`28d.active_users`。
- `GA4` 7D / 28D JSON 含 `overview`、`user_acquisition`、`traffic_acquisition`、`landing_pages`、`countries`、`events`、`business_events`、`page_engagement`。
- GSC 24H JSON 含 `data_state=hourly_all`、`is_fresh=true`;如 Google 返回 `first_incomplete_hour`,必须原样记录。
- GSC 与 GA4 每个窗口 JSON 都含 `window_label` 和 `timezone`;后台显示窗口口径提示。
- cron 每小时自动采集,无授权时不报错退出。
- GSC 权限错误不影响 GA4 写入,GA4 权限错误不影响 GSC 写入。
- 页面分别展示 GSC 与 GA4 最近成功时间和错误摘要。
- 断开授权后不再采集,重新授权后恢复。
- 数据库和日志不出现 refresh token 明文。
- status/API 响应不出现 `client_secret` 明文。

## 10. 验证命令

后端:

```bash
cd backend
uv run black src/app
uv run ruff check src/app
uv run mypy src/app
uv run python -m app.init.sync_database_schema --yes
```

前端:

```bash
cd admin
pnpm tsc --noEmit
pnpm build
```

人工验证:

1. 登录 admin。
2. 进入系统设置。
3. 完成 Google 授权。
4. 点击立即采集。
5. 查询 `google_metric_snapshots` 表确认新增 `GSC` 与 `GA4` 两条数据。
6. 等待 cron 触发或临时缩短 interval 验证自动采集。

## 11. 风险与回滚

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| GSC 24H fresh 数据与 UI 后续不一致 | 管理员看到历史快照与 Search Console 最终值有偏差 | JSON 明确 `is_fresh=true`;产品验收不要求永久一致 |
| GA4 activeUsers 不能跨小时相加 | 滚动 24H 去重值无法仅靠小时聚合准确得到 | 首版采 today / 7D / 28D 自然日窗口;精确滚动 24H 另开 BigQuery 事件级方案 |
| refresh token 被撤销 | cron 暂停采集 | 系统设置页重新授权 |
| Google API 限流 | 单轮失败 | 每小时低频采集,失败下轮自动重试 |
| 表增长 | 长期占用 DB | 每小时两条,一年约 17520 条,可接受;后续需要再做清理任务 |

回滚:

- 从 `CRON_TASKS` 移除 `growth.google_metrics_collect`。
- 系统设置页隐藏 Google 数据区块。
- 保留已落库快照表不影响业务;如需清理可人工删表。
