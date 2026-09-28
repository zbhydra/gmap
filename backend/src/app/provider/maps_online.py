"""Online 单关键词采集、官网补全和 CSV 对象交付。"""

import asyncio
import csv
import re
from collections.abc import Sequence
from io import StringIO
from pathlib import Path
from time import perf_counter
from uuid import uuid4
from zipfile import ZIP_DEFLATED, ZipFile

from app.constants.maps_online import DELIVERY_TIMEOUT_SECONDS
from app.i18n.dependencies import DEFAULT_LANGUAGE, SupportedLanguage
from app.i18n.translator import translator
from app.provider.gmap import gmap_gosom_provider, gmap_http_provider
from app.provider.gmap.rpc.entry import serialize_entry
from app.provider.gmap.types import (
    GmapConfigurationError,
    GmapPlaceEntry,
    GmapRequestError,
    GmapViewport,
)
from app.provider.maps_enrich import maps_enrich_provider
from app.schemas.admin_schema import GmapEngineConfig, GosomApiItem, ObjectStorageItem
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
from app.utils.logger import logger
from app.utils.object_storage import (
    build_object_key,
    download_file,
    presign_get,
    put_object,
)

# 列名与顺序沿用 tests/fixtures/gmap/scripts/stress_test.py 的 CSV_HEADERS。
CSV_HEADERS = [
    "Name",
    "Fulladdress",
    "Street",
    "Municipality",
    "Categories",
    "About",
    "Phone",
    "Phones",
    "Claimed",
    "Owner",
    "Owner Id",
    "Owner Link",
    "Review Count",
    "Average Rating",
    "Review URL",
    "Cid",
    "Fid",
    "Latitude",
    "Longitude",
    "Featured Image",
    "Time Zone",
    "Website",
    "Domain",
    "Opening Hours",
    "Google Knowledge URL",
    "Kgmid",
    "Google Maps URL",
    "Place Id",
    "Emails",
    "Facebook Links",
    "Instagram Links",
    "Youtube Links",
    "Tiktok Links",
    "Linkedin Links",
    "Twitter Links",
    "Search Keyword",
]


