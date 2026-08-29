# 002 · 扩展端 Vimeo 纯前端下载

> 本文只覆盖 Chrome 插件在 `vimeo.com` / `player.vimeo.com` 页面内的本地下载能力。它不走 website/backend 的 Vimeo `yt-dlp` 链路,不调用 `parse-v2` / `download-v2`,不把 Vimeo config、Cookie、媒体 URL 发给我们的服务器。
>
> 关联:
> - 下载域平台矩阵:`@tech-站点适配.md`
> - 扩展端 X 本地下载:`@tech-扩展端X本地下载.md`
> - 扩展端 Threads 本地下载:`@tech-扩展端Threads本地下载.md`
> - 插件工程规范:`@../../references/specs/spec-extension.md`

## 1. 结论

Vimeo 扩展端可以做**纯前端下载**,并且不应该只做“首版 progressive MP4”:

- 页面按钮直接展示在视频标题区域,不等用户点击后再展开。
- Video 行展示 `Best` 与所有可下载画质。
- Audio 行展示 `Best Audio` 与所有独立音频轨。
- Image 行展示最高分辨率 thumbnail。
- Progressive MP4 有完整直链时交给 Chrome 下载管理器，不经过页面 Blob。
- DASH adaptive 有更高清版本时,前端下载视频轨 + 音频轨并在浏览器内 mux 成 MP4。
- Audio-only 直接下载最高码率音频轨,保存为 `.m4a`。
- Thumbnail 从 `config.video.thumbs` 取最高分辨率 URL。

失败处理保持简单:config 过期、CDN 403、CORS/网络失败、mux 失败时刷新 config 一次;仍失败就提示用户刷新页面重试,不做后端 fallback。

## 2. 范围

### 2.1 包含

- `https://vimeo.com/{videoId}` 视频详情页。
- `https://www.vimeo.com/{videoId}` 视频详情页。
- `https://player.vimeo.com/video/{videoId}` 嵌入播放器页。
- 当前页面已经允许用户播放的视频。
- Progressive MP4 多画质。
- DASH adaptive 多画质,含最高画质 mux。
- Audio-only 下载。
- Thumbnail 下载。
- Popup 当前 tab 资源列表与页面内按钮共用同一资源缓存。

### 2.2 不包含

- website/backend `yt-dlp` 解析。
- 后端代理下载、后端刷新 signed URL。
- 破解 DRM、Widevine、加密 HLS、OTT 内容。
- 绕过密码页、私有权限、登录墙。
- 从 `blob:` 播放地址反推完整视频文件。
- 服务器端 mux。

## 3. 权限与上下文边界

Manifest 需要把 Vimeo 页面和 CDN 都列入 host permissions。这是扩展端本地请求,不是我们的后端请求。

```text
https://vimeo.com/*
https://www.vimeo.com/*
https://player.vimeo.com/*
https://*.vimeocdn.com/*
https://*.akamaized.net/*
```

职责划分:

| 上下文 | 职责 |
| --- | --- |
| top content(`vimeo.com` / 顶层 `player.vimeo.com`) | 提取 `videoId`、通过 EventRpc 消费捕获的 config、注入按钮、维护 tab 资源缓存；按来源把直连文件分流到 background，并在页面存活时查询 Chrome 进度 |
| player-frame content(`player.vimeo.com`) | 只把 frame 内 `videoId` postMessage 给 top content 作为 identity 兜底;不传 config 或 signed URL,不启动资源缓存与下载调度 |
| injected / MAIN world | `document_start` 安装原生 config 捕获,保留完整 signed URL 与 JSON；只执行需要分片读取和 remux 的 DASH/HLS 下载,不做后端通信 |
| popup | 展示当前 tab 的 Vimeo 资源快照,触发下载并读取页面共享 FIFO 的未完成任务与进度；同一 canonical 资源的排重遵循 `@tech-扩展端TG扫描.md` 的共享下载合同 |
| background | 不负责初始资源发现；校验 Vimeo caller、descriptor、CDN/MIME 边界，必要时刷新一次 signed config，并用 `chrome.downloads` 创建或查询 Progressive/Thumbnail 任务 |

