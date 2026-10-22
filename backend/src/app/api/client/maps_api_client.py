"""Maps 同步 API 与账号接入信息；凭证管理只接受本站登录会话。"""

from fastapi import APIRouter, Depends
from starlette.responses import JSONResponse

from app.api import maps_api_operations
from app.api.maps_api_dependencies import get_api_key_user
from app.api.user_dependencies import UserContext, get_current_user
from app.core.config import settings
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.services.user_api_key_service import user_api_key_service
from app.services.usage_service import api_usage_service, usage_identity, usage_payload
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps/api", tags=["Maps API"])


@router.get("/key")
async def get_api_key(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    return ResponseUtils.ok(
        await user_api_key_service.get_api_key_meta(current_user.user_id)
    )


@router.post("/key/generate")
async def generate_api_key(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    response = ResponseUtils.ok(
        await user_api_key_service.generate_api_key(current_user.user_id)
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@router.get("/usage")
async def get_usage(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    usage = await api_usage_service.get_usage(
        usage_identity(current_user.user_id, None),
        user_id=current_user.user_id,
    )
    return ResponseUtils.ok(usage_payload(usage))


@router.get("/connection")
async def get_connection(
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    return ResponseUtils.ok(
        {
            "api_base_url": settings.app.public_api_base_url.rstrip("/")
            + "/api/client/maps/api",
            "mcp_url": settings.mcp.public_url,
        }
    )


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
