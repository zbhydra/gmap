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

### 计量口径实测(2026-09-01,免费账号新计费周期,used 从 0 起步)

实验:提交关键词任务全程抓包 `getCloudUsage`,与任务列表 Records 列对账。

| 观察 | 证据 |
| --- | --- |
| 提交瞬间**不扣** | `submitKeywords` 返回后立即查 `getCloudUsage`,`used` 不变(仍 0) |
| 按**实际产出 records** 扣 | 任务 #2f1cfd52(dog acupuncture in Portland)Records=54,used 0→54;后续 4 个任务 Records 合计 335(168+161+4+2),used 54→389,两次对账均精确相等 |
| 结果不足只按实扣 | 产出 2 条 / 4 条的小任务分别只扣 2 / 4——「请求多、结果少」不按请求数收 |
| 入账时点:完成即入账 | 21:27:50 完成的任务,21:27:51 采样 `used` 已含;UI「约每分钟刷新」只是展示缓存文案,服务端秒级 |
| 云端无用户可设条数 | 前端源码实证请求体仅 `{keywords, count, quotaId}`,无 limit/maxResults;每词上限服务端固定(2 关键词任务产 161/168,推算每词约 80+) |

前端还有 500 关键词硬上限(`keywordCount>500` 拒绝)与 `slice(0, currentMaxKeywords)` 按档位截断;冷门词可能触发 Google 放宽匹配,返回大量不相关商家照常计费。

插件端口径见 `docs/feat/013.Maps插件/references/竞品逆向/06-云端依赖与授权.md`:同样按实际抓到的 `pins.length` 上报增量。

行业对照:Outscraper Google Maps 类按返回商家条数计费($3/1k records,Google Search 类才按提交页数);Apify 头部 actor(Compass 等)pay-per-result($1.5~4/1k places),多家明确「零结果 / 失败 run $0」。**「按实际产出计费、空结果不扣」是行业主流。**

### 并发与额度边界实测(2026-09-01 21:50)

**并发**:任务台 UI 强制单任务——输入框与 Submit 的 `disabled` 均含 `currentTask.status==="processing"`(前端源码实证),运行中不能再提交。但服务端不拦:绕过 UI 连续调 `submitKeywords` 提交 4 个任务(2 关键词/组)全部成功,各自独立 batchId,60~70 秒内交错完成。即**并发限制纯前端交互层**,API 层无单账号并发上限。

**额度边界**(used=871/1000 时连续启动 4 个任务,理论产出远超剩余额度):

| 时刻 | 观察 |
| --- | --- |
| 提交时 | 服务端只看当时 used(871<1000),4 个任务全放行——**无预留/预扣** |
| 运行中 | 无任何拦截,任务照常跑完 |
| 21:50:06 | used=996,3 任务完成、1 个 processing |
| 21:50:23 | used=**1181**(超额 181),exhausted=true,全部完成——**先跑后扣、全额入账、可透支** |
| 25 分钟后复查 | quota `cT8oc7b3IJ` 的 1181 原封未动,4 任务 Records 44+143+60+63=310 与增量精确对账——**超额后服务端无任何自动处置**(不截断、不重置、不清任务) |

实验期间一度观察到「session 失效 → 全新 quota(used=0) → 任务列表清空」,后经 hydra 确认为**本地误切换到另一账号**所致(另一账号的空 quota 视角),并非竞品超额风控。

结论:**没有事前额度防护**(不预扣、不锁定、不逐词检查),超额后也没有事后处置——计量纯粹「先跑后扣、可透支」。对我方启示见「我方落地要点」。

### 套餐(2026-08-29 官网 pricing tab=online)

| 档位 | 价格 | 额度 | 关键词/任务 | seats |
| --- | --- | --- | --- | --- |
| Free | $0 | 1,000 records/月 | 2 | 1 |
| Basic | $29 | 80,000 | 10 | 1 |
| Professional | $149 | 300,000 | 50 | 3(即将) |
| Business | $359 | 1,000,000 | 100 | 10(即将) |
| Advanced | $799 | 3,000,000 | 200 | 20(即将) |

## 我方落地要点

- 引擎以自研 HTTP RPC 为主、gosom 为备选；Provider 只提供取数与 gosom 提交/查询，任务状态、结果存储和 credits 归 Online 业务层。
- 竞品任务台的最小闭环是「提交 → batchId → 轮询进度 → 文件交付」；该交互不依赖具体 Provider。HTTP 调用由 Online 业务层直接并发，gosom 的排队由上游负责。
- 我方按 `maps_online` 独立额度池计量：提交时只检查当前是否 exhausted，不预留额度；完成后按实际保存 records 扣减，允许当前任务超过剩余额度。
- 用户状态只有 processing/completed；内部失败按 0 条收口，不增加用户失败状态。
- 结果按关键词保存 CSV，提供单文件下载与整任务 ZIP；技术合同见 `@../tech-Online任务与结果.md`。
- 部署红线：gosom 的 Postgres 必须内网化；自研 HTTP 引擎的主要运维边界是代理流量与 Google 封控。
