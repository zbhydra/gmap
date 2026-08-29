<!--
  系统设置页面。

  功能：
  1. 刷新当前业务进程内配置读取缓存，并展示刷新时间和服务列表。
  2. 查询、生成和重新生成当前管理员外部 API Key；完整 key 仅在弹窗中一次性展示。
  3. 编辑 Google 数据采集配置，查询授权状态，发起授权、断开授权和手动采集。
  4. 读取和保存 Telegram DOM 全局稀疏覆盖对象。
  5. 读取和保存新版扩展使用的 Telegram 全局稀疏配置对象。
-->
<template>
  <div class="system-settings-view">
    <NCard>
      <NTabs v-model:value="activeTab" type="segment" animated>
        <NTabPane
          name="config-cache"
          :tab="t('systemSettings.tabConfigCache')"
        >
          <section>
            <div class="tab-actions">
              <NButton
                type="primary"
                :loading="refreshingCache"
                @click="handleRefreshConfigCache"
              >
                {{ t("systemSettings.refreshConfigCache") }}
              </NButton>
            </div>

          <NAlert
            v-if="cacheRefreshResult"
            class="result-alert"
            type="success"
            :title="t('systemSettings.cacheRefreshSuccess')"
          >
            <NSpace vertical size="small">
              <NText>
                {{ t("systemSettings.refreshedAt") }}:
                {{ formatTime(cacheRefreshResult.refreshed_at) }}
              </NText>
              <NText>
                {{ t("systemSettings.refreshedServiceCount", {
                  count: cacheRefreshResult.refreshed_services.length,
                }) }}
              </NText>
              <NList
                v-if="cacheRefreshResult.refreshed_services.length > 0"
                size="small"
                bordered
              >
                <NListItem
                  v-for="service in cacheRefreshResult.refreshed_services"
                  :key="service"
                >
                  <code>{{ service }}</code>
                </NListItem>
              </NList>
            </NSpace>
          </NAlert>
          </section>
        </NTabPane>

        <NTabPane
          name="api-key"
          :tab="t('systemSettings.tabApiKey')"
        >
          <section>
            <div class="tab-actions">
              <NButton
                type="primary"
                ghost
                :loading="generatingApiKey"
                :disabled="!canGenerateApiKey"
                @click="handleGenerateApiKey"
              >
                {{ apiKeyMeta && apiKeyMeta.has_api_key
                  ? t("systemSettings.regenerateApiKey")
                  : t("systemSettings.generateApiKey") }}
              </NButton>
            </div>

          <NAlert
            v-if="showApiKeyUnknownAlert"
            class="unknown-alert"
            type="warning"
            :title="t('systemSettings.apiKeyUnknownTitle')"
          >
            <NSpace vertical size="small">
              <NText>{{ t("systemSettings.apiKeyUnknownDescription") }}</NText>
              <NButton size="small" :loading="apiKeyLoading" @click="loadApiKeyMeta">
                {{ t("common.refresh") }}
              </NButton>
            </NSpace>
          </NAlert>

          <NSpin :show="apiKeyLoading">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
            >
              <NDescriptionsItem :label="t('systemSettings.apiKeyStatus')">
                <NTag :type="apiKeyMeta?.has_api_key ? 'success' : 'default'">
                  {{ apiKeyMeta?.has_api_key
                    ? t("systemSettings.generated")
                    : t("systemSettings.notGenerated") }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.apiKeyPrefix')">
                <code>{{ apiKeyMeta?.api_key_prefix || "-" }}</code>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.apiKeyCreatedAt')">
                {{ formatTime(apiKeyMeta?.api_key_created_at ?? null) }}
              </NDescriptionsItem>
            </NDescriptions>
          </NSpin>
          </section>
        </NTabPane>

        <NTabPane
          name="google-data"
          :tab="t('systemSettings.tabGoogleData')"
        >
          <section>
          <NAlert
            class="window-policy-alert"
            type="info"
            :title="t('systemSettings.googleDataWindowPolicyTitle')"
          >
            {{ t("systemSettings.googleDataWindowPolicyDescription") }}
          </NAlert>

          <NForm
            class="google-data-config-form"
            label-placement="top"
            :disabled="googleDataSaving"
          >
            <div class="google-data-config-grid">
              <NFormItem :label="t('systemSettings.googleDataClientId')">
                <NInput
                  v-model:value="googleDataConfigForm.client_id"
                  :placeholder="t('systemSettings.googleDataClientIdPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="t('systemSettings.googleDataClientSecret')">
                <NInput
                  v-model:value="googleDataConfigForm.client_secret"
                  type="password"
                  show-password-on="click"
                  :placeholder="clientSecretPlaceholder"
                />
              </NFormItem>
              <NFormItem :label="t('systemSettings.googleDataGscSiteUrl')">
                <NInput
                  v-model:value="googleDataConfigForm.gsc_site_url"
                  :placeholder="t('systemSettings.googleDataGscSiteUrlPlaceholder')"
                />
              </NFormItem>
              <NFormItem :label="t('systemSettings.googleDataGa4PropertyId')">
                <NInput
                  v-model:value="googleDataConfigForm.ga4_property_id"
                  :placeholder="t('systemSettings.googleDataGa4PropertyIdPlaceholder')"
                />
              </NFormItem>
            </div>
            <div class="form-actions">
              <NSpace size="small" justify="end">
                <NButton
                  type="primary"
                  :loading="googleDataSaving"
                  @click="handleSaveGoogleDataConfig"
                >
                  {{ t("systemSettings.saveGoogleDataConfig") }}
                </NButton>
                <NButton
                  v-if="!googleDataAuthorized"
                  type="primary"
                  ghost
                  :loading="googleDataAuthorizing"
                  :disabled="!canAuthorizeGoogleData"
                  @click="handleAuthorizeGoogleData"
                >
                  {{ t("systemSettings.authorizeGoogleData") }}
                </NButton>
                <template v-else>
                  <NButton
                    type="primary"
                    ghost
                    :loading="googleDataAuthorizing"
                    :disabled="!canAuthorizeGoogleData"
                    @click="handleAuthorizeGoogleData"
                  >
                    {{ t("systemSettings.reauthorizeGoogleData") }}
                  </NButton>
                  <NButton
                    type="error"
                    ghost
                    :loading="googleDataDisconnecting"
                    :disabled="!canDisconnectGoogleData"
                    @click="handleDisconnectGoogleData"
                  >
                    {{ t("systemSettings.disconnectGoogleData") }}
                  </NButton>
                  <NButton
                    type="primary"
                    :loading="googleDataCollecting"
                    :disabled="!canCollectGoogleData"
                    @click="handleCollectGoogleDataOnce"
                  >
                    {{ t("systemSettings.collectGoogleDataOnce") }}
                  </NButton>
                </template>
              </NSpace>
            </div>
          </NForm>

          <NAlert
            v-if="showGoogleDataUnknownAlert"
            class="unknown-alert"
            type="warning"
            :title="t('systemSettings.googleDataUnknownTitle')"
          >
            <NSpace vertical size="small">
              <NText>{{ t("systemSettings.googleDataUnknownDescription") }}</NText>
              <NButton
                size="small"
                :loading="googleDataLoading"
                @click="loadGoogleDataStatus"
              >
                {{ t("common.refresh") }}
              </NButton>
            </NSpace>
          </NAlert>

          <NAlert
            v-if="showGoogleDataConfigAlert"
            class="unknown-alert"
            type="warning"
            :title="t('systemSettings.googleDataConfigMissingTitle')"
          >
            {{ t("systemSettings.googleDataConfigMissingDescription") }}
          </NAlert>

          <NSpin :show="googleDataLoading">
            <NDescriptions
              label-placement="left"
              :column="1"
              bordered
              size="small"
            >
              <NDescriptionsItem :label="t('systemSettings.googleDataConfigStatus')">
                <NTag :type="googleDataStatus === null ? 'default' : googleDataConfigured ? 'success' : 'warning'">
                  {{ googleDataStatus === null
                    ? "-"
                    : googleDataConfigured
                      ? t("systemSettings.configured")
                      : t("systemSettings.notConfigured") }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataAuthStatus')">
                <NTag :type="googleDataAuthorized ? 'success' : 'default'">
                  {{ googleDataStatus === null
                    ? "-"
                    : googleDataAuthorized
                      ? t("systemSettings.authorized")
                      : t("systemSettings.notAuthorized") }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataClientId')">
                <code>{{ googleDataStatus?.client_id || "-" }}</code>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataClientSecret')">
                <NTag
                  :type="googleDataStatus?.client_secret_configured ? 'success' : 'default'"
                >
                  {{ googleDataStatus?.client_secret_configured
                    ? t("systemSettings.configured")
                    : t("systemSettings.notConfigured") }}
                </NTag>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataGscSiteUrl')">
                <code>{{ googleDataStatus?.gsc_site_url || "-" }}</code>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataGa4PropertyId')">
                <code>{{ googleDataStatus?.ga4_property_id || "-" }}</code>
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataLastAuthorizedAt')">
                {{ formatTime(googleDataStatus?.last_authorized_at ?? null) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataLastGscSuccessAt')">
                {{ formatTime(googleDataStatus?.last_gsc_success_at ?? null) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataLastGscError')">
                {{ googleDataStatus?.last_gsc_error_msg || "-" }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataLastGa4SuccessAt')">
                {{ formatTime(googleDataStatus?.last_ga4_success_at ?? null) }}
              </NDescriptionsItem>
              <NDescriptionsItem :label="t('systemSettings.googleDataLastGa4Error')">
                {{ googleDataStatus?.last_ga4_error_msg || "-" }}
              </NDescriptionsItem>
            </NDescriptions>
          </NSpin>

          <NAlert
            v-if="googleDataCollectResult"
            class="result-alert collect-result-alert"
            :type="googleDataCollectResult.errors.length > 0 ? 'warning' : 'success'"
            :title="t('systemSettings.googleDataCollectResultTitle')"
          >
            <NSpace vertical size="small">
              <NDescriptions
                label-placement="left"
                :column="1"
                bordered
                size="small"
              >
                <NDescriptionsItem :label="t('systemSettings.googleDataCollectedAt')">
                  {{ formatTime(googleDataCollectResult.collected_at) }}
                </NDescriptionsItem>
                <NDescriptionsItem :label="t('systemSettings.googleDataCollectGscSaved')">
                  <NTag :type="googleDataCollectResult.gsc_saved ? 'success' : 'default'">
                    {{ googleDataCollectResult.gsc_saved
                      ? t("systemSettings.saved")
                      : t("systemSettings.notSaved") }}
                  </NTag>
                </NDescriptionsItem>
                <NDescriptionsItem :label="t('systemSettings.googleDataCollectGa4Saved')">
                  <NTag :type="googleDataCollectResult.ga4_saved ? 'success' : 'default'">
                    {{ googleDataCollectResult.ga4_saved
                      ? t("systemSettings.saved")
                      : t("systemSettings.notSaved") }}
                  </NTag>
                </NDescriptionsItem>
              </NDescriptions>
              <NText strong>{{ t("systemSettings.googleDataCollectErrors") }}</NText>
              <NList
                v-if="googleDataCollectResult.errors.length > 0"
                size="small"
                bordered
              >
                <NListItem
                  v-for="errorText in googleDataCollectResult.errors"
                  :key="errorText"
                >
                  {{ errorText }}
                </NListItem>
              </NList>
              <NText v-else>{{ t("systemSettings.googleDataNoCollectErrors") }}</NText>
            </NSpace>
          </NAlert>
          </section>
        </NTabPane>

        <NTabPane
          name="telegram-dom"
          :tab="t('systemSettings.tabTelegramDom')"
        >
          <section>
            <NAlert
              v-if="telegramDomLoadError"
              class="unknown-alert"
              type="error"
              :title="t('systemSettings.telegramDomLoadFailedTitle')"
            >
              <NSpace vertical size="small">
                <NText>{{ telegramDomLoadError }}</NText>
                <NButton
                  size="small"
                  :loading="telegramDomLoading"
                  @click="loadTelegramDomConfig"
                >
                  {{ t("systemSettings.telegramDomRetry") }}
                </NButton>
              </NSpace>
            </NAlert>

            <NSpin :show="telegramDomLoading">
              <NForm :disabled="telegramDomSaving">
                <NFormItem
                  :label="t('systemSettings.telegramDomJsonLabel')"
                  :validation-status="telegramDomValidationError ? 'error' : undefined"
                  :feedback="telegramDomValidationError"
                >
                  <NInput
                    v-model:value="telegramDomText"
                    class="telegram-dom-input"
                    type="textarea"
                    :rows="18"
                    placeholder="{}"
                  />
                </NFormItem>
                <div class="form-actions">
                  <NButton
                    type="primary"
                    :loading="telegramDomSaving"
                    :disabled="!telegramDomLoaded"
                    @click="handleSaveTelegramDomConfig"
                  >
                    {{ t("systemSettings.saveTelegramDom") }}
                  </NButton>
                </div>
              </NForm>
            </NSpin>
          </section>
        </NTabPane>

        <NTabPane
          name="telegram-config"
          :tab="t('systemSettings.tabTelegramConfig')"
        >
          <section>
            <NAlert
              v-if="telegramConfigLoadError"
              class="unknown-alert"
              type="error"
              :title="t('systemSettings.telegramConfigLoadFailedTitle')"
            >
              <NSpace vertical size="small">
                <NText>{{ telegramConfigLoadError }}</NText>
                <NButton
                  size="small"
                  :loading="telegramConfigLoading"
                  @click="loadTelegramConfig"
                >
                  {{ t("systemSettings.telegramConfigRetry") }}
                </NButton>
              </NSpace>
            </NAlert>

            <NSpin :show="telegramConfigLoading">
              <NForm :disabled="telegramConfigSaving">
                <NFormItem
                  :label="t('systemSettings.telegramConfigJsonLabel')"
                  :validation-status="telegramConfigValidationError ? 'error' : undefined"
                  :feedback="telegramConfigValidationError"
                >
                  <NInput
                    v-model:value="telegramConfigText"
                    class="telegram-config-input"
                    type="textarea"
                    :rows="18"
                    placeholder="{}"
                  />
                </NFormItem>
                <div class="form-actions">
                  <NButton
                    type="primary"
                    :loading="telegramConfigSaving"
                    :disabled="!telegramConfigLoaded"
                    @click="handleSaveTelegramConfig"
                  >
                    {{ t("systemSettings.saveTelegramConfig") }}
                  </NButton>
                </div>
              </NForm>
            </NSpin>
          </section>
        </NTabPane>
      </NTabs>
    </NCard>

    <NModal
      :show="showGeneratedApiKeyModal"
      preset="card"
      class="generated-api-key-modal"
      :title="t('systemSettings.generatedApiKeyTitle')"
      @update:show="handleGeneratedApiKeyModalUpdate"
    >
      <NSpace vertical size="small">
        <NAlert type="warning">
          {{ t("systemSettings.generatedApiKeyNotice") }}
        </NAlert>
        <div class="api-key-box">
          <code>{{ generatedApiKey }}</code>
          <NButton size="small" @click="handleCopyGeneratedApiKey">
            {{ t("systemSettings.copyApiKey") }}
          </NButton>
        </div>
      </NSpace>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
  NAlert,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NForm,
  NFormItem,
  NInput,
  NList,
  NListItem,
  NModal,
  NSpace,
  NSpin,
  NTabPane,
  NTabs,
  NTag,
  NText,
  useDialog,
  useMessage,
} from "naive-ui";
import {
  collectGoogleDataOnce,
  createGoogleDataAuthorizationUrl,
  disconnectGoogleData,
  generateAdminApiKey,
  getAdminApiKeyMeta,
  getGoogleDataStatus,
  getTelegramConfig,
  getTelegramDomConfig,
  refreshConfigCache,
  saveGoogleDataConfig,
  saveTelegramConfig,
  saveTelegramDomConfig,
  type AdminApiKeyMeta,
  type ConfigCacheRefreshResult,
  type GoogleDataConfigUpdateRequest,
  type GoogleDataCollectOnceResult,
  type GoogleDataStatus,
  type JsonValue,
  type TelegramConfig,
  type TelegramDomConfig,
} from "@/api/system-settings";
import { formatAdminTimeMs } from "@/utils/time";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const message = useMessage();

const refreshingCache = ref(false);
const apiKeyLoading = ref(false);
const generatingApiKey = ref(false);
const googleDataLoading = ref(false);
const googleDataAuthorizing = ref(false);
const googleDataDisconnecting = ref(false);
const googleDataCollecting = ref(false);
const googleDataSaving = ref(false);
const telegramDomLoading = ref(false);
const telegramDomSaving = ref(false);
const telegramDomLoaded = ref(false);
const telegramDomLoadAttempted = ref(false);
const telegramConfigLoading = ref(false);
const telegramConfigSaving = ref(false);
const telegramConfigLoaded = ref(false);
const telegramConfigLoadAttempted = ref(false);
const activeTab = ref("config-cache");
const cacheRefreshResult = ref<ConfigCacheRefreshResult | null>(null);
const apiKeyMeta = ref<AdminApiKeyMeta | null>(null);
const googleDataStatus = ref<GoogleDataStatus | null>(null);
const googleDataCollectResult = ref<GoogleDataCollectOnceResult | null>(null);
const generatedApiKey = ref("");
const showGeneratedApiKeyModal = ref(false);
const telegramDomText = ref("{}");
const telegramDomLoadError = ref("");
const telegramDomValidationError = ref("");
const telegramConfigText = ref("{}");
const telegramConfigLoadError = ref("");
const telegramConfigValidationError = ref("");
const googleDataConfigForm = ref<GoogleDataConfigUpdateRequest>({
  client_id: "",
  client_secret: "",
  gsc_site_url: "",
  ga4_property_id: "",
});

/** 只有已知 API Key 状态时才允许生成，避免加载失败时绕过重新生成确认。 */
const canGenerateApiKey = computed(
  () => !apiKeyLoading.value && !generatingApiKey.value && apiKeyMeta.value !== null,
);

/** API Key 状态未知时给管理员明确重试入口。 */
const showApiKeyUnknownAlert = computed(
  () => !apiKeyLoading.value && apiKeyMeta.value === null,
);

/** Google 数据后端配置完整时才允许授权或采集。 */
const googleDataConfigured = computed(
  () => googleDataStatus.value?.configured === true,
);

/** 当前表单是否足够保存并发起 Google 授权。 */
const googleDataFormConfigured = computed(() => {
  const form = googleDataConfigForm.value;
  return Boolean(
    form.client_id.trim() &&
      (form.client_secret.trim() ||
        googleDataStatus.value?.client_secret_configured === true) &&
      form.gsc_site_url.trim() &&
      form.ga4_property_id.trim(),
  );
});

/** Google 数据已有授权时展示授权后的操作组。 */
const googleDataAuthorized = computed(
  () => googleDataStatus.value?.authorized === true,
);

/** 当前表单可保存时即可授权；点击授权会先保存表单再跳转。 */
const canAuthorizeGoogleData = computed(
  () =>
    !googleDataLoading.value &&
    !googleDataAuthorizing.value &&
    !googleDataSaving.value &&
    googleDataFormConfigured.value,
);

/** 已知授权状态下才允许断开，避免状态失败时误导管理员。 */
const canDisconnectGoogleData = computed(
  () =>
    !googleDataLoading.value &&
    !googleDataDisconnecting.value &&
    googleDataAuthorized.value,
);

/** 手动采集依赖完整配置和有效授权。 */
const canCollectGoogleData = computed(
  () =>
    !googleDataLoading.value &&
    !googleDataCollecting.value &&
    googleDataConfigured.value &&
    googleDataAuthorized.value,
);

/** Google 数据状态未知时给管理员明确重试入口。 */
const showGoogleDataUnknownAlert = computed(
  () => !googleDataLoading.value && googleDataStatus.value === null,
);

/** 当前表单缺失时禁用授权/采集，并说明需要先补配置。 */
const showGoogleDataConfigAlert = computed(
  () =>
    !googleDataLoading.value &&
    googleDataStatus.value !== null &&
    !googleDataFormConfigured.value,
);

/** 密钥已配置时，空输入表示保留服务端已保存密钥。 */
const clientSecretPlaceholder = computed(() =>
  googleDataStatus.value?.client_secret_configured === true
    ? t("systemSettings.googleDataClientSecretKeepPlaceholder")
    : t("systemSettings.googleDataClientSecretPlaceholder"),
);

/** 格式化毫秒时间戳。 */
function formatTime(value: number | null) {
  return formatAdminTimeMs(value);
}

/** 初始加载 API Key 元信息。 */
async function loadApiKeyMeta() {
  apiKeyLoading.value = true;
  try {
    apiKeyMeta.value = null;
    apiKeyMeta.value = await getAdminApiKeyMeta();
  } catch (error) {
    console.error("SystemSettingsView.loadApiKeyMeta() 加载失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.apiKeyLoadFailed"),
      ),
    );
    apiKeyMeta.value = null;
  } finally {
    apiKeyLoading.value = false;
  }
}

/** 初始加载 Google 数据采集状态，失败时只影响本区块。 */
async function loadGoogleDataStatus() {
  googleDataLoading.value = true;
  try {
    googleDataStatus.value = null;
    googleDataStatus.value = await getGoogleDataStatus();
    syncGoogleDataConfigForm(googleDataStatus.value);
  } catch (error) {
    console.error("SystemSettingsView.loadGoogleDataStatus() 加载失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.googleDataLoadFailed"),
      ),
    );
    googleDataStatus.value = null;
  } finally {
    googleDataLoading.value = false;
  }
}

/** 把公开状态同步到可编辑表单；密钥不回显。 */
function syncGoogleDataConfigForm(status: GoogleDataStatus) {
  googleDataConfigForm.value = {
    client_id: status.client_id,
    client_secret: "",
    gsc_site_url: status.gsc_site_url,
    ga4_property_id: status.ga4_property_id,
  };
}

/** 刷新配置读取缓存。 */
async function handleRefreshConfigCache() {
  refreshingCache.value = true;
  try {
    cacheRefreshResult.value = await refreshConfigCache();
    message.success(t("systemSettings.cacheRefreshSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleRefreshConfigCache() 刷新失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.cacheRefreshFailed"),
      ),
    );
  } finally {
    refreshingCache.value = false;
  }
}

/** 保存 Google 数据采集配置，后端会清空 system_data 缓存。 */
async function handleSaveGoogleDataConfig() {
  googleDataSaving.value = true;
  try {
    await saveGoogleDataConfigFromForm(true);
    message.success(t("systemSettings.googleDataConfigSaveSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleSaveGoogleDataConfig() 保存失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.googleDataConfigSaveFailed"),
      ),
    );
  } finally {
    googleDataSaving.value = false;
  }
}

/** 保存 Google 数据采集表单，并同步公开状态。 */
async function saveGoogleDataConfigFromForm(clearCollectResult: boolean) {
  googleDataStatus.value = await saveGoogleDataConfig(googleDataConfigForm.value);
  syncGoogleDataConfigForm(googleDataStatus.value);
  if (clearCollectResult) {
    googleDataCollectResult.value = null;
  }
}

/** 创建 Google OAuth 授权 URL，并交给浏览器跳转。 */
async function handleAuthorizeGoogleData() {
  if (!googleDataFormConfigured.value) {
    message.warning(t("systemSettings.googleDataConfigMissingDescription"));
    return;
  }

  googleDataAuthorizing.value = true;
  try {
    await saveGoogleDataConfigFromForm(true);
    const data = await createGoogleDataAuthorizationUrl({
      admin_return_base_url: window.location.origin,
    });
    window.location.href = data.authorization_url;
  } catch (error) {
    console.error("SystemSettingsView.handleAuthorizeGoogleData() 授权失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.googleDataAuthorizeFailed"),
      ),
    );
  } finally {
    googleDataAuthorizing.value = false;
  }
}

