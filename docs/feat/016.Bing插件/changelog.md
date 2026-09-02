# 016 · Bing 插件 changelog

## 2026-09-01 登录迁移 v3 浏览器身份(v2 官网桥删除)

- 登录由 v2 官网推送桥(website `/extension-login-bing` → `externally_connectable` 定向消息)整体迁移为 v3 插件发起流程:popup + 面板未登录 `Sign in` 双入口 → 官网统一确认页 `/extension-login` → 一次性 code 回跳换插件独立 token;协议合同见 `../007.用户系统/tech-第三方登录.md` §9(007 plans/006 实施)。
- manifest permissions 改 `['storage','identity']`,删固定 key 与 `externally_connectable`;删除 `WebsiteAuthBridge` 与 `applyWebsiteToken`,新增 `applyExtensionLogin`(快照比对提交 + 成功后订阅态失效重拉)与 auth 三键 storage watcher(登出失效内存门控态)。
- 拍板变更:「popup 不设账号区」(2026-08-30)随 v2 官网推送模式删除而失效——v3 插件发起模式需插件内入口,popup 与面板各设一个 `Sign in`(同一 background 流程)。
- e2e harness 改 v3 mock(SW 内替换 `launchWebAuthFlow`,豁免记录见 `spec-test-client.md` §3.2)+ 动态 SW 发现(删写死 EXTENSION_ID)。
- 验证: check/build 绿、单测 175、e2e 10/10;与 Maps/后端/官网集成验证 32 项断言 0 失败(v2 端点 404、code 一次性、双插件独立 session、配额归属证据)。浏览器 UI 面(真实登录回流/即时刷新/订阅徽标)待 unpacked 人工终验。

## 2026-08-30

- 建域:竞品 "Maps Scraper & Map data extractor" v2.4.9 复刻立项。调研完成(静态逆向 + 动态验证,`docs/research/bing-maps-scraper-竞品调研.md`);工程底座 `extension-bing/` 就绪(清理 + 固定 ID + website 登录桥);商业化口径拍板(免费 20 条/竞品数值,后端走自有订阅体系);一期范围 B1–B7 拍板,计划见 `plans/001.一期实施.md`。
- 2026-08-30 一期(M1–M5)实施完成:U1 e2e 基建(离线 fixture 层 + 真实 Bing smoke 条件化降级)、U2 配置契约/解析/远程透传、U3 采集状态机/面板/18 列导出、U4 登录桥接收/免费 20 与 Pro 门控/Pricing 视图、U5 真实 smoke/产物核验用例/content_open 补齐。经 hydra-execute-loop 逐单元 worker/reviewer 循环 + 跨单元审查;基线:check 全绿、单测 182、e2e 10 passed + 1 条件化 skip。已知限制:官网生产域名未定(占位);真实 smoke 在 cn.bing.com 地域网络下按设计跳过;Email/社媒列为二期。

## 2026-08-31

- UI token 收口(与 013 同构):`src/styles/tokens.css` 引入 popup 入口;popup 域(App/Header/Footer/LanguageSwitcher/Toast)迁移 Material You 语义 token;BingPanel token 名统一 `--gme-` 前缀(原裸名,防宿主变量渗透的全项目单一约定)、间距对齐 4px 刻度;删除旧调色板 `core/constants/style.ts` 与 `--login-*` 死代码。Toast 对比度回归测试改为解析 tokens.css 亮暗双主题断言。验证:unit 182 passed、`pnpm check` + build 绿、lint 0 违规。

