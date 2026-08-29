# 网页端「解析 + 下载」真实回归 smoke

发版前手动跑一遍：对预设的一批真实 URL，网页端逐个走完整真实链路——
**输入链接 → 解析 → 下载解析结果列表第一个资源**，成功才进行下一个 URL，
**全部成功才算通过**。真实网络，非 mock。

## 覆盖平台

| 平台 | 样例形态 | 备注 |
| --- | --- | --- |
| Telegram | public 频道消息 | private 频道走 `requires_client`（无下载按钮），不在本回归范围 |
| TikTok | 单视频 | |
| X (Twitter) | 推文视频 | |
| Vimeo | 单视频 | |
| Instagram | 单图 `/p/` + Reel `/reel/` | |
| Threads | 帖子 | |

URL 清单维护在 `website/e2e/parse-download-smoke.spec.ts` 顶部的 `URLS` 常量，
新增平台或样例时在此追加。

## 怎么跑

```bash
cd website && pnpm test:e2e:parse-smoke
```

`test:e2e:parse-smoke` 会通过 `backend/scripts/e2e_parse_download_multi_node_smoke.py`
自动拉起 3 个本地后端进程：

- business：`http://127.0.0.1:9600`
- download：`http://127.0.0.1:9601`
- download：`http://127.0.0.1:9602`

runner 会基于 `backend/config.yaml` 生成临时配置、临时 EdDSA 下载 token key，
把三条本地 `service_nodes` 记录标记为 healthy，然后执行
`PUBLIC_MEDIA_DOWNLOAD_V2_ENABLED=true playwright test --project=parse-download-smoke`。
旧的单后端诊断入口仍可用：

```bash
cd backend && uv run python -m app.main
cd website && pnpm test:e2e:parse-smoke:single-backend
```

单后端入口只用于诊断 UI、登录态、真实网络或某个平台解析下载问题；V2 发布前验收必须跑
`pnpm test:e2e:parse-smoke`，因为 V2 依赖业务库 `service_nodes` 返回两个真实下载节点，
单后端不证明多节点 parse/download 调度可用。

## 前置条件

- **MySQL / Redis 已启动**，且 `backend/config.yaml` 可连接本地业务库。
- `uv` / `pnpm` 可用。
- 已安装稳定版 Google Chrome；非标准路径通过 `E2E_CHROME_EXECUTABLE_PATH` 指定。
- 后端能真实访问外网（解析+下载会打各平台 CDN）。
- 下载节点需要具备对应平台的本地配置或 session；缺配置的平台会按真实失败处理。

## 机制

1. **多节点启动**：`backend/scripts/e2e_parse_download_multi_node_smoke.py`
   派生三份临时 config，启动 1 个 business + 2 个 download 进程，并把本地
   `service_nodes` 记录写成 healthy。
2. **登录态注入**：`website/e2e/global-setup.ts` 在跑前 spawn
   `backend/scripts/e2e_seed_user.py --action seed`，建一个有 Credits 的
   e2e 专用用户，签 access token 并 store 进
   Redis，把 `{token, device_id}` 写进 `E2E_ACCESS_TOKEN` / `E2E_DEVICE_ID`。
   spec 用 `addInitScript` 把它们写进 localStorage（`homepage_access_token` /
   `homepage_device_id`），使下载处于已登录态、不弹登录框。
   - 仅当设了 `E2E_REAL_API_BASE_URL` 时 globalSetup 才执行；否则 no-op，
     不影响 mock/UI 跑（`pnpm test:e2e`）。
3. **V2 节点链路断言**：
   - `parse-pre-v2` 和 `download-pre-v2` 必须返回 3 个统一权重候选节点。
   - `parse-v2` 必须在候选节点成功，并把成功节点 ID 作为 `preferred_node_id`
     带给 `download-pre-v2`。
   - `download-v2` 必须真实请求候选节点。
   - 整轮 smoke 会按轮次覆盖两个下载节点，并断言两个 distinct download base URL
     都真实成功过。
4. **下载成功判定**（两个信号都满足）：
   - hook `HTMLAnchorElement.prototype.click` 记录 `anchor.download` 文件名非空
     （`triggerBrowserDownload` 触发了浏览器下载）；
   - hook `URL.createObjectURL` 记录 blob `size > 0`（确有真实字节落地）。
5. **串行 + 单次重试**：按 URL 顺序逐个解析+下载；单个 URL 失败后整体重试
   1 次（重新解析+下载），耗尽才判真失败。所有 URL 都会跑完，最后统一汇总失败项。
6. **浏览器身份**：Chromium 使用本机稳定版 Chrome，UA 主版本与实际浏览器、Client Hints
   保持一致；启动时移除 `--enable-automation` 并关闭 `AutomationControlled`，document 初始化
   时修正 `webdriver` 和 Playwright globals。`website/e2e/browser-identity.spec.ts` 独立验证这些
   字段；通过只表示没有已知自曝标识，不表示 Cloudflare/WAF 必然放行。

## 数据清理

多节点 runner 退出时会自动删除本轮写入的固定名 `e2e-parse-smoke-*`
`service_nodes`，失败退出也会尽量清理；如清理失败，会打印 config path、节点名称和日志目录。

seed 用户是固定 email（`e2e-parse-smoke@telegramdownloadmedia.test`），脚本幂等。
跑完如需清理：

```bash
cd backend && ./.venv/bin/python scripts/e2e_seed_user.py --action cleanup
```

cleanup 会软删用户、删订阅、撤销其全部 token、清当日配额 Redis key。

## 已知限制

- 依赖外网真实可达，CDN 波动可能导致重试后仍失败，属真实信号而非框架 bug。
- private Telegram 频道不在范围（首页对其走 `requires_client`，无下载按钮）。
- 本回归不校验文件内容正确性，只校验「触发下载 + 字节数 > 0」。
