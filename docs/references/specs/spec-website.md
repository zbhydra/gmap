# Website 工程规范（Astro）

> `website/` 前端代码**强制规范**。写/改 website 前必读。
> 技术栈：Astro 5.5（SSG 静态站）+ 原生 TS + 命令式 DOM（**非 SPA**）。Vue 集成保留但当前 0 个 `.vue`。
> 关联：[[spec-extension]]、设计系统 `design.md`、注释与错误定位见 [[spec-code]]。

## 1. 技术栈与构建

- Astro 静态站点（SSG）+ 群岛架构。交互逻辑是 `.astro` 组件 `<script>` 块里的**命令式 DOM 操作**，不是 React/Vue 函数组件。
- 校验与构建：`pnpm build`（先构建根路径 Service Worker，再执行 `astro check && astro build`；`astro check` 走 `@astrojs/check` + tsc，替代 `tsc --noEmit`）。
- 无 ESLint/Prettier；类型安全靠 `tsconfig strict: true`。
- 测试：`node --test tests/module-scripts.test.js`（模块脚本）+ Playwright e2e。

## 2. 代码风格

- `tsconfig strict: true`。
- 禁 `any`；`as unknown` 仅限 `JSON.parse` 后配合类型守卫收窄。
- 不引入 ESLint/Prettier（项目当前靠 strict TS + astro check）；如要加须 hydra 同意。

## 3. 目录结构

- `pages/`：Astro 文件路由（SSG）。
- `components/`：`pages/`（页面装配）/ `homepage/`（营销区块）/ `download/`（下载工作区）/ `site/`（站级）。
- `scripts/`：`homepage/`（api/auth/mark/device/ga4/sls/frontend-error-capture）/ `site/`（toast/confirm）。
- `layouts/Layout.astro`：唯一 HTML 外壳，全局 CSS 变量 + nav/footer + 全局错误捕获启动。
- `i18n/`：纯 TS 字典。
`/tg-play-sw.js`：源码 `src/download/service-worker/tg-play-sw.js`，压缩产物在 `public/tg-play-sw.js`，禁止手改生成文件。

## 4. 组件与样式

- 纯 `.astro` 组件 + 命令式 DOM；无第三方 UI 库。
- 设计 token = `Layout.astro` 的 `<style is:inline is:global>` 里一组 CSS 变量（`--color-primary` 等），组件消费 `var(--xxx)`。
- 样式原生 CSS + Astro `<style>` scoped（默认）；`is:global` 仅用于 Layout 全局 token、跨组件需命中动态插入 DOM 的场景（SharedDownloadWorkspace、AuthModal 等）。
- 移动端断点统一 `@media (max-width: 960px)`。
- 禁 Tailwind / CSS-in-JS / CSS Modules（项目未用）。


## 6. 状态管理

- 无 Pinia/Redux/Zustand。状态 = TS interface（如 `WorkspaceState`）+ 模块级闭包 + DOM `data-*` 属性。
- 跨组件通信用自定义 `CustomEvent`（`window.dispatchEvent`），不是 EventBus 库。
- 模块拆分约定：`*-state.ts` 持状态，`*-controller.ts` / `*-render.ts` / `*-elements.ts` 拆职责。

## 7. API 调用

- 原生 `fetch` 薄封装：`getJson` / `postJson` / `postJsonKeepalive` / `requestDownload`（`scripts/homepage/api.ts`）。
- 后端响应信封 `{code, data, msg}`，**`code === 10000` 才算成功**，否则抛 `HomepageApiError`。
- 非信封响应（无 `code` 字段）兜底直返 body，**仅限 mediabunny 等外部依赖**；新增自有接口必须返回信封。
- 请求头：`Accept-Language`（读 `<html lang>`）+ `X-Device-Id` + `X-Client-Product: web`，登录后加 `Authorization`。
- base url 走 `import.meta.env.PUBLIC_API_BASE_URL`。

## 8. 路由

- Astro 文件路由，全 SSG。
- 语言路由：en-US 走根路径，其余 locale 走 `[lang]/`，由 `getStaticPaths` 枚举 `localePaths`（**非运行时检测**）。
- 平台落地页（tiktok/x/instagram/...）双份：根英文 + `[lang]/` 多语言。

## 9. i18n

- 纯 TS 字典 + `schema.ts` interface 强约束键（每字段 JSDoc）；非 i18next。
- locale 文件在 `i18n/lang/`，`getContent(locale)` 失败回退 en-US。
- 占位符 `{credits}` / `{time}` 就地 `replace`。
- `<html lang>` 由 Layout 输出，作 `Accept-Language` 来源。

## 10. 错误处理

- 业务错误抛 `HomepageApiError`（携带 `status/code/data/failureReason`）；基础设施错误抛 `Error('详细上下文')`。
- msg 三要素（哪里 + 什么 + 请求/响应详情），见 [[spec-code]] §2。
- catch 后**必** `console.error(error)`；网络层失败额外上报 SLS。
- 全局兜底：`installFrontendErrorCapture`（window error + unhandledrejection，30s 同指纹去重），在 Layout 启动。
- 用户可见错误用 `showSiteToast(msg, {type:'error'})`。

## 11. checklist

- [ ] `pnpm build` 通过
- [ ] 无 `any`，`as unknown` 仅 JSON.parse 后
- [ ] API 对接 `code === 10000` 信封
- [ ] 样式 scoped，`is:global` 仅限必要
- [ ] catch 后 `console.error`
- [ ] i18n 走字典，无硬编码中文文案
