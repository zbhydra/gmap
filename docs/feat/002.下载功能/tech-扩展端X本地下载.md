# 002 · 扩展端 X 本地下载

> 覆盖 Chrome 插件在 `x.com`、`twitter.com` 与 `mobile.twitter.com` 页面内的本地媒体发现、页面入口、下载与瞬时进度。该链路不调用 website/backend 的 X 解析或下载接口，不把 Cookie、session 或媒体 URL 发给我们的服务器。
>
> 关联：`@tech-站点适配.md`、`@test-插件端e2e.md`、`@../000.架构/tech-插件RPC.md`、`@../../references/specs/spec-extension.md`。

## 1. 目标与边界

### 1.1 包含

- 扫描当前 X 文档中已加载的推文图片与视频线索。
- 从 MAIN world 的 fetch/XHR JSON 响应及 HLS 请求 URL 捕获有限的视频候选。
- 图片原图、HTTP MP4、非加密分离音视频 fMP4 HLS 的纯本地下载。
- Popup 资源读取与下载。
- 推文媒体面 36×36 下载按钮和 action bar 下载按钮。
- 页面按钮下载期间的禁用态、当前项/总项数和真实可计算进度。
- X SPA 增量渲染、路由切换、重复注入去重。

### 1.2 不包含

- 后端 X 解析 fallback、服务端代理、服务端合并或转码。
- `chrome.downloads` 与 `downloads` 权限。
- 加密 HLS、TS HLS、缺少独立音频轨或不满足白名单的 playlist/segment。
- X 页面取消入口、active transfer abort、暂停、恢复、跨路由任务 UI 或下载历史；共享 Popup 仍展示队列进度并提供 waiting dequeue。
- 主动解析页面尚未加载且无法从当前页面证据关联的推文媒体。
- 真实 X E2E；当前没有固定登录态与稳定真实样本，不声明真实页面兼容已由 E2E 证明。

## 2. 上下文与主流程

```text
X DOM / fetch / XHR / performance entries
                 │
                 ▼
MAIN networkCapture ── getCapturedXMedia ──► content controller
                                                │
DOM scanner ────────────────────────────────────┤
                                                ▼
                                     XResourceBuffer + buttons
                                                │
                                         downloadOne/Many
                                                │
                                  fixed EventRpc downloadMedia
                                                │
                                                ▼
                         MAIN fetch / HLS remux / a.download.click()
                                                │
                            fixed untrusted progress DOM event
                                                │
                                                ▼
                              current tweet button session only
```

- content 负责 DOM 扫描、资源合并、页面按钮、额度调用和同推文会话互斥。
- injected/MAIN 负责捕获页面已有网络信息、校验媒体 URL/MIME、读取字节、必要的 HLS remux 和触发浏览器保存。
- MAIN 不使用 Chrome API，不访问扩展 storage、登录 token、额度或后端鉴权能力。
- 下载仍是一个完整的 `downloadMedia` request-response；进度事件只影响 UI，不决定下载成功。

## 3. 媒体发现与资源模型

### 3.1 图片

content 遍历推文 `article`，从状态链接读取 tweet ID，从 `/photo/{index}` 链接内的 `pbs.twimg.com/media/*` 图片建立资源。头像、视频 poster 与其它非 `/media/` 图片不进入图片资源。

- 资源 ID：`x:{tweetId}:photo:{1-based-index}`。
- 下载 URL：保留图片 key/format，质量统一为 `name=orig`。
- 文件名：`x_{tweetId}_photo_{index}.{ext}`。
- 来源：`x-photo-dom-url`。

### 3.2 视频与 GIF-like 视频

DOM 中的 `video.src` 通常是 `blob:`，只作为推文内视频存在和 poster/media ID 关联证据，不能直接下载。MAIN 在 `document_start` 包装 fetch/XHR：

- JSON 响应只提取白名单 `video.twimg.com` MP4 variant、HLS master 与 `pbs.twimg.com` poster。
- 直接请求 URL 与 Performance Resource Timing 可补捕获 `/tweet_video/{mediaKey}.mp4` GIF-like 直链和 logged-out 播放链路的 HLS master。
- GIF-like MP4 与 `/tweet_video_thumb/{mediaKey}.{ext}` poster 共享字母数字 `mediaKey`，不按普通视频的数字目录 ID 解析；X 不提供原始 GIF，最终仍保存为 MP4。
- 捕获结果按固定上限保存在内存中，content 通过 `getCapturedXMedia` 主动查询，不使用长期推送缓存。
- MP4 按可得的码率、分辨率和面积选择最高质量。
- MP4 和 HLS 先按明确 tweet ID 关联，再按 poster 中 media ID 关联；仅一个可判定视频时才使用单视频兜底。
- 同一媒体同时存在 MP4 与 HLS 时优先 MP4。

