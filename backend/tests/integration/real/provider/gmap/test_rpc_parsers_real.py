"""用生产脱敏 raw/golden 验证 Gmap RPC 解析与合并。"""

import json
from pathlib import Path

import pytest

from app.provider.gmap.rpc.entry import merge_entries, serialize_entry
from app.provider.gmap.rpc.parsers import (
    parse_browser_response,
    parse_l2_response,
    parse_regular_response,
    parse_reviews_response,
)
from app.provider.gmap.rpc.templates import (
    BROWSER_SEARCH_TEMPLATE_URL,
    browser_search_pb,
    regular_search_url,
)
from app.provider.gmap.types import GmapParseError, GmapViewport

pytestmark = pytest.mark.real

_FIXTURES = Path(__file__).parents[4] / "fixtures/gmap"


def test_real_search_raw_matches_all_29_golden_columns() -> None:
    """两类 pb 与 L2 合并后逐行逐列匹配生产 golden。"""
    regular = parse_regular_response(
        (_FIXTURES / "raw/regular_pb_response.txt").read_text()
    )
    browser = []
    for name in ("browser_pb_response_1.txt", "browser_pb_response_2.txt"):
        browser.extend(parse_browser_response((_FIXTURES / "raw" / name).read_text()))
    l2 = parse_l2_response((_FIXTURES / "raw/l2_response.txt").read_text())
    golden = json.loads((_FIXTURES / "golden/search_29_columns.json").read_text())

    actual = [
        serialize_entry(entry)
        for entry in merge_entries(
            golden["keyword"], regular, browser, {str(l2["fid"]): l2}
        )
    ]

    assert actual == golden["entries"]
    assert all(len(row) == 29 for row in actual)


def test_real_reviews_raw_preserves_page_cursor_and_field_positions() -> None:
    """Reviews 位表解析保持 60 条顺序与上游 cursor。"""
    raw = json.loads((_FIXTURES / "raw/reviews_page.json").read_text())
    for index, row in enumerate(raw["node"][2]):
        row[2][2] = str(1_700_000_000_000 + index)
        if row[4] and row[4][9]:
            row[4][9] = str(1_600_000_000_000 + index)
    page = parse_reviews_response(json.dumps(raw))
    golden = json.loads((_FIXTURES / "golden/reviews_page.json").read_text())

    assert len(page.reviews) == len(golden["reviews"]) == 60
    assert page.next_cursor == golden["next_cursor"]
    assert page.reviews[0].review_id == golden["reviews"][0]["review_id"]
    assert page.reviews[0].rating == golden["reviews"][0]["stars"]
    assert page.reviews[0].relative_date == golden["reviews"][0]["rel_date"]
    assert page.reviews[0].author_name == golden["reviews"][0]["author"]
    assert (
        page.reviews[0].author_review_count == golden["reviews"][0]["author_reviews_n"]
    )
    assert page.reviews[0].author_is_local_guide is True
    assert page.reviews[0].language == golden["reviews"][0]["lang"]
    assert page.reviews[0].text == golden["reviews"][0]["text"]
    assert page.reviews[0].origin == "Google"
    assert page.reviews[0].published_at_ms == 1_700_000_000_000
    reply_index = next(index for index, row in enumerate(raw["node"][2]) if row[4])
    assert page.reviews[reply_index].owner_response_at_ms == (
        1_600_000_000_000 + reply_index
    )


def test_real_reviews_rejects_invalid_required_published_time() -> None:
    """脱敏占位不能被伪装为合法的零毫秒时间。"""
    with pytest.raises(GmapParseError, match="invalid required id/time/rating"):
        parse_reviews_response((_FIXTURES / "raw/reviews_page.json").read_text())


def test_real_search_templates_keep_production_pagination_and_both_viewports() -> None:
    """常规/browser 两类 pb 都按 E12 zoom=14 的 20km 视口注入。"""
    viewport = GmapViewport(lat=45.523, lng=-122.676, zoom=14)

    regular = regular_search_url("coffee shop", 40, "en", "us", viewport)
    browser = browser_search_pb(
        BROWSER_SEARCH_TEMPLATE_URL, "coffee shop", 80, viewport
    )

    assert "!1d20000!2d-122.676!3d45.523" in regular
    assert "%217i20%218i40" in regular
    assert "!1d20000!2d-122.676!3d45.523" in browser
    assert "!7i80" in browser
