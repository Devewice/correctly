<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/utils/api'

const { t } = useI18n()
const step = ref(0)
const wizard = ref(null)
const busy = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  clientId: '',
  clientSecret: '',
  callbackUrl: '',
})

const steps = computed(() => wizard.value?.steps || [])
const current = computed(() => steps.value[step.value])

onMounted(async () => {
  const data = await api('/admin/wizard/google')
  wizard.value = data
  form.clientId = data.current.clientId || ''
  form.callbackUrl =
    data.current.callbackUrl || `${window.location.origin}/api/auth/google/callback`
  if (data.current.configured && !data.current.wizardDone) step.value = Math.min(3, data.steps.length - 1)
})

function next() {
  if (step.value < steps.value.length - 1) step.value += 1
}

function prev() {
  if (step.value > 0) step.value -= 1
}

async function saveCredentials() {
  busy.value = true
  error.value = ''
  try {
    await api('/admin/settings/google', {
      method: 'PUT',
      body: {
        clientId: form.clientId,
        clientSecret: form.clientSecret || undefined,
        callbackUrl: form.callbackUrl,
      },
    })
    saved.value = true
    next()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function finish() {
  busy.value = true
  try {
    await api('/admin/wizard/google/complete', { method: 'POST' })
    await api('/admin/settings/google', {
      method: 'PUT',
      body: { wizardDone: true },
    })
    step.value = steps.value.length - 1
    saved.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function copy(text) {
  navigator.clipboard?.writeText(text)
}
</script>

<template>
  <div v-if="!wizard" class="text-muted">{{ t('common.loading') }}</div>
  <div v-else class="space-y-5">
    <div>
      <h2 class="font-display text-2xl font-extrabold">{{ t('admin.wizard.google.title') }}</h2>
      <p class="mt-1 text-sm text-muted">{{ t('admin.wizard.google.subtitle') }}</p>
    </div>

    <ol class="flex flex-wrap gap-2">
      <li
        v-for="(s, i) in steps"
        :key="s.id"
        class="rounded-full px-3 py-1 text-xs"
        :class="i === step ? 'bg-sage text-white' : i < step ? 'bg-sage/20 text-sage-dark' : 'bg-sand text-muted'"
      >
        {{ i + 1 }}. {{ t(s.titleKey) }}
      </li>
    </ol>

    <section class="rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <!-- Step console -->
      <div v-if="current?.id === 'console'" class="space-y-4">
        <p class="text-sm text-ink">{{ t('admin.wizard.google.copy.console') }}</p>
        <a
          :href="current.url"
          target="_blank"
          rel="noopener"
          class="inline-flex rounded-2xl bg-ink px-4 py-3 text-sm text-white"
        >
          {{ t('admin.wizard.google.openConsole') }}
        </a>
        <button type="button" class="ml-2 rounded-2xl bg-sage px-4 py-3 text-sm text-white" @click="next">
          {{ t('admin.wizard.next') }}
        </button>
      </div>

      <!-- Step oauth client -->
      <div v-else-if="current?.id === 'oauth_client'" class="space-y-3 text-sm">
        <p>{{ t('admin.wizard.google.copy.oauthClient') }}</p>
        <ul class="list-disc space-y-1 pl-5 text-muted">
          <li>{{ t('admin.wizard.google.copy.typeWeb') }}</li>
          <li>{{ t('admin.wizard.google.copy.nameApp') }}</li>
        </ul>
        <button type="button" class="rounded-2xl bg-sage px-4 py-3 text-white" @click="next">
          {{ t('admin.wizard.next') }}
        </button>
      </div>

      <!-- Step origins -->
      <div v-else-if="current?.id === 'origins'" class="space-y-4 text-sm">
        <p>{{ t('admin.wizard.google.copy.origins') }}</p>
        <div>
          <p class="mb-1 font-medium">{{ t('admin.wizard.google.jsOrigins') }}</p>
          <button
            v-for="o in current.origins"
            :key="o"
            type="button"
            class="mb-2 block w-full rounded-xl bg-sand px-3 py-2 text-left font-mono text-xs"
            @click="copy(o)"
          >
            {{ o }} · {{ t('admin.wizard.copy') }}
          </button>
        </div>
        <div>
          <p class="mb-1 font-medium">{{ t('admin.wizard.google.redirectUris') }}</p>
          <button
            v-for="u in current.redirectUris"
            :key="u"
            type="button"
            class="mb-2 block w-full rounded-xl bg-sand px-3 py-2 text-left font-mono text-xs"
            @click="copy(u)"
          >
            {{ u }} · {{ t('admin.wizard.copy') }}
          </button>
        </div>
        <div class="flex gap-2">
          <button type="button" class="rounded-2xl bg-sand px-4 py-3" @click="prev">
            {{ t('admin.wizard.back') }}
          </button>
          <button type="button" class="rounded-2xl bg-sage px-4 py-3 text-white" @click="next">
            {{ t('admin.wizard.next') }}
          </button>
        </div>
      </div>

      <!-- Step paste -->
      <div v-else-if="current?.id === 'paste'" class="space-y-3">
        <p class="text-sm">{{ t('admin.wizard.google.copy.paste') }}</p>
        <label class="block text-sm">
          Client ID
          <input v-model="form.clientId" class="mt-1 w-full rounded-xl bg-sand px-3 py-2 font-mono text-xs" />
        </label>
        <label class="block text-sm">
          Client Secret
          <input
            v-model="form.clientSecret"
            type="password"
            :placeholder="wizard.current.clientSecretSet ? '•••••••• (sin cambio)' : ''"
            class="mt-1 w-full rounded-xl bg-sand px-3 py-2 font-mono text-xs"
          />
        </label>
        <label class="block text-sm">
          Callback URL
          <input v-model="form.callbackUrl" class="mt-1 w-full rounded-xl bg-sand px-3 py-2 font-mono text-xs" />
        </label>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>
        <div class="flex gap-2">
          <button type="button" class="rounded-2xl bg-sand px-4 py-3" @click="prev">
            {{ t('admin.wizard.back') }}
          </button>
          <button
            type="button"
            class="rounded-2xl bg-sage px-4 py-3 text-white disabled:opacity-50"
            :disabled="busy || !form.clientId"
            @click="saveCredentials"
          >
            {{ t('admin.wizard.saveContinue') }}
          </button>
        </div>
      </div>

      <!-- Step test -->
      <div v-else class="space-y-4 text-sm">
        <p>{{ t('admin.wizard.google.copy.test') }}</p>
        <a
          href="/api/auth/google"
          class="inline-flex rounded-2xl bg-ink px-4 py-3 text-white"
        >
          {{ t('admin.wizard.google.tryLogin') }}
        </a>
        <div class="flex gap-2">
          <button type="button" class="rounded-2xl bg-sand px-4 py-3" @click="prev">
            {{ t('admin.wizard.back') }}
          </button>
          <button
            type="button"
            class="rounded-2xl bg-sage px-4 py-3 text-white"
            :disabled="busy"
            @click="finish"
          >
            {{ t('admin.wizard.finish') }}
          </button>
        </div>
        <p v-if="saved" class="text-success">{{ t('admin.wizard.saved') }}</p>
      </div>
    </section>
  </div>
</template>
