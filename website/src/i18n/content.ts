import type { Locale } from './ui'
import type { SiteContent } from './schema'
import { getLocaleContent } from './localized-content'

export type { Locale, SiteContent }

export function getContent(locale: Locale): SiteContent {
  return getLocaleContent(locale).site
}
