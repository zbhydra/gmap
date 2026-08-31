/**
 * feed 滚动驱动原语（滚动到底动画、步进滚动、可中断等待、末项结束判定）。
 *
 * 依据（013 逆向 02 阶段 3 / A1）：Maps 每次滚到底自动发起新一批
 * `/search?tbm=` XHR；动画时长随机 1.5~3.5s 拟人；feed 末项出现结束
 * 提示文字即采集完成。A7 列表模式复用同一套原语（步进滚动）。
 */

/** 滚动动画缓动（easeInOutQuad，近似竞品 jQuery swing 的平滑感）。 */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/**
 * 查找 feed 滚动容器；未就绪返回 null（由调用方计为该轮无进展）。
 */
export function findFeed(selector: string): HTMLElement | null {
  const element = document.querySelector(selector)
  return element instanceof HTMLElement ? element : null
}

/**
 * 末项结束判定：feed 最后一个子元素的文字包含配置的结束提示片段
 * （小写包含匹配；配置为空时永不命中）。
 */
export function isFeedEndReached(feed: HTMLElement, endMarker: string): boolean {
  const marker = endMarker.trim().toLowerCase()
  if (marker.length === 0) {
    return false
  }
  const last = feed.lastElementChild
  return (last?.textContent ?? '').toLowerCase().includes(marker)
}

/**
 * 平滑滚动到底：rAF 逐帧插值，动画时长由调用方随机指定（拟人）。
 *
 * @param feed 滚动容器。
 * @param durationMs 动画时长（毫秒）。
 * @param isCancelled 每帧检查的取消信号（暂停/重置时提前停止）。
 * @returns 是否完整播完（false = 被取消）。
 */
export function animateScrollToBottom(
  feed: HTMLElement,
  durationMs: number,
  isCancelled: () => boolean
): Promise<boolean> {
  const targetTop = feed.scrollHeight - feed.clientHeight
  return animateScrollBy(feed, targetTop - feed.scrollTop, durationMs, isCancelled)
}

/**
 * 平滑步进滚动（A7 列表模式：每轮 +500px 逐步触底加载更多，而非一次滚到底）。
 *
 * @param element 滚动容器。
 * @param deltaPx 步进像素（自动夹到剩余可滚动量内）。
 * @param durationMs 动画时长（毫秒）。
 * @param isCancelled 每帧检查的取消信号。
 * @returns 是否完整播完（false = 被取消）。
 */
export function animateScrollBy(
  element: HTMLElement,
  deltaPx: number,
  durationMs: number,
  isCancelled: () => boolean
): Promise<boolean> {
  return new Promise(resolve => {
    const startTop = element.scrollTop
    const targetTop = Math.min(
      startTop + Math.max(deltaPx, 0),
      element.scrollHeight - element.clientHeight
    )
    if (durationMs <= 0 || targetTop <= startTop) {
      element.scrollTop = Math.max(startTop, targetTop)
      resolve(true)
      return
    }

    const startedAt = performance.now()
    const step = (now: number): void => {
      if (isCancelled()) {
        resolve(false)
        return
      }
      const progress = Math.min((now - startedAt) / durationMs, 1)
      element.scrollTop = startTop + (targetTop - startTop) * easeInOutQuad(progress)
      if (progress >= 1) {
        resolve(true)
        return
      }
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

/**
 * 可中断延时：分片睡眠，每个分片后检查取消信号（暂停即时生效，
 * 不等完整 interval 走完）。
 *
 * @param ms 总等待时长（毫秒）。
 * @param isCancelled 取消信号。
 * @returns 是否完整等待（false = 被取消）。
 */
export function interruptibleDelay(ms: number, isCancelled: () => boolean): Promise<boolean> {
  return new Promise(resolve => {
    let remaining = ms
    const sliceMs = 100
    const tick = (): void => {
      if (isCancelled()) {
        resolve(false)
        return
      }
      if (remaining <= 0) {
        resolve(true)
        return
      }
      const current = Math.min(sliceMs, remaining)
      remaining -= current
      window.setTimeout(tick, current)
    }
    tick()
  })
}

/** 生成 [min, max) 区间随机数。 */
export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * 计算下一轮滚动前的等待时长（竞品公式：random()*interval*1000 + 2000ms）。
 */
export function nextScrollDelayMs(intervalSec: number): number {
  return Math.random() * intervalSec * 1000 + 2000
}
