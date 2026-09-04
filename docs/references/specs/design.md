---
version: 1.0
name: Material You
theme: light
description: GMap Extractor 全项目 UI token 合同之亮色主题；暗色主题同名 token 见 design.dark.md，交互与组件规则以本文件为唯一来源。
source: 风格选型探索稿 scratch/design-explore/gmap-ui-styles.html（不入 git），方案 06 / 06D；token 合同以本文件为准。
colors:
  bg: "#ffffff"
  bg-image: "linear-gradient(180deg,#e9f1fd 0%,rgba(233,241,253,.55) 300px,rgba(233,241,253,0) 560px)"
  surface: "#ffffff"
  surface-2: "#f0f4f9"
  border: "#dde3ea"
  border-strong: "#b9c2cd"
  text: "#1f1f1f"
  text-2: "#5f6368"
  text-3: "#80868b"
  primary: "#1a73e8"
  primary-hover: "#1765cc"
  primary-fg: "#ffffff"
  primary-soft: "#e8f0fe"
  accent: "#188038"
  accent-fg: "#ffffff"
  accent-soft: "#e6f4ea"
  ok: "#188038"
  ok-fg: "#ffffff"
  ok-soft: "#e6f4ea"
  warn: "#b26a00"
  warn-fg: "#ffffff"
  warn-soft: "#fef7e0"
  bad: "#d93025"
  bad-fg: "#ffffff"
  bad-soft: "#fce8e6"
  link: "#1a73e8"
  ring: "#1a73e8"
  overlay: "rgba(32,33,36,0.50)"
  head-bg: "rgba(255,255,255,0.90)"
typography:
  font-display: "Plus Jakarta Sans, PingFang SC, Microsoft YaHei, sans-serif"
  font-body: "Plus Jakarta Sans, PingFang SC, Microsoft YaHei, sans-serif"
  font-mono: "Azeret Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
  display-hero:
    fontSize: "clamp(36px, 4.8vw, 58px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  heading-32:
    fontSize: 32px
    fontWeight: 600
    lineHeight: 40px
    letterSpacing: "-0.02em"
  heading-24:
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: "-0.015em"
  heading-20:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 28px
  heading-16:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 24px
  body-16:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-14:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  label-13:
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
  mono-kicker:
    fontFamily: "{typography.font-mono}"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: "0.08em~0.14em"
    textTransform: uppercase
  button:
    fontSize: "14px(默认)/15px(large)"
    fontWeight: 500
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 40, 64, 96]
  container: "max-width 1120px，左右留白 28px"
  breakpoints: "单列阈值 960px"
rounded:
  sm: 10px
  md: 16px
  lg: 24px
  full: 999px
  button: "{rounded.full}"
elevation:
  shadow-card: "0 1px 2px rgba(60,64,67,.10), 0 3px 8px rgba(60,64,67,.06)"
  shadow-pop: "0 4px 10px rgba(60,64,67,.14), 0 14px 36px rgba(60,64,67,.14)"
  shadow-modal: "0 24px 60px rgba(60,64,67,.28)"
---

# Material You · 亮色主题

## 0 · 总览

Material You 是 GMap Extractor 四端（website / extension / admin / 营销物料）统一的 UI token 合同。核心语言：**Google Material 3 近亲——白底、顶部蓝调渐变带、Google 蓝主色、胶囊（pill）按钮与 chip 生态**。选它的理由：用户在 Google Maps 环境中使用产品，Material 语言带来最高信任度与零违和感，且组件规范成熟、四端落地最快。

- 本文 = 亮色主题全量合同；暗色主题同名 token 换值，见 `design.dark.md`；交互与组件规则只在本文维护，暗色文件只写差异。
- **实现层只允许消费语义 token（CSS 自定义属性），禁止硬编码色值、圆角、投影。** 变量名 = 本文 YAML 键；Admin token 集中定义在 `admin/src/styles/global.css`；插件两端（extension / extension-bing）运行在宿主页面或多入口环境，统一加 `gme-` 中缀（`--gme-surface`）防宿主 CSS 变量渗透，取值集中定义在 `extension*/src/styles/tokens.css`（页面入口引入）与 `sites/*/content/panel/panel.css`（Shadow DOM 自含）。Canvas 等不能直接消费 CSS 变量的运行时样式从对应 token owner 读取当前计算值。
- 执行门：`scripts/ui_token_lint.py`，样式改动后运行；website / admin / extension / extension-bing 均为 enforced，违规即失败；Admin Dashboard 的 Canvas 运行时样式 owner 同步纳入扫描。
- token 全集的参考实现（全组件换肤验证）在探索稿 `scratch/design-explore/gmap-ui-styles.html`（不入 git）；该文件与本合同冲突时，以本文件为准并回改探索稿。

