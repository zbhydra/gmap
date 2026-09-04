"""按 fid 合并两类 pb/L2，并生成稳定的 29 列地点 DTO。"""

import re
from urllib.parse import urlsplit

from app.provider.gmap.rpc.parsers import JsonValue
from app.provider.gmap.types import GmapNamedValues, GmapPlaceEntry


def _strings(value: JsonValue) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        text = str(item) if isinstance(item, (str, int, float)) else None
        if text and text not in result:
            result.append(text)
    return result


def _phones(value: JsonValue) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if (
            isinstance(item, list)
            and item
            and isinstance(item[0], str)
            and item[0] not in result
        ):
            result.append(item[0])
    return result


def _about(value: JsonValue) -> str | None:
    if not isinstance(value, list):
        return None
    groups: list[str] = []
    for group in value:
        if (
            not isinstance(group, list)
            or len(group) < 3
            or not isinstance(group[1], str)
        ):
            continue
        raw_choices = group[2]
        choices = (
            [
                choice[1]
                for choice in raw_choices
                if isinstance(choice, list)
                and len(choice) > 1
                and isinstance(choice[1], str)
            ]
            if isinstance(raw_choices, list)
            else []
        )
        if choices:
            groups.append(f"{group[1]}: [{', '.join(choices)}]")
    return ", ".join(groups) or None


def _opening_hours(value: JsonValue) -> list[GmapNamedValues]:
    if not isinstance(value, list):
        return []
    result: list[GmapNamedValues] = []
    for day in value:
        if not isinstance(day, list) or len(day) < 4 or not isinstance(day[0], str):
            continue
        date = day[2]
        suffix = ""
        if (
            isinstance(date, list)
            and len(date) == 3
            and all(isinstance(v, int) for v in date)
        ):
            suffix = f"({date[0]}-{date[1]:02d}-{date[2]:02d})"
        raw_periods = day[3]
        periods = (
            [
                period[0]
                for period in raw_periods
                if isinstance(period, list) and period and isinstance(period[0], str)
            ]
            if isinstance(raw_periods, list)
            else []
        )
        result.append(GmapNamedValues(f"{day[0]}{suffix}", periods or ["Closed"]))
    return result


def _string(row: dict[str, JsonValue], key: str) -> str | None:
    value = row.get(key)
    return value if isinstance(value, str) and value else None


def _int(row: dict[str, JsonValue], key: str) -> int | None:
    value = row.get(key)
    return value if isinstance(value, int) and not isinstance(value, bool) else None


def _float(row: dict[str, JsonValue], key: str) -> float | None:
    value = row.get(key)
    return (
        float(value)
        if isinstance(value, (int, float)) and not isinstance(value, bool)
        else None
    )


def merge_entries(
    keyword: str,
    regular_rows: list[dict[str, JsonValue]],
    browser_rows: list[dict[str, JsonValue]],
    l2_rows: dict[str, dict[str, JsonValue]],
) -> list[GmapPlaceEntry]:
    """保持常规分页首次出现顺序，browser/L2 只补列不改排序。"""
    browser = {_string(row, "fid"): row for row in browser_rows}
    seen: set[str] = set()
    entries: list[GmapPlaceEntry] = []
    for regular in regular_rows:
        fid = _string(regular, "fid")
        name = _string(regular, "name")
        if not fid or not name or fid in seen:
            continue
        seen.add(fid)
        supplement = browser.get(fid) or l2_rows.get(fid) or {}
        owner_id = _string(supplement, "owner_id")
        full_address = _string(regular, "full_address") or _string(
            supplement, "full_address"
        )
        if full_address:
            full_address = re.sub(r", United States$", "", full_address)
        address_parts = full_address.split(", ") if full_address else []
        website = _string(regular, "website") or _string(supplement, "website")
        website = re.sub(r"^https?://", "", website, flags=re.I) if website else None
        cid = str(int(fid.split(":")[1], 16))
        kgmid = _string(regular, "kgmid") or _string(supplement, "kgmid")
        entries.append(
            GmapPlaceEntry(
                name=name,
                fid=fid,
                search_keyword=keyword,
                full_address=full_address,
                street=address_parts[0] if address_parts else None,
                municipality=(
                    ", ".join(address_parts[1:]) if len(address_parts) > 1 else None
                ),
                categories=_strings(regular.get("categories")),
                about=_about(supplement.get("about_raw")),
                phone=_string(regular, "phone") or _string(supplement, "phone"),
                phones=_phones(supplement.get("phones_raw")),
                claimed=bool(owner_id) if supplement else None,
                owner=_string(supplement, "owner"),
                owner_id=owner_id,
                owner_link=(
                    f"https://www.google.com/maps/contrib/{owner_id}"
                    if owner_id
                    else None
                ),
                review_count=_int(regular, "review_count")
                or _int(supplement, "review_count"),
                average_rating=_float(regular, "average_rating")
                or _float(supplement, "average_rating"),
                review_url=_string(regular, "review_url"),
                cid=cid,
                latitude=_float(regular, "latitude") or _float(supplement, "latitude"),
                longitude=_float(regular, "longitude")
                or _float(supplement, "longitude"),
                featured_image=_string(supplement, "featured_image"),
                time_zone=_string(regular, "time_zone")
                or _string(supplement, "time_zone"),
                website=website,
                domain=urlsplit(f"//{website}").hostname if website else None,
                opening_hours=_opening_hours(regular.get("opening_hours_raw")),
                google_knowledge_url=(
                    f"https://www.google.com/search?kgmid={kgmid}" if kgmid else None
                ),
                kgmid=kgmid,
                google_maps_url=f"https://www.google.com/maps?cid={cid}",
                place_id=_string(regular, "place_id")
                or _string(supplement, "place_id"),
            )
        )
    return entries


def serialize_entry(entry: GmapPlaceEntry) -> dict[str, object]:
    """按竞品 Title Case 顺序序列化 29 列，多值格式由 golden 固定。"""
    hours = ", ".join(
        f"{item.name}: [{', '.join(item.values)}]" for item in entry.opening_hours
    )
    return {
        "Name": entry.name,
        "Fulladdress": entry.full_address,
        "Street": entry.street,
        "Municipality": entry.municipality,
        "Categories": ", ".join(entry.categories) or None,
        "About": entry.about,
        "Phone": entry.phone,
        "Phones": ", ".join(entry.phones),
        "Claimed": "YES" if entry.claimed else "NO" if entry.claimed is False else "",
        "Owner": entry.owner,
        "Owner Id": entry.owner_id,
        "Owner Link": entry.owner_link,
        "Review Count": entry.review_count,
        "Average Rating": entry.average_rating,
        "Review URL": entry.review_url,
        "Cid": int(entry.cid) if entry.cid else None,
        "Fid": entry.fid,
        "Latitude": entry.latitude,
        "Longitude": entry.longitude,
        "Featured Image": entry.featured_image,
        "Time Zone": entry.time_zone,
        "Website": entry.website,
        "Domain": entry.domain,
        "Opening Hours": hours or None,
        "Google Knowledge URL": entry.google_knowledge_url,
        "Kgmid": entry.kgmid,
        "Google Maps URL": entry.google_maps_url,
        "Place Id": entry.place_id,
        "Search Keyword": entry.search_keyword,
    }
