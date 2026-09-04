# E14: hspqX (Photos) 请求模板样本 — 2026-09-03 浏览器取证

## 端点
POST https://www.google.com/maps/_/MapsWizUi/data/batchexecute?rpcids=hspqX&hl=en
Content-Type: application/x-www-form-urlencoded
Body: f.req=<URL编码的下方结构>&at=<XSRF token, 页面颁发>

## f.req 结构
[[["hspqX", "<payload JSON 字符串>", null, "generic"]]]

## payload JSON（Drip Drop Coffee 实体样本，fid/kgmid 已可见）
[2,null,["0x54950bc11c29c079:0xb99d1f303e39195",null,null,null,null,null,null,null,0,null,null,null,null,null,[[null,null,null,"/g/11x0ypdf7w"]]],null,[null,[203,100],[null,20,null,null,1],null,null,null,[[[[1,0,3],[2,1,2],[2,0,3],[8,0,3],[10,0,3],[10,1,2],[10,0,4],[9,1,2]],1],null,0,null,null,null,null,null,[[[[[2]]],[195,195],20]]],["fkiZapnHKZOfhvcPlcinUA",null,null,null,null,null,81,null,null,null,null,null,null,null,16698],null,null,null,null,null,null,null,null,null,[null,1,null,1]]

---

## E14b 服务端复现结论（2026-09-03 追加）

**匿名纯 HTTP 复现失败（400 er code 3），根因 = 登录态门控**：
- 请求需 `at` XSRF；匿名壳页 `SNlM0e` 为空（Google 不给匿名会话颁发），壳页 `Tu8Y1b` 不获接受。
- payload 已与浏览器捕获逐字符一致仍 400；at 有无、TLS 指纹（curl_cffi chrome124 vs 原生 curl）、URL 参数形态均排除。
- 浏览器侧成功依赖该会话的 Google 登录态。SurfSense 注释独立佐证 "signed-in photo-listing RPC"。
- 结论：本模板仅在有 Google 登录态的会话（浏览器或登录 cookie 池）中可用；匿名 Provider 只能用 preview/place lite 口径。
- 服务端复现脚本：`/data/gmaps-research/scripts/e14b5_server_replay.py`（v1–v5 演进，v5 为结构全对齐版）。
