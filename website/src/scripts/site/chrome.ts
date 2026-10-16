/**
 * 全站外壳交互（components/site/SiteHeader.astro）：导航滚动收拢、hover 胶囊、下拉、移动菜单与主题选择。
 *
 * - 下拉：点击 / 键盘开合，Esc 关闭并回焦触发器；主导航内的下拉在精确指针设备上 hover 打开，
 *   hover 打开后紧接着的那次点击保持展开（否则鼠标用户点触发器会把刚打开的面板关掉）；
 * - 移动菜单：打开时其余页面滚动锁定，Tab 焦点限制在导航与菜单内，Esc 关闭；
 * - 主题：亮 / 暗 / 跟随系统三态，写入 localStorage['mg-theme']（首帧恢复在 Layout 内联脚本），
 *   支持 View Transitions 时从触发器位置圆形揭示。
 */
import { initializeLanguageSwitcher } from './language-switcher'
import { finePointer, reducedMotion } from './motion'

/** hover 离开后延迟收起，指针斜穿到面板途中不会误关。 */
const DROPDOWN_HOVER_CLOSE_MS = 140

export function initializeSiteChrome(): void {
  const root = document.documentElement
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  const mobile = document.querySelector<HTMLElement>('[data-mobile-menu]')
  const menuButton = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const wide = matchMedia('(min-width: 961px)')

  const closeDropdowns = () => {
    document.querySelectorAll<HTMLElement>('[data-dropdown]').forEach(dropdown => {
      dropdown.classList.remove('is-open')
      dropdown.querySelector('[data-dropdown-trigger]')?.setAttribute('aria-expanded', 'false')
    })
  }

  const setMenu = (open: boolean) => {
    root.classList.toggle('menu-open', open)
    menuButton?.setAttribute('aria-expanded', String(open))
    if (mobile) mobile.inert = !open
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) closeDropdowns()
  }

  const updateScroll = () => nav?.classList.toggle('is-scrolled', window.scrollY > 24)
  window.addEventListener('scroll', updateScroll, { passive: true })
  updateScroll()
  menuButton?.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')))
  wide.addEventListener('change', () => {
    setMenu(false)
    closeDropdowns()
  })

  document.querySelectorAll<HTMLElement>('[data-dropdown]').forEach(dropdown => {
    const trigger = dropdown.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')
    if (!trigger) throw new Error('[site-chrome] [data-dropdown] 缺少 [data-dropdown-trigger]。')
    const setOpen = (open: boolean) => {
      closeDropdowns()
      dropdown.classList.toggle('is-open', open)
      trigger.setAttribute('aria-expanded', String(open))
    }
    let hoverOpened = false
    trigger.addEventListener('click', () => {
      if (hoverOpened) {
        hoverOpened = false
        return
      }
      setOpen(!dropdown.classList.contains('is-open'))
    })
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.focus()
      } else if (event.key === 'ArrowDown' && event.target === trigger) {
        event.preventDefault()
        setOpen(true)
        dropdown.querySelector<HTMLElement>('[data-dropdown-panel] a, [data-dropdown-panel] button')?.focus()
      }
    })
    dropdown.addEventListener('focusout', event => {
      if (!(event.relatedTarget instanceof Node) || !dropdown.contains(event.relatedTarget)) setOpen(false)
    })
    if (!dropdown.closest('[data-nav-links]')) return
    let closeTimer = 0
    dropdown.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !finePointer()) return
      clearTimeout(closeTimer)
      if (dropdown.classList.contains('is-open')) return
      setOpen(true)
      hoverOpened = true
    })
    dropdown.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse' || !finePointer()) return
      hoverOpened = false
      closeTimer = window.setTimeout(() => setOpen(false), DROPDOWN_HOVER_CLOSE_MS)
    })
  })

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    if (!event.target.closest('[data-dropdown]')) closeDropdowns()
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
    choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === (root.dataset.theme || 'system')))
  })
  reflectTheme()
  choices.forEach(choice => choice.addEventListener('click', () => {
    const theme = choice.dataset.themeChoice
    const apply = () => {
      if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
      else delete root.dataset.theme
      try {
        if (theme === 'light' || theme === 'dark') localStorage.setItem('mg-theme', theme)
        else localStorage.removeItem('mg-theme')
      } catch {
        // 存储被禁用时主题仍在当前页面生效。
      }
      reflectTheme()
    }
    const toggle = choice.closest('[data-dropdown]')?.querySelector<HTMLButtonElement>('[data-dropdown-trigger]')
    closeDropdowns()
    toggle?.focus()
    if (!document.startViewTransition || reducedMotion()) {
      apply()
      return
    }
    const box = toggle?.getBoundingClientRect()
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
