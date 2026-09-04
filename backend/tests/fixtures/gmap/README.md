# Gmap 生产实验 fixture

本目录保存 2026-09-04 从生产研究机 `/data/gmaps-research/` 取回的实验脚本和结果。`browser_search_url.txt` 是生产 `stress_test.py` 实际读取的浏览器级 pb 模板；`raw/` 的常规 pb、两次自适应浏览器 pb、L2 与 `golden/search_29_columns.json` 来自同一次生产采集链。`scripts/` 已删除代理凭据、服务器地址和绝对路径；`data/` 已删除代理出口 IP，并对评论作者、正文和评论 ID 做不可逆脱敏。

`source-manifest.sha256` 记录生产原件摘要，`manifest.sha256` 记录脱敏后文件摘要，供后续 Provider 实现追溯 HTTP 模板、停止条件、timeout、重试、ll 软降级和 Reviews 位表。fixture 不包含可用凭据，也不作为真实网络冒烟配置。
