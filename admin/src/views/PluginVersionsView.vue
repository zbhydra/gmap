<template>
  <NCard :title="t('layout.pluginVersions')">
    <div class="versions-toolbar">
      <NFormItem :label="t('pluginVersions.plugin')" :show-feedback="false">
        <NSelect
          v-model:value="pluginFilter"
          class="plugin-filter"
          :options="filterOptions"
          :disabled="loading"
          :input-props="{ 'aria-label': t('pluginVersions.filter') }"
          @update:value="handleFilterChange"
        />
      </NFormItem>
      <NSpace>
        <NButton :loading="loading" @click="loadVersions">
          {{ t("common.refresh") }}
        </NButton>
        <NButton type="primary" @click="openEditor()">
          {{ t("pluginVersions.add") }}
        </NButton>
      </NSpace>
    </div>
    <NDataTable
      :columns="columns"
      :data="rows"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: PluginVersion) => row.id"
      :scroll-x="1100"
      :bordered="false"
      remote
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    >
      <template #empty>{{ t("common.noData") }}</template>
    </NDataTable>
  </NCard>

  <NModal
    :show="draft !== null"
    preset="card"
    class="version-modal"
    :title="t(editingId === null ? 'pluginVersions.add' : 'pluginVersions.edit')"
    :mask-closable="!saving"
    :close-on-esc="!saving"
    :closable="!saving"
    @update:show="closeEditor"
  >
    <NForm
      v-if="draft"
      ref="formRef"
      :model="draft"
      :rules="rules"
      :disabled="saving"
      label-placement="top"
      @submit.prevent="saveVersion"
    >
      <NFormItem :label="t('pluginVersions.plugin')" path="plugin">
        <NSelect
          v-model:value="draft.plugin"
          :options="pluginOptions"
          :disabled="editingId !== null || saving"
          :input-props="{ 'aria-label': t('pluginVersions.plugin') }"
        />
      </NFormItem>
      <NFormItem :label="t('pluginVersions.version')" path="version">
        <NInput
          v-model:value="draft.version"
          :readonly="editingId !== null"
          :maxlength="32"
          :placeholder="t('pluginVersions.versionPlaceholder')"
          :input-props="{ 'aria-label': t('pluginVersions.version') }"
        />
      </NFormItem>
      <NFormItem :label="t('pluginVersions.updateUrl')" path="update_url">
        <NInput
          v-model:value="draft.update_url"
          :maxlength="1000"
          :placeholder="t('pluginVersions.urlPlaceholder')"
          :input-props="{ 'aria-label': t('pluginVersions.updateUrl') }"
        />
      </NFormItem>
      <NFormItem v-if="editingId === null" :label="t('pluginVersions.status')">
        <NSwitch v-model:value="draft.is_enabled" :aria-label="t('pluginVersions.enabled')" />
        <span class="status-label">{{ statusLabel(draft.is_enabled) }}</span>
      </NFormItem>
      <NSpace justify="end">
        <NButton :disabled="saving" @click="closeEditor(false)">{{ t("common.cancel") }}</NButton>
        <NButton type="primary" attr-type="submit" :loading="saving">
          {{ t("pluginVersions.save") }}
        </NButton>
      </NSpace>
    </NForm>
  </NModal>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  NButton,
  NCard,
  NDataTable,
  NEllipsis,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  useDialog,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
  type PaginationProps,
} from "naive-ui";
import {
  createPluginVersion,
  getPluginVersions,
  updatePluginVersion,
  type Plugin,
  type PluginVersion,
  type PluginVersionCreate,
} from "@/api/plugin-versions";
import { BusinessError } from "@/api/request";
import { formatAdminTimeMs } from "@/utils/time";

const { t } = useI18n();
const message = useMessage();
const dialog = useDialog();
const loading = ref(false);
const saving = ref(false);
const changingStatus = ref(false);
const rows = ref<PluginVersion[]>([]);
const pluginFilter = ref<Plugin | "">("");
const page = reactive({ page: 1, pageSize: 20, itemCount: 0 });
const draft = ref<PluginVersionCreate | null>(null);
const editingId = ref<number | null>(null);
const formRef = ref<FormInst | null>(null);

const pluginOptions = computed(() => [
  { label: t("pluginVersions.maps"), value: "maps" },
  { label: t("pluginVersions.bing"), value: "bing" },
]);
const filterOptions = computed(() => [
  { label: t("pluginVersions.allPlugins"), value: "" },
  ...pluginOptions.value,
]);
const pagination = computed<PaginationProps>(() => ({
  ...page,
  disabled: loading.value,
  showSizePicker: true,
  pageSizes: [20, 50, 100].map((value) => ({
    label: t("pluginVersions.pageSize", { count: value }),
    value,
  })),
}));
const rules = computed<FormRules>(() => ({
  plugin: { required: true, message: t("pluginVersions.pluginRequired"), trigger: "change" },
  version: {
    required: true,
    trigger: "blur",
    validator: (_rule, value: string) =>
      /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/.test(value.trim()) ||
      new Error(t("pluginVersions.versionInvalid")),
  },
  update_url: {
    required: true,
    trigger: "blur",
    validator: (_rule, value: string) => {
      try {
        const url = new URL(value.trim());
        if (url.protocol === "http:" || url.protocol === "https:") return true;
      } catch {
        /* 格式错误由表单统一展示。 */
      }
      return new Error(t("pluginVersions.urlInvalid"));
    },
  },
}));

