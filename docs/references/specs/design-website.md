---
version: 1.0
name: Atlas
description: MapsGrab website 的 UI 合同（营销页、Dashboard 与站内登录 / 支付回调页）。插件与 Admin 仍按 design.md / design.dark.md（Material You）。
source: 定稿设计稿 docs/design/website/（2026-10-14）；取值以其 assets/css/tokens.css 为准，落地后以 website 全局 token 文件为准。
---

# Atlas · website UI 合同

## 0 · 总览

- **适用范围**：`website/` 全站。分两层：**基础层**全站通用；**营销表达层**只用于营销页（首页、产品页、Pricing、工具页、公司页），Dashboard、登录、支付回调与法务正文只用基础层。
- **与 Material You 的关系**：品牌蓝 `#1a73e8`、无衬线 Plus Jakarta Sans、等宽 Azeret Mono 与 `design.md` 一致；其余取值、刻度与组件规则以本文为准，不再引用 `design.md`。
- **取值来源**：token 取值写在 token 文件里，本文不复述，只规定分层、刻度与用法。设计稿阶段的 token 文件是 `docs/design/website/assets/css/tokens.css`，落地后迁为 website 全局 token 文件；色板实测值见设计稿的 `design-system.html`。
- **实现参考**：组件目录、动效声明式 API 和页面骨架见设计稿 [README](../../design/website/README.md) §5–§7，作为落地时的实现参考。
- **执行门**：`scripts/ui_token_lint.py` 的 `atlas` 合同，样式改动后运行；website 为 enforced，违规即失败。

## 1 · 颜色

- **三层 token**：品牌原色（`--blue-500` 等，只在 token 文件和插画内用）→ 语义色（`--bg`、`--surface`、`--text`、`--primary`……）→ 营销表达层（§2）。页面与组件只消费语义色和表达层。
- **双主题**：每个语义色用 `light-dark(亮, 暗)` 一次写完两套值。默认跟随系统，`<html data-theme>` 手动覆盖；`.scheme-dark` / `.scheme-light` 把一个区块固定为暗 / 亮（主题岛），岛内 token 自动翻转。
- **行动色只有 `--primary`**。`--primary` 是填充色（品牌蓝，两主题同值）；作文字（链接、kicker、徽章）用 `--primary-text`，它在 `--surface`、`--surface-2`、`--bg-2` 与 `--primary-soft` 上 ≥ 4.5:1。叙事色 `--pin`、`--accent`、`--star`、`--ai`、`--cyan` 只用于插画与数据语义，不做按钮或链接色。叙事色作文字时，`--accent` 直接使用；`--pin`（珊瑚插画色）与 `--cyan` 改用 `--pin-text`、`--cyan-text`，作底用对应 `-soft`。这三个文字色在 `--surface`、`--surface-2`、`--bg-2` 与对应 `-soft` 上 ≥ 4.5:1，可见图示（如 Place ID 推导图）里的文字同样适用。
- **状态色**：`--ok` / `--warn` / `--bad` 各带 `-soft` 与 `-fg`；作实底时文字用对应 `-fg`。取值保证状态色作文字时在 `--surface`、`--surface-2` 与对应 `-soft` 上 ≥ 4.5:1，可直接用于结论、报错与徽章文字。状态不能只靠颜色，要配圆点、图标或文字。
- **代码窗恒暗**：`--code-*` / `--syn-*` 不随主题翻转。
- **字面量只出现在 token 定义里**。与主题无关的常量也要收成 token，包括：光影常量（白色高光、黑色投影与遮罩、mask 用的 `#000`）、在两种主题下都是白色的元素（pin 中心点、开关滑块、品牌底上的白字）、恒暗终端配色、窗口三色点。
- 对比度：正文与按钮文字 ≥ 4.5:1。`--text-3` 在 `--surface` 与 `--surface-2` 上 ≥ 4.5:1，用于辅助信息与标签，字号 ≥ 10.5px（`aria-hidden` 演示图内的装饰小字不受此限）。

## 2 · 营销表达层

token：`--grad-*`、`--glow-*`、`--aurora-*`、`--contour`、`--grid-line`。只在营销页使用，且只用于下列位置：

| 效果                      | 允许位置                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| 品牌渐变 `--grad-brand*`  | 标题强调词与大数字（`.text-grad`）、实心徽章、图标块 hover、进度条       |
| AI 渐变 `--grad-ai*`      | 只用于 MCP / agent 相关标题与元素                                        |
| 辉光 `--glow-*`           | 主按钮、推荐定价卡、首屏视觉、估算条与图表标记                           |
| 极光、等高线、网格、噪点  | 区块背景装饰层（`.deco`），`aria-hidden`，不承载内容                     |
| 玻璃（`backdrop-filter`） | 滚动后的悬浮导航胶囊、弹窗遮罩、工具页眉标与工具面板、Pricing 产品切换条 |

渐变可以作为结构写法（遮罩、网格线、进度填充）直接写在样式里，其中的颜色仍必须是 token。

## 3 · 字体、间距、圆角、投影

**字体**

