/**
 * 邮箱格式校验纯函数（W4 工具矩阵：纯格式校验，SMTP 探测明确不做）。
 *
 * 校验口径 = 邮箱标准中邮件服务器实际执行的结构规则（local@domain 形态、
 * local 长度/字符/点位置、domain 标签与 TLD），外加常见邮箱服务商域名
 * typo 提示（lead list 死信的第一大来源）。不做网络探测。
 */

import type { EmailIssueCode } from '../../../i18n/schema'

/** local 部分 RFC 5321 长度上限。 */
const LOCAL_PART_MAX_LENGTH = 64

/** domain 部分 RFC 5321 长度上限。 */
const DOMAIN_MAX_LENGTH = 253

/** 常见服务商域名 → 正确拼写（编辑距离口径的近似 typo 映射）。 */
const COMMON_DOMAIN_TYPOS: ReadonlyMap<string, string> = new Map([
  ['gmial.com', 'gmail.com'],
  ['gmai.com', 'gmail.com'],
  ['gmail.co', 'gmail.com'],
  ['gnail.com', 'gmail.com'],
  ['gmail.con', 'gmail.com'],
  ['gmaill.com', 'gmail.com'],
  ['hotmial.com', 'hotmail.com'],
  ['hotmail.co', 'hotmail.com'],
  ['hotail.com', 'hotmail.com'],
  ['outlok.com', 'outlook.com'],
  ['outllok.com', 'outlook.com'],
  ['outlook.co', 'outlook.com'],
  ['yaho.com', 'yahoo.com'],
  ['yahooo.com', 'yahoo.com'],
  ['yaho0.com', 'yahoo.com'],
  ['iclod.com', 'icloud.com'],
  ['icloud.co', 'icloud.com'],
  ['live.con', 'live.com'],
  ['aol.con', 'aol.com']
])

/** 一次校验结果：合法时 issues 为空；有问题时逐条给出稳定问题码。 */
export interface EmailCheckResult {
  /** 格式是否合法（typo 提示不影响合法性判定）。 */
  valid: boolean
  /** 违规问题码列表（顺序即展示顺序）。 */
  issues: EmailIssueCode[]
  /** 域名疑似 typo 时给出建议域名，否则为空串。 */
  suggestedDomain: string
}

/** 校验单个邮箱地址的格式。 */
export function checkEmailFormat(rawInput: string): EmailCheckResult {
  const input = rawInput.trim()
  if (input.length === 0) {
    return { valid: false, issues: ['empty'], suggestedDomain: '' }
  }

  const issues: EmailIssueCode[] = []
  const atCount = [...input].filter(char => char === '@').length
  if (atCount === 0) {
    issues.push('missingAt')
    return { valid: false, issues, suggestedDomain: '' }
  }
  if (atCount > 1) {
    issues.push('multipleAt')
    return { valid: false, issues, suggestedDomain: '' }
  }

  const [localPart, domainPart] = splitAt(input)
  issues.push(...checkLocalPart(localPart))
  issues.push(...checkDomain(domainPart))

  const suggestedDomain = suggestDomain(domainPart)
  return { valid: issues.length === 0, issues, suggestedDomain }
}

/** 按（唯一）@ 拆分 local 与 domain；调用方已保证恰有一个 @。 */
function splitAt(input: string): [string, string] {
  const atIndex = input.indexOf('@')
  return [input.slice(0, atIndex), input.slice(atIndex + 1)]
}

/** local 部分（@ 前）结构校验。 */
function checkLocalPart(localPart: string): EmailIssueCode[] {
  if (localPart.length === 0) {
    return ['localEmpty']
  }
  const issues: EmailIssueCode[] = []
  if (localPart.length > LOCAL_PART_MAX_LENGTH) {
    issues.push('localTooLong')
  }
  if (/[^\x21-\x7e]/.test(localPart) || /[\\"()<>\[\]:;,]/.test(localPart)) {
    // 只接受 atext 集合内的可打印 ASCII：空格、引号与书写性符号按非法处理
    //（quoted-string 形态在真实业务地址里几乎不存在，误报成本低于漏报）。
    issues.push('localInvalidChars')
  }
  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    issues.push('localDotPosition')
  }
  return issues
}

/** domain 部分（@ 后）结构校验。 */
function checkDomain(domainPart: string): EmailIssueCode[] {
  if (domainPart.length === 0) {
    return ['domainEmpty']
  }
  const issues: EmailIssueCode[] = []
  if (domainPart.length > DOMAIN_MAX_LENGTH) {
    issues.push('domainTooLong')
  }
  const labels = domainPart.split('.')
  if (labels.some(label => label.length === 0)) {
    issues.push('domainEmptyLabel')
    return issues
  }
  const lastLabel = labels[labels.length - 1] as string
  if (!/^[a-zA-Z]{2,}$/.test(lastLabel)) {
    // TLD 按现行实践中全字母且 ≥2 位校验（数字/连字符 TLD 非公开注册形态）。
    issues.push('domainNoTld')
  }
  for (const label of labels) {
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      issues.push('domainInvalidChars')
      break
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      issues.push('domainLabelHyphen')
      break
    }
  }
  return issues
}

/** 域名疑似常见服务商 typo 时给出建议；否则空串。 */
function suggestDomain(domainPart: string): string {
  return COMMON_DOMAIN_TYPOS.get(domainPart.trim().toLowerCase()) ?? ''
}
