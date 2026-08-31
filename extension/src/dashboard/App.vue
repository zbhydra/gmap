<template>
  <div class="dashboard-page">
    <header class="dashboard-header">
      <div class="dashboard-header-inner">
        <h1 class="dashboard-title">{{ t(I18N_KEYS.DASHBOARD.TITLE) }}</h1>
        <span class="dashboard-brand">{{ t(I18N_KEYS.MAPS_PANEL.TITLE) }}</span>
      </div>
    </header>

    <main class="dashboard-main">
      <!-- 新建任务 -->
      <section class="dashboard-card">
        <h2 class="dashboard-section-title">{{ t(I18N_KEYS.DASHBOARD.SECTION_CREATE) }}</h2>

        <div class="dashboard-field">
          <div
            class="dashboard-segmented"
            role="radiogroup"
            :aria-label="t(I18N_KEYS.DASHBOARD.SECTION_CREATE)"
          >
            <button
              type="button"
              class="dashboard-segment"
              role="radio"
              :aria-checked="taskType === 'keywords'"
              :class="{ 'dashboard-segment-active': taskType === 'keywords' }"
              @click="taskType = 'keywords'"
            >
              {{ t(I18N_KEYS.DASHBOARD.TYPE_KEYWORDS) }}
            </button>
            <button
              type="button"
              class="dashboard-segment"
              role="radio"
              :aria-checked="taskType === 'review-urls'"
              :class="{ 'dashboard-segment-active': taskType === 'review-urls' }"
              @click="taskType = 'review-urls'"
            >
              {{ t(I18N_KEYS.DASHBOARD.TYPE_REVIEW_URLS) }}
            </button>
          </div>
        </div>

        <div class="dashboard-field">
          <label class="dashboard-label" for="dashboard-task-name">
            {{ t(I18N_KEYS.DASHBOARD.TASK_NAME) }}
          </label>
          <input
            id="dashboard-task-name"
            v-model="taskName"
            class="dashboard-input"
            type="text"
            :placeholder="t(I18N_KEYS.DASHBOARD.TASK_NAME_PLACEHOLDER)"
          />
        </div>

        <div class="dashboard-field">
          <label class="dashboard-label" for="dashboard-items">
            {{ itemsLabel }}
          </label>
          <textarea
            id="dashboard-items"
            v-model="itemsText"
            class="dashboard-textarea"
            rows="8"
            :placeholder="itemsPlaceholder"
          ></textarea>
          <p class="dashboard-hint">
            {{ t(I18N_KEYS.DASHBOARD.ITEM_COUNT, { count: itemCount, max: MAX_ITEMS }) }}
          </p>
        </div>

        <div v-if="taskType === 'review-urls'" class="dashboard-field">
          <label class="dashboard-label" for="dashboard-reviews-limit">
            {{ t(I18N_KEYS.DASHBOARD.REVIEWS_PER_STORE_LIMIT) }}
          </label>
          <p class="dashboard-hint">{{ t(I18N_KEYS.DASHBOARD.REVIEWS_PER_STORE_LIMIT_HINT) }}</p>
          <input
            id="dashboard-reviews-limit"
            class="dashboard-number-input"
            type="number"
            min="1"
            :value="reviewsLimit"
            @change="onReviewsLimitChange"
          />
        </div>

        <p v-if="formError !== null" class="dashboard-alert dashboard-alert-danger" role="alert">
          {{ formError }}
        </p>
        <p v-else-if="copyNotice !== null" class="dashboard-alert dashboard-alert-ok" role="status">
          {{ copyNotice }}
        </p>

        <div class="dashboard-actions">
          <button
            type="button"
            class="dashboard-button-primary"
            :disabled="submitting || itemCount === 0"
            @click="createAndStart"
          >
            {{ t(I18N_KEYS.DASHBOARD.START_EXTRACTING) }}
          </button>
        </div>
      </section>

      <!-- 任务列表 -->
      <section class="dashboard-card">
        <h2 class="dashboard-section-title">{{ t(I18N_KEYS.DASHBOARD.SECTION_TASKS) }}</h2>

        <p v-if="tasks.length === 0" class="dashboard-empty">
          {{ t(I18N_KEYS.DASHBOARD.EMPTY_HINT) }}
        </p>

        <div v-else class="dashboard-table-wrap">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th class="dashboard-col-no">{{ t(I18N_KEYS.DASHBOARD.COL_NO) }}</th>
                <th>{{ t(I18N_KEYS.DASHBOARD.COL_TASK_NAME) }}</th>
                <th>{{ t(I18N_KEYS.DASHBOARD.COL_STATUS) }}</th>
                <th class="dashboard-col-actions">{{ t(I18N_KEYS.DASHBOARD.COL_ACTIONS) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in tasks" :key="task.id">
                <td class="dashboard-col-no dashboard-numeric">{{ index + 1 }}</td>
                <td>
                  <span class="dashboard-task-name">{{ task.name }}</span>
                </td>
                <td>
                  <div class="dashboard-status-cell">
                    <span class="dashboard-status-chip" :class="statusChipClass(task.status)">
                      <span class="dashboard-status-dot" aria-hidden="true"></span>
                      {{ statusText(task.status) }}
                    </span>
                    <span class="dashboard-progress dashboard-numeric">
                      {{
                        t(I18N_KEYS.DASHBOARD.PROGRESS_OF, {
                          done: doneCount(task),
                          total: task.items.length
                        })
                      }}
                    </span>
                    <span class="dashboard-counts dashboard-numeric">
                      {{
                        [
                          t(I18N_KEYS.DASHBOARD.COUNT_TRY, { n: tryCount(task) }),
                          t(I18N_KEYS.DASHBOARD.COUNT_COMPLETE, { n: completeCount(task) }),
                          t(I18N_KEYS.DASHBOARD.COUNT_STUCK, { n: stuckCount(task) }),
                          t(I18N_KEYS.DASHBOARD.COUNT_SKIP, { n: invalidCount(task) })
                        ].join(' · ')
                      }}
                    </span>
                  </div>
                </td>
                <td class="dashboard-col-actions">
                  <div class="dashboard-row-actions">
                    <button
                      type="button"
                      class="dashboard-button-small"
                      :disabled="task.status === 'running'"
                      @click="startTask(task.id)"
                    >
                      {{ t(I18N_KEYS.DASHBOARD.ACTION_START) }}
                    </button>
                    <button
                      type="button"
                      class="dashboard-button-small"
                      :disabled="task.status !== 'running'"
                      @click="stopTask(task.id)"
                    >
                      {{ t(I18N_KEYS.DASHBOARD.ACTION_STOP) }}
                    </button>
                    <button
                      type="button"
                      class="dashboard-button-small"
                      :disabled="task.items.length === 0"
                      @click="copyItems(task, 'all')"
                    >
                      {{ t(I18N_KEYS.DASHBOARD.ACTION_COPY_ALL) }}
                    </button>
                    <button
                      type="button"
                      class="dashboard-button-small"
                      :disabled="completeCount(task) === 0"
                      @click="copyItems(task, 'completed')"
                    >
                      {{ t(I18N_KEYS.DASHBOARD.ACTION_COPY_COMPLETED) }}
                    </button>
                    <button
                      type="button"
                      class="dashboard-button-small dashboard-button-danger"
                      @click="deleteTask(task.id)"
                    >
                      {{ t(I18N_KEYS.DASHBOARD.ACTION_DELETE) }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import {
  BULK_LIMITS,
  type BulkErrorCode,
  type BulkState,
  type BulkTask,
  type BulkTaskStatus,
  type BulkTaskType
} from '@/background/batch/types'

const { t } = useI18n()

/** 任务条目上限（BULK_LIMITS.maxItemsPerTask 的模板别名）。 */
const MAX_ITEMS = BULK_LIMITS.maxItemsPerTask

/**
 * background RPC 客户端：dashboard 是扩展页，serve 侧按 sender 推导为
 * popup 通道（inferChromeCaller），因此复用 popup 生成客户端。
 */
const background = new BackgroundChannel()

/** 批量状态变更订阅（收到通知重读快照；后台每步落盘后广播）。 */
const stateSubscriber = new ChromeEventSubscriber<ExtensionEvents>()

/** 批量任务状态快照（渲染唯一来源；写操作经 RPC 返回值即时校准）。 */
const state = ref<BulkState>({ version: 1, tasks: [] })

/** 创建表单：任务类型 / 名称 / 条目文本 / 每店评论上限。 */
const taskType = ref<BulkTaskType>('keywords')
const taskName = ref('')
const itemsText = ref('')
const reviewsLimit = ref<number>(BULK_LIMITS.defaultReviewsPerStoreLimit)

/** 提交互斥锁与表单错误（danger 提示条）。 */
const submitting = ref(false)
const formError = ref<string | null>(null)

/** 复制成功提示（ok 提示条，短暂展示）。 */
const copyNotice = ref<string | null>(null)
let copyNoticeTimer: number | null = null

const tasks = computed<readonly BulkTask[]>(() => state.value.tasks)

/** 输入条目数（非空行）。 */
const itemCount = computed(
  () => itemsText.value.split('\n').filter(line => line.trim().length > 0).length
)

const itemsLabel = computed(() =>
  taskType.value === 'keywords'
    ? t(I18N_KEYS.DASHBOARD.TYPE_KEYWORDS)
    : t(I18N_KEYS.DASHBOARD.TYPE_REVIEW_URLS)
)

const itemsPlaceholder = computed(() =>
  taskType.value === 'keywords'
    ? t(I18N_KEYS.DASHBOARD.ITEMS_PLACEHOLDER_KEYWORDS)
    : t(I18N_KEYS.DASHBOARD.ITEMS_PLACEHOLDER_REVIEWS)
)

/** 读最新状态快照（挂载 / 后台广播 / 页面重新可见）。 */
async function refreshState(): Promise<void> {
  try {
    state.value = await background.getBulkState()
  } catch (error) {
    logger.error('[Dashboard] 读取批量状态失败:', error)
  }
}

/** 业务拒绝码 → danger 文案。 */
function errorCodeToMessage(code: BulkErrorCode): string {
  const mapping: Record<BulkErrorCode, string> = {
    mutex: I18N_KEYS.DASHBOARD.ERROR_MUTEX,
    'limit-tasks': I18N_KEYS.DASHBOARD.ERROR_LIMIT_TASKS,
    'limit-items': I18N_KEYS.DASHBOARD.ERROR_LIMIT_ITEMS,
    'empty-input': I18N_KEYS.DASHBOARD.ERROR_EMPTY_INPUT,
    'invalid-param': I18N_KEYS.DASHBOARD.ERROR_INVALID_PARAM,
    'not-found': I18N_KEYS.DASHBOARD.ERROR_NOT_FOUND,
    'quota-exceeded': I18N_KEYS.DASHBOARD.ERROR_QUOTA_EXCEEDED
  }
  return t(mapping[code] ?? I18N_KEYS.DASHBOARD.ERROR_INVALID_PARAM)
}

/** 创建任务并立即启动（竞品 Start Extracting 语义）。 */
async function createAndStart(): Promise<void> {
  formError.value = null

  const values = itemsText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  if (values.length === 0) {
    formError.value = t(I18N_KEYS.DASHBOARD.ERROR_EMPTY_INPUT)
    return
  }
  if (values.length > BULK_LIMITS.maxItemsPerTask) {
    formError.value = t(I18N_KEYS.DASHBOARD.ERROR_LIMIT_ITEMS)
    return
  }
  const reviewsPerStoreLimit = taskType.value === 'review-urls' ? reviewsLimit.value : null
  if (
    taskType.value === 'review-urls' &&
    (reviewsPerStoreLimit === null || reviewsPerStoreLimit < 1)
  ) {
    formError.value = t(I18N_KEYS.DASHBOARD.ERROR_INVALID_PARAM)
    return
  }

  submitting.value = true
  try {
    // transport 失败（RPC 错误）直接抛出；业务拒绝经 ok/code 承载
    const created = await background.createBulkTask({
      // 空名由 dashboard 填充默认名（i18n 文案不进 reducer）：Task N 按创建序号
      name:
        taskName.value.trim().length > 0
          ? taskName.value.trim()
          : t(I18N_KEYS.DASHBOARD.DEFAULT_TASK_NAME, { index: state.value.tasks.length + 1 }),
      type: taskType.value,
      values,
      reviewsPerStoreLimit
    })
    state.value = created.state
    if (!created.ok) {
      formError.value = created.code === null ? null : errorCodeToMessage(created.code)
      return
    }

    const newTask = created.state.tasks[created.state.tasks.length - 1]
    if (newTask) {
      const started = await background.startBulkTask({ taskId: newTask.id })
      state.value = started.state
      formError.value =
        started.ok || started.code === null ? null : errorCodeToMessage(started.code)
    }

    // 创建成功后清空输入（任务名与文本域；失败时保留便于修正）
    if (formError.value === null) {
      taskName.value = ''
      itemsText.value = ''
    }
  } catch (error) {
    logger.error('[Dashboard] 创建任务失败:', error)
    formError.value = t(I18N_KEYS.DASHBOARD.ERROR_INVALID_PARAM)
  } finally {
    submitting.value = false
  }
}

/** 行操作：启动（互斥冲突经 danger 提示条展示）。 */
async function startTask(taskId: string): Promise<void> {
  formError.value = null
  try {
    const started = await background.startBulkTask({ taskId })
    state.value = started.state
    formError.value = started.ok || started.code === null ? null : errorCodeToMessage(started.code)
  } catch (error) {
    logger.error('[Dashboard] 启动任务失败:', error)
  }
}

/** 行操作：停止。 */
async function stopTask(taskId: string): Promise<void> {
  formError.value = null
  try {
    state.value = await background.stopBulkTask({ taskId }).then(result => result.state)
  } catch (error) {
    logger.error('[Dashboard] 停止任务失败:', error)
  }
}

/** 行操作：删除。 */
async function deleteTask(taskId: string): Promise<void> {
  formError.value = null
  try {
    state.value = await background.deleteBulkTask({ taskId }).then(result => result.state)
  } catch (error) {
    logger.error('[Dashboard] 删除任务失败:', error)
  }
}

/** 行操作：复制条目（all = 全部载荷；completed = 已完成条目载荷）。 */
async function copyItems(task: BulkTask, scope: 'all' | 'completed'): Promise<void> {
  const values = task.items
    .filter(item => (scope === 'all' ? true : item.status === 'complete'))
    .map(item => item.value)
  try {
    await navigator.clipboard.writeText(values.join('\n'))
    formError.value = null
    showCopyNotice()
  } catch (error) {
    logger.error('[Dashboard] 复制条目失败:', error)
    formError.value = t(I18N_KEYS.DASHBOARD.COPY_FAILED)
  }
}

/** 复制成功提示（短暂展示后自动消失，失败优先展示错误）。 */
function showCopyNotice(): void {
  copyNotice.value = t(I18N_KEYS.DASHBOARD.COPIED)
  if (copyNoticeTimer !== null) {
    window.clearTimeout(copyNoticeTimer)
  }
  copyNoticeTimer = window.setTimeout(() => {
    copyNotice.value = null
  }, 2000)
}

/** 每店评论上限输入：取整并夹到 ≥1（非法回默认 300）。 */
function onReviewsLimitChange(event: Event): void {
  const parsed = Number.parseInt((event.target as HTMLInputElement).value, 10)
  const next = Number.isNaN(parsed) || parsed < 1 ? BULK_LIMITS.defaultReviewsPerStoreLimit : parsed
  reviewsLimit.value = next
  ;(event.target as HTMLInputElement).value = String(next)
}

/** 计数：完成 / 卡死跳过 / 无效跳过 / 尝试次数合计。 */
function completeCount(task: BulkTask): number {
  return task.items.filter(item => item.status === 'complete').length
}

function stuckCount(task: BulkTask): number {
  return task.items.filter(item => item.skipReason === 'stuck').length
}

function invalidCount(task: BulkTask): number {
  return task.items.filter(item => item.skipReason === 'invalid-url').length
}

function tryCount(task: BulkTask): number {
  return task.items.reduce((sum, item) => sum + item.tries, 0)
}

function doneCount(task: BulkTask): number {
  return task.items.filter(item => item.status === 'complete' || item.status === 'skipped').length
}

/** 状态 chip 文案与配色类（颜色之外有文字通道，design.md 状态规则）。 */
function statusText(status: BulkTaskStatus): string {
  const mapping: Record<BulkTaskStatus, string> = {
    idle: I18N_KEYS.DASHBOARD.STATUS_IDLE,
    running: I18N_KEYS.DASHBOARD.STATUS_RUNNING,
    paused: I18N_KEYS.DASHBOARD.STATUS_PAUSED,
    completed: I18N_KEYS.DASHBOARD.STATUS_COMPLETED
  }
  return t(mapping[status])
}

function statusChipClass(status: BulkTaskStatus): string {
  return `dashboard-status-${status}`
}

/** 页面重新可见时对齐一次快照（广播丢失的兜底）。 */
function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    void refreshState()
  }
}

onMounted(() => {
  void refreshState()
  stateSubscriber.on('mapsBulkStateChanged', () => {
    void refreshState()
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  stateSubscriber.destroy()
  if (copyNoticeTimer !== null) {
    window.clearTimeout(copyNoticeTimer)
    copyNoticeTimer = null
  }
})
</script>

<style scoped>
/* 语义 token 由 src/styles/tokens.css 统一提供（--gme-*），此处只做消费。 */
.dashboard-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--gme-bg);
  background-image: var(--gme-bg-image);
  color: var(--gme-text);
  font-family: var(--gme-font-body);
}

* {
  box-sizing: border-box;
}

.dashboard-header {
  padding: 24px 28px 16px;
}

.dashboard-header-inner {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: -0.015em;
  color: var(--gme-text);
}

.dashboard-brand {
  font-family: var(--gme-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gme-text-3);
}

.dashboard-main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 28px 64px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-card {
  margin: 0;
  padding: 24px;
  background: var(--gme-surface);
  border: 1px solid var(--gme-border);
  border-radius: var(--gme-rounded-md);
  box-shadow: var(--gme-shadow-card);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--gme-text);
}

