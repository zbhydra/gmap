# B3 · MCP Server 竞品口径(2026-08-30 官网抓取)

> Roadmap:B3 · 调研:🔍 完成(落地页口径)

## 功能定义

Google Maps Scraper MCP Server:给 AI agent(Claude Code / Cursor / VS Code / Codex)提供实时 Google Maps 搜索、评论、照片数据的标准化 MCP 接入,「one endpoint, one auth header」。

## 竞品事实

- 支持 AI 工具:Claude Code / Cursor / VS Code / Codex——落地页为四个客户端各提供一键复制配置。
- 能力三件套与 API 一致:search / reviews / photos(即 B2 三端点的 MCP 包装)。
- 认证:单端点 + 单 auth header(API key),复用 API 的 token 体系。
- 使用场景宣传:prospecting research、local market analysis、listing enrichment。
- 多语言落地页(6 语言)。

## 我方落地要点

- 实现成本低:gosom 能力之上包一层 MCP server(搜索/评论/照片三工具),认证复用 B2 密钥。
- 属于锦上添花的分发渠道,优先级排在 B1/B2 之后;阶段 2 末期或按需求排入。
