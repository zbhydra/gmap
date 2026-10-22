"""Collector 四操作与同步/异步 HTTP 边界；连接池归本进程，恢复定位归文件服务。"""

import asyncio
import json
import random
from dataclasses import replace
from typing import Annotated, Literal, cast
from uuid import uuid4

import httpx
from pydantic import BaseModel, Field, JsonValue, TypeAdapter, ValidationError

from app.constants.gmap import GMAP_MEDIA_BUDGET_SECONDS
from app.constants.gmap_collector import (
    GMAP_COLLECTOR_MAX_ATTEMPTS,
    GMAP_COLLECTOR_POLL_SECONDS,
    GMAP_COLLECTOR_QUERY_TIMEOUT_SECONDS,
    GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS,
    GMAP_COLLECTOR_STATS_TIMEOUT_SECONDS,
)
from app.provider.gmap.types import (
    CollectorSearchResponse,
    CollectorSiteContacts,
    GmapPhoto,
    GmapPhotosReason,
    GmapPhotosResult,
    GmapPlaceEntry,
    GmapReview,
    GmapReviewPage,
    GmapSearchResult,
)
from app.schemas.gmap_collector_schema import GmapCollectorConfig, GmapCollectorInstance
from app.services.export_file_service import (
    CollectorCallLocation,
    CollectorOperation,
    export_file_service,
)


class GmapCollectorError(RuntimeError):
    """稳定失败分类，不保留可能含凭据的 HTTP 异常或上游正文。"""

    def __init__(self, reason: str, *, switchable: bool = False) -> None:
        self.reason = reason
        self.switchable = switchable
        super().__init__(reason)


class GmapCollectorDeadlineError(GmapCollectorError):
    """调用方接收预算或 Collector 执行期限已耗尽。"""


class GmapCollectorResponseError(GmapCollectorError):
    """完整响应不符合 operation 或任务信封合同。"""


class _SearchResponse(BaseModel):
    status: Literal["ok", "partial", "failed"]
    entries: list[GmapPlaceEntry]


class _ReviewsResponse(BaseModel):
    status: Literal["ok"]
    reviews: list[GmapReview]
    next_cursor: str | None


class _PhotosResponse(BaseModel):
    status: Literal["partial"]
    photos: list[GmapPhoto] = Field(min_length=1)
    returned_count: int = Field(ge=1)
    reported_total: int | None
    reason: GmapPhotosReason


class _TaskResponse(BaseModel):
    http_status: int = Field(ge=100, le=599)
    body: dict[str, JsonValue]


class _TaskEnvelope(BaseModel):
    task_id: str = Field(pattern=r"^[0-9a-f]{32}$")
    state: Literal[10, 20, 30]
    response: _TaskResponse | None = None


_CONTACTS = TypeAdapter(
    dict[Annotated[str, Field(min_length=1)], CollectorSiteContacts]
)
_ERROR = TypeAdapter(dict[str, JsonValue])


def parse_search_response(body: bytes) -> CollectorSearchResponse:
    try:
        model = _SearchResponse.model_validate_json(body, strict=True)
    except ValidationError:
        raise GmapCollectorResponseError("invalid_response") from None
    if any(not entry.fid for entry in model.entries):
        raise GmapCollectorResponseError("invalid_response")
    entries = (
        []
        if model.status == "failed"
        else [
            replace(entry, claimed=True if entry.owner_id else None)
            for entry in model.entries
        ]
    )
    return CollectorSearchResponse(
        model.status, GmapSearchResult(entries, partial=model.status == "partial")
    )


def parse_contacts_response(body: bytes) -> dict[str, CollectorSiteContacts]:
    try:
        return _CONTACTS.validate_json(body, strict=True)
    except ValidationError:
        raise GmapCollectorResponseError("invalid_response") from None


