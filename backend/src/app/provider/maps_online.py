"""Online 单关键词采集、官网补全和 CSV 对象交付。"""

import asyncio
import csv
import re
from collections.abc import Sequence
from io import StringIO
from pathlib import Path
from uuid import uuid4
from zipfile import ZIP_DEFLATED, ZipFile

from app.provider.gmap import gmap_gosom_provider, gmap_http_provider
from app.provider.gmap.rpc.entry import serialize_entry
from app.provider.gmap.types import GmapConfigurationError, GmapRequestError
from app.provider.maps_enrich import maps_enrich_provider
from app.schemas.admin_schema import GmapEngineConfig, GosomApiItem, ObjectStorageItem
from app.schemas.maps_enrich_schema import MapsEnrichBusiness
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
    ) -> tuple[int, str, str]:
        """返回实际记录数、已写入对象 key 和内部 warning；异常由任务层收口。"""
        warnings: list[str] = []
        if self.engine.provider == "http":
            await gmap_http_provider.initialize(self.engine)
            result = await gmap_http_provider.search_places(keyword, 3, "en")
            entries = result.entries
            warnings.extend(result.warnings)
        else:
            if self.gosom is None:
                raise GmapConfigurationError("maps_online.execute: gosom 未配置")
            handle = await gmap_gosom_provider.submit_job(self.gosom, keyword, 3, "en")
            while True:
                await asyncio.sleep(5)
                snapshot = await gmap_gosom_provider.get_job(self.gosom, handle)
                if snapshot.status == "failed":
                    # 上游自由文本可能带凭据，诊断只保留可定位的 job_id。
                    raise GmapRequestError(
                        f"maps_online.execute: gosom job 失败 job_id={handle.job_id}"
                    )
                if snapshot.status == "completed":
                    assert snapshot.entries is not None
                    entries = snapshot.entries
                    break

        rows = [serialize_entry(entry) for entry in entries]
        if include_contacts:
            enriched = await maps_enrich_provider.enrich(
                [
                    MapsEnrichBusiness(
                        domain=entry.domain or "", website=entry.website or ""
                    )
                    for entry in entries
                ],
                proxies=self.engine.proxies,
            )
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
        writer = csv.DictWriter(output, fieldnames=CSV_HEADERS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)

        key = build_object_key(
            "online", created_at, f"{task_no}/{item_id}/{uuid4().hex}.csv"
        )
        await put_object(self.storage, key, output.getvalue().encode("utf-8-sig"))
        return len(entries), key, "; ".join(warnings)
