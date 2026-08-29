# Extension Pro 架构与页面集成

## 1. 文档职责

本文只定义 `extension-pro/` 的工程边界、MV3 运行上下文、页面 UI、账号与官网配对。Telegram 资源发现和下载内核由 `@tech-Telegram资源与下载.md` 维护，远端配置由 `@tech-Telegram远端配置.md` 维护。

主插件 `extension/` 是迁移证据来源，不是 Extension Pro 的运行时依赖或权威文档。两套插件后续允许分叉，任何主插件变更都必须先证明适合 Pro 产品行为，再进入本域方案。

## 2. 当前与目标

### 当前已经成立

- 独立 `extension-pro/` pnpm 工程、Vite MV3 manifest 和 production/development 固定扩展身份。
- 只匹配 `https://web.telegram.org/*`，提供固定教程 Popup，无 Options 或官网 content script。
- Background、ISOLATED content、MAIN injected 三个运行上下文，以及 typed Chrome/Event RPC。
- 页面内容区按钮、原生箭头锚点工具带、探测/队列/个人中心三个面板、额度升级对话框和 Toast。
- Background 认证 storage owner、external auth、个人中心、额度、DOM 配置、埋点和 Pricing provider。
- `website-tgd-pro ↔ extension-pro` 独立登录与订阅配对。

### 本轮目标

- 删除正式 UI、RPC 和默认测试中的 A/K 下载实验，只保留一条正式下载流程。
- 把主插件已经验证且适合 Pro 的资源身份、Worker ready、本地立即取消、资源排重、OPFS、进度指标、统一远端配置和运行时日志方案迁入 Pro 自己的 owner。
- 保留 Pro 固定教程 Popup、页面个人中心、Pro UI、Pro API/Website 和当前终态反馈，不把主插件业务 Popup 或多平台能力迁入。
- 用本域 feat、tech 和 plan 维护当前事实，不保留旧会话的 proposal、decisions、research 或 roadmap。

## 3. 产品边界

```text
extension-pro/
  只支持 Telegram Web
  只打开 website-tgd-pro
  只接受 website-tgd-pro external message
  使用 Pro API、Pro SLS source、Pro 固定扩展 ID

extension/
  保持主插件自己的多平台、Popup、主站和发布合同

website-tgd-pro/
  维护 Pro 登录页、Credits/Unlimited Pricing 与支付

website/、website-shared/
  不引用、不识别、不适配 Extension Pro
```

禁止在两套插件之间建立源码 import、运行时消息、storage 共享、构建产物复用或发布耦合。迁移只复制已经验证的行为和必要实现，并在 Pro 文件内收敛为自己的合同。

## 4. MV3 上下文

### Background

Background 是 Chrome 权限、安装导航、认证状态和运行时配置 owner：

- 模块顶层同步注册安装事件、`chrome.runtime.onMessageExternal` 和 RPC server；浏览器 action 由 manifest 的 `default_popup` 直接处理。
- 安装事件只接受首次安装原因并新建 `https://web.telegram.org/a`；更新、Chrome 更新和共享模块更新不导航。
- 唯一读写 access token、refresh token、用户快照和 debug logging 配置。
- 提供个人中心、登录、退出、Pricing、额度检查、Telegram 统一配置、埋点和运行时配置能力。
- 官网 external message 只在 manifest 与 `sender.origin` 入口校验 Pro Website origin；进入 token exchange 后不重复判断产品来源。
- `onSuspend` 释放 RPC 与 external listener。

### Popup

Popup 是浏览器 action 的页面门禁与固定教程 owner：

- 启动时只读取当前窗口活动标签页；精确 origin 为 `https://web.telegram.org` 时才挂载 Vue 教程。
- 非 Telegram 当前页优先按标签索引激活当前窗口最左侧 Telegram 标签页，不存在时在同窗口新建 A 版页面，随后关闭且不渲染教程。
- 不调用 Content RPC，不读取账号、额度或下载队列；页面内探测面板继续只由自身入口控制。

### ISOLATED content

Content 是当前 Telegram document 的业务 owner：

- 启动时并行等待 MAIN ready 与一次 Telegram 统一远端配置，并在 ready 后同步独立运行时日志和下载配置。
- 持有当前聊天 ResourceBuffer、唯一下载队列、Pinia UI 快照和全部 Shadow UI owner。
- 扫描只产出资源；所有下载入口只向队列提交资源，不直接调用下载器。
- 页面销毁时释放 scanner、owner、订阅、RPC client 和队列。

### MAIN injected

Injected 只访问 Telegram 页面内部对象和同源媒体：

