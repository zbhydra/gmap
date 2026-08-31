# 013 · Maps 插件

## 功能目标

复刻竞品 G Maps Extractor v2.5.1 的完整功能面:浏览器插件跑在 Google Maps 页面上,把搜索结果商家、评论、照片、Email/社媒链接采集为结构化数据并导出,批量任务面板实现无人值守自动化,账号/配额体系支撑订阅变现。验收基准 = 功能面对齐竞品 v2.5.1(已拍板的架构差异除外,见「已拍板差异」)。

## 当前状态

- **插件全量开发已完成(2026-08-30,执行计划 `plans/001.插件全量实施.md` U1–U11 全部 done)**:A1–A13 全部 13 项功能落地,三渠道构建产物(chrome/edge/firefox)。验证:extension unit 313 passed、e2e 17 passed(全自动零外网)、backend maps 范围 pytest 全绿。
- 竞品逆向调研 13 项完成,逐功能细节见 `references/A1~A13` 与 `references/竞品逆向/`(11 篇逆向文档 + 黄金样本,入 git)。
- 遗留待办:真实 Google 登录态冒烟(real smoke:usage 真实链路/U9 真实 OAuth 凭证/U10 真实采集校准);占位凭证(Google OAuth client_id、gecko id)待 hydra 定稿。进度大盘见根 `@../../ROADMAP.md`。

## 已拍板差异(对齐竞品时的例外)

以下实现方式与竞品不同,已经 hydra 拍板(证据:`@references/竞品逆向/11-复刻问题清单与决策.md`):

1. 不强制 Google 登录即可使用核心采集;需要配额时用自有账号/凭证体系(007/003 域)。
2. DOM 选择器与解析 schema 不硬编码,走远程配置通道(dom/parseSchema/scrape 三组),复用 tg-download 远程配置方案。
3. 批量任务状态落盘 + 步进状态机,不用心跳续命。
4. Email/社媒补全服务端自研(官网爬取 + 外链解析),不依赖第三方后端。
5. 不上 Chrome Web Store;目标 Edge Add-ons + Firefox AMO。

## 产品范围

### 包含

- A1 地图搜索抓取、A2 评论抓取、A3 照片抓取、A4 Email/社媒补全、A5 36 列字段
- A6 批量任务面板、A7 保存/列表抓取、A8 导出、A9 设置项
- A10 Drive/HubSpot 集成、A11 账号与配额、A12 远端运营通道、A13 骨架与上架

### 不包含

- 云端抓取与 API(014 域);营销站与支付(015/011/006/004 域)
- Chrome Web Store 上架;照片二进制批量下载(仅导出 URL,与竞品一致)

## 名词