资源 ID 为 `x:{tweetId}:video:{mediaId}`；来源分别为 `x-video-network-mp4` 和 `x-video-hls-master`，最终文件名为 `x_{tweetId}_video.mp4`。

### 3.3 页面缓存与扫描

- 初次启动立即扫描。
- `MutationObserver` 只把相关 DOM 变化合并到 300ms 扫描队列。
- 每 3 秒轻量 reconcile，覆盖延迟渲染或遗漏通知。
- history/popstate 变化后清理旧路由资源和按钮，再扫描新路由。
- 路由清理不取消已经交给 MAIN 的下载；原页面会话在 request-response 结束时自行释放。

## 4. 下载合同

### 4.1 图片与 HTTP MP4

1. 校验初始 URL 为 HTTPS 且 host/path 符合 X 图片或视频 CDN 白名单。
2. 使用普通 GET，不做 Range 预检。
3. 校验响应状态、最终重定向 URL 和 `Content-Type`。
4. 读取完整响应为 Blob；有合法正整数 `Content-Length` 时按已收字节报告进度。
5. 创建 object URL，构造临时 `<a download>`，调用 `click()` 触发浏览器保存，随后清理节点和 object URL。

### 4.2 HLS

1. 校验 master URL，拉取并解析 master playlist。
2. 只选择带可关联独立音频轨的受支持 video variant。
3. media playlist 必须为非加密 fMP4，包含 `EXT-X-MAP`，且所有 playlist/init/segment URL 均命中 X 白名单。
4. 顺序下载视频、音频 init 与 segment，累计字节不得超过 768MiB。
5. 在 MAIN 内 remux 为 MP4 后触发浏览器保存。

HLS 的 segment 数量不代表字节比例，下载和 remux 全程使用不可计算状态 `…`，不显示伪百分比。

### 4.3 错误与恢复

- URL、状态、MIME、playlist、segment、内存预算、fetch 或 mux 任一失败，本项抛出带资源/阶段信息的错误并记录日志。
- 单项入口失败后立即恢复同推文全部按钮；用户可再次点击。
- action bar 批量把有序资源交给共享 `downloadMany` 入队：当前项失败记录错误，FIFO worker 继续后续项；成功项不回滚，失败项不自动重试。
- 额度不足可跳过当前项，额度服务异常按共享 fail-open 规则继续；本功能不引入事务、任务账本或退款。

## 5. 瞬时进度协议

### 5.1 事件合同

固定 DOM 事件 payload 只包含：

| 字段 | 类型 | 含义 |
|---|---|---|
| `sourceId` | string | 与本次 `downloadMedia` 媒体源一致的稳定资源 ID |
| `progress` | number \| null | `0..100` 的瞬时百分比；`null` 表示当前无法计算。X 生产者只发送整数 |

事件边界：

- 宿主页面可观察、伪造或干扰事件；content 只接受本次活动会话中的资源 ID。
- 事件不能触发下载、扣额度、改变 RPC 终态或调用 Chrome 权限。
- Popup 不直接订阅 DOM 事件；页面单例下载管理器只接受 FIFO 首项的匹配进度,再通过版本化队列快照推送给 Popup。
- DOM 协议不新增动态 event 名或多段下载方法；跨入口调度统一使用共享 FIFO,不建立 X 专属 Scheduler 或状态管理器。

### 5.2 进度口径

| 阶段 | 可用 `Content-Length` | 未知长度 / 无可读流 / 可见压缩编码 | HLS |
|---|---|---|---|
| 请求开始、等待响应头 | `null` | `null` | `null` |
| 响应头通过校验 | `0` | 保持 `null` | 保持 `null` |
| 读取响应体 | `floor(received / total × 100)`，最高 99 | 保持 `null` | 保持 `null` |
| Blob 已读取 / HLS 已 remux | 最高仍为 99 | 保持 `null` | 保持 `null` |
| `a.download.click()` 已调用 | `100` | `100` | `100` |

- 共享事件出口只把数值约束到 `0..100`；X 字节读取和按钮展示再向下取整，只在显示整数变化时报告。Telegram 原有小数精度不受本功能影响。
- 响应字节超过声明长度也不能在保存触发前显示 100。
- 只有浏览器可见的 `Content-Length` 为正整数，且可见 `Content-Encoding` 为空或 `identity` 时，长度才可用于数字进度；观察到其它编码时保持 `null`。该合同只基于 fetch 暴露的响应头，不推断不可见 header。
- `100` 表示扩展已把文件交给浏览器下载机制，不代表操作系统已完成落盘。

## 6. 页面按钮会话

content 使用 `Map<tweetId, session>` 隔离活动会话。每个 session 只保存本次有序资源 ID、触发入口、当前资源 ID、当前进度与发起时 route key，不保存每个资源的历史进度。

