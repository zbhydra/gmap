# Extension Pro E2E

## 1. 验收职责

Extension Pro E2E 证明 production build 的真实 unpacked 插件能够在 Telegram A/K 当前页面发现正确资源、显示 Pro 页面入口、经过唯一队列和真实下载器，并由 Chrome 产生正确落盘文件。

受控 E2E 负责稳定工程门禁；真实 Telegram E2E 负责外部兼容性和下载副作用。组件 mount、假 Chrome API 或只检查按钮存在都不能替代这两层。

## 2. 两层入口

### 默认 controlled gate

- 每次 global setup fresh production build 当前 `extension-pro` 工作树并加载 unpacked MV3。
- 在 Telegram 真实 HTTPS origin route 本地固定 DOM、接口和小型 Range 媒体，但完整启动 Background、MAIN injected、ISOLATED content 和真实 `chrome.*`。
- 继续使用现有 I5、I6 和浏览器身份 project；资源、队列、取消、统一配置和个人中心直接扩展到这些既有用例，不新增同构 project。
- 浏览器身份 project 使用 fresh profile 证明首次安装事件自动打开 Telegram Web A 版页面；其余用例开始前关闭该安装页，保持单一 owner Page。
- I5 核对单媒体按钮默认隐藏、只随对应媒体 hover 显示，焦点和 downloading 均不能在指针离开后保持显示；消息底部和 Story 入口不进入该显隐合同。downloading 图标的最终计算样式为 1000ms/圈匀速旋转；队列标题按钮核对可访问名称、waiting 可用状态和清理所有结果，动态传输文本核对更新前后容器等宽。
- 默认 `pnpm test` 不读取 Telegram 登录 profile。

### 显式真实 Telegram

- 只有 `E2E_INCLUDE_TELEGRAM_REAL=1` 时发现真实 project；串行占用固定 Telegram profile。
- real project 同时匹配 `telegram-real-i4-outside-click.spec.ts` 与 `telegram-real-download.spec.ts`，project timeout 为 300 秒；Document download 事件、队列和文件等待上限为 180 秒，不用固定 sleep 缩短合法 Worker/网络等待。
- global setup 同样 fresh production build，不复用旧 `dist`。
- 使用完整 Chromium、真实 Telegram 页面、内部对象、媒体请求、EventRpc、Chrome API 和浏览器下载。
- real project 每个 worker 只启动一个固定 profile persistent context，worker 结束时关闭；每条 test 使用同一 context 先关闭遗留 Telegram/普通页面，再创建 fresh owner Page，结束时关闭本 test 页面。A/K 用例严格串行，不同时打开两版。
- `testRunId` 和 `downloadDir` 是逐 test fixture；下载目录按 testRunId 隔离。SLS route 随 worker context 安装和关闭；每条 test 只清理自己安装的 quota route，诊断 listener 随 fresh Page 关闭，不把配额计数、下载集合或诊断带到下一条。
- 登录态失效、固定消息缺失、Telegram 网络或 DOM 变化必须明确失败并给出 setup/目标上下文，不回退 controlled fixture 记通过。

## 3. 允许隔离的边界

- `/api/client/quota/check` 固定为允许，并精确记录调用次数；waiting 取消不得增加调用，实际开始的任务各调用一次。
- SLS WebTracking 固定返回成功，避免污染正式埋点。
- 除这两项外，不 route Telegram document、DOM、结构化对象、媒体、Range、Worker 或 Chrome 下载。

## 4. 固定目标 owner

`extension-pro/tests/telegram-real-targets.ts` 独立维护 Pro 固定目标，不 import 主插件测试源码。初始目标与主插件已跑通样本一致：

- A CSV Document：消息 18。
- A OGG Document：消息 19。
- A no-article WebPage placeholder：消息 20。
- A/K 共用 WebPage PDF：消息 26，固定文件名、大小和 SHA-256。
- K WebPage DOM photo：消息 24。
- A/K 相册父消息 12 的目标子消息 13，以及目标视频的文件名、大小、magic bytes 和 SHA-256。

目标文件只保存公开频道、消息身份和稳定文件合同；DOM selector、等待与下载行为由 helpers 维护。目标发生变化时明确更新该 owner，不在 spec 内散落字面量。

## 5. Helper 责任

`extension-pro/tests/helpers.ts` 复用主插件今天已经跑通的逻辑，但按 Pro 页面 UI 重建：