.dashboard-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: var(--gme-text);
}

.dashboard-hint {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--gme-text-2);
}

/* 任务类型分段选择：pill 段（design.md 分段控件规则） */
.dashboard-segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dashboard-segment {
  height: 33px;
  padding: 0 16px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-full);
  cursor: pointer;
}

.dashboard-segment:hover {
  background: var(--gme-surface-2);
}

.dashboard-segment:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.dashboard-segment-active,
.dashboard-segment-active:hover {
  background: var(--gme-primary);
  border-color: var(--gme-primary);
  color: var(--gme-primary-fg);
}

/* 输入：高 40 + border-strong + sm 圆角；textarea 最小高 86px */
.dashboard-input,
.dashboard-number-input {
  height: 40px;
  padding: 0 14px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-sm);
}

.dashboard-number-input {
  width: 120px;
  font-variant-numeric: tabular-nums;
}

.dashboard-textarea {
  min-height: 86px;
  padding: 8px 12px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  line-height: 1.6;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-sm);
  resize: vertical;
}

.dashboard-input:focus-visible,
.dashboard-number-input:focus-visible,
.dashboard-textarea:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
  border-color: var(--gme-ring);
}

.dashboard-input::placeholder,
.dashboard-textarea::placeholder {
  color: var(--gme-text-3);
}

