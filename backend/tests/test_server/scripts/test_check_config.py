"""check_config.py 脚本测试。"""

from pathlib import Path
import subprocess


def _write_config(tmp_path: Path, content: str) -> Path:
    """写入测试配置文件。"""
    config_path = tmp_path / "config.yaml"
    config_path.write_text(content, encoding="utf-8")
    return config_path


def _valid_config() -> str:
    """生成最小可校验配置。"""
    return """
smtp:
  - host: "smtp.example.com"
    port: 587
    username: "sender@example.com"
    password: "secret"
    from_email: "sender@example.com"
"""


def _run_check_config(config_path: Path) -> subprocess.CompletedProcess[str]:
    """执行 check_config.py。"""
    backend_root = Path(__file__).resolve().parents[3]
    return subprocess.run(
        [
            str(backend_root / ".venv" / "bin" / "python"),
            str(backend_root / "scripts" / "check_config.py"),
            str(config_path),
        ],
        cwd=backend_root,
        text=True,
        capture_output=True,
        check=False,
    )


def test_check_config_reports_yaml_error_without_traceback(tmp_path: Path):
    """坏 YAML 由脚本错误处理输出，不出现裸 traceback。"""
    result = _run_check_config(_write_config(tmp_path, "telegram: [\n"))

    assert result.returncode == 2
    assert "[ERROR] config invalid:" in result.stderr
    assert "- yaml:" in result.stderr
    assert "Traceback" not in result.stderr


def test_check_config_reports_success_for_valid_config(tmp_path: Path):
    """有效配置返回 0 并打印关键字段。"""
    result = _run_check_config(_write_config(tmp_path, _valid_config()))

    assert result.returncode == 0
    assert "[OK] config valid:" in result.stdout
