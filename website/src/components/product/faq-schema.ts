import type { FAQItemMessage } from '../../i18n/schema'

/** 产品页 FAQ 的 FAQPage 结构化数据（与页面手风琴同一份问答）。 */
export function faqPageSchema(items: readonly FAQItemMessage[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  }
}