Manifest 申请 `downloads` permission。Progressive/Thumbnail 使用 `chrome.downloads.download()`，任务创建后由 Chrome 网络栈和下载管理器持有，不依赖页面或 MV3 Service Worker 持续运行；跳转、刷新或关闭来源 tab 不会取消已经创建的任务。DASH/HLS 仍使用 `fetch -> segment buffers -> remux -> objectURL -> a.click()`，因此其读取和 remux 跟随页面生命周期。adaptive mux 复用 website `client_mux` 已验证的 Mediabunny 思路,但实现位置在 extension 侧。

Vimeo content script 建议拆成独立 manifest entry,不要把现有 Telegram/X/Threads 入口整体改成 `all_frames:true`。Vimeo frame entry 只在 `player.vimeo.com/*` 内开启 identity helper。

## 4. 页面 DOM 与按钮插入点

### 4.1 已验证 DOM

Vimeo 视频详情页当前可用结构:

```text
document
└─ main
   └─ [data-testid="vd-wrapper"]
      ├─ ...播放器区域...
      ├─ h1
      └─ [data-testid="action-bar"]
```

关键选择器:

| DOM | 选择器 | 用途 |
| --- | --- | --- |
| 页面主体 | `main` | 最外层兜底容器 |
| 视频详情容器 | `main [data-testid="vd-wrapper"]` | 优先扫描范围 |
| 标题 | `main [data-testid="vd-wrapper"] h1` 或 `main h1` | 插入按钮区的上方锚点 |
| Vimeo 原生操作栏 | `main [data-testid="vd-wrapper"] [data-testid="action-bar"]` | 按钮区插入前的下方锚点 |
| Player iframe | `iframe[src*="player.vimeo.com/video/"]` | 提取 videoId 的来源之一 |
| OpenGraph player URL | `meta[property="og:video:url"]` | 提取 videoId 的首选来源 |

不要把按钮插进 Vimeo player iframe 内部;详情页按钮只挂在主页面标题区域。`video.src` 常见为 `blob:` 或分段 range URL,不作为下载地址。

### 4.2 插入算法

按钮面板插入在标题和原生 action bar 之间,也就是用户红框期望的标题操作区。

```ts
const wrapper =
  document.querySelector('main [data-testid="vd-wrapper"]') ?? document.querySelector('main')
const title = wrapper?.querySelector('h1') ?? document.querySelector('main h1')
const actionBar = wrapper?.querySelector('[data-testid="action-bar"]')
const mountParent = actionBar?.parentElement ?? title?.parentElement ?? wrapper

mountParent?.insertBefore(panel, actionBar ?? title?.nextSibling ?? null)
```

插入优先级:

1. 有 `actionBar.parentElement`: `insertBefore(panel, actionBar)`。
2. 无 action bar 但有 `h1`: `h1.insertAdjacentElement('afterend', panel)`。
3. 无标题但有 wrapper: `wrapper.prepend(panel)`。

同一 `videoId` 只保留一个面板。重扫时先找:

```css
[data-testid="tgdl-vimeo-panel"][data-tgdl-video-id="{videoId}"]
```

存在则更新按钮状态,不重复插入。

### 4.3 插件自有 DOM

页面内直接展示三行按钮:

