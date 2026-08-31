# 013 · Maps 插件 changelog

## 2026-08-31

- UI token 收口:popup / options / dashboard 三入口统一引入 `src/styles/tokens.css`（Material You 全量 `--gme-*` token,亮暗双主题,替代各页内联 token 块）;popup 域（App/Header/Footer/LanguageSwitcher/Toast）从 Telegram 时代旧配色迁移到语义 token,Toast 按 design.md §7 重构（卡面 + 20px 状态圆图标 + `*-fg` 字色 + shadow-pop）;options/dashboard 圆角消费 `--gme-rounded-*`、alert 边框改 `color-mix` 消费 token、间距对齐 4px 刻度;删除无消费的旧调色板 `core/constants/style.ts` 与 `style.css` 中死代码 `--login-*`。执行门 `scripts/ui_token_lint.py` 入库（enforced 端违规即失败）。验证:unit 326 passed、`pnpm check` + build 绿、lint 双端 0 违规。
