<template>
  <div class="db-page">
    <header class="appbar db-appbar">
      <span class="brand"
        ><img class="brand-mark" :src="brandIconUrl" alt="" />{{ t(I18N_KEYS.APP.TITLE) }}</span
      >
      <span class="db-appbar-sep" aria-hidden="true"></span>
      <span class="appbar-title">{{ t(D.TITLE) }}</span>
      <div class="appbar-actions">
        <button
          v-if="runningTask && selectedTaskId !== runningTask.id"
          class="db-runpill"
          type="button"
          @click="openTask(runningTask)"
        >
          <span class="dot dot--live" aria-hidden="true"></span
          ><span class="db-runpill-label">{{ t(D.STATUS_RUNNING) }}</span>
          <span class="db-runpill-name truncate">{{ runningTask.name }}</span>
          <span class="mono"
            ><span v-roll="stats(runningTask).done"></span> /
            {{ format(runningTask.items.length) }}</span
          ><Icon :name="IconName.CHEVRON_RIGHT" :size="IconSize.XS" />
        </button>
        <a
          class="btn btn-ghost btn-sm db-hdr-link"
          :href="optionsUrl"
          target="_blank"
          rel="noreferrer"
          :aria-label="t(I18N_KEYS.OPTIONS.TITLE)"
          ><Icon :name="IconName.GEAR" /><span>{{ t(I18N_KEYS.OPTIONS.TITLE) }}</span></a
        >
        <a
          class="btn btn-ghost btn-sm db-hdr-link"
          :href="helpUrl"
          target="_blank"
          rel="noreferrer"
          :aria-label="t(I18N_KEYS.APP.HELP)"
          ><Icon :name="IconName.HELP" /><span>{{ t(I18N_KEYS.APP.HELP) }}</span></a
        >
      </div>
    </header>
    <main class="page db">
      <div class="db-head">
        <div class="db-title">
          <h1 class="h1">
            {{
              t(taskType === 'keywords' ? I18N_KEYS.APP.BULK_KEYWORDS : I18N_KEYS.APP.BULK_REVIEWS)
            }}
          </h1>
          <p class="db-lede">{{ t(taskType === 'keywords' ? D.LEDE_KEYWORDS : D.LEDE_REVIEWS) }}</p>
        </div>
        <div
          ref="toolTabs"
          class="seg db-tool"
          role="tablist"
          :aria-label="t(D.TITLE)"
          @keydown="onTabKey($event, 'tool')"
        >
          <span class="seg-thumb" aria-hidden="true" :style="toolIndicator"></span>
          <button
            v-for="type in toolTypes"
            :key="type"
            type="button"
            class="seg-btn"
            role="tab"
            :aria-selected="taskType === type"
            :tabindex="taskType === type ? 0 : -1"
            @click="selectType(type)"
          >
            <Icon :name="type === 'keywords' ? IconName.LIST_PLUS : IconName.REVIEW" />{{
              t(type === 'keywords' ? D.TYPE_KEYWORDS : D.TYPE_REVIEW_URLS)
            }}<span
              v-if="runningTask?.type === type"
              class="dot dot--live"
              :aria-label="t(D.STATUS_RUNNING)"
            ></span>
          </button>
        </div>
      </div>
      <div class="db-viewbar">
        <div
          ref="viewTabs"
          class="tabs db-tabs"
          role="tablist"
          :aria-label="t(D.TITLE)"
          @keydown="onTabKey($event, 'view')"
        >
          <button
            id="db-tab-create"
            class="tab"
            type="button"
            role="tab"
            aria-controls="db-panel"
            :aria-selected="activeView === 'create'"
            :tabindex="activeView === 'create' ? 0 : -1"
            @click="showView('create')"
          >
            <Icon :name="IconName.PLUS" />{{ t(D.SECTION_CREATE) }}
          </button>
          <button
            id="db-tab-history"
            class="tab"
            type="button"
            role="tab"
            aria-controls="db-panel"
            :aria-selected="activeView === 'history'"
            :tabindex="activeView === 'history' ? 0 : -1"
            @click="showView('history')"
          >
            <Icon :name="IconName.HISTORY" />{{ t(D.HISTORY)
            }}<span v-roll="tasks.length" class="badge badge--count"></span>
          </button>
          <span class="tab-ink" aria-hidden="true" :style="viewIndicator"></span>
        </div>
        <div
          class="db-slots"
          :class="{
            'tone-warn': state.tasks.length >= 140,
            'tone-bad': state.tasks.length >= BULK_LIMITS.maxTasks
          }"
        >
          <span
            ><b class="mono"
              ><span v-roll="state.tasks.length"></span> / {{ BULK_LIMITS.maxTasks }}</b
            >
            {{ t(D.SLOTS_HINT) }}</span
          >
          <span
            class="progress progress--sm"
            :style="{ '--p': (state.tasks.length / BULK_LIMITS.maxTasks) * 100 }"
            aria-hidden="true"
            ><span class="progress-fill"></span
          ></span>
        </div>
      </div>
      <div class="db-alerts">
        <div
          v-if="notice"
          :key="noticeId"
          class="db-alert"
          :class="notice.success ? 'tone-ok' : notice.code === 'mutex' ? 'tone-warn' : 'tone-bad'"
          @mouseenter="pauseNotice"
          @mouseleave="resumeNotice"
          @focusin="pauseNotice"
          @focusout="resumeNotice"
        >
          <div class="notice" :role="notice.success ? 'status' : 'alert'">
            <Icon :name="notice.success ? IconName.CHECK_CIRCLE : IconName.ALERT_CIRCLE" />
            <div class="db-alert-copy">
              <p class="notice-title">{{ notice.message }}</p>
              <div class="notice-actions">
                <button
                  v-if="notice.code === 'mutex' && runningTask"
                  class="btn btn-secondary btn-sm"
                  type="button"
                  @click="openTask(runningTask)"
                >
                  {{ t(D.VIEW_RUNNING) }}
                </button>
                <button
                  v-if="notice.code === 'limit-tasks' || notice.code === 'mutex'"
                  class="btn btn-ghost btn-sm"
                  type="button"
                  @click="showView('history')"
                >
                  {{ t(D.OPEN_HISTORY) }}
                </button>
                <a
                  v-if="notice.code === 'quota-exceeded'"
                  class="link"
                  :href="plansUrl"
                  target="_blank"
                  rel="noreferrer"
                  >{{ t(I18N_KEYS.APP.PLANS) }}</a
                >
              </div>
            </div>
            <button
              type="button"
              class="icon-btn icon-btn--sm"
              :aria-label="t(I18N_KEYS.APP_ERROR.DISMISS)"
              @click="clearNotice"
            >
              <Icon :name="IconName.X" />
            </button>
          </div>
          <span v-if="notice.success" class="db-alert-timer" aria-hidden="true"></span>
        </div>
      </div>
      <section
        id="db-panel"
        class="db-panel"
        role="tabpanel"
        :aria-labelledby="activeView === 'create' ? 'db-tab-create' : 'db-tab-history'"
      >
        <Transition name="db-stage" mode="out-in">
          <div v-if="selectedTask" :key="selectedTask.id" class="db-detail">
            <nav class="db-crumbs" :aria-label="t(D.HISTORY)">
              <button class="btn btn-ghost btn-sm db-back" type="button" @click="leaveTask">
                <Icon :name="IconName.ARROW_LEFT" />{{ t(D.BACK) }}</button
              ><span aria-hidden="true">/</span><span>{{ t(D.HISTORY) }}</span
              ><span aria-hidden="true">/</span
              ><span class="truncate strong" aria-current="page">{{ selectedTask.name }}</span>
            </nav>
            <section class="card db-hero" aria-labelledby="db-task-title">
              <div class="db-hero-head">
                <span class="icon-tile icon-tile--lg icon-tile--soft"
                  ><Icon
                    :name="selectedTask.type === 'keywords' ? IconName.LIST_PLUS : IconName.REVIEW"
                /></span>
                <div class="db-hero-main">
                  <div class="db-hero-title">
                    <h2 id="db-task-title" class="h2">{{ selectedTask.name }}</h2>
                    <span class="status" :class="`status--${selectedTask.status}`"
                      ><span :key="selectedTask.status" class="db-chip-text">{{
                        statusText(selectedTask.status)
                      }}</span></span
                    >
                  </div>
                  <p class="db-meta">{{ taskMeta(selectedTask) }}</p>
                </div>
                <div class="db-hero-actions">
                  <button
                    type="button"
                    class="btn btn-primary db-act"
                    :disabled="submitting"
                    @click="primaryAction(selectedTask)"
                  >
                    <Icon :name="actionIcon(selectedTask)" /><span
                      :key="selectedTask.status"
                      class="db-chip-text"
                      >{{ actionText(selectedTask) }}</span
                    ></button
                  ><button
                    type="button"
                    class="icon-btn icon-btn--bordered"
                    :aria-label="t(D.MORE_ACTIONS, { name: selectedTask.name })"
                    @click="openMenu($event, selectedTask)"
                  >
                    <Icon :name="IconName.MORE" />
                  </button>
                </div>
              </div>
              <div class="db-meter">
                <div class="db-meter-read">
                  <span v-roll="stats(selectedTask).done" class="db-big mono"></span
                  ><span class="db-big-of mono">/ {{ format(selectedTask.items.length) }}</span
                  ><span class="db-meter-label">{{ t(D.PROCESSED) }}</span
                  ><span class="db-pct mono"><span v-roll="progress(selectedTask)"></span>%</span>
                </div>
                <div
                  class="progress progress--lg"
                  :class="{ 'is-live': selectedTask.status === 'running' }"
                  :style="{ '--p': progress(selectedTask) }"
                  role="progressbar"
                  :aria-label="selectedTask.name"
                  :aria-valuemin="0"
                  :aria-valuemax="selectedTask.items.length"
                  :aria-valuenow="stats(selectedTask).done"
                >
                  <span class="progress-fill"></span>
                </div>
                <div class="db-meter-foot">
                  <span>{{ stateLine(selectedTask) }}</span
                  ><span>{{ t(D.DOWNLOAD_HINT) }}</span>
                </div>
              </div>
              <dl class="db-stats">
                <div class="db-stat">
                  <dt><Icon :name="IconName.CHECK_CIRCLE" />{{ t(D.STATUS_COMPLETED) }}</dt>
                  <dd v-roll="stats(selectedTask).complete"></dd>
                </div>
                <div class="db-stat">
                  <dt><Icon :name="IconName.DATABASE" />{{ t(D.COLLECTED) }}</dt>
                  <dd v-roll="stats(selectedTask).records"></dd>
                </div>
                <div class="db-stat" :class="{ 'tone-bad': stats(selectedTask).skipped > 0 }">
                  <dt><Icon :name="IconName.SKIP" />{{ t(D.SKIPPED) }}</dt>
                  <dd v-roll="stats(selectedTask).skipped"></dd>
                  <p class="db-stat-sub">
                    {{
                      t(D.SKIP_BREAKDOWN, {
                        stuck: stats(selectedTask).stuck,
                        invalid: stats(selectedTask).invalid
                      })
                    }}
                  </p>
                </div>
                <div class="db-stat">
                  <dt><Icon :name="IconName.REFRESH" />{{ t(D.ATTEMPTS) }}</dt>
                  <dd v-roll="stats(selectedTask).tries"></dd>
                </div>
              </dl>
              <div v-if="selectedTask.status === 'running'" class="notice db-keep">
                <Icon :name="IconName.INFO" />
                <p class="notice-desc">{{ t(D.EXECUTION_HINT) }}</p>
              </div>
            </section>
            <section class="db-items" aria-labelledby="db-items-title">
              <header class="db-items-head">
                <h3 id="db-items-title" class="h3">{{ itemsLabel }}</h3>
                <span class="db-meta">{{
                  t(D.PROGRESS_OF, {
                    done: stats(selectedTask).done,
                    total: selectedTask.items.length
                  })
                }}</span>
              </header>
              <div
                ref="itemsWrap"
                class="db-items-wrap"
                role="region"
                tabindex="0"
                aria-labelledby="db-items-title"
                @wheel.passive="following = false"
                @touchmove.passive="following = false"
                @pointerdown="following = false"
                @keydown="following = false"
                @scroll.passive="checkCurrentVisible"
              >
                <table class="db-table db-items-table">
                  <thead>
                    <tr>
                      <th scope="col" class="db-col-index">{{ t(D.COL_NO) }}</th>
                      <th scope="col">{{ itemsLabel }}</th>
                      <th scope="col" class="db-col-status">{{ t(D.COL_STATUS) }}</th>
                      <th scope="col" class="db-col-records cell-num">{{ t(D.COLLECTED) }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in selectedRows"
                      :key="index"
                      :data-index="index"
                      :class="{
                        'is-active': row.item.status === 'running',
                        'is-retry': row.item.status === 'running' && row.item.tries > 1,
                        'is-flash': flashingRows.has(index)
                      }"
                    >
                      <td class="cell-index mono">{{ index + 1 }}</td>
                      <td class="db-item-value">
                        <a
                          v-if="row.url"
                          class="db-url"
                          :href="row.item.value"
                          target="_blank"
                          rel="noreferrer"
                          ><span class="db-url-host">{{ row.url.host }}</span
                          ><span class="truncate"
                            >{{ row.url.pathname }}{{ row.url.search }}</span
                          ></a
                        ><span v-else class="db-kw" :title="row.item.value">{{
                          row.item.value
                        }}</span>
                      </td>
                      <td class="db-item-status">
                        <span
                          class="status"
                          :class="
                            row.item.status === 'running' && row.item.tries > 1
                              ? 'status--paused db-status-retry'
                              : `status--${row.item.status === 'complete' ? 'completed' : row.item.status}`
                          "
                          ><span :key="itemStatusText(row.item)" class="db-chip-text">{{
                            itemStatusText(row.item)
                          }}</span></span
                        >
                      </td>
                      <td class="cell-num mono">
                        <span
                          v-if="row.item.status === 'running'"
                          class="db-dots"
                          :aria-label="t(D.ITEM_RUNNING)"
                          ><i></i><i></i><i></i></span
                        ><span
                          v-else-if="row.item.status === 'complete'"
                          v-roll="row.item.collected"
                        ></span
                        ><span v-else class="subtle">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                v-if="selectedTask.status === 'running' && !currentVisible"
                type="button"
                class="btn btn-secondary btn-sm db-jump"
                @click="jumpToCurrent"
              >
                <Icon :name="IconName.ARROW_DOWN" />{{ t(D.JUMP_CURRENT) }}
              </button>
            </section>
          </div>
          <form
            v-else-if="view === 'create'"
            :key="`create-${taskType}`"
            class="db-new"
            novalidate
            @submit.prevent="createTasks(true)"
          >
            <div class="card db-form-card">
              <header class="db-card-head">
                <span class="icon-tile icon-tile--soft"
                  ><Icon :name="taskType === 'keywords' ? IconName.LIST_PLUS : IconName.REVIEW"
                /></span>
                <div>
                  <h2 class="h3">
                    {{ t(taskType === 'keywords' ? D.NEW_KEYWORDS : D.NEW_REVIEWS) }}
                  </h2>
                  <p class="db-card-desc">
                    {{ t(taskType === 'keywords' ? D.FORM_KEYWORDS : D.FORM_REVIEWS) }}
                  </p>
                </div>
              </header>
              <div class="db-form-body">
                <div class="field">
                  <label class="field-label" for="db-name">{{ t(D.TASK_NAME) }}</label
                  ><input
                    id="db-name"
                    v-model="draft.name"
                    type="text"
                    class="input"
                    autocomplete="off"
                    :placeholder="t(D.TASK_NAME_PLACEHOLDER)"
                    :aria-invalid="submitted && !draft.name.trim()"
                    aria-describedby="db-name-error"
                    :disabled="submitting"
                  />
                  <p v-if="submitted && !draft.name.trim()" id="db-name-error" class="field-error">
                    {{ t(D.ERROR_NAME_REQUIRED) }}
                  </p>
                </div>
                <div class="field">
                  <label class="field-label" for="db-input"
                    ><span>{{ itemsLabel }}</span
                    ><span class="field-aside">{{
                      t(D.ITEMS_ASIDE, { max: MAX_ITEMS })
                    }}</span></label
                  >
                  <div class="db-textarea-wrap">
                    <textarea
                      id="db-input"
                      v-model="draft.items"
                      class="textarea db-textarea mono"
                      rows="12"
                      spellcheck="false"
                      :placeholder="itemsPlaceholder"
                      :aria-invalid="submitted && values.length === 0"
                      aria-describedby="db-cleanup db-input-error"
                      :disabled="submitting"
                    ></textarea
                    ><span
                      :key="values.length"
                      class="db-counter mono"
                      :class="{ 'is-split': taskCount > 1 }"
                      aria-hidden="true"
                      ><b>{{ format(values.length) }}</b> / {{ MAX_ITEMS
                      }}<span v-if="taskCount > 1">
                        · {{ t(D.TASK_COUNT, { count: taskCount }) }}</span
                      ></span
                    >
                  </div>
                  <div id="db-cleanup" class="db-cleanup">
                    <TransitionGroup name="db-clean"
                      ><span v-if="duplicateCount" key="duplicates" class="db-clean"
                        ><Icon :name="IconName.COPY" :size="IconSize.XS" />{{
                          t(D.DUPLICATES_REMOVED, { count: duplicateCount })
                        }}</span
                      ><span v-if="emptyCount" key="empty" class="db-clean"
                        ><Icon :name="IconName.MINUS" :size="IconSize.XS" />{{
                          t(D.EMPTY_REMOVED, { count: emptyCount })
                        }}</span
                      ><span v-if="invalidCount" key="invalid" class="db-clean db-clean-warn"
                        ><Icon :name="IconName.ALERT_CIRCLE" :size="IconSize.XS" />{{
                          t(D.INVALID_LINKS, { count: invalidCount })
                        }}</span
                      ></TransitionGroup
                    >
                    <p v-if="!duplicateCount && !emptyCount && !invalidCount" class="field-hint">
                      {{ t(D.CLEANUP_HINT) }}
                    </p>
                  </div>
                  <p
                    v-if="submitted && values.length === 0"
                    id="db-input-error"
                    class="field-error"
                  >
                    {{ t(D.ERROR_EMPTY_INPUT) }}
                  </p>
                </div>
                <div v-if="taskType === 'review-urls'" class="field">
                  <label class="field-label" for="db-reviews-limit">{{
                    t(D.REVIEWS_PER_STORE_LIMIT)
                  }}</label>
                  <div class="db-perplace-row">
                    <span class="select-wrap"
                      ><select
                        id="db-reviews-limit"
                        v-model.number="reviewsLimit"
                        class="select"
                        :disabled="submitting"
                        aria-describedby="db-review-hint"
                      >
                        <option v-for="limit in reviewLimits" :key="limit" :value="limit">
                          {{ format(limit) }}
                        </option>
                      </select></span
                    >
                    <p id="db-review-hint" class="field-hint">
                      {{ t(D.REVIEWS_PER_STORE_LIMIT_HINT) }}
                    </p>
                  </div>
                </div>
                <div class="db-retry">
                  <div class="db-retry-head">
                    <Icon :name="IconName.REFRESH" /><b>{{
                      t(I18N_KEYS.OPTIONS.STUCK_MAX_RETRY)
                    }}</b
                    ><span class="badge badge--outline"
                      ><Icon :name="IconName.LOCK" :size="IconSize.XS" />{{
                        t(D.SET_IN_SETTINGS)
                      }}</span
                    >
                  </div>
                  <p class="body-sm">
                    {{
                      t(
                        D.RETRY_VALUE,
                        { retries: retryCount, attempts: retryCount + 1 },
                        retryCount
                      )
                    }}
                  </p>
                  <p class="field-hint">{{ t(D.RETRY_HINT) }}</p>
                  <div class="db-retry-bottom">
                    <ol class="db-pips" role="list" aria-hidden="true">
                      <li v-for="attempt in retryCount + 1" :key="attempt">{{ attempt }}</li>
                      <li class="db-pip-skip">
                        <Icon :name="IconName.ARROW_RIGHT" :size="IconSize.XS" />{{ t(D.SKIPPED) }}
                      </li>
                    </ol>
                    <a
                      class="link-arrow"
                      :href="`${optionsUrl}#automation`"
                      target="_blank"
                      rel="noreferrer"
                      >{{ t(D.CHANGE_SETTINGS)
                      }}<Icon :name="IconName.EXTERNAL" :size="IconSize.XS"
                    /></a>
                  </div>
                </div>
              </div>
              <footer class="db-form-foot">
                <button
                  class="btn btn-ghost db-clear"
                  type="button"
                  :disabled="submitting || (!draft.items && !draft.name)"
                  @click="clearForm"
                >
                  <Icon :name="IconName.X" />{{ t(D.CLEAR) }}
                </button>
                <p
                  v-if="quotaExceeded || runningTask"
                  class="db-foot-hint"
                  :class="{ 'tone-bad': quotaExceeded }"
                >
                  {{
                    quotaExceeded
                      ? t(D.QUOTA_FOOT_HINT)
                      : t(D.RUNNING_FOOT_HINT, { name: runningTask?.name })
                  }}
                </p>
                <div class="db-form-actions">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    :class="{ 'is-loading': submitting }"
                    :disabled="submitting"
                    @click="createTasks(false)"
                  >
                    <span v-if="submitting" class="spinner" aria-hidden="true"></span
                    ><Icon v-else :name="IconName.LIST_PLUS" />{{
                      taskCount > 1 ? t(D.CREATE_TASKS, { count: taskCount }) : t(D.CREATE_TASK)
                    }}</button
                  ><button
                    type="submit"
                    class="btn btn-primary"
                    :class="{ 'is-loading': submitting }"
                    :disabled="submitting"
                  >
                    <span v-if="submitting" class="spinner" aria-hidden="true"></span
                    ><Icon v-else :name="IconName.PLAY" />{{
                      t(taskCount > 1 ? D.START_FIRST_TASK : D.START_EXTRACTING)
                    }}
                  </button>
                </div>
              </footer>
            </div>
            <aside class="db-rail" :aria-label="t(D.SUMMARY)">
              <section class="card db-sum">
                <h3 class="kicker">{{ t(D.SUMMARY) }}</h3>
                <div class="db-sum-main">
                  <span v-roll="values.length" class="db-sum-num mono"></span
                  ><span>{{ itemsLabel }}</span
                  ><Icon :name="IconName.ARROW_RIGHT" :size="IconSize.SM" /><b>{{
                    t(D.TASK_COUNT, { count: taskCount })
                  }}</b>
                </div>
                <p class="db-card-desc">
                  {{
                    values.length === 0
                      ? t(D.SUMMARY_EMPTY)
                      : taskCount > 1
                        ? t(D.SPLIT_HINT, {
                            count: values.length,
                            tasks: taskCount,
                            max: MAX_ITEMS
                          })
                        : t(D.SUMMARY_ONE)
                  }}
                </p>
                <div v-if="taskCount > 1" class="db-split">
                  <ol class="db-split-bar" role="list" aria-hidden="true">
                    <li
                      v-for="(size, index) in splitSizes"
                      :key="index"
                      :style="{ flexGrow: size }"
                    ></li>
                  </ol>
                  <ul class="db-split-list" role="list">
                    <li v-for="(size, index) in splitSizes" :key="index">
                      <span class="truncate"
                        >{{ draft.name.trim() || t(D.SECTION_CREATE) }}_{{ index + 1 }}</span
                      ><b class="mono">{{ format(size) }}</b>
                    </li>
                  </ul>
                  <p class="field-hint">{{ t(D.SPLIT_START_HINT) }}</p>
                </div>
                <div ref="quotaBox" class="db-quota" :class="{ 'is-over': quotaExceeded }">
                  <div class="db-quota-head">
                    <h3 class="kicker">{{ t(D.QUOTA_CHECK) }}</h3>
                    <span class="mono">{{
                      t(taskType === 'keywords' ? D.QUOTA_RULE_KEYWORDS : D.QUOTA_RULE_REVIEWS, {
                        count: perItem
                      })
                    }}</span>
                  </div>
                  <p class="db-quota-need">
                    <b v-roll="estimate" class="mono"></b><span>{{ t(D.RECORDS_NEEDED) }}</span>
                  </p>
                  <template v-if="usage"
                    ><div
                      class="db-qbar"
                      :style="{
                        '--used': Math.min(100, (usage.used / usage.total) * 100),
                        '--task': Math.max(0, (Math.min(estimate, remaining) / usage.total) * 100)
                      }"
                      aria-hidden="true"
                    >
                      <span></span><span></span>
                    </div>
                    <dl class="db-quota-legend">
                      <div>
                        <dt>{{ t(D.QUOTA_USED) }}</dt>
                        <dd v-roll="usage.used" class="mono"></dd>
                      </div>
                      <div>
                        <dt>{{ t(D.QUOTA_TASK) }}</dt>
                        <dd v-roll="estimate" class="mono"></dd>
                      </div>
                      <div>
                        <dt>{{ t(D.QUOTA_AFTER) }}</dt>
                        <dd v-roll="remaining - estimate" class="mono"></dd>
                      </div>
                    </dl>
                    <p class="field-hint">
                      {{
                        t(D.QUOTA_LEFT, {
                          remaining: format(remaining),
                          total: format(usage.total),
                          period: usage.period
                        })
                      }}
                    </p>
                    <div v-if="quotaExceeded" class="db-quota-warn" role="status">
                      <Icon :name="IconName.ALERT_CIRCLE" />
                      <div>
                        <b>{{ t(D.ERROR_QUOTA_EXCEEDED) }}</b>
                        <p>
                          {{
                            t(D.QUOTA_REDUCE, {
                              count: values.length - Math.max(0, Math.floor(remaining / perItem))
                            })
                          }}
                        </p>
                        <p v-if="lowerReviews >= 100 && lowerReviews < reviewsLimit">
                          {{ t(D.QUOTA_LOWER_REVIEWS, { count: lowerReviews }) }}
                        </p>
                        <a class="link" :href="plansUrl" target="_blank" rel="noreferrer">{{
                          t(I18N_KEYS.APP.PLANS)
                        }}</a>
                      </div>
                    </div></template
                  >
                  <p v-else class="field-hint" role="status">
                    {{ t(D.QUOTA_UNAVAILABLE) }}
                    <button class="link" type="button" @click="refreshUsage">
                      {{ t(I18N_KEYS.APP_ERROR.RETRY) }}
                    </button>
                  </p>
                </div>
              </section>
            </aside>
          </form>
          <div v-else :key="`history-${taskType}`" class="db-history">
            <div v-if="tasks.length === 0" class="card empty db-empty">
              <span class="icon-tile icon-tile--lg icon-tile--soft"
                ><Icon :name="IconName.LIST_PLUS"
              /></span>
              <h2 class="empty-title">{{ t(D.EMPTY_TITLE) }}</h2>
              <p class="empty-desc">{{ t(D.EMPTY_HINT) }}</p>
              <button type="button" class="btn btn-primary" @click="showView('create')">
                <Icon :name="IconName.PLUS" />{{ t(D.SECTION_CREATE) }}
              </button>
              <p class="field-hint">
                {{ t(D.HISTORY_HINT, { count: state.tasks.length, max: BULK_LIMITS.maxTasks }) }}
              </p>
            </div>
            <div v-else class="card db-history-wrap">
              <table class="db-table db-history-table">
                <thead>
                  <tr>
                    <th scope="col" class="db-col-index">{{ t(D.COL_NO) }}</th>
                    <th scope="col">{{ t(D.COL_TASK_NAME) }}</th>
                    <th scope="col">{{ t(D.COL_STATUS) }}</th>
                    <th scope="col" class="cell-num">{{ t(D.PROCESSED) }}</th>
                    <th scope="col" class="cell-num">{{ t(D.COL_ACTIONS) }}</th>
                  </tr>
                </thead>
                <TransitionGroup tag="tbody" name="db-row"
                  ><tr
                    v-for="(task, index) in tasks"
                    :key="task.id"
                    :class="{ 'is-active': task.status === 'running' }"
                  >
                    <td class="cell-index mono">{{ index + 1 }}</td>
                    <td class="db-cell-task">
                      <button type="button" class="db-task-name" @click="openTask(task)">
                        {{ task.name }}
                      </button>
                      <p class="db-meta">{{ taskMeta(task) }}</p>
                    </td>
                    <td class="db-cell-status">
                      <span class="status" :class="`status--${task.status}`"
                        ><span :key="task.status" class="db-chip-text">{{
                          statusText(task.status)
                        }}</span></span
                      >
                    </td>
                    <td class="db-cell-progress">
                      <div class="db-prog">
                        <span class="mono"
                          ><b v-roll="stats(task).done"></b
                          ><span class="subtle"> / {{ format(task.items.length) }}</span></span
                        ><span
                          class="progress progress--sm"
                          :class="{ 'is-live': task.status === 'running' }"
                          :style="{ '--p': progress(task) }"
                          aria-hidden="true"
                          ><span class="progress-fill"></span></span
                        ><span class="db-counts"
                          >{{ t(D.COUNT_TRY, { n: stats(task).tries }) }} ·
                          {{ t(D.COUNT_COMPLETE, { n: stats(task).complete }) }} ·
                          {{ t(D.COUNT_STUCK, { n: stats(task).stuck }) }} ·
                          {{ t(D.COUNT_SKIP, { n: stats(task).invalid }) }}</span
                        >
                      </div>
                    </td>
                    <td class="db-cell-actions">
                      <div class="row">
                        <button type="button" class="btn btn-ghost btn-sm" @click="openTask(task)">
                          {{ t(D.ACTION_VIEW) }}</button
                        ><button
                          type="button"
                          class="btn btn-secondary btn-sm db-act"
                          :disabled="submitting"
                          @click="primaryAction(task)"
                        >
                          <Icon :name="actionIcon(task)" :size="IconSize.XS" /><span
                            :key="task.status"
                            class="db-chip-text"
                            >{{ actionText(task) }}</span
                          ></button
                        ><button
                          type="button"
                          class="icon-btn icon-btn--sm"
                          :aria-label="t(D.MORE_ACTIONS, { name: task.name })"
                          @click="openMenu($event, task)"
                        >
                          <Icon :name="IconName.MORE" />
                        </button>
                      </div>
                    </td></tr
                ></TransitionGroup>
              </table>
            </div>
          </div>
        </Transition>
      </section>
    </main>
    <div
      ref="taskMenu"
      popover
      class="menu db-menu"
      role="menu"
      :aria-label="t(D.COL_ACTIONS)"
      @keydown="onMenuKey"
    >
      <template v-if="menuTask"
        ><button
          v-for="scope in copyScopes"
          :key="scope"
          type="button"
          role="menuitem"
          class="menu-item"
          :disabled="copyCount(menuTask, scope) === 0"
          @click="copyItems(menuTask, scope)"
        >
          <Icon :name="IconName.COPY" />{{
            t(
              scope === 'completed'
                ? D.ACTION_COPY_COMPLETED
                : scope === 'pending'
                  ? D.ACTION_COPY_PENDING
                  : D.ACTION_COPY_ALL
            )
          }}<span class="menu-item-meta mono">{{ copyCount(menuTask, scope) }}</span>
        </button>
        <div class="menu-sep" role="separator"></div>
        <button
          type="button"
          role="menuitem"
          class="menu-item menu-item--danger"
          :disabled="submitting"
          @click="requestDelete(menuTask)"
        >
          <Icon :name="IconName.TRASH" />{{ t(D.ACTION_DELETE) }}
        </button></template
      >
    </div>
    <dialog
      ref="deleteDialog"
      class="dialog"
      aria-labelledby="db-delete-title"
      aria-describedby="db-delete-desc"
    >
      <div class="dialog-body">
        <span class="icon-tile tone-bad"><Icon :name="IconName.TRASH" /></span>
        <h2 id="db-delete-title" class="dialog-title">{{ t(D.DELETE_TITLE) }}</h2>
        <p id="db-delete-desc" class="dialog-desc">
          {{ t(D.DELETE_CONFIRM, { name: deleteTarget?.name }) }}
        </p>
        <p v-if="deleteTarget?.status === 'running'" class="dialog-desc">
          {{ t(D.DELETE_RUNNING) }}
        </p>
      </div>
      <div class="dialog-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="submitting"
          autofocus
          @click="deleteDialog?.close()"
        >
          {{ t(D.CANCEL) }}</button
        ><button type="button" class="btn btn-danger" :disabled="submitting" @click="confirmDelete">
          {{ t(D.ACTION_DELETE) }}
        </button>
      </div>
    </dialog>
    <Toast :show="toastState.show" :message="toastState.message" :type="toastState.type" />
    <p class="sr-only" role="status" aria-live="polite">{{ progressAnnouncement }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, type Directive } from 'vue'