```html
<section
  data-testid="tgdl-vimeo-panel"
  data-tgdl-video-id="{videoId}"
  data-tgdl-config-expires="{expiresAt}"
>
  <div data-testid="tgdl-vimeo-row-video" data-tgdl-kind="video">
    <span data-testid="tgdl-vimeo-row-label">Video</span>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="video" data-tgdl-choice="best">Best</button>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="video" data-tgdl-choice="{optionId}">1080p</button>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="video" data-tgdl-choice="{optionId}">720p</button>
  </div>

  <div data-testid="tgdl-vimeo-row-audio" data-tgdl-kind="audio">
    <span data-testid="tgdl-vimeo-row-label">Audio</span>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="audio" data-tgdl-choice="best-audio">Best Audio</button>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="audio" data-tgdl-choice="{optionId}">149 kbps</button>
  </div>

  <div data-testid="tgdl-vimeo-row-image" data-tgdl-kind="image">
    <span data-testid="tgdl-vimeo-row-label">Image</span>
    <button data-testid="tgdl-vimeo-option" data-tgdl-kind="image" data-tgdl-choice="best-thumbnail">Thumbnail</button>
  </div>
</section>
```

按钮属性:

| 属性 | 说明 |
| --- | --- |
| `data-testid="tgdl-vimeo-option"` | 所有下载按钮统一测试标记 |
| `data-tgdl-kind` | `video` / `audio` / `image` |
| `data-tgdl-choice` | `best` / `best-audio` / `best-thumbnail` / 具体 option id |
| `data-tgdl-source-id` | `vimeo:{videoId}:{kind}:{qualityKey}` |
| `aria-label` | i18n 文案,例如 Download Vimeo 1080p video |

样式口径:

- 面板宽度跟随标题区域,`display:flex; flex-direction:column; gap:8px`。
- 每行 `display:flex; align-items:center; flex-wrap:wrap; gap:8px`。
- 行标签宽度固定 56px,避免按钮换行时抖动。
- 按钮高度 32px,最小宽度 72px,圆角 6px。
- `Best` / `Best Audio` 使用主按钮样式;其他画质使用次按钮样式。
- 禁用态用于 config 加载中、该类型无资源、下载中。
- 点击资源后锁定同一视频面板的全部可下载按钮,阻止重复下载与重复扣额;触发按钮设置 `aria-busy=true`,面板用 `aria-busy=true` 表达整体忙碌状态。
- 能计算总字节时触发按钮显示整数百分比;缺少可信总字节时显示当前语言的 `Downloading...`;完成或失败后恢复原画质文案与可点击态。
- 按钮用不可见的本地化忙碌文案预留宽度,下载状态与百分比变化不改变按钮尺寸。

## 5. config 是什么

Vimeo `config` 是播放器启动 JSON。播放器用它取得 signed CDN URL、DASH/HLS playlist、progressive MP4、thumbnail 与过期信息。

`/video/{videoId}/config` 不是可由 `videoId` 与 `h` 重建的稳定接口。详情页原生请求还带播放器选项、上下文和 `s` 等签名参数,签名覆盖完整查询参数。删除参数、只保留 `h+s`、删除 `s`,或自行请求 `/config?h=...` 都会得到 `403`。扩展不得构造、裁剪或重新排序该 URL。

原生 config 有两种来源:

| 页面形态 | 原生来源 | 扩展处理 |
| --- | --- | --- |
| `vimeo.com/{videoId}` 详情页 | Vimeo 自己发出的完整 signed `/video/{id}/config?...&s=...` XHR/fetch | MAIN world 捕获成功 JSON 响应,保留最终响应的完整 URL；fetch 只读 clone,不消费播放器原响应 |
| 顶层 `player.vimeo.com/video/{videoId}` | 初始 HTML 内联的 `window.playerConfig = {...}` | 结构化解析内嵌 JSON,使用其中原生 signed `request.config_refresh_url`;不额外请求 `/config` |

捕获边界:

