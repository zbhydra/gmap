"""Maps Extractor Email/社媒补全常量（013 A4，U8）。

enrich 为服务端自研（基线 #4）：fetch 商家官网 + 正则抽取 Email、按外链
域名抽取社媒链接，不依赖第三方数据源。同 domain 结果 Redis 缓存（复用
spec-redis §2 key 规范，service 层经 ``build_redis_key`` 包裹）。
"""

# 缓存业务子键前缀（全局前缀由 build_redis_key 包裹）。
_ENRICH_CACHE_KEY_PREFIX = "maps:enrich"

# 缓存 TTL（秒）：官网内容低频变化，7 天内同域名不重复爬取。
_ENRICH_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60

# 批内并发上限（信号量）：同时抓取的站点数，防对外网瞬时放大。
ENRICH_CONCURRENCY = 5

# 单批总时长上限（秒）：超时未完成的条目返回空结果并置 partial=true。
# 取 25s：压在插件端 enrich RPC 的 30s 超时之下，留网络往返与响应体传输余量，
# 避免服务端仍在算而客户端已断（白爬）。
ENRICH_BATCH_BUDGET_SECONDS = 25.0

# 单站预算（秒）：含最多 3 跳重定向的单站完整抓取窗口。
ENRICH_SITE_BUDGET_SECONDS = 12.0

# httpx 单跳超时（秒）：connect/读/写分开，读超时是主要约束。
ENRICH_FETCH_TIMEOUT = 8.0

# 单站 HTML 大小上限（字节）：超出截断解析（footer 外链/邮箱通常在前部）。
ENRICH_MAX_HTML_BYTES = 2 * 1024 * 1024

# 重定向跟随上限（每跳重新过 SSRF 校验）。
ENRICH_MAX_REDIRECTS = 3

# 单商家最多返回的邮箱数（防脏页面放大响应体）。
ENRICH_MAX_EMAILS = 5


def normalize_cache_domain(domain: str) -> str | None:
    """归一化并校验缓存键用的域名；非法（含端口/路径/非法字符）返回 None。

    缓存键直接拼接域名，必须约束在 ``[a-z0-9.-]`` 内防 key 注入与歧义；
    校验失败的域名仍可正常抓取，只是不走缓存。
    """

    normalized = domain.strip().lower().rstrip(".")
    if not normalized or len(normalized) > 253:
        return None
    if not all(char.isalnum() or char in ".-" for char in normalized):
        return None
    if "." not in normalized:
        return None
    return normalized


def build_enrich_cache_key(domain: str) -> str:
    """构建同 domain 结果缓存业务子键（无全局前缀；service 层负责包裹）。"""

    return f"{_ENRICH_CACHE_KEY_PREFIX}:{normalize_cache_domain(domain) or 'invalid'}"


def enrich_cache_ttl_seconds() -> int:
    """返回 enrich 缓存 TTL（秒）。"""

    return _ENRICH_CACHE_TTL_SECONDS
