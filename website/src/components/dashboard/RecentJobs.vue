<script setup lang="ts">
/**
 * Online 的最近任务：同一行组件的紧凑变体，只取最新 5 条，不分页、不筛选、不展开。
 * 任务名与 View all 是去 History 的真实链接；首次加载失败整块换成失败面板，刷新或轮询失败保留旧数据并提示。
 */
import type { DashboardContent } from '../../i18n/schema'
import { isPlainClick } from '../../scripts/dashboard/route'
import type { DashboardWorkspace } from '../../scripts/dashboard/workspace'
import JobRow from './JobRow.vue'

const props = defineProps<{
  copy: DashboardContent
  workspace: DashboardWorkspace
  /** History 地址：q 为空是 View all，否则以完整任务号搜索。 */
  historyHref: (q: string) => string
}>()

const emit = defineEmits<{ openHistory: [q: string] }>()

function openAll(event: MouseEvent): void {
  if (!isPlainClick(event)) return
  event.preventDefault()
  emit('openHistory', '')
}
</script>

<template>
  <section aria-labelledby="recent-title">
    <div class="d-section-head">
      <h2 id="recent-title" class="d-section-title">{{ props.copy.history.recentTitle }}</h2>
      <a v-if="props.workspace.state.recent.jobs.length" class="d-link" :href="props.historyHref('')" @click="openAll">
        {{ props.copy.history.viewAll }}<svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-arrow-right" /></svg>
      </a>
    </div>

    <div class="jobs jobs--compact">
      <div v-if="props.workspace.state.recent.loadError && !props.workspace.state.recent.jobs.length" class="fail">
        <p class="fail-text">
          <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>{{ props.copy.history.loadFailed }}
        </p>
        <button
          class="btn btn-secondary btn-xs"
          :class="{ 'is-busy': props.workspace.state.recent.loading }"
          type="button"
          :aria-busy="props.workspace.state.recent.loading ? 'true' : undefined"
          @click="props.workspace.refreshOnline()"
        >
          <span v-if="props.workspace.state.recent.loading" class="spinner spinner--sm" aria-hidden="true"></span>
          <svg v-else class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>
          {{ props.copy.history.retry }}
        </button>
      </div>

      <div v-else-if="!props.workspace.state.recent.jobs.length" class="empty empty--compact">
        <span class="icon-tile" aria-hidden="true"><svg class="icon"><use href="/img/icons.svg#i-table" /></svg></span>
        <p class="empty-title">{{ props.copy.history.emptyTitle }}</p>
        <p class="empty-hint">{{ props.copy.history.recentEmptyHint }}</p>
      </div>

      <template v-else>
        <div v-if="props.workspace.state.recent.refreshError" class="jobs-banner">
          <div class="callout callout--warn" role="status">
            <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-alert" /></svg>
            <div class="callout-body">
              <span>{{ props.copy.history.refreshFailed }}</span>
              <button class="btn btn-secondary btn-xs" type="button" @click="props.workspace.refreshOnline()">
                <svg class="icon" aria-hidden="true"><use href="/img/icons.svg#i-refresh" /></svg>{{ props.copy.history.refresh }}
              </button>
            </div>
          </div>
        </div>
        <div class="jobs-head" aria-hidden="true">
          <span class="d-label">{{ props.copy.history.columns.taskNo }} · {{ props.copy.history.columns.createdAt }}</span>
          <span class="d-label">{{ props.copy.history.columns.samples }}</span>
          <span class="d-label is-num">{{ props.copy.history.columns.records }}</span>
          <span class="d-label">{{ props.copy.history.columns.status }}</span>
          <span></span>
        </div>
        <ul
          class="jobs-list"
          :aria-label="props.copy.history.recentTitle"
          :aria-busy="props.workspace.state.recent.loading && props.workspace.state.recent.manual ? 'true' : 'false'"
        >
          <JobRow
            v-for="job in props.workspace.state.recent.jobs"
            :key="job.job_no"
            compact
            :copy="props.copy"
            :job="job"
            :href="props.historyHref(job.job_no)"
            :downloading="props.workspace.state.downloading.get(job.job_no)"
            :download-message="props.workspace.state.downloadMessages.get(job.job_no)"
            :fresh="job.job_no === props.workspace.state.recent.highlight"
            @open="emit('openHistory', job.job_no)"
            @download="format => props.workspace.download(job.job_no, format)"
          />
        </ul>
      </template>
    </div>
  </section>
</template>
