# 002 · 扩展端 Instagram 本地下载

> 本文记录 Chrome MV3 插件在 `www.instagram.com` 内已经落地的实现、边界和验证合同。阶段执行记录见 `@plans/008.*` 至 `@plans/018.*`；未完成的真实环境验证会明确标为未验证。
>
> 关联：
>
> - 平台差异矩阵：`@tech-站点适配.md`
> - 插件工程规范：`@../../references/specs/spec-extension.md`
> - 客户端测试规范：`@../../references/specs/spec-test-client.md`
> - 插件 RPC：`@../000.架构/tech-插件RPC.md`
> - 既有调研：`@../../research/Instagram插件端集成调研.md`

## 1. 结论

Instagram 插件端采用当前页面内存模型：

`PageContext -> 页面专属 Scanner -> routeMediaStore Map -> parser/resolver -> buttons/Popup -> downloadOne/downloadMany -> 页面单例 FIFO -> fixed EventRpc`

Popup 只向当前标签页查询这份 Map 的可展示资源。单项和批量入口都把任务加入同一个页面 FIFO,唯一 worker 按入队顺序执行,不建立站点专属批量流程。

核心边界：

- DOM 只识别页面、内容身份、当前媒体和按钮挂载位置，不把缩略图、poster、CSS 背景图或 blob URL 当作主下载资源。
- Resolver 只在浏览器本地解析 Instagram 原媒体，不调用本项目后端。
- 当前路由 Map 只保存已经解析成功的资源；SPA 导航可替换这份 Map,页面刷新会销毁资源与下载队列。关闭 Popup 不清理当前 document 的资源或未完成任务。
- 同一 canonical 资源在当前页面未完成列表中复用共享任务；任务移除后再次点击才创建新任务。完整状态合同见 `@tech-扩展端TG扫描.md` 的下载行为章节。
- 额度不足只跳过当前资源；额度接口超时、额度 RPC 失败或额度服务异常时继续下载，相当于赠送该次额度。
- 单项失败只记录详细错误，不退款、不补偿，也不阻断批量中的后续资源。
- 新代码不使用依赖注入。Instagram 入口直接组合具体模块。
- Home、详情、Reels、Grid、Story/Highlight 分别由独立页面适配器确认实体和当前项；共享模块不读取页面路由或页面专属分页状态。

## 2. 产品范围

### 2.1 支持页面

| 页面 | 行为 |
| --- | --- |
| Home Feed | 媒体层下载当前项；存在 action 锚点时操作区下载全部 |
| Post 详情/弹窗 | 媒体层下载当前轮播项；存在 action 锚点时操作区下载整帖 |
| Reel 详情/弹窗 | 媒体层下载当前视频；存在 action 锚点时操作区下载视频，页面菜单可单独下载封面 |
| Reels 流 | 当前 Reel 提供媒体层入口；存在 action 锚点时提供操作区入口 |
| Profile Grid/Profile Reels | 卡片按钮按 shortcode 解析并直接下载原媒体 |
| Explore/Search/Hashtag | 卡片按钮复用 Grid 直接下载流程 |
| Story | 只下载当前正在观看的媒体 |
| Highlight | 只下载当前正在观看的媒体 |
| 未识别页面 | 不扫描整页、不注入按钮、不进入 Popup 列表 |

### 2.2 支持媒体

- Post 单图、单视频。
- Carousel 纯图片、纯视频或图片/视频混合内容。
- Reel MP4 原媒体。
- Story/Highlight 当前图片或视频。
- Reel 封面图，仅作为页面菜单中的独立下载项。

### 2.3 不包含

- Instagram Live、私信媒体、Notes、头像下载。
- 音轨提取、转码、音视频合并、HLS 分片合并。
- 自动遍历整个账号、搜索结果、话题或无限列表。
- 后端解析 fallback、Cookie 上传、媒体 URL 上传。
- 固定 Meta 私有 GraphQL `doc_id` 或依赖未公开请求形状的主链路。
- 跨刷新保存媒体列表或下载状态。
- Threads/Vimeo 验证与启用。

## 3. 用户交互

### 3.1 Post/Reel 按钮

Post/Reel 的当前项入口与原生操作区解耦：

