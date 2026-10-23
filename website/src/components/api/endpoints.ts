/**
 * API / MCP 页展示的公开地址（构建期）：与后端 GET /api/client/maps/api/connection 同一来源 PUBLIC_API_BASE_URL；
 * REST 前缀与 MCP 路径取自 014 合同（docs/feat/014.Maps云端/tech-API与MCP.md）。MCP 入口必须带结尾斜杠，/mcp 返回 404。
 */
const origin = (import.meta.env.PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '')
if (!origin) {
  throw new Error('[api-pages] Missing PUBLIC_API_BASE_URL build env: API and MCP code samples need the public API origin.')
}

/** REST 基础地址（Search / Reviews / Photos 端点挂在其下）。 */
export const API_BASE_URL = `${origin}/api/client/maps/api`

/** MCP Streamable HTTP 入口。 */
export const MCP_URL = `${origin}/mcp/`
