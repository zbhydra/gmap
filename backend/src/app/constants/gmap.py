"""gmap 采集引擎配置常量。

gmap 引擎支持 http / gosom 双 provider 抓取 Google Maps,
后台系统设置负责维护引擎选择、代理 URL 列表与每进程并发预算,抓取调用方按此读取配置。
"""

# system_data 中 gmap 引擎配置的 data_key;
# data_value 固定为 JSON 对象
# {"provider": "http"|"gosom", "proxies": list[str], "concurrency": int},
# 明文存储(与 gosom_api 同口径,admin 明文存储是既有运维决策)。
GMAP_ENGINE_DATA_KEY = "gmap_engine"

# 每个 business 进程的 Google 出站并发预算默认值。
GMAP_ENGINE_DEFAULT_CONCURRENCY = 32
