# 插件端 E2E

插件 E2E 只验收真实站点。受控 HTML、假站点数据、假媒体响应和通用 API mock 不属于
E2E；纯逻辑和异常分支由 Unit/Integration 覆盖。

## 命令

```bash
pnpm test
pnpm run test:e2e:telegram
pnpm run test:e2e:telegram-ad-assets
pnpm run test:e2e:instagram
pnpm run test:e2e:vimeo
pnpm run test:manual
pnpm run test:setup
pnpm run test:setup:instagram
pnpm run test:report
pnpm run test:clean
```

`pnpm test` 会 fresh production build 当前源码，然后串行执行全部真实自动化项目：

- `extension-e2e-telegram-real`：真实 Telegram A/K 固定频道，7 条。
- `extension-e2e-instagram-real`：真实 Instagram 固定 Home、Story、Post、Carousel、Reel
  和 Profile 流程，5 条。
- `extension-e2e-vimeo-real`：真实 Vimeo 公网视频下载，1 条。

三条站点命令只运行对应 project。manual 套件包含人工观察和长等待，仅由
`pnpm test:manual` 显式发现，不进入自动化全量。

`pnpm test:e2e:telegram-ad-assets` 复用真实 Telegram profile，按当前插件 UI 生成 Chrome
Web Store 宣传图原始截图。该流程用于按需更新素材，不提供产品功能验收，因此不进入
`pnpm test` 或 `pnpm test:e2e:telegram`。

## 真实边界

所有自动化 E2E 都加载当前 `dist` 的真实 unpacked MV3 扩展，并使用真实 Chromium、
`chrome.*`、站点 DOM、站点结构化数据、媒体请求、页面按钮和浏览器下载。下载用例必须把
文件保存到测试目录，并按对应站点合同检查文件大小、MIME、文件名或 CDN 响应字节。

只允许两个非产品数据边界：

- `/api/client/quota/check` 固定返回允许，并精确断言调用次数，避免真实下载被测试账号当天
  的线上额度阻断。
- SLS WebTracking 请求固定返回 `204`，避免 E2E 污染正式埋点。

禁止 route 站点 document、DOM、结构化数据、媒体、官网页面或其他项目 API。真实环境失败
必须按登录态、样本变化、网络/WAF 或产品回归分类，不能用假页面替代。

## 浏览器与登录态

全部 E2E 与 profile setup 使用支持
`--load-extension` 的完整 Chromium headed 模式，并关闭
`AutomationControlled`。新版稳定 Google Chrome 不支持这条 unpacked extension 启动链路；
首次运行需执行 `pnpm exec playwright install chromium`，Linux CI 需要 Xvfb。

| 场景 | 目录 |
|---|---|
| Telegram setup / real / ad-assets / manual / verify | `extension/tests/logs/test-user-data-telegram`（固定绝对路径） |
| Instagram 人工登录与快照 | `tests/logs/test-user-data-instagram` |
| Instagram 单用例运行 profile | `tests/logs/test-user-data-instagram-runs/<testRunId>` |
| Vimeo | `tests/logs/test-user-data` |
| 下载文件 | `tests/logs/downloads/<testRunId>` |
| Playwright 报告 | `tests/logs/playwright-report` |
| trace / screenshot / video | `tests/logs/test-results` |

Telegram 登录态由 `pnpm test:setup` 人工初始化。setup、real、ad-assets、Telegram manual
与 verify 入口固定使用仓库内同一个绝对 profile：
`extension/tests/logs/test-user-data-telegram`，不提供 profile 参数或环境变量。

setup fresh build 后先关闭 persistent context 恢复出的普通页和 Telegram 页，再创建唯一
fresh owner Page。该页面先进入 A，等待并确认登录成功后导航 K，再等待并确认 K 登录成功；
验证阶段任一时刻只有一个 Telegram Page，不并发打开 A/K 标签页。A 与 K 是 Telegram Web 的
两个独立客户端（gramjs / TDLib），各自维护独立 MTProto session，登录态互不共享，仅共用同一
profile 目录，因此 setup 必须按 A → K 顺序分别验证两版登录。启动期间短暂出现的 Auth 壳不作为终态；额外恢复页关闭
成功属于正常清理，只有关闭失败才报错并要求重试。两版都 ready 后 setup 自动关闭浏览器。
`pnpm test`、`pnpm test:e2e:telegram` 等日常 E2E 只读取已初始化的 profile，不会再次运行
setup；profile 缺失或登录失效时需单独重跑 `pnpm test:setup`。