- 识别到归属明确的当前媒体 surface 时，媒体层按钮始终下载当前显示项，不要求页面同时存在原生 action row。
- 找到当前内容的原生 action row 时，操作区按钮下载该内容的全部主媒体；找不到可验证的 action 锚点时只省略该按钮，不影响媒体层按钮。
- 单资源内容同时存在两个入口时结果相同，不根据资源数量隐藏入口。

Carousel 切换后，媒体层按钮读取当前绝对序号；操作区按钮仍读取整帖资源。Home 从同一 article pagination 的活动 step 读取序号，详情页从 URL 或 dialog PageContext 的 `img_index` 读取序号。虚拟化 DOM 只用于选择经过 viewport 与 overflow 裁剪后真正可见的媒体节点，不能用当前窗口内的相对 DOM 序号覆盖上述绝对序号；头像、评论小图等非正文媒体不参与节点选择。

Home 图片/视频、Post 详情及 Carousel、Reel/Reels Feed、Story/Highlight 都有当前项入口；Profile/Explore/Search/Hashtag Grid 保留适用于卡片的直接下载入口。媒体层和 Grid 按钮常显，不依赖 hover：图片当前项和 Grid 按钮距媒体底部 10px，视频当前项按钮距底部 60px，相对图片位置向上避让 50px，不遮挡 Instagram 右下角声音开关。进度文案不改变媒体 surface 尺寸。

点击同步显示 `…`；任务轮到执行并拿到有效响应长度后,按实际读取字节显示 0..99，浏览器保存动作触发后显示 100，随后恢复为下载图标；失败或解析不到资源也直接恢复。按钮不因已有下载调用而禁用；重复点击复用同一未完成任务，并只展示最近一次点击的短命 UI。

### 3.2 Reel 封面

- Reel 主入口只下载视频。
- “下载封面”只存在于 Reel 页面操作菜单。
- 封面不进入 Popup，也不进入任何“下载全部”。
- 用户点击“下载封面”时调用同一个 `downloadOne`，照常扣除一个资源额度。
- 视频缺失时不能用封面替代视频。

### 3.3 Profile/Grid 直接下载

Grid 卡片从 permalink 取得 shortcode，点击后不跳转详情页：

1. 查询当前页面 Map。
2. 已有该 entity 的原媒体时直接下载；否则依次查询 MAIN capture 与当前 document embedded JSON。
3. 本地来源未命中时，MAIN world 只从目标 tile 的 React props 返回与 shortcode 属于同一结构化媒体对象的数值 pk；content 使用当前 Instagram 登录态请求同源 media-info 接口并解析原媒体。
4. pk 不存在、冲突或 media-info 未命中时，再请求对应 permalink 作为最后来源。
5. 单图和 Reel 调用一次 `downloadOne`；Carousel 把解析成功的有序资源一次性交给 `downloadMany` 入队。
6. 某项解析失败时打印该项错误并继续其他项，不下载卡片缩略图。

Grid 卡片的进度只覆盖该卡片按钮；批量时显示当前项序号和当前资源进度。它不改变“不导航详情页”的合同。

### 3.4 Story/Highlight

- 页面只显示一个当前项下载按钮。
- 路由包含精确 media ID 时直接使用该 ID。
- 路由只有 owner 或 Highlight 身份时，只使用当前活动页面数据中能够明确对应的 media ID。当前大图、视频实际 URL 或 poster 上的 `ig_cache_key` 可以作为精确身份：仅接受 Instagram CDN URL，base64 解码结果必须为纯数字。
- 当前媒体使用 blob URL 且 DOM 没有身份时，MAIN world 对当前 viewer 媒体的 React props 做有界读取，只接受唯一的十进制 media ID，并把结果标记回同一个媒体节点供 Scanner 复核。
- `ig_cache_key` 只用于确认 media ID，不能作为下载 URL；原媒体仍必须来自结构化数据解析。
- 小头像、工具图标、相邻预加载项和多份冲突身份都不能作为当前 Story。
- 无法确认当前 media ID 时不下载，不按用户名、数组第一项、资源数量或分辨率猜测。
- 当前项改变后重新扫描并绑定新 media ID。此前已经发起的调用不影响新按钮。

### 3.5 Popup

