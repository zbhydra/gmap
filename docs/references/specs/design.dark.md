---
version: 1.0
name: Material You
theme: dark
description: GMap Extractor 全项目 UI token 合同之暗色主题；交互与组件规则见 design.md（亮色），本文件只记录 token 取值与暗色差异。
source: 风格选型探索稿 scratch/design-explore/gmap-ui-styles.html（不入 git），方案 06D；token 合同以本文件为准。
colors:
  bg: "#15171c"
  bg-image: "linear-gradient(180deg,rgba(26,115,232,.16) 0%,rgba(26,115,232,.06) 300px,rgba(26,115,232,0) 560px)"
  surface: "#1d2026"
  surface-2: "#262a31"
  border: "#31353d"
  border-strong: "#4c515b"
  text: "#e8eaed"
  text-2: "#9aa0a6"
  text-3: "#7c828c"
  primary: "#8ab4f8"
  primary-hover: "#aecbfa"
  primary-fg: "#0d2b45"
  primary-soft: "rgba(138,180,248,.15)"
  accent: "#81c995"
  accent-fg: "#0c2b1c"
  accent-soft: "rgba(129,201,149,.14)"
  ok: "#81c995"
  ok-fg: "#0d2b1c"
  ok-soft: "rgba(129,201,149,.14)"
  warn: "#fdd663"
  warn-fg: "#2d2000"
  warn-soft: "rgba(253,214,99,.13)"
  bad: "#f28b82"
  bad-fg: "#2c1210"
  bad-soft: "rgba(242,139,130,.13)"
  link: "#8ab4f8"
  ring: "#8ab4f8"
  overlay: "rgba(0,0,0,0.60)"
  head-bg: "rgba(21,23,28,0.86)"
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
  shadow-card: "0 2px 8px rgba(0,0,0,.35)"
  shadow-pop: "0 10px 30px rgba(0,0,0,.50)"
  shadow-modal: "0 24px 70px rgba(0,0,0,.65)"
---

# Material You · 暗色主题

## 0 · 总览

与亮色主题（`design.md`）共用同一套 token 名与全部交互/组件规则，本文只记录取值与暗色特有差异。字体、布局、圆角、动效、组件规格与亮色完全一致。

## 1 · 与亮色的差异（实现时最容易踩的点）

1. **实底控件翻转为「浅底深字」**：暗色下 `primary` 是淡蓝 `#8ab4f8`，按钮文字用 `primary-fg` 深蓝 `#0d2b45`；danger 按钮同理（`bad #f28b82` 底 + `bad-fg #2c1210` 深字）。**照搬亮色的白字在暗色下对比度不达标（约 2:1）**，这是暗色迁移的第一大坑——所有实底组件（按钮、Toast/提示条图标圆、头像、推荐档徽标、当前页码、分段控件激活态）一律消费对应 `*-fg`。
2. **层级靠面亮度，不靠投影**：`bg #15171c` → `surface #1d2026` → `surface-2 #262a31` 三级亮度差承担主要层级；投影存在感弱但仍按三档给（见 YAML），不可省略（浮层需要边界感）。
3. **顶部渐变带暗色化**：蓝调降至 16% 不透明度，营造与亮色版对应的首屏氛围；骨架屏 shimmer 仍按 `design.md` 的状态反馈例外执行。
4. **状态色用 Google 暗色档**（`#81c995 / #fdd663 / #f28b82`）：作为文字与图标色在暗底上可读；作实底时配各自 `-fg` 深字。
5. `overlay` 用纯黑 60%；`head-bg` 深底 86% 不透明且不使用 `backdrop-filter`；`link` / `ring` 统一淡蓝。

## 2 · Do / Don't（暗色补充）

- 其余规则（token 消费、单 primary 实心钮、状态双通道、焦点环、渐变禁令）与亮色相同，见 `design.md` §8。
- 禁止在暗色下引入纯白 `#ffffff` 作文字或实底面；最亮的常规文字是 `text #e8eaed`，最亮的实底面是 `surface-2 #262a31` 之外的实底控件色（如 `primary`）。
- 表格行 hover、菜单项 hover 用 `surface-2`，不要用透明度叠加白色。
