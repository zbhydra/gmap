# Bing Maps Scraper 竞品调研("Maps Scraper & Map data extractor" v2.4.9)

> 安装包与源码:`docs/scratch/MAPS-SCRAPER-BING-v2.4.9/`(`src/` 为 Edge 解包目录,zip 为打包留档,均不入 git)。
> 证据引用位置以 `src/` 下相对路径为准;行号对应打包产物内字符偏移不可读,均以函数名 / 字符串定位。
> 调研日期:2026-08-30。姐妹篇:G-MAPS-EXTRACTOR v2.5.1 逆向(`docs/feat/013.Maps插件/references/竞品逆向/`)。
> **已完成动态验证**(Playwright 加载扩展实测,§11):云端协议全部真实抓包、采集主循环跑通、CSV 实际产出;静态推断中被实测修正的两处已在正文就地更正。

## 0 · 结论摘要

- 这是 **G Maps Extractor 同赛道的 Bing Maps 版竞品**,官网 mapsscraper.net,内部产品代号 `Bing-Maps-Leads`,与 G-MAPS 同为「地图商家信息 + Email/社媒挖掘」的商业线索工具,但商业化程度和技术栈代差明显。
- 抓取原理与 G-MAPS **根本不同**:不拦截网络请求,直接解析 Bing Maps 列表项 `[data-entity]` 属性里的**结构化 JSON**(Bing 把商家数据内嵌在 DOM 属性中,含 ratingValue/openHoursText 等结构化字段),jQuery 解析 outerHTML 完成提取。
- **权限极简**:`storage` + `tabs` 两个权限、零 host_permissions,靠 content script + iframe 完成一切,商店过审阻力最小。
- **DOM 适配配置支持云端热下发**(`bingMapsVersions`),Bing 改版可不发版修复;这是对 G-MAPS 的显著工程优势。
- UI 是 **Vue 3 + Pinia + iView + Tailwind 的 iframe 沙箱面板**(G-MAPS 是 webpack4 + 原生 DOM 面板),构建链为 Vite。
- Email / 社媒挖掘同样为**云端服务**(`back.mapsscraper.net`),本地只上传商家官网 URL;两种云端模式:同步 `mqfyia`(浅而快)与异步 `frkaizm` gzip + 结果轮询(深而全,实测同一网站同步模式漏掉 email、nb 模式挖到 2 个)。
- 商业化:免费 20 条/次 + Email/社媒锁定 Pro;价格 $19/月、$15/季、$12/年,支付外链 **leadsext.com**(Stripe/Paddle/Lemon Squeezy);价格表、支付链接、推广位、工具矩阵全部云端下发,增长运营不依赖发版。
- **动态实测:新匿名用户直接获得会员权限**(`ig:true`,未见任何注册/付费),免费 20 条限制与 Pro 锁定在线上实际不生效——疑似拉新期全员送 Pro。
- 从打包路径泄露看,作者项目为 `/Users/kylinwang/WebstormProjects/BingMapsExportCrx`(开发者 kylinwang),是套壳/多开产品线的典型工程形态。

## 1 · 产品身份与版本

| 项 | 值 | 证据 |
| --- | --- | --- |
| 名称 | Maps Scraper & Map data extractor | `_locales/en/messages.json` `appName` |
| 版本 | 2.4.9,manifest v3 | `manifest.json` |
| 扩展 ID | `ofbhiclojhjkggpnapcnjjjdjlgcikdf` | Edge 安装目录名 |
| 更新渠道 | `update_url` 指向 **Chrome Web Store**(Edge 装的是 Chrome 版) | `manifest.json`;SW 内硬编码 `"prod_chrome"`(chunk-bd7c9f87) |
| 官网 / 后端 | mapsscraper.net / **back.mapsscraper.net** | manifest `homepage_url`;chunk-3727d89a |
| 内部代号 | `Bing-Maps-Leads`(identity/indeedIdStr) | chunk-3727d89a、cframe.js 登录 state |
| 应用 ID | `268723136235-7jai658m24indeedp4f9f610v7e67720.apps.googleusercontent.com`(Google OAuth client,当内部 appId 用) | manifest `key` 对应签名身份;SW 卸载链接 / 登录 state |
| 描述 | "one click to extract data from Bing Maps, includes phone number, email, social media" | `_locales/en/messages.json` `appDes` |

构建与依赖指纹(chunk 命名为 Vite/Rollup hash 风格):