- 在 Instagram 页面打开 Popup 时保持当前标签页，不跳转 Telegram。
- Popup 打开时记录当前 tab ID，并向该 tab 的 content 查询一次资源列表。
- Detail、弹窗、Story 和 Highlight 只返回当前活动实体；集合页返回当前页面 Map 中已解析成功的主媒体。
- 资源使用 Map 插入顺序，实体内部使用媒体原始顺序。
- Popup 不展示缩略图、解析失败项或 Reel 封面。
- “下载全部”按当前列表顺序一次性加入共享 FIFO，不显示数量确认；content 完成当前路由资源回查和入队后立即响应 Popup，不等待后台任务终态。
- “刷新”只重新向当前 tab 查询并替换列表；查询失败时记录错误，用户可以再次刷新或重新打开 Popup。
- Popup 不订阅页面资源事件,资源在打开期间变化时允许列表暂时陈旧；下载状态单独订阅版本化队列快照,关闭再打开可从同一 content 页面恢复未完成任务。
- Instagram 隐藏“清理缓存”；Telegram 保持原有行为。

## 4. 页面上下文与当前路由数据

### 4.1 `PageContext`

页面上下文使用显式联合类型：

- `home-feed`
- `post-detail`
- `reel-detail`
- `reels-feed`
- `profile-grid`
- `profile-reels`
- `explore-grid`
- `search-grid`
- `hashtag-grid`
- `story`
- `highlight`
- `unsupported`

每个支持的上下文只保存当前扫描需要的路由身份、页面类型、活动实体和当前媒体序号。Post/Reel dialog 存在时，只有匹配当前内容的 permalink 与正文尺寸媒体共同证明归属后，才把该 dialog 作为当前上下文；关闭后重新扫描底层页面。未知路由只能得到 `unsupported`。

content 在 reconcile 时重新读取 `location` 与当前 dialog。页面 key 使用规范化路由身份，不包含 `img_index` 等当前媒体参数。页面 key 改变时直接创建新的空 Map，旧 Map 不再使用。全页刷新由浏览器自然销毁 content 内存。

### 4.2 当前路由 Map

当前路由唯一媒体数据为：

`Map<entityKey, MediaResource[]>`

规则：

- Post/Reel 的 entity key 使用 shortcode；`/p`、`/reel`、`/reels` 只是路由形式，不产生不同 key。
- Story/Highlight 的 entity key 使用精确 media ID，owner username 不能作为可下载实体身份。
- 数组只保存已经解析成功的主媒体，并保持 Carousel 原始顺序。
- 同一 entity 获得新的成功解析结果时，直接替换整个数组。
- 数据源不完整时保存成功项并打印失败项，不创建空槽位或失败占位。
- 集合页已解析实体可保留到当前页面 key 改变；顺序直接使用 Map 插入顺序。
- Reel 封面不进入该 Map，点击菜单时单独解析并直接下载。

`MediaResource` 继续使用共享边界类型。Instagram 只填写下载所需的资源身份、媒体类型、原始 URL、文件名和站点来源字段，不引入 Telegram 的 chat/message 业务语义。

## 5. 原媒体解析

### 5.1 数据来源

按可用性使用以下本地来源：

1. MAIN 捕获的当前页面 fetch/XHR 结构化媒体数据，由 content 按 entity 主动查询。
2. 当前 document 的 embedded JSON。
3. Grid tile 的 React shortcode/pk 身份映射；MAIN 只返回 pk，content 使用公开 Web App ID 请求同源 `/api/v1/media/{pk}/info/` 结构化 JSON。
4. 用户点击后，由 content 使用当前登录态请求同源 Post/Reel permalink 作为最后来源。
5. DOM 只提供 shortcode、media ID、当前序号和挂载位置；React 身份桥也不返回媒体 URL。

MAIN world 捕获只保留当前 document 业务需要的结构化字段，不保存整份响应正文。content 需要 entity 时通过与下载相同的固定 EventRpc 通道调用 `getCapturedMedia`；Story 与 Grid 身份分别通过只返回单个 ID/pk 的查询能力读取，MAIN 不主动发送 observation 事件。content 不读取、序列化或转发 Cookie 值。

任何来源成功解析出一个 entity 后，直接生成有序 `MediaResource[]` 并写入当前 Map。多个来源先后到达时，后一次成功结果可以直接覆盖前一次；不为偶发覆盖错误增加额外协调逻辑。

### 5.2 候选选择

