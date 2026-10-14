# MapsGrab Website 设计稿 · Atlas

本目录是 `website/`（Astro 营销站）改版的**高保真可运行设计稿**：静态 HTML + 原生 CSS / JS，零依赖，在浏览器中直接运行。它是视觉、交互与动效的**目标参考**，不是生产代码；落地时按 §9 映射到 Astro 组件与 i18n。

- 设计语言代号 **Atlas**：把「地图上的一个点」讲成「表格里的一行数据」。
- 活体样式指南：`design-system.html`（全部 token、组件、动效现场渲染，每个示例可展开查看并复制原始标记）。
- 本文是 AI 与人共同的入口：先读本文，再看 `design-system.html`，最后看具体页面源码。

## 0 · 如何查看

```bash
cd docs/design/website && python3 -m http.server 7690 --bind 127.0.0.1
# 打开 http://127.0.0.1:7690/
```

- **必须走 HTTP**：等高线是 CSS mask 引用的 SVG，设计系统页用 fetch 读取图标 sprite，`file://` 下都会被浏览器拦截。
- 主题：默认跟随系统；导航右上角可手动切换（写入 `localStorage['mg-theme']`）。
- 减弱动效：开启系统「减弱动态效果」后，所有循环停止，显现类动画直接呈现终态。

### 页面清单

| 原型文件 | 真实路由 | `body[data-page]` | 说明 |
| --- | --- | --- | --- |
| `index.html` | `/` | `home` | 首页：搜索命令条（匿名预览）+ 产品剧场 + 11 个叙事区块 |
| `extension.html` | `/extension` | `extension` | 浏览器插件产品页，`#install` 为安装区 |
| `online-scraper.html` | `/online-scraper` | `online` | 云端采集产品页 |
| `google-maps-scraper-api.html` | `/google-maps-scraper-api` | `api` | Scraper API；`?api=reviews` → `/google-maps-reviews-scraper-api`，`?api=photos` → `/google-maps-photos-api` |
| `google-maps-scraper-mcp.html` | `/google-maps-scraper-mcp` | `mcp` | MCP 服务产品页 |
| `pricing.html` | `/pricing` | `pricing` | 三产品 tab，`#online` / `#extension` / `#api` |
| `place-id-finder.html` | `/tools/<id>/` | `tool` | 免费工具模板；`?tool=<id>` 切换为其他 6 个工具的外壳 |
| `privacy.html` | `/privacy` | `legal` | 法务模板；`?doc=terms` → `/terms` |
| `about.html` | `/about` | `company` | 公司页；`#contact` 区块即 `/contact` 的模板 |
| `design-system.html` | — | `system` | 设计系统（不对应线上路由） |

真实的 `/extension-login` 页对应原型里的登录弹窗（任何 `[data-signin]` 元素都能打开）。Dashboard、支付回调页（`/paypal/*`、`/clink/*`、`/subscriptions/*`）不在本次改版范围内。

## 1 · 设计语言

**叙事**：搜索 → pin 落点 → 扫描 → 行数据 → 导出。所有插画都在讲这条线，母题是 pin、等高线、经纬网格、扫描光束，收尾落在行、列和 JSON 上。

**四条原则**（冲突时按顺序裁决）：

1. **Map in, data out**：每个视觉只讲一件事——地图上的点如何变成干净的数据。
2. **Calm base, expressive moments**：底面安静（白 / 墨、发丝边框、只有一种蓝色可点击）；渐变、辉光、衬线强调只用于标题、首屏视觉和大数字。
3. **Honest by default**：不写虚构的数字、logo、署名评价；价格与额度逐字来自定价源；样例数据全部虚构（§10）。
4. **Motion explains**：动画演示产品本身；循环离屏暂停；每个效果都有减弱动效下的终态。

**品牌连续性**：品牌蓝 `#1a73e8` 与插件 / Admin 的 Material You `primary` 同值；无衬线与等宽字体（Plus Jakarta Sans / Azeret Mono）与 `design.md` 同族。新增的只有一套衬线斜体，用于标题强调词。

## 2 · 与 `design.md`（Material You）的关系

> **落地前必须先裁决本节。** 当前 `design.md` / `design.dark.md` 是四端统一的 UI token 合同，`scripts/ui_token_lint.py` 对 `website/src` 强制执行。Atlas 是专为营销页设计的「表达层」，**有意突破**了其中若干条款。本次只产出设计稿，未改动 `design.md` 与 lint。

### 偏离清单

| 条款 | `design.md` 合同 | Atlas 做法 | 理由 |
| --- | --- | --- | --- |
| 渐变 | 只允许顶部 `bg-image` 带与骨架屏 shimmer；禁止渐变文字、渐变按钮、彩色投影 | 品牌渐变用于标题强调词与大数字（`.text-grad`）、实心徽章、图标块 hover、进度条；主按钮带蓝色辉光；区块背景有极光光斑 | 营销页需要视觉记忆点；渐变取自地图配色（水域 → 绿地），不引入新色相 |
| 玻璃 | 禁止 `backdrop-filter` | 滚动后的悬浮导航胶囊与弹窗遮罩使用模糊 | 导航悬浮在内容上方时保持可读 |
| 动效 | 150 / 200 / 300ms + 指定缓动；入场 ≤ 0.45s；禁止呼吸类循环、滚动视差、渐变层动效 | T1–T4 四级（§5）：入场 720–1100ms；首屏剧场、扫描光束、极光与等高线漂移、渐变流动、旋转渐变描边、live 点脉冲、视差 | 「动效多」是本次改版的明确目标；全部遵守离屏暂停 + 减弱动效 |
| 字体 | 单视图字重 ≤ 2 档；标题 600 | 400 / 500 / 600 / 650 / 700；display 700；Instrument Serif 斜体做强调词 | 大标题需要更强对比；衬线只作点缀，每个标题最多一处 |
| 字号 | `display-hero` 36 → 58px | display 44 → 86px，h1 40 → 70px，h2 32 → 56px（流式 `clamp`） | 营销首屏的视觉层级 |
| 布局 | 内容列 1120px + 两侧 28px | 1200 / 1360（宽）/ 820（窄）+ 流式 gutter 16 → 32px | 产品剧场与 bento 需要更宽画布 |
| 圆角 | sm 10 / md 16 / lg 24 / full；卡片用 md | 增加 xs 6 / xl 32；卡片用 lg 24 | 大卡片与大面板的柔和感 |
| 投影 | card / pop / modal 三档 | xs / sm / md / lg + `--glow-primary` / `--glow-soft` | 暗色下降低投影，层级改由面亮度表达 |
| Tabs | 下划线式 | 营销页用分段胶囊 + 滑块（`.seg`） | 产品 / 语言切换是营销页的主要交互 |
| Toast | 右上角堆叠 | 右下角堆叠 | 不遮挡悬浮导航 |
| token 命名 | `border-strong`、`head-bg`、`link`、`bg-image` | `--border-2`、`--nav-bg`、`--primary-text`；另增 `--surface-3`、叙事色、地图色、代码色、表达层 | 语义按营销页需要扩展 |
| 色值 | 例：`text #1f1f1f`、`surface-2 #f0f4f9`、`border #dde3ea`、`accent #188038` | 例：`--text #0b1324`、`--surface-2 #f4f7fb`、`--border #e6ebf2`、`--accent #0f8a5f` | 更冷的墨色底，与暗色主题一体设计 |

