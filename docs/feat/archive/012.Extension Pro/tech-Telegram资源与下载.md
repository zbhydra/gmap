# Extension Pro Telegram 资源与下载

## 1. 文档职责

本文定义 Extension Pro 的 Telegram 资源身份、A/K 解析、当前页面 FIFO、额度、进度、取消、分块存储和临时内容生命周期。页面布局、账号和 MV3 上下文见 `@tech-架构与页面集成.md`。

主插件源码和提交只提供已验证证据。本文件是 Pro 的唯一目标合同；后续主插件变化不会自动改变本文件。

## 2. 设计原则

- 只有一条正式下载流程：入口提交资源，队列准备资源并检查额度，injected 执行真实传输。
- 约束集中在真实入口和跨上下文边界；内部模块依赖统一资源与任务合同，不逐层重复校验。
- 扫描接受 A/K 当前页面已经提供的合理媒体形态，但不能把没有明确归属的 Document 猜给某条消息。
- 普通失败结束当前项并允许用户重试；不增加兼容、备用下载链、后台恢复或金融级补偿。
- 测试只覆盖本轮真实用户行为和已验证故障，不为删除旧实验、假设异常或重复分支增加测试。

### 风险分级

- 大问题：页面崩溃、大量资源/数据泄露，或用户操作长期卡死。只有这些已证问题可以驱动新的控制机制。
- 小问题：低概率的临时资源未完全回收、轻微泄露、并发时轻微数据丢失、旧请求短暂继续等，用户刷新或重试即可修正。默认接受，不增加等待、ACK、恢复、补偿或防御测试。
- 取消必须先恢复本地可用性。底层完美停止或清理不能成为任务移除和 FIFO 推进的前置条件；任何为了完美回收而让取消长期停留的方案都不进入 Pro。

## 3. 当前已证问题

### 3.1 P0 前正式流程被实验旁路

P0 前的工作区把以下实验直接接入探测面板：

- A 官方浏览器下载按钮。
- K stream 直链负对照。
- K `downloadToDisc` 原生黑盒。
- K File System Access Range 下载。

这些入口明确绕过当前唯一队列，因此不执行额度、状态同步、进度、取消、埋点和统一错误反馈。实验 RPC 还进入了正式 register 与默认 Playwright project。

源码处理已完成：实验源码、UI、RPC、i18n、fixture 和默认 project 已删除；构建、启动与默认 Playwright 基线仍待 P0 验证。不为“确认已删除”新增测试。

### 3.2 A Document 依赖偶然 LocalDb 更新

当前 A scanner 为 `.Audio/.File` 建立 `chatId + messageId` placeholder，点击后从 MAIN LocalDb 镜像查询 Document。现有镜像存在三项已复现问题：

- `BroadcastChannel` 构造总能成功，按 1–4 试探会固定停在 `tt-global_1`，不能代表当前账号 slot。
- BroadcastChannel 不重放订阅前的 full snapshot；被动等待十分钟不会使缺失 Document 自动出现。
- 点击 Telegram 官方按钮后页面触发相关内部状态更新，Pro 随后才能查询成功。

主插件 `d4074bf7` 已验证按 URL account slot 选择频道、账号级镜像和 cache miss 主动 full snapshot；`95e79e8f` 又把扫描 query 与队首 prepare 拆开。Pro 迁移这套最终行为，不保留旧聊天轮询、四频道试探或第二查询路径。

### 3.3 A 资源身份不完整

当前 Pro 只支持 message identity，并在同一消息有多个 Document 时按 playlist、大小和 ID 猜主项。它无法稳定表达：

- strict progressive 已知的 Document ID。
- 普通消息附件的 message identity。
- WebPage Document 的 URL identity。

目标使用 `document | message | webPage` 三种有限 identity。message/WebPage 只在当前 LocalDb 中能够唯一建立归属时返回资源；不按大小或顺序猜测。

### 3.4 K 资源分派与 size 过宽

当前 K parser 把缺失 size 制造为 `0` 后仍生成 stream URL，并且尚未完成 WebPage media 的正式分派。目标行为：

