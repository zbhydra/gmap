# Telegram 大文件下载与资源元数据

> 定义 `extension/` 的 Telegram A/K 大文件存储、资源身份、元数据和临时内容合同。

## 1. 目标与边界

### 1.1 目标

- 保留 `extension/` 当前已经验证可下载约 4 GiB 文件的 A progressive、K stream 和 A mediaHash 路径，只消除 `SegmentDownloader` 把完整文件聚合在 Renderer 内存的问题。
- `SegmentDownloader` 预检确认文件达到调用方显式阈值且浏览器支持 OPFS 时，把分块持续写入扩展自有临时文件；Telegram 默认阈值为 200 MiB，其它情况沿用内存聚合。
- OPFS 路径的 Renderer 内存只随并发分块数量变化，不随文件已下载字节线性增长。
- A/K 资源尽可能携带 Telegram 已提供的文件名、大小、视频或音频时长和当前资源封面。
- 已分类为可重试的网络中断与 408 分块响应在页面存活的同一任务内持续重试失败 position；其它单项错误仍允许失败并由用户重新操作，不增加恢复、补偿或跨标签页协调。

### 1.2 不包含

- 修改 A/K 下载入口、网络协议、Range 行为、额度或进度；FIFO 与取消终态由 `@tech-扩展端TG扫描.md` 统一定义。
- 修改 Telegram A Worker 的内存阈值或官方 OPFS 目录。
- 调用 K `downloadToDisc`、直接导航 A `/download/`、直接导航 K `/stream/` 或使用 `chrome.downloads` 请求 Telegram 链接。
- 页面刷新或浏览器重启后的任务恢复、断点续传、暂停和下载历史。
- 跨刷新续传、持久化资源身份、manifest、分片清单、恢复状态机和 online/offline 监听。
- OPFS 文件注册表、持久 timer、后台清理状态、下载完成桥接或跨标签页协调；只保留成功 handoff 后当前页面内 120 秒单 entry timer。
- 为无法确认身份的资源猜测 Document、大小、时长或封面。
- 修改 Telegram 官方代码、后端或网站。

## 2. 已证实现状

### 2.1 当前下载路径

`extension/` 当前正式路径如下：

| 来源 | 当前执行路径 | 本轮处理 |
| --- | --- | --- |
| A progressive video | 同源 `/a/progressive/...` → `SegmentDownloader` | 保留网络路径，增加 OPFS sink |
| K Document | 同源 `/k/stream/...` → `SegmentDownloader` | 保留网络路径，增加 OPFS sink |
| A/K DOM HTTPS | `SegmentDownloader` | 保留；达到同一阈值时使用 OPFS |
| A/K DOM Blob | `BlobDownloader` | 不变；Blob 已由页面持有，转存 OPFS不能消除既有 Blob 内存 |
| A mediaHash | Telegram A GramJS Worker | 不变；继续使用 Telegram 官方 memory/OPFS 选择 |

A/K stream URL 作为浏览器 navigation 会失败，但当前 `SegmentDownloader` 发出的同源 Range fetch 已在真实路径中工作。本轮不把这些 URL 交给浏览器下载，只替换 Range 响应完成后的存储位置。

### 2.2 内存问题

`SegmentDownloader` 当前流程是：

```text
Range 预检
  -> 按并发 20 下载分块
  -> 全部分块保存到 ArrayBuffer[]
  -> new Blob(chunks)
  -> object URL
  -> 浏览器保存
```

真实 3,447,563,420 字节 A 文件被切为 6,576 个 524,288 字节分块。下载期间页面 Renderer 从约 900 MB 增长到约 4.5 GB，站点 OPFS 没有对应增长。增长来自扩展完整保留 `ArrayBuffer[]`，不是网络请求本身。

### 2.3 Telegram A Worker

A mediaHash 是 Telegram A Worker 的内部媒体引用，不是 HTTP 下载链接。普通文件、音频和 Story 等现有入口会把 `mediaHash:document{id}` 交给已捕获的 GramJS Worker。

