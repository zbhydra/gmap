# Extension Pro Telegram 远端配置

## 1. 文档职责

本文定义 Extension Pro 如何消费 Telegram 统一远端配置。公共接口和 Admin owner 由主插件 Plan 031 对应的后端/Admin实现维护；Extension Pro 只复用接口，不共享主插件源码、运行时状态或技术文档。

## 2. 目标与边界

- Extension Pro 每个 Telegram document 只读取一次 `GET /api/client/tg/config`。
- 包内始终携带完整默认配置；远端只保存稀疏覆盖。
- 首批只消费 `dom` 和 `download.opfsThresholdBytes`。
- Pro 拥有自己的默认对象、类型、合并和生效 owner；主插件后续字段不会自动成为 Pro 功能。
- 不请求旧 `/api/client/tg/dom-config`，不读取 `telegram_dom`，不迁移、不双写、不兼容旧配置。
- 不增加缓存、轮询、重试、版本、灰度、历史、回滚、持久状态或 Pro 专用后台接口。

## 3. 配置合同

```json
{
  "dom": {},
  "download": {
    "opfsThresholdBytes": 209715200
  }
}
```

- 实际 `dom` 默认值直接引用 Extension Pro 当前完整 `DEFAULT_TELEGRAM_DOM_CONFIG`，不复制 selector 清单。
- `opfsThresholdBytes` 单位为字节，包内默认值为 `200 * 1024 * 1024`；`0` 表示所有取得可靠总大小且支持 OPFS 的 Segment 下载都选择 OPFS。
- 公共接口返回顶层稀疏 JSON 对象；未配置时返回 `{}`。
- Content 先复制 Pro 本地 `dom` 与 `download` 默认对象，再对远端同名对象各执行一次浅层 `Object.assign`；不枚举字段、不做 deep merge。
- Background 只确认接口响应顶层是 JSON 对象；`opfsThresholdBytes` 只在 injected EventRpc 真实入口确认是大于或等于 0 的安全整数。
- 未知字段随对象进入后由实际 consumer 自然忽略，不增加字段级 schema、类型描述、逐字段错误日志或兼容分支。

## 4. 所有权与初始化

### Background

- 通过现有 Pro API client 请求 `/api/client/tg/config`。
- `getTelegramConfig` Chrome RPC 只返回后端稀疏对象，不在 Background 复制默认值或消费字段。

### Content

- `TelegramConfig` 模块拥有完整默认结构、两次 `Object.assign` 和每 document 单次加载，不建立通用 merge/validator。
- 初始化同时等待 injected ready 和远端配置请求；请求完成前不修改当前 DOM owner。
- injected ready 后先完成独立的 debug logging 同步，再把候选 `download` 分组通过 EventRpc 交给 injected。
- injected 应用成功后才把候选 `dom` 提交给现有 `telegramDomConfig`，随后启动 scanner、ResourceBuffer、Story 和页面 UI。
- HTTP 请求失败使用完整本地默认值。EventRpc 同步失败时，injected 保持模块级包内默认值，Content 不提交候选 DOM 并用现有包内默认继续启动；不发送第二次“恢复默认”RPC。

### Injected

- 模块级配置只保存当前 document 的下载参数，不访问 Chrome、后端或 storage。
- `applyTelegramDownloadConfig` 是 `opfsThresholdBytes` 唯一运行时校验入口；解析成功后直接替换模块级配置。
- `DownloadServices` 把生效阈值显式传给 `SegmentDownloader`；core 下载器不依赖 Telegram 配置模块。

## 5. RPC 与接口

| 边界                                   | 请求                           | 返回                                 | 失败                       |
| -------------------------------------- | ------------------------------ | ------------------------------------ | -------------------------- |
| `GET /api/client/tg/config`            | 无                             | Telegram 稀疏配置对象；未配置为 `{}` | Content 使用完整本地默认值 |
| `background.getTelegramConfig`         | 无业务参数                     | 后端稀疏对象                         | Content 使用完整本地默认值 |
| `injected.applyTelegramDownloadConfig` | `{opfsThresholdBytes: number}` | `{applied: true}`                    | 两端保留包内默认并继续启动 |

旧 `background.getTelegramDomConfig` 与对应 Pro API 调用由新入口直接替代并删除，不保留 fallback。

## 6. 文件范围

```text
extension-pro/src/core/api/config.ts                           登记公共端点
extension-pro/src/background/background-register.ts
extension-pro/src/background/types.ts
extension-pro/src/background/providers/getTelegramConfig.ts    新增；直接复用 requestApi/isJsonObject
extension-pro/src/content/rpc/background.rpc.ts                 生成
extension-pro/src/content/rpc/injected.rpc.ts                   生成
extension-pro/src/content/telegram/config.ts                    新增
extension-pro/src/content/telegram/domConfig.ts
extension-pro/src/content/telegramContent.ts
extension-pro/src/injected/config.ts                            新增
extension-pro/src/injected/injected-register.ts
extension-pro/src/injected/types.ts
extension-pro/src/injected/telegramInjected.ts
extension-pro/src/injected/downloadMediaService.ts
extension-pro/src/injected/downloaders/SegmentDownloader.ts
```

不修改 backend、Admin、主插件或其它项目。该阶段依赖公共 `/api/client/tg/config` 已经可用。

## 7. 最少验证

- 现有初始化用例只增加两个场景：`{}` 使用完整 Pro 默认；一个稀疏 DOM + 阈值覆盖证明两次 `Object.assign` 后在 injected 应用成功时提交 DOM 并启动 owner。
- 同一个初始化用例让一次配置 RPC 失败，证明不提交候选 DOM、保留默认并继续启动；不验证第二次回滚 RPC，因为该调用不存在。
- sink 选择只在现有下载边界用例证明阈值两侧；不测试字段级 merge、无效值、未知字段或旧接口。
- 不新建独立 project、兼容测试或各层重复配置测试。

## 8. 已知边界

- Extension Pro 与主插件读取同一份远端 Telegram 配置，但只消费各自认识的字段；共享数据不等于共享源码或发布节奏。
- 后续需要 Pro 专属字段时，先证明真实消费方和分叉需求；未知字段自然忽略，不预先增加 `pro` 分组或第二接口。
- 已打开页面不会热更新；用户刷新 Telegram 后重新读取。
