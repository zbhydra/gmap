/**
 * Website 页头语言切换器。
 *
 * 负责下拉菜单交互、语言偏好 Cookie，以及在语言路由之间导航时保留当前查询参数。
 */

/** 当前语言按钮选择器。 */
const LANGUAGE_BUTTON_SELECTOR = '.lang-btn'
/** 语言下拉菜单选择器。 */
const LANGUAGE_DROPDOWN_SELECTOR = '.lang-dropdown'
/** 语言选项选择器。 */
const LANGUAGE_OPTION_SELECTOR = '.lang-option'
/** 用户语言偏好 Cookie 的有效期，单位为秒。 */
const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60

/**
 * 构造语言切换后的站内地址。
 *
 * 语言只由 pathname 表达；当前 query 承载来源、活动等页面上下文，切换语言后必须原样保留。
 */
export function buildLanguageSwitchUrl(targetPath: string, currentHref: string): string {
  const currentUrl = new URL(currentHref)
  const targetUrl = new URL(targetPath, currentUrl.origin)
  targetUrl.search = currentUrl.search
  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
}

/** 初始化页头下拉交互（语言切换器 + 同模式的导航 API 下拉）。 */
export function initializeLanguageSwitcher(): void {
  const dropdowns = Array.from(document.querySelectorAll<HTMLElement>(LANGUAGE_DROPDOWN_SELECTOR))

  // 同模式可以有多个下拉（导航 API 下拉复用 .lang-btn/.lang-dropdown），逐个绑定，
  // 打开一个时互斥关闭其余，点击外部全部关闭。
  document.querySelectorAll<HTMLButtonElement>(LANGUAGE_BUTTON_SELECTOR).forEach(button => {
    const dropdown = button.parentElement?.querySelector<HTMLElement>(LANGUAGE_DROPDOWN_SELECTOR)
    button.addEventListener('click', event => {
      event.stopPropagation()
      dropdowns.forEach(other => {
        if (other !== dropdown) {
          other.classList.remove('show')
        }
      })
      dropdown?.classList.toggle('show')
    })
  })

  document.addEventListener('click', () => {
    dropdowns.forEach(dropdown => dropdown.classList.remove('show'))
  })

  const languageOptions = document.querySelectorAll<HTMLButtonElement>(LANGUAGE_OPTION_SELECTOR)
  languageOptions.forEach(option => {
    option.addEventListener('click', () => {
      const locale = option.dataset.locale
      const path = option.dataset.path
      if (!locale || !path) {
        return
      }

      document.cookie = `user-language=${locale}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
      window.location.href = buildLanguageSwitchUrl(path, window.location.href)
    })
  })
}
