"""Maps API 账号接入信息与用量；Dashboard 管理边界，只接受本站登录会话。

同步采集的 search / reviews / photos 面向外部开发者，归
`app/api/external/external_maps.py`（`/api/external/maps`，用户 API Key）。
"""

from fastapi import APIRouter, Depends
from starlette.responses import JSONResponse

from app.api.user_dependencies import UserContext, get_current_user
from app.core.config import settings
from app.services.user_api_key_service import user_api_key_service
from app.services.usage_service import api_usage_service, usage_identity, usage_payload
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps-api", tags=["Maps API 管理"])


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
            + "/api/external/maps",
            "mcp_url": settings.app.mcp_url,
        }
    )