### lint 现状

用 `scripts/ui_token_lint.py` 的同一套规则（`scan_end`）扫描 `assets/css/` 的 13 个文件，共 **1,568** 处违规：间距不在刻度 630、圆角未用 token 286、裸色值 280、渐变 / 遮罩字面量 204、投影未用 token 85、字号不在刻度 82、行高 1。设计稿按 lint 跑不通是预期内的，但**照搬进 `website/src` 会直接卡在执行门上**。复现（仓库根目录执行）：

```bash
python3 -c "import importlib.util as u; s=u.spec_from_file_location('l','scripts/ui_token_lint.py'); m=u.module_from_spec(s); s.loader.exec_module(m); print(len(m.scan_end('design','docs/design/website/assets/css')[0]))"
```

### 待裁决（二选一）

- **A. 扩展合同（推荐）**：在 `design.md` / `design.dark.md` 增加「营销表达层」一节，明确它只适用于 website 营销页；把所有渐变、遮罩、辉光、极光收进 token 定义（lint 本就放行 token 定义行），把扩展刻度（字号、间距、圆角）补进合同与 lint 白名单；Dashboard、插件、Admin 继续只用 Material You 基础层。
- **B. 回收偏离**：落地时把 Atlas 数值吸附回 Material You 刻度，放弃渐变文字、辉光、玻璃与大部分循环动效。改动最小，但会损失本次改版的主要视觉特征。

## 3 · Token

唯一来源：`assets/css/tokens.css`。

- **语义色只用 token**：文字、底、边框、状态、品牌、叙事色一律用 `var(--…)`，否则主题切换会失效。
- **原型阶段允许的字面量**（仅限以下几类，均与主题无关）：光影常量（白色高光 `rgba(255,255,255,x)`、黑色投影与遮罩、mask 里的 `#000`）；在两种主题下都应为白色的元素（pin 中心点、开关滑块、品牌底上的白字）；恒暗区块里的终端配色；窗口三色点。按 §2 方案 A 落地时，这些都收进表达层 token。

- **三层**：品牌原色（`--blue-500` 等，只在 token 文件和插画内用）→ 语义色（`--bg`、`--surface`、`--text`、`--primary`……）→ 营销表达层（`--grad-*`、`--glow-*`、`--aurora-*`、`--contour`）。
- **双主题机制**：每个语义色用 `light-dark(亮, 暗)` 一次写完两套值，随元素的 `color-scheme` 求值。
  - 默认 `:root { color-scheme: light dark }` 跟随系统；
  - `<html data-theme="light|dark">` 手动覆盖（`theme-boot.js` 在首帧前恢复）；
  - **主题岛**：`.scheme-dark` / `.scheme-light` 让一个区块固定暗 / 亮，岛内全部 token 自动翻转，无需第二套变量。放在 `.section` 上时自动铺 `--bg` 底色与 `--text` 文字色。首页「开发者」、插件页、云端页、API 页、MCP 页与公司页各有一个暗色岛。
  - 非颜色的主题差异（噪点强度）在文件末尾用选择器覆盖。
- **叙事色只用于插画与数据语义**：`--pin`（地图 pin）、`--accent`（已采集）、`--star`（评分）、`--ai`（MCP / AI 语境）、`--cyan`。**行动色只有 `--primary`。**
- **代码窗恒暗**：`--code-*` / `--syn-*` 不随主题翻转。
- 完整色板（亮 / 暗实测值）、间距、圆角、投影见 `design-system.html#color` 与 `#space`。

## 4 · 字体

| 家族 | 用途 | 文件 |
| --- | --- | --- |
| Plus Jakarta Sans（可变 300–800） | 标题、正文、UI | `assets/fonts/plus-jakarta-sans-latin-var.woff2` |
| Instrument Serif（含 Italic） | 只用于标题强调词 `.accent` | `instrument-serif-latin.woff2`、`instrument-serif-italic-latin.woff2` |
| Azeret Mono（可变 400–700） | kicker、ID、坐标、代码、数据 | `azeret-mono-latin-var.woff2` |

