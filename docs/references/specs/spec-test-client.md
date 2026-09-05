# 客户端测试规范

> `website`（Astro 静态站）、`admin` 与 `extension*`（MV3 插件）测试**强制规范**。写/改前端测试前必读。
> 各端测试体系独立，分章遵守。
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

### 2.2 e2e：Playwright

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
- website 的浏览器 project、后端隔离方式与启动命令以 `website/playwright.config.ts` 和 `website/package.json` 为准。
- admin 的浏览器 project 与入口以 `admin/playwright.config.ts` 和 `admin/package.json` 为准。
- 断言：Playwright 原生 `expect`（`toHaveTitle` / `toBeVisible` / `toContainText` / `toHaveCount`），用 locator auto-wait，禁 fixed sleep。

| 命令 | 说明 |
|------|------|
| `pnpm test:e2e` | 运行当前端 `playwright.config.ts` 定义的项目 |

## 3. extension 测试

### 3.1 单测：vitest + happy-dom

- vitest + happy-dom；目录 `extension/tests/unit/**` + `tests/integration/**`，`*.spec.ts`。
- chrome mock：`tests/mocks/chrome-api.ts`（完整 mock，每方法 `vi.fn`，支持 callback 与 Promise 两种形态），`setupFiles: tests/setup.ts` 注入 `global.chrome`。
- **覆盖率 80% 硬门槛**（lines / functions / branches / statements，v8 provider）。
- 范式：`vi.stubGlobal('__DEV__', ...)` + 动态 import；`vi.mock` 替换 logger / storageManager / Router。
- 命令：`pnpm test:unit:run` / `test:coverage`。
- `setup.ts` 把 `console.log/warn/error/info` mock 成 `vi.fn`；需要验证日志行为时必须显式断言 mock 调用。

### 3.2 e2e：Playwright + 加载 unpacked 扩展

- 用 `launchPersistentContext` + `--load-extension=dist-real --disable-extensions-except=dist-real` 加载扩展（`tests/e2e/harness.ts`），从 service worker URL 反解 `extensionId`。
- 持久化 context 与 profile setup 使用支持
  `--load-extension` 的完整 Chromium headed 模式，并在任何站点页面创建前安装身份 init
  script。新版稳定 Google Chrome 不允许这条 unpacked extension 启动链路，禁止用于插件 E2E。
- 目录与测试发现以各端 `playwright.config.ts` 的 `testDir` / `testIgnore` / project 为准。
- **extension（013 Maps Extractor）e2e 为真实界面单层（2026-09-02 起）**：禁止 route mock 站点页面、本地 fixture 页与本地 mock 服务，直接打开真实 `www.google.com/maps` 采集真实数据。Google 同意页自动接受；环境波动（人机验证/落地域偏离/DOM 改版）条件化 skip 并记 skip-reason，插件自身行为（三态/暂停/计数/导出）失败照常 fail。Playwright 必须做反自动化身份处理（去 `--enable-automation` + `--disable-blink-features=AutomationControlled` + 身份兜底 init script，website browser-identity 同款）。登录流程不做 e2e：登录态由 `backend/scripts/e2e_seed_user.py`（`maps-extension-pro` 场景）签发真实 token 对，spec 经扩展 service worker 直写 `chrome.storage.local` auth 三键；本地 backend（127.0.0.1:7600）不可达时登录态用例 skip，匿名用例不受影响。采集间隔等用户设置经同一 `chrome.storage` 通道直注（真实用户可设的同一通道，压有界时长）。构建变体 `dist-real`（API 指向本地 backend、SLS 构建期禁用）随 `pnpm test:e2e` 前置产出。
- Playwright 配置使用 `fullyParallel=false`、`workers=1`；执行范围以各端配置中的 project 与 `tests/e2e/` 为准。
- 不得增加生产测试开关、第二套启动框架或组件级假 E2E。
- **chrome.* 是真实浏览器实现**，不 mock；`chrome.storage` 直接在 page 里操作。
- **extension-bing（016）e2e 为真实界面单层（2026-09-02 起）**：禁止 route mock 站点页面与
  本地 fixture 页，直接打开真实 `www.bing.com/maps` 采集真实数据；Playwright 必须做反自动化
  身份处理（去 `--enable-automation` + `--disable-blink-features=AutomationControlled` +
  身份兜底 init script，website browser-identity 同款）；环境波动（人机验证/落地域偏离/DOM
  改版）条件化 skip 并记 skip-reason，插件自身行为失败照常 fail。登录流程不做 e2e：登录态由
  `backend/scripts/e2e_seed_user.py`（`bing-extension-pro` 场景）签发真实 token 对，spec 经扩展
  service worker 直写 `chrome.storage.local` auth 三键；本地 backend 不可达时登录态用例 skip。
  构建变体 `dist-real`（API 指向本地 backend、SLS 构建期禁用）随 `pnpm test:e2e` 前置产出。
  合同见 `docs/feat/016.Bing插件/references/T1-技术设计.md` §6。
  随 v3 移除 manifest 固定 key，扩展 ID 不可预知：service worker 定位、事件 origin 过滤一律从
  `context.serviceWorkers()` 动态提取，禁止写死 `EXTENSION_ID` 常量。
