"""Online 创建输入与公开任务摘要；内部执行状态不进入响应。"""

from typing import Literal, Self

from pydantic import BaseModel, Field, field_validator, model_validator

from app.constants.maps_online import MAX_LOGICAL_SAMPLES
from app.models.maps_online_task_model import MapsOnlineTaskModel


class MapsOnlinePreviewRequest(BaseModel):
    keyword: str

    @field_validator("keyword")
    @classmethod
    def normalize_keyword(cls, keyword: str) -> str:
        keyword = keyword.strip()
        if not 1 <= len(keyword) <= 500 or len(keyword.splitlines()) != 1:
            raise ValueError("关键词须为 1–500 字符的单行文本")
        return keyword


class MapsOnlineViewport(BaseModel):
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lng: float = Field(ge=-180, le=180, allow_inf_nan=False)
    zoom: int = Field(ge=1, le=21, strict=True)


class MapsOnlineCreateRequest(BaseModel):
    keywords: list[str]
    include_contacts: bool = True
    search_viewports: list[MapsOnlineViewport] | None = None

    @field_validator("keywords")
    @classmethod
    def normalize_keywords(cls, keywords: list[str]) -> list[str]:
        keywords = list(
            dict.fromkeys(word.strip() for word in keywords if word.strip())
        )
        if not keywords or any(len(word) > 500 for word in keywords):
            raise ValueError("关键词不能为空，且每项不能超过 500 字符")
        return keywords

    @field_validator("search_viewports")
    @classmethod
    def normalize_viewports(
        cls, viewports: list[MapsOnlineViewport] | None
    ) -> list[MapsOnlineViewport] | None:
        if viewports is None:
            return None
        if not viewports:
            raise ValueError("地图视口不能为空数组")
        seen: set[tuple[float, float, int]] = set()
        result: list[MapsOnlineViewport] = []
        for point in viewports:
            key = (point.lat, point.lng, point.zoom)
            if key not in seen:
                seen.add(key)
                result.append(point)
        return result

    @model_validator(mode="after")
    def check_sample_budget(self) -> Self:
        if (
            self.search_viewports is not None
            and len(self.keywords) * len(self.search_viewports) > MAX_LOGICAL_SAMPLES
        ):
            raise ValueError("地图逻辑搜索采样数超过 50")
        return self


class MapsOnlineTaskSummary(BaseModel):
    task_no: str
    status: Literal["processing", "completed"]
    total_count: int
    processed_count: int
    record_count: int
    created_at: int

    @classmethod
    def from_task(cls, task: MapsOnlineTaskModel) -> "MapsOnlineTaskSummary":
        return cls(
            task_no=task.task_no,
            status="completed" if task.completed_at else "processing",
            total_count=task.total_count,
            processed_count=task.processed_count,
            record_count=task.record_count,
            created_at=task.created_at,
        )


class MapsOnlineItemSummary(BaseModel):
    item_id: int = Field(validation_alias="id")
    sequence: int
    keyword: str
    record_count: int