1. MAIN world 入口在 `document_start` 安装,早于播放器初始化。
2. 网络来源只接受 `player.vimeo.com`、精确 `/video/{digits}/config`、`2xx`、JSON 响应。
3. URL 中的 signed query 原样保存,日志只记录 host,不输出签名。
4. URL videoId、config `video.id` 与 content 当前 videoId 必须一致。
5. 单份响应限制 `512KiB`,每页最多保留 8 个 video config;只存在当前页面内存。
6. content 通过有界 EventRpc 读取捕获结果,不再次获取初始 config。
7. fetch/XHR 包装只 clone 并读取成功的 config 响应,不修改原请求、不拦截媒体分片,也不缓存播放器响应体。

### 5.1 videoId 身份提取顺序

1. 首选:
   ```css
   meta[property="og:video:url"]
   ```
   `content` 示例:
   ```text
   https://player.vimeo.com/video/1201819515?h=dc93ef4923
   ```
2. 其次:
   ```css
   iframe[src*="player.vimeo.com/video/"]
   ```
3. 再次:
   ```css
   link[rel="canonical"]
   ```
4. 最后从当前 URL path 提取 `/123456789`。

`videoId` 匹配 `/video/{digits}` 或 Vimeo 页面 path 中的数字段。URL query 的 `h` 只属于 Vimeo 页面身份的一部分,扩展不再用它构造 config URL。

### 5.2 config 必读字段

```json
{
  "request": {
    "files": {
      "progressive": [],
      "dash": {},
      "hls": {}
    },
    "config_refresh_url": "https://player.vimeo.com/video/{id}/config/request?...",
    "timestamp": 1783862620,
    "expires": 3600
  },
  "video": {
    "id": 1201819515,
    "title": "video title",
    "thumbs": {}
  }
}
```

字段用途:

| 字段 | 用途 |
| --- | --- |
| `request.files.progressive[]` | 完整 MP4 直链,有 `quality/width/height/fps/mime/url` |
| `request.files.dash` | DASH playlist 入口,用于最高画质 mux 与 audio-only |
| `request.files.hls` | HLS playlist 入口,无可展示 DASH video 时 fallback |
| `request.config_refresh_url` | Vimeo 原生 signed 刷新地址;config/playlist 或下载 URL 过期时最多使用一次 |
| `request.timestamp` | config 签发时间,Unix 秒 |
| `request.expires` | 相对 `timestamp` 的 TTL 秒数,不是 Unix 绝对时间 |
| `video.thumbs` | thumbnail 候选 |
| `video.title` | 文件名 |

绝对过期时间统一计算为 `expiresAt = request.timestamp + request.expires`。config 只缓存在当前 tab 内存中;到期或失败后使用原生 refresh URL 刷新一次,不持久化 signed URL。`/video/{id}/config/request` 返回的是 request 片段,字段直接位于顶层,没有完整 config 的 `request` 与 `video` 外层;解析时从已校验的 endpoint path 恢复 videoId,刷新已有快照时沿用原始标题与缩略图。

## 6. 下载地址获取

### 6.1 Progressive MP4

来源:

```text
config.request.files.progressive[]
```

典型字段:

```json
{
  "quality": "1080p",
  "width": 1920,
  "height": 1080,
  "fps": 30,
  "mime": "video/mp4",
  "url": "https://vod-progressive.akamaized.net/..."
}
```

处理规则:

- `url` 就是完整视频下载地址。
- 只接受 `https:` 且 host 命中 Vimeo CDN 白名单。
- 按 `height desc -> width desc -> fps desc -> quality desc` 排序。
- 每个 progressive 生成一个 Video 按钮。
- 同画质重复 URL 去重。

### 6.2 DASH adaptive

来源:

```text
config.request.files.dash
```

取 playlist URL:

```ts
const cdnName = dash.default_cdn
const playlistUrl = dash.cdns[cdnName].url
```

playlist JSON 典型结构:

