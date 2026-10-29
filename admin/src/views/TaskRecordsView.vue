<!--
  任务记录页面（只读）。

  Online 任务与 API/MCP 调用记录是两个独立标签页，不做混合分页或跨类型汇总。
  每次进入标签页都读取其列表；切换标签页保留各自的筛选与页码。
-->
<template>
  <div class="task-records-view">
    <NCard class="task-records-panel">
      <NTabs
        type="line"
        animated
        default-value="online"
        @update:value="handleTabChange"
      >
        <NTabPane
          name="online"
          :tab="t('taskRecords.tabOnline')"
          display-directive="show:lazy"
        >
          <OnlineTaskRecords ref="onlineRecordsRef" />
        </NTabPane>
        <NTabPane
          name="calls"
          :tab="t('taskRecords.tabCalls')"
          display-directive="show:lazy"
        >
          <ApiCallRecords ref="callRecordsRef" />
        </NTabPane>
      </NTabs>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { NCard, NTabPane, NTabs } from "naive-ui";
import ApiCallRecords from "@/components/ApiCallRecords.vue";
import OnlineTaskRecords from "@/components/OnlineTaskRecords.vue";

interface OnlineTaskRecordsExpose {
  /** 按当前筛选与页码读取 Online 任务列表。 */
  loadTasks: () => Promise<void>;
}

interface ApiCallRecordsExpose {
  /** 按当前筛选与页码读取调用记录列表。 */
  loadCalls: () => Promise<void>;
}

const { t } = useI18n();
const onlineRecordsRef = ref<OnlineTaskRecordsExpose | null>(null);
const callRecordsRef = ref<ApiCallRecordsExpose | null>(null);

/**
 * 切换事件先于新标签页挂载触发：首次进入时 ref 仍为空，由组件挂载时读取，这里不重复请求；
 * 切回已挂载的标签页时，沿用其保留的筛选与页码重新读取。
 */
function handleTabChange(name: string | number) {
  if (name === "online") {
    void onlineRecordsRef.value?.loadTasks();
  } else if (name === "calls") {
    void callRecordsRef.value?.loadCalls();
  }
}
</script>

<style scoped>
.task-records-view {
  min-width: 0;
}

.task-records-panel {
  box-shadow: var(--shadow-card);
}
</style>