- 主消息 Document 继续选择已经验证的最佳非 playlist 资源。
- WebPage 有 Document 时复用同一 Document 入口；没有 Document 但有 photo 时使用当前 DOM 图片。
- stream URL 必须来自具备真实 size、access hash、file reference 和 dc id 的 Document；缺失时不生成该资源。

### 3.5 分块下载按文件大小占用内存

当前 `SegmentDownloader` 保存全部 `ArrayBuffer[]`，完成后再构造完整 Blob。主插件真实 3.4 GiB 文件已经证明 Renderer 内存会随已下载字节增长到约 4.5 GiB。

目标沿用 `95e79e8f` 的唯一存储选择：不小于 200 MiB 且支持 OPFS 时持续写入 Extension Pro 自己的临时文件；其它情况从开始使用内存。任务中途不切换存储路径。

### 3.6 队列不能取消活动传输

当前 Pro 只能移除终态，waiting/downloading 没有取消。A Worker、Blob 和 Segment 三条正式传输已经在主插件真实路径中具备停止入口，Pro 需要把它们接回当前唯一队列。

### 3.7 分散入口不能替代队列排重

当前 Pro 在 inline、Story 和 floating UI 调用前分别查询 active task，但 `downloadQueue.enqueue` 仍无条件创建新任务。批内重复、同时点击或新增入口仍可绕过这些前置判断。目标在唯一队列按 resource ID 排重，并删除各 UI 的分散业务 gate。

## 4. 资源模型

### 4.1 统一资源

当前页面所有扫描器返回同一 `TelegramMediaResource` 语义：

- 稳定 `id`、消息 ID、资源序号、资源类型和 `sourceKind`。
- 下载 URL 或 A placeholder identity。
- 可选文件名、MIME、大小、缩略图、Document ID、编码、宽高和时长。
- K Document 保留 `messageFullId`；A placeholder 保留 `telegramAIdentity`。

缺失字段使用缺失语义，不制造 `0`、空文件名或假 Document ID。只有 A placeholder 的 URL 可以为空，且必须同时携带可 prepare 的 identity。

### 4.2 来源类型

| 来源          | 资源输入                               | 正式下载路径                        |
| ------------- | -------------------------------------- | ----------------------------------- |
| A DOM URL     | 当前媒体 `blob:` 或同源 HTTPS          | BlobDownloader 或 SegmentDownloader |
| A progressive | strict `/a/progressive/document{id}`   | SegmentDownloader                   |
| A mediaHash   | LocalDb Document identity              | Telegram GramJS Worker              |
| K DOM URL     | 当前 DOM 图片或视频                    | BlobDownloader 或 SegmentDownloader |
| K Document    | 当前 `chat.getMessage` 的完整 Document | `/k/stream/` + SegmentDownloader    |

来源类型只在 scanner/injected 资源入口建立一次。队列与 UI 不重新根据 URL 猜来源。

## 5. A 资源流程

### 5.1 Identity

| kind       | 字段                 | 入口                                    |
| ---------- | -------------------- | --------------------------------------- |
| `document` | `documentId`         | strict progressive、Story 或其它已知 ID |
| `message`  | `chatId + messageId` | 普通消息附件                            |
| `webPage`  | 规范化 URL           | 同一消息内 WebPage Document             |

WebPage scanner 在消息媒体范围收集已经登记 selector 命中的 URL，统一规范化和去重。只有一个 identity 值时建立 placeholder；没有值或多个不同值时不猜主项。article 与 no-article WebPage 共用同一入口。

### 5.2 Query 与 prepare

```text
scanner 收集 identity
  -> queryAMediaResources：只读当前 LocalDb，不触发刷新
  -> 命中：只补文件名、类型、大小、时长等展示字段
  -> 未命中：保留 placeholder

placeholder 到达 FIFO 队首
  -> prepareAMediaResource(taskId, identity)
  -> 等待当前 A Worker ready
  -> 查询当前镜像
  -> miss 时请求一次 full snapshot
  -> 同一时刻的 miss 共用该请求
  -> 重查：唯一候选返回真实 mediaHash；多个候选按歧义失败
  -> message/WebPage 仍无候选：等待可取消的下一次 LocalDb 增量并继续重查
  -> 任务取消或长调用期限结束时退出
```

