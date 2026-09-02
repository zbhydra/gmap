# 016 · Bing 插件 changelog

## 2026-09-02 E6 Email/社媒挖掘接入(二期落地)

- **插件端接入自研补全服务**(后端 `POST /api/client/maps/enrich` 为 013 A4 U8 已交付能力,gmap/bing 两线共享):新增 `src/sites/bing/enrich/`(types/enrichApi/enrichClient,与 gmap 线同构)——Pro 会话采集完成边沿(collecting→completed 订阅)先把 5 个云端挖掘列(Emails/Social Medias/Facebook/Instagram/Twitter)清出 `###PRO###` 占位(权益已解锁,无数据留空),再按 website 主机名去重分批(≤50)经新 background RPC `enrichBusinesses` 调服务端写回;免费/匿名会话不触发,行保持占位(营销锁定钩子)。单批失败收敛空结果继续剩余批次(局部可失败),新增 `enrich_complete` 打点(成功/失败均报)。
- 门控取快照:完成边沿先 `refreshGateState()` 再判 `isPro`,登录/订阅切换最迟下一轮生效口径与采集停止策略同源。
- **真实 e2e 双向断言**:Pro 用例(Stop 前挂 `context.waitForEvent('response')` 等 `/maps/enrich` 请求——清占位先于任何批次请求,信号即证占位已清)导出后断言 5 列脱离 `###PRO###`;免费用例反向断言 5 列保持占位。harness 新增 `parseCsvLine`(RFC4180 简版)——真实 Bing 地址字段带引号含逗号,`split(',')` 列级断言会错位。
- 验证:单测新增 `bing-enrich.spec.ts`(websiteKey/目标去重/分批/写回/失败收敛/打点,8 用例),全量 183 passed;type-check/tests/eslint(改动文件)/prettier/权限检查过;`pnpm build` 绿;真实 e2e 5/5 passed(本地真实 backend + 真实 bing.com,Pro 补全断言实跑通过)。

## 2026-09-02 e2e 真实界面化(零 mock)+ 登录态 token 直注

- **e2e 重构为单层真实界面主验收**(hydra 拍板「不可以使用 mock 界面,必须真实 bing 地图界面采集」):删除离线 fixture 层(fixture 页 + 生成器 + smoke/collect-export/login-gating 三个 mock spec + harness 全部 route/登录 mock)与独立的 real-bing-smoke;新 `real-bing.spec.ts`(匿名免费全链路:真实采集 → 20 截断 → 完成态 → CSV 导出)与 `real-bing-signed-in.spec.ts`(Pro 登录态)。方案合同见 `references/T1-技术设计.md` §6(重写)。
- **反自动化身份(stealth)**:launch 去 `--enable-automation` + `--disable-blink-features=AutomationControlled` + 身份兜底 init script(website browser-identity 同款);harness 固定 locale en-US。
- **登录流程不做 e2e**(hydra 拍板):登录态改「脚本签发 token 直注」——`backend/scripts/e2e_seed_user.py` 新增 `bing-extension-pro` 场景(幂等建号 + maps_extension Pro 订阅 30 天 + `issue_registered_tokens_for_user` 签发与插件 exchange 同构的 token 对注册 Redis 白名单);globalSetup 探测本地 backend(127.0.0.1:7600)后 seed,spec 经扩展 SW 直写 chrome.storage auth 三键;backend 不可达条件 skip。
- **构建变体 dist-real**(`scripts/build-real.mjs`,`pnpm build:real`):API 指向本地真实 backend、SLS 构建期禁用(不污染生产日志库);`test:e2e` 改用该变体,生产 `pnpm build` 不变。
- **真实接线裂缝修复(原被 mock 掩盖)**:①后端 `/subscription/status` 新增可选 `product_line` query(白名单 `SUBSCRIPTION_PRODUCT_LINES`,缺省 extension 兼容旧调用),插件 `subscriptionApi.getStatus()` 显式传 `maps_extension`——原端点固定返回 TG 下载线状态,插件 Pro 判定在真实后端下永远 FREE;②插件 `SubscriptionStatus` 类型对齐真实契约(删 daily_limit/used/remaining/reset_date/extension_download/one_time 旧 TG 兼容字段,后端已不再返回)。
- **冷启动登录态被自吞 bug 修复**(`backgroundStores.ts`):原 auth 三键 onChanged watcher 把 `getCurrentUser` 的 USER_INFO 资料回写也当登录态切换清态——SW 冷启动恢复登录态时,hydrate 刚完成的认证态被自己的资料回写吞掉,首次 getGateState 返回匿名(面板 Sign in / 免费档误截断),下一轮刷新才自愈。改为仅 token 对(access/refresh)变化清态重 hydrate,USER_INFO 单独变化(同会话资料更新)不清。真实 e2e 登录态用例即由该 bug 阻塞而定位。
- 验证:backend black/ruff/mypy 绿 + subscription status real 测试 2 passed + seed 脚本实跑成功;插件 check 全绿、单测 175、生产 build 绿;真实 e2e 5/5 passed(本机真实 bing.com,匿名 8s / Pro 9s)。

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

