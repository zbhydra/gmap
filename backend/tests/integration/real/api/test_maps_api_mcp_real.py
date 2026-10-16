"""真实 MySQL、Redis、本地 HTTP 与 Google 网络验证；不替换业务或采集逻辑。"""

import base64
import hashlib
import secrets
from urllib.parse import parse_qs, urlsplit

import httpx
import httpx2
import pytest
from mcp import Client
from mcp.client.streamable_http import streamable_http_client
from sqlalchemy import func, select, update

from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.maps_online_task_model import MapsOnlineTaskModel
from app.models.mcp_oauth_grant_model import McpOAuthGrantModel
from app.models.user_model import UserModel
from app.models.user_usage_log_model import UserUsageLogModel
from app.schemas.maps_api_schema import MapsSearchRequest
from app.services.maps_engine_service import maps_engine_service
from app.services.mcp_oauth_service import mcp_oauth_grant_service
from app.services.mcp_oauth_ticket_service import mcp_oauth_ticket_service
from app.services.usage_service import api_usage_service, usage_identity
from app.utils.time import timestamp_now
from tests.integration.real.api.conftest import _CleanupState

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
API = "/api/client/maps/api"
OAUTH = "/api/client/mcp-oauth"
REDIRECT = "http://127.0.0.1:7199/callback"


def _headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _data(response: httpx.Response) -> dict:
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


async def _register(
    client: httpx.AsyncClient, state: _CleanupState, run_id: str
) -> str:
    response = await client.post(
        "/oauth/register",
        json={
            "client_name": f"launch-{run_id}",
            "redirect_uris": [REDIRECT],
            "token_endpoint_auth_method": "none",
            "grant_types": ["authorization_code", "refresh_token"],
        },
    )
    assert response.status_code == 201, response.text
    client_id = response.json()["client_id"]
    state.clients.append(client_id)
    return client_id


async def _request(
    client: httpx.AsyncClient, state: _CleanupState, client_id: str
) -> tuple[str, str]:
    verifier = secrets.token_urlsafe(32)
    challenge = (
        base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest())
        .rstrip(b"=")
        .decode()
    )
    response = await client.get(
        "/oauth/authorize",
        params={
            "client_id": client_id,
            "redirect_uri": REDIRECT,
            "response_type": "code",
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "state": "test-state",
            "resource": str(client.base_url).rstrip("/") + "/mcp/",
            "scope": "exports",
        },
    )
    assert response.status_code == 302
    request = parse_qs(urlsplit(response.headers["location"]).fragment)["request"][0]
    state.redis_keys.append(mcp_oauth_ticket_service._key("request", request))
    return request, verifier


async def _grant(
    client: httpx.AsyncClient, state: _CleanupState, client_id: str
) -> dict:
    request, verifier = await _request(client, state, client_id)
    headers = _headers(state.users[0][1])
    detail = _data(
        await client.post(
            OAUTH + "/requests/detail", headers=headers, json={"request": request}
        )
    )
    assert detail["is_loopback"] and detail["redirect_host"] == "127.0.0.1"
    assert detail["user_email"].startswith("api-owner-")
    decided = _data(
        await client.post(
            OAUTH + "/requests/decide",
            headers=headers,
            json={"request": request, "approved": True},
        )
    )
    query = parse_qs(urlsplit(decided["redirect_url"]).query)
    assert query["state"] == ["test-state"] and query["iss"] == [
        str(client.base_url).rstrip("/")
    ]
    code = query["code"][0]
    state.redis_keys.append(mcp_oauth_ticket_service._key("code", code))
    form = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "code": code,
        "redirect_uri": REDIRECT,
        "code_verifier": verifier,
        "resource": str(client.base_url).rstrip("/") + "/mcp/",
    }
    response = await client.post("/oauth/token", data=form)
    assert response.status_code == 200, response.text
    tokens = response.json()
    assert tokens["scope"] == "exports"
    state.redis_keys.append(
        mcp_oauth_grant_service._access_token_key(tokens["access_token"])
    )
    replay = await client.post("/oauth/token", data=form)
    assert replay.status_code == 400 and replay.json()["error"] == "invalid_grant"
    return tokens


async def _mcp_response(client: httpx.AsyncClient, token: str) -> httpx.Response:
    return await client.post(
        "/mcp/",
        headers={**_headers(token), "Accept": "application/json, text/event-stream"},
        json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"},
    )


