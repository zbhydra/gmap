type Scope = Document | HTMLElement
type Easing = (progress: number) => number

const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)')
const pointerQuery = matchMedia('(hover: hover) and (pointer: fine)')
const bound = new WeakMap<HTMLElement, Set<string>>()

export const reducedMotion = () => reduceQuery.matches
export const finePointer = () => pointerQuery.matches
export const ease = {
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  outExpo: (t: number) => t === 1 ? 1 : 1 - 2 ** (-10 * t),
  inOutCubic: (t: number) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
}
export const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
export const formatNumber = (value: number, decimals = 0) => value.toLocaleString(document.documentElement.lang || 'en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
})

export function tween(duration: number, onUpdate: (progress: number, raw: number) => void, easing: Easing = ease.outCubic): Promise<void> {
  return new Promise(resolve => {
    const start = performance.now()
    const tick = (now: number) => {
      const progress = reducedMotion() ? 1 : Math.min(1, (now - start) / duration)
      onUpdate(easing(progress), progress)
      if (progress < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

/** 循环回调同时受视口与页面可见性控制；返回清理函数供页面私有动画复用。 */
export function inView(element: Element, callback: (visible: boolean) => void, options: { once?: boolean; threshold?: number; rootMargin?: string } = {}): () => void {
  let visible = false
  const once = options.once !== false
  const notify = () => {
    const active = visible && !document.hidden
    if (active || !once) callback(active)
    if (active && once) cleanup()
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting)
    notify()
  }, { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px' })
  const cleanup = () => {
    observer.disconnect()
    document.removeEventListener('visibilitychange', notify)
  }
  observer.observe(element)
  document.addEventListener('visibilitychange', notify)
  return cleanup
}

export interface VisibilityGate {
  /** 区块可见时立即返回，否则挂起到重新可见。 */
  wait: () => Promise<void>
  /** 停顿 ms 毫秒，结束时若已离屏或页面在后台则继续挂起。 */
  nap: (ms: number) => Promise<void>
}

/** T4 循环由脚本启停（design-website.md §4）：离屏与页面后台时停在下一个 wait / nap。 */
export function visibilityGate(element: Element, threshold = 0.15): VisibilityGate {
  let active = false
  const waiters: Array<() => void> = []
  inView(element, visible => {
    active = visible
    if (visible) waiters.splice(0).forEach(resume => resume())
  }, { once: false, threshold })
  const waitVisible = () => (active ? Promise.resolve() : new Promise<void>(resolve => waiters.push(resolve)))
  return { wait: waitVisible, nap: ms => wait(ms).then(waitVisible) }
}

/** 数字从 from 滚到 to，按站点语言加千分位（减弱动效下 tween 直接给终值）。 */
export function countTo(element: HTMLElement, from: number, to: number, duration: number): Promise<void> {
  return tween(duration, progress => {
    element.textContent = formatNumber(Math.round(from + (to - from) * progress))
  })
}

function all(scope: Scope, selector: string): HTMLElement[] {
  const nodes = Array.from(scope.querySelectorAll<HTMLElement>(selector))
  if (scope instanceof HTMLElement && scope.matches(selector)) nodes.unshift(scope)
  return nodes
}

function unbound(scope: Scope, selector: string, behavior: string): HTMLElement[] {
  return all(scope, selector).filter(element => {
    const keys = bound.get(element) ?? new Set<string>()
    if (keys.has(behavior)) return false
    keys.add(behavior)
    bound.set(element, keys)
    return true
  })
}

function splitText(element: HTMLElement): void {
  if (element.dataset.split === 'static') return
  let index = 0
  const unit = (node: Node) => {
    const outer = document.createElement('span')
    const inner = document.createElement('span')
    outer.className = 'w'
    inner.className = 'wi'
    inner.style.setProperty('--i', String(index++))
    inner.append(node)
    outer.append(inner)
    return outer
  }
  const walk = (parent: Node) => {
    Array.from(parent.childNodes).forEach(node => {
      if (node instanceof Text) {
        const fragment = document.createDocumentFragment()
        node.data.split(/(\s+)/).filter(Boolean).forEach(part => {
          const text = document.createTextNode(part)
          fragment.append(/^\s+$/.test(part) ? text : unit(text))
        })
        parent.replaceChild(fragment, node)
      } else if (node instanceof HTMLElement && node.tagName !== 'BR') {
        if (node.matches('.accent, .text-grad, .text-grad-ai, [data-split-unit]')) {
          const marker = document.createTextNode('')
          parent.replaceChild(marker, node)
          parent.replaceChild(unit(node), marker)
        } else walk(node)
      }
    })
  }
  walk(element)
}

function setupReveal(scope: Scope): void {
  all(scope, '[data-stagger]').forEach(group => {
    let index = 0
    group.querySelectorAll<HTMLElement>('[data-reveal], [data-split]').forEach(element => {
      if (element.closest('[data-stagger]') !== group || element.dataset.revealDelay) return
      const delay = Number(group.dataset.staggerStart || 0) + index++ * Number(group.dataset.stagger || 70)
      if (element.dataset.split === 'static') return
      element.style.setProperty('--reveal-delay', `${delay}ms`)
      element.style.setProperty('--split-delay', `${delay}ms`)
    })
  })
  all(scope, '[data-reveal-delay]').forEach(element => {
    element.style.setProperty('--reveal-delay', `${element.dataset.revealDelay}ms`)
    element.style.setProperty('--split-delay', `${element.dataset.revealDelay}ms`)
  })
  unbound(scope, '[data-split]', 'split').forEach(splitText)
  unbound(scope, '[data-reveal], [data-split]', 'reveal').forEach(element => {
    if (element.dataset.split === 'static') return
    const reveal = () => element.classList.add('is-revealed')
    if (reducedMotion()) reveal()
    else if (element.dataset.revealOnload) setTimeout(reveal, Number(element.dataset.revealOnload))
    // clip 自身被裁成零高，观察父元素才会产生相交回调。
    else inView(element.dataset.reveal === 'clip' ? element.parentElement! : element, reveal)
  })
}

function setupCounts(scope: Scope): void {
  unbound(scope, '[data-count]', 'count').forEach(element => {
    const target = Number(element.dataset.count)
    const render = (value: number) => {
      element.textContent = `${element.dataset.countPrefix || ''}${formatNumber(value, Number(element.dataset.countDecimals || 0))}${element.dataset.countSuffix || ''}`
    }
    if (reducedMotion()) render(target)
    else inView(element, () => {
      void tween(Number(element.dataset.countDuration || 1100), progress => render(target * progress), ease.outExpo)
    })
    reduceQuery.addEventListener('change', () => {
      if (reducedMotion()) render(target)
    })
  })
}

function setupPointer(scope: Scope): void {
  const setSpotlight = (element: HTMLElement, event: PointerEvent) => {
    const box = element.getBoundingClientRect()
    element.style.setProperty('--mx', `${event.clientX - box.left}px`)
    element.style.setProperty('--my', `${event.clientY - box.top}px`)
  }
  unbound(scope, '[data-spotlight-group], [data-spotlight]', 'spotlight').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (!finePointer()) return
      if (element.hasAttribute('data-spotlight-group')) {
        element.querySelectorAll<HTMLElement>('[data-spotlight]').forEach(child => setSpotlight(child, event))
      } else if (!element.parentElement?.closest('[data-spotlight-group]')) setSpotlight(element, event)
    })
  })
  unbound(scope, '[data-tilt], [data-magnetic]', 'pointer-motion').forEach(element => {
    let frame = 0
    const reset = () => {
      cancelAnimationFrame(frame)
      element.style.transform = ''
    }
    element.addEventListener('pointermove', event => {
      if (!finePointer() || reducedMotion()) return
      const box = element.getBoundingClientRect()
      const x = event.clientX - box.left - box.width / 2
      const y = event.clientY - box.top - box.height / 2
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (reducedMotion()) return
        if (element.hasAttribute('data-tilt')) {
          const strength = Number(element.dataset.tilt || 6)
          element.style.transform = `perspective(1600px) rotateX(${-y / box.height * strength}deg) rotateY(${x / box.width * strength}deg)`
        } else {
          const strength = Number(element.dataset.magnetic || 0.25)
          element.style.transform = `translate(${x * strength}px, ${y * strength}px)`
        }
      })
    })
    element.addEventListener('pointerleave', reset)
    reduceQuery.addEventListener('change', reset)
    pointerQuery.addEventListener('change', reset)
  })
}