Telegram 官方 Worker 在桌面端已知文件大于约 2000 MiB、移动端大于约 512 MiB 且支持 OPFS 时写入官方 `downloads/`；否则在 Worker 内存聚合。该路径已经有独立的进度、取消和 LocalDb 合同，本轮不修改其阈值或实现。

## 3. SegmentDownloader 存储合同

### 3.1 唯一选择点

存储选择只发生在 Range 预检成功、取得可靠 `totalSize` 之后：

| 条件 | Sink |
| --- | --- |
| `totalSize < opfsThresholdBytes` | memory |
| `totalSize >= opfsThresholdBytes` 且 `navigator.storage.getDirectory` 与 OPFS writable 可用 | OPFS |
| `totalSize >= opfsThresholdBytes` 但 OPFS 不支持 | memory |

Telegram 下载默认阈值为 `200 * 1024 * 1024` 字节，生效值由 Telegram injected 配置 owner 读取，并由 `DownloadServices` 显式传给 `SegmentDownloader.download`；core 下载器不依赖站点模块。阈值来自可信内部配置，客户端不重复校验。OPFS 已选中后，创建、写入、关闭或读取 File 失败都使当前任务失败；不得在已下载部分内容后切换到内存或重新开始第二条路径。统一配置的读取和跨上下文同步见 `@tech-扩展端TG扫描.md` §4.7。

### 3.2 共同写入流程

memory 与 OPFS 只替换存储 sink，预检、Range、并发、重试、进度和取消继续共用一套流程：

1. 每个分块仍按当前 Range 请求取得 `ArrayBuffer`。
2. 分块校验完成后立即以 `start` 为 position 写入当前 sink；写入完成后该分块任务才结束。
3. OPFS 写入在同一 writable 上按调用顺序串行，等待写入的分块数量不会超过既有并发数。
4. `executeBatch` 不再返回完整 `ArrayBuffer[]`；memory sink 自己保留分块，OPFS sink 写完即释放调用方引用。
5. 全部分块完成后，memory sink 生成 Blob；OPFS sink 关闭 writable 并从 file handle 取得 File。
6. 两类结果都使用现有 object URL 与 `<a download>` 保存，并沿用现有 100% 终态。

可重试只包括现有 Range 408 与浏览器在分块 `fetch`/响应体读取阶段抛出的网络 `TypeError`。每个 position 在自己的并发槽位内沿用固定 1 秒等待独立持续重试，不设置次数上限；position 成功后才释放槽位，整批所有 position 成功后才开始下一批，因此单个任务的活动请求不超过 20，也不重放同批其它 position。每批创建一个局部 AbortController，每个 position 使用 `AbortSignal.any` 组合用户任务 signal 与批次 signal。任一 position 抛出 non-retryable 时保存原错误并 abort 批次，等待同批所有 fetch/retry delay 退出后重抛原错误。用户取消发出同一 abort，但本地 FIFO 按 `@tech-扩展端TG扫描.md` 立即推进；旧批次退出、错误消费和 sink 清理由后台执行 Promise 自行收敛，失败只记录。此前已写 position 与累计进度保留到清理完成。离线时该任务允许占住 FIFO 队首，用户使用现有 Cancel 立即退出业务队列。

默认并发 20、分块 512 KiB 至 1 MiB 时，OPFS 分支由扩展持有的有效分块数据约为 10–20 MiB，加上浏览器 fetch/write 开销后仍应保持有界。浏览器内部缓存可能波动，但不得随完整文件大小线性增长。

### 3.3 OPFS 所有权

`SegmentDownloader` 在 core 内统一拥有站点无关的 `extension-downloads/` 目录、随机文件名和清理函数，不接受站点目录参数。它不读取、覆盖或删除 Telegram 官方 `downloads/`。文件名不保存业务 ID、原文件名或媒体 URL。

OPFS 能力检查只决定开始时选择哪种 sink。以下情况不增加额外防护：