class GmapCollectorClient:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def initialize(self) -> None:
        if self._client is None:
            self._client = httpx.AsyncClient(
                trust_env=False, headers={"Accept": "application/json"}
            )

    async def aclose(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def search_item(
        self,
        config: GmapCollectorConfig,
        *,
        job_no: str,
        item_index: int,
        deadline: float,
        run_no: str | None = None,
        mode: Literal["export", "preview"],
        keyword: str,
        max_results: int,
        google_hl: str,
        region: str | None,
        viewport: dict[str, float | int] | None,
        proxies: list[str],
    ) -> CollectorSearchResponse:
        body = await self._request_with_failover(
            config,
            {
                "operation": "search_item",
                "job_no": job_no,
                "item_index": item_index,
                "mode": mode,
                "keyword": keyword,
                "max_results": max_results,
                "google_hl": google_hl,
                "region": region,
                "viewport": viewport,
                "proxies": [{"url": proxy} for proxy in proxies],
            },
            deadline=deadline,
            run_no=run_no,
        )
        result = parse_search_response(body)
        self._remaining(deadline)
        return result

    async def enrich_sites(
        self,
        config: GmapCollectorConfig,
        *,
        job_no: str,
        item_index: int,
        deadline: float,
        run_no: str | None = None,
        sites: list[str],
        proxy: str,
    ) -> dict[str, CollectorSiteContacts]:
        body = await self._request_with_failover(
            config,
            {
                "operation": "enrich_sites",
                "job_no": job_no,
                "item_index": item_index,
                "sites": [{"cache_key": site} for site in sites],
                "proxy": {"url": proxy},
            },
            deadline=deadline,
            run_no=run_no,
        )
        result = parse_contacts_response(body)
        self._remaining(deadline + GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS)
        return result

    async def list_reviews(
        self,
        config: GmapCollectorConfig,
        *,
        request_id: str,
        fid: str,
        sort_by: int,
        cursor: str | None,
        hl: str,
    ) -> GmapReviewPage:
        deadline = asyncio.get_running_loop().time() + GMAP_MEDIA_BUDGET_SECONDS
        body = await self._request_media(
            config,
            request_id,
            {
                "operation": "list_reviews",
                "fid": fid,
                "sort_by": sort_by,
                "cursor": cursor,
                "google_hl": hl,
            },
            deadline=deadline,
        )
        try:
            result = _ReviewsResponse.model_validate_json(body, strict=True)
        except ValidationError:
            raise GmapCollectorResponseError("invalid_response") from None
        self._remaining(deadline)
        return GmapReviewPage(result.reviews, result.next_cursor)

    async def list_photos(
        self,
        config: GmapCollectorConfig,
        *,
        request_id: str,
        fid: str,
        max_results: int,
    ) -> GmapPhotosResult:
        deadline = asyncio.get_running_loop().time() + GMAP_MEDIA_BUDGET_SECONDS
        body = await self._request_media(
            config,
            request_id,
            {
                "operation": "list_photos",
                "fid": fid,
                "max_results": max_results,
                "google_hl": "en",
            },
            deadline=deadline,
        )
        try:
            result = _PhotosResponse.model_validate_json(body, strict=True)
        except ValidationError:
            raise GmapCollectorResponseError("invalid_response") from None
        if (
            result.returned_count != len(result.photos)
            or result.returned_count > max_results
            or any(not photo.url for photo in result.photos)
        ):
            raise GmapCollectorResponseError("invalid_response")
        self._remaining(deadline)
        return GmapPhotosResult(
            result.photos,
            result.returned_count,
            result.reported_total,
            result.status,
            result.reason,
        )

    async def _request_media(
        self,
        config: GmapCollectorConfig,
        request_id: str,
        parameters: dict[str, object],
        *,
        deadline: float,
    ) -> bytes:
        if not config.proxies:
            raise GmapCollectorError("no_proxy")
        return await self._request_with_failover(
            config,
            {
                **parameters,
                "job_no": request_id,
                "item_index": 0,
                "mode": "export",
                "proxies": [{"url": proxy} for proxy in config.proxies[:3]],
            },
            deadline=deadline,
        )

    async def submit_task(
        self,
        collector: GmapCollectorInstance,
        *,
        task_id: str,
        payload: dict[str, object],
        deadline: float,
    ) -> bytes | None:
        """调用方先持久保存 ID/地址；None 接回原 ID 查询，bytes 为原正文。"""
        remaining = self._remaining(deadline)
        response = await self._send(
            collector,
            "POST",
            "/tasks",
            deadline=deadline + self._response_grace(payload),
            payload={
                **payload,
                "task_id": task_id,
                "deadline_ms": int(remaining * 1000),
            },
        )
        return self._unwrap_task(response, task_id)

    async def query_task(
        self,
        collector: GmapCollectorInstance,
        *,
        task_id: str,
        deadline: float,
    ) -> bytes | None:
        """仅观察指定原实例，不选择节点、不领取代理、不重新提交。"""
        response = await self._send(
            collector, "GET", f"/tasks/{task_id}", deadline=deadline
        )
        return self._unwrap_task(response, task_id)

    async def wait_for_task(
        self,
        collector: GmapCollectorInstance,
        *,
        task_id: str,
        deadline: float,
    ) -> bytes:
        """deadline 是固定接收截止时间；网络暂时失败仍只查原地址。"""
        while True:
            self._remaining(deadline)
            try:
                body = await self.query_task(
                    collector, task_id=task_id, deadline=deadline
                )
                if body is not None:
                    return body
            except GmapCollectorError as exc:
                if exc.reason not in {"timeout", "transport"}:
                    raise
            await asyncio.sleep(
                min(GMAP_COLLECTOR_POLL_SECONDS, self._remaining(deadline))
            )

    async def check_stats(
        self, collector: GmapCollectorInstance
    ) -> tuple[bool, str | None]:
        try:
            response = await self._send(
                collector,
                "GET",
                "/stats",
                deadline=asyncio.get_running_loop().time()
                + GMAP_COLLECTOR_STATS_TIMEOUT_SECONDS,
            )
        except GmapCollectorDeadlineError:
            return False, "timeout"
        except GmapCollectorError as exc:
            return False, exc.reason
        if response.status_code == 401:
            return False, "unauthorized"
        if response.status_code != 200:
            return False, "http_error"
        try:
            payload = response.json()
        except ValueError:
            return False, "invalid_response"
        return (
            (True, None) if isinstance(payload, dict) else (False, "invalid_response")
        )

    async def resume_run_task(
        self,
        config: GmapCollectorConfig,
        *,
        job_no: str,
        run_no: str,
        item_index: int,
        operation: CollectorOperation,
        deadline: float,
    ) -> bytes | None:
        """无定位才返回 None；有定位时只查询原地址，当前 Key 不落盘。"""
        location = await export_file_service.run_io(
            export_file_service.read_collector_call,
            job_no=job_no,
            run_no=run_no,
            item_index=item_index,
            operation=operation,
        )
        if location is None:
            return None
        collector = next(
            (item for item in config.collectors if item.url == location.collector_url),
            None,
        )
        if collector is None:
            raise GmapCollectorError("original_collector_removed")
        return await self.wait_for_task(
            collector, task_id=location.task_id, deadline=deadline
        )

    async def _request_with_failover(
        self,
        config: GmapCollectorConfig,
        payload: dict[str, object],
        *,
        deadline: float,
        run_no: str | None = None,
    ) -> bytes:
        response_deadline = deadline + self._response_grace(payload)
        operation: CollectorOperation = (
            "search_item" if payload["operation"] == "search_item" else "enrich_sites"
        )
        job_no = cast(str, payload["job_no"])
        item_index = cast(int, payload["item_index"])
        if run_no is not None:
            restored = await self.resume_run_task(
                config,
                job_no=job_no,
                run_no=run_no,
                item_index=item_index,
                operation=operation,
                deadline=response_deadline,
            )
            if restored is not None:
                return restored
        collectors = list(config.collectors)
        random.shuffle(collectors)
        task_id = uuid4().hex
        last_error = GmapCollectorError("not_configured")
        for collector in collectors[:GMAP_COLLECTOR_MAX_ATTEMPTS]:
            remaining = self._remaining(deadline)
            if run_no is not None:
                await export_file_service.run_io(
                    export_file_service.save_collector_call,
                    job_no=job_no,
                    run_no=run_no,
                    item_index=item_index,
                    operation=operation,
                    location=CollectorCallLocation(
                        task_id=task_id, collector_url=collector.url
                    ),
                )
            try:
                try:
                    if run_no is not None:
                        body = await self.submit_task(
                            collector,
                            task_id=task_id,
                            payload=payload,
                            deadline=deadline,
                        )
                    else:
                        response = await self._send(
                            collector,
                            "POST",
                            "/",
                            deadline=response_deadline,
                            payload={
                                **payload,
                                "task_id": task_id,
                                "deadline_ms": int(remaining * 1000),
                            },
                        )
                        body = self._operation_body(
                            response.status_code, response.content, submission=True
                        )
                except GmapCollectorError as exc:
                    if exc.reason not in {"timeout", "transport"}:
                        raise
                    body = None
                if body is not None:
                    return body
                # 未确认受理或已受理后只观察原调用；查询外层失败不可切换。
                return await self.wait_for_task(
                    collector, task_id=task_id, deadline=response_deadline
                )
            except GmapCollectorError as exc:
                if not exc.switchable:
                    raise
                last_error = exc
        raise last_error

    async def _send(
        self,
        collector: GmapCollectorInstance,
        method: Literal["GET", "POST"],
        path: str,
        *,
        deadline: float,
        payload: dict[str, object] | None = None,
    ) -> httpx.Response:
        remaining = self._remaining(deadline)
        request_deadline = (
            min(
                deadline,
                asyncio.get_running_loop().time()
                + GMAP_COLLECTOR_QUERY_TIMEOUT_SECONDS,
            )
            if method == "GET"
            else deadline
        )
        await self.initialize()
        assert self._client is not None
        try:
            async with asyncio.timeout_at(request_deadline):
                return await self._client.request(
                    method,
                    f"{collector.url}{path}",
                    json=payload,
                    headers={
                        "X-API-Key": collector.api_key,
                        "Cache-Control": "no-store",
                    },
                    timeout=httpx.Timeout(
                        (
                            min(remaining, GMAP_COLLECTOR_QUERY_TIMEOUT_SECONDS)
                            if method == "GET"
                            else remaining
                        ),
                        connect=min(remaining, GMAP_COLLECTOR_QUERY_TIMEOUT_SECONDS),
                    ),
                )
        except TimeoutError:
            if asyncio.get_running_loop().time() < deadline:
                raise GmapCollectorError("timeout") from None
            raise GmapCollectorDeadlineError("deadline_exceeded") from None
        except httpx.TimeoutException:
            raise GmapCollectorError("timeout") from None
        except httpx.TransportError:
            raise GmapCollectorError("transport") from None

    @staticmethod
    def _unwrap_task(response: httpx.Response, task_id: str) -> bytes | None:
        if response.status_code not in {200, 202}:
            submission = response.request.method == "POST"
            return GmapCollectorClient._operation_body(
                response.status_code,
                response.content,
                allow_switch=submission,
                submission=submission,
            )
        try:
            envelope = _TaskEnvelope.model_validate_json(response.content, strict=True)
        except ValidationError:
            raise GmapCollectorResponseError("invalid_response") from None
        if envelope.task_id != task_id:
            raise GmapCollectorResponseError("task_id_mismatch")
        if response.status_code == 202 and envelope.state in {10, 20}:
            return None
        if (
            envelope.state != 30
            or envelope.response is None
            or response.status_code != 200
        ):
            raise GmapCollectorResponseError("invalid_response")
        return GmapCollectorClient._operation_body(
            envelope.response.http_status, json.dumps(envelope.response.body).encode()
        )

    @staticmethod
    def _operation_body(
        status: int,
        body: bytes,
        *,
        allow_switch: bool = True,
        submission: bool = False,
    ) -> bytes | None:
        if status == 200:
            return body
        try:
            raw_error = _ERROR.validate_json(body).get("error")
            error = raw_error if isinstance(raw_error, str) else None
        except ValidationError:
            error = None
        if error == "deadline_exceeded":
            raise GmapCollectorDeadlineError("deadline_exceeded")
        # 提交外层未知 5xx 不能证明未受理，沿原 ID 查询而不授予切换许可。
        if (
            submission
            and status >= 500
            and error not in {"overloaded", "collector_unavailable"}
        ):
            return None
        # 错误正文不进入日志；只保留已约定的协议分类。
        reason = (
            error
            if error
            in {
                "overloaded",
                "collector_unavailable",
                "result_write_failed",
                "task_not_found",
                "task_input_conflict",
                "unauthorized",
            }
            else f"http_{status}"
        )
        raise GmapCollectorError(
            reason,
            switchable=allow_switch
            and (error in {"overloaded", "collector_unavailable"} or status >= 500),
        )

    @staticmethod
    def _response_grace(payload: dict[str, object]) -> float:
        return (
            GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
            if payload.get("operation") == "enrich_sites"
            else 0.0
        )

    @staticmethod
    def _remaining(deadline: float) -> float:
        remaining = deadline - asyncio.get_running_loop().time()
        if remaining <= 0:
            raise GmapCollectorDeadlineError("deadline_exceeded")
        return remaining


gmap_collector_client = GmapCollectorClient()
