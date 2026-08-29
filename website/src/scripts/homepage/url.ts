/** Homepage 可复用的用户链接 URL 工具。 */

/** 可提交给解析流程的用户链接协议。 */
const VALID_USER_LINK_PROTOCOLS = new Set(['http:', 'https:', 'tg:'])

/** 解析用户输入链接，缺少协议时按 https 补齐。 */
export function parseUserLink(link: string): URL | null {
  const trimmed = link.trim()
  if (!trimmed) {
    return null
  }

  const normalized = trimmed.includes('://') ? trimmed : `https://${trimmed}`
  try {
    return new URL(normalized)
  } catch {
    return null
  }
}

/** 判断 HTTP(S) 链接是否带有可被用户识别的主机名。 */
function hasValidHttpHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname.includes('.') || hostname.startsWith('[')
}

/** 判断用户输入是否是可提交解析的 URL。 */
export function isValidUserLink(link: string): boolean {
  const trimmed = link.trim()
  if (!trimmed || /\s/.test(trimmed)) {
    return false
  }

  const parsed = parseUserLink(trimmed)
  if (!parsed || !VALID_USER_LINK_PROTOCOLS.has(parsed.protocol)) {
    return false
  }

  if (parsed.protocol === 'tg:') {
    return Boolean(parsed.hostname || parsed.pathname)
  }

  return hasValidHttpHostname(parsed.hostname)
}

/** 安全提取用户输入链接 host，失败返回 invalid。 */
export function safeUserLinkHost(link: string): string {
  return parseUserLink(link)?.host ?? 'invalid'
}