- 字号阶梯走 token：`--fs-display` 44→86、`--fs-h1` 40→70、`--fs-h2` 32→56、`--fs-h3` 22→28、`--fs-h4` 20、`--fs-lead` 17→20、`--fs-body` 16、`--fs-sm` 14、`--fs-xs` 12.5、`--fs-kicker` 12。大于 16px 的字号必须用 token 或 `clamp()`；10–16px 之间允许 0.5 步裸值，供密集 UI 与产品 mock 使用。
- 字重 400 / 500 / 600 / 650 / 700，display 用 700。
- Instrument Serif 斜体只用于标题强调词 `.accent`，每个标题最多一处，正文不用。
- 等宽文本一律关闭连字（`font-variant-ligatures: none`），数字开 `tabular-nums`。
- 标题 `text-wrap: balance`，段落 `text-wrap: pretty`。中文回退字体固定为 PingFang SC / Microsoft YaHei。
- 原生 `h1`–`h5` 默认使用 `--lh-heading`；`.display`、`.h1`–`.h4` 使用各自的排版规则。共享定义见 [base.css](../../../website/src/styles/base.css)。

**间距与布局**

- 4px 基准：token `--s-1`…`--s-32`（4–128px）。裸值在 24px 以内可取 2px 半步，24px 以上只能取 32 / 40 / 48 / 64 / 80 / 96 / 128。
- 容器：`--container` 1200、`--container-wide` 1360、`--container-narrow` 820；两侧 `--gutter` 16→32；区块上下 `--section-y`。

**圆角**：`--r-2xs` 2 / `--r-xs` 6 / `--r-sm` 10 / `--r-md` 16 / `--r-lg` 24 / `--r-xl` 32 / `--r-full`，必须走 token。`--r-2xs` 只用于 ≤ 8px 的小标记（如 kicker 菱形）；卡片用 `lg`，大面板用 `xl`，按钮与 chip 用 `full`。

**投影**：`--shadow-xs` / `-sm` / `-md` / `-lg`、`--hairline-hl` 与表达层 `--glow-*`，必须走 token。暗色下层级主要靠面亮度（`--bg` → `--surface` → `--surface-2` → `--surface-3`）表达。

## 4 · 动效

| 级别         | 时长 token                          | 用于                         |
| ------------ | ----------------------------------- | ---------------------------- |
| T1 微交互    | `--dur-1` / `--dur-2`（≤ 200ms）    | hover、press、focus          |
| T2 过渡      | `--dur-3`（360ms）                  | 菜单、tab、手风琴、弹窗      |
| T3 入场      | `--dur-4` / `--dur-5`（720–1100ms） | 滚动显现、标题逐词、数字滚动 |
| T4 叙事循环  | 3–12s                               | 首屏剧场、扫描光束           |
| 环境装饰循环 | 20–90s                              | 极光、等高线、跑马灯         |

缓动只用 `--ease-out` / `--ease-in-out` / `--ease-spring`；匀速连续动画（旋转、跑马灯、扫光）可用 `linear`。T3、T4 与环境装饰循环只用于营销页，Dashboard 只用 T1、T2。环境装饰循环同样遵守下列约束：离屏暂停、只动 `transform` / `opacity`、减弱动效下停用。

- 无限循环必须在 `data-inview` 子树内或由脚本控制启停，离屏与页面后台时暂停。CSS 离屏暂停只在 `.js` 下启用，无 JS 时不阻止一次性入场动画完成。
- 常驻循环只动 `transform` / `opacity`。会触发重绘的装饰效果只播有限次数后静止；与状态绑定的短时动画只在状态存续期间运行。
- 每个效果都要有减弱动效下的终态：循环停止，显现类直接呈现终态，视差、倾斜、磁吸关闭。
- 首屏不等 JS：首屏文案入场由 CSS 首帧启动，起始透明度不能为 0。

## 5 · 组件差异

组件目录见设计稿 README §6。与 Material You 的不同点：

- Tabs 用分段胶囊加滑块（`.seg`），不用下划线式。
- Toast 在右下角堆叠，避免遮挡悬浮导航。
- 每个视图只有一个 primary 按钮；暗色岛里的主操作用 `.btn-invert`。
- `.btn-primary` 默认使用基础层外观；辉光、高光与扫光由 [components.css](../../../website/src/styles/components.css) 的营销作用域选择器统一启用。新增营销容器时在共享规则接入，基础页不各自添加抑制规则。
- 选择框复用 `select.input` 的自定义箭头、文字省略与焦点样式；checkbox / radio 的 `accent-color` 由共享基础样式统一使用 `--primary`。
- `.soon-badge` 与文字的间距由父级 `gap` 提供，徽章共享样式不附带固定左边距，保证独立或折行时左对齐。
- 键盘焦点：所有可交互元素 `:focus-visible` 显示 `--ring`，不得移除 outline 而无替代。

## 6 · 新增与修改 token

- 新 token 写进 token 文件，用 `light-dark()` 同时给出两套主题值，并按 §1 的三层归类。
- 新增表达层用法要先补进 §2 的允许位置表。
- 刻度变化（§3）同步改 `scripts/ui_token_lint.py` 的 `atlas` 合同。
