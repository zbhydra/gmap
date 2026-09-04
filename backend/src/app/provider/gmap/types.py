"""Gmap Provider 跨实现共享的 DTO 与技术错误。"""

from dataclasses import dataclass, field
from typing import Literal


class GmapProviderError(RuntimeError):
    """Gmap 上游配置、请求或响应不满足技术合同时抛出。"""


class GmapConfigurationError(GmapProviderError):
    """Gmap Provider 缺少可用运行配置。"""


class GmapRequestError(GmapProviderError):
    """Google 请求在批准的重试次数内未成功。"""


class GmapParseError(GmapProviderError):
    """Google 响应不符合已验证协议结构。"""


class GmapSoftDegradationError(GmapProviderError):
    """Google 返回成功响应但静默忽略指定视口。"""


@dataclass(frozen=True, slots=True)
class GmapViewport:
    """Google Maps 搜索视口；zoom 使用 Web Mercator 层级。"""

    lat: float
    lng: float
    zoom: float


@dataclass(frozen=True, slots=True)
class GmapNamedValues:
    """保持上游顺序的命名多值字段。"""

    name: str
    values: list[str]


@dataclass(frozen=True, slots=True)
class GmapPlaceEntry:
    """Search 与 gosom 共用的 29 列核心地点 DTO。"""

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


@dataclass(frozen=True, slots=True)
class GmapSearchResult:
    """一次完整 Search 的结果及局部补列状态。"""

    entries: list[GmapPlaceEntry]
    partial: bool = False
    warnings: list[str] = field(default_factory=list)


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
class GosomJobHandle:
    """gosom job 标识及提交实例地址。"""

    job_id: str
    base_url: str


@dataclass(frozen=True, slots=True)
class GosomJobSnapshot:
    """gosom job 的归一化状态快照。"""

    status: Literal["pending", "running", "completed", "failed"]
    result_count: int
    entries: list[GmapPlaceEntry] | None
    error: str | None
