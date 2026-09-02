"""Extension 登录 v3（browser identity + PKCE）一次性 code 服务。

流程：
1. 插件 background 生成 PKCE verifier/challenge(S256)，打开官网登录窗口。
2. 官网页以 Website 登录态调用 create_code，签发绑定 challenge 的短效一次性 code。
3. code 经回调 URL fragment 回到插件，插件携 verifier 调 exchange。
4. exchange 原子消费 code 并校验 S256 challenge，通过后才按 code 内 user_id 签发插件 token。
   Redis 只存 sha256(code) 摘要，明文 code 不落 Redis；Redis 读写失败时异常上抛，
   由错误中间件转 INTERNAL_SERVER_ERROR，不签发 token（fail-closed）。
"""

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import cast

from app.core.redis import redis_client
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.utils.redis_key import build_redis_key

EXTENSION_LOGIN_CODE_TTL_SECONDS = 60
EXTENSION_LOGIN_CODE_BYTES = 32

# Lua 脚本：原子 GET+DEL，保证同一 code 只能被成功消费一次
_CONSUME_CODE_SCRIPT = """
local value = redis.call('GET', KEYS[1])
if value then
  redis.call('DEL', KEYS[1])
end
return value
"""


class ExtensionLoginCodeService:
    """管理插件 browser identity 登录的一次性 code（PKCE S256 绑定）。"""

    def _hash_code(self, code: str) -> str:
        """计算一次性 code 摘要，Redis 不保存明文 code。"""
        return hashlib.sha256(code.encode("utf-8")).hexdigest()

    def _build_key(self, code_hash: str) -> str:
        """构建一次性 code 的 Redis key。"""
        return build_redis_key(f"extension_login_code:{code_hash}")

    def _create_s256_challenge(self, code_verifier: str) -> str:
        """计算 PKCE S256 challenge：BASE64URL(SHA256(verifier))，无填充。"""
        digest = hashlib.sha256(code_verifier.encode("ascii")).digest()
        return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")

    async def create_code(self, user_id: int, code_challenge: str) -> str:
        """为已通过 Website 认证的用户创建绑定 challenge 的短效一次性 code。

        Args:
            user_id: 发起登录确认的 Website 用户 ID。
            code_challenge: 插件生成的 PKCE S256 challenge（43 字符 Base64URL）。
        """
        code = secrets.token_urlsafe(EXTENSION_LOGIN_CODE_BYTES)
        payload = {
            "user_id": user_id,
            "code_challenge": code_challenge,
            "created_at": int(time.time()),
        }
        redis = await redis_client.get_client()
        await redis.set(
            self._build_key(self._hash_code(code)),
            json.dumps(payload, separators=(",", ":")),
            ex=EXTENSION_LOGIN_CODE_TTL_SECONDS,
        )
        return code

    async def consume_code(self, code: str, code_verifier: str) -> int:
        """原子消费一次性 code，challenge 校验通过后返回对应 user_id。

        先消费后校验：Lua GET+DEL 先删 key，verifier 不匹配时 code 也已作废，
        防止同一 code 用不同 verifier 反复试探。code 不存在/已过期/已消费/
        载荷非法/verifier 不匹配统一抛 AUTH_INVALID_CREDENTIALS，无尝试计数。
        """
        if not code.strip():
            raise AppCommonException(
                code=CommonCode.AUTH_INVALID_CREDENTIALS,
                ext_msg="extension_login_code_service.consume_code: 一次性 code 为空",
            )

        redis = await redis_client.get_client()
        value: object = await redis.eval(  # type: ignore[misc]
            _CONSUME_CODE_SCRIPT,
            1,
            self._build_key(self._hash_code(code.strip())),
        )
        if value is None:
            raise AppCommonException(
                code=CommonCode.AUTH_INVALID_CREDENTIALS,
                ext_msg=(
                    "extension_login_code_service.consume_code: "
                    "一次性 code 不存在或已过期/已被消费"
                ),
            )

        try:
            if isinstance(value, bytes):
                raw_payload = value.decode("utf-8")
            elif isinstance(value, str):
                raw_payload = value
            else:
                raise ValueError("login code payload is not a string")

            payload_data = json.loads(raw_payload)
            if not isinstance(payload_data, dict):
                raise ValueError("login code payload is not an object")
            if not all(isinstance(key, str) for key in payload_data):
                raise ValueError("login code payload has non-string keys")

            payload = cast(dict[str, object], payload_data)
            user_id_value = payload.get("user_id")
            if not isinstance(user_id_value, int):
                raise ValueError("login code payload user_id is not an integer")
            code_challenge = payload.get("code_challenge")
            if not isinstance(code_challenge, str) or not code_challenge:
                raise ValueError("login code payload code_challenge is invalid")
        except (TypeError, ValueError, json.JSONDecodeError) as exc:
            raise AppCommonException(
                code=CommonCode.AUTH_INVALID_CREDENTIALS,
                ext_msg=(
                    "extension_login_code_service.consume_code: "
                    f"一次性 code 票据载荷非法: error={type(exc).__name__}: {exc}"
                ),
            ) from exc

        if not hmac.compare_digest(
            self._create_s256_challenge(code_verifier),
            code_challenge,
        ):
            raise AppCommonException(
                code=CommonCode.AUTH_INVALID_CREDENTIALS,
                ext_msg=(
                    "extension_login_code_service.consume_code: "
                    "PKCE verifier 与 code 绑定的 challenge 不匹配: "
                    f"user_id={user_id_value}"
                ),
            )

        if user_id_value <= 0:
            raise AppCommonException(
                code=CommonCode.AUTH_INVALID_CREDENTIALS,
                ext_msg=(
                    "extension_login_code_service.consume_code: "
                    f"一次性 code 票据的 user_id 非法: user_id={user_id_value}"
                ),
            )

        return user_id_value


extension_login_code_service = ExtensionLoginCodeService()
