# 000 · 架构 · 插件 RPC 系统

本文件记录 `extension/` 与 `extension-bing/` 的 Chrome RPC 注册、生成与权限合同。插件结构见 [tech-extension.md](tech-extension.md#a3-rpc-系统自研-v2声明式--代码生成)，工程规则见 [spec-extension.md](../../references/specs/spec-extension.md#8-消息通信rpc-v2核心)。

## 1. 注册与生成

每端的 `src/core/rpc/generator/manifest.json` 是 register 与生成文件清单的唯一入口。`src/background/background-register.ts` 声明方法签名、允许调用方、请求和响应大小限制；实现由 `BackgroundMessageRouter.createRpcHandlers()` 提供，`setupListener()` 调用 `serve()` 注册 Chrome listener。

`scripts/rpc-generate.mjs` 的 `allowedRoutes` 限定 Chrome message 的调用方向：popup/background → content，以及 content/popup → background。生成器按 `METHOD_TARGETS` 为每个调用方筛选方法，生成的 typed client 统一使用 `ChromeRpcTransport`。可选 `METHOD_TIMEOUTS` 声明方法默认超时，单次调用可以覆盖。

修改 register 后运行 `pnpm rpc-generate`。`pnpm rpc-generate:check` 同时核对声明、manifest 和磁盘生成文件，挂在 `pretype-check` / `prebuild`，产物不一致会阻止构建。

## 2. 请求、权限与错误

`src/core/rpc/serve.ts` 负责协议字段、方法自有键、调用方白名单和 payload 大小校验。调用方身份由 `inferChromeCaller()` 根据浏览器提供的 `sender` 推导，业务参数不能替代 sender URL 或声明自身权限。

请求与响应按 JSON 序列化后的 UTF-8 字节数应用方法限制；超限返回 `PAYLOAD_TOO_LARGE`，不返回原始大 payload。handler 的普通异常保留可定位消息，转换为 `SERVER_ERROR`；已有 `RpcError` 保留其错误码和消息。错误类型与响应还原入口见 `src/core/rpc/errors.ts` 的 `RpcError`、`createRpcErrorFromResponse()`。

`ChromeRpcTransport` 使用 request-response，不使用 Port。调用 content provider 必须指定 tab；超时仅使当前调用失败，不代表业务操作已取消。background 在 `onSuspend` 时通过 `messageRouter.destroy()` 释放 listener。日志不得记录 token、完整请求或响应、用户正文等敏感数据。

## 3. 页面采集事件边界

Maps 的 `src/injected/index.ts` 在 MAIN world 拦截站点搜索 XHR，并通过 `sites/maps/content/rpcEvents.ts` 的 `MAPS_RPC_RESPONSE_EVENT` 向 content 转发响应。这是 Maps 的单向采集事件；MAIN world 没有 Chrome API，也不注册通用 RPC provider。DOM 事件可被宿主页面观察或伪造，不能作为调用方身份或 Chrome 权限依据。

Maps 与 Bing 的采集、导出及用量合同分别见 [Maps 插件](../013.Maps插件/feat.md) 和 [Bing 插件](../016.Bing插件/feat.md)。
