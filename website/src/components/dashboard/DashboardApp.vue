<script setup lang="ts">
/**
 * Dashboard 工作区根组件（每个 /dashboard 路由装配一份，page 决定业务视图）。
 *
 * 负责会话恢复与未登录 / 网络失败面板；私人数据只在登录态由各业务视图
 * 请求。侧栏与主区布局在本组件，页面跳转走真实链接（无客户端路由）。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { ensureDeviceId } from '../../scripts/homepage/device'
import {
  getSiteSession,
  SITE_SESSION_EXPIRED_EVENT,
  type SiteSession
} from '../../scripts/site/session'
import {
  SITE_AUTH_CLOSE_EVENT,
  SITE_AUTH_SUCCESS_EVENT
} from '../auth/site-auth-controller'
import DashboardSideNav from './DashboardSideNav.vue'
import HistoryView from './HistoryView.vue'
import ApiView from './ApiView.vue'
import SubscriptionsView from './SubscriptionsView.vue'

export interface Props {
  /** 当前工作区页面（与 Astro 路由一一对应）。 */
  page: 'history' | 'api' | 'subscriptions'
  /** Dashboard 文案字典。 */
  copy: DashboardContent
  /** 支付窗口被拦截时的引导文案（AccountContent 公共键）。 */
  popupBlocked: string
  /** 当前语言路径前缀（en-US 为空），用于 Pricing / 首页链接。 */
  localePrefix: string
}

const props = defineProps<Props>()

const session = ref<SiteSession | null>(null)
const deviceId = ref('')
const menuOpen = ref(false)

const homeUrl = `${props.localePrefix}/`

/** 未登录 / 网络失败面板文案按当前页面取各自视图的键。 */
function viewCopy(): DashboardContent['history'] | DashboardContent['api'] | DashboardContent['subscriptions'] {
  if (props.page === 'history') {
    return props.copy.history
  }
  if (props.page === 'api') {
    return props.copy.api
  }
  return props.copy.subscriptions
}

async function restoreSession(): Promise<void> {
  session.value = await getSiteSession()
  if (!deviceId.value) {
    deviceId.value = await ensureDeviceId()
  }
}

function openSignIn(): void {
  window.siteAuthController?.open()
}

/** 匿名取消登录时回当前语言主页（工作区全部页面统一，无公开特例）。 */
function handleAuthClose(): void {
  if (session.value?.status === 'signed-out') {
    window.location.assign(homeUrl)
  }
}

/** 登录成功：直接采用共享会话结果（站级控制器已写入），不再发起第二次 auth/me。 */
async function handleAuthSuccess(): Promise<void> {
  session.value = await getSiteSession()
}

/** 业务请求 401（API 边界广播）：统一回到登录面板，走同一站级登录流程。 */
function handleSessionExpired(): void {
  session.value = { status: 'signed-out' }
}

onMounted(() => {
  void restoreSession()
  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, handleAuthSuccess)
  window.addEventListener(SITE_AUTH_CLOSE_EVENT, handleAuthClose)
  window.addEventListener(SITE_SESSION_EXPIRED_EVENT, handleSessionExpired)
})

onBeforeUnmount(() => {
  window.removeEventListener(SITE_AUTH_SUCCESS_EVENT, handleAuthSuccess)
  window.removeEventListener(SITE_AUTH_CLOSE_EVENT, handleAuthClose)
  window.removeEventListener(SITE_SESSION_EXPIRED_EVENT, handleSessionExpired)
})
</script>

<template>
  <div class="workspace">
    <DashboardSideNav
      :copy="props.copy"
      :page="props.page"
      :session="session"
      :home-url="homeUrl"
      :menu-open="menuOpen"
      :locale-prefix="props.localePrefix"
      @close-menu="menuOpen = false"
    />
    <div
      v-if="menuOpen"
      class="workspace-backdrop"
      @click="menuOpen = false"
    ></div>

    <main class="workspace-main">
      <button
        type="button"
        class="workspace-menu-button"
        :aria-label="props.copy.shell.openMenu"
        @click="menuOpen = true"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <!-- 会话恢复中：不渲染任何业务内容 -->
      <p v-if="session === null" class="workspace-status">{{ props.copy.shell.loading }}</p>

      <div v-else-if="session.status === 'unreachable'" class="workspace-panel">
        <p class="workspace-status">{{ viewCopy().unreachable }}</p>
        <button type="button" class="workspace-primary-button" @click="restoreSession">
          {{ props.copy.shell.retry }}
        </button>
      </div>

      <div
        v-else-if="session.status === 'signed-out'"
        class="workspace-panel"
      >
        <p class="workspace-status">{{ viewCopy().signInPrompt }}</p>
        <button type="button" class="workspace-primary-button" @click="openSignIn">
          {{ viewCopy().signInCta }}
        </button>
      </div>

      <template v-else>
        <HistoryView
          v-if="props.page === 'history' && session.status === 'signed-in'"
          :copy="props.copy"
          :token="session.token"
          :device-id="deviceId"
        />
        <ApiView
          v-else-if="props.page === 'api'"
          :copy="props.copy"
          :locale-prefix="props.localePrefix"
          :signed-in="session.status === 'signed-in'"
          @sign-in="openSignIn"
        />
        <SubscriptionsView
          v-else-if="props.page === 'subscriptions' && session.status === 'signed-in'"
          :copy="props.copy"
          :user="session.user"
          :token="session.token"
          :device-id="deviceId"
          :popup-blocked="props.popupBlocked"
          :locale-prefix="props.localePrefix"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.workspace {
  display: flex;
  align-items: stretch;
  width: min(1200px, calc(100vw - 32px));
  margin: 0 auto;
  padding: var(--space-4) 0 var(--space-8);
  min-height: 72vh;
}

.workspace-main {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
}

.workspace-status {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.6;
}

.workspace-panel {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  margin: var(--space-16) auto;
  max-width: 420px;
  padding: var(--space-8) var(--space-6);
  border: 1px dashed var(--border-strong);
  border-radius: var(--rounded-md);
  background: var(--surface);
  text-align: center;
}

.workspace-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--space-6);
  border-radius: var(--rounded-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 14px;
  font-weight: 600;
  transition: background-color var(--transition-fast);
}

.workspace-primary-button:hover {
  background: var(--primary-hover);
}

.workspace-primary-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

/* 窄屏菜单按钮：桌面隐藏 */
.workspace-menu-button {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  width: 40px;
  height: 40px;
  margin-bottom: var(--space-4);
  border-radius: var(--rounded-full);
  background: var(--surface-2);
}

.workspace-menu-button span {
  display: block;
  width: 18px;
  height: 2px;
  margin: 0 auto;
  border-radius: var(--rounded-sm);
  background: var(--text);
}

.workspace-backdrop {
  display: none;
}

@media (max-width: 960px) {
  .workspace {
    flex-direction: column;
    width: calc(100vw - 32px);
  }

  .workspace-menu-button {
    display: flex;
  }

  .workspace-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 119;
    background: var(--overlay);
  }
}
</style>
