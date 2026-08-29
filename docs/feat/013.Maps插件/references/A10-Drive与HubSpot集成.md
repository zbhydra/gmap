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
