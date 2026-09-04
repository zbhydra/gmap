"""显式开启且已有可用代理时运行 Gmap HTTP 最小真实网络冒烟。"""

import asyncio
import os
from collections.abc import AsyncIterator

import pytest

from app.provider.gmap import gmap_http_provider
from app.services.maps_engine_service import maps_engine_service

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@pytest.fixture(autouse=True)
async def pristine_http_provider() -> AsyncIterator[None]:
    """真实 smoke 从未初始化状态启动，并恢复进程单例原状态。"""
    client = gmap_http_provider._client  # noqa: SLF001
    original = (
        client._init_lock,
        client._semaphore,
        client._proxies,
        client._session,
    )
    client._init_lock = asyncio.Lock()
    client._semaphore = None
    client._proxies = ()
    client._session = None
    try:
        yield
    finally:
        (
            client._init_lock,
            client._semaphore,
            client._proxies,
            client._session,
        ) = original


@pytest.mark.skipif(
    os.getenv("GMAP_REAL_SMOKE") != "1",
    reason="REAL_GMAP_PROXY_UNAVAILABLE: 未显式设置 GMAP_REAL_SMOKE=1",
)
async def test_real_http_search_and_two_reviews_pages() -> None:
    """真实 Search 覆盖其 L2 补列链，并用原样 cursor 连续取两页 Reviews。"""
    config = await maps_engine_service.get_config()
    if not config.proxies:
        pytest.skip("REAL_GMAP_PROXY_UNAVAILABLE: gmap_engine 未配置代理")

    search = await gmap_http_provider.search_places(
        "coffee shop in Portland", max_depth=1, hl="en", gl="us"
    )
    assert search.entries

    first = await gmap_http_provider.list_reviews(
        search.entries[0].fid, sort_by=2, cursor=None, hl="en"
    )
    assert first.reviews
    assert first.next_cursor

    second = await gmap_http_provider.list_reviews(
        search.entries[0].fid,
        sort_by=2,
        cursor=first.next_cursor,
        hl="en",
    )
    assert second.reviews
    assert not (
        {review.review_id for review in first.reviews}
        & {review.review_id for review in second.reviews}
    )
