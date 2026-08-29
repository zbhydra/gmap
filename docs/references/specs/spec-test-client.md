# 客户端测试规范

> `website`（Astro 静态站）与 `extension`（MV3 插件）测试**强制规范**。写/改前端测试前必读。
> 两端测试体系完全独立，分章遵守。
> 关联：[[spec-website]] [[spec-extension]]、设计系统 `design.md`。

## 1. 总则

1. **E2E 优先**：Less unit tests, more e2e。业务功能优先 e2e 覆盖真实用户路径。
2. **Unit 仅作补充**：只测纯函数、协议转换、类型映射、无 UI/IO 的小逻辑。
3. **稳定性优先**：断言语义/文本/状态/可见性/接口结果/业务副作用，避免像素完美差分。
4. **运行时脚本单测**：下载与运行时脚本的编译和动态 import 覆盖入口是 `website/tests/module-scripts.test.js`；extension 不依赖 website 运行时代码。

## 2. website 测试

### 2.1 单测：Node 内建 `node:test`

- 用 **Node 内建 `node:test`**（非 vitest/jest），断言 `node:assert/strict`。
- 单文件 `website/tests/module-scripts.test.js`，命令 `pnpm test:module-scripts`。
- 覆盖三类：
  - **构建产物**：HTML 不含 `.ts` module script、特定页文案。
  - **SEO 一致性**：sitemap 多语言索引 / hreflang / canonical 与 `i18n/ui.ts` 闭环；`llms.txt` / `robots.txt` / 退役页 CSV 引用的 URL 都对应真实 dist 文件。
  - **TS 纯函数**：SLS 埋点 / API 错误分类 / 登录 / checkin / 媒体解析 等。
- **纯函数测试标准手法**：tsc 编译到临时目录 + 动态 import + patch `import.meta.env.*`（参考 `importCompiledTypescriptModule` / `patchCompiledBrowserModuleFiles`）。
- DOM/浏览器全局：手写 fake（`installGoogleScriptDom` / `installSlsBrowserGlobals` 等）+ 替换 `globalThis.fetch` / `window` / `document` / `navigator`。

### 2.2 e2e：Playwright 双轨

- 目录 `website/e2e/*.spec.ts`。
- 浏览器身份由各端自持脚本管理（website：`website/scripts/playwright-browser-identity.mjs`；
  admin：`admin/scripts/playwright-browser-identity.mjs`）。chromium 系 project 必须消除
  `AutomationControlled`；headless Chromium 的 UA 不得暴露 `HeadlessChrome`，Mobile Chrome
  与 admin chromium 使用本机稳定版 Google Chrome（channel `chrome`）。
- 每个 website/admin spec 必须调用
  `registerE2eBrowserIdentity(test)`，保证新 document 在站点脚本执行前修正
  `navigator.webdriver` 与 Client Hints brands。
- `browser-identity.spec.ts` 是身份回归门禁，断言 JS 侧 UA 与 `navigator.webdriver`
  不暴露自动化标识。该门禁只证明没有已知自曝字段，不承诺绕过 Cloudflare/WAF。
- **mock 跑**（默认）：4 浏览器 project（chromium / firefox / webkit / Mobile Chrome），`webServer` 把 `PUBLIC_API_BASE_URL` 强制指向 `http://homepage-api.test`，spec 内 `page.route('**/api/client/**')` mock 后端。`testIgnore` 排除 smoke spec。
- **真实 smoke**：独立 `parse-download-smoke` project（`testMatch` SMOKE_SPEC），需设 `E2E_REAL_API_BASE_URL`，`globalSetup` 用后端 `e2e_seed_user.py` seed 账号并注入 token。
- 断言：Playwright 原生 `expect`（`toHaveTitle` / `toBeVisible` / `toContainText` / `toHaveCount`），用 locator auto-wait，禁 fixed sleep。

| 命令 | 说明 |
|------|------|
| `pnpm test:e2e` | mock 跑（4 浏览器） |
| `pnpm test:e2e:parse-smoke:single-backend` | 真实 playwright smoke（设 `E2E_REAL_API_BASE_URL`） |
| `pnpm test:e2e:parse-smoke` | ⚠️ **实际调 backend python 脚本**（`e2e_parse_download_multi_node_smoke.py`），非 playwright，注意区分 |

## 3. extension 测试

### 3.1 单测：vitest + happy-dom