scanner 不等待 full snapshot，不因一个 Document 缺失阻塞整轮页面扫描。prepare 发生在额度检查前，并按 task signal 等待 Worker ready 与 LocalDb 增量；取消只退出当前任务，不中止共享 refresh。

### 5.3 LocalDb owner

- 按当前 URL 的 account slot 只连接一个 `tt-global_{slot}`。
- full snapshot 替换当前账号镜像，incremental 更新合并到同一镜像。
- 不按聊天过滤增量，不轮询 URL，不在聊天切换时清空账号镜像。
- query 最终仍按 identity 精确选择，账号级镜像不会放宽资源归属。
- full refresh 只有一个 in-flight Promise、一个 listener 和一个 deadline；成功或失败后统一清理，不重试。

### 5.4 Worker owner

- A 页面必须在 `document_start` 拦截 Worker 构造。
- 只把收到无 channel `payloads.callMethod` 的 Worker 识别为 GramJS Worker；后续 media Worker 不覆盖它。
- 每个扩展请求使用唯一 request ID，响应、进度和取消都按该 ID 结算。
- prepare 与真实下载的 EventRpc 调用点显式使用主插件已经验证的页面长调用期限，不能落回 RPC 默认 30 秒；取消通过同一 request ID 发送 `cancelProgress`。
- 取消请求只负责尽力停止底层 Worker；本地任务立即移除并推进 FIFO。不增加独立 ACK、ping 或跨 tab Worker 代理。

## 6. K 资源流程

```text
K scanner 只扫描 active chat DOM
  -> 从候选节点取得 messageFullId 和当前 DOM 媒体
  -> getKMediaResources 批量读取 chat.getMessage
  -> messageMediaPhoto：确认 DOM photo
  -> messageMediaDocument：选择 Document
  -> messageMediaWebPage：Document 优先，否则 photo
  -> scanner 把内部资源与当前 DOM preview 合并
```

- video `alt_documents` 继续按分辨率、非 AV1 和大小选择已验证的最佳资源。
- `application/x-mpegurl` 不是最终原文件，不生成独立下载项。
- WebPage Document 不创建第二套类型白名单，复用统一 Document 元数据分类。
- K stream URL 只在完整下载参数和正整数 size 都存在时创建。

## 7. 当前页面 FIFO

### 7.1 唯一 collection

- 每个顶层 content document 只有一个任务数组、一个 active task 和一个同步 snapshot 出口。
- 单项、整消息、探测面板和 Story 只调用同一个 enqueue 命令。
- Pinia、面板和 inline 组件只消费快照，不保存任务副本。
- 页面刷新销毁 collection；不写 storage，不同步 background，不恢复历史。
- 同一 resource ID 同时最多一个任务：waiting 更新最新执行材料但保持位置，downloading 复用当前执行，failed 使用最新材料恢复同一任务并尾插。

### 7.2 状态

```text
waiting
  -> 直接取消并移除
  -> downloading
     -> 本地取消并立即移除
     -> quota-blocked
     -> success
     -> failed
```

任务成为队首时立即进入 downloading；该状态统一覆盖 Worker ready、资源 prepare、额度请求和真实传输，不新增 preparing/cancelling 状态。prepare 失败直接进入 failed。

Pro 保留当前终态反馈：success 5 秒，failed/quota-blocked 30 秒；失败可人工重试，终态可立即移除。取消直接结束任务，不进入终态历史。

### 7.3 队首顺序

1. prepare A placeholder 或复用当前完整资源。
2. 发布最终文件名、类型和已知总大小。
3. 检查并消耗一次额度；明确不足进入 quota-blocked，普通额度请求失败按现有 fail-open 继续。
4. 调用 injected 下载并等待真实终态。
5. 发布 success、failed、quota-blocked 或取消结果，再选择下一项。

埋点失败不改变下载。失败重试沿用当前一次点击的额度语义，不新增退款、补偿或跨请求幂等。