- 关闭遗留 Page、导航固定消息、确认登录、等待 injected ready、定位当前 active chat root 并滚动目标消息。
- A/K 分别等待真实消息、原生媒体和 Extension Pro inline/探测入口可用。
- `attachPageDiagnostics` 收集 console、pageerror、failed request 和当前 URL；失败消息携带版本、share URL、消息 ID、selector、profile、下载目录、配额次数和最近诊断。
- `saveDownload` 把 Playwright `Download` 保存到当前 `testRunId` 隔离目录，文件名先清理路径字符。
- Document helper 统一执行点击、等待 Chrome download、保存、文件名、大小、magic bytes 和 SHA-256。
- K WebPage photo 在点击前从当前真实 DOM 图片响应读取字节/大小/SHA，落盘后逐项比较，不把动态 CDN 文件写成固定摘要。
- Album helper 复用 `openRealTelegramAlbumAndWaitReady` / `downloadTargetAlbumVideo` 语义：定位父消息 12 与子消息 13，等待两项原生媒体和对应 Pro inline 按钮，悬停目标媒体后点击目标子项而非父批量入口，随后核对落盘文件名、大小、magic bytes 和 SHA-256。
- 等待使用 locator/事件/`expect.poll` 和明确阶段 timeout，不使用固定 sleep 猜 Worker ready 或下载完成。

## 6. 真实下载矩阵

真实 spec 固定为主插件已经跑通的 9 条直接行为：

1. A 消息 18 下载原 CSV。
2. A 消息 19 下载原 OGG。
3. A 消息 20 建立 WebPage placeholder，随后消息 26 首次点击等待 Worker ready/LocalDb 增量并下载原 PDF。
4. K 消息 24 下载当前 DOM photo，并与点击前真实图片响应逐字节一致。
5. K 消息 26 下载 WebPage 原 PDF。
6. A 相册只下载子消息 13 的目标视频。
7. K 相册只下载子消息 13 的目标视频。
8. K 页面批量入队后验证一个 downloading + 一个 waiting；waiting 取消不进额度；重新入队后 active 本地立即取消、任务马上消失，下一项继续并落盘。inline/探测按 resource ID 核对状态和禁用行为；队列行独占 taskId、最终文件名和指标断言，由唯一队列行证明三入口汇入同一任务。
9. A mediaHash 活动任务本地立即取消后从 Pro 页面立即移除，CSV 下一项继续并按固定 SHA 落盘，同时核对两个实际开始任务的额度次数。

浏览器身份 project 断言首次安装自动打开 Telegram Web A 版页面；固定教程 Popup 断言 manifest 入口、Telegram 当前页才展示教程、非 Telegram 当前页优先激活已有 Telegram 标签页、没有时新建 A 版页面，以及三步本地化内容、正文滚动和键盘焦点；不复制主插件 Popup 的资源列表或状态恢复行为。下载跨入口一致性仍只检查 inline、探测面板和页面队列。

## 7. 文件断言

- 下载必须由 `page.waitForEvent('download')` 或 context 对应真实 Chrome download 事件取得，不以请求发出或按钮状态代替。
- 保存后读取落盘文件，核对建议文件名、实际字节数、magic bytes 和 SHA-256；动态图片与点击前真实响应比较。
- 每个实际开始的任务断言一次 quota；waiting 取消保持 0。
- 取消任务立即从页面队列消失；底层旧请求允许继续，但迟到进度、响应、错误和下载事件不能恢复已取消任务。Plan 029 已接受的极端旧请求落盘风险单独记录，不把“绝对无落盘”设计成防护测试。
- 旧 Promise、进度、终态和埋点的 taskId 隔离由现有 controlled/direct 队列场景确定性驱动迟到 resolve/reject/progress 并检查 marks；真实层不伪造迟到时序，也不检查 SLS 内容。
- E2E 只阻断页面崩溃、大量泄露或用户卡死等大问题；低概率轻微泄露、临时资源未完全回收或用户重试可修正的并发损失不扩展为自动化矩阵。
- 下载目录由 `testRunId` 隔离；不清理或复制人工登录 profile。

## 8. 大文件专项

标准 9 条真实用例不重复下载 3.4 GiB 文件。P4 只在 OPFS 实施和发布前选择一个已知 Segment 大文件做专项：

- 记录 0/25/50/75% Renderer memory 与 OPFS 使用量。
- 核对最终大小和流式 SHA-256。
- 不再按 A/K 重复，不增加大文件取消或临时 entry 清理断言；活动取消由标准 9 条矩阵证明。
- 专项结果不进入日常 `pnpm test`，不并发占用固定 profile。

## 9. 文件结构

```text
extension-pro/playwright.config.ts
extension-pro/tests/global-setup.ts
extension-pro/tests/fixtures.ts
extension-pro/tests/helpers.ts
extension-pro/tests/telegram-real-targets.ts                 新增
extension-pro/tests/e2e/telegram-real-download.spec.ts        新增
extension-pro/tests/e2e/telegram-real-i4-outside-click.spec.ts
extension-pro/tests/e2e/telegram-controlled-i5-download-state.spec.ts
extension-pro/tests/e2e/telegram-controlled-i6-personal-center.spec.ts
```

## 10. 命令

```text
pnpm test
pnpm test:e2e:telegram:i5
pnpm test:e2e:telegram:i6
pnpm test:e2e:identity
pnpm test:e2e:telegram:real-canary
```

真实 project 保持 `fullyParallel=false`、`workers=1`、`retries=0`。大文件专项使用显式命令或人工验收，不进入默认命令。
