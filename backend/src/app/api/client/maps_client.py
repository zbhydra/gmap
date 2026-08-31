"""Maps 远程配置与集成 API - 客户端接口。

远程配置下发通道：包内默认 + 远程稀疏覆盖 + Object.assign 浅合并（见 013
域拍板方案）。当前直接返回与插件包内 `DEFAULT_MAPS_CONFIG` 对齐的内置默认
配置；Google 改版时在此调整下发的稀疏覆盖即可，免插件发版生效。

集成通道（013 A10，U9）：HubSpot 同步代理端点——插件传用户 access token 与
商家数组，服务端转发 HubSpot API（竞品云函数代理同构），无表结构变更。

配额通道（013 A11，U7）：月度记录数配额——登录按 user_id、匿名按 device_id
归属（get_current_user_optional），月度窗口按业务时区自然月重置；Redis 月度
计数零新表，模型决策见 maps_usage_service 模块注释。

补全通道（013 A4，U8）：Email/社媒补全——服务端自研（基线 #4），fetch 商家
官网 + 正则抽取（竞品 findV3 出参形状同构）。鉴权与 maps/usage 同款
（optional user + device_id）；配额已在采集侧计量，本端点不重复扣减。
"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.api.user_dependencies import UserContext, get_current_user_optional
from app.schemas.maps_enrich_schema import MapsEnrichRequest
from app.schemas.maps_hubspot_schema import MapsHubspotSyncRequest
from app.schemas.maps_usage_schema import MapsUsageReportRequest
from app.services.maps_enrich_service import maps_enrich_service
from app.services.maps_hubspot_service import maps_hubspot_service
from app.services.maps_usage_service import (
    maps_usage_identity,
    maps_usage_service,
    usage_payload,
)
from app.utils.response import ResponseUtils

router = APIRouter(prefix="/maps", tags=["Maps 配置"])

# 下发的默认配置（dom/parseSchema/scrape 三组），键名与插件端契约一致；
# 允许包含客户端未声明的键（客户端按稀疏覆盖原样合并，不做校验）。
MAPS_DEFAULT_CONFIG: dict[str, dict[str, object]] = {
    "dom": {
        "searchInput": "div[role=search] input[name=q]",
        "searchSubmitButton": 'div[role=search] button[aria-label="Search"]',
        "feed": "div[role=feed]",
        "main": "div[role=main]",
        "paginationButton": 'button[jsaction="pane.paginationSection.nextPage"]',
        "dragCheckbox": "button[role=checkbox][aria-checked]",
        "panelMount": "body",
    },
    "parseSchema": {
        "listLocator": "len-8",
        "detailPath": "[i][1]",
        "formatADirectNavEnabled": True,
        "formatBSpaXhrEnabled": True,
        "fields": {
            "name": [11],
            "phone": [178, 0, 0],
            "lat": [9, 2],
            "lng": [9, 3],
            "categories": [13],
            "placeId": [78],
            "rating": [4, 7],
            "reviewsCount": [4, 8],
            "website": [7, 0],
            "fullAddress": [39],
        },
    },
    "scrape": {
        "scrollIntervalSec": 8,
        "scrollIntervalOptionsSec": [5, 6, 8, 9, 10],
        "listPageRows": 20,
        "requestTimeoutMs": 10000,
        "requestRetryCount": 2,
    },
}

# 远端运营配置组（013 A12）：公告与新版本提示，随 /maps/config 一并下发。
# 公告为空 = 不展示；运营时在此改值即可，插件免发版生效（公告 HTML 由插件
# innerHTML 注入面板，来源为本仓库 backend 可信通道）。minPluginVersion 为
# 空串表示不提示新版本；插件在其大于本地版本时展示升级提示。
MAPS_OPERATIONS_CONFIG: dict[str, str] = {
    "announcementHtml": "",
    "announcementVersion": "",
    "minPluginVersion": "",
}


@router.get("/config")
async def get_maps_config() -> JSONResponse:
    """获取 Maps 远程配置（三组功能配置 + 运营组，当前均为内置默认值）。"""
    payload: dict[str, object] = {
        **MAPS_DEFAULT_CONFIG,
        "operations": MAPS_OPERATIONS_CONFIG,
    }
    return ResponseUtils.ok(payload)


@router.post("/hubspot/sync")
async def sync_maps_hubspot(
    request: MapsHubspotSyncRequest,
    current_user: UserContext | None = Depends(get_current_user_optional),
) -> JSONResponse:
    """代理同步商家到 HubSpot（token 由插件持有传入，服务端不落库不缓存）。

    get_current_user_optional 仅为观测位（记录调用者身份，匿名/游客不阻断，
    与 mark 通道惯例一致；current_user 暂不参与业务逻辑）；真门控（登录强制/
    配额扣减）随 U7 账号配额体系收口。
    """
    result = await maps_hubspot_service.sync_companies(
        request.token, request.businesses
    )
    return ResponseUtils.ok(result)


@router.post("/enrich")
async def enrich_maps_businesses(
    request: MapsEnrichRequest,
    current_user: UserContext = Depends(get_current_user_optional),
) -> JSONResponse:
    """Email/社媒补全（013 A4，U8）：返回与入参位置对齐的 ``{results, partial}``。

    鉴权与 maps/usage 同款（optional user + device_id，观测位）；**不重复
    扣配额**——与 U7 对齐，采集完成边沿已按会话计量，补全不计次。单站失败
    （超时/非 2xx/SSRF 拒绝）收敛为空结果不报错；无 domain 的商家直接空结果。
    """
    result = await maps_enrich_service.enrich(request.businesses)
    return ResponseUtils.ok(result)


@router.get("/usage")
async def get_maps_usage(
    current_user: UserContext = Depends(get_current_user_optional),
) -> JSONResponse:
    """查询当月配额用量（竞品云函数 quota 形状：used/total/period/exhausted）。

    登录按 user_id、匿名按 device_id 归属；插件面板 Start 前门控与 popup
    账号区消费本端点。Redis 故障按 fail-closed 抛 MAPS_USAGE_UNAVAILABLE，
    插件侧自行降级放行（采集可用性优先）。
    """
    snapshot = await maps_usage_service.get_usage(
        maps_usage_identity(current_user.user_id, current_user.device_id)
    )
    return ResponseUtils.ok(usage_payload(snapshot))


@router.post("/usage/report")
async def report_maps_usage(
    request: MapsUsageReportRequest,
    current_user: UserContext = Depends(get_current_user_optional),
) -> JSONResponse:
    """采集完成上报扣减：按 request_id 幂等，返回扣减后的最新用量。

    插件在搜索/评论/照片采集完成边沿上报记录数（批量任务按条目完成逐次
    上报，任务消耗 = 条目上报之和）；上报失败不阻断采集，插件仅记录不重试
    （计量丢失 = 免费多给额度，防滥用计量口径可接受），同会话重复上报经
    幂等键只扣一次。
    """
    result = await maps_usage_service.consume(
        maps_usage_identity(current_user.user_id, current_user.device_id),
        request.records,
        request.request_id,
    )
    return ResponseUtils.ok({**usage_payload(result), "deducted": result.deducted})