- Vue 3 + Pinia(a5b97b5e 内嵌 pinia store)、**iView / ViewUIPlus**(a2f8d0e6 含 iview 组件与图标)、vue-select(cframe.js 内 typeAhead 组件)、Tailwind(Utility class)。
- **jQuery**(a2f8d0e6,`window.$` 由 cframe 挂载,HTML 解析用)。
- **SheetJS**(xlsx 公式表 + `book_new/json_to_sheet/sheet_to_csv`,CSV/XLSX 导出)。
- **pako**(gzip/ungzip,nb 模式云端增强协议)。
- 无 vue-i18n、无 Papa:**UI 文案全量硬编码英文**,仅 manifest 层面留了 `_locales` 壳(只有 2 条)。

## 2 · 架构总览

### 2.1 manifest 关键事实(src/manifest.json)

| 项 | 值 | 含义 |
| --- | --- | --- |
| permissions | `storage` `tabs` | 仅本地存储 + tab 管理;**无 identity、无 host_permissions、无 activeTab** |
| content_scripts | 仅 `*://*.bing.com/maps*`,document_end,单一 CS chunk | 主战场只有 Bing Maps 搜索页 |
| background | module service worker(`service-worker-loader.js` → chunk-bd7c9f87) | 登录/配置/日志的路由层 |
| web_accessible_resources | `<all_urls>`:img/assets/cframe.html;`*.bing.com`:3 个业务 chunk | iframe 面板挂进页面所需 |
| default_locale | en(仅 2 条) | 无真正国际化 |

### 2.2 四个运行体与通信拓扑

```
bing.com/maps 页面
├── content script(chunk-f9c87a6a,隔离世界)
│     ├── createIframe:把 chrome-runtime://…/cframe.html 以 <iframe sandbox> 挂进页面(右上角,可拖动)
│     ├── DOM 探测/翻页:列表检测、loading 检测、Search-this-area、滚动加载、nextPage 点击
│     └── 把列表容器 outerHTML 回传给 iframe
│           │ chrome.runtime 消息(13 个通道,见 2.3)
│           ▼
├── iframe = cframe.html(chunk-a2f8d0e6 主 bundle + cframe.js)
│     ├── Vue3 应用:Header/Home/Finding/Pricing/Help/Tools 页面
│     ├── 主循环 + data-entity 解析 + 去重 + 会员增强调度 + SheetJS 导出数据组装
│     └── 下载动作回发给 CS 执行(DOWNLOAD-FILE)
│           │ fetch(带 crx_vcwgjg token)
│           ▼
│   back.mapsscraper.net/indeed/*(8 个端点,见 §6)
│
├── service worker(chunk-bd7c9f87)
│     ├── 登录(wer)/userinfo/docking 的唯一执行方,缓存 crx_vcwgjg token
│     ├── __LOGS 分级上报、OPEN_REVIEWS、WHO_AM_I_TAB
│     └── onInstalled:开官网 + 设卸载问卷链接
│
└── popup(chunk-6f91f252)
      └── 当前 tab 是 bing.com/maps → SHOW-OR-HIDE-IFRAME(闪烁两次提示面板在);
          否则新开 https://bing.com/maps
```

iframe 用 `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"` 注入;面板自身样式(位置/尺寸/显隐)全部由 CS 侧 `UPDATE-IFRAME-CSS / POSITION / RESIZE` 消息控制,iframe 内部通过 MutationObserver 量测内容高度自适应(`ContentIFrame.vue`)。

### 2.3 消息通道全表(CS 端注册,`chunk-f9c87a6a`)

| 通道 | 方向 | 作用 |
| --- | --- | --- |
| `SYNC-BING-MAPS-CONFIG` | iframe→CS | 下发云端 `bingMapsVersions`,重建 DOM 适配器 |
| `REQUEST-BVLIST-CHECK` | iframe→CS | 轻探测:列表是否渲染(HomePage 每 1.5s 轮询) |
| `REQUEST-BVLIST-HTML-STRING` | iframe→CS | 重探测:等列表容器渲染完成(默认 8s 超时/250ms 轮询),回 `outerHTML` |
| `REQUEST-NEXT-PAGE-CHECK` | iframe→CS | 翻页动作(legacy 点击/新版滚动),回 `hasNextPage` |
| `GET-CURRENT-HTML-STRING` | iframe→CS | 整页 `outerHTML`(URL 正则 `^.+\.bing\.com\/maps\/?\?.*` 守卫) |
| `DOWNLOAD-FILE` | iframe→CS | 在页面上下文触发 CSV/XLSX 下载(文件名 `Bing_Maps_Scraper_{N}_`) |
| `SHOW-OR-HIDE-IFRAME` | popup/SW→CS | 显隐面板;显示时 fadeOut/fadeIn ×2 闪烁提示 |
| `RESIZE` / `POSITION` / `UPDATE-IFRAME-CSS` / `GET-IFRAME-CSS` | iframe→CS | 面板几何与样式 |
| `WINDOW-LOCATION` / `FOR-EXAMPLE` | iframe→CS | 读 location / 跳演示搜索页 |

