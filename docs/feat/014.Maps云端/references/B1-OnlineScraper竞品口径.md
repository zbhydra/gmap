# B1 · Online Scraper 竞品口径

> Roadmap:B1 · 调研:✅ 完成(2026-08-30 登录实测:界面 + 后端契约全量抓取)

## 官网证据(2026-08-29 抓取)

- 导航含「Cloud Login」「Cloud Dashboard」入口;Online 入口按钮直连 `/auth/google`(Google 登录即用,新账号自动创建)。
- 登录引导文案:「Free monthly credits / Start scraping in the cloud without adding a card」「Export-ready results」「Run multiple keywords — Create larger jobs and let them continue in the cloud」。

## 登录实测(2026-08-30,免费账号)

### 信息架构

- 任务台地址 `/dashboard/cloud`(标题「Google Maps Scraper Online」),Vue SPA(Vite 构建)+ Parse JS SDK。
- Dashboard 侧边栏三区块:**Online Scraper / API / Your Account**;动作入口:Upgrade Plan(`/dashboard/cloud/pricing`)、View My Tasks(`/dashboard/cloud/tasks`)。
- 首页另提供示例结果 CSV(S3 直链)与 Merge CSV 工具入口。

### 任务创建与运行(实测)

- 创建:关键词多行 textarea(placeholder 示例 `coffee shop in Portland / restaurant in Austin / hotel near Central Park, NY`,每行一个)+ **Submit**。
- 提交即时返回 batchId;1 关键词任务实测约 1 分钟内完成(35 records 级)。
- 完成态卡片:Task Completed / Task ID / Status / Progress `N / M (P%)`,按钮 Close 与 View All Files。
- 任务列表 `/dashboard/cloud/tasks`:表头 **No. / Task ID / Keywords / Records / Status / Updated At / Actions**;行操作 **Files**(单文件)/ **ZIP**(打包),浏览器下载栈交付。

### 后端契约(实测,CDP 抓包)

云端 Parse 端点:`https://cloud.gmapsextractor.com/parse/functions/*`——与插件后端同一 Parse 体系(`isPro` 云函数同名共用),**「Online 与插件共享账号与付费判定」由推断升级为实证**。任务台轮询节奏为 getTaskStatus + getCloudUsage 成对高频调用。

| 云函数 | 响应(实测) |
| --- | --- |
| `submitKeywords` | `{result:{success:true, batchId:"<uuid>", message:"Successfully submitted 1 keywords for processing"}}` |
| `getTaskStatus` | `{result:{task:{batchId, status:"completed", totalCount, processedCount, progress:100, createdAt(ms)}}}` |
| `getCloudUsage` | `{result:{data:[{used:322, total:1000, plan:"free", period:{start,end}, exhausted:false}], free:true, quotaId}}` |
| `isPro` | `{result:{pro:false}}`(云端版仅布尔;插件版同名函数返回更丰富的 plan/配额/公告) |

辅助事实:免费档 1000 records/月,月度窗口(period start/end 时间戳),`exhausted` 布尔;HubSpot livechat 客服嵌入。任务台技术栈:Vue SPA(Vite)+ Parse JS SDK;结果文件经浏览器下载栈交付(Files 单文件 / ZIP 打包)。

### 套餐(2026-08-29 官网 pricing tab=online)

| 档位 | 价格 | 额度 | 关键词/任务 | seats |
| --- | --- | --- | --- | --- |
| Free | $0 | 1,000 records/月 | 2 | 1 |
| Basic | $29 | 80,000 | 10 | 1 |
| Professional | $149 | 300,000 | 50 | 3(即将) |
| Business | $359 | 1,000,000 | 100 | 10(即将) |
| Advanced | $799 | 3,000,000 | 200 | 20(即将) |

## 我方落地要点

- 引擎选型已定(gosom SaaS Edition,`research/google-maps-scraping-方案调研.md` §4/§6):任务 API + worker 认领;我方做产品化封装(任务台 + backend credits 对接)。
- 竞品任务台是「提交 → batchId → 轮询进度 → 文件交付」的最小闭环,与我方 gosom 的 `POST /api/v1/jobs → 轮询 → /download` 同构——产品化时交互可对齐竞品,后端走 gosom。
- 关键词/任务上限、seats、档位设计在 C2 统一定(统一 credits 池 vs 分产品订阅);实测确认竞品为「云端与插件共用账号、额度分池」。
- 部署红线:Postgres 内网化(POC Gate 项);代理池是成本大头($100–500/月)。
