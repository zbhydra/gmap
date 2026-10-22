"""Run 的 CSV 检查点与固定产物；无计费副本或历史基线。"""

from pydantic import BaseModel, Field

from app.schemas.export_item_schema import ExportItemResult


class ExportRunCheckpoint(BaseModel):
    csv_size_bytes: int = Field(default=0, ge=0)
    output_count: int = Field(default=0, ge=0)
    columns: list[str] = Field(default_factory=list)
    item_results: list[ExportItemResult] = Field(default_factory=list)


class ExportRunResult(BaseModel):
    object_key: str
    size_bytes: int = Field(ge=0)
    output_count: int = Field(ge=0)
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    columns: list[str]