- vitest + happy-dom；目录 `extension/tests/unit/**` + `tests/integration/**`，`*.spec.ts`。
- chrome mock：`tests/mocks/chrome-api.ts`（完整 mock，每方法 `vi.fn`，支持 callback 与 Promise 两种形态），`setupFiles: tests/setup.ts` 注入 `global.chrome`。
- **覆盖率 80% 硬门槛**（lines / functions / branches / statements，v8 provider）。
- 范式：`vi.stubGlobal('__DEV__', ...)` + 动态 import；`vi.mock` 替换 logger / storageManager / Router。
- 命令：`pnpm test:unit:run` / `test:coverage`。
- ⚠️ `setup.ts` 把 `console.log/warn/error/info` 全 mock 成 `vi.fn`，单测里看不到错误日志——与「catch 必 console.error」规范冲突，**单测除外**。

### 3.2 e2e：Playwright + 加载 unpacked 扩展

- 用 `launchPersistentContext` + `--load-extension=dist --disable-extensions-except=dist` 加载扩展（`tests/fixtures.ts`），从 service worker URL 反解 `extensionId`。
- 持久化 context 与 profile setup 使用支持
  `--load-extension` 的完整 Chromium headed 模式，并在任何站点页面创建前安装身份 init
  script。新版稳定 Google Chrome 不允许这条 unpacked extension 启动链路，禁止用于插件 E2E。
- 目录：`tests/e2e/*.spec.ts`、`tests/manual/*.manual.spec.ts`（manual 仅 `E2E_INCLUDE_MANUAL=1` 入发现）。
- E2E 分两层：默认 hard gate 可在目标站点真实 HTTPS origin 上 route 本地 HTML/DOM/接口 fixture，但必须加载 fresh-built unpacked extension，并完整启动 background、MAIN injected、ISOLATED content 与真实 Chrome API；禁止只 mount Vue component。真实站点与登录态仅作为显式 Canary / manual，不进入默认 `test`、`check` 或日常 reviewer。
- `extension/` 现有真实 project 继续按平台注册表执行；真实 Telegram project 只在 `E2E_INCLUDE_TELEGRAM_REAL=1` 时加入测试发现。
- Playwright 配置使用 `fullyParallel=false`、`workers=1`；所有 Telegram project（real、
  ad-assets、manual）固定 `retries=0`。每条 Telegram test 开始时先关闭 persistent
  context 遗留的普通页和 Telegram 页，再创建 fresh page，结束时关闭本 test 页面。
- controlled E2E 的 fixture 必须集中在测试入口，只覆盖当前验收需要的站点合同；不得增加生产测试开关、第二套启动框架或组件级假 E2E。真实 Canary 禁止替换站点 document、DOM、结构化数据与媒体响应。
- 真实 Telegram 下载只允许固定 `/api/client/quota/check`，避免持久 profile 的线上每日额度污染；必须断言配额调用次数，Telegram DOM、媒体请求和 Chrome 下载不得 mock。
- Instagram 重新启用后的真实验收固定 Home/Story/Post/Carousel/Reel/Profile 样本；Home 必须滚动覆盖真实视频 current/all，并覆盖图片轮播切换前后按钮绝对序号、可见 media ID 和当前项下载；Story 必须在自动播放状态下载当前张、点击原生下一项并下载新当前张；详情 Carousel 必须覆盖虚拟化 DOM 跨窗口切换后的 current/all 按钮、绝对序号和当前项下载。只允许固定 `/api/client/quota/check`；页面 DOM、结构化数据、媒体请求与 Chrome 下载不得 mock，落盘文件必须逐字节匹配点击后的 CDN 响应。
- **chrome.* 是真实浏览器实现**，不 mock；`chrome.storage` 直接在 page 里操作。
- Vimeo 重新启用后使用真实公网固定样本；只允许屏蔽 SLS 埋点请求，站点页面、配置、媒体和下载不得 mock。Cloudflare challenge 只能记为环境 skip，不能记为通过。
- 登录态：所有 Telegram setup、real、ad-assets、manual 和 verify 入口固定使用同一个绝对
  profile：`extension/tests/logs/test-user-data-telegram/`，不提供 profile 参数或环境变量。
  `pnpm test:setup` fresh build 后关闭恢复出的普通页和 Telegram 页，再创建唯一 fresh owner
  Page；同一页面先等待并确认 A 登录成功，再导航 K 并等待、确认 K 登录成功，任一时刻只有一个
  用于验证的 Telegram Page。A 使用 `.Auth` 与 `#Main #LeftColumn-main` 判断页面状态；K 使用
  `#auth-pages`、
  `body.has-auth-pages` 已移除且 `#page-chats` 可见。A 命中应用终态后等待 5 秒并复查一次；
  K 命中应用终态后固定等待 30 秒再复查，A/K 都通过复查后 setup 自动关闭；真实可用性由随后 A/K smoke 验证，失败时重新执行 setup。
  日常 E2E 只读取 profile，不重复运行 setup。
  Instagram setup 在
  `tests/logs/test-user-data-instagram/` 中维护人工登录 profile 并导出 storage state，real
  project 每个用例把快照恢复到独立临时 profile；Vimeo 使用 `tests/logs/test-user-data/`。

