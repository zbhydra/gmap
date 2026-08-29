# B2 · API 三件套竞品口径(调研初版)

> Roadmap:B2 · 调研:🔍浅(落地页口径;细节在其 Postman 文档,未深挖)

## 功能定义

面向开发者的 HTTP 接口:Google Maps 商家搜索(Scraper API)、评论(Reviews API)、照片(Photos API),按请求计费,接入客户自有系统。

## 用户操作(竞品,据落地页)

1. 官网登录后获取 API 凭证;对照其 Postman 文档调用。
2. 提交任务 → 轮询/webhook 取结果;限流 **300 requests/分钟**(落地页明示)。
3. 三个产品页:`/google-maps-scraper-api`、`/google-maps-reviews-scraper-api`、`/google-maps-photos-scraper-api`;Reviews API 按 FID(`0x…:0x…`)提取公开评论——佐证其走非官方通道(官方 API 用 place_id 体系,见 research 方案调研 §2)。
4. 计量维度:requests/月(独立于插件与 Online 的套餐,2026-08 官网三 tab 分列)。

## 竞品实现逻辑(推断)

- 商业服务通用封装:POST 任务 → 队列 → 结果 JSON;频控 + 代理池 + 缓存是壁垒(research 方案调研 §2)。
- gosom 自带 REST API 模式(`POST /api/v1/jobs` → 轮询 → `/download`,OpenAPI 文档),可作为我方 API 层的直接基座。

## 我方落地要点

- API 网关 = backend 新增 `/api/client/maps/*` 接口组(密钥发放、计费扣 credits、任务转发 gosom、结果代理),归 003/004 现有契约扩展;具体 spec 立项时写本域 tech。
- FID/CID/Place ID/kgmid 的 ID 体系速查表见 `research/google-maps-scraping-方案调研.md` §5,API 参数设计直接引用。
- 竞品 Postman 文档值得在阶段 2 立项时抓取补齐:接口形状、错误码、webhook 事件集(本轮未挖)。
