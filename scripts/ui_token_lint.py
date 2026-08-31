#!/usr/bin/env python3
"""ui-token 合同静态扫描器（docs/references/specs/design.md / design.dark.md 的执行门）。

每次改动 UI 样式后运行：
    python3 scripts/ui_token_lint.py        # enforced 端存在违规则退出码 1
    python3 scripts/ui_token_lint.py -v     # 追加打印 pending 端（未迁移端）债务明细

检查规则（依据 design.md §0 / §8，只扫描样式面：.css 全文、.vue / .astro 的 <style> 块）：
  1. 色值    token 定义行之外禁止 #hex、rgb()/rgba()、常用具名色；
             允许 var()、color-mix(... var(...))、transparent、currentColor、inherit
  2. 渐变    linear/radial/conic-gradient 只允许出现在 token 定义（bg-image）内
  3. 圆角    border-radius 必须消费 var()；豁免 50%（正圆几何，合同刻度外的必然写法）
  4. 投影    box-shadow / text-shadow 必须消费 var()
  5. 间距    margin*/padding*/gap 的 px 值必须在 4px 刻度上；6px 为 design.md §7
             下拉菜单内边距关键值，单独豁免
  6. 字型    font-size / line-height 必须落在 typography 刻度，或 clamp()/var()

「token 定义行」指自定义属性声明（`--x:` 起、至行内分号收尾，值可跨多行），
其间的裸值就是合同取值本体，放行。宽高/定位属布局自由尺寸，不在合同管辖内，不检查。

enforced 端（extension / extension-bing）已迁移 Material You，违规即失败；
pending 端（website / admin）尚未迁移，只汇总数量，迁移时再转 enforced。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# enforced：已接入 Material You token 合同的端，违规即退出码 1
ENFORCED = [("extension", "extension/src"), ("extension-bing", "extension-bing/src")]
# pending：整端尚未迁移，只报告数量；迁移完成后移入 ENFORCED
PENDING = [
    ("website", "website/src"),
    ("admin", "admin/src"),
]
EXCLUDED_DIRS = {"node_modules", "dist", ".astro", "coverage", "test-results"}
STYLE_EXTS = {".css", ".vue", ".astro"}

SPACING_SCALE = {4, 8, 12, 16, 24, 32, 40, 64, 96}
# spec 关键值豁免：6 菜单内边距、14 输入框水平 padding（§7），20/22 紧凑面板、28 容器左右留白（§3）
SPACING_ALLOWED = SPACING_SCALE | {6, 14, 20, 22, 28}
FONT_SCALE = {10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16, 20, 24, 32}
LINE_HEIGHT_SCALE = {16, 18, 24, 28, 32, 40}

SPACING_PROPS = {"margin", "padding", "gap", "row-gap", "column-gap"}
SPACING_SUB = re.compile(r"^(margin|padding)-(top|right|bottom|left)$")
NAMED_COLORS = re.compile(r":[^;]*\b(white|black)\b(?![\w-])")
HEX_COLOR = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB_COLOR = re.compile(r"\brgba?\(")
GRADIENT = re.compile(r"\b(linear|radial|conic)-gradient\(")
RADIUS = re.compile(r"border-radius\s*:\s*([^;]+)")
SHADOW = re.compile(r"(?:box|text)-shadow\s*:\s*([^;]+)")
PROP = re.compile(r"^\s*([-a-zA-Z]+)\s*:")
PX = re.compile(r"(-?\d*\.?\d+)px")
VARDEF_START = re.compile(r"^\s*--[A-Za-z0-9-]+\s*:")


def style_blocks(text: str, suffix: str) -> list[tuple[int, str]]:
    """返回 [(起始行号, 块文本)]；.css 全文，其余取 <style> 块。"""
    if suffix == ".css":
        return [(1, text)]
    blocks = []
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", text, re.S | re.I):
        start = text[: m.start(1)].count("\n") + 1
        blocks.append((start, m.group(1)))
    return blocks


def strip_comment(line: str) -> str:
    return re.sub(r"/\*.*?\*/", "", line)


def check_block(block: str) -> tuple[list[str], int]:
    """扫描一个样式块，返回 (违规列表, px 裸值总数)。"""
    issues: list[str] = []
    raw_px = 0
    in_comment = False
    in_vardef = False

    for offset, raw in enumerate(block.splitlines(), start=1):
        line = raw
        # 多行 /* */ 注释状态机：注释内容不参与检查
        probe = line
        while True:
            if in_comment:
                end = probe.find("*/")
                if end < 0:
                    line = ""
                    break
                probe = probe[end + 2 :]
                in_comment = False
            start = probe.find("/*")
            if start < 0:
                break
            end = probe.find("*/", start + 2)
            if end < 0:
                in_comment = True
                probe = probe[:start]
                break
            probe = probe[:start] + probe[end + 2 :]
        if in_comment:
            line = probe
        code = strip_comment(line)
        if not code.strip():
            continue

        # token 定义跨行状态：--x: 起，直到出现分号
        if in_vardef:
            raw_px += len(PX.findall(code))
            if ";" in code:
                in_vardef = False
            continue
        if VARDEF_START.match(code):
            raw_px += len(PX.findall(code))
            if ";" not in code:
                in_vardef = True
            continue

        prop_m = PROP.match(code)
        prop = prop_m.group(1).lower() if prop_m else ""

        if HEX_COLOR.search(code) or RGB_COLOR.search(code) or NAMED_COLORS.search(code):
            issues.append(f"L{offset} 色值: {code.strip()[:110]}")
        if GRADIENT.search(code):
            issues.append(f"L{offset} 渐变: {code.strip()[:110]}")

        value = code.split(":", 1)[1] if ":" in code else ""
        if prop == "border-radius" and "var(" not in value and "50%" not in value:
            issues.append(f"L{offset} 圆角: {value.strip()[:110]}")
        if prop in ("box-shadow", "text-shadow") and "var(" not in value:
            issues.append(f"L{offset} 投影: {value.strip()[:110]}")

        if prop in SPACING_PROPS or SPACING_SUB.match(prop):
            for token in value.split():
                for m in PX.finditer(token):
                    n = float(m.group(1))
                    if n != 0 and abs(n) not in SPACING_ALLOWED:
                        issues.append(f"L{offset} 间距 {m.group(0)} 不在 4px 刻度: {code.strip()[:110]}")

        if prop == "font-size":
            if "clamp(" not in value and "var(" not in value:
                for m in PX.finditer(value):
                    if float(m.group(1)) not in FONT_SCALE:
                        issues.append(f"L{offset} 字号 {m.group(0)} 不在刻度: {code.strip()[:110]}")
        if prop == "line-height":
            if "var(" not in value and "." not in value and value.strip() not in ("normal", "inherit"):
                for m in PX.finditer(value):
                    if float(m.group(1)) not in LINE_HEIGHT_SCALE:
                        issues.append(f"L{offset} 行高 {m.group(0)} 不在刻度: {code.strip()[:110]}")

        raw_px += len(PX.findall(code))

    return issues, raw_px


def scan_end(label: str, rel_dir: str) -> tuple[list[str], dict[str, int], int]:
    base = REPO_ROOT / rel_dir
    issues: list[str] = []
    file_px: dict[str, int] = {}
    total = 0
    if not base.exists():
        return issues, file_px, total
    for path in sorted(base.rglob("*")):
        if path.suffix not in STYLE_EXTS:
            continue
        if any(part in EXCLUDED_DIRS for part in path.relative_to(REPO_ROOT).parts):
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = str(path.relative_to(REPO_ROOT))
        file_total = 0
        for start, block in style_blocks(text, path.suffix):
            block_issues, block_px = check_block(block)
            file_total += block_px
            for issue in block_issues:
                issues.append(f"{rel}:{issue}")
        if file_total:
            file_px[rel] = file_total
            total += file_total
    return issues, file_px, total


def main() -> int:
    parser = argparse.ArgumentParser(description="ui-token 合同静态扫描")
    parser.add_argument("-v", "--verbose", action="store_true", help="打印 pending 端债务明细")
    parser.add_argument("--json", action="store_true", help="输出机器可读 JSON")
    args = parser.parse_args()

    report: dict = {"enforced": {}, "pending": {}}
    failed = False

    for label, rel in ENFORCED:
        issues, file_px, total = scan_end(label, rel)
        report["enforced"][label] = {"violations": issues, "px_by_file": file_px}
        print(f"== {label}（enforced）==")
        if issues:
            failed = True
            for item in issues:
                print(f"  {item}")
            print(f"  → {len(issues)} 处违规")
        else:
            print("  ✓ 0 违规")
        print(f"  裸 px 总量（含豁免面）: {total}")

    for label, rel in PENDING:
        issues, _file_px, total = scan_end(label, rel)
        report["pending"][label] = {"count": len(issues), "px_total": total}
        note = "" if not args.verbose else "（-v 明细见下）"
        print(f"== {label}（pending 未迁移）== {len(issues)} 处 / 裸 px {total}{note}")
        if args.verbose:
            for item in issues[:200]:
                print(f"  {item}")
            if len(issues) > 200:
                print(f"  … 共 {len(issues)} 处")

    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=1))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
