# 地区数据来源

本目录的 `countries.json` 和各国 `XX.json` 由 `website/scripts/generate-gmap-regions.mjs` 从 GeoNames 的 `countryInfo.txt`、`admin1CodesASCII.txt`、`cities500.zip` 生成。重新生成：在 `website/` 运行 `node scripts/generate-gmap-regions.mjs`；脚本下载原始文件到系统临时目录，生成后删除下载包。

来源与许可：[GeoNames Data](https://www.geonames.org/export/) 声明数据为 CC BY、允许商业使用，要求使用时署名并链接 GeoNames；原始文件见 [GeoNames 下载目录](https://download.geonames.org/export/dump/)。网站地区选择器显示 GeoNames 署名。城市范围以 `cities500.zip` 实际记录为准，不代表所有城市。

生成时仅保留国家代码/名称、一级行政区代码/名称、城市名称/所属一级行政区代码。按国家拆分，用户选择该国后才加载相应 JSON。
