/**
 * Email Checker 工具交互（W4，纯格式校验，无网络探测）。
 *
 * 输入单邮箱 → checkEmailFormat 纯前端校验 → 展示通过/问题清单（问题码映射
 * 为用户可见文案）+ 常见服务商域名 typo 建议。
 */

import { checkEmailFormat } from './lib/emailCheck'
import { queryRequired, reportToolView } from './toolDom'
import type { EmailCheckerContent } from '../../i18n/schema'

interface ToolCopy {
  content: EmailCheckerContent
}

function initEmailChecker(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const form = queryRequired<HTMLFormElement>(root, '[data-tool-form]')
  const emailInput = queryRequired<HTMLInputElement>(root, '[data-tool-input]')
  const resultSection = queryRequired<HTMLElement>(root, '[data-tool-result]')
  const resultHeading = queryRequired<HTMLElement>(root, '[data-result-heading]')
  const issueList = queryRequired<HTMLUListElement>(root, '[data-issue-list]')

  reportToolView('email-checker')

  form.addEventListener('submit', event => {
    event.preventDefault()
    const result = checkEmailFormat(emailInput.value)
    resultHeading.textContent = result.valid
      ? copy.content.form.validHeading
      : copy.content.form.invalidHeading
    resultHeading.dataset.outcome = result.valid ? 'valid' : 'invalid'

    issueList.textContent = ''
    for (const issue of result.issues) {
      const item = document.createElement('li')
      item.textContent = copy.content.form.issues[issue]
      issueList.append(item)
    }
    if (result.suggestedDomain.length > 0) {
      // 域名 typo 提示独立于格式合法性：格式合法但域名疑似拼错时同样提示。
      const item = document.createElement('li')
      item.textContent = `${copy.content.form.issues.typoDomain} ${result.suggestedDomain}`
      issueList.append(item)
    }
    resultSection.hidden = false
  })
}

function getToolCopy(root: HTMLElement): ToolCopy {
  const element = root.querySelector<HTMLScriptElement>('[data-tool-copy]')
  if (!element?.textContent) {
    throw new Error('[email-checker] Missing tool copy payload.')
  }
  return JSON.parse(element.textContent) as ToolCopy
}

const root = document.querySelector<HTMLElement>('[data-tool-page="email-checker"]')
if (root) {
  initEmailChecker(root)
}
