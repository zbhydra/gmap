"""解析生产样本确认过的常规 pb、浏览器 pb、L2 与 Reviews 位表。"""

import json
import re

from app.provider.gmap.types import GmapParseError, GmapReview, GmapReviewPage

JsonValue = None | bool | int | float | str | list["JsonValue"] | dict[str, "JsonValue"]
FID_RE = re.compile(r"^0x[0-9a-f]{12,20}:0x[0-9a-f]{12,20}$")
KGMID_RE = re.compile(r"^/g/[a-zA-Z0-9_-]+$")


def _dig(value: JsonValue, path: tuple[int, ...]) -> JsonValue:
    current = value
    for index in path:
        if not isinstance(current, list) or index >= len(current):
            return None
        current = current[index]
    return current if current != "" else None


def _text(value: JsonValue) -> str | None:
    return value if isinstance(value, str) and value else None


def _integer(value: JsonValue) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value))
        except ValueError:
            return None
    return None


def _number(value: JsonValue) -> float | None:
    return (
        float(value)
        if isinstance(value, (int, float)) and not isinstance(value, bool)
        else None
    )


def decode_xssi(body: str) -> JsonValue:
    """移除 Google XSSI 前缀并解析 JSON。"""
    if not body.startswith(")]}'") or "\n" not in body:
        raise GmapParseError("gmap rpc decode_xssi: response is missing XSSI prefix")
    try:
        value: JsonValue = json.loads(body[body.index("\n") + 1 :], strict=False)
    except json.JSONDecodeError as exc:
        raise GmapParseError(
            f"gmap rpc decode_xssi: response JSON is invalid at pos={exc.pos}"
        ) from exc
    return value


def _walk_text(value: JsonValue, pattern: re.Pattern[str]) -> str | None:
    if isinstance(value, str):
        return value if pattern.match(value) else None
    if isinstance(value, list):
        for child in value:
            found = _walk_text(child, pattern)
            if found:
                return found
    return None


def _parse_business(block: list[JsonValue]) -> dict[str, JsonValue] | None:
    fid = _text(_dig(block, (10,)))
    name = _text(_dig(block, (11,)))
    if not fid or not name or not FID_RE.match(fid):
        return None
    address = _dig(block, (2,))
    municipality = _dig(block, (183, 1))
    return {
        "name": name,
        "fid": fid,
        "full_address": (
            ", ".join(str(part) for part in address)
            if isinstance(address, list)
            else None
        ),
        "municipality_parts": municipality if isinstance(municipality, list) else [],
        "categories": _dig(block, (13,)),
        "website": _text(_dig(block, (7, 0))),
        "phone": _text(_dig(block, (178, 0, 0))),
        "phones_raw": _dig(block, (178, 0, 1)),
        "average_rating": _number(_dig(block, (4, 7))),
        "review_count": _integer(_dig(block, (4, 8))),
        "review_url": _text(_dig(block, (4, 3, 0))),
        "latitude": _number(_dig(block, (9, 2))),
        "longitude": _number(_dig(block, (9, 3))),
        "time_zone": _text(_dig(block, (30,))),
        "place_id": _text(_dig(block, (78,))),
        "kgmid": _walk_text(block, KGMID_RE),
        "opening_hours_raw": _dig(block, (203, 0)),
        "owner": _text(_dig(block, (57, 1))),
        "owner_id": _text(_dig(block, (57, 2))),
        "featured_image": _text(_dig(block, (72, 0, 1, 6, 0))),
        "about_raw": _dig(block, (100, 1)),
    }


def parse_regular_response(body: str) -> list[dict[str, JsonValue]]:
    """解析常规 pb 的 business 列表。"""
    data = decode_xssi(body)
    items = _dig(data, (0, 1))
    if not isinstance(items, list):
        raise GmapParseError("gmap regular parser: response has no item list at [0][1]")
    rows: list[dict[str, JsonValue]] = []
    for item in items[1:]:
        if isinstance(item, list):
            block = _dig(item, (14,))
            if isinstance(block, list):
                row = _parse_business(block)
                if row:
                    rows.append(row)
    return rows


def _find_business_blocks(
    value: JsonValue, rows: list[dict[str, JsonValue]], depth: int = 0
) -> None:
    if depth > 12 or len(rows) > 400 or not isinstance(value, list):
        return
    row = _parse_business(value)
    if row:
        rows.append(row)
        return
    for child in value:
        _find_business_blocks(child, rows, depth + 1)