- A 页面在 `document_start` 安装 Worker 构造拦截；K 页面不安装 A Worker 逻辑。
- 提供 A LocalDb query/prepare、K message media 解析、真实下载和活动取消。
- 不访问 `chrome.*`、认证 storage、后端 token、额度或账号接口。
- 与 content 只通过固定 EventRpc；页面能够伪造该通道，因此通道不能授予 Chrome、storage 或后端权限。

## 5. 单一启动流程

```text
Background 顶层注册

MAIN document_start
  -> A Worker 拦截（仅 A）
  -> EventRpc provider
  -> ready marker

ISOLATED document_idle
  -> 等待 ready + Telegram 统一远端配置
  -> 同步 runtime config + injected 下载配置
  -> 下载配置应用成功才提交候选 DOM；失败保留两端包内默认
  -> 工具带 owner + inline owner + ResourceBuffer
  -> scanner
  -> A Story owner（仅 A）

Action Popup
  -> 查询当前窗口活动标签页
  -> Telegram Web：挂载固定教程
  -> 其它页面：激活已有 Telegram 标签页或新建 A 版页面 -> 关闭 Popup

Background onInstalled
  -> 首次安装：新建 Telegram Web A 版页面
  -> 其它原因：不导航
```

配置读取或同步失败只记录错误并用包内默认继续，不增加后台恢复、补偿 RPC、轮询或第二套启动路径。

## 6. RPC 责任

RPC register 只声明调用方、传输和 payload 上限；业务实现属于 provider。方法数量不作为设计目标，能力只随真实入口增加或删除。

### Background Chrome RPC

- 个人中心取数、打开登录页、退出、打开 Pricing。
- 下载前额度检查、Telegram 统一远端配置、下载生命周期埋点。
- 读取无权限的运行时日志配置。

### Injected EventRpc

- 应用运行时日志配置。
- 应用 Telegram 下载配置。
- A Document 批量只读 query、单资源 prepare。
- K 当前消息媒体解析。
- 单项真实下载、按任务 ID 取消活动下载。

删除 `startTelegramNativeDownload` 及所有实验 RPC。RPC 边界校验 JSON 类型、调用方和 payload 大小；内部 provider 不重复做同一来源白名单或资源类型守卫。

### 内部 RPC 合同

| channel.method                         | 参数（全部必传，`-` 表示无业务参数）                    | 返回                                                   | request/response 上限      |
| -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| `background.getPersonalCenterData`     | -                                                       | `{identityKey, user, subscription, errors}`            | 1024/16384 B               |
| `background.openExtensionLogin`        | -                                                       | `{opened: boolean}`                                    | 1024/1024 B                |
| `background.logout`                    | -                                                       | `{loggedOut: boolean}`                                 | 1024/1024 B                |
| `background.openPricing`               | `source: 'quota_counter'                                | 'quota_upgrade_button'`                                | `{opened: boolean}`        | 1024/1024 B  |
| `background.checkQuota`                | `count: number`                                         | `{allowed, count, used, remaining, status, reset_at?}` | 1024/4096 B                |
| `background.getTelegramConfig`         | -                                                       | Telegram 统一稀疏 JSON 对象                            | 1024/16384 B               |
| `background.recordMark`                | `mark_type: DownloadMarkType`, `mark_msg: string`       | `{recorded: boolean}`                                  | 4096/1024 B                |
| `background.getRuntimeConfig`          | -                                                       | `{debugLogging: boolean}`                              | 1024/1024 B                |
| `injected.applyRuntimeConfig`          | `debugLogging: boolean`                                 | `{applied: boolean}`                                   | 1024/1024 B                |
| `injected.applyTelegramDownloadConfig` | `opfsThresholdBytes: number`                            | `{applied: true}`                                      | 1024/1024 B                |
| `injected.queryAMediaResources`        | `identities: TelegramAResourceIdentity[]`               | `{resources: AInternalMediaResource[]}`                | 16384/262144 B             |
| `injected.prepareAMediaResource`       | `taskId: string`, `identity: TelegramAResourceIdentity` | `{resource: AInternalMediaResource                     | null, cancelled: boolean}` | 4096/16384 B |
| `injected.getKMediaResources`          | `messageFullIds: string[]`                              | `{resources: KInternalMediaResource[]}`                | 16384/262144 B             |
| `injected.downloadMedia`               | `taskId: string`, `source: IMediaSource`                | `{success: true, cancelled: boolean}`                  | 16384/4096 B               |
| `injected.cancelDownloadMedia`         | `taskId: string`                                        | `{accepted: boolean}`                                  | 4096/4096 B                |

无业务参数的方法仍使用 RPC 空请求合同。参数结构、调用方、transport 或 payload 超限由 RPC 边界返回可定位错误；provider 的网络、资源或页面失败沿同一 RPC error 通道返回，不定义旧响应兼容或备用返回结构。

## 7. 页面 UI owner

