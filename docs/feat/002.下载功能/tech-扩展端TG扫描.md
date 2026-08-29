# 002 · 扩展端 TG 扫描

> 覆盖原 feat.004(telegram 资源扫描)中扩展端扫描注入部分。
> 关联:`@tech-链路与授权.md`(扩展端链路) `@tech-下载存储治理.md`(扩展端下载存储)。
>
> 本文以 `extension/src/sites/telegram/` 代码为现状证据；Plan 024 的页面下载管理入口、共享快照和取消链路已实现，真实 A/K 验收状态见计划记录。源 `docs/feat/feat.004.telegram资源扫描.md` 的消息协议命名(TG_* 常量、`GET_STREAM_URL`、`UPDATE_BADGE`/`RESOURCE_BUFFER_UPDATED`)、单资源下载 RPC、业务下载状态、版本检测方式均与当前代码不符,**§10 列明过时点**。源 §11「首页链接校验」属 website 不属扩展端,本文不承接(见 §9)。

## 1. 范围与边界

扩展 content script 在 Telegram Web(K/A 两个版本)页面扫描媒体资源、注入下载按钮、与 background/popup/injected 通信的端到端机制。

| 边界 | 说明 |
| --- | --- |
| 本文负责 | 版本检测、Telegram DOM 运行时覆盖、K/A 主消息扫描器、A Story viewer、SidebarScanner、资源缓冲区、按钮注入、共享下载队列、页面下载管理入口、任务取消、content RPC、injected RPC(`downloadMedia`/K/A/sidebar 查询)、错误矩阵 |
| `@tech-链路与授权.md` 负责 | injected 内部的媒体读取、存储和续传能力 |
| 不在范围 | website 首页链接校验(属 website,见 §9)、配额档位定义、非 Telegram 页面取消入口与 active transfer abort；共享 Popup waiting dequeue 是通用队列能力 |

## 2. 数据结构

### 2.1 `MediaResource`（`extension/src/core/types.ts`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 跨 URL、来源与扫描轮次稳定的资源唯一 lookup key；K 内部资源用 `${messageFullId}_${index}`，A 主消息用 `${chatId}_${messageId}_${index}`，A Story 用媒体类型与 document ID/Blob URL 指纹，Sidebar 用 `sidebar:${chatId}:${messageId}:${type}` |
| `messageId` | string | 所属消息 ID |
| `messageFullId?` | string | K 内部资源完整消息 ID,格式 `${peerId}_${mid}` |
| `index` | number | 消息内 0-based 索引 |
| `url` | string | 媒体 URL |
| `type` | `ResourceType` | `photo / image / video / round / gif / audio / voice / document` |
| `sourceKind` | `ResourceSourceKind` | `telegram-k-document / telegram-k-dom-url / telegram-a-mediahash / telegram-a-progressive / telegram-a-dom-url` |
| `filename?` | string | 可选 |
| `size?` | number | 可选 |
| `thumbnail?` | string | 可选 |
| `mimeType?` | string | 优先来自 Telegram document/worker 元数据 |
| `documentId?` | string | Telegram document ID |
| `codec?`/`width?`/`height?`/`duration?` | mixed | document 元数据 |
| `chatId?` | string | 可选 |
| `metadata` | `DownloadMetadata` | **必填**,源文档漏此字段 |

`DownloadMetadata`:`{ messageId: string }`。

### 2.2 `MessageObject`（`extension/src/core/types.ts`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `chat_id` | string | 聊天 ID(snake_case 真实使用) |
| `message_id` | string | 消息 ID |
| `is_injected` | boolean | scanner 对历史 `data-tg-dl-injected` 的兼容观察值；按钮 reconcile 不以此字段作控制条件 |
| `is_album` | boolean | 是否相册(多附件) |
| `resources` | `MediaResource[]` | 消息内媒体资源列表 |

### 2.3 下载任务快照

`DownloadTaskSnapshot` 是页面 Widget 与 Popup 的唯一任务模型：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `taskId` | string | `${scopeId}:${sequence}`；标识唯一任务行，同一资源重复入队复用该任务，取消只接受该字段 |
| `resourceId` | string | 原始资源 ID，只用于展示关联和校验下载器事件，不能作为取消键 |
| `filename` | string（可选） | 已确认的最终保存文件名；A 主消息 Document placeholder 在队首解析前缺失，解析后写回原名或保存兜底名；Blob 响应修正扩展名时再次写回实际保存名 |
| `status` | `waiting / downloading / failed` | 当前页面任务状态；本地取消后立即移除，不保留取消中或取消历史 |
| `progress` | `number \| null` | 0-100 展示百分比；未知为 `null` |
| `receivedBytes` | `number \| null` | 已接收字节；没有可靠来源时为 `null` |
| `totalBytes` | `number \| null` | 优先使用传输响应总大小，其次使用资源声明大小；未知为 `null` |
| `bytesPerSecond` | `number \| null` | content 用唯一 500ms 定时器采样区间吞吐并按 EMA 平滑；首次积累不足 1 秒、尚未有新增字节或连续 3 秒无增长时为 `null` |
| `bytesAreEstimated` | boolean | A `mediaHash` 只提供百分比时为 `true`；Blob/Segment 实际字节为 `false` |

状态语义：

- `waiting`：尚未进入 placeholder 解析和额度检查；可同步移除并完成本次调用。
- `downloading`：FIFO 队首，可能处于 placeholder 解析、额度检查或真实传输阶段。
- `failed`：真实执行抛错后保留在唯一任务列表，原调用方 Promise 维持 reject；不占用活动位置，FIFO 继续查找后续 `waiting`。
- 本地取消：不是快照状态；同步移除任务、完成本次调用并继续下一项，不记下载成功、下载失败或额度不足。

人工重试只接受 `failed`：恢复最近保存的完整资源 baseline 和展示字段，移动到 FIFO 尾部并转为 `waiting`，同时重建当前执行轮次 completion；旧调用方持有的 Promise 保持原失败结果，不被回写。任务第一次人工重试起永久跳过该任务的额度检查，后续再次失败仍只保留同一任务，不创建第二套失败队列。`clearWaiting` 一次移除全部 `waiting` 并完成其原调用方 Promise；`clearAll` 一次移除 `waiting + failed + downloading`，对活动项后台尝试底层取消。两种批量操作均只发布一次变更快照，底层取消结果不恢复已移除任务。

文件名时序：A scanner 先用 `queryAMediaResources` 按 document/message/WebPage identity 只读补充文件名、大小、类型和音视频元数据；message/WebPage 仍保留空 URL placeholder。FIFO 队首在额度检查前调用 `prepareAMediaResource`，取得唯一 Document 的真实 mediaHash/documentId 后写回同一个 `taskId` 快照。Worker full refresh 返回空镜像时不代表网络恢复后的目标数据永远缺席；message/WebPage prepare 继续等待 LocalDb 增量更新并按同一 identity 重查，目标出现后沿原任务继续。BlobDownloader 按响应 `Content-Type` 修正扩展名后，在触发保存前通过匹配任务的进度事件回写快照。K、A strict progressive、Sidebar 与 Story 资源在入队前已有原名或确定的生成名。

## 3. 版本检测

`extension/src/sites/telegram/utils/telegramVersion.ts` 的 `detectTelegramPageVersion` 是版本判断的唯一 owner，返回 `'K' | 'A' | 'Unknown'`。

- 仅当 `hostname === 'web.telegram.org'` 才检测,否则 `Unknown`。
- 取 `pathname` 按 `/` split,第一个非空段:等于 `'a'` → `'A'`,等于 `'k'` → `'K'`,其余 `Unknown`。
- **只看路径首段 `/a` vs `/k`,不看 `#` hash,不看 `/k/` 后续**。

## 4. 扫描器

主消息流扫描统一入口 `ResourceScanner.start`:立即执行一次,然后 `window.setInterval(..., 3000)` 每 **3 秒**自动扫描;`scan` 遇到未知版本时 `logger.warn` 后返回空列表。实际扫描委托给 `KVersionScanner` / `AVersionScanner`。

### 4.1 K 版扫描(`KVersionScanner.ts`)

K 主链路不再由 DOM 直接判型下载。DOM 只负责找候选消息、读取 `data-peer-id/data-mid` 组成 `messageFullId`,然后调用 injected `getKMediaResources` 从内部 `message.media` 判型。

