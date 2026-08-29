# 014 · Maps 云端

## 功能目标

服务端化的 Google Maps 数据采集:Online Scraper(网页批量任务)与 API(开发者接口),复用同一抓取引擎与计费。

## 当前状态

- 抓取引擎选型与部署/成本/风险调研完成:`@../../research/google-maps-scraping-方案调研.md`(gosom/google-maps-scraper SaaS Edition;POC 是云端路线 Gate,见 ROADMAP B5)。
- 竞品云端产品口径(定价/计量维度/产品区分)见 `references/`;内部实现未逆向(竞品云端不可见,以公开口径 + 自研为准)。
- 未开始开发。进度见根 `@../../ROADMAP.md` B 组。

## 产品范围

### 包含

- B1 Online Scraper:网页端关键词批量任务、任务状态与结果导出
- B2 API:Scraper / Reviews / Photos 三件套,密钥计费
- B4 抓取引擎部署(gosom SaaS + 多 worker + 代理池)与 backend credits 对接
- (B3 MCP:竞品提及,我方未调研,暂不入范围)

### 不包含

- 插件端采集(归 013)
- Email/社媒补全的引擎实现(协议归 013 A4,服务端执行时归本域)

## 功能索引

| 编号 | 功能 | 调研 |
| --- | --- | --- |
| B1 | Online Scraper | `@references/B1-OnlineScraper竞品口径.md` |
| B2 | API 三件套 | `@references/B2-API竞品口径.md` |
| B4/B5 | 引擎与 POC | `@../../research/google-maps-scraping-方案调研.md` |