SW 端另有:`WHO_AM_I_TAB`、`REFRESH_LOGIN`、`REFRESH_USERINFO`、`REFRESH_DOCKING`、`__LOGS`、`OPEN_REVIEWS`。

## 3 · 端到端采集流程(`FindingPage.vue`,cframe.js)

1. **就绪**:iframe 挂载 → SW 依次执行 wer 登录 → vfsdnji userinfo → opqwiue docking,Pinia store 写入 `crxUserInfo` / `dockingInfo`。
2. **待命**:HomePage 每 1.5s 发 `REQUEST-BVLIST-CHECK`;未检测到列表时提示 "Please search business first","For Example" 链接跳 `https://www.bing.com/maps?q=auto+repair+near+new+york+city`。
3. **启动**:Start Extraction → 进入 FindingPage;先 `SYNC-BING-MAPS-CONFIG` 同步适配器,再启动**主循环 N()**:
   - `REQUEST-BVLIST-HTML-STRING` 拿列表容器 HTML → `U()` 解析入库;
   - `REQUEST-NEXT-PAGE-CHECK` → 有下一页则 sleep 2s 继续;
   - 轮间隔 500ms;单轮异常计数,连续 12 次失败退出;用户 Stop 或去重集不再增长即收敛。
4. **会员增强管线 z()**(与主循环并行):对每条含 `Website` 的记录入队,并发 3(`frFlag` 用户为 2),任务间隔 1.5s,调云端挖 Email/社媒(§6.3),结果回填行数据。
5. **导出**:Dropdown 内 "Download data to csv/xlsx";免费用户超出 20 条的部分被截断,并在末尾附加一行 `Free accounts can export up to 20 data entries.`(导出行里打广告)。
6. **免费上限**:解析循环内 `memberFlag` 为假时计数 ≥20 即置完成态;完成面板出 iView Alert "Free accounts can export up to 20 data entries." + "Upgrade to Pro Now"(跳 pricing 页)。

**翻页策略按 Bing 版本分派**(适配器 `infiniteScroll` 字段):legacy 版点击 `a.bm_rightChevron`(必要时 scrollIntoView 后派发 MouseEvent);新版优先点 "Search this area" 按钮,否则对滚动容器 `scrollTop=scrollHeight` 或 `window.scrollBy` 触发无限滚动。

## 4 · 数据来源与 DOM 适配

### 4.1 核心数据源:条目内嵌 JSON

每个商家列表项的 **`[data-entity]` 属性**存着(可能双重 JSON.stringify 的)结构化对象,解析函数 `j()`(cframe.js)逐层 `JSON.parse`。黄金样本见 `docs/scratch/MAPS-SCRAPER-BING-v2.4.9/research/dynamic/data-entity-samples.json`(实测抓取),完整结构:

- 顶层:`geometryType`、`geometry{x, y, bounds}`、`entity{…}`、`routablePoint{latitude, longitude}`、`extraFuiAugmentations`
- `entity.*`(实测全字段):`id`(=`ypid:YN6…` Bing place id)、`title`、`address`、`imageUrl`、`website`、`phone`、`primaryCategoryName`、`primaryCategoryPath`、`primaryStyleCategory`、`entryName`、`infoboxHtml`、**`ratingValue` / `ratingCount` / `ratingSourceName` / `ratingProviderIconUrl`**、**`openStatus` / `openHoursText` / `permanentlyClosedText` / `reviewsText`**

插件实际取用 `entity.id/title/address/imageUrl/website/phone/primaryCategoryName/infoboxHtml` + `routablePoint`;评分走的是 `infoboxHtml` 气泡 DOM 二次解析(`.infoBoxLink .bm_ib_ratings span.csrc > span` 星级图类 `sw_st`(1)/`sw_sth`(0.5)/`sw_ste`(终止)),文本兜底为 Rating Info。**实测发现新版 `data-entity` 已自带结构化 `ratingValue/ratingCount/openHoursText`,DOM 星级解析属冗余的 legacy 路径**——对我们自己的实现,直接读结构化字段即可。

### 4.2 双版本适配器与云端热修

内置适配器(chunk-f1caaee2),按探测器优先级选择:

| 版本 | 探测器 | 列表容器 | 条目 | 翻页 |
| --- | --- | --- | --- | --- |
| legacy(优先级 1) | `.b_vList` `.bm_oneMap` | `.b_vList` | `a.listings-item[data-entity]`、`li a` | `a.bm_rightChevron`,关闭无限滚动 |
| new(优先级 2) | `.b_lstcards` `#appShellRoot` | `.b_lstcards` `.listingsPanel` `[data-automation-id="resultsList"]` | `[data-entity]`、`li .b_split_card`、`button .listingContent_fjvwG`、`li[data-key]`、`[data-entity-id]` | 无限滚动 + searchThisAreaButton 多候选 |

