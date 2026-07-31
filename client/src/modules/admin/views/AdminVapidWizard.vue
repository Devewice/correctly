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
const testMsg = ref('')

const form = reactive({
  publicKey: '',
  privateKey: '',
  subject: 'mailto:admin@jeisson.click',
})

const steps = computed(() => wizard.value?.steps || [])
const current = computed(() => steps.value[step.value])

onMounted(async () => {
  const data = await api('/admin/wizard/vapid')
  wizard.value = data
  form.publicKey = data.current.publicKey || ''
  form.subject = data.current.subject || 'mailto:admin@jeisson.click'
  if (data.current.configured && !data.current.wizardDone) {
    step.value = Math.min(2, data.steps.length - 1)
  }
})

function next() {
  if (step.value < steps.value.length - 1) step.value += 1
}

function prev() {
  if (step.value > 0) step.value -= 1
}

async function generateKeys() {
  busy.value = true
  error.value = ''
  try {
    const data = await api('/admin/wizard/vapid/generate', { method: 'POST' })
    form.publicKey = data.publicKey
    form.privateKey = data.privateKey
    form.subject = data.subject || form.subject
    next()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function saveCredentials() {
  busy.value = true
  error.value = ''
  try {
    await api('/admin/settings/vapid', {
      method: 'PUT',
      body: {
        publicKey: form.publicKey,
        privateKey: form.privateKey || undefined,
        subject: form.subject,
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
  error.value = ''
  try {
    await api('/admin/wizard/vapid/complete', { method: 'POST' })
    await api('/admin/settings/vapid', {
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

async function sendTest() {
  busy.value = true
  testMsg.value = ''
  error.value = ''
  try {
    const data = await api('/push/test', { method: 'POST' })
    testMsg.value = t('admin.wizard.vapid.testOk', { n: data.sent })
  } catch (e) {
    error.value = e.message || t('admin.wizard.vapid.testFail')
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
      <h2 class="text-h5 font-weight-bold">{{ t('admin.wizard.vapid.title') }}</h2>
      <p class="text-body-2 text-medium-emphasis mt-1">{{ t('admin.wizard.vapid.subtitle') }}</p>
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
      <div v-if="current?.id === 'explain'" class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.vapid.copy.explain') }}</p>
        <ul class="text-body-2 text-medium-emphasis pl-4">
          <li>{{ t('admin.wizard.vapid.copy.pointPublic') }}</li>
          <li>{{ t('admin.wizard.vapid.copy.pointPrivate') }}</li>
          <li>{{ t('admin.wizard.vapid.copy.pointSubject') }}</li>
        </ul>
        <v-btn color="primary" class="align-self-start" @click="next">
          {{ t('admin.wizard.next') }}
        </v-btn>
      </div>

      <div v-else-if="current?.id === 'generate'" class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.vapid.copy.generate') }}</p>
        <v-alert type="info" variant="tonal" density="comfortable">
          {{ t('admin.wizard.vapid.copy.generateHint') }}
        </v-alert>
        <div class="d-flex flex-wrap ga-2">
          <v-btn color="primary" :loading="busy" @click="generateKeys">
            {{ t('admin.wizard.vapid.generateBtn') }}
          </v-btn>
          <v-btn variant="tonal" @click="next">{{ t('admin.wizard.vapid.haveKeys') }}</v-btn>
          <v-btn variant="text" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
        </div>
        <v-alert v-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
      </div>

      <div v-else-if="current?.id === 'paste'" class="d-flex flex-column ga-2">
        <p class="text-body-2 mb-2">{{ t('admin.wizard.vapid.copy.paste') }}</p>
        <v-textarea
          v-model="form.publicKey"
          :label="t('admin.wizard.vapid.publicKey')"
          rows="2"
          auto-grow
          class="font-mono"
        />
        <v-textarea
          v-model="form.privateKey"
          :label="t('admin.wizard.vapid.privateKey')"
          :placeholder="wizard.current.privateKeySet ? '••••••••' : ''"
          rows="2"
          auto-grow
          class="font-mono"
        />
        <v-text-field
          v-model="form.subject"
          :label="t('admin.wizard.vapid.subject')"
          hint="mailto:tu@email.com"
          persistent-hint
        />
        <v-alert v-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
        <div class="d-flex flex-wrap ga-2 mt-2">
          <v-btn variant="tonal" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
          <v-btn
            color="primary"
            :loading="busy"
            :disabled="!form.publicKey || (!form.privateKey && !wizard.current.privateKeySet)"
            @click="saveCredentials"
          >
            {{ t('admin.wizard.saveContinue') }}
          </v-btn>
        </div>
      </div>

      <div v-else-if="current?.id === 'hostinger'" class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.vapid.copy.hostinger') }}</p>
        <v-alert type="info" variant="tonal">
          {{ t('admin.wizard.vapid.copy.hostingerOptional') }}
        </v-alert>
        <div>
          <div class="text-subtitle-2 mb-2">{{ t('admin.wizard.vapid.envTitle') }}</div>
          <v-btn
            v-for="line in current.envHint"
            :key="line"
            block
            variant="tonal"
            class="mb-2 text-none justify-start"
            style="font-family: monospace; font-size: 12px"
            @click="copy(line.replace('…', form.publicKey || form.privateKey || ''))"
          >
            {{ line }} · {{ t('admin.wizard.copy') }}
          </v-btn>
        </div>
        <div v-if="form.publicKey" class="d-flex flex-column ga-2">
          <v-btn
            block
            variant="tonal"
            class="text-none justify-start"
            style="font-family: monospace; font-size: 11px"
            @click="copy(`VAPID_PUBLIC_KEY=${form.publicKey}`)"
          >
            VAPID_PUBLIC_KEY=… · {{ t('admin.wizard.copy') }}
          </v-btn>
          <v-btn
            v-if="form.privateKey"
            block
            variant="tonal"
            class="text-none justify-start"
            style="font-family: monospace; font-size: 11px"
            @click="copy(`VAPID_PRIVATE_KEY=${form.privateKey}`)"
          >
            VAPID_PRIVATE_KEY=… · {{ t('admin.wizard.copy') }}
          </v-btn>
          <v-btn
            block
            variant="tonal"
            class="text-none justify-start"
            style="font-family: monospace; font-size: 11px"
            @click="copy(`VAPID_SUBJECT=${form.subject}`)"
          >
            VAPID_SUBJECT={{ form.subject }} · {{ t('admin.wizard.copy') }}
          </v-btn>
        </div>
        <div class="d-flex flex-wrap ga-2">
          <v-btn variant="tonal" @click="prev">{{ t('admin.wizard.back') }}</v-btn>
          <v-btn color="primary" @click="next">{{ t('admin.wizard.next') }}</v-btn>
        </div>
      </div>

      <div v-else class="d-flex flex-column ga-4">
        <p class="text-body-2">{{ t('admin.wizard.vapid.copy.test') }}</p>
        <ol class="text-body-2 text-medium-emphasis pl-4">
          <li>{{ t('admin.wizard.vapid.copy.test1') }}</li>
          <li>{{ t('admin.wizard.vapid.copy.test2') }}</li>
          <li>{{ t('admin.wizard.vapid.copy.test3') }}</li>
        </ol>
        <div class="d-flex flex-wrap ga-2">
          <v-btn color="secondary" variant="tonal" to="/reminders">
            {{ t('admin.wizard.vapid.openReminders') }}
          </v-btn>
          <v-btn color="primary" variant="tonal" :loading="busy" @click="sendTest">
            {{ t('admin.wizard.vapid.sendTest') }}
          </v-btn>
        </div>
        <v-alert v-if="testMsg" type="success" variant="tonal" density="compact">
          {{ testMsg }}
        </v-alert>
        <v-alert v-if="error" type="error" variant="tonal" density="compact">{{ error }}</v-alert>
        <div class="d-flex flex-wrap ga-2">
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