/** 断开 Google 数据采集授权前先二次确认。 */
function handleDisconnectGoogleData() {
  dialog.warning({
    title: t("systemSettings.disconnectGoogleData"),
    content: t("systemSettings.disconnectGoogleDataConfirm"),
    positiveText: t("common.confirm"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      void disconnectGoogleDataAfterConfirm();
    },
  });
}

/** 断开 Google 数据采集授权并刷新状态。 */
async function disconnectGoogleDataAfterConfirm() {
  googleDataDisconnecting.value = true;
  try {
    await disconnectGoogleData();
    googleDataCollectResult.value = null;
    message.success(t("systemSettings.googleDataDisconnectSuccess"));
    await loadGoogleDataStatus();
  } catch (error) {
    console.error(
      "SystemSettingsView.disconnectGoogleDataAfterConfirm() 断开失败:",
      error,
    );
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.googleDataDisconnectFailed"),
      ),
    );
  } finally {
    googleDataDisconnecting.value = false;
  }
}

/** 手动触发一次 Google 数据采集；后端允许部分失败，结果如实展示。 */
async function handleCollectGoogleDataOnce() {
  if (!googleDataConfigured.value) {
    message.warning(t("systemSettings.googleDataConfigMissingDescription"));
    return;
  }
  if (!googleDataAuthorized.value) {
    message.warning(t("systemSettings.googleDataNeedAuthorizeDescription"));
    return;
  }

  googleDataCollecting.value = true;
  try {
    const collectResult = await collectGoogleDataOnce();
    googleDataCollectResult.value = collectResult;
    showGoogleDataCollectMessage(collectResult);
    await loadGoogleDataStatus();
  } catch (error) {
    console.error(
      "SystemSettingsView.handleCollectGoogleDataOnce() 采集失败:",
      error,
    );
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.googleDataCollectFailed"),
      ),
    );
  } finally {
    googleDataCollecting.value = false;
  }
}