```json
{
  "base_url": "../../../remux/avf/",
  "video": [
    {
      "id": "video-track-id",
      "base_url": "video/...",
      "mime_type": "video/mp4",
      "codecs": "avc1.64001f",
      "bitrate": 2810000,
      "width": 1280,
      "height": 720,
      "init_segment": "base64...",
      "segments": [{ "url": "segment.m4s?..." }]
    }
  ],
  "audio": [
    {
      "id": "audio-track-id",
      "base_url": "audio/...",
      "mime_type": "audio/mp4",
      "codecs": "mp4a.40.2",
      "bitrate": 149000,
      "sample_rate": 48000,
      "channels": 2,
      "init_segment": "base64...",
      "segments": [{ "url": "segment.m4s?..." }]
    }
  ]
}
```

segment 绝对 URL:

```ts
const segmentUrl = new URL(
  playlist.base_url + track.base_url + segment.url,
  playlistUrl
).href
```

处理规则:

- 每个 `video[]` 生成一个 adaptive Video 候选。
- 每个 `audio[]` 生成一个 Audio 候选。
- 建模阶段先过滤不可稳定 remux 的 track:
  - video 只接受 `mime_type=video/mp4` 且 codec 为 `avc1` / `avc3`。
  - audio 只接受 `mime_type=audio/mp4` 且 codec 为 `mp4a`。
  - `webm` / `opus` / `vp9` / `hvc1` / `hev1` / 未知 codec 不展示。
- adaptive Video 下载时必须同时选一个 audio track;默认选最高码率音频。
- 建模完成后,下载描述符保存已校验的 DASH playlist URL 与 track id;资源 `url` 表示该 playlist,不再使用 config URL 冒充资源地址。
- 用户点击后直接请求描述符中的 CDN playlist,正常下载链路不得预先请求 `/config/request`。
- playlist 或 segment 返回 `403`、`404`、`410` 时,才使用原生 `config_refresh_url` 刷新一次;刷新阶段已经解析出的 playlist 直接用于本轮重试。
- refresh 接口仍拒绝请求时结束本次下载并让用户重试,不构造签名或绕过 Vimeo 风控。
- 下载顺序:视频 init + segments、音频 init + segments、浏览器内 mux MP4。
- 若 video+audio 的 `segment.size` 均可得且合计超过 `768MiB`,该 adaptive 候选不展示;size 未知时允许展示,但下载累计字节超过 `768MiB` 立即中断并提示。
- `blob:` range 播放 URL 不参与。

### 6.3 HLS fallback

来源:

```text
config.request.files.hls
```

HLS 只做 fallback:

- 优先 DASH,因为 DASH playlist 明确给出独立 video/audio track 和 segment 列表。
- 没有可用 DASH video+audio 但有 HLS 时,只支持安全的非加密 fMP4 HLS fallback。
- 解析 master m3u8 variant 后再读取 media playlist;variant 必须声明 `avc1`/`avc3` video codec 与 `mp4a` audio codec。
- media playlist 必须无 `#EXT-X-KEY`,必须有 `#EXT-X-MAP`,不得使用 `#EXT-X-BYTERANGE`,segment 必须为 HTTPS Vimeo CDN/Akamai,且不能是 `.ts`。
- 满足上述条件时把 init + fMP4 segments 交给 Mediabunny remux 成 MP4;TS/encrypted/未知结构不展示按钮。
- Audio-only 只在 HLS 明确提供独立 audio rendition 且未加密时显示;否则不显示 HLS Audio。

### 6.4 Audio-only

Audio 行来源优先级:

1. DASH playlist `audio[]`。
2. HLS 独立 audio rendition。

DASH audio 下载:

1. 选择 `bitrate` 最高的 audio track 作为 `Best Audio`。
2. 用户也可以直接点具体码率按钮,如 `149 kbps`。
3. 下载 `init_segment` 与所有 `.m4s` segments。
4. 前端 remux/封装为 `audio/mp4`。
5. 文件名:`{safeTitle}-{bitrate}kbps.m4a`。

如果没有独立音频轨,Audio 行显示禁用态,不从 progressive MP4 里前端抽音频;那需要解封装整条视频,内存和时间都不划算。

