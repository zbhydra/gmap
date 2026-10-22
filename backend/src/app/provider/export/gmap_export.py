"""CAS Google Export：并行 item，按完成顺序交由 Runtime 单写 CSV。"""

import asyncio
import re
from collections.abc import AsyncGenerator
from dataclasses import replace

from app.constants.gmap_collector import GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
from app.i18n.common_code import CommonCode
from app.provider.export.export_base import (
    EXPORT_ITEM_SOURCE_COLUMNS,
    ExportColumn,
    ExportExecutionItem,
    ExportProviderRequest,
    ExportProviderPage,
    ExportRecord,
    ExportCellValue,
)
from app.provider.gmap.collector_client import GmapCollectorError, gmap_collector_client
from app.provider.gmap.enrich import enrich_places
from app.provider.gmap.types import GmapPlaceEntry
from app.schemas.export_item_schema import GmapSearchItem
from app.schemas.gmap_collector_schema import GmapCollectorConfig
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.utils.logger import logger

_COLUMN_KEYS = (
    "business_id",
    "name",
    "address",
    "street",
    "municipality",
    "categories",
    "about",
    "phone",
    "phones",
    "claimed",
    "owner",
    "owner_id",
    "owner_link",
    "rating",
    "review_count",
    "review_url",
    "cid",
    "fid",
    "website",
    "domain",
    "latitude",
    "longitude",
    "featured_image",
    "time_zone",
    "opening_hours",
    "google_knowledge_url",
    "kgmid",
    "google_maps_url",
    "place_id",
    "emails",
    "facebook",
    "instagram",
    "youtube",
    "tiktok",
    "linkedin",
    "twitter",
    "keyword",
)


def _record(entry: GmapPlaceEntry) -> ExportRecord:
    return {
        "business_id": entry.fid,
        "name": entry.name,
        "address": entry.full_address,
        "street": entry.street,
        "municipality": entry.municipality,
        "categories": list(entry.categories),
        "about": entry.about,
        "phone": entry.phone,
        "phones": ", ".join(entry.phones),
        "claimed": "YES" if entry.owner_id else None,
        "owner": entry.owner,
        "owner_id": entry.owner_id,
        "owner_link": entry.owner_link,
        "rating": entry.average_rating,
        "review_count": entry.review_count,
        "review_url": entry.review_url,
        "cid": entry.cid,
        "fid": entry.fid,
        "website": (
            re.sub(r"^https?://", "", entry.website, flags=re.I)
            if entry.website
            else None
        ),
        "domain": entry.domain,
        "latitude": entry.latitude,
        "longitude": entry.longitude,
        "featured_image": entry.featured_image,
        "time_zone": entry.time_zone,
        "opening_hours": ", ".join(
            f"{day.name}: [{', '.join(day.values)}]" for day in entry.opening_hours
        ),
        "google_knowledge_url": entry.google_knowledge_url,
        "kgmid": entry.kgmid,
        "google_maps_url": entry.google_maps_url,
        "place_id": entry.place_id,
        "emails": list(entry.emails),
        "keyword": entry.search_keyword,
        **{platform: url for platform, url in entry.medias.items()},
    }


class GmapExportProvider:
    source_columns = EXPORT_ITEM_SOURCE_COLUMNS
    columns = tuple(ExportColumn(key=key, header=key) for key in _COLUMN_KEYS)

    def execution_items(
        self, request: ExportProviderRequest
    ) -> tuple[ExportExecutionItem, ...]:
        return tuple(
            ExportExecutionItem(
                source=(
                    str(index),
                    item.keyword,
                    str(item.viewport.lat) if item.viewport else None,
                    str(item.viewport.lng) if item.viewport else None,
                    str(item.viewport.zoom) if item.viewport else None,
                ),
                limit=request.options.max_results_per_item,
            )
            for index, item in enumerate(request.options.items)
        )

    async def _collect_item(
        self,
        request: ExportProviderRequest,
        index: int,
        item: GmapSearchItem,
        config: GmapCollectorConfig,
    ) -> ExportProviderPage:
        records: tuple[ExportRecord, ...] = ()
        error_code: int | None = None
        try:
            async with asyncio.timeout_at(request.deadline):
                viewport = item.viewport
                response = await gmap_collector_client.search_item(
                    config,
                    job_no=request.job_no,
                    run_no=request.run_no,
                    item_index=index,
                    deadline=request.deadline,
                    mode="export",
                    keyword=item.keyword,
                    max_results=request.options.max_results_per_item,
                    google_hl=request.options.export_locale,
                    region=None,
                    viewport=viewport.model_dump() if viewport else None,
                    proxies=config.proxies[:3],
                )
                if response.status == "failed":
                    raise GmapCollectorError("search_failed")
                result = response.result
                # 保留 CAS 的单 item 授权上限，再由 Runtime 做整个 Job 去重。
                result = replace(
                    result,
                    entries=result.entries[: request.options.max_results_per_item],
                )
                if not request.include_contacts:
                    result = replace(
                        result,
                        entries=[
                            replace(entry, emails=[], medias={})
                            for entry in result.entries
                        ],
                    )
                records = tuple(
                    _record(replace(entry, search_keyword=item.keyword))
                    for entry in result.entries
                )
            if request.include_contacts:
                # 执行仍截止于 D；已受理补全只在既有余量内接收。
                async with asyncio.timeout_at(
                    request.deadline + GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
                ):
                    result = await enrich_places(
                        result,
                        config=config,
                        job_no=request.job_no,
                        run_no=request.run_no,
                        item_index=index,
                        deadline=request.deadline,
                    )
                records = tuple(
                    _record(replace(entry, search_keyword=item.keyword))
                    for entry in result.entries
                )
            if result.partial:
                error_code = CommonCode.EXPORT_PARTIAL_RESULT.value
        except Exception:
            logger.error(
                "gmap_export: item 采集失败 job_no=%s run_no=%s item=%s",
                request.job_no,
                request.run_no,
                index,
                exc_info=True,
            )
            error_code = CommonCode.EXPORT_TARGET_FAILED.value
        return ExportProviderPage(
            records=records, item_index=index, item_error_code=error_code
        )

    async def start(
        self, request: ExportProviderRequest
    ) -> AsyncGenerator[ExportProviderPage, None]:
        config = await gmap_collector_config_service.get_config()
        completed = {item.item_index for item in request.item_results if item.completed}
        tasks = [
            asyncio.create_task(self._collect_item(request, index, item, config))
            for index, item in enumerate(request.options.items)
            if index not in completed
        ]
        try:
            for task in asyncio.as_completed(tasks):
                yield await task
        finally:
            for task in tasks:
                if not task.done():
                    task.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)

    def record_to_row(self, record: ExportRecord) -> tuple[ExportCellValue, ...]:
        cells: list[ExportCellValue] = []
        for key in _COLUMN_KEYS:
            value = record.get(key)
            if isinstance(value, list):
                value = ", ".join(str(item) for item in value)
            if value is not None and not isinstance(value, (str, int, float, bool)):
                raise TypeError(f"gmap_export: invalid cell key={key}")
            cells.append(value)
        return tuple(cells)


gmap_export_provider = GmapExportProvider()
