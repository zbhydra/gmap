# 002 · 扩展端 Threads 本地下载

> 本文只覆盖 Chrome 插件在 `threads.com` / `threads.net` 页面内的本地下载能力。它不走 website/backend 的 Threads 解析链路,不调用 Telegram 下载链路,不把 Cookie、session、媒体 URL 发给我们的服务器。
>
> 关联:
> - 下载域平台矩阵:`@tech-站点适配.md`
> - 扩展端 X 本地下载:`@tech-扩展端X本地下载.md`
> - 插件工程规范:`@../../references/specs/spec-extension.md`
> - 调研:`@../../research/ThreadsInstagram免浏览器解析可行性调研.md`、`@../../research/code/threads-video-downloader/`
>
> 发布状态:`disabled-unverified`。实现代码保留供后续验证,当前构建不注入 Threads content/injected、不声明相关 host permission,Popup 也不识别 Threads host。下文描述保留实现的技术合同,不代表当前已发布。

## 1. 结论

Threads 保留实现采用**页面内纯前端本地下载**:

- 不申请 `chrome.downloads.download()`。
- 不新增 `downloads` permission。
- 不走后端 `parse-v2` / `download-v2`。
- 不使用 Telegram `SegmentDownloader`、Range 分片、OPFS 续传或 client_mux。
- 下载只使用 `fetch -> blob -> URL.createObjectURL -> a.download.click()`。
- 下载执行在页面 / injected 上下文,复用用户当前 Threads 页面能访问到的 CDN URL。
- 最高画质优先来自页面 `<script type="application/json">` 里的 SSR JSON,DOM 的 `currentSrc` / `video.src` / `img.src` 只做兜底。

失败处理保持简单:URL 过期、CORS 失败、页面未加载出 SSR JSON 时,提示用户重试或刷新页面,不做后端 fallback。

## 2. 范围

### 2.1 保留实现包含(启用后)

- `threads.com`、`www.threads.com`、`threads.net`、`www.threads.net` 的帖子详情页、feed 中已加载帖子、媒体详情页。
- 当前页面已加载的图片、视频、混合相册。
- 页面内单项下载按钮。
- 页面内全部下载按钮。
- Popup 中展示当前 tab 已发现的 Threads 资源,支持单项下载和全部下载。
- SPA 路由切换、无限滚动、延迟渲染后的重新扫描和去重。

### 2.2 不包含

- 后端 Threads 解析、后端代理下载、后端刷新 signed URL。
- `chrome.downloads.download()` 和 `downloads` 权限。
- Telegram `SegmentDownloader`、Range 分片、断点续传、OPFS 存储。
- HLS 分片合并。
- 主动绕过用户当前 Threads 页面看不到或加载不到的私密内容。
- 依赖 Threads className、展示文案、语言相关 aria 文案。

## 3. 权限与上下文边界

后续验证并启用时,插件只需要把 content / injected 注入到 Threads 页面:

```text
https://www.threads.com/*
https://threads.com/*
https://www.threads.net/*
https://threads.net/*
```

下载链路不需要 `downloads` permission。CDN 下载不通过 background 执行,也不需要把 CDN URL 发给 background。

职责划分:

| 上下文 | 职责 |
| --- | --- |
| content | 读取页面 SSR JSON、DOM 扫描、按钮注入、资源缓存、Popup 查询当前 tab 资源 |
| injected / page | 执行 `fetch -> blob -> objectURL -> a.click()` 下载 |
| popup | 展示当前 tab 的资源快照,把下载动作转发给页面 content/injected |
| background | 不参与 Threads 媒体下载 |

如果 content 与 injected 通信,沿用项目 EventRpc 约定;业务代码不直连裸 `chrome.runtime.sendMessage`。

## 4. DOM 已验证事实与插入点

### 4.1 不可依赖的点

Threads 当前 DOM 没有稳定的原生 `data-testid`,也不能稳定依赖 `article`。以下内容都不能作为主锚点:

- Threads 自身 `data-testid`。
- `article` 标签。
- 构建产物 className。
- 中文/英文/其他语言 `aria-label` 或可见文本。
- DOM 中的 `video.src` 一定是最高画质下载地址。

### 4.2 帖子边界

帖子边界使用结构组合识别,不是单点选择器:

```text
div[data-pressable-container="true"]
├─ a[href*="/post/"]
├─ a[href$="/media"]
└─ div[role="button"] img/video
```

识别规则:

1. 先收集 `div[data-pressable-container="true"]` 作为候选边界。
2. 候选内部必须存在 `a[href*="/post/"]`,从链接中提取 post shortcode 或 canonical post URL。
3. 媒体详情页可用 `a[href$="/media"]` 关联同一帖子。
4. 媒体节点优先通过 `a[href$="/media"]` / `a[href*="/media?"]` 关联,再用包含媒体的 `div[role="button"]` 兜底,过滤头像、图标、小缩略图。
5. DOM 兜底的大尺寸阈值为可见矩形宽高均不小于 `80px`;测试环境矩形为 0 时,允许含媒体节点的候选通过。

### 4.3 单项下载按钮

单项按钮挂在媒体可视框右下角,hover 显示。

定位算法:

1. 对每个大尺寸 `img` / `video`,向上找最近的媒体 wrapper:
   ```css
   a[href$="/media"], a[href*="/media?"], div[role="button"]
   ```
2. 给媒体 wrapper 标记:
   ```html
   data-testid="tgdl-threads-media-wrapper"
   data-tgdl-source-id="threads:{postCode}"
   data-tgdl-media-index="{0-based index}"
   ```
3. 取媒体 wrapper 的直接父容器作为定位容器。
4. 把单项下载按钮 append 到这个直接父容器中,作为媒体 wrapper 的 sibling,不要插入图片或视频标签内部。
5. 若定位容器 `position: static`,只加自有 class / style 建立定位上下文,不修改 Threads 原有 class。

按钮属性:

```html
data-testid="tgdl-threads-media-download"
data-tgdl-source-id="threads:{postCode}"
data-tgdl-media-index="{0-based index}"
```

样式口径:

- `position: absolute`,按钮尺寸 `32px`,按媒体 wrapper 与定位容器的矩形计算右下角偏移 `8px`。
- 默认 `opacity: 0`,媒体父容器 hover 时 `opacity: 1`。
- 触摸设备常驻显示。
- z-index 高于媒体内容和轮播圆点,低于 Threads 弹窗。
- 图标按钮即可,不显示可见文本,文案只放 `aria-label` 的 i18n。

### 4.4 全部下载按钮

全部下载按钮插到帖子底部 action bar 末尾。

Threads 底部 action bar 的稳定结构是:媒体下方 4 个 `role="button"` 的共同父级。定位规则:

1. 在帖子边界内,以媒体 wrapper 的 `getBoundingClientRect()` 为基准。
2. 找位于媒体下方的候选容器。
3. 候选容器内部必须存在同一行的 4 个 `role="button"`。
4. 取这 4 个按钮的最近共同父级作为 action bar。
5. 将全部下载按钮 `appendChild` 到 action bar 末尾。

按钮属性:

```html
data-testid="tgdl-threads-download-all"
data-tgdl-source-id="threads:{postCode}"
```

全部下载只下载同一 `source_id` 下当前已解析出的资源。资源为空时不显示;只有一个资源时仍可显示,但 Popup 和页面单项入口已经足够,实施时可选择隐藏。

## 5. 最高画质数据源

### 5.1 主数据源:页面 SSR JSON

优先扫描当前页面:

```css
script[type="application/json"]
```

解析方式:

1. 读取所有 JSON script。
2. 优先过滤包含当前 post shortcode 的 script,再递归 walk。
3. 用 `code` / `shortcode` / post URL 关联目标帖子。
4. 展开轮播字段。
5. 归一化成资源数组,再与 DOM wrapper 建立 `index` 对应关系。

必须识别的字段:

| 字段 | 用途 |
| --- | --- |
| `video_versions[].url` | 视频候选 URL,优先级最高 |
| `video_url` | 单视频 URL fallback |
| `image_versions2.candidates[].url` | 图片候选 URL,优先级最高 |
| `display_resources[].src` | 图片候选 fallback |
| `display_url` | 图片单 URL fallback |
| `carousel_media[]` | Threads / Meta 轮播 |
| `edge_sidecar_to_children.edges[].node` | Instagram 兼容的轮播结构 fallback |

最高画质选择:

- 图片和视频候选都按 `width * height` 最大选择。
- 候选缺宽高时,可使用节点自身 `original_width * original_height` / `display_resources` 宽高辅助排序。
- 仍无宽高时保留 JSON 顺序,取第一个可用 URL。

### 5.2 DOM 只做兜底

DOM URL 只在 SSR JSON 没有命中时使用:

- `video.currentSrc`
- `video.src`
- `img.currentSrc`
- `img.src`

