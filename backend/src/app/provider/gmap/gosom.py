"""gosom 单关键词 job 的异步提交、查询与共享 DTO 映射。"""

import asyncio
import json
from typing import Literal
from uuid import uuid4

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import RequestException
from traffic_scope import current_scope

from app.provider.gmap.types import (
    GmapNamedValues,
    GmapParseError,
    GmapPlaceEntry,
    GmapRequestError,
    GmapViewport,
    GosomJobHandle,
    GosomJobSnapshot,
)
from app.schemas.admin_schema import GosomApiItem
from app.utils.logger import logger

JsonValue = None | bool | int | float | str | list["JsonValue"] | dict[str, "JsonValue"]

_STATUS_MAP: dict[str, Literal["pending", "running", "completed", "failed"]] = {
    "available": "pending",
    "scheduled": "pending",
    "retryable": "pending",
    "pending": "pending",
    "running": "running",
    "completed": "completed",
    "failed": "failed",
    "cancelled": "failed",
    "discarded": "failed",
}


def _text(value: JsonValue) -> str | None:
    return value if isinstance(value, str) and value else None


def _integer(value: JsonValue) -> int | None:
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _number(value: JsonValue) -> float | None:
    return (
        float(value)
        if isinstance(value, (int, float)) and not isinstance(value, bool)
        else None
    )


def _object(value: JsonValue) -> dict[str, JsonValue]:
    return value if isinstance(value, dict) else {}


def _strings(value: JsonValue) -> list[str]:
    return (
        list(dict.fromkeys(item for item in value if isinstance(item, str)))
        if isinstance(value, list)
        else []
    )


def _hours(value: JsonValue) -> list[GmapNamedValues]:
    if not isinstance(value, dict):
        return []
    return [
        GmapNamedValues(name, _strings(periods))
        for name, periods in value.items()
        if isinstance(name, str)
    ]


def _entry(row: JsonValue, keyword: str) -> GmapPlaceEntry:
    if not isinstance(row, dict):
        raise GmapParseError("gmap gosom get_job: completed result is not an object")
    name = _text(row.get("title"))
    fid = _text(row.get("data_id"))
    if not name or not fid:
        raise GmapParseError(
            "gmap gosom get_job: completed result lacks title or data_id"
        )
    address = _object(row.get("complete_address"))
    owner = _object(row.get("owner"))
    longitude = _number(row.get("longitude"))
    if longitude is None:
        longitude = _number(row.get("longtitude"))
    return GmapPlaceEntry(
        name=name,
        fid=fid,
        search_keyword=keyword,
        full_address=_text(row.get("address")),
        street=_text(address.get("street")),
        municipality=_text(address.get("city")),
        categories=_strings(row.get("categories")),
        phone=_text(row.get("phone")),
        owner=_text(owner.get("name")),
        owner_id=_text(owner.get("id")),
        owner_link=_text(owner.get("link")),
        review_count=_integer(row.get("review_count")),
        average_rating=_number(row.get("review_rating")),
        review_url=_text(row.get("reviews_link")),
        cid=_text(row.get("cid")),
        latitude=_number(row.get("latitude")),
        longitude=longitude,
        featured_image=_text(row.get("thumbnail")),
        time_zone=_text(row.get("timezone")),
        website=_text(row.get("web_site")),
        opening_hours=_hours(row.get("open_hours")),
        google_maps_url=_text(row.get("link")),
        place_id=_text(row.get("place_id")),
    )


def _payload(body: str, operation: str) -> dict[str, JsonValue]:
    try:
        value: JsonValue = json.loads(body)
    except json.JSONDecodeError as exc:
        raise GmapParseError(
            f"gmap gosom {operation}: response JSON is invalid at pos={exc.pos}"
        ) from exc
    if not isinstance(value, dict):
        raise GmapParseError(f"gmap gosom {operation}: response is not an object")
    return value


