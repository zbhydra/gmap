import type { ClinkReturnContent } from './schema'
import type { Locale } from './ui'
import { getLocaleContent } from './localized-content'

export function getStripeReturnContent(locale: Locale): ClinkReturnContent {
  return getLocaleContent(locale).stripe
}