### 6.5 Thumbnail

来源:

```text
config.video.thumbs
```

处理规则:

- 遍历 `thumbs` 里的所有 URL。
- key 是数字时按数字宽度排序,例如 `640`、`960`、`1280`。
- key 不是数字时,对 URL 去重后保留为 fallback。
- 选最大尺寸作为 `Thumbnail`。
- 文件名:`{safeTitle}-thumbnail.jpg` 或按响应 `Content-Type` 推断扩展名。

## 7. 画质展示与 Best 选择

Video 行必须直接展示所有可用选择:

```text
Video  [Best] [2160p] [1440p] [1080p] [720p] [540p] [360p]
Audio  [Best Audio] [256 kbps] [149 kbps] [105 kbps]
Image  [Thumbnail]
```

排序规则:

| 类型 | 排序 |
| --- | --- |
| progressive video | `height desc -> width desc -> fps desc` |
| adaptive video | `height desc -> width desc -> bitrate desc -> fps desc` |
| audio | `bitrate desc -> sample_rate desc -> channels desc` |
| thumbnail | `width desc` |

`Best` 选择规则:

1. progressive 与 adaptive 合并比较。
2. 先比较 `height * width`。
3. 同分辨率比较 `fps`。
4. 再比较视频 `bitrate`。
5. 如果 progressive 与 adaptive 在分辨率、fps、bitrate 上都相同,优先 progressive,因为不需要 mux、失败率更低。
6. 如果 adaptive 分辨率、fps 或 bitrate 更高,`Best` 使用 adaptive mux。

按钮标签:

- progressive:`1080p MP4`。
- adaptive:`2160p` / `1440p`。
- 同画质同时有 progressive 和 adaptive 时,progressive 显示 `1080p MP4`,adaptive 显示 `1080p HD`。
- audio:`149 kbps`。

## 8. 下载执行

### 8.1 Progressive / Thumbnail

```text
content downloadOne
-> background.startBrowserDownload(source)
-> 校验 Vimeo caller / descriptor / CDN / MIME / filename
-> chrome.downloads.download({ url, filename, conflictAction: "uniquify" })
-> 立即返回 downloadId
-> content 每 500ms 调用 getBrowserDownloadStatus(downloadId)
-> 页面离开后停止 UI 查询，Chrome 任务继续
```

边界校验:

- 创建前校验原始 URL 只能是 Vimeo HTTPS CDN，source kind、媒体类型、MIME 与 descriptor 必须一致。
- 状态查询只接受当前扩展创建的 download ID，并校验 Chrome 报告的 `finalUrl` 与响应 MIME；进行中的越界任务立即取消。
- Chrome 返回服务端授权/禁止/失败中断时，background 从原生 refresh config 只重建 Progressive/Thumbnail 列表，不加载无关 DASH/HLS playlist；恢复同一个直连选项并重建一次任务，第二次失败直接提示用户重试。
- 文件名去掉目录字符和控制字符，冲突时由 Chrome 自动 uniquify。

### 8.2 DASH video mux

执行流程:

1. 下载 video init segment。
2. 顺序下载 video segments。
3. 下载 audio init segment。
4. 顺序下载 audio segments。
5. 组成两个 `Blob`:video mp4 fragment、audio mp4 fragment。
6. 用浏览器端 mux 输出最终 MP4。
7. 用 objectURL 触发保存。
8. 已知总大小或下载累计字节超过 `768MiB` 时中断,避免前端内存不可控。

进度:

