"""验证后端响应文案合同。"""

import json
from pathlib import Path
from typing import get_args

import pytest

from app.i18n import translator
from app.i18n.common_code import CommonCode
from app.i18n.dependencies import SupportedLanguage
from app.utils.response import ResponseUtils


def test_resp_code_keys_match_error_codes_for_every_locale() -> None:
    """每个支持语言必须且只能声明当前有效的错误码文案。"""
    locale_dir = Path(__file__).parents[1] / "src/app/i18n/locales"
    expected_keys = {code.name for code in CommonCode if code is not CommonCode.SUCCESS}

    assert {path.stem for path in locale_dir.glob("*.json")} == set(
        get_args(SupportedLanguage)
    )
    for path in locale_dir.glob("*.json"):
        resp_code = json.loads(path.read_text(encoding="utf-8"))["resp_code"]
        assert set(resp_code) == expected_keys, path.name
        assert all(
            isinstance(message, str) and message for message in resp_code.values()
        )


def test_non_english_messages_do_not_equal_english_baseline() -> None:
    """专名可跨语言保留，但非英语错误文案整句不能照搬英文。"""
    locale_dir = Path(__file__).parents[1] / "src/app/i18n/locales"
    english = json.loads((locale_dir / "en-US.json").read_text(encoding="utf-8"))[
        "resp_code"
    ]

    for path in locale_dir.glob("*.json"):
        if path.stem == "en-US":
            continue
        messages = json.loads(path.read_text(encoding="utf-8"))["resp_code"]
        for key, english_message in english.items():
            assert messages[key] != english_message, f"{path.stem}: {key}"


def test_missing_translation_raises_configuration_error() -> None:
    """缺失翻译必须暴露配置错误，不能把内部 key 返回给用户。"""
    with pytest.raises(KeyError, match="language=en-US, key=resp_code.NOT_CONFIGURED"):
        translator.translate("resp_code.NOT_CONFIGURED", "en-US")


def test_success_response_has_no_unused_message() -> None:
    """成功响应只由 code 和 data 承载语义。"""
    assert ResponseUtils.ok().body == b'{"code":10000,"data":{},"msg":""}'