function setupMarquee(scope: Scope): void {
  unbound(scope, '[data-marquee]', 'marquee').forEach(element => {
    const track = element.querySelector('.marquee-track')
    if (!track) return
    const clone = track.cloneNode(true)
    if (!(clone instanceof HTMLElement)) return
    clone.setAttribute('aria-hidden', 'true')
    clone.inert = true
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'))
    element.append(clone)
  })
}

function setupScroll(scope: Scope): void {
  const elements = unbound(scope, '[data-parallax], [data-scroll-progress]', 'scroll')
  if (!elements.length) return
  const offsets = new WeakMap<HTMLElement, number>()
  let frame = 0
  const update = () => {
    frame = 0
    if (document.hidden) return
    elements.forEach(element => {
      if (element.hasAttribute('data-scroll-progress')) {
        const maximum = document.documentElement.scrollHeight - innerHeight
        element.style.transform = `scaleX(${maximum > 0 ? scrollY / maximum : 0})`
      } else if (reducedMotion()) {
        element.style.translate = ''
        offsets.delete(element)
      } else {
        const box = element.getBoundingClientRect()
        const top = box.top - (offsets.get(element) || 0)
        if (top > innerHeight || top + box.height < 0) return
        const next = -(top + box.height / 2 - innerHeight / 2) * Number(element.dataset.parallax || 0.12)
        element.style.translate = `0 ${next}px`
        offsets.set(element, next)
      }
    })
  }
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }
  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', requestUpdate)
  reduceQuery.addEventListener('change', requestUpdate)
  update()
}