async def test_real_key_rotation_oauth_confirmation_refresh_and_revocation(
    real_launch_client: httpx.AsyncClient,
    real_launch_state: _CleanupState,
    test_run_id: str,
) -> None:
    client, state = real_launch_client, real_launch_state
    headers = _headers(state.users[0][1])
    assert not _data(await client.get(API + "/key", headers=headers))["has_api_key"]
    first = _data(await client.post(API + "/key/generate", headers=headers))["api_key"]
    second = _data(await client.post(API + "/key/generate", headers=headers))["api_key"]
    meta = _data(await client.get(API + "/key", headers=headers))
    assert meta["has_api_key"] and "api_key" not in meta
    async with get_async_session() as db:
        user = await db.get(UserModel, state.users[0][0])
        assert user and user.api_key_hash == hashlib.sha256(second.encode()).hexdigest()
    invalid = await client.post(
        API + "/search", headers=_headers(first), json={"q": "coffee"}
    )
    assert (
        invalid.status_code == 401
        and invalid.json()["code"] == CommonCode.AUTH_INVALID_TOKEN
    )
    assert (await _mcp_response(client, second)).status_code == 200
    viewport = MapsSearchRequest.model_validate(
        {"q": "coffee", "ll": "@45.5,-122.6,14"}
    ).ll
    assert viewport is not None and (viewport.lat, viewport.lng, viewport.zoom) == (
        45.5,
        -122.6,
        14,
    )
    malformed = await client.post(
        API + "/search",
        headers=_headers(second),
        json={"q": "coffee", "ll": "@91,0,10"},
    )
    assert (
        malformed.status_code == 200
        and malformed.json()["code"] == CommonCode.VALIDATION_ERROR
    )
    assert _data(await client.get(API + "/usage", headers=headers))["used"] == 0
    metadata = await client.get("/.well-known/oauth-authorization-server")
    assert metadata.status_code == 200 and metadata.json()["scopes_supported"] == [
        "exports"
    ]
    challenge = await client.post("/mcp/", json={})
    assert (
        challenge.status_code == 401
        and "resource_metadata=" in challenge.headers["WWW-Authenticate"]
    )
    client_id = await _register(client, state, test_run_id)
    denied_request, _ = await _request(client, state, client_id)
    denied = _data(
        await client.post(
            OAUTH + "/requests/decide",
            headers=headers,
            json={"request": denied_request, "approved": False},
        )
    )
    assert parse_qs(urlsplit(denied["redirect_url"]).query)["error"] == [
        "access_denied"
    ]
    stale = await client.post(
        OAUTH + "/requests/decide",
        headers=headers,
        json={"request": denied_request, "approved": True},
    )
    assert (
        stale.status_code == 200
        and stale.json()["code"] == CommonCode.MCP_OAUTH_REQUEST_INVALID
    )
    tokens = await _grant(client, state, client_id)
    assert (await _mcp_response(client, tokens["access_token"])).status_code == 200
    grants = _data(await client.get(OAUTH + "/grants", headers=headers))
    grant_id = grants["items"][0]["grant_id"]
    assert grants["total"] == 1
    assert (
        _data(await client.get(OAUTH + "/grants", headers=_headers(state.users[1][1])))[
            "total"
        ]
        == 0
    )
    forbidden = await client.post(
        f"{OAUTH}/grants/{grant_id}/revoke", headers=_headers(state.users[1][1])
    )
    assert (
        forbidden.status_code == 200
        and forbidden.json()["code"] == CommonCode.NOT_FOUND
    )
    form = {
        "grant_type": "refresh_token",
        "client_id": client_id,
        "refresh_token": tokens["refresh_token"],
        "resource": str(client.base_url).rstrip("/") + "/mcp/",
    }
    refreshed = await client.post("/oauth/token", data=form)
    assert refreshed.status_code == 200, refreshed.text
    rotated = refreshed.json()
    assert rotated["refresh_token"] != tokens["refresh_token"]
    state.redis_keys.append(
        mcp_oauth_grant_service._access_token_key(rotated["access_token"])
    )
    replay = await client.post("/oauth/token", data=form)
    assert replay.status_code == 400 and replay.json()["error"] == "invalid_grant"
    assert (await _mcp_response(client, rotated["access_token"])).status_code == 401
    async with get_async_session() as db:
        grant = await db.get(McpOAuthGrantModel, grant_id)
        assert grant and grant.revoked_at is not None
    assert _data(
        await client.post(f"{OAUTH}/grants/{grant_id}/revoke", headers=headers)
    )["revoked"]

    async with get_async_session() as db:
        await db.execute(
            update(UserModel)
            .where(UserModel.user_id == state.users[0][0])
            .values(locked_until=timestamp_now() + 60_000)
        )
        await db.commit()
    locked = await _mcp_response(client, second)
    assert (
        locked.status_code == 403
        and locked.json()["code"] == CommonCode.AUTH_ACCOUNT_LOCKED
    )