/* danger 提示条（design.md alert：-soft 底 + 状态色 35% 混入边） */
.dashboard-alert {
  margin: 0;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 18px;
  border-radius: var(--gme-rounded-sm);
}

.dashboard-alert-danger {
  color: var(--gme-text);
  background: var(--gme-bad-soft);
  border: 1px solid color-mix(in srgb, var(--gme-bad) 35%, transparent);
}

/* ok 提示条（复制成功；状态色 35% 混入做边框，与 danger 同规则） */
.dashboard-alert-ok {
  color: var(--gme-text);
  background: var(--gme-ok-soft);
  border: 1px solid color-mix(in srgb, var(--gme-ok) 35%, transparent);
}

/* 主操作（单视图唯一 primary 实底钮） */
.dashboard-actions {
  display: flex;
  justify-content: flex-end;
}

.dashboard-button-primary {
  height: 40px;
  padding: 0 24px;
  font-family: var(--gme-font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--gme-primary-fg);
  background: var(--gme-primary);
  border: none;
  border-radius: var(--gme-rounded-full);
  cursor: pointer;
}

.dashboard-button-primary:hover {
  background: var(--gme-primary-hover);
}

.dashboard-button-primary:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.dashboard-button-primary:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

/* 数据表格（design.md：卡面容器 + mono 表头 + 行分隔 + hover surface-2） */
.dashboard-table-wrap {
  border: 1px solid var(--gme-border);
  border-radius: var(--gme-rounded-sm);
  overflow-x: auto;
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.dashboard-table th {
  padding: 8px 12px;
  text-align: left;
  font-family: var(--gme-font-mono);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gme-text-3);
  background: var(--gme-surface-2);
  white-space: nowrap;
}

