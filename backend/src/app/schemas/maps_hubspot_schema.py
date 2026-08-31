"""Maps 插件 HubSpot 同步请求模型（013 A10，U9）。"""

from pydantic import BaseModel, Field


class MapsHubspotBusiness(BaseModel):
    """同步到 HubSpot companies 的单条商家（字段与插件端契约一致，允许空串）。"""

    name: str = Field(default="", description="商家名")
    domain: str = Field(default="", description="官网域名")
    phone: str = Field(default="", description="主电话")
    address: str = Field(default="", description="街道地址（缺街道时为完整地址）")
    city: str = Field(default="", description="市镇")


class MapsHubspotSyncRequest(BaseModel):
    """HubSpot 同步代理请求体：插件传用户 access token 与商家数组。"""

    token: str = Field(..., min_length=1, description="用户 HubSpot OAuth access token")
    businesses: list[MapsHubspotBusiness] = Field(
        ...,
        max_length=500,
        description="商家数组（Place Id 去重后，单次上限与插件批量任务一致）",
    )
