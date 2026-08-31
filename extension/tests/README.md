# 插件端测试

Maps Extractor 插件(013 域):单元测试(vitest)+ e2e(playwright,extension-mv3 project)。

## 命令

```bash
pnpm test:unit:run   # vitest 单元测试
pnpm build:e2e       # e2e 构建变体(dist-e2e,API/SLS 指向本地 mock)
pnpm test:e2e        # = build:e2e + playwright test --project=extension-mv3
pnpm run test:clean
```

## 结构

- `unit/`:HttpClient / 拦截器 / RPC / auth store / 打点 / 远程配置 / Maps 解析器(黄金样本逐字段)/ CSV 与采集状态机等纯逻辑单测。
- `e2e/`:Maps 面板采集闭环(面板三态 → Start → 计数 → Pause/Resume → 完成态 → CSV 下载),双 pattern route(`/maps/**` fixture HTML + `/search*` 黄金样本 fulfill),SW 流量经构建变体指向 `tests/e2e/mock` 本地服务,零外网;globalSetup 拉起 mock 并校验 dist-e2e 存在。
- `fixtures/golden-samples/`:解析正确性基线(格式 A/B 真实响应 + 逐字段金标准)。
- `mocks/chrome-api.ts`:chrome.* 全局 mock(单元测试用)。
