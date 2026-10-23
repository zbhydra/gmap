<script setup lang="ts">
/**
 * 任务格：主行是关键词预览（无搜索时为首个关键词，搜索时为首个命中项）+ 其余数量，
 * 次行是创建时间（ET）与任务号前 8 位。「+n」对读屏读作「and n more」。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { ExportJobSummary } from '../../scripts/dashboard/api'
import { fill, formatDateTime } from '../../scripts/dashboard/format'
import { highlightParts } from '../../scripts/dashboard/jobs'

const props = defineProps<{
  copy: DashboardContent['history']
  job: ExportJobSummary
  query: string
}>()

const keyword = computed(() => highlightParts(props.job.keyword_preview, props.query))
const more = computed(() => props.job.keyword_count - 1)
/** 任务号前缀命中：只有纯十六进制的搜索词才按任务号前缀匹配。 */
const jobNo = computed(() => {
  const needle = props.query.toLowerCase()
  const shown = props.job.job_no.slice(0, 8)
  if (!/^[0-9a-f]+$/.test(needle) || !props.job.job_no.startsWith(needle)) return { match: '', rest: shown }
  return { match: shown.slice(0, needle.length), rest: shown.slice(needle.length) }
})
</script>

<template>
  <span class="job-kw">
    <span class="job-kw-text">{{ keyword.before }}<mark v-if="keyword.match" class="hl">{{ keyword.match }}</mark>{{ keyword.after }}</span>
    <span v-if="more > 0" class="job-kw-more">
      <span aria-hidden="true">{{ fill(props.copy.moreKeywordsShort, { count: more }) }}</span>
      <span class="sr-only">{{ ` ${fill(props.copy.moreKeywords, { count: more })}` }}</span>
    </span>
  </span>
  <span class="job-sub">
    <span class="job-time">{{ formatDateTime(props.job.created_at) }} {{ props.copy.timezone }}</span>
    <span class="job-no"><span class="sr-only">{{ props.copy.columns.taskNo }} </span><mark v-if="jobNo.match" class="hl">{{ jobNo.match }}</mark>{{ jobNo.rest }}…</span>
  </span>
</template>