- loading 指示选择器 7 个候选(`waitlayer/spinner/loader/skeleton…`),新版还有骨架屏类名。
- **`SYNC-BING-MAPS-CONFIG` 支持云端下发 `bingMapsVersions` 数组整体覆盖/追加本地配置**(docking 接口 `bingMapsVersions` 字段):Bing 改版时服务端改配置即可,不发版。每个候选 selector 数组按顺序试探,`document.querySelector` 命中即用。
- 解析前把 `src="/` 替换为 `srcd="/`,防止 jQuery 把相对路径图片当真实请求加载。
- 去重:`Set` 按 `entity.id`;Bing Maps 详情链接由 `cp={lat}~{lon}&lvl=16.0&q={title, address}` 拼出。

## 5 · 导出字段字典(18 列,cframe.js `U()`)

| 列名 | 来源 | 免费版 |
| --- | --- | --- |
| ID | `entity.id` | ✓ |
| Name | `entity.title` | ✓ |
| Address | `entity.address` | ✓ |
| Featured image | `entity.imageUrl` | ✓ |
| Bing Maps URL | 本地拼接(§4.2) | ✓ |
| Latitude / Longitude | `routablePoint` | ✓ |
| Rating / Rating Info | `infoboxHtml` 星级解析 | ✓ |
| Category | `entity.primaryCategoryName` | ✓ |
| Open Hours | 条目 DOM `.opHours`(适配器 openHours 选择器) | ✓ |
| Website | `entity.website` | ✓ |
| Phone | `entity.phone` | ✓ |
| Emails | 云端挖掘 | `"###PRO###"` 占位 |
| Social Medias / Facebook / Instagram / Twitter | 云端挖掘(社媒字典按 key 拆列;`tel` 键剔除) | `"###PRO###"` 占位 |

会员增强进行中时上述四列显示 `"### In progress ###"`,完成后回填,失败置空字符串。导出文件名 `Bing_Maps_Scraper_{条数}_{timestamp}`,CSV 加 BOM(`\ufeff`)保证 Excel 中文兼容。

## 6 · 云端协议(`back.mapsscraper.net/indeed/*`,chunk-3727d89a)

统一封装:JSON 与表单两种 body 序列化;token 存 `chrome.storage` key `crx_vcwgjg`,后续请求自动带 **header `crx_vcwgjg: {token}`**;统一响应 `{code, message, result}`,`code===200` 才视为成功。

### 6.1 端点总表

> 端点与 store 的对应关系以动态实况为准(§11):`vfsdnji` 的响应写入 `dockingInfo`、`opqwiue` 的响应写入 `crxUserInfo`——**两者职责与端点名的直觉语义相反,客户端就是这样消费的**。

| 混淆端点 | 方法 | 实际职责(实测修正) | 关键入参 / 出参 |
| --- | --- | --- | --- |
| `wer` | POST | **登录**,换 token `result.ik` | indeedId(appId)、indeedIdStr=`Bing-Maps-Leads`、indeedACode/aCode(匿名码)、iunicode(每次新 UUID)、timestamp、aaiid、ideedUni |
| `vfsdnji` | GET | **docking 远程配置下发**(响应存入 `dockingInfo`) | 无业务入参(iiid/iunicode/timestamp 等装饰);→ `qa/indgc/rebt/authUrl/funs/nb/indc/iiei/email/home`(见 6.2) |
| `opqwiue` | GET | **用户信息**(响应存入 `crxUserInfo`) | 无业务入参;→ `{iid, im, ianon, ig, ili, itype, icode, inumber, itime, …}`(见 7.1) |
| `ioqwusw` | GET | **价格表**(PricingPage 拉 imList/isList) | → `{imList[], isList[]}` |
| `sdfvaohi` | POST | **日志上报**(fire-and-forget;动态抓包未捕获到实际触发) | indAd(appId)、indVn(2.4.9)、indLn/indLc/indLt(name/content/type)、indUa、indAl(语言)、fansUd(用户 iid) |
| `mqfyia` | POST | **Email/社媒挖掘·同步模式**(浅、快) | `{website, indkw:"", indNr:"100", indmurl:BingMapsURL}` → `{emailList, socialMedias{}}`(实测探针见 §11) |
| `frkaizm` | POST | **Email/社媒挖掘·nb 模式**(gzip、深、异步) | `{data: gzip(JSON{url, profiles:Address, name, latitude, longitude})}` → gzip `{finishFlag, leadVOList[]}` 或 `{groupId}` |
| `zbheunw/{gi}` | GET | **nb 模式结果轮询**(每 6s,90s 超时) | groupId → gzip `{finishFlag, leadVOList[]}`(本次实测 finishFlag 均即时 true,未触发轮询) |