- 图片从 `image_versions2.candidates` 中选择有效宽高面积最大的 HTTPS 原图。
- 视频从 `video_versions` 中选择有效 MP4，优先更高分辨率和带宽。
- Carousel 读取 `carousel_media[]`，逐项解析并保持原顺序。
- URL 和最终 redirect 必须使用 HTTPS，host 后缀必须命中 `.cdninstagram.com` 或 `.fbcdn.net`。
- MIME 必须与媒体类型一致；Reel 视频不能被图片 poster 或 cover 替代。
- DOM 的 `img.src/currentSrc/srcset`、CSS `background-image`、`video.poster`、`blob:` 和 `data:` 不生成主下载资源。

### 5.3 按需解析

每次需要但 Map 中没有 entity 时，Resolver 按 `capture -> embedded -> media-info -> permalink` 查询。media-info 只用于 Post/Reel 且必须满足同源 HTTPS、成功状态和 JSON MIME；响应仍按目标 shortcode 二次确认。任一来源成功就替换该 entity 的资源数组；全部来源失败才以完整 source 列表结束本次操作。

异步身份、media-info 或 permalink 返回后必须重新确认页面 key；Story/Highlight 还必须重新确认当前精确 media ID。页面已变化时直接丢弃结果，不写入当前 Map。

代码不自动循环请求。用户再次点击就是一次新的独立尝试。两个点击同时到达时允许各自解析、扣额和下载。

## 6. DOM Scanner 与按钮

`scanner/index.ts` 只根据 `PageContext` 分发一次，不包含页面 DOM 条件。页面适配器分别负责：

- `homeFeed.ts`：Feed article、canonical permalink、同帖 pagination 当前序号。
- `detail.ts`：Post/Reel 详情或 dialog、匹配 permalink、URL/dialog 当前序号。
- `reelsFeed.ts`：当前 viewport 中唯一活动 Reel，拒绝混合实体根和相邻预加载项。
- `grid.ts`：Profile/Explore/Search/Hashtag permalink tile。
- `story.ts`：当前 viewer 大媒体和唯一精确 media ID。

页面适配器共同使用的模块只负责：

- `domGeometry.ts`：viewport、overflow 裁剪和基础可见性；`html/body` 的滚动根不作为普通裁剪盒。
- `mediaSelection.ts`：在适配器已确认的实体边界与绝对序号内选择媒体节点。
- `postAnchors.ts` 与 `postSurface.ts`：媒体层、action、封面菜单锚点和统一输出合同。

Scanner 整体只识别：

- 当前 `PageContext`。
- canonical permalink、shortcode 或精确 media ID。
- 当前 Carousel 序号。
- Feed article、详情边界或 dialog、Reel、Grid tile、Story 等明确的挂载边界。

归属规则：

- Feed surface 必须位于包含 canonical permalink 的帖子容器；Home permalink 不随轮播变化，绝对序号只接受同帖 pagination 的活动 step。
- 详情页不要求存在 `article`。Scanner 从匹配当前 shortcode 的 permalink 向上查找，以同时包含该 permalink 与正文尺寸媒体的内容祖先证明当前帖归属；原生 action row 只是“下载全部”的可选挂载锚点，不参与归属判定。更高层的 related grid 不进入当前帖边界，评论头像等小图不能让更小祖先提前命中。
- 详情 Carousel 的绝对序号来自 URL/dialog PageContext；Home Carousel 的绝对序号来自 pagination。两者都只用裁剪后的可见面积选择当前 DOM 节点。
- Reels 流只认当前活动 Reel，不绑定相邻预加载项；候选根同时出现不同 Post/Reel permalink 时拒绝归属。
- Grid tile 必须有可验证的 `/p/{shortcode}` 或 `/reel(s)/{shortcode}` 链接。
- Story/Highlight 先排除头像尺寸候选，再从当前大媒体的显式属性、`ig_cache_key` 或 MAIN 标记的 React 身份取得唯一精确 media ID；证据冲突时不注入按钮。
- 视频 permalink 无论使用 `/p/` 还是 `/reel(s)/`，当前项按钮都挂到媒体分支与原生全屏交互层的最近共同舞台，确保按钮位于点击层之后并继续避让声音控件。
- 无法证明归属时不注入按钮，不扫描整个 `main` 猜测资源。