- 可用空间不足、write/close/getFile 失败：当前项失败。
- 浏览器在能力检查后撤销或破坏 writer：当前项失败。
- 浏览器不支持 OPFS：从开始就使用现有 memory sink。

## 4. 资源身份与元数据

### 4.1 现有模型

现有 `MediaResource` 已包含 `filename`、`size`、`thumbnail`、`documentId`、`codec`、`width`、`height` 和 `duration`。`TelegramDocumentMetadata` 继续负责 A/K Document 结构化字段，content scanner 负责当前 DOM 封面；不新增平行元数据对象或缓存。

### 4.2 Telegram A identity

A 使用三种有限 identity 补元数据或解析现有 mediaHash 下载参数：

| kind | 字段 | 来源 |
| --- | --- | --- |
| `document` | `documentId` | strict progressive、Story、侧栏已知媒体 ID |
| `message` | `chatId + messageId` | 没有直接 ID 的普通消息附件 |
| `webPage` | 规范化 URL | 同时存在可见 WebPage Document 与 identity link 的网页预览 |

规则如下：

1. strict progressive 只接受同源 pathname `/a/progressive/document{id}`；解析出的 ID 只补 identity 和元数据，不改变 progressive 下载 URL。
2. scanner 的批量 query-only 只读当前 LocalDb 镜像，不触发 refresh；响应只包含成功资源，缺席统一表示当前没有可用元数据。
3. query-only 命中 message/WebPage 时，scanner 只合并 `filename/size/mimeType/type/codec/width/height/duration` 展示字段；原 placeholder identity、空 URL 和待 prepare 标记保持不变，不合并响应中的 mediaHash 或 documentId。
4. FIFO 队首对所有 message/WebPage placeholder 调用单项 prepare，无论 scanner 是否已补展示字段；prepare 在额度检查前等待 Worker ready，并在首次缺席时只复用现有 single-flight full refresh 一次。空全量镜像后继续等待 LocalDb 增量事件并重查同一 identity，不轮询、不固定 sleep、不再次 refresh。
5. message/WebPage 候选去重并排除 `application/x-mpegurl` 后必须恰好一个；0 个候选表示网络数据尚未到达并继续等待，多个候选是已确认歧义并失败，不按大小、类型或 ID 猜主项。
6. WebPage 只在配置指定的 Document root 与 identity link 同时存在时建模。DOM href 与 LocalDb 原始 URL 使用相同的协议补全和 URL parser 规范化后比较；没有 link 时不生成资源。
7. 相册、付费媒体和可见视频依赖自身 strict progressive ID，不回退父 message identity。

### 4.3 字段 owner

| 字段 | Canonical owner |
| --- | --- |
| 文件名 | `TelegramDocumentMetadata` 标准化结果；缺失时使用现有确定性生成名 |
| 文件大小 | Document 或 Range 预检提供的真实值；共享展示元数据缺失时保持未知，0 B 是有效大小 |
| 视频/音频时长 | Telegram Document attribute 的秒数；缺失保持未知 |
| 封面 | 当前资源自己的 DOM `img`、`video.poster` 或侧栏 data URI；加载失败显示类型占位 |

K 继续从扫描阶段选定的真实 Document 生成 stream URL、文件名、大小和时长。共享 `TelegramDocumentMetadata.size` 可以缺失；`KMediaResourceService.normalizeDocument` 在构造 stream URL 的入口只接受 size 已知的 Document，并通过 K 内部 downloadable 类型把 size 收窄为 number。size 缺失时不生成 K 资源，不制造 0，也不回退其它路径。

## 5. 临时内容生命周期

### 5.1 正常终态

| 结束方式 | memory sink | OPFS sink |
| --- | --- | --- |
| 成功 | Blob URL 按现有 1 秒延迟释放，不受 OPFS timer 影响 | File/object URL handoff 后保留 120 秒，再删除当前任务自己的 entry |
| 失败 | 丢弃分块引用 | 关闭或 abort writer 后尝试删除当前文件 |
| 取消 | 发出 abort 并后台丢弃分块 | 发出 abort，并后台尝试终止 writer 和删除当前文件 |
| 页面刷新/关闭 | 页面内存释放 | 当前写入可能留下临时文件或浏览器内部临时数据 |

