# Extension Pro 变更记录

## 2026-08-28 新增首次安装导航

**范围**：`extension-pro` Background、浏览器身份 E2E 和产品/技术合同。

**变更**：Extension Pro 首次安装完成后自动新建 `https://web.telegram.org/a` 标签页；版本更新及其它安装事件原因不导航。

**验证**：`pnpm check`、`pnpm build:dev`、`pnpm build` 和浏览器身份 project；fresh unpacked profile 核对 Background 安装事件打开浏览器规范化后的 Telegram Web A 版落点。

## 2026-08-28 稳定下载指标并增加队列清理

**范围**：`extension-pro` 下载队列标题操作、传输指标布局、Lucide 图标、i18n、受控 E2E 和产品/技术合同。

**变更**：队列标题栏增加清理所有下载和清理等待队列两个图标按钮；前者移除包括 downloading 在内的全部任务并尽力取消活动传输，后者只移除 waiting。速度与已接收/总大小改为满宽稳定两列，位数变化不再改变传输区宽度。

**验证**：`pnpm check`、`pnpm build:dev`、`pnpm build` 和受控 I5 project；I5 核对两个清理按钮的可访问名称、waiting 可用状态与清理所有结果，并替换动态字节文本验证传输区宽度不变。

## 2026-08-28 放慢加载旋转动画

**范围**：`extension-pro` 全局加载/下载旋转图标、视觉 Token、受控 E2E 和产品合同。

**变更**：旋转图标从复用 200ms 面板过渡改为独立 1000ms 动画 Token，并使用匀速旋转；减少动态效果时继续停止动画。

**验证**：`pnpm check`、`pnpm build:dev`、`pnpm build` 和受控 I5 project；I5 核对 downloading 图标的最终动画时长与 timing function。

## 2026-08-28 修复浏览器工具栏图标视觉尺寸

**范围**：`extension-pro` 浏览器 action 图标、Manifest、构建门禁和产品合同。

**变更**：以 Pro 站 512px RGBA 母版的真实 `448×448` 非透明边界为源，裁掉四周各 32px 透明外圈，再生成 16/32/48/64/128px 五档图标。各档非透明区域均占满画布；64px 纳入 Manifest，48px 继续满足 Chrome 现有资源合同。

**验证**：逐档核对 PNG 尺寸、alpha 边界和文件签名，并执行 `pnpm check`、`pnpm build:dev`、`pnpm build` 与实际 unpacked extension 启动。

## 2026-08-28 修复单媒体悬浮入口显隐

**范围**：`extension-pro` Telegram inline Shadow UI、视觉样式、受控 E2E 和产品/技术合同。

**变更**：单媒体圆形下载按钮从常显改为默认隐藏，唯一显示条件是鼠标悬停对应媒体；焦点、waiting/downloading 和设备能力均不改变显隐。每个媒体 surface 独立控制自己的 Shadow Host，消息底部与 Story 入口保持常显。

**验证**：`pnpm check`、`pnpm build:dev`、`pnpm build` 和受控 I5 project；I5 核对两个相册按钮的默认状态、逐媒体 hover，以及焦点与 downloading 不构成显示条件。

## 2026-08-28 新增固定教程 Popup

**范围**：`extension-pro` Popup、Manifest、i18n、视觉 Token、构建门禁、E2E 和产品/技术合同。

**变更**：浏览器 action 仅在 Telegram Web 当前页打开 400×600px 固定教程 Popup；其它页面先激活当前窗口已有 Telegram 标签页，不存在时新建 A 版页面，本次不展示 Popup。教程顶部品牌区固定，正文按三步纵向滚动，并预留三处 16:9 教程图片区域；不读取账号、额度或下载状态，不改变 Telegram 页面内面板；原 action 点击监听及其专用 Content RPC 已整条删除。

**验证**：`pnpm check`、`pnpm build:dev`、`pnpm build` 和浏览器身份 project；Popup 用例核对 Telegram 页面门禁、已有/新建标签页跳转、三步内容、滚动溢出与键盘焦点。

**待办**：用最终教程截图替换三个图片占位区域，并补充对应本地化替代文本。

## 2026-08-27 同步计划基线更新

**范围**：文档，不改变运行时。

**变更**：Extension Pro 后续迁移加入 Worker ready、本地立即取消、资源排重和 Telegram 统一远端配置；统一配置复用公共 `/api/client/tg/config`，Pro 保留独立默认值、类型和消费 owner，配置合并只使用两次浅层 `Object.assign`。真实 Telegram 验收复用主插件今天跑通的唯一 owner Page、固定目标、真实落盘和 9 条串行行为；当时尚无 Popup，因此不迁移主插件业务 Popup 断言。

**当前状态**：P0 实验源码清理已完成、构建与启动验证 pending；P1–P6 待用户批准。

**风险边界**：队列可用性优先于底层完美回收；低概率、轻微且用户重试可修正的问题不增加等待、恢复、补偿或防御测试。

## 2026-08-27 文档基线重建

**范围**：文档，不改变运行时。

**变更**：删除旧会话驱动的 `docs/new-pro/`，新建独立 `012.Extension Pro` 产品、架构、Telegram 下载和执行计划。主插件继续由 `002.下载功能` 独立维护，两套插件允许后续分叉。

**当前状态**：下载内核统一计划待用户批准，尚未实施。
