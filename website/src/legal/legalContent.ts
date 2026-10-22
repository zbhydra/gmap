/**
 * Terms 与 Privacy 的文案类型与领域入口。
 * 各语言静态文案统一存放在 i18n/lang/；sections 是法律正文，glance 仅概括正文已明确写到的内容。
 */
import type { Locale } from '../i18n/ui'
import { getLocaleContent } from '../i18n/localized-content'

/** 法务页路由标识。 */
export type LegalPageKind = 'terms' | 'privacy'

/** 法务文档中的一个区块。 */
export interface LegalSection {
  /** 小节锚点：目录、要点卡与外部链接都按它定位，各 locale 保持同值（en-US 标题的 slug）。 */
  id: string
  /** 可见 H2 标题。 */
  title: string
  /** 区块下的正文段落。 */
  paragraphs: string[]
  /** 可选的要点清单（义务、示例或用户权利）。 */
  items?: string[]
  /** 清单是禁止 / 绝不做的条目（以叉号标记）。 */
  prohibitions?: boolean
}

/** 「要点速览」卡：概括正文已写明的一点，点击跳到对应小节。 */
export interface LegalGlanceItem {
  /** 目标小节的 id。 */
  section: string
  /** 图标名（public/img/icons.svg 的 i-<name>）。 */
  icon: string
  /** 图标块色调（.icon-tile--<tone>），缺省为中性。 */
  tone?: 'ok' | 'pin'
  title: string
  text: string
}

/** 覆盖范围待补提示：正文尚未覆盖的产品，法务补稿前按设计稿以 TBD 标注。 */
export interface LegalCoverage {
  /** 提示区的无障碍名称。 */
  label: string
  badge: string
  /** 加粗的引导语。 */
  lead: string
  text: string
}

/** 渲染一份法务文档所需的文案。 */
export interface LegalDocumentContent {
  /** 页脚链接文案。 */
  navLabel: string
  /** HTML title。 */
  seoTitle: string
  /** meta description。 */
  seoDescription: string
  /** 页面 H1，同时是文档切换与插画上的文档名。 */
  title: string
  /** H1 下方的简短摘要。 */
  intro: string
  /** updatedAt 前显示的标签。 */
  updatedLabel: string
  /** 可读的最后更新日期。 */
  updatedAt: string
  /** 最后更新日期的 ISO 形态（time datetime 与 JSON-LD dateModified 共用）。 */
  updatedAtISO: string
  /** 一句话概括：另一份文档末尾「下一篇」卡片的说明。 */
  summary: string
  /** 目录下方求助卡的标题。 */
  helpTitle: string
  /** 要点速览卡（4 张）。 */
  glance: LegalGlanceItem[]
  /** 文档区块。 */
  sections: LegalSection[]
  /** 覆盖范围待补提示；正文已覆盖全部产品时省略。 */
  coverage?: LegalCoverage
}

/** 两份法务文档共用的页面文案；{key} 占位符由页面填充。 */
export interface LegalPageCopy {
  /** 面包屑：首页。 */
  crumbHome: string
  /** 面包屑：法务分组（不可点击）。 */
  crumbLegal: string
  /** 文档切换的无障碍名称。 */
  switchLabel: string
  /** 阅读时长，{minutes} 按正文 200 词 / 分钟估算。 */
  readTime: string
  /** 小节数，{count} 为数量。 */
  sectionCount: string
  /** 目录标题。 */
  tocTitle: string
  /** 目录的无障碍名称，{title} 为文档名。 */
  tocLabel: string
  /** 要点速览的小节标签。 */
  glanceKicker: string
  /** 要点速览的说明。 */
  glanceNote: string
  /** 小节链接（复制带锚点的地址）的无障碍名称，{title} 为小节标题。 */
  anchorLabel: string
  /** 复制支持邮箱按钮的无障碍名称，{email} 为邮箱。 */
  copyEmail: string
  /** 求助卡的联系支持入口。 */
  contactSupport: string
  /** 「下一篇」卡片标签。 */
  nextLabel: string
}

/** 单一 locale 的法务页文案。 */
export interface LegalContent {
  /** 两份文档共用的页面文案。 */
  page: LegalPageCopy
  /** 服务条款。 */
  terms: LegalDocumentContent
  /** 隐私政策。 */
  privacy: LegalDocumentContent
}

/** 返回指定 locale 的法务文案。 */
export function getLegalContent(locale: Locale): LegalContent {
  return getLocaleContent(locale).legal
}
