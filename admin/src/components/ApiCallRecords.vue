<!--
  任务记录 · API/MCP 调用记录标签页（只读）。

  功能：
  1. 按请求编号（精确）、用户 ID、状态、来源、操作、开始时间范围筛选调用记录分页列表，支持手动刷新。
  2. 详情抽屉原样展示业务参数与摘要 JSON，以及错误码和耗时。
  3. 用户 ID 打开通用 UserInfoDialog；无任何写操作。
-->
<template>
  <div class="task-records-tab">
    <NForm
      :label-placement="isMobile ? 'top' : 'left'"
      :label-width="isMobile ? undefined : 92"
      :show-feedback="false"
      class="task-records-filter"
    >
      <div class="task-records-filter-bar">
        <NFormItem class="f-no" :label="t('taskRecords.requestId')">
          <NInput
            v-model:value="filters.requestId"
            clearable
            :placeholder="t('taskRecords.recordNoPlaceholder')"
            @keydown.enter="handleSearch"
          />
        </NFormItem>
        <NFormItem class="f-id" :label="t('taskRecords.userId')">
          <NInputNumber
            v-model:value="filters.userId"
            clearable
            :min="1"
            :precision="0"
            :placeholder="t('taskRecords.userIdPlaceholder')"
            style="width: 100%"
            @keydown.enter="handleSearch"
          />
        </NFormItem>
        <NFormItem class="f-select" :label="t('taskRecords.status')">
          <NSelect
            v-model:value="filters.status"
            clearable
            :options="statusOptions"
            data-testid="call-status-select"
          />
        </NFormItem>
        <NFormItem class="f-select" :label="t('taskRecords.source')">
          <NSelect
            v-model:value="filters.source"
            clearable
            :options="sourceOptions"
            data-testid="call-source-select"
          />
        </NFormItem>
        <NFormItem class="f-select" :label="t('taskRecords.operation')">
          <NSelect
            v-model:value="filters.operation"
            clearable
            :options="operationOptions"
            data-testid="call-operation-select"
          />
        </NFormItem>
        <NFormItem class="f-date" :label="t('taskRecords.startedRange')">
          <NDatePicker
            v-model:value="filters.createdRange"
            type="datetimerange"
            clearable
            :format="ADMIN_DATETIME_FORMAT"
            style="width: 100%"
          />
        </NFormItem>
        <div class="task-records-filter-actions">
          <NSpace :size="8">
            <NButton type="primary" :loading="loading" @click="handleSearch">
              <template #icon>
                <NIcon>
                  <SearchOutlined />
                </NIcon>
              </template>
              {{ t("taskRecords.search") }}
            </NButton>
            <NButton @click="handleReset">
              {{ t("taskRecords.reset") }}
            </NButton>
            <NButton :loading="loading" @click="loadCalls">
              <template #icon>
                <NIcon>
                  <ReloadOutlined />
                </NIcon>
              </template>
              {{ t("common.refresh") }}
            </NButton>
          </NSpace>
        </div>
      </div>
    </NForm>

    <NDataTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: AdminApiCall) => row.request_id"
      :scroll-x="1270"
      :bordered="false"
      striped
      remote
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />

    <NDrawer
      v-model:show="detailVisible"
      :width="isMobile ? '100%' : 720"
      placement="right"
    >
      <NDrawerContent :title="t('taskRecords.callDetailTitle')" closable>
        <NSpin :show="detailLoading">
          <NDescriptions
            v-if="detail"
            :column="1"
            bordered
            size="small"
            :label-placement="isMobile ? 'top' : 'left'"
          >
            <NDescriptionsItem :label="t('taskRecords.requestId')">
              <span class="task-records-mono">{{ detail.request_id }}</span>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.userId')">
              <NButton text type="primary" @click="openUserInfo(detail.user_id)">
                {{ detail.user_id }}
              </NButton>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.source')">
              {{ sourceLabel(detail.source) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.operation')">
              {{ operationLabel(detail.operation) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.status')">
              <NTag :type="statusType(detail.status)" size="small">
                {{ statusLabel(detail.status) }}
              </NTag>
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.recordCount')">
              {{ formatNullableNumber(detail.record_count) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.errorCode')">
              {{ formatNullableNumber(detail.error_code) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.startedAt')">
              {{ formatAdminTimeMs(detail.created_at) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.finishedAt')">
              {{ formatAdminTimeMs(detail.finished_at) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.duration')">
              {{ formatDuration(detail) }}
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.params')">
              <NCode :code="formatJson(detail.params)" language="json" word-wrap />
            </NDescriptionsItem>
            <NDescriptionsItem :label="t('taskRecords.summary')">
              <NCode :code="formatJson(detail.summary)" language="json" word-wrap />
            </NDescriptionsItem>
          </NDescriptions>
        </NSpin>
      </NDrawerContent>
    </NDrawer>

    <UserInfoDialog ref="userInfoDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NCode,
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDrawer,
  NDrawerContent,
  NEllipsis,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NSpin,
  NTag,
  useMessage,
  type DataTableColumns,
  type PaginationProps,
  type SelectOption,
} from "naive-ui";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@vicons/antd";
import {
  getAdminApiCallDetail,
  getAdminApiCalls,
  type AdminApiCall,
  type AdminApiCallDetail,
  type AdminApiCallListParams,
  type ApiCallOperation,
  type ApiCallSource,
  type ApiCallStatus,
} from "@/api/task-records";
import type { JsonObject } from "@/api/orders";
import UserInfoDialog from "@/components/UserInfoDialog.vue";
import { ADMIN_DATETIME_FORMAT, formatAdminTimeMs } from "@/utils/time";
import { useIsMobile } from "@/composables/useResponsive";

type TagType = "default" | "success" | "warning" | "error" | "info";
type DateRangeValue = [number, number] | null;

interface ApiCallFilters {
  /** 请求编号（精确）。 */
  requestId: string;
  /** 用户 ID。 */
  userId: number | null;
  /** 调用状态。 */
  status: ApiCallStatus | null;
  /** 调用来源。 */
  source: ApiCallSource | null;
  /** 调用操作。 */
  operation: ApiCallOperation | null;
  /** 开始时间范围。 */
  createdRange: DateRangeValue;
}

interface UserInfoDialogExpose {
  /** 打开用户信息弹窗。 */
  open: (userId: number) => void;
}

const STATUSES: ApiCallStatus[] = [20, 40, 50, 60];
const SOURCES: ApiCallSource[] = [2, 3];
const OPERATIONS: ApiCallOperation[] = [1, 2, 3];

const STATUS_LABEL_KEYS: Record<ApiCallStatus, string> = {
  20: "taskRecords.statusProcessing",
  40: "taskRecords.statusCompleted",
  50: "taskRecords.statusPartial",
  60: "taskRecords.statusFailed",
};

const STATUS_TAG_TYPES: Record<ApiCallStatus, TagType> = {
  20: "info",
  40: "success",
  50: "warning",
  60: "error",
};

const SOURCE_LABEL_KEYS: Record<ApiCallSource, string> = {
  2: "taskRecords.sourceApi",
  3: "taskRecords.sourceMcp",
};

const OPERATION_LABEL_KEYS: Record<ApiCallOperation, string> = {
  1: "taskRecords.operationSearch",
  2: "taskRecords.operationReviews",
  3: "taskRecords.operationPhotos",
};

const { t } = useI18n();
const message = useMessage();
const isMobile = useIsMobile();

const loading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const rows = ref<AdminApiCall[]>([]);
const detail = ref<AdminApiCallDetail | null>(null);
const userInfoDialogRef = ref<UserInfoDialogExpose | null>(null);

const filters = reactive<ApiCallFilters>({
  requestId: "",
  userId: null,
  status: null,
  source: null,
  operation: null,
  createdRange: null,
});

const pagination = reactive<PaginationProps>({
  page: 1,
  pageSize: 20,
  itemCount: 0,
  pageSizes: [20, 50, 100],
  showSizePicker: true,
});

const statusOptions = computed<SelectOption[]>(() =>
  STATUSES.map((value) => ({ label: statusLabel(value), value })),
);

const sourceOptions = computed<SelectOption[]>(() =>
  SOURCES.map((value) => ({ label: sourceLabel(value), value })),
);

const operationOptions = computed<SelectOption[]>(() =>
  OPERATIONS.map((value) => ({ label: operationLabel(value), value })),
);

const columns = computed<DataTableColumns<AdminApiCall>>(() => [
  {
    title: t("taskRecords.requestId"),
    key: "request_id",
    width: 310,
    render: (row) =>
      h(
        NEllipsis,
        { class: "task-records-mono", tooltip: true },
        { default: () => row.request_id },
      ),
  },
  {
    title: t("taskRecords.userId"),
    key: "user_id",
    width: 110,
    render: (row) =>
      h(
        NButton,
        { text: true, type: "primary", onClick: () => openUserInfo(row.user_id) },
        { default: () => row.user_id },
      ),
  },
  {
    title: t("taskRecords.source"),
    key: "source",
    width: 90,
    render: (row) => sourceLabel(row.source),
  },
  {
    title: t("taskRecords.operation"),
    key: "operation",
    width: 110,
    render: (row) => operationLabel(row.operation),
  },
  {
    title: t("taskRecords.status"),
    key: "status",
    width: 110,
    render: (row) =>
      h(
        NTag,
        { type: statusType(row.status), size: "small" },
        { default: () => statusLabel(row.status) },
      ),
  },
  {
    title: t("taskRecords.recordCount"),
    key: "record_count",
    width: 100,
    align: "right",
    className: "task-records-num",
    render: (row) => formatNullableNumber(row.record_count),
  },
  {
    title: t("taskRecords.startedAt"),
    key: "created_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.created_at),
  },
  {
    title: t("taskRecords.finishedAt"),
    key: "finished_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.finished_at),
  },
  {
    title: t("taskRecords.actions"),
    key: "actions",
    width: 100,
    fixed: "right",
    render: (row) =>
      h(
        NButton,
        {
          size: "small",
          tertiary: true,
          onClick: () => openDetail(row.request_id),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(EyeOutlined) }),
          default: () => t("taskRecords.view"),
        },
      ),
  },
]);

/** 加载调用记录列表。 */
async function loadCalls() {
  loading.value = true;
  try {
    const data = await getAdminApiCalls(buildListParams());
    rows.value = data.rows;
    pagination.itemCount = data.total;
    pagination.page = data.page;
    pagination.pageSize = data.page_size;
  } catch (error) {
    console.error("ApiCallRecords.loadCalls() 加载失败:", error);
    message.error(t("taskRecords.callsLoadFailed"));
    rows.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

defineExpose({ loadCalls });

/** 查询并回到第一页。 */
function handleSearch() {
  pagination.page = 1;
  void loadCalls();
}

/** 重置筛选条件。 */
function handleReset() {
  filters.requestId = "";
  filters.userId = null;
  filters.status = null;
  filters.source = null;
  filters.operation = null;
  filters.createdRange = null;
  pagination.page = 1;
  void loadCalls();
}

/** 切换页码。 */
function handlePageChange(page: number) {
  pagination.page = page;
  void loadCalls();
}

/** 切换每页数量。 */
function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  void loadCalls();
}

/** 打开详情抽屉。 */
async function openDetail(requestId: string) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    detail.value = await getAdminApiCallDetail(requestId);
  } catch (error) {
    console.error(`ApiCallRecords.openDetail() 加载失败 request_id=${requestId}:`, error);
    message.error(t("taskRecords.detailLoadFailed"));
  } finally {
    detailLoading.value = false;
  }
}

/** 构造列表请求参数，空筛选不下发。 */
function buildListParams(): AdminApiCallListParams {
  const params: AdminApiCallListParams = {
    page: pagination.page ?? 1,
    page_size: pagination.pageSize ?? 20,
  };
  const requestId = filters.requestId.trim();
  if (requestId) {
    params.request_id = requestId;
  }
  if (filters.userId !== null) {
    params.user_id = filters.userId;
  }
  if (filters.status !== null) {
    params.status = filters.status;
  }
  if (filters.source !== null) {
    params.source = filters.source;
  }
  if (filters.operation !== null) {
    params.operation = filters.operation;
  }
  if (filters.createdRange) {
    const [fromMs, toMs] = filters.createdRange;
    params.created_from_ms = fromMs;
    params.created_to_ms = toMs;
  }
  return params;
}

/** 打开通用用户信息弹窗。 */
function openUserInfo(userId: number) {
  userInfoDialogRef.value?.open(userId);
}

/** 状态标签文案；调用记录的 20 是同步处理中。 */
function statusLabel(status: ApiCallStatus): string {
  return t(STATUS_LABEL_KEYS[status]);
}

/** 状态标签颜色。 */
function statusType(status: ApiCallStatus): TagType {
  return STATUS_TAG_TYPES[status];
}

/** 来源文案。 */
function sourceLabel(source: ApiCallSource): string {
  return t(SOURCE_LABEL_KEYS[source]);
}

/** 操作文案。 */
function operationLabel(operation: ApiCallOperation): string {
  return t(OPERATION_LABEL_KEYS[operation]);
}

/** 可空数字文案；不可得时显示占位符。 */
function formatNullableNumber(value: number | null): string {
  return value === null ? "-" : String(value);
}

/** 耗时由结束与开始时间相减；处理中尚无结束时间，显示占位符。 */
function formatDuration(call: AdminApiCall): string {
  if (call.finished_at === null) {
    return "-";
  }
  return t("taskRecords.durationValue", { value: call.finished_at - call.created_at });
}

/** 参数与摘要原样格式化为 JSON；摘要为 null 时显示占位符。 */
function formatJson(value: JsonObject | null): string {
  return value === null ? "-" : JSON.stringify(value, null, 2);
}

onMounted(() => {
  void loadCalls();
});
</script>

<style scoped>
.task-records-tab {
  min-width: 0;
}

.task-records-filter {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.task-records-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: center;
}

.task-records-filter :deep(.n-form-item-label) {
  color: var(--text-2);
  font-size: 14px;
  line-height: 1.6;
  white-space: nowrap;
}

.task-records-filter :deep(.n-form-item-blank) {
  min-width: 0;
}

/* 宽度含左置 label；窄内容区收缩为整行宽，避免撑破卡片 */
.f-no {
  width: min(400px, 100%);
}

.f-id {
  width: min(250px, 100%);
}

.f-select {
  width: min(264px, 100%);
}

.f-date {
  width: min(500px, 100%);
}

.task-records-filter-actions {
  margin-left: auto;
}

/* 表格单元由 NDataTable 渲染、详情在抽屉中传送到 body，两处都要覆盖 */
.task-records-mono,
.task-records-tab :deep(.task-records-mono) {
  font-family: var(--font-mono);
}

.task-records-tab :deep(.task-records-num) {
  font-variant-numeric: tabular-nums;
}
</style>