- K 会保留已访问聊天的隐藏 tab；扫描与父按钮定位统一只接受 `.chat.tabs-tab.active`，并在该根内按 `mid + peer-id` 找消息。聊天切换中没有 active 根时跳过整轮，不回退全局 DOM。
- document-backed 资源主 URL 来自内部绝对地址 `https://web.telegram.org/k/stream/<DownloadOptions>`,DOM 图片只进入 `thumbnail`；下载端不接受相对 stream URL。
- 只有内部 Document size 已知时才构造 K stream 资源；共享元数据缺少 size 时跳过，不制造 0 或改走其它路径。
- `messageMediaPhoto` 只有在 injected 内部确认后,才把同一候选 DOM URL 作为 photo 主 URL,`sourceKind='telegram-k-dom-url'`。
- DOM 缩略图不能把 video/document/audio 覆盖成 photo。
- thumbnail 只接受当前资源自己的 `img` 或 `video.poster`，不能使用 stream/currentSrc 充当封面。
- grouped media 使用子项自己的 `data-mid/data-peer-id`。

K 消息身份/上下文选择器(`KVersionScanner.ts` `K_SELECTORS`):

| 选择器 | 用途 |
| --- | --- |
| `.bubble[data-mid]` | 消息容器 |
| `.bubble-content-wrapper` | 内容包装器 |
| `data-mid` | 消息 ID 属性 |
| `data-peer-id` | peer ID 属性 |
| `data-tg-dl-injected` | 已注入标记属性 |
| `[data-mid][data-peer-id]` | 带完整消息身份的节点 |

K `mediaCandidate` 候选选择器:

| 选择器 | 用途 |
| --- | --- |
| `.media-photo` | photo 候选 / 缩略图所在节点 |
| `.media-video` | video 候选 |
| `button.video-play` | 未加载视频播放按钮 |
| `.media-round` / `.media-gif-wrapper` | round/gif 候选 |
| `.document` / `.document-container` / `.document-download` / `[data-doc-id]` | document/audio 候选 |
| `audio-element` / `.audio` | 音频候选 |
| `.album-item.grouped-item[data-mid][data-peer-id]` | grouped album 子项 |
| `.document-container.grouped-item[data-mid][data-peer-id]` | grouped document 子项 |

K `thumbnail` 选择器单独为 `img.media-photo, img, video.media-video`;它只用于给内部确认资源补 `thumbnail`,或在内部确认 `messageMediaPhoto` 后作为 photo 主 URL。

### 4.2 K/A 共享 Document 元数据

K 的 snake_case/`_` 与 A 的 camelCase/`className` 在共享元数据边界归一化，扫描器和版本 service 不各自维护分类规则。共享模块只处理结构化 document，不读取 K chat、A LocalDb、DOM 或下载 URL。

分类优先级固定为 `round → gif → voice → audio → video → image → document`。Telegram filename attribute 优先；canonical 文件名保留合法内部空格与 Unicode，只替换跨平台禁用字符、清理首尾空白/尾句点和 Windows 设备名。缺失 filename 时按 document ID 与已知 MIME 扩展名生成，未知或缺失 MIME 统一回退 `.bin`。size 缺失保持未知，0 B 是有效大小；视频/音频时长来自 Document attribute，缺失保持未知。只有 `DocumentEmpty` 或缺少 document ID 的对象不生成资源。

### 4.3 A 版扫描、identity 与 DOM 选择器

| 选择器 | 用途 |
| --- | --- |
| `.message-content-wrapper` | 消息容器 |
| `.message-content` | 消息内容 |
| `img.full-media` | 图片 |
| `video.full-media` | 视频 |
| `.Audio` | audio / voice 组件根节点，只证明消息需要父下载入口 |
| `.File` | 普通 document 组件根节点，只证明消息需要父下载入口 |
| `.WebPage.with-document` | 同时包含可见 Document 与 identity link 的 WebPage 根 |
| `.WebPage-text .site-name[href]` | WebPage identity URL；DOM 与 LocalDb 使用同一 URL 规范化 |
| `.Album` | 相册容器 |
| `.Album .media-inner` | 相册媒体项 |
| `.icon-large-play` | 未加载视频播放按钮 |
| `img.thumbnail` | 缩略图 |
| `data-message-id` | 消息 ID 属性 |

A 聊天切换期间会同时保留旧、新 `MessageList`。扫描与按钮定位只接受外层和内层当前 `slide-to`，没有 `slide-to` 时接受 `slide-active`；`from/inactive` 不参与本轮，也不回退全局 DOM。

A 主消息扫描分为三个阶段：

1. 在当前活动 `MessageList` 收集消息上下文、相册子项 identity 和媒体元素上下文。
2. strict `/a/progressive/document{id}` 直接建立 document identity；普通 `.Audio/.File` 建立 message identity；`.WebPage.with-document` 同时存在 identity link 时建立规范化 WebPage identity。message/WebPage 保留 `sourceKind=telegram-a-mediahash`、空 URL placeholder。
3. scanner 批量调用 `queryAMediaResources` 只读当前 LocalDb 镜像；命中只合并展示字段，hit/miss 都不 refresh，也不替换 placeholder identity、空 URL、mediaHash 或 documentId。其它上下文只提取可验证的 photo/video DOM 资源。

来源规则：

| 场景 | 扫描结果 | 下载行为 |
| --- | --- | --- |
| 独立 photo | `telegram-a-dom-url` | 保持现有 photo 链路 |
| strict progressive video | `telegram-a-progressive` + document identity | 保持原 progressive URL，identity 只补元数据 |
| `.Audio` / `.File` | message identity 的 A Document placeholder | 队首 prepare Telegram 原 Document |
| `.WebPage.with-document` | WebPage identity 的 A Document placeholder | 队首按规范化 URL prepare 唯一 Document |
| 未加载 photo/video | 本轮无资源 | 后续 3 秒 DOM 扫描重试 |

`.Audio` / `.File` 内部即使存在封面、缩略图或 `img/video.full-media`，也不覆盖 Document placeholder。DOM 不读取文件名、MIME 或媒体属性来猜真实类型。

页面父按钮、单项入口和 Popup 都同步进入原 DownloadManager FIFO。worker 对所有 message/WebPage placeholder 在执行队首时调用一次 `prepareAMediaResource`，即使 scanner 已补齐展示元数据也不绕过；prepare 先等待 Worker ready，首次 miss 只复用现有 single-flight full refresh 一次。若 refresh 得到空镜像，则事件驱动地等待后续 LocalDb 增量并重查目标，不轮询、不固定 sleep、不再次 refresh；取消只退出当前 task 的等待。候选排除 playlist 并去重后必须恰好一个；多个候选是已确认歧义并立即失败，网络尚未提供任何候选则继续等待。A Sidebar、strict progressive、K 和其它来源直接走原链路。

### 4.4 A Story viewer（`AStoryViewerScanner.ts`）

A Story 不改变 URL，也不生成 `.Message[data-message-id]`，因此不进入 3 秒主消息扫描。`AStoryDownloadController` 用一个 document 级 `MutationObserver` 只观察 `#StoryViewer` 的挂载、`shown` class、子树媒体和 `src` 变化，并在图片 load / 视频 loadedmetadata 时补扫；同一帧变化合并到一次扫描。扩展自身按钮 mutation 被排除，避免渲染触发重复扫描。

扫描只接受 `#StoryViewer.shown` 内 viewport 可见、尺寸至少 180×240 的 `img/video`，不读取 Story CSS Module 的构建哈希 class。候选按可见面积排序；面积接近时 video 优先，再按自然分辨率和 DOM 顺序选择，因此同画面的 preview/full 图片并存时取完整图片，视频与预览图并存时取 video。来源只允许 Telegram 同源 Blob 或 `/a/progressive/`。

图片直接使用 viewer 已加载的完整 Blob，`sourceKind=telegram-a-dom-url`。视频从 `/a/progressive/document{id}` 提取 document ID，恢复上游 `getVideoMediaHash(..., 'download')` 使用的 `mediaHash:document{id}?download`，以 `sourceKind=telegram-a-mediahash` 进入 Telegram Worker 原文件下载；不把播放器 Range 分片当成完整文件。Story DOM 不暴露稳定 peer/story ID，因此资源不伪造 `chatId`，使用 document ID 或 Blob URL 指纹作为本页唯一身份。

扫描结果只在 Story controller 中保留当前一个 `MediaResource`，页面按钮直接调用 `downloadOne`，不写入 Popup 使用的 `ResourceBuffer`，避免 viewer 关闭后留下失效 Blob 资源。任务入队后由下载器自行持有资源；viewer 关闭或媒体未就绪时立即释放当前引用并移除按钮。Story 切换时同一按钮按新资源 ID 换绑，已经入队的旧资源不取消。

### 4.5 A 版 messageId 获取（`AVersionScanner.ts`）

