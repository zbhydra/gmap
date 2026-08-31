# 插件端测试(Bing 插件,016 域)

单元测试(vitest)+ e2e(Playwright,T1 §6 离线 fixture 层)。

## 命令

```bash
pnpm test:unit:run   # vitest 单元测试
pnpm test:e2e        # = 构建前置 pnpm build + playwright test --project=extension-mv3(headful)
```

## 结构

- `unit/`:HttpClient / 拦截器 / RPC / auth store / 打点 / logger 等纯逻辑单测;Bing 解析器(sites/bing)单测随 M2 落地。
- `e2e/`:Playwright harness(MV3 扩展只在 persistent context 注入 content script,故 spec 内 `launchPersistentContext` headful + `--load-extension=dist` 自管上下文)。U1 冒烟断言链:扩展 SW 注册 → `context.route` 拦截 `https://www.bing.com/maps**` 返回 fixture(URL 保持 bing.com,请求不出网)→ content script 注入生效(CDP 隔离 world `chrome.runtime.id` 命中固定扩展 ID)。
- `e2e/fixtures/`:`bing-maps-fixture.html` 由 `generate-fixture.mjs` 从 `docs/feat/016.Bing插件/references/golden-samples/` 的 3 条真实样本确定性合成(30 个 data-entity 条目,new 版容器结构,`?fixtureInitial=N` 控制初始条数,`window.bingFixture.loadMore/loadAll/enableScrollPaging` 注入加载更多),globalSetup 每次运行前幂等重生成,禁止手改。
- `mocks/chrome-api.ts`:chrome.* 全局 mock(单元测试用)。

## 运行前提

- Playwright 浏览器二进制:`pnpm exec playwright install chromium`(本机缺省时执行一次)。
- CI 无显示环境不在 U1 范围(headful 要求本机运行);真实 Bing smoke 属 T1 §6 第二层,由 U5 补。
