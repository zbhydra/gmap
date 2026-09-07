<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { HomePageContent } from '../../i18n/schema'
import { previewKeyword, type PreviewResult } from '../../scripts/homepage/preview'
import { getSiteSession } from '../../scripts/site/session'
import { SITE_AUTH_SUCCESS_EVENT } from '../auth/site-auth-controller'

const props = defineProps<{ copy: HomePageContent['hero']['scraperCard']; dashboardUrl: string }>()
const keyword = ref('')
const result = ref<PreviewResult | null>(null)
const loading = ref(false)
const failed = ref(false)
const signedIn = ref(false)
let generation = 0
const columns = ['name', 'address', 'category', 'rating', 'review_count', 'phone'] as const

async function restoreSession(): Promise<void> {
  const session = await getSiteSession()
  signedIn.value = session.status !== 'signed-out'
  if (signedIn.value) clearPreview()
}

function clearPreview(): void {
  generation += 1
  keyword.value = ''
  result.value = null
  loading.value = false
  failed.value = false
}

async function submit(): Promise<void> {
  if (loading.value || !keyword.value.trim()) return
  const current = ++generation
  loading.value = true
  failed.value = false
  result.value = null
  try {
    const data = await previewKeyword(keyword.value.trim())
    if (current === generation) result.value = data
  } catch (error) {
    console.error(new Error('homepage preview: search failed', { cause: error }))
    if (current === generation) failed.value = true
  } finally {
    if (current === generation) loading.value = false
  }
}

function signIn(): void {
  clearPreview()
  window.siteAuthController?.open({ redirectTo: props.dashboardUrl })
}

onMounted(() => {
  void restoreSession()
  window.addEventListener(SITE_AUTH_SUCCESS_EVENT, restoreSession)
  window.addEventListener('pagehide', clearPreview)
})
onBeforeUnmount(() => {
  clearPreview()
  window.removeEventListener(SITE_AUTH_SUCCESS_EVENT, restoreSession)
  window.removeEventListener('pagehide', clearPreview)
})
</script>

<template>
  <div class="preview" data-home-preview>
    <a v-if="signedIn" class="btn-primary" :href="props.dashboardUrl">{{ props.copy.dashboard }}</a>
    <template v-else>
      <form class="preview-form" @submit.prevent="submit">
        <label for="home-preview-keyword">{{ props.copy.label }}</label>
        <div class="preview-input-row">
          <input id="home-preview-keyword" v-model="keyword" required maxlength="500" autocomplete="off"
            :placeholder="props.copy.sampleKeywords[0]" :aria-label="props.copy.textareaLabel" :disabled="loading" />
          <button type="submit" class="btn-primary" :disabled="loading || !keyword.trim()">{{ loading ? props.copy.loading : props.copy.submitLabel }}</button>
        </div>
        <p class="preview-note">{{ props.copy.note }}</p>
      </form>
      <p v-if="loading" role="status">{{ props.copy.loading }}</p>
      <p v-if="failed" class="preview-error" role="alert">{{ props.copy.failed }}</p>
      <div v-if="result" class="preview-results" aria-live="polite">
        <p v-if="!result.count">{{ props.copy.empty }}</p>
        <template v-else>
          <p>{{ props.copy.count.replace('{count}', String(result.count)) }}</p>
          <div class="preview-table-wrap">
            <table>
              <thead><tr><th v-for="column in columns" :key="column" scope="col">{{ props.copy.columns[column] }}</th></tr></thead>
              <tbody>
                <tr v-for="(row, index) in result.rows" :key="index"><td v-for="column in columns" :key="column">{{ row[column] ?? '—' }}</td></tr>
                <tr v-if="result.count > result.rows.length" class="preview-locked" aria-hidden="true"><td v-for="column in columns" :key="column"><span></span></td></tr>
              </tbody>
            </table>
          </div>
          <p class="preview-note">{{ props.copy.locked }}</p>
          <button type="button" class="btn-primary" @click="signIn">{{ props.copy.signIn }}</button>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preview { margin: var(--space-8) auto 0; max-width: 100%; text-align: left; font-size: 14px; letter-spacing: 0; }
.preview-form { max-width: 760px; margin-inline: auto; display: grid; gap: var(--space-3); }
.preview-form label { font-weight: 600; }
.preview-input-row { display: flex; gap: var(--space-3); }
input { flex: 1; min-width: 0; height: 48px; padding: var(--space-3); border: 1px solid var(--border-strong); border-radius: var(--rounded-sm); background: var(--surface); color: var(--text); font: inherit; }
input:focus-visible, button:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
button:disabled { opacity: .55; cursor: not-allowed; }
.preview-note { color: var(--text-2); line-height: 1.6; }
.preview-error { color: var(--bad); margin-top: var(--space-4); }
.preview-results { display: grid; gap: var(--space-4); margin-top: var(--space-6); justify-items: start; }
.preview-table-wrap { width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: var(--rounded-sm); }
table { width: 100%; min-width: 760px; border-collapse: collapse; background: var(--surface); }
th, td { padding: var(--space-3); border-bottom: 1px solid var(--border); text-align: left; max-width: 300px; overflow-wrap: anywhere; }
th { background: var(--surface-2); color: var(--text-2); }
.preview-locked span { display: block; height: 12px; width: 80%; background: var(--border); border-radius: var(--rounded-full); }
@media (max-width: 960px) { .preview-input-row { flex-direction: column; } }
</style>