/** 根据 GSC/GA4 分侧保存结果提示；接口 200 时也可能包含部分失败。 */
function showGoogleDataCollectMessage(result: GoogleDataCollectOnceResult) {
  if (result.errors.length === 0) {
    message.success(t("systemSettings.googleDataCollectSuccess"));
    return;
  }

  const errorText = result.errors.join("\n");
  if (result.gsc_saved || result.ga4_saved) {
    message.warning(
      `${t("systemSettings.googleDataCollectPartialFailed")}: ${errorText}`,
    );
    return;
  }
  message.error(`${t("systemSettings.googleDataCollectFailed")}: ${errorText}`);
}

/** 优先展示后端返回的业务错误 msg，避免丢失可定位原因。 */
function getErrorMessage(error: Error | null, fallback: string) {
  return error?.message || fallback;
}

/** 首次进入 Telegram DOM tab 时读取当前稀疏对象。 */
async function loadTelegramDomConfig() {
  telegramDomLoadAttempted.value = true;
  telegramDomLoading.value = true;
  telegramDomLoadError.value = "";
  try {
    const config = await getTelegramDomConfig();
    telegramDomText.value = JSON.stringify(config, null, 2);
    telegramDomLoaded.value = true;
  } catch (error) {
    console.error("SystemSettingsView.loadTelegramDomConfig() 加载失败:", error);
    telegramDomLoaded.value = false;
    telegramDomLoadError.value = getErrorMessage(
      error instanceof Error ? error : null,
      t("systemSettings.telegramDomLoadFailed"),
    );
    message.error(telegramDomLoadError.value);
  } finally {
    telegramDomLoading.value = false;
  }
}

