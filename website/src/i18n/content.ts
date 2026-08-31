import { defaultLocale, type Locale } from './ui'
import type { SiteContent } from './schema'
import { enUS } from './lang/en-US'

export type { Locale }
export type { SiteContent }

export const content: Record<Locale, SiteContent> = {
  'en-US': enUS
}

export function getContent(locale: Locale): SiteContent {
  return content[locale] ?? content[defaultLocale]
}