### 7.4 取消

- waiting：按 taskId 从数组移除并完成调用方 Promise，不调用额度或 injected。
- downloading：本地先标记取消，停止速度采样，后台尽力调用 `cancelDownloadMedia(taskId)`，随后立即从数组移除、完成 completion、发布快照并推进 FIFO。
- prepare、额度和真实传输 Promise 与本地取消 Promise 竞速；取消胜出后旧 Promise 继续被 observer 消费，迟到成功、失败、额度结果或进度不能恢复任务或产生终态埋点。
- injected 对 Worker ready、LocalDb wait、Blob/Segment 和 mediaHash Worker 都先记录 cancelled，再执行 Abort 或 `cancelProgress`；底层操作失败只记录。
- 新旧物理请求允许短暂重叠，cancel RPC 未抵达时旧任务可能继续或落盘；这是已接受风险，不增加 ACK、固定等待或强制恢复。

## 8. 下载执行

### 8.1 活动控制项

Injected 依赖 FIFO 单活动任务，只维护一个短命控制项：taskId、sourceId、sourceKind、AbortController 或 Worker request ID、cancelled 标记。完成、失败或取消后删除。

### 8.2 BlobDownloader

- 只处理当前 Telegram origin 的 Blob URL。
- 读取使用当前任务 AbortSignal，按真实字节上报累计值和已知总大小。
- 取消停止读取并释放分块引用，不创建保存 anchor。
- Blob 已由页面持有，本轮不再复制到 OPFS。

### 8.3 SegmentDownloader

预检取得总大小和分块大小后选择唯一 sink：

| 条件                                                    | sink               |
| ------------------------------------------------------- | ------------------ |
| `< effective opfsThresholdBytes`                        | memory             |
| `>= effective opfsThresholdBytes` 且 OPFS writable 可用 | Extension Pro OPFS |
| `>= effective opfsThresholdBytes` 且 OPFS 不可用        | memory             |

- 两个 sink 共用 Range、并发 20、进度、取消和错误流程。
- effective 阈值来自 Telegram 统一远端配置，未覆盖或无效时使用包内 200 MiB 默认值。
- 分块校验后立即按 position 写入 sink；OPFS 不保存完整 `ArrayBuffer[]`。
- 已验证的网络 `TypeError` 和 408 在当前 position 原位等待 1 秒后继续；其它错误结束当前任务。
- 每批用局部 AbortController 收拢同批请求，用户 signal 与批次 signal 组合；一个不可重试错误先让同批读取退出，再清理 sink。
- OPFS 初始化失败时，能力不可用可在下载前选择 memory；已经选中 OPFS 后的 write/close/getFile 失败直接结束当前任务，不重新下载。

### 8.4 A mediaHash

- 使用当前捕获的 GramJS Worker `downloadMedia`，不把 mediaHash 当 HTTP URL。
- 沿用 Telegram Worker 自己的 memory/OPFS 策略，Extension Pro 不改官方阈值或目录。
- Worker 进度按已知 Document size 计算估算字节；没有 size 时只显示百分比。
- 成功响应必须提供 Blob 才保存；错误或取消不进入其它下载路径。

## 9. 进度与展示指标

下载进度事件只承载当前任务：

- `taskId + sourceId` 双身份。
- `progress`、`receivedBytes`、`totalBytes`、`bytesAreEstimated`。
- 真实保存文件名发生变化时可携带最终 filename。

Content 只接受当前 active downloading task 的匹配事件。下载速度使用主插件已经验证的窗口采样和平滑口径；短样本不显示跳变值，字节停滞后清空速度。该计算只影响展示，不参与任务终态或重试。

## 10. OPFS 生命周期

- Extension Pro 只拥有 `extension-downloads/` 目录，随机 entry 不包含业务 ID、文件名或媒体 URL。
- 失败或取消关闭/abort writer，并尝试删除当前 entry。
- 成功把 File 交给浏览器后保留 120 秒，再删除当前 entry；浏览器仍未完成读取时允许本次保存失败并由用户重试。
- injected 启动时 fire-and-forget 清理 Extension Pro 自己的旧目录；失败只记录，不阻断启动，不重试。
- 不清理 Telegram 官方 `downloads/`，不建立文件注册表、后台 timer、恢复任务或跨标签协调。