挖掘结果两种形态:同步模式直接给聚合后的 `{emailList, socialMedias}`;nb 模式给 `leadVOList[]`(`leadType==="email"` 进 emailList,`tel` 类型被客户端剔除,其余 leadType 作为 socialMedias[leadType]=leadContent)。

统一响应 `{success, message, code, result, timestamp}`,`code===200` 才视为成功;服务端签名 token 为 **JWT HS256**(payload 仅 `{"userId":"<iid>"}`),登录响应另有 `iim`、`irojec`(随机假名)、`ipiKe`(KEY_ 前缀随机串);多数响应附带 `ili`(随机词)/`itype`(颜色)/`inumber`(伪 SSN)/`itime` 装饰字段,疑为灰度/混淆噪音。

### 6.2 docking 下发的完整配置面(`dockingInfo`)

`home`(官网)、`qa`(FAQ 链接)、`email`(客服邮箱)、`authUrl`(Google OAuth 授权页前缀)、`funs[]`(Tools 页卡片:icon/title/description/jumpToUrl)、`rebt{gou,tip}`(HomePage 动态推广按钮)、`indc` / `indgc`(两个评分引导阈值)、`iiei`(日志级别 error/warn/info/debug)、`nb`(增强模式开关)、`bingMapsVersions[]`(**DOM 适配热修**)。

### 6.3 身份与增强服务

- **匿名码即账号**:首次启动生成 UUID 存 `chrome.storage` key `by69bq5xiupb_ANON_CODE`,登录/日志/挖掘全带它——零注册上手,会员资格先挂在匿名身份上。
- 同步模式(`mqfyia`):一次请求直接回结果;nb 模式(`frkaizm`):gzip 上报任务 → 返回 `groupId` → 客户端**每 6s 轮询 `zbheunw/{gi}`,90s 超时**,适合重网站爬取。两种模式由 `dockingInfo.nb` 云端切换。
- 并发控制:每任务间隔 1.5s、并发 3(`frFlag` 用户降为 2)。

## 7 · 商业化与增长体系

### 7.1 会员判定与付费

- `crxUserInfo` 驱动全部状态(Pinia getters,a5b97b5e):`memberFlag = ig || im`、`frFlag = ig`、`anonFlag = ianon`、`signInFlag`。`ig` 像渠道/灰度放行标志,`im` 像付费标志;`ianon` 表示纯匿名身份。**实测:全新匿名用户 `ig:true`、`im:false`,memberFlag 即为 true——Pro 能力(无限导出 + Email/社媒挖掘)对新用户默认全开,免费限制实际不生效**。
- 免费与 Pro 的边界(PricingPage 内置对比表):导出条数 ≤20 vs 无限;CSV/XLSX、官网 URL、电话免费;**Email + 社媒仅 Pro**。
- 价格套餐与支付链接**全云端下发**(实测 `imList`:Monthly $19/月、Quarterly $15/月($45/季)、Yearly $12/月($144/年),各带 `idRate` 等运营参数与 `ilink` 支付链接;`isList` 本次为空)。支付链接实际指向 **leadsext.com**(`leadsext.com/pay/wa?...plan_id=863077~79&user_id=<iid>&location_href=https://mapsscraper.net/suc`),页面标注支持 **Stripe / Paddle / Lemon Squeezy**;付费确认弹窗提供 "Having trouble subscribing" 兜底链接(退款/申诉)。
- 登录:`dockingInfo.authUrl + state{appid, anonymousCode, identity:"Bing-Maps-Leads"}` 外部打开 Google OAuth,回来手动点 "Done" 触发 `REFRESH_LOGIN`;已购会员的匿名用户顶部出黄色 Alert "Login to prevent account loss."——**登录仅用于把匿名账号资格绑定到 Google 账号**。

### 7.2 增长与运营

- 安装即开官网 tab + 设置卸载问卷链接(带匿名码/版本回传)。
- 双评分引导:`workCount≥2` 且 `ratedCount<indgc` 时启动前弹 "five-star praise" Modal(确认后 `OPEN_REVIEWS` 打开商店评论页);登录用户另有 Header 常驻评分按钮(`indc` 阈值)。
- `rebt` 动态推广按钮(HomePage,文案+跳转云端可配)、Tools 页工具矩阵(`funs`,给自家其他产品导流)。
- 导出内容里插入广告行(`Free accounts can export up to 20 data entries.`)。
- 日志分级上报且**级别阈值云端可控**(`iiei`),相当于远程调日志噪音。

