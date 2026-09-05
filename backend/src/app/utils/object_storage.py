"""官方 SDK 对象读写边界；同步 I/O 在线程执行，异常不携带签名或凭据。"""

import asyncio
from contextlib import closing
from datetime import timedelta
from pathlib import Path
from urllib.parse import quote

import alibabacloud_oss_v2 as oss  # type: ignore[import-untyped]
import boto3  # type: ignore[import-untyped]
from botocore.client import BaseClient  # type: ignore[import-untyped]
from botocore.exceptions import ClientError  # type: ignore[import-untyped]

from app.schemas.admin_schema import (
    AliOssStorageConfig,
    ObjectStorageItem,
    R2StorageConfig,
)
from app.utils.time import timestamp_to_datetime_str


def build_object_key(feature: str, created_at: int, relative_path: str) -> str:
    """created_at 使用毫秒时间戳，日期遵循业务时区。"""
    return (
        f"{feature}/{timestamp_to_datetime_str(created_at, '%Y%m%d')}/{relative_path}"
    )


def _r2_client(config: R2StorageConfig) -> BaseClient:
    return boto3.client(
        "s3",
        endpoint_url=f"https://{config.account_id}.r2.cloudflarestorage.com",
        region_name="auto",
        aws_access_key_id=config.access_key_id,
        aws_secret_access_key=config.secret_access_key,
    )


def _ali_oss_client(config: AliOssStorageConfig) -> oss.Client:
    return oss.Client(
        oss.config.Config(
            endpoint=config.endpoint,
            # endpoint 是既定配置定位，SDK 原生 V1 不要求额外的 region。
            signature_version="v1",
            credentials_provider=oss.credentials.StaticCredentialsProvider(
                config.access_key_id, config.access_key_secret
            ),
        )
    )


def _object_missing(exc: Exception) -> bool:
    if isinstance(exc, ClientError):
        return exc.response["Error"]["Code"] in ("NoSuchKey", "404", "NotFound")
    if isinstance(exc, oss.exceptions.OperationError):
        exc = exc.unwrap()
    # 沿用 AliOSS SDK is_object_exist 对 HEAD 无错误体 404 的判定。
    return isinstance(exc, oss.exceptions.ServiceError) and (
        exc.code == "NoSuchKey"
        or (exc.status_code == 404 and exc.code == "BadErrorResponse")
    )


async def put_object(
    config: ObjectStorageItem,
    key: str,
    body: bytes,
    *,
    content_type: str = "text/csv; charset=utf-8",
) -> None:
    def put() -> None:
        if isinstance(config, R2StorageConfig):
            with closing(_r2_client(config)) as client:
                client.put_object(
                    Bucket=config.bucket, Key=key, Body=body, ContentType=content_type
                )
        else:
            _ali_oss_client(config).put_object(
                oss.PutObjectRequest(
                    bucket=config.bucket, key=key, body=body, content_type=content_type
                )
            )

    try:
        await asyncio.to_thread(put)
    except Exception as exc:
        raise RuntimeError(
            f"object_storage.put_object: storage_id={config.id} provider={config.provider} error={type(exc).__name__}"
        ) from None


async def download_file(config: ObjectStorageItem, key: str, destination: Path) -> None:
    def download() -> None:
        if isinstance(config, R2StorageConfig):
            with closing(_r2_client(config)) as client:
                client.download_file(config.bucket, key, str(destination))
        else:
            _ali_oss_client(config).get_object_to_file(
                oss.GetObjectRequest(bucket=config.bucket, key=key), str(destination)
            )

    try:
        return await asyncio.to_thread(download)
    except Exception as exc:
        error = (FileNotFoundError if _object_missing(exc) else RuntimeError)(
            f"object_storage.download_file: storage_id={config.id} provider={config.provider} error={type(exc).__name__}"
        )
    # Starlette 会重挂 __context__；离开 except 再抛出，彻底断开 SDK 敏感上下文。
    raise error


async def presign_get(
    config: ObjectStorageItem,
    key: str,
    *,
    filename: str,
    expires_seconds: int = 300,
) -> str:
    def presign() -> str:
        disposition = f"attachment; filename*=UTF-8''{quote(filename, safe='')}"
        if isinstance(config, R2StorageConfig):
            with closing(_r2_client(config)) as client:
                client.head_object(Bucket=config.bucket, Key=key)
                return client.generate_presigned_url(
                    "get_object",
                    Params={
                        "Bucket": config.bucket,
                        "Key": key,
                        "ResponseContentDisposition": disposition,
                    },
                    ExpiresIn=expires_seconds,
                )
        client = _ali_oss_client(config)
        client.head_object(oss.HeadObjectRequest(bucket=config.bucket, key=key))
        return client.presign(
            oss.GetObjectRequest(
                bucket=config.bucket,
                key=key,
                response_content_disposition=disposition,
            ),
            expires=timedelta(seconds=expires_seconds),
        ).url

    try:
        return await asyncio.to_thread(presign)
    except Exception as exc:
        error = (FileNotFoundError if _object_missing(exc) else RuntimeError)(
            f"object_storage.presign_get: storage_id={config.id} provider={config.provider} error={type(exc).__name__}"
        )
    raise error
