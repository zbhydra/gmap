"""Maps 同步采集 API（外部开发者入口）。

只接受用户 API Key；Search / Reviews / Photos 复用 `maps_api_operations`，
计量与额度边界见 014 tech-API与MCP.md。Dashboard 的 Key / 用量管理不走
这里，归 `/api/client/maps-api`（本站登录会话）。
"""

from fastapi import APIRouter, Depends
from starlette.responses import JSONResponse

from app.api import maps_api_operations
from app.api.maps_api_dependencies import get_api_key_user
from app.api.user_dependencies import UserContext
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps", tags=["external-maps"])


@router.post("/search")
async def search(
    request: MapsSearchRequest,
    current_user: UserContext = Depends(get_api_key_user),
) -> JSONResponse:
    return ResponseUtils.ok(await maps_api_operations.search(request, current_user))


@router.post("/reviews")
async def reviews(
    request: MapsReviewsRequest,
    current_user: UserContext = Depends(get_api_key_user),
) -> JSONResponse:
    return ResponseUtils.ok(await maps_api_operations.reviews(request, current_user))


@router.post("/photos")
async def photos(
    request: MapsPhotosRequest,
    current_user: UserContext = Depends(get_api_key_user),
) -> JSONResponse:
    return ResponseUtils.ok(await maps_api_operations.photos(request, current_user))
