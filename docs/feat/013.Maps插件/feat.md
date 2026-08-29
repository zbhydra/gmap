# 013 · Maps 插件

## 功能目标

复刻竞品 G Maps Extractor v2.5.1 的核心能力:浏览器插件跑在 Google Maps 页面上,把搜索结果商家、评论、照片、Email/社媒链接抓取为结构化数据并导出,配合批量任务面板实现自动化采集。

## 当前状态

- 竞品逆向调研 13 项全部完成,细节见 `references/A1~A13`(源材料:`@../../scratch/G-MAPS-EXTRACTOR-v2.5.1/research/` 11 篇,含 Playwright 实测与黄金样本)。
- 复刻已拍板决策集中在 scratch `11-复刻问题清单与决策.md`:不强制登录、DOM 选择器与解析 schema 走远程配置(复用 tg-download 方案)、SW 状态落盘步进状态机、服务端 Email/社媒自研、不上 Chrome 商店(目标 Edge Add-ons + Firefox AMO)。
- 插件未开始开发。进度见根 `@../../ROADMAP.md` A 组。

## 产品范围

### 包含

- 地图搜索结果抓取(商家 36 列)、评论抓取、照片抓取、Email/社媒补全
- 批量任务面板(关键词队列 / 评论 URL 队列)
- 导出 CSV/JSON/XLSX、导出字段勾选、采集设置
- Google Drive / HubSpot 集成
- 插件侧账号登录与配额展示(复用 007/003 域)

### 不包含

- 云端抓取与 API(归 014.Maps云端)
- 营销站与支付(归 015 / 011 / 006 / 004)
- Chrome Web Store 上架(已拍板不上,见 A13)

## 功能索引

| 编号 | 功能 | 竞品调研 |
| --- | --- | --- |
| A1 | 地图搜索抓取 | `@references/A1-地图搜索抓取.md` |
| A2 | 评论抓取 | `@references/A2-评论抓取.md` |
| A3 | 照片抓取 | `@references/A3-照片抓取.md` |
| A4 | Email/社媒补全 | `@references/A4-Email与社媒补全.md` |
| A5 | 36 列字段字典 | `@references/A5-字段字典.md` |
| A6 | 批量任务面板 | `@references/A6-批量任务面板.md` |
| A7 | 保存列表抓取 | `@references/A7-保存列表抓取.md` |
| A8 | 导出 | `@references/A8-导出.md` |
| A9 | 设置项 | `@references/A9-设置项.md` |
| A10 | Drive/HubSpot 集成 | `@references/A10-Drive与HubSpot集成.md` |
| A11 | 账号与配额 | `@references/A11-账号与配额.md` |
| A12 | 远端运营通道 | `@references/A12-远端运营通道.md` |
| A13 | 插件骨架与上架 | `@references/A13-插件骨架与上架.md` |

## 实施顺序(全量交付,验收 = 功能面对齐竞品 v2.5.1)

1. **骨架 + 远程配置通道**:工程落点(见「待决」)、manifest/目标域改造、dom/parseSchema/scrape 三组远程配置(方案:scratch 11 号 #4)
2. **A1 搜索闭环**:injected hook + 滚动驱动 + 下标解析 + CSV 导出;黄金样本(`golden-samples/format-*.txt`)作解析单测 fixture
3. **采集导出主链**:A2 评论 → A3 照片 → A5 全 36 列 → A8 三格式导出
4. **A6 批量面板**:状态落盘步进状态机(scratch 11 号 #5)
5. **A9/A12 打磨**:设置页、远端公告/版本/埋点(埋点按 009 域脱敏口径)
6. **A11 账号配额**:扩展 007/003 域接入(不强制登录,scratch 11 号 #2)
7. **A4 Email/社媒**:服务端自研(scratch 11 号 #6)+ 插件接入
8. **A10 Drive/HubSpot → A7 列表模式 → A13 上架**(Edge Add-ons + Firefox AMO,scratch 11 号 #7)

## 待决(开工阻塞项)

- ~~工程落点~~ 已决:直接改造 `extension/` 为 Maps 插件(TG 下载业务与官网桥已删除,保留 RPC/构建/HTTP/打点/远端配置/i18n/测试底座,见 extension/README.md)。
- A7 的一个实现期验证点(登录 profile 开真实 Saved list 确认 URL 参数与 DOM 形态)不阻塞开发,见其文档。

## 实施进度

- 2026-08-29 底座改造完成:`extension/` 删除 TG 下载业务(downloadStatus/injected 协议/resource 常量/官网登录桥/UpgradeModal/卸载问卷/manual 用例),manifest 中性化(version 0.1.0、externally_connectable 置空、域名占位),locales 重写为英文基线。验证:build 通过、单测 121/121、lint 零警告。下一步 = 第 2 步(A1 搜索闭环)。