- 全部为 OFL 许可，自托管 latin 子集；落地时随字体附上 OFL 许可文本；中文回退沿用 `PingFang SC` / `Microsoft YaHei`。
- **首屏用到的字体必须 `preload`**：正文与等宽两份每页都预加载（kicker、徽章、地址栏、面包屑在首屏都用等宽）；衬线斜体只在标题带 `.accent` 的页面预加载；常规体衬线只用于设计系统页的字体样张，不预加载。没预加载的字体要等 CSS 解析完、渲染到对应文字时才发起请求，关键路径多一跳——补上等宽字体的预加载后，Lighthouse 移动端模拟的 FCP 从 1.5 s 降到 1.2 s。
- 字号阶梯：`.display` 44→86、`.h1` 40→70、`.h2` 32→56、`.h3` 22→28、`.h4` 20、`.lead` 17→20、正文 16、`.body-sm` 14、`.kicker` 12（等宽大写，字距 0.14em）。实测值见 `design-system.html#type`。
- **强调词规则**：每个标题最多一个 `.accent`（衬线斜体，「人的那个词」）；可与 `.text-grad`（品牌渐变）或 `.text-grad-ai`（AI 语境，紫 → 靛 → 青，只用于 MCP / agent 相关标题）叠加。正文里不用。
- 标题 `text-wrap: balance`，段落 `text-wrap: pretty`。
- **等宽文本必须关闭连字**：凡是 `font-family: var(--font-mono)` 的规则都同时写 `font-variant-ligatures: none`（`code` / `kbd` / `pre` / `samp` 已在 base.css 统一处理）。Azeret Mono 的上下文替换会把 `0x8085` 渲染成 `0×8085`，标准连字会让 `fid` 看起来像 `f1d`。

## 5 · 动效系统

### 分级

| 级别 | 时长 | token | 用于 |
| --- | --- | --- | --- |
| T1 微交互 | ≤ 200ms | `--dur-1` / `--dur-2` | hover、press、focus |
| T2 过渡 | 200–400ms | `--dur-3` | 菜单、tab、手风琴、弹窗 |
| T3 入场 | 600–1100ms | `--dur-4` / `--dur-5` | 滚动显现、标题逐词、数字滚动 |
| T4 叙事循环 | 3–12s | `data-inview` | 首屏剧场、扫描光束、跑马灯、极光——离屏暂停，减弱动效下停用 |

缓动：`--ease-out`（入场 / 展开）、`--ease-in-out`（往返 / 循环）、`--ease-spring`（pin 落点、弹性反馈）。

### 声明式 API（`assets/js/motion.js`）

在 HTML 上写属性，运行时负责驱动：

| 属性 | 效果 | 减弱动效下 |
| --- | --- | --- |
| `data-reveal[=fade-up\|fade\|zoom\|blur\|left\|right\|rise\|clip]` | 进入视口显现一次 | 直接显示 |
| `data-reveal-delay="120"` | 单元素延迟（ms） | — |
| `data-reveal-onload="650"` | 首屏视觉（剧场 / 插画）：加载后按延时显现，不等滚动 | 直接显示 |
| `data-enter`（错峰写内联 `--enter-delay`） | 首屏文案入场：纯 CSS，首帧即开始，起始可见（40% 透明度 + 下移 12px），不等 JS | 直接显示 |
| `data-stagger="70"` | 容器内子元素错峰显现 | — |
| `data-split` | 标题逐词上升，`.accent` / `.text-grad` 整体为一个单元（运行时拆词，首屏以下用） | 静态 |
| `data-split="static"`（错峰写内联 `--split-delay`） | 首屏标题：HTML 里已拆好 `.w > .wi`（`--i` 为词序），CSS 首帧开始逐词升起，不等 JS；对应 Astro 构建期拆词 | 静态 |
| `data-count="36"`（+ prefix / suffix / decimals / duration） | 数字滚动一次 | 直接终值 |
| `data-spotlight` / `data-spotlight-group` | 卡片指针聚光 | 保留（仅指针设备） |
| `data-tilt="6"` | 3D 倾斜 | 关闭 |
| `data-magnetic="0.25"` | 磁吸按钮 | 关闭 |
| `data-marquee` | 无限跑马灯（自动复制 `.marquee-track`） | 静态 |
| `data-parallax="0.12"` | 滚动视差（用 `translate` 属性，不占用 `transform`） | 关闭 |
| `data-typing='["a","b"]'` | 输入框 placeholder 打字循环 | 只显示第一项 |
| `data-inview` | 离屏时暂停子树内全部 CSS 动画 | — |
| `data-scroll-progress` | 顶部阅读进度条 | — |

### 运行时（`window.MG`）

- `motion.js`：`reducedMotion()`、`finePointer()`、`ease`、`wait(ms)`、`tween(duration, onUpdate, ease)`、`inView(el, cb, {once, threshold, rootMargin})`、`formatNumber(v, decimals)`、`init(scope)`。
- `site.js`：`toast(title, desc, icon)`（icon 默认 `check` 表示成功；原型说明类提示传 `info`，图标变为主色）、`setupTabs(scope)`（分段 tab，派发 `tabchange`）、`highlight(code)`（极简代码高亮）、`renderTools(grid)`。
- **`MG.init(scope)` 可重复调用**：scope 自身也参与匹配，每个元素每种行为只绑定一次；动态渲染的节点渲染后对容器调用即可。

### 约束

- **首屏不等 JS**：首屏标题用 `data-split="static"`，其余首屏文案用 `data-enter`，两者都由 CSS 在首帧启动；`data-reveal` 与运行时 `data-split` 只用于首屏以下。首屏最大的文本块就是 LCP 候选（手机上通常是导语，桌面上是标题或等高线背景）：由 JS 从透明度 0 渐显时，实测 LCP 推迟到渐显结束（约 1.4 秒）；起始可见时 LCP 落在首帧。入场的起始透明度不能为 0——Chrome 不把首帧透明的元素记为候选，那是绕开指标而不是变快。
- **常驻循环只动 `transform` / `opacity`**：这两种属性由合成线程执行，主线程不参与。`background-position`、`@property` 自定义属性、`box-shadow`、宽度、边框颜色、`stroke-dashoffset`、`filter: blur()` 每帧都要主线程重算样式并重绘；只要视口里还有一个这样的循环，主线程就得逐帧出图。因此：
  - 装饰性的重绘效果只播有限次数后静止：渐变字 `grad-pan` 一个来回、旋转边框 `spin-angle` 两圈，停在与静态一致的状态；
  - 扫光用伪元素 `transform` 平移（`.skel`、`.media-slot` 用 `sweep`），不动 `background-position`；
  - 与状态绑定的短时动画（处理中进度条、就绪按钮的光圈、Thinking… 文字）可以用重绘属性，但只在状态存续期间运行。