/** 只校验合法 JSON 和顶层对象，不判断字段、值类型或 selector。 */
function parseTelegramDomConfig(): TelegramDomConfig | null {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(telegramDomText.value) as JsonValue;
  } catch (error) {
    console.error("SystemSettingsView.parseTelegramDomConfig() JSON 解析失败:", error);
    telegramDomValidationError.value = t("systemSettings.telegramDomJsonInvalid");
    return null;
  }

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    telegramDomValidationError.value = t(
      "systemSettings.telegramDomTopObjectInvalid",
    );
    return null;
  }

  return parsed as TelegramDomConfig;
}

/** 原样保存当前文本解析出的 Telegram DOM 稀疏对象。 */
async function handleSaveTelegramDomConfig() {
  const config = parseTelegramDomConfig();
  if (config === null) return;

  telegramDomSaving.value = true;
  try {
    await saveTelegramDomConfig(config);
    message.success(t("systemSettings.telegramDomSaveSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleSaveTelegramDomConfig() 保存失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.telegramDomSaveFailed"),
      ),
    );
  } finally {
    telegramDomSaving.value = false;
  }
}

/** 首次进入 Telegram Config tab 时读取当前稀疏对象。 */
async function loadTelegramConfig() {
  telegramConfigLoadAttempted.value = true;
  telegramConfigLoading.value = true;
  telegramConfigLoadError.value = "";
  try {
    const config = await getTelegramConfig();
    telegramConfigText.value = JSON.stringify(config, null, 2);
    telegramConfigLoaded.value = true;
  } catch (error) {
    console.error("SystemSettingsView.loadTelegramConfig() 加载失败:", error);
    telegramConfigLoaded.value = false;
    telegramConfigLoadError.value = getErrorMessage(
      error instanceof Error ? error : null,
      t("systemSettings.telegramConfigLoadFailed"),
    );
    message.error(telegramConfigLoadError.value);
  } finally {
    telegramConfigLoading.value = false;
  }
}

