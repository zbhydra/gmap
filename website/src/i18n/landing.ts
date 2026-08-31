/**
 * Online / API 落地页的路由 slug → i18n 字典键映射（015 U1，五页共用模板）。
 *
 * 路由文件只传 slug，内容装配集中在此处；新增落地页只需补一行映射 + 路由文件，
 * 不需要在 10 个路由文件里同步字典键。
 */
import { getContent, type Locale } from './content'
import type { LandingPageContent, SiteContent } from './schema'

/** slug → SiteContent.pages 键（与 src/pages/ 与 src/pages/[lang]/ 的落地页路由文件同名）。 */
const LANDING_PAGE_KEYS = {
  'online-scraper': 'onlineScraper',
  'google-maps-scraper-api': 'scraperApi',
  'google-maps-reviews-scraper-api': 'reviewsApi',
  'google-maps-photos-api': 'photosApi',
  'google-maps-scraper-mcp': 'scraperMcp'
} as const satisfies Record<string, keyof SiteContent['pages']>

export type LandingPageId = keyof typeof LANDING_PAGE_KEYS

/** 按路由 slug 取对应落地页字典内容。 */
export function getLandingPageContent(pageId: LandingPageId, locale: Locale): LandingPageContent {
  const key = LANDING_PAGE_KEYS[pageId]
  return getContent(locale).pages[key]
}