可重试错误不是任务终态，不触发 sink discard；只有成功、取消或真正不可重试错误才结束当前页面任务。本合同不跨页面刷新或浏览器重启续传。

成功文件不能在触发 `<a download>` 后立即删除，因为扩展没有浏览器已经读完 File 的完成通知。`SegmentDownloader` 在 handoff 完成后只对具体 `OpfsDownloadSink` 安排 120 秒 timer，timer 捕获该任务的 file handle 并复用 `discard` 删除唯一 entry，不递归清目录，也不持有 memory sink。扩展不监听浏览器下载完成；若浏览器 120 秒后仍未落盘，允许本次保存失败并由用户重试。object URL 继续由既有 1 秒 owner 释放，不与 OPFS timer 合并。

### 5.2 初始化清理

`SegmentDownloader.ts` 导出站点无关的清理函数；Telegram 的 `startTelegramInjected` 在 provider 启动时 fire-and-forget 调用一次。清理函数异步尝试递归删除 `extension-downloads/`，异常记录后忽略，不阻断扫描或下载。`DownloadServices` 不负责初始化生命周期。任务内 120 秒 timer 不持久化；页面提前关闭导致 timer 消失时，由下次初始化处理残留。初始化清理没有重试、注册表、后台状态或跨标签页协调：

- 用户在 50% 时关闭浏览器，部分文件可能保留。
- 下次打开任一 Telegram 页面并加载扩展时发起一次清理尝试。
- 同 origin 其它 tab 正在持有 writer 时，删除可能失败；当前页面不重试，下次初始化再尝试。
- 用户不再打开 Telegram 或清理持续失败时，文件可能长期存在。

这是用户已接受的生命周期。扩展只清理自己的目录，不能把清理扩大到 Telegram 官方存储。

## 6. Popup 资源行

- 保持 600px 最小宽度和 64×48px 封面槽位。
- 五列为“复选框 / 封面 / 文件信息 / 大小 / 下载动作”；表头和资源行共享同一 CSS grid 列定义。
- 文件信息第一行显示文件名，13px、单行省略并提供完整 `title`；第二行显示类型 badge 和存在时的时长。
- 大小与时长只在字段存在时显示；大小复用 `formatDownloadBytes`，时长小于一小时显示 `m:ss`，一小时及以上显示 `h:mm:ss`。
- 封面加载失败后原位显示类型占位，不改变行高、身份、选择状态或任务顺序。

下载队列继续显示现有文件名、大小、进度和速度，不增加封面、时长或新的状态。

## 7. 文件范围

```text
extension/src/core/injected/downloaders/SegmentDownloader.ts
extension/src/sites/telegram/injected/services/DownloadServices.ts
extension/src/sites/telegram/injected/services/TelegramDocumentMetadata.ts
extension/src/sites/telegram/injected/services/ALocalDbServices.ts
extension/src/sites/telegram/injected/services/AMediaResourceService.ts
extension/src/sites/telegram/injected/services/ASidebarMediaService.ts
extension/src/sites/telegram/injected/index.ts
extension/src/sites/telegram/content/scanner/
extension/src/sites/telegram/content/dom/TelegramDomConfig.ts
extension/src/sites/telegram/content/services/ResourceBuffer.ts
extension/src/core/types.ts
extension/src/injected/types.ts
extension/src/injected/injected-register.ts
extension/src/content/rpc/injected.rpc.ts
extension/src/popup/components/ResourceItem.vue
extension/src/popup/components/ResourceList.vue
extension/src/core/utils/downloadStatus.ts
extension/src/core/constants/i18n.ts
extension/src/locales/
extension/tests/
docs/feat/002.下载功能/
```

