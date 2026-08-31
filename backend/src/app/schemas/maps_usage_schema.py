"""Maps 用量计量请求 schema（013 A11，U7）。"""

from pydantic import BaseModel, Field

# 单次上报记录数上限：防脏数据放大配额计数（单次搜索/评论/照片采集的合理上界）。
MAX_REPORT_RECORDS = 1_000_000


class MapsUsageReportRequest(BaseModel):
    """采集完成上报请求。

    ``request_id`` 由插件为每个采集会话生成（UUID），服务端以其做幂等键：
    同一会话重复上报（网络重试/批量恢复）只扣减一次。
    """

    records: int = Field(
        ...,
        gt=0,
        le=MAX_REPORT_RECORDS,
        description="本次采集的记录数（搜索行/评论条/照片张）",
    )
    request_id: str = Field(
        ...,
        pattern=r"^[A-Za-z0-9_-]{8,64}$",
        description="采集会话幂等 ID（插件生成的 UUID）",
    )