- 一次性入场用 `animation-fill-mode: backwards`，结束后不残留 `transform` / `filter`（`both` 会留下单位矩阵，多出合成层与层叠上下文）。
- 极光用径向渐变而非 `blur()` 滤镜，避免逐帧重栅格化。
- 任何无限循环必须放在 `data-inview` 子树内，或由脚本用 `MG.inView` 控制启停；页面在后台时（`document.hidden`）定时器跳过。
- `clip` 显现变体初始被裁成 0 高，运行时改为观察其父元素（Chrome 的 IntersectionObserver 会计入目标自身的 `clip-path`）。
- 跨页导航用 View Transitions 淡入淡出（`@view-transition`，渐进增强）；主题切换用圆形揭示。

## 6 · 组件目录

全部在 `assets/css/components.css`，现场示例与标记见 `design-system.html#components`。

| 组件 | 类名 | 要点 |
| --- | --- | --- |
| 导航 / 页脚 / 移动菜单 / 登录弹窗 | `.site-nav`、`.site-footer`、`.mobile-menu`、`dialog.modal` | 由 `chrome.js` 注入；滚动后导航收拢为悬浮胶囊；hover 胶囊跟随；Esc 关闭 |
| 按钮 | `.btn` + `-primary / -secondary / -ghost / -invert`，`-sm / -lg / -block`；`.icon-btn`；`.link-arrow` | 每个视图一个 primary；`.btn-invert` 用于暗色岛 |
| 标签 | `.chip`（`--soft` / `--mono`）、`.badge`（`--ok / --warn / --ai / --pin / --solid / --muted`）、`.dot--live`、`.pill-announce`、`.kbd` | 状态色必须配文字 |
| 卡片 | `.card`、`.card-pad`、`.card--lift`、`.card-link`、`[data-spotlight]`、`.icon-tile`（`--brand / --ai / --pin / --ok`）、`.check-list` | 平面 + 发丝边框；聚光为指针增强 |
| 表单 | `.field`、`.field-label`、`.field-hint`、`.field-error`、`.input`（`.is-invalid`）、`.textarea`、`.searchbar` | 标签在上；错误文案说明下一步 |
| 分段 tab / 手风琴 | `[data-tabs]` + `.seg` / `.seg-btn` / `.seg-thumb`；`details.acc` | 键盘方向键切换；手风琴高度动画 |
| 数据 | `.dtable`（`.cell-strong / -num / -mono`）、`.rating`、`.skel`、`.progress`、`.spinner` | 数字等宽 |
| 代码窗 | `.codewin` + `.codewin-bar / -tabs / -copy / -label`，`pre[data-highlight]` | 恒暗 |
| 产品 mock | `.browser`、`.mgp`（插件面板）、`.map-pin`、`.float-chip`、`.media-slot` | 插画由组件搭建；缺真实素材时统一用 `.media-slot` 占位 |
| 面板状态 | `.mgp-start`（`.is-pressed`）、`.mgp-pause`（空内容隐藏）、`.mgp-kpis`、`.mgp-row.is-new`、`.ext-dot` | 首页与插件页剧场共用 |
| 地图图元 | SVG 内的 `.m-land / .m-streets / .m-park / .m-water / .m-water-edge / .m-major（.casing + .road）/ .m-labels（.m-label-sm / .m-district / .m-water-label）` | 风格化地图，颜色走 `--map-*` token；页面只按画面比例调路宽 |
| 下载提示 | `.dl-ring`（`.is-on / .is-done`）> `.dl-ring-svg` > `.dl-ring-track` + `.dl-ring-fill`；`.dl-pop`（`.is-on`）> `.dl-pop-ic` + `.dl-pop-text` + `.dl-pop-ok` | 浏览器工具栏下载环 + 下载气泡；气泡位置由页面定 |
| 打字光标 | `.is-typing`（文本元素逐字输入时加，细竖线）、`.caret`（代码窗块状光标） | 容器的输入状态不要复用 `.is-typing`，用 `.is-composing` 之类 |
| 数字 / 定价 | `.stat-value` / `.stat-label`；事实条 `section.facts` > `.facts-caption` + `.facts-grid` > `.fact` × 5；`.price-card`（`.is-featured`）+ `.price-flag / -name / -tagline / -amount / -period / -quota` | `.is-featured` 只给定价源标记为推荐的方案 |
| 反馈 | `.toast`（`MG.toast`）、`dialog.modal` | 登录为邮箱 + 6 位验证码两步 |
| 页面级区块 | `.page-hero`（`--center / --compact`；改列宽只写 `--hero-cols`）、`.crumbs`、`.feature-grid` / `.feature`、`.split` / `.split--reverse`、`.faq-layout`、`.final-cta` + `.cta-panel` + `[data-cta-pins]`、`.tools-grid[data-tools-grid]`、`.doc-layout` + `.toc[data-toc]` + `.prose` | 子页共用骨架 |
| 装饰层 | `.has-deco` > `.deco` > `.aurora` / `.bg-contours` / `.bg-grid` / `.noise` | 只放背景层，`aria-hidden` |

## 7 · 页面

每页列出区块顺序、标志性动效与数据来源。区块类名见各页 HTML 注释（`① ② …` 编号与本节一致）。

