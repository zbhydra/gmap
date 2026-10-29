"""Maps Email/社媒补全请求 schema（013 A4，U8）。"""

from pydantic import BaseModel, Field

# 单次补全商家数上限：与插件端分批大小一致（一批 = enrich 端点一次请求）。
MAX_ENRICH_BUSINESSES = 50


class MapsEnrichBusiness(BaseModel):
    """待补全的单条商家；抓取与缓存归属均从官网 URL 推导，空串返回空结果。"""

    website: str = Field(default="", description="官网 URL，省略协议时使用 HTTPS")
    name: str = Field(
        default="", description="商家名（预留：搜索兜底数据源用，当前未消费）"
    )
    address: str = Field(default="", description="地址（预留：同上）")


class MapsEnrichRequest(BaseModel):
    """Email/社媒补全请求体：单批商家数组。"""

    businesses: list[MapsEnrichBusiness] = Field(
        ...,
        max_length=MAX_ENRICH_BUSINESSES,
        description=f"商家数组（单批上限 {MAX_ENRICH_BUSINESSES} 条，与插件分批一致）",
    )
