# Website 工程规范（Astro 营销站）

> 营销站类子项目（Astro SSG）的**强制规范**。写 / 改 website 前必读。本规范与具体站点无关，可整体移植。
> 站点身份、dev 端口、页面清单、部署域名等项目事实见该端 `README.md` 与 `docs/ROADMAP.md`，不进本文。
> 技术栈：Astro（SSG 静态站）+ 原生 TS + 命令式 DOM（**非 SPA**）；Dashboard 工作区等复杂交互界面用 Vue 3 单文件组件（Astro 官方集成，015 U2 起）。
> 关联：设计系统 `design-website.md`、注释与错误定位见 [[spec-code]]。

## 1. 技术栈与构建

- Astro 静态站点（SSG）+ 群岛架构。默认交互逻辑是 `.astro` 组件 `<script>` 块里的**命令式 DOM 操作**；确有重复状态或 DOM 争用的复杂界面（当前为 Dashboard 工作区）用 Vue 单文件组件 `client:load` 装配，公共静态内容仍由 Astro 组件渲染。
- 校验与构建：`pnpm build` = `astro check && vue-tsc --noEmit && astro build`；`astro check` 走 `@astrojs/check` + tsc，Vue 单文件组件的 props/类型由 `vue-tsc` 单独把门，两者都过才算过。
- 无 ESLint/Prettier；类型安全靠 `tsconfig strict: true`。
- 测试：`node --test tests/`（模块脚本单测）+ Playwright e2e；e2e 端口必须可用 env 覆盖（供并行工作区隔离）。

## 2. 代码风格

- `tsconfig strict: true`。
- 禁 `any`；`as unknown` 仅限 `JSON.parse` 后配合类型守卫收窄。
- 不引入 ESLint/Prettier（靠 strict TS + astro check）；如要加须 hydra 同意。

## 3. 目录结构

- `pages/`：Astro 文件路由（SSG），页面装配层只做装配，逻辑进组件 / 脚本；Dashboard 类工作区页面装配 Vue 根组件并传入 i18n 文案 props。
- `components/`：一域一目录——`pages/`（页面级装配组件）、业务域组件（认证、定价、购买、工具矩阵等）、`site/`（站级横切：外壳导航 / 页脚、能力灰化入口、确认弹窗等通用组件）。
- `scripts/`：前端运行时按域拆子目录——API 薄封装、认证、埋点、设备标识、全局错误捕获、站级 UI 运行时（外壳交互 / 动效 / 声明式组件交互 / toast / confirm / 语言切换）、各功能域逻辑。
- `styles/`：全局样式唯一 owner——token、基础样式、动效、组件目录样式与外壳补充，由 Layout 统一引入。
- `layouts/Layout.astro`：唯一 HTML 外壳——引入全局样式、首帧前恢复主题、装配 nav/footer、启动全局脚本（错误捕获、外壳交互、动效）。
- `i18n/`：纯 TS 字典。
- 生成产物（`dist/` / `tmp/` / `.astro/`）不入 git，禁止手改。

## 4. 组件与样式

- 纯 `.astro` 组件 + 命令式 DOM；无第三方 UI 库。
- 设计 token 唯一来源 = `styles/tokens.css`（分层与刻度见 `design-website.md`），组件只消费 `var(--xxx)`。
- 样式原生 CSS + Astro `<style>` scoped（默认）；全局样式只写在 `styles/*.css`，`is:global` 仅用于跨组件需命中动态插入 DOM 的场景（弹窗类）。
- 全站导航是 fixed 悬浮层，不占文档流：页面首个区块自己留出 `var(--nav-h)`（`.page-hero`、首页 `.hero` 已包含）。全局组件类按设计稿组合使用（如 `.btn` + `.btn-primary`），修饰类不单独使用。
- 未交付能力统一消费一份能力可用性表，页面不各自判断：动作入口（安装、购买、获取 Key）用灰化组件，显示但鼠标、键盘都不能触发；指向介绍页的链接（含按钮样式与 `.card-link` 卡片）照常可点，只灰化并加 Coming soon 徽章，不用禁用外观；灰化样式统一由 `styles/site.css` 提供，页面不另写。
- 移动端断点统一 `@media (max-width: 960px)`。
- 禁 Tailwind / CSS-in-JS / CSS Modules。

## 6. 状态管理

- 无 Pinia/Redux/Zustand，无 Vue Router / provide-inject 依赖注入。命令式界面状态 = TS interface + 模块级闭包 + DOM `data-*` 属性；Vue 工作区组件内部用 `ref/computed`，组件间 props/emits。
- 跨组件通信用自定义 `CustomEvent`（`window.dispatchEvent`），不是 EventBus 库；站级会话（`scripts/site/session.ts`）与登录成功/失效事件是导航、Pricing 与 Dashboard 的唯一共享状态源。
- 模块拆分约定：`*-state.ts` 持状态，`*-controller.ts` / `*-render.ts` / `*-elements.ts` 拆职责。

## 7. API 调用

- 原生 `fetch` 薄封装：`getJson` / `postJson` / `postJsonKeepalive`（`scripts/` 的 api 模块）。
- 后端响应信封 `{code, data, msg}`，**成功码才算成功**，否则抛统一错误类型。
- 非信封响应（无 `code` 字段）兜底直返 body，**仅限外部第三方依赖**；自有接口必须返回信封。
- 请求头：`Accept-Language`（读 `<html lang>`）+ `X-Device-Id` + 客户端产品标识，登录后加 `Authorization`。
- base url 走 `import.meta.env.PUBLIC_API_BASE_URL`。

## 8. 路由

- Astro 文件路由，全 SSG。
- 语言路由：默认语言走根路径，其余 locale 走 `[lang]/`，由 `getStaticPaths` 枚举（**非运行时检测**）；新增语言 = 新增字典文件 + 枚举项。
- noindex 页面（工作区、支付回跳、授权中间页等）由 Layout 输出 robots meta，并加入 sitemap 屏蔽清单（按去掉语言前缀后的路由匹配）；不统计的页面给 Layout 传 `analytics={false}`，同时关闭 GA4 注入与首开打点（错误上报、device、登录链不受影响）。

## 9. i18n

- 纯 TS 字典 + `schema.ts` interface 强约束键（每字段 JSDoc）；非 i18next。
- locale 文件在 `i18n/lang/`，`getContent(locale)` 失败回退默认语言。
- 占位符 `{credits}` / `{time}` 就地 `replace`。
- `<html lang>` 由 Layout 输出，作 `Accept-Language` 来源。

## 10. 错误处理

- 业务错误抛统一错误类型（携带 `status/code/data/failureReason`）；基础设施错误抛 `Error('详细上下文')`。
- msg 三要素（哪里 + 什么 + 请求/响应详情），见 [[spec-code]] §2。
- 在负责处理或终止异常传播的边界记录 `console.error(error)`；继续上抛且上层统一记录时不重复日志。网络层失败额外上报埋点通道。
- 全局兜底：window error + unhandledrejection 捕获（同指纹去重），在 Layout 启动。
- 用户可见错误用站级 toast（`type: 'error'`）。

## 11. checklist

- [ ] `pnpm build` 通过（含 `vue-tsc --noEmit`）
- [ ] 无 `any`，`as unknown` 仅 JSON.parse 后
- [ ] API 对接信封成功码
- [ ] 样式 scoped，`is:global` 仅限必要
- [ ] 异常在处理边界记录一次，无重复日志
- [ ] i18n 走字典，无硬编码文案