- 相册:父 `MessageObject.message_id` 优先取外层消息的 `data-message-id`,缺失时才从第一格回退解析;每个普通相册 `MediaResource.messageId` 再从自己的 `.media-inner` id 解析,因此消息 12/13 组成的相册资源身份分别为 12/13。扫描阶段保存的 `resource.index` 是 DOM ordinal；注入阶段还要求候选格 ID 精确对应资源消息 ID，或对应付费照片的当前 `messageId-index` 后缀。付费视频重复基础 ID 继续按 ordinal 处理。重复 ID 相册无法证明一个内部 document 属于哪一格，因此不合并内部 document，只保留可验证 DOM 结果。这样普通同类型格在扫描与注入之间换序时会跳过本轮，而不会短暂错绑。元素 id 由 `parseMessageIdFromElementId` 用正则 `album-media-message-(-?\d+)(?:-\d+)?$` 解析。
- 单资源:`getMessageIdFromContainer` 从 `container.closest('.Message')` 取 `data-message-id`;失败时回退到子元素 `[id*="album-media-message"]` 解析。
- A 版 messageId 只在单个聊天内唯一;`MediaResource.id` 统一为 `${chatId}_${messageId}_${index}`,避免 SPA 切换聊天后同 messageId 的缓存和下载状态串线。

### 4.6 SidebarScanner(独立子系统,源文档几乎未提)

`SidebarScanner.ts`:右侧栏 Media/Stories 共享媒体扫描。A 版优先 `injectedClient.getCurrentSidebarSource()` 缓存,失败回退 DOM;A 版每 500ms 轮询可见性。资源 ID 使用 chat/message/type 身份，缓存与 DOM 列表位置不参与身份。选择器见 `content/services/constants.ts` `SIDEBAR_SELECTORS`。侧栏切到 Playlist 等非媒体 tab 时必须立即移除全部侧栏下载入口并使在途扫描失效,避免旧媒体资源在异步扫描结束后重新绑定。

当前 K sidebar 不生成可下载 DOM 资源:K 侧栏 DOM 只有缩略图,扫描结果返回空资源,避免侧链路继续下载缩略图。A sidebar 保留 `mediaHash`/`progressive` 能力,并给资源补 `sourceKind`、`mimeType`、`type`。

### 4.7 Telegram 统一远端配置

#### 目标与单一模型

Telegram 会独立更新 Web A/K DOM。新版扩展包内保留一份完整 Telegram 默认配置，`dom` 直接引用 `TelegramDomConfig.ts` 的完整默认对象，`download` 首批只包含 OPFS 字节阈值。后端只保存一份全局、稀疏的分组覆盖对象；该对象不按扩展版本或 Telegram 版本分组，扩展也不上传版本号。

客户端把远端结果视为可信内部合同，并在每个已知分组内合并覆盖：

- 服务端缺少分组或字段时继续使用当前扩展包默认值；返回 `{}` 等价于不覆盖。
- `dom` 为对象时，对完整本地 DOM 默认值做一次浅覆盖；DOM 多余键保留，同名键继续沿用宽松 DOM 合同，不校验 selector 语法。
- `download` 对完整本地下载默认值执行一次 `Object.assign`；`opfsThresholdBytes` 不做重复类型或范围校验。
- 未知顶层分组忽略，允许后续客户端扩展。
- Admin 和后端只保证请求是合法 JSON 且顶层为对象，这是存储合同，不检查字段完整性，也不拒绝未知字段。

`DEFAULT_TELEGRAM_CONFIG`、分组浅覆盖与 DOM 应用由 `extension/src/sites/telegram/config/TelegramConfig.ts` 持有；injected 下载默认值与当前运行态由 `extension/src/sites/telegram/injected/config.ts` 持有。现有 `TelegramDomConfig.ts` 继续是 DOM 默认值与生效对象的唯一 owner。

#### 初始化时机

Telegram content script 仍在 `document_idle` 启动。初始化顺序固定为：

1. 同时等待既有 injected ready 信号，并通过 content → Background typed RPC 请求一次 `GET /api/client/tg/config`。新版不请求旧 `dom-config`。
2. injected ready 后独立执行既有 `synchronizeRuntimeConfig()`，保持日志配置的 background → content → injected 同步；其局部失败不改变 Telegram Config 流程。
3. content 把生效 `dom` 浅覆盖到现有 `telegramDomConfig`，再通过 EventRpc 把 typed `download` 同步到 injected；injected 直接浅覆盖模块级当前配置。
4. 配置请求失败时使用包内默认值；download 同步失败时只记录错误，content DOM 继续生效，injected 保持默认下载配置并继续启动。
5. 每个 Telegram document 只请求一次；SPA 聊天切换不再请求。Admin 保存后，用户刷新 Telegram 页面重新获取。

该读取不登录、不轮询、不使用 WebSocket、不写 `chrome.storage`、不做页面内重试。请求复用扩展现有 HTTP 客户端、10 秒超时与统一响应解包，但显式关闭 5xx 重试。EventRpc 只承载无权限数值配置，不授予 Chrome、token、存储或后端能力。

#### DOM 键合同

以下是客户端已知键及当前包内默认值。

A 主消息：

| 键 | 默认值 | 消费语义 |
| --- | --- | --- |
| `aActiveTransitionRootSelector` | `#MiddleColumn > .messages-layout > .Transition` | 当前消息区最外层 transition |
| `aTransitionIncomingSelector` | `.Transition_slide-to` | 直接子级中的切入态，优先于 active |
| `aTransitionActiveSelector` | `.Transition_slide-active` | 直接子级中的稳定活动态 |
| `aMessageListSelector` | `.MessageList` | transition 下的直接消息列表 |
| `aMessageSelector` | `.Message[data-message-id]` | 消息身份根与按钮回查范围 |
| `aMessageIdAttribute` | `data-message-id` | A 消息 ID 属性名 |
| `aMessageContentWrapperSelector` | `.message-content-wrapper` | 扫描与父按钮宿主 |
| `aMessageContentSelector` | `.message-content` | 消息媒体查找范围 |
| `aPhotoSelector` | `img.full-media` | 扫描器图片候选 |
| `aVisualPhotoSelector` | `img.full-media:not(.map)` | 圆形按钮可绑定的图片面 |
| `aVideoSelector` | `video.full-media` | 视频候选与视觉面 |
| `aDocumentSelector` | `.Audio, .File` | audio/voice/document 组件根 |
| `aDocumentPreviewSelector` | `img, video[poster]` | Document 根内的封面候选 |
| `aWebPageDocumentRootSelector` | `.WebPage.with-document` | 含 Document 的 WebPage 根 |
| `aWebPageIdentityLinkSelector` | `.WebPage.with-document .WebPage-text .site-name[href], .text-content a[href]` | WebPage identity 候选链接；规范化后必须唯一 |
| `aPlayButtonSelector` | `.icon-large-play` | 未加载视频判定 |
| `aThumbnailSelector` | `img.thumbnail` | 缩略图候选 |
| `aAlbumSelector` | `.Album` | A 相册根 |
| `aAlbumMediaSelector` | `.media-inner` | 相册格与单媒体视觉宿主 |
| `aAlbumMediaIdPrefix` | `album-media-message-` | 从相册格 id 解析子消息身份 |
| `aAlbumSelectWrapperSelector` | `.album-item-select-wrapper` | A 相册复选框宿主 |
| `aFloatingFooterSelector` | `.middle-column-footer` | A 消息区原生浮动按钮 footer |
| `aFloatingArrowIconSelector` | `i.icon.icon-arrow-down` | A 原生向下箭头图标 |
| `aFloatingArrowButtonSelector` | `button.Button.round` | A 原生向下箭头按钮；入口挂到其 wrapper 前 |

A 侧栏：

| 键 | 默认值 | 消费语义 |
| --- | --- | --- |
| `aSidebarMainSelector` | `#Main` | 可见性观察根 |
| `aSidebarOpenSelector` | `#Main.right-column-open` | 主布局已打开右栏 |
| `aSidebarWrapperSelector` | `#RightColumn-wrapper` | 右栏 wrapper 与观察根 |
| `aSidebarVisibleWrapperSelector` | `#RightColumn-wrapper:not(.is-hidden)` | 无主布局根时的可见 wrapper |
| `aSidebarInnerSelector` | `#RightColumn` | wrapper 内右栏主体 |
| `aSidebarProfileSelector` | `#RightColumn > .Transition > .Profile.Transition_slide-active` | 当前活动 Profile |
| `aSidebarTabListSelector` | `.shared-media-tabs .TabList` | 侧栏标签点击监听根 |
| `aSidebarGridSelector` | `#RightColumn > .Transition > .Profile.Transition_slide-active .shared-media-transition .Transition_slide-active` | 当前媒体网格范围 |
| `aSidebarDownloadAllAnchorSelector` | `#RightColumn > .Transition > .Profile.Transition_slide-active .shared-media-tabs` | 批量按钮插入锚点 |
| `aSidebarGridItemSelector` | `.Media.scroll-item` | 网格项基础 selector；再按 id 前缀过滤 |
| `aSidebarPhotoSelector` | `img.full-media.media-miniature` | 网格图片 |
| `aSidebarVideoSelector` | `video.full-media.media-miniature` | 网格视频 |
| `aSidebarItemIdPrefix` | `shared-mediamessage-` | 网格项消息 ID 前缀 |
| `aSidebarObservedAttributes` | `["class"]` | 右栏可见性观察属性 |

