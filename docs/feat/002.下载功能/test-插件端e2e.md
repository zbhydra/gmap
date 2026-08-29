# 002 · 插件端 E2E

## 功能目标

插件 E2E 只回答一个问题：当前 production build 的 unpacked 扩展，能否在真实站点页面上
找到正确媒体、把按钮放在正确位置，并通过真实浏览器下载得到正确文件。

受控 HTML、假站点数据、假媒体和通用 API mock 不能证明真实页面兼容性，不进入 E2E。
纯逻辑、协议、异常分支和状态转换由 Unit/Integration 覆盖。

## 真实环境定义

自动化 E2E 必须同时满足：

1. 每次运行 fresh production build 当前工作树，并加载真实 unpacked MV3 扩展。
2. 使用完整 Chromium headed 与真实 `chrome.*` 实现。
3. 访问当前 enabled 平台的真实页面；`disabled-unverified` 平台保留用例但整组 skip。
4. 不替换站点 document、DOM、结构化数据、媒体请求或 CDN 响应。
5. 点击真实扩展按钮，并监听真实 Chrome download 事件。
6. 文件落盘后验证大小、MIME、文件名、资源身份或 CDN 响应字节。
7. 页面、登录态、样本、WAF 或网络异常必须明确失败或 skip，不能切回假页面继续通过。

只保留两个与按钮正确性无关的隔离边界：

- `/api/client/quota/check` 固定为允许，并断言调用次数。它只避免测试账号当天额度阻断下载，
  不替换站点资源或下载链路。
- SLS WebTracking 请求固定返回 `204`，避免测试污染正式埋点。

## 测试矩阵

| Project | 用例 | 当前状态 | 真实验收内容 |
|---|---:|---|---|
| `extension-e2e-telegram-real` | 12 | 执行 | A/K 固定频道扫描和布局、K popup、A/K 真实下载、共享队列、waiting/active 取消、A 侧边栏下载 |
| `extension-e2e-instagram-real` | 5 | skip | Home 视频/图片轮播/Story、固定 Post、Carousel、Reel、Profile 与 Profile Reels |
| `extension-e2e-vimeo-real` | 1 | skip | 固定公网视频的真实解析、MP4 下载和按钮恢复 |

`pnpm test` 默认发现上述 18 条真实用例，当前执行 Telegram 12 条并将 Instagram/Vimeo 6 条明确报告为 skip。suite 是否执行只读取平台注册表；不存在 UI、controlled 或 mock site project。
Playwright 使用 `fullyParallel=false`、`workers=1`；所有 Telegram project（real、ad-assets、
manual）固定 `retries=0`。

## Telegram

### 登录态与样本

- Profile：setup、real、ad-assets、manual 与 verify 固定使用同一个绝对目录
  `extension/tests/logs/test-user-data-telegram`，不提供 profile 参数或环境变量。
- 初始化：`pnpm test:setup` 关闭恢复出的普通页和 Telegram 页，再创建唯一 fresh owner
  Page；同一页面按 A → K 顺序确认或等待登录，两版都 ready 后关闭。A 与 K 是独立客户端、
  各自独立 MTProto session，登录态互不共享，仅共用同一 profile 目录，因此 setup 必须分别
  验证两版可用；验证阶段任一时刻只有一个 Telegram Page。
- 恢复页关闭成功属于正常清理，只有关闭失败才报错并要求重试。
- 分享入口：`https://t.me/hydra_test_channel/13?single`。
- A：固定频道 peer；K：固定 `@hydra_test_channel`。
- 消息 13 是相册父消息 12 的第二项。
- 页面生命周期：每条 test 开始时先关闭 persistent context 遗留的普通页和 Telegram 页，
  再创建 fresh page，结束时关闭本 test 页面。

### 扫描与布局