### 7.3 官网功能面(mapsscraper.net,2026-08-30 实抓)

纯插件 + 薄官网模式,**无 Web 版工具、无用户中心、无文章/SEO 矩阵**(sitemap 全站 5 个 URL),静态 HTML + Tailwind 2 CDN:

- **营销落地页**:Features 仅 2 条(其中 "Customizable Search Criteria" 插件内并不存在);Pricing 双产品并列(Bing=Free / Google=Free 30 条 vs Pro $12/月年付),明确 "Pro subscriptions are started from inside the extension"——订阅在插件内跳 leadsext.com,网站不承载支付;FAQ 7 条(取消订阅=发邮件报 ID 人工处理);Add To Chrome 直跳商店。
- **插件运行时支撑页**(robots.txt Disallow,插件硬依赖):`auth.html`(Google OAuth 回跳,即 `authUrl` 的 redirect_uri)、`pay.html`/`suc.html`(支付中间页与成功回跳)、`suggestion`(卸载问卷,接收 appid/匿名码/版本)。
- **双产品线共用**:官网同时挂 Google 版落地页引流,商店条目为同一个插件 ID;法律页 terms/privacy。
- 对照:网站最小功能集 = 落地页(Features/Pricing/FAQ)+ 插件三件套(登录回跳/支付回跳/卸载问卷)+ 法律页。对比 G-MAPS 官网(guides/articles/API 文档/在线工具)无任何内容 SEO——我们 website + 015 文章矩阵在此维度天然占优。

## 8 · 导出实现(chunk-a2f8d0e6)

- SheetJS:`json_to_sheet` → `sheet_to_csv({FS:",",RS:"\n"})` + BOM 转 CSV;`write({bookType:"xlsx",type:"array"})` 转 XLSX;统一 `downloadFile` 用 Blob + 隐式 `<a download>` 触发后 revokeObjectURL。
- 下载动作由 iframe 发 `DOWNLOAD-FILE` 给 CS,在页面上下文执行(iframe 沙箱内不便触发下载)。

## 9 · 与 G-MAPS Extractor v2.5.1 对比

| 维度 | G-MAPS Extractor v2.5.1 | 本品 v2.4.9 |
| --- | --- | --- |
| 目标平台 | Google Maps | Bing Maps |
| 抓取原理 | **hook XHR 拦截接口响应**(injected.js 主世界)拿结构化 JSON | **读 DOM 属性内嵌 JSON**(`[data-entity]`),零网络拦截 |
| 技术栈 | webpack 4 + 原生 DOM/jQuery 面板 | Vite + Vue 3 + Pinia + iView + Tailwind,iframe 沙箱面板 |
| 权限 | storage+identity+activeTab+大量 host_permissions | **仅 storage+tabs,零 host** |
| UI 承载 | 注入式面板(污染宿主页样式风险) | iframe 沙箱 + 消息控几何(隔离干净) |
| DOM 适配热修 | 无(改版需发版) | **云端下发 bingMapsVersions** |
| 云端 | Parse Server(getwebooster.com),Cloud Functions 语义化命名 | 自建 back.mapsscraper.net,端点名混淆(wer/mqfyia/…) |
| Email/社媒挖掘 | 云端(find_leads/fetch_email) | 云端(同步 + 异步 gzip/轮询双模式) |
| 评论/照片抓取 | 有(独立页面抓取器) | 无 |
| 批量任务 | 有(dashboard 关键词队列) | 无(纯页面跟随式) |
| 商业化 | license/isPro + OAuth 登录 | 匿名账号 + ig/im 标志 + 云端价格表/支付链接 |
| 国际化 | — | 无(硬编码英文;但 Category/Open Hours 等直接透传 Bing 页面本地化文本,实测环境返回了中文) |

### 9.1 为什么 Bing 版用 iframe 而 G-MAPS 直插 DOM

G-MAPS v2.5.1 的 UI 是 contentScript「模板字符串 + jQuery 直插宿主页面 DOM」(`#map_scraper` append 到 body,Extract 按钮插进列表条目,无 Shadow DOM),不用 iframe;iframe 是本品差异化。动因按强弱:

1. **UI 技术栈连锁(决定性,非被迫)**:UI 是 Vue3+iView+Tailwind 全家桶(cframe.css 328KB,Tailwind preflight 为全局 reset),物理上不可能直插宿主页——preflight 会 reset 整个 Bing 页面,宿主全局样式也会打花面板。选了现代前端全家桶,iframe 是唯一宿主。反证:G-MAPS 面板手写内联样式+受控类名,零全局样式包袱,裸插 body 多年存活。
2. **流水线复用**:cframe.html+SDK+主 bundle 宿主无关,站点适配仅 CS 入口+DOM 适配器两个小文件;结合内部代号 `Bing-Maps-Leads` 与支付域名 leadsext.com,判断为「一套壳出 N 个数据站插件」的流水线,iframe 解耦是流水线前提。
3. **防御性(次要)**:Bing new 版重水合激进,直插节点易被重建吃掉;iframe 挂 body 一级宿主脚本不可达,且 storage+tabs 零 host 权限配合沙箱过审友好。

