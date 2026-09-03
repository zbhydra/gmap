# 插件端测试(Maps Extractor 插件,013 域)

单元测试(vitest)+ e2e(Playwright,真实 Google Maps 界面主验收)。

## 命令

```bash
pnpm test:unit:run   # vitest 单元测试
pnpm test:e2e        # = 构建前置 pnpm build:real + playwright test --project=extension-mv3(headful,真实出网)
```

## 结构

- `unit/`:HttpClient / 拦截器 / RPC / auth store / 打点 / 远程配置 / Maps 解析器(黄金样本逐字段)/ CSV 与采集状态机等纯逻辑单测。
- `e2e/`:真实界面层(2026-09-02 hydra 拍板,零 mock——原离线 fixture 页、本地 mock 服务与全部 route mock 已删除)。
  - `harness.ts`:stealth 启动(去 `--enable-automation` + `--disable-blink-features=AutomationControlled` + 身份兜底 init script)、token 直注(经 SW 写 chrome.storage auth 三键)、用户设置直注(5s 采集档)、Google 同意页自动接受、人机验证探测与条件降级共用件。
  - `real-maps.spec.ts`:匿名全链路(真实采集 → 暂停挂起 → 完成态 → CSV 导出 36 列 → Reset)。
  - `real-maps-signed-in.spec.ts`:Pro 登录态(token 注入 → 采集 → 完成边沿 usage/report 200 → enrich 到达真实 backend → 导出);依赖本地 backend,不可达时条件 skip。
  - `global-setup.ts`:校验 dist-real 产物 + 探测本地 backend(127.0.0.1:7600)可达时 spawn `backend/scripts/e2e_seed_user.py --scenario maps-extension-pro` 签发真实 token 对(`E2E_BACKEND_PYTHON` 可覆盖 python 路径)。
- `fixtures/golden-samples/`:解析正确性基线(格式 A/B 真实响应 + 逐字段金标准,单测消费)。
- `mocks/chrome-api.ts`:chrome.* 全局 mock(单元测试用)。

## 运行前提

- Playwright 浏览器二进制:`pnpm exec playwright install chromium`(本机缺省时执行一次)。
- headful 真实出网:本机可访问 www.google.com;同意页自动接受,人机验证/落地域偏离/DOM 改版按 skipSmoke 条件降级。
- 登录态(Pro)用例需本地 backend:`cd backend && uv run server`(MySQL/Redis 就绪);匿名用例无此前置。
- 登录流程不做 e2e(v3 登录链路由单测覆盖,真实回流走 unpacked 人工终验)。