- A/K 都必须找到父消息、两个真实媒体子项、两个单资源圆形按钮、两个已选复选框和唯一父消息下载按钮。
- K 只允许从当前 `.chat.tabs-tab.active` 扫描和定位消息；隐藏聊天即使存在相同 `mid + peer-id` 也不能进入资源或按钮结果。该确定性分支由 Unit 覆盖，真实 K 页面流程验证 active chat 主链路。
- 每个圆钮必须属于父消息的不裁切 control layer,resourceId 包含该格自己的 DOM 消息 ID,且对应媒体 hover 只显示该格按钮;父消息按钮仍属于内容容器并位于两个媒体项之后。
- 桌面端圆钮默认 `opacity:0/pointer-events:none`,对应媒体 hover 后变为 `opacity:1/pointer-events:auto`。
- 几何断言必须证明复选框位于各自媒体右下角,36px 圆钮与复选框中心线对齐、位于其上方且不重叠,父消息按钮不越出内容容器。
- K popup 必须从当前真实 tab 读取资源，不允许预写 storage 冒充扫描结果。

### 下载

- A/K 聊天区直接 hover 子消息 13 并点击该格圆形按钮;不得依赖取消子消息 12 或父消息批量按钮来证明单项入口。
- K 父消息批量入口必须一次加入两个真实资源；固定首个配额响应期间，页面 Widget 与 Popup 都显示 1 个下载中和 1 个等待中任务，两处文件名、状态和大小一致。Popup 320px 状态浮层和页面浮层不越界、不遮挡入口；页面 Shadow Root 内每个媒体图标及其 SVG 必须保持 18×18px，任务行不得横向溢出；Popup 关闭重开后通过 content RPC 恢复同一队列。
- 从页面取消 waiting 后两处同时移除，固定 quota check 的调用数保持不变；再从 Popup 入队一个后续项。放行队首后必须观测到真实 `/k/stream/` 请求和大于 0 的进度；取消 active 后任务立即从两处消失，后续项在旧传输终态前开始并成功落盘。
- A 4.3 MB OGG `mediaHash` 在页面已收到真实 Worker 进度后取消；任务立即消失，紧随的 CSV 不等待 `USER_CANCELED` 即开始并按固定 SHA-256 落盘。底层 `cancelProgress` payload 和迟到 Promise 消费由既有 Unit 覆盖，不把“旧任务绝不落盘”作为真实 E2E 门禁。
- A 侧边栏打开真实频道资料，验证消息 13 单项按钮和 `DOWNLOAD ALL (3)`。
- 每个实际开始的下载任务恰好调用一次配额检查；未取消任务产生真实浏览器下载并保存非空文件。
- 首次真实失败必须保留在页面与 Popup 的“失败”分组，失败文字不能只靠颜色表达，且后续 waiting 继续；人工重试恢复初始字段并排到队尾，本次及以后重试不再增加 quota check 次数。
- 页面“清空等待”一次移除全部 waiting，不影响 failed/downloading；“清除全部”一次移除 waiting+failed+downloading，并后台尽力取消活动传输。两项操作都不弹确认框。
- A/K 页面下载管理入口必须跟随 Telegram 当前亮暗主题；运行中切换主题时，入口与浮层无需重新打开即可更新颜色，任务节点、焦点和滚动位置保持不变。
- Telegram DOM、媒体请求、扩展 RPC 和 Chrome 下载均不得 mock。
- Telegram real project 单用例上限保持 300 秒，Document 下载事件与队列完成等待保持 180 秒。2026-08-27 fresh development build 实测 A26 首点等待约 1.2 分钟、A19 网络恢复下载约 1.3 分钟；两者均低于下载等待上限，不按单次样本缩短 timeout。

### Plan 024 真实验收状态

以下验收已进入真实 Telegram 用例。2026-08-21 因 A/K 两个独立 session 都进入登录页而未执行到业务断言，不记为通过：

