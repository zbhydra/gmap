"""Google 搜索项与逐项 CSV 提交事实，沿用 CAS 的 item 合同。"""

from pydantic import BaseModel, Field, field_validator, model_validator

from app.constants.export import EXPORT_ITEM_LIMIT
from app.constants.maps_online import MAX_LOGICAL_SAMPLES


class GmapViewport(BaseModel):
    lat: float = Field(ge=-90, le=90, allow_inf_nan=False)
    lng: float = Field(ge=-180, le=180, allow_inf_nan=False)
    zoom: int = Field(ge=1, le=21, strict=True)


class GmapSearchItem(BaseModel):
    keyword: str = Field(min_length=1, max_length=500)
    viewport: GmapViewport | None = None

    @field_validator("keyword")
    @classmethod
    def normalize_keyword(cls, value: str) -> str:
        value = " ".join(value.split())
        if not value:
            raise ValueError("gmap_search: keyword is empty")
        return value


class GmapSearchOptions(BaseModel):
    items: list[GmapSearchItem] = Field(min_length=1, max_length=MAX_LOGICAL_SAMPLES)
    export_locale: str = "en-US"

    @model_validator(mode="after")
    def reject_duplicate_items(self) -> "GmapSearchOptions":
        keys = [
            (
                item.keyword,
                (
                    None
                    if item.viewport is None
                    else (item.viewport.lat, item.viewport.lng, item.viewport.zoom)
                ),
            )
            for item in self.items
        ]
        if len(set(keys)) != len(keys):
            raise ValueError("gmap_search: duplicate keyword and viewport")
        return self

    @property
    def keywords(self) -> list[str]:
        return list(dict.fromkeys(item.keyword for item in self.items))

    @property
    def max_results_per_item(self) -> int:
        return EXPORT_ITEM_LIMIT


class ExportCreateRequest(BaseModel):
    items: list[GmapSearchItem] = Field(min_length=1, max_length=MAX_LOGICAL_SAMPLES)
    include_contacts: bool = True

    @model_validator(mode="after")
    def normalize_items(self) -> "ExportCreateRequest":
        GmapSearchOptions(items=self.items)
        return self


class ExportItemResult(BaseModel):
    item_index: int = Field(ge=0)
    result_count: int = Field(default=0, ge=0)
    completed: bool = False
    error_code: int | None = None
