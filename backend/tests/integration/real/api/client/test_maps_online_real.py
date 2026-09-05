"""Client Online 主流程：真实 MySQL、Redis 与文件；仅 Google/OSS 网络出口替身。

固定配置键独占写入，复用 Admin 保存恢复 fixture；本用例不证明云端网络验签。
"""

import asyncio
import tempfile
from io import BytesIO
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit
from uuid import uuid4
from zipfile import ZipFile

from alibabacloud_oss_v2.io_utils import TeeIterator  # type: ignore[import-untyped]
import pytest
import requests  # type: ignore[import-untyped]
from botocore.client import BaseClient  # type: ignore[import-untyped]
from botocore.exceptions import ClientError  # type: ignore[import-untyped]
from botocore.response import StreamingBody  # type: ignore[import-untyped]
from curl_cffi.requests import AsyncSession
from httpx import AsyncClient, Response

from app.core.database import get_async_session
from app.i18n.common_code import CommonCode
from app.models.subscription_model import UserSubscriptionModel
from app.provider.gmap import gmap_http_provider
from app.schemas.admin_schema import (
    AliOssStorageConfig,
    GmapEngineConfigRequest,
    ObjectStorageConfig,
    ObjectStorageItem,
    R2StorageConfig,
)
from app.services.maps_engine_service import maps_engine_service
from app.services.maps_online_task_service import maps_online_task_service
from app.services.object_storage_config_service import object_storage_config_service
from app.services.usage_service import online_usage_service, usage_identity
from app.utils.time import timestamp_now
from tests.integration.real.api.client.conftest import _CleanupState
from tests.integration.real.provider.gmap.test_http_orchestration_real import (
    _EMPTY_REGULAR,
    _Response,
)

pytestmark = [pytest.mark.real, pytest.mark.asyncio]
_ENDPOINT = "/api/client/maps-online/tasks"
_TASK_FIELDS = {
    "task_no",
    "status",
    "total_count",
    "processed_count",
    "record_count",
    "created_at",
}
_ITEM_FIELDS = {"item_id", "sequence", "keyword", "record_count"}


def _data(response: Response) -> dict:
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == CommonCode.SUCCESS, body
    return body["data"]


def _error(response: Response, code: CommonCode, status: int) -> None:
    assert response.status_code == status
    assert response.json()["code"] == code
    assert response.json()["data"] == {}


async def _completed(
    client: AsyncClient, headers: dict[str, str], task_no: str
) -> dict:
    async with asyncio.timeout(10):
        while True:
            detail = _data(await client.get(f"{_ENDPOINT}/{task_no}", headers=headers))
            if detail["task"]["status"] == "completed":
                return detail
            await asyncio.sleep(0.02)


