"""Gmap Provider 跨实现共享的 DTO 与技术错误。"""

from dataclasses import dataclass, field
from typing import Literal


@dataclass(frozen=True, slots=True)
class GmapViewport:
    """Google Maps 搜索视口；zoom 使用 Web Mercator 层级。"""

    lat: float
    lng: float
    zoom: int


@dataclass(frozen=True, slots=True)
class GmapNamedValues:
    """保持上游顺序的命名多值字段。"""

    name: str
    values: list[str]


@dataclass(frozen=True, slots=True)
class GmapPlaceEntry:
    """Collector Search 的地点 DTO。"""

    name: str
    fid: str
    search_keyword: str
    full_address: str | None = None
    street: str | None = None
    municipality: str | None = None
    categories: list[str] = field(default_factory=list)
    about: str | None = None
    phone: str | None = None
    phones: list[str] = field(default_factory=list)
    claimed: bool | None = None
    owner: str | None = None
    owner_id: str | None = None
    owner_link: str | None = None
    review_count: int | None = None
    average_rating: float | None = None
    review_url: str | None = None
    cid: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    featured_image: str | None = None
    time_zone: str | None = None
    website: str | None = None
    domain: str | None = None
    opening_hours: list[GmapNamedValues] = field(default_factory=list)
    google_knowledge_url: str | None = None
    kgmid: str | None = None
    google_maps_url: str | None = None
    place_id: str | None = None
    emails: list[str] = field(default_factory=list)
    medias: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class GmapSearchResult:
    """一次完整 Search 的结果及局部补列状态。"""

    entries: list[GmapPlaceEntry]
    partial: bool = False
    warnings: list[str] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class CollectorSearchResponse:
    status: Literal["ok", "partial", "failed"]
    result: GmapSearchResult


@dataclass(frozen=True, slots=True)
class CollectorSiteContacts:
    """以 Collector 返回的规范化完整 URL 为键合并，不能按数组位置套用。"""

    emails: list[str]
    medias: dict[str, str]


@dataclass(frozen=True, slots=True)
class GmapReview:
    """Google Reviews 单条评论。"""

    review_id: str
    author_name: str
    origin: str
    published_at_ms: int
    rating: int
    relative_date: str | None = None
    author_url: str | None = None
    text: str | None = None
    translated_text: str | None = None
    language: str | None = None
    owner_response: str | None = None
    author_review_count: int | None = None
    owner_response_at_ms: int | None = None
    author_is_local_guide: bool = False
    images: list[str] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class GmapReviewPage:
    """Google Reviews 单页结果，cursor 原样用于下一页。"""

    reviews: list[GmapReview]
    next_cursor: str | None


@dataclass(frozen=True, slots=True)
class GmapPhoto:
    url: str


GmapPhotosReason = Literal[
    "limit_reached",
    "pagination_unverified",
    "completeness_unverified",
    "pagination_stalled",
    "budget_exhausted",
    "upstream_failed",
    "parse_failed",
    "route_unverified",
    "request_template_invalid",
]


@dataclass(frozen=True, slots=True)
class GmapPhotosResult:
    """照片交付数量与完整性状态；reported_total 仅是上游报告值。"""

    photos: list[GmapPhoto]
    returned_count: int
    reported_total: int | None
    status: Literal["partial"]
    reason: GmapPhotosReason
