"""R2 / AliOSS 官方 SDK 的真实私有 bucket 冒烟。

真实资源依赖：测试 bucket 和 REAL_R2_* / REAL_ALIOSS_* 环境凭据。
变量后缀对应各配置字段大写；不读取或覆盖运行配置，不替换 SDK 网络出口。
"""

import asyncio
import os
from contextlib import closing
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from uuid import uuid4

import alibabacloud_oss_v2 as oss  # type: ignore[import-untyped]
import httpx
import pytest

from app.schemas.admin_schema import (
    AliOssStorageConfig,
    ObjectStorageItem,
    R2StorageConfig,
)
from app.utils.object_storage import (
    _ali_oss_client,
    _r2_client,
    build_object_key,
    download_file,
    presign_get,
    put_object,
)
from app.utils.time import timestamp_now

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass
class _CleanupState:
    config: ObjectStorageItem
    key: str

    def delete_object(self) -> None:
        try:
            if isinstance(self.config, R2StorageConfig):
                with closing(_r2_client(self.config)) as client:
                    client.delete_object(Bucket=self.config.bucket, Key=self.key)
            else:
                _ali_oss_client(self.config).delete_object(
                    oss.DeleteObjectRequest(bucket=self.config.bucket, key=self.key)
                )
        except Exception as exc:
            raise RuntimeError(
                f"object_storage_real.cleanup: provider={self.config.provider} error={type(exc).__name__}"
            ) from None


@pytest.mark.parametrize("provider", ["R2", "AliOSS"])
async def test_real_private_storage_put_download_and_presign(
    provider: str, test_run_id: str, tmp_path: Path
) -> None:
    fields = (
        ("account_id", "bucket", "access_key_id", "secret_access_key")
        if provider == "R2"
        else ("endpoint", "bucket", "access_key_id", "access_key_secret")
    )
    values = {
        field: os.getenv(f"REAL_{provider.upper()}_{field.upper()}", "")
        for field in fields
    }
    if not all(values.values()):
        pytest.skip(f"REAL_OSS_UNAVAILABLE: {provider} 测试 bucket 或凭据未配置")
    item = {
        "id": str(uuid4()),
        "name": f"smoke-{test_run_id}",
        "provider": provider,
        **values,
    }
    config: ObjectStorageItem = (
        R2StorageConfig.model_validate(item)
        if provider == "R2"
        else AliOssStorageConfig.model_validate(item)
    )
    key = build_object_key("storage-smoke", timestamp_now(), f"{test_run_id}.csv")
    cleanup = _CleanupState(config, key)
    # 零行 CSV 足以验证存储字节与下载；完整业务列映射由 Online Provider 验证。
    content = "Name\r\n".encode("utf-8-sig")
    try:
        await put_object(config, key, content)
        destination = tmp_path / "result.csv"
        await download_file(config, key, destination)
        assert destination.read_bytes() == content
        signed_url = await presign_get(
            config, key, filename="result.csv", expires_seconds=60
        )
        parsed = urlsplit(signed_url)
        unsigned_url = urlunsplit(parsed._replace(query=""))
        bucket_path = parsed.path.removesuffix(key)
        listing_url = urlunsplit(parsed._replace(path=bucket_path, query="list-type=2"))
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                signed = await client.get(signed_url)
                assert signed.status_code == 200
                assert signed.content == content
                assert "result.csv" in signed.headers["content-disposition"]
                unsigned = await client.get(unsigned_url)
                assert unsigned.status_code in (400, 401, 403, 404)
                listing = await client.get(listing_url)
                assert listing.status_code in (400, 401, 403, 404)
        except httpx.HTTPError as exc:
            raise RuntimeError(
                f"object_storage_real.download: provider={provider} error={type(exc).__name__}"
            ) from None
    finally:
        await asyncio.to_thread(cleanup.delete_object)