- **面板**:注入 Maps 页面的采集控制浮层(竞品 #map_scraper),有三态:待命 / 采集中 / 完成。
- **列表模式**:URL 含 `10m1!1e1` 标记的列表形态页(保存列表、搜索侧栏列表)下的采集变体(A7;触发用宽松匹配,实测竞品的精确子串在深层列表页失效)。
- **批量任务**:dashboard 页创建的关键词队列或评论 URL 队列任务(A6)。

## 业务流程

### 主流程:搜索采集(用户视角)

1. 用户在 Maps 搜索(如 `coffee in manhattan`),面板以待命态出现在页面。
2. 点 **Start Extracting**:面板进入采集中态(实时计数 + Pause);插件按固定节奏(默认 8 秒,可调 5–10 秒)自动滚动结果列表,拦截 Maps 内部响应并解析出商家行,去重后累计。
3. 列表到底(出现结束提示)或达单次上限(免费 10 条;付费 99,999 条,实际受月配额约束)自动完成。
4. 完成态提供 **Export Detailed List - N (.格式)** 与 **Reset**;开启自动导出时完成即下载。
5. 月配额用尽(≥100%)时禁止开始,提示「已用完本期额度」并引导订阅页。

异常:结果 <2 条视为无结果直接完成;单批采集 90 秒无进展(批量模式)判卡死跳过;任何选择器/解析失败必须 UI 可见报错,禁止静默(已拍板)。细节:`@references/A1-地图搜索抓取.md`。

### 评论子流程

place 详情页 → 面板出现 **Reviews & Photos** 标签页 → Start Extracting Reviews → 自动开评论页翻页抓取 → 达上限(免费 20 / Pro 250 / Business 2,500;批量可自定义默认 300)/ 不足一页 / 无翻页 token 即完成 → 导出 11 列。`@references/A2-评论抓取.md`

### 照片子流程

同标签页 Start Extracting Photos → 打开照片画廊页翻页 → 过滤街景 → 达上限(免费 10 / Pro 100 / Business 1,000)/ 无更多即完成 → 导出 URL 列表。`@references/A3-照片抓取.md`

### Email / 社媒补全(采集中的可选增强)

设置中勾选 Extract email address / Extract social medias(Pro 字段)→ 采集时逐条由服务端补全 → 写入 Email / Social Medias 列;未勾选也逐条上报计数。补全失败不阻断主采集。**计量口径(U7 裁决,2026-08-30)**:记录数配额在采集完成边沿按会话计量(U7),enrich 端点不重复扣减。`@references/A4-Email与社媒补全.md`

### 批量任务流程

dashboard 新建任务(关键词 ≤500 或评论 URL ≤500,任务名必填)→ Start Extracting → 逐项开页自动采集 → 完成/卡死(90 秒)自动切换下一项 → 全部完成自动导出。同一时间只允许一个批量任务运行;任务保存上限 150 个。任务状态落盘,SW 被杀或页面全关后可恢复。`@references/A6-批量任务面板.md`

### 列表模式流程

打开列表形态页(保存列表/搜索侧栏列表)→ 面板 Start 后**自动逐项**打开详情采集(2026-08-30 U10 裁决:弃竞品的每项 Extract 按钮,自动方案概念更少且 e2e 全自动友好)→ 列表滚动加载 → 到底完成。`@references/A7-保存列表抓取.md`

## 界面与操作逻辑

### 面板(三态)

| 状态 | 元素 | 行为 |
| --- | --- | --- |
| 待命 | 标题、Start Extracting 按钮、面板位置切换(左/右) | 点击开始采集 |
| 采集中 | 转圈动画、Extracting N... 文本、Export 按钮(隐藏可用)、Pause 按钮 | Pause → 暂停态(Resume 恢复) |
| 完成 | Extract complete. 文本、Export Detailed List - N (.格式)、Reset 按钮 | 导出 / 重置回待命 |

固定行为:按钮展示当前导出格式后缀(如 `.CSV`);面板停靠位置通过左/右切换按钮调整(搜索列表页默认左侧,place 详情页默认右侧 20px)。

### 评论/照片标签页(place 详情页)

Reviews & Photos 标签页含:Start Extracting Reviews 按钮、Start Extracting Photos 按钮、各自的计数与加载指示。

### 批量任务面板(dashboard 页)

- 顶部两个标签页:**Bulk Keyword Data Tool**(关键词任务)/ **Bulk Google Reviews Extractor**(评论 URL 任务)。
- 新建表单:Task Name 文本框(placeholder 形如 `e.g. 100 keywords, design agency`)+ 关键词/URL 多行文本域(10 行)+ **Start Extracting**(rocket 图标)。
- 任务表:列 = Task Name / Status / Actions;行操作含复制全部关键词、复制已完成项、删除;状态含运行中/完成/卡死跳过计数。
- 全局约束:任务总量提示上限 150(含两类);其他批量任务运行中时禁止再启动(danger 提示)。

### Popup

标题栏(名称 + 语言切换)、账号/订阅状态区(A11 落地)、支持入口(联系邮箱复制、反馈渠道)、打点:打开即上报 popup_open。

### 设置页(options)

滚动/采集间隔五档(5/6/8/9/10 秒,默认 8)、导出格式三选、36 列字段勾选(Pro 列免费用户可勾选,导出时被剔除——与竞品一致)、auto_download、Drive/HubSpot 自动保存开关、批量卡死重试次数(默认 1)。`@references/A9-设置项.md`

## 非功能性需求

- **拟人化节奏**:滚动动画随机 1.5–3.5 秒;轮询间隔在设定档位上随机抖动;所有节奏参数可被远程配置调整。
- **抗改版**:远程配置六组(dom/reviewsDom/parseSchema/exportConfig/scrape/operations,包内默认 + 远端稀疏覆盖 + 1 小时缓存);失败可见。用户设置(间隔等个人偏好)与远程配置分层:用户显式偏好优先,落地于 `extension/src/sites/maps/settings/userSettings.ts` 模块头契约。
- **SW 生命周期**:批量任务状态落盘,chrome.alarms 兜底恢复;SW 不持有必须存活的业务状态。
- **兼容**:Chrome / Edge(Chromium)全量;Firefox MV3 事件页做调度平台分支。
- **隐私红线**:上报字段按 009 域脱敏口径审查;不发送 Cookie/令牌/完整下载直链。
- **性能**:单批响应在 progress 阶段即消费;大响应不阻塞页面。

## 数据埋点

| 事件 | 触发 | 备注 |
| --- | --- | --- |
| popup_open | Popup 打开 | 已有 |
| content_open | content script 初始化 | 已有 |
| search | 开始采集 | 含关键词(脱敏后)、bulk 标志 |
| export_results | 导出 | 含格式、条数 |
| scrape_reviews_content | 评论采集 | |
| sync_to_google_drive | Drive 同步 | |
| btn_click | 关键按钮点击 | |
| install | 安装 | GA4 + 后端双报 |
| enrich_complete | Email/社媒补全完成 | 成功/失败均报,含 count/written/partial/ok |

## 验收标准(域级)

1. 黄金样本解析单测全绿(格式 A/B 双形态,20/20 字段命中)。
2. 真实 Maps 搜索→导出 CSV 全链路通过;评论/照片两条子流程各自通过。
3. 批量任务在 SW 被杀、页面全关后可恢复并完成。
4. 远程配置下发后刷新页面即生效(不发版)。
5. 全部 13 项功能对照竞品 v2.5.1 行为一致(已拍板差异除外)。
6. build / lint / 单测全绿。

## 功能索引(references)

| 编号 | 功能 | 竞品调研 |
| --- | --- | --- |
| A1 | 地图搜索抓取 | `@references/A1-地图搜索抓取.md` |
| A2 | 评论抓取 | `@references/A2-评论抓取.md` |
| A3 | 照片抓取 | `@references/A3-照片抓取.md` |
| A4 | Email/社媒补全 | `@references/A4-Email与社媒补全.md` |
| A5 | 36 列字段字典 | `@references/A5-字段字典.md` |
| A6 | 批量任务面板 | `@references/A6-批量任务面板.md` |
| A7 | 保存/列表抓取(含当前 Maps 实测) | `@references/A7-保存列表抓取.md` |
| A8 | 导出 | `@references/A8-导出.md` |
| A9 | 设置项 | `@references/A9-设置项.md` |
| A10 | Drive/HubSpot 集成 | `@references/A10-Drive与HubSpot集成.md` |
| A11 | 账号与配额 | `@references/A11-账号与配额.md` |
| A12 | 远端运营通道 | `@references/A12-远端运营通道.md` |
| A13 | 插件骨架与上架 | `@references/A13-插件骨架与上架.md` |

## 实施顺序(全量交付)

1. 骨架 + 远程配置通道(✅ 底座已就绪,2026-08-29)
2. A1 搜索闭环(黄金样本作解析单测 fixture)
3. A2 → A3 → A5 → A8 采集导出主链
4. A6 批量面板(状态落盘)
5. A9 / A12 打磨
6. A11 账号配额(扩展 007/003)
7. A4 服务端自研 + 接入
8. A10 → A7 → A13 上架

## 待决

- ~~工程落点~~ 已决:改造 `extension/`(已完成)。
- A7 实现期验证点:登录 profile 开真实 Saved list 确认 URL 参数与 DOM 形态(不阻塞)。