A Story：

| 键 | 默认值 | 消费语义 |
| --- | --- | --- |
| `aStoryViewerSelector` | `#StoryViewer` | Story 生命周期根 |
| `aStoryActiveViewerSelector` | `#StoryViewer.shown` | 当前可见 Story viewer |
| `aStoryMediaSelector` | `img, video` | 主画面候选 |
| `aStoryObservedAttributes` | `["class", "src"]` | Story 切换观察属性 |

K 主消息：

| 键 | 默认值 | 消费语义 |
| --- | --- | --- |
| `kActiveChatSelector` | `.chat.tabs-tab.active` | K 当前聊天根 |
| `kMessageSelector` | `.bubble[data-mid]` | 扫描候选消息 |
| `kMessageWithIdentitySelector` | `.bubble[data-mid][data-peer-id]` | 按钮定位与完整消息身份根 |
| `kIdentityNodeSelector` | `[data-mid][data-peer-id]` | 候选媒体最近的完整消息身份节点 |
| `kMessageIdAttribute` | `data-mid` | K 消息 ID 属性名 |
| `kPeerIdAttribute` | `data-peer-id` | K peer ID 属性名 |
| `kContentWrapperSelector` | `.bubble-content-wrapper` | 媒体候选查找范围 |
| `kContentSelector` | `.bubble-content` | 控件层回查范围 |
| `kMediaCandidateSelector` | `.media-photo, .media-video, button.video-play, .media-round, .media-gif-wrapper, .document, .document-container, .document-download, audio-element, .audio, [data-doc-id], .album-item.grouped-item[data-mid][data-peer-id], .document-container.grouped-item[data-mid][data-peer-id]` | 可交给 injected 解析的 DOM 候选 |
| `kGroupedItemSelector` | `.album-item.grouped-item[data-mid][data-peer-id], .document-container.grouped-item[data-mid][data-peer-id]` | 扫描阶段 grouped 子项 |
| `kVisualGroupedItemSelector` | `.album-item.grouped-item[data-mid][data-peer-id]` | 圆形按钮可绑定的相册格 |
| `kThumbnailSelector` | `img.media-photo, img, video.media-video` | 内部资源缩略图或已确认 photo URL |
| `kAttachmentSelector` | `.bubble-content-wrapper > .bubble-content > .attachment` | K 单媒体视觉宿主 |
| `kInputSelector` | `.chat-input.chat-input-main` | K 当前聊天输入区 |
| `kInputContainerSelector` | `.chat-input-container.chat-input-main-container` | K 原生浮动控件容器 |
| `kJumpDownButtonSelector` | `button.bubbles-go-down` | K 原生 jump-down 按钮 |
| `kVisibleUnreadButtonSelector` | `button.bubbles-go-mention.bubbles-go-reaction.is-visible` | K 当前可见 mention/reaction 按钮；用于选择下一空槽 |

共享读取与主题：

| 键 | 默认值 | 消费语义 |
| --- | --- | --- |
| `mediaSourceSelector` | `source` | img/video 子级媒体地址来源 |
| `mediaUrlAttributes` | `["src"]` | 媒体元素与 source 的地址属性，按顺序读取 |
| `mediaSizeContainerSelector` | `.attachment, .media-container, .media-wrapper` | video 大小属性回查祖先 |
| `mediaSizeAttributes` | `["data-size", "data-file-size"]` | 可选文件大小属性名，按顺序读取 |
| `darkThemeSelector` | `html.theme-dark, html.night` | 只定位 A/K 的 HTML 根暗色主题 class |

K 侧栏残留选择器没有可达下载资源，不进入默认配置、远端覆盖或活动 DOM 监控。

#### CSS 与生成 DOM 解耦

远端配置只能改变 JS 定位，不能改已经打包的静态 CSS。实施时必须同时消除当前样式层对 Telegram class 的直接依赖：

- JS 定位到 A/K 媒体或侧栏网格宿主后，添加插件自有 `tg-dl-*-host` class；`buttons.css` 与 `sidebar-buttons.css` 的 hover/focus 规则只读取这些自有 class。
- `darkThemeSelector` 只匹配 HTML 根；A 使用 `theme-dark`，K 使用 `night`。页面下载管理 owner 观察 HTML 根 `class` 变化并只同步插件自己的 `is-dark`，主题切换不触发任务重渲染或 Telegram 锚点查询；CSS 不直接读取上游主题 class。
- Sidebar 批量按钮使用插件自有 markup、class 和完整样式，不再生成或继承 Telegram 的 `ListItem`、`ListItem-button`、`ListItem-icon`、`ListItem-content`、`title`。

这部分是移除现有 DOM 耦合，不增加第二套远端样式配置。

#### 能力边界

- 首次支持本合同之前发布的扩展不会请求配置，无法被远端修复。
- 远端覆盖只能修正当前客户端已经抽象成配置键的 DOM 定位。Telegram 若改变媒体身份语义、资源读取方式或下载算法，仍需发布新扩展。
- 新版统一配置与已发布旧版使用的 `tg-dom` API、RPC、存储和 Admin 合同相互独立，不迁移、不投影、不双写，也不互相回退读取。
- 一个全局对象服务所有支持新版合同的扩展版本；不提供按版本下发、版本比较、兼容矩阵或客户端版本上报。
- 不提供配置历史、回滚按钮、恢复默认、预发布、审批、定时刷新、WebSocket、持久缓存或自动重试。
- 未来 AI 上游巡检与自动写配置不在本轮；后续只需写入同一个宽松对象，无需扩展现有存储合同。

后端存储、公共读取接口和 Admin 编辑合同见 `@../008.管理后台/tech-系统设置.md`，上游 DOM 基线见 `@../../research/telegram-web-dom-monitor.md`。

## 5. 资源缓冲区

通用缓存行为位于 `extension/src/core/content/services/ResourceBuffer.ts`;Telegram 页面键与来源排序位于 `extension/src/sites/telegram/content/services/ResourceBuffer.ts` 的 `TelegramResourceBuffer`。

- `buffer: Map<string, MediaResource>`(resourceId → MediaResource)。
- `addResources`:按 `resource.id` upsert;同 key 下只在新资源 `sourceKind` rank 高于或等于旧资源时替换。rank:K document > A mediaHash > A progressive > K DOM > A DOM。
- 聊天切换检测:`ResourceBuffer.start` 每 500ms 检查一次 `TelegramResourceBuffer.getPageKey`;`MediaUtils.getChatId()` 变化时清空缓存。
- `notifyUpdate` 只调用 `backgroundClient.updateBadge({count})`——**方法名 `updateBadge`,非源文档的 `TG_UPDATE_BADGE`/`UPDATE_BADGE`**;失败不影响页面扫描。
- ResourceBuffer 不向 Popup 推送资源事件；Popup 打开或手动刷新时通过 `getResources` 查询当前快照。

## 6. 按钮注入

主消息与 Sidebar 使用 `ButtonInjectionManager.ts`、`MediaDownloadButtonRenderer.ts`、`TelegramMediaSurfaceLocator.ts`、`SidebarButtonRenderer.ts`、`CheckboxManager.ts` 和 `MessageHandler.ts`。A Story 使用独立的 `AStoryDownloadController.ts` 与 `AStoryDownloadButtonRenderer.ts`，不伪装成普通消息。Plan 024 的页面下载管理入口使用独立 document 级 owner，不进入消息扫描和虚拟列表 reconcile。

### 6.1 注入流程(`ButtonInjectionManager.ts`)

