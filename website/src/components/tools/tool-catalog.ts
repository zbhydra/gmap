import type { AccentHeadingMessage, FooterToolLinkMessage } from '../../i18n/schema'

/** 工具 ID（与 layout.footer.tools、data-tool-page 一致）。 */
export type ToolId = FooterToolLinkMessage['id']

/** 工具图标（sprite 名）：工具页眉标、相关工具卡、首页工具区与公司页工具胶囊共用。 */
export const TOOL_ICONS: Readonly<Record<ToolId, string>> = {
  'place-id-finder': 'scan',
  'review-link-generator': 'review',
  'email-checker': 'at',
  'lat-long-to-dms': 'locate',
  'dms-to-dd': 'swap',
  'bulk-keywords-generator': 'list-plus',
  'merge-csv': 'merge'
}

/** 带强调词标题的纯文本（结构化数据、无障碍名称用）。 */
export function headingText(title: AccentHeadingMessage): string {
  return `${title.lead}${title.accent}${title.tail}`
}