- A/K 存在未完成任务时，主聊天列右下区域显示页面下载管理入口和未完成数量徽章；悬浮、键盘聚焦或点击可查看当前 FIFO。页面列表与 Popup 对同一任务的数量、最终保存文件名、状态、进度和文件大小一致。
- 入口徽章与 Popup 总数包含失败项；只有 downloading/waiting/failed 全部为空才隐藏。页面浮层在约 370×524 的亮暗主题下不得越界或遮挡，清理、取消与重试按钮都具备本地化可访问名称和可见焦点。
- A 主消息 Document 在队首解析前显示“获取文件名中…”，解析后页面与 Popup 同步显示 Telegram 原始文件名或保存兜底名；实际落盘文件名必须与更新后的名称一致。Blob 响应修正扩展名时也必须在保存前同步两处显示。
- 同一资源从页面按钮与 Popup 重复入队时只显示一个任务、只调用一次额度并执行一次真实下载；两个入口都等待该共享任务的终态。
- 等待任务取消后立即从页面与 Popup 消失，固定 quota check 的调用次数不增加。
- 活动任务本地接受取消后立即从页面与 Popup 消失，completion 立即完成，队列下一项在旧传输终态前开始。取消不能显示为下载失败；底层取消或清理失败不能恢复任务。
- Telegram A `mediaHash` 与 Telegram K 真实路径分别验证立即取消和下一项成功；页面、媒体、Worker、扩展 RPC 和 Chrome 下载均不得 mock。Worker `cancelProgress`、Blob/Segment AbortSignal、迟到 fulfill/reject 消费和取消任务零成功/失败埋点合并到既有 Unit，不为同构路径重复增加 E2E。
- A message/WebPage Document 点击后不等待固定时间：Worker 未 ready 或 full refresh 暂时为空时任务保持下载中，LocalDb 增量取得目标后继续 prepare 并完成；测试不得用固定 3 秒 sleep 规避时序。
- 真实 E2E 不伪造下载节奏，也不把固定速度数值作为通过条件；真实/估算速度计算、`AbortController` 中止和 Worker payload 由 Unit/Integration 确定性覆盖，E2E 只验证字段可见、任务身份正确和取消产生真实副作用。

## Instagram

当前平台注册状态为 `disabled-unverified`，以下 5 条真实用例保留但整组 skip；重新启用后恢复执行。

### 登录态与隔离

- 人工登录 profile：`extension/tests/logs/test-user-data-instagram`。
- 初始化：`pnpm test:setup:instagram`，成功后导出 storage state。
- 每个用例把快照恢复到独立临时 profile，用例结束后删除运行 profile。

### Home 与 Story

- 主动滚动找到真实视频 Post，验证 current/all 按钮并执行下载。
- 找到真实图片轮播，下载当前图，点击原生下一项，等待 pagination、绝对序号、可见
  media ID 和按钮实体同时更新，再下载新当前图。
- 回到 Home 顶部，从原生 Story tray 进入 viewer；不暂停自动播放，下载当前张，点击原生
  下一项后再下载新当前张。

### 详情与 Grid

- 固定 Post 和 Reel：current 按钮属于媒体 surface，all 按钮属于同一实体的原生操作区。
- 固定 Carousel：从第 4 项进入，点击原生下一箭头进入第 5 项；current/all 仍属于可见媒体，
  绝对序号从 3 更新为 4，并下载第 5 项原图。
- `twilight/` 与 `twilight/reels/`：每个可下载 tile 都有唯一 Grid 按钮，按钮 entity 与
  permalink shortcode 一致，并在两个页面各执行至少一次真实下载。

### 文件身份

- 每个入口产生的全部文件都必须落盘且非空。
- 后缀必须与 CDN MIME 一致。
- 文件字节必须与点击并通过配额后捕获的真实 Instagram CDN 响应逐字节一致。
- Home 当前图片还必须用可见 CDN `ig_cache_key` 解出的 media ID 证明下载对象与屏幕一致。

## Vimeo

当前平台注册状态为 `disabled-unverified`，以下 1 条真实用例保留但整组 skip；重新启用后恢复执行。

- 访问固定公网视频并等待真实扩展面板。
- 选择真实可用 MP4 画质，点击后验证 busy/progress，再保存非空 `.mp4` 文件。
- 下载完成后按钮恢复，页面仍属于固定视频 ID。
- 命中 Cloudflare challenge 时只能记录环境 skip，不能记为产品通过。

## 不在当前 E2E 的范围

- Popup 登录、Pricing、语言切换、空态和假资源列表不再用 E2E 验收。
- Telegram/X/Vimeo 的确定性流分块、局部失败、并发和边界状态由 Unit/Integration 覆盖。
- Telegram 父按钮容器删除后的 busy/progress 恢复、A 普通同类型相册换序拒绝错绑、K 隐藏聊天隔离由 Unit 覆盖；真实 E2E 保留站点布局与下载副作用验收。
- X 当前没有固定真实登录态与稳定真实样本，因此没有 X E2E，也不声明真实 X 页面兼容已由
  E2E 证明。
