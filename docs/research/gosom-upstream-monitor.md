# gosom 上游巡检记录

## 目的与边界

本文件是 gosom 两个上游的巡检基线,SOP 与巡检记录合一。定时任务(`.github/workflows/gosom-upstream-monitor.yml`)每次必须先读本文件,再比较上次已完整检查的上游提交与最新 `main`,判断新提交是否影响本项目线上抓取引擎,并对每个上游给出「是否建议更新线上镜像」的结论。

巡检对象与本项目的关系:

- GOSOM(`gosom/google-maps-scraper`):线上抓取引擎本体,以 SaaS Edition 镜像 `ghcr.io/gosom/google-maps-scraper-saas:latest` 部署(serve + worker,worker 直连 Postgres 队列)。
- SCRAPEMATE(`gosom/scrapemate`):GOSOM 依赖的爬虫框架库,不单独部署,经 GOSOM `go.mod` 随镜像进入线上;其影响结论的落地路径是 GOSOM 是否跟进升级依赖。

影响判定范围:解析 schema(导出列集)、Maps 页面 / 内部接口解析逻辑、Playwright / 浏览器层、SaaS serve / worker、安全修复;细则见「影响判定规则」。

以下不属于巡检范围:本项目自身代码、部署与代理池运维、上游 issue / discussions 动态(除非已落入 `main` 提交)、上游 release 节奏本身。

定时任务只检查、记录和报告,不自动修改本项目代码,不 commit,不 push。发现影响项后保留在「待确认项」,是否更新线上镜像由人工决策并人工执行。

## 上游与当前基线

| 上游 | 仓库 | 分支 | 最后完整检查提交 | 提交时间 | 最新 release |
| --- | --- | --- | --- | --- | --- |
| GOSOM | `https://github.com/gosom/google-maps-scraper.git` | `main` | `a41dffe18c69e6b84085bfa847d410cca094da0b` | `2026-09-10T07:37:07+03:00` | `v1.17.4` |
| SCRAPEMATE | `https://github.com/gosom/scrapemate.git` | `main` | `9f3c1ce9966808a43483d96b65b23c9ac72f0a0d` | `2026-07-21T16:49:05+03:00` | `v1.3.0` |

基线语义:提交必须已完成重点路径 diff、解析 / 合同生成点核对和影响映射。检查失败或 diff 不完整时不得推进基线。检查成功后可以推进基线,但新发现必须继续保留在「待确认项」,不能因基线推进而消失。

### 线上部署镜像

| 项 | 值 |
| --- | --- |
| 镜像 | `ghcr.io/gosom/google-maps-scraper-saas:latest` |
| 对接配置 | 后端 `system_data` 的 `gosom_api`(base_url + api_key),见 `docs/feat/008.管理后台/tech-系统设置.md`;引擎部署进度见 `docs/ROADMAP.md` B4 |

`latest` 是漂移 tag,不对应固定 commit;确认线上实际运行版本以部署机镜像 digest 为准。「是否建议更新线上镜像」是每次巡检的固定结论项;拉取新镜像、重启 serve / worker、回归验证属部署域,不在巡检自动化范围内。

## 最近巡检

- 检查时间:`2026-09-10`
- 本地仓库提交:`e923b3a8cdb785f2111b1187fb40477880397d3c`
- GOSOM 最新提交:`a41dffe18c69e6b84085bfa847d410cca094da0b`
- SCRAPEMATE 最新提交:`9f3c1ce9966808a43483d96b65b23c9ac72f0a0d`
- 结论:GOSOM 新增 1 个赞助商资料提交,仅改 `README.md`、`docs/proxies.md`、`img/swiftproxy.png` 与 AI Agent Skill 的赞助商注册表 / 对应测试;重点运行路径(`gmaps/`、runner、SaaS REST / worker、镜像构建、`go.mod`)完整 diff 为空,无线上抓取引擎影响,已推进 GOSOM 基线。SCRAPEMATE 的本地 `main` HEAD 仍与基线相同;复核「待确认项」为无,不建议主动更新线上 `latest` 镜像。

该区只保留最近一次结果。只有上游提交变化、检查失败或待确认项状态变化时,才在「变更记录」追加事件,避免每天写入无信息量的记录。

## 本项目消费入口

线上抓取引擎(ROADMAP B4,技术依据 `docs/research/google-maps-scraping-方案调研.md` §4/§5/§6):

