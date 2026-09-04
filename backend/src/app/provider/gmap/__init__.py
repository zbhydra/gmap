"""Google Maps 无状态采集 Provider。"""

from app.provider.gmap.http import gmap_http_provider
from app.provider.gmap.gosom import gmap_gosom_provider
from app.provider.gmap.types import (
    GmapNamedValues,
    GmapPlaceEntry,
    GmapProviderError,
    GmapReview,
    GmapReviewPage,
    GmapSearchResult,
    GmapViewport,
    GosomJobHandle,
    GosomJobSnapshot,
)

__all__ = [
    "GmapNamedValues",
    "GmapPlaceEntry",
    "GmapProviderError",
    "GmapReview",
    "GmapReviewPage",
    "GmapSearchResult",
    "GmapViewport",
    "GosomJobHandle",
    "GosomJobSnapshot",
    "gmap_gosom_provider",
    "gmap_http_provider",
]