async def test_real_online_client_creates_queries_downloads_and_preserves_storage_binding(
    real_async_client: AsyncClient,
    real_online_api_cleanup: _CleanupState,
    real_user_factory,
    test_run_id: str,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    client = real_async_client
    user_id, token = await real_user_factory(f"online-{test_run_id}@example.com")
    other_id, other_token = await real_user_factory(
        f"online-other-{test_run_id}@example.com"
    )
    real_online_api_cleanup.user_ids.extend([user_id, other_id])
    headers = {"Authorization": f"Bearer {token}"}
    other_headers = {"Authorization": f"Bearer {other_token}"}
    identity = usage_identity(user_id, None)
    original_storage = await object_storage_config_service.get_config()
    # 原环境为空时直接证明未配置拒绝，不破坏已有配置制造异常。
    if not original_storage.items:
        _error(
            await client.post(
                _ENDPOINT, headers=headers, json={"keywords": [test_run_id]}
            ),
            CommonCode.INTERNAL_SERVER_ERROR,
            500,
        )
        assert await maps_online_task_service.count_tasks(user_id=user_id) == 0

    storage: list[ObjectStorageItem] = [
        R2StorageConfig(
            id=str(uuid4()),
            name=f"online-{test_run_id}-r2",
            provider="R2",
            account_id=f"online-{test_run_id}",
            bucket=f"online-{test_run_id}-r2",
            access_key_id="test-access",
            secret_access_key="test-secret",
        ),
        AliOssStorageConfig(
            id=str(uuid4()),
            name=f"online-{test_run_id}-ali",
            provider="AliOSS",
            endpoint="https://oss-cn-hangzhou.aliyuncs.com",
            bucket=f"online-{test_run_id}-ali",
            access_key_id="test-access",
            access_key_secret="test-secret",
        ),
    ]
    config = ObjectStorageConfig(
        active_id=storage[0].id, items=[*original_storage.items, *storage]
    )
    await object_storage_config_service.save_config(config)
    await maps_engine_service.save_config(
        GmapEngineConfigRequest(
            provider="http", proxies=["http://proxy.test:8000"], concurrency=2
        )
    )

    release = asyncio.Event()
    fail_upload = False
    deny_download = False
    sdk_calls: list[tuple[str, str, str]] = []
    download_root = tmp_path / "downloads"
    download_root.mkdir()
    monkeypatch.setattr(tempfile, "tempdir", str(download_root))

    async def google_get(_self: AsyncSession, url: str, **kwargs: object) -> _Response:
        if url.startswith("https://www.google.com/maps?hl="):
            return _Response(200, "maps", nid="test-nid")
        assert "maps.google.com" in url
        await release.wait()
        return _Response(200, _EMPTY_REGULAR)

    def sdk_call(
        _self: BaseClient, operation_name: str, api_params: dict[str, object]
    ) -> dict[str, object]:
        bucket, key = api_params["Bucket"], api_params["Key"]
        assert isinstance(bucket, str) and isinstance(key, str)
        sdk_calls.append((operation_name, bucket, key))
        path = tmp_path / "objects" / bucket / key
        if operation_name == "PutObject":
            if fail_upload:
                raise ClientError(
                    {
                        "Error": {
                            "Code": "AccessDenied",
                            "Message": "secret-sdk-diagnostic",
                        }
                    },
                    operation_name,
                )
            body = api_params["Body"]
            assert isinstance(body, bytes)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(body)
            return {"ETag": "test-etag"}
        if deny_download:
            raise ClientError(
                {"Error": {"Code": "AccessDenied", "Message": "secret-sdk-diagnostic"}},
                operation_name,
            )
        if not path.exists():
            raise ClientError(
                {"Error": {"Code": "404", "Message": "secret-sdk-diagnostic"}},
                operation_name,
            )
        body = path.read_bytes()
        if operation_name == "HeadObject":
            return {"ContentLength": len(body), "ETag": "test-etag"}
        assert operation_name == "GetObject"
        return {
            "ContentLength": len(body),
            "Body": StreamingBody(BytesIO(body), len(body)),
        }

    monkeypatch.setattr(AsyncSession, "get", google_get)
    monkeypatch.setattr(BaseClient, "_make_api_call", sdk_call)

    def ali_request(
        _self: requests.Session, method: str, url: str, **kwargs: object
    ) -> requests.Response:
        parsed = urlsplit(url)
        assert parsed.hostname and parsed.hostname.endswith(".aliyuncs.com")
        bucket, key = parsed.hostname.split(".")[0], unquote(parsed.path.lstrip("/"))
        sdk_calls.append((method, bucket, key))
        path = tmp_path / "objects" / bucket / key
        response = requests.Response()
        response.status_code = 200
        response.reason = "OK"
        response.headers["Date"] = "Sat, 05 Sep 2026 00:00:00 GMT"
        body = b""
        if method == "PUT" and not fail_upload:
            data = kwargs["data"]
            assert isinstance(data, (bytes, TeeIterator))
            data = data if isinstance(data, bytes) else b"".join(data)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        elif method == "PUT" or deny_download or not path.exists():
            response.status_code = 403 if method == "PUT" or deny_download else 404
            response.reason = "Unavailable"
            code = "AccessDenied" if response.status_code == 403 else "NoSuchKey"
            body = (
                b""
                if method == "HEAD"
                else f"<Error><Code>{code}</Code><Message>secret-sdk-diagnostic</Message></Error>".encode()
            )
        elif method == "GET":
            body = path.read_bytes()
        else:
            assert method == "HEAD"
        response._content = body
        response._content_consumed = True
        response.headers["Content-Length"] = str(
            path.stat().st_size if method == "HEAD" and path.exists() else len(body)
        )
        return response

    monkeypatch.setattr(requests.Session, "request", ali_request)
    keyword = f'{test_run_id}餐厅/咖啡:*?"|<>\\\x00'
    blank_filename = '/\\<>:"|?*'
    try:
        _error(await client.get(_ENDPOINT), CommonCode.AUTH_MISSING_CREDENTIALS, 401)
        for words in ([" ", "\n"], ["one", "two", "three"]):
            _error(
                await client.post(_ENDPOINT, headers=headers, json={"keywords": words}),
                CommonCode.VALIDATION_ERROR,
                422,
            )
        first = _data(
            await client.post(
                _ENDPOINT,
                headers=headers,
                json={"keywords": [f" {keyword} ", "", keyword, blank_filename]},
            )
        )
        assert set(first) == _TASK_FIELDS
        assert first["status"] == "processing" and first["total_count"] == 2
        assert first["processed_count"] == first["record_count"] == 0
        task_no = first["task_no"]
        detail = _data(await client.get(f"{_ENDPOINT}/{task_no}", headers=headers))
        assert set(detail) == {"task", "items"}
        assert [item["keyword"] for item in detail["items"]] == [
            keyword,
            blank_filename,
        ]
        assert all(set(item) == _ITEM_FIELDS for item in detail["items"])
        assert (
            await online_usage_service.get_usage(identity, user_id=user_id)
        ).used == 0
        _error(
            await client.get(f"{_ENDPOINT}/{task_no}/download", headers=headers),
            CommonCode.INVALID_REQUEST,
            400,
        )
        first_task = await maps_online_task_service.task_info(
            task_no=task_no, user_id=user_id
        )
        assert first_task is not None and first_task.storage_id == storage[0].id
        release.set()
        detail = await _completed(client, headers, task_no)
        assert detail["task"]["processed_count"] == 2
        names = []
        for index, item in enumerate(detail["items"]):
            signed = _data(
                await client.get(
                    f"{_ENDPOINT}/{task_no}/items/{item['item_id']}/download",
                    headers=headers,
                )
            )
            assert set(signed) == {"url", "filename"}
            expected = (
                f"{item['item_id']}_{test_run_id}餐厅咖啡.csv"
                if index == 0
                else f"{item['item_id']}.csv"
            )
            assert signed["filename"] == expected
            assert "r2.cloudflarestorage.com" in signed["url"]
            query = parse_qs(urlsplit(signed["url"]).query)
            assert unquote(query["response-content-disposition"][0]).endswith(expected)
            names.append(expected)
        zipped = await client.get(f"{_ENDPOINT}/{task_no}/download", headers=headers)
        assert (
            zipped.status_code == 200
            and zipped.headers["content-type"] == "application/zip"
        )
        assert f"{task_no}.zip" in zipped.headers["content-disposition"]
        with ZipFile(BytesIO(zipped.content)) as archive:
            assert archive.namelist() == names
            assert all(archive.read(name).startswith(b"\xef\xbb\xbf") for name in names)
        assert not list(download_root.iterdir())

        for suffix in (
            "",
            "/download",
            f"/items/{detail['items'][0]['item_id']}/download",
        ):
            response = await client.get(
                f"{_ENDPOINT}/{task_no}{suffix}",
                headers={**other_headers, "Accept-Language": "en-US"},
            )
            _error(response, CommonCode.NOT_FOUND, 404)
            assert response.json()["msg"] == "Resource not found"
        assert _data(await client.get(_ENDPOINT, headers=other_headers))["tasks"] == []

        async with get_async_session() as db:
            db.add(UserSubscriptionModel(user_id=user_id, product_kind="maps_online", product_id="online_lite", expires_at=timestamp_now() + 86400000))  # type: ignore[call-arg]
            await db.commit()
        config.active_id = storage[1].id
        await object_storage_config_service.save_config(config)
        _error(
            await client.post(
                _ENDPOINT,
                headers=headers,
                json={"keywords": [str(i) for i in range(6)]},
            ),
            CommonCode.VALIDATION_ERROR,
            422,
        )
        second = _data(
            await client.post(
                _ENDPOINT,
                headers=headers,
                json={
                    "keywords": [
                        "餐厅" * 100,
                        *[f"{test_run_id}-{i}" for i in range(4)],
                    ]
                },
            )
        )
        second_detail = await _completed(client, headers, second["task_no"])
        second_task = await maps_online_task_service.task_info(
            task_no=second["task_no"]
        )
        assert second_task is not None and second_task.storage_id == storage[1].id
        assert second_detail["task"]["total_count"] == 5
        listed = _data(
            await client.get(
                _ENDPOINT, headers=headers, params={"offset": 0, "limit": 1}
            )
        )
        assert set(listed) == {"tasks", "total", "offset", "limit"}
        assert (listed["total"], listed["offset"], listed["limit"]) == (2, 0, 1)
        assert listed["tasks"][0]["task_no"] == second["task_no"]
        assert (
            _data(
                await client.get(
                    _ENDPOINT, headers=headers, params={"offset": 1, "limit": 1}
                )
            )["tasks"][0]["task_no"]
            == task_no
        )

        long_item = second_detail["items"][0]
        signed = _data(
            await client.get(
                f"{_ENDPOINT}/{second['task_no']}/items/{long_item['item_id']}/download",
                headers=headers,
            )
        )
        assert 198 <= len(signed["filename"].encode("utf-8")) <= 200
        assert signed["filename"].startswith(f"{long_item['item_id']}_餐厅") and signed[
            "filename"
        ].endswith(".csv")
        zipped = await client.get(
            f"{_ENDPOINT}/{second['task_no']}/download", headers=headers
        )
        assert zipped.status_code == 200
        with ZipFile(BytesIO(zipped.content)) as archive:
            assert (
                archive.namelist()[0] == signed["filename"]
                and len(archive.namelist()) == 5
            )
        old_item = detail["items"][0]
        before = len(sdk_calls)
        _data(
            await client.get(
                f"{_ENDPOINT}/{task_no}/items/{old_item['item_id']}/download",
                headers=headers,
            )
        )
        assert sdk_calls[before][1] == storage[0].bucket
        assert any(call[1] == storage[1].bucket for call in sdk_calls)

        deny_download = True
        _error(
            await client.get(
                f"{_ENDPOINT}/{task_no}/items/{old_item['item_id']}/download",
                headers=headers,
            ),
            CommonCode.INTERNAL_SERVER_ERROR,
            500,
        )
        _error(
            await client.get(
                f"{_ENDPOINT}/{second['task_no']}/download", headers=headers
            ),
            CommonCode.INTERNAL_SERVER_ERROR,
            500,
        )
        deny_download = False
        assert "secret-sdk-diagnostic" not in caplog.text
        assert not list(download_root.iterdir())

        # 模拟对象生命周期自然清理，父任务和配置均保持不变。
        items = await maps_online_task_service.item_lists(first_task.id)
        assert items[0].object_key
        (tmp_path / "objects" / storage[0].bucket / items[0].object_key).unlink()
        for suffix in (f"/items/{old_item['item_id']}/download", "/download"):
            response = await client.get(
                f"{_ENDPOINT}/{task_no}{suffix}",
                headers={**headers, "Accept-Language": "zh-CN"},
            )
            _error(response, CommonCode.NOT_FOUND, 404)
            assert response.json()["msg"] == "资源不存在"
        assert not list(download_root.iterdir())
        second_items = await maps_online_task_service.item_lists(second_task.id)
        assert second_items[0].object_key
        (tmp_path / "objects" / storage[1].bucket / second_items[0].object_key).unlink()
        for suffix in (f"/items/{long_item['item_id']}/download", "/download"):
            _error(
                await client.get(
                    f"{_ENDPOINT}/{second['task_no']}{suffix}", headers=headers
                ),
                CommonCode.NOT_FOUND,
                404,
            )
        assert not list(download_root.iterdir())
        # 删除历史配置后不尝试当前启用项；另一份原对象仍存在。
        config.items = [item for item in config.items if item.id != storage[0].id]
        await object_storage_config_service.save_config(config)
        before = len(sdk_calls)
        for suffix in (f"/items/{detail['items'][1]['item_id']}/download", "/download"):
            _error(
                await client.get(f"{_ENDPOINT}/{task_no}{suffix}", headers=headers),
                CommonCode.NOT_FOUND,
                404,
            )
        assert len(sdk_calls) == before

        fail_upload = True
        empty = _data(
            await client.post(
                _ENDPOINT,
                headers=headers,
                json={"keywords": [f"{test_run_id}-failed-upload"]},
            )
        )
        await _completed(client, headers, empty["task_no"])
        _error(
            await client.get(
                f"{_ENDPOINT}/{empty['task_no']}/download", headers=headers
            ),
            CommonCode.NOT_FOUND,
            404,
        )
        fail_upload = False
        usage = await online_usage_service.get_usage(identity, user_id=user_id)
        await online_usage_service.consume(
            identity,
            user_id=user_id,
            records=usage.total,
            request_id=f"{test_run_id}-exhausted",
        )
        _error(
            await client.post(
                _ENDPOINT, headers=headers, json={"keywords": [test_run_id]}
            ),
            CommonCode.INVALID_REQUEST,
            400,
        )
        assert await maps_online_task_service.count_tasks(user_id=user_id) == 3
        assert "secret-sdk-diagnostic" not in caplog.text
        assert not list(download_root.iterdir())
    finally:
        release.set()
        await maps_online_task_service.close()
        if gmap_http_provider._client._session is not None:
            await gmap_http_provider._client._session.close()
            gmap_http_provider._client._session = None
