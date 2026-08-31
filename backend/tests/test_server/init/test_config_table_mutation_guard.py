"""配置表写入护栏测试。

测试和辅助脚本不允许写 config_* 配置表，避免污染开发环境真实配置。
"""

from pathlib import Path
import re


_BACKEND_ROOT = Path(__file__).resolve().parents[3]

_SCAN_ROOTS = (
    _BACKEND_ROOT / "tests",
    _BACKEND_ROOT / "scripts",
    _BACKEND_ROOT / "deploy" / "script",
)

_CONFIG_MODEL_NAMES = (
    "ConfigPaymentChannelModel",
    "ConfigCreditProductModel",
    "ConfigCreditProductPriceModel",
    "ConfigSubscriptionProductModel",
    "ConfigSubscriptionProductPriceModel",
    "ConfigPublicModel",
)

_CONFIG_MODEL_PATTERN = "|".join(_CONFIG_MODEL_NAMES)

# 显式豁免：配置播种属运维显式动作（等价于用 sql_executor 执行配置 SQL），
# 不属于"测试/辅助脚本意外污染配置"的护栏对象。新增播种脚本时在此登记。
_SEED_SCRIPT_ALLOWLIST = (Path("scripts") / "seed_maps_subscription_products.py",)

_RAW_CONFIG_SQL_WRITE_RE = re.compile(
    r"\b("
    r"INSERT\s+INTO|"
    r"REPLACE\s+INTO|"
    r"UPDATE|"
    r"DELETE\s+FROM|"
    r"TRUNCATE\s+TABLE|"
    r"ALTER\s+TABLE"
    r")\s+`?config_",
    re.IGNORECASE,
)

_ORM_CONFIG_WRITE_RE = re.compile(
    rf"("
    rf"\b(?:delete|update|insert)\s*\(\s*(?:{_CONFIG_MODEL_PATTERN})\b|"
    rf"\.(?:add|merge)\s*\(\s*(?:{_CONFIG_MODEL_PATTERN})\s*\("
    rf")",
    re.MULTILINE,
)

_FULL_METADATA_SCHEMA_WRITE_RE = re.compile(
    r"\bBase\.metadata\.(?:create_all|drop_all)\s*\(",
)


def _python_files(root: Path) -> list[Path]:
    """列出需要扫描的 Python 文件。"""

    if not root.exists():
        return []
    return sorted(
        path for path in root.rglob("*.py") if "__pycache__" not in path.parts
    )


def test_tests_and_scripts_do_not_mutate_config_tables() -> None:
    """测试和脚本禁止直接写入 config_* 配置表。"""

    violations: list[str] = []
    for root in _SCAN_ROOTS:
        for path in _python_files(root):
            try:
                relative = path.relative_to(_BACKEND_ROOT)
            except ValueError:
                relative = path
            if relative in _SEED_SCRIPT_ALLOWLIST:
                continue
            text = path.read_text(encoding="utf-8")
            if _RAW_CONFIG_SQL_WRITE_RE.search(text):
                violations.append(f"{relative}: raw SQL writes config_*")
            if _ORM_CONFIG_WRITE_RE.search(text):
                violations.append(f"{relative}: ORM writes config model")
            if _FULL_METADATA_SCHEMA_WRITE_RE.search(text):
                violations.append(f"{relative}: full metadata writes config schema")

    assert violations == []
