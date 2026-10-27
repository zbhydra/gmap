# MapsGrab Dashboard 设计稿 · Atlas 基础层

官网 Dashboard（`/dashboard/`、`/dashboard/history/`、`/dashboard/api/`、`/dashboard/subscriptions/`）重做的**静态可交互原型**：一个 HTML 页面加原生 CSS / JS，零依赖。直接引用上级目录的 Atlas 资源（`../assets/css/` 下的 tokens / base / motion / components、`../assets/img/icons.svg`、`../assets/js/theme-boot.js`），本目录不复制 token。原型是落地的目标参考，不是生产代码。

- 只用 Atlas **基础层**（[design-website.md](../../../references/specs/design-website.md) §0）：不用渐变、辉光、极光、等高线和玻璃效果；动效只用 T1 / T2。
- 原型数据全部是 mock，接口字段、状态与错误码按现有合同；History 查询与存储合同见 [Online Export 接口](../../../feat/014.Maps云端/tech-Online任务与结果.md#历史查询)，后端改动对照见 §12。工作区入口与前端消费边界见 [Dashboard 技术合同](../../../feat/015.工具与增长/tech-用户Dashboard.md)。
- 文案是英文占位。已有文案取自 `website/src/i18n/dashboard.ts`；新增的键见 §11。

| 文件            | 内容                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| `index.html`    | 外壳；四个视图，各分骨架 / 门槛 / 内容三层；弹窗与浮层；调试面板                                       |
| `dashboard.css` | §0 增补 token；§1 原型专用覆盖；§2 外壳与视图容器；§3–§9 组件（§4b 图标栏、§6b History 工具栏）；§10 调试面板；§11 响应式 |
| `dashboard.js`  | 路由与外壳（含侧栏收起）、全局状态、mock 接口与失败注入、任务进度模拟、各视图渲染                      |

## 0 · 预览

```bash
cd docs/design/website && python3 -m http.server 8766 --bind 127.0.0.1
# 打开 http://127.0.0.1:8766/dashboard/
```

- 必须通过 HTTP 打开。图标引用外部 sprite（`../assets/img/icons.svg#…`），用 `file://` 打开时浏览器会拦截。
- 8765 端口当前被别的项目的本地服务占用，所以这里用 8766。换成任何空闲端口都可以。
- 右下角的「原型调试」面板（原型专用，中文）可以切换下列状态，也可以直接写进 URL：

| 参数     | 取值（首项为默认）                                                 | 说明                                                                                                                                        |
| -------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `view`   | `online` / `history` / `api` / `subscriptions`                     | 对应四个真实路由                                                                                                                            |
| `subs`   | `online` / `none` / `multi` / `unavailable`                        | 订阅组合，依次为：只有 Online Basic；全部 Free；三条线都有效（Online Growth、Maps Pro、API Professional，并带 23 个已连接应用，用来演示分页）；Online 与 API 订阅读取失败（Unavailable），Browser Extension 为 Maps Pro |
| `state`  | `ready` / `loading` / `signedout` / `offline` / `empty` / `errors` | `loading` 停在首屏骨架；`errors` 让每类请求第一次失败，重试后成功                                                                           |
| `quota`  | `normal` / `near` / `exhausted`                                    | Online 本月额度：正常 / 用到 86% / 已用尽                                                                                                   |
| `sim`    | `on` / `off`                                                       | 任务进度模拟：每 2.6 秒推进一步，任务结束时扣额度                                                                                           |
| `motion` | `full` / `reduced`                                                 | 强制减弱动效。系统开启「减弱动态效果」时同样生效                                                                                            |

History 的查询条件也在 URL 里（这是落地合同，不是原型专用）。只写非默认值；值不合法时回到默认，页码越界时回到最后一页：

| 参数     | 取值（首项为默认）                                      | 说明                                                       |
| -------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `q`      | 空 / 任意文本                                           | 任务号或关键词，去掉首尾空白后最长 100 字符               |
| `status` | `all` / `running` / `completed` / `partial` / `failed` | `running` 包含 queued、collecting、publishing 三个公开状态 |
| `range`  | `all` / `7d` / `30d` / `custom`                         | 时间范围，按纽约时间的日历日计算                           |
| `from` / `to` | `YYYY-MM-DD`                                       | 只在 `range=custom` 时有效，两端都包含                     |
| `page`   | `1` / 正整数                                            | 页码                                                       |
| `size`   | `20` / `50` / `100`                                     | 每页条数                                                   |

- 主题在调试面板和账户菜单里都能切换，写入 `localStorage['mg-theme']`，与站点的做法一致。
- 侧栏收起状态写入 `localStorage['mg-dash-side']`（`collapsed` / `expanded`）；快捷键 `[`，或 ⌘B（macOS）/ Ctrl+B（其他系统）。详见 §2.1。

## 1 · 信息架构

```
Dashboard（单入口 SPA，外壳常驻）
├─ 侧栏：品牌 + 收起按钮 → 导航（Online Scraper / History / API management / Subscriptions）→ 用户卡（固定在底部）
│   └─ 账户菜单：身份 · 三条产品线订阅 · Manage subscriptions · Theme · Language · Log out
├─ 顶栏：视图标题（h1）+ 视图级操作
│   Online：自动刷新提示 + Refresh；History：自动刷新提示；API：View API products ↗；订阅：View pricing ↗
└─ 主区（四个视图常驻，只切换显示）
   ├─ Online Scraper            /dashboard/
   │   ├─ New task：Keywords | Map | Regions → 邮箱与社媒开关 · 本月额度 · Start scraping
   │   └─ Recent tasks：最近 5 条（进度 / 状态 / 下载 / 完成提示）→ View all ↗ History
   ├─ History                   /dashboard/history/
   │   ├─ 工具栏：搜索（任务号 / 关键词）· 状态 · 时间范围 · Refresh
   │   └─ 任务列表：任务行（展开看每个搜索的结果、下载）→ 分页（页码 · 上一页 / 下一页 · 每页 20 / 50 / 100）
   ├─ API management            /dashboard/api/
   │   └─ API plan + Monthly API usage（合为一张卡）· API key · Connection addresses · Connected apps
   └─ Subscriptions             /dashboard/subscriptions/
       └─ Online Scraper / Browser Extension / API 三张方案卡 → 管理订阅（渠道页或指引弹窗）/ 选方案
```

- 四个视图是同一个应用。外壳（侧栏、顶栏、用户卡）常驻，切换视图只换主区内容。URL 是四个可直达的地址，多语言前缀照旧。
- Online Scraper 是默认视图，从上到下是 New task（本视图唯一的 primary 操作）和 Recent tasks。刷新、去产品页、去定价页这类视图级操作放在顶栏，不占正文空间。
- 任务列表只有一套：History 是完整列表；Online 的 Recent tasks 是同一个行组件的紧凑变体，只取最近 5 条，不分页、不筛选、不展开。
  - 点最近任务的任务名：跳到 History，以完整任务号搜索，并自动展开这个任务。
  - View all：跳到 History，筛选回到默认（保留每页条数）。
- 订阅信息分三层展示：
  - 用户卡只显示 Online 档位和本月额度，因为 Dashboard 以 Online 为主。
  - 账户菜单列出三条产品线。
  - 订阅视图给出完整卡片和管理入口。
  - API 视图的合卡卡头与账户菜单、订阅卡用同一套措辞（套餐名、Renews / expires、自动续费、Unavailable）。
- 视图之间互相链接：API 合卡的 Manage subscriptions → 订阅视图；Free 档的 Upgrade → Pricing 对应产品；账户菜单的 Manage subscriptions → 订阅视图；History 空态 → Online Scraper。

## 2 · 外壳与布局尺寸

| 部位     | 规格                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 侧栏     | `position: fixed`，高 `100dvh`。展开宽 `--side-w`（248px），收起为图标栏 `--side-w-rail`（72px），见 §2.1。从上到下：品牌行（高 `--topbar-h`）；导航区（`overflow-y: auto`，自身滚动）；用户卡区（不参与滚动，始终贴着视口底边）。右侧分隔线用 `inset` 投影画，不占宽度 |
| 品牌行   | 左侧品牌；右侧收起按钮（40px 图标按钮，贴右缘，收起后正好落在图标栏中线）。窄屏抽屉里换成关闭按钮                                                                                         |
| 顶栏     | `position: sticky`，高 `--topbar-h`（64px，与品牌行对齐），底色 `--bg-2`；页面滚动后出现 1px 底边线。内层与内容区同左缘、同上限：标题与各视图内容左对齐，操作区与内容右缘对齐              |
| 主区     | `margin-left` 等于侧栏当前宽，随文档滚动。侧栏 fixed 后两边已经互不影响；用文档滚动而不是内层滚动容器，可以保留浏览器原生的键盘滚动、锚点定位，以及移动端地址栏收起                        |
| 内容区   | 贴着侧栏，左右内边距 `--main-pad`（视口 ≥ 1280 为 32px，641–1279 为 24px，≤ 640 为 16px，只按视口切换，不随侧栏收起变化），上下内边距 `--s-2` / `--s-16`，内容按主区可用宽度填满。只在超宽屏限宽：内容最宽 `--container-wide`（1360px），即主区超过 `--main-max`（1424px）后才生效，限宽后仍靠左。区块间距 `--s-6` |
| 视图容器 | `container: view / inline-size`。静止时按当前侧栏宽度排版；收放过程中锁定起始布局，结束后一次切到目标布局，见 §2.2                                                                            |
| 滚动条   | `html { scrollbar-gutter: stable }`：视图高度不同也不会挤动布局                                                                                                                            |
| 面板     | `.d-panel`：`--surface` 底、1px `--border`、`--r-lg`、`--shadow-xs`。面板头最小高 52px，并排面板的标题能对齐                                                                              |
| 用户卡   | `--surface-2` 底、`--r-md`。上半：头像 36px、姓名和邮箱（单行省略）、选择器图标；下半：Online 档位徽章，以及本月 records 额度（数字 + 细进度条）。整张卡就是菜单按钮，菜单展开时边框变 `--primary`。图标栏状态见 §2.1 |
| 账户菜单 | 共享浮层 `.pop`（§3.8），宽 `min(304px, 100vw − 32px)`，从用户卡上沿弹出并与卡片左对齐；图标栏状态下从侧栏右侧弹出，底边与头像对齐；高度不超过上方可用空间，超出时面板内滚动 |
| 层级     | 侧栏和顶栏用 `--z-nav`；抽屉用新增的 `--z-drawer`（80，高于导航、低于弹窗）；图标栏提示用 `--z-dropdown`；浮层（`.pop`）和弹窗进入 top layer；toast 用 `--z-toast`                       |

### 2.1 侧栏收起（宽屏图标栏）

只在视口 ≥ 960px 时生效；窄屏仍是抽屉，行为不变，收起按钮和快捷键都不出现。

- **入口**：品牌行右侧的收起按钮。按钮带 `aria-controls`、`aria-expanded`，`aria-label` 随状态在 Collapse sidebar / Expand sidebar 之间切换，并用 `aria-keyshortcuts` 声明快捷键。按钮在两种状态下都有提示，提示里带快捷键。
- **快捷键**：`[`，以及 ⌘B（macOS）/ Ctrl+B（其他系统）。焦点在输入框（含 combobox）、文本域或可编辑区域时，`[` 照常输入字符；弹窗或浮层打开时、抽屉模式下都不响应；按住不放不会连续切换。
- **持久化**：`localStorage['mg-dash-side']`，读写都包在 try/catch 里，存不了时本次会话内仍然生效。`<head>` 里的内联脚本在首帧前写好 `html[data-side]`，收起状态下刷新页面直接就是图标栏，没有「先展开再收起」的闪动。
- **图标栏**：宽 72px，正好是 16 + 40 + 16。
  - 导航项变成 40×40 的方块。图标在两种状态下都距左 10px，所以收放过程中图标不移动，收起后正好居中。
  - 菜单文字、用户卡的身份行：`nowrap` 加裁剪，再淡出，变窄过程中不会换行。它们只淡出、不设 `visibility`，仍然是链接和按钮的可访问名称。
  - 品牌与用户卡的套餐区里有可聚焦的链接：淡出后设 `visibility: hidden`，退出 Tab 序列。收起时如果焦点正好在这两处，焦点移到收起按钮。
  - 展开时文字先等 `--dur-1` 再淡入，避免挤在半宽的侧栏里出现。
- **提示**：图标栏状态下，悬停 320ms 或键盘聚焦立即显示右侧提示（单例 `.side-tip`，`aria-hidden`，只是可见名称的视觉副本）。提示刚隐藏的 400ms 内移到相邻项会立即出现，便于连续扫读。导航区滚动、打开账户菜单、切换状态时提示隐藏。
- **用户卡**：缩成 32px 头像，外圈是 40px 的额度环，环长表示 Online 本月额度的已用比例，阈值色与额度条一致（≥ 80% 提醒色，用尽错误色），额度未知时只显示轨道。整块仍是账户菜单的按钮，菜单从侧栏右侧弹出。

### 2.2 收放过程中主区不跳动

侧栏宽与主区左缘读同一个变量 `--side-cur`（用 `@property` 注册的长度），以 T2 在 248px 与 72px 之间过渡，二者同帧移动。主区在宽度动画中保持起始布局，T2 结束后一次切到目标宽度对应的布局并淡入：

1. **动画中锁定起始布局**：容器断点与 `cqw` 按动画开始时的侧栏宽度计算，子项铺满连续变化的可用宽度。动画结束后释放锁定，容器断点、列数和工具栏形态一次切到目标布局。
2. **动画中锁定多行文字行宽（`--lock`）**：说明、错误和提示条正文按所在区域的起始布局定宽；并排卡片、连接地址、订阅卡和任务明细分别使用各自区域的宽度。动画过程中只让单行省略文字和进度条等弹性区域伸缩，避免逐帧折行。
3. **动画中保持高度**：组合区底栏、任务明细和连接地址按锁定的容器断点排版；地图高度按该布局的地图列宽计算。底栏保留起始行宽，动画中右缘可临时裁切，结束后随目标布局统一更新并完整显示。减弱动效时直接呈现目标终态。

新增组件同样按视图容器断点排版，会折行的文字给出对应区域的 `--lock`；不要让 `flex-wrap` / `auto-fit` 在动画过程中逐帧改变布局。

**验收**：逐帧检查宽度动画中布局保持起始状态、顶栏与内容左缘同步且内边距恒定，没有横向溢出；动画结束只发生一次目标布局切换并淡入。分别覆盖收起、展开和减弱动效。

## 3 · 各视图组件与交互

### 3.1 Online Scraper：New task

- **模式切换**：分段 tab（Keywords / Map / Regions），用 `role="tablist"`，可以用方向键切换。
  - 切换时组合区高度做 T2 过渡，新面板淡入。
  - Regions 第一次进入时才加载国家列表。
- **Keywords**：
  - 多行输入，右下角显示计数 `n / limit keywords`，超出上限时变成 `--bad`。
  - 空行和重复行会被忽略，并提示「Duplicate lines ignored: n」。
  - 每条不超过 500 字符。
  - 上限由 options 的 `keyword_limit` 按套餐下发。
  - 标签右侧紧跟「Build queries by region」入口（软主色 `--primary-soft`），点击切到 Regions。
- **Map**：
  - 左侧为单行单关键词输入、区域选择器和滑杆，右侧为地图；窄屏先表单后地图。
  - 区域选择器在同一浮层内按国家 → 州/省 → 城市逐级选择，支持返回上一级修改。输入搜索词时不限当前层级，三级一起匹配，结果附上级路径以区分同名的省和市。
  - 选择有坐标的区域、地图点选或展开经纬度输入均可设置中心。
  - 两个滑杆：Radius 0–50 km、Grid spacing 1–20 km。
  - 网格点用与 `scripts/dashboard/map-grid.ts` 相同的算法实时计算。地图上画出覆盖圈和网格点；超过 `logical_sample_limit`（50）时不画点，只提示超限。
  - 摘要：「Grid points: n」和「x / 50 search locations」。
  - 地图舞台的高度在侧栏宽度动画中按起始列宽固定（§2.2），结束后随目标布局更新；宽度变化时只裁边、不留白。
  - 原型里是示意 SVG。落地沿用现有的 `OnlineMapInput`（Leaflet + OSM 瓦片，已经是依赖），并显示 OSM 署名。
- **Regions**：
  - 流程：基础关键词 → 国家（单选）/ 州或地区（多选，可不选）→ 城市（多选，可不选）→ 措辞 In / Near → Generate queries → 可编辑的最终查询（同样计数和去重）。Generate queries 在措辞下方，左栏内紧跟输入。按钮右侧常驻一行说明（`aria-live`）：按表单顺序提示第一个缺项（先基础关键词，再国家），用提醒色 `--warn` + 警示图标（尚未出错，不用 `--bad`）；齐全时用 `--text-2` 显示将生成的条数。
  - 国家（252 个）是可输入过滤的 combobox（§3.8），不用原生 select：
    - 点击输入框或右侧箭头展开完整列表，当前值带勾并滚动到可见处。
    - 输入即过滤，排序为国家代码完全相同 > 名称前缀 > 名称包含；国家行右侧显示代码。
    - 失焦时，文本与某一项完全相同（不区分大小写）才生效，否则恢复原值。清空即「不选国家」。
  - 州或地区、城市是多选浮层（§3.8）：
    - 触发按钮显示摘要：两项以内列名称，更多时显示「n selected」；未选时显示占位。
    - 浮层顶部是过滤框和 Select all (n) / Clear；过滤忽略大小写与变音符号，名称前缀 > 名称包含。全选、全不选只作用于当前过滤结果。
    - 城市候选限于所选州，没选州时是全国；改州时移除不在所选州内的已选城市。城市可能上万条，只渲染前 200 条并提示继续输入，全选仍覆盖全部匹配项。
  - 生成取最细的一层：选了城市按城市（City, State, CC），否则选了州按州（State, CC），否则按国家名。
  - 不显示数据署名。
- **底栏**：
  - 邮箱与社媒开关。Free 档禁用，并给出说明和 Upgrade 链接。
  - 本月额度：数字 + 细进度条。达到 80% 用提醒色并显示重置说明；用尽用错误色。
  - Start scraping 按钮。
  - 视图容器 > 760px 时排成一行（en-US 一行最宽 744px），≤ 760px 时开关一行、额度与按钮一行。
- **消息**：
  - 额度用尽：显示提示条，带 Upgrade 入口，同时禁止提交。
  - 输入不合法：在行内说明。
  - 提交失败：沿用现有文案，提示先刷新历史再重试。
  - options 读取失败：整个组合区换成错误框，带 Retry。重试期间错误框保持，按钮转圈，不会先闪出表单。
- **提交成功**（与现有实现一致）：
  - 弹出 toast「Task submitted · Job xxxxxxxx…」。
  - 清空输入。
  - 新任务插到 Recent tasks 顶部并短暂高亮，然后刷新额度；History 标记为待刷新，下次进入时静默刷新。

### 3.2 任务行（Recent tasks 与 History 共用）

- **行结构**（宽屏为 5 列网格）：

  | 列 | 内容 |
  | --- | --- |
  | Job · Created (ET) | 关键词预览（第一个关键词；搜索时取第一个命中的关键词）+「+n」个其余关键词；第二行是时间与短任务号 |
  | Searches | 已收口采样数 / 总数；只有运行中才显示进度条 |
  | Records | 去重后的行数 |
  | Status | 徽标 + 错误说明 |
  | 操作 | Download CSV / No CSV / 运行中留空 |

  - 关键词预览单行省略；读屏读作「coffee shop in Portland, OR and 4 more」。
  - 时间统一按 America/New_York 显示并标 ET；当年的时间省略年份。
  - 状态列按视图容器宽度定宽（§2.2），收起侧栏后多出的宽度给关键词和进度两列。
  - 搜索时，命中的关键词片段和任务号前缀用 `mark.hl` 高亮。
- **状态徽标**：图标、文字、颜色三重编码。
  - Queued：时钟图标。
  - Collecting / Preparing CSV：转圈图标。
  - Completed：勾。
  - Partial success：警示图标。
  - Failed：叉。
- **展开**（只在 History）：点整行或 caret 按钮都能展开；选中文字时不触发展开。第一次展开时才加载详情，失败可以重试。详情包含：
  - 任务号全称（可复制）、Run 号、开始和结束时间（ET）、是否开启邮箱与社媒。五项一行；视图容器 ≤ 1080 时三列，≤ 680 时两列。
  - 每个搜索一行：序号；关键词（地图模式附视口坐标，重复关键词弱化显示）；记录数（行内小条按本任务的最大值归一）；状态（完成 / 失败原因 / 进行中）。
  - 底部说明：记录数是整个任务去重后的计数。
- **紧凑变体**（Recent tasks）：不展开；任务名是指向 History 的真实链接（`?q=` 完整任务号），按住修饰键可以在新标签页打开。
- **下载**：
  - 每个任务一个 CSV，文件名 `{job_no}.csv`。格式为 UTF-8 BOM、37 列，第二行是字段说明，最后一列 Search Keyword 标出来源搜索。
  - 下载时按钮转圈。
  - 文件不存在或已过期（404）、下载失败时，在按钮下方给行内说明。
  - 零结果的任务显示为 Completed + No CSV，不扣额度。
- **完成提示**：任务进入终态时弹出 toast「Task {job}: {status}」，附记录数，同时刷新额度。Recent tasks 和 History 共用一份「正在观察的任务」，同一个任务只提示一次。

### 3.3 History

- **工具栏**（常驻；翻页或改筛选时不重绘、不跳动）：
  - 搜索框：按任务号或关键词搜索，最长 100 字符。输入 300ms 防抖，回车立即搜索；有内容时出现清空按钮，Esc 也能清空。任务号按前缀匹配，关键词按包含匹配，不区分大小写。输入完整任务号且命中时，自动展开这个任务。
  - 状态：分段单选 All / Running / Completed / Partial success / Failed。Running 合并 queued、collecting、publishing 三个公开状态，与后端公开状态一一对应。
  - 时间范围：按钮显示当前范围，点击弹出菜单（§3.8）。
    - 菜单里是 Last 7 days / Last 30 days / All time 三个单选项，点选即生效并关闭。Last 7 days 指今天在内的 7 个日历日。
    - 末项 Custom range › 在同一浮层里横向切到日期子面板：两个日期输入、说明和 Apply。
      - 日期是纽约时间的日历日，两端都包含，不晚于今天，默认填最近 7 天。
      - 点 Apply 才生效；开始晚于结束时 Apply 不可用，并给出说明。
    - 自定义范围生效后，Custom range 项高亮并显示区间。
  - Refresh：手动刷新当前页，列表保留并转圈。
  - 排布：
    - 视图容器 > 1080 时排成一行。
    - ≤ 1080 时排成两行：搜索 + 刷新一行，状态 + 时间范围一行。
    - ≤ 680 时折成「搜索 + Filters 按钮 + 刷新图标」，状态和时间范围收进 Filters 菜单：
      - 菜单里是两组单选，点选后菜单保持打开、就地更新；用回车选择时关闭。Custom range 同样进入日期子面板。
      - 按钮上的数字是这两项里非默认值的个数。
      - 菜单末项是 Clear filters，连同搜索一起清空；没有筛选时不可用。
- **列表**：任务行见 §3.2，默认每页 20 条，按创建时间倒序。
- **分页**：
  - 左侧「x–y of total」。
  - 中间 Previous / 页码 / Next。页码固定 7 格（首页、尾页、当前页附近和省略号），翻页时分页条宽度不变。首页和末页时边界按钮用 `aria-disabled`，焦点不会丢。
  - 右侧 Rows per page（20 / 50 / 100）：按钮 + 弹出 listbox（§3.8），分页条靠近视口底部时向上弹出。改每页条数回到第 1 页。
  - 视图容器 ≤ 680 时隐藏页码，只留区间、上一页 / 下一页和每页条数。
- **翻页与改筛选**：
  - 改筛选回到第 1 页；收起所有已展开的任务。
  - 只有列表区换成骨架（行数与当前一致，至少 3 行，最多为每页条数），数据到达后淡入；工具栏和分页条不动。
  - 如果工具栏已经滚出视口，滚回工具栏（减弱动效时直接跳过去）。
  - 筛选条件和页码用 `replaceState` 写进 URL，刷新后保持，不占后退栈；切换视图仍用 `pushState`。
- **空态**分两种：
  - 还没有任何任务：隐藏工具栏，显示 No exports yet 和 Go to Online Scraper。
  - 有筛选但没有结果：工具栏保留，显示 No matching tasks 和 Clear filters。
- **失败**：首屏、翻页、改筛选失败时，列表区换成失败面板加 Retry；手动刷新和轮询失败时保留旧数据，在列表顶部提示「Could not refresh. Showing the last loaded results.」。
- **自动刷新**：History 是当前视图且当前页有运行中的任务时，每 5 秒按当前筛选静默刷新当前页（原型用 2.6 秒的模拟推进代替），顶栏显示「Auto-refresh on」，不出骨架。离开 History 后不轮询；回到 History 时，如果期间提交过新任务、有任务结束，或当前页有运行中的任务，就静默刷新一次。
- **原型数据**：62 个任务，覆盖全部状态、零结果和过期文件（见 §14），创建时间分布在最近 3 个月，用来演示分页与时间筛选。

### 3.4 API management

| 面板                       | 内容与交互                                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API plan + Monthly API usage（合卡） | **卡头**（数据来自会话里的订阅摘要）：左侧是 API PLAN 标签、套餐名（没有有效订阅时为 Free），以及 Renews / expires {日期} 和自动续费状态两行，措辞与账户菜单、订阅卡一致；右侧是刷新图标按钮和 Manage subscriptions（跳到订阅视图），Free 时换成 Upgrade ↗（跳到 Pricing 的 API）。**卡身**（数据来自用量接口）：MONTHLY API USAGE 标签；本月用量大数字 +「/ 上限 requests」；进度条（≥ 80% 提醒色，用尽错误色）；一行说明：计量周期、每月 1 日按纽约时间重置、API 与 MCP 共用额度；用尽时追加提示条 |
| API key                    | 显示前缀 `maps_…` 和创建日期。没有 Key 时显示 Generate API key（primary）；已有 Key 时显示 Replace API key（secondary），点击后先弹确认。新明文只显示一次（警示条 + Copy），离开视图就清除                                                     |
| Connection addresses       | API base URL 和 MCP URL，各带复制按钮；视图容器 > 720 时两列并排。没有 MCP 地址时显示不可用说明。下方通栏是 curl 快速上手：标题、一句提示（把占位换成完整 Key），以及恒暗代码窗里的一条 Search 请求（POST + JSON 请求体，地址为连接信息里的 API base URL 加 `/search`，请求体同 API 产品页样例）。Bearer 位置只放 Key 前缀加省略号（新 Key 明文显示期间也一样），没有 Key 时为 `YOUR_API_KEY`。静态示例，不发请求，不带复制按钮；原型未包含此示例 |
| Connected apps             | 每个授权一行：redirect host 为主信息；应用自报的名称为次要信息，并明确标注是自报；然后是连接时间和最后刷新时间（ET）；最后是 Disconnect（先确认，行淡出，焦点回到区块标题）。服务端分页，每页 20 个，按连接时间倒序；超过一页时显示 Page x of y 和翻页按钮。断开后重新拉取当前页；如果当前页被清空，回退到最后一页 |

- **合卡的分区状态**：卡头和卡身各自加载、各自失败，互不影响。
  - 订阅读取失败：只有卡头变成 Temporarily unavailable 提示条（不会显示为 Free），刷新按钮保留；卡身照常显示用量。
  - 用量加载中：只有卡身显示骨架。用量首次读取失败：只有卡身换成错误提示条加 Retry。刷新失败：保留上次的数值，只在下方补一行错误说明。
  - 刷新按钮只重新拉取用量；请求期间图标转圈，卡身降低不透明度。
- **栅格**：视图容器 > 980 时，合卡（1.5fr）与密钥卡（1fr）并排、等高。合卡的用量区连同分隔线贴卡片底部，密钥卡的按钮贴卡片底部，所以无论哪张卡更高，空白都在卡片中部，不在卡片下方；Connection addresses、Connected apps 各占一行。≤ 980 时全部单列，密钥卡的 Key 与按钮排在一行。

### 3.5 Subscriptions

- 三张方案卡：Online Scraper / Browser Extension / API。每张卡有：
  - 产品线图标和产品线名称。
  - Plan：有效订阅显示 `display_name`，否则显示 Free。
  - 有效订阅再列出到期日、自动续费状态和支付渠道（PayPal / ClinkBill）。
- 有效的判定条件是 `status === 'active'` 且 `expires_at` 非空。读取失败时显示 Temporarily unavailable，绝不显示为 Free。
- **Manage subscription**：只在订阅有效且开启自动续费时出现。点击后：
  - 拿到渠道 URL 就跳转。落地时沿用现有的「先同步预开窗口再跳转」，并保留弹窗被拦截时的提示。
  - URL 为 null 时打开渠道内操作指引弹窗（PayPal / ClinkBill 两段步骤，沿用 `cancelGuide.*`）。
  - 失败时在这张卡内显示行内提示。
- **Choose a plan**：跳到 Pricing 对应的产品。Online 卡的按钮是 primary，其余两张是 secondary。现有的 `lib/capabilities.ts` 构建期开关继续保留：开关关闭时按钮变为禁用，并加 Coming soon 徽标。当前两个开关都开着，所以原型没有演示这个状态。
- 三列时卡片等高，操作按钮上下排并占满卡宽；视图容器 ≤ 860 时改为单列，按钮排在一行。

### 3.6 用户卡与账户菜单

- **用户卡**：
  - 上半是头像（没有图片时显示首字母）、姓名、邮箱。
  - 下半是 Online 档位徽章（Free / 套餐名 / Unavailable）和本月 records 额度。
  - 未登录时，这个位置显示 Sign in 按钮；网络不通时显示「无法连接」的说明。
  - 图标栏状态见 §2.1。
- **账户菜单**（APG Menu Button，§3.8）：在用户卡上方左对齐弹出；图标栏时在侧栏右侧弹出，底边与头像对齐。
  - 身份区（头像、姓名、邮箱）在菜单之外，只展示。
  - SUBSCRIPTIONS 三行都是菜单项，每行有图标、产品线和套餐名：
    - 有效订阅：显示续费或到期日，点进 Subscriptions 视图。
    - Free：显示 Upgrade ↗，点进 Pricing 对应产品。
    - 读取失败：显示 Unavailable 警示，该项不可用（`aria-disabled`，可以聚焦，不能激活）。
  - Manage subscriptions。
  - Theme：Light / Dark / System 三个单选菜单项，横排成小分段。点选或按 Space 立即生效，菜单保持打开；按 Enter 生效并关闭。
  - Language：菜单项「Language · English ›」（地球图标 + 标签 + 当前语言 + 箭头），点开后在同一浮层里横向切到语言子面板。
    - 面板顶部是返回按钮和标题 Language。
    - 列出 14 种语言，用本族语名显示。顺序和名称与站点头部的语言切换器一致，都取自 `website/src/i18n/ui.ts` 的 `locales` / `localeNames`。
    - 当前语言用 `--primary-soft` 底、`--primary-text` 字和勾标出，与头部 `.pop-item[aria-checked=true]` 一致。
    - 列表超出浮层可用高度时，在面板内滚动，头部固定。
    - 选中后关闭菜单。落地时跳到对应语言前缀下的同一视图；原型只弹出说明 toast。
  - Log out。

### 3.7 弹窗、浮层与 toast

- **确认弹窗**：用于替换 Key 和断开应用。包含标题、说明、Cancel 和确认按钮；确认按钮的文案随操作变化。
- **渠道指引弹窗**：见 §3.5。
- **登录弹窗**：就是全站登录弹窗（Google / 邮箱验证码）。原型里放了一份副本，只用来演示未登录态，文案以站点现有的 `account.auth.*` 为准。
- **浮层**：下列几处都是同一个浮层组件，见 §3.8。
  - 账户菜单。
  - History 的时间范围菜单与 Filters 菜单。
  - 每页条数 listbox。
  - 地区的国家 combobox，州 / 城市多选浮层。
- **Toast**：
  - 在右下角堆叠，最多同时 3 条，4.2 秒后自动消失。
  - 有成功、错误、说明三种。
  - 用于：提交成功、任务结束、复制成功、复制失败。

### 3.8 浮层基础组件（menu / listbox / combobox）

整个 Dashboard 只有一套浮层 `.pop`。三种交互模式共用定位、碰撞翻转、关闭与焦点规则，动效只用 T2。原型实现在 `dashboard.js` §0b（`Pop`）和 `dashboard.css` §3b，原型里已经没有原生 `<select>`。

| 实例 | 模式 | 触发器 | 方向 / 对齐 | 选中后 |
| --- | --- | --- | --- | --- |
| 账户菜单 | menu，含语言子菜单 | 用户卡按钮 | 上方，左对齐；图标栏时在侧栏右侧 | 链接项跳转并关闭；主题单选保持打开；选语言后关闭 |
| History 时间范围 | menu，含日期子面板 | 时间范围按钮 | 下方，右对齐 | 预设项选中即关闭；Apply 后关闭 |
| History Filters（视图容器 ≤ 680） | menu（两组单选），含日期子面板 | Filters 按钮 | 下方，右对齐 | 单选保持打开；Clear filters、Apply 后关闭 |
| Rows per page | listbox | `.select-btn` | 下方，右对齐 | 选中即关闭 |
| 国家 | combobox（持有值） | 输入框 + 箭头按钮 | 下方，左对齐，宽度跟随输入框（至少 220px） | 选中即关闭；失焦时完全相同才生效 |
| 州或地区、城市 | 多选（dialog + 复选框） | 摘要按钮 | 下方，左对齐，宽度跟随按钮（至少 280px） | 勾选保持打开；Esc 或点外部关闭 |

**共用规则**

- **渲染**：`popover="manual"`，进入顶层，不会被侧栏滚动区或卡片裁剪。同一时间只开一个。
- **定位**：按触发器的矩形计算。
  - 与触发器的间距 8px（combobox 为 4px）。
  - 与视口边缘至少 16px，左右夹在视口内。
- **碰撞翻转**：方向只在打开时决定。首选一侧放不下浮层的自然高度、而另一侧空间更大时，翻到另一侧，例如分页条或输入框靠近视口底部时向上弹出。之后页面滚动只更新坐标，不来回翻转。
- **高度**：
  - 最大高度取所在一侧的剩余空间（`--pop-max`）。
  - 列表型浮层（listbox / combobox）另有上限：约 8 项（`--pop-cap` 336px）。
  - 超出时在面板内滚动，子面板的头部固定。
- **关闭**：
  - 关闭时机：点击外部、焦点移出、Esc（子面板里先返回上一层）、窗口宽度变化、切换视图、收起侧栏。
  - 从浮层内关闭时，焦点回到触发器；点击外部关闭时，焦点跟随点击位置。
- **子面板**：
  - 带 `aria-haspopup` 和 `›` 的菜单项，点开后在同一浮层内横向切换：新面板从右侧滑入，旧面板向左淡出，容器高度同步过渡。
  - 面板头是返回按钮 + 标题。
  - 每次打开浮层都从根面板开始。
- **动效**（§5）：
  - 浮层进出：opacity + 6px 位移 + scale 0.98。
  - 子面板切换与高度变化。
  - 下拉箭头展开时翻转 180°。
  - 以上都用 `--dur-3`；条目 hover 的颜色变化是 T1。
  - 减弱动效时全部直接切换。
- **条目**：
  - 行高 36px，hover 用 `--surface-2`。
  - 当前值用 `--primary-soft` 底、`--primary-text` 字加勾，与站点头部语言切换的选中态一致。
  - 键盘位置统一用 `--ring` 焦点环，无论是真实焦点还是 combobox 的 activedescendant。
  - 不可用的项变灰，可以聚焦，不能激活。

**键盘**（按 WAI-ARIA APG）

menu：

- 触发器：Enter / Space / ↓ 打开并聚焦首项，时间范围菜单聚焦当前项；↑ 打开并聚焦末项。
- 移动：↑↓ 循环移动，Home / End 到首尾；横排的主题单选组内用 ←→ 移动。
- 子菜单：→ 或 Enter 打开子菜单，聚焦其中的当前项或首项。← 或 Esc 回到上一层，焦点回到对应的菜单项；在根层按 Esc 关闭。
- 激活：Enter 激活并关闭。Space 也激活；多组菜单里的单选项按 Space 时菜单保持打开。
- Tab：关闭菜单，焦点从触发器继续。
- 日期子面板是表单：Tab 在返回按钮、两个日期和 Apply 之间移动，越过首尾时关闭菜单。

listbox：

- 触发器：Enter / Space / ↓ / ↑ 打开并聚焦当前选项。
- 浮层内：↑↓ 移动（不循环），Home / End 到首尾；Enter / Space 选中并关闭；Esc 或 Tab 关闭。

combobox：

- 打开：输入即过滤并展开；国家、州按 ↓ / ↑ / Alt+↓ 或点击输入框展开完整列表，并标出当前值；城市至少输入两个字母才展开。箭头按钮不在 Tab 序列里，点击时展开或收起。
- 浮层内：焦点始终在输入框。↑↓ 循环移动 activedescendant，Enter 选中，Esc 收起并恢复原值，Alt+↑ 收起。
- 失焦：按完全相同的规则提交，否则恢复原值。

**ARIA**

- **menu**：
  - 触发器带 `aria-haspopup="menu"`、`aria-expanded` 和 `aria-controls`。
  - 菜单是 `role="menu"`，条目是 `menuitem` 或 `menuitemradio`（`aria-checked`）。同组单选包在带 `aria-label` 的 `role="group"` 里，分隔线是 `role="separator"`。
  - 条目 `tabindex="-1"`，焦点真实移动。
  - 子菜单入口带 `aria-haspopup`（语言子菜单为 `"menu"`；日期子面板是表单，用 `"dialog"`）、`aria-expanded` 和 `aria-controls`。子菜单用面板标题作 `aria-labelledby`。
  - 账户菜单的身份区在 `role="menu"` 之外。
- **listbox**：
  - 触发器带 `aria-haspopup="listbox"`、`aria-expanded` 和 `aria-controls`。它的可访问名称是「标签 + 当前值」：`aria-labelledby` 同时指向标签和按钮自身。
  - 选项是 `role="option"`，带 `aria-selected`，焦点真实移动。
- **combobox**：
  - 输入框带 `role="combobox"`、`aria-autocomplete="list"`、`aria-expanded`、`aria-controls` 和 `aria-activedescendant`。
  - 列表是 `role="listbox"`。活动项带 `aria-selected="true"`，当前值另外用勾标出。
  - 没有匹配时，显示一个 `aria-disabled` 的「No matches」项。
  - 箭头按钮 `tabindex="-1"`，`aria-label` 为字段名，同步 `aria-expanded`。

**落地**：

- 无框架的 `scripts/site/pop.ts` 负责定位、翻转、开关、外部关闭与焦点归还；`pop-menu.ts` 负责菜单键盘与子面板切换。
- Vue 的 Menu、Listbox、Combobox 消费共享运行时；营销页的静态菜单绑定同一菜单运行时。
- Dashboard 内不再使用原生 `<select>`。
- 全站菜单与选择控件采用同一合同，适用范围见 §10.5 和 §13.11。

## 4 · 状态清单

每个视图在 DOM 里分成 `skeleton` / `gate` / `content` 三层，由全局状态决定显示哪一层。

| 状态                   | 触发                                    | 外壳                                       | 主区                                                                                                                                                                                                          |
| ---------------------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 首屏加载               | 进入或刷新页面，会话正在恢复            | 导航可用；用户卡显示骨架                   | 当前视图的骨架，尺寸与真实布局一致；读屏播报「Loading your workspace...」                                                                                                                                      |
| 会话就绪、数据加载中   | auth/me 返回                            | 用户卡出现；额度等 options 返回后补上      | 各区块显示自己的骨架，数据到达后各自淡入（只淡入，不位移）                                                                                                                                                     |
| 未登录                 | 会话请求返回 401                        | 用户卡位置显示 Sign in                     | 门槛卡：按视图给出登录提示和 Sign in，点击打开全站登录弹窗                                                                                                                                                     |
| 网络失败               | 会话请求失败                            | 用户卡位置显示「无法连接」说明             | 门槛卡：「Could not reach MapsGrab right now.」+ Retry                                                                                                                                                        |
| 空态                   | 没有任务 / 没有 Key / 没有已连接应用    | —                                          | Recent tasks 显示紧凑空态；History 隐藏工具栏，显示 No exports yet 与 Go to Online Scraper；没有 Key 时 Generate API key 为 primary；No apps are connected.                                                       |
| 无匹配结果             | History 有筛选但结果为 0                | —                                          | 工具栏保留，列表区显示 No matching tasks 与 Clear filters                                                                                                                                                      |
| 局部失败               | 任一接口失败                            | —                                          | 在出错的区块内就地提示，并给 Retry；重试时按钮转圈，已加载的内容保留不清空。覆盖：options、最近任务、History 列表、详情、下载、轮询、提交、API 访问信息、API 用量、授权列表、生成 Key、断开应用、管理链接、地区数据 |
| 额度                   | 正常 / 达到 80% / 用尽                  | 用户卡的细进度条与图标栏的额度环同步变色   | 组合区额度条变色；用尽时显示提示条并禁止提交                                                                                                                                                                   |
| 订阅组合               | none / online / multi / unavailable     | 徽章显示 Free / 套餐名 / Unavailable       | 订阅卡、API 合卡卡头、联系方式开关、关键词上限随之变化                                                                                                                                                         |
| 任务状态               | queued → collecting → publishing → 终态 | —                                          | 终态有 completed / partial / failed；零结果也是 completed。错误码 31301–31304 映射为现有的说明文案                                                                                                             |
| 侧栏                   | 展开 / 收起（宽屏）；抽屉（窄屏）       | 见 §2.1                                    | 布局不变，只变宽，见 §2.2                                                                                                                                                                                      |

## 5 · 动效规范

只用 T1（`--dur-1` / `--dur-2`）和 T2（`--dur-3`），缓动只用 `--ease-out` 和 `--ease-spring`。不使用 `data-reveal`、`data-split`、`data-count` 这类 T3 声明式动效，也没有常驻循环。一次性动画都用 `backwards` 填充，结束后不残留 `transform`。

| 效果                       | 属性                                                                                      | 时长                                     | 缓动                    |
| -------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| 视图切换（只有主区动）     | opacity 0→1 + translateY 8px→0（`.dash-view.is-entering`）                                | `--dur-3`                                | `--ease-out`            |
| 骨架换成内容、局部区块显现 | opacity（`[data-part].is-revealed`；History 翻页后的列表同样只淡入）                      | `--dur-2`                                | `--ease-out`            |
| 顶栏标题与操作替换         | opacity                                                                                   | `--dur-2`                                | `--ease-out`            |
| 侧栏收起 / 展开            | `--side-cur`：侧栏宽与主区左缘同帧；品牌行内边距与间距                                    | `--dur-3`                                | `--ease-out`            |
| 侧栏文字、品牌、套餐区     | opacity；收起时直接淡出，展开时延后 `--dur-1` 再淡入；套餐区高度 grid-template-rows 1fr↔0fr | `--dur-2`（高度 `--dur-3`）               | `--ease-out`            |
| 图标栏提示                 | opacity                                                                                   | `--dur-2`                                | `--ease-out`            |
| 侧栏选中滑块               | transform；首次定位不做动画                                                               | `--dur-3`                                | `--ease-out`            |
| hover、按下、选中的颜色变化 | color / background-color / border-color                                                   | `--dur-2`                                | `--ease-out`            |
| 浮层（`.pop`）进出         | opacity + 6px 位移 + scale 0.98（`@starting-style`）；向上弹出时位移反向，图标栏右侧弹出时为横向 | `--dur-3`                                | `--ease-out`            |
| 浮层子面板切换             | 新面板 translateX 100%→0，旧面板 translateX 0→−30% + opacity 1→0；容器 height 由 JS 测量起止（WAAPI） | `--dur-3`                                | `--ease-out`            |
| 下拉箭头                   | transform rotate 0→180°（触发器 `aria-expanded="true"` 时）                               | `--dur-3`                                | `--ease-out`            |
| 抽屉（< 960px）            | 侧栏 translateX −100%→0，遮罩 opacity                                                     | `--dur-3`                                | `--ease-out`            |
| 弹窗                       | 共享的 `dialog.modal`：opacity + 位移与缩放；遮罩 opacity                                 | `--dur-3`                                | `--ease-out`            |
| 分段 tab / 状态筛选滑块    | transform + width                                                                         | `--dur-3`                                | `--ease-out`            |
| 组合区切换模式             | height（由 JS 测量起止高度）+ 新面板 opacity                                              | `--dur-3`                                | `--ease-out`            |
| 地图选点落针               | opacity + translateY −10px + scale 0.85→1                                                 | `--dur-3`                                | `--ease-spring`         |
| 地图网格点重绘             | opacity                                                                                   | `--dur-2`                                | `--ease-out`            |
| 生成查询后的最终查询框     | 背景从 `--primary-soft` 褪回                                                              | `--dur-3`                                | `--ease-out`            |
| 新任务插入                 | opacity + translateY −8px→0；`--primary-soft` 底色保持 1.6 秒后褪回                       | `--dur-3`                                | `--ease-out`            |
| 任务行展开 / 收起          | grid-template-rows 0fr↔1fr；caret 旋转 90°                                                | `--dur-3`                                | `--ease-out`            |
| 进度条 / 额度条 / 额度环数值变化 | width / stroke-dashoffset（JS 从旧值过渡到新值）                                   | `--dur-3`                                | `--ease-out`            |
| 状态徽标变化               | opacity                                                                                   | `--dur-2`                                | `--ease-out`            |
| 开关                       | 轨道底色；滑块 transform                                                                  | `--dur-2`                                | `--ease-out`            |
| 断开应用的行离场           | opacity，之后移除该行                                                                     | `--dur-2`                                | `--ease-out`            |
| Toast 进出                 | 共享的 `toast-in` / `toast-out`                                                           | 进 `--dur-3` / 出 `--dur-2`（见 §10.4）  | `--ease-out`            |
| 加载中的旋转图标与骨架扫光 | 共享的 `.spinner`，以及刷新图标、`.skel` 扫光（transform）                               | 0.8s 循环，与共享 `.spinner` 一致；只在请求进行中运行 | `linear`（匀速连续动画） |

**减弱动效时的终态**：沿用 `motion.css` 的全局规则，所有动画和过渡直接呈现终态；JS 里依赖动画时长的等待（行离场、高度测量）、浮层子面板的 WAAPI 切换和平滑滚动也跳过。侧栏收放时只有起止两个状态，没有中间帧。`?motion=reduced` 用 `html.force-reduced` 复刻了同一组规则，方便评审。

## 6 · 响应式断点

外壳按视口宽度切换，视图内部按视图容器宽度（`container: view / inline-size`）切换。静止时容器宽度为视口减去当前侧栏宽和两侧 `--main-pad`，上限 1360px；经典滚动条再减去它的宽度。侧栏宽度动画中按起始布局计算，结束后一次切到目标布局（§2.2）；减弱动效直接呈现终态。

| 断点     | 依据     | 变化                                                                                                                                                                                         |
| -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 960px  | 视口     | 侧栏常驻，可以收起为图标栏（§2.1）                                                                                                                                                           |
| < 960px  | 视口     | 侧栏变成抽屉（从左侧滑入，加 `--overlay` 遮罩；按 Esc、点遮罩或导航后关闭；打开期间主区设为 `inert`）。顶栏高 56px，带菜单按钮；收起状态不生效                                                |
| ≥ 1280 / 641–1279 / ≤ 640px | 视口 | 主区左右内边距 32 / 24 / 16px                                                                                                                                                              |
| ≤ 1080px | 视图容器 | History 工具栏排成两行；任务明细元信息三列                                                                                                                                                   |
| ≤ 980px  | 视图容器 | 任务列表收紧列宽：各列最小宽之和恰好 680，与下一档衔接。API 栅格单列                                                                                                                          |
| ≤ 860px  | 视图容器 | 地图模式和地区模式由左右分栏改为上下排列；订阅卡改为单列                                                                                                                                     |
| ≤ 760px  | 视图容器 | 组合区底栏排成两行                                                                                                                                                                           |
| ≤ 720px  | 视图容器 | 连接地址上下排列                                                                                                                                                                             |
| ≤ 680px  | 视图容器 | 任务列表变成卡片：第一行任务名 + 状态，然后是错误说明，再一行进度 + 记录数，最后一行是整行宽的操作按钮。详情的元信息排成两列，每个搜索的结果折成两行一项。History 工具栏折成「搜索 + Filters + 刷新图标」，分页隐藏页码。卡片内边距收紧到 16px |
| ≤ 640px  | 视口     | 顶栏链接只保留图标，自动刷新提示只保留圆点；门槛卡和弹窗的内边距收紧                                                                                                                         |

验收覆盖四个视图、亮暗两套主题，以及宽屏侧栏展开 / 收起和窄屏抽屉；实际运行证据记录在实施验收中。

## 7 · 可访问性

- **地标与跳转**：
  - 页面依次是 skip link（Skip to content）、`aside`（Workspace）、`nav`（Workspace menu）、顶栏 `header`、`main`。
  - 导航项是真实的 `<a href>`。按住修饰键点击时不拦截，可以在新标签页打开。
  - 当前项带 `aria-current="page"`，导航内可以用方向键移动。
- **侧栏收起**：
  - 收起按钮的 `aria-expanded`、`aria-label` 随状态切换，`aria-keyshortcuts` 声明 `[` 与 Meta+B / Control+B。
  - 图标栏里，菜单文字只是视觉上淡出，仍是链接的可访问名称；悬停提示是 `aria-hidden` 的视觉副本，键盘聚焦时同样出现。
  - 收起时被隐藏的可聚焦项（品牌链接、套餐区的 Upgrade）退出 Tab 序列；焦点原本在这里时交给收起按钮。
- **切换视图**：
  - 焦点移到视图的 `h1`（`tabindex="-1"`）。
  - `document.title` 更新为「{视图} · Dashboard | MapsGrab」。
  - 前进 / 后退时恢复各视图自己的滚动位置（`history.scrollRestoration = 'manual'`）。
- **组合区**：
  - 模式 tab 完整实现 `tablist` / `tab` / `tabpanel`，并用 roving tabindex。
  - 国家是 APG 可编辑 combobox（列表自动补全）；州 / 城市多选是 `role="dialog"` 浮层，焦点进过滤框，候选是原生复选框，细则见 §3.8。
  - 计数用 `aria-live` 播报。
- **History**：
  - 工具栏是 `role="search"`；搜索框是 `type="search"` 并带 `aria-label`。
  - 状态筛选是 `radiogroup`，roving tabindex，方向键切换。
  - 时间范围、Filters 是 menu button，每页条数是 listbox button（§3.8）。
  - 分页是 `nav`（Pagination），当前页 `aria-current="page"`，页码按钮的可访问名称是「Page n」；边界按钮用 `aria-disabled`，焦点不丢。
  - 加载时列表带 `aria-busy`。除轮询外的每次加载（进入 History、翻页、改筛选、刷新、重试）完成后，sr-only status 播报结果区间（「21–40 of 62」）、No matching tasks / No exports yet，或失败与刷新失败文案；轮询不播报。
  - 关键词预览的「+n」读作「and n more」；高亮用语义化的 `<mark>`。
- **任务行**：
  - 展开由 caret 按钮负责，带 `aria-expanded` 和 `aria-controls`；收起时详情区域设为 `inert`。
  - 窄屏把详情表格改成网格排版时，用显式的 `role="table"` / `row` / `cell` 保留表格语义。
- **状态不只靠颜色**：
  - 徽标同时有图标和文字。
  - 进度条和额度环都是 `aria-hidden`，旁边或菜单里一定有数字文本。
  - 额度的提醒色和用尽色都配有文字说明。
- **播报**：
  - 全局加载有读屏 status。
  - toast 区域是 `aria-live="polite"`。
  - 行内错误用 `role="alert"`。
  - 正在请求的按钮带 `aria-busy` 并转圈，按钮文字保留。
  - 落地时，局部骨架保持 `aria-hidden`，同时用现有的 `*.loading` 文案作为 sr-only status（见 §11）。
- **浮层**：
  - 弹窗用原生 `<dialog>` 模态，焦点限制在弹窗内，Esc 或点遮罩关闭。
  - 菜单、listbox、combobox 按 APG 的对应模式实现（§3.8）。从浮层内关闭时，焦点回到触发器。
  - 抽屉打开时焦点进入抽屉，主区设为 `inert`。
- **其他**：
  - 焦点环统一用共享的 `:focus-visible` 和 `--ring`。
  - `d-label` 字号 10.5px，正好是 `--text-3` 允许的最小字号。
  - 调试面板标注了 `lang="zh-CN"`。

## 8 · 与现有实现的差异

| 方面       | 现有实现                                                                                                     | 本稿                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 页面结构   | 三个 Astro 页面（带语言前缀的还有三份）各自挂载 `DashboardApp`，切换就整页重载                               | 单入口 SPA：四个视图（新增 History），用 History API 切换，外壳常驻；视图第一次进入后保活，输入、滚动位置和轮询都保留                          |
| 首屏       | 会话恢复期间只显示「Loading your workspace...」，之后内容一次性出现                                          | 先出外壳和与真实布局同尺寸的骨架；会话先到，用户卡先出现；各区块的数据各自到达、各自淡入                                                    |
| 侧栏       | 不固定在视口，高度随主区增长，底部账户区经常被推出屏幕；不能收起                                             | fixed、100dvh，导航区自身滚动，用户卡固定在底部；宽屏可以收起为 72px 图标栏，状态持久化，带快捷键                                          |
| 主区宽度   | 侧栏和主区一起放在居中的 `min(1200px, 100vw − 32px)` 容器里，宽屏两侧大块留白，内容区不随屏宽增长           | 侧栏贴视口左缘；内容贴侧栏、填满可用宽度，只在超宽屏限宽且靠左                                                                               |
| 账户区     | 头像、姓名、邮箱；菜单里只有 Log out                                                                         | 用户卡增加 Online 档位和本月额度；菜单列出三条产品线订阅，以及订阅管理、主题、语言、退出                                                     |
| 新建任务   | 额度、重置说明、计数都是纯文字；模式切换是按钮组；联系方式是原生 checkbox                                    | 分段 tab，切换时高度过渡；计数放在输入框角落并提示去重；额度进度条带阈值色；地图模式显示网格点和覆盖圈；额度用尽时给 Upgrade 入口           |
| 任务列表   | 和新建任务在同一页；7 列表格：完整任务号、创建时间、Samples、Processed、Records、状态、操作；只有上一页 / 下一页 | Online 只留最近 5 条；完整列表移到 History，带搜索、状态与时间筛选、页码和每页条数，条件写进 URL。5 列：关键词预览与时间、任务号合为一列；Samples 与 Processed 合并为带进度条的 Searches 列；错误说明并入状态列；窄屏变成卡片 |
| 任务详情   | 单独插入一行表格，加载时显示文字                                                                             | 在行内展开（0fr→1fr），第一次展开时才拉取；元信息可复制任务号；每个搜索的记录数带行内小条；加载时显示骨架                                    |
| 进度反馈   | 有运行中的任务时每 5 秒重载当前页，界面上没有任何提示                                                        | 轮询方式不变；顶栏显示「Auto-refresh on」；任务结束时弹 toast（在任何视图都能收到）并刷新额度；刷新失败时保留旧数据并提示                   |
| API 管理   | 卡片纵向堆叠；用量与套餐是两张卡；生成 / 替换按钮始终是 primary                                              | 套餐与用量合为一张卡，分区加载、分区失败；面板栅格不留空洞；没有 Key 时 Generate 是 primary，已有 Key 时 Replace 降为 secondary；新明文离开视图即清除；分页保留 |
| 订阅       | 三张卡；管理失败时在网格下方统一报错，借用 `loadFailed` 文案                                                 | 三张卡增加产品图标、自动续费状态和支付渠道；管理失败时在对应的卡片内报错，使用新增的 `manageFailed` 文案                                    |
| 加载与失败 | 各视图显示「Loading…」文字；失败时整块内容被替换                                                             | 骨架 + 读屏文本；失败时在出错的区块就地提示并可重试，已加载的内容不清空                                                                      |

## 9 · 落地建议

### 路由：单入口，不引入新依赖

- **路由文件**：每种语言各用一个 catch-all 路由，`src/pages/dashboard/[...view].astro` 和 `src/pages/[lang]/dashboard/[...view].astro`，替换现在的 3 × 2 个页面文件。
  - `getStaticPaths` 产出 `view ∈ {undefined, 'history', 'api', 'subscriptions'}`（`[lang]` 版本再乘上语言），把 `initialView` 传给同一个 `DashboardApp`。
  - 这样四个地址都能直接访问，构建产物仍是静态 HTML。History 的查询条件只在 query string 里，不产生新的静态路径。
- **挂载**：继续用 `client:load`。Astro 会在构建期把外壳和骨架渲染进 HTML，首帧就是「外壳 + 骨架」。水合以后恢复会话，再用同尺寸的内容替换骨架，界面不会跳动。
- **侧栏首帧**：Dashboard 页面的 `<head>` 内联一段与 `theme-boot` 同类的脚本，读 `localStorage['mg-dash-side']` 写 `html[data-side]`，保证收起状态下首帧就是图标栏。
- **客户端路由**：写一个 `useDashboardRoute` composable，不需要 vue-router：
  - `view` 是一个 ref，从 `location.pathname` 去掉语言前缀后解析。
  - 拦截站内链接的点击（排除修饰键、`target`、外部链接），用 `pushState` 切换；监听 `popstate` 处理前进后退。
  - History 的查询条件解析自 `location.search` 并校验（非法值回到默认）；改筛选、翻页用 `replaceState`。
  - 自己按视图保存滚动位置（`scrollRestoration = 'manual'`），切换后聚焦 `h1`，并更新 `document.title`。
- **视图保活**：视图第一次激活时挂载并拉取数据，之后用 `v-show` 保活，等价于原型的「四视图常驻」。这样切回来时输入不丢，最近任务的轮询也不中断。

### 组件拆分

| 组件                                               | 职责                                                                                                     | 来源                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `DashboardApp.vue`                                 | 会话恢复（auth/me）、全局状态、路由、视图保活、toast 宿主、确认弹窗                                      | 改造现有                                                          |
| `DashboardSideNav.vue`                             | 品牌与收起按钮、导航和选中滑块、图标栏提示、快捷键、抽屉、用户卡插槽                                     | 改造现有                                                          |
| `DashboardUserCard.vue` / `DashboardAccountMenu.vue` | 用户卡（徽章 + 额度，图标栏下的头像 + 额度环）；账户菜单（订阅、主题、语言子菜单、退出），基于共享 Menu | 新增 / 改造现有                                                   |
| `OnlineComposer.vue`                               | 模式 tab、关键词输入、底栏（开关、额度、提交）、错误与消息                                               | 从 `HistoryView.vue` 拆出                                         |
| `OnlineMapInput.vue` / `OnlineRegionInput.vue`     | 地图模式、地区模式                                                                                       | 沿用现有，按本稿改样式和交互（地区的国家、州、城市三个原生 select 改为 combobox） |
| `RecentJobs.vue`                                   | Online 的最近 5 条、View all、轮询                                                                       | 新增                                                              |
| `JobHistory.vue` + `HistoryToolbar.vue` + `JobPager.vue` | History：查询状态与 URL 同步、列表区骨架与空态、轮询；工具栏与时间范围 / Filters 菜单；分页条与每页条数 listbox | 从 `HistoryView.vue` 拆出 / 新增                                  |
| `JobRow.vue` + `JobDetail.vue`                     | 任务行（含紧凑变体）、详情、下载                                                                         | 从 `HistoryView.vue` 拆出                                         |
| `ApiView.vue` + `ApiPlanCard.vue`                  | 四个面板；合卡的卡头与用量分区；断开应用、分页                                                           | 改造现有                                                          |
| `SubscriptionsView.vue` + `CancelGuideDialog.vue`  | 方案卡、渠道管理、指引弹窗                                                                               | 改造现有                                                          |
| 浮层基础组件                                       | `pop` 模块（定位、翻转、开关、外部关闭、焦点归还、子面板）+ `PopMenu` / `PopListbox` / `PopCombobox`（§3.8） | 新增                                                              |
| 共享小件                                           | `QuotaMeter`（数字 + 进度条 + 阈值）、`StatusBadge`、`ConfirmDialog`                                     | 新增，或直接用 §10 的共享 CSS 类加模板片段                        |

`scripts/dashboard/api.ts`（列表请求补 History 的查询参数，见 §12）、`map-grid.ts`、`region-data.ts` 保留。

### 数据与时序

- 会话（auth/me）到达后立即渲染用户卡和订阅信息；Online 额度来自 options，用户卡里的额度晚到一点，期间显示骨架。
- 最近任务与 History 共用一份「正在观察的任务」：轮询结果按任务号去重，同一个任务结束只提示一次、只刷新一次额度。
- 最近任务的轮询沿用现在的 5 秒「有运行中任务才继续」，视图不可见时也继续，这样别的视图也能收到完成 toast；History 只在自己是当前视图时轮询。是否在页面后台时暂停，见 §13。
- 轮询和手动刷新都按任务号做增量更新，不重建整个列表，所以已展开的详情和焦点都不丢（原型的 `syncRows` 就是按 key 更新的）。
- History 请求带序号，过期的响应直接丢弃；连续改筛选时只渲染最后一次的结果。

### 其他

- **Pricing 链接**：原型链接到设计稿的 `pricing.html#online` 这类锚点。落地沿用现有的 `/pricing/?product_kind=maps_online` 合同。
- **原型专用样式**：`dashboard.css` §1 落地时删除（见 §10.4）。
- **组合区动画**：组合区自己的模式切换淡入与共享的 tabpanel `fade-up` 只能保留一个。原型关掉了共享规则，因为高度过渡需要由组合区自己控制。

## 10 · 需回写 Atlas 合同的 token / 组件清单

### 10.1 Token

| token          | 值        | 用途                                                                                         | 建议位置                         |
| -------------- | --------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| `--switch-knob` | `#ffffff` | 开关滑块。design-website.md §1 要求「两种主题下都是白色的元素」收成 token                   | 全局 `tokens.css`                |
| `--z-drawer`   | `80`      | 窄屏抽屉的层级：高于 `--z-nav`（50），低于 `--z-modal`（100）                                | 全局 `tokens.css`                |
| `--side-w`     | `248px`   | Dashboard 侧栏展开宽                                                                         | Dashboard 样式作用域（`.dash-app`） |
| `--side-w-rail` | `72px`   | Dashboard 侧栏收起（图标栏）宽：40px 图标位 + 两侧 16px                                     | Dashboard 样式作用域             |
| `--topbar-h`   | `64px`    | Dashboard 顶栏高，与侧栏品牌行同高；< 960px 时为 56px                                       | Dashboard 样式作用域             |
| `--main-pad`   | `32px` / `24px` / `16px` | 主区左右内边距：视口 ≥ 1280 / 641–1279 / ≤ 640；不随侧栏收起变化                | Dashboard 样式作用域             |
| `--main-max`   | `calc(var(--container-wide) + 2 * var(--main-pad))` | 主区内容上限，只在超宽屏生效，生效后靠左                              | Dashboard 样式作用域             |

下列是 Dashboard 内部的状态变量，不是 token，不回写：`--side-cur`（`@property` 注册的当前侧栏宽，T2 过渡）、`--side-target`（目标宽）、`--lock`（多行文字的锁定行宽，§2.2）、`--map-w`（展开态地图列宽）。额度环与 `.meter` 一样用 `--v` 传比例。

### 10.2 组件：建议进共享 components.css（基础层）

| 组件                                                                             | 说明                                                                                                                  |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `.meter`、`.meter--thin`、`[data-level=warn\|bad]`                               | 数值进度条：填充 `--primary`，提醒 `--warn`，用尽 `--bad`；宽度用 `--v` 控制                                          |
| `.switch`                                                                        | 开关（原生 checkbox 加样式），滑块用 `--switch-knob`                                                                  |
| `.callout` 及 `--info` / `--warn` / `--bad`                                      | 区块内提示条：图标 + 文字 + 可选操作                                                                                  |
| `.badge--bad`                                                                    | 失败徽标，补齐 `--ok` / `--warn` 之外的一档                                                                           |
| `.btn-xs`、`.seg--sm`、`.input--sm`、`.input--mono`、`.icon-btn--sm`             | 密集界面用的小尺寸                                                                                                    |
| `.spinner--xs` / `--sm`                                                          | 放在按钮和徽标里的小号转圈                                                                                            |
| `.copy-field` / `.copy-value`                                                    | 可复制的等宽值（Key、URL）                                                                                            |
| `.skel--circle` / `--pill` / `--block` / `--on-bg`、`.skel-stack`                | 骨架变体。`--on-bg` 用于放在 `--bg-2` 页面底色上的骨架（默认骨架色和页面底色太接近）                                   |
| `.empty`（含 `--compact`）、`.gate`、`.fail`                                     | 空态、门槛（未登录 / 无法连接）、区块失败三种状态面板。登录和支付回调页也能用                                         |
| `.pop`（含列表型 `.pop--list`）、`.pop-panels` / `.pop-panel`、`.pop-head` / `.pop-title`、`.pop-body` | 共享浮层（§3.8）：顶层渲染；方向（`data-side`）和可用高度（`--pop-max` / `--pop-cap`）由脚本给出；子面板和固定的面板头。需要连同 §3.8 的脚本模块一起回写 |
| `.pop-item`（`-label` / `-sub` / `-end`、`.pop-check`）、`.pop-label`、`.pop-sep`、`.pop-empty` | 菜单项与选项：行高 36px；当前值用 `--primary-soft` 加勾；键盘位置统一用焦点环。另有分组标签、分隔线和无匹配提示 |
| `.pop-form` / `.pop-dates` / `.pop-foot`                                         | 子面板里的小表单（自定义日期）                                                                                        |
| `.select-btn` + `.pop-caret`、`.combo-field` + `.combo-toggle`                   | listbox 的触发按钮；combobox 的输入框与箭头按钮。展开时箭头翻转                                                       |
| `.mini-seg`                                                                      | 菜单内的小分段控件（主题）                                                                                            |
| `.pager`、`.page-btn`、`.page-gap`、`.pager-size`                                | 分页条：区间、页码（固定 7 格）、每页条数                                                                             |
| `.count-badge`                                                                   | 按钮上的小计数                                                                                                        |
| `mark.hl`                                                                        | 搜索命中高亮                                                                                                          |
| `.dlg`（确认）、`.guide`（步骤）                                                 | 弹窗内的两种版式                                                                                                      |

以下属于 Dashboard 自身，留在 Dashboard 的样式里：外壳（`.dash-side` / `.dash-topbar` / 抽屉 / 图标栏与 `.side-tip`）、用户卡与 `.avatar-ring`、账户菜单的身份区与订阅行（`.menu-id` / `.menu-sub` / `.menu-row`）、组合区、任务列表、History 工具栏（`.hist-bar`）、API 栅格、方案卡。

### 10.3 图标

需要把 `i-logout`、`i-monitor`、`i-alert`、`i-selector`、`i-history`（History 菜单）、`i-sidebar`（收起按钮）、`i-chevron-left`（浮层子面板的返回按钮）并入 `icons.svg`。它们沿用 24px 网格和 1.75 描边，原型里暂时以内联 sprite 的形式放在 `index.html` 顶部。

### 10.4 现有共享样式与合同的冲突（需要决定）

落地版 `website/src/styles/components.css` 中有两处全局规则，与「Dashboard 只用基础层、只用 T1 / T2」冲突。原型在 `dashboard.css` §1 里覆盖了这两处，落地时要从根上处理：

1. **弹窗遮罩模糊**：`dialog.modal::backdrop` 全局使用 `backdrop-filter: blur(6px)`，而 design-website.md §2 把「弹窗遮罩」列为营销表达层的玻璃效果。弹窗在 top layer，没法按祖先元素限定作用域，只有两个选择：
   - 修改合同，把弹窗遮罩模糊归入基础层（**推荐**，少一个概念）；
   - 由 Layout 给营销页加页面级标记，再把模糊限定在这些页面。
   原型目前按合同原文实现，没有模糊。
2. **Toast 时长**：`.toast` 入场用 `toast-in 0.5s`，超出了 T2。建议把共享规则改成进场 `--dur-3`、离场 `--dur-2`，营销页也一并统一。

其余几项落地版已经满足，§1 里对应的覆盖直接删除即可：主按钮辉光已收进营销作用域；分段滑块已是 T2；`.toast--error` 已存在。

### 10.5 design-website.md 需要补充的内容

- **§4 动效**：补一句「Dashboard 视图切换：主区内容用 T2 淡入加 8px 上移，外壳不动；骨架换成内容时只淡入；侧栏收放用 T2，主区布局不变、文字不逐帧重排」。完整清单链接到本文 §5。
- **§5 组件差异**：补上 10.2 列出的共享组件和用法约束：
  - 进度条阈值色必须配数字文本。
  - 每个视图只有一个 primary。在 API 视图里，没有 Key 时 Generate 是 primary，有 Key 后不再有 primary。
- **§5 选择控件与浮层全站统一**（§13.11 已采纳）：
  - 普通选项用 listbox 按钮（`.select-btn`），需要输入过滤时用 combobox（`.combo-field`）；少量短标签用 `.seg` 原生单选，长标签用纵向原生单选组。
  - 菜单、listbox、combobox 共用 `.pop`，定位与焦点归共享运行时，动效只用 T2；ARIA 按 WAI-ARIA APG 的对应模式。
  - 页头 API、语言、主题菜单使用同一菜单运行时，语言和主题为 `menuitemradio`；工具页 DMS 半球与 Bulk 组合顺序使用原生单选组。
- **§4 动效**：T2 一行的用途补上「浮层（菜单、listbox、combobox）的进出与子面板切换」。
- **§0 实现参考**：增加一行，指向本目录 README。

## 11 · i18n 键

键路径相对于 `website/src/i18n/dashboard.ts`（`DashboardContent`）。原型 `dashboard.js` 的 `T` 对象中，已有键与现有值逐字一致；新增键在 `T` 中以「新增」注释标出。

### 新增

| 键                                                                       | 值                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `shell.skipToContent`                                                    | Skip to content                                                                       |
| `shell.sideLabel` / `shell.homeLabel` / `shell.navLabel`                 | Workspace / MapsGrab home / Workspace menu（`aria-label`）                            |
| `shell.navJobHistory`                                                    | History                                                                               |
| `shell.collapseSidebar` / `shell.expandSidebar`                          | Collapse sidebar / Expand sidebar                                                     |
| `shell.back`                                                             | Back（浮层子面板返回按钮的 `aria-label`）                                             |
| `account.upgrade`                                                        | Upgrade                                                                               |
| `account.usageShort`                                                     | {used} / {total} records                                                              |
| `account.planUnavailable`                                                | Unavailable                                                                           |
| `account.theme` / `themeLight` / `themeDark` / `themeSystem`             | Theme / Light / Dark / System                                                         |
| `account.language`                                                       | Language（也可以复用站级的语言标签）                                                  |
| `create.newTask`                                                         | New task                                                                              |
| `create.duplicates`                                                      | Duplicate lines ignored: {count}                                                      |
| `create.submitted`                                                       | Task submitted                                                                        |
| `create.map.points`                                                      | Grid points: {points} · Keywords: {keywords}                                          |
| `history.autoRefresh`                                                    | Auto-refresh on                                                                       |
| `history.refreshFailed`                                                  | Could not refresh. Showing the last loaded results.                                   |
| `history.copyJob`                                                        | Copy job number                                                                       |
| `history.finished` / `history.finishedRecords`                           | Task {job}: {status} / {count} records                                                |
| `history.dedupeHint`                                                     | Records are counted after duplicates are removed across the whole task.               |
| `history.recentTitle` / `history.viewAll`                                | Recent tasks / View all                                                               |
| `history.recentEmptyHint`                                                | Tasks you start above will show up here.                                              |
| `history.emptyCta`                                                       | Go to Online Scraper                                                                  |
| `history.moreKeywordsShort` / `history.moreKeywords`                     | +{count} / and {count} more（后者给读屏）                                             |
| `history.search.label` / `placeholder` / `clear`                         | Search tasks / Search by job number or keyword / Clear search                         |
| `history.filters.label` / `button` / `status` / `all` / `running` / `clear` | Filter tasks / Filters / Status / All / Running / Clear filters                     |
| `history.range.label` / `last7` / `last30` / `all` / `custom`            | Time range / Last 7 days / Last 30 days / All time / Custom range                     |
| `history.range.from` / `to` / `apply`                                    | From / To / Apply                                                                     |
| `history.range.invalid`                                                  | Choose a start date on or before the end date.                                        |
| `history.range.hint`                                                     | Dates use Eastern Time (New York).                                                    |
| `history.noMatchTitle`                                                   | No matching tasks                                                                     |
| `history.noMatchHint`                                                    | Try a different job number or keyword, or clear the filters.                          |
| `history.pagination.label` / `page` / `pageSize`                         | Pagination / Page {page} / Rows per page                                              |
| `api.usageFailed`                                                        | Could not load your API usage. Please try again.                                      |
| `subscriptions.pricingLink`                                              | View pricing                                                                          |
| `subscriptions.paidVia`                                                  | Paid via {method}                                                                     |
| `subscriptions.manageFailed`                                             | Could not open subscription management. Please try again.                             |

`shell.skipToContent`、`shell.sideLabel` / `homeLabel` / `navLabel` 和 `create.newTask` 只写在 `index.html` 的静态标记里，其余 55 个在 `T` 中。合计 60 个，都需要按 14 种语言翻译。

### 改名、用途变化或可删除

| 键                                                                                                                                  | 处理                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `shell.navHistory`                                                                                                                  | 改名为 `shell.navOnline`，值不变（Online Scraper）。原名会和新增的 History 菜单混淆 |
| `history.title`                                                                                                                     | 保留，改作 History 列表的 `aria-label`（Online export history）               |
| `history.description`                                                                                                               | 保留，值不变，作 History 视图的说明                                          |
| `api.usageTitle`、`api.planTitle`                                                                                                   | 保留，改作合卡里两个分区的小标签                                             |
| `create.loading`、`history.loading`、`history.detail.loading`、`api.loading`、`api.grants.loading`、`subscriptions.loading`         | 保留，改作骨架旁边的 sr-only status 文本                                     |
| `create.map.tilesUnavailable`                                                                                                       | 保留。原型没有瓦片，落地后照用                                               |
| `history.columns.processed`                                                                                                         | 删除，已并入 Searches 列                                                     |
| `history.detail.hide`                                                                                                               | 删除。展开按钮只用一个标签 `detail.show`，展开状态由 `aria-expanded` 表达    |
| `create.region.selectCity`、`create.region.addCity`                                                                                 | 删除。城市改为 combobox，选中即加入                                          |
| `create.region.noCity`                                                                                                              | 改名为 `create.region.noMatch`，值改为 No matches。国家、州、城市三个 combobox 共用 |
| `create.region.selectCountry`、`create.region.allStates`                                                                            | 保留，值不变。分别作国家输入框的占位文字；州输入框的占位文字与州列表的首项   |
| `subscriptions.loadFailed`                                                                                                          | 由 `manageFailed` 取代（见 §13）                                             |
| `subscriptions.noExpiry`                                                                                                            | 删除。有效订阅的判定要求 `expires_at` 非空，这条文案永远不会显示             |

## 12 · 落地所需后端改动

History 的搜索与筛选是本稿新画进主流程的能力，原接口不支持，后端已按下表补齐。下列「改动前」是补齐前对照代码核实的状况；接口与存储的最终合同以 [Online Export 接口](../../../feat/014.Maps云端/tech-Online任务与结果.md#历史查询) 为准。

**改动前**（`backend/src/app/api/client/export_client.py`、`services/export_job_service.py`、`models/export_job_model.py`）：

- `GET /api/client/export/jobs` 只有 `offset`（≥ 0）和 `limit`（1–100，默认 20），返回 `jobs`、`total`、`offset`、`limit`；按 `job_id` 倒序。
- 摘要 `_summary` 的字段：`job_no`、`run_no`、`status`、`include_contacts`、`total_count`、`processed_count`、`record_count`、`has_file`、`created_at`、`started_at`、`finished_at`、`error_code`，没有关键词。
- 任务表按用户分 10 张表（`export_jobs_00`–`09`），索引只有主键、`uk(job_no)`、`idx(user_id)`。表上有与 Run 共同提交的 `status`（整数：10 排队 / 20 采集 / 30 发布 / 40 成功 / 50 局部成功 / 60 失败）、`created_at`（毫秒时间戳），以及 `options_json`（`items[]` 里每项有 `keyword`，地图模式另有 `viewport`；每个任务最多 50 项，关键词已做空白归一、每条 ≤ 500 字符）。

**改动**：

| 项 | 内容 |
| --- | --- |
| 新增 query 参数 `q` | 可选，去掉首尾空白后最多 100 字符（与前端输入上限一致），空白不筛选。全是十六进制字符时匹配任务号前缀，同时匹配任一关键词包含 `q`，二者取「或」；不区分大小写。用 SQLAlchemy 的 `startswith` / `contains(..., autoescape=True)` 生成 `LIKE`，与 admin 订单号、邮箱搜索的写法一致 |
| 新增 query 参数 `status` | 可选，可重复的公开状态参数（`status=queued&status=collecting`），取值 `queued`、`collecting`、`publishing`、`completed`、`partial`、`failed`；映射为整数后按任务表的 `status`（与 Run 同事务提交）做 `IN` 过滤，未知值返回参数错误。前端的 Running 传前三个 |
| 新增 query 参数 `created_from_ms` / `created_to_ms` | 可选，毫秒时间戳，条件为 `created_from_ms ≤ created_at < created_to_ms`（左闭右开）；`created_from_ms > created_to_ms` 时返回 `INVALID_REQUEST`，与 admin 订单、用户列表的时间范围校验一致。纽约时间的日界由前端换算（Last 7 days 取今天在内 7 个日历日的起点，自定义范围的结束日取次日零点），服务端只做比较，不在查询里算时区（`spec-mysql.md` §8）。参数名沿用 admin 订单列表的 `created_from_ms` / `created_to_ms` |
| 分页 | 沿用 `offset` / `limit`，`limit` 上限仍是 100，正好覆盖每页 100 条。排序不变 |
| `total` | `count_export_jobs` 加上与列表相同的筛选条件；列表与计数共用同一个过滤 helper（`spec-mysql.md` checklist），分页按筛选后的总数计算 |
| 摘要新增 `keyword_preview` / `keyword_count` | 在 `_summary` 里由 `options_json.items` 推出：`keyword_count` 是不重复关键词数；`keyword_preview` 默认是第一个关键词，带 `q` 时取第一个命中的关键词，列表行据此显示「命中的关键词 +n」。每页最多 100 个任务、每个任务最多 50 项，解析开销可以忽略。详情接口复用 `_summary`，取第一个关键词 |
| 关键词检索的数据来源 | **推荐**：任务表新增 `keywords_text`（`MEDIUMTEXT`：最多 50 个关键词 × 500 字符，utf8mb4 下可能超过 TEXT 的 64KB；不重复关键词以换行连接），创建任务时与 `options_json` 同一次写入；存量数据用一次性回填脚本按 `job_id` 分批补齐 10 张分表。列继承表默认的大小写不敏感排序规则，`keywords_text LIKE '%q%'` 不区分大小写。备选：不加列，直接对 `options_json` 用 JSON 函数匹配，免去迁移和回填，但 JSON 内的字符串按二进制比较，要不区分大小写得先整体转小写，写法更绕。分表模型都继承 `ExportJobModel`，改 model 后跑一次 `sync_database_schema` 即同步 10 张表 |
| 索引 | 不新增。按 `spec-index.md`：所有查询都先经 `user_id` 收窄（已有 `idx(user_id)`），单个用户的任务量小，过滤后再走 `status`、`created_at`、`LIKE` 都是对少量行的扫描；`status` 是低基数列，不建单列索引；`LIKE '%x%'` 用不上 B-tree。若以后出现单用户任务量极大的情况，再按实际查询评估（例如 ngram 全文索引），现在不加 |

前端对应改动：`scripts/dashboard/api.ts` 的列表请求加上这四个参数；摘要类型加上两个新字段。Online 的 Recent tasks 用 `offset=0&limit=5`，不需要新参数。

原型里的筛选在 mock 接口内完成（`fakeApi.listJobs`），语义与上表一致。

## 13 · 建议，待 hydra 裁决

下列各项都没有画进主流程，或者只是可以一键撤回的展示选择。

1. **侧栏动画结束后切换布局（已采纳）**：宽度动画中保持起始布局，结束后一次切到目标宽度对应布局并淡入；减弱动效直接呈现终态，见 §2.2。原型仍使用固定展开态布局，落地以此合同为准。
2. **逐搜索下载**：合同是整任务一个 CSV，最后一列 Search Keyword 已能按搜索筛选。建议维持合同，不在详情里加逐搜索下载。
3. **API 视图的 curl 快速上手（已采纳）**：合同见 §3.4 的 Connection addresses。示例是真实 API base URL 上的一条 Search 请求（POST + JSON 请求体）；Bearer 位置只放 Key 前缀加省略号，没有 Key 时为 `YOUR_API_KEY`；提示说明要换成完整 Key。不涉及新接口；原型未包含此示例。
4. **额度提醒阈值 80%**：现有界面没有阈值色，80% 是本稿提出的，Online 与 API 共用。
5. **显示支付渠道**：订阅卡上的「Paid via PayPal / ClinkBill」来自订阅摘要已有的 `payment_method` 字段。现有界面不显示，需要确认是否展示。
6. **视图保活下的跨视图轮询与完成 toast**：
   - 本稿做法：最近任务在 API、History 或订阅视图里也继续轮询，任务结束时照样弹 toast。另一个选择是离开 Online 视图就停止轮询。
   - 另外建议页面在后台（`document.hidden`）时暂停轮询、回到前台立即刷新一次。现有实现没有这一步。
7. **订阅读取失败时组合区的文案**：目前沿用 `optionsFailed`（Could not load your task limits）。是否针对订阅不可用给出专门文案，需要确认后端在这种情况下的错误码。
8. **管理订阅失败的文案**：建议把借用的 `loadFailed` 换成新增的 `manageFailed`，并显示在对应的卡片内。
9. **当年时间省略年份**：列表更紧凑；跨年的记录仍然显示年份。
10. **§10.4 的两处共享样式冲突**：弹窗遮罩模糊的归属，以及 toast 时长。
11. **选择控件与浮层全站统一（已采纳）**：适用范围和控件选择见 §10.5；菜单键盘与 ARIA 规则见 §3.8。页头 API、语言、主题菜单共用运行时，工具页的 DMS 半球与 Bulk 组合顺序使用原生单选组。
12. **自定义日期仍用原生 `<input type="date">`**：日期子面板里的两个日期输入沿用原生控件，日历弹层由浏览器绘制，外观和键盘行为随浏览器而定。要完全统一，需要再做一个日期选择组件；本稿没有做。

## 14 · 原型专用与已知限制

- **原型专用，落地时删除**：
  - mock 数据和网络延迟、失败注入、任务进度模拟（2.6 秒一步）、样例 CSV 生成；History 的筛选在 mock 接口里完成。
  - 调试面板。
  - 登录弹窗的副本。
  - `dashboard.css` §1 和 `html.force-reduced`。
  - 语言切换、退出，以及选择没有 mock 州 / 城市数据的国家时，弹出的中文说明 toast。
- **示意内容**：
  - 地图是程序生成的示意 SVG，不是 OSM 瓦片；舞台宽高比变化时以 `slice` 方式铺满。
  - 地区数据：国家清单与 `website/src/data/gmap-regions/countries.json` 一致，共 252 个。只有 US / CA / GB / AU 带完整的州 / 省清单，州代码与 GeoNames 一致，例如 CA 的 `02` 是 British Columbia。城市只取示意子集；其余国家没有州和城市数据。
  - 连接地址 `https://api.mapsgrab.com/api/client/maps/api`、`https://mcp.mapsgrab.com/mcp` 是示意值，落地以接口返回为准。
  - 管理链接固定返回 null，所以只演示指引弹窗，没有演示跳转渠道和「弹窗被拦截」两条分支。
  - 过期文件是模拟的：列表里 `has_file` 仍为 true，点下载才返回 404，显示现有的 `downloadUnavailable` 文案。涉及 9 天前的一个任务，以及 60 天以前约三分之一的任务。
  - 「完整任务号」在原型里按 34 位十六进制判断；后端任务号是 32 位 UUID hex 加两位 owner 槽号（`00`–`09`，接口校验 `^[0-9a-f]{32}0[0-9]$`），落地按这个格式判断。
- **快捷键平台判断**：原型用 `navigator.userAgentData.platform`，没有时退回 `navigator.platform`，判断是否为 Apple 平台（⌘B 还是 Ctrl+B）。
- **减弱动效**：`motion.css` 的全局规则把所有过渡缩到 0.01ms。在 Chromium 里，侧栏收放的终态要在点击后的 2–3 帧才落定，期间保持起始状态，没有中间帧。
- **API 合卡的说明行**：落地合同是已批准的短文案（每月 1 日按 ET 重置、API 与 MCP 共用额度）保持一行，计量周期放进用量数字组，窄屏可随数字组自然换行。原型仍是周期与长句写在同一段的旧写法。
- **主题切换**：Dashboard 内的主题切换不做营销页那种圆形揭示动画，直接切换。
- **原型 token 与落地 token 的关系**：原型引用的是设计稿的 `tokens.css`。落地版 `website/src/styles/tokens.css` 已从它迁出，两者的取值可能逐步分叉，落地时以 website 版为准。