1. `setupMessageListener` 监听 DOM 事件 `messagesUpdated`(前缀 `tg_dl_`,真实事件名 `tg_dl_messagesUpdated`)——**非 `TG_MESSAGES_UPDATED`**。
2. `positioner.findContainer` 定位父消息,刷新消息缓存与 resourceId → `MediaResource` 缓存。
3. `MediaDownloadButtonRenderer.reconcile` 每轮按当前 DOM 重建/去重单资源圆形入口;Telegram 虚拟列表替换媒体宿主后,下一轮 3 秒扫描可补回按钮。
4. 相册 `CheckboxManager.reconcile` 同样每轮按 `resource.id` 同步当前 DOM;子项重建或资源从 1 格增长为多格时补回复选框,并保留用户已有选择。
5. `ButtonRenderer.reconcile` 每轮校验父按钮容器是否仍连接、仍属于当前插入父节点且仍位于目标 sibling；局部删除或移动时重建 DOM，并从 `activeDownloads` 恢复 disabled、busy 和进度。`is_injected` 与 `data-tg-dl-injected` 不参与控制。
6. 父消息按钮点击时读取当前 checkbox 选择;圆形入口按自身 resourceId 回查单个资源。

### 6.2 按钮展示与下载控制

父消息批量按钮空闲时显示当前选择数与总数；下载期间监听固定的非可信 DOM 进度事件,显示“剩余资源数 + 当前资源百分比”,本次 `downloadMany` 对应的全部任务结束后恢复空闲文案。按钮只维护本次调用的短命 UI,页面级等待/下载中状态统一由共享下载管理器持有。

单资源圆形入口只覆盖 `photo/image/video/round/gif` 视觉媒体。A 单媒体挂到已确认 `img/video.full-media` 的 `.media-inner`;A 相册按扫描阶段保存的 DOM ordinal 对应每格 `.media-inner`,再校验子消息 DOM ID 与图片/视频类型;K 单媒体挂 `.attachment`,K 相册按每格自身 `data-mid/data-peer-id` 定位 `.album-item.grouped-item`。不把 `img/video` 标签本身当宿主,也不把只有 `data-index` 的付费预览相册伪装成普通 grouped media。

圆形入口为 36×36px、右侧 8-10px;单媒体 `bottom:10px`。A 的 `.Album/.media-inner` 与 K 的 `.attachment/.album-item` 都可能裁切 overflow,因此 A/K 相册按钮统一挂到消息内容的不裁切 control layer,按格子和复选框的实际矩形换算坐标,与复选框中心线对齐并位于其正上方,保留 8px 间距。超小格允许圆钮越出格子,但完整按钮仍在 control layer 可见。桌面端仅在对应媒体 hover/focus 或按钮 `focus-visible` 时显示,下载中保持显示;无 hover 设备常显;`prefers-reduced-motion` 关闭过渡。Telegram 在静止指针下重建相册格时,渲染器通过最近 pointer 坐标和 `elementFromPoint` 恢复当前格显隐,不依赖新节点补发 `pointerenter`。点击在按钮节点阻止 pointer/mouse/click/dblclick 冒泡,避免同时打开 Telegram 媒体查看器。

同一圆形入口下载期间禁用并显示整数百分比或 `…`,结束后恢复图标。这个 Map 只锁当前资源按钮并帮助 DOM 重建时恢复 UI,不作为额度、队列或下载终态的事实源。

A Story 使用唯一 40×40 圆形按钮并直接挂在稳定的 `#StoryViewer` 根节点，不依赖 StoryViewer 哈希 class，也不进入内部裁切媒体层。Telegram 上游 Story 根节点建立 `--z-story-viewer` stacking context，内容层为 2、关闭按钮为 3，因此下载按钮使用 viewer 内层级 4；上游 low-priority modal、普通 modal 和 confirm modal 分别处于更高的 1400、1510 和 10500 层级，打开时会正确覆盖下载按钮。按钮按当前媒体矩形定位：右侧空间足够时位于媒体右边 12px、底边对齐；空间不足时移入媒体右下角并内缩 12px；始终与 viewport 保留至少 8px。按钮使用固体 `#006efe`、白色下载图标，hover 为 `#47a8ff`，`focus-visible` 使用双层焦点环；定位不做缩放动画，`prefers-reduced-motion` 关闭颜色过渡。下载中禁用并显示整数百分比或 `…`；切换 Story 后按钮显示新资源状态，旧资源继续由共享队列执行。

Segment/Blob 路径在分块完成时报告 0-100 百分比；A `mediaHash` 直接消费 Telegram Worker 的 `methodCallback`，把原生 0-1 分块进度转换为 0-100。audio/voice/document 只使用父消息按钮；`photo/image/video/round/gif` 才进入视觉媒体圆形入口。完整下载 RPC 与 Worker 调用均保留现有 24 小时内层期限；timeout 不代替人工取消。A message/WebPage placeholder 的 prepare 使用同一长调用期限，先等待 Telegram GramJS Worker ready，再查询或刷新 LocalDb；空全量镜像后等待后续增量事件，不增加固定 sleep、轮询或自动 refresh。Sidebar 只消费本次调用的进度；共享下载管理器同时接收活动资源进度并向 Popup 推送队列快照,Popup 不直接订阅 DOM 事件。

Telegram A Worker ready 只接受两种上游协议证据：拦截到 `initApi` 后收到同一 message ID 的成功 `methodResponse`，或在未观察到 init 生命周期时拦截到 Telegram 原生 `callMethod`。前者对应上游完成初始化并排空 API 请求队列；后者证明上游已经越过 init 门槛。仅创建 Worker 不算 ready。prepare 按 `taskId` 登记可取消等待；取消后只清理当前任务 waiter，不终止或复制 Telegram 原生初始化流程。

### 6.3 下载行为（`ButtonInjectionManager.handleButtonClick`）

- 父消息单资源和多资源都把有序列表交给 `downloadMany`;它一次性加入页面共享 FIFO,由唯一 worker 逐项执行。
- 多资源使用 `checkboxManager.getSelectedResources`,为空下载全部,否则下载选中。
- 主消息圆形入口直接对绑定的一个 `MediaResource` 调用 `downloadOne`,不读取相册 checkbox。
- A Story 唯一圆形入口对当前可见 Story 的 `MediaResource` 调用 `downloadOne`；切换 Story 不取消已入队任务。
- Sidebar 网格单项调用 `downloadOne`;Sidebar “DOWNLOAD ALL”确认后调用 `downloadMany`。

`DownloadManager.enqueue` 是所有页面按钮和 Popup 的唯一资源排重入口。同一 canonical resource ID 在当前 document 的未完成列表中最多一个任务：waiting 保持 FIFO 位置和当前 completion，使用新提交资源刷新待执行材料与重试基线；downloading 冻结已启动材料并复用当前 completion；failed 使用新材料恢复同一任务、尾插、免再次扣额并建立新的当前执行轮次 completion。成功、额度拒绝或取消移除任务后，同一资源可以再次创建任务。批内重复输入与输入一一对应，但共享同一任务 completion；只有新任务记录 `download_click`。

Sidebar 批量下载 ≥50 时弹确认对话框(`BATCH_DOWNLOAD_CONFIG.CONFIRM_THRESHOLD=50`),支持「不再询问」存储键 `sidebar_batch_dont_ask`。

### 6.4 页面下载管理入口

- `initializeTelegramContent` 在 injected ready 与 Telegram DOM 配置加载完成后创建一个 Telegram document 级下载管理 owner；A/K 共用，页面销毁时随 content 生命周期销毁。
- owner 启动时先把唯一 UI 根容器挂到 `document.body`；存在任务且活动聊天锚点就绪后，再把同一节点移动到当前 A/K 原生向下浮动控件区。页面消息更新和活动根尺寸变化沿用既有 owner 重新锚定，不复制任务状态。
- A `8b63941` 在当前 `.MessageList` 同层的 `.middle-column-footer` 内定位 `i.icon.icon-arrow-down` 对应的 `button.Button.round`，把入口插在其 wrapper 前，与原生 column flex 浮动组共用排列。任务非空时由 owner class 只解除该组的隐藏位移；空队列、切换 K 或 owner 销毁时移除 class，不改变其它 Telegram 控件状态。
- K `b21491` 只在活动 `.chat.tabs-tab.active` 的直接 `.chat-input.chat-input-main > .chat-input-container.chat-input-main-container` 下定位 `button.bubbles-go-down`。入口使用原生右侧与输入高度基准；按直接子项 `button.bubbles-go-mention.bubbles-go-reaction.is-visible` 的数量 N，占用 jump-down 上方第 N+1 格，不扫描通用 button，也不依赖控件矩形是否可见。
- 页面 owner 直接订阅 `DownloadManager` 的版本化快照；Popup 继续使用 Chrome EventBus + `getDownloadQueue`。两处只渲染同一个 `DownloadQueueSnapshot`，不复制任务、排序或取消状态。
- 页面 renderer 一次创建 trigger、popover 和状态分组；按 `taskId` 复用、增删并跨组移动任务行。进度快照只原位更新文本、progress 与指标，不替换按钮节点、不补偿焦点/滚动，也不重复执行 Telegram 锚点查询。
- 页面使用无框架 DOM renderer；owner 宿主只保留 A/K 锚点与原生浮动组协作样式，trigger、popover、任务行和 SVG 全部渲染到开放 Shadow Root，并在该边界内注入组件 CSS，禁止 Telegram 宿主样式进入下载队列。Popup 保持现有 Vue/Pinia。文件名、字节和速度格式化下沉为无 UI 的共享纯函数，两端复用展示口径，不复用渲染组件。
- 48px 页面入口使用亮色 `#006bff` / 暗色 `#006efe` 与白色下载图标；332px 紧凑浮层顶部提供 `clearAll`，等待分组提供 `clearWaiting`，失败分组逐项调用 `retry(taskId)`。清理、取消和重试复用现有 Heroicon 语义，均为蓝色图标按钮和浅蓝 hover surface；失败必须同时显示本地化失败文字与错误色。
- UI 尺寸、徽章、悬浮/点击/键盘交互、亮暗主题和任务行内容以 `feat.md` 的“Telegram 页面下载入口”为唯一产品规格。