### 首页 `index.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero | 公告胶囊 → 逐词标题 → 搜索命令条（placeholder 打字循环）+ 建议词 → 信任条 → **产品剧场**：浏览器里的 Google Maps + MapsGrab 面板，循环演示「输入关键词 → pin 落点 → 扫描光束逐个命中 → 行数据入列 → KPI 计数 → 导出文件卡」；离屏暂停 |
| — | 匿名预览 | 提交搜索或点建议词：剧场切到预览态，只出 3 行，其余行锁定，面板给出登录引导（对应真实的首页匿名预览闭环） |
| ② | 事实条 | 36 列 / 11 个评论字段 / 6 个社媒 / 每月 1,000 条免费 / 3 种产品形态 + MCP；数字滚动 |
| ③ | 三步流程 | 搜索 → 采集 → 导出，三张循环小插画 + 连线箭头 |
| ④ | 产品 | 插件 / 云端 / API / MCP 四张 bento 卡，各带一段迷你产品动画 |
| ⑤ | 字段浏览器 | 36 列按组筛选，选中列显示说明与样例值；Plus Code 标为保留列 |
| ⑥ | 补全轨道 | 中心商户卡 + 7 个渠道节点逐个点亮，结果列表逐行写入 |
| ⑦ | 开发者（暗色岛） | 代码台：Search / Reviews / Photos × cURL / Python / Node 切换，JSON 响应逐行流出；MCP 卡 |
| ⑧ | 用例 | 三张用法描述卡（线索名单、竞品对标、位置数据集），各带一段数据插画 |
| ⑨ | 定价预告 | 三条产品线各一张卡：免费额度 + 入门付费档，链接到 `pricing.html#<产品>`；价格逐字取自定价源 |
| ⑩ | 免费工具 | `[data-tools-grid]` 由 `MGChrome.tools` 渲染 |
| ⑪ | FAQ | 双栏：左侧标题与联系入口，右侧手风琴 |
| ⑫ | 收尾 CTA | 等高线面板 + 循环落点 pin |

样例数据：`assets/js/pages/home.js` 的 `DATASETS`（3 组关键词 × 14 家虚构商户）；字段样例与 `extension/src/sites/maps/content/export/columns.ts` 的列顺序一致，示例 ID 与其 FID 按 `placeUrl.ts` 算法自洽。

### 定价 `pricing.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero | 三产品切换胶囊（选中项带旋转渐变描边），与 URL hash `#online` / `#extension` / `#api` 双向同步；默认 Online（与 `pricing-page-controller.ts` 的 `DEFAULT_PRICING_LINE` 一致） |
| ② | 方案 | 「每月需要多少」对数滑杆实时标出满足需求的方案（Fits）；方案卡在切换产品时数字滚动；featured 只给定价源标记的方案 |
| ③ | 对比表 | 每个产品一张，行从卡片卖点归纳；featured 列着色；移动端首列固定、横向滑动 |
| ④ | 额度单位 | records 卡（商户行入列计数）、requests 卡（请求日志，401 不计数）、每月 1 日重置曲线（未用额度不结转） |
| ⑤ | 计费 | 支付渠道 / 一次性或订阅 / 补差价升级 / 各产品线独立 |
| ⑥ | FAQ | 逐字取自 `pricing.ts` |
| ⑦ | 收尾 CTA | 免费额度说明 |

数据：`assets/js/pages/pricing.js` 的 `PRICING` 逐字取自 `website/src/i18n/pricing.ts`。没有月付 / 年付切换——定价源与 011 域文档都没有年付。

### 免费工具模板 `place-id-finder.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero + 工具面板 | 工具图标与面包屑合成胶囊；**工具真实可用**：打开后自动键入示例并解析——URL 中两段 hex 高亮 → FID 逐字打出 → CID 数字滚动 → Place ID 字符解码；三项各带复制；示例按钮含一个短链报错态 |
| ② | 三步用法 | 三张循环小插画 |
| ③ | ID 讲解 | 推导图：FID → 20 字节 protobuf → base64url → Place ID，后半段 → 十进制 → CID；随最近一次解析结果重播 |
| ④ | 相关工具 | 工具网格（排除当前工具） |
| ⑤ | FAQ | 逐字取自 `website/src/i18n/tools.ts` |
| ⑥ | 收尾 CTA | — |

- 解析逻辑逐行移植 `website/src/scripts/tools/lib/placeUrl.ts`（CID 用 BigInt），只产出 Place ID / CID / FID，与真实工具一致。
- `?tool=<id>` 切换为其他 6 个工具的外壳：替换 Hero、CTA 的文案（逐字来自 `tools.ts`）、图标与面包屑，工具面板换成 `.media-slot` 占位，隐藏 Place ID 专属区块；未知 id 回落为 Place ID Finder。

### 设计系统 `design-system.html`

Hero 是 token → 组件 → 页面三层平面的 3D 叠层；正文为左侧目录 + 分节示例：原则、色彩（亮 / 暗实测值）、字体、间距 / 圆角 / 投影、图标（sprite 全量，可筛选、点击复制用法）、组件、动效（缓动曲线、显现变体、行为）、背景、规则（do / don't）、页面索引。每个示例都是真实组件，可展开查看并复制原始标记。

### 法务 `privacy.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero | 面包屑 + Privacy / Terms 切换（同步 `?doc=terms`、页面 title、meta description、面包屑，H1 逐词重新入场）；真实的 Last updated、阅读时长、小节数；右侧两页文档叠放插画，切换时互换前后 |
| ② | 正文 | 左侧吸顶目录（滚动高亮；960 以下变为吸顶横向胶囊条，当前项自动居中）+ 支持邮箱卡；右侧「At a glance」4 张要点卡（只摘正文明确写到的内容）+ 9 节正文 + TBD 提示 + 下一篇 |
| — | 小节锚点 | 点 `#` 复制带锚点的地址；打开 `privacy.html#<Terms 小节>` 时直接显示 Terms |

正文逐字取自 `website/src/i18n/legalContent.ts`，两份文档同在 DOM 中切换。法务页以可读性为先：装饰层更淡，动效只保留标题入场、插画洗牌与要点卡显现。