代价:隔离彻底则通信全靠消息——13 个通道中 7 个是面板几何/显隐控制,内容高度经 MutationObserver 量测回传自适应,下载须发回 CS 执行。中间路线存在:Shadow DOM(样式隔离、无跨 frame 通信税,但组件库弹层需处理挂载点)。对 013 的含义:iframe 不是必需品,是「完整前端应用 UI」的代价——轻面板直插有 G-MAPS 实证,重 UI 则在 iframe 与 Shadow DOM 间权衡。

## 10 · 对我们 Maps Extractor 产品的启示

1. **优先找页面内嵌结构化数据**(data-entity 这类),比纯 DOM 文本解析稳;且新版 data-entity 已自带 `ratingValue/openHoursText` 等结构化字段——**能用平台内嵌 JSON 就不要解析展示层 DOM**。Google Maps 侧对应 `APP_INITIALIZATION_STATE`/响应拦截,我们 B1/B2 调研已覆盖。
2. **selectors 云端下发**值得抄:013 域的 DOM 解析层应预留远程配置通道,Bing/Google 改版时不发版修复(本品 `bingMapsVersions` 是现成设计范本:探测器优先级 + 候选 selector 数组 + 版本命名)。
3. **iframe 沙箱 UI + 极简权限**(storage+tabs、零 host)是商店过审与安全口碑的最优解;我们插件端 UI 形态可对齐(ContentIFrame 的量高自适应、拖动、显隐闪烁都是成熟细节)。
4. **Pro 字段占位与免费额度**是转化设计:`###PRO###` 占位列让免费用户看见 Pro 字段价值、导出末行插广告、免费 20 条截断——三层设计齐全;但实测新匿名用户 `ig:true` 直接送 Pro,说明其当前运营优先拉新而非转化,上线初期可借鉴「默认放权、后收紧」的灰度思路。
5. **匿名账号 + 事后 Google 绑定**:零注册上手、资格不丢;价格表/支付链接/推广位/工具矩阵全云端下发,运营动作不发版。
6. Email/社媒云端挖掘是全线竞品标配 Pro 卖点;**同步(浅、快)+ 异步 nb(深、全)双模式**、1.5s 节流、并发 3 的调度参数可直接参考(014 域云端口径);注意其挖掘数据质量一般(拼接残缺、大小写重复),我们若做要加清洗层。

## 11 · 动态验证报告(2026-08-30,Playwright 实测)

**方法**:Python Playwright headed Chromium,`--load-extension` 加载 `docs/scratch/MAPS-SCRAPER-BING-v2.4.9/src/`(persistent profile 复用,保持匿名身份);`context.on("response")` 全量捕获 `back.mapsscraper.net`;驱动真实 UI 完成「检测 → Start Extraction → 主循环 → 导出」。脚本与全部产物在 `docs/scratch/MAPS-SCRAPER-BING-v2.4.9/research/`(`dynamic_run*.py` + `dynamic/` 抓包/截图/样本)。

### 11.1 逐项验证结论