.dashboard-table td {
  padding: 12px;
  border-top: 1px solid var(--gme-border);
  vertical-align: top;
}

.dashboard-table tbody tr:hover {
  background: var(--gme-surface-2);
}

.dashboard-numeric {
  font-variant-numeric: tabular-nums;
}

.dashboard-col-no {
  width: 48px;
  text-align: right;
}

.dashboard-table td.dashboard-col-no {
  font-family: var(--gme-font-mono);
  color: var(--gme-text-2);
}

.dashboard-col-actions {
  width: 320px;
}

.dashboard-task-name {
  font-weight: 500;
  color: var(--gme-text);
  overflow-wrap: anywhere;
}

.dashboard-status-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

/* 状态徽章 chip：mono 11.5px 胶囊 + -soft 底 + 圆点（颜色外有文字通道） */
.dashboard-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 8px;
  font-family: var(--gme-font-mono);
  font-size: 11.5px;
  font-weight: 600;
  border-radius: var(--gme-rounded-full);
  white-space: nowrap;
}

.dashboard-status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--gme-rounded-full);
  background: currentColor;
}

.dashboard-status-idle {
  background: var(--gme-surface-2);
  color: var(--gme-text-2);
}

.dashboard-status-running {
  background: var(--gme-primary-soft);
  color: var(--gme-primary);
}