### 公司 `about.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero | 定位文案 + **经纬网地球**：城市落 pin、光束飞向顶部 MapsGrab 标志；可拖拽旋转；离屏 / 标签页隐藏时停止绘制，减弱动效下只画静帧 |
| ② | What we build | 一个引擎卡 → 4 个产品卡（插件 / 云端 / API / MCP），SVG 连线 + 流动光点；免费工具胶囊复用 `MGChrome.tools` |
| ③ | Principles | 5 条产品规则卡 + 一张「书面承诺」卡（链接隐私政策），各带小动画 |
| ④ | 数据流向（暗色岛） | Maps 页面 → 浏览器本地 → 后端 4 类用途，另有可选的 Drive / HubSpot；连线方向区分下发 / 上报 / 双向；「Never」清单与 GA4 说明；1080 以下改为纵向箭头 |
| ⑤ | Status | 早期访问 / 免费月额度 / 付费计划 |
| ⑥ | `#contact` | 支持邮箱（可复制 + mailto）、回复时效、「What to include」清单；表单 name / email / topic / message，本地校验、加载态、成功态，选 privacy 主题时出提示；从 `#contact` 进入时表单闪一下高亮 |
| ⑦ | 收尾 CTA | 与首页同结构 |

数据：`companyContent.ts`、`contact.ts`、`en-US.ts`。地球上的城市只用真实经纬度定位，不代表用户分布；页面没有数字指标、团队信息或证言。

### 插件 `extension.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero + 浏览器剧场 | 版本胶囊（v0.1.0 预发布）；剧场：Maps 结果列表自动滚动，卡片被捕获的同时面板逐行入列、地图落 pin，跑完显示 Extract complete，导出后浏览器栏出现下载环与文件名气泡（文件名与 `export/csv.ts` 同格式）；三组数据循环 |
| ② | 事实条 | 36 列 / 11 个评论字段 / 6 个社媒 / 每月 1,000 条免费 / 每个批量任务 500 个关键词或评论 URL |
| ③ | 三种视图 | 搜索结果、商家页 Reviews & Photos、保存列表逐项打开，各带微型动画 |
| ④ | 能力展台 | 6 个 tab 自动轮播（悬停 / 聚焦暂停，方向键可切） |
| ⑤ | 批量任务（暗色岛） | 任务名与关键词逐字输入 → 逐项状态（含 90 秒卡住被跳过）→ 完成后提示已自动导出 |
| ⑥ | 本地优先 | 数据流示意：Maps 标签页 → 面板 → 本地存储 → 导出；后端只负责远程配置、账号与额度状态、补全和少量使用日志 |
| ⑦ | `#install` 安装 | Edge / Firefox 商店审核中 + release zip 分步说明（截图位为 `.media-slot`）+ 0.1.0 发布说明 |
| ⑧ | 方案 / FAQ / CTA | 三档方案（价格逐字）、7 条 FAQ |

### 云端 `online-scraper.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero + Dashboard 剧场 | 输入关键词 → Submitting → 历史列表出现 Processing 任务，各关键词并行完成并显示行数和 CSV → Completed → 本月用量此时才增加 → Download ZIP 下载气泡 |
| ② | 事实条 | 36 列 / 6 个社媒列 / 地图模式 50 个搜索位置 / 每任务 60 分钟 / 每月 1,000 条免费 |
| ③ | 五步流程 | 首页预览 → 登录 → 创建任务 → 并行执行 → 下载，依次高亮 |
| ④ | 三种创建模式（可交互） | 关键词（去空行去重计数 + 各档上限）；地图（半径 / 间距滑杆，取点算法同 `map-grid.ts`，由近及远出点，超过 50 个位置时显示真实报错并禁用提交）；地区（添加城市 → In / Near → 生成查询，附 GeoNames 署名） |
| ⑤ | 结果文件 | ZIP 目录树 + CSV 表格：第 1 行固定字段名、第 2 行字段译名（可在 8 种语言间切换演示）、第 3 行起数据；零结果文件保留两行表头 |
| ⑥ | 能力 | 6 项（en-US 原文） |
| ⑦ | 计量（暗色岛） | 用 Free 档演示：提交不扣额度、完成后按实际交付行数计入、运行中任务可超额、用完后禁止提交 |
| ⑧ | 方案 / FAQ / CTA | 五档方案（价格逐字，规格按 014：每任务关键词数 + 补全）、7 条 FAQ |

数据：`pricing.ts`、`en-US.ts`、`i18n/dashboard.ts`、014 域文档；CSV 列顺序取自 `backend/src/app/provider/maps_online.py` 的 `CSV_HEADERS`，译名取自 `backend/src/app/i18n/locales/`。所有通往 Dashboard 的入口用 `data-proto-note` 或 `data-signin`。

### API `google-maps-scraper-api.html`

`?api=search | reviews | photos` 三个变体（对应三条真实路由）由脚本切换文案、代码台、参考表、FAQ 与 CTA。

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero + 代码台 | 端点切换胶囊；cURL / Python / Node 切换，请求逐字打出、响应逐行流入，可重放、可复制 |
| ② | Endpoints | 三张端点卡（当前页标 You're here）+ MCP 横幅 |
| ③ | Capabilities | 6 项能力 |
| ④ | fid 串联（暗色岛，主动效） | Search → Reviews → Photos 循环：fid 沿连线飞到下一步请求里，再依次出评论与照片 |
| ⑤ | Reference | 参数表（Search 的 `pages` 是抓取页数）；响应字段分组切换（Search 为 Identity / Contact / Location / Ratings / Profile 五组，取自 Provider DTO）；4 条要点：按成功请求计费、位置是偏置不是围栏、评论游标分页、如何指定商家 |
| ⑥ | 方案 / FAQ / CTA | API 五档（价格逐字） |

### MCP `google-maps-scraper-mcp.html`

