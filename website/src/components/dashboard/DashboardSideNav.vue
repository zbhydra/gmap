<script setup lang="ts">
/**
 * Dashboard 侧栏：品牌回首页链接、三个业务菜单（真实链接 + 当前页选中态）
 * 与底部个人信息菜单。窄屏从左滑入，选中页面后由父组件收起。
 */
import type { DashboardContent } from '../../i18n/schema'
import type { SiteSession } from '../../scripts/site/session'
import DashboardAccountMenu from './DashboardAccountMenu.vue'

export interface Props {
  copy: DashboardContent
  /** 当前工作区页面（选中态来源）。 */
  page: 'history' | 'api' | 'subscriptions'
  /** 父组件恢复的会话；null = 恢复中（账户区暂不渲染操作）。 */
  session: SiteSession | null
  /** 当前语言主页链接（品牌回首页）。 */
  homeUrl: string
  /** 窄屏抽屉展开态。 */
  menuOpen: boolean
  localePrefix: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ (event: 'close-menu'): void }>()

interface MenuItem {
  page: 'history' | 'api' | 'subscriptions'
  label: string
  path: string
}

function menuItems(): MenuItem[] {
  return [
    { page: 'history', label: props.copy.shell.navHistory, path: `${props.localePrefix}/dashboard/` },
    { page: 'api', label: props.copy.shell.navApi, path: `${props.localePrefix}/dashboard/api/` },
    { page: 'subscriptions', label: props.copy.shell.navSubscriptions, path: `${props.localePrefix}/dashboard/subscriptions/` }
  ]
}
</script>

<template>
  <aside class="side-nav" :class="{ 'side-nav-open': props.menuOpen }">
    <div class="side-nav-head">
      <a :href="props.homeUrl" class="side-nav-brand" @click="emit('close-menu')">
        <span class="brand-mark">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path class="brand-mark-pin" d="M16 6.2c-4.42 0-8 3.36-8 7.66 0 5.5 6.64 11.04 7.4 11.66.35.28.85.28 1.2 0 .76-.62 7.4-6.16 7.4-11.66 0-4.3-3.58-7.66-8-7.66Z" />
            <path class="brand-mark-arrow" d="M16 10.1v6.2m-2.9-2.9 2.9 2.9 2.9-2.9" />
          </svg>
        </span>
        <span>MapsGrab</span>
      </a>
      <button
        type="button"
        class="side-nav-close"
        :aria-label="props.copy.shell.closeMenu"
        @click="emit('close-menu')"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <nav class="side-nav-menu" :aria-label="props.copy.shell.openMenu">
      <a
        v-for="item in menuItems()"
        :key="item.page"
        :href="item.path"
        class="side-nav-item"
        :class="{ 'side-nav-item-active': item.page === props.page }"
        :aria-current="item.page === props.page ? 'page' : undefined"
        @click="emit('close-menu')"
      >
        {{ item.label }}
      </a>
    </nav>

    <div class="side-nav-account">
      <DashboardAccountMenu
        v-if="props.session && props.session.status === 'signed-in'"
        :copy="props.copy"
        :user="props.session.user"
        :token="props.session.token"
        :home-url="props.homeUrl"
      />
    </div>
  </aside>
</template>

<style scoped>
.side-nav {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
  width: 240px;
  flex: 0 0 240px;
  padding: var(--s-4);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}

.side-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.side-nav-brand {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.side-nav-brand:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.side-nav-close {
  display: none;
  width: 32px;
  height: 32px;
  border-radius: var(--r-full);
  background: var(--surface-2);
  color: var(--text);
  font-size: var(--fs-h4);
  line-height: 1;
}

.side-nav-menu {
  display: grid;
  gap: var(--s-1);
}

.side-nav-item {
  padding: var(--s-3) 14px;
  border-radius: var(--r-sm);
  color: var(--text-2);
  font-size: 14px;
  font-weight: 600;
}

.side-nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.side-nav-item-active {
  background: var(--primary-soft);
  color: var(--primary-text);
}

.side-nav-item:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.side-nav-account {
  margin-top: auto;
}

@media (max-width: 960px) {
  .side-nav {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 120;
    width: min(300px, 84vw);
    flex: none;
    border-radius: 0 var(--r-lg) var(--r-lg) 0;
    transform: translateX(-100%);
    visibility: hidden;
    transition: transform var(--dur-2) var(--ease-out), visibility 0s var(--dur-2);
    overflow-y: auto;
  }

  .side-nav-open {
    transform: translateX(0);
    visibility: visible;
    transition: transform var(--dur-2) var(--ease-out), visibility 0s;
  }

  .side-nav-close {
    display: grid;
    place-items: center;
  }

  .side-nav-close:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 3px;
  }
}
</style>
