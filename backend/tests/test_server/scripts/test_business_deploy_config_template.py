"""业务服务器部署配置生成契约测试。"""

import json
from pathlib import Path
import re
from urllib.parse import quote, unquote, urlparse

import yaml  # type: ignore

from app.core.config_schema import Settings


# backend 根目录，用于读取业务服务器部署模板与脚本。
_BACKEND_ROOT = Path(__file__).resolve().parents[3]


def _read_backend_file(relative_path: str) -> str:
    """读取 backend 目录下的文件。"""
    return (_BACKEND_ROOT / relative_path).read_text(encoding="utf-8")


def _business_config_example_placeholders() -> set[str]:
    """读取业务 config.yaml.example 中所有待部署替换的占位符。"""
    config_example = _read_backend_file("config.yaml.example")
    return set(re.findall(r"\{([A-Z0-9_]+)\}", config_example))


def _read_business_deploy_entry_files() -> dict[str, str]:
    """读取 business 部署入口文件。"""

    paths = [
        "deploy/deploy.sh",
        "deploy/init.sh",
        "deploy/script/deploy_init.sh",
        "deploy/script/deploy_remote.sh",
        "config.yaml.example",
        "deploy/.env.example",
        "deploy/README.md",
    ]
    return {path: _read_backend_file(path) for path in paths}


def _yaml_string_scalar(value: str) -> str:
    """按 YAML 兼容的 JSON 字符串形式渲染单行标量。"""
    return json.dumps(value)


def _render_business_config(replacements: dict[str, str]) -> str:
    """按部署模板占位符生成业务配置文本。"""
    rendered = _read_backend_file("config.yaml.example")
    for placeholder, value in replacements.items():
        rendered = rendered.replace(f"{{{placeholder}}}", value)
    return rendered.replace(
        "{SMTP_CONFIG}",
        """
smtp:
  - host: "smtp.example.com"
    port: 587
    username: "sender@example.com"
    password: "secret"
    from_email: "sender@example.com"
""".strip(),
    )


def _business_config_replacements(
    redis_password: str = "",
) -> dict[str, str]:
    """返回可加载业务配置所需的基础占位符值。"""
    return {
        "APP_NAME": "gmap-server",
        "BACKEND_PORT_PY": "7600",
        "DB_HOST": "127.0.0.1",
        "DB_USER": "gmap",
        "DB_PASSWD": "password",
        "DB_NAME": "gmap",
        "PUBLIC_API_BASE_URL": "https://api.example.com",
        "PUBLIC_WEBSITE_BASE_URL": "https://www.example.com",
        "GOOGLE_CLIENT_ID": "google-client-id",
        "GOOGLE_CLIENT_SECRET": "",
        "LOGGER_LEVEL": "WARNING",
        "REDIS_HOST": "redis.internal",
        "REDIS_PORT": "6380",
        "REDIS_PASSWORD": _yaml_string_scalar(redis_password),
    }


def test_business_env_example_lists_all_config_placeholders():
    """业务 .env.example 必须暴露 config.yaml.example 的所有部署变量。"""
    env_example = _read_backend_file("deploy/.env.example")
    missing = [
        placeholder
        for placeholder in sorted(_business_config_example_placeholders())
        if f"{placeholder}=" not in env_example
    ]

    assert missing == []


def test_business_deploy_files_do_not_expose_telegram_bot_env_entrypoints():
    """business 部署链路不能再暴露旧 Telegram Bot env 配置入口。"""
    forbidden = [
        "TELEGRAM_BOT_TOKEN",
        "TELEGRAM_BOT_WEBHOOK_SECRET_TOKEN",
        "{TELEGRAM_BOT_TOKEN}",
        "{TELEGRAM_BOT_WEBHOOK_SECRET_TOKEN}",
        "telegram_bot:",
    ]
    offenders = {
        path: [token for token in forbidden if token in content]
        for path, content in _read_business_deploy_entry_files().items()
    }

    assert offenders == {path: [] for path in _read_business_deploy_entry_files()}


def test_business_remote_scripts_replace_all_config_placeholders():
    """业务远端部署脚本必须替换 config.yaml.example 的所有占位符。"""
    script_paths = [
        "deploy/script/deploy_init.sh",
        "deploy/script/deploy_remote.sh",
    ]
    missing_by_script = {
        script_path: [
            placeholder
            for placeholder in sorted(_business_config_example_placeholders())
            if f"{{{placeholder}}}" not in _read_backend_file(script_path)
        ]
        for script_path in script_paths
    }

    assert missing_by_script == {script_path: [] for script_path in script_paths}


def test_business_deploy_scripts_do_not_require_admin_public_base_url():
    """Admin OAuth 回跳地址由 Admin SPA 发起授权时传入，业务部署链路不再配置。"""
    deploy_files = _read_business_deploy_entry_files()
    offenders = {
        path: "ADMIN_PUBLIC_BASE_URL"
        for path, content in deploy_files.items()
        if "ADMIN_PUBLIC_BASE_URL" in content
    }

    assert "public_base_url" not in _read_backend_file("config.yaml.example")
    assert offenders == {}


