"""
密码和加密相关工具函数
"""

import hashlib
import hmac


def hash_password(plain_password: str) -> str:
    """使用双重 SHA-256 哈希密码。

    Args:
        plain_password: 明文密码

    Returns:
        哈希后的密码字符串
    """
    inner = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return hashlib.sha256((inner + "pd%").encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码

    Args:
        plain_password: 明文密码
        hashed_password: 哈希后的密码

    Returns:
        密码是否匹配
    """
    return hmac.compare_digest(hash_password(plain_password), hashed_password)
