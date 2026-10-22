import type { ClinkReturnContent } from './schema'
import type { Locale } from './ui'
import { getLocaleContent } from './localized-content'

export function getClinkReturnContent(locale: Locale): ClinkReturnContent {
  return getLocaleContent(locale).clink
}
