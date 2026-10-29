"""调用记录终态摘要：按操作固定字段，只存数量与元数据，不存返回列表或游标。"""

from pydantic import BaseModel

from app.provider.gmap.types import GmapPhotosReason


class ExportApiSearchSummary(BaseModel):
    record_count: int
    warnings: list[str]


class ExportApiReviewsSummary(BaseModel):
    record_count: int
    has_more: bool


class ExportApiPhotosSummary(BaseModel):
    record_count: int
    # 上游报告值，未报告时为 null，不以返回数量代替。
    reported_total: int | None
    reason: GmapPhotosReason


ExportApiJobSummary = (
    ExportApiSearchSummary | ExportApiReviewsSummary | ExportApiPhotosSummary
)
