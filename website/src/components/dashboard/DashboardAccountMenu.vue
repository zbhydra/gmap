<script setup lang="ts">
/**
 * 侧栏底部个人信息：头像（缺省首字母）、姓名与邮箱；点击展开菜单，
 * 退出后清除本站登录态并回当前语言主页。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { clearStoredAccessToken, logoutCurrentUser, type HomepageUserInfo } from '../../scripts/homepage/auth'
import { ensureDeviceId } from '../../scripts/homepage/device'
import { invalidateSiteSession } from '../../scripts/site/session'

export interface Props {
  copy: DashboardContent
  user: HomepageUserInfo
  token: string
  /** 当前语言主页（退出后跳转）。 */
  homeUrl: string
}

const props = defineProps<Props>()

const menuOpen = ref(false)
const loggingOut = ref(false)
const menuRoot = ref<HTMLElement | null>(null)

/** 头像 URL 缺省时回退姓名 / 邮箱首字母。 */
const avatarUrl = props.user.avatar_url?.trim() ?? ''
const displayName = props.user.full_name?.trim() || props.user.email

function initial(): string {
  const first = displayName.trim().charAt(0)
  return first ? first.toUpperCase() : 'U'
}

function toggleMenu(): void {
  menuOpen.value = !menuOpen.value
}

function handleOutsideClick(event: Event): void {
  if (menuOpen.value && menuRoot.value && !menuRoot.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

async function logout(): Promise<void> {
  if (loggingOut.value) {
    return
  }
  loggingOut.value = true
  try {
    await logoutCurrentUser({ deviceId: await ensureDeviceId(), token: props.token })
  } catch (error) {
    // 后端仅撤销当前 token；本地登录态照常清除，用户重试一次可自行修正。
    console.error(new Error('[dashboard-account] logout request failed.', { cause: error }))
  } finally {
    clearStoredAccessToken()
    invalidateSiteSession()
    window.location.assign(props.homeUrl)
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div ref="menuRoot" class="account">
    <button
      type="button"
      class="account-button"
      data-dashboard-account-button
      :aria-label="props.copy.account.menuButtonLabel"
      :aria-expanded="menuOpen ? 'true' : 'false'"
      @click="toggleMenu"
    >
      <span class="account-avatar">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" />
        <span v-else aria-hidden="true">{{ initial() }}</span>
      </span>
      <span class="account-identity">
        <span class="account-name">{{ displayName }}</span>
        <span class="account-email">{{ props.user.email }}</span>
      </span>
    </button>

    <div v-if="menuOpen" class="account-menu" role="menu" :aria-label="props.copy.account.menuLabel">
      <button type="button" role="menuitem" class="account-logout" data-dashboard-logout :disabled="loggingOut" @click="logout">
        {{ props.copy.account.logout }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.account {
  position: relative;
}

.account-button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  min-width: 0;
  padding: var(--space-2);
  border-radius: var(--rounded-sm);
  text-align: left;
}

.account-button:hover {
  background: var(--surface-2);
}

.account-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  overflow: hidden;
  border-radius: var(--rounded-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 16px;
  font-weight: 600;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-identity {
  display: grid;
  min-width: 0;
}

.account-name {
  overflow: hidden;
  color: var(--text);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-email {
  overflow: hidden;
  color: var(--text-2);
  font-size: 12.5px;
  line-height: 18px;
  overflow-wrap: anywhere;
}

.account-menu {
  position: absolute;
  bottom: calc(100% + var(--space-1));
  left: 0;
  z-index: 30;
  width: min(240px, calc(100vw - 64px));
  padding: var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--rounded-md);
  background: var(--surface);
  box-shadow: var(--shadow-pop);
}

.account-logout {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border-radius: var(--rounded-sm);
  color: var(--bad);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.account-logout:hover {
  background: var(--bad-soft);
}

.account-logout:disabled {
  cursor: wait;
  opacity: 0.64;
}

.account-logout:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
</style>
