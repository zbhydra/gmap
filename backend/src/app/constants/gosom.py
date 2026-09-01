"""gosom 抓取引擎接入常量。

gosom/google-maps-scraper(SaaS Edition)是云端抓取引擎选型(014 / ROADMAP B4),
后台系统设置负责维护其 API 地址与 Key,抓取调用方按此读取配置。
"""

# system_data 中 gosom API 配置的 data_key;
# data_value 固定为 JSON 数组 [{"base_url": str, "api_key": str, "weight": int}],明文存储,
# 抓取调用方按 weight 加权随机选择一条使用(见 gosom_api_service.pick)。
GOSOM_API_DATA_KEY = "gosom_api"
