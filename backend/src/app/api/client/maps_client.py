"""Maps 远程配置与集成 API - 客户端接口。

远程配置下发通道：包内默认 + 远程稀疏覆盖 + Object.assign 浅合并（见 013
域拍板方案）。当前直接返回与插件包内 `DEFAULT_MAPS_CONFIG` 对齐的内置默认
配置；Google 改版时在此调整下发的稀疏覆盖即可，免插件发版生效。

集成通道（013 A10，U9）：HubSpot 同步代理端点——插件传用户 access token 与
商家数组，服务端转发 HubSpot API（竞品云函数代理同构），无表结构变更。

配额通道（013 A11，U7；额度基建 2026-09-01 MySQL 化）：月度记录数配额——
登录按 user_id 走 MySQL 用量流水（user_usage_logs）、匿名按 device_id 走
Redis 月度计数（get_current_user_optional 分派），月度窗口按业务时区自然
月重置；统一 usage 服务（三产品线门面）见 usage_service 与
docs/feat/000.架构/tech-额度基建.md。

补全通道（013 A4，U8）：Email/社媒补全——服务端自研（基线 #4），fetch 商家
官网 + 正则抽取（竞品 findV3 出参形状同构）。必须登录并持有有效插件
订阅；配额已在采集侧计量，本端点不重复扣减。
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.api.user_dependencies import (
    UserContext,
    get_current_user,
    get_current_user_optional,
)
from app.constants.subscription import (
    FREE_SUBSCRIPTION_PRODUCT_ID,
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_KIND,
    MAPS_EXTENSION_PRO_PRODUCT_ID,
)
from app.schemas.maps_enrich_schema import MapsEnrichRequest
from app.schemas.maps_hubspot_schema import MapsHubspotSyncRequest
from app.schemas.maps_usage_schema import MapsUsageReportRequest
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.provider.maps_enrich import maps_enrich_provider
from app.constants.maps_enrich import ENRICH_BATCH_BUDGET_SECONDS
from app.services.maps_hubspot_service import maps_hubspot_service
from app.services.subscription_service import subscription_service
from app.services.usage_service import (
    extension_usage_service,
    usage_identity,
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
        "feedCardSelector": '[role="article"], a[href*="/maps/place/"]',
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
        # 字段下标表（fields）唯一事实源 = 插件契约 DEFAULT_MAPS_CONFIG（36 列
        # 全集）。此处不再整表下发：2026-09-02 真实 e2e 实测，本表曾是 A1 时代
        # 的 10 字段旧快照，插件浅合并把其余字段路径清空导致整批解析崩溃
        # （旧 mock 层下发全量表掩盖了该缺陷）。热修单个字段时按键下发即可
        # （插件已改为按键稀疏合并）。
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
# pricingUrl（006 扩展 / W7 联动登记）：插件「额度用尽/升级」按钮的落地页
# 常量；域名占位与 astro.config site 占位同源，生产域名确定后同步替换。
MAPS_OPERATIONS_CONFIG: dict[str, str] = {
    "announcementHtml": "",
    "announcementVersion": "",
    "minPluginVersion": "",
    "pricingUrl": "https://mapexporter.app/pricing/",
}

# 单次采集权益归 Maps 插件所有，月度计量仍由共享 usage 服务负责。
MAPS_ENTITLEMENTS: dict[str, dict[str, object]] = {
    FREE_SUBSCRIPTION_PRODUCT_ID: {
        "plan_name": "Free",
        "run_limits": {"search": 10, "reviews": 20, "photos": 10},
    },
    MAPS_EXTENSION_PRO_PRODUCT_ID: {
        "plan_name": "Pro",
        "run_limits": {"search": 99999, "reviews": 250, "photos": 100},
    },
    MAPS_EXTENSION_BUSINESS_PRODUCT_ID: {
        "plan_name": "Business",
        "run_limits": {"search": 99999, "reviews": 2500, "photos": 1000},
    },
}


async def _maps_entitlements(user_id: int) -> dict[str, object]:
    _, product = await subscription_service.get_user_subscription_config(
        user_id, MAPS_EXTENSION_PRODUCT_KIND
    )
    return MAPS_ENTITLEMENTS[product.product_id]


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
    current_user: UserContext = Depends(get_current_user),
) -> JSONResponse:
    """Email/社媒补全（013 A4，U8）：返回与入参位置对齐的 ``{results, partial}``。

    登录且持有有效插件订阅后才能访问共享缓存或抓取；**不重复扣配额**——
    采集完成边沿已按会话计量，补全不计次。单站失败
    （超时/非 2xx/SSRF 拒绝）收敛为空结果不报错；无官网的商家直接空结果。
    """
    subscription = await subscription_service.get_user_subscription(
        current_user.user_id, MAPS_EXTENSION_PRODUCT_KIND
    )
    if subscription.expires_at is None:
        raise AppCommonException(
            CommonCode.MAPS_ENRICH_SUBSCRIPTION_REQUIRED,
            ext_msg=(
                "enrich_maps_businesses: active extension subscription required: "
                f"user_id={current_user.user_id}, "
                f"product_kind={MAPS_EXTENSION_PRODUCT_KIND}"
            ),
        )
    result = await maps_enrich_provider.enrich(
        request.businesses, proxies=None, batch_timeout=ENRICH_BATCH_BUDGET_SECONDS
    )
    return ResponseUtils.ok(dict(result))


async def _get_usage_user(
    current_user: UserContext = Depends(get_current_user_optional),
    expected_user_id: int | None = Query(None, ge=0),
) -> UserContext:
    """先核对计量归属，避免过期 token 静默降级后扣到匿名设备。"""
    if expected_user_id is not None and current_user.user_id != expected_user_id:
        raise AppCommonException(
            CommonCode.AUTH_INVALID_TOKEN,
            ext_msg=(
                "maps_usage: resolved identity differs from expected user: "
                f"expected_user_id={expected_user_id}, user_id={current_user.user_id}"
            ),
            status_code=401,
        )
    return current_user


@router.get("/usage")
async def get_maps_usage(
    current_user: UserContext = Depends(_get_usage_user),
) -> JSONResponse:
    """查询当月配额用量（竞品云函数 quota 形状：used/total/period/exhausted）。

    登录按 user_id、匿名按 device_id 归属；插件面板 Start 前门控与 popup
    账号区消费本端点。expected_user_id 可要求解析身份一致，失配返回 401。
    存储故障抛 EXTENSION_USAGE_UNAVAILABLE；客户端失败策略由各端决定。
    """
    snapshot = await extension_usage_service.get_usage(
        usage_identity(current_user.user_id, current_user.device_id),
        user_id=current_user.user_id,
    )
    return ResponseUtils.ok(
        {
            **usage_payload(snapshot),
            **await _maps_entitlements(current_user.user_id),
        }
    )


@router.post("/usage/report")
async def report_maps_usage(
    request: MapsUsageReportRequest,
    current_user: UserContext = Depends(_get_usage_user),
) -> JSONResponse:
    """采集完成上报扣减：按 request_id 幂等，返回扣减后的最新用量。

    插件在搜索/评论/照片采集完成边沿上报记录数（批量任务按条目完成逐次
    上报，任务消耗 = 条目上报之和）。expected_user_id 失配在扣量前返回 401；
    客户端负责失败恢复策略，同会话在对应身份的幂等窗口内只扣一次。
    """
    result = await extension_usage_service.consume(
        usage_identity(current_user.user_id, current_user.device_id),
        user_id=current_user.user_id,
        records=request.records,
        request_id=request.request_id,
    )
    return ResponseUtils.ok(
        {
            **usage_payload(result),
            **await _maps_entitlements(current_user.user_id),
            "deducted": result.deducted,
        }
    )
