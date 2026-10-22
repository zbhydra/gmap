# 地图采样与地区批量搜索

## 输入与预算

现有关键词创建入口保持可用。地区模式先生成可编辑的最终查询词，每条最终查询词沿用一个关键词 item 和对应套餐关键词上限。地图模式对同一组关键词共用采样视口：中心、半径和网格间距仅用于生成点位，服务端接收实际点位快照。默认网格间距为 5 km；半径描述要采样的圆，不是商家结果的硬边界。

创建通过 [Export 接口](tech-Online任务与结果.md) 的 `items` 提交关键词与实际视口组合，普通/地区项省略 viewport；重复组合拒绝。不同关键词数按套餐，展开后的采样总数最多 50；options 继续提供 logical_sample_limit。逻辑采样不等于实际 Google HTTP 请求。创建时校验实时关键词权益、月度额度与联系方式权限。

## 网格与视口

前端以中心为首点，以间距为相邻网格中心距离，保留圆内点并按距离由近及远排列。网格使用局部经纬度近似：纬度每公里约 `1/111.32` 度，经度按中心纬度的余弦校正；跨经度边界时归一到 `[-180,180]`。仅将通过范围校验的点提交；超出 50 个逻辑采样时显示完整计算数量并阻止提交，不截尾。

Collector 搜索视口直径沿用已验证公式 `20 km × 2^(14-zoom)`。让搜索直径约为网格间距的两倍，以便相邻采样有重叠；`zoom = round(14 - log2((2 × 间距 km)/20))`，限制在 1–21。默认间距 5 km 对应 zoom 15、约 10 km 搜索直径。此 zoom 是上游查询参数，不控制界面地图的视觉缩放，也不用于过滤返回商家。

## 执行与交付

每个关键词与视口组合成为一个采样 item，真实参数保存在 Job options；同 Job 并行采集并统一去重、生成一份 CSV，首次提交行保留来源关键词。恢复、固定首次期限、原 Collector 调用查询、局部失败与按交付行数计量归 [Export 执行合同](tech-Export与Collector重构.md#3-export-领域与执行)，不在此维护第二套任务模型。

## 资源与来源

地图组件及 Leaflet JS/CSS 仅在用户打开地图模式时加载；地区选择组件和国家 JSON 仅在打开地区模式时加载，选定国家后才请求该国 JSON。普通关键词创建不下载这些资源。地图使用 OSM 官方瓦片地址、展示 [OpenStreetMap 署名](https://www.openstreetmap.org/copyright)，遵守[瓦片访问政策](https://operations.osmfoundation.org/policies/tiles/)；不自建瓦片缓存。

Leaflet 与类型包、GeoNames CC BY 来源均已获批准。CAS 地区快照未找到可复用许可，未复制。地区静态 JSON 由 `website/scripts/generate-gmap-regions.mjs` 从 GeoNames 的 `countryInfo.txt`、`admin1CodesASCII.txt`、`cities500.zip` 生成，按国家拆分；国家和一级行政区取对应源文件，城市仅覆盖 `cities500` 的实际记录，不承诺所有城市。地区选择器展示带链接的 GeoNames 署名；来源、许可与重新生成方式见 `website/src/data/gmap-regions/SOURCE.md`，原始文件见[GeoNames 下载目录](https://download.geonames.org/export/dump/)。
