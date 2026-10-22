import type { McpOAuthContent } from './schema'
import type { Locale } from './ui'
import { getLocaleContent } from './localized-content'

export function getMcpOAuthContent(locale: Locale): McpOAuthContent {
  return getLocaleContent(locale).mcpOAuth
}
