"""每个账号只保留一个 API Key 摘要；轮换立即使旧 Key 失效。"""

import hashlib
import secrets

from sqlalchemy import select, update

from app.core.database import get_async_session
from app.models.user_model import UserModel
from app.utils.time import timestamp_now

USER_API_KEY_PREFIX = "maps_"
USER_API_KEY_PATTERN = r"maps_[A-Za-z0-9_-]{43}"
USER_API_KEY_LENGTH = len(USER_API_KEY_PREFIX) + 43


class UserApiKeyService:
    async def get_api_key_meta(self, user_id: int) -> dict[str, object]:
        async with get_async_session() as db:
            row = (
                await db.execute(
                    select(
                        UserModel.api_key_hash,
                        UserModel.api_key_prefix,
                        UserModel.api_key_created_at,
                    ).where(UserModel.user_id == user_id)
                )
            ).one()
        return {
            "has_api_key": row.api_key_hash is not None,
            "api_key_prefix": row.api_key_prefix or "",
            "api_key_created_at": row.api_key_created_at,
        }

    async def generate_api_key(self, user_id: int) -> dict[str, object]:
        key = USER_API_KEY_PREFIX + secrets.token_urlsafe(32)
        created_at = timestamp_now()
        prefix = key[:12]
        async with get_async_session() as db:
            await db.execute(
                update(UserModel)
                .where(UserModel.user_id == user_id)
                .values(
                    api_key_hash=hashlib.sha256(key.encode()).hexdigest(),
                    api_key_prefix=prefix,
                    api_key_created_at=created_at,
                    updated_at=created_at,
                )
            )
            await db.commit()
        return {
            "api_key": key,
            "api_key_prefix": prefix,
            "api_key_created_at": created_at,
        }

    async def get_user_by_api_key(self, key: str) -> UserModel | None:
        async with get_async_session() as db:
            return (
                await db.execute(
                    select(UserModel).where(
                        UserModel.api_key_hash
                        == hashlib.sha256(key.encode()).hexdigest()
                    )
                )
            ).scalar_one_or_none()


user_api_key_service = UserApiKeyService()