| 静态推断 | 实测结果 |
| --- | --- |
| MV3 SW 正常注册、登录链路启动 | ✅ 启动即触发 OPTIONS 预检 + `wer` 登录 + `vfsdnji`/`opqwiue` 拉取;token 为 JWT HS256,后续请求自动带 `crx_vcwgjg` header |
| `vfsdnji`=userinfo、`opqwiue`=docking | ❌ **修正:相反**。`vfsdnji` 响应(配置)存入 `dockingInfo`,`opqwiue` 响应(用户)存入 `crxUserInfo`,端点名与内容语义互换 |
| iframe 面板注入 Bing Maps 页 | ✅ `#UNIQUE-ROOT-by69bq5xiupb` 注入成功;默认隐藏,等价 popup 的 display:block 后 UI 正常渲染 |
| DOM 适配器仍覆盖当前 Bing | ✅ 命中 new 版探测器(`.b_lstcards`+`#appShellRoot`),legacy 全不命中;22 个 `[data-entity]` 一屏可见 |
| `[data-entity]` 含 entity/routablePoint | ✅ 且比静态所见更全:`ratingValue/ratingCount/ratingSourceName/openStatus/openHoursText` 等结构化字段已内置(§4.1) |
| 主循环 BVLIST→解析→翻页 | ✅ "Have found 22 → 42 → 49 → 51 businesses and still going...",翻页滚动自动触发,约 10s 内收敛 |
| 免费版 20 条上限 | ❌ **未触发**:memberFlag=true(新匿名 `ig:true`)直通会员路径,51 条全量导出 |
| 会员增强管线(云端挖掘) | ✅ `frkaizm`(nb 模式)按条触发 51 次,响应 base64+gzip,`finishFlag:true` 即时返回;CSV 中 Emails/Social Medias/Facebook/Instagram/Twitter 真实回填 |
| CSV 导出格式 | ✅ 文件名 `Bing_Maps_Scraper_51_<timestamp>.csv`,18 列表头与 §5 完全一致,BOM 存在,`ypid:` 前缀商家 ID、`cp=lat~lon` 详情链接与静态分析一致 |
| `mqfyia` 同步模式 | ✅ 独立探针复现:同网站下同步模式 `emailList:null`、社媒 3 条;nb 模式同网站挖到 2 个 email + 更全社媒——**同步浅、nb 深**的分工实锤 |
| `zbheunw` 轮询 / `sdfvaohi` 日志 | ⚠️ 未实际触发(nb 模式全部即时 finish;日志未观察到上报请求),协议结构以代码为准 |

### 11.2 实测新增发现

1. **新匿名用户默认会员**(§7.1):`crxUserInfo = {ig:true, im:false, ianon:true, iid, icode:"2kKhUZYp", …}`;`icode`(Customer ID)跨会话稳定,`ili`(THX/JSON/SQL/CSS…)/`itype`(颜色)/`inumber`(伪 SSN)/`itime` 每次响应随机变,确认是装饰/噪音字段。
2. **Bing 侧本地化直通**:Category="汽车维修"、Open Hours="营业 · 歇业时间: 17:00"——插件原样透传 Bing 本地化文本,无语言标准化,产出随用户环境漂移;Rating Info 实为 "Yelp (76)" 这类来源计数(Bing 的评分数据源是 Yelp)。
3. **云端挖掘数据质量一般**:Emails 列存在拼接残缺(`633-0030Malibu@MalibuNY.com`)与大小写重复项;社媒会把 yelp/x/linkedin/youtube 汇入 Social Medias 列,但 Facebook/Instagram/Twitter 单列只回填对应键。
4. **docking 实测值**:`nb:"nb"`(nb 模式开启)、`indc:2`、`indgc:1`、`iiei:""`(日志级别空)、`funs:[]`(Tools 空)、`rebt` 空、`authUrl` 为另一 OAuth client(`268723136235-tk0vqfuv09ckn9ram2688pumj4amirou…`,与插件 appId 不同)、`response_type=id_token`;本次会话未下发 `bingMapsVersions`(用内置适配器)。
5. **workCount/ratedCount 跨会话持久化**复现(storage 恢复机制实锤)。

### 11.3 遗留未验证

- `zbheunw` 异步轮询与超时分支(需构造 finishFlag=false 的慢网站)、`sdfvaohi` 日志真实触发时机、Google 登录绑定流程(需真实 OAuth 账号,不代测)、付费转化后 `im:true` 的服务端状态变化。

## 附录 · 文件清单(src/assets)

| 文件 | 职责 |
| --- | --- |
| `manifest.json` | MV3 清单(§2.1) |
| `service-worker-loader.js` → `chunk-bd7c9f87.js` | SW 入口:install 钩子、消息路由、日志上报封装 |
| `chunk-3727d89a.js` | 云端 API 层(8 端点 + token 封装,§6) |
| `chunk-a5b97b5e.js` | 脚手架 SDK:storage(bucket `by69bq5xiupbbucket`)、Pinia store/状态 getters、评分/工作量计数 |
| `chunk-a2f8d0e6.js` | 主 bundle(1.25MB):jQuery、SheetJS、pako、iView、消息封装、createIframe、downloadCSV/XLSX、rateModel、log |
| `chunk-f1caaee2.js` | Bing Maps 双版本 DOM 适配器(§4.2) |
| `chunk-f9c87a6a.js` + `content-script-loader…` | CS 入口:iframe 宿主 + 13 消息通道 + 探测/翻页 |
| `cframe.js` + `cframe.html` + `cframe.9f599b47.css` | iframe UI 应用:Header/Home/Finding/Pricing/Help/Tools(主循环、解析、增强调度在此) |
| `chunk-6f91f252.js` / `chunk-b3cdbad1.js` | popup 入口 / modulepreload polyfill |
| `img/`、`csv.png`、`xlsx.png`、`member.png`、`payDes.jpg`、`ionicons.*` | 图标与内置素材 |