- SaaS Edition 单入口:REST `POST /api/v1/scrape`(`X-API-Key` 鉴权)+ River 队列(Postgres)+ worker 直连数据库领任务;对外 REST 合同与鉴权变化属影响项。
- 解析产物:CSV / JSON 列集由 GOSOM `gmaps/entry.go` 的 `Entry` / `CsvHeaders()` / `CsvRow()` 决定;项目导出口径(38 列)在其上扩展,扩展列不依赖上游。
- 浏览器层:playwright-go(`mxschmitt` fork)无头浏览器渲染真实 Maps 页面,`PageReuseLimit` / `BrowserReuseLimit` 资源保护。
- 后端对接:`backend/src/app/constants/gosom.py`(`GOSOM_API_DATA_KEY`)与系统设置页「Gosom API」tab(`docs/feat/008.管理后台/tech-系统设置.md`);抓取调用方从 `system_data` 读取地址与 Key。
- 依赖传导:scrapemate 经 GOSOM `go.mod` 进入镜像;两仓库基线时点均锁 `github.com/mxschmitt/playwright-go v0.6100.0`。

## 影响判定规则

### 算影响(GOSOM)

1. 解析 schema:`gmaps/entry.go` 的 `Entry` 结构、`CsvHeaders()` / `CsvRow()` 及 JSON 输出结构的列增删、改名、类型或语义变化——直接影响项目导出口径与下游消费。
2. Maps 解析逻辑:`gmaps/` 下对 Google 页面与内部 RPC(`search?tbm=map` batchexecute、`listugcposts` 等)的解析、选择器、URL 构造、评论翻页变化——Google 改版 Maps 前端时这里是第一现场。
3. Playwright / 浏览器层:`runner/webrunner/`、`runner/installplaywright/`、浏览器启动 / 复用 / 资源保护逻辑、`go.mod` 中 playwright-go 版本变化。
4. SaaS serve / worker:`main.go` 运行模式、`web/` / `api/` / `saas/` 对外 REST 合同与鉴权、`rqueue/`(River 队列)、`runner/databaserunner/`、`runner/runner.go` 的 worker 领任务 / 写结果逻辑。
5. 安全修复:CVE 修复、`cryptoext`、鉴权 / 凭证处理变化。
6. 镜像构建:`Dockerfile` / `Dockerfile.saas` 基础镜像或构建步骤变化。

### 算影响(SCRAPEMATE)

1. 浏览器层:`browser.go`、`adapters/`、`go.mod` 中 playwright-go 版本。
2. 框架核心语义:`scrapemate.go`、`scrapemateapp/`、`job.go`、`request_hooks.go`、`response.go`、`result.go`、`services.go`、`proxy.go`、`context.go` 的并发模型、请求 / 响应处理、代理与错误语义。
3. 安全修复:同 GOSOM 口径。

### 不算影响

- README、`docs/`、`examples/`、`testdata/`、营销 / 说明性 md(`gmaps-extractor.md`、`scrap_io.md`、`migration-pro.md`、sponsors 等)。
- CI(`.github/`)、Makefile、lint 配置、上游自己的 `AGENTS.md` 等仓库自治理文件。
- `*_test.go`(测试体现的合同变化按对应源码路径判定,测试文件本身不告警)。
- admin 面板纯展示 / 交互样式(不涉及 API 合同、鉴权、worker)。
- 纯版本号 bump 提交(如 "Version 1.17.4" 仅改版本常量);若与实质变更同提交,按实质变更判定。

### 判定原则

- 以行为合同是否变化为准,不以文件是否触碰为准;文件重命名 / 移动沿 import 与引用继续追踪,不因离开清单而忽略。
- 每个影响项必须给证据:上游提交 + 文件 / 函数路径;不能凭提交标题下结论。
- 无法判断或证据不足时按「有影响」处理(宁误报不漏报)。

## 上游重点文件

GOSOM 至少检查:

- `gmaps/entry.go`、`searchjob.go`、`job.go`、`place.go`、`reviews.go`、`emailjob.go`、`multiple.go`
- `runner/runner.go`、`runner/webrunner/webrunner.go`、`runner/databaserunner/`、`runner/installplaywright/`
- `main.go`、`go.mod`(playwright-go 等关键依赖版本)
- `web/`、`api/`、`saas/`、`rqueue/`、`admin/`(REST 合同、鉴权与队列 / worker)
- `Dockerfile`、`Dockerfile.saas`

SCRAPEMATE 至少检查:

- `browser.go`、`adapters/`
- `scrapemate.go`、`scrapemateapp/`
- `job.go`、`request_hooks.go`、`response.go`、`result.go`、`services.go`、`proxy.go`、`context.go`、`constants.go`
- `go.mod`

重点文件是最低检查范围,不是白名单。上游改动若重命名或移动文件,应沿 import 与引用继续追踪,不能因文件离开清单而忽略。

## 每次巡检步骤

