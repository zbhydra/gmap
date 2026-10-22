# 官网联系方式采集

本文定义可移植采集库与本项目补全编排的边界。Online 权益、任务字段与执行时机归 [Online 任务与结果](tech-Online任务与结果.md)；实施状态归 [003 实施清单](plans/003.可选联系方式与独立采集库.md)。

## 1. 职责

Online 通过 `GmapExportProvider` 调用 Collector 补全，权益快照、恢复与基础行交付归 [Export 与 Collector](tech-Export与Collector重构.md#3-export-领域与执行)。公开 API 的 extra 同样走 Collector，不接 Online 订阅。

`app/provider/maps_enrich.py` 和独立 `contact_scraper` 继续服务插件官网直连，不读取云端采集配置。两条链路仅共用无网络的 `classify_social_url` 分类规则。

## 2. 独立库合同

公开异步操作名为 `scrape_contacts`，一次调用处理一个目标网站。

| 输入      | 合同                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `target`  | 裸域名或完整 HTTP(S) URL；裸域名补 HTTPS，完整 URL 保留路径                                          |
| `proxy`   | 必须显式提供；代理 URL 指定出口，None 明确表示直连                                                   |
| `timeout` | 单次网站抓取的总时限，默认 12 秒，含 DNS、安全校验及重定向；业务队列等待不计入，不叠加独立 curl 超时 |

返回库自身定义的 `ContactResult`，包含 `emails` 列表与 `medias` 平台到链接的映射。数据类型使用标准库，不暴露项目 schema、账号或任务信息。

- 获取目标页面 HTML，一次解析同时提取 Email 和已有六类社媒外链；不访问社媒平台本身，不做站内深爬。沿用现有解析、去重和误报过滤行为。
- 成功访问但未发现联系方式，正常返回空结果；安全拒绝、网络失败、非成功响应或抓取超时以脱敏异常返回，调用方决定如何处理。取消必须继续向上传播，不转成普通空结果。
- 同一次调用的请求和重定向使用同一代理；不读取代理环境变量，不在失败后自动转直连或更换代理。
- 同一次调用复用一个 HTTP 会话；同源重定向尽量复用连接，跨主机或协议变更允许新建连接。Email 与社媒从同一份 HTML 提取，不分别请求。
- 库通过标准 `logging` 输出逐跳安全校验、连接 ID、新建连接数、DNS、TCP、隧道/TLS、首字节及正文等待耗时；只记录主机名与请求标识。宿主应用负责接入日志输出，库不配置处理器。
- URL 协议与凭证限制、DNS 公网地址判定、逐跳重定向检查、HTML 大小上限和有限重定向规则随采集实现迁入库。库不提供关闭安全校验的快捷分支。
- 除标准库与后端已有的 `curl_cffi`，仅导入同级中立 `traffic_scope` 包读取可选、不解析的 `scope_id` 与计数；默认无 scope，不依赖 Online 业务。禁止导入 `app`、FastAPI、Pydantic、Redis、MySQL、项目配置或日志初始化。异常由业务处理边界记录，库不初始化项目日志。

移植需一并复制 `contact_scraper` 与标准库中立包 `traffic_scope`，并安装匹配的 `curl_cffi`。本仓 wheel 必须包含两个顶层包；不要求另建采集服务、发布 PyPI 或增加依赖注入接口。

## 3. 本项目编排

云端 `provider/gmap/enrich.py` 沿 CAS 规范化完整 HTTP(S) URL，缓存键是完整 URL 的 hash，七天 TTL；同域不同路径分别保留。无效网站不发送，直接社媒 URL 使用纯分类；补全按响应 URL 合并，不能按数组位置或域名复用。Redis 故障记日志并按未命中处理，失败不缓存。已有 Run 补全定位时先查询原调用，不按新的缓存未命中组重投。关闭联系方式时不进入该链路，补全失败保留基础行并标记 partial。Collector 内部官网直连/代理与站点预算归其协议，本项目不保留 Python fallback。

插件继续逐条识别官网，命中六类社媒直接分类；普通官网沿原域名缓存、批内去重和每进程 50 路预算。插件显式直连，保留 25 秒批量期限和 50 条外部请求上限；不依赖 Collector 或旧引擎配置。库的取消向上传播，单站失败由插件编排转空结果；不新增锁或跨任务协调。

## 4. 外部边界

- `curl_cffi` 版本使用 `backend/uv.lock`；迁移复用现有 AsyncSession、显式代理、手动重定向和流式读取能力。[官方文档](https://curl-cffi.readthedocs.io/en/latest/)
- Fake-IP 返回的非公网地址仍会被前置安全校验拒绝；显式代理不自动解决该问题。真实采集验收需要返回实际公网地址的 DNS 环境，不新增自有 DNS 服务。[Mihomo DNS 文档](https://wiki.metacubex.one/config/dns/)
- 保留现有 DNS 重绑定防护边界：本地解析检查不等于连接地址固定，也不证明远端代理解析与本地完全一致；本轮不宣称实现连接级 pinning。[OWASP SSRF 指引](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