- `tests/manual/*.manual.spec.ts` 是人工诊断，不进入自动化通过数。

历史 controlled 方案和当时的执行结果只保留在对应 Plan 与 changelog，不能作为当前发布
验收依据。

## 文件结构

| 文件 | 职责 |
|---|---|
| `extension/playwright.config.ts` | 只注册三个 real project 与显式 manual project |
| `extension/tests/global-setup.ts` | fresh build 并验证 MV3 关键产物 |
| `extension/tests/fixtures.ts` | 固定 Telegram profile、Chromium、扩展加载、Instagram 快照和下载目录 |
| `extension/tests/helpers.ts` | 真实 Telegram 等待、popup、诊断、配额边界与下载保存 |
| `extension/tests/e2e/telegram-real-scan.spec.ts` | A/K 扫描、布局与 K popup |
| `extension/tests/e2e/telegram-real-download.spec.ts` | A/K 聊天区真实视频下载与 K 批量队列状态恢复 |
| `extension/tests/e2e/telegram-real-sidebar.spec.ts` | A 侧边栏真实下载 |
| `extension/tests/e2e/instagram-real-layout.spec.ts` | Instagram 五类固定真实流程 |
| `extension/tests/e2e/vimeo-real-download.spec.ts` | Vimeo 固定公网 smoke |

## 命令

| 命令 | 含义 |
|---|---|
| `pnpm test` | fresh build 后执行 Telegram 12 条，Instagram/Vimeo 6 条报告 skip |
| `pnpm test:e2e:telegram` | 只运行 Telegram 12 条 |
| `pnpm test:e2e:instagram` | Instagram enabled 时运行 5 条；当前整组 skip |
| `pnpm test:e2e:vimeo` | Vimeo enabled 时运行 1 条；当前整组 skip |
| `pnpm test:manual` | 显式运行人工诊断套件，不计入自动化全量 |
| `pnpm test:setup` | 用唯一 fresh owner Page 按 A → K 初始化并验证 Telegram 登录 profile |
| `pnpm test:setup:instagram` | 初始化 Instagram 登录 profile 与 storage state |
| `pnpm test:report` | 打开最近一次 Playwright 报告 |
| `pnpm test:clean` | 清理运行产物，不删除人工登录 profile |

## 验收标准

1. `pnpm exec playwright test --list` 只能发现 18 条真实自动化 E2E；当前 12 条执行、6 条按发布状态 skip。
2. 默认项目名必须明确包含站点名和 `real`，不能使用含糊的 `ui` 或 `controlled`。
3. E2E 源码不能包含 fake document、controlled media、通用 `**/api/client/**` route。
4. 三站页面和媒体请求保持真实；只有 quota check 与 SLS sink 可固定响应。
5. Telegram 12/12 报告结果；Instagram 5 条、Vimeo 1 条在 `disabled-unverified` 期间必须明确报告 skip，不能计入 pass。
6. 所有下载断言必须基于落盘文件，不接受只检查按钮文字或请求发出。
7. 每次 E2E 都 fresh build 当前源码，不复用旧 `dist` 作为通过依据。
8. Playwright 必须保持 `fullyParallel=false`、`workers=1`，全部 Telegram project 必须保持
   `retries=0`。

## 风险

| 风险 | 处理 |
|---|---|
| 登录态过期 | 立即失败并给出对应 setup 命令 |
| Telegram DOM 或固定频道变化 | 输出版本、URL、消息 ID、选择器和 profile |
| Instagram DOM、样本或 CDN 变化 | 输出 route、entity、按钮、网络和文件诊断，不回退假页面 |
| Vimeo Cloudflare challenge | 明确环境 skip，不记录为产品通过 |
| 下载目录污染 | `testRunId` 隔离，登录 profile 不随 `test:clean` 删除 |
| 线上额度波动 | 只固定 quota check，并精确断言调用次数 |
| 正式埋点污染 | SLS 请求固定返回 `204` |
