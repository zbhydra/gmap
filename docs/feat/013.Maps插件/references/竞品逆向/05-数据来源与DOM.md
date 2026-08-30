# 05 · 数据来源与 DOM —— "DOM 是什么,怎么来的"

这是本次调研最重要的一问。**答案:插件的商家数据根本不来自页面 DOM。**

## 5.1 真正的数据源:Google Maps 内部 RPC 响应

Google Maps 是 SPA,列表页加载/滚动时,页面自己会向 `https://www.google.com/search?tbm=map&…` 发 XHR,响应体是一段**序列化数组文本**(内部 RPC 格式,形如 `)]}'` 前缀 + 长度行 + JSON 数组行 + `/*""*/` 尾哨兵)。这个数组树就是 Google 前端自己渲染列表用的数据。

插件的做法:
1. **injected.js**(注入页面主世界)hook `XMLHttpRequest.prototype`,在 progress 事件截获完整响应文本
2. 通过 `CustomEvent("load_api_complete", {detail:{str,…}})` 跨世界递给 contentScript
3. contentScript 剥壳(`slice(0,-6)` → `JSON.parse().d` → `substr(4)` → 再 parse)得到数组树
4. **按下标硬编码取值**(`a[11]`=名称、`a[9][2]`=纬度、`a[178][0][0]`=电话……)

所以"DOM"的准确说法是:**一棵 JSON 数组树,树节点的位置(下标路径)就是插件的"选择器"**。这也解释了:
- 为什么没有 Google Maps 的 CSS 类名选择器(Google 的类名是混淆的、不稳定的)
- 为什么代码里有 `_parseV1`/`_parseV2` 两套下标(Google 改版,倒数第 8 位从数组变成对象,插件做了兼容)
- 这种方式比 DOM 抓取更快(不等渲染)、更结构化(原始数据无截断),但 Google 改下标就断

下标全表见 03 文档 3.1 节;容错取值函数:

```js
getValues(obj, i1, i2, …) { // 逐层下钻,任何一层 falsy 即返回 undefined,不抛错
  for (…) { try { obj = obj[k] ? obj[k] : undefined } catch { return } }
  return obj;
}
```

## 5.2 例外:评论的 HTML 回退解析器

rsScript 里 `_txtToJson` 是**唯一的 DOM 解析路径**:当评论 RPC 响应是 HTML 形态时,抠出 `<div>…</div>` 交给 jQuery,用选择器 `.gws-localreviews__google-review`、`span[role="img"][aria-label]`、`.review-full-text`、`[data-orc="lororc"]`、`g-scrolling-carousel`、`[data-next-page-token]` 逐条取值。主路径 `txtToJson` 仍是数组下标解析。

## 5.3 插件自己操作的真实页面 DOM(全部清单)

插件对 Google 页面的 DOM 操作只用于**控制流与 UI**,不用于取商家数据:

### contentScript(Maps 页)

| 操作 | 代码位置(方法) | 目的 |
| --- | --- | --- |
| `$("[role=main]")` 存在性检测 | initUI | 确认 Maps 已渲染,再挂 UI |
| `$("body").append($("#map_scraper 面板 HTML"))` | updateUI | 自己的采集面板(固定定位,left 501px / right 20px 可切换) |
| `$("div[role=search]").find("form").first().parent().find("button").first().trigger("click")` | start() | **重放搜索**(触发 Maps 重新发 XHR) |
| `$("#searchboxinput").val()` | start/formatExtractData | 读搜索框关键词(唯一读取页面数据的 DOM 点) |
| `$("div[role=feed]")` + `animate(scrollTop→scrollHeight)` | scrollToNext | 滚动结果列表触发加载更多;末尾子 div 有文案 = 到底 |
| `div[role=main] > div:last-child` 列表容器 + scrollTop 500 步进 | scrollPlaceListToNext | place 列表模式滚动 |
| `div[role=main]` 子项前插 "Extract" 按钮 | updatePlaceListUI | Google 搜索侧栏列表模式加按钮 |
| `button[jsaction="pane.paginationSection.nextPage"]` | next() | 翻页按钮触发点击(辅助路径) |
| `button[role="checkbox"][aria-checked]` | observeCheckbox | 检测/关闭"结果随地图移动"开关(drag 模式) |
| `#_scrape_btn` 等 10+ 个自己面板按钮的委托点击 | constructor | 面板交互(Start/Pause/Export/Reset/Upgrade/左右移) |
| `<script src=injected.js>` 注入 head | 文件尾 setTimeout | 进入页面主世界 hook XHR |

### rsScript(评论页)

| 操作 | 目的 |
| --- | --- |
| `$("img[src*=no_reviews]")` | 判定 0 评论页 |
| `$("body").prepend("#_rs_msg 面板")` | 顶部进度条 UI |
| `$("title").text()` | 导出文件名 |
| `_txtToJson` 里的 `.gws-localreviews__google-review` 等 | HTML 回退解析(见 5.2) |

### photos scraper(照片页)

| 操作 | 目的 |
| --- | --- |
| `$("script")` 遍历找 `window.WIZ_global_data` → `SNlM0e` | 抠 XSRF AT token(POST 照片 RPC 必需) |
| `$("div[data-feature-id]").getAttribute("data-feature-id")` | 拿 lrd |
| `$(document).attr("title").split(" - ")[0]` | 文件名 |
| `$("body").prepend("#_ps_msg")` | 进度 UI |

## 5.4 为什么这样设计(与 DOM 爬虫对比)

| 维度 | DOM 爬虫 | 本插件(RPC 拦截) |
| --- | --- | --- |
| 数据完整性 | 受渲染截断(长简介折叠等) | 原始字段全量 |
| 字段丰富度 | 类名混淆难取全 | 36+ 字段直读 |
| 性能 | 等渲染 + 逐节点查询 | progress 即截获,零渲染等待 |
| 脆弱点 | Google 改类名/布局 | Google 改响应下标(V1/V2 兼容即痕迹) |
| 检测面 | 滚动行为相同 | 相同(滚动拟人是主要流量特征) |

## 5.5 与本仓库 extension 的可借鉴点(供 hydra 参考)

- `getValues` 安全下钻 + 双版本解析兼容,是解析 Google 内部数组的标准姿势
- XHR progress 截获 + 尾哨兵判断完整性,比 load 事件更早拿到数据
- BigInt(hex→dec) 生成 cid 短链、placeId/fid/kgmid 三种 ID 体系的换算
- 滚动调度器(随机间隔 + 到底检测 + 卡死看门狗)的参数化设计
- 但注意:走 intercepted 内部接口的合规风险、下标随 Google 改版漂移的维护成本,都应体现在我们自己的技术选型里