`ensureButton` 对每个目标容器查询插件自己的 DOM marker：不存在时创建，存在时更新当前点击参数。容器被 Instagram 删除时，按钮随容器自然删除；下一次扫描再为新容器创建。该规则只避免同一容器出现多个按钮，不限制用户重复点击。

Scanner 不构造下载 URL，不执行额度或下载，也不维护资源状态。

按钮 renderer 只保存当前 document 内最近一次点击的短命显示。reconcile 创建、移动或复用按钮后重新渲染该显示，避免 Instagram DOM 更新让下载中的百分比消失；它不保存下载业务状态，也不阻止新点击。

## 7. 单项下载与批量下载

### 7.1 `downloadOne`

每个资源独立执行以下语言无关流程：

```text
尝试扣除 1 个资源额度
如果服务明确返回额度不足：结束当前项
如果额度调用超时、额度 RPC 失败或额度服务异常：记录错误并继续

调用一次完整的 downloadMedia 请求
结束当前项
```

规则：

- 每次调用都重新扣除额度，不检查该资源是否正在下载或曾经下载。
- 额度异常时继续下载是既有 fail-open 规则，不需要补记欠费。
- 媒体解析尚未得到资源时不调用 `downloadOne`。
- 下载调用发出后，无论最终成功或失败都不退款。
- 调用失败后不自动重试；用户再次点击会重新扣额并重新下载。

### 7.2 批量

批量下载只执行：

```text
for each resource in resources:
    try downloadOne(resource)
    if failed: record detailed error and continue
```

`downloadOne` 负责当前资源的额度和下载；批量只负责捕获当前项错误并继续。单项按钮调用方同样只需记录错误并恢复为可再次点击。批量不预先计算总额度，不要求全部资源同时成功，也不返回复杂的逐项受理映射。

Instagram 的任意批量都不显示确认。Telegram 若有站点特定确认，应在进入同一循环前完成，不能把确认放进额度扣除之后。

### 7.3 页面进度

页面按钮复用共享 `downloadProgress` DOM 事件：

- 点击同步进入 `…`，Resolver 和额度等待期间已经有反馈。
- 已知有效 `Content-Length` 时，读取前报告 0，分块读取按向下取整显示 0-99；浏览器保存动作触发后才报告 100。
- 长度未知时保持 `…`，保存动作触发后直接报告 100。
- 批量入口显示 `当前项/总项数 + 当前资源进度`；单项失败后由共享 FIFO worker 继续后续项。
- fetch、redirect、MIME 或保存失败不伪造 100，调用结束直接恢复图标。

content 只接受本次已解析资源 ID 的有限数值或 `null` 进度。事件只改按钮文案和 FIFO 首项的 Popup 展示进度,不参与额度、下载完成判定、重试、排重、取消或权限操作。按钮始终可点；重复点击由共享 Manager 复用未完成任务，旧 UI 会话结束时不能清掉较新的显示。

## 8. EventRpc 边界

DOM `CustomEvent` 对宿主页面可观察、可伪造、可干扰。该风险在普通插件场景中接受，EventRpc 不承担页面身份认证。

协议保持简单：

- content 与 MAIN world 使用一个固定 event channel 传递 request-response frame。
- 下载只暴露一个完整的 `downloadMedia(request) -> response` 调用；一次调用完成媒体请求、必要处理和浏览器下载触发。
- 不把下载拆成 start、outcome、cancel 等多段业务协议；`downloadProgress` 是单向、短命、仅用于页面文案的共享 UI 事件，不改变完整 request-response 下载合同。
- 入口执行基础 schema、payload 大小和 method allowlist 校验。
- 站点 provider 校验 URL host、redirect、MIME 和允许的媒体类型。
- 捕获或解析能力只返回规定的结构化字段，不接受任意方法名、任意 URL 或任意后端请求。
- React 身份能力只允许返回当前 Story 的唯一 media ID，或目标 Grid shortcode 对应的唯一数值 pk；媒体 URL、Cookie 和任意 React props 不跨 EventRpc。
- MAIN world 不接触额度、Chrome 扩展 API、storage、后端 token 或本项目后端权限。
- 额度和站点业务编排留在 content/background。
- 固定 channel 只是通信命名，不是 secret，也不宣称能够阻止页面监听或伪造。

EventRpc 请求失败时记录详细错误并结束当前下载。用户再次点击即可，不恢复此前调用。

