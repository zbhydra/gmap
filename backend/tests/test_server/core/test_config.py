"""
Test core configuration functionality.

确保能从配置文件读取数据并计算成功
"""

import pytest

from app.core.config import (
    ConfigReloadError,
    Settings,
    load_settings_candidate,
    settings,
)


def write_config(tmp_path, content: str) -> str:
    """写入临时配置文件."""
    config_path = tmp_path / "config.yaml"
    config_path.write_text(content, encoding="utf-8")
    return str(config_path)


# 多 SMTP 账号配置样本，验证 list schema、权重字段和必填字段。
SMTP_LIST_CONFIG = """
smtp:
  - host: "smtp-a.example.com"
    port: 587
    username: "sender-a@example.com"
    password: "secret-a"
    use_tls: true
    from_email: "sender-a@example.com"
    from_name: "GMap"
    timeout: 5
    weight: 30
  - host: "smtp-b.example.com"
    port: 465
    username: "sender-b@example.com"
    password: "secret-b"
    use_tls: true
    from_email: "sender-b@example.com"
"""


class TestConfig:
    """测试配置读取功能"""

    @pytest.mark.asyncio
    async def test_load_config_from_file(self):
        """测试从配置文件读取数据"""
        # 验证全局 settings 实例存在
        assert settings is not None

        # 验证能读取到配置值
        assert settings.app.name is not None
        assert settings.app.version is not None
        assert settings.app.host is not None
        assert settings.app.port is not None

        # 验证数据库配置
        assert settings.database.host is not None
        assert settings.database.port is not None
        assert settings.database.user is not None
        assert settings.database.database is not None

        # 验证 URL 能正确计算
        db_url = settings.database.url
        assert db_url is not None
        assert "mysql" in db_url
        assert settings.database.user in db_url
        assert settings.database.database in db_url

        # 验证 API 配置
        assert settings.api.title is not None
        assert settings.api.version is not None

        # 验证 Logging 配置
        assert settings.logging.level is not None

        # 验证 Auth 配置
        assert settings.auth.jwt_secret_key is not None
        assert settings.auth.access_token_expire is not None

        # 验证 SMTP 多账号配置
        assert len(settings.smtp) >= 1
        assert settings.smtp[0].host is not None
        assert settings.smtp[0].weight >= 1

    def test_api_empty_docs_urls_normalize_to_none(self, tmp_path):
        """文档路由空字符串会转换为 None。"""
        loaded_settings = Settings(
            write_config(
                tmp_path,
                SMTP_LIST_CONFIG
                + """
api:
  docs_url: ""
  redoc_url: ""
""",
            )
        )

        assert loaded_settings.api.docs_url is None
        assert loaded_settings.api.redoc_url is None

    def test_smtp_empty_list_fails(self, tmp_path):
        """测试 SMTP 空数组会失败."""
        with pytest.raises(ValueError, match="smtp"):
            Settings(write_config(tmp_path, "smtp: []\n"))

    def test_smtp_invalid_weight_fails(self, tmp_path):
        """测试 SMTP 非法权重会失败."""
        config = SMTP_LIST_CONFIG.replace("weight: 30", "weight: 0")

        with pytest.raises(ValueError, match="weight"):
            Settings(write_config(tmp_path, config))

    def test_smtp_missing_required_field_fails(self, tmp_path):
        """测试 SMTP 缺少必填字段会失败."""
        config = """
smtp:
  - port: 587
    username: "sender-a@example.com"
    password: "secret-a"
    from_email: "sender-a@example.com"
"""

        with pytest.raises(ValueError, match="host"):
            Settings(write_config(tmp_path, config))

    def test_load_settings_candidate_wraps_yaml_error(self, tmp_path):
        """YAML 语法错误会包装成 ConfigReloadError。"""
        config_path = write_config(tmp_path, "database: [\n")

        with pytest.raises(ConfigReloadError) as exc_info:
            load_settings_candidate(config_path)

        assert exc_info.value.config_path == config_path
        assert exc_info.value.errors[0].startswith("yaml:")

    def test_load_settings_candidate_wraps_os_error(self, tmp_path):
        """配置文件不存在会包装成 ConfigReloadError。"""
        config_path = str(tmp_path / "missing.yaml")

        with pytest.raises(ConfigReloadError) as exc_info:
            load_settings_candidate(config_path)

        assert exc_info.value.config_path == config_path
        assert config_path in exc_info.value.errors[0]