/** 只校验合法 JSON 和顶层对象，具体字段由各版本扩展消费。 */
function parseTelegramConfig(): TelegramConfig | null {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(telegramConfigText.value) as JsonValue;
  } catch (error) {
    console.error("SystemSettingsView.parseTelegramConfig() JSON 解析失败:", error);
    telegramConfigValidationError.value = t(
      "systemSettings.telegramConfigJsonInvalid",
    );
    return null;
  }

  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    telegramConfigValidationError.value = t(
      "systemSettings.telegramConfigTopObjectInvalid",
    );
    return null;
  }

  return parsed as TelegramConfig;
}

/** 原样保存当前文本解析出的 Telegram 稀疏配置对象。 */
async function handleSaveTelegramConfig() {
  const config = parseTelegramConfig();
  if (config === null) return;

  telegramConfigSaving.value = true;
  try {
    await saveTelegramConfig(config);
    message.success(t("systemSettings.telegramConfigSaveSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleSaveTelegramConfig() 保存失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.telegramConfigSaveFailed"),
      ),
    );
  } finally {
    telegramConfigSaving.value = false;
  }
}

/** 根据当前状态决定直接生成或先确认重新生成。 */
function handleGenerateApiKey() {
  if (apiKeyMeta.value === null) {
    message.warning(t("systemSettings.apiKeyUnknownDescription"));
    return;
  }

  if (!apiKeyMeta.value.has_api_key) {
    void generateApiKeyAfterConfirm();
    return;
  }

  dialog.warning({
    title: t("systemSettings.regenerateApiKey"),
    content: t("systemSettings.regenerateConfirm"),
    positiveText: t("common.confirm"),
    negativeText: t("common.cancel"),
    onPositiveClick: () => {
      void generateApiKeyAfterConfirm();
    },
  });
}