Playwright 使用 `fullyParallel=false`、`workers=1`；Telegram real、ad-assets 与 manual
project 都固定 `retries=0`。每条 Telegram test 开始时先关闭 persistent context 遗留的
普通页和 Telegram 页，再创建 fresh page，结束时关闭本 test 页面。

Instagram 登录态由 `pnpm test:setup:instagram` 初始化，快照源目录固定为
`extension/tests/logs/test-user-data-instagram`，与 fixtures 共用同一 resolver，不接受
环境变量覆盖。登录成功后导出 `playwright-storage-state.json`；真实用例只读取快照，并为
每个用例创建临时 profile。

## 固定样本

| 项目 | 覆盖 |
|---|---|
| Telegram scan | A/K 消息 12/13 的真实相册、复选框、按钮容器/顺序/几何位置，K popup 读取真实资源 |
| Telegram download | A/K 只选择子消息 13，下载真实视频并检查配额调用 |
| Telegram sidebar | A 侧边栏消息 13 的按钮位置、`DOWNLOAD ALL (3)` 和真实视频下载 |
| Instagram Home | 滚动后视频 current/all、图片轮播切换前后 current、从 Home 进入并连续下载两张 Story |
| Instagram detail | 固定 Post、Carousel 第 4 项切第 5 项、Reel 的 current/all 和真实原媒体下载 |
| Instagram Profile | `twilight/` 与 `twilight/reels/` 的全部 Grid 按钮及真实下载 |
| Vimeo | 固定公网视频解析可用画质，下载真实 MP4 并恢复按钮状态 |

Vimeo 命中 Cloudflare 人机验证时会明确 skip；该结果只说明当前自动化 profile 无法进入
页面，不能记作产品通过。

## 环境变量

三站点（Telegram / Instagram / Vimeo）的 profile 目录均固定为仓库内绝对路径，不接受
环境变量覆盖；下表只列样本 URL、下载目录与套件开关等可覆盖项。

| 变量 | 默认值 | 用途 |
|---|---|---|
| `E2E_TG_K_URL` | 固定 Telegram K 频道 | 临时覆盖 K 目标 |
| `E2E_INSTAGRAM_HOME_URL` | `https://www.instagram.com/` | Home 与 Story 入口 |
| `E2E_INSTAGRAM_POST_URL` | 固定 Post | Post 样本 |
| `E2E_INSTAGRAM_CAROUSEL_POST_URL` | 固定 Carousel 第 4 项 | Carousel 样本 |
| `E2E_INSTAGRAM_REEL_URL` | 固定 Reel | Reel 样本 |
| `E2E_INSTAGRAM_PROFILE_URL` | `https://www.instagram.com/twilight/` | Profile 样本 |
| `E2E_INSTAGRAM_PROFILE_REELS_URL` | `https://www.instagram.com/twilight/reels/` | Profile Reels 样本 |
| `E2E_DOWNLOAD_DIR` | `tests/logs/downloads/<testRunId>` | 临时覆盖下载目录 |
| `E2E_INCLUDE_MANUAL` | `0` | 仅 manual 命令设为 `1` |
| `E2E_INCLUDE_AD_ASSETS` | `0` | 仅宣传图截图命令设为 `1` |

## 失败定位

真实 Telegram 环境错误使用 `E2E_PROFILE_MISSING`、`E2E_LOGIN_STATE_EXPIRED`、
`E2E_INJECTED_NOT_READY`、`E2E_TG_REAL_FIXTURE_NOT_READY`、
`E2E_TG_CHAT_DOWNLOAD_TIMEOUT` 和 `E2E_TG_SIDEBAR_DOWNLOAD_TIMEOUT`。

Instagram 会区分 storage state 缺失/过期、登录失效、按钮缺失、样本身份不一致和 CDN
下载不一致。错误信息必须包含 profile、URL、选择器或实体、下载目录和恢复命令。
