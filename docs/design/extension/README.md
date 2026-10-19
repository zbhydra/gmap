# MapsGrab 插件设计稿 · Atlas Field

Maps 插件（`extension/`）Atlas Field UI 已于 **2026-10-18 落地到仓库实现**。本目录保留可运行设计原型：纯 HTML + 原生 CSS / JS，零依赖、无构建、无 CDN。逻辑调整见 [logic.md §9](logic.md#9--已落地逻辑调整2026-10-18)，当前产品合同见 [013 feat](../../feat/013.Maps插件/feat.md)；此处不表示已部署或商店发布。

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| A · 基础 | token、组件、动效、页内面板词汇、原型运行时、[design-system.html](design-system.html)、[index.html](index.html) | 完成 |
| B · 界面 | [popup.html](popup.html) · [panel.html](panel.html) · [dashboard.html](dashboard.html) · [options.html](options.html) | 完成（§10） |

```text
docs/design/extension/
├── index.html            设计中枢：各界面实时缩略图、L1–L12、基础文件
├── design-system.html    设计系统：颜色 / 字体 / 间距 / 动效 / 全部组件 / 页内面板 / 图标 / 搭建规范
├── popup.html · panel.html · dashboard.html · options.html    四个界面
├── logic.md              界面逻辑全景（输入文档）
├── tools/check.py        静态校验（§11）
└── assets/
    ├── css/   tokens · base · components · motion（扩展页面）· panel（页内面板）· proto（原型专用）· pages/<key>.css
    ├── js/    theme · motion · ui（运行时）· proto（原型专用）· pages/<key>.js
    ├── fonts/ Plus Jakarta Sans · Azeret Mono（latin 子集可变字重 woff2 + OFL）
    └── img/   icons.svg（121 个 symbol）· logo.svg
```

token、组件与面板样式、交互行为、图标与字体已翻译为生产实现；`proto.*`、`pages/*` 及 `MG` / `UI` 原型运行时只属于设计稿。

## 1 · 怎么看

```bash
cd docs/design/extension && python3 -m http.server 7691 --bind 127.0.0.1
# 打开 http://127.0.0.1:7691/
```

必须走 HTTP：sprite `<use>`、`fetch` 与 Shadow DOM 里的 `<link>` 在 `file://` 下不工作。浏览器用 Chrome 123+（`light-dark()`）。

左下角深色工具条是**状态坞**（原型专用）：切换页面声明的状态组、主题（System / Light / Dark）、减弱动效模拟、播放流程。文档页默认折叠，原型页默认展开。URL 参数可组合出任意状态的截图地址：

| 参数 | 作用 |
| --- | --- |
| `?s.<group>=<value>` | 深链到某个状态，例如 `popup.html?s.usage=near` |
| `?theme=light\|dark\|system` | 本次打开的主题（不写入存储） |
| `?motion=reduce` | 模拟系统「减弱动态效果」 |
| `?dock=0` | 隐藏状态坞 |
| `?embed=1` | 缩略图嵌入：隐藏状态坞与舞台标签 / 注释（index.html 用） |

## 2 · 设计语言：Atlas Field

**Atlas 的仪器层。** 官网 Atlas 讲「地图进、数据出」的故事；插件是用户真正干活的仪器——同一个品牌，更密、更静、读数优先。

1. **Map in, data out**：每个界面讲同一件事 pin → scan → rows → export；图标、空态、动效都按这个顺序。
2. **Instrument, not poster**：密、静、表格化。数字一律等宽表格数字并右对齐；渐变只标记品牌与进度。
3. **Every state is legible**：状态不只靠颜色——圆点 / 暂停条 / 勾 / 叉 + 文字；错误说清原因和下一步（L2）。
4. **Motion reports**：动是因为有事发生（数字滚动、任务开始、文件导出）；循环只在任务运行时存在。
5. **A quiet guest**：页内面板是 Google Maps 的客人——系统字体、只动 transform / opacity、不抢地图。

与 Atlas（`docs/references/specs/design-website.md`）的关系：

| | 沿用 Atlas | Atlas Field 的改动 |
| --- | --- | --- |
| 颜色 | 品牌蓝 #1a73e8、原色、语义 token 同名同值、`light-dark()` 双主题 | 新增产品语义：中性状态、状态实底（`-solid`）、进度轨、凸起面、焦点光晕、开关关闭轨、`--on-solid` |
| 字体 | Plus Jakarta Sans + Azeret Mono | 正文 13–14px（Atlas 16–19）；页内面板改系统字体（L10） |
| 形状 | 4px 间距刻度、圆角刻度 | 控件更方正（`--r-control` 10）、卡片降一档（`--r-card` 16）；控件高 28 / 36 / 44 |
| 动效 | 同一组缓动曲线、同一套减弱动效机制 | T2 收到 280ms；不要 hero 编排、滚动叙事、玻璃拟态、AI 风渐变；动效只汇报状态 |

界面宽度：Popup 400 · 页内面板 280 · Dashboard 内容 1120 · Options 内容 680。

## 3 · Token（assets/css/tokens.css）

扩展页面唯一的字面量来源，组件与页面只写 `var(--…)`。分十节：品牌原色 / 语义颜色 / 产品层新增颜色 / 表达层（渐变）/ 字体 / 间距与尺寸 / 圆角 / 投影 / 动效 / 层级。完整色板与实测对比度见 design-system.html#color。

- **主题（L11）**：`:root { color-scheme: light dark }` 跟随系统；`<html data-theme="light|dark">` 手动覆盖（原型存 localStorage `mg-ext-theme`，生产并入扩展主题偏好并同步到所有界面）；`.scheme-dark / .scheme-light` 把局部固定为暗 / 亮。
- **主色是唯一行动色**：`--primary` 作填充（两主题同值，白字 ≥ 4.5:1）；作文字用 `--primary-text`。叙事色（`--cyan`、`--accent`、`--pin`、`--star`）只用于插画与数据语义。
- **状态色四件套**：`--ok / --warn / --bad` 作文字，`-soft` 作底，`-solid` 只画图形（圆点、进度、环），`-fg` 是实底上的字；`--neutral*` 给 Idle / Pending。
- **语气类** `.tone-primary / -ok / -warn / -bad / -neutral`：放在元素或祖先上，组件经 `--tone / --tone-soft / --tone-solid / --tone-strong / --tone-fg` 换色，不为每个组件写状态变体。
- `--on-solid`：任何主题下都画在彩色实底上的白（按钮字、pin 芯、开关圆钮）。组件里不出现具名色。
- **对比度**（实测，两主题）：全部文字组合 ≥ 4.5:1，唯一例外是 `--text-3` 在 `--surface-3` 上（4.28 / 4.17）——**`--text-3` 不放在 `--surface-3` 上**；开关关闭轨对底 3.14 / 3.04（非文本 ≥ 3）。
- **字号**：`--fs-micro` 10.5 · `-kicker` 11 · `-xs` 12 · `-sm` 13 · `-body` 14 · `-md` 15 · `-h2` 18 · `-h1` 24；读数 `--fs-stat-sm / -stat / -stat-lg` 20 / 28 / 40（等宽）。`--fs-display / -section / -lead` 只给文档页。
- **尺寸**：间距 `--s-1 … --s-24`（4px 基准）；控件高 `--control-h-sm / --control-h / --control-h-lg` 28 / 36 / 44；图标 `--icon-xs … --icon-xl` 14 / 16 / 18 / 20 / 24。
- **圆角用别名**：`--r-control`（输入、菜单）、`--r-item`（菜单项、复选）、`--r-card`（卡片、Toast、面板）、`--r-dialog`。
- **投影**：`--shadow-xs / sm / md / lg / pop`、`--shadow-primary(-hover)`、`--shadow-danger`、`--shadow-thumb / knob`；暗色下层级靠面亮度 + `--hairline-hl` 内高光，不靠加重投影。
- 原型工具的字面量（状态坞、宿主页面模拟）在 proto.css 自己的 token 块里，文档页的在 `pages/*.css` 的 `:root` 里，都不进 tokens.css。

## 4 · 字体

- **扩展页面**：Plus Jakarta Sans（300–800）+ Azeret Mono（400–700），自托管可变字重 woff2 + OFL（`assets/fonts/`），`font-display: swap`。读数用 `.num` / `.mono`（等宽 + `tabular-nums`）。中日韩、泰文、西里尔走字体栈回退（PingFang SC / Microsoft YaHei / system-ui）。
- **页内面板例外（L10）**：Shadow DOM 里 `@font-face` 不生效，也不向 Google 页面注入字体 → 系统字体栈 `--font-system` / `--font-system-mono` + `font-variant-numeric: tabular-nums`。

## 5 · 动效（motion.css + motion.js）

| 级 | 时长 | 曲线 | 用途 |
| --- | --- | --- | --- |
| T1 微交互 | `--dur-1` 120 · `--dur-2` 180 | `--ease-out` | 按下缩放、hover 填充、焦点、颜色 |
| T2 过渡 | `--dur-3` 280 | `--ease-emph` · `--ease-spring` | 菜单、tab、分段滑块、文案形变、弹窗、Toast |
| T3 入场 | `--dur-4` 560 · `--dur-5` 900 | `--ease-out` | Popup 编排（错峰 `--stagger` 40）、列表行、数字滚动、进度推进 |
| 运行循环 | `--dur-live` 1600 · `--dur-beam` 1800 · `--dur-spin` 700 | linear · `--ease-in-out` | live 圆点、扫描弧、进度光束、加载圈——只在运行中存续 |

- 动效汇报状态，不做装饰；一次性效果用 `MG.replay()` 重播，不写常驻循环。
- 每个效果都有减弱动效的**终态**（信息不丢）：系统偏好或 `<html data-motion="reduce">`（状态坞模拟）都生效；JS 里先问 `MG.reducedMotion()`，直接给终值。
- 用法：首屏 `.enter` / `.enter-group`（子元素自动错峰）；长页 `data-reveal` + `data-stagger`；数字 `data-roll` + `MG.roll()`；文案切换 `.morph` + `UI.morph()`；位置变化 `UI.flip()`；主题切换是圆形揭示（View Transitions，不支持时直接切）；演示循环外包 `data-inview`，离屏暂停。
- Popup / Dashboard / Options 可以用足 T1–T3；**页内面板预算**：只动 `transform` / `opacity`；不用 `backdrop-filter` / `filter`、不动投影；循环只有采集中的 live 圆点与扫描弧（合成层）；进度环只在数值变化时过渡一次描边；减弱动效下全部给终态。

## 6 · 组件目录（components.css · base.css）

页内面板不用这些（见 §8）。每个组件的全部状态、标记与可复制代码在 design-system.html 对应章节。

| 组件 | 类名 / 入口 | 要点 |
| --- | --- | --- |
| 排版 / 布局 | `.h1 .h2 .h3 .body .body-sm .caption .muted .subtle .strong .mono .num .kicker(--primary/--mark) .truncate` · `.stack .cluster .row .spacer .divider .page(--narrow) .sr-only` · `.icon(--xs/--sm/--lg/--xl)` · `.brand > .brand-mark` | base.css |
| 按钮 | `.btn` + `.btn-primary / -secondary / -ghost / -danger`，`.btn-sm / -lg / -block`，`.is-loading` · `.icon-btn(--sm/--bordered)` · `.link(--quiet)` · `.link-arrow` · `.morph > [data-key]` | 加载态：spinner 在前、文案不变；文案形变用 `UI.morph()` |
| 徽章 / 状态 | `.badge(--solid/--outline/--pro/--count)` · `.status.status--idle/pending/running/extracting/paused/completed/skipped` · `.chip(--mono)` · `.dot(--live)` · `.kbd` | 状态 = 字形 + 文字；chip 用 `aria-pressed` 切换 |
| 表单 | `.field > .field-label(+.field-aside)` + 控件 + `.field-hint / .field-error` · `.input(--mono)` `.input-wrap`(`.input-addon`) · `.select-wrap > .select` · `.textarea-wrap > .textarea(--mono) + .counter` · `.stepper` · `.check` `.check-row` · `.switch` | 错误文案说下一步；计数 `textarea[data-counter=lines\|chars][data-max]`，`.counter.is-near / .is-over` |
| 分段 / 标签页 | `.seg[data-seg] > .seg-thumb + .seg-btn`（`--block / --sm`）· `.tabs[data-tabs] > .tab + .tab-ink` | 主题分段加 `data-theme-switch` 即绑定 `MG.theme` |
| 卡片 / 列表 | `.card` + `.card-pad(-lg) / -head / -title / -desc / -foot`，`--interactive / --inset / --flat` · `.icon-tile(--sm/--lg/--brand/--soft)` · `.list > .list-item(-text/-title/-desc)` | |
| 设置行 | `.setting > .setting-text(.setting-label + .setting-hint)` + 控件，`--stack`、`.is-disabled` · `.saved-tick` | 即改即存的回执 |
| 页头 | `.appbar(--compact) > .appbar-title + .appbar-actions`，滚动后 `.is-scrolled` | `--compact` 给 Popup |
| 进度 | `.progress > .progress-fill`（`style="--p: 0–100"`，`.is-live / .is-indeterminate`，`--sm / --lg`）· `.ring`（`-svg / -track / -fill / -scan / -label`，`.is-live / .is-empty / .is-done`，`--sm / --lg`）· `.meter`（`.is-near / .is-out`）· `.roller` · `.skel(--title/--num/--circle/--block)` · `.spinner` | 用量表的五个状态（L5）都已画好 |
| 数据表 | `.table-wrap > .table`，`.cell-strong / -num / -mono / -index / -actions`，`.cell-sub`，`tr.is-active / .is-flash`，`--compact / --stagger` | 行内主操作 + More 菜单（L6） |
| 菜单 / 提示 | `.menu[popover] > .menu-item(--danger)`、`.menu-item-meta`、`.menu-sep`、`.menu-label`，触发器 `[data-menu=id]` · `[data-tooltip]` | 都在顶层，不受表格 overflow 影响 |
| 弹窗 | `UI.confirm()` → `<dialog class="dialog">`（`.dialog-body / -title / -desc / -actions`），`within` 时 `.is-contained + .dialog-scrim` | 替代 `window.confirm`（L6）；焦点落在取消 |
| Toast | `UI.toast()` → `.toast-stack(--center) > .toast`（`-icon / -title / -desc / -action / -timer`） | 4 秒，悬停暂停 |
| 通知条 | `.notice(--announce/--banner)`，`.notice-title / -desc / -actions` | 新版本、公告、运行提示、错误条 |
| 空态 | `.empty > .empty-art`（`-map / -pin / -drop / -arrow / -rows`）+ `.empty-title / -desc` + 一个按钮 | pin 落下 → 行出现 → 一个明确的下一步 |
| 账号 | `.avatar(--guest/--lg)` · `.account > .account-text(.account-name + .account-meta)` | 访客 / 登录中 / 已登录 |
| 叙事条 | `.flow > .flow-step(.is-active/.is-done) > .flow-icon` | pin → scan → rows → export |
| 语气 | `.tone-primary / -ok / -warn / -bad / -neutral` | 见 §3 |

图标：`assets/img/icons.svg`，121 个 24×24 线性 symbol（stroke 1.75、`currentColor`），写 `<svg class="icon"><use href="assets/img/icons.svg#i-pin"/></svg>` 或 `UI.icon('pin')`；清单与搜索见 design-system.html#icons。

## 7 · 原型运行时（JS）

四个文件都挂全局，参数细节见各自文件头注释。

| 文件 | 全局 | 要点 |
| --- | --- | --- |
| theme.js | `MG.theme` | `mode() / resolved() / set(mode, { origin })`；事件 `mg:theme`（`{ mode, resolved }`） |
| motion.js | `MG` | `reducedMotion / onMotionChange / roll / tween / inView / replay / transition / formatNumber / token / ms / init`；声明式 `data-reveal / data-stagger / data-count / data-roll / data-inview` |
| ui.js | `UI` | 声明式 `[data-tabs] [data-seg] [data-theme-switch] [role=switch] [data-menu] [data-tooltip] textarea[data-counter] .stepper`；命令式 `toast / confirm / morph / flip / mountPanel / icon / init`；事件 `ui:change / ui:select / ui:count` |
| proto.js | `Proto` | 状态坞（只在原型里） |

```js
// 声明一个状态组：注册时立即以初始值回调一次（prev 为 null）；超过 6 个选项渲染为下拉框
Proto.states({
  group: 'usage',              // 唯一键，也是深链参数 ?s.usage=
  label: 'Usage · L5',         // 状态坞里的显示名
  value: 'normal',             // 初值（URL 参数优先）
  options: [{ value: 'loading', label: 'Loading' }, { value: 'normal', label: 'Normal' }, 'near', 'out', 'error'],
  onChange: function (value, prev) { render() }
})
Proto.set('usage', 'out')      // 程序化切换：同步状态坞、URL、[data-show] 与回调
Proto.get('usage')
Proto.flow('Sign in', function (p) {          // 状态坞里的「播放」按钮
  p.set('account', 'signing-in'); p.step('Signing in…')
  return p.wait(1800).then(function () { p.set('account', 'signed-in') })   // 点 Stop 时 wait 会 reject
})
Proto.refresh(el)              // 动态插入含 [data-show] / [data-hide] 的节点后调用
Proto.places                   // 8 家虚构纽约咖啡店（电话 555-01xx），所有样例数据从这里取
Proto.mapArt()                 // 风格化地图 SVG 字符串
Proto.gmap(el, { mode: 'search' | 'list' | 'place' | 'reviews' | 'photos', query, place })   // Google 宿主页面模拟
```

声明式：`<el data-show="usage:near|out">`、`<el data-hide="account:guest">`；当前值同步到 `<html data-s-<group>="value">`，页面 CSS 可直接写状态选择器。

## 8 · 页内面板（Shadow DOM）

- **自含样式**：只有 `assets/css/panel.css`。`:host { all: initial }` 切断宿主继承；颜色等 token 是 tokens.css 的同名同值子集；面板专属 token 另起名（`--shadow-panel(-primary)`、`--panel-w / -top / -inset`、`--fs-count`、`--dur-reopen`、`--z-panel`）。改值两边同步，`tools/check.py` 会比对。
- **书写**：只用 px（rem 取的是 Google 页面的根字号）；系统字体（L10）；类名一律 `mgp-` 前缀；状态写在 `data-state` 上，Vue 落地直接绑定。
- **外壳**：`.mgp` fixed，宽 `--panel-w` 280，`top: var(--panel-top)` 80，左右距 `--panel-inset` 20，`z-index` 2147483646；`--left / --right` 停靠（搜索、列表默认左，详情默认右，换模式重置，切换用 `UI.flip()` 补间），工作页 `--work` 固定左、无停靠切换。外部样式可在宿主元素上覆盖 `--panel-top / --panel-inset`（外部规则优先于 `:host`）。
- **宽度 236 → 280**：进度环 52 + 两行读数 + 单行「Export 48 places · CSV」至少要约 250 的内容宽；236 时导出按钮换行。
- **主题与动效**：默认跟随系统；宿主元素 `data-theme="light|dark"` 覆盖（L11），`data-motion="reduce"` 是原型的减弱动效模拟。原型用 `UI.mountPanel(host, { html, css })` 挂载（样式表只挂一次，加载完成前隐藏宿主，主题 / 动效随页面同步）；生产由内容脚本订阅主题偏好并写宿主属性，减弱动效直接跟随系统。
- **图标**：原型走外部 sprite；生产已把用到的 symbol 内联进面板模板（内容脚本里跨源 `<use>` 不可用）。
- **原型舞台**：`.proto-browser-page` / `.ds-panel-stage` 带 `contain: layout paint`，让面板的 `position: fixed` 以舞台为参照（穿透 Shadow DOM 生效）。这是原型手段，产品里面板相对视口。
- **参考**：词汇表、12 个状态瓦片、可复制标记在 design-system.html#panel；参考实现是 `assets/js/pages/system.js` 的 `panelHTML()`（可直接搬进 panel.html 的页面脚本）。动效预算见 §5。

## 9 · 页面约定

**文件**：一页一组，以 `body[data-page]` 为键（panel.html 的键是 `maps`，避免与 panel.css 同名）。

| 页面 | `data-page` | 私有样式 | 私有脚本 | 舞台 |
| --- | --- | --- | --- | --- |
| popup.html | `popup` | pages/popup.css | pages/popup.js | `.proto-browser > .proto-browser-page > .proto-popup`（400 宽、最高 600，从工具栏图标下展开）+ 状态矩阵 |
| panel.html | `maps` | pages/maps.css | pages/maps.js | `.proto-browser > .proto-browser-page`（宿主 `Proto.gmap` + 面板宿主 `[data-panel-host]`） |
| dashboard.html | `dashboard` | pages/dashboard.css | pages/dashboard.js | 整页：`.appbar` + `.page`（1120） |
| options.html | `options` | pages/options.css | pages/options.js | 整页：`.appbar` + `.page.page--narrow`（680） |

**`<head>` 固定顺序**（骨架页已写好，不要调整）：

```html
<script src="assets/js/theme.js"></script>              <!-- 同步执行：首帧主题，不能加 defer -->
<link rel="stylesheet" href="assets/css/tokens.css" />
<link rel="stylesheet" href="assets/css/base.css" />
<link rel="stylesheet" href="assets/css/components.css" />
<link rel="stylesheet" href="assets/css/motion.css" />
<link rel="stylesheet" href="assets/css/proto.css" />
<link rel="stylesheet" href="assets/css/pages/<key>.css" />
<script src="assets/js/motion.js" defer></script>
<script src="assets/js/ui.js" defer></script>
<script src="assets/js/proto.js" defer></script>
<script src="assets/js/pages/<key>.js" defer></script>
```

motion.js 与 ui.js 执行时已对 `document` 初始化一次；页面脚本动态渲染后，对新容器调用 `MG.init(el)`、`UI.init(el)`、`Proto.refresh(el)`（都可重复调用，同一元素不会重复绑定）。

**并行规则**（三位设计者同时开工）：

1. 只改自己页面的三件套（html + pages css + pages js）；面板设计者另外负责 panel.css，改完核对 design-system.html#panel 的瓦片。
2. 共享基础文件（tokens / base / components / motion / proto 的 CSS，theme / motion / ui / proto 的 JS，icons.svg）**只做加法**：新 modifier / 新类 / 新 symbol 追加在对应章节末尾，不改既有类的表现；颜色与尺寸先找现有 token，确需新增时写进 tokens.css。新增项在交付报告里列出。
3. 本页专属组件写在本页 CSS，类名带页面前缀：Popup `pp-`、Maps 宿主 `mp-`、Dashboard `db-`、Options `op-`。
4. 状态组可以增改，但必须覆盖 logic.md 对应章节与 L 项的全部状态；最终的组名与取值写进交付报告。

**内容与质量**：

- 文案用 en-US，按可直接成为 i18n 值来写：不拼接句子片段、复数写整句、文字不烘进图片或 SVG；版式要容得下德语 / 俄语约 35% 的伸长。生产文案归入 `extension/src/locales` 的现有命名空间（`popup` / `popupUsage` / `mapsPanel` / `dashboard` / `options`）。
- 错误按原因写并给出下一步（L2），不出现「Something went wrong」这类兜底句。
- 样例数据只用 `Proto.places` 这类虚构数据（电话 555-01xx），不出现真实商户。
- 无障碍：交互元素都有可见焦点（组件已提供）；分段、标签页、开关、菜单沿用组件的 role / aria；状态变化用 `role="status"` 或 `aria-live` 播报；不只靠颜色表达状态；遵守 `--text-3` 规则；点击目标不小于 28px。
- Popup 内的 Toast：在 `.proto-popup` 里放 `<div class="toast-stack toast-stack--center" data-toast-stack></div>`；确认弹窗用 `UI.confirm({ within: popupEl })`。
- 缩略图：index.html 以 `?embed=1` 的 iframe 展示各页（popup 按 1200×750，其余 1440×900），首屏就是缩略图。

## 10 · 各界面

### Popup（popup.html）· 已完成

两个场景：浏览器框里从工具栏图标下展开的**实时 Popup**（状态坞驱动；Popup 内的 Sign in / Sign out / Retry 也能点，官网链接只弹 Toast 提示去向，Open Google Maps / 批量入口 / Settings 打开 panel / dashboard / options 原型）；下方**状态矩阵**把 12 个典型状态排成静态缩略图（同一份 HTML 克隆后 `apply(root, state, { instant })`），点任一格载入上方 Popup，最后两格是与页面相反的主题。

**结构**按 logic.md §2 顺序：品牌头（MapsGrab + 套餐徽章、语言、Settings）→ 运营提示槽 → 引导文案 + Open Google Maps（唯一 primary）→ 批量入口两块并排 → 账号与用量卡（账号行 / 用量 / View plans · Manage subscription）→ 页脚（Help & FAQ · Contact support · 版本号）。常态高 528；单条提示、用尽、不可用都 ≤ 598，不出滚动条；两条提示同时出现时中段滚动，页头出现分隔线。

| 状态组 | 取值 | 画法 |
| --- | --- | --- |
| `account` | `guest` · `signing-in` · `signed-in` | 登录中（L5）：头像外圈扫描弧 + 按钮加载圈（文案不变）+ 说明改为 Continue in the new tab；成功：首字母头像弹出并外扩一圈，名字 / 邮箱 / 按钮文案上下换词，套餐徽章弹出，用量重拉 |
| `plan` | `free` · `pro` · `business` | 只在已登录时生效，访客恒按 Free；额度取 011 Pricing Extension 线（1,000 / 100,000 / 500,000） |
| `usage` | `loading` · `normal` · `near` · `out` · `error` | 骨架与读数同高；near（≥ 80%，L5）琥珀色 + 剩余量 + View plans；out（L3）红色 + Upgrade plan；error（L2）原因 + 下一步 + Retry |
| `notice` | `none` · `update` · `announce` · `both` | 新版本（低于远程最低版本）/ 公告（远程 HTML）；配置读取失败即 `none` |
| `menu` | `closed` · `open` | 语言菜单：14 语两列纵向流 |

流程：Open popup（重播打开编排）· Sign in · Run out of records · Retry usage · Sign out · Notices arrive。

**设计决定**

1. **主题（L11）不进 Popup**：只跟随共享设置（默认跟随系统），在 Settings 修改后即时同步。L11 批准的入口是设置页，单一写入口避免多处切换；主题是一次性偏好；400 宽页头已有语言与设置，德语 / 俄语伸长后再加控件会挤；齿轮一键可达。
2. **用尽时升级成为唯一 primary**（L3）：Open Google Maps 退为 secondary（仍可打开、导出已有结果），用量区出现 Upgrade plan；Business 用尽时按钮文案为 View plans，同样指向 Pricing。
3. **套餐徽章跟在品牌名后**（读作「MapsGrab Pro」），账号行只放名字 + 邮箱，长名字不被徽章挤掉；访客不显示徽章。
4. 运营提示放在页头下方：槽位高度展开 + 提示自上滑入；公告不加关闭按钮（logic 没有这项能力，不新增功能）。
5. 用量读数是等宽数字滚轮：打开、加载完成时从 0 滚到终值，数值变化时从旧值滚到新值；进度条底层恒为品牌渐变，警示色作叠层淡入（渐变与纯色之间无法直接过渡），光束只在数值变化时扫过一次。
6. 语言触发器显示当前语言代码（EN / DE / ZH-TW…），读屏名为「Language: EN (English)」；菜单两列纵向流，方向键按列走。
7. 批量入口并排两块，说明可换两行；访客 / 登录中的说明可换两行，邮箱单行省略——德语伸长实测不截断关键信息。

**动效**（全部有减弱动效终态，循环只动 transform）：打开时 Popup 框淡入缩放，页头 → 提示 → 引导 → 批量 → 卡片 → 页脚 40ms 错峰，卡片落位后读数滚动、进度填充、光束扫过一次；登录形变（扫描弧 → 头像弹出 + 外扩环 → 换词 → 徽章弹出 → 骨架 → 滚动）；near / out 叠层变色 + 说明滑入，out 时主次按钮互换；提示槽展开；语言菜单回弹 + 项错峰、箭头翻转；hover / press 沿用组件（主按钮光泽与 pin 落点、卡片上浮与图标倾斜、新标签箭头斜移、齿轮旋转、Retry 图标回转）。循环只有登录中扫描弧、按钮加载圈、骨架扫光。

**生产接线**：套餐徽章读取用量快照的套餐名；账号展示与重置日期按 [Popup 产品合同](../../feat/013.Maps插件/feat.md#popup) 执行，重置日期使用 America/New_York 业务月。

**交付说明**：共享基础文件零改动。`.roller` 在滚动容器里多出空白滚动区的问题已统一修进 components.css。

### Maps 面板（panel.html）· 已完成

三个场景：① **Google Maps 实时演示**（风格化宿主 + 真实 Shadow DOM 面板）：Start / Pause / Resume / Export / Reset、停靠切换、Reviews / Photos 入口、升级卡的 View plans / Check again、消息里的 reload 都能点，外链只弹 Toast 说明去向；② **评论 / 照片工作页**实时演示；③ **状态矩阵**：7 组 36 块静态瓦片（每块独立 shadow root + 舞台视口，跟随主题与减弱动效），「Open live ↑」把同一状态载入上方演示。`?embed=1` 且未指定状态时默认完成态，作 hub 缩略图（pin 全亮、无常驻循环）。

**结构**：宽 280（§8 不变）。槽位自上而下（`data-slot`）：头部（品牌 · 模式标签 Search / List mode / Place / Reviews / Photos · 停靠切换）→ `context` 批量任务条 → `notice` 运营提示 → `status` 进度环 + 状态行 + 滚轮计数 N / 上限 + 说明 → `task` 收尾补全进度 → `msg` 原因消息 → `upgrade` 升级卡 → `actions` 主 / 次按钮 → `section` This place（Reviews / Photos）→ 页脚（套餐 · 单次上限 · Help）。落地参照 `pages/maps.js`：`view()` 是状态到视图的映射，`panelHTML()` 出初始标记，`patch()` 在同一批元素上就地更新（环描边、滚轮、按钮换词因此能过渡），`MSGS` 是按原因的全部文案。

| 状态组 | 取值 | 画法 |
| --- | --- | --- |
| `mode` | `search` · `list` · `place` | 模式标签、默认停靠（左 / 左 / 右）、宿主页面与地址栏一起切换；换模式重置停靠侧 |
| `run` | `idle` · `extracting` · `paused` · `complete` | L1：环 = N / 本次上限；采集中扫描弧 + 脉冲点、计数滚动、主按钮变 Export N · CSV、次按钮 Pause；暂停「Paused · N places」+ Resume；完成 Export 主、Reset 次，说明区分「达到本次上限」与「列表到底」 |
| `quota` | `ok` · `low` · `out` | low：上限按月余额收紧（0 / 3，说明写剩余与重置日）；out（L3）：环满红 + 锁、读数改为本月用量 1,000 / 1,000、Start 真 disabled、升级卡恒显示（View plans → Pricing，Check again） |
| `error` | `none` · `not-searched` · `parse` · `google` · `unknown-place` | L2 按原因给下一步；选中时自动拨到它会出现的模式 / 运行态 |
| `rows` | `ready` · `opened` · `blocked` · `error` | L4：opened「Collecting in a new tab」+ 方形再次打开按钮、4 秒复位；blocked 随额度用尽；error = 地点无法识别 |
| `finish` | `plain` · `contacts` · `download` · `both` | 完成后的收尾（取自设置）：补全邮箱 / 社媒（任务进度卡）、自动下载（消息 + Toast） |
| `extra` | `none` · `update` · `announce` · `bulk` | 新版本 / 公告；批量任务条（提案） |
| `work` | `reviews` · `photos` | 工作页（§4）：固定左侧、无停靠切换、无 Pause |
| `wstate` | `extracting` · `complete` · `checking` · `no-reviews` · `google` · `quota` | checking = Reset 重查额度（Export / Reset 都不可用）；no-reviews / google 见决定 4 |

流程：Search run · List mode · Place · reviews & photos · Limit & upgrade · Errors (L2) · Finish · contacts & download · Bulk task item · Reviews work page。

**设计决定**

1. **Start 即重读额度**（L3）：主按钮原位变加载圈「Checking records…」约 0.5 秒，再进入采集或被挡住。被挡住后 Start 真 disabled，「每次重查」落在升级卡的 Check again：仍用尽时提示刚查过、仍无余额；可用则回到 Ready 并提示 Records available again。
2. **一个按钮形变到底**：主按钮 Start → Checking → Export N · CSV（采集中随时可导出，0 条时 aria-disabled）→ 导出后按钮内「Exported」回执 1.6 秒 + Toast（文件名沿用 `MapsGrab-Extractor-{n}-{query}-{date}.csv`）；次按钮 Pause ↔ Resume → Reset。按钮元素不换，读屏与焦点不跳。
3. **原因消息放在状态与按钮之间，下一次成功动作清除**（L2）：not-searched 留在 Ready（首页没有结果列表）；parse 不中断采集，读到下一批即清除，消息内带 reload 入口；google 自动暂停，Resume 即清除；地点无法识别只落在 This place 区。说明行只讲发生了什么，下一步交给消息，同一句话不说两遍。
4. **工作页两个新终态**：Google 中断 → `stopped`「Stopped early」（琥珀 + 叹号，保留已采集，Export + Reset）；无评论 → `empty`「No reviews found」（横线、环不填充、无 Export），不把「没东西」画成成功。
5. **收尾补全期间 Export 等待**：主按钮显示「Adding contact details…」，避免导出缺列的文件；自动下载在补全之后触发。
6. **停靠切换**：`UI.flip` 只在 x 方向补间，不缩放。
7. **无障碍**：计数播报节流（`.mgp-sr` aria-live=polite；状态 / 消息变化立即播，纯计数至少间隔 3 秒）；真 disabled 只给被挡住的 Start，处理中 / 暂不可用用 `aria-busy` / `aria-disabled` 保留焦点；控件消失（Reset 回 Ready、解锁后升级卡离场）时焦点转交下一个可操作按钮；亮 / 暗两主题面板文字对比度全部 ≥ 4.5:1（最低 4.51，主按钮白字）。
8. **宿主叙事**只为讲清采集（插件不改 Google 页面，页面说明里写明）：结果列表平移、正在读取的行高亮、已采集打勾；pin 未读压暗、读到点亮 + 一次波纹 + 角标；采集中一条 2px 扫描线。工作页评论逐页打勾、照片大图交替。

**动效预算**（Playwright 实测）：面板内动画只动 transform / opacity，环描边 `stroke-dashoffset` 只在计数 / 状态变化时过渡一次；采集中常驻循环只有扫描弧与脉冲点，空闲 / 暂停 / 完成为零；形变按钮里未激活状态的加载圈不转；面板内无 backdrop-filter；`?motion=reduce` 时面板、瓦片与宿主都没有循环。

**已落地追加项（2026-10-18）**：批量只读条、Check again、Exported、补全等待与工作页 stopped / empty 已接入生产。当前状态与操作见 [采集面板合同](../../feat/013.Maps插件/feat.md#采集面板)，工作页导航与计量边界见 [技术合同](../../feat/013.Maps插件/tech-采集与批量.md)。图库未就绪时仍不挂载工作面板。

**交付说明**：共享基础文件零改动；panel.css 重写并保留 system.js（design-system.html#panel）用到的全部类，12 块瓦片亮 / 暗复核无回归；新增 `.mgp-sr`、`.mgp-context*`、`.mgp-task*`、`.mgp-upgrade-actions`、`.mgp-status[data-state=stopped|empty]`、`.mgp-msg[data-tone=ok|neutral]`、`.mgp-btn[aria-busy|aria-disabled]`、`.mgp.is-steady`，用到的 token 都是 tokens.css 已有的同名同值项。

### Dashboard（dashboard.html）· 已完成

一个整页场景，带实时调度模拟（`pages/dashboard-sim.js`：样例任务、单任务调度、卡死判定压缩为 3.6 秒）：表单、开始 / 暂停 / 续跑 / 重跑、More 菜单的复制与删除都能操作；Help、View plans 只弹 Toast 说明去向，Settings 以新标签打开 options.html。未给 `s.view` 时：有任务在跑落在它的详情（§5.1），给了 `s.form` 落在新建，`?embed=1` 落在历史（调度冻结、数字直接写终值，作 hub 缩略图）。

**结构**：页头（MapsGrab | Bulk tasks · 运行胶囊 · Settings · Help）→ 工具标题与说明 + 工具分段 Keywords / Review URLs（在跑任务所属工具带脉冲点）→ 视图栏：标签 New task / Task history (n)（墨条滑动）+ 任务位读数「n / 150 tasks saved on this device · both tools」与细条（≥ 140 琥珀、满额红）→ 吸顶提示槽 → 视图。内容宽 1120。

- **新建**：表单卡 + 右侧 340 吸顶摘要栏。表单：任务名 → 列表（等宽多行，角上计数胶囊 `n / 500`，超过 500 变主色「1,240 / 500 · 3 tasks」，不算错误）→ 清理回执（n duplicates removed、n empty lines removed；评论再加「n links aren’t Google Maps place or review links — they will be skipped」）→ Reviews per place（仅评论，100–2,500 步长 100，默认 300）→ Stuck retry 只读块（L9：「Set in Settings」徽章、`1 2 → Skip` 读数、卡死定义、Change in Settings 指向 options.html#automation）→ 页脚（按钮旁一句原因 · Clear · Create task · Start extracting）。摘要栏：Summary「n keywords → k tasks」+ 拆分预览（分段条、`name_1…_k` 与各自条数）；Quota check（规则「10 per keyword / N per place」、需要的额度、本月已用 + 本任务叠条、Left after，不够时红色原因 + 下一步 + View plans）。
- **历史**：当前工具的任务，新的在上。列：# · 任务（名称 + 条数 · 每店上限 · 创建时间）· 状态 chip · 进度（已处理 / 总数滚轮 + 细条，运行中有光束 + `try · complete · stuck · skip`）· 操作（View、主操作、More）。运行中的行高亮并实时更新；空态给 New task 与名额说明。
- **详情**：Back / Task history / 名称 → 状态头卡（名称 + chip、元信息、主操作 + More；大号已处理 / 总数 + 百分比；大进度条；状态行「Working on keyword 86 of 128 in a background tab」/「Paused — resumes at keyword 85」/「Finished …」；四格读数 Completed · Records · Skipped（分因）· Attempts（含重试数）；运行中显示保持浏览器开启的提示）→ 条目表（限高 520 内滚、表头吸顶；# · 关键词或 URL · 状态 · 记录数）。条目状态：Pending / Extracting（三点闪）/ Retrying · try n（琥珀行，↻ 转动）/ Completed（记录数滚出）/ Skipped: no progress / Skipped: invalid URL。评论 URL 主机名淡、路径解码，有效的是新标签链接，无效的原样显示。
- **More 菜单**（L6）：Copy completed / Copy pending（未完成的全部，含跳过项）/ Copy all，各带条数、0 条时 aria-disabled；Delete task… → 站内确认（危险样式，运行中的任务写明删除会停止它，已下载文件保留）。

| 状态组 | 取值 | 画法 |
| --- | --- | --- |
| `tool` | `keywords` · `reviews` | 标题、说明、表单文案、列名、每店上限、重试读数单位随工具切换；两个工具各自保留未提交的草稿 |
| `item` | `extracting` · `retrying` | 当前条目第 1 次 / 第 2 次尝试；retrying 时详情的当前行转琥珀「Retrying · try 2」，停留 8 秒后照常完成 |
| `task` | `idle` · `running` · `paused` · `completed` | L7：当前工具的重点任务（Coffee shops · Brooklyn / Bakery reviews · Lower East Side）摆到该状态；主操作 Start / Pause / Resume / Run again；running 时另一工具的在跑任务先被暂停（全局只跑一个） |
| `form` | `blank` · `valid` · `split` · `no-name` · `empty` · `over-quota` · `full` | valid 带重复与空行；split 1,240 条 → 3 个任务；no-name / empty 行内错误；over-quota 额度不够（右栏 + 按钮旁原因）；full 名额满（填满到 150）+ 错误条 |
| `view` | `new` · `history` · `empty` · `detail` | empty = 当前工具无任务（名额读数相应扣除）；detail 打开重点任务 |
| `alert` | `none` · `saved` · `split-started` · `not-started` · `mutex` | 深链摆出提示出现时的视图与数据；成功提示的计时条定格、不自动消失，便于评审 |

流程：Create → run → complete（输名、粘贴 12 行去重、开始、第 4 条卡死后重试成功、完成、Back）· Stuck item → retry → skip · Over 500 → split → start first · Start while another runs · Delete a task。

**设计决定**

1. **全局只跑一个任务，处处看得见**：运行胶囊（名称 + 已处理 / 总数，点它回详情；在该任务详情里隐藏）、工具分段的脉冲点、高亮行。历史里点另一个 Start → 琥珀错误条「Another task is running」+ View running task；表单 Start extracting 时已有任务在跑 → 任务照常保存，「Saved, but not started」+ View running task / Open Task history，且按钮旁事先就有一句提醒。
2. **Back 不暂停**（L8）：Back 回到 Task history（详情是它的下一级），离开运行中的任务时 Toast「… keeps running」+ View task；详情里的提示写明关页不暂停、进度随时保存。从表单开始的任务直接进详情；在列表里点 Start 留在列表，行内实时变化。
3. **主操作一个按钮形变到底**（L7）：Start / Pause / Resume / Run again 叠在同一个按钮里换词，宽度取最宽一项，焦点不丢；View 独立常驻；复制与删除收进 More（L6），删除走站内确认。运行中的操作叫 Pause（结果状态就是 Paused）。
4. **超过 500 不是错误**：计数胶囊换主色并带出任务数，摘要栏预览拆分结果，按钮换成「Create k tasks」/「Start first task」；开始后任务 1 运行、其余保存，提示与摘要栏都写明其余任务从历史逐个开始（只拆成 2 个时直接写 task 2）。
5. **额度检查讲规则不讲预测**：「records needed for the quota check」= 关键词 × 10 / URL × 每店上限（quota.ts 的估算），与本月剩余对比；不够时右栏给原因 + 下一步（删掉 n 条、把每店上限降到 X、升级），按钮旁同步一句；提交时只把视线引过去（右栏轻摆、读屏播报），不再叠一条同文案的顶部错误条。历史里 Start / Run again 额度不够时才用错误条（原因 + View plans）。
6. **150 名额两工具共用，常驻可见**：读数贴在标签旁；超额提交给错误条 + Open Task history；拆分按 k 个任务计。
7. **卡死重试只读**（L9）：读数「1 retry — up to 2 attempts per keyword, then it’s skipped.」+ `1 2 → Skip` 图示 + 卡死定义（90 秒无进展或标签被关）+ 去设置的链接。
8. **评论链接粘贴时就校验**（与 workUrl.ts 同规则：https 的 search.google.com/local/reviews?placeid= 或带两段十六进制 ID 的 www.google.com/maps/place/）：无效条数在清理回执里预告，运行到时显示「Skipped: invalid URL」且不做成链接。
9. **当前条目始终在视野里**：只滚条目表自己的滚动盒（整页不跳）；用户手动滚走后暂停跟随，出现「Jump to current keyword」胶囊。
10. **提示槽**：一次只留一条，新替换旧；错误 `role=alert`、成功 `role=status`，成功 4 秒自动消失（悬停暂停、底部计时条）；吸顶在页头下，-soft 色叠在实底上避免暗色半透明透字。读屏另有一条 `role=status`，进度播报至少间隔 8 秒。
11. **窄窗口**：≤ 1040 摘要栏落到表单下；≤ 760 名额读数移到标签上方，历史行堆叠成卡片行，详情头部换行、读数 2 × 2；≤ 640 页头只留图标按钮、胶囊去掉 Running 字样，表单按钮整行（Start 在上），条目两行。360–1440 无横向滚动。

**动效**（减弱动效下全部给终态、无持续动画，Playwright 用 `getAnimations()` 实测）：工具分段滑块与视图墨条滑动；历史 ⇄ 详情按层级左右滑入、顶层标签切换淡入；行错峰入场、新行闪底色、删除行右移淡出 + 余下行 FLIP 上移；状态 chip 形变（宽度补间 + 换词 + 字形弹一下）；进度条推进，运行中光束扫过；数字滚轮（计数、已处理、百分比、记录、名额、额度）；刚完成条目的记录数从 0 滚出后回到普通样式；拆分分段生长、额度叠条补间；计数胶囊轻跳、清理回执弹入；提示条滑入滑出、运行胶囊弹入；菜单与确认框沿用组件回弹；提交失败字段轻摆。循环只有脉冲点、光束、三点闪、↻ 转动，都只在运行中存在，且只动 transform / opacity。

**已落地追加项（2026-10-18）**：运行胶囊、当前项 Jump、评论链接预校验与摘要栏已实现；暂停退回本次尝试，Run again 按全量条目检查额度。当前操作与错误文案见 [Dashboard 产品合同](../../feat/013.Maps插件/feat.md#批量任务面板dashboard)，实现边界见 [暂停与重跑](../../feat/013.Maps插件/tech-采集与批量.md#暂停与重跑)。本页时间与额度均为原型样例。

**交付说明**：共享基础文件零改动；新增页面私有脚本 `pages/dashboard-sim.js`（模拟数据与调度，在 dashboard.js 之前 defer 加载）。原骨架 dashboard.js 引用了不存在的 `[data-readout]`，index.html 嵌入它时报错，已随骨架一起替换，index.html 现在零控制台错误。`.roller` 在滚动容器 / flex 父级里的溢出问题已统一修进 components.css。原型深链里主题与动效用 `?theme=`、`?motion=reduce`（不是 `?s.theme=`）。

### Options（options.html）· 已完成

一个整页场景：所有控件可操作、即改即存；Privacy Policy 与 View plans 只弹 Toast 说明去向。`?embed=1` 首屏即缩略图。

**结构**：页头（MapsGrab | Settings + 保存胶囊）→ 两栏：左 224 吸顶分区导航（图标 + 名称 + 一行当前取值，如「CSV · 36 / 36」），右 680 内容列（保存失败提示吸顶在列首）→ 页脚（品牌 · 版本号 · Privacy Policy）。舞台由 §9 表中的 `.page.page--narrow` 改为 `.op-shell`（导航 224 + 间距 48 + 内容 680）；≤ 1040 导航收成页头下的吸顶横向标签条，≤ 640 设置行上下堆叠。

- Extraction：滚动间隔分段 5 / 6 / 8 / 9 / 10s（默认 8）；提取邮箱、提取社媒两个开关（PRO 徽章 + 套餐说明行，社媒行列出六个平台图标）。
- Export：格式分段（带文件类型小图标）→ 导出预览托盘 → 字段卡（n / 36 滚轮计数、图例 + Select all / Clear、6 组勾选，组头全选 / 半选 + 组计数）。
- Automation：完成后自动下载（开启后展开下载目录说明与示例路径）、卡死重试步进器 0–9；Integrations 卡：Google Drive / HubSpot。
- Appearance：主题三张单选卡（卡内是固定配色岛里的迷你界面）；语言下拉 14 语（本族语名）。

| 状态组 | 取值 | 画法 |
| --- | --- | --- |
| `save` | `idle` · `saving` · `saved` · `failed` | 页头胶囊 All changes saved / Saving… / Saved / Not saved（`role=status`）；saved：刚改的行在控件旁画出 ✓ Saved；failed：控件回滚、行内 ✕ Not saved、列首吸顶提示「Couldn’t save “X”」+ 原因 + 当前仍生效的值 + Try again / Reload page。坞里直接选 Failed 时以滚动间隔为代表 |
| `plan` | `free` · `gated` · `pro` | free = 现状「Pro feature — free for now.」；pro =「Included in your Pro plan.」；gated = 未来门控探索：两开关禁用 + 锁、12 个 Pro 字段未选且禁用、预览剔除并注明、View plans |
| `format` | `csv` · `json` · `xlsx` | 与页内分段双向同步，预览换版式 |
| `fields` | `all` · `custom` · `none` | 全选 36 / 混合半选（含 Pro 列）/ 全空（计数变警示色，预览空态） |
| `download` | `off` · `on` | on 展开下载目录说明 |
| `integrations` | `unavailable` · `not-connected` · `connecting` · `connected` · `failed` | A10 未决，默认 unavailable（开关禁用 +「This integration is not available yet.」）；其余为未来态：未连接（打开开关即发起授权）、连接中（开关保持开 + `aria-busy`，提示在弹出的窗口完成登录）、已连接（+ Disconnect）、授权失败（原因 + 下一步） |

流程：Edit settings（切 JSON → 关 Contact 组 → 开自动下载 → 一次写入被拒 → Try again → 恢复默认）· Connect Google Drive。

**设计决定**

1. **两栏 + 吸顶导航**：设置页以整页标签打开（`open_in_tab`），Export 分区有 36 个字段很长；导航兼作各区取值摘要，scroll-spy 墨块随滚动滑动，点击平滑滚动并把焦点交给分区标题。内容列仍是 680。
2. **即改即存分两层反馈**：胶囊说明整体状态，行内回执说明刚保存的是哪一行；回执与 Not saved 叠在同一格且常驻占位，出现时说明文字不重排。失败按 L2 写原因与下一步，并写明当前仍生效的值；控件回滚，界面不显示未生效的值。
3. **导出预览托盘**：夹在格式卡与字段卡之间，滚到字段时吸顶在页头下，勾选效果就在眼前。CSV / XLSX 是表头 + 3 行样例（XLSX 带列字母与行号），JSON 是第一条记录（键 = 表头驼峰化、数值列保持数字，与 `columns.ts` 的 `camelizeColumnHeader` / `buildExportJsonValue` 一致）。注记解释样例里的空列：Email / Social Media 要先打开对应开关（可点，跳到开关并高亮），Plus Code 数据源尚未采集。文件名沿用 `MapsGrab-Extractor-{n}-{query}-{date}.{ext}`，过长时省略主干、保留扩展名。
4. **勾选项用显示名，预览用表头原文**：勾选项取 `options.column.*`（Full address、Owner ID、Social Media、CID…），预览与文件里是表头原文（Fulladdress、Owner Id、Social Medias、Cid…），与 `columns.ts` 一致。
5. **Pro 标记两级**：设置行用 PRO 徽章；字段格用皇冠小圆章，图例写明含义，避免 12 个徽章挤占三列网格；gated 时皇冠换锁。
6. **重试读数**：步进器下画出「1 2 … → Skipped」与整句「Up to N attempts per item, then it’s skipped.」，说明写清卡死定义（90 秒无进展或标签被关，logic §5），并注明 Dashboard 只读展示（L9）。
7. **主题卡复用 `[data-theme-switch]`**（MG.theme，与其他页同一写入口）：选中即从所点卡片发起圆形揭示；System 卡左右分屏亮 / 暗，并标出系统当前是亮还是暗（随系统切换形变）。
8. **集成连接中不禁用开关**：用 `aria-busy` / `aria-disabled` 保留焦点；只有 unavailable 是真 disabled。

**动效**（减弱动效下全部给终态；循环只有 Saving 加载圈与 Connecting 状态点，都只在该状态出现时运行）：分区入场错峰 70ms；导航墨块平移 + 读数换值轻跳；分段 / 开关沿用组件弹簧；回执对勾按笔画画出 + 文字上浮；胶囊宽度补间 + 换词；失败行控件轻摆、提示上浮；预览换格式交叉淡化 + 舞台高度补间，增删列 / 键做 FLIP（留下的平移归位、新来的落入并闪一下底色、离开的原地淡出），并自动滚到变化处；值变化（如打开 Email）单元格闪一下；计数滚轮；下载说明展开；重试圆点弹入 / 缩出；主题圆形揭示与「Now light / dark」形变。

**生产范围**：预览、分区摘要与重试读数已实现；保存失败回滚到当前生效值，用户重新修改即可重试。字段全空继续允许，仅在预览显示空态。gated 套餐态与 Drive / HubSpot 未来态仍为原型探索，不属于产品交付；A10 沿用未决与不可用占位边界。正式行为见 [设置页合同](../../feat/013.Maps插件/feat.md#设置页options)。

**交付说明**：共享基础文件零改动，只改 options.html、pages/options.css、pages/options.js 与本节。

## 11 · 校验

```bash
python3 docs/design/extension/tools/check.py
```

- **token lint**：assets/css 下全部 CSS 按 atlas 合同扫描（复用 `scripts/ui_token_lint.py` 的规则：色值只在 token 声明里、圆角 / 投影走 `var()`、间距与字号在刻度上）。
- **面板 token 同步**：panel.css `:host` 与 tokens.css `:root` 同名 token 必须同值。
- **浏览器验收**：用 `website/node_modules` 里已有的 Playwright（不新增依赖），亮 / 暗两主题各截 1440 宽全页，控制台无报错、无 404；`?theme=`、`?motion=reduce`、`?s.<group>=` 组合出需要的状态。

## 12 · 生产实现与原型边界

- 插件视觉合同入口为 [design.md §0](../../references/specs/design.md#0--总览)，extension 的 token lint 使用 Atlas 刻度；Bing 与 Admin 仍有各自合同。
- 两款字体打包 latin 子集（合计约 52KB）；未覆盖字符走系统回退，页内面板统一用系统字体。
- manifest 已声明 Chrome 123 最低版本；主题 View Transitions 不可用时直接切换。
- 生产面板使用内联图标及同名 token 子集；原型 token 副本由 `tools/check.py` 校验。
- Google Maps 宿主页面为风格化模拟，只用于对照面板位置与遮挡；生产叠放及跨界面接线以真实扩展验收为准。
