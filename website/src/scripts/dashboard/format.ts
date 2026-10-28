/**
 * Dashboard 展示格式。
 *
 * 时间按浏览器时区展示，当年省略年份；History 的时间范围按浏览器本地日历日换算成毫秒边界。
 * 随页面语言的格式化器惰性创建：Astro SSR 也会执行组件模块，读取 DOM 必须推迟到客户端。
 */

const DAY_MS = 86_400_000

interface LocaleFormatters {
  dateTime: Intl.DateTimeFormat
  dateTimeNoYear: Intl.DateTimeFormat
  date: Intl.DateTimeFormat
  dayRange: Intl.DateTimeFormat
  number: Intl.NumberFormat
}

let localeFormatters: LocaleFormatters | null = null

function formatters(): LocaleFormatters {
  if (!localeFormatters) {
    const locale = document.documentElement.lang || 'en-US'
    localeFormatters = {
      dateTime: new Intl.DateTimeFormat(locale, {
        year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      }),
      dateTimeNoYear: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      date: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }),
      // 日历日按 UTC 零点表达，展示时不再换时区
      dayRange: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' }),
      number: new Intl.NumberFormat(locale)
    }
  }
  return localeFormatters
}

/** 日期时间：当年省略年份，跨年才显示；空值显示破折号。 */
export function formatDateTime(ms: number | null): string {
  if (ms === null) return '—'
  const date = new Date(ms)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return (sameYear ? formatters().dateTimeNoYear : formatters().dateTime).format(date)
}

/** 日期。 */
export function formatDate(ms: number): string {
  return formatters().date.format(new Date(ms))
}

/** 按页面语言分组的整数。 */
export function formatNumber(value: number): string {
  return formatters().number.format(value)
}

/** 订阅到期时间后端可能返回秒或毫秒，统一成毫秒。 */
export function epochMs(value: number): number {
  return value < 10_000_000_000 ? value * 1000 : value
}

/** 用 values 填充文案里的 {name} 占位；未提供的占位原样保留。 */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}

/** 毫秒时间戳对应的本地日历日（YYYY-MM-DD）。 */
export function localYmd(ms: number): string {
  const date = new Date(ms)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0')).join('-')
}

function ymdToUtc(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** 日历日加减天数。 */
export function addDays(ymd: string, days: number): string {
  return new Date(ymdToUtc(ymd) + days * DAY_MS).toISOString().slice(0, 10)
}

/** 合法日历日：格式正确且不是 2026-02-30 这类溢出日期。 */
export function isYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && addDays(value, 0) === value
}

/** 本地日历日零点的毫秒时间戳。 */
export function localMidnight(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

/** 自定义时间范围的按钮文字（两端含），由浏览器按语言合并相同的年月。 */
export function formatDayRange(from: string, to: string): string {
  return formatters().dayRange.formatRange(new Date(ymdToUtc(from)), new Date(ymdToUtc(to)))
}

/** 额度阈值级别（Online 与 API 共用）：用到 80% 提醒、用尽错误；写到 .meter 的 data-level，颜色总与数字同时出现。 */
export type QuotaLevel = '' | 'warn' | 'bad'

export function quotaLevel(used: number, total: number): QuotaLevel {
  if (used >= total) return 'bad'
  return used >= total * 0.8 ? 'warn' : ''
}

/** 搜索比较用的文本：忽略大小写与变音符号，Zurich 能匹配 Zürich。 */
export function foldText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}
