<script setup lang="ts">
/**
 * 任务格：关键词预览（无搜索时为首个关键词，搜索时为首个命中项）+ 其余数量。
 * 「+n」对读屏读作「and n more」。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import type { ExportJobSummary } from '../../scripts/dashboard/api'
import { fill } from '../../scripts/dashboard/format'
import { highlightParts } from '../../scripts/dashboard/jobs'

const props = defineProps<{
  copy: DashboardContent['history']
  job: ExportJobSummary
  query: string
}>()

const keyword = computed(() => highlightParts(props.job.keyword_preview, props.query))
const more = computed(() => props.job.keyword_count - 1)
</script>

<template>
  <span class="job-kw">
    <span class="job-kw-text">{{ keyword.before }}<mark v-if="keyword.match" class="hl">{{ keyword.match }}</mark>{{ keyword.after }}</span>
    <span v-if="more > 0" class="job-kw-more">
      <span aria-hidden="true">{{ fill(props.copy.moreKeywordsShort, { count: more }) }}</span>
      <span class="sr-only">{{ ` ${fill(props.copy.moreKeywords, { count: more })}` }}</span>
    </span>
  </span>
</template>
