/**
 * Email Checker 工具交互（docs/feat/015.工具与增长/tech-Email验证.md「工具页展示」）。
 *
 * 提交 → checkEmailFormat：格式不合法就地列出问题，不请求后端；常见服务商域名拼写提示照常展示，不阻止提交。
 * 格式合法 → POST /api/client/tools/email-verify（经邮件服务器验证，可能需要数十秒，按钮 loading 并禁用）
 * → 明细表。失败在结果区展示：当日免费次数用完（限流）用本地文案，其他后端业务错误（如系统繁忙）用后端文案，
 * 连不上接口用本地文案；均可重新提交。
 */

import { HomepageApiError, postJson } from '../homepage/api'
import { ensureDeviceId } from '../homepage/device'
import { checkEmailFormat, type EmailCheckResult } from './lib/emailCheck'
import { queryRequired, reportToolView } from './toolDom'
import type { EmailAccountType, EmailCheckerContent, EmailVerifyStatus } from '../../i18n/schema'

/** EmailCheckerPage 注入的文案载荷：只含表单与结果文案。 */
type ToolCopy = Pick<EmailCheckerContent, 'form' | 'result'>

/** 验证接口 data 中本页使用的字段（全量合同见 tech-Email验证「公开验证接口」）。 */
interface EmailVerifyResult {
  email: string
  domain: string
  /** 后端原值透出，未知取值按 unknown 展示。 */
  status: string
  /** 0–100 综合评分。 */
  score: number
  is_deliverable: boolean
  is_catch_all: boolean
  is_role_account: boolean
  is_disposable: boolean
  is_free_email: boolean
  mx_records: string[]
}

/** 状态色：对应 .badge 的 --ok / --warn / --bad / --muted 修饰。 */
type StatusTone = 'ok' | 'warn' | 'bad' | 'muted'

/** 明细表中由脚本填充的取值格（状态徽章单独处理）。 */
type DetailField = 'deliverable' | 'mxRecords' | 'email' | 'domain' | 'accountType' | 'catchAll' | 'score'

interface Elements {
  input: HTMLInputElement
  submit: HTMLButtonElement
  submitSpinner: HTMLElement
  submitLabel: HTMLElement
  submitArrow: SVGSVGElement
  hint: HTMLElement
  check: HTMLElement
  checkHeading: HTMLElement
  issueList: HTMLUListElement
  result: HTMLElement
  error: HTMLElement
  errorText: HTMLElement
  detail: HTMLElement
  status: HTMLElement
  statusIcon: SVGUseElement
  statusText: HTMLElement
  fields: Record<DetailField, HTMLElement>
}

const VERIFY_PATH = '/api/client/tools/email-verify'

/** 后端通用限流码 RATE_LIMIT_EXCEEDED；本接口按 IP 每日限次，命中即当日免费次数用完。 */
const RATE_LIMIT_EXCEEDED_CODE = 998

/**
 * 前端等待上限：后端单次 Reoon 调用 50 秒超时、nginx 读超时 60 秒；前端多留余量，
 * 让服务端先返回可读的系统繁忙错误，而不是前端提前放弃。
 */
const VERIFY_TIMEOUT_MS = 70_000

/** 可投递为 ok；必然退信或不应发送为 bad；能收信但有风险为 warn；无定论为中性。 */
const STATUS_TONES: Readonly<Record<EmailVerifyStatus, StatusTone>> = {
  safe: 'ok',
  invalid: 'bad',
  disabled: 'bad',
  spamtrap: 'bad',
  disposable: 'warn',
  inbox_full: 'warn',
  catch_all: 'warn',
  role_account: 'warn',
  unknown: 'muted'
}

/** 徽章图标与颜色同义，状态不只靠颜色区分。 */
const TONE_ICONS: Readonly<Record<StatusTone, string>> = {
  ok: 'check',
  warn: 'alert',
  bad: 'x',
  muted: 'info'
}

function initEmailChecker(root: HTMLElement): void {
  const copy = getToolCopy(root)
  const elements = queryElements(root)

  reportToolView('email-checker')

  // 验证进行中提交按钮禁用：默认按钮禁用时浏览器也不响应输入框回车提交，不会重复请求
  queryRequired<HTMLFormElement>(root, '[data-tool-form]').addEventListener('submit', event => {
    event.preventDefault()
    void runCheck(elements, copy)
  })
}

async function runCheck(elements: Elements, copy: ToolCopy): Promise<void> {
  const email = elements.input.value.trim()
  const check = checkEmailFormat(email)
  renderFormatCheck(elements, copy, check)
  elements.result.hidden = true
  elements.error.hidden = true
  elements.detail.hidden = true
  if (!check.valid) return

  setBusy(elements, copy, true)
  try {
    renderVerifyResult(elements, copy, await verifyEmail(email))
  } catch (error) {
    console.error(new Error('[email-checker] Email verification failed.', { cause: error }))
    elements.errorText.textContent = verifyFailureMessage(error, copy)
    elements.error.hidden = false
  } finally {
    setBusy(elements, copy, false)
  }
  elements.result.hidden = false
}

async function verifyEmail(email: string): Promise<EmailVerifyResult> {
  return postJson<EmailVerifyResult>(
    VERIFY_PATH,
    { deviceId: await ensureDeviceId() },
    { email },
    { timeoutMs: VERIFY_TIMEOUT_MS }
  )
}

/**
 * 后端业务错误带数值业务码与已本地化文案；连不上、超时或响应无法解析时用本地文案。
 * 限流的后端文案是通用的「请求过多」，这里换成明确的「今日次数已用完」。
 */
