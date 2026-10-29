<!--
  任务记录 · Online 任务标签页（只读）。

  功能：
  1. 按任务编号（精确）、用户 ID、状态、创建时间范围筛选 Online 任务分页列表，支持手动刷新。
  2. 详情抽屉展示执行进度、逐采样事实与错误码。
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
        <NFormItem class="f-no" :label="t('taskRecords.jobNo')">
          <NInput
            v-model:value="filters.jobNo"
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
            data-testid="online-status-select"
          />
        </NFormItem>
        <NFormItem class="f-date" :label="t('taskRecords.createdRange')">
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
            <NButton :loading="loading" @click="loadTasks">
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
      :row-key="(row: AdminOnlineTask) => row.job_no"
      :scroll-x="1380"
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
      <NDrawerContent :title="t('taskRecords.onlineDetailTitle')" closable>
        <NSpin :show="detailLoading">
          <div v-if="detail" class="task-records-detail">
            <NDescriptions
              :column="1"
              bordered
              size="small"
              :label-placement="isMobile ? 'top' : 'left'"
            >
              <NDescriptionsItem :label="t('taskRecords.jobNo')">
                <span class="task-records-mono">{{ detail.job_no }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.runNo')">
                <span class="task-records-mono">{{ detail.run_no }}</span>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.userId')">
                <NButton text type="primary" @click="openUserInfo(detail.user_id)">
                  {{ detail.user_id }}
                </NButton>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.status')">
                <NTag :type="statusType(detail.status)" size="small">
                  {{ statusLabel(detail.status) }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.keywords')">
                {{ detail.keywords.join(", ") }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.includeContacts')">
                {{ formatBoolean(detail.include_contacts) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.exportLocale')">
                {{ detail.export_locale }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.progress')">
                {{ detail.processed_count }}/{{ detail.sample_count }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.recordCount')">
                {{ detail.record_count }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.hasFile')">
                {{ formatBoolean(detail.has_file) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.nodeName')">
                {{ detail.node_name || "-" }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.errorCode')">
                {{ formatNullableNumber(detail.error_code) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.createdAt')">
                {{ formatAdminTimeMs(detail.created_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.startedAt')">
                {{ formatAdminTimeMs(detail.started_at) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('taskRecords.finishedAt')">
                {{ formatAdminTimeMs(detail.finished_at) }}
              </NDescriptionsItem>
            </NDescriptions>

            <NDivider title-placement="left">{{ t("taskRecords.items") }}</NDivider>
            <NDataTable
              :columns="itemColumns"
              :data="detail.items"
              :row-key="(item: AdminOnlineTaskItem) => item.item_index"
              :scroll-x="660"
              :bordered="false"
              size="small"
              striped
            />
          </div>
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
  NDataTable,
  NDatePicker,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
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
  getAdminOnlineTaskDetail,
  getAdminOnlineTasks,
  type AdminOnlineTask,
  type AdminOnlineTaskDetail,
  type AdminOnlineTaskItem,
  type AdminOnlineTaskListParams,
  type AdminOnlineTaskViewport,
  type OnlineTaskStatus,
} from "@/api/task-records";
import UserInfoDialog from "@/components/UserInfoDialog.vue";
import { ADMIN_DATETIME_FORMAT, formatAdminTimeMs } from "@/utils/time";
import { useIsMobile } from "@/composables/useResponsive";

type TagType = "default" | "success" | "warning" | "error" | "info";
type DateRangeValue = [number, number] | null;

interface OnlineTaskFilters {
  /** 任务编号（精确）。 */
  jobNo: string;
  /** 用户 ID。 */
  userId: number | null;
  /** 任务状态。 */
  status: OnlineTaskStatus | null;
  /** 创建时间范围。 */
  createdRange: DateRangeValue;
}

interface UserInfoDialogExpose {
  /** 打开用户信息弹窗。 */
  open: (userId: number) => void;
}

const STATUSES: OnlineTaskStatus[] = [10, 20, 30, 40, 50, 60];

const STATUS_LABEL_KEYS: Record<OnlineTaskStatus, string> = {
  10: "taskRecords.statusQueued",
  20: "taskRecords.statusCollecting",
  30: "taskRecords.statusPublishing",
  40: "taskRecords.statusCompleted",
  50: "taskRecords.statusPartial",
  60: "taskRecords.statusFailed",
};

const STATUS_TAG_TYPES: Record<OnlineTaskStatus, TagType> = {
  10: "default",
  20: "info",
  30: "info",
  40: "success",
  50: "warning",
  60: "error",
};

const { t } = useI18n();
const message = useMessage();
const isMobile = useIsMobile();

const loading = ref(false);
const detailLoading = ref(false);
const detailVisible = ref(false);
const rows = ref<AdminOnlineTask[]>([]);
const detail = ref<AdminOnlineTaskDetail | null>(null);
const userInfoDialogRef = ref<UserInfoDialogExpose | null>(null);

const filters = reactive<OnlineTaskFilters>({
  jobNo: "",
  userId: null,
  status: null,
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

const columns = computed<DataTableColumns<AdminOnlineTask>>(() => [
  {
    title: t("taskRecords.jobNo"),
    key: "job_no",
    width: 310,
    render: (row) =>
      h(
        NEllipsis,
        { class: "task-records-mono", tooltip: true },
        { default: () => row.job_no },
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
    title: t("taskRecords.keywords"),
    key: "keywords",
    minWidth: 220,
    render: (row) =>
      h(NEllipsis, { tooltip: true }, { default: () => row.keywords.join(", ") }),
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
    title: t("taskRecords.sampleCount"),
    key: "sample_count",
    width: 90,
    align: "right",
    className: "task-records-num",
  },
  {
    title: t("taskRecords.recordCount"),
    key: "record_count",
    width: 100,
    align: "right",
    className: "task-records-num",
  },
  {
    title: t("taskRecords.createdAt"),
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
          onClick: () => openDetail(row.job_no),
        },
        {
          icon: () => h(NIcon, null, { default: () => h(EyeOutlined) }),
          default: () => t("taskRecords.view"),
        },
      ),
  },
]);

const itemColumns = computed<DataTableColumns<AdminOnlineTaskItem>>(() => [
  {
    title: t("taskRecords.itemIndex"),
    key: "item_index",
    width: 70,
    align: "right",
    className: "task-records-num",
  },
  {
    title: t("taskRecords.keyword"),
    key: "keyword",
    minWidth: 140,
    render: (item) => h(NEllipsis, { tooltip: true }, { default: () => item.keyword }),
  },
  {
    title: t("taskRecords.viewport"),
    key: "viewport",
    width: 200,
    render: (item) => formatViewport(item.viewport),
  },
  {
    title: t("taskRecords.resultCount"),
    key: "result_count",
    width: 80,
    align: "right",
    className: "task-records-num",
  },
  {
    title: t("taskRecords.completed"),
    key: "completed",
    width: 80,
    render: (item) => formatBoolean(item.completed),
  },
  {
    title: t("taskRecords.errorCode"),
    key: "error_code",
    width: 90,
    align: "right",
    className: "task-records-num",
    render: (item) => formatNullableNumber(item.error_code),
  },
]);

/** 加载 Online 任务列表。 */
async function loadTasks() {
  loading.value = true;
  try {
    const data = await getAdminOnlineTasks(buildListParams());
    rows.value = data.rows;
    pagination.itemCount = data.total;
    pagination.page = data.page;
    pagination.pageSize = data.page_size;
  } catch (error) {
    console.error("OnlineTaskRecords.loadTasks() 加载失败:", error);
    message.error(t("taskRecords.onlineLoadFailed"));
    rows.value = [];
    pagination.itemCount = 0;
  } finally {
    loading.value = false;
  }
}

defineExpose({ loadTasks });

/** 查询并回到第一页。 */
function handleSearch() {
  pagination.page = 1;
  void loadTasks();
}

/** 重置筛选条件。 */
function handleReset() {
  filters.jobNo = "";
  filters.userId = null;
  filters.status = null;
  filters.createdRange = null;
  pagination.page = 1;
  void loadTasks();
}

/** 切换页码。 */
function handlePageChange(page: number) {
  pagination.page = page;
  void loadTasks();
}

/** 切换每页数量。 */
function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  void loadTasks();
}

/** 打开详情抽屉。 */
async function openDetail(jobNo: string) {
  detailVisible.value = true;
  detailLoading.value = true;
  detail.value = null;
  try {
    detail.value = await getAdminOnlineTaskDetail(jobNo);
  } catch (error) {
    console.error(`OnlineTaskRecords.openDetail() 加载失败 job_no=${jobNo}:`, error);
    message.error(t("taskRecords.detailLoadFailed"));
  } finally {
    detailLoading.value = false;
  }
}

/** 构造列表请求参数，空筛选不下发。 */
function buildListParams(): AdminOnlineTaskListParams {
  const params: AdminOnlineTaskListParams = {
    page: pagination.page ?? 1,
    page_size: pagination.pageSize ?? 20,
  };
  const jobNo = filters.jobNo.trim();
  if (jobNo) {
    params.job_no = jobNo;
  }
  if (filters.userId !== null) {
    params.user_id = filters.userId;
  }
  if (filters.status !== null) {
    params.status = filters.status;
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

/** 状态标签文案。 */
function statusLabel(status: OnlineTaskStatus): string {
  return t(STATUS_LABEL_KEYS[status]);
}

/** 状态标签颜色。 */
function statusType(status: OnlineTaskStatus): TagType {
  return STATUS_TAG_TYPES[status];
}

/** 布尔值文案。 */
function formatBoolean(value: boolean): string {
  return value ? t("taskRecords.yes") : t("taskRecords.no");
}

/** 可空数字文案；不可得时显示占位符。 */
function formatNullableNumber(value: number | null): string {
  return value === null ? "-" : String(value);
}

/** 采样视口文案；未限定视口显示占位符。 */
function formatViewport(viewport: AdminOnlineTaskViewport | null): string {
  if (viewport === null) {
    return "-";
  }
  return t("taskRecords.viewportValue", { ...viewport });
}

onMounted(() => {
  void loadTasks();
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

.task-records-tab :deep(.task-records-num),
.task-records-detail :deep(.task-records-num) {
  font-variant-numeric: tabular-nums;
}
</style>
