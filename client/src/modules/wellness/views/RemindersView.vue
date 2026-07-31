<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/shared/components/PageHeader.vue'
import InstallAppCard from '@/shared/components/InstallAppCard.vue'
import { useAuthStore } from '@/modules/auth/stores/useAuthStore'
import { useRemindersStore } from '@/shared/reminders/useRemindersStore'
import { playSoftChime } from '@/shared/reminders/sound'
import { sendTestPush } from '@/shared/reminders/pushClient'
import { checkSystemHealth } from '@/shared/system/checkSystemHealth'
import { fadeUp, softHover, withDelay } from '@/shared/motion/presets'

const { t } = useI18n()
const auth = useAuthStore()
const store = useRemindersStore()
const customTime = ref('11:00')
const customLabel = ref('')
const pushBusy = ref(false)
const pushMsg = ref('')
const healthIssues = ref([])

const permissionLabel = computed(() => {
  if (store.permission === 'granted') return t('reminders.permGranted')
  if (store.permission === 'denied') return t('reminders.permDenied')
  if (store.permission === 'unsupported') return t('reminders.permUnsupported')
  return t('reminders.permDefault')
})

const pushLabel = computed(() => {
  if (!store.push.supported) return t('reminders.pushUnsupported')
  if (!store.push.configured) return t('reminders.pushNotConfigured')
  if (store.push.subscribed) return t('reminders.pushOn', { n: store.push.devices })
  return t('reminders.pushOff')
})

async function refreshHealth() {
  healthIssues.value = await checkSystemHealth({
    hasEnabledReminders: store.reminders.some((r) => r.enabled),
  })
}

onMounted(() => {
  store.refreshPushStatus().catch(() => {})
  refreshHealth().catch(() => {})
})

async function enablePush() {
  pushBusy.value = true
  pushMsg.value = ''
  try {
    const result = await store.enableWebPush()
    pushMsg.value = result.ok ? t('reminders.pushEnabled') : t('reminders.pushFail')
    await refreshHealth()
  } catch {
    pushMsg.value = t('reminders.pushFail')
  } finally {
    pushBusy.value = false
  }
}

async function disablePush() {
  pushBusy.value = true
  try {
    await store.disableWebPush()
    pushMsg.value = t('reminders.pushDisabled')
  } finally {
    pushBusy.value = false
  }
}

async function testPush() {
  pushBusy.value = true
  pushMsg.value = ''
  try {
    await sendTestPush()
    pushMsg.value = t('reminders.pushTestSent')
  } catch {
    pushMsg.value = t('reminders.pushFail')
  } finally {
    pushBusy.value = false
  }
}

async function toggle(item) {
  const next = store.reminders.map((r) =>
    r.id === item.id ? { ...r, enabled: !r.enabled } : r,
  )
  if (!item.enabled && store.permission !== 'granted' && store.permission !== 'unsupported') {
    await store.enableWebNotifications()
  }
  await store.save(next, auth)
  await refreshHealth()
}

async function setTime(item, time) {
  if (!time) return
  const next = store.reminders.map((r) => (r.id === item.id ? { ...r, time } : r))
  await store.save(next, auth)
}

async function toggleSound(item) {
  const next = store.reminders.map((r) =>
    r.id === item.id ? { ...r, withSound: !(r.withSound !== false) } : r,
  )
  await store.save(next, auth)
}

async function addCustom() {
  const next = [
    ...store.reminders,
    {
      id: `custom-${Date.now()}`,
      type: 'custom',
      time: customTime.value,
      enabled: true,
      withSound: true,
      label: customLabel.value.trim() || t('reminders.msg.custom'),
    },
  ]
  if (store.permission !== 'granted') await store.enableWebNotifications()
  await store.save(next, auth)
  customLabel.value = ''
}

async function removeCustom(item) {
  if (item.type !== 'custom') return
  await store.save(
    store.reminders.filter((r) => r.id !== item.id),
    auth,
  )
}

function typeTitle(type) {
  return t(`reminders.types.${type}`)
}
</script>

