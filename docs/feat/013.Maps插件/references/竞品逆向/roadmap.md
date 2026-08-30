# G Maps Extractor v2.5.1 逆向调研 Roadmap

> 调研对象:`docs/scratch/G-MAPS-EXTRACTOR-v2.5.1/`(Chrome 插件,obfuscator.io 混淆 + webpack 打包)。
> 原始 zip 留档于同级目录,`readable/` 是反混淆后的全部可读源码。
> 本目录所有文档基于反混淆源码逐行核实,标注了证据位置(模块编号)。

## 一句话结论

这个插件**不是爬 Google Maps 的 DOM**,而是**拦截 Google Maps 页面自己发出的 XHR 响应**(内部 RPC,序列化数组格式),按固定下标解析出商家数据;配合**自动滚动列表页**触发加载更多、**跳转到独立页面**抓评论和照片;Email/社交媒体由**作者自建 Parse Server 后端**(Cloud Functions)代抓;前端只负责 UI、滚动调度、去重、导出。

## 文档索引

| 文档 | 内容 | 回答的问题 |
| --- | --- | --- |
| [01-架构总览.md](01-架构总览.md) | 8 个 JS 入口职责、通信拓扑、技术栈、配置常量 | 插件整体逻辑是什么 |
| [02-端到端流程.md](02-端到端流程.md) | 从「Start Extracting」点击到 CSV 落地的全流程时序 | 流程是怎么 |
| [03-数据采集协议.md](03-数据采集协议.md) | 三条采集通道:主搜索 XHR 拦截 / 评论 RPC / 照片 RPC,含完整请求构造 | 怎么采集 gmap 的 |
| [04-数据字段字典.md](04-数据字段字典.md) | 36 个导出字段逐个解析:来源下标、生成规则、Pro/Free 归属 | 每一个参数怎么采集 |
| [05-数据来源与DOM.md](05-数据来源与DOM.md) | "DOM" 的真实含义:内部数组树、getValues 安全取值、真正的 DOM 操作清单 | dom 是什么,怎么来的 |
| [06-云端依赖与授权.md](06-云端依赖与授权.md) | Parse Server 后端、Cloud Functions 清单、license/isPro/配额体系 | 联网行为与付费墙 |
| [07-导出与集成.md](07-导出与集成.md) | CSV/JSON/XLSX 导出、Google Drive、HubSpot、文件命名规则 | 数据怎么出去 |
| [08-反混淆处理说明.md](08-反混淆处理说明.md) | 源码处理过程、readable/ 目录结构、如何复现 | 我对文件做了什么 |
| [09-参数总表.md](09-参数总表.md) | 全部时序/数量/阈值参数:多少秒采一次、每次采多少、上限、重试、保活…… | 每一个细节参数 |
| [10-动态验证报告.md](10-动态验证报告.md) | Playwright 实测:协议有效性验证、双响应格式、插件当前失效点、最小采集方案 | 实测结果(含黄金样本) |

## 快速跳转:核心证据文件

反混淆后按 webpack 模块拆分,核心业务模块已复制到 `readable/modules/`:

| 文件 | 原始位置 | 职责 |
| --- | --- | --- |
| `injected-hook.js` | injected.js 模块 394 | XHR hook,三条通道的事件分发 |
| `contentScript-main.js` | contentScript.js 模块 396 | 主控制器 + 响应解析器(字段下标全在这) |
| `contentScript-reviews-url.js` | contentScript.js 模块 318 | 评论 URL 构造(placeId → search.google.com) |
| `contentScript-photos.js` | contentScript.js 模块 317 | 照片抓取控制器 |
| `config-mod15.js` | *.js 模块 15 | 全部常量:字段表、消息表、套餐配额、HOST |
| `background-msg-handlers.js` | background.js 模块 384 | 后端消息路由:find_leads/fetch_email/license… |
| `background-api.js` | background.js 模块 01 | Parse API 封装 + OAuth + Drive/HubSpot 用户体系 |
| `background-drive.js` | background.js 模块 176 | Google Drive REST 上传 |
| `background-hubspot.js` | background.js 模块 187 | HubSpot 同步(云函数代理) |
| `rsScript-reviews.js` | rsScript.js 模块 318 | 评论页抓取控制器 + 三种响应解析器 |
| `dashboard-vue.js` | dashboard.js 模块 347 | Vue 渲染的批量任务面板(IndexedDB 任务队列) |

未复制的完整模块拆分产物在 `/tmp/gmap-deob/split/<bundle>/mod_NNN.js`(临时目录,重启后消失;如需保留见 08 文档复现方法)。

## 关键数字速查

- 免费:每次搜索最多 **10** 条(FREE_MAX_NUM);Pro 99999
- 套餐配额(月):free 1000 leads / pro 100000 / business 500000;评论 20/250/2500;照片 10/100/1000
- 滚动间隔选项 `[5,6,8,9,10]` 秒,默认第 3 档 = **8 秒**
- 批量任务:每任务最多 **500** 关键词,最多保存 150 个任务;评论批量默认导出 300 条/地点
- 卡死判定:1.5 分钟无进展即跳过(SKIP_STUCK_TIME = 60000 × 1.5)
- 后端:`https://gmapsextractor.getwebooster.com/parse`(Parse Server,App Key 见 06 文档)