- 外部环境导致的挑战页、网络不可达或落地域偏离可以带明确原因 skip；插件自身行为失败必须 fail。报告必须区分通过、失败、环境 skip 与未执行，必需验收不足不能因退出码 0 判为完成。

| 命令 | 说明 |
|------|------|
| `pnpm test` / `test:unit:run` | vitest 单元测试 |
| `pnpm test:e2e` | 构建前置 `pnpm build:real` + playwright 真实界面 e2e（headful，真实出网） |
| `pnpm test:clean` | 仅 `extension/` 提供：清理 tests/logs 运行输出 |

## 4. 数据、登录态与清理

- Maps/Bing 登录态由 `backend/scripts/e2e_seed_user.py` 的对应场景幂等签发，spec 经扩展 SW 写 `chrome.storage.local`；本地 backend 不可达时只 skip 登录态用例。
- 每个真实用例使用独立临时 persistent profile，扩展 ID 从该 context 的 service worker 动态提取。
- 测试数据依赖 seed 与 profile 隔离，不做无业务价值的严格 DB 清理。

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
| extension-bing e2e route mock 站点页面或使用本地 fixture 页 | 会把真实界面验收降级为 fixture 验收（2026-09-02 hydra 拍板，真实界面为唯一主验收） |
| extension maps e2e route mock 站点页面、使用本地 fixture 页或本地 mock 服务 | 同上（2026-09-02 拍板，真实 Google Maps 界面为唯一主验收） |
| 用 component mount 代替 extension e2e | 无法证明 background、content、injected、Manifest 与真实 Chrome API 启动链 |
| 绕过既定 seed/profile 合同硬编码共享账号、token 或文件名 | 破坏幂等 seed 与逐用例隔离，造成并行污染 |

## 7. checklist

**website**
- [ ] 纯函数用 `importCompiledTypescriptModule` 编译 + import
- [ ] e2e mock 跑用 `page.route` + 假 base URL
- [ ] 每个 spec 已注册 `registerE2eBrowserIdentity(test)`，身份门禁通过
- [ ] 断言用 locator auto-wait，无 fixed sleep

**extension**
- [ ] 单测 chrome mock 走 `tests/mocks/chrome-api.ts`
- [ ] 覆盖率达 80%
- [ ] e2e 用统一完整 Chromium headed 身份的 `launchPersistentContext --load-extension=dist-real`
- [ ] E2E 加载 fresh-built unpacked extension 并证明 background/content/injected 启动，不只挂组件
- [ ] Maps/Bing 真实站点页面与 chrome.* 不 mock
- [ ] 报告已区分通过、失败、环境 skip 与未执行，必需验收证据充足
