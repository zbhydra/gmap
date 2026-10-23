<script setup lang="ts">
/**
 * 自定义时间范围表单：时间范围菜单与窄屏 Filters 菜单的日期子面板共用。
 *
 * 两端都含的纽约日历日，不晚于今天；开始晚于结束时 Apply 不可用（aria-disabled，浮层拦截点击）并说明原因。
 * 草稿由工具栏在每次打开菜单时重建，这里只编辑。
 */
import { computed } from 'vue'
import type { DashboardContent } from '../../i18n/schema'
import { isYmd } from '../../scripts/dashboard/format'

const props = defineProps<{
  /** 区分两个菜单里的元素 id。 */
  idPrefix: string
  copy: DashboardContent['history']['range']
  /** 今天（纽约日历日）：日期输入的上限。 */
  today: string
}>()

const emit = defineEmits<{ apply: [] }>()

const from = defineModel<string>('from', { required: true })
const to = defineModel<string>('to', { required: true })

const valid = computed(() => isYmd(from.value) && isYmd(to.value) && from.value <= to.value)
</script>

<template>
  <div class="pop-dates">
    <label>
      <span class="d-label">{{ props.copy.from }}</span>
      <input
        v-model="from"
        class="input input--sm"
        type="date"
        :max="props.today"
        :aria-describedby="`${props.idPrefix}-hint`"
        data-autofocus
      />
    </label>
    <label>
      <span class="d-label">{{ props.copy.to }}</span>
      <input v-model="to" class="input input--sm" type="date" :max="props.today" :aria-describedby="`${props.idPrefix}-hint`" />
    </label>
  </div>
  <div class="pop-foot">
    <span :id="`${props.idPrefix}-hint`" class="d-hint" :class="{ 'inline-err': !valid }">
      {{ valid ? props.copy.hint : props.copy.invalid }}
    </span>
    <button class="btn btn-primary btn-xs" type="button" :aria-disabled="valid ? undefined : 'true'" @click="emit('apply')">
      {{ props.copy.apply }}
    </button>
  </div>
</template>