1. 读取 `AGENTS.md`、项目公共规范和本文件,保护用户已有改动。
2. 用 `git ls-remote` 获取两个上游 `main` 的 HEAD。任一上游网络失败时记录失败,不推进任何无法完整检查的基线。
3. HEAD 未变化时,只更新「最近巡检」;同时复核所有「待确认项」,不追加无变化事件。
4. HEAD 变化时,在上游本地仓库(`.upstream/`,`main` 全历史)取基线到新 HEAD 的完整 `git diff --name-status`,再检查重点文件和解析 / 合同生成点的上下文 diff。若基线不是新 HEAD 的祖先,按 force-push 处理并比较两棵完整树。
5. 按「影响判定规则」把每个变化映射到「本项目消费入口」,给出影响面、证据路径、上游提交和建议动作。SCRAPEMATE 的结论必须注明 GOSOM 侧 `go.mod` 是否已跟进升级。
6. 对每个上游给出「是否建议更新线上镜像」:解析 / 浏览器层影响 → 建议评估更新并给回归验证要点;仅安全修复 → 建议更新;无影响 → 不建议主动更新(latest 漂移下不追新)。
7. 成功检查后推进对应基线并更新「最近巡检」。有影响或无法判断时新增待确认项;确认无影响时仅在「变更记录」写一次结论。
8. 最终报告分 GOSOM / SCRAPEMATE 两节:旧提交、新提交、是否有变化、影响项、是否建议更新线上镜像、文档是否更新。报告尾部固定输出机器标记两行:`GOSOM_IMPACT=yes|no` 与 `SCRAPEMATE_IMPACT=yes|no`(存在影响项、待确认项或无法判断时必须为 yes)。不得修改本项目代码、commit 或 push。

## 待确认项

无。

## 变更记录

### 2026-09-10:GOSOM 赞助商资料更新,无线上影响

- GOSOM 从 `beca11f148c7dc9651ee2da9aa9ce111f3dd3bea` 推进至 `a41dffe18c69e6b84085bfa847d410cca094da0b`(`chore: Adds swiftproxy as a sponsor`)。完整 `git diff --name-status` 仅含 `README.md`、`docs/proxies.md`、`img/swiftproxy.png`、`skills/google-maps-scraper/references/proxy-sponsors.json` 与 `skills/google-maps-scraper/scripts/select-proxy-sponsors.test.mjs`;为赞助商展示 / AI Agent Skill 推荐资料及其测试,不进入 SaaS 镜像的抓取、REST、队列或浏览器运行合同。
- 已核对 `gmaps/`、`runner/webrunner/`、`runner/databaserunner/`、`runner/installplaywright/`、`web/`、`api/`、`saas/`、`rqueue/`、`admin/`、`main.go`、`cmd/gmapssaas/main.go`、`Dockerfile`、`Dockerfile.saas`、`go.mod` 的基线至新 HEAD diff 均为空;`gmaps/entry.go`、浏览器复用、SaaS `POST /api/v1/scrape` / worker、镜像构建和依赖版本均未变。新 HEAD 的 `go.mod` 仍为 `github.com/gosom/scrapemate v1.3.0` 与 `github.com/mxschmitt/playwright-go v0.6100.0`。
- SCRAPEMATE 仍为 `9f3c1ce9966808a43483d96b65b23c9ac72f0a0d`,无新增提交;GOSOM 侧未跟进任何 scrapemate 升级。无待确认项,不建议主动更新 `ghcr.io/gosom/google-maps-scraper-saas:latest`。

### 2026-09-01:建立初始基线

- GOSOM 基线 `beca11f148c7dc9651ee2da9aa9ce111f3dd3bea`("Version 1.17.4"),即建立时 `main` HEAD,与最新 release tag `v1.17.4` 同指;SCRAPEMATE 基线 `9f3c1ce9966808a43483d96b65b23c9ac72f0a0d`(切换 playwright-go 到 mxschmitt fork 修复 driver 安装 404),即建立时 `main` HEAD,与最新 release tag `v1.3.0` 同指。
- 核对 GOSOM `gmaps/entry.go` 的 `CsvHeaders()`:基线时点上游 `main` 为 36 列(`input_id`…`emails`);上游列集的任何增删改按「解析 schema」影响判定。项目导出口径(38 列)在上游 schema 之上扩展,扩展列不依赖上游。
- GOSOM 与 SCRAPEMATE 的 `go.mod` 均锁 `github.com/mxschmitt/playwright-go v0.6100.0`;该依赖版本变化属「Playwright / 浏览器层」影响项。
- 线上部署镜像记为 `ghcr.io/gosom/google-maps-scraper-saas:latest`(漂移 tag),实际版本以部署机镜像 digest 为准。
- scrapemate 不单独部署,经 GOSOM `go.mod` 传导进入镜像;其影响结论落地路径为 GOSOM 升级依赖,或本项目自行评估 fork。
