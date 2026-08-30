# B2 · API 三件套竞品口径(2026-08-30 Postman 文档抓取)

> Roadmap:B2 · 调研:✅ 完成(官方 Postman 文档:documenter.getpostman.com/view/2218135/2s9YymJRMi)

## 功能定义

面向开发者的同步 REST API:搜索(Places)、照片(Photos)、评论(Reviews)三端点,Bearer token 认证,直挂云端域名。

## 接口契约(实测文档)

基础:`https://cloud.gmapsextractor.com/api/v2/*`,`Content-Type: application/json`,`Authorization: Bearer <token>`。

| 端点 | Body | 响应 |
| --- | --- | --- |
| `POST /v2/search` | `q`(查询词)、`page`(1–10,每页 20 条)、`ll`(`@lat,lng,zoom` 地理偏置)、`extra`(true 时含 Email+社媒)、`hl`(语言) | places 列表(同插件 36 列口径) |
| `POST /v2/photos` | `fid`(`0x…:0x…`)、`page` | `{photos:[{photoUrl}]}`(lh3 CDN URL) |
| `POST /v2/reviews` | `fid`、`page`、`sort_by`(1 相关 / 2 最新 / 3 最高 / 4 最低) | `{reviews:[{id,…}]}` |

- **无 webhook**——同步 REST 返回,配合分页拉取;`/v1/search` 已弃用。
- 已知限制(官方文档承认):「near me」类关键词地理定位不准,建议查询词带城市/州/邮编。
- `extra=true` 即 013 A4 的服务端补全能力——API 与插件共用同一补全服务。
- ID 体系:photos/reviews 用 fid(非 place_id),与 Maps 内部要素 ID 一致(见 research 方案调研 §5 ID 速查表)。
- 限流:落地页口径 300 requests/分钟(文档未列错误码表,限流/鉴权错误码待我方对接实测)。

## 我方落地要点

- 我方 API 走 gosom(`POST /api/v1/jobs` 异步任务)与竞品的同步 REST 不同构——交互设计二选一:对齐竞品同步简单端点(小数据量),或保留任务制(大数据量);可在 B2 立项时按目标客户定,或两者都出(轻查询同步 + 大任务异步)。
- fid 依赖:photos/reviews 以 fid 为键,我方导出 schema 已含 Fid 列(A5),天然兼容。
- 密钥管理、计费扣减归 backend(003/007 扩展)。
