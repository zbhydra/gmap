# Collector 与 Google Provider 边界

统一采集协议、恢复与单一配置归 [Export 与 Collector](tech-Export与Collector重构.md)。本页只定位本项目入口；正式 Collector 的实现与真实联调状态归 [010](plans/010.Export服务端实施.md)。

## 本项目入口

- `provider/gmap/collector_client.py` 拥有连接池、鉴权、HTTP GET/POST、四 operation 的外部数据校验与原状态解包。进程关闭时由 lifespan 释放连接池。
- `search_item/enrich_sites` 为同步预览/API 提供一次业务响应；传入真实 `run_no` 时使用 Run 定位和异步提交/恢复。`list_reviews/list_photos` 保持同步媒体接口，结果语义归 [API 与 MCP](tech-API与MCP.md)。
- `submit_task/query_task/wait_for_task` 面向已确定的原实例；`resume_run_task` 在 canonical 文件服务读取定位并用当前配置匹配该 URL 的 Key。定位只含 ID/地址，HTTP payload 不伪造 Run 编号。
- `provider/export/gmap_export.py` 沿 CAS 的并行 item、完成顺序、记录转换与 CSV 列合同工作；`runtime/export_job_runtime.py` 单写 CSV。Provider 不接本地账本或存储上传。
- `provider/gmap/enrich.py` 为云端补全提供完整 URL 归一化、七天 hash 缓存和按响应 URL 合并；插件的 `provider/maps_enrich.py` 与 `contact_scraper` 保留独立直连链路。

## 配置与失败

采集配置唯一 owner 为 `gmap_collector_config_service` 与 `system_data.gmap_collector`，Admin 请求响应归 [技术方案 §5](tech-Export与Collector重构.md#5-单一采集配置)。空节点配置停用采集。旧 Python Google RPC、gosom 引擎及专属配置入口已退役。

同步 Search 的累计 page 按每页 20 条映射目标数；预览只公开最多三行六字段。Search 合法零结果与 failed 明确区分；媒体保留合法空评论页及 Photos 部分交付。终态必须解包内层原 HTTP 状态，查询外层成功不代表采集成功；未知原结果不授权跨节点重投。

采集总期限、有限切换、404 搜索失败/补全降级与取消传播均以 [§3.3](tech-Export与Collector重构.md#33-collector-异步调用与恢复) 为准。Google 实际字段覆盖、照片分页和 Collector 重启/TTL 不由本端 HTTP 出口替身证明。
