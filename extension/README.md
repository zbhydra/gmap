# extension-maps-extractor

Google Maps Extractor 浏览器插件(013 域)。由原 Telegram 下载插件工程改造而来:删除了下载业务与 TG 绑定,保留完整可复用底座。

- 产品合同与逐功能竞品调研:`docs/feat/013.Maps插件/`
- 实施顺序与已拍板决策:同域 `feat.md`;架构决策记录在 `docs/scratch/G-MAPS-EXTRACTOR-v2.5.1/research/11-复刻问题清单与决策.md`

## 底座能力(保留)

| 能力 | 位置 |
| --- | --- |
| MV3 构建(vite-plugin-web-extension,内联 manifest)+ zip | `vite.config.ts` / `scripts/zip-dist.js` |
| 跨上下文 RPC(chrome/event 双传输 + 代码生成) | `src/core/rpc/`、`scripts/rpc-generate.mjs` |
| backend HTTP 客户端(拦截器 / 错误信封) | `src/core/api/client/` |
| 认证 / 订阅 API(通用账号能力,A11 复用) | `src/core/api/auth/`、`src/core/api/subscription/` |
| SLS 行为打点(双写) | `src/core/api/mark/`、`background/services/ExtensionMarkReporter` |
| 运行时配置(background 分发) | `src/core/runtimeConfig.ts`、`src/background/runtimeConfig.ts` |
| i18n(14 语言,英文基线占位待本地化) | `src/locales/` |
| 单元 / e2e 测试底座 | `tests/`、`playwright.config.ts` |

## 待办

- Maps 采集引擎(content script + injected hook XHR + 远程配置 dom/parseSchema/scrape 三组)——见 013 域 A1
- 官网登录桥决策后恢复 `externally_connectable` 白名单(当前置空)
- 图标沿用旧占位资源,待设计替换
- locales 为英文基线占位,走本地化流程补齐