## 9. 平台发布注册表

平台发布状态、Popup host 识别和测试期望以 `extension/src/platforms/registry.ts` 的 `PLATFORM_REGISTRY[*].releaseStatus` 为唯一来源；`extension/vite.config.ts` 的 `webExtension({ manifest })` 配置只把 enabled 平台展开为 content scripts、host permissions 和 web accessible resources。Popup 识别使用同一发布状态过滤。

## 10. 实际文件责任

```text
extension/src/
├── platforms/
│   └── registry.ts                 # 平台发布纯数据
├── sites/instagram/
│   ├── content/
│   │   ├── index.ts                # PageContext、扫描、解析、按钮与下载编排
│   │   ├── pageContext.ts          # 当前页面和活动实体识别
│   │   ├── routeMediaStore.ts      # 当前页面 Map 与简单查询
│   │   ├── resolver.ts             # capture、embedded、media-info 与 permalink 解析
│   │   ├── scanner/
│   │   │   ├── index.ts            # 按 PageContext 分发页面适配器
│   │   │   ├── homeFeed.ts         # Home article、pagination 与当前媒体
│   │   │   ├── detail.ts           # Post/Reel 详情和 dialog
│   │   │   ├── reelsFeed.ts        # Reels 连续流当前项
│   │   │   ├── grid.ts             # Profile/Explore/Search/Hashtag tile
│   │   │   ├── story.ts            # Story/Highlight 当前 media ID
│   │   │   ├── domGeometry.ts      # viewport 与 overflow 裁剪
│   │   │   ├── mediaSelection.ts   # 已确认边界内的媒体节点选择
│   │   │   ├── postAnchors.ts      # media/action/menu 按钮锚点
│   │   │   └── types.ts            # Scanner 输出合同
│   │   ├── buttons.ts              # ensureButton 与点击流程
│   │   └── popupMessageHandler.ts  # Popup 当前 tab 查询与按 ID 下载
│   ├── injected/
│   │   ├── index.ts                # 当前站点固定 EventRpc handlers
│   │   ├── networkCapture.ts       # 页面网络字段捕获
│   │   ├── reactIdentity.ts         # Story media ID 与 Grid shortcode/pk 身份桥
│   │   └── download.ts             # URL、redirect、MIME 校验与文件触发
│   ├── media.ts                    # 候选选择和 MediaResource 构造
│   └── shared.ts                   # 路由、CDN host 与文件名共享规则
├── core/content/download/
│   ├── download.ts                 # downloadOne/downloadMany 共享入队入口
│   └── downloadManager.ts          # 页面单例 FIFO、任务快照与唯一 worker
├── content/rpc/
│   └── injectedClient.ts           # 唯一具体 Injected client
└── popup/
    └── stores/resourceStore.ts     # 当前 tab 的资源数组
```

这些文件就是当前生产路径。旧 `domMedia.ts`、Instagram `ResourceBuffer`、平行 message handler 和站点事件文件已删除；没有兼容 wrapper、service locator 或构造器依赖。

## 11. 验证策略

### 11.1 Unit

- PageContext 覆盖支持路由、保留路径和 unsupported。
- 图片、视频、Carousel、Reel cover 的候选选择与原始顺序正确。
- DOM thumbnail、poster、CSS 背景图和 blob/data URL 不能生成主资源。
- 当前页面 key 改变时使用新的空 Map。
- `downloadOne` 在额度成功时下载一次。
- `downloadOne` 在明确额度不足时不下载当前项。
- 额度超时、额度 RPC 失败和额度服务异常时仍下载一次。
- 下载失败打印错误且不触发退款。
- 同一资源调用两次时扣额两次、下载两次。
- 批量按顺序调用单项；中间项失败后继续后续项。

### 11.2 Integration

