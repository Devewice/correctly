<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/shared/api/client'
import {
  getPushStatus,
  pushSupported,
  subscribeWebPush,
} from '@/shared/reminders/pushClient'

const { t } = useI18n()
const step = ref(0)
const wizard = ref(null)
const busy = ref(false)
const saved = ref(false)
const error = ref('')
const testMsg = ref('')
const pushBusy = ref(false)
const pushStatus = ref({
  supported: pushSupported(),
  configured: false,
  subscribed: false,
  devices: 0,
})

const form = reactive({
  publicKey: '',
  privateKey: '',
  subject: 'mailto:admin@jeisson.click',
})

const steps = computed(() => wizard.value?.steps || [])
const current = computed(() => steps.value[step.value])

async function refreshPushStatus() {
  pushStatus.value.supported = pushSupported()
  try {
    const status = await getPushStatus()
    pushStatus.value = {
      supported: pushSupported(),
      configured: Boolean(status.configured),
      subscribed: Boolean(status.subscribed),
      devices: status.devices || 0,
    }
  } catch {
    pushStatus.value.configured = false
    pushStatus.value.subscribed = false
  }
}

onMounted(async () => {
  const data = await api('/admin/wizard/vapid')
  wizard.value = data
  form.publicKey = data.current.publicKey || ''
  form.subject = data.current.subject || 'mailto:admin@jeisson.click'
  if (data.current.configured && !data.current.wizardDone) {
    step.value = Math.min(2, data.steps.length - 1)
  }
  await refreshPushStatus()
})

watch(
  () => current.value?.id,
  (id) => {
    if (id === 'test') refreshPushStatus()
  },
)

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

async function enablePushHere() {
  pushBusy.value = true
  testMsg.value = ''
  error.value = ''
  try {
    const result = await subscribeWebPush()
    await refreshPushStatus()
    if (result.ok) {
      testMsg.value = t('admin.wizard.vapid.pushEnabled')
    } else if (result.reason === 'denied') {
      error.value = t('admin.wizard.vapid.pushDenied')
    } else if (result.reason === 'unsupported') {
      error.value = t('admin.wizard.vapid.pushUnsupported')
    } else if (result.reason === 'not_configured') {
      error.value = t('admin.wizard.vapid.pushNotConfigured')
    } else {
      error.value = t('admin.wizard.vapid.pushFail')
    }
  } catch (e) {
    error.value = e.message || t('admin.wizard.vapid.pushFail')
  } finally {
    pushBusy.value = false
  }
}

async function sendTest() {
  busy.value = true
  testMsg.value = ''
  error.value = ''
  try {
    if (!pushStatus.value.subscribed) {
      await enablePushHere()
      if (!pushStatus.value.subscribed) {
        error.value = error.value || t('admin.wizard.vapid.testFail')
        return
      }
    }
    const data = await api('/push/test', { method: 'POST' })
    testMsg.value = t('admin.wizard.vapid.testOk', { n: data.sent })
    await refreshPushStatus()
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
    <header class="d-flex align-start ga-3">
      <div class="wizard-icon" aria-hidden="true">
        <v-icon icon="mdi-bell-ring-outline" color="primary" />
      </div>
      <div>
        <h2 class="text-h6 font-weight-bold mb-0">{{ t('admin.wizard.vapid.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mt-1 mb-0">
          {{ t('admin.wizard.vapid.subtitle') }}
        </p>
      </div>
    </header>

    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="(s, i) in steps"
        :key="s.id"
        size="small"
        :color="i === step ? 'primary' : i < step ? 'success' : undefined"
        :variant="i === step || i < step ? 'flat' : 'tonal'"
        :prepend-icon="i < step ? 'mdi-check' : undefined"
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

        <v-alert
          :type="pushStatus.subscribed ? 'success' : 'warning'"
          variant="tonal"
          density="compact"
        >
          {{
            pushStatus.subscribed
              ? t('admin.wizard.vapid.deviceReady', { n: pushStatus.devices })
              : t('admin.wizard.vapid.deviceNeeded')
          }}
        </v-alert>

        <div class="d-flex flex-column flex-sm-row flex-wrap ga-2">
          <v-btn
            color="primary"
            :loading="pushBusy"
            :disabled="!pushStatus.supported || pushStatus.subscribed"
            @click="enablePushHere"
          >
            {{
              pushStatus.subscribed
                ? t('admin.wizard.vapid.pushAlreadyOn')
                : t('admin.wizard.vapid.enableHere')
            }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="tonal"
            :loading="busy"
            :disabled="!pushStatus.subscribed && !pushBusy"
            @click="sendTest"
          >
            {{ t('admin.wizard.vapid.sendTest') }}
          </v-btn>
          <v-btn variant="text" to="/reminders">
            {{ t('admin.wizard.vapid.openReminders') }}
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

<style scoped>
.wizard-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--cx-primary-soft);
  flex-shrink: 0;
}
</style>
