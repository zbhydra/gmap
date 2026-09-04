"""由生产实验固化的 Google Maps RPC 请求模板。"""

import json
import re
from urllib.parse import parse_qs, quote, quote_plus, urlsplit

from app.provider.gmap.types import GmapViewport

BROWSER_SEARCH_TEMPLATE_URL = "https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=sg&q=law+firm+in+Denver&pb=%211slaw+firm+in+Denver%214m8%211m3%211d98222.49735422857%212d-104.9607385%213d39.7070002%213m2%211i1024%212i768%214f13.1%217i20%2110b1%2112m60%211m5%2118b1%2130b1%2131m1%211b1%2134e1%212m4%215m1%216e2%2120e3%2139b1%216m32%2132i1%2149b1%2163m0%2166b1%2185b1%21114b1%21149b1%21206b1%21209b1%21212b1%21215b1%21216b1%21222b1%21223b1%21232b1%21234b1%21235b1%21239b1%21246b1%21253b1%21260b1%21262b1%21266b1%21270b1%21271b1%21273b1%21280b1%21281b1%21286b1%21291m0%21302i300%21303i100%2110b1%2112b1%2113b1%2114b1%2116b1%2117m1%213e1%2120m4%215e2%216b1%218b1%2114b1%2146m1%211b0%2196b1%2199b1%2119m4%212m3%211i360%212i120%214i8%2120m57%212m2%211i203%212i100%213m2%212i4%215b1%216m6%211m2%211i86%212i86%211m2%211i408%212i240%217m33%211m3%211e1%212b0%213e3%211m3%211e2%212b1%213e2%211m3%211e2%212b0%213e3%211m3%211e8%212b0%213e3%211m3%211e10%212b0%213e3%211m3%211e10%212b1%213e2%211m3%211e10%212b0%213e4%211m3%211e9%212b1%213e2%212b1%219b0%2115m8%211m7%211m2%211m1%211e2%212m2%211i195%212i195%213i20%2122m5%211sxMyYas3CKKXf4-EPhOGfqA0%217e81%2114m1%213sxMyYas3CKKXf4-EPhOGfqA0%2115i9937%2124m107%211m25%2113m9%212b1%213b1%214b1%216i1%218b1%219b1%2114b1%2120b1%2125b1%2118m14%213b1%214b1%215b1%216b1%2113b1%2114b1%2117b1%2121b1%2122b1%2132b1%2133m1%211b1%2134b1%2136e2%2110m1%218e3%2111m1%213e1%2117b1%2120m2%211e3%211e6%2124b1%2125b1%2126b1%2127b1%2129b1%2130m1%212b1%2136b1%2137b1%2139m3%212m2%212i1%213i1%2143b1%2152b1%2154m1%211b1%2155b1%2156m1%211b1%2161m2%211m1%211e1%2165m5%213m4%211m3%211m2%211i224%212i298%2172m22%211m8%212b1%215b1%217b1%2112m4%211b1%212b1%214m1%211e1%214b1%218m10%211m6%214m1%211e1%214m1%211e3%214m1%211e4%213sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts%216m1%211e1%219b1%2189b1%2190m2%211m1%211e2%2198m3%211b1%212b1%213b1%21103b1%21113b1%21114m3%211b1%212m1%211b1%21117b1%21122m1%211b1%21126b1%21127b1%21128m1%211b1%2126m4%212m3%211i80%212i92%214i8%2130m28%211m6%211m2%211i0%212i0%212m2%211i530%212i768%211m6%211m2%211i974%212i0%212m2%211i1024%212i768%211m6%211m2%211i0%212i0%212m2%211i1024%212i20%211m6%211m2%211i0%212i748%212m2%211i1024%212i768%2134m19%212b1%213b1%214b1%216b1%218m6%211b1%213b1%214b1%215b1%216b1%217b1%219b1%2112b1%2114b1%2120b1%2123b1%2125b1%2126b1%2131b1%2137m1%211e81%2142b1%2149m10%213b1%216m2%211b1%212b1%217m2%211e3%212b1%218b1%219b1%2110e2%2150m3%212e2%213m1%213b1%2161b1%2167m5%217b1%2110b1%2114b1%2115m1%211b0%2169i793%2177b1"

