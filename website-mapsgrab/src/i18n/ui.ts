export const locales = [
  'en-US'
] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en-US'

export const localeNames: Record<Locale, string> = {
  'en-US': 'English'
}

export const localePaths: Record<Locale, string> = {
  'en-US': ''
}

// Hreflang mapping for SEO alternate language links
export const hreflangMap: Record<Locale, string> = {
  'en-US': 'en'
}