function setupTyping(scope: Scope): void {
  unbound(scope, '[data-typing]', 'typing').forEach(element => {
    const parsed: unknown = JSON.parse(element.dataset.typing || '[]')
    if (!Array.isArray(parsed) || !parsed.length || !parsed.every((phrase): phrase is string => typeof phrase === 'string')) {
      throw new Error('[motion] data-typing 必须包含至少一个字符串。')
    }
    const phrases: string[] = parsed
    const field = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element : null
    const render = (text: string) => {
      if (field) field.placeholder = text
      else element.textContent = text
    }
    let visible = false
    let phrase = 0
    let letters = 0
    let deleting = false
    let timer = 0
    const tick = () => {
      if (!visible || document.hidden || reducedMotion() || (field && (field.value || document.activeElement === field))) return
      const text = phrases[phrase]
      letters += deleting ? -1 : 1
      render(text.slice(0, letters))
      let delay = deleting ? 30 : 70
      if (!deleting && letters >= text.length) {
        deleting = true
        delay = 2000
      } else if (deleting && letters <= 0) {
        deleting = false
        phrase = (phrase + 1) % phrases.length
        delay = 360
      }
      timer = window.setTimeout(tick, delay)
    }
    const resume = () => {
      clearTimeout(timer)
      if (reducedMotion()) render(phrases[0])
      else if (visible) timer = window.setTimeout(tick, 500)
    }
    render(phrases[0])
    inView(element, active => {
      visible = active
      resume()
    }, { once: false })
    reduceQuery.addEventListener('change', resume)
    field?.addEventListener('focus', () => clearTimeout(timer))
    field?.addEventListener('blur', resume)
    field?.addEventListener('input', resume)
  })
}

/** 动态插入内容后可重复调用，scope 自身也参与匹配；每种行为只绑定一次。 */
export function initMotion(scope: Scope = document): void {
  setupReveal(scope)
  setupCounts(scope)
  setupPointer(scope)
  setupMarquee(scope)
  setupScroll(scope)
  setupTyping(scope)
  // 公共循环组件自动获得暂停边界，页面私有循环仍声明 data-inview。
  all(scope, '.bg-contours, .aurora, .floaty, .dot--live, .media-slot, .skel, .caret, .spinner, .progress, [data-marquee]').forEach(element => {
    if (!element.closest('[data-inview]')) element.dataset.inview = ''
  })
  unbound(scope, '[data-inview]', 'inview').forEach(element => {
    inView(element, visible => element.classList.toggle('is-inview', visible), { once: false })
  })
}

const reflectVisibility = () => document.documentElement.classList.toggle('motion-paused', document.hidden)
document.addEventListener('visibilitychange', reflectVisibility)
reflectVisibility()