DOM fallback 不能覆盖 SSR JSON 中同一 `source_id + media_index` 的资源。原因是 DOM URL 常常只是当前渲染版本或 `blob:` 播放地址,不保证最高画质。

## 6. URL 白名单

所有候选 URL 在进入资源模型前必须校验:

- 协议必须是 `https:`。
- `host` 必须以后缀 `.cdninstagram.com` 或 `.fbcdn.net` 结尾。
- `blob:`、`data:`、非 HTTPS、非 Meta CDN host 一律拒绝。
- `fetch` 后如果发生 redirect,还要对 `response.url` 再做一次同样校验。

伪代码:

```ts
function isAllowedThreadsMediaUrl(rawUrl: string): boolean {
  const url = new URL(rawUrl)
  return (
    url.protocol === 'https:' &&
    (url.hostname.endsWith('.cdninstagram.com') || url.hostname.endsWith('.fbcdn.net'))
  )
}
```

## 7. 资源模型

Threads 资源统一映射为站点无关 `MediaResource`,站点私有字段放 `metadata`。

| 字段 | 口径 |
| --- | --- |
| `id` | canonical `threads:{postCode}:{image/video}:{position}`；同一媒体在 SSR 与 DOM 来源间切换时保持不变 |
| `sourceId` | `MediaResource` 不新增 `sourceId` 字段;DOM 自有属性固定用 `data-tgdl-source-id="threads:{postCode}"` |
| `messageId` | post shortcode |
| `index` | 同一帖子内 0-based 媒体序号 |
| `type` | 图片用 `photo`,视频用 `video` |
| `url` | 通过白名单校验后的最高画质 URL |
| `sourceKind` | `threads-image-ssr-url` / `threads-video-ssr-url` / `threads-image-dom-url` / `threads-video-dom-url` |
| `filename` | `threads_{postCode}_{image/video}_{index + 1}.{ext}` |
| `thumbnail` | 图片用自身;视频优先 JSON 缩略图,否则 DOM poster / 附近图片 |
| `width` / `height` | 候选宽高或节点原始宽高 |
| `metadata` | 当前仅写入 `{ messageId: postCode }` |

DOM 与资源绑定用自有属性:

- `data-tgdl-source-id`
- `data-tgdl-media-index`

去重规则:

1. 主 key:`messageId + index`。
2. 次 key:规范化后的 URL。
3. 同 key 同类型同时存在 JSON 与 DOM 资源时,保留 `threads-*-ssr-url`。
4. 同 index 的 SSR 只给出图片封面、DOM 给出视频 URL 时,保留 DOM 视频兜底,避免把视频误降级成封面图。
5. 同一 JSON 中重复候选按 URL 去重后再选最高画质。
6. Popup 与页面按钮共用同一 tab 资源缓存,不各自维护一套解析结果。

## 8. 下载链路

唯一允许的下载方式:

```ts
async function downloadThreadsMedia(url: string, filename: string): Promise<void> {
  if (!isAllowedThreadsMediaUrl(url)) {
    throw new Error(`[ThreadsDownload] 非法媒体 URL: url=${url}`)
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`[ThreadsDownload] fetch 失败: url=${url}, status=${response.status}`)
  }

  if (!isAllowedThreadsMediaUrl(response.url)) {
    throw new Error(`[ThreadsDownload] redirect 到非白名单 URL: url=${response.url}`)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}
```

注意:

- 这段逻辑在 injected / page world 执行。
- 不经过 background。
- 不使用 `chrome.downloads.download()`。
- 不使用 Telegram `SegmentDownloader`。
- 不做 Range、分片、并发、断点续传。
- 下载失败后按钮恢复可点击,用户重试即可。

## 9. 两条入口

### 9.1 页面按钮入口

页面入口包括:

- 单项按钮:`data-testid="tgdl-threads-media-download"`。
- 全部下载按钮:`data-testid="tgdl-threads-download-all"`。

点击流程:

1. 从按钮读取 `data-tgdl-source-id` / `data-tgdl-media-index`。
2. content 按 `messageId=postCode` 与可选 `resource.id` 从 tab 资源缓存取资源。
3. 单项入口调用 `downloadOne`;全部入口把有序资源交给 `downloadMany`。
4. 两个入口都只把任务交给页面单例 FIFO；唯一 worker 在每项执行前独立扣除一个额度,再调用一次 injected `downloadMedia`,单项错误不阻断后续项。
5. 页面按钮不阻止重复点击；同一 shortcode/type/position 资源复用当前未完成任务，失败后再次点击恢复该任务，任务移除后可重新下载。共享状态合同见 `@tech-扩展端TG扫描.md` 的下载行为章节。

