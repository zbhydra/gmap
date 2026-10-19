#!/usr/bin/env python3
"""扩展设计稿的静态校验（README §11）。只用标准库 + 仓库自带的 scripts/ui_token_lint.py。

    python3 docs/design/extension/tools/check.py

1. token lint：assets/css 下全部 .css 按 atlas 合同扫描（色值只在 token 声明里、圆角 / 投影走 var()、
   间距与字号落在刻度上）。仓库的 ui_token_lint.py 只扫登记过的端，这里复用它的 check_block。
2. 面板 token 同步：panel.css 的 :host 与 tokens.css 的 :root 同名 token 必须同值
   （var() 引用先在各自文件内展开再比；面板专属 token 用不同的名字）。

任一项不通过退出码为 1。
"""

from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
REPO = HERE.parents[2]
CSS = HERE / "assets" / "css"


def load_lint():
    spec = importlib.util.spec_from_file_location("ui_token_lint", REPO / "scripts" / "ui_token_lint.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def token_lint() -> int:
    lint = load_lint()
    total = 0
    for path in sorted(CSS.rglob("*.css")):
        issues, _ = lint.check_block(path.read_text(encoding="utf-8"), lint.PROFILES["atlas"])
        total += len(issues)
        for issue in issues:
            print(f"  {path.relative_to(HERE)} {issue}")
    print(f"token lint：{total} 处违规")
    return total


def declarations(path: Path, selector: str) -> dict[str, str]:
    text = re.sub(r"/\*.*?\*/", "", path.read_text(encoding="utf-8"), flags=re.S)
    match = re.search(re.escape(selector) + r"\s*\{", text)
    depth, end = 1, match.end()
    while depth:
        depth += {"{": 1, "}": -1}.get(text[end], 0)
        end += 1
    body = text[match.end() : end - 1]
    found = re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", body)
    return {name: re.sub(r"\s+", " ", value).strip() for name, value in found}


def resolve(values: dict[str, str]) -> dict[str, str]:
    def expand(value: str, depth: int = 0) -> str:
        if depth > 8:
            return value
        return re.sub(
            r"var\((--[a-z0-9-]+)\)",
            lambda m: expand(values[m.group(1)], depth + 1) if m.group(1) in values else m.group(0),
            value,
        )

    return {name: expand(value) for name, value in values.items()}


def panel_sync() -> int:
    tokens = resolve(declarations(CSS / "tokens.css", ":root"))
    panel = resolve(declarations(CSS / "panel.css", ":host"))
    shared = [name for name in panel if name in tokens]
    drift = [name for name in shared if panel[name] != tokens[name]]
    for name in drift:
        print(f"  {name}\n    tokens.css {tokens[name]}\n    panel.css  {panel[name]}")
    print(f"面板 token 同步：同名 {len(shared)} 个，取值不一致 {len(drift)} 个")
    return len(drift)


if __name__ == "__main__":
    failed = token_lint() + panel_sync()
    sys.exit(1 if failed else 0)