def parse_browser_response(body: str) -> list[dict[str, JsonValue]]:
    """递归定位浏览器级 pb 中结构稳定的 business 块。"""
    rows: list[dict[str, JsonValue]] = []
    _find_business_blocks(decode_xssi(body), rows)
    return rows


def parse_l2_response(body: str) -> dict[str, JsonValue]:
    """解析 preview/place 的详情 business 块。"""
    data = decode_xssi(body)
    block = _dig(data, (6,))
    if not isinstance(block, list):
        raise GmapParseError("gmap L2 parser: response has no detail block at [6]")
    row = _parse_business(block)
    if not row:
        raise GmapParseError("gmap L2 parser: detail block has no valid name/fid")
    row["full_address"] = _text(_dig(block, (18,))) or row["full_address"]
    return row


def response_center(rows: list[dict[str, JsonValue]]) -> tuple[float, float] | None:
    """计算结果坐标重心，供 E12 canary 判定软降级。"""
    points = [
        (lat, lng)
        for row in rows
        if isinstance((lat := row.get("latitude")), float)
        and isinstance((lng := row.get("longitude")), float)
    ]
    if not points:
        return None
    return (
        sum(point[0] for point in points) / len(points),
        sum(point[1] for point in points) / len(points),
    )


def viewport_matches(rows: list[dict[str, JsonValue]], lat: float, lng: float) -> bool:
    """按 E12e 生产脚本的经纬各 1° bbox canary 判定视口是否生效。"""
    center = response_center(rows)
    return bool(center and abs(center[0] - lat) <= 1.0 and abs(center[1] - lng) <= 1.0)


def _image_urls(row: list[JsonValue]) -> list[str]:
    for index in (13, 14):
        block = _dig(row, (index,))
        if isinstance(block, list):
            found: list[str] = []
            for value in block:
                url = _walk_text(value, re.compile(r"^https?://"))
                if url and url not in found:
                    found.append(url)
            return found
    return []


def _parse_review(row: JsonValue) -> GmapReview | None:
    if not isinstance(row, list):
        return None
    review_id = _text(_dig(row, (5,)))
    author_name = _text(_dig(row, (3, 0)))
    published_at_ms = _integer(_dig(row, (2, 2)))
    rating = _integer(_dig(row, (1,)))
    if author_name is None:
        return None
    if review_id is None or published_at_ms is None or rating is None:
        raise GmapParseError(
            "gmap reviews parser: identified review has invalid required id/time/rating"
        )
    translated = _text(_dig(row, (28,)))
    return GmapReview(
        review_id=review_id,
        author_name=author_name,
        origin="Google",
        published_at_ms=published_at_ms,
        rating=rating,
        relative_date=_text(_dig(row, (2, 0))),
        author_url=_text(_dig(row, (3, 1))),
        author_review_count=_integer(_dig(row, (3, 3))),
        author_is_local_guide=bool(_dig(row, (3, 5, 1))),
        text=_text(_dig(row, (27,))),
        translated_text=translated,
        language=_text(_dig(row, (26,))),
        owner_response=_text(_dig(row, (4, 2))),
        owner_response_at_ms=_integer(_dig(row, (4, 9))),
        images=_image_urls(row),
    )


def parse_reviews_response(body: str) -> GmapReviewPage:
    """解析 GetLocalBoqProxy XSSI 响应及已脱敏的 node fixture。"""
    if body.lstrip().startswith("{"):
        parsed: JsonValue = json.loads(body)
        node = parsed.get("node") if isinstance(parsed, dict) else None
    else:
        parsed = decode_xssi(body)
        node = _dig(parsed, (1, 10))
    rows = _dig(node, (2,))
    if not isinstance(rows, list):
        raise GmapParseError("gmap reviews parser: response has no reviews at node[2]")
    reviews: list[GmapReview] = []
    seen: set[str] = set()
    for row in rows:
        review = _parse_review(row)
        if review and review.review_id not in seen:
            seen.add(review.review_id)
            reviews.append(review)
    cursor = _text(_dig(node, (6,)))
    return GmapReviewPage(reviews=reviews[:60], next_cursor=cursor)