## 1 · 颜色

语义层级（状态色与主/强调色均配 `-soft` 柔和底与 `-fg` 实底文字色）：

| 层级 | token | 用途 |
| --- | --- | --- |
| 页面 | `bg`、`bg-image` | 页面底色；`bg-image` 是顶部蓝调渐变带，**全站唯一允许的渐变** |
| 卡面 | `surface`、`surface-2` | 卡片/浮层实底白面；`surface-2` 为行 hover、表头带、弹窗底条、禁用底 |
| 边框 | `border`、`border-strong` | 常规分隔线；`border-strong` 用于输入框、强分隔 |
| 文字 | `text` / `text-2` / `text-3` | 正文 / 次级说明 / 辅助元信息（时间、ID、占位符） |
| 主色 | `primary` + `hover` + `fg` + `soft` | 唯一品牌行动色（Google 蓝）；`soft` 用于图标底、激活 tab 底、计数徽章 |
| 强调 | `accent` + `fg` + `soft` | 次级信息色（Google 绿，成功/筛选 chip），不与主色混用于同一控件 |
| 状态 | `ok` / `warn` / `bad`（各带 `-soft` 与 `-fg`） | 成功 / 警告 / 危险；`-fg` 是状态色作**实底**时的文字色（暗色主题下翻转为深字，亮色恒为白） |
| 链接与焦点 | `link`、`ring` | 文字链接；键盘焦点环（`ring` 22% 不透明度、3px 扩散） |
| 浮层 | `overlay`、`head-bg` | 弹窗遮罩；吸顶导航底（90% 白 + 轻模糊可选） |

对比度基线：正文与按钮文字满足 WCAG AA（≥ 4.5:1）；`text-3` 仅用于 ≥ 12px 的辅助信息。

## 2 · 字体

- 展示与正文同族（Plus Jakarta Sans，Google Sans 的开源替位；中文回退 PingFang SC / Microsoft YaHei），等宽用 Azeret Mono。
- 标题 600 + 负字距；`display-hero` 用于首屏主标题，其余按 `heading-*` 降级使用。
- 等宽字体的职责：数据（表格数字、ID、金额）、小节 kicker（大写 + 0.08~0.14em 字距）、状态徽章、kbd 快捷键提示。数字场景必须开 `font-variant-numeric: tabular-nums` 并右对齐。
- 单视图字体重量不超过两档（如 400 + 600）。

## 3 · 布局与间距

- 4px 基准：组内 8px、组间 16px、区块间 32~40px、区块上下 64px。
- 内容列 `max-width: 1120px`，两侧留白 28px；960px 以下单列。
- 卡片内边距默认 24px，紧凑面板 20~22px。

## 4 · 面与投影

无玻璃、无 backdrop-filter。层级靠**实底面色 + 柔和投影**：

- `surface`（纯白）承载卡片、导航、浮层；`surface-2`（蓝灰 `#f0f4f9`）做二级面。
- 投影三档：`shadow-card`（静态卡）/ `shadow-pop`（下拉、Toast、推荐定价档）/ `shadow-modal`（弹窗）。禁止给文字、chip、表格行加投影。
- 顶部渐变带（`bg-image`）只允许出现在页面背景层，高度约 300~560px，用于首屏氛围；不得移到卡片或按钮上。

## 5 · 形状与圆角

`sm 10 / md 16 / lg 24 / full`：输入框与小元素用 `sm`，卡片/弹窗/菜单用 `md`，大面板与遮罩容器用 `lg`，胶囊（按钮、chip、徽章、开关、头像、分页钮）用 `full`；**按钮固定 `button = full`（pill）**。同一组件族内圆角一致，不混用方角。

## 6 · 动效

- 只为状态变化服务：150ms 状态、200ms 浮层、300ms 弹窗；缓动 `cubic-bezier(0.175, 0.885, 0.32, 1.1)`。
- 允许：入场 fadeUp 交错（≤ 0.45s）、hover 反馈、进度条推进、骨架屏 shimmer（1.5s 线性循环）。
- 禁止：自发光/呼吸类循环动画、滚动视差、渐变层动效。长任务进度优先用骨架屏 + 进度条组合表达。