function verifyFailureMessage(error: unknown, copy: ToolCopy): string {
  if (!(error instanceof HomepageApiError) || typeof error.code !== 'number') {
    return copy.result.unavailable
  }
  return error.code === RATE_LIMIT_EXCEEDED_CODE ? copy.result.rateLimited : error.message
}

/** 输入框下方就地展示格式问题；格式合法时只剩拼写提示，用提醒色。无内容时整块隐藏。 */
function renderFormatCheck(elements: Elements, copy: ToolCopy, check: EmailCheckResult): void {
  const items = check.issues.map(issue => {
    const item = document.createElement('li')
    item.textContent = copy.form.issues[issue]
    return item
  })
  if (check.suggestedDomain.length > 0) {
    // 拼写提示独立于格式合法性：格式合法但域名疑似拼错时同样提示
    const item = document.createElement('li')
    const domain = document.createElement('strong')
    domain.textContent = check.suggestedDomain
    item.append(`${copy.form.issues.typoDomain} `, domain)
    items.push(item)
  }
  elements.issueList.replaceChildren(...items)
  elements.checkHeading.hidden = check.valid
  elements.check.dataset.tone = check.valid ? 'warn' : 'bad'
  elements.check.hidden = items.length === 0
}

function setBusy(elements: Elements, copy: ToolCopy, busy: boolean): void {
  elements.submit.disabled = busy
  elements.submitSpinner.hidden = !busy
  elements.submitArrow.toggleAttribute('hidden', busy)
  elements.submitLabel.textContent = busy ? copy.form.submitting : copy.form.submit
  elements.hint.textContent = busy ? copy.form.verifyingHint : ''
}

function renderVerifyResult(elements: Elements, copy: ToolCopy, result: EmailVerifyResult): void {
  const status = isVerifyStatus(result.status) ? result.status : 'unknown'
  const tone = STATUS_TONES[status]
  const { fields } = elements
  elements.status.className = `badge badge--${tone}`
  elements.statusIcon.setAttribute('href', `/img/icons.svg#i-${TONE_ICONS[tone]}`)
  elements.statusText.textContent = copy.result.statuses[status]
  fields.deliverable.textContent = result.is_deliverable ? copy.result.yes : copy.result.no
  renderMxRecords(fields.mxRecords, copy, result.mx_records)
  fields.email.textContent = result.email
  fields.domain.textContent = result.domain
  fields.accountType.textContent = accountTypesOf(result)
    .map(type => copy.result.accountTypes[type])
    .join(' · ')
  fields.catchAll.textContent = result.is_catch_all ? copy.result.yes : copy.result.no
  fields.score.textContent = `${result.score}/100`
  elements.detail.hidden = false
}

function renderMxRecords(cell: HTMLElement, copy: ToolCopy, records: readonly string[]): void {
  if (records.length === 0) {
    const none = document.createElement('span')
    none.className = 'tool-verify-empty'
    none.textContent = copy.result.noMx
    cell.replaceChildren(none)
    return
  }
  const list = document.createElement('ul')
  list.className = 'tool-verify-list tool-verify-mono'
  for (const record of records) {
    const item = document.createElement('li')
    item.textContent = record
    list.append(item)
  }
  cell.replaceChildren(list)
}

/** 角色、一次性与免费邮箱可同时成立，全部列出；都不成立时为普通邮箱。 */
function accountTypesOf(result: EmailVerifyResult): EmailAccountType[] {
  const types: EmailAccountType[] = []
  if (result.is_role_account) types.push('role')
  if (result.is_disposable) types.push('disposable')
  if (result.is_free_email) types.push('free')
  return types.length > 0 ? types : ['standard']
}

function isVerifyStatus(value: string): value is EmailVerifyStatus {
  return Object.hasOwn(STATUS_TONES, value)
}

function queryElements(root: HTMLElement): Elements {
  const field = (name: DetailField) => queryRequired<HTMLElement>(root, `[data-verify-field="${name}"]`)
  return {
    input: queryRequired<HTMLInputElement>(root, '[data-tool-input]'),
    submit: queryRequired<HTMLButtonElement>(root, '[data-tool-submit]'),
    submitSpinner: queryRequired<HTMLElement>(root, '[data-submit-spinner]'),
    submitLabel: queryRequired<HTMLElement>(root, '[data-submit-label]'),
    submitArrow: queryRequired<SVGSVGElement>(root, '[data-tool-submit] .icon-arrow'),
    hint: queryRequired<HTMLElement>(root, '[data-verify-hint]'),
    check: queryRequired<HTMLElement>(root, '[data-format-check]'),
    checkHeading: queryRequired<HTMLElement>(root, '[data-format-heading]'),
    issueList: queryRequired<HTMLUListElement>(root, '[data-issue-list]'),
    result: queryRequired<HTMLElement>(root, '[data-tool-result]'),
    error: queryRequired<HTMLElement>(root, '[data-verify-error]'),
    errorText: queryRequired<HTMLElement>(root, '[data-verify-error-text]'),
    detail: queryRequired<HTMLElement>(root, '[data-verify-detail]'),
    status: queryRequired<HTMLElement>(root, '[data-verify-status]'),
    statusIcon: queryRequired<SVGUseElement>(root, '[data-verify-status] use'),
    statusText: queryRequired<HTMLElement>(root, '[data-verify-status-text]'),
    fields: {
      deliverable: field('deliverable'),
      mxRecords: field('mxRecords'),
      email: field('email'),
      domain: field('domain'),
      accountType: field('accountType'),
      catchAll: field('catchAll'),
      score: field('score')
    }
  }
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
