"""同步采集公开入参；REST 与 MCP 共用业务校验。"""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.provider.gmap.types import GmapViewport

MapsFid = Annotated[
    str,
    StringConstraints(
        pattern=r"^0x[0-9a-fA-F]{12,20}:0x[0-9a-fA-F]{12,20}$", to_lower=True
    ),
]


class MapsSearchRequest(BaseModel):
    q: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=300)
    ]
    page: int = Field(default=1, ge=1, le=10)
    hl: str = Field(default="en", min_length=1, max_length=16)
    ll: GmapViewport | None = None
    extra: bool = False

    @field_validator("ll", mode="before", json_schema_input_type=str | None)
    @classmethod
    def parse_viewport(cls, value: object) -> GmapViewport | None:
        if value is None:
            return None
        if not isinstance(value, str) or not value.startswith("@"):
            raise ValueError("ll 必须使用 @lat,lng,zoom 格式")
        lat_text, lng_text, zoom_text = value[1:].split(",")
        lat, lng, zoom = float(lat_text), float(lng_text), int(zoom_text)
        if not (-90 <= lat <= 90 and -180 <= lng <= 180 and 1 <= zoom <= 21):
            raise ValueError("ll 坐标或缩放级别超出范围")
        return GmapViewport(lat, lng, zoom)


class MapsReviewsRequest(BaseModel):
    fid: MapsFid
    cursor: str | None = None
    sort_by: Literal[1, 2, 3, 4] = 1
    hl: str = Field(default="en", min_length=1, max_length=16)


class MapsPhotosRequest(BaseModel):
    fid: MapsFid
    max_results: int = Field(default=200, ge=1)


class McpSearchRequest(MapsSearchRequest):
    # MCP 沿参考使用严格机器合同，未知身份与权限字段不得被接受。
    model_config = ConfigDict(extra="forbid")


class McpReviewsRequest(MapsReviewsRequest):
    model_config = ConfigDict(extra="forbid")


class McpPhotosRequest(MapsPhotosRequest):
    model_config = ConfigDict(extra="forbid")
