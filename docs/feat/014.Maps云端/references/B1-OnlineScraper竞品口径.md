# B1 · Online Scraper 竞品口径(调研初版)

> Roadmap:B1 · 调研:🔍浅(官网公开口径;内部实现不可见未逆向)

## 功能定义

网页端提交关键词批量任务,云端抓取 Google Maps 商家数据并导出;比插件快,适合大批量关键词任务。

## 用户操作(竞品,据官网口径)

1. 官网 Google OAuth 登录(Online 入口按钮直连 `/auth/google`)。
2. 输入关键词(批量,档位限制 2–200 个/任务),提交云端任务。
3. 任务在云端跑,完成后导出 CSV/Excel/JSON,含 Email/社媒列。
4. 套餐与额度(2026-08 官网 pricing tab=online):

| 档位 | 价格 | 额度 | 关键词/任务 | seats |
| --- | --- | --- | --- | --- |
| Free | $0 | 1,000 records/月 | 2 | 1 |
| Basic | $29 | 80,000 | 10 | 1 |
| Professional | $149 | 300,000 | 50 | 3(即将) |
| Business | $359 | 1,000,000 | 100 | 10(即将) |
| Advanced | $799 | 3,000,000 | 200 | 20(即将) |

## 竞品实现逻辑(推断,无实证)

- 计量维度是 records + 关键词数/任务 + seats 三元,与插件(reviews/photos per place)不同——云端按「产出记录数」计费,与抓取的服务器成本直接挂钩。
- 引擎推测为服务端无头浏览器/协议抓取(同 research 方案调研 §2 的业界通用路线),任务队列 + webhook/轮询交付。

## 我方落地要点

- 引擎选型已定(gosom SaaS Edition,`research/google-maps-scraping-方案调研.md` §4/§6):任务 API `POST /api/v1/scrape` + worker 认领,扩容 = 加 worker;我方做产品化封装(网页任务台 + backend credits 对接)。
- 关键词/任务上限、seats、档位设计在 C2 统一定(统一 credits 池 vs 分产品订阅)。
- 部署红线:Postgres 内网化(POC Gate 项);代理池是成本大头($100–500/月)。
