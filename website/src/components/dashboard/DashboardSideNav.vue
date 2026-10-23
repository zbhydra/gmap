<script setup lang="ts">
/**
 * 侧栏：品牌与收起按钮、四个视图入口（真实链接 + 选中滑块）、图标栏提示、收起快捷键、窄屏抽屉、用户卡插槽。
 *
 * 宽屏（≥ 960）可收起为 72px 图标栏，状态写在 html[data-side] 并存 localStorage（首帧由 Layout 头部脚本恢复）；
 * 窄屏是抽屉，开合状态由根组件持有（主区 inert 也在根组件），这里只负责抽屉内的关闭按钮与 inert。
 */
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { overlayOpen } from '../../scripts/dashboard/dom'
import { DASHBOARD_VIEWS, isPlainClick, type DashboardView } from '../../scripts/dashboard/route'
import { closePop } from '../../scripts/site/pop'

const props = defineProps<{
  copy: DashboardContent
  view: DashboardView
  viewHref: (view: DashboardView) => string
  homeHref: string
  drawerOpen: boolean
  /** 视口 < 960：侧栏是抽屉。 */
  narrow: boolean
}>()

const emit = defineEmits<{
  navigate: [view: DashboardView]
  closeDrawer: []
  /** 即将收起 / 展开，参数是起始状态：根组件据此锁定主区布局。 */
  collapse: [from: 'expanded' | 'collapsed']
}>()

const SIDE_KEY = 'mg-dash-side'
/** 首个提示稍候再出；刚隐藏的提示在这段时间内移到相邻项会立即出现，便于连续扫读。 */
const TIP_DELAY_MS = 320
const TIP_WARM_MS = 400
const ICONS: Record<DashboardView, string> = { online: 'cloud', history: 'history', api: 'code', subscriptions: 'tag' }

const sideEl = ref<HTMLElement | null>(null)
const navEl = ref<HTMLElement | null>(null)
const toggleEl = ref<HTMLButtonElement | null>(null)
const closeEl = ref<HTMLButtonElement | null>(null)
/** 与构建期 HTML 一致地从展开开始，挂载后再读 html[data-side]，避免水合时属性不一致。 */
const collapsed = ref(false)
const isMac = ref(false)
const thumbY = ref(0)
const thumbPlaced = ref(false)
const thumbAnimated = ref(false)
const tip = reactive({ shown: false, text: '', shortcut: false, left: 0, top: 0 })
let tipTimer: ReturnType<typeof setTimeout> | undefined
let tipWarmUntil = 0

function label(view: DashboardView): string {
  const shell = props.copy.shell
  return { online: shell.navOnline, history: shell.navJobHistory, api: shell.navApi, subscriptions: shell.navSubscriptions }[view]
}

function handleLinkClick(event: MouseEvent, view: DashboardView): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('navigate', view)
}

/** 导航内方向键在四个入口间移动（循环），Home / End 到首尾。 */
function handleNavKeydown(event: KeyboardEvent): void {
  const links = Array.from(navEl.value?.querySelectorAll<HTMLAnchorElement>('.side-link') ?? [])
  const index = links.findIndex(link => link === document.activeElement)
  if (index < 0) return
  let target: HTMLAnchorElement | undefined
  if (event.key === 'ArrowDown') target = links[(index + 1) % links.length]
  else if (event.key === 'ArrowUp') target = links[(index - 1 + links.length) % links.length]
  else if (event.key === 'Home') target = links[0]
  else if (event.key === 'End') target = links[links.length - 1]
  if (!target) return
  event.preventDefault()
  target.focus()
}

/* ---------------------------------------------------------------- 选中滑块 */

function placeThumb(): void {
  const link = navEl.value?.querySelector<HTMLElement>(`[data-route="${props.view}"]`)
  if (!link) return
  thumbY.value = link.offsetTop
  if (thumbPlaced.value) return
  // 首次定位不做动画：下一帧才打开过渡
  thumbPlaced.value = true
  requestAnimationFrame(() => {
    thumbAnimated.value = true
  })
}

/* ---------------------------------------------------------------- 收起为图标栏 */

function setCollapsed(next: boolean): void {
  if (next === collapsed.value || props.narrow) return
  // 账户菜单按用户卡定位：切换前先收起，焦点在菜单里时交还用户卡
  closePop()
  hideTip()
  emit('collapse', collapsed.value ? 'collapsed' : 'expanded')
  // 收起后品牌链接与套餐区退出 Tab 序列：焦点原本在那里时交给收起按钮
  if (next && document.activeElement?.closest('.side-brand, .user-plan-clip')) toggleEl.value?.focus()
  const root = document.documentElement
  if (next) root.dataset.side = 'collapsed'
  else delete root.dataset.side
  collapsed.value = next
  try {
    localStorage.setItem(SIDE_KEY, next ? 'collapsed' : 'expanded')
  } catch {
    // 存储被禁用时本次会话内仍然生效
  }
}

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select') !== null)
}

/** `[` 与 ⌘B / Ctrl+B：输入中的 `[` 照常输入；弹窗或浮层打开、抽屉模式、按住不放时都不响应。 */
function handleShortcut(event: KeyboardEvent): void {
  if (event.repeat || event.defaultPrevented || props.narrow || overlayOpen()) return
  const modifier = isMac.value ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey
  const modB = modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'b'
  const bracket = event.key === '[' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)
  if (!modB && !bracket) return
  event.preventDefault()
  setCollapsed(!collapsed.value)
}

