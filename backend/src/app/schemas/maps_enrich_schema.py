"""Maps Email/社媒补全请求 schema（013 A4，U8）。"""

from pydantic import BaseModel, Field

# 单次补全商家数上限：与插件端分批大小一致（一批 = enrich 端点一次请求）。
MAX_ENRICH_BUSINESSES = 50


class MapsEnrichBusiness(BaseModel):
    """待补全的单条商家（字段与插件端 36 列导出行对应，允许空串）。

    ``domain`` 为空但 ``website`` 非空时，以 website 主机名为归属键抓取；
    两者皆空返回空结果（无官网可抓）。官网 URL 优先取 ``website``，缺省回退
    ``https://{domain}``。
    """

    domain: str = Field(
        default="",
        description="官网域名（归属键优先来源；空串时回退 website 主机名）",
    )
    website: str = Field(default="", description="完整官网 URL（优先于 domain 拼 URL）")
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