### 6.1 并发与生命周期

- 同一 tweet 已有 session 时拒绝新的媒体/action 点击；全部相关按钮原生 `disabled` 且 `aria-busy=true`。
- 不同 tweet 使用不同页面按钮 session,可以独立入队；同一 canonical 资源仍由共享 Manager 排重，真实下载由 content 页面 FIFO 串行执行。完整状态合同见 `@tech-扩展端TG扫描.md` 的下载行为章节。
- 单项、批量、成功、失败都在 `finally` 中释放 session 和 listener。
- X SPA 路由变化不取消 MAIN 下载，也不释放 tweet 锁。当前 route key 与 session 不一致时，同 tweet 新按钮只显示禁用图标，不渲染旧百分比；其它 tweet 保持可下载。回到原 route 且下载仍在进行时可继续显示当前进度。

### 6.2 入口同步

| 触发入口 | 当前媒体按钮 | 同推文其它媒体按钮 | action bar 按钮 |
|---|---|---|---|
| 媒体按钮 | 显示 `50%` 或 `…` | 禁用，保留图标 | 禁用，保留图标 |
| action bar | 当前项显示 `50%` 或 `…` | 禁用，保留图标 | 显示 `1/2 50%` 或 `1/2 …` |

批量切到下一资源时，当前媒体与 action 文案一起切换；上一媒体恢复禁用图标。全部结束或任一单项入口失败后恢复空闲图标与可点击状态。

### 6.3 UI 规格

- 媒体按钮固定 36×36，圆形，文本使用 11px、600、tabular numerals，不因 `0%` 到 `100%` 改变尺寸。
- action slot 的 width/flex-basis 固定 68px；空闲按钮为槽位内居中的 36×36 圆形，批量忙碌按钮固定 68×36 胶囊。
- 忙碌状态不使用 hover 位移；禁用态仍保留足够对比度，使用 `not-allowed` cursor。
- 图标为现有纯下载 SVG，不出现 Telegram 品牌；亮暗模式沿用 X 的当前文字色和半透明背景。
- 语义使用原生 `<button>`、动态 `title`/`aria-label`、`aria-busy` 和进度文字 `aria-live=polite`。

## 7. 文件责任

```text
extension/src/
├── core/
│   ├── events/types.ts                    # content 单向事件类型
│   ├── injected/downloadProgress.ts       # 固定瞬时进度事件出口
│   ├── injected/responseBlob.ts           # Content-Length 字节读取与 99% 上限
│   └── protocol/injected.ts               # sourceId + number|null 合同
└── sites/x/
    ├── content/index.ts                   # 扫描编排、会话 listener、下载入口
    ├── content/buttons.ts                 # per-tweet session 与按钮渲染
    ├── content/scanner.ts                 # DOM 图片和视频线索
    ├── content/styles/buttons.css         # 36/68px 稳定布局与忙碌态
    ├── injected/networkCapture.ts         # fetch/XHR 有限捕获
    ├── injected/download.ts               # 图片/MP4/HLS 下载与保存
    ├── injected/mux.ts                    # fMP4 音视频 remux
    ├── media.ts                           # 资源、variant、playlist 纯逻辑
    └── shared.ts                          # host/URL 白名单
```

## 8. 测试与验收

- Unit：字节进度使用 floor、传输封顶 99、未知长度或可见非 identity 编码保持 `null`、HLS 不报告 segment 百分比、保存触发后才 100。
- Unit：媒体/批量入口同步、同 tweet 二次点击拒绝、不同 tweet 可同时进入 session 并排队、结束恢复图标。
- Integration：媒体/action 入口同步、同 tweet 互斥、不同 tweet 独立入队、SPA route 隔离、局部失败继续和窄视口尺寸合同。
- 未知长度与 HLS 的 `…`、分块进度和失败恢复由 Unit/Integration 覆盖。
- 当前不使用受控 X 页面 E2E；增加稳定真实样本与登录态之前，X 不进入插件真实 E2E 矩阵。

详细文件和命令见 `@test-插件端e2e.md` 与 `@plans/019.X页面下载进度与可控E2E.md`。

## 9. 风险与回退

- X DOM 变化可能导致按钮不注入或资源无法关联；失败允许用户刷新/重试，真实兼容问题按日志修正 scanner/anchor，Unit/Integration 不能替代真实页面验收。
- `Content-Length` 缺失或观察到非 identity `Content-Encoding` 时只显示 `…`；只依据 fetch 可见响应头，不推断不可见 header。
- 页面可伪造进度事件，影响仅限当前按钮文字；下载、额度和完成判定继续以调用链为准。
- 发布需要回退时整体回退 X 页面进度 UI 与按钮事件消费；共享下载 FIFO、Popup 状态和既有 Telegram 进度不依赖 X session。