- progressive/thumbnail 在页面仍存在且 Chrome 已知 `totalBytes` 时，按 `bytesReceived / totalBytes` 显示 `0%` - `99%`；Chrome 标记 complete 后显示 `100%`。总大小未知时保持 `Downloading...`。
- DASH 只有在 video/audio init 与全部 segment size 都已知时,按整份媒体的实际已读字节显示 `0%` - `99%`;每个 segment 在流读取过程中更新,不按完成分片数伪造进度。
- HLS 或任一 size 未知时不伪造百分比,页面保持 `Downloading...`。
- 网络读取完成后的 remux/保存阶段保持 `99%` 或 `Downloading...`;只有浏览器保存动作触发后才上报 `100%`。
- signed URL 刷新重试时回到 `Downloading...`,新 playlist 能提供完整 size 后再恢复百分比。

### 8.3 DASH audio-only

执行流程:

1. 下载 audio init segment。
2. 顺序下载 audio segments。
3. 输出 `.m4a`。
4. 如果直接拼接的 fragmented MP4 在验证样本中兼容性不稳定,默认走 audio-only remux。

## 9. URL 白名单

允许:

- `https://*.vimeocdn.com/*`
- `https://*.akamaized.net/*`
- `https://player.vimeo.com/*` 仅用于 config/playlist,不作为媒体文件保存

拒绝:

- `blob:`
- `data:`
- `http:`
- 任意非 Vimeo CDN host
- 带加密标记的 HLS segment

白名单要在资源进入缓存前校验,下载前再校验一次。

config refresh、DASH/HLS playlist 与 segment 的扩展 `fetch` 必须使用 `credentials: omit`。这些 signed URL 自带访问授权,Vimeo CDN 使用通配 `Access-Control-Allow-Origin`;携带 Cookie 会触发 `WildcardOriginNotAllowed`,表现为播放器正常播放但扩展 fetch 得到 `net::ERR_FAILED`。Progressive/Thumbnail 不再由页面 `fetch`，而是把 signed URL 交给 Chrome 网络栈；它们不依赖 Vimeo Cookie，也不需要把 Cookie 复制到 background。

## 10. SPA 与刷新

Vimeo 页面可能在同一 tab 内切换视频。content 用 History API / `popstate` 与 `MutationObserver` 触发 300ms debounce,重新提取 `videoId`;videoId 变化后清理旧面板与资源缓存。

资源扫描是事件驱动的:

1. 每个 videoId 只保留一个捕获与 playlist 加载任务,并发 DOM 通知共享同一 Promise。
2. MAIN world 等待原生 config 最多 10 秒,content RPC 上限 12 秒。
3. SPA 已切换到其他 videoId 时,旧异步结果直接丢弃。
4. 成功快照缓存在当前 content 控制器,后续 DOM 重排只重挂面板,不重复请求 config/playlist。
5. 不使用 3 秒 reconcile,也不对 `/config` 做网络轮询。捕获超时或解析失败时展示空态,用户刷新页面重试。

SPA 切换或离开页面时，content 的按钮状态和原生下载轮询随文档销毁；已创建的 Progressive/Thumbnail Chrome 任务继续。DASH/HLS 需要页面内分片和 remux，离页会终止当前处理，用户回到页面后重新点击。

Config 刷新触发条件:

- `request.timestamp + request.expires <= now + 30s`。
- signed playlist 返回 `403` / `404` / `410`，或 Chrome 直连任务报告可刷新服务端中断。
- playlist 或 segment 返回其它失败状态。

playlist 过期可使用 `request.config_refresh_url` 重建一次资源快照;初始 config 的 `403` 不是 playlist 过期,不得进入无限刷新。每次用户点击最多刷新一次 config。

## 11. 资源模型

Popup 和页面按钮使用同一批 `MediaResource`。Vimeo 下载描述符随 `documentId` 携带恢复资源所需的最小合同:

| 字段 | 口径 |
| --- | --- |
| `videoId/sourceId/optionId` | 定位当前视频与刷新后同一个选项 |
| `kind` | `video` / `audio` / `image` |
| `delivery` | `progressive` / `dash` / `hls` / `thumbnail` |
| `configUrl` | 捕获的完整 signed config URL,或内嵌 config 的 signed refresh URL |
| `refreshConfigUrl` | config 返回的原生刷新 URL |
| track/playlist id | DASH/HLS 下载恢复所需的最小标识 |

