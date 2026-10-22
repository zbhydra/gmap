"""CAS Google Export 所需的最小执行合同。"""

from dataclasses import dataclass

from app.schemas.export_item_schema import ExportItemResult, GmapSearchOptions

ExportCellValue = str | int | float | bool | None
ExportRecord = dict[str, object]


@dataclass(frozen=True, slots=True)
class ExportColumn:
    key: str
    header: str


EXPORT_ITEM_SOURCE_COLUMNS = tuple(
    ExportColumn(key, key)
    for key in (
        "record_id",
        "item_index",
        "search_keyword",
        "search_latitude",
        "search_longitude",
        "search_zoom",
    )
)


@dataclass(frozen=True)
class ExportExecutionItem:
    source: tuple[str | None, ...]
    limit: int


@dataclass(frozen=True)
class ExportProviderRequest:
    job_no: str
    run_no: str
    options: GmapSearchOptions
    include_contacts: bool
    deadline: float
    item_results: list[ExportItemResult]


@dataclass(frozen=True)
class ExportProviderPage:
    records: tuple[ExportRecord, ...]
    item_index: int
    item_error_code: int | None = None