const columns = computed<DataTableColumns<PluginVersion>>(() => [
  {
    title: t("pluginVersions.plugin"),
    key: "plugin",
    width: 150,
    render: (row) => t(`pluginVersions.${row.plugin}`),
  },
  { title: t("pluginVersions.version"), key: "version", width: 110 },
  {
    title: t("pluginVersions.status"),
    key: "is_enabled",
    width: 100,
    render: (row) =>
      h(
        NTag,
        { size: "small", type: row.is_enabled ? "success" : "error" },
        { default: () => statusLabel(row.is_enabled) },
      ),
  },
  {
    title: t("pluginVersions.recommended"),
    key: "is_recommended",
    width: 110,
    render: (row) =>
      row.is_recommended
        ? h(
            NTag,
            { size: "small", type: "info" },
            { default: () => t("pluginVersions.recommended") },
          )
        : "-",
  },
  {
    title: t("pluginVersions.updateUrl"),
    key: "update_url",
    minWidth: 260,
    render: (row) => h(NEllipsis, { tooltip: true }, { default: () => row.update_url }),
  },
  {
    title: t("pluginVersions.createdAt"),
    key: "created_at",
    width: 170,
    render: (row) => formatAdminTimeMs(row.created_at),
  },
  {
    title: t("pluginVersions.actions"),
    key: "actions",
    width: 190,
    render: (row) =>
      h(
        NSpace,
        { size: "small" },
        {
          default: () => [
            h(
              NButton,
              { size: "small", disabled: changingStatus.value, onClick: () => openEditor(row) },
              { default: () => t("pluginVersions.edit") },
            ),
            h(
              NButton,
              {
                size: "small",
                type: row.is_enabled ? "error" : "default",
                disabled: changingStatus.value,
                onClick: () => changeStatus(row),
              },
              {
                default: () =>
                  t(row.is_enabled ? "pluginVersions.disable" : "pluginVersions.enable"),
              },
            ),
          ],
        },
      ),
  },
]);

function statusLabel(enabled: boolean) {
  return t(enabled ? "pluginVersions.enabled" : "pluginVersions.disabled");
}

async function loadVersions() {
  loading.value = true;
  try {
    const data = await getPluginVersions({
      page: page.page,
      page_size: page.pageSize,
      ...(pluginFilter.value ? { plugin: pluginFilter.value } : {}),
    });
    rows.value = data.rows;
    page.itemCount = data.total;
    page.page = data.page;
    page.pageSize = data.page_size;
  } catch {
    rows.value = [];
    page.itemCount = 0;
    message.error(t("pluginVersions.loadFailed"));
  } finally {
    loading.value = false;
  }
}

function handleFilterChange() {
  page.page = 1;
  void loadVersions();
}

function handlePageChange(value: number) {
  page.page = value;
  void loadVersions();
}

function handlePageSizeChange(value: number) {
  page.pageSize = value;
  handleFilterChange();
}

function openEditor(row?: PluginVersion) {
  editingId.value = row?.id ?? null;
  draft.value = {
    plugin: row?.plugin ?? (pluginFilter.value || "maps"),
    version: row?.version ?? "",
    update_url: row?.update_url ?? "",
    is_enabled: row?.is_enabled ?? true,
  };
}

function closeEditor(show: boolean) {
  if (!show && !saving.value) draft.value = null;
}

async function saveVersion() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  if (!draft.value || saving.value) return;
  saving.value = true;
  try {
    const data = {
      ...draft.value,
      version: draft.value.version.trim(),
      update_url: draft.value.update_url.trim(),
    };
    if (editingId.value === null) {
      await createPluginVersion(data);
      pluginFilter.value = data.plugin;
      page.page = 1;
    } else {
      await updatePluginVersion(editingId.value, { update_url: data.update_url });
    }
    draft.value = null;
    message.success(t("pluginVersions.saved"));
    await loadVersions();
  } catch (error) {
    message.error(
      t(
        editingId.value === null && error instanceof BusinessError && error.code === 400
          ? "pluginVersions.duplicate"
          : "pluginVersions.saveFailed",
      ),
    );
  } finally {
    saving.value = false;
  }
}

function changeStatus(row: PluginVersion) {
  if (!row.is_enabled) {
    void saveStatus(row, true);
    return;
  }
  const confirmation = dialog.warning({
    title: t("pluginVersions.disableTitle", {
      plugin: t(`pluginVersions.${row.plugin}`),
      version: row.version,
    }),
    content:
      t("pluginVersions.disableImpact") +
      " " +
      t(row.is_recommended ? "pluginVersions.noUpgradeTarget" : "pluginVersions.hasUpgradeTarget"),
    positiveText: t("pluginVersions.disable"),
    negativeText: t("common.cancel"),
    positiveButtonProps: { type: "error" },
    maskClosable: false,
    onPositiveClick: async () => {
      confirmation.loading = true;
      const saved = await saveStatus(row, false);
      confirmation.loading = false;
      return saved;
    },
  });
}

async function saveStatus(row: PluginVersion, enabled: boolean) {
  changingStatus.value = true;
  try {
    await updatePluginVersion(row.id, { is_enabled: enabled });
    message.success(t(enabled ? "pluginVersions.enableSuccess" : "pluginVersions.disableSuccess"));
    await loadVersions();
    return true;
  } catch {
    message.error(t("pluginVersions.saveFailed"));
    return false;
  } finally {
    changingStatus.value = false;
  }
}

onMounted(loadVersions);
</script>

<style scoped>
.versions-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.plugin-filter {
  width: 200px;
}
.version-modal {
  width: min(560px, calc(100% - 32px));
}
.status-label {
  margin-left: 8px;
}
</style>