## 7 · 组件关键值

| 组件 | 关键规格 |
| --- | --- |
| 按钮 | 五语义：primary（`primary` 实底 + `primary-fg` 字）、outline（`surface` 底 + `border-strong` 边）、ghost（透明）、danger（`bad` 实底 + `bad-fg` 字）、link（`link` 色 + 下划线）；高 40 / 33(small) / 48(large)，pill 圆角；loading 在按钮内嵌 14px spinner；禁用整体 0.42 不透明 + not-allowed；`:focus-visible` 用 `ring` 2px 外描边 |
| 输入 | 高 40，padding 0 14px，`border-strong` 1px 边，圆角 `sm`；focus = 边框转 `ring` + 3px `ring` 22% 扩散；invalid = 边框转 `bad` + 同规则扩散 + 12px 错误文案；disabled = `surface-2` 底 + `text-3` 字；textarea 最小高 86px；select 原生 + appearance 接管 + CSS 绘制箭头 |
| 徽章 chip | 高 24，`font-mono` 11.5px/600，胶囊；`-soft` 底 + 同色文字 + 6px 实色圆点（颜色之外的状态通道） |
| 标签 tag | 胶囊 + `border-strong` 1px 边，右侧 15px 圆形删除钮 |
| 提示条 alert | 四态：`-soft` 混入做底、状态色 35% 混入做边框；左侧 20px 状态色实心圆图标（`*-fg` 字色），右侧关闭 ×；标题 13px/600 + 说明 13px `text-2` |
| 数据表格 | 容器 = 卡面 + `border` + `shadow-card`；表头 `font-mono` 10.5px 大写 + `text-3`；行分隔 `border`，hover `surface-2`；数字列右对齐 tabular-nums；状态列用 chip；行尾操作为 29px 图标钮；工具栏与分页条底色 `surface-2` |
| 分页 | 31px 胶囊钮，当前页 `primary` 实底 + `primary-fg` 字 |
| Tabs | 下划线式：激活 = `primary` 字 + 2px 线；计数徽章用 `primary-soft` 底 `primary` 字；未激活 `text-2` |
| Toast | 右上角堆叠；卡面 + `border` + `shadow-pop`；左侧 20px 状态色实心圆图标（`*-fg` 字色）；标题 13px/600 + 说明 12px `text-2`；自动消失可手动关 |
| 弹窗 | `overlay` 遮罩；面板 `surface` + `border` + `shadow-modal` + 圆角 `lg`；头部标题 + 右上 ×，正文 13.5px `text-2`，底部操作条 `surface-2` + 上边框；危险确认主操作用 danger 按钮 |
| 下拉菜单 | 宽 ~240px，`surface` + `border` + `shadow-pop`，内边距 6px；项高 ~34px、hover `surface-2`、圆角 `full`；头部署头像（`primary` 实底 + `primary-fg` 首字母）+ 邮箱/额度小字；右侧 kbd 提示（mono 10px + 边框）；危险项 `bad` 色 |
| Tooltip | 反色样式：底 = `text`，字 = `bg`，11.5px mono，带同色小三角，上/下两个方位 |
| 进度 | 条 8px / 细 4px，`surface-2` 底 + `primary` 填充，胶囊；spinner 22px、2.5px 边、`primary` 22% 轨道；骨架屏 `surface-2 → border → surface-2` 渐变位移 |
| 空态 | 虚线 `border-strong` 边框 + `surface` 底；圆形图标位 + 标题 + 指向第一个动作的说明 + primary small 按钮 |

## 8 · Do / Don't

- 只消费语义 token；新增 token 必须亮暗双主题同步定义并回填本文件与 `design.dark.md`。
- **状态色作实底时文字必须用对应 `-fg`**，不得写死白色——这是亮暗双主题共用的合同（暗色下 `-fg` 是深字）。
- 单视图只放一个 primary 实心主按钮；`accent` 与 `primary` 不进同一控件。
- 状态不得只靠颜色，一律颜色 + 圆点/图标/文字。
- 渐变只允许出现在 `bg-image` 顶部带；禁止渐变文字、渐变按钮、彩色投影。
- 键盘可达：所有可交互元素 `:focus-visible` 显示 `ring`；不得移除 outline 而无替代。
- 中英文混排时中文回退字体固定为 PingFang SC / Microsoft YaHei，不引入第二套无衬线家族。