| # | 区块 | 内容与动效 |
| --- | --- | --- |
| ① | Hero + Agent 会话（主动效） | 轮换 4 个客户端、4 个场景：打字 → 思考 → tool call 卡片从运行到完成 → 结果行 → 答案表或缩略图；agent 拿到结果后自行筛选，不虚构过滤参数 |
| ② | Tools | `search_businesses` / `get_reviews` / `get_photos` 三张工具卡（名称为示意，参数沿用 API） |
| ③ | 连接拓扑（暗色岛） | 客户端 → MapsGrab MCP → 工具，请求 / 响应数据包沿曲线飞行；移动端改为竖向流动 |
| ④ | Setup | Claude Code / Cursor / VS Code / Codex 四个 tab，三步指引 + 配置代码窗；「Any other MCP client」规格条 |
| ⑤ | Example prompts | 双行反向滚动的提示词墙（减弱动效时为静态网格） |
| ⑥ | Security | 请求检查器：扫描线、鉴权头高亮、JSON-RPC 请求与响应 + 4 张要点卡 |
| ⑦ | 方案 / FAQ / CTA | 与 API 共用五档（额度条按对数刻度）；FAQ「每次返回数据的 tool call 计一次 API 请求」是合理假设（依据 B3：MCP 包装 B2 三个端点并复用 API 密钥），页头注释已标注 |


## 8 · 文件结构与加载顺序

```text
docs/design/website/
├── *.html                      # 页面（§0 清单）
├── assets/
│   ├── css/
│   │   ├── tokens.css          # 唯一 token 来源
│   │   ├── base.css            # 字体、重置、排版、布局原语、装饰层
│   │   ├── motion.css          # 关键帧、显现、离屏暂停、减弱动效
│   │   ├── components.css      # 全站组件 + 页面级区块
│   │   └── pages/<page>.css    # 页面私有样式
│   ├── js/
│   │   ├── theme-boot.js       # <head> 同步执行：html.js 标记 + 恢复主题（防闪）
│   │   ├── chrome.js           # 注入导航 / 页脚 / 登录弹窗 / toast 容器；window.MGChrome
│   │   ├── motion.js           # 声明式动效运行时；window.MG
│   │   ├── site.js             # 站级交互（主题、导航、tab、手风琴、弹窗、复制、高亮、工具网格、CTA pin、目录）
│   │   └── pages/<page>.js     # 页面私有动画与交互
│   ├── img/                    # icons.svg（sprite）、contours.svg（等高线遮罩）、favicon.svg
│   └── fonts/                  # 自托管 woff2
├── design-system.html
└── README.md
```

- CSS 顺序：`tokens → base → motion → components → pages/<page>`。
- JS 顺序：`theme-boot.js`（同步，head 内）→ `chrome.js` → `motion.js` → `site.js` → `pages/<page>.js`（均 `defer`）。设计系统页把页面脚本提前到 `motion.js` 之前，以便在运行时改写 DOM 前抓取示例标记。
- 图标：`<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#i-search" /></svg>`；尺寸 `.icon` 20 / `.icon--sm` 16 / `.icon--lg` 24；`.icon--fill` 用于实心图形。

## 9 · 落地到 Astro

| 原型 | Astro 落地 |
| --- | --- |
| `chrome.js` 注入的导航 / 页脚 / 弹窗 | `Layout.astro` 内的服务端组件；导航当前态由路由决定，不再读 `data-page` |
| 页面 HTML 区块 | `src/components/pages/*Page.astro` 与可复用区块组件 |
| 英文硬编码文案 | 全部走 i18n（`src/i18n/lang/*.ts`）；价格与方案只读 `src/i18n/pricing.ts` |
| `tokens.css` / `base.css` / `motion.css` / `components.css` | 全局样式（受 §2 裁决约束） |
| `motion.js` / `site.js` | 保持零依赖、声明式 `data-*` API，作为站点脚本打包；页面脚本按页拆分 |
| 首屏 `data-split="static"` / `data-enter` | 标题在构建期拆词（组件输出 `.w > .wi` 与 `--i`），错峰延迟写成内联变量；不依赖运行时脚本 |
| `theme-boot.js` | `<head>` 内联脚本，首帧前执行 |
| 代码高亮 `MG.highlight` | 改用构建期高亮（Astro 内置的 `<Code />`，基于 Shiki），无需新增依赖 |
| 首页剧场数据 | 接真实的首页匿名预览接口（单关键词、前 3 行 + 锁定行 + 登录引导）；原型数据为虚构 |
| 图标 sprite / 字体 | 放入 `public/`，路径改为站点根相对路径；首屏字体在 `Layout.astro` 里 `preload`（规则见 §4） |

另需注意：

- 运行依赖较新的 CSS：`light-dark()`、`@property`、`@starting-style`、容器查询单位、`zoom`；View Transitions 为渐进增强。落地时按站点支持的浏览器范围决定是否需要回退方案。
- 可访问性：所有可交互元素有 `:focus-visible` 焦点环；图标按钮带 `aria-label`；分段 tab 实现了 `role="tab"` 与方向键；装饰层 `aria-hidden`。
- SEO：每页已给出 title / description 初稿；结构化数据与多语言 hreflang 按 `spec-google-seo.md` 落地。

## 10 · 诚实与数据约定

