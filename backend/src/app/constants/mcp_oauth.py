"""远程 MCP OAuth 授权服务器的协议路径、令牌格式、有效期与限流阈值。"""

import enum

# 唯一授予范围：同步 Search / Reviews，消费账号的 maps_api 月请求额度。
MCP_OAUTH_SCOPE = "exports"

# 协议端点路径；issuer 不带路径，PRM 路径按 RFC 9728 由 mcp.public_url 的 /mcp/ 派生。
MCP_OAUTH_AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server"
MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH = (
    "/.well-known/oauth-protected-resource/mcp/"
)
MCP_OAUTH_AUTHORIZE_PATH = "/oauth/authorize"
MCP_OAUTH_REGISTER_PATH = "/oauth/register"
MCP_OAUTH_TOKEN_PATH = "/oauth/token"
# 按 RFC 格式返回、不套 REST 信封的路径，错误中间件对其豁免。
MCP_OAUTH_PROTOCOL_PATHS = frozenset(
    {
        MCP_OAUTH_AUTHORIZATION_SERVER_METADATA_PATH,
        MCP_OAUTH_PROTECTED_RESOURCE_METADATA_PATH,
        MCP_OAUTH_AUTHORIZE_PATH,
        MCP_OAUTH_REGISTER_PATH,
        MCP_OAUTH_TOKEN_PATH,
    }
)
# 官网确认页相对路径（默认语言路由）；官网路由统一带尾斜杠，票据或错误原因码放在 fragment。
MCP_OAUTH_CONSENT_PATH = "/oauth/consent/"

# 令牌前缀与 Maps API Key 互不相交，MCP 入口按前缀分流。
MCP_OAUTH_ACCESS_TOKEN_PREFIX = "casmcpat_"
MCP_OAUTH_REFRESH_TOKEN_PREFIX = "casmcprt_"
MCP_OAUTH_ACCESS_TOKEN_RANDOM_BYTES = 32
# 刷新令牌 = 前缀 + 授权随机标识（family） + "_" + 本代随机值；family 在整条授权内不变。
MCP_OAUTH_REFRESH_FAMILY_RANDOM_BYTES = 16
MCP_OAUTH_REFRESH_SECRET_RANDOM_BYTES = 32
MCP_OAUTH_ACCESS_TOKEN_LENGTH = len(MCP_OAUTH_ACCESS_TOKEN_PREFIX) + (
    MCP_OAUTH_ACCESS_TOKEN_RANDOM_BYTES * 2
)
MCP_OAUTH_ACCESS_TOKEN_PATTERN = rf"{MCP_OAUTH_ACCESS_TOKEN_PREFIX}[0-9a-f]{{{MCP_OAUTH_ACCESS_TOKEN_RANDOM_BYTES * 2}}}"
MCP_OAUTH_REFRESH_TOKEN_PATTERN = (
    rf"{MCP_OAUTH_REFRESH_TOKEN_PREFIX}"
    rf"(?P<family>[0-9a-f]{{{MCP_OAUTH_REFRESH_FAMILY_RANDOM_BYTES * 2}}})_"
    rf"[0-9a-f]{{{MCP_OAUTH_REFRESH_SECRET_RANDOM_BYTES * 2}}}"
)

# 待确认票据有效期（秒），与官网票据存储的 30 分钟一致。
MCP_OAUTH_REQUEST_TTL_SECONDS = 30 * 60
MCP_OAUTH_CODE_TTL_SECONDS = 180
# 访问令牌有效期（秒）；撤销与账号禁用由 MCP 入口逐请求实时检查。
MCP_OAUTH_ACCESS_TOKEN_TTL_SECONDS = 6 * 60 * 60
# 授权空闲有效期（毫秒）：最近刷新时间（未刷新取创建时间）超过该时长即失效。
MCP_OAUTH_GRANT_IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000
# 快照列长度上限；客户端名称是 DCR 自报值，超长截断仅影响展示。
MCP_OAUTH_CLIENT_NAME_MAX_LENGTH = 128
MCP_OAUTH_REDIRECT_HOST_MAX_LENGTH = 255

# 按 IP 滑动窗口限流。注册须容纳 Claude、ChatGPT 云端共享出口（每次全新连接都会注册）。
MCP_OAUTH_REGISTER_RATE_LIMIT_MAX = 300
MCP_OAUTH_REGISTER_RATE_LIMIT_WINDOW_SECONDS = 60 * 60
MCP_OAUTH_AUTHORIZE_RATE_LIMIT_MAX = 60
MCP_OAUTH_AUTHORIZE_RATE_LIMIT_WINDOW_SECONDS = 60

# 回环回调主机（urlsplit 的 hostname 形态，IPv6 不带方括号）。
MCP_OAUTH_LOOPBACK_HOSTS = frozenset({"localhost", "127.0.0.1", "::1"})


class McpOAuthAuthorizeError(enum.StrEnum):
    """授权端校验失败时写入官网确认页 fragment 的原因码，按校验顺序排列。"""

    RATE_LIMITED = "rate_limited"
    INVALID_CLIENT = "invalid_client"
    INVALID_REDIRECT_URI = "invalid_redirect_uri"
    UNSUPPORTED_RESPONSE_TYPE = "unsupported_response_type"
    INVALID_PKCE = "invalid_pkce"
    INVALID_RESOURCE = "invalid_resource"
    SERVER_ERROR = "server_error"