`expiresAt` 属于资源快照和页面面板状态,计算后为 Unix 绝对秒;不把 `request.expires` TTL 当作绝对时间写入描述符。

`sourceId` 规则:

```text
vimeo:{videoId}:video:best
vimeo:{videoId}:video:progressive:{height}p:{fps}
vimeo:{videoId}:video:dash:{trackId}
vimeo:{videoId}:audio:dash:{trackId}
vimeo:{videoId}:image:thumbnail
```

## 12. 文件结构

```text
extension/src/background/services/BrowserDownloadService.ts
extension/src/core/downloadProgress.ts
extension/src/core/content/download/
├── download.ts
└── browserDownload.ts
extension/src/sites/vimeo/
├── shared.ts
├── config.ts
├── media.ts
├── content/
│   ├── index.ts
│   ├── frame.ts
│   ├── buttons.ts
│   ├── resourceBuffer.ts
│   └── styles/buttons.css
└── injected/
    ├── index.ts
    ├── configCapture.ts
    ├── download.ts
    └── mux.ts
```

入口注册:

- `extension/src/sites/vimeo/content/entry.ts`:Vimeo content 业务入口。
- `extension/src/sites/vimeo/injected/entry.ts`:Vimeo MAIN world `document_start` 入口,先安装 config 捕获再发布 RPC ready。
- `extension/src/sites/vimeo/content/frame.ts`:仅在 player frame 发布 videoId identity。
- `extension/vite.config.ts`:加入 `downloads` permission，以及 Vimeo matches、host permissions、CSS web accessible resource；嵌入播放器 frame 使用独立 content script entry 开 `all_frames:true`,不影响现有站点入口。
- `extension/src/popup/utils/tabs.ts`:把 Vimeo 加入可自动扫描站点。

## 13. 验收样本

- 普通 Vimeo 视频页面能在标题区看到 Video / Audio / Image 三行按钮。
- `Best` 等于页面可拿到的最高分辨率;若 adaptive 高于 progressive,走 adaptive mux。
- 多画质 progressive 时,每个画质都直接显示。
- 有 DASH audio 时,Audio 行展示 `Best Audio` 和码率按钮。
- Thumbnail 下载的是 `config.video.thumbs` 最大图。
- 页面 `<video src="blob:...">` 时仍能下载,因为下载源来自 config,不是 video DOM。
- 详情页完整 signed config XHR 被捕获后不再由扩展请求 `/config?h=...`,播放器原响应仍可正常消费。
- 直接打开 `player.vimeo.com/video/{id}` 时能从内嵌 playerConfig 建立资源,不依赖额外 config 请求。
- 同一页面不再每 3 秒产生 config `403`,DOM 重排也不会重复加载 playlist。
- config 过期或 403 时刷新一次 config 后重试。
- 私有/密码/DRM 页面拿不到 config 或加密 segment 时,按钮禁用并提示刷新/权限不足。
- Unit/Integration 覆盖 config 捕获、三行按钮、Chrome 状态进度、未知长度 `Downloading...`、重复点击锁、一次 signed refresh、adaptive `Best` 保持同 delivery、文件名和 URL/MIME 边界。
- 公网 smoke 固定使用 `https://vimeo.com/1196869805?fl=ip&fe=ec`，选择真实 Progressive MP4，断言 Chrome 任务 URL 是 Vimeo HTTPS CDN 而非 `blob:`；任务创建后暂停并跳离页面，再恢复任务等待真实文件落盘。当前 Vimeo 为 `disabled-unverified`，`pnpm test:e2e:vimeo` 明确报告 skip；重新启用后恢复执行。Vimeo 明确返回 Cloudflare 人机验证时标记外部环境阻塞,不误报产品失败。