## 11. 迁移来源

### 可迁移的最终行为

- `cb95bce8`、`8014d9af`、`c7c613e3`、`2629cedc`：当前页面队列、waiting/active cancel、失败重试、任务指标和渲染合同。
- `8569c2cf`、`9cbbdbc2`、`d0bf31bf`：下载速度采样、平滑和短样本稳定。
- `06f46bb9`：background → content → injected 运行时日志配置。
- `d4074bf7`：A Worker/LocalDb 账号级镜像和主动 full snapshot；最终实现以 `95e79e8f` 和 `683c2fe7` 为准。
- `95e79e8f`：OPFS sink、A 三类 identity、query/prepare、K 严格 Document、资源元数据与现有验证。
- `2d486285`：A no-article WebPage 和 K WebPage photo/Document；后续 `683c2fe7` 真实 Telegram 9/9 复验覆盖相关固定样本。
- `683c2fe7`：Worker ready、空 full 后等待 LocalDb 增量、本地立即取消和迟到结果隔离。
- `c5560685`：唯一队列按 canonical resource ID 排重；Pro 只迁移 Telegram 队列状态矩阵，不迁移主插件其它站点 ID 或 Popup RPC。
- Plan 031 最终实现：统一远端配置和有效 OPFS 阈值；精确 Pro 合同见 `@tech-Telegram远端配置.md`。

### 不迁移

- 主插件 Popup、平台 registry、多平台 scanner、sidebar、浏览器下载管理器和主站桥接。
- 主插件视觉、i18n locale 数量、发布渠道和测试矩阵。
- 为主插件历史兼容、旧版本或已删除行为保留的测试与分支。
- A/K 实验下载入口及其源码、RPC、UI 和 fixture。

## 12. 最少验证

完整 E2E owner、固定目标、主插件已跑通的 9 条真实矩阵与落盘合同见 `@test-Extension-Pro-e2e.md`；本节只说明下载内核必须提供的证据。

### 工程

- type-check、tests type-check、lint、format、RPC 生成、权限、manifest 和现有 UI token/队列/resource buffer 检查。
- development/production build 与实际 unpacked 启动。

### 受控真实扩展路径

在现有 controlled I5 用例内扩展，不新增同构 project：

- 只扩展一个现有主流程：单项/整消息/跨入口汇入同一 FIFO，重复资源只产生一个任务、一次额度和一次真实下载。
- 旧 Promise、进度、终态和 marks 的 taskId 隔离只保留一个 controlled/direct 场景，因为真实 Telegram 不能确定性制造迟到时序。
- 已有失败、额度、任务行和焦点行为不重复验证；受影响测试只同步新的 RPC/type 合同。

### 真实 Telegram

- 按 `@test-Extension-Pro-e2e.md` 的 9 条固定矩阵一次证明 Pro 页面集成与真实落盘，不在 unit/integration 层重复同一路径。
- OPFS 只选一个已知大文件 Segment 目标做实施/发布专项，证明写入增长、Renderer 内存有界和最终 SHA-256；A/K 不因共用同一下载器而重复跑大文件。
- 真实页面、Telegram 内部对象、媒体 Range 和下载结果不 mock；额度与 SLS 继续使用现有隔离边界。

不新增删除性测试、兼容测试、旧数据测试、假设异常测试、清理成功测试、无效输入排列测试、同一合同的多层重复测试或只验证类型字段存在的测试。主插件已有测试只作为迁移证据，不复制到 Pro。

## 13. 已知风险

- Telegram A Worker 取消没有独立 ACK；本地立即推进后旧请求可能继续或落盘，不增加强制等待或恢复。
- OPFS File 交给浏览器后没有完成通知，120 秒删除存在浏览器仍在读取的已接受风险。
- 真实 Telegram DOM、登录态和样本可能变化；失败时输出入口、目标消息和当前阶段，不回退受控页面冒充通过。