import { useI18n } from 'vue-i18n'
import { I18N_KEYS } from '@/core/constants/i18n'
import { WEBSITE } from '@/core/api/config'
import { Icon, IconName, IconSize } from '@/core/components/icons'
import Toast from '@/core/components/Toast.vue'
import { useToast } from '@/core/composables/useToast'
import { logger } from '@/core/utils/logger'
import { BackgroundChannel } from '@/popup/rpc/background.rpc'
import { markApi, MARK_TYPE } from '@/core/api/mark'
import { ChromeEventSubscriber } from '@/core/rpc/ChromeEventBus'
import type { ExtensionEvents } from '@/core/events/types'
import { MapsUserSettingsManager } from '@/sites/maps/settings/userSettings'
import type { MapsUsageSnapshot } from '@/sites/maps/usage/types'
import { DEFAULT_MAPS_CONFIG } from '@/sites/maps/config/contract'
import { estimateBulkRecords } from '@/background/batch/quota'
import { buildReviewWorkUrl } from '@/background/batch/workUrl'
import {
  BULK_LIMITS,
  type BulkErrorCode,
  type BulkState,
  type BulkTask,
  type BulkTaskItem,
  type BulkTaskStatus,
  type BulkTaskType
} from '@/background/batch/types'

const { t, locale } = useI18n()
const D = I18N_KEYS.DASHBOARD
const { toastState, showSuccess } = useToast()
const MAX_ITEMS = BULK_LIMITS.maxItemsPerTask
const toolTypes: BulkTaskType[] = ['keywords', 'review-urls']
const copyScopes = ['completed', 'pending', 'all'] as const
type CopyScope = (typeof copyScopes)[number]
const background = new BackgroundChannel()
/** 批量任务打点：失败只记日志，绝不阻塞任务操作。 */
function sendMark(markType: (typeof MARK_TYPE)[keyof typeof MARK_TYPE], markMsg: string): void {
  markApi
    .record(markType, markMsg, { surface: 'dashboard' })
    .catch(error => logger.error(`[Dashboard] ${markType} 打点失败:`, error))
}
const stateSubscriber = new ChromeEventSubscriber<ExtensionEvents>()
const state = ref<BulkState>({ version: 1, tasks: [] })
const taskType = ref<BulkTaskType>(
  new URLSearchParams(location.search).get('type') === '1' ? 'review-urls' : 'keywords'
)
const drafts = ref({ keywords: { name: '', items: '' }, 'review-urls': { name: '', items: '' } })
const draft = computed(() => drafts.value[taskType.value])
const reviewsLimit = ref<number>(BULK_LIMITS.defaultReviewsPerStoreLimit)
const reviewLimits = Array.from({ length: 25 }, (_, index) => (index + 1) * 100)
const retryCount = ref(1)
const view = ref<'create' | 'history'>('create')
const selectedTaskId = ref<string | null>(null)
const submitting = ref(false)
const submitted = ref(false)
const usage = ref<MapsUsageSnapshot | null>(null)
const notice = ref<{ message: string; success: boolean; code: BulkErrorCode | null } | null>(null)
const noticeId = ref(0)
const progressAnnouncement = ref('')
const following = ref(true)
const currentVisible = ref(true)
const itemsWrap = ref<HTMLDivElement | null>(null)
const quotaBox = ref<HTMLDivElement | null>(null)
const taskMenu = ref<HTMLDivElement | null>(null)
const deleteDialog = ref<HTMLDialogElement | null>(null)
const menuTaskId = ref<string | null>(null)
const deleteTargetId = ref<string | null>(null)
const menuTask = computed(() => state.value.tasks.find(task => task.id === menuTaskId.value))
const deleteTarget = computed(() =>
  state.value.tasks.find(task => task.id === deleteTargetId.value)
)
const toolTabs = ref<HTMLDivElement | null>(null)
const viewTabs = ref<HTMLDivElement | null>(null)
const toolIndicator = ref({ width: '0px', transform: 'translateX(0px)' })
const viewIndicator = ref({ width: '0px', transform: 'translateX(0px)' })
const optionsUrl = chrome.runtime.getURL('src/options.html')
const brandIconUrl = chrome.runtime.getURL('icons/32.png')
const helpUrl = new URL('/extension/#faq', WEBSITE.BASE_URL).toString()
const plansUrl = new URL('/pricing', WEBSITE.BASE_URL).toString()
let noticeTimer: number | null = null
let noticeRemaining = 4000
let noticeStarted = 0
let lastAnnouncedAt = 0
let removeSettingsListener: (() => void) | null = null

