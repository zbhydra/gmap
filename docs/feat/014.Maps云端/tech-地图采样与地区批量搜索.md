# 地图采样与地区批量搜索

## 输入与预算

现有关键词创建入口保持可用。地区模式先生成可编辑的最终查询词，每条最终查询词沿用一个关键词 item 和对应套餐关键词上限。地图模式对同一组关键词共用采样视口：中心、半径和网格间距仅用于生成点位，服务端接收实际点位快照。默认网格间距为 5 km；半径描述要采样的圆，不是商家结果的硬边界。

创建请求在原有 `keywords`、`include_contacts` 外可带 `search_viewports`，每项为有限的 `lat/lng/zoom`；省略或 `null` 表示普通/地区模式，空数组拒绝。入口按出现顺序去除完全重复的视口，再按「规范关键词数 × 视口数」校验地图模式最多 50 个逻辑搜索采样；`GET /api/client/maps-online/options` 返回 `logical_sample_limit` 供前端展示。普通/地区模式维持原关键词档位上限。逻辑采样不等于物理 Google HTTP 请求，初始化、分页、补列和重试会增加实际请求。创建入口继续实时校验关键词权益、月度额度和联系方式权限。

## 网格与视口

前端以中心为首点，以间距为相邻网格中心距离，保留圆内点并按距离由近及远排列。网格使用局部经纬度近似：纬度每公里约 `1/111.32` 度，经度按中心纬度的余弦校正；跨经度边界时归一到 `[-180,180]`。仅将通过范围校验的点提交；超出 50 个逻辑采样时显示完整计算数量并阻止提交，不截尾。

HTTP 搜索视口直径沿用 `templates.py` 已验证公式 `20 km × 2^(14-zoom)`。让搜索直径约为网格间距的两倍，以便相邻采样有重叠；`zoom = round(14 - log2((2 × 间距 km)/20))`，限制在 1–21。默认间距 5 km 对应 zoom 15、约 10 km 搜索直径。此 zoom 是上游查询参数，不控制界面地图的视觉缩放，也不用于过滤返回商家。

gosom v1.17.4 的提交请求支持 `geo_coordinates`（`lat,lon`）与 `zoom`（1–21）；本项目将相同点位传给现有 submit/get，不建立第二种 Provider。上游 `radius` 的单位是 km，但此处的圆半径只负责生成多个中心点，不当作每点搜索半径透传。字段证据见 [官方请求定义](https://github.com/gosom/google-maps-scraper/blob/v1.17.4/api/responses.go#L36)和[官方入队映射](https://github.com/gosom/google-maps-scraper/blob/v1.17.4/api/api.go#L104)。参数存在不等于已验证真实 gosom 地图采集。

## 执行与交付

父任务仅增加一个可空 JSON 视口快照；NULL 任务沿用单关键词单次搜索。20 张 item 表不变，每关键词仍是一个 item 和一份 CSV。启动恢复读取父任务保存的实际点位及原 60 分钟期限，不重新生成网格。HTTP 与 gosom 对一个关键词依点位顺序采样，按 `fid` 保留首次商家；不同关键词分别保留相同商家。单点失败记内部 warning 并继续；总期限耗尽停止新采样，保留已经成功取得的基础结果。只要至少一个采样成功（包括成功返回零条），即继续补全和独立文件交付；全部采样失败则该 item 失败、零条且无 CSV。外部取消继续传播。上传成功后按各关键词实际去重交付行数沿用既有幂等计量。

## 资源与来源

地图组件及 Leaflet JS/CSS 仅在用户打开地图模式时加载；地区选择组件和国家 JSON 仅在打开地区模式时加载，选定国家后才请求该国 JSON。普通关键词创建不下载这些资源。地图使用 OSM 官方瓦片地址、展示 [OpenStreetMap 署名](https://www.openstreetmap.org/copyright)，遵守[瓦片访问政策](https://operations.osmfoundation.org/policies/tiles/)；不自建瓦片缓存。

Leaflet 与类型包、GeoNames CC BY 来源均已获批准。CAS 地区快照未找到可复用许可，未复制。地区静态 JSON 由 `website/scripts/generate-gmap-regions.mjs` 从 GeoNames 的 `countryInfo.txt`、`admin1CodesASCII.txt`、`cities500.zip` 生成，按国家拆分；国家和一级行政区取对应源文件，城市仅覆盖 `cities500` 的实际记录，不承诺所有城市。地区选择器展示带链接的 GeoNames 署名；来源、许可与重新生成方式见 `website/src/data/gmap-regions/SOURCE.md`，原始文件见[GeoNames 下载目录](https://download.geonames.org/export/dump/)。