SOCS_COOKIE = (
    "CAISNQgDEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjMwODI5LjA3X3Ax"
    "GgJlbiADGgYIgOa_pgY"
)
REGULAR_TAIL = (
    "!10b1!12m22!1m3!18b1!30b1!34e1!2m3!5m1!6e2!20e3!4b0!10b1!12b1!13b1"
    "!16b1!17m1!3e1!20m3!5e2!6b1!14b1!46m1!1b0!96b1!19m4!2m3!1i360!2i120"
    "!4i8&tbm=map"
)
REGULAR_VIEWPORT = (
    "!4m12!1m3!1d3826.902183192154!2d-96.8!3d40.5!2m3!1f0!2f0!3f0"
    "!3m2!1i600!2i800!4f13.0"
)
PLACE_PB = (
    "!1m13!1s{fid}!3m8!1m3!1d5000!2d0!3d0!3m2!1i1024!2i768!4f13.1"
    "!4m2!3d0!4d0!12m4!2m3!1i360!2i120!4i8!13m57!2m2!1i203!2i100!3m2!2i4!5b1"
    "!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2"
    "!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2"
    "!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m8!1m7!1m2!1m1!1e2"
    "!2m2!1i195!2i195!3i20!14m3!1s0ahUKEwixxxxxxxxxxxxxxxxxxxxxxxxx!7e81!15i10112"
    "!15m108!1m26!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1"
    "!18m15!3b1!4b1!5b1!6b1!13b1!14b1!17b1!21b1!22b1!30b1!32b1!33m1!1b1"
    "!34b1!36e2!10m1!8e3!11m1!3e1!17b1!20m2!1e3!1e6!24b1!25b1!26b1!27b1"
    "!29b1!30m1!2b1!36b1!37b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1"
    "!56m1!1b1!61m2!1m1!1e1!65m5!3m4!1m3!1m2!1i224!2i298!72m22!1m8!2b1"
    "!5b1!7b1!12m4!1b1!2b1!4m1!1e1!4b1!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4"
    "!3sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts"
    "!6m1!1e1!9b1!89b1!90m2!1m1!1e2!98m3!1b1!2b1!3b1!103b1!113b1"
    "!114m3!1b1!2m1!1b1!117b1!122m1!1b1!126b1!127b1!128m1!1b0"
    "!21m0!22m1!1e81!30m8!3b1!6m2!1b1!2b1!7m2!1e3!2b1!9b1"
    "!34m5!7b1!10b1!14b1!15m1!1b0!37i785"
)
_VIEWPORT_RE = re.compile(r"!1d[\d.]+!2d-?[\d.]+!3d-?[\d.]+")


def _diameter(viewport: GmapViewport) -> float:
    # E12 以 zoom=14 / 20km 完成两路实证；每级 zoom 按 Web Mercator 倍增/减半。
    return 20_000 * 2 ** (14 - viewport.zoom)


def viewport_block(viewport: GmapViewport | None) -> str:
    """构造常规 pb 的视口块。"""
    if viewport is None:
        return REGULAR_VIEWPORT
    return (
        f"!4m12!1m3!1d{_diameter(viewport)}!2d{viewport.lng}!3d{viewport.lat}"
        "!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0"
    )


def regular_search_url(
    keyword: str, offset: int, hl: str, gl: str | None, ll: GmapViewport | None
) -> str:
    """构造经生产验证的 `!7i20!8i{offset}` 常规分页 URL。"""
    region = f"&gl={quote_plus(gl)}" if gl else ""
    return (
        f"https://maps.google.com/search?authuser=0&hl={quote_plus(hl)}{region}"
        f"&pb={viewport_block(ll)}%217i20%218i{offset}{REGULAR_TAIL}"
        f"&q={quote_plus(keyword)}"
    )


def browser_search_pb(
    template_url: str,
    keyword: str,
    count: int,
    ll: GmapViewport | None,
) -> str:
    """从入库生产 URL 派生浏览器级 pb，并覆盖关键词、数量与视口。"""
    pb = parse_qs(urlsplit(template_url.strip()).query)["pb"][0]
    pb = re.sub(r"^!1s[^!]*", f"!1s{quote_plus(keyword)}", pb)
    pb = pb.replace("!7i20", f"!7i{count}", 1)
    viewport = (
        f"!1d{_diameter(ll)}!2d{ll.lng}!3d{ll.lat}"
        if ll is not None
        else "!1d25000000!2d0!3d0"
    )
    pb = _VIEWPORT_RE.sub(viewport, pb, count=1)
    return pb


def browser_search_url(
    template_url: str,
    keyword: str,
    count: int,
    hl: str,
    gl: str | None,
    ll: GmapViewport | None,
) -> str:
    """构造浏览器级批量补列 URL。"""
    region = f"&gl={quote_plus(gl)}" if gl else ""
    pb = browser_search_pb(template_url, keyword, count, ll)
    return (
        f"https://www.google.com/search?tbm=map&authuser=0&hl={quote_plus(hl)}"
        f"{region}&q={quote_plus(keyword)}&pb={quote(pb, safe='!')}"
    )


def preview_place_url(fid: str, hl: str, gl: str | None) -> str:
    """构造 preview/place 单店补列 URL。"""
    region = f"&gl={quote_plus(gl)}" if gl else ""
    return (
        f"https://www.google.com/maps/preview/place?authuser=0&hl={quote_plus(hl)}"
        f"{region}&pb={quote(PLACE_PB.format(fid=fid), safe='!')}"
    )


def reviews_url(fid: str, sort_by: int, cursor: str | None, hl: str) -> str:
    """构造 GetLocalBoqProxy 单页请求；请求 100 条，上游实际封顶 60。"""
    inner: list[object] = [None] * 12
    inner[1], inner[9], inner[11] = sort_by, 100, [fid]
    if cursor:
        inner.extend([None] * 8)
        inner[19] = cursor
    payload: list[object] = [None, [None] * 9 + [inner]]
    return (
        "https://www.google.com/httpservice/web/PrivateLocalSearchUiDataService/"
        "GetLocalBoqProxy?msc=gwsrpc"
        f"&hl={quote_plus(hl)}&reqpld={quote(json.dumps(payload, separators=(',', ':')))}"
    )
