# A10 · Google Drive 与 HubSpot 集成(竞品调研)

> Roadmap:A10 · 调研:🔍 完成 · 深读:scratch 逆向 06/07

## 功能定义

导出结果一键保存到 Google Drive(上传 CSV)或同步到 HubSpot(商家建 companies/contacts)。

## 用户操作(竞品)

1. 在**官网**完成 Google OAuth(Drive scope)或 HubSpot 授权——官网在插件 `externally_connectable` 白名单内。
2. 官网通过 `chrome.runtime.sendMessage(extId, {event:"integrate_google_drive", token…})` 把 token 推给插件,存入 storage。
3. 插件设置开启 auto_save;之后每次导出自动上传 Drive(REST multipart)或经云函数同步 HubSpot。
4. 可在设置中 revoke/刷新。

## 竞品实现逻辑

- Drive:插件直连 Google REST(上传/建目录/列表/吊销/刷新全在 background);HubSpot:走作者云函数代理(避免 CORS 与暴露凭证)。
- token 通道:onMessageExternal 校验 sender.origin ∈ 白名单,再收 token——官网↔插件的唯一消息通道(我方产品线的对应通道见 007 域登录桥)。

## 我方落地要点

- Drive 集成可照搬(纯客户端,无服务端依赖);HubSpot 代理对应我方 backend 新增一个转发接口(04 订单域外的服务集成,立项时定归属域)。
- 价值判断:对标站把这两个集成作为 Pro 卖点;MVP(阶段 1)不含,后置迭代。

## 我方实现(U9,2026-08-30)

- 授权流简化为插件内直接 OAuth(Maps 官网不存在,015 未建):Drive 用
  `chrome.identity.getAuthToken`(scope `drive.file`,client_id 声明于 manifest
  oauth2 段);HubSpot 用 `chrome.identity.launchWebAuthFlow`(授权码换 token +
  refresh token 刷新,client_id/secret 为插件内占位常量)。
- 触发:采集完成边沿(复用 auto_download 边沿)→ Drive REST multipart 直传
  (background SW + host_permissions `googleapis.com`)/ HubSpot 商家数组经
  backend 代理端点 `POST /api/client/maps/hubspot/sync` 转发(无表结构变更;
  端点挂 `get_current_user_optional` 观测位,真门控随 U7 收口)。
- 单路失败不阻断导出与另一路;埋点 `sync_to_google_drive`(含失败结果)。

## 待决与后续(U7 收口时重评)

1. **HubSpot token 交换/刷新的 CORS 风险**:商家同步走 backend 代理,但 OAuth
   token 交换与 refresh 刷新由插件直连 `api.hubapi.com`,未加 host_permissions
   (按需最小化,仅 `googleapis.com`),依赖 HubSpot API 的 CORS 放行——**待
   real smoke 验证**;若被拦截,补一条 `https://api.hubapi.com/*`
   host_permissions 即可(SW/扩展页 fetch 免 CORS)。
2. **client_secret 入插件包的暴露面**:refresh token 模式要求客户端持有
   secret,解包插件即可提取——占位阶段无实际风险,接真凭证前必须重评。
3. **更优方案(竞品同构理由)**:把 HubSpot token 交换/刷新整体下沉到 backend
   代理端点(插件只传 code/refresh_token,secret 留在服务端),可同时消除
   风险 1 的 CORS 与风险 2 的暴露面——竞品用云函数代理正是此动机(逆向 06:
   「避免 CORS 与暴露凭证」)。随 U7 收口一并裁决是否迁移;迁移后插件端
   integrations 的 token 交换函数删除,仅保留授权跳转。