### 6.5 取消与传输指标

取消只按 `taskId` 定位：

1. 任务快照保存 `activeTransferCancellable`：enqueue 时按真实 `sourceKind` 能力确定。Popup 不按 tab URL 推断能力；各平台 waiting 始终提供本地移除，活动任务只有该字段为 true 时才显示取消入口。`DownloadManager.cancel` 是本地任务存在性与能力的唯一权威裁决入口。
2. 本地接受取消后，同步标记该任务已取消、停止速度采样、从 FIFO 删除、完成本次调用并继续下一项；waiting、Worker ready 等待、LocalDb refresh 等待、额度请求和真实传输阶段使用同一语义。
3. 当前执行以“真实执行 Promise 与本地取消 Promise 的竞速”释放 FIFO。取消胜出后，真实 Promise 转为后台观察对象；迟到 fulfill/reject 必须被消费，且不得记录下载成功、下载失败或额度不足埋点。
4. 本地结算不等待 injected。content fire-and-observed 调用 `cancelDownloadMedia({taskId})`，只记录发送或返回失败；`accepted` 仅供诊断，不构成删除条件，也不能恢复本地任务。
5. injected 收到取消后先同步标记对应 prepare/transfer control 已取消，再尽力清理 Worker ready waiter、退出当前 prepare 等待或 abort Blob/Segment。A mediaHash 按当前 Worker request ID 尽力发送 `{payloads:[{type:'cancelProgress',messageId}]}` 后，立即清理扩展自己的 waiter、`reqList` 和 24 小时 timer，并结算原 Promise；不等待 `USER_CANCELED`。底层中止或临时内容删除失败只记录，不改变本地终态。
6. content 已按 `taskId/resourceId` 双 ID 只接受当前活动任务进度；任务移除并启动下一项后，旧任务的进度和最终响应自然失配并丢弃。同一资源重新入队会取得新 `taskId`，不增加 generation/version token。
7. 触发 Blob/object URL 的浏览器保存前再次检查 injected control；已取消则不创建保存动作。`<a download>` 已点击后没有可靠撤回句柄，任务按已完成处理，不提供伪取消。
8. 已取消底层请求可能短暂收尾并与下一项重叠；若取消消息未抵达 injected，极端情况下旧任务仍可能落盘。该风险由用户明确接受，业务队列可用性优先于物理传输唯一性和绝对资源释放。

传输指标只驱动 UI：

- Blob 每次读取完成按 `Blob.size` 累计精确字节，总大小来自已校验 `Content-Range`；响应 MIME 修正扩展名时，进度事件同时携带实际保存文件名并在保存前更新快照。
- Segment 每个 Range 响应写入当前 sink 后按 `ArrayBuffer.byteLength` 累计精确字节，总大小来自预检 `Content-Range`；取消时 abort 预检、全部并发分块、writer 和重试等待，并清理当前 sink。
- A `mediaHash` 当前 Worker callback 只有 0-1 进度；资源声明大小已知时用 `size × progress` 换算估算字节并设置 `bytesAreEstimated=true`，未知时字节和速度均为 `null`。Worker 最终响应的 `fullSize` 不能倒推此前的精确实时速度。
- content 只接受显式活动任务且 `taskId/resourceId` 同时匹配的累计字节事件。事件只更新最新字节，活动任务由全页面唯一的 500ms 定时器固定采样区间吞吐；首次积累 1 秒后才展示，之后以新观测权重 0.2 的 EMA 平滑。无新增字节时按零吞吐逐步衰减，连续 3 秒无增长后速度置为 `null`；时间或累计字节回退时重新建立基线。页面可伪造 DOM 事件，该数据不能改变额度、取消、完成或保存行为；任务取消、失败、完成和重试时必须停止或清空采样状态。

### 6.6 SegmentDownloader 存储与生命周期

`SegmentDownloader.ts` 是 A progressive、K stream 与 A/K DOM HTTPS 的唯一 Range 下载和存储 owner。Telegram `DownloadServices` 从 injected 当前配置读取 `opfsThresholdBytes` 并显式传入 core 下载器；默认值为 200 MiB。预检取得可靠总大小后只选择一次 sink：小于生效阈值使用 memory；不小于生效阈值且 Window OPFS writable 可用时使用 OPFS；缺少 OPFS/getDirectory/createWritable 能力时从开始使用 memory。阈值为 `0` 时所有可靠大小资源都满足条件。已创建 OPFS writable 后的 write、close 或 getFile 失败直接结束当前项，不切换 sink、不重启第二条下载路径。

两类 sink 共用预检、20 路分块、批次重试、进度、取消和 object URL 保存。分块网络 `TypeError` 与 408 由各 position 在自己的并发槽位内沿用固定 1 秒独立持续重试；position 成功后才释放槽位，整批完成后才推进，不重放其它 position，单个任务的活动请求始终不超过 20。每批局部 AbortController 通过 `AbortSignal.any` 与用户任务 signal 组合；non-retryable 会 abort 同批并在 drain 后清理当前 sink。用户取消同样发出 abort，但本地 FIFO 不等待批次退出或 sink 清理；旧执行 Promise 在后台观察并尽力清理。已写 position 与累计进度保留到清理完成。HTTP 非 408、跨源、内容类型与 sink 错误保持不可重试。memory 按 position 保留分块并在完成时生成 Blob；OPFS 把每个校验完成的分块按 position 写入同一 writable，写完即释放调用方引用，完成时关闭 writer 并取得 File。Telegram URL 始终由页面内 Range fetch 消费，不能交给浏览器导航、`chrome.downloads` 或 K `downloadToDisc`。

OPFS 临时内容只属于站点无关的 `extension-downloads/`：随机文件名不含业务 ID、原文件名或 URL。真正不可重试的失败和取消中止 writer 并删除当前文件；可重试错误不结束任务、不删除当前文件。成功 File/object URL 交给浏览器后，当前任务捕获自己的具体 OPFS sink，120 秒后复用 `discard` 只删除该 entry；不清整个目录，不影响其它正在下载或已完成任务。浏览器届时仍未落盘允许失败，memory sink 与既有 1 秒 object URL 释放不受影响。`startTelegramInjected` 每次 provider 初始化 fire-and-forget 调用 `cleanupSegmentDownloads`，递归清理页面提前关闭导致 timer 消失的成功文件或中途关闭残留；清理异常只记录，不阻断扫描。timer 不持久化，不增加注册表、后台状态、下载完成桥接或跨 tab 协调。本链路不创建持久资源身份或恢复状态，页面刷新和浏览器重启后不续传。

## 7. 通信协议

### 7.1 content RPC（content↔background/popup）

方法合同位于 `content/content-register.ts`;Telegram provider 复用 `content/MessageHandler.ts`，由 `sites/telegram/content/MessageHandler.ts` 绑定 Telegram 资源缓存。

源文档 §8.1 列出的 `TG_GET_MESSAGES`、`TG_DOWNLOAD_BATCH` 等 RPC 常量**不存在**。现存 `TG_*` 命中属于样式、调试或 website auth bridge,与资源 RPC 无关。真实方法是 camelCase RPC:

| 真实方法 | 源文档叫法 | 说明 |
| --- | --- | --- |
| `getResources()` | `TG_GET_MESSAGES` | 获取资源列表 |
| `getDownloadQueue()` | — | 获取当前 content 页面未完成下载任务快照 |
| `downloadBatch(params)` | `TG_DOWNLOAD_BATCH` | 批量下载 |
| `cancelDownloadTask(params)`（Plan 024） | — | 按唯一 task ID 移除各平台 waiting，或中止快照声明可取消的活动任务；当前只有 Telegram active 具备真实中止能力 |
| `retryDownloadTask(params)` | — | Popup 按唯一 task ID 重试当前 document 的失败任务；共享能力不区分平台 |
| `clearBuffer()` | `TG_CLEAR_BUFFER` | 清空缓冲区 |

> **源文档的 `TG_DOWNLOAD_RESOURCE`(单资源下载 RPC)不存在**。页面单项入口在 content 内调用 `downloadOne`;Popup 统一用 `downloadBatch` 发送有序资源 ID。

### 7.2 真实请求/响应类型(`content/types.ts`)

源文档 `ReqGetResources/RespGetResources/...` 类型名**不存在**,真实前缀 `Content*`:

| 真实类型 | 字段 | 源文档叫法 |
| --- | --- | --- |
| `ContentGetResourcesResponse` | `{resources: MediaResource[]; count: number}` | `RespGetResources` |
| `ContentGetDownloadQueueResponse` | `{scopeId; revision; tasks[]}` | — |
| `ContentDownloadBatchRequest` | `{resourceIds: string[]}` | — |
| `ContentDownloadBatchResponse` | `{accepted: boolean; count: number}` | `accepted` 表示至少一个输入成功回查并交给 Manager；`count` 是成功回查的输入数 |
| `ContentCancelDownloadTaskRequest`（Plan 024） | `{taskId: string}` | — |
| `ContentCancelDownloadTaskResponse`（Plan 024） | `{accepted: boolean}` | — |
| `ContentClearBufferResponse` | `{cleared: boolean; count: number}` | `RespClearBuffer` |

Popup 批量下载只传 `resourceIds`;content 从 `ResourceBuffer` 按请求顺序回查完整 `MediaResource`，交给 `enqueueMany` 后立即返回 `accepted/count`，缺失项记录后继续；任务终态由版本化队列快照表达。

### 7.3 DOM 事件（`core/events/types.ts`）

- `ExtensionEvents` 包含 `showUpgradeModal` 与版本化 `downloadQueueUpdated` 快照。
- `ContentEvents` 包含 `messagesUpdated {messages}`、`downloadProgress {taskId, sourceId, progress, receivedBytes, totalBytes, bytesAreEstimated, filename?}` 和 `injectedReady`；`filename` 只在 injected 已确认实际保存名时发送。
- `downloadProgress` 驱动 Telegram 按钮和下载管理列表的展示,并只允许共享下载管理器更新显式活动任务且 `taskId/resourceId` 同时匹配的进度；它不表示额度或下载终态,也不能启动、取消、完成或移除任务。
- 资源缓冲不发布事件；下载管理器在任务和进度变化时广播完整快照,Popup 初始化再通过 `getDownloadQueue` 查询一次以补齐关闭期间的状态。
- DOM 事件通过 `DomEventEmitter`/`DomEventSubscriber`,Telegram 主消息扫描与按钮订阅统一使用前缀 `'tg_dl_'`。

### 7.4 injected RPC（content↔injected，`injected/injected-register.ts`）

源文档 §9.1 的 `GET_STREAM_URL` 常量**不存在**。Telegram provider 在固定 EventRpc 通道中只注册有真实调用方的方法:

| 真实方法 | 参数 | 说明 |
| --- | --- | --- |
| `queryAMediaResources(params)` | `{identities: TelegramAResourceIdentity[]}` | scanner query-only 读取 A LocalDb 当前镜像；单批最多 50 条，不 refresh |
| `prepareAMediaResource(params)` | `{taskId:string; identity:TelegramAResourceIdentity}` | FIFO 队首等待 A Worker ready 并解析单个 message/WebPage Document；首次 miss 可复用一次 full refresh，取消返回明确 cancelled 结果 |
| `getKMediaResources(params)` | `{messageFullIds: string[]}` | K 内部 `message.media` 判型资源 |
| `downloadMedia(params)` | `{source: IMediaSource}` | 完成单资源读取、处理和浏览器下载触发后返回 `{success:true}` |
| `cancelDownloadMedia(params)`（Plan 029） | `{taskId:string}` | 尽力取消当前 A prepare waiter 或 Telegram injected 活动传输，返回 `{accepted:boolean}` 仅供诊断；本地取消终态不依赖该响应 |
| `getCurrentSidebarSource()` | — | A sidebar 当前缓存 |
| `getSidebarDownloadParamsBatch(params)` | `{items: ...[]}` | A sidebar 下载参数批量查询,不是下载批量 |

`queryAMediaResources` 请求上限 16 KiB、响应上限 256 KiB；`prepareAMediaResource` 请求上限 4 KiB、响应上限 16 KiB，两者只允许 content 通过 EventRpc 调用。A identity 只允许 document、message 和 WebPage 三种有限结构；prepare 响应只传 `cancelled` 与可选资源，资源仍限于 identity、类型、mediaHash、文件名/MIME/可选大小、documentId 和可选音视频元数据，不传完整 document、fileReference、accessHash 或 Blob。prepare 客户端使用现有长调用 timeout，用户取消负责提前释放本地队列。RPC register 是合同源，生成客户端必须通过 `rpc-generate:check`。

`downloadMedia` 的 JSON parser 显式重建 `IMediaSource`，包括可选 `documentId` 与 `codec`，并要求必填 `taskId`。字段类型错误在 MAIN world handler 执行前拒绝。TypeScript 请求类型不代替不可信 EventRpc 边界解析。响应为 `{success:true,cancelled:boolean}`，取消终态使用成功响应，不依赖跨 EventRpc 的自定义 Error 类型。Blob 路径若按响应 MIME 修正文件扩展名，必须在保存前通过 §7.3 的匹配进度事件同步实际文件名。

K 内部资源由 `sites/telegram/injected/services/KMediaResourceService.ts` 实现:直接用 `messageFullId` 调 `chat.getMessage`,复用 §4.2 的共享 document 元数据规则，document 类构建 `stream/<encoded JSON>` URL;photo 只返回内部确认,最终 URL 在 content 层用候选 DOM 合并。客户端使用模块级具体 `InjectedChannel`。固定 DOM transport 不做身份认证,MAIN 不持有额度、token、storage 或后端权限。

Telegram 下载器另发一个固定 `DOWNLOAD_PROGRESS_EVENT`，payload 为 §7.3 的 task ID、source ID、百分比、累计字节、总字节、估算标记和可选最终文件名。该事件不是第二套 RPC，也不表示额度或下载终态；页面可伪造它，content 只允许它修改匹配按钮、显式活动任务及两处下载管理 UI 的展示数据，并保持 `taskId/resourceId` 双 ID 匹配合同。

## 8. 配额前置

额度统一位于共享下载管理器执行单个任务之前:每个资源独立调用一次 `quotaService.checkAndConsume(1)`。明确额度不足只跳过当前项并显示升级 modal;额度服务异常记录 error 后 fail-open。`downloadMany` 只入队,不预检整批额度；当前项失败后唯一 worker 继续下一项。配额档位数值属 `@../003.积分系统/`,本文不重复。

Plan 029 取消边界：`waiting` 任务取消后永不进入额度检查；活动任务可能已经发出额度请求，取消不承诺撤销该请求。`checkAndConsume(1)` 已成功时不退款；额度响应晚于本地取消时只被后台观察，不启动 injected 传输、不记录额度不足或下载失败。

## 9. 首页链接校验(不属扩展端)

源 feat.004 §11 描述的「首页 Smart Link Recovery Card、`WEB_PARSE_CLICK`/`WEB_PARSE_FAILED`、`copy-link-desktop/phone.png`」**完全属于 website**,在 `extension/src` 下 0 命中:

- `website/src/scripts/homepage/mark.ts`:定义 `WEB_PARSE_CLICK` / `WEB_PARSE_FAILED`。
- `website/src/download/scripts/workspace.ts`:实际打点。
- `website/public/copy-link-desktop.png`、`copy-link-phone.png`:引导图。

本文不承接 §11。website 首页校验如需独立 tech,应在 website 相关域新建。

## 10. 错误矩阵(实际实现)

### 10.1 扫描错误

