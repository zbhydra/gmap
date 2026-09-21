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
| GOSOM | `https://github.com/gosom/google-maps-scraper.git` | `main` | `549e4b5e61c7103685ef8392f246ebdba783ed03` | `2026-09-20T09:45:15+03:00` | `v1.17.4` |
| SCRAPEMATE | `https://github.com/gosom/scrapemate.git` | `main` | `859d15f56ba5ed3851587edc305fab6ee956cc71` | `2026-09-13T09:51:23+03:00` | `v1.3.0` |

基线语义:提交必须已完成重点路径 diff、解析 / 合同生成点核对和影响映射。检查失败或 diff 不完整时不得推进基线。检查成功后可以推进基线,但新发现必须继续保留在「待确认项」,不能因基线推进而消失。

### 线上部署镜像

| 项 | 值 |
| --- | --- |
| 镜像 | `ghcr.io/gosom/google-maps-scraper-saas:latest` |
| 对接配置 | 后端 `system_data` 的 `gosom_api`(base_url + api_key),见 `docs/feat/008.管理后台/tech-系统设置.md`;引擎部署进度见 `docs/ROADMAP.md` B4 |

`latest` 是漂移 tag,不对应固定 commit;确认线上实际运行版本以部署机镜像 digest 为准。「是否建议更新线上镜像」是每次巡检的固定结论项;拉取新镜像、重启 serve / worker、回归验证属部署域,不在巡检自动化范围内。

## 最近巡检

- 检查时间:`2026-09-21`
- 本地仓库提交:`a663d2841d99517b759f7887cfc94313aa78df54`
- GOSOM 最新提交:`549e4b5e61c7103685ef8392f246ebdba783ed03`
- SCRAPEMATE 最新提交:`859d15f56ba5ed3851587edc305fab6ee956cc71`
- 结论:题设限定无网络,未执行 `git ls-remote`;已以提供的两个 `main` HEAD 和 `.upstream/` 完整历史完成检查。GOSOM 与 SCRAPEMATE 的 `main` HEAD 均等于各自最后完整检查提交,基线均为新 HEAD 的祖先;两侧基线至 `main` 的完整 `git diff --name-status` 为空且 `git diff --check` 通过,无需 force-push 树比较或推进基线。GOSOM 的 `gmaps/entry.go` 的 `Entry` / `CsvHeaders()` / `CsvRow()`、Maps RPC / 页面解析、SaaS REST 路由与鉴权、River worker、浏览器复用、镜像构建及 `go.mod` 中 scrapemate `v1.4.0`、playwright-go `v0.6100.0` 均未变;SCRAPEMATE 的重点文件、核心框架接口、`browser.go`、适配器和 playwright-go 均无 diff,GOSOM `go.mod` 仍已跟进 `github.com/gosom/scrapemate v1.4.0`。两个本地 tag 集合可达的最新 release 仍为 GOSOM `v1.17.4`、SCRAPEMATE `v1.3.0`。既有 GOSOM worker 健康服务与 Maps URL 解析修复的两项预发验证待确认项均无完成证据,验证条件与待人工按部署机 digest 决策状态不变;因此继续建议先预发评估 `ghcr.io/gosom/google-maps-scraper-saas:latest`,不建议仅为 SCRAPEMATE 主动更新镜像。

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

- GOSOM `cfb0440472ad1547b87cae8e1f43240a112b2c7b` 的线上镜像升级评估:预发构建 / 拉取候选镜像后,以实际 `gosom_api` 配置验证 `POST /api/v1/scrape`、任务查询和结果写入链路,并向 worker 发送终止信号,确认 `cmd/gmapssaas/cmdworker.runHealthServer()` 在根 context 已取消时仍可于 5 秒窗口内正常关闭健康服务。通过后再由人工按部署机 digest 决定是否更新漂移 tag `ghcr.io/gosom/google-maps-scraper-saas:latest`。2026-09-14 已复核最新 `2b8616d0ccf7d3c578b42a7440e3c13bb22e5083` 未触及该 SaaS 路径,原验证条件与待人工决策状态不变。
- GOSOM `ce4908e025453789e70b0acbe0888985ed3949a4` 的 Maps URL 解析修复:预发候选镜像须经实际 `gosom_api` 向 `POST /api/v1/scrape` 提交 `https://www.google.com/maps/place/../data=` 形式的 `keyword`,轮询任务至终态并核对详情结果写入;同时以常规关键词确认搜索结果中同类 href 不再因 URL 规范化丢失详情任务。通过后再结合上一项 worker 健康服务验证,由人工按部署机 digest 决定是否更新漂移 tag `ghcr.io/gosom/google-maps-scraper-saas:latest`。

## 变更记录

### 2026-09-20:GOSOM 修复带 `..` 的 Places URL 详情任务丢失,建议预发评估镜像更新

