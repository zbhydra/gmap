/**
 * Dashboard 展示格式。
 *
 * 时间统一按后端业务时区 America/New_York 展示（界面标 ET），当年省略年份；History 的时间范围按纽约日历日
 * 换算成毫秒边界。随页面语言的格式化器惰性创建：Astro SSR 也会执行组件模块，读取 DOM 必须推迟到客户端。
 */

/** 后端业务时区（backend utils/time.py）。 */
export const BUSINESS_TIME_ZONE = 'America/New_York'

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
    const timeZone = BUSINESS_TIME_ZONE
    localeFormatters = {
      dateTime: new Intl.DateTimeFormat(locale, {
        timeZone, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      }),
      dateTimeNoYear: new Intl.DateTimeFormat(locale, {
        timeZone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      }),
      date: new Intl.DateTimeFormat(locale, { timeZone, year: 'numeric', month: 'short', day: 'numeric' }),
      // 日历日本身就是纽约日期，按 UTC 零点表达，展示时不再换时区
      dayRange: new Intl.DateTimeFormat(locale, { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' }),
      number: new Intl.NumberFormat(locale)
    }
  }
  return localeFormatters
}

const yearFormat = new Intl.DateTimeFormat('en-US', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric' })
const ymdFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'
})
const partsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIME_ZONE, hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
})

/** 日期时间（ET）：当年省略年份，跨年才显示；空值显示破折号。 */
export function formatDateTime(ms: number | null): string {
  if (ms === null) return '—'
  const date = new Date(ms)
  const sameYear = yearFormat.format(date) === yearFormat.format(new Date())
  return (sameYear ? formatters().dateTimeNoYear : formatters().dateTime).format(date)
}

/** 日期（ET）。 */
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

/** 毫秒时间戳对应的纽约日历日（YYYY-MM-DD）。 */
export function etYmd(ms: number): string {
  return ymdFormat.format(new Date(ms))
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

/** 某一时刻纽约相对 UTC 的偏移（毫秒）。 */
function etOffsetMs(ms: number): number {
  const parts: Record<string, number> = {}
  for (const part of partsFormat.formatToParts(new Date(ms))) parts[part.type] = Number(part.value)
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return asUtc - Math.floor(ms / 1000) * 1000
}

/** 纽约日历日零点的毫秒时间戳；夏令时切换日按当日偏移再校正一次即可收敛。 */
export function etMidnight(ymd: string): number {
  const base = ymdToUtc(ymd)
  const guess = base - etOffsetMs(base)
  return base - etOffsetMs(guess)
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