不修改 其它站点下载器、后端、网站或 Telegram 官方源码，不新增依赖。

## 8. 验收口径

- A progressive 与 K stream 继续使用当前 URL、Range 请求、进度、取消和 FIFO；不出现新的下载入口或回退。
- 小于生效阈值使用 memory sink；达到生效阈值且支持 OPFS 时使用 `extension-downloads/`；不支持时从开始使用 memory sink。默认阈值为 200 MiB，阈值 `0` 覆盖任意可靠大小。
- A 固定大文件使用 `https://web.telegram.org/a/#-1003768618383` 中的 3.4 GiB Document；K 使用现有真实目标中不小于 200 MiB 的 Document。
- OPFS 大文件在 0%、25%、50%、75% 四个进度点记录目标 Renderer memory footprint；相对 0% 峰值增量不得超过 512 MiB。
- OPFS 使用量随写入增长；完成前不得同时出现接近完整文件大小的 `ArrayBuffer[]` 或 Blob 内存增长。
- A/K 最终文件大小和 SHA-256 与对应 Range 内容一致，文件名保持现有结果。
- OPFS 成功 handoff 后 120 秒只删除该任务 entry，不删除其它正在下载或已完成任务；浏览器仍未落盘导致失败属于已接受风险。
- 可重试网络中断超过原有限次数后仍由各 position 在自己的并发槽位内独立重试，已写入内容与进度不回退、不重复累计；整批完成后才推进，网络恢复后继续完成。
- 重试等待期间取消会立即从业务队列移除当前任务并继续下一项；abort 与当前 OPFS 文件删除在后台尽力执行，不可重试错误仍按原路径失败和清理。
- 下载到 50% 后点击取消，任务立即消失且 FIFO 继续下一项；正常环境应观察到当前 OPFS 文件被删除，清理失败只记录且不恢复任务。
- 下载到 50% 后关闭浏览器，再次打开 Telegram 时观察到 `extension-downloads/` 清理尝试；清理失败只记录结果，不判定为扩展下载失败。
- OPFS 不支持的受控用例仍进入现有 memory sink，不新增其它路径。
- A mediaHash 继续使用 Telegram Worker；大于官方阈值时沿用官方 OPFS，小于阈值时允许 Worker 内存聚合。
- 同消息多资源与 WebPage 的文件名、大小、时长和封面不串值；未知字段不显示伪造值。

## 9. 上游证据

- Web Platform File System 标准：[`FileSystemFileHandle.createWritable`](https://fs.spec.whatwg.org/#api-filesystemfilehandle-createwritable)、[`FileSystemWritableFileStream.write`](https://fs.spec.whatwg.org/#api-filesystemwritablefilestream-write) 和 [`FileSystemFileHandle.getFile`](https://fs.spec.whatwg.org/#api-filesystemfilehandle-getfile)。这些契约是 Window OPFS PoC 的依据。
- Telegram A 当前 Worker OPFS 实现：[`downloadFile.ts FileView`](https://github.com/Ajaxy/telegram-tt/blob/3cd724ed8ebf8e1c907ef75ffb4cdbdd1ed2dc0f/src/lib/gramjs/client/downloadFile.ts#L50-L110)；它只证明 OPFS File 的方案与生命周期可行，不证明本方案选择的 Window `createWritable` 调用链。
- Telegram A 官方阈值与初始化清理：[`windowEnvironment.ts`](https://github.com/Ajaxy/telegram-tt/blob/3cd724ed8ebf8e1c907ef75ffb4cdbdd1ed2dc0f/src/util/browser/windowEnvironment.ts#L103-L145)。
- K stream navigation 被拒绝，但媒体 Range 请求可用：[`serviceWorker/stream.ts`](https://github.com/morethanwords/tweb/blob/3501e76c9c74b2d95522fabfad6bc43b4ed27217/src/lib/serviceWorker/stream.ts#L318-L353)。本方案继续使用已验证的页面 Range fetch，不导航该 URL。
