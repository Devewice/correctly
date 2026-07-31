<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'

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
  if (data.current.configured && !data.current.wizardDone) {
    step.value = Math.min(3, data.steps.length - 1)
  }
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

async function useEnvVars() {
  busy.value = true
  error.value = ''
  try {
    const data = await api('/admin/settings/google/use-env', { method: 'POST' })
    form.clientId = data.google.clientId || ''
    form.callbackUrl = data.google.callbackUrl || ''
    form.clientSecret = ''
    wizard.value = { ...wizard.value, current: { ...wizard.value.current, ...data.google } }
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
  <div v-if="!wizard" class="text-medium-emphasis">{{ t('common.loading') }}</div>

  <div v-else class="d-flex flex-column ga-4">
    <div>
      <h2 class="text-h5 font-weight-bold">{{ t('admin.wizard.google.title') }}</h2>
      <p class="text-body-2 text-medium-emphasis mt-1">{{ t('admin.wizard.google.subtitle') }}</p>
    </div>

    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="(s, i) in steps"
        :key="s.id"
        size="small"
        label
        :color="i === step ? 'primary' : i < step ? 'success' : undefined"
        :variant="i === step || i < step ? 'flat' : 'tonal'"
        @click="step = i"
      >
        {{ i + 1 }}. {{ t(s.titleKey) }}
      </v-chip>
    </div>

    <v-card class="pa-6">
      <div v-if="current?.id === 'console'" class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.google.copy.console') }}</p>
        <div class="d-flex flex-wrap ga-2">
          <v-btn color="on-surface" :href="current.url" target="_blank" rel="noopener">
            {{ t('admin.wizard.google.openConsole') }}
          </v-btn>
          <v-btn color="primary" @click="next">{{ t('admin.wizard.next') }}</v-btn>
        </div>
      </div>

      <div v-else-if="current?.id === 'oauth_client'" class="d-flex flex-column ga-3">
        <p class="text-body-2">{{ t('admin.wizard.google.copy.oauthClient') }}</p>
        <ul class="text-body-2 text-medium-emphasis pl-4">
          <li>{{ t('admin.wizard.google.copy.typeWeb') }}</li>
          <li>{{ t('admin.wizard.google.copy.nameApp') }}</li>
        </ul>
        <v-btn color="primary" class="align-self-start" @click="next">
          {{ t('admin.wizard.next') }}
        </v-btn>
      </div>

      <div v-else-if="current?.id === 'origins'" class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.google.copy.origins') }}</p>
        <div>
          <div class="text-subtitle-2 mb-2">{{ t('admin.wizard.google.jsOrigins') }}</div>
          <v-btn
            v-for="o in current.origins"
            :key="o"
            block
            variant="tonal"
            class="mb-2 text-none justify-start"
            style="font-family: monospace; font-size: 12px"
            @click="copy(o)"
          >
            {{ o }} · {{ t('admin.wizard.copy') }}
          </v-btn>
        </div>
        <div>
          <div class="text-subtitle-2 mb-2">{{ t('admin.wizard.google.redirectUris') }}</div>
          <v-btn
            v-for="u in current.redirectUris"
            :key="u"
            block
            variant="tonal"
            class="mb-2 text-none justify-start"
            style="font-family: monospace; font-size: 12px"
            @click="copy(u)"
          >
            {{ u }} · {{ t('admin.wizard.copy') }}
          </v-btn>
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="tonal" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
          <v-btn color="primary" @click="next">{{ t('admin.wizard.next') }}</v-btn>
        </div>
      </div>

      <div v-else-if="current?.id === 'paste'" class="d-flex flex-column ga-2">
        <p class="text-body-2 mb-2">{{ t('admin.wizard.google.copy.paste') }}</p>
        <v-alert
          v-if="wizard.current.sources"
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-2"
        >
          {{ t('admin.wizard.google.sourceHint', { source: wizard.current.sources.clientSecret }) }}
        </v-alert>
        <v-btn
          variant="tonal"
          color="secondary"
          class="align-self-start mb-2"
          :loading="busy"
          @click="useEnvVars"
        >
          {{ t('admin.wizard.google.useEnv') }}
        </v-btn>
        <v-text-field v-model="form.clientId" label="Client ID" class="font-mono" />
        <v-text-field
          v-model="form.clientSecret"
          type="password"
          label="Client Secret"
          :placeholder="wizard.current.clientSecretSet ? '••••••••' : ''"
        />
        <v-text-field v-model="form.callbackUrl" label="Callback URL" />
        <v-alert v-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
        <div class="d-flex ga-2 mt-2">
          <v-btn variant="tonal" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
          <v-btn
            color="primary"
            :loading="busy"
            :disabled="!form.clientId"
            @click="saveCredentials"
          >
            {{ t('admin.wizard.saveContinue') }}
          </v-btn>
        </div>
      </div>

      <div v-else class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.google.copy.test') }}</p>
        <v-btn color="on-surface" href="/api/auth/google" class="align-self-start">
          {{ t('admin.wizard.google.tryLogin') }}
        </v-btn>
        <div class="d-flex ga-2">
          <v-btn variant="tonal" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
          <v-btn color="primary" :loading="busy" @click="finish">
            {{ t('admin.wizard.finish') }}
          </v-btn>
        </div>
        <v-alert v-if="saved" type="success" variant="tonal" density="compact">
          {{ t('admin.wizard.saved') }}
        </v-alert>
      </div>
    </v-card>
  </div>
</template>