- GOSOM 从 `2b8616d0ccf7d3c578b42a7440e3c13bb22e5083` 推进至 `549e4b5e61c7103685ef8392f246ebdba783ed03`,旧基线是新 HEAD 的祖先。完整范围含 `ce4908e025453789e70b0acbe0888985ed3949a4`(`gmaps: keep the /maps/place/ marker when a place URL has a ".." segment (#330)`)和 `549e4b5e61c7103685ef8392f246ebdba783ed03`(`Version 1.18.1`),共 5 个文件;完整 diff 已通过 `git diff --check`。
- `ce4908e` 在 `gmaps/place.go:sanitizePlaceURL()` 仅对无用户信息、端口且 host 为 `www.google.com` 的单个 `/maps/place/../data=` 路径,将原始字符串中的 `../` 改成 `_/`,不重编码 Maps `data=` payload。`gmaps/job.go:NewGmapJob()` 对直接 URL seed 调用该函数,`gmaps/place.go:NewPlaceJob()` 对 `GmapJob.Process()` 接收的响应 URL 和搜索结果 href 调用它。未修复时 RFC 3986 规范化会把 `/maps/place/..` 折叠为 `/maps`,而 `GmapJob.Process()` 以 `strings.Contains(resp.URL, "/maps/place/")` 判断是否排入详情 `PlaceJob`,因而会丢弃该详情。修复后的 `PlaceJob.Process()` 仍经 `EntryFromJSON()` 生成结果,这是本项目 SaaS `POST /api/v1/scrape` 的 River worker 结果链路中的 Maps 页面 / URL 解析行为变化,应按待确认项在预发回归。
- `549e4b5` 仅将 `Makefile` 的版本从 `1.18.0` 改为 `1.18.1`,按规则不单独告警。已核对 `gmaps/entry.go`、`searchjob.go`、`reviews.go`、`emailjob.go`、`multiple.go`、`runner/runner.go`、`runner/webrunner/`、`runner/databaserunner/`、`runner/installplaywright/`、`main.go`、`web/`、`api/`、`saas/`、`rqueue/`、`admin/`、`Dockerfile`、`Dockerfile.saas`、`cmd/gmapssaas/` 与 `go.mod` 的范围 diff 均为空。`Entry` / CSV / JSON 列集、REST / 鉴权、River worker、浏览器资源保护、镜像构建、scrapemate `v1.4.0` 和 playwright-go `v0.6100.0` 均未变。
- SCRAPEMATE 仍为 `859d15f56ba5ed3851587edc305fab6ee956cc71`,无新增提交;完整 `git diff --name-status` 为空且 `git diff --check` 通过,其基线无需推进。GOSOM 侧 `go.mod` 仍已跟进 scrapemate `v1.4.0`;SCRAPEMATE 无独立影响项或待确认项,不建议仅为该库主动更新镜像。本次检查完整,已推进 GOSOM 基线;题设限定无网络,未执行远端 `git ls-remote`。

### 2026-09-14:GOSOM CLI 可恢复抓取与独立 Web UI 分页,无新增 SaaS 影响

- GOSOM 从 `cfb0440472ad1547b87cae8e1f43240a112b2c7b` 推进至 `2b8616d0ccf7d3c578b42a7440e3c13bb22e5083`,旧基线是新 HEAD 的祖先。完整范围含 `9b5d2c9d8fe4b44e322ddcdb51f08e78f696fe25`(`Add resumable CLI scraping`)、`097904f2b916558578ce28f6451181a16c08442f`(`feat: implement pagination in Web UI`)和 `2b8616d0ccf7d3c578b42a7440e3c13bb22e5083`(`Bumps version to v1.18.0`),共 28 个文件;完整 diff 已通过 `git diff --check`。
- `9b5d2c9` 在 `runner/runner.go` 新增默认 `false` 的 `-resume`,仅由 `main.go:runnerFactory()` 的 `RunModeFile` 分支进入 `runner/filerunner/filerunner.go`;该 runner 才会传入 `runner.WithDeterministicSeedIDs()`、`WithCompletedInputSkipper()` 和 `WithCompletionTracker()`。`gmaps/job.go` 的 `CompletionTracker` 也仅在该可选路径非 nil 时记录完成进度,不改 `BrowserActions()`、Maps 页面 / RPC 解析、`Entry` / CSV / JSON 列集或默认 CLI / 数据库运行语义。`runner/databaserunner/`、`cmd/gmapssaas/`、`saas/`、`api/`、`rqueue/`、`Dockerfile`、`Dockerfile.saas`、`go.mod` 均无 diff,故不构成本项目 SaaS 消费入口的新增影响项。
- `097904f` 的 `web/job.go`、`web/service.go`、`web/sqlite/sqlite.go`、`web/web.go` 和 HTML 模板只为 `runner/webrunner/` 创建的本地 SQLite Web UI 增加 20 条分页、排序稳定性和 HTMX 列表替换。`web.Service.All()` 及 `/api/v1` handler 源码无 diff;本项目使用的是独立 SaaS `POST /api/v1/scrape` + River / Postgres worker,不消费该 `RunModeWeb` UI,故不构成线上 REST / 鉴权 / worker 合同影响。`2b8616d` 仅更新 Makefile 中的版本号,按规则不告警。
- 已核对 `gmaps/entry.go`、`gmaps/searchjob.go`、`place.go`、`reviews.go`、`emailjob.go`、`multiple.go`、`runner/webrunner/webrunner.go`、`runner/installplaywright/`、`main.go`、`go.mod`、`runner/databaserunner/`、`api/`、`saas/`、`rqueue/`、`admin/`、`Dockerfile`、`Dockerfile.saas` 和 `cmd/gmapssaas/` 的范围 diff;除上述独立 Web UI 源码外均为空。当前 `go.mod` 仍为 `github.com/gosom/scrapemate v1.4.0`、`github.com/mxschmitt/playwright-go v0.6100.0`。
- SCRAPEMATE 仍为 `859d15f56ba5ed3851587edc305fab6ee956cc71`,无新增提交,其基线无需推进;已复核无独立待确认项。GOSOM 侧 `go.mod` 已跟进 scrapemate `v1.4.0`,但本轮无新的框架、浏览器或安全变更,不建议仅为 SCRAPEMATE 主动更新镜像。前次 GOSOM `cfb0440` 的镜像 / worker 预发验证项仍保留在上节,因此 GOSOM 的更新建议不变。

