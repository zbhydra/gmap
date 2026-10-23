/**
 * 全站外壳交互（components/site/SiteHeader.astro）：导航滚动收拢、hover 胶囊、头部菜单、移动菜单与主题选择。
 *
 * - 头部菜单（API、语言、主题）：共用浮层上的 APG 菜单按钮（site/pop-menu），点击或键盘开合；
 * - 移动菜单：打开时其余页面滚动锁定，Tab 焦点限制在导航与菜单内，Esc 关闭；
 * - 主题：亮 / 暗 / 跟随系统三态，写入 localStorage['mg-theme']（首帧恢复在 Layout 内联脚本），
 *   支持 View Transitions 时从触发器位置圆形揭示。
 */
import { initializeLanguageSwitcher } from './language-switcher'
import { reducedMotion } from './motion'
import { bindPopMenu, type PopMenuPlacement } from './pop-menu'
import { applySiteTheme, readSiteTheme } from './theme'

/** 头部菜单：API 导航链接在触发器下居中；语言、主题靠右，打开时聚焦当前项。语言菜单只在多语言页面渲染。 */
const HEADER_MENUS: ReadonlyArray<readonly [string, PopMenuPlacement]> = [
  ['nav-api', { side: 'bottom', align: 'center', focusChecked: false }],
  ['nav-language', { side: 'bottom', align: 'end', focusChecked: true }],
  ['nav-theme', { side: 'bottom', align: 'end', focusChecked: true }]
]

export function initializeSiteChrome(): void {
  const root = document.documentElement
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  const mobile = document.querySelector<HTMLElement>('[data-mobile-menu]')
  const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const wide = matchMedia('(min-width: 961px)')

  const setMenu = (open: boolean) => {
    root.classList.toggle('menu-open', open)
    menuButton?.setAttribute('aria-expanded', String(open))
    if (mobile) mobile.inert = !open
    document.body.style.overflow = open ? 'hidden' : ''
  }

  const updateScroll = () => nav?.classList.toggle('is-scrolled', window.scrollY > 24)
  window.addEventListener('scroll', updateScroll, { passive: true })
  updateScroll()
  menuButton?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')))
  wide.addEventListener('change', () => setMenu(false))

  // 菜单的外部点击、焦点移出与窗口宽度变化关闭都由共用浮层处理，这里只挂菜单本身
  HEADER_MENUS.forEach(([id, placement]) => {
    if (document.getElementById(`${id}-btn`)) bindPopMenu(id, placement)
  })

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    if (event.target.closest('[data-mobile-menu] a, [data-mobile-menu] button:not([aria-disabled="true"])')) setMenu(false)
  })
  document.addEventListener('keydown', event => {
    if (!root.classList.contains('menu-open')) return
    if (event.key === 'Escape') {
      setMenu(false)
      menuButton?.focus()
    }
    if (event.key === 'Tab') {
      const controls = Array.from(document.querySelectorAll<HTMLElement>('[data-nav] button, [data-nav] a, [data-mobile-menu] a, [data-mobile-menu] button'))
        .filter(element => element.getClientRects().length && getComputedStyle(element).visibility === 'visible' && !element.matches(':disabled'))
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
  })

  const links = document.querySelector<HTMLElement>('[data-nav-links]')
  const pill = links?.querySelector<HTMLElement>('.nav-pill')
  links?.querySelectorAll<HTMLElement>('.nav-link').forEach(link => {
    link.addEventListener('pointerenter', () => {
      if (!pill || !links) return
      pill.style.setProperty('--pill-x', `${link.getBoundingClientRect().left - links.getBoundingClientRect().left}px`)
      pill.style.setProperty('--pill-w', `${link.offsetWidth}px`)
      links.classList.add('has-hover')
    })
  })
  links?.addEventListener('pointerleave', () => links.classList.remove('has-hover'))

  const choices = document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]')
  const reflectTheme = () => choices.forEach(choice => {
    choice.setAttribute('aria-checked', String(choice.dataset.themeChoice === readSiteTheme()))
  })
  reflectTheme()
  // 选中后菜单自行关闭并把焦点还给触发器；揭示的圆心取触发器中心
  choices.forEach(choice => choice.addEventListener('click', () => {
    const theme = choice.dataset.themeChoice
    const apply = () => {
      applySiteTheme(theme === 'light' || theme === 'dark' ? theme : 'system')
      reflectTheme()
    }
    if (!document.startViewTransition || reducedMotion()) {
      apply()
      return
    }
    const box = document.getElementById('nav-theme-btn')?.getBoundingClientRect()
    const x = box ? box.left + box.width / 2 : innerWidth / 2
    const y = box ? box.top + box.height / 2 : 0
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    root.classList.add('theme-switching')
    const transition = document.startViewTransition(apply)
    void transition.ready.then(() => {
      const tokens = getComputedStyle(root)
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, {
        duration: parseFloat(tokens.getPropertyValue('--dur-4')),
        easing: tokens.getPropertyValue('--ease-out').trim(),
        pseudoElement: '::view-transition-new(root)',
      })
    }).catch(() => {
      // 浏览器跳过过渡时，主题已由更新回调应用。
    })
    void transition.finished.finally(() => root.classList.remove('theme-switching'))
  }))
  initializeLanguageSwitcher()
}
