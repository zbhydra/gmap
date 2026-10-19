<template>
  <figure class="op-pv" aria-labelledby="preview-title">
    <figcaption class="op-pv-head">
      <span class="op-pv-file"
        ><Icon :key="settings.exportFormat" :name="fileIcons[settings.exportFormat]"
      /></span>
      <span class="op-pv-titles"
        ><span id="preview-title" class="op-pv-title">{{ t(I18N_KEYS.OPTIONS.PREVIEW) }}</span
        ><span class="op-pv-name mono"
          ><span class="truncate">{{ filename.slice(0, filename.lastIndexOf('.')) }}</span
          ><span class="op-pv-ext">.{{ settings.exportFormat }}</span></span
        ></span
      >
      <span class="op-pv-meta">{{
        t(I18N_KEYS.OPTIONS.PREVIEW_SAMPLE, { count: rows.length })
      }}</span>
    </figcaption>
    <div ref="previewStage" class="op-pv-stage">
      <Transition name="preview-format" mode="out-in">
        <div v-if="columns.length === 0" key="empty" class="op-pv-empty">
          <Icon :name="IconName.COLUMNS" />
          <p>{{ t(I18N_KEYS.OPTIONS.PREVIEW_EMPTY) }}</p>
        </div>
        <pre
          v-else-if="settings.exportFormat === 'json'"
          key="json"
          class="op-pv-code"
          tabindex="0"
        ><code>{{ jsonPreview }}</code></pre>
        <div
          v-else
          :key="settings.exportFormat"
          class="op-pv-grid"
          tabindex="0"
          :aria-label="t(I18N_KEYS.OPTIONS.PREVIEW)"
        >
          <table class="op-pv-table">
            <thead>
              <tr v-if="settings.exportFormat === 'xlsx'" class="op-pv-letters">
                <th></th>
                <th v-for="(column, index) in columns" :key="column.header">
                  {{ columnLetter(index) }}
                </th>
              </tr>
              <tr>
                <th v-if="settings.exportFormat === 'xlsx'" class="op-pv-index">1</th>
                <th
                  v-for="column in columns"
                  :key="column.header"
                  :data-cell="`head/${column.header}`"
                  :class="{ 'is-num': column.numeric }"
                >
                  <Icon v-if="column.pro" :name="IconName.CROWN" /><span>{{ column.header }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in rows" :key="row.placeId">
                <th v-if="settings.exportFormat === 'xlsx'" class="op-pv-index">{{ index + 2 }}</th>
                <td
                  v-for="column in columns"
                  :key="column.header"
                  :data-cell="`${index}/${column.header}`"
                  :class="{ 'is-num': column.numeric, 'is-empty': !column.value(row) }"
                  :title="column.value(row)"
                >
                  {{ column.value(row) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Transition>
    </div>
    <div
      v-if="showEmailNote || showSocialNote || settings.exportFieldHeaders.includes('Plus Code')"
      class="op-pv-notes"
    >
      <button
        v-if="showEmailNote"
        type="button"
        class="op-pv-note"
        @click="emit('jump', 'extractEmail')"
      >
        <Icon :name="IconName.MAIL" />{{ t(I18N_KEYS.OPTIONS.PREVIEW_EMAIL)
        }}<Icon :name="IconName.ARROW_UP" />
      </button>
      <button
        v-if="showSocialNote"
        type="button"
        class="op-pv-note"
        @click="emit('jump', 'extractSocialMedias')"
      >
        <Icon :name="IconName.LINK" />{{ t(I18N_KEYS.OPTIONS.PREVIEW_SOCIAL)
        }}<Icon :name="IconName.ARROW_UP" />
      </button>
      <span v-if="settings.exportFieldHeaders.includes('Plus Code')" class="op-pv-note"
        ><Icon :name="IconName.INFO" />{{ t(I18N_KEYS.OPTIONS.PREVIEW_PLUS_CODE) }}</span
      >
    </div>
  </figure>
</template>
<script setup lang="ts">
import { computed, onBeforeUpdate, onUpdated, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon, IconName } from '@/core/components/icons'
import { I18N_KEYS } from '@/core/constants/i18n'
import type { MapsUserSettings } from '@/sites/maps/settings/userSettings'
import {
  selectEnabledExportColumns,
  camelizeColumnHeader,
  buildExportJsonValue
} from '@/sites/maps/content/export/columns'
import { buildSearchExportFilename } from '@/sites/maps/content/export/csv'
import { PREVIEW_ROWS } from './preview'
const props = defineProps<{ settings: MapsUserSettings }>()
const emit = defineEmits<{ jump: [key: 'extractEmail' | 'extractSocialMedias'] }>()
const { t } = useI18n()
const fileIcons = { csv: IconName.FILE_CSV, json: IconName.FILE_JSON, xlsx: IconName.FILE_XLSX }
const previewDate = new Date()
const previewStage = ref<HTMLDivElement | null>(null)
let previousCells = new Map<string, { left: number; text: string | null }>()
onBeforeUpdate(() => {
  previousCells = new Map(
    Array.from(previewStage.value!.querySelectorAll<HTMLElement>('[data-cell]')).map(cell => [
      cell.dataset.cell!,
      { left: cell.getBoundingClientRect().left, text: cell.textContent }
    ])
  )
})
onUpdated(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const style = getComputedStyle(document.documentElement)
  const timing = {
    duration: Number.parseFloat(style.getPropertyValue('--dur-3')),
    easing: style.getPropertyValue('--ease-out').trim()
  }
  for (const cell of previewStage.value!.querySelectorAll<HTMLElement>('[data-cell]')) {
    const previous = previousCells.get(cell.dataset.cell!)
    if (!previous) {
      cell.animate(
        [
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'none' }
        ],
        timing
      )
    } else if (previous.left !== cell.getBoundingClientRect().left) {
      cell.animate(
        [
          { transform: `translateX(${previous.left - cell.getBoundingClientRect().left}px)` },
          { transform: 'none' }
        ],
        timing
      )
    } else if (previous.text !== cell.textContent) {
      cell.animate(
        [{ backgroundColor: 'var(--primary-soft)' }, { backgroundColor: 'transparent' }],
        timing
      )
    }
  }
})
const columns = computed(() => selectEnabledExportColumns(true, props.settings.exportFieldHeaders))
const rows = computed(() =>
  PREVIEW_ROWS.map(row => ({
    ...row,
    email: props.settings.extractEmail ? row.email : '',
    socialMedias: props.settings.extractSocialMedias ? row.socialMedias : ''
  }))
)
const filename = computed(() =>
  buildSearchExportFilename(
    rows.value.length,
    'coffee near Manhattan',
    previewDate,
    props.settings.exportFormat
  )
)
const jsonPreview = computed(() =>
  JSON.stringify(
    [
      Object.fromEntries(
        columns.value.map(column => [
          camelizeColumnHeader(column.header),
          buildExportJsonValue(column.value(rows.value[0]), column)
        ])
      )
    ],
    null,
    2
  )
)
const showEmailNote = computed(
  () => props.settings.exportFieldHeaders.includes('Email') && !props.settings.extractEmail
)
const showSocialNote = computed(
  () =>
    props.settings.exportFieldHeaders.includes('Social Medias') &&
    !props.settings.extractSocialMedias
)
function columnLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `A${String.fromCharCode(65 + index - 26)}`
}
</script>
<style scoped>
.op-pv {
  position: sticky;
  top: calc(var(--op-sticky-top) + var(--s-3));
  z-index: var(--z-raised);
  display: grid;
  min-width: 0;
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
}
.op-pv-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--s-3);
  padding: 10px var(--s-4);
  border-bottom: 1px solid var(--border);
}
.op-pv-file {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--r-xs);
  background: var(--primary-soft);
  color: var(--primary-text);
}
.op-pv-file .icon {
  animation: drop-in-tray var(--dur-4) var(--ease-out);
}
.op-pv-titles {
  display: grid;
  min-width: 0;
}
.op-pv-title {
  color: var(--text-2);
  font-size: var(--fs-xs);
  font-weight: 600;
}
.op-pv-name {
  display: flex;
  min-width: 0;
  font-size: var(--fs-xs);
  white-space: nowrap;
}
.op-pv-ext {
  color: var(--primary-text);
  font-weight: 600;
  flex-shrink: 0;
}
.op-pv-meta {
  color: var(--text-3);
  font-size: var(--fs-micro);
}
.op-pv-stage {
  min-width: 0;
  overflow: hidden;
}
.op-pv-grid {
  overflow-x: auto;
  overscroll-behavior-x: contain;
}
.op-pv-table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  color: var(--text-2);
  font-family: var(--font-mono);
  font-size: var(--fs-kicker);
  font-variant-numeric: tabular-nums;
}
th,
td {
  max-width: 212px;
  height: 28px;
  padding: 0 var(--s-2);
  overflow: hidden;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
th {
  background: var(--surface-2);
  color: var(--text);
  font-weight: 600;
}
th .icon {
  display: inline-block;
  width: 11px;
  height: 11px;
  margin-right: var(--s-1);
  color: var(--primary-text);
  vertical-align: middle;
}
.is-num {
  text-align: right;
}
.is-empty::before {
  display: inline-block;
  width: 14px;
  height: 2px;
  background: var(--border-2);
  border-radius: var(--r-full);
  content: '';
  vertical-align: middle;
}
.op-pv-letters th,
.op-pv-index {
  height: 22px;
  color: var(--text-2);
  text-align: center;
  font-size: var(--fs-micro);
}
.op-pv-index {
  min-width: 32px;
  position: sticky;
  left: 0;
}
.op-pv-code {
  max-height: 184px;
  padding: var(--s-3) var(--s-4);
  overflow: auto;
  background: var(--surface-2);
  color: var(--primary-text);
  font-family: var(--font-mono);
  font-size: var(--fs-kicker);
  line-height: 1.75;
}
.op-pv-empty {
  display: grid;
  place-items: center;
  align-content: center;
  gap: var(--s-2);
  min-height: 140px;
  padding: var(--s-4);
  color: var(--text-2);
  font-size: var(--fs-xs);
}
.op-pv-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: var(--s-2) var(--s-4) 10px;
  border-top: 1px solid var(--border);
}
.op-pv-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 2px 10px;
  border-radius: var(--r-full);
  background: var(--neutral-soft);
  color: var(--neutral);
  font-size: var(--fs-xs);
  line-height: 1.35;
  text-align: left;
}
.op-pv-note .icon {
  width: var(--icon-xs);
  height: var(--icon-xs);
  flex-shrink: 0;
}
button.op-pv-note:hover {
  background: var(--primary-soft);
  color: var(--primary-text);
}
.preview-format-enter-active,
.preview-format-leave-active {
  transition:
    opacity var(--dur-2),
    transform var(--dur-3) var(--ease-out);
}
.preview-format-enter-from,
.preview-format-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
@media (max-width: 640px) {
  .op-pv-meta {
    display: none;
  }
}
</style>