- **不虚报**：没有用户量、客户 logo、评价或引言式证言（匿名引言同样视为证言，不做）。用例区写成用法描述；事实条只写产品事实（36 列、11 个评论字段、6 个社媒、免费额度、产品形态）。
- **事实来源**：价格、额度、方案名逐字来自 `website/src/i18n/pricing.ts`；功能描述以 `website/src/i18n/lang/en-US.ts` 与 `docs/feat/` 对应域文档为准；导出列以 `extension/src/sites/maps/content/export/columns.ts` 为准。
- **虚构样例**：商户名虚构；电话一律 `555-01xx` 号段。主样例 Ember & Oak Coffee 的 FID / CID / Place ID 按 `placeUrl.ts` 算法互相自洽（FID `0x54950a2291f60bf1:0xbeb4a5f2c3d1e0ab` → CID `13741790825100206251` → Place ID `ChIJ8Qv2kSIKlVQRq-DRw_KltL4`）；剧场里其余商户的 Place ID 由名称哈希生成，仅作展示。
- **示意接口**：端点路径与 MCP 地址（`api.mapsgrab.com/v1/*`、`mcp.mapsgrab.com/mcp`）是示意写法，**参数按 014 已确认合同**：同步 REST，POST + JSON body；Search 接受 `q` / `pages` / `hl`（可选 `ll`），其中 `pages` 是抓取页数 1–10（对应 Provider 的 `max_depth`，每页最多 20 条、一次返回），不是页码，Email 与社媒补全直接包含在响应里；Reviews 以 `fid` 为键、`sort_by` 排序（1 相关 / 2 最新 / 3 最高 / 4 最低）、`cursor` 翻页，响应带 `next_cursor`；无 webhook。响应字段名取自 `tech-引擎Provider层.md` 的 DTO，首页代码台与 API 页使用同一份示例。MCP 工具名（`search_businesses` / `get_reviews` / `get_photos`）同为示意。
- **事实差距**（原型按现网文案写，以下需要决策）：
  - **Photos API 尚未实现**：`docs/feat/014.Maps云端/feat.md` 写明「Photos 待实现，不提供占位接口」，但现网路由 `/google-maps-photos-api`、定价卖点「Reviews and photo endpoints」与 MCP 文案都在宣传。原型保留了 Photos 页与示例，是否改为「即将上线」或下线需要产品决定。
  - **插件定价文案自相矛盾**：`pricing.ts` 插件说明写「the ceiling is the only thing that changes」，但 Pro 卖点又列了跨次去重与 Drive / HubSpot 投递（Free 没有）。原型在插件页与定价页统一改写为「Pro and Business add cross-run deduplication and Google Drive & HubSpot delivery」，`pricing.ts` 需同步。
  - 插件设置页支持 XLSX 导出（`extension/src/options/App.vue`），但站点文案只写 CSV / JSON；原型按文案。
  - 导出中的 Plus Code 列位已锁但当前恒为空；字段浏览器如实标注为保留列。
  - `contact.ts` 的 `support@mapsgrab.com` 仍是占位邮箱；真实 `/contact` 只有 mailto，原型里的联系表单是设计提案，要么接后端，要么去掉。
  - 法务正文只覆盖插件、网站与免费工具，没有覆盖 Online Scraper / API / MCP；原型在隐私页标了 TBD，需法务补稿。
  - **现网 API 文案与合同不符**（`en-US.ts`）：740 / 924 / 1006 行写 API 额度是「quota of records」，实际按 requests 计量；822 / 914 行说 Reviews / Photos 用 Place ID 或 Maps URL 定位商家，合同用 `fid`；272 / 795 / 827 行宣传评论 likes 与 review URL，Provider DTO 没有这两个字段。原型 API 页按合同与 DTO 写。
  - **Online 方案卖点**：`pricing.ts` 的 Online 卖点（评论与照片 URL、评论 URL 任务、JSON 下载、跨次去重）是 2026-08-31「三产品线占位先行」时写的，不在 014 的 Online 范围内（014 只有关键词 / 地图 / 地区任务、单关键词 CSV + 整任务 ZIP、付费档补全、每任务关键词上限 2 / 5 / 10 / 20 / 50）。原型定价页与云端页都按 014 写，价格、额度、方案名仍逐字；`pricing.ts` 需要同步修订。
  - Online CSV 第二行的字段译名随创建任务时的界面语言变化，后端已支持 14 种语言，但站点目前只有 en-US，云端页的语言切换演示要等 010 i18n 上线才真正可用。
  - 公司页「one engine, four ways in」与「MCP 把同一引擎带给 AI agent」是根据首页和 MCP 文案推导的措辞，现有 About 原文只提到插件与网页工具。
- 建议在页脚补充「MapsGrab 与 Google 无关联」声明（需法务确认措辞）。

## 11 · 已知限制与后续

- 原型只有英文；语言按钮只给出原型提示。
- 真实录屏 / 截图尚未产出，相关位置用 `.media-slot` 占位。
- Dashboard、独立的 `/extension-login` 页、支付回调页未覆盖。
- 浏览器商店徽章与 Edge / Firefox / Google Drive / HubSpot 品牌标未手绘（会不准确），暂用通用图标；落地时从各家官方品牌包取。
- 地图均为风格化 SVG，不是 OSM 瓦片（真实云端产品用 OSM 瓦片并显示署名）。
- 云端页三种创建模式、MCP 页 Setup 区切换 tab 时面板高度不同，整块会有轻微跳动。
- Search 的 `pages`（抓取页数）是按 Provider `max_depth` 推导的对外命名，公开 API 合同落地时需确认。
- **性能基线**（Lighthouse 13 移动端模拟，干净浏览器配置，首页 / 云端页）：本地 `http.server` 下 87–89 分；同一套文件开启 gzip 与长缓存后 99 分，FCP 1.5 s、LCP 2.1 s、TBT ≈ 0、CLS 0。差距全部来自托管方式（无压缩、无缓存头、CSS / JS 未合并与压缩），落地到 Astro 构建 + CDN 后自然消失。在装有扩展的日常浏览器里跑，扩展注入的脚本会被计入「未使用的 JavaScript」和主线程时间，请用无痕窗口或独立配置。
- **首屏以下仍有 17 个装饰性常驻循环使用重绘属性**，不符合 §5：关于页 `wire-pulse` / `pvl-save` / `pvf-light` / `pva-track`，首页 `hs-type` / `hx-fill` / `ev-pin` / `q-fill` / `ul-check`，插件页 `xp-wire` / `.xl-flow`（`dash-flow`），云端页 `of-travel`，API 页 `chain-track`，MCP 页 `mcp-auth` / `mcp-dash-y`，工具页 `pv-select`，定价页 `reset-reveal`。它们都在 `data-inview` 内、离屏暂停，但进入视口时主线程要逐帧工作；落地时改为 `transform` / `opacity` 实现，或限次。
- §2 的合同裁决未做之前，不应把本稿样式直接搬进 `website/src`。