- `floatingEntryOwner` 只负责 Telegram 原生箭头锚点、单个 Shadow host 和面板开关。
- `telegramFloatingStore` 只消费 ResourceBuffer、下载队列和账号快照，不创建平行下载状态。
- `inlineUiOwner` 根据当前 ResourceBuffer 挂载单媒体、整消息和 Story 入口；每个媒体 surface 独立驱动自身 Shadow Host 的 hover 可见状态并在卸载时释放监听，组件只按 resourceId 查询队列快照。单媒体按钮只由对应 surface 的 pointer enter/leave 控制显隐，焦点、任务状态和设备能力不参与；消息与 Story 入口常显。
- `DetectedFilesPanel`、`DownloadQueuePanel` 和 `PersonalCenterPanel` 只渲染输入并上抛命令，业务命令回到同一个 owner。
- 队列标题栏的清理操作遍历当前权威快照并复用既有单任务取消/终态删除入口：清理所有覆盖全部状态，清理等待只匹配 waiting。传输指标使用满宽 flex 与固定速度列，字节列占用剩余空间并右对齐。
- 焦点只在即将删除当前焦点所在 subtree 时转移到稳定标题或常驻探测按钮；其它关闭和点击保留 Telegram 原目标焦点。

## 8. 账号与官网

- Background 是认证三键唯一 owner；content 只通过个人中心 RPC 读取结果。
- `/auth/me` 成功结果只返回给当前请求，不反向制造第二份用户 storage owner。
- 官网登录回流、refresh 写回、会话清理和 logout 继续通过当前串行 mutation owner 提交。
- Extension Pro production/development 分别只配对自己的 Website origin、API origin和固定扩展 ID。
- Pricing source 只有 `quota_counter` 和 `quota_upgrade_button`；来源判断只在 Pro Pricing 页面入口发生一次。
- 支付、商品和履约由 `011.Pricing页` 维护，本域不复制支付状态机。

## 9. 运行时日志

- 开发构建输出 DEBUG 及以上；生产构建默认只输出 ERROR。
- Background 从 `chrome.storage.local` 读取 `debug_logging === true`，应用自身后通过 Chrome RPC 发给 content，再由 content 通过 EventRpc 发给 injected。
- 普通 `console.info/warn` 迁入统一 Logger；错误始终保留原始 Error 和堆栈。
- 配置读取或同步失败时两端保留包内默认并继续正常启动；不发送补偿 RPC。本轮不增加远程日志开关、动态监听、轮询或其它配置项。

## 10. Manifest 与资源

- `permissions` 只包含源码真实使用的 Chrome 权限；当前为 `storage`。
- `host_permissions` 只包含 Telegram 页面。API/SLS 走标准 CORS，官网只进入 `externally_connectable.matches`。
- 不声明扩展出站 CSP，不把 API、SLS 或 Website 重复加入 host permissions。
- content CSS、Shadow CSS、字体和图标只暴露给 Telegram match。
- production/development 只改变固定身份、Website/API/SLS 配置、压缩和 sourcemap，不增加开发专用业务入口。

## 11. 文件变更范围