- Feed、详情、Reels、Grid、Story/Highlight 只在归属明确的容器插入按钮。
- Post/Reel 的正文媒体 surface 始终存在“当前项”；存在可验证的原生 action row 时再提供“全部”，缺少 action 锚点只省略“全部”。
- Profile/Explore/Search/Hashtag 卡片按 shortcode 解析原媒体，不导航、不下载缩略图。
- Story/Highlight 切换后按钮读取当前 media ID；blob 媒体可从唯一 React 身份完成 DOM 标记，无关账号 pk 和冲突 ID 被拒绝。
- Grid React 身份只接受同一结构化媒体对象内匹配 shortcode 的 pk；账号、音轨 pk 被忽略，同一 shortcode 的冲突 pk 被拒绝。
- Grid media-info 成功、失败回落 permalink 和页面切换后丢弃异步结果均有确定性覆盖。
- 无 `article` 的详情页以匹配 permalink 与正文尺寸媒体共同界定当前帖，related grid 不进入当前帖；action row 只作为“全部”的可选锚点。
- Home pagination 切换后按钮移动到新可见媒体并更新绝对序号；滚动根不能让非首屏图片或视频被误判为零面积。
- 详情 Carousel 在虚拟化 DOM 窗口变化后仍保留 URL/dialog 绝对序号，头像和评论小图不参与当前节点选择。
- Reels 候选根混入其他 Post/Reel permalink 时拒绝归属。
- owner-only Story 可从当前大媒体 `ig_cache_key` 确认 ID，小头像和无精确证据页面不产生按钮。
- Home 图片和视频都有常显当前项按钮；图片/Grid 距底 10px，视频距底 60px。
- 点击立即显示 `…`，已知长度显示百分比，批量显示当前项序号；reconcile 后进度保留，结束或失败恢复，重复点击不禁用。
- Popup 查询当前 tab，只显示主媒体，不含 Reel cover。
- Popup 刷新重新查询列表；关闭重开不要求保留旧 UI 状态。

### 11.3 真实固定流程

真实 Instagram 使用专用持久化 profile，固定验证滚动后的 Home 视频 current/all、Home 图片轮播切换前后 current、从 Home 点击 Story 后连续两张、指定 Post/Reel current/all、详情 Carousel 第 4 项切第 5 项，以及 twilight Profile/Profile Reels 全部 Grid 按钮。Home 当前图片还要用 CDN `ig_cache_key` 解出的 media ID 证明下载内容与屏幕当前图一致。按钮必须属于正确 entity 和 DOM 锚点；每个入口产生的全部落盘文件都与点击后真实 CDN 响应逐字节比较。项目配额接口固定为允许，Instagram DOM、数据、媒体请求和 Chrome 下载保持真实。

5 条真实流程是否进入默认验收由 `PLATFORM_REGISTRY[*].releaseStatus` 决定，`pnpm test:e2e:instagram` 可单独运行。共享下载或 EventRpc 改动必须执行发布注册表中 enabled 平台对应的真实 E2E。确定性异常分支由 Unit/Integration 覆盖，不使用受控站点 E2E。

### 11.4 2026-07-13 Instagram 真实固定流程

- `pnpm test:e2e:instagram` 使用 Instagram 专用登录态快照和逐用例 profile 串行 5/5 通过，覆盖滚动后的 Home 视频 current/all、Home 图片轮播切换前后 current、从 Home 原生 Story tray 进入后连续两张、固定 Post/Reel current/all、详情 Carousel 第 4 项切第 5 项，以及 `twilight/` 与 `twilight/reels/` Grid。
- 每个入口都触发真实浏览器下载；落盘文件非空、后缀与 CDN MIME 一致，并与扣额后捕获的真实 Instagram CDN 响应逐字节一致；配额调用次数等于文件数。
- 真实 Profile Reels 通过 `shortcode -> React pk -> media-info` 取得原视频；Story blob 媒体通过 React media ID 标记后由 Story 页面适配器确认，没有把 React URL 或缩略图接入下载源。
- Home 视频 `/p/` permalink 使用共享视频舞台锚点，滚动进入 viewport 后 pointer hit 属于插件按钮；Home 图片轮播由 pagination 提供绝对序号，下载 CDN `ig_cache_key` media ID 与屏幕当前图一致；滚动根不再把非首屏媒体裁剪为零面积。
- Scanner 已拆为 Home、详情、Reels、Grid、Story/Highlight 页面适配器；全量 Unit/Integration 61 个文件、479 个测试通过，`pnpm check`、RPC 生成检查、fresh production build 与唯一真实 Instagram 验收入口均通过。

## 12. 阶段

