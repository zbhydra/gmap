# 地区数据来源

本目录的 `countries.json` 和各国 `XX.json` 由 `website/scripts/generate-gmap-regions.mjs` 从 GeoNames 的 `countryInfo.txt`、`admin1CodesASCII.txt`、`cities500.zip` 生成。重新生成：在 `website/` 运行 `node scripts/generate-gmap-regions.mjs`；脚本下载原始文件到系统临时目录，生成后删除下载包。

来源与许可：[GeoNames Data](https://www.geonames.org/export/) 声明数据为 CC BY、允许商业使用，要求使用时署名并链接 GeoNames；原始文件见 [GeoNames 下载目录](https://download.geonames.org/export/dump/)。网站地区选择器显示 GeoNames 署名。城市范围以 `cities500.zip` 实际记录为准，不代表所有城市。

生成时仅保留国家代码/名称、一级行政区代码/名称、城市名称/所属一级行政区代码。按国家拆分，用户选择该国后才加载相应 JSON。

`map-locations.json` 为地图定位使用的独立快照，取自 CAS 官网 `src/lib/gmap-locator-countries.ts` 的 `GMAP_LOCATOR_COUNTRIES` 和 `src/data/gmap-regions/{id}.json`。只保留有有效坐标的英文地区路径与经纬度，路径以分层数组保存，按路径去重、排序，坐标保留六位小数。首次展开区域选择器时加载，并按路径重建国家 → 州/省 → 城市的层级；父级缺少独立坐标时仍可下钻选择城市。选中区域的代表点作为搜索中心，实际搜索范围由半径决定，并不覆盖整个行政区。