### 2026-09-13:GOSOM 构建链与 worker 健康服务关闭路径调整,建议预发评估镜像更新

- GOSOM 从 `a41dffe18c69e6b84085bfa847d410cca094da0b` 推进至 `cfb0440472ad1547b87cae8e1f43240a112b2c7b`(`Upgrades scrapemate to v1.4.0 and Go 1.27.1 (#329)`)。完整 diff 共一个提交;`Dockerfile` 将 Playwright 依赖阶段和 builder 从固定 Go `1.26.6` 切换为 `ARG GO_VERSION=1.27.1`,`Dockerfile.saas` 也将 SaaS builder 切换至 Go `1.27.1`。`go.mod` 同步声明 `go 1.27.1`,并将直接依赖 `github.com/gosom/scrapemate` 从 `v1.3.0` 升至 `v1.4.0`;这是线上镜像构建影响项,候选镜像须按待确认项完成构建与抓取链路验证。
- `cmd/gmapssaas/cmdworker/cmd_worker.go` 的 `runHealthServer()` 将终止时的 `server.Shutdown(context.Background())` 改为基于 `context.WithoutCancel(shutdownSource)` 的 5 秒超时 context,使 worker 根 context 取消后健康服务仍有可用的优雅关闭窗口。这是 SaaS worker 运行路径影响项,应在预发以终止 worker 验证健康端口关闭与任务重启行为。`api/api.go` 路由和 `rqueue/` 对外任务状态 / 结果合同未变。
- 已核对 GOSOM `gmaps/entry.go` 的 `Entry`、`CsvHeaders()`、`CsvRow()` 未改;`gmaps/searchjob.go`、`job.go`、`place.go`、`reviews.go`、`emailjob.go`、`multiple.go` 的变化为 UUID 包替换、常量复用或等价格式化,没有 Maps 页面 / 内部 RPC 解析语义变化。`runner/runner.go` 仅作容量预分配与字符串写入等价调整,`runner/webrunner/` 仅测试变更,`runner/databaserunner/`、`runner/installplaywright/`、根 `main.go` 均无 diff;`go.mod` 中 `github.com/mxschmitt/playwright-go` 仍为 `v0.6100.0`。
- SCRAPEMATE 从 `9f3c1ce9966808a43483d96b65b23c9ac72f0a0d` 推进至 `859d15f56ba5ed3851587edc305fab6ee956cc71`(`chore: upgrade to Go 1.27.1 (#28)`)。`go.mod` 升至 Go `1.27.1`,但 playwright-go 仍为 `v0.6100.0`;`browser.go` 和 `scrapemate.go` / `scrapemateapp/` / `job.go` / `request_hooks.go` / `response.go` / `result.go` / `services.go` / `proxy.go` / `context.go` / `constants.go` 均无 diff。`adapters/` 的实际源码变化为静态检查注释与 `jsonwriter.asSlice()` 的等价单元素切片返回,不改变浏览器、代理、请求 / 响应或结果合同。GOSOM 已在同次提交跟进 `scrapemate v1.4.0`;SCRAPEMATE 无独立待确认项,不建议仅为该库变更主动更新线上镜像。
- 两段 diff 均通过 `git diff --check`;本次检查完整,已推进两条基线。题设限定无网络,未执行远端 `git ls-remote`;新 HEAD 使用题设值并与本地 `.upstream/*` `main` 一致。无旧待确认项,新增的 GOSOM 预发验证项保留在上节。

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