/* ---------------------------------------------------------------- 图标栏提示 */

/** 收起按钮在两种状态下都给提示（含快捷键）；其余入口只在图标栏状态下提示。 */
function showTip(target: HTMLElement, immediate: boolean): void {
  const isToggle = target === toggleEl.value
  if (props.narrow || (!isToggle && !collapsed.value)) return
  clearTimeout(tipTimer)
  const reveal = (): void => {
    const text = isToggle ? (collapsed.value ? props.copy.shell.expandSidebar : props.copy.shell.collapseSidebar) : target.dataset.tip
    if (!text || !sideEl.value) return
    const rect = target.getBoundingClientRect()
    tip.text = text
    tip.shortcut = isToggle
    tip.left = Math.round(sideEl.value.getBoundingClientRect().right + 8)
    tip.top = Math.round(rect.top + rect.height / 2)
    tip.shown = true
  }
  if (immediate || tip.shown || performance.now() < tipWarmUntil) reveal()
  else tipTimer = setTimeout(reveal, TIP_DELAY_MS)
}

function hideTip(): void {
  clearTimeout(tipTimer)
  if (tip.shown) tipWarmUntil = performance.now() + TIP_WARM_MS
  tip.shown = false
}

function tipTarget(target: EventTarget | null): HTMLElement | null {
  return target instanceof Element ? target.closest<HTMLElement>('[data-tip], .side-toggle') : null
}

function handlePointerOver(event: PointerEvent): void {
  if (event.pointerType === 'touch') return
  const target = tipTarget(event.target)
  if (target) showTip(target, false)
  else hideTip()
}

function handlePointerOut(event: PointerEvent): void {
  const from = tipTarget(event.target)
  if (from && !from.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null)) hideTip()
}

function handleFocusIn(event: FocusEvent): void {
  const target = tipTarget(event.target)
  if (target && target === event.target && target.matches(':focus-visible')) showTip(target, true)
}

function focusClose(): void {
  closeEl.value?.focus()
}

defineExpose({ focusClose, hideTip })

watch(() => props.view, () => {
  hideTip()
  void nextTick(placeThumb)
})

onMounted(() => {
  collapsed.value = document.documentElement.dataset.side === 'collapsed'
  isMac.value = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  placeThumb()
  document.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  clearTimeout(tipTimer)
  document.removeEventListener('keydown', handleShortcut)
})
</script>

<template>
  <aside
    id="dash-side"
    ref="sideEl"
    class="dash-side"
    :aria-label="props.copy.shell.sideLabel"
    :inert="props.narrow && !props.drawerOpen"
    @pointerover="handlePointerOver"
    @pointerout="handlePointerOut"
    @focusin="handleFocusIn"
    @focusout="hideTip"
  >
    <div class="side-head">
      <a class="side-brand" :href="props.homeHref" :aria-label="props.copy.shell.homeLabel"><slot name="brand" /></a>
      <button
        ref="toggleEl"
        class="icon-btn side-toggle"
        type="button"
        aria-controls="dash-side"
        :aria-expanded="collapsed ? 'false' : 'true'"
        :aria-label="collapsed ? props.copy.shell.expandSidebar : props.copy.shell.collapseSidebar"
        :aria-keyshortcuts="isMac ? '[ Meta+B' : '[ Control+B'"
        @click="setCollapsed(!collapsed)"
      >
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-sidebar" /></svg>
      </button>
      <button
        ref="closeEl"
        class="icon-btn side-close"
        type="button"
        :aria-label="props.copy.shell.closeMenu"
        @click="emit('closeDrawer')"
      >
        <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-x" /></svg>
      </button>
    </div>

    <nav
      ref="navEl"
      class="side-nav"
      :class="{ 'has-thumb': thumbPlaced, 'is-ready': thumbAnimated }"
      :style="{ '--thumb-y': `${thumbY}px` }"
      :aria-label="props.copy.shell.navLabel"
      @keydown="handleNavKeydown"
      @scroll="hideTip"
    >
      <span class="side-thumb" aria-hidden="true"></span>
      <a
        v-for="name in DASHBOARD_VIEWS"
        :key="name"
        class="side-link"
        :href="props.viewHref(name)"
        :aria-current="name === props.view ? 'page' : undefined"
        :data-route="name"
        :data-tip="label(name)"
        @click="handleLinkClick($event, name)"
      >
        <svg class="icon" aria-hidden="true"><use :href="`/img/icons.svg#i-${ICONS[name]}`" /></svg>
        <span class="side-label">{{ label(name) }}</span>
      </a>
    </nav>

    <!-- rail：宽屏图标栏状态，用户卡据此决定账户菜单的弹出方向 -->
    <div class="side-foot"><slot :rail="collapsed && !props.narrow" /></div>
  </aside>

  <div class="side-tip" :class="{ 'is-shown': tip.shown }" :style="{ left: `${tip.left}px`, top: `${tip.top}px` }" aria-hidden="true">
    <span>{{ tip.text }}</span>
    <template v-if="tip.shortcut"><kbd>[</kbd><kbd>{{ isMac ? '⌘B' : 'Ctrl+B' }}</kbd></template>
  </div>
</template>