| Plan | 阶段 | 可独立验证的结果 |
| --- | --- | --- |
| 008 | 发布注册表 | Threads/Vimeo 关闭，Manifest 与 Popup 识别一致 |
| 009 | PageContext 与当前页面 Map | 路由识别、页面变化直接清空 |
| 010 | Parser 与按需 Resolver | 原媒体候选、capture、embedded JSON、media-info 和 permalink 解析 |
| 011 | Post/Reel/Feed 按钮 | DOM 只定位，当前项常在、操作区按锚点提供 |
| 012 | 集合页/Grid 直接下载 | 按 shortcode 与唯一 React pk 下载原媒体 |
| 013 | Story/Highlight | 只下载 DOM 或 React 身份确认的当前 media ID |
| 014 | Popup | 当前 tab 查询、刷新和顺序下载全部 |
| 015 | 单项与批量下载 | `downloadOne`/`downloadMany` 统一进入页面单例 FIFO |
| 016 | Injected 与 EventRpc | 单个 `downloadMedia` request-response、固定 channel 和基础校验 |
| 017 | E2E 与 Canary | 真实副作用与外部兼容验证 |
| 018 | 文档和发布收口 | 删除旧路径、全量构建与发布检查 |

## 13. 最终实现合同

1. 所有支持页面都由显式 PageContext 分派，未知页面无按钮。
2. DOM thumbnail、poster、CSS 背景图和 blob URL 永远不成为主下载资源。
3. Profile/Grid 单图、Carousel 和 Reel 可不跳页直接下载原媒体。
4. Story/Highlight 只下载当前 media ID。
5. Post/Reel 当前项入口只依赖归属明确的正文媒体 surface；“全部”只在存在可验证的原生 action row 时提供，缺少 action 锚点不影响当前项。
6. 无 `article` 的真实详情由匹配当前内容的 permalink 与正文尺寸媒体共同界定，不吸收 related grid；Home Carousel 绝对序号来自同帖 pagination，详情 Carousel 绝对序号来自 URL/dialog PageContext，虚拟化 DOM 只选择当前可见节点。
7. Home、Post、Reel、Reels Feed、Story 和 Highlight 有当前项入口，Grid 有卡片直接下载入口；图片/Grid 距底 10px，视频距底 60px，按钮常显。
8. Reel 封面仅从页面菜单下载，Popup 和下载全部不包含封面；封面下载扣一个额度。
9. Popup 只查询当前 tab；资源刷新仍主动查询,下载状态实时订阅；Popup 关闭再打开可恢复同一 content 页面的未完成任务,页面刷新后不恢复。
10. 每个资源独立扣额和下载；明确额度不足只跳过该项，额度异常继续下载。
11. 批量把有序资源一次性加入页面单例 FIFO,不确认、不预检总额度，单项错误不阻断后续项。
12. 页面进度是一次点击内的短命 UI；已知长度显示字节百分比，批量显示项序号，结束后恢复，不参与业务判定。
13. 按钮不因未完成任务禁用；重复点击复用同一任务和执行轮次，只扣额并下载一次，页面按钮只展示最近一次点击的短命 UI。
14. EventRpc 使用固定 channel 和完整 `downloadMedia` request-response；权限能力只在 content/background。
15. Instagram 数据不发送到本项目后端；其他平台是否进入发布产物以 `PLATFORM_REGISTRY[*].releaseStatus` 为准。
16. 发布验收必须执行 `pnpm rpc-generate:check`、相关 unit、`pnpm check`、fresh build 和发布注册表中 enabled 平台的真实 E2E；关闭平台明确报告 skip，历史结果以 §11.4 和 Plan 017/018 为准。

## 14. 已接受风险

- Instagram DOM 或 JSON 变化会导致当前按钮缺失或解析失败，用户可以再次操作或刷新页面。
- permalink 登录墙、限流或字段缺失只影响当前点击。
- signed URL 过期可能导致下载失败，用户刷新页面后重新获取即可。
- 两次快速点击会创建两个任务,分别请求、扣额和下载。
- 同一实体的多个排队任务只展示最近一次点击的页面按钮 UI；这不会取消或合并更早的任务。
- 页面导航时迟到的解析结果可能写入已经不再读取的旧 Map，也可能被直接丢失。
- Popup 打开期间页面变化可能显示旧列表，刷新或重开即可。
- DOM 页面脚本可以观察、伪造或干扰 EventRpc，基础校验和权限隔离限制其影响范围。
- 所有上述情况都不引入额外协调、持久化或跨生命周期处理。