const tasks = computed(() =>
  state.value.tasks.filter(task => task.type === taskType.value).reverse()
)
const selectedTask = computed(
  () => state.value.tasks.find(task => task.id === selectedTaskId.value) ?? null
)
const runningTask = computed(() => state.value.tasks.find(task => task.status === 'running'))
const activeView = computed(() => (selectedTask.value ? 'history' : view.value))
const lines = computed(() =>
  draft.value.items ? draft.value.items.split('\n').map(line => line.trim()) : []
)
const nonEmpty = computed(() => lines.value.filter(Boolean))
const values = computed(() => [...new Set(nonEmpty.value)])
const emptyCount = computed(() => lines.value.length - nonEmpty.value.length)
const duplicateCount = computed(() => nonEmpty.value.length - values.value.length)
const taskCount = computed(() => Math.ceil(values.value.length / MAX_ITEMS))
const splitSizes = computed(() =>
  Array.from({ length: taskCount.value }, (_, index) =>
    Math.min(MAX_ITEMS, values.value.length - index * MAX_ITEMS)
  )
)
const invalidCount = computed(() =>
  taskType.value === 'review-urls' ? values.value.filter(value => !validReviewUrl(value)).length : 0
)
const perItem = computed(() =>
  taskType.value === 'review-urls'
    ? reviewsLimit.value
    : DEFAULT_MAPS_CONFIG.scrape.freeExportRowLimit
)
const estimate = computed(() =>
  estimateBulkRecords(
    values.value.length,
    taskType.value,
    reviewsLimit.value,
    DEFAULT_MAPS_CONFIG.scrape.freeExportRowLimit
  )
)
const remaining = computed(() =>
  usage.value ? Math.max(0, usage.value.total - usage.value.used) : 0
)
const quotaExceeded = computed(() => usage.value !== null && estimate.value > remaining.value)
const lowerReviews = computed(() =>
  values.value.length ? Math.floor(remaining.value / values.value.length / 100) * 100 : 0
)
const itemsLabel = computed(() =>
  t(taskType.value === 'keywords' ? D.TYPE_KEYWORDS : D.TYPE_REVIEW_URLS)
)
const itemsPlaceholder = computed(() =>
  t(taskType.value === 'keywords' ? D.ITEMS_PLACEHOLDER_KEYWORDS : D.ITEMS_PLACEHOLDER_REVIEWS)
)
const selectedRows = computed(
  () =>
    selectedTask.value?.items.map(item => ({
      item,
      url:
        selectedTask.value?.type === 'review-urls' && validReviewUrl(item.value)
          ? new URL(item.value)
          : null
    })) ?? []
)
const taskStats = computed(() =>
  Object.fromEntries(
    state.value.tasks.map(task => {
      const counts = {
        done: 0,
        complete: 0,
        skipped: 0,
        stuck: 0,
        invalid: 0,
        tries: 0,
        records: 0
      }
      for (const item of task.items) {
        counts.tries += item.tries
        if (item.status === 'complete') {
          counts.complete++
          counts.records += item.collected
        }
        if (item.status === 'skipped') counts.skipped++
        if (item.skipReason === 'stuck') counts.stuck++
        if (item.skipReason === 'invalid-url') counts.invalid++
      }
      counts.done = counts.complete + counts.skipped
      return [task.id, counts]
    })
  )
)
function stats(task: BulkTask) {
  return taskStats.value[task.id]!
}
function progress(task: BulkTask): number {
  return task.items.length ? Math.floor((stats(task).done / task.items.length) * 100) : 0
}
function format(value: number): string {
  return new Intl.NumberFormat(locale.value).format(value)
}
function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
const vRoll: Directive<HTMLElement, number> = {
  mounted(element, binding) {
    element.textContent = format(binding.value)
  },
  updated(element, binding) {
    const value = format(binding.value)
    if (element.textContent === value) return
    element.textContent = value
    if (!reducedMotion())
      element.animate(
        [
          { transform: 'translateY(6px)', opacity: 0.3 },
          { transform: 'none', opacity: 1 }
        ],
        { duration: 280, easing: 'ease-out' }
      )
  }
}
function validReviewUrl(value: string): boolean {
  return buildReviewWorkUrl(value, '', 0, reviewsLimit.value, 1) !== null
}
function taskMeta(task: BulkTask): string {
  const parts = [t(D.ITEM_COUNT, { count: format(task.items.length) }, task.items.length)]
  if (task.type === 'review-urls')
    parts.push(
      t(D.QUOTA_RULE_REVIEWS, {
        count: task.reviewsPerStoreLimit ?? BULK_LIMITS.defaultReviewsPerStoreLimit
      })
    )
  parts.push(
    new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(
      task.createdAt
    )
  )
  return parts.join(' · ')
}
function updateIndicators(): void {
  for (const [container, indicator] of [
    [toolTabs.value, toolIndicator],
    [viewTabs.value, viewIndicator]
  ] as const) {
    const active = container?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    if (active)
      indicator.value = {
        width: `${active.offsetWidth}px`,
        transform: `translateX(${active.offsetLeft}px)`
      }
  }
}
function selectType(type: BulkTaskType): void {
  if (submitting.value) return
  taskType.value = type
  selectedTaskId.value = null
  submitted.value = false
  clearNotice()
  const url = new URL(location.href)
  url.searchParams.set('type', type === 'review-urls' ? '1' : '0')
  history.replaceState(null, '', url)
}
function showView(next: 'create' | 'history'): void {
  view.value = next
  selectedTaskId.value = null
  submitted.value = false
}
function openTask(task: BulkTask): void {
  if (submitting.value) return
  selectType(task.type)
  selectedTaskId.value = task.id
  following.value = true
  void nextTick(jumpToCurrent)
}
function onTabKey(event: KeyboardEvent, group: 'tool' | 'view'): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? 1
        : group === 'tool'
          ? Number(taskType.value === 'keywords')
          : Number(activeView.value === 'create')
  if (group === 'tool') selectType(toolTypes[index]!)
  else showView(index === 0 ? 'create' : 'history')
  const container = group === 'tool' ? toolTabs.value : viewTabs.value
  void nextTick(() =>
    container?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
  )
}
/** 正在闪烁的行下标：条目刚变成完成 / 跳过时整行底色闪一次（设计合同 tr.is-flash）。 */
const flashingRows = ref<ReadonlySet<number>>(new Set())
const flashTimers = new Map<number, number>()
/**
 * 对比前后两份状态，给当前任务里刚落到完成 / 跳过的条目打一次闪烁。
 * 用下标标识行（表格 v-for 即以 index 为 key）；只处理当前选中任务，
 * 初次加载时前一份状态为空，不会误闪。
 */