| 场景 | 处理 | 位置 |
| --- | --- | --- |
| 未知版本 | `logger.warn` + `return []` | `ResourceScanner.scan` |
| K 活动聊天根缺失 | 跳过整轮，不回退隐藏聊天 DOM | `findActiveKChatRoot` / `KVersionScanner.collectMessageContexts` |
| K 版 messageId 或 `contentWrapper` 缺失 | 静默跳过当前消息 | `KVersionScanner.collectMessageContexts` |
| K 候选节点缺少 messageId/peerId | `return null`,跳过当前候选 | `KVersionScanner.buildCandidate` |
| K 内部资源查询失败 | 记录错误并返回空列表,后续扫描可重试 | `KVersionScanner.getInternalResources` |
| K photo 无 DOM URL 或 document 无内部 URL | `return null`,不注入按钮 | `KVersionScanner.buildResource` |
| A 版 DOM URL 无效 | `urlResult.isValid===false` → `return null` | `AVersionScanner.createImageResource/createVideoResource` |
| A LocalDb 尚未同步或 identity 无 document | `.Audio` / `.File` 扫描不访问 LocalDb，立即生成 placeholder；点击仍无真实参数则当前项报错重试 | `AVersionScanner` / `DownloadManager` |
| A 点击解析 RPC 失败 | 当前 FIFO 项失败并输出资源与消息身份；批量继续下一项 | `DownloadManager.performDownload` |
| A 同 identity 多 document | 记录 identity、候选 ID/类型/大小 warning；稳定选择一个主项 | `AMediaResourceService.selectPrimaryDocument` |
| A 版相册含未加载视频 | 不读取本轮相册 DOM URL，等待后续 DOM 扫描 | `AVersionScanner.buildMessage` |
| A Story viewer 关闭、媒体未加载或 URL 不受支持 | 不生成资源并移除 Story 按钮；后续 DOM/load 事件重试 | `AStoryDownloadController` / `AStoryViewerScanner` |
| A Story 单轮 DOM 同步异常 | 记录错误、移除当前按钮，后续 viewer mutation 可重试 | `AStoryDownloadController.reconcileSafely` |

### 10.2 注入错误

| 场景 | 处理 | 位置 |
| --- | --- | --- |
| 定位容器失败或聊天切换中没有活动根 | `logger.warn('未找到容器')` + `continue` | `ButtonInjectionManager.handleMessagesUpdated` |
| 已确认视觉资源找不到 A/K 稳定媒体宿主 | 当前轮不注入该圆钮;下一轮扫描随 DOM 就绪重试 | `TelegramMediaSurfaceLocator` / `MediaDownloadButtonRenderer.reconcile` |
| 圆形按钮 reconcile 失败 | 记录父消息 ID 与资源数;不阻断旧 checkbox/父消息按钮注入 | `ButtonInjectionManager.handleMessagesUpdated` |
| A Story 按钮重复 DOM 或当前媒体切换 | 保留一个按钮、原位换绑新资源并重新定位 | `AStoryDownloadButtonRenderer.reconcile` |
| 父按钮 DOM 被局部删除或移动 | 当前轮重建；下载中从内存恢复 busy/progress | `ButtonRenderer.reconcile` |
| 父按钮插入失败 | 清理本次失效 DOM 实例并记录完整消息/插入点；保留下载状态供下轮重试 | `ButtonRenderer.replaceButton` / `ButtonInjectionManager.handleMessagesUpdated` |
| 消息缓存未找到(点下载) | `logger.error('未找到消息')` + return,不下载 | `ButtonInjectionManager.handleButtonClick` |
| 圆形按钮 resourceId 缓存缺失 | 记录父消息 ID + resourceId 后返回,等待重新扫描 | `ButtonInjectionManager.handleMediaButtonClick` |
| 页面下载管理入口无法取得当前版本原生向下控件锚点（Plan 024） | 本轮隐藏入口；保留队列，后续既有页面更新重新锚定，不阻断下载 | `DownloadQueueWidget` |

### 10.3 RPC 错误

| 场景 | 处理 | 位置 |
| --- | --- | --- |
| K 查询参数非法 | `getKMediaResources` 参数解析抛错,EventRpc 返回失败,不执行资源查询 | `sites/telegram/injected/index.ts` |
| A query-only 参数非法或超过 50 条 | `queryAMediaResources` parser/service 抛出可定位错误 | `sites/telegram/injected/index.ts` / `AMediaResourceService.ts` |
| A Worker 尚未 ready | 当前 prepare 保持等待；用户取消立即释放本地任务并清理对应 waiter，不使用固定 sleep | `WorkerInterceptor` / `AMediaResourceService` |
| A prepare identity 非法或出现多个候选 | `prepareAMediaResource` 拒绝或返回空资源，当前项失败并允许用户重试；0 个候选继续等待 LocalDb 增量，不与歧义合并 | `sites/telegram/injected/index.ts` / `AMediaResourceService.ts` |
| K 内部消息不存在 | 当前资源查询返回空项,content 下次扫描可重试 | `KMediaResourceService.ts` |
| 下载 service 抛错 | `downloadMedia` 失败,content 当前单项结束,批量继续后续项 | `DownloadServices.ts` / `core/content/download/download.ts` |
| A `mediaHash` 引用非法 | 下载前拒绝；不输出原始引用 | `DownloadServices.assertMediaHashUrl` |
| Worker 返回 undefined/畸形对象/非 Blob | 没有可保存字节时拒绝；只要 document 返回 Blob 就直接保存，不按 MIME 拒绝；记录 sourceId/type/documentId/声明大小/失败阶段和安全错误类型 | `DownloadServices.handleSingleDownload` |
| Worker 返回错误、postMessage 抛错或超时 | 拒绝当前唯一 request ID，清理 timer/waiter/request，迟到响应忽略；错误 URL/mediaHash 脱敏 | `WorkerInterceptor` |
| 取消的 task ID 已完成或不存在（Plan 029） | 本地返回未接受并刷新最新快照，不弹失败提示；injected 返回值不改变队列 | `DownloadManager` / `DownloadServices` |
| 底层取消或资源清理失败（Plan 029） | 记录 task ID、阶段和原始错误；本地任务保持已删除，迟到响应被观察并丢弃 | `DownloadManager` / `WorkerInterceptor` / `DownloadServices` |
| `updateBadge` 无接收者 | `.catch(()=>{})` 静默 | `ResourceBuffer.notifyUpdate` |

## 11. 删除源文档的判定

源 `docs/feat/feat.004.telegram资源扫描.md` 的扩展端扫描注入技术内容(§1-§10 数据结构/扫描器/缓冲区/按钮/协议/RPC/错误)已被本文承接并按代码修正。**§11 首页链接校验属 website 域,不在本文承接范围**(website 域无独立扫描文档,相关埋点口径见代码)。源 feat.004 扩展端扫描部分已由本文承接删除。

## 12. 与源 feat.004 的差异汇总

| 源 feat.004 说法 | 代码实际 | 章节 |
| --- | --- | --- |
| 源文档列出的 `TG_*` 资源 RPC 常量 | 不存在,content 只保留 camelCase RPC(getResources/getDownloadQueue/downloadBatch/clearBuffer) | §7.1 |
| `TG_DOWNLOAD_RESOURCE` 单资源 RPC | 不存在,只有 `downloadBatch` | §7.1 |
| `TG_GET_PROGRESS`/`RespGetProgress.progresses` | 不提供按资源查询的旧协议；改为 `getDownloadQueue` 返回当前页面版本化未完成任务快照 | §7.2 |
| `ReqGetResources/RespGetResources` 类型名 | 改 `Content*` 前缀 | §7.2 |
| `UPDATE_BADGE`/`RESOURCE_BUFFER_UPDATED`/`TG_MESSAGES_UPDATED` | `updateBadge()` RPC、无资源缓冲推送事件、`tg_dl_messagesUpdated` DOM 事件 | §5/§6.1/§7.3 |
| `GET_STREAM_URL` 单条 RPC | 不再暴露;K 扫描使用 `getKMediaResources`,下载只用完整 `downloadMedia` | §7.4 |
| `MediaResource` 字段 | 漏必填 `metadata: DownloadMetadata` | §2.1 |
| `type: image/video` | `RESOURCE_TYPES.PHOTO/VIDEO` 枚举 | §2.1 |
| `getStreamUrl` 响应 | 该 RPC 已删除;媒体元数据直接进入 `MediaResource` / `IMediaSource` | §7.4 |
| 按钮三态含独立「完成」文案 | 无业务下载状态机,按钮状态不参与下载控制 | §6.2 |
| 下载中文案「第 X/Y 个」 | 不维护业务状态；主消息按钮仅显示瞬时“剩余数 + 当前百分比” | §6.2 |
| 版本检测 `/k/` `/k#` | 只看 pathname 首段 `a`/`k` | §3 |
| §11 首页校验 | 属 website 不属扩展端 | §9 |

未冲突但源文档缺漏:`SidebarScanner` 独立子系统、A 版 sidebar RPC 缓存优先、每资源独立额度检查、批量≥50 确认对话框。
