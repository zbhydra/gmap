import type { CompanyContent } from '../company/companyContent'
import type { LegalContent } from '../legal/legalContent'
import type { ClinkReturnContent, McpOAuthContent, SiteContent } from './schema'
import { defaultLocale, type Locale } from './ui'
import * as enUS from './lang/en-US'
import * as zhCN from './lang/zh-CN'
import * as jaJP from './lang/ja-JP'
import * as koKR from './lang/ko-KR'
import * as zhTW from './lang/zh-TW'
import * as esES from './lang/es-ES'
import * as ptBR from './lang/pt-BR'
import * as deDE from './lang/de-DE'
import * as frFR from './lang/fr-FR'
import * as ruRU from './lang/ru-RU'
import * as itIT from './lang/it-IT'
import * as viVN from './lang/vi-VN'
import * as thTH from './lang/th-TH'
import * as idID from './lang/id-ID'

/** 同一语言的五类静态文案；页面保留各自领域 getter。 */
export interface LocaleContent {
  site: SiteContent
  company: CompanyContent
  legal: LegalContent
  mcpOAuth: McpOAuthContent
  clink: ClinkReturnContent
}

export const localizedContent: Record<Locale, LocaleContent> = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'zh-TW': zhTW,
  'es-ES': esES,
  'pt-BR': ptBR,
  'de-DE': deDE,
  'fr-FR': frFR,
  'ru-RU': ruRU,
  'it-IT': itIT,
  'vi-VN': viVN,
  'th-TH': thTH,
  'id-ID': idID
}

export function getLocaleContent(locale: Locale): LocaleContent {
  return localizedContent[locale] ?? localizedContent[defaultLocale]
}
