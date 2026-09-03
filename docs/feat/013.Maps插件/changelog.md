# 013 · Maps 插件 changelog

## 2026-09-02

- e2e 切真实界面单层(2026-09-02 hydra 拍板,与 extension-bing 同口径):删除全部离线 fixture 页 / route mock / 本地 mock 服务层(12 个 mock e2e spec、`tests/e2e/mock/server.mjs`、`scripts/build-e2e.mjs`),主验收改为真实 `www.google.com/maps` 采集真实数据。新增 `harness.ts`(stealth 启动:去 `--enable-automation` + `--disable-blink-features=AutomationControlled` + 身份兜底 init script;token 直注经 SW 写 chrome.storage auth 三键;用户设置直注 5s 采集档;Google 同意页自动接受;人机验证/落地域偏离/DOM 改版 skipSmoke 条件降级)与构建变体 `dist-real`(API 指本地 backend、SLS 构建期禁用)。`real-maps.spec.ts` 匿名全链路(采集 → 免费档 10 行截断完成 → RFC4180 引号感知解析断言 36 列 CSV → Reset);`real-maps-signed-in.spec.ts` Pro 登录态(登录流程不做 e2e,`e2e_seed_user.py` 新增 `maps-extension-pro` 场景签发 exchange 同构 token 对;完成边沿 usage/report 200 + enrich 到达真实 backend + 导出)。面板宿主为零尺寸元素,挂载断言用 `toHaveCount(1)`。
- 真实 e2e 首轮即揪出被 mock 层掩盖的**采集链崩溃缺陷**:远程配置 `parseSchema.fields` 稀疏覆盖被 `Object.assign` 整表替换——backend 下发的 A1 时代 10 字段旧快照把其余 19 个字段路径清成 undefined,抽取层 `getValueAt` 迭代 undefined 抛错,整批解析 0 条(旧 mock 层恰好在 mock 里回灌全量表,从未暴露)。修复双侧:插件 loader 对 fields/reviewsFields 两张下标表**按键稀疏合并**(契约新增 `MapsParseSchemaOverride` 类型,单测回归锁定);backend `MAPS_DEFAULT_CONFIG` 撤掉过期 fields 整表下发(字段下标表唯一事实源 = 插件契约,热修时按键下发即可)。
- V2 列表定位容错(真实 e2e 第二个实测缺陷):偶发 21 项批次在末位混入异形项(第 2 元素非详情数组),`isV2List` 的 `every` 全有或全无判定使整批判死、采集归零;改为**过滤异形项、保留合法项**(全异形仍抛「商家列表定位失败」,协议漂移保持可见),单测锁定两条边界。截断语义实测:免费档 `freeExportRowLimit=10` 首批判析即截断完成,当前对所有账号态生效(Pro 差异在月度配额与 enrich)。验证:unit 329 passed、type-check/lint 绿、真实 e2e 双链通过(本地 backend + 真实出网)。

## 2026-08-31

- UI token 收口:popup / options / dashboard 三入口统一引入 `src/styles/tokens.css`（Material You 全量 `--gme-*` token,亮暗双主题,替代各页内联 token 块）;popup 域（App/Header/Footer/LanguageSwitcher/Toast）从 Telegram 时代旧配色迁移到语义 token,Toast 按 design.md §7 重构（卡面 + 20px 状态圆图标 + `*-fg` 字色 + shadow-pop）;options/dashboard 圆角消费 `--gme-rounded-*`、alert 边框改 `color-mix` 消费 token、间距对齐 4px 刻度;删除无消费的旧调色板 `core/constants/style.ts` 与 `style.css` 中死代码 `--login-*`。执行门 `scripts/ui_token_lint.py` 入库（enforced 端违规即失败）。验证:unit 326 passed、`pnpm check` + build 绿、lint 双端 0 违规。
