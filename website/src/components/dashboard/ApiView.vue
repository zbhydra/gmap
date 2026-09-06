<script setup lang="ts">
/**
 * API 管理视图：本轮只展示明确的未开放状态，不提供创建 / 复制 / 重置 Key
 * 的按钮，也不请求管理员 API Key 接口；客户 API Key 随 014 API 产品另行
 * 规划。API 产品营销页保留产品介绍，获取 Key 类 CTA 统一进入本页。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'

export interface Props {
  copy: DashboardContent
  localePrefix: string
  /** 匿名时展示登录入口（未开放说明本身是公开信息）。 */
  signedIn: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{ (event: 'sign-in'): void }>()

const docsUrl = computed(() => `${props.localePrefix}/google-maps-scraper-api/`)
</script>

<template>
  <section class="api" aria-labelledby="dashboard-api-title">
    <header class="api-head">
      <h1 id="dashboard-api-title">{{ props.copy.api.title }}</h1>
      <p class="api-description">{{ props.copy.api.description }}</p>
    </header>

    <div class="api-status" data-api-badge>
      <span class="api-status-dot" aria-hidden="true"></span>
      <span class="api-status-text">{{ props.copy.api.badge }}</span>
    </div>

    <a class="api-docs-link" :href="docsUrl">{{ props.copy.api.docsLink }}</a>

    <div v-if="!props.signedIn" class="api-signin">
      <p class="api-description">{{ props.copy.api.signInPrompt }}</p>
      <button type="button" class="api-primary" @click="emit('sign-in')">
        {{ props.copy.api.signInCta }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.api {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
  max-width: 560px;
}

.api-head h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 32px;
}

.api-description {
  margin-top: var(--space-1);
  color: var(--text-2);
  font-size: 13.5px;
  line-height: 1.6;
}

.api-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--rounded-full);
  background: var(--surface);
}

.api-status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--rounded-full);
  background: var(--warn);
}

.api-status-text {
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.api-docs-link {
  color: var(--link);
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.api-docs-link:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.api-signin {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-6);
  border: 1px dashed var(--border-strong);
  border-radius: var(--rounded-md);
  background: var(--surface);
}

.api-primary {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-6);
  border-radius: var(--rounded-full);
  background: var(--primary);
  color: var(--primary-fg);
  font-size: 14px;
  font-weight: 600;
}

.api-primary:hover {
  background: var(--primary-hover);
}

.api-primary:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}
</style>