```text
extension-pro/
  package.json                                      删除实验命令，保留正式验证命令
  playwright.config.ts                             删除实验 project
  vite.config.ts                                   注入 __DEV__，Manifest 产品边界不变
  public/assets/styles/extension-pro.css            队列取消/指标样式，恢复探测单动作

  src/background/
    background-register.ts                         增加 getRuntimeConfig/getTelegramConfig
    index.ts                                       初始化 Logger 并注册 provider
    types.ts                                       增加 RuntimeConfig RPC 类型
    providers/getTelegramConfig.ts                 新增：读取统一配置
    runtimeConfig.ts                               新增：运行时配置 owner
    rpc/content.rpc.ts                             RPC 重新生成

  src/content/
    telegramContent.ts                             同步运行时与 Telegram 配置
    runtimeConfig.ts                               新增：content/injected 日志同步
    rpc/background.rpc.ts、rpc/injected.rpc.ts      RPC 重新生成
    stores/telegramFloatingStore.ts                消费唯一资源/任务快照
    telegram/config.ts                             新增：统一配置 owner
    telegram/aVersionScanner.ts                    A 三类 identity 与 query
    telegram/kVersionScanner.ts                    K WebPage/Document 合并
    telegram/download.ts                           A prepare 与正式下载/取消 client
    telegram/downloadQueue.ts                      FIFO、排重、指标与立即取消
    telegram/types.ts                              资源与任务快照
    ui/DetectedFilesPanel.vue                      唯一正式下载动作
    ui/DownloadQueuePanel.vue                      取消、字节与速度
    ui/InlineMediaControls.vue                     统一队列状态
    ui/InlineMessageActions.vue                    统一队列状态
    ui/TelegramFloatingEntry.vue                   队列命令、Toast 与焦点

  src/core/
    api/config.ts                                  登记统一配置端点
    constants/i18n.ts                              新状态 i18n key
    constants/resource.ts                          sourceKind 常量
    protocol/injected.ts                           进度指标事件
    runtimeConfig.ts                               新增：共享运行时配置类型
    types.ts                                       新增：A identity 与共享资源类型
    utils/logger.ts                                新增：Pro Logger

  src/injected/
    injected-register.ts、types.ts                 query/prepare/download/cancel/runtime RPC
    telegramInjected.ts                            正式 provider 与启动清理
    telegramAWorker.ts                             Worker 请求、进度与取消
    telegramALocalDb.ts                            账号级镜像与 full refresh
    telegramAMedia.ts                              A identity query/prepare
    telegramKMedia.ts                              K Document/WebPage 分派
    telegramDocumentMetadata.ts                    新增：A/K Document 统一元数据
    downloadMediaService.ts                        单活动传输 owner
    downloadProgress.ts                            task/source/bytes 指标
    downloaders/BlobDownloader.ts                  AbortSignal 与真实字节
    downloaders/SegmentDownloader.ts               memory/OPFS sink
    config.ts                                      新增：应用 Telegram 下载配置
    runtimeConfig.ts                               新增：应用 injected 日志配置

  src/locales/en.json、src/locales/zh-CN.json       新增状态文案
  src/types/file-system-access.d.ts                新增：浏览器文件系统边界类型

  tests/e2e/telegram-controlled-i5-download-state.spec.ts
                                                   扩展正式队列/取消/指标用例
  tests/e2e/telegram-controlled-i6-personal-center.spec.ts
                                                   只在 UI 合同受影响时调整
  tests/e2e/telegram-real-i4-outside-click.spec.ts  保留真实锚点/焦点验收
  tests/e2e/telegram-real-download.spec.ts          新增：真实 A/K 下载与取消验收
  tests/telegram-real-targets.ts                    新增：Pro 固定目标 owner
  tests/fixtures.ts                                 real worker context + 逐测 Page/downloadDir
  tests/fixtures/telegram-a-controlled.html         增加直接验收资源
  tests/helpers.ts                                  正式目标与下载辅助

删除：
  src/background/providers/getTelegramDomConfig.ts
  src/content/telegram/aOfficialBrowserDownloadExperiment.ts
  src/content/telegram/kDocumentDownloadExperiments.ts
  src/injected/telegramKNativeDownload.ts
  tests/e2e/telegram-k-document-download-experiments.spec.ts
  tests/fixtures/telegram-k-controlled.html         若无正式 K 验收消费者

docs/feat/012.Extension Pro/
  feat.md
  tech-架构与页面集成.md
  tech-Telegram资源与下载.md
  tech-Telegram远端配置.md
  changelog.md
  plans/001.Extension-Pro下载内核统一与发布收口.md
```

不得修改 `extension/`、`website/` 或 `website-shared/`。`website-tgd-pro`、用户系统和 Pricing 现有文档只修正对本域的引用，不在本计划重写其实现。

## 12. 验证

- `extension-pro` 执行 `pnpm check`、`pnpm build:dev`、`pnpm build` 并实际加载 production/development unpacked 扩展。
- Telegram 初始化验证统一配置未设置、DOM 稀疏覆盖和 OPFS 阈值两侧。
- 默认受控浏览器用例验证启动、唯一队列、账号、额度、取消和 UI；不把下载实验加入默认 project。
- 真实 Telegram project 同时发现 I4 与 download spec，使用 300 秒 project timeout、180 秒下载/队列等待、worker 级 persistent context 和逐测 fresh owner Page/downloadDir；只固定额度与 SLS 边界，不替换 Telegram DOM、内部对象或媒体响应。
- 真实下载 test 使用 `@test-Extension-Pro-e2e.md` 的唯一 owner Page、固定目标、落盘字节和主插件已跑通的 9 条串行矩阵；固定教程 Popup 在浏览器身份 project 验证 Telegram 页面门禁、跳转和教程本体，不复制主插件业务 Popup 行为。
- 视觉验收覆盖 320/600/601/768/1024/1440、亮暗主题、Toast 同屏和键盘焦点。
- `website-tgd-pro` 的真实登录与支付终验仍按 `011.Pricing页` 独立执行，不用 mock 结果替代。

## 13. 已知边界

- 当前 production Pro 站尚未部署完整登录闭环，真实 token exchange 与支付履约需要部署和有效账号。
- Telegram 登录态、固定真实样本和网络属于真实验收前置条件；不可用时明确阻塞，不增加模拟兼容路径。
- Extension Pro 与主插件保持两份实现，后续迁移继续按行为审查；本轮不新增共享包、依赖注入或同步守卫。
