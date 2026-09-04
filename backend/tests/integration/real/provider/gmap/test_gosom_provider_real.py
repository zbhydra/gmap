"""仅替换 gosom HTTP 出口，验证官方 v1.17.4 协议边界。"""

import asyncio
import json
import os

import pytest

import app.provider.gmap.gosom as gosom_module
from app.provider.gmap.gosom import gmap_gosom_provider
from app.provider.gmap.types import (
    GmapProviderError,
    GosomJobHandle,
)
from app.schemas.admin_schema import GosomApiItem

pytestmark = [pytest.mark.real, pytest.mark.asyncio]

_CONFIG = GosomApiItem(base_url="https://gosom.test/root/", api_key="secret", weight=1)
_HANDLE = GosomJobHandle("job-1", "https://gosom.test/root")


class _Response:
    def __init__(self, status_code: int, payload: object) -> None:
        self.status_code = status_code
        self.text = payload if isinstance(payload, str) else json.dumps(payload)


class _Session:
    outcome: object
    calls: list[tuple[str, str, dict[str, object]]]

    async def __aenter__(self) -> "_Session":
        return self

    async def __aexit__(self, *args: object) -> None:
        return None

    async def post(self, url: str, **kwargs: object) -> _Response:
        return self._request("POST", url, kwargs)

    async def get(self, url: str, **kwargs: object) -> _Response:
        return self._request("GET", url, kwargs)

    def _request(self, method: str, url: str, kwargs: dict[str, object]) -> _Response:
        self.calls.append((method, url, kwargs))
        if isinstance(self.outcome, BaseException):
            raise self.outcome
        assert isinstance(self.outcome, _Response)
        return self.outcome


@pytest.fixture(autouse=True)
def gosom_exit(monkeypatch: pytest.MonkeyPatch) -> None:
    _Session.calls = []
    monkeypatch.setattr(gosom_module, "AsyncSession", _Session)


async def test_real_gosom_submit_protocol_boundary() -> None:
    _Session.outcome = _Response(202, {"job_id": "job-1", "status": "pending"})

    handle = await gmap_gosom_provider._submit(_CONFIG, "coffee", 3, "en")

    assert handle == _HANDLE
    assert _Session.calls == [
        (
            "POST",
            "https://gosom.test/root/api/v1/scrape",
            {
                "headers": {"X-API-Key": "secret"},
                "json": {"keyword": "coffee", "lang": "en", "max_depth": 3},
                "timeout": 120,
            },
        )
    ]


async def test_real_gosom_get_maps_status_and_completed_entry() -> None:
    for upstream, expected in (("available", "pending"), ("running", "running")):
        _Session.outcome = _Response(
            200, {"status": upstream, "result_count": 0, "error": "ignored"}
        )
        snapshot = await gmap_gosom_provider._get(_CONFIG, _HANDLE)
        assert snapshot.status == expected
        assert snapshot.entries is None
        assert snapshot.error is None

    _Session.outcome = _Response(
        200,
        {
            "status": "completed",
            "keyword": "coffee",
            "result_count": 1,
            "results": [
                {
                    "title": "Cafe",
                    "data_id": "0x1:0x2",
                    "address": "1 Main St, Portland",
                    "complete_address": {"street": "1 Main St", "city": "Portland"},
                    "categories": ["Cafe", "Bakery"],
                    "phone": "+1 555",
                    "owner": {"id": "42", "name": "Owner", "link": "owner-url"},
                    "review_count": 12,
                    "review_rating": 4.5,
                    "reviews_link": "reviews-url",
                    "cid": "2",
                    "latitude": 45.5,
                    "longtitude": -122.6,
                    "thumbnail": "image-url",
                    "timezone": "America/Los_Angeles",
                    "web_site": "https://cafe.test",
                    "open_hours": {"Monday": ["9 am-5 pm"]},
                    "link": "maps-url",
                    "place_id": "place-1",
                }
            ],
        },
    )

    snapshot = await gmap_gosom_provider._get(_CONFIG, _HANDLE)

    assert snapshot.status == "completed"
    assert snapshot.result_count == 1
    assert snapshot.error is None
    assert snapshot.entries is not None
    assert snapshot.entries[0].name == "Cafe"
    assert snapshot.entries[0].search_keyword == "coffee"
    assert snapshot.entries[0].longitude == -122.6
    assert snapshot.entries[0].opening_hours[0].name == "Monday"
    assert snapshot.entries[0].about is None
    assert snapshot.entries[0].phones == []
    assert snapshot.entries[0].claimed is None
    assert snapshot.entries[0].kgmid is None

    _Session.outcome = _Response(
        200, {"status": "failed", "result_count": 0, "error": "worker failed"}
    )
    snapshot = await gmap_gosom_provider._get(_CONFIG, _HANDLE)
    assert snapshot.status == "failed"
    assert snapshot.entries is None
    assert snapshot.error == "worker failed"


@pytest.mark.parametrize(
    "outcome",
    [
        asyncio.TimeoutError(),
        _Response(503, "sensitive response"),
        _Response(200, {"status": "failed", "result_count": 0, "error": ""}),
    ],
    ids=["timeout", "non_2xx", "invalid_response"],
)
async def test_real_gosom_get_rejects_external_failures(outcome: object) -> None:
    _Session.outcome = outcome

    with pytest.raises(GmapProviderError) as caught:
        await gmap_gosom_provider._get(_CONFIG, _HANDLE)

    assert "secret" not in str(caught.value)
    assert "sensitive response" not in str(caught.value)


@pytest.mark.skipif(
    os.getenv("GOSOM_REAL_SMOKE") != "1",
    reason="REAL_GOSOM_UNAVAILABLE: 未显式设置 GOSOM_REAL_SMOKE=1",
)
async def test_real_gosom_public_submit_and_get_smoke() -> None:
    config = await gosom_module.gosom_api_service.pick()
    if config is None:
        pytest.skip("REAL_GOSOM_UNAVAILABLE: gosom API 未配置")

    handle = await gmap_gosom_provider.submit_job("coffee shop in Portland", 1, "en")
    snapshot = await gmap_gosom_provider.get_job(handle)

    assert snapshot.status in ("pending", "running", "completed", "failed")
