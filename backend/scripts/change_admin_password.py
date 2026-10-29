#!/usr/bin/env python3
"""按用户名修改管理员密码。

用法：
    cd backend
    uv run python scripts/change_admin_password.py --username <用户名> --password <新密码>
"""

import argparse
import asyncio
import locale
import sys
from pathlib import Path

# 直接执行脚本时需要把后端源码加入模块搜索路径。
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from app.core.database import close_engine
from app.i18n.translator import translator
from app.services.admin_service import admin_service

_LANGUAGE = (locale.getlocale()[0] or "").replace("_", "-")


async def main(username: str, password: str) -> int:
    """修改指定管理员的密码；成功返回 0，用户名不存在返回 1。"""
    try:
        updated = await admin_service.update_password(username, password)
        if not updated:
            print(
                translator.translate(
                    "cli.change_admin_password.not_found",
                    language=_LANGUAGE,
                    username=username,
                ),
                file=sys.stderr,
            )
            return 1
        print(
            translator.translate(
                "cli.change_admin_password.updated",
                language=_LANGUAGE,
                username=username,
            )
        )
        return 0
    finally:
        await close_engine()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=translator.translate(
            "cli.change_admin_password.description", language=_LANGUAGE
        )
    )
    parser.add_argument(
        "--username",
        required=True,
        help=translator.translate(
            "cli.change_admin_password.username_help", language=_LANGUAGE
        ),
    )
    parser.add_argument(
        "--password",
        required=True,
        help=translator.translate(
            "cli.change_admin_password.password_help", language=_LANGUAGE
        ),
    )
    args = parser.parse_args()
    if not 1 <= len(args.username) <= 64:
        parser.error(
            translator.translate(
                "cli.change_admin_password.invalid_username", language=_LANGUAGE
            )
        )
    if not args.password:
        parser.error(
            translator.translate(
                "cli.change_admin_password.empty_password", language=_LANGUAGE
            )
        )
    raise SystemExit(asyncio.run(main(args.username, args.password)))