/** 生成 API Key，并将完整 key 仅保存到当前页面状态中。 */
async function generateApiKeyAfterConfirm() {
  generatingApiKey.value = true;
  try {
    const data = await generateAdminApiKey();
    apiKeyMeta.value = {
      has_api_key: true,
      api_key_prefix: data.api_key_prefix,
      api_key_created_at: data.api_key_created_at,
    };
    generatedApiKey.value = data.api_key;
    showGeneratedApiKeyModal.value = true;
    message.success(t("systemSettings.apiKeyGenerateSuccess"));
  } catch (error) {
    console.error("SystemSettingsView.generateApiKeyAfterConfirm() 生成失败:", error);
    message.error(
      getErrorMessage(
        error instanceof Error ? error : null,
        t("systemSettings.apiKeyGenerateFailed"),
      ),
    );
  } finally {
    generatingApiKey.value = false;
  }
}

/** 关闭一次性 API Key 弹窗时立即清空完整 key。 */
function handleGeneratedApiKeyModalUpdate(show: boolean) {
  showGeneratedApiKeyModal.value = show;
  if (!show) {
    generatedApiKey.value = "";
  }
}

/** 复制本次生成的完整 API Key。 */
async function handleCopyGeneratedApiKey() {
  if (!generatedApiKey.value) return;

  try {
    await navigator.clipboard.writeText(generatedApiKey.value);
    message.success(t("systemSettings.copySuccess"));
  } catch (error) {
    console.error("SystemSettingsView.handleCopyGeneratedApiKey() 复制失败:", error);
    message.error(t("systemSettings.copyFailed"));
  }
}

