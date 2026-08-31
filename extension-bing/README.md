# extension-bing

Bing Maps Scraper 浏览器插件(016 域)。业务逻辑复刻竞品 "Maps Scraper & Map data extractor" v2.4.9(逆向调研:`docs/research/bing-maps-scraper-竞品调研.md`),UI 直插与登录/token 走本项目自有体系。工程底座与 `extension/`(gmap 线)同构。

- 固定扩展 ID:`pgcpggcfmfdmobpheojngndpcmnkibmm`(manifest key 推导;私钥 `keys/bing-maps-extension.pem`,不入 git,丢失则 ID 漂移、官网登录桥失效)
- 官网登录桥:website `/extension-login-bing` → `chrome.runtime.sendMessage` → 本扩展 `onMessageExternal`(待实施)

## 命令(与 extension/ 一致)

- `pnpm dev` / `pnpm build` / `pnpm check`
- `pnpm test:unit:run`
- `pnpm rpc-generate`(register 改动后必须)