.dashboard-status-paused {
  background: var(--gme-warn-soft);
  color: var(--gme-warn);
}

.dashboard-status-completed {
  background: var(--gme-ok-soft);
  color: var(--gme-ok);
}

.dashboard-progress {
  font-size: 12px;
  color: var(--gme-text-2);
}

.dashboard-counts {
  font-family: var(--gme-font-mono);
  font-size: 11px;
  color: var(--gme-text-3);
}

/* 行内操作：29px 高 small 钮（33px pill 的紧凑档） */
.dashboard-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.dashboard-button-small {
  height: 29px;
  padding: 0 12px;
  font-family: var(--gme-font-body);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--gme-text);
  background: var(--gme-surface);
  border: 1px solid var(--gme-border-strong);
  border-radius: var(--gme-rounded-full);
  cursor: pointer;
  white-space: nowrap;
}

.dashboard-button-small:hover {
  background: var(--gme-surface-2);
}

.dashboard-button-small:focus-visible {
  outline: 2px solid var(--gme-ring);
  outline-offset: 1px;
}

.dashboard-button-small:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.dashboard-button-danger {
  color: var(--gme-bad);
  border-color: var(--gme-bad);
}

/* 空态（design.md：虚线边框 + surface 底 + 指向第一个动作的说明） */
.dashboard-empty {
  margin: 0;
  padding: 32px 24px;
  font-size: 13px;
  line-height: 18px;
  color: var(--gme-text-2);
  text-align: center;
  background: var(--gme-surface);
  border: 1px dashed var(--gme-border-strong);
  border-radius: var(--gme-rounded-sm);
}
</style>