function flashCompletedRows(previous: BulkState, next: BulkState): void {
  const taskId = selectedTaskId.value
  if (!taskId) return
  const before = previous.tasks.find(task => task.id === taskId)
  const after = next.tasks.find(task => task.id === taskId)
  if (!before || !after) return
  after.items.forEach((item, index) => {
    const previousItem = before.items[index]
    if (!previousItem || previousItem.status === item.status) return
    if (item.status !== 'complete' && item.status !== 'skipped') return
    flashingRows.value = new Set(flashingRows.value).add(index)
    const timer = flashTimers.get(index)
    if (timer !== undefined) window.clearTimeout(timer)
    flashTimers.set(
      index,
      window.setTimeout(() => {
        const rows = new Set(flashingRows.value)
        rows.delete(index)
        flashingRows.value = rows
        flashTimers.delete(index)
      }, 1400)
    )
  })
}
async function refreshState(): Promise<void> {
  const previous = state.value
  try {
    const next = await background.getBulkState()
    state.value = next
    flashCompletedRows(previous, next)
  } catch (error) {
    logger.error('[Dashboard] 读取批量状态失败:', error)
    showError()
  }
}
async function refreshUsage(): Promise<void> {
  try {
    usage.value = await background.getMapsUsage()
  } catch (error) {
    logger.error('[Dashboard] 读取额度失败:', error)
    usage.value = null
  }
}
function errorMessage(code: BulkErrorCode | null): string {
  const mapping: Record<BulkErrorCode, string> = {
    mutex: D.ERROR_MUTEX,
    'limit-tasks': D.ERROR_LIMIT_TASKS,
    'limit-items': D.ERROR_LIMIT_ITEMS,
    'empty-input': D.ERROR_EMPTY_INPUT,
    'invalid-param': D.ERROR_INVALID_PARAM,
    'not-found': D.ERROR_NOT_FOUND,
    'quota-exceeded': D.ERROR_QUOTA_EXCEEDED
  }
  return t(code === null ? D.ERROR_ACTION : mapping[code])
}
function showError(code: BulkErrorCode | null = null): void {
  showNotice(errorMessage(code), false, code)
}
function clearNotice(): void {
  if (noticeTimer !== null) window.clearTimeout(noticeTimer)
  noticeTimer = null
  notice.value = null
}
function showNotice(message: string, success = true, code: BulkErrorCode | null = null): void {
  clearNotice()
  notice.value = { message, success, code }
  noticeId.value++
  noticeRemaining = 4000
  if (success) resumeNotice()
}
function pauseNotice(): void {
  if (noticeTimer === null) return
  window.clearTimeout(noticeTimer)
  noticeTimer = null
  noticeRemaining -= performance.now() - noticeStarted
}
function resumeNotice(): void {
  if (!notice.value?.success || noticeTimer !== null) return
  noticeStarted = performance.now()
  noticeTimer = window.setTimeout(clearNotice, Math.max(0, noticeRemaining))
}
async function createTasks(startNow: boolean): Promise<void> {
  if (submitting.value) return
  submitted.value = true
  clearNotice()
  const name = draft.value.name.trim()
  const input = values.value
  if (!name || input.length === 0) {
    document.getElementById(!name ? 'db-name' : 'db-input')?.focus()
    return
  }
  if (state.value.tasks.length + taskCount.value > BULK_LIMITS.maxTasks) {
    showError('limit-tasks')
    return
  }
  submitting.value = true
  const createdIds: string[] = []
  const type = taskType.value
  const chunks = taskCount.value
  try {
    await refreshUsage()
    if (quotaExceeded.value) {
      quotaBox.value?.scrollIntoView({
        block: 'center',
        behavior: reducedMotion() ? 'auto' : 'smooth'
      })
      progressAnnouncement.value = t(D.ERROR_QUOTA_EXCEEDED)
      return
    }
    for (let offset = 0; offset < input.length; offset += MAX_ITEMS) {
      const result = await background.createBulkTask({
        name: chunks > 1 ? `${name}_${createdIds.length + 1}` : name,
        type,
        values: input.slice(offset, offset + MAX_ITEMS),
        reviewsPerStoreLimit: type === 'review-urls' ? reviewsLimit.value : null
      })
      state.value = result.state
      if (!result.ok) {
        showError(result.code)
        return
      }
      const created = result.state.tasks[result.state.tasks.length - 1]!
      createdIds.push(created.id)
      // 局部失败只保留未保存的输入，用户重试不会重复创建成功的部分。
      draft.value.items = input.slice(offset + MAX_ITEMS).join('\n')
    }
    draft.value.name = ''
    submitted.value = false
    sendMark(
      MARK_TYPE.BULK_TASK_CREATE,
      `type=${type}, count=${createdIds.length}, chunks=${chunks}, start_now=${startNow}`
    )
    if (startNow && createdIds[0]) {
      const started = await startTask(createdIds[0], true)
      if (started && chunks > 1) showNotice(t(D.SPLIT_START_HINT))
      if (!started) {
        view.value = 'history'
        if (notice.value?.code === 'mutex') showNotice(t(D.SAVED_NOT_STARTED), false, 'mutex')
      }
    } else {
      view.value = 'history'
      showNotice(t(D.TASK_SAVED, { count: createdIds.length }, createdIds.length))
    }
  } catch (error) {
    logger.error('[Dashboard] 创建任务失败:', error)
    showError()
  } finally {
    submitting.value = false
  }
}
async function startTask(taskId: string, showDetail = false): Promise<boolean> {
  clearNotice()
  try {
    const result = await background.startBulkTask({ taskId })
    state.value = result.state
    sendMark(
      MARK_TYPE.BULK_TASK_ACTION,
      `action=start, ok=${result.ok}${result.ok ? '' : `, code=${result.code ?? ''}`}`
    )
    if (!result.ok) {
      showError(result.code)
      return false
    }
    if (showDetail) {
      selectedTaskId.value = taskId
      following.value = true
      void nextTick(jumpToCurrent)
    }
    return true
  } catch (error) {
    logger.error(`[Dashboard] 启动任务失败: taskId=${taskId}`, error)
    showError()
    return false
  }
}
async function primaryAction(task: BulkTask): Promise<void> {
  if (submitting.value) return
  submitting.value = true
  clearNotice()
  try {
    if (task.status === 'running') {
      const result = await background.stopBulkTask({ taskId: task.id })
      state.value = result.state
      sendMark(MARK_TYPE.BULK_TASK_ACTION, `action=pause, ok=${result.ok}`)
      if (!result.ok) showError(result.code)
    } else await startTask(task.id)
    await refreshUsage()
  } catch (error) {
    logger.error(`[Dashboard] 暂停任务失败: taskId=${task.id}`, error)
    showError()
  } finally {
    submitting.value = false
  }
}
function leaveTask(): void {
  if (selectedTask.value?.status === 'running')
    showSuccess(t(D.KEEPS_RUNNING, { name: selectedTask.value.name }))
  showView('history')
}
async function openMenu(event: MouseEvent, task: BulkTask): Promise<void> {
  menuTaskId.value = task.id
  const button = event.currentTarget
  if (!(button instanceof HTMLElement)) return
  const rect = button.getBoundingClientRect()
  await nextTick()
  const menu = taskMenu.value!
  menu.showPopover()
  menu.style.left = `${Math.max(8, Math.min(rect.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8))}px`
  menu.style.top = `${Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - menu.offsetHeight - 8))}px`
  menu.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
}
function onMenuKey(event: KeyboardEvent): void {
  if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const buttons = [...taskMenu.value!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
  const current = buttons.findIndex(button => button === document.activeElement)
  const index =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
  buttons[index]?.focus()
}
function requestDelete(task: BulkTask): void {
  taskMenu.value?.hidePopover()
  deleteTargetId.value = task.id
  deleteDialog.value?.showModal()
}
async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value || submitting.value) return
  submitting.value = true
  try {
    const result = await background.deleteBulkTask({ taskId: deleteTarget.value.id })
    state.value = result.state
    sendMark(MARK_TYPE.BULK_TASK_ACTION, `action=delete, ok=${result.ok}`)
    deleteDialog.value?.close()
    if (!result.ok) showError(result.code)
    else {
      if (!selectedTask.value) showView('history')
      showNotice(t(D.DELETED))
    }
  } catch (error) {
    logger.error('[Dashboard] 删除任务失败:', error)
    deleteDialog.value?.close()
    showError()
  } finally {
    submitting.value = false
  }
}
function copyCount(task: BulkTask, scope: CopyScope): number {
  return scope === 'all'
    ? task.items.length
    : scope === 'completed'
      ? stats(task).complete
      : task.items.length - stats(task).complete
}
async function copyItems(task: BulkTask, scope: CopyScope): Promise<void> {
  taskMenu.value?.hidePopover()
  const copied = task.items
    .filter(
      item =>
        scope === 'all' ||
        (scope === 'completed' ? item.status === 'complete' : item.status !== 'complete')
    )
    .map(item => item.value)
  try {
    await navigator.clipboard.writeText(copied.join('\n'))
    showNotice(t(D.COPIED))
  } catch (error) {
    logger.error('[Dashboard] 复制条目失败:', error)
    showNotice(t(D.COPY_FAILED), false)
  }
}
function clearForm(): void {
  draft.value.name = ''
  draft.value.items = ''
  submitted.value = false
  clearNotice()
}
function statusText(status: BulkTaskStatus): string {
  return t(
    {
      idle: D.STATUS_IDLE,
      running: D.STATUS_RUNNING,
      paused: D.STATUS_PAUSED,
      completed: D.STATUS_COMPLETED
    }[status]
  )
}
function actionText(task: BulkTask): string {
  return t(
    {
      idle: D.ACTION_START,
      running: D.ACTION_STOP,
      paused: I18N_KEYS.MAPS_PANEL.RESUME,
      completed: D.RUN_AGAIN
    }[task.status]
  )
}
function actionIcon(task: BulkTask): IconName {
  return task.status === 'running'
    ? IconName.PAUSE
    : task.status === 'completed'
      ? IconName.REFRESH
      : IconName.PLAY
}
function itemStatusText(item: BulkTaskItem): string {
  if (item.skipReason === 'stuck') return t(D.ITEM_STUCK)
  if (item.skipReason === 'invalid-url') return t(D.ITEM_INVALID)
  if (item.status === 'running' && item.tries > 1) return t(D.ITEM_RETRYING, { count: item.tries })
  return t(
    {
      pending: D.ITEM_PENDING,
      running: D.ITEM_RUNNING,
      complete: D.ITEM_COMPLETE,
      skipped: D.SKIPPED
    }[item.status]
  )
}
function stateLine(task: BulkTask): string {
  return t(
    task.status === 'running'
      ? D.WORKING_ITEM
      : task.status === 'paused'
        ? D.PAUSED_ITEM
        : task.status === 'completed'
          ? D.FINISHED_ITEMS
          : D.READY_ITEMS,
    { index: Math.min(task.cursor + 1, task.items.length), total: task.items.length }
  )
}
function checkCurrentVisible(): void {
  const wrap = itemsWrap.value
  const row = wrap?.querySelector<HTMLTableRowElement>('tr.is-active')
  if (!wrap || !row) {
    currentVisible.value = true
    return
  }
  const box = wrap.getBoundingClientRect()
  const item = row.getBoundingClientRect()
  currentVisible.value =
    item.top >= box.top + (wrap.querySelector('thead')?.offsetHeight ?? 0) &&
    item.bottom <= box.bottom
}
function jumpToCurrent(): void {
  following.value = true
  const wrap = itemsWrap.value
  const row = wrap?.querySelector<HTMLTableRowElement>('tr.is-active')
  if (!wrap || !row) return
  const delta = row.getBoundingClientRect().top - wrap.getBoundingClientRect().top
  const head = wrap.querySelector('thead')?.offsetHeight ?? 0
  wrap.scrollTo({
    top: wrap.scrollTop + delta - head - (wrap.clientHeight - head) * 0.35,
    behavior: 'auto'
  })
  checkCurrentVisible()
}
function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    void refreshState()
    void refreshUsage()
  }
}
watch([taskType, activeView, locale, () => tasks.value.length], () => {
  void nextTick(updateIndicators)
})
// 切换任务时行下标会指向别的条目，清掉未播完的闪烁。
watch(selectedTaskId, () => {
  for (const timer of flashTimers.values()) window.clearTimeout(timer)
  flashTimers.clear()
  flashingRows.value = new Set()
})
watch(
  () => [selectedTask.value?.id, selectedTask.value?.cursor, selectedTask.value?.status],
  () => {
    void nextTick(() => {
      if (following.value) jumpToCurrent()
      else checkCurrentVisible()
    })
    if (selectedTask.value && Date.now() - lastAnnouncedAt >= 8000) {
      progressAnnouncement.value = t(D.PROGRESS_OF, {
        done: stats(selectedTask.value).done,
        total: selectedTask.value.items.length
      })
      lastAnnouncedAt = Date.now()
    }
  }
)
onMounted(async () => {
  stateSubscriber.on('mapsBulkStateChanged', () => {
    void refreshState()
  })
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('resize', updateIndicators)
  await Promise.all([refreshState(), refreshUsage()])
  selectedTaskId.value = tasks.value.find(task => task.status === 'running')?.id ?? null
  try {
    retryCount.value = (await MapsUserSettingsManager.getSettings()).stuckMaxRetry
    removeSettingsListener = MapsUserSettingsManager.onSettingsChanged(settings => {
      retryCount.value = settings.stuckMaxRetry
    })
  } catch (error) {
    logger.error('[Dashboard] 读取任务设置失败:', error)
    showError()
  }
  await document.fonts.ready
  updateIndicators()
})
onUnmounted(() => {
  for (const timer of flashTimers.values()) window.clearTimeout(timer)
  flashTimers.clear()
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('resize', updateIndicators)
  stateSubscriber.destroy()
  background.destroy()
  removeSettingsListener?.()
  clearNotice()
})
</script>
<style scoped src="./dashboard.css"></style>