### 9.2 Popup 入口

当前发布状态下 Popup 不识别 Threads host。后续验证并启用时,Popup 不直接下载 CDN URL,也不调用 background 下载。

流程:

1. Popup 获取当前 active tab。
2. 启用后只在 Threads host 生效。
3. Popup 请求 content 返回当前 tab 的资源快照。
4. Popup 展示资源列表和全部下载按钮。
5. 点击后把 `resource.id` 列表发回对应 tab 的 content。
6. content 按 ID 回查资源并调用 `downloadMany` 一次性入队,每项轮到后再经 injected 完成本地 Blob 下载；Popup 顶部读取同一页面队列状态。

Popup 展示顺序:

- 当前实现展示 content 侧 tab 资源缓存快照。
- 同一帖子内资源按解析出的 `index` 顺序进入缓存;当前不承诺视口优先或按 DOM 纵向位置重排。

## 10. SPA / MutationObserver 重扫

Threads 是 SPA + 无限滚动,必须重扫。

主路径:

1. content 启动后立即扫描一次。
2. 监听 `history.pushState` / `history.replaceState` / `popstate`。
3. URL 变化时清理当前 pageKey 的资源缓存和已注入按钮,再触发重扫。
4. 对 `main` 或 `document.body` 安装 `MutationObserver`。
5. Observer 只入队,不直接扫描;使用 300ms debounce。
6. 新增 `script[type="application/json"]`、`a[href*="/post/"]`、`img`、`video` 时触发重扫。
7. 每 3 秒做一次 reconcile,用当前 DOM 快照替换资源缓存并去重。

清理:

- 路由变化后删除旧按钮并清空旧 pageKey 资源。
- 资源缓存按 `resource.id` 去重;同 id 保留 sourceRank 更高的版本。

## 11. 建议模块边界

实施时新增站点目录即可,不要把 Threads 逻辑放进 Telegram 目录:

```text
extension/src/sites/threads/
├── content/
│   ├── buttons.ts
│   ├── index.ts
│   ├── messageHandler.ts
│   ├── resourceBuffer.ts
│   ├── scanner.ts
│   └── styles/buttons.css
├── injected/
│   ├── download.ts
│   └── index.ts
├── media.ts
└── shared.ts
```

入口分发沿用站点隔离:

- `threads.com` / `threads.net` -> `sites/threads`
- `web.telegram.org` -> `sites/telegram`
- `x.com` / `twitter.com` -> `sites/x`

## 12. 验收标准

- Threads 页面内没有原生稳定 `data-testid` / `article` 时,仍能定位帖子边界。
- 能从 `script[type="application/json"]` 提取 `video_versions`、`video_url`、`image_versions2.candidates`、`display_resources`、`display_url`、`carousel_media`、`edge_sidecar_to_children`。
- 同一媒体优先使用 SSR JSON 最高画质 URL,DOM URL 只兜底。
- 非 HTTPS 或非 `.cdninstagram.com` / `.fbcdn.net` URL 被拒绝。
- 单项按钮插入到媒体 wrapper 直接父容器,作为 wrapper sibling,hover 右下角显示。
- 全部下载按钮 append 到媒体下方 4 个 `role="button"` 的共同父级末尾。
- 页面按钮带 `data-testid="tgdl-threads-media-download"` / `tgdl-threads-download-all`。
- 媒体 wrapper 带 `data-testid="tgdl-threads-media-wrapper"`。
- DOM 元素带 `data-tgdl-source-id`、`data-tgdl-media-index`。
- 启用并验证后,Popup 可展示当前 tab 已发现资源,单项/全部下载都回到页面 content 的共享下载入口执行。
- SPA 路由切换和无限滚动后不会重复注入按钮。
- manifest 不新增 `downloads` permission。
- extension 不调用 `/api/client/media/*`、`/api/client/download*`。
- extension 不使用 Telegram `SegmentDownloader`。

## 13. 风险

- Threads DOM 结构会变,所以定位只能依赖结构组合和自有标记,不能依赖 className。
- SSR JSON 字段可能漂移,提取失败时允许按钮不显示或下载失败,用户刷新重试。
- CDN signed URL 可能过期,点击前轻量 rescan 刷新一次即可;仍失败不走后端。
- 一次性 Blob 下载会占用内存,但 Threads 图片/短视频场景可接受;超大文件失败后提示用户重试。
