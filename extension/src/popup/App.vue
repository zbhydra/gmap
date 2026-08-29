<template>
  <div class="app-container">
    <!-- 顶部标题栏 -->
    <AppHeader />

    <!-- 底部联系入口 -->
    <AppFooter />

    <Toast :show="toastState.show" :message="toastState.message" :type="toastState.type" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/core/stores/authStore'
import { markApi, MARK_TYPE, type MarkType } from '@/core/api/mark'
import { logger } from '@/core/utils/logger'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import Toast from '@/core/components/Toast.vue'
import { useToast } from '@/core/composables/useToast'

// Stores
const authStore = useAuthStore()
const { toastState } = useToast()

// 记录打点（异步，不阻塞业务）
function recordMark(markType: MarkType): void {
  markApi.record(markType).catch(error => {
    logger.error('[Popup] SLS 打点失败:', error)
  })
}

// 生命周期
onMounted(async () => {
  // 第一时间记录弹窗打开打点（不等待，不阻塞）
  recordMark(MARK_TYPE.POPUP_OPEN)

  await authStore.initialize()
})
</script>

<style scoped>
.app-container {
  width: 100%;
  min-height: var(--popup-min-height);
  display: flex;
  flex-direction: column;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