| 命令 | 说明 |
|------|------|
| `pnpm test` / `test:headed` | 完整 Chromium headed；当前执行 Telegram 12 条，Instagram 5 条与 Vimeo 1 条报告 skip |
| `pnpm test:e2e:telegram` | 只运行真实 Telegram 固定频道流程 |
| `pnpm test:e2e:instagram` | Instagram enabled 时运行 5 条真实流程；当前整组 skip |
| `pnpm test:e2e:vimeo` | Vimeo enabled 时运行 1 条真实流程；当前整组 skip |
| `pnpm test:manual` | `E2E_INCLUDE_MANUAL=1` |
| `pnpm test:setup` | fresh build 后用唯一 fresh owner Page 按 A → K 顺序确认或等待登录，两版 ready 后自动关闭 |
| `pnpm test:setup:instagram` | fresh build 后打开 Instagram；已登录直接退出，否则无限等待人工登录 |
| `pnpm test:clean` / `test:report` | 清理 / 看 report |

## 4. 数据、登录态与清理

| | website smoke | extension 真实跑 |
|---|---|---|
| 账号 | 后端 `e2e_seed_user.py` seed，**不清理** | Telegram profile 与 Instagram storage state 保留登录态，不创建账号 |
| token | `globalSetup` 注入 env（`E2E_ACCESS_TOKEN` / `E2E_DEVICE_ID`），spec 写 localStorage | Telegram profile / Instagram storage state |
| 隔离 | project + env 切 base URL | Instagram 使用逐用例 profile；`testRunId`（`e2e-{ts}-{6}`）隔离下载目录 |

两端都不做严格 DB 清理，依赖 fixture / seed / profile 隔离。

## 5. 每个 feat 的 e2e 必含

- **按钮交互**：关键按钮可见、可点、点击后 UI 状态 / 接口调用 / 业务副作用符合预期。
- **列表数据**：展示正确数据、空结果、过滤/搜索、刷新后状态。
- **表单验证**：必填 / 格式 / 边界能拦截或提示，合法表单能提交并成功反馈。

## 6. 禁止事项

| 禁止 | 原因 |
|------|------|
| 像素完美截图作主要验收 | 维护成本高，业务信号弱 |
| `fixed timeout` 等待 UI | flaky，用 locator auto-wait |
| 用 `any` / `unknown` 写测试辅助类型 | 项目禁 any |
| extension e2e 用 `page.route` mock chrome API | chrome.* 用真实浏览器实现，单测才 mock |
| 用 component mount 代替 controlled extension e2e | 无法证明 background、content、injected、Manifest 与真实 Chrome API 启动链 |
| 真实 Canary route 站点页面、DOM、结构化数据或媒体 | 会把外部兼容性验收降级为 fixture 验收 |
| 默认测试或并发进程读取固定登录 profile | 增加 Telegram session 风险与 Chromium profile 锁冲突 |
| 固定账号 / ID / 文件名（extension 下载目录已用 testRunId 隔离） | 并行污染 |

## 7. checklist

**website**
- [ ] 纯函数用 `importCompiledTypescriptModule` 编译 + import
- [ ] e2e mock 跑用 `page.route` + 假 base URL
- [ ] smoke 用独立 project + `E2E_REAL_API_BASE_URL`
- [ ] 每个 spec 已注册 `registerE2eBrowserIdentity(test)`，身份门禁通过
- [ ] 断言用 locator auto-wait，无 fixed sleep

**extension**
- [ ] 单测 chrome mock 走 `tests/mocks/chrome-api.ts`
- [ ] 覆盖率达 80%
- [ ] e2e 用统一完整 Chromium headed 身份的 `launchPersistentContext --load-extension=dist`
- [ ] controlled hard gate 加载 fresh-built unpacked extension 并证明 background/content/injected 启动，不只挂组件
- [ ] 真实 Canary 只有配额接口和 SLS 埋点允许固定响应；站点页面、媒体、通用项目 API 与 chrome.* 不 mock
- [ ] 登录态只走显式 Canary 的固定持久化 profile，串行使用且不复制用户 profile
