# 插件端测试

当前插件是可复用壳：官网登录桥接、SLS 打点、RPC 框架、语言切换。
站点级真实下载 E2E 已随旧产品下线移除；未来 Google Maps 插件的
E2E 在对应 feat 域落地时重建。

## 命令

```bash
pnpm test:unit   # vitest 单元测试
pnpm test        # playwright（当前无自动化项目时为空跑）
pnpm run test:clean
```

## 结构

- `unit/`：HttpClient / 拦截器 / RPC / auth store / 打点 / 语言等纯逻辑单测。
- `mocks/chrome-api.ts`：chrome.* 全局 mock。
- `manual/` 已删除；人工验收脚本随对应功能域重建。