class MapsOnlineProvider:
    def __init__(
        self,
        engine: GmapEngineConfig,
        storage: ObjectStorageItem,
        gosom: GosomApiItem | None = None,
    ) -> None:
        self.engine = engine
        self.storage = storage
        self.gosom = gosom

    @staticmethod
    def download_filename(item_id: int, keyword: str) -> str:
        keyword = re.sub(r'[\x00-\x1f\x7f-\x9f/\\<>:"|?*]', "", keyword).strip(" .")
        prefix = str(item_id)
        # 预留 ID、下划线与扩展名，按完整 UTF-8 字符截断。
        keyword = keyword.encode("utf-8")[: 200 - len(prefix) - 5].decode(
            "utf-8", errors="ignore"
        )
        return f"{prefix}_{keyword}.csv" if keyword else f"{prefix}.csv"

    @staticmethod
    async def sign_download(
        storage: ObjectStorageItem, *, item_id: int, keyword: str, object_key: str
    ) -> tuple[str, str]:
        filename = MapsOnlineProvider.download_filename(item_id, keyword)
        url = await presign_get(storage, object_key, filename=filename)
        return url, filename

    @staticmethod
    async def download_zip(
        storage: ObjectStorageItem,
        files: Sequence[tuple[int, str, str]],
        directory: Path,
    ) -> Path:
        paths = []
        for item_id, keyword, key in files:
            path = directory / MapsOnlineProvider.download_filename(item_id, keyword)
            await download_file(storage, key, path)
            paths.append(path)
        archive = directory / "result.zip"

        def compress() -> None:
            with ZipFile(archive, "w", ZIP_DEFLATED) as output:
                for path in paths:
                    output.write(path, path.name)

        await asyncio.to_thread(compress)
        return archive

    async def execute(
        self,
        keyword: str,
        *,
        created_at: int,
        task_no: str,
        item_id: int,
        include_contacts: bool,
        deadline: float,
        csv_language: SupportedLanguage = DEFAULT_LANGUAGE,
        search_viewports: Sequence[GmapViewport] | None = None,
    ) -> tuple[int, str, str]:
        """返回实际记录数、已写入对象 key 和内部 warning；异常由任务层收口。"""
        stage_started = perf_counter()
        logger.info(
            "maps_online.execute: task=%s item=%s stage=start keyword=%r include_contacts=%s",
            task_no,
            item_id,
            keyword,
            include_contacts,
        )
        warnings: list[str] = []
        entries: list[GmapPlaceEntry] = []
        seen: set[str] = set()
        successes = 0
        last_error: Exception | None = None
        if self.engine.provider == "http":
            async with asyncio.timeout_at(deadline):
                await gmap_http_provider.initialize(self.engine)
        elif self.gosom is None:
            raise GmapConfigurationError("maps_online.execute: gosom 未配置")

        for index, viewport in enumerate(search_viewports or (None,)):
            if asyncio.get_running_loop().time() >= deadline:
                warnings.append("map_sampling_deadline")
                break
            try:
                async with asyncio.timeout_at(deadline):
                    if self.engine.provider == "http":
                        result = await gmap_http_provider.search_places(
                            keyword,
                            3,
                            "en",
                            ll=viewport,
                            request_id=(
                                f"{task_no}:{item_id}:{index}"
                                if search_viewports is not None
                                else f"{task_no}:{item_id}"
                            ),
                        )
                        sample_entries = result.entries
                        warnings.extend(result.warnings)
                    else:
                        assert self.gosom is not None
                        handle = await gmap_gosom_provider.submit_job(
                            self.gosom, keyword, 3, "en", viewport
                        )
                        while True:
                            await asyncio.sleep(5)
                            snapshot = await gmap_gosom_provider.get_job(
                                self.gosom, handle
                            )
                            if snapshot.status == "failed":
                                raise GmapRequestError(
                                    f"maps_online.execute: gosom job 失败 job_id={handle.job_id}"
                                )
                            if snapshot.status == "completed":
                                assert snapshot.entries is not None
                                sample_entries = snapshot.entries
                                break
            except Exception as exc:
                if search_viewports is None:
                    raise
                last_error = exc
                warnings.append(
                    "map_sampling_deadline"
                    if isinstance(exc, TimeoutError)
                    else f"map_sample_failed:{index}:{type(exc).__name__}"
                )
                if isinstance(exc, TimeoutError):
                    break
                continue
            successes += 1
            for entry in sample_entries:
                if entry.fid not in seen:
                    seen.add(entry.fid)
                    entries.append(entry)
        if successes == 0:
            raise last_error or TimeoutError("maps_online.execute: 所有地图采样均失败")
        logger.info(
            "maps_online.execute: task=%s item=%s stage=maps duration_ms=%.2f records=%s",
            task_no,
            item_id,
            (perf_counter() - stage_started) * 1000,
            len(entries),
        )
        stage_started = perf_counter()
        if include_contacts:
            try:
                enriched = await maps_enrich_provider.enrich(
                    [
                        MapsEnrichBusiness(
                            domain=entry.domain or "", website=entry.website or ""
                        )
                        for entry in entries
                    ],
                    proxies=self.engine.proxies,
                    batch_timeout=max(0, deadline - asyncio.get_running_loop().time()),
                )
            except Exception:
                logger.error(
                    "maps_online.execute: task=%s item=%s 补全失败，继续交付基础结果",
                    task_no,
                    item_id,
                    exc_info=True,
                )
                enriched = None
                warnings.append("contact_supplement_failed")
            else:
                if enriched is not None and enriched["partial"]:
                    warnings.append("contact_supplement_partial")
        else:
            enriched = None

        logger.info(
            "maps_online.execute: task=%s item=%s stage=contacts duration_ms=%.2f enabled=%s",
            task_no,
            item_id,
            (perf_counter() - stage_started) * 1000,
            include_contacts,
        )

        def build_csv() -> bytes:
            rows = [serialize_entry(entry) for entry in entries]
            if enriched is not None:
                for row, contacts in zip(rows, enriched["results"], strict=True):
                    row["Emails"] = ", ".join(contacts["emails"])
                    for platform in (
                        "Facebook",
                        "Instagram",
                        "Youtube",
                        "Tiktok",
                        "Linkedin",
                        "Twitter",
                    ):
                        row[f"{platform} Links"] = contacts["medias"].get(
                            platform.lower(), ""
                        )
            output = StringIO(newline="")
            writer = csv.DictWriter(
                output, fieldnames=CSV_HEADERS, lineterminator="\r\n"
            )
            writer.writeheader()
            writer.writerow(
                {
                    header: translator.translate(
                        f"maps_online.csv_headers.{header}", csv_language
                    )
                    for header in CSV_HEADERS
                }
            )
            writer.writerows(rows)
            return output.getvalue().encode("utf-8-sig")

        key = build_object_key(
            "online", created_at, f"{task_no}/{item_id}/{uuid4().hex}.csv"
        )
        async with asyncio.timeout(DELIVERY_TIMEOUT_SECONDS):
            stage_started = perf_counter()
            body = await asyncio.to_thread(build_csv)
            logger.info(
                "maps_online.execute: task=%s item=%s stage=csv duration_ms=%.2f bytes=%s",
                task_no,
                item_id,
                (perf_counter() - stage_started) * 1000,
                len(body),
            )
            stage_started = perf_counter()
            await put_object(self.storage, key, body)
            logger.info(
                "maps_online.execute: task=%s item=%s stage=upload duration_ms=%.2f",
                task_no,
                item_id,
                (perf_counter() - stage_started) * 1000,
            )
        return len(entries), key, "; ".join(warnings)
