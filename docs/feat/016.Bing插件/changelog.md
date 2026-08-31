# 016 · Bing 插件 changelog

## 2026-08-30

- 建域:竞品 "Maps Scraper & Map data extractor" v2.4.9 复刻立项。调研完成(静态逆向 + 动态验证,`docs/research/bing-maps-scraper-竞品调研.md`);工程底座 `extension-bing/` 就绪(清理 + 固定 ID + website 登录桥);商业化口径拍板(免费 20 条/竞品数值,后端走自有订阅体系);一期范围 B1–B7 拍板,计划见 `plans/001.一期实施.md`。
- 2026-08-30 一期(M1–M5)实施完成:U1 e2e 基建(离线 fixture 层 + 真实 Bing smoke 条件化降级)、U2 配置契约/解析/远程透传、U3 采集状态机/面板/18 列导出、U4 登录桥接收/免费 20 与 Pro 门控/Pricing 视图、U5 真实 smoke/产物核验用例/content_open 补齐。经 hydra-execute-loop 逐单元 worker/reviewer 循环 + 跨单元审查;基线:check 全绿、单测 182、e2e 10 passed + 1 条件化 skip。已知限制:官网生产域名未定(占位);真实 smoke 在 cn.bing.com 地域网络下按设计跳过;Email/社媒列为二期。

## 2026-08-31

- UI token 收口(与 013 同构):`src/styles/tokens.css` 引入 popup 入口;popup 域(App/Header/Footer/LanguageSwitcher/Toast)迁移 Material You 语义 token;BingPanel token 名统一 `--gme-` 前缀(原裸名,防宿主变量渗透的全项目单一约定)、间距对齐 4px 刻度;删除旧调色板 `core/constants/style.ts` 与 `--login-*` 死代码。Toast 对比度回归测试改为解析 tokens.css 亮暗双主题断言。验证:unit 182 passed、`pnpm check` + build 绿、lint 0 违规。