<template>
  <PageHeader :title="t('reminders.title')" :subtitle="t('reminders.subtitle')" icon="mdi-bell-outline" />

  <InstallAppCard />

  <v-alert type="info" variant="tonal" density="compact" class="mb-4">
    {{ t('reminders.webHint') }}
  </v-alert>

  <v-card v-if="healthIssues.length" class="pa-4 mb-4" variant="flat" color="surface-light">
    <div class="text-subtitle-2 font-weight-bold mb-2">{{ t('reminders.healthTitle') }}</div>
    <div
      v-for="issue in healthIssues"
      :key="issue.id"
      class="d-flex align-start ga-2 mb-2"
    >
      <v-icon
        :icon="issue.severity === 'error' ? 'mdi-alert-circle' : 'mdi-information-outline'"
        :color="issue.severity === 'error' ? 'error' : 'warning'"
        size="small"
        class="mt-1"
      />
      <div>
        <div class="text-body-2 font-weight-medium">{{ t(`health.issues.${issue.id}.title`) }}</div>
        <div class="text-caption text-medium-emphasis">{{ t(`health.issues.${issue.id}.body`) }}</div>
      </div>
    </div>
    <v-btn size="small" variant="text" class="mt-1" @click="refreshHealth">
      {{ t('health.recheck') }}
    </v-btn>
  </v-card>

  <v-card class="pa-4 mb-4 reminders-push-card" variant="flat">
    <div class="text-subtitle-1 font-weight-bold mb-1">{{ t('reminders.pushTitle') }}</div>
    <p class="text-body-2 mb-2">{{ pushLabel }}</p>
    <p class="text-caption mb-3 reminders-push-card__hint">{{ t('reminders.pushHint') }}</p>
    <div class="d-flex flex-wrap ga-2">
      <v-btn
        color="primary"
        :loading="pushBusy"
        :disabled="!store.push.supported || !store.push.configured || store.push.subscribed"
        @click="enablePush"
      >
        {{ t('reminders.pushEnable') }}
      </v-btn>
      <v-btn
        variant="tonal"
        :loading="pushBusy"
        :disabled="!store.push.subscribed"
        @click="testPush"
      >
        {{ t('reminders.pushTest') }}
      </v-btn>
      <v-btn
        variant="text"
        :loading="pushBusy"
        :disabled="!store.push.subscribed"
        @click="disablePush"
      >
        {{ t('reminders.pushDisable') }}
      </v-btn>
    </div>
    <v-alert v-if="pushMsg" type="success" variant="tonal" density="compact" class="mt-3">
      {{ pushMsg }}
    </v-alert>
  </v-card>

  <v-card class="pa-5 mb-5" variant="tonal">
    <div class="text-subtitle-1 font-weight-bold mb-1">{{ t('reminders.permTitle') }}</div>
    <p class="text-body-2 text-medium-emphasis mb-3">{{ permissionLabel }}</p>
    <div class="d-flex flex-wrap ga-2">
      <v-btn
        color="primary"
        variant="tonal"
        :disabled="store.permission === 'granted' || store.permission === 'unsupported'"
        @click="store.enableWebNotifications()"
      >
        {{ t('reminders.allow') }}
      </v-btn>
      <v-btn variant="tonal" @click="playSoftChime">{{ t('reminders.testSound') }}</v-btn>
    </div>
  </v-card>

  <p class="cx-section-label">{{ t('reminders.listTitle') }}</p>

  <div
    v-for="(item, i) in store.reminders"
    :key="item.id"
    v-motion
    v-bind="{ ...softHover, ...withDelay(fadeUp, 40 + i * 40) }"
    class="cx-log mb-2"
  >
    <div class="d-flex align-center justify-space-between ga-3 mb-2">
      <div class="flex-grow-1" style="min-width: 0">
        <div class="text-subtitle-2 font-weight-bold text-truncate">
          {{ item.label || typeTitle(item.type) }}
        </div>
        <div class="text-caption text-medium-emphasis text-truncate">
          {{ t(`reminders.hint.${item.type}`) }}
        </div>
      </div>
      <v-switch
        :model-value="item.enabled"
        color="primary"
        hide-details
        density="compact"
        class="flex-grow-0"
        :disabled="store.busy"
        @update:model-value="toggle(item)"
      />
    </div>

    <div class="d-flex flex-wrap align-center ga-3">
      <v-text-field
        :model-value="item.time"
        type="time"
        density="compact"
        hide-details
        style="max-width: 140px"
        :disabled="store.busy"
        @update:model-value="(v) => setTime(item, v)"
      />
      <v-chip
        size="small"
        :color="item.withSound !== false ? 'accent' : undefined"
        :variant="item.withSound !== false ? 'flat' : 'tonal'"
        @click="toggleSound(item)"
      >
        {{ item.withSound !== false ? t('reminders.soundOn') : t('reminders.soundOff') }}
      </v-chip>
      <v-btn
        v-if="item.type === 'custom'"
        size="small"
        variant="text"
        color="error"
        @click="removeCustom(item)"
      >
        {{ t('reminders.remove') }}
      </v-btn>
    </div>
  </div>

  <p class="cx-section-label mt-5">{{ t('reminders.customTitle') }}</p>
  <v-card class="pa-4 pa-sm-5 cx-panel--lift">
    <v-text-field
      v-model="customLabel"
      :label="t('reminders.customLabel')"
      :placeholder="t('reminders.customPlaceholder')"
      class="mb-2"
    />
    <div class="d-flex flex-wrap ga-2 align-center">
      <v-text-field
        v-model="customTime"
        type="time"
        density="compact"
        hide-details
        style="max-width: 140px"
      />
      <v-btn color="primary" :loading="store.busy" @click="addCustom">
        {{ t('reminders.addCustom') }}
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.reminders-push-card {
  background: var(--cx-primary-soft) !important;
  color: var(--cx-text) !important;
  border: none !important;
  box-shadow: none !important;
}
.reminders-push-card__hint {
  color: var(--cx-text-soft) !important;
}
</style>