/** 展示 OAuth callback 结果，并清理一次性 query 参数。 */
async function handleGoogleDataOAuthCallbackQuery() {
  const authorized = route.query.google_data_authorized;
  const error = route.query.google_data_error;
  const hasAuthorizedQuery = authorized === "1";
  const hasErrorQuery = typeof error === "string" && error.length > 0;

  if (!hasAuthorizedQuery && !hasErrorQuery) {
    return;
  }

  if (hasAuthorizedQuery) {
    message.success(t("systemSettings.googleDataAuthorizedSuccess"));
  } else {
    message.error(t("systemSettings.googleDataAuthorizedFailed", { error }));
  }

  const nextQuery = { ...route.query };
  delete nextQuery.google_data_authorized;
  delete nextQuery.google_data_error;
  await router.replace({ path: route.path, query: nextQuery, hash: route.hash });
}

onMounted(() => {
  void handleGoogleDataOAuthCallbackQuery();
  void loadApiKeyMeta();
  void loadGoogleDataStatus();
});

watch(activeTab, (tab) => {
  if (
    tab === "telegram-dom" &&
    !telegramDomLoadAttempted.value &&
    !telegramDomLoading.value
  ) {
    void loadTelegramDomConfig();
  }

  if (
    tab === "telegram-config" &&
    !telegramConfigLoadAttempted.value &&
    !telegramConfigLoading.value
  ) {
    void loadTelegramConfig();
  }
});

watch(telegramDomText, () => {
  telegramDomValidationError.value = "";
});

watch(telegramConfigText, () => {
  telegramConfigValidationError.value = "";
});
</script>

<style scoped>
.system-settings-view {
  max-width: 960px;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.result-alert {
  margin-top: 16px;
}

.unknown-alert {
  margin-bottom: 16px;
}

.window-policy-alert {
  margin-bottom: 16px;
}

.google-data-config-form {
  margin-bottom: 16px;
}

:deep(.telegram-dom-input textarea) {
  min-height: 360px;
  font-family: "Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

:deep(.telegram-config-input textarea) {
  min-height: 360px;
  font-family: "Geist Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.google-data-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.api-key-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 6px;
  background: var(--n-color);
}

.api-key-box code {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}

:deep(.generated-api-key-modal) {
  max-width: 720px;
}

@media (max-width: 640px) {
  .api-key-box {
    align-items: stretch;
    flex-direction: column;
  }

  .tab-actions,
  .form-actions {
    justify-content: stretch;
  }

  .google-data-config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