class _GmapGosomProvider:
    """调用配置指定的 gosom API，不持有或轮询 job 状态。"""

    async def submit_job(
        self,
        config: GosomApiItem,
        keyword: str,
        max_depth: int,
        lang: str,
        viewport: GmapViewport | None = None,
    ) -> GosomJobHandle:
        request_id = uuid4().hex
        scope = current_scope.get()
        request_payload: dict[str, str | int] = {
            "keyword": keyword,
            "lang": lang,
            "max_depth": max_depth,
        }
        if viewport is not None:
            request_payload["geo_coordinates"] = f"{viewport.lat},{viewport.lng}"
            request_payload["zoom"] = int(viewport.zoom)
        try:
            async with AsyncSession() as session:
                response = await session.post(
                    f"{config.base_url}/api/v1/scrape",
                    headers={"X-API-Key": config.api_key},
                    json=request_payload,
                    timeout=120,
                )
        except (RequestException, asyncio.TimeoutError) as exc:
            logger.warning(
                "gmap_gosom.submit: scope=%s request=%s error=%s",
                scope.scope_id if scope else "unscoped",
                request_id,
                type(exc).__name__,
            )
            raise GmapRequestError(
                "gmap gosom submit_job: request failed: " f"reason={type(exc).__name__}"
            ) from exc
        logger.info(
            "gmap_gosom.submit: scope=%s request=%s status=%s",
            scope.scope_id if scope else "unscoped",
            request_id,
            response.status_code,
        )
        if response.status_code != 202:
            raise GmapRequestError(
                "gmap gosom submit_job: unexpected response status: "
                f"status={response.status_code}"
            )
        payload = _payload(response.text, "submit_job")
        job_id = _text(payload.get("job_id"))
        if not job_id or payload.get("status") != "pending":
            raise GmapParseError(
                "gmap gosom submit_job: response lacks valid job_id or pending status"
            )
        return GosomJobHandle(job_id=job_id)

    async def get_job(
        self, config: GosomApiItem, handle: GosomJobHandle
    ) -> GosomJobSnapshot:
        request_id = uuid4().hex
        scope = current_scope.get()
        try:
            async with AsyncSession() as session:
                response = await session.get(
                    f"{config.base_url}/api/v1/jobs/{handle.job_id}",
                    headers={"X-API-Key": config.api_key},
                    timeout=120,
                )
        except (RequestException, asyncio.TimeoutError) as exc:
            logger.warning(
                "gmap_gosom.get: scope=%s request=%s error=%s",
                scope.scope_id if scope else "unscoped",
                request_id,
                type(exc).__name__,
            )
            raise GmapRequestError(
                "gmap gosom get_job: request failed: "
                f"job_id={handle.job_id}, reason={type(exc).__name__}"
            ) from exc
        logger.info(
            "gmap_gosom.get: scope=%s request=%s status=%s",
            scope.scope_id if scope else "unscoped",
            request_id,
            response.status_code,
        )
        if response.status_code != 200:
            raise GmapRequestError(
                "gmap gosom get_job: unexpected response status: "
                f"job_id={handle.job_id}, status={response.status_code}"
            )
        payload = _payload(response.text, "get_job")
        upstream_status = _text(payload.get("status"))
        status = _STATUS_MAP.get(upstream_status or "")
        result_count = _integer(payload.get("result_count"))
        if status is None or result_count is None or result_count < 0:
            raise GmapParseError(
                "gmap gosom get_job: response has invalid status or result_count: "
                f"job_id={handle.job_id}"
            )
        if status == "completed":
            keyword = _text(payload.get("keyword"))
            results = payload.get("results")
            if not keyword or not isinstance(results, list):
                raise GmapParseError(
                    "gmap gosom get_job: completed response lacks keyword or results: "
                    f"job_id={handle.job_id}"
                )
            return GosomJobSnapshot(
                status=status,
                result_count=result_count,
                entries=[_entry(row, keyword) for row in results],
                error=None,
            )
        if status == "failed":
            error = _text(payload.get("error"))
            if not error:
                raise GmapParseError(
                    "gmap gosom get_job: failed response lacks error: "
                    f"job_id={handle.job_id}"
                )
            return GosomJobSnapshot(status, result_count, None, error)
        return GosomJobSnapshot(status, result_count, None, None)


gmap_gosom_provider = _GmapGosomProvider()

__all__ = ["gmap_gosom_provider"]