async def test_real_rest_and_oauth_mcp_share_account_request_quota(
    real_launch_client: httpx.AsyncClient,
    real_launch_state: _CleanupState,
    test_run_id: str,
) -> None:
    if not (await maps_engine_service.get_config()).proxies:
        pytest.skip("REAL_GMAP_PROXY_UNAVAILABLE: 未配置 Google Maps 代理")
    client, state = real_launch_client, real_launch_state
    user_id, token = state.users[0]
    headers = _headers(token)
    key = _data(await client.post(API + "/key/generate", headers=headers))["api_key"]
    search = _data(
        await client.post(
            API + "/search",
            headers=_headers(key),
            json={"q": "coffee shop in Portland", "page": 1, "extra": True},
        )
    )
    assert search["places"] and all(
        "emails" in place and "medias" in place for place in search["places"]
    )
    fid = next(
        place["fid"] for place in search["places"] if (place["review_count"] or 0) > 20
    )
    reviews = _data(
        await client.post(
            API + "/reviews", headers=_headers(key), json={"fid": fid, "sort_by": 2}
        )
    )
    assert reviews["reviews"] and reviews["next_cursor"]
    tokens = await _grant(client, state, await _register(client, state, test_run_id))
    async with httpx2.AsyncClient(
        headers=_headers(tokens["access_token"]), trust_env=False, timeout=180
    ) as http:
        async with Client(
            streamable_http_client(
                str(client.base_url).rstrip("/") + "/mcp/", http_client=http
            )
        ) as mcp:
            tools = await mcp.list_tools()
            assert {tool.name for tool in tools.tools} == {
                "search_places",
                "list_reviews",
            }
            result = await mcp.call_tool(
                "list_reviews",
                {"fid": fid, "sort_by": 2, "cursor": reviews["next_cursor"]},
            )
            assert not result.is_error, result.structured_content
            assert result.structured_content and result.structured_content["reviews"]
            usage = _data(await client.get(API + "/usage", headers=headers))
            assert usage["used"] == 3
            assert (
                _data(
                    await client.get(
                        API + "/usage", headers=_headers(state.users[1][1])
                    )
                )["used"]
                == 0
            )
            async with get_async_session() as db:
                logs = (
                    (
                        await db.execute(
                            select(UserUsageLogModel).where(
                                UserUsageLogModel.user_id == user_id
                            )
                        )
                    )
                    .scalars()
                    .all()
                )
                assert len(logs) == 3 and all(
                    log.product_kind == "maps_api" and log.delta == 1 for log in logs
                )
                assert not await db.scalar(
                    select(func.count())
                    .select_from(MapsOnlineTaskModel)
                    .where(MapsOnlineTaskModel.user_id == user_id)
                )
            await api_usage_service.consume(
                usage_identity(user_id, None),
                user_id=user_id,
                records=usage["total"] - usage["used"],
                request_id=f"exhaust-{test_run_id}",
            )
            exhausted = await client.post(
                API + "/search", headers=_headers(key), json={"q": "coffee"}
            )
            assert (
                exhausted.status_code == 200
                and exhausted.json()["code"] == CommonCode.MAPS_API_QUOTA_EXHAUSTED
            )
            limited = await mcp.call_tool("list_reviews", {"fid": fid})
            assert (
                limited.is_error
                and limited.structured_content
                and limited.structured_content["code"]
                == CommonCode.MAPS_API_QUOTA_EXHAUSTED
            )
    grant_id = _data(await client.get(OAUTH + "/grants", headers=headers))["items"][0][
        "grant_id"
    ]
    assert _data(
        await client.post(f"{OAUTH}/grants/{grant_id}/revoke", headers=headers)
    )["revoked"]
    assert (await _mcp_response(client, tokens["access_token"])).status_code == 401