def test_business_nginx_keeps_cors_headers_on_error_responses() -> None:
    """Nginx 隐藏上游 CORS 后，自己补写的响应头必须覆盖 401/500。"""
    nginx_config = _read_backend_file("deploy/nginx/nginx.conf")
    expected_directives = [
        "add_header Access-Control-Allow-Origin * always;",
        "add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;",
        "add_header Access-Control-Allow-Headers 'Authorization, Content-Type, X-Device-Id, X-Client-Product, Accept-Language' always;",
        "add_header Access-Control-Max-Age 1728000 always;",
    ]

    for directive in expected_directives:
        assert directive in nginx_config
    assert "proxy_hide_header Access-Control-Allow-Origin;" in nginx_config


def test_business_deploy_checks_auth_error_cors_through_nginx() -> None:
    """初始化和日常发布都要验证严格鉴权 401 可被 Website 跨域读取。"""
    script_paths = [
        "deploy/script/deploy_init.sh",
        "deploy/script/deploy_remote.sh",
    ]

    for script_path in script_paths:
        script = _read_backend_file(script_path)
        assert "verify_nginx_auth_error_cors" in script
        assert '"http://127.0.0.1/api/client/auth/me"' in script
        assert 'if [ "$http_status" != "401" ]; then' in script
        assert "^access-control-allow-origin:" in script


def test_business_deploy_scripts_yaml_escape_redis_password() -> None:
    """业务远端脚本必须把 Redis 密码渲染为完整 YAML 字符串标量。"""
    script_paths = [
        "deploy/script/deploy_init.sh",
        "deploy/script/deploy_remote.sh",
    ]

    for script_path in script_paths:
        script = _read_backend_file(script_path)
        assert "yaml_double_quoted_scalar()" in script
        assert (
            'redis_password_yaml_scalar=$(decode_b64_value "$REDIS_PASSWORD_B64" '
            "| yaml_double_quoted_scalar)"
        ) in script
        assert (
            "redis_password_escaped=$(escape_sed_replacement "
            '"$redis_password_yaml_scalar")'
        ) in script
        assert (
            'redis_password_escaped=$(escape_sed_replacement "$(decode_b64_value '
            '"$REDIS_PASSWORD_B64")")'
        ) not in script


def test_business_env_example_generates_loadable_business_config(tmp_path: Path):
    """用 .env.example 的示例值替换后，业务配置可被 Settings 加载。"""
    rendered = _render_business_config(_business_config_replacements())

    config_path = tmp_path / "config.yaml"
    config_path.write_text(rendered, encoding="utf-8")

    config_data = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    assert "public_base_url" not in config_data["admin"]
    assert config_data["database"]["database"] == "gmap"
    assert config_data["redis"]["host"] == "redis.internal"
    assert config_data["redis"]["port"] == 6380
    assert config_data["redis"]["password"] == ""
    assert config_data["redis"]["key_prefix"] == "gmap-server"
    assert "telegram_bot" not in config_data
    assert "download_token" not in config_data
    assert "service_node" not in config_data

    settings = Settings(str(config_path))
    assert settings.database.database == "gmap"
    assert settings.redis.host == "redis.internal"
    assert settings.redis.port == 6380
    assert settings.redis.password == ""
    assert settings.redis.url == "redis://redis.internal:6380/0"
    assert settings.redis.key_prefix == "gmap-server"


def test_business_config_redis_password_special_chars_are_yaml_and_url_safe(
    tmp_path: Path,
) -> None:
    """Redis 密码含 YAML/URL 特殊字符时，配置可加载且 URL 结构不被破坏。"""
    redis_password = 'pa"ss\\word@host/path#frag?query'
    rendered = _render_business_config(
        _business_config_replacements(redis_password=redis_password)
    )

    config_path = tmp_path / "config.yaml"
    config_path.write_text(rendered, encoding="utf-8")

    config_data = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    assert config_data["redis"]["password"] == redis_password

    settings = Settings(str(config_path))
    parsed = urlparse(settings.redis.url)
    encoded_password = quote(redis_password, safe="")

    assert settings.redis.password == redis_password
    assert settings.redis.url == f"redis://:{encoded_password}@redis.internal:6380/0"
    assert redis_password not in settings.redis.url
    assert parsed.scheme == "redis"
    assert parsed.hostname == "redis.internal"
    assert parsed.port == 6380
    assert parsed.path == "/0"
    assert parsed.query == ""
    assert parsed.fragment == ""
    assert parsed.password is not None
    assert unquote(parsed.password) == redis_password


def test_business_config_redis_null_password_matches_empty_password(
    tmp_path: Path,
) -> None:
    """Redis 密码渲染为 null 时按无密码连接处理。"""
    replacements = _business_config_replacements()
    replacements["REDIS_PASSWORD"] = "null"
    rendered = _render_business_config(replacements)

    config_path = tmp_path / "config.yaml"
    config_path.write_text(rendered, encoding="utf-8")

    config_data = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    settings = Settings(str(config_path))

    assert config_data["redis"]["password"] is None
    assert settings.redis.password is None
    assert settings.redis.url == "redis://redis.internal:6380/0"
