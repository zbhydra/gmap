<template>
  <Teleport to="body" :disabled="!useTeleport">
    <Transition name="modal-fade">
      <div v-if="show" class="tg-dl-upgrade-modal-overlay" @click.self="handleClose">
        <div
          class="tg-dl-upgrade-modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tg-dl-upgrade-modal-title"
          aria-describedby="tg-dl-upgrade-modal-message"
          @click.stop
        >
          <button
            type="button"
            class="tg-dl-upgrade-modal-close-btn"
            :aria-label="t(I18N_KEYS.APP_ERROR.DISMISS)"
            @click="handleClose"
          >
            <Icon :name="IconName.X_MARK" :size="IconSize.SM" />
          </button>

          <div class="tg-dl-upgrade-modal-content">
            <div class="tg-dl-upgrade-modal-icon" aria-hidden="true">
              <Icon :name="IconName.CROWN" :size="IconSize.XL" />
            </div>

            <h2 id="tg-dl-upgrade-modal-title" class="tg-dl-upgrade-modal-title">
              {{ t(I18N_KEYS.QUOTA.UPGRADE_TITLE) }}
            </h2>
            <p id="tg-dl-upgrade-modal-message" class="tg-dl-upgrade-modal-message">
              {{ t(I18N_KEYS.QUOTA.UPGRADE_MESSAGE) }}
            </p>

            <div v-if="resetAt > 0" class="tg-dl-upgrade-modal-reset" aria-live="polite">
              <strong class="tg-dl-upgrade-modal-reset-countdown">{{ resetCountdown }}</strong>
              <span class="tg-dl-upgrade-modal-reset-time">{{ resetTime }}</span>
            </div>

            <button type="button" class="tg-dl-upgrade-modal-btn" @click="handleUpgrade">
              {{ t(I18N_KEYS.QUOTA.UPGRADE_BUTTON) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon, IconName, IconSize } from '@/core/components/icons'
import { logger } from '@/core/utils/logger'
import { I18N_KEYS } from '@/core/constants/i18n'
import { openPricingPage } from '@/core/utils/navigation'
import { ChromeEventEmitter } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'

/** 倒计时以分钟展示，30 秒更新可及时跨过舍入边界，又不会频繁重绘宿主页面。 */
const COUNTDOWN_REFRESH_INTERVAL_MS = 30_000

/** 升级弹窗的外部状态。 */
interface Props {
  /** 是否显示弹窗。 */
  show?: boolean
  /** 每日下载额度的下一次刷新时间，使用毫秒时间戳。 */
  resetAt?: number
  /** Popup 使用原地渲染，普通页面入口使用 Teleport。 */
  useTeleport?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  resetAt: 0,
  useTeleport: true
})

/** 只向父级同步弹窗显隐，不在组件内部保存第二份显隐状态。 */
const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const { locale, t } = useI18n()
const eventEmitter = new ChromeEventEmitter<ExtensionEvents>()
/** 计算倒计时的当前时间，由轻量定时器推进。 */
const currentTime = ref(Date.now())
/** 当前倒计时定时器；弹窗隐藏或卸载时立即释放。 */
let countdownTimer: ReturnType<typeof setInterval> | null = null

/** 本地化的相对刷新时间主文案。 */
const resetCountdown = computed(() => {
  const remainingMinutes = Math.max(0, Math.ceil((props.resetAt - currentTime.value) / 60_000))
  if (remainingMinutes === 0) {
    return t(I18N_KEYS.QUOTA.RESET_READY)
  }

  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60
  if (hours > 0 && minutes > 0) {
    return t(I18N_KEYS.QUOTA.RESET_IN_HOURS_MINUTES, { hours, minutes })
  }
  if (hours > 0) {
    return t(I18N_KEYS.QUOTA.RESET_IN_HOURS, { hours })
  }
  return t(I18N_KEYS.QUOTA.RESET_IN_MINUTES, { minutes })
})

/** 本地化的绝对刷新时间次文案，时区名由浏览器按用户系统设置生成。 */
const resetTime = computed(() => {
  const formattedTime = new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(new Date(props.resetAt))
  return t(I18N_KEYS.QUOTA.RESET_AT, { time: formattedTime })
})

// 埋点以共享组件的可见状态为准，避免各触发入口分别推断弹窗是否真正打开。
watch(
  () => props.show,
  show => {
    if (show) {
      eventEmitter.emit('upgradeModalOpened', undefined)
    }
  },
  { immediate: true }
)

// 重开弹窗或收到新的服务端刷新时间时，从真实当前时间重新开始倒计时。
watch(
  [() => props.show, () => props.resetAt],
  ([show, resetAt]) => {
    stopCountdown()
    currentTime.value = Date.now()
    if (show && resetAt > currentTime.value) {
      countdownTimer = setInterval(() => {
        currentTime.value = Date.now()
        if (currentTime.value >= props.resetAt) {
          stopCountdown()
        }
      }, COUNTDOWN_REFRESH_INTERVAL_MS)
    }
  },
  { immediate: true }
)

onBeforeUnmount(stopCountdown)

/** 停止倒计时更新并清空句柄。 */
function stopCountdown(): void {
  if (countdownTimer === null) return
  clearInterval(countdownTimer)
  countdownTimer = null
}

/** 关闭弹窗。 */
function handleClose(): void {
  emit('update:show', false)
}

/** 打开官网 Pricing 页，并在成功发起导航后关闭当前弹窗。 */
async function handleUpgrade(): Promise<void> {
  logger.info('[UpgradeModal] Open pricing page')
  await openPricingPage('upgrade_modal')
  handleClose()
}
</script>

<style src="./UpgradeModal.css"></style>
